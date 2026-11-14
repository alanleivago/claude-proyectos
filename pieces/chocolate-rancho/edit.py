"""Montaje de chocolate-rancho P1: parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
Uso: python -I edit.py  -> renders/v1.mp4 (+ lines.json con las líneas detectadas por clip)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs

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

# v1 por frases (reglas aprobadas reten-sierra v4): (clip, (inicio, fin)[, filtro previo]). Inicio = voz - 0.08 s, fin = voz + 0.15 s,
# medidos con envolvente de voz + palabras whisper (renders/phr.json, phr.py). Un mismo personaje se queda en su plano (salto dentro del clip);
# Para quedar en <=2:30 se quitan frases secundarias (c01 "La empresa no va a esperar más", c09 "Buenas tardes, doña Eulalia", c21 "Ya me encargué de eso",
# c22 "Buenas tardes", c28 "¿Para qué?", c25 "Lo importante es esto") y se saltan las pausas internas de c19 y c31.
# solo reacciones con contenido (r1 abrazo, r2 Renata pálida, r3 Renata duda). Recortes qa_clips.md: c16 hasta 6.3 (sin el "qué grande estás"
# repetido), c19 desde 1.0 (>0.5), c01 desde 1.95 (habla desde el frame 0), c10 3.58-4.76.
EDL = [("c01", (1.95, 3.57)), ("c02", (0.52, 2.48)), ("c01", (6.07, 7.82)), ("c02", (4.20, 7.05)),
       ("c03", (0.91, 3.80)), ("c04", (1.02, 3.40)), ("c03", (4.61, 8.21)), ("c04", (4.17, 6.32)),
       ("c05", (0.75, 2.99)), ("c06", (1.23, 3.65)), ("c05", (4.60, 6.54)), ("c06", (5.33, 6.79)),
       ("c07", (0.90, 2.75)), ("c07", (3.55, 5.85)), ("c08", (0.74, 2.84)), ("c08", (3.58, 5.58)),
       ("c09", (1.34, 3.17)), ("c10", (3.58, 4.76)), ("c11", (1.56, 4.98)), ("c11", (6.51, 8.27)),
       ("c12", (0.69, 2.67)), ("c12", (4.24, 6.57)), ("c13", (1.44, 3.63)), ("c13", (4.57, 7.61)),
       ("c14", (1.46, 3.28)), ("c14", (4.43, 6.19)), ("c15", (1.23, 3.04)), ("c15", (3.83, 5.38)),
       ("c16", (1.40, 3.72)), ("c16", (3.86, 6.30)), ("c17", (1.53, 2.99)), ("c17", (4.42, 6.56)), ("r1", (1.0, 2.2)),
       ("c18", (1.28, 3.73)), ("c18", (4.38, 5.67)), ("c19", (1.00, 2.98)), ("c19", (4.47, 5.59)), ("c19", (6.16, 7.57)),
       ("c20", (0.63, 2.21)), ("c20", (3.47, 6.81)), ("c21", (0.85, 2.99)), ("c21", (5.32, 7.64)),
       ("c22", (3.88, 9.40)), ("c23", (1.88, 3.82)), ("c23", (4.94, 7.03)),
       ("c24", (0.67, 2.16)), ("c24", (3.55, 5.39)), ("r2", (1.0, 2.0)), ("c24", (7.38, 8.70)),
       ("c25", (0.44, 2.72)), ("c25", (6.38, 9.63)),
       ("c26", (1.02, 2.09)), ("c26", (2.48, 6.32)), ("c26", (6.92, 9.35)), ("c27", (0.96, 2.56)), ("c27", (3.45, 5.62)),
       ("c28", (3.70, 5.62)), ("c29", (1.02, 3.37)), ("c29", (4.77, 6.43)),
       ("c30", (1.09, 3.76)), ("c30", (5.06, 6.74)), ("c31", (0.36, 1.91)), ("c31", (2.60, 3.81)), ("c31", (4.18, 6.17)),
       ("c32", (1.59, 3.78)), ("c32", (4.62, 7.48)), ("c31", (6.89, 8.34)), ("r3", (1.0, 3.0)), ("BLACK", 0.4),
       ("c33", (1.37, 3.70)), ("c33", (4.74, 7.75))]

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
    t1, t2, t3 = at("c16"), at("c20"), at("c26")  # suspenso 0-t1 (papeles y la taza), cálida t1-t2 (reencuentro), suspenso t2-t3 (escrituras y empresa), cálida t3-fin (perdón, porche, CTA)
    tv = MUSIC_VOL * 2.4
    out = R / "v1.mp4"
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim=20:{20 + t3 - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={t3 - t2 - 0.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[5:a]atrim=0:{dur - t3 + 1},afade=t=in:d=1,afade=t=out:st={dur - t3 - 1.5:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t3 * 1000)}:all=1[m2];"
          f"[0:a][boom][s1][m1][s2][m2]amix=inputs=6:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / "mix.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-stream_loop", "3", "-i", str(M / "calida.mp3"), "-stream_loop", "3", "-i", str(M / "tension.mp3"),
                    "-stream_loop", "3", "-i", str(M / "tension.mp3"), "-i", str(M / "boom" / "701308.mp3"),
                    "-stream_loop", "3", "-i", str(M / "calida.mp3"),
                    "-filter_complex", fa, "-map", "[a]", "-t", f"{dur:.2f}", str(mix)], check=True)
    tc = at("c24") if "c24" in STARTS else dur
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-loop", "1", "-i", str(R / "cont.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "3:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
