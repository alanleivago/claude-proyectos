"""Análisis cuadro a cuadro de los shorts de referencia del estilo cartoon3d (paso 1 del método).

Por cada video: extrae todos los frames a 30 fps, transcribe palabra por palabra (faster-whisper),
mide cortes / disolvencias / movimiento de cámara y arma hojas de contactos de 1 s (30 frames)
con la palabra que suena en cada frame.

Uso:
    python analyze_refs.py "Ref 3D cartoon animations" [--only 1 3]
Salida en <carpeta>/_analisis/<n>/  y resumen en <carpeta>/_analisis/resumen.md
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

FPS = 30
W, H = 270, 480          # tamaño de análisis (1/4 de 1080x1920)
TW, TH = 180, 320        # tile de la hoja de contactos
COLS, ROWS = 6, 5        # 30 frames = 1 segundo por hoja
FONT = Path(__file__).resolve().parents[3] / "fonts" / "FreeSansBold.ttf"


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def extract(video, out):
    frames = out / "frames"
    if not frames.exists() or not any(frames.iterdir()):
        frames.mkdir(parents=True, exist_ok=True)
        run(["ffmpeg", "-y", "-i", str(video), "-vf", f"fps={FPS},scale={W}:{H}", "-q:v", "3",
             str(frames / "%05d.jpg")])
    wav = out / "audio16k.wav"
    if not wav.exists():
        run(["ffmpeg", "-y", "-i", str(video), "-ac", "1", "-ar", "16000", str(wav)])
    return sorted(frames.glob("*.jpg")), wav


def transcribe(wav, out, model):
    path = out / "words.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    import soundfile as sf
    audio = sf.read(str(wav), dtype="float32")[0]  # array: evita el decode de PyAV (versión incompatible)
    segs, _ = model.transcribe(audio, language="en", word_timestamps=True, vad_filter=False)
    words = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)}
             for seg in segs for w in seg.words]
    path.write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
    return words


def phase_shift(a, b, win):
    """Desplazamiento subpíxel (dy, dx) de b respecto de a por correlación de fase."""
    fa, fb = np.fft.fft2(a * win), np.fft.fft2(b * win)
    r = fa * np.conj(fb)
    r /= np.abs(r) + 1e-9
    c = np.fft.ifft2(r).real
    iy, ix = np.unravel_index(np.argmax(c), c.shape)

    def sub(i, n, axis):
        l = c[(i - 1) % n, ix] if axis == 0 else c[iy, (i - 1) % n]
        m = c[iy, ix]
        rr = c[(i + 1) % n, ix] if axis == 0 else c[iy, (i + 1) % n]
        d = (l - rr) / (2 * (l - 2 * m + rr) + 1e-9)
        v = i + d
        return v - n if v > n / 2 else v

    return -sub(iy, c.shape[0], 0), -sub(ix, c.shape[1], 1)


def camera(gray):
    """Por par de frames: pan (% del ancho / alto) y zoom (% de escala) a partir de 4 cuadrantes."""
    h2, w2 = H // 2, W // 2
    win = np.outer(np.hanning(h2), np.hanning(w2))
    quads = [(0, 0), (0, w2), (h2, 0), (h2, w2)]  # TL, TR, BL, BR
    pan_x, pan_y, zoom = [0.0], [0.0], [0.0]
    for t in range(1, len(gray)):
        sh = [phase_shift(gray[t - 1][y:y + h2, x:x + w2], gray[t][y:y + h2, x:x + w2], win) for y, x in quads]
        dy = np.array([s[0] for s in sh]); dx = np.array([s[1] for s in sh])
        zx = ((dx[1] + dx[3]) - (dx[0] + dx[2])) / 2 / w2
        zy = ((dy[2] + dy[3]) - (dy[0] + dy[1])) / 2 / h2
        pan_x.append(float(np.median(dx)) / W * 100)
        pan_y.append(float(np.median(dy)) / H * 100)
        zoom.append(float((zx + zy) / 2) * 100)
    return np.array(pan_x), np.array(pan_y), np.array(zoom)


def transitions(gray):
    """Cortes secos (pico de diferencia en 1 frame) y disolvencias (mezcla lineal sostenida)."""
    n = len(gray)
    d1 = np.array([0.0] + [np.abs(gray[t] - gray[t - 1]).mean() for t in range(1, n)])
    cuts = []
    for t in range(1, n):
        local = np.median(d1[max(1, t - 8):t + 9])
        if d1[t] > 0.10 and d1[t] > 5 * max(local, 0.004):
            cuts.append(t)
    diss = []
    k = 3
    for t in range(k, n - k):
        a, b, m = gray[t - k], gray[t + k], gray[t]
        d6 = np.abs(b - a).mean()
        if d6 < 0.08 or max(d1[t - k + 1:t + k + 1]) > 0.6 * d6 or any(abs(c - t) <= k for c in cuts):
            continue
        diff = (b - a).ravel(); rel = (m - a).ravel()
        alpha = float(np.dot(diff, rel) / (np.dot(diff, diff) + 1e-9))
        resid = np.abs(m - (a + alpha * (b - a))).mean()
        if 0.2 < alpha < 0.8 and resid < 0.3 * d6:
            diss.append(t)
    groups = []
    for t in diss:
        if groups and t - groups[-1][-1] <= 2:
            groups[-1].append(t)
        else:
            groups.append([t])
    dissolves = [{"start": g[0] - k, "end": g[-1] + k, "len": g[-1] - g[0] + 2 * k} for g in groups]
    return d1, cuts, dissolves


def word_at(words, t):
    for w in words:
        if w["s"] <= t < w["e"]:
            return w["w"]
    return ""


def sheets(frames, words, out, tag):
    sd = out / "sheets"
    sd.mkdir(exist_ok=True)
    font = ImageFont.truetype(str(FONT), 15)
    per = COLS * ROWS
    lab = 20
    for i in range(0, len(frames), per):
        sheet = Image.new("RGB", (COLS * TW, ROWS * (TH + lab)), (20, 20, 20))
        dr = ImageDraw.Draw(sheet)
        for j, f in enumerate(frames[i:i + per]):
            idx = i + j
            x, y = (j % COLS) * TW, (j // COLS) * (TH + lab)
            sheet.paste(Image.open(f).resize((TW, TH)), (x, y))
            w = word_at(words, idx / FPS)
            dr.text((x + 3, y + TH + 2), f"{idx} {idx / FPS:.2f}s {w}"[:26], fill=(255, 230, 90), font=font)
        sheet.save(sd / f"{tag}_{i // per:03d}.jpg", quality=82)


def speech_stats(words, dur):
    if not words:
        return {}
    gaps = [(words[i]["e"], words[i + 1]["s"], words[i]["w"]) for i in range(len(words) - 1)]
    sentence = [round(b - a, 3) for a, b, w in gaps if w[-1:] in ".?!"]
    other = [round(b - a, 3) for a, b, w in gaps if w[-1:] not in ".?!"]
    silent = sum(max(0, b - a) for a, b, _ in gaps if b - a > 0.25) + words[0]["s"] + max(0, dur - words[-1]["e"])
    span = words[-1]["e"] - words[0]["s"]
    return {
        "palabras": len(words),
        "wpm": round(len(words) / span * 60, 1),
        "cobertura_voz_%": round((1 - silent / dur) * 100, 1),
        "pausa_fin_oracion_media_s": round(float(np.mean(sentence)), 3) if sentence else None,
        "pausa_fin_oracion_max_s": round(max(sentence), 3) if sentence else None,
        "pausas_fin_oracion": sentence,
        "pausa_entre_palabras_media_s": round(float(np.mean(other)), 3) if other else None,
        "voz_arranca_s": words[0]["s"],
    }


def loudness(video):
    import pyloudnorm as pyln
    import soundfile as sf
    tmp = Path(video).with_suffix(".tmp48k.wav")
    run(["ffmpeg", "-y", "-i", str(video), "-ac", "2", "-ar", "48000", str(tmp)])
    data, rate = sf.read(str(tmp))
    tmp.unlink()
    return round(float(pyln.Meter(rate).integrated_loudness(data)), 1)


def analyze(video, base, model):
    tag = video.stem
    out = base / tag
    out.mkdir(parents=True, exist_ok=True)
    print(f"[{tag}] frames + audio", flush=True)
    frames, wav = extract(video, out)
    print(f"[{tag}] transcripción", flush=True)
    words = transcribe(wav, out, model)
    print(f"[{tag}] métricas ({len(frames)} frames)", flush=True)
    gray = [np.asarray(Image.open(f).convert("L"), dtype=np.float32) / 255 for f in frames]
    d1, cuts, dissolves = transitions(gray)
    px, py, zm = camera(gray)
    n, dur = len(frames), len(frames) / FPS

    bounds = sorted(set([0] + cuts + [(d["start"] + d["end"]) // 2 for d in dissolves] + [n]))
    shots = [{"start": a, "end": b, "s": round(a / FPS, 2), "dur_s": round((b - a) / FPS, 2)}
             for a, b in zip(bounds, bounds[1:]) if b - a > 2]

    near = np.zeros(n, bool)
    for c in cuts:
        near[max(0, c - 1):c + 2] = True
    for d in dissolves:
        near[max(0, d["start"]):d["end"] + 1] = True
    speed = np.abs(zm) + np.hypot(px, py)          # % por frame, combinado
    ok = ~near
    ok[0] = False
    moving = speed[ok] > 0.05

    # rampa hacia cada transición: velocidad media en los 30 frames previos, alineados al corte
    marks = cuts + [d["start"] for d in dissolves]
    ramp = [speed[m - 30:m - 1] for m in marks if m > 31]
    ramp = np.mean(np.stack(ramp), axis=0) if ramp else np.array([])

    # arranque de movimiento vs. inicio de palabra
    starts = []
    still = speed < 0.05
    for t in range(3, n):
        if ok[t] and still[t - 3:t].all() and speed[t] > 0.08:
            ws = [w["s"] for w in words]
            if ws:
                nearest = min(ws, key=lambda s: abs(s - t / FPS))
                starts.append(round((t / FPS - nearest) * FPS, 1))

    metrics = {
        "video": video.name, "frames": n, "duracion_s": round(dur, 2),
        "lufs_integrado": loudness(video),
        "voz": speech_stats(words, dur),
        "cortes_secos": cuts,
        "disolvencias": dissolves,
        "tomas": len(shots), "toma_media_s": round(float(np.mean([s["dur_s"] for s in shots])), 2),
        "toma_mediana_s": round(float(np.median([s["dur_s"] for s in shots])), 2),
        "lista_tomas": shots,
        "camara": {
            "frames_en_movimiento_%": round(float(moving.mean() * 100), 1),
            "zoom_medio_%_frame": round(float(np.mean(np.abs(zm[ok]))), 3),
            "zoom_mediano_%_seg": round(float(np.median(np.abs(zm[ok])) * FPS), 2),
            "pan_medio_%_frame": round(float(np.mean(np.hypot(px, py)[ok])), 3),
            "rampa_30f_antes_de_transicion_%_frame": [round(float(v), 3) for v in ramp],
            "arranques_mov_vs_palabra_frames": starts,
        },
    }
    (out / "metrics.json").write_text(json.dumps(metrics, ensure_ascii=False, indent=1), encoding="utf-8")
    np.savez_compressed(out / "curvas.npz", diff=d1, pan_x=px, pan_y=py, zoom=zm)
    print(f"[{tag}] hojas de contactos", flush=True)
    sheets(frames, words, out, tag)
    return metrics


def summary(all_m, base):
    L = ["# Medidas de las referencias cartoon3d", "",
         "| ref | dur s | LUFS | palabras | wpm | voz % | pausa fin oración media / máx s | tomas | toma media s | cortes secos | disolv. (largo frames) | cámara en mov. % | zoom mediano %/s |",
         "|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for m in all_m:
        v, c = m["voz"], m["camara"]
        L.append(f"| {m['video']} | {m['duracion_s']} | {m['lufs_integrado']} | {v.get('palabras')} | {v.get('wpm')} | "
                 f"{v.get('cobertura_voz_%')} | {v.get('pausa_fin_oracion_media_s')} / {v.get('pausa_fin_oracion_max_s')} | "
                 f"{m['tomas']} | {m['toma_media_s']} | {len(m['cortes_secos'])} | "
                 f"{len(m['disolvencias'])} ({', '.join(str(d['len']) for d in m['disolvencias'][:12])}) | "
                 f"{c['frames_en_movimiento_%']} | {c['zoom_mediano_%_seg']} |")
    (base / "resumen.md").write_text("\n".join(L) + "\n", encoding="utf-8")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("folder")
    p.add_argument("--only", nargs="*")
    p.add_argument("--model", default="large-v3")
    a = p.parse_args()
    folder = Path(a.folder)
    base = folder / "_analisis"
    base.mkdir(exist_ok=True)
    from faster_whisper import WhisperModel
    model = WhisperModel(a.model, device="cpu", compute_type="int8")  # ctranslate2 no encuentra cuBLAS en esta PC
    vids = sorted(folder.glob("*.mp4"), key=lambda v: int(v.stem) if v.stem.isdigit() else v.stem)
    if a.only:
        vids = [v for v in vids if v.stem in a.only]
    all_m = [analyze(v, base, model) for v in vids]
    if not a.only:
        summary(all_m, base)


if __name__ == "__main__":
    main()
