"""Montaje de regreso-chicago P1: parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
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

# EDL por frases (reglas aprobadas): (clip, (inicio, fin)[, filtro previo de video[, ganancia]]), rangos de renders/phr.json (phr.py).
# Inicio = voz - 0.08 s, fin = voz + 0.15 s. Mismo personaje con varias frases: salto dentro del clip. BLACK 0.4 s antes del CTA (c31).
EDL = [("c01", (1.05, 3.17)), ("c01", (3.35, 7.90)),
       ("c02", (0.71, 3.92)), ("c02", (4.53, 6.73)),
       ("c03", (0.69, 4.27)), ("c03", (4.55, 7.25)), ("i1", (0.30, 2.40)),
       ("c04", (1.34, 3.65)), ("c04", (4.54, 7.37)),
       ("c05", (0.95, 3.45)), ("c05", (4.32, 6.41)),
       ("c06", (1.12, 4.10)), ("c06", (5.50, 7.86)),
       ("c07", (0.85, 3.85)), ("c07", (4.52, 6.71)),
       ("c08", (1.55, 4.35)),
       ("c09", (1.31, 2.76)), ("c09", (3.82, 5.57)),
       ("c10", (0.02, 2.31)), ("c10", (3.77, 6.46)), ("i2", (1.60, 3.60)),
       ("c11", (0.69, 3.64)), ("c11", (4.54, 6.92)),
       ("c12", (1.26, 2.28)), ("c12", (3.99, 7.03)),
       ("c13", (0.61, 2.13)), ("c13", (3.58, 6.57)),
       ("c14", (0.34, 0.97)), ("c14", (2.63, 5.08)),
       ("c15", (2.19, 3.22)), ("c15", (4.38, 5.60)), ("c15", (6.28, 8.92)),
       ("c16", (1.57, 3.58)), ("c16", (5.08, 6.55)),
       ("c17", (1.52, 4.72)),
       ("c18", (1.31, 3.45)), ("c18", (3.99, 5.52)),
       ("c19", (1.72, 2.81)), ("c19", (3.85, 6.74)),
       ("c20", (1.54, 2.59)), ("c20", (3.33, 3.93)),
       ("c21", (1.29, 3.10)), ("c21", (4.93, 7.71)),
       ("c22", (1.21, 3.42)), ("c22", (4.53, 7.20)),
       ("c23", (2.03, 3.42)), ("c23", (4.55, 6.70)),
       ("c24", (1.03, 2.22)), ("c24", (3.65, 6.71)), ("i3", (2.40, 4.60)),
       ("r1", (0.00, 3.00)),
       ("c25", (1.56, 3.72)), ("c25", (4.55, 8.54)),
       ("c26", (1.65, 3.15)), ("c26", (4.47, 7.21)),
       ("c27", (0.36, 1.71)), ("c27", (3.06, 4.10)), ("c27", (4.77, 7.89)),
       ("c28", (3.24, 4.44)),
       ("c29", (0.52, 4.71)), ("c29", (5.58, 6.49)), ("c29", (8.16, 10.00)),
       ("c30", (1.66, 2.60)), ("c30", (3.75, 4.86)), ("BLACK", 0.4),
       ("c31", (0.58, 3.45)), ("c31", (4.21, 7.44))]

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
        af = (f"volume={pre[1]}," if len(pre) > 1 else "") + f"aresample=48000,apad,atrim=0:{d:.5f},afade=t=in:d=0.04,afade=t=out:st={d - (0.6 if fade else 0.06):.2f}:d={0.6 if fade else 0.06}"
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
    t1, t2 = at("r1"), at("c31")  # suspenso 0-t1 (humillación en la reja), cálida t1-t2 (llega la madre con los papeles), suspenso t2-fin (CTA)
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
