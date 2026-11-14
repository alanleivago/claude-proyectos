"""Montaje de padre-veladoras P1: parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
Uso: python -I edit.py  -> renders/v1.mp4 (+ lines.json con las líneas detectadas por clip)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 78.0  # (no se usa)

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

# v1 por frases (reglas aprobadas chocolate-rancho / reten-sierra v4): (clip, (inicio, fin)[, filtro video previo[, filtro audio previo]]).
# Inicio = voz - 0.08 s, fin = voz + 0.15 s (renders/phr.json: envolvente de voz + whisper, phr.py). Mismo personaje con varias frases seguidas:
# salto dentro de su clip quitando el silencio. Reacciones solo si aportan (c05 soplido, r1 convoy, r2 veladoras). BLACK 0.4 s antes del CTA.
# Recortes qa_clips.md: r1 3.0-6.04 (sin la mujer de otra escena), c23 hasta 5.78 (sin "Vienen repletas" repetido),
# Para quedar en <=2:30 se quitan frases secundarias: c09 "¿Qué pasó, padrecito?" y c14 "¿Qué pasó, padrecito?" (repetidas),
# c17 "¿Desde cuándo lo conoce?" y c22 "Que nadie se adelante."; r2 se acorta a 2.6 s.
# c14 primera frase con recorte del 15 % derecho x1.18 (rosario en la espalda, clip 1.12-2.55 cubre 0-1.5 s), c29 +6 dB en 6.1-7.0 ("lo que le dijiste").
C14 = "crop=612:1085:0:97,"
C29 = lambda s: f"volume='1+1*clip((t+{s}-6.1)/0.05,0,1)*clip((7.0-t-{s})/0.05,0,1)':eval=frame,"
EDL = [("c01", (1.52, 3.66)), ("c01", (4.75, 7.74)), ("c02", (0.53, 3.22)), ("c02", (4.70, 6.49)),
       ("c03", (1.05, 2.04)), ("c03", (3.17, 6.14)), ("c04", (0.69, 3.53)), ("c04", (5.01, 6.05)),
       ("c05", (0.30, 1.45)), ("c05", (2.87, 6.88)), ("c06", (1.63, 2.98)), ("c06", (4.34, 6.56)),
       ("c07", (1.34, 3.45)), ("c07", (4.56, 6.58)), ("c08", (1.61, 4.05)), ("c08", (4.40, 5.96)),
       ("c09", (4.07, 5.54)),
       ("c10", (2.41, 4.18)), ("c10", (4.64, 5.82)), ("c11", (1.89, 3.58)), ("c12", (0.31, 2.65)), ("c12", (3.45, 5.87)),
       ("c11", (5.24, 6.06)), ("c12", (6.89, 9.86)), ("c13", (1.52, 3.73)), ("c13", (4.02, 5.26)), ("c13", (6.40, 8.43)),
       ("c14", (1.12, 2.55), C14), ("c14", (5.16, 6.68)), ("c15", (0.13, 3.07)), ("c15", (4.50, 5.92)),
       ("c16", (1.47, 3.55)), ("c16", (4.54, 6.22)),
       ("r1", (3.0, 6.04)), ("c17", (1.73, 4.14)), ("c18", (1.48, 3.38)), ("c18", (4.78, 6.34)),
       ("c19", (0.29, 2.69)), ("c19", (3.73, 5.06)), ("c19", (6.25, 8.85)),
       ("c20", (0.51, 2.06)), ("c20", (3.43, 4.49)), ("c21", (0.75, 2.10)), ("c20", (5.43, 8.38)), ("c21", (3.54, 5.33)),
       ("c22", (0.67, 1.53)), ("c22", (5.36, 6.89)),
       ("c23", (1.51, 3.66)), ("c23", (4.39, 5.78)), ("c24", (2.42, 3.59)), ("c25", (1.21, 2.46)), ("c24", (4.42, 6.59)), ("c25", (4.14, 6.45)),
       ("c26", (1.30, 2.84)), ("c26", (4.69, 6.58)),
       ("c27", (1.05, 2.54)), ("c28", (0.60, 1.35)), ("c27", (3.33, 5.63)), ("c28", (2.42, 3.37)), ("c27", (6.38, 7.90)), ("c28", (4.41, 4.85)),
       ("c29", (1.47, 3.47)), ("c29", (4.48, 7.10), "", C29(4.48)),
       ("c30", (0.53, 2.04)), ("c30", (2.62, 3.89)), ("c31", (0.19, 2.51)), ("c30", (4.77, 7.38)), ("c30", (8.28, 9.37)),
       ("c31", (3.64, 5.01)), ("c31", (6.15, 7.30)), ("c32", (1.13, 2.26)), ("c32", (3.42, 4.71)),
       ("c33", (0.13, 2.30)), ("c33", (3.09, 6.10)), ("c33", (7.00, 9.54)), ("r2", (1.0, 3.6)), ("BLACK", 0.4),
       ("c34", (0.25, 2.69)), ("c34", (3.82, 7.50))]

def main():
    L = {}  # v1: EDL por rangos medidos (phr.json); lines() queda para EDL por número de línea
    parts = []; global STARTS; STARTS = {}
    for i, (cid, x, *pre) in enumerate(EDL):
        p = R / f"p{i:03d}.mov"
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
        af = (pre[1] if len(pre) > 1 else "") + f"aresample=48000,apad,atrim=0:{d:.5f},afade=t=in:d=0.04,afade=t=out:st={d - (0.6 if fade else 0.06):.2f}:d={0.6 if fade else 0.06}"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-i", str(src), "-vf", vf,
                        "-af", af, "-ac", "2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "pcm_s16le", "-frames:v", str(round(d * 24)), str(p)], check=True)
        STARTS.setdefault(cid, len(parts)); parts.append(p)
    lst = R / "list.txt"; lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    raw = R / "raw.mov"
    ins = [x for q in parts for x in ("-i", str(q))]
    fcat = "".join(f"[{k}:v]setpts=N/24/TB[v{k}];[{k}:a]asetpts=N/SR/TB[a{k}];" for k in range(len(parts))) + "".join(f"[v{k}][a{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[v][a]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fcat, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(raw)], check=True)
    # marca MAJESTIC STORIES + camas musicales (cont.png se genera pero no se usa: sin CONTINUARÁ)
    from PIL import Image, ImageDraw, ImageFont
    def png(name, text, size, y, alpha):
        im = Image.new("RGBA", (720, 1280), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
        d.text(((720 - d.textlength(text, font=f)) / 2, y), text, font=f, fill=(255, 255, 255, alpha), stroke_width=0); im.save(R / name)
    png("cont.png", "CONTINUARÁ", 64, 200, 255); png("wm.png","MAJESTIC STORIES",22,135,80)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    M = D / "music"
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c17"), at("c20")  # suspenso 0-t1 (burla y llamada), cálida t1-t2 (camioneta: por qué va Ramiro), suspenso t2-fin (llegada y cara a cara)
    tv = MUSIC_VOL * 2.4
    out = R / "v1.mp4"
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim=20:{20 + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / "mix.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-stream_loop", "3", "-i", str(M / "calida.mp3"), "-stream_loop", "3", "-i", str(M / "tension.mp3"),
                    "-stream_loop", "3", "-i", str(M / "tension.mp3"), "-i", str(M / "boom" / "701308.mp3"),
                    "-filter_complex", fa, "-map", "[a]", "-t", f"{dur:.2f}", str(mix)], check=True)
    tc = dur
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-loop", "1", "-i", str(R / "cont.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "3:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
