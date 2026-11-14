"""Montaje de hacienda-sangre PARTE 2 (La Hacienda; plantilla reten-sierra v4 / hacienda-sangre v2): parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
Uso: python -I edit.py  -> renders/v2.mp4 (v2 = kit _marcas/MAJESTIC: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL) (+ renders/whisper_lines.json con las líneas detectadas; lines.json es el guion de clips.py)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "MAJESTIC"  # música + marca de agua salen de pieces/_marcas/MAJESTIC
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

# v1 por frases (método aprobado, copia de medalla-mezcal-p2): (clip, (inicio, fin)[, filtro previo de video[, ganancia]]). Rangos de renders/phr.json
# (phr.py) + envolvente de voz: entra 0.08 s antes de la voz y sale 0.15 s después; mismo personaje = salto dentro del clip.
# QA (qa_clips.md): i1 desde 1.5 s; c04, r1, c12, r2, c26, i1 mudos (ganancia 0); r3 sin el murmullo de 2.2-2.6 s; c25 a -5 dB.
EDL = [('c01', (1.54, 6.55)), ('c01', (6.97, 9.72)), ('c02', (0.41, 2.67)), ('c02', (3.89, 6.55)), ('c03', (0.85, 3.46)), ('c03', (4.18, 6.34)), ('c04', (0.5, 2.6), '', 0), ('c05', (0.67, 1.94)), ('c05', (2.69, 5.09)), ('c06', (0.8, 3.55)), ('c06', (4.37, 5.72)), ('c06', (6.11, 7.12)), ('c07', (0.53, 1.4)), ('c07', (3.13, 4.55)), ('c07', (5.8, 6.68)), ('c08', (0.67, 3.23)), ('c08', (4.09, 6.0)), ('c08', (7.04, 8.3)), ('c09', (0.72, 1.94)), ('c09', (2.44, 4.04)), ('c09', (4.82, 5.84)), ('c09', (6.49, 7.54)), ('r1', (1.0, 2.2), '', 0), ('c10', (1.12, 3.65)), ('c10', (4.16, 6.17)), ('c10', (6.92, 9.37)), ('c11', (1.8, 3.76)), ('c11', (4.39, 5.79)), ('c11', (6.33, 7.32)), ('c12', (0.5, 3.0), '', 0), ('c13', (1.23, 3.06)), ('c13', (3.93, 5.16)), ('c13', (5.73, 6.85)), ('c14', (0.25, 2.26)), ('c14', (3.15, 5.8)), ('c14', (7.07, 7.85)), ('c15', (1.13, 3.32)), ('c16', (1.65, 3.46)), ('c16', (5.41, 6.86)), ('c17', (1.49, 3.05)), ('c17', (4.21, 6.56)), ('c18', (0.47, 3.61)), ('c18', (4.67, 6.09)), ('c19', (0.67, 3.33)), ('c19', (3.53, 4.56)), ('c19', (4.98, 6.97)), ('c19', (7.93, 9.64)), ('c20', (0.53, 1.89)), ('c20', (3.24, 4.08)), ('c21', (0.24, 3.5)), ('c21', (4.45, 6.53)), ('c21', (7.37, 9.7)), ('r2', (1.0, 2.6), '', 0), ('c22', (1.49, 2.21)), ('c22', (3.45, 4.24)), ('c22', (5.12, 6.5)), ('c23', (1.14, 2.51)), ('c23', (3.46, 6.34)), ('c24', (0.69, 2.5)), ('c24', (3.87, 5.23)), ('c25', (1.28, 4.03), '', '-5dB'), ('c25', (5.02, 7.87), '', '-5dB'), ('c26', (0.5, 3.0), '', 0), ('c27', (0.92, 3.46)), ('c27', (4.56, 6.93)), ('c27', (8.43, 9.36)), ('c28', (1.28, 3.64)), ('c28', (4.56, 6.54)), ('c29', (1.24, 4.22)), ('c29', (4.89, 9.15)), ('c30', (0.52, 1.58)), ('c30', (2.02, 4.77)), ('c30', (5.71, 9.04)), ('c31', (0.92, 2.24)), ('c31', (3.85, 4.9)), ('c32', (0.8, 3.47)), ('c32', (5.24, 7.48)), ('i1', (1.5, 3.3), '', 0), ('c33', (1.45, 2.0)), ('c33', (3.44, 4.45)), ('c33', (6.51, 8.01)), ('c34', (0.41, 1.49)), ('c34', (2.31, 3.67)), ('c34', (5.64, 8.37)), ('r3', (1.5, 3.5), '', "0:enable='between(t,0.65,1.15)'"), ('BLACK', 0.4), ('c35', (0.36, 2.52)), ('c35', (3.64, 6.18))]

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
    # placa CONTINUARÁ (últimos 3 s) + marca MAJESTIC STORIES (kit _marcas: arriba a la izquierda) + camas musicales del kit
    from PIL import Image, ImageDraw, ImageFont
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND)
    def png(name, text, size, y, alpha):
        im = Image.new("RGBA", (720, 1280), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
        d.text(((720 - d.textlength(text, font=f)) / 2, y), text, font=f, fill=(255, 255, 255, alpha), stroke_width=0); im.save(R / name)
    png("cont.png", "CONTINUARÁ", 64, 200, 255); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c27"), at("c30")  # suspenso 0-t1 (la puerta, Teresa, las condiciones), cálida t1-t2 (porche, San Isidro), suspenso t2-fin (la carta y gancho)
    tv = MUSIC_VOL * 2.4
    out = R / "v3.mp4"  # v3 = misma EDL, kit MAJESTIC con tensión nueva (presencia como VISTA)
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim={BC['tension2_from']}:{BC['tension2_from'] + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / "mix.wav"
    ins_m = ["-i", str(raw), "-stream_loop", "3", "-i", str(M / "calida.mp3"), "-stream_loop", "3", "-i", str(M / "tension.mp3"),
             "-stream_loop", "3", "-i", str(M / "tension.mp3"), "-i", str(M / BC["hit"])]
    # loudnorm en dos pasadas (medición + lineal): en una sola pasada quedaba en -15.4 LUFS
    m = subprocess.run(["ffmpeg", "-y", "-hide_banner", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,", "loudnorm=I=-14:TP=-1.5:print_format=json,"),
                        "-map", "[a]", "-t", f"{dur:.2f}", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    ln = f"loudnorm=I=-14:TP=-1.5:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5", ln), "-map", "[a]", "-t", f"{dur:.2f}", str(mix)], check=True)
    tc = at("c35") if "c35" in STARTS else dur
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-loop", "1", "-i", str(R / "cont.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "3:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
