"""Montaje de chocolate-rancho PARTE 2 (La Taza de Chocolate; método aprobado de hacienda-sangre-p2: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/VISTA: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "VISTA"  # música + marca de agua salen de pieces/_marcas/VISTA
REMIX = "--remix" in sys.argv

def lines(clip):
    import numpy as np
    from faster_whisper import WhisperModel
    wav = R / "tmp.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(clip), "-ac", "1", "-ar", "16000", str(wav)], check=True)
    w = wave.open(str(wav)); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; w.close()
    global MODEL
    if "MODEL" not in globals(): MODEL = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = MODEL.transcribe(a, language="es", word_timestamps=True)
    ws = [x for s in segs for x in s.words]; out = []
    for x in ws:
        if out and x.start - out[-1][1] < GAP: out[-1][1] = x.end; out[-1][2] += x.word
        else: out.append([x.start, x.end, x.word])
    return [(round(s, 2), round(e, 2), t.strip()) for s, e, t in out]

# v1 por frases (método aprobado, copia de hacienda-sangre-p2): (clip, (inicio, fin)[, filtro previo de video[, ganancia]]). Rangos de renders/phr.json
# (phr.py) + envolvente de voz (umbral -36 dB) y faster-whisper large-v3: entra 0.08 s antes de la voz y sale 0.15 s después; mismo personaje = salto dentro del clip.
# QA (qa_clips.md): c04, i1, r1, r2, r3, r4 mudos (ganancia 0); i2 solo el tramo general (antes del corte de 3.1 s) a -10 dB; c10 a -4 dB;
# c17 termina en 6.33 s (Omni repite "ni ver"); c34 nuevo sin la repetición.
EDL = [('c01', (1.17, 3.32)), ('c01', (5.10, 7.50)), ('c02', (1.31, 2.53)), ('c02', (4.53, 7.01)), ('c03', (1.08, 3.22)), ('c03', (4.48, 6.39)),
       ('c04', (0.5, 2.6), '', 0), ('c05', (0.77, 1.90)), ('c05', (2.77, 4.07)), ('c05', (5.32, 6.64)), ('c06', (0.74, 1.84)), ('c06', (2.29, 3.35)), ('c06', (5.47, 6.54)),
       ('c07', (1.15, 2.62)), ('c07', (3.85, 7.31)), ('i1', (1.5, 3.3), '', 0), ('c08', (3.24, 4.75)), ('c09', (1.26, 3.82)), ('c09', (4.84, 6.73)), ('c09', (7.43, 8.55)),
       ('c10', (1.96, 4.91), '', '-4dB'), ('c10', (5.74, 8.32), '', '-4dB'), ('c11', (1.14, 2.21)), ('c11', (3.44, 6.18)), ('c12', (1.55, 4.02)), ('c12', (5.92, 9.07)),
       ('r1', (3.8, 5.2), '', 0), ('c13', (1.36, 3.72)), ('c13', (4.34, 7.21)), ('c13', (7.64, 8.72)), ('c14', (2.19, 4.20)), ('c14', (5.17, 7.57)), ('c14', (8.00, 8.99)),
       ('c15', (2.41, 4.35)), ('c15', (6.50, 7.74)), ('c16', (1.04, 3.21)), ('c16', (5.53, 6.84)), ('c16', (7.67, 8.65)), ('c17', (1.45, 2.57)), ('c17', (3.14, 3.92)), ('c17', (4.50, 6.33)),
       ('c18', (2.18, 4.07)), ('c18', (5.20, 6.84)), ('c19', (2.14, 3.75)), ('c19', (4.48, 5.89)), ('c19', (6.45, 8.13)), ('c20', (0.82, 3.06)), ('c20', (4.54, 6.52)),
       ('c21', (1.65, 3.25)), ('c21', (5.47, 7.53)), ('c22', (2.13, 3.96)), ('c23', (0.92, 2.67)), ('c23', (3.93, 5.24)), ('r2', (1.0, 2.6), '', 0),
       ('c24', (1.46, 3.46)), ('c24', (4.08, 7.87)), ('i2', (0.9, 3.0), '', '-10dB'), ('c25', (0.87, 1.78)), ('c25', (2.25, 4.42)), ('c25', (5.45, 6.99)),
       ('c26', (1.25, 2.98)), ('c26', (4.06, 6.65)), ('c27', (1.73, 2.68)), ('c27', (4.06, 5.50)), ('c27', (6.20, 7.62)), ('c28', (1.39, 3.43)), ('c28', (5.39, 7.12)), ('c28', (8.33, 9.59)),
       ('c29', (1.70, 4.97)), ('c29', (5.93, 7.70)), ('r3', (1.0, 2.6), '', 0), ('c30', (1.10, 1.96)), ('c30', (3.22, 4.45)), ('c31', (1.17, 2.99)), ('c31', (4.94, 7.69)), ('c31', (8.05, 9.27)),
       ('c32', (1.47, 2.65)), ('c32', (4.00, 6.28)), ('c32', (6.87, 8.95)), ('c33', (1.75, 4.14)), ('c33', (6.02, 8.57)), ('c34', (1.30, 2.62)), ('c34', (3.95, 6.11)),
       ('r4', (1.5, 3.5), '', 0), ('BLACK', 0.4), ('c35', (1.08, 3.50)), ('c35', (3.94, 7.13))]

def main():
    if not EDL: sys.exit("EDL vacía: correr phr.py y armarla con renders/phr.json")
    L = {}  # v1: EDL por rangos medidos (renders/phr.json)
    if not REMIX:
        for q in R.glob("p*.mov"): q.unlink()
    parts = []; global STARTS; STARTS = {}
    for i, (cid, x, *pre) in enumerate(EDL):
        p = R / f"p{i:03d}.mov"
        if REMIX and p.exists():
            if cid != "BLACK": STARTS.setdefault(cid, len(parts))
            parts.append(p); continue
        if cid == "BLACK":
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "color=black:720x1280:r=24", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
                            "-t", f"{round(x * 24) / 24:.5f}", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(p)], check=True); parts.append(p); continue
        src = C / f"{cid}.mp4"
        if not src.exists(): print("falta", cid); continue
        if isinstance(x, int):
            if x >= len(L[cid]): print("sin línea", cid, x, L[cid]); continue
            s, e, _ = L[cid][x]; s, e = max(0, s - 0.1), e + 0.28
        else: s, e = x
        d = round((e - s) * 24) / 24; fade = i + 1 < len(EDL) and EDL[i + 1][0] == "BLACK"
        vf = (pre[0] if pre else "") + "scale=720:1280,fps=24,tpad=stop_mode=clone:stop_duration=0.5" + (f",fade=t=out:st={d - 0.6:.2f}:d=0.6" if fade else "")
        af = (f"volume={pre[1]}," if len(pre) > 1 else "") + f"aresample=48000,apad,atrim=0:{d:.5f},afade=t=in:d=0.04,afade=t=out:st={d - (0.6 if fade else 0.06):.2f}:d={0.6 if fade else 0.06}"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-i", str(src), "-vf", vf,
                        "-af", af, "-ac", "2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "pcm_s16le", "-frames:v", str(round(d * 24)), str(p)], check=True)
        STARTS.setdefault(cid, len(parts)); parts.append(p)
    lst = R / "list.txt"; lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    raw = R / "raw.mov"
    ins = [x for q in parts for x in ("-i", str(q))]
    fcat = "".join(f"[{k}:v]setpts=N/24/TB[v{k}];[{k}:a]asetpts=N/SR/TB[a{k}];" for k in range(len(parts))) + "".join(f"[v{k}][a{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[v][a]"
    if not (REMIX and raw.exists()): subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fcat, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(raw)], check=True)
    # marca VISTA STORIES (kit _marcas: 22 px, alpha 80, y=135, arriba al centro; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("r2"), at("c29")  # suspenso 0-t1 (oficina, la lista, llegada al rancho), cálida t1-t2 (perdón y la taza), suspenso t2-fin (Esperanza Robles y CTA)
    tv = MUSIC_VOL * 2.4
    out = R / "v1.mp4"
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim={BC['tension2_from']}:{BC['tension2_from'] + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,lowpass=f=16000,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / "mix.wav"
    ins_m = ["-i", str(raw), "-stream_loop", "3", "-i", str(M / "calida.mp3"), "-stream_loop", "3", "-i", str(M / "tension.mp3"),
             "-stream_loop", "3", "-i", str(M / "tension.mp3"), "-i", str(M / BC["hit"])]
    # loudnorm en dos pasadas (medición + lineal): en una sola pasada quedaba en -15.4 LUFS
    # lowpass 16 kHz antes de loudnorm: sin él el AAC 192k pasaba de -1.9 a +1.2 dBTP (agudos de Omni)
    m = subprocess.run(["ffmpeg", "-y", "-hide_banner", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,", "loudnorm=I=-14:TP=-1.5:print_format=json,"),
                        "-map", "[a]", "-t", f"{dur:.2f}", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    ln = f"loudnorm=I=-14:TP=-1.5:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5", ln), "-map", "[a]", "-t", f"{dur:.2f}", str(mix)], check=True)
    tc = at("c35") if "c35" in STARTS else dur
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "2:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
