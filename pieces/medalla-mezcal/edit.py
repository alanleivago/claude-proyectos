"""Montaje de agua-hacienda P1: parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
Uso: python -I edit.py  -> renders/v2.mp4"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 78.0  # segundo donde entra la cama de tensión (llega Ezequiel rico)

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

# v2 (método reten-sierra v4): (clip, (inicio, fin) en segundos[, filtro previo]). Frases medidas con envolvente de voz + palabras whisper
# (renders/phr.json): entrada 0.08 s antes, salida 0.15 s después. Un mismo personaje se queda en su plano (salto dentro del clip);
# solo reacciones con contenido (i1-i3, r1-r4, c25, c34; c34 acaba antes de su corte interno de 1.5 s). Quitadas: c01·1, c06·2, c07 "Vendía tortillas…", c10·2, c11·2, c17·2,
# c20·0, c24 entero, c26 entero, c31·0, c31 "Escúchame bien".
CROP37 = "crop=520:924:100:0,"  # c37 línea 1: acercamiento que deja fuera el subtítulo quemado "Entrégamela."
EDL = [("c01", (0.84, 4.67)), ("c02", (1.24, 2.35)), ("c03", (1.02, 2.55)), ("c02", (3.06, 4.73)), ("c03", (2.9, 4.97)), ("c02", (6.0, 6.85)),
       ("c02", (8.14, 8.71)), ("c03", (5.78, 6.93)), ("c03", (8.06, 9.31)), ("c04", (0.62, 1.73)), ("c05", (1.26, 2.39)), ("i1", (0.5, 2.0)),
       ("c04", (3.52, 5.17)), ("c04", (6.58, 8.57)), ("c05", (3.52, 4.79)), ("c05", (5.86, 7.17)), ("c06", (1.36, 2.59)), ("c07", (0.1, 2.71)),
       ("c06", (3.52, 4.69)), ("c07", (3.1, 4.15)), ("c07", (7.72, 9.67)), ("c08", (1.62, 2.19)), ("c08", (3.96, 4.67)), ("c09", (1.24, 3.89)),
       ("c08", (4.84, 6.19)), ("c09", (5.62, 8.21)), ("r1", (1.0, 2.0)), ("c10", (0.74, 3.27)), ("c11", (0.6, 3.27)), ("c10", (3.9, 5.53)),
       ("c11", (4.08, 5.87)), ("c12", (1.18, 3.89)), ("c13", (1.08, 3.09)), ("c12", (5.06, 5.97)), ("c13", (3.86, 6.99)), ("c13", (7.88, 8.85)),
       ("c14", (1.52, 2.53)), ("c15", (1.26, 1.91)), ("c15", (4.4, 5.93)), ("i2", (0.5, 2.2)), ("c14", (3.38, 5.13)), ("c14", (7.04, 8.01)),
       ("c15", (6.96, 8.77)), ("c16", (0.44, 3.27)), ("c17", (1.48, 2.09)), ("c16", (3.78, 6.13)), ("c17", (3.46, 5.11)), ("c16", (7.18, 8.65)),
       ("c18", (1.5, 3.09)), ("c18", (4.44, 6.01)), ("i3", (0.8, 2.6)), ("c20", (6.14, 7.39)), ("c21", (0.72, 2.55)), ("c20", (8.34, 8.97)),
       ("c21", (3.54, 5.65)), ("c21", (6.42, 8.79)), ("r2", (1.0, 2.0)), ("c22", (1.52, 3.95)), ("c22", (5.08, 5.97)), ("c23", (0.58, 3.33)),
       ("c23", (3.88, 5.61)), ("c23", (6.42, 7.31)), ("c25", (0.5, 2.0)), ("c27", (0.5, 2.41)), ("c27", (4.1, 6.31)), ("c27", (7.46, 8.65)),
       ("c28", (1.36, 5.61)), ("c29", (1.5, 2.11)), ("c28", (6.56, 8.21)), ("c29", (4.02, 5.09)), ("c29", (5.86, 7.09)), ("c30", (0.74, 2.63)),
       ("c30", (3.4, 4.31)), ("c30", (5.0, 7.39)), ("c31", (5.5, 6.89)), ("c31", (7.5, 8.89)), ("c32", (1.88, 2.85)), ("c32", (4.44, 5.37)),
       ("c33", (1.98, 3.23)), ("c33", (4.62, 5.29)), ("c34", (0.2, 1.45)), ("c35", (0.36, 1.11)), ("c36", (1.26, 2.43)), ("c35", (2.26, 4.63)),
       ("c36", (3.68, 5.35)), ("c35", (6.0, 8.85)), ("c36", (6.78, 8.59)), ("c37", (1.74, 3.15)), ("c37", (4.62, 5.55), CROP37), ("r4", (1.0, 2.0)),
       ("c38", (0.52, 2.05)), ("c38", (3.7, 6.21)), ("r3", (1.0, 2.5)), ("BLACK", 0.4), ("c39", (0.88, 2.65)), ("c39", (3.54, 6.79))]

def main():
    for q in R.glob("p*.mov"): q.unlink()
    parts = []; global STARTS; STARTS = {}
    for i, (cid, x, *pre) in enumerate(EDL):
        p = R / f"p{i:03d}.mov"
        if cid == "BLACK":
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "color=black:720x1280:r=24", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
                            "-t", f"{round(x * 24) / 24:.5f}", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(p)], check=True); parts.append(p); continue
        src = C / f"{cid}.mp4"
        if not src.exists(): print("falta", cid); continue
        s, e = x
        d = round((e - s) * 24) / 24; fade = i + 1 < len(EDL) and EDL[i + 1][0] == "BLACK"
        vf = (pre[0] if pre else "") + "scale=720:1280,fps=24,tpad=stop_mode=clone:stop_duration=0.5" + (f",fade=t=out:st={d - 0.6:.2f}:d=0.6" if fade else "")
        af = f"aresample=48000,apad,atrim=0:{d:.5f},afade=t=in:d=0.04,afade=t=out:st={d - (0.6 if fade else 0.06):.2f}:d={0.6 if fade else 0.06}"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-i", str(src), "-vf", vf,
                        "-af", af, "-ac", "2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "pcm_s16le", "-frames:v", str(round(d * 24)), str(p)], check=True)
        STARTS.setdefault(cid, len(parts)); parts.append(p)
    lst = R / "list.txt"; lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    raw = R / "raw.mov"
    ins = [x for q in parts for x in ("-i", str(q))]
    fcat = "".join(f"[{k}:v]setpts=N/24/TB[v{k}];[{k}:a]asetpts=N/SR/TB[a{k}];" for k in range(len(parts))) + "".join(f"[v{k}][a{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[v][a]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fcat, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(raw)], check=True)
    # placa CONTINUARÁ (últimos 3 s) + marca VISTA STORIES + camas musicales
    from PIL import Image, ImageDraw, ImageFont
    def png(name, text, size, y, alpha):
        im = Image.new("RGBA", (720, 1280), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
        d.text(((720 - d.textlength(text, font=f)) / 2, y), text, font=f, fill=(255, 255, 255, alpha), stroke_width=0); im.save(R / name)
    png("cont.png", "CONTINUARÁ", 64, 200, 255); png("wm.png", "VISTA STORIES", 22, 135, 80)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    M = D / "music"
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c09"), at("c16")  # suspenso 0-t1 (humillación), cálida t1-t2 (protector), suspenso t2-fin (villano)
    tv = MUSIC_VOL * 2.4
    out = R / "v2.mp4"
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim=20:{20 + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / "mix.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-stream_loop", "3", "-i", str(M / "calida.mp3"), "-stream_loop", "3", "-i", str(M / "tension.mp3"),
                    "-stream_loop", "3", "-i", str(M / "tension.mp3"), "-i", str(M / "boom" / "701308.mp3"),
                    "-filter_complex", fa, "-map", "[a]", "-t", f"{dur:.2f}", str(mix)], check=True)
    tc = at("c24") if "c24" in STARTS else dur
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-loop", "1", "-i", str(R / "cont.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "3:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
