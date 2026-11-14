"""Montaje de encendedor P1: parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
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

# v1 por frases (reglas aprobadas, método chocolate-rancho): (clip, (inicio, fin)[, filtro previo de video[, ganancia]]).
# Inicio = voz - 0.08 s, fin = voz + 0.15 s, medidos con envolvente de voz + palabras whisper (renders/phr.json, phr.py).
# Mismo personaje con varias frases: salto dentro del clip quitando el silencio (pausas > 0.45 s). Sin reacciones de relleno:
# solo r1 (llegada a la estación) y r2 (abrazo, funde a negro). BLACK 0.4 s antes del CTA.
# Recortes qa_clips.md: c25 sin el "cuando" repetido (2.29-3.40, corte en el valle de 2.26-2.31), c19 "Aquí está." +2 dB.
EDL = [("c01", (0.52, 3.23)), ("c01", (3.84, 5.68)), ("c01", (6.40, 7.78)), ("c01", (8.33, 9.40)),
       ("c02", (1.02, 2.72)), ("c02", (3.84, 5.58)), ("c03", (0.71, 1.98)), ("c03", (3.43, 6.76)),
       ("c04", (1.26, 2.56)), ("c05", (0.00, 3.30)), ("c04", (4.01, 4.96)), ("c05", (4.76, 6.68)),
       ("c06", (1.90, 4.11)), ("c06", (5.16, 6.20)), ("c07", (0.61, 1.93)), ("c07", (2.46, 3.94)),
       ("c08", (1.65, 2.51)), ("c08", (3.48, 4.54)), ("c09", (0.75, 3.07)), ("c08", (6.19, 8.76)),
       ("c10", (1.93, 3.32)), ("c09", (5.05, 6.63)), ("c10", (4.56, 7.36)),
       ("c11", (1.07, 2.70)), ("c12", (1.13, 1.96)), ("c12", (2.53, 3.52)), ("c11", (4.13, 5.41)), ("c11", (6.16, 7.13)),
       ("c12", (4.34, 5.15)), ("c12", (5.74, 7.46)), ("c12", (8.13, 9.08)), ("c11", (7.91, 8.80)),
       ("c13", (0.66, 2.84)), ("c13", (4.18, 7.05)), ("c14", (0.28, 1.52)), ("c15", (2.07, 3.50)), ("c15", (4.59, 5.57)),
       ("r1", (0.30, 3.30)), ("c16", (1.14, 3.33)), ("c17", (1.07, 2.55)), ("c17", (3.49, 4.47)),
       ("c18", (1.10, 2.37)), ("c18", (3.35, 4.41)), ("c18", (5.09, 6.73)), ("c16", (4.45, 5.89)),
       ("c19", (1.13, 1.87), "", 1.25), ("c19", (3.51, 4.50)), ("c20", (4.08, 6.48)), ("c21", (0.87, 1.81)), ("c21", (3.29, 6.11)),
       ("c22", (1.28, 2.49)), ("c22", (3.59, 4.31)), ("c22", (5.08, 6.43)), ("c23", (1.04, 2.16)), ("c23", (3.31, 5.01)),
       ("c24", (0.84, 2.80)), ("c24", (4.16, 6.27)), ("c25", (0.83, 2.29)), ("c25", (3.40, 4.42)), ("c25", (5.09, 5.78)), ("c25", (6.74, 8.45)),
       ("c26", (3.60, 6.13)), ("c27", (3.21, 4.76)), ("c28", (1.60, 3.56)), ("c28", (4.86, 5.94)),
       ("c29", (1.19, 2.19)), ("c29", (3.11, 4.90)), ("c30", (2.00, 3.24)), ("c30", (4.76, 5.71)),
       ("c31", (0.72, 2.35)), ("c31", (3.40, 4.75)), ("c32", (2.60, 4.89)), ("r2", (0.50, 3.50)), ("BLACK", 0.4),
       ("c33", (0.42, 2.84)), ("c33", (4.13, 7.59))]

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
    # marca VISTA STORIES + camas musicales (cont.png se genera pero no se usa: sin CONTINUARÁ)
    from PIL import Image, ImageDraw, ImageFont
    def png(name, text, size, y, alpha):
        im = Image.new("RGBA", (720, 1280), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
        d.text(((720 - d.textlength(text, font=f)) / 2, y), text, font=f, fill=(255, 255, 255, alpha), stroke_width=0); im.save(R / name)
    png("cont.png", "CONTINUARÁ", 64, 200, 255); png("wm.png", "SAGA FILMS", 22, 135, 80)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    M = D / "music"
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c28"), at("c33")  # suspenso 0-t1 (mensaje, bodega, llamada, intercambio), cálida t1-t2 (gratitud y corredor), suspenso t2-fin (CTA)
    tv = MUSIC_VOL * 2.4
    out = R / "v2.mp4"  # v2: c01 regenerado (sobre el hombro, Leandro plano en la pantalla)
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
