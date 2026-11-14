"""Montaje de tele-nueva P1: parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
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

# v1 por frases (reglas aprobadas): (clip, (inicio, fin)[, filtro previo de video[, ganancia]]).
# Inicio = voz - 0.08 s, fin = voz + 0.15 s, medidos con envolvente de voz + palabras whisper (renders/phr.json, phr.py).
# Mismo personaje con varias frases: salto dentro del clip quitando el silencio. Reacciones solo si aportan.
# c31 (Griselda: "Es mi mamá") funde a negro: ("BLACK", 0.4) antes del CTA c32.
# c16 = clips/old/c16 (la nueva repite "para que le compren"); c16/c19/c22 recortados para esconder la tele deformada o duplicada.
K16, K19, K22 = "crop=450:800:0:60,", "crop=540:960:10:120,", "crop=450:800:0:100,"
EDL = [("c01", (1.16, 4.67)), ("c01", (5.22, 6.88)), ("c02", (1.02, 3.45)), ("c02", (4.30, 6.92)),
       ("c03", (1.33, 2.09)), ("c03", (2.69, 3.86)), ("c04", (1.16, 3.53)), ("c04", (4.59, 8.55)),
       ("c05", (1.30, 2.72)), ("c05", (3.61, 5.50)), ("c06", (0.95, 2.72)), ("c07", (0.66, 3.16)), ("c07", (4.43, 5.16)),
       ("c08", (0.62, 1.88)), ("c08", (3.86, 4.81)), ("c09", (1.02, 2.61)), ("c09", (3.48, 6.10)),
       ("c10", (0.89, 1.64)), ("c10", (2.57, 5.77)), ("c10", (6.18, 8.47)), ("c11", (1.50, 3.62)), ("c11", (4.38, 7.10)),
       ("c12", (1.22, 2.33)), ("c12", (3.06, 5.47)), ("c12", (6.44, 9.04)), ("c13", (1.53, 6.60)), ("c14", (1.52, 3.31)), ("c14", (4.41, 6.42)),
       ("c15", (0.19, 1.40)), ("c15", (2.62, 6.84)), ("old/c16", (1.10, 3.14), K16), ("old/c16", (4.41, 7.03), K16),
       ("c17", (0.50, 3.03)), ("c17", (4.42, 6.18)), ("c18", (0.35, 4.27)), ("c18", (5.24, 6.51)), ("c18", (7.36, 8.97)),
       ("c19", (4.71, 6.50), K19), ("c20", (0.25, 2.41)), ("c20", (3.38, 4.83)), ("c21", (1.11, 2.62)), ("c21", (3.41, 5.89)),
       ("c22", (1.25, 2.30), K22), ("c22", (3.39, 5.27), K22), ("c22", (6.43, 8.61), K22), ("c23", (2.30, 4.63)),
       ("c24", (2.24, 4.58)), ("c25", (1.06, 4.50)), ("c26", (1.88, 5.09)), ("c26", (5.94, 8.89)),
       ("c27", (1.63, 4.83)), ("c27", (5.42, 7.32)), ("c28", (0.81, 2.72)), ("c28", (3.53, 7.04)),
       ("c29", (1.73, 2.40)), ("c29", (3.50, 4.66)), ("c30", (1.64, 4.13)), ("c31", (0.49, 2.24)), ("c31", (3.74, 5.50)),
       ("BLACK", 0.4), ("c32", (0.73, 2.66)), ("c32", (3.52, 7.21))]

def main():
    if not EDL: sys.exit("EDL vacía: correr phr.py y armarla con renders/phr.json")
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
    # marca VISTA STORIES + camas musicales (cont.png se genera pero no se usa: sin CONTINUARÁ)
    from PIL import Image, ImageDraw, ImageFont
    def png(name, text, size, y, alpha):
        im = Image.new("RGBA", (720, 1280), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
        d.text(((720 - d.textlength(text, font=f)) / 2, y), text, font=f, fill=(255, 255, 255, alpha), stroke_width=0); im.save(R / name)
    png("cont.png", "CONTINUARÁ", 64, 200, 255); png("wm.png","VISTA STORIES",22,135,80)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    M = D / "music"
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c24"), at("c29")  # suspenso 0-t1 (la tele vieja, casa de la suegra), cálida t1-t2 (regreso con la mamá), suspenso t2-fin (llega Griselda, CTA)
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
