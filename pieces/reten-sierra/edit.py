"""Montaje de reten-sierra P1: parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
Uso: python -I edit.py  -> renders/v1.mp4 (+ lines.json con las líneas detectadas por clip)"""
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

# (clip, (inicio, fin) en segundos[, filtro previo]) — v2: una frase por plano, cortes al terminar la frase (+0.15 s), reacciones mudas cortas.
# Inicios/fines medidos con envolvente de voz + palabras whisper (renders/phr.json).
CROP29 = "crop=576:1024:72:0,"  # c29 línea 1: acercamiento que deja fuera el subtítulo quemado "-comandante." (y 1060-1105, 1.7-4.9 s)
BLUR = lambda x, y, w, h: f"delogo=x={x}:y={y}:w={w}:h={h},"  # borra texto del fondo interpolando los bordes (menos visible que boxblur)
BLUR26 = BLUR(560, 585, 159, 80)  # c26: patrulla "POLICÍA ESTATAL" al fondo a la derecha
BLUR33 = BLUR(1, 585, 214, 70)    # (c33 viejo, no se usa: el c33 nuevo no tiene texto legible) patrulla "POLICÍA ESTATAL" al fondo a la izquierda
CROP24 = "crop=576:1024:0:128,"  # c24 primer tramo: deja fuera la cabeza rapada sin gorra del borde derecho
RADIO32 = "crop=w=280:h=498:x=440:y='640+30*t',"  # c32: inserto del radio mientras habla (Garza mueve los labios con la voz del radio)
# v4: un mismo personaje se queda en su plano (salto dentro del clip, sin la cara del otro); solo reacciones con contenido (r1, r2, r4, c19).
EDL = [("c01", (1.2, 3.25)), ("c02", (1.56, 3.6)), ("c01", (4.56, 7.25)), ("c02", (4.48, 7.37)), ("c03", (1.62, 3.79)), ("c04", (0.0, 1.6)),
       ("c05", (1.32, 3.15)), ("c05", (4.44, 6.19)), ("c06", (0.78, 2.75)), ("c06", (4.16, 7.27)), ("c07", (0.84, 2.67)), ("c07", (5.32, 6.53)),
       ("c08", (1.9, 3.03)), ("c08", (5.24, 6.95)), ("c09", (0.74, 3.41)), ("c09", (4.5, 5.8)), ("r1", (1.0, 1.6)), ("c09", (6.58, 8.57)),
       ("c10", (1.08, 2.6)), ("c10", (3.32, 5.47)), ("c11", (0.88, 2.57)), ("r1", (2.6, 3.3)), ("c11", (3.48, 6.37)), ("c12", (0.7, 4.55)),
       ("c13", (0.74, 2.55)), ("r2", (4.9, 5.5)), ("c13", (2.66, 5.37)), ("c13", (5.92, 9.07)), ("r2", (3.6, 4.3)), ("c14", (1.38, 2.73)),
       ("c14", (3.56, 5.55)), ("c14", (6.46, 9.21)), ("c15", (1.22, 3.47)), ("c16", (0.52, 2.85)), ("c15", (4.66, 6.15)), ("c16", (4.28, 6.29)),
       ("c17", (2.16, 4.6)), ("c17", (5.48, 6.17)), ("c17", (6.76, 8.45)), ("c18", (2.4, 3.7)), ("c18", (4.84, 6.69)), ("c19", (1.75, 3.0)),
       ("c20", (4.52, 5.55)), ("c21", (0.48, 2.6)), ("c20", (6.5, 7.39)), ("c21", (4.02, 5.27)), ("c22", (2.58, 3.87)), ("c23", (0.78, 2.59)),
       ("c23", (3.94, 5.35)), ("c24", (1.4, 3.13), CROP24), ("c24", (4.5, 7.51)), ("c25", (0.64, 2.49)), ("c26", (1.34, 4.19), BLUR26), ("c25", (4.52, 6.85)),
       ("c26", (5.28, 6.89), BLUR26), ("c27", (1.68, 3.23)), ("c27", (4.5, 5.73)), ("c28", (1.04, 2.83)), ("c28", (3.42, 8.09)), ("r4", (3.2, 4.4)),
       ("c29", (2.32, 4.13), CROP29), ("c29", (5.38, 9.41)), ("c30", (1.62, 2.37)), ("c30", (3.66, 5.59)), ("c31", (1.96, 3.49)), ("c31", (4.54, 5.79)),
       ("c31", (7.42, 8.65)), ("c19", (3.6, 4.8)), ("c32", (1.38, 3.68), RADIO32), ("c32", (3.7, 7.0)), ("BLACK", 0.4), ("c33", (1.12, 2.93)),
       ("c33", (4.2, 7.49))]

def main():
    cache = D / "lines.json"; L = json.loads(cache.read_text(encoding="utf-8")) if cache.exists() else {}
    for f in sorted(C.glob("c*.mp4")):
        if f.stem not in L: L[f.stem] = lines(f)
    cache.write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
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
    t1, t2 = at("c12"), at("c14")  # suspenso 0-t1 (extorsión), cálida t1-t2 (el abuelo), suspenso t2-fin (cerco)
    tv = MUSIC_VOL * 2.4
    out = R / "v4.mp4"
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim=20:{20 + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.84:level=false,aresample=48000[a]")
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
