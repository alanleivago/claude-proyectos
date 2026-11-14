"""Montaje de hacienda-sangre P1: parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
Uso: python -I edit.py  -> renders/v2.mp4 (+ lines.json con las líneas detectadas por clip)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 92.0  # segundo aprox. donde vuelve la cama de tensión (Octavio entra a la recámara vacía)

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

# (clip, (inicio, fin) en segundos[, filtro previo]) — v2: entra 0.08 s antes de la 1ª sílaba y sale 0.15 s después de la última (renders/phr.json).
# Regla v2: si el MISMO personaje dice varias frases seguidas se queda en su plano (salto dentro del clip quitando el silencio);
# solo se cambia de plano cuando cambia quien habla o la reacción aporta algo (r1 se congela, r2 calla, r3 ojos abiertos).
# Recortes del QA de continuidad (qa_continuidad.md): c06, c20, c23.
C6 = "crop=576:1024:144:128,"; C20 = "crop=540:960:0:160,"; C23 = "crop=540:960:180:40,"
EDL = [("c01", (1.02, 2.41)), ("c01", (3.46, 4.59)), ("c02", (1.02, 2.57)), ("c01", (5.18, 7.43)), ("c02", (3.77, 5.28)),
       ("c03", (1.36, 2.51)), ("c03", (3.62, 6.73)), ("c04", (1.7, 3.09)), ("c04", (4.28, 6.11)),
       ("c05", (0.66, 2.51)), ("c05", (4.16, 6.59)),
       # bufete
       ("c06", (0.7, 3.73), C6), ("c07", (1.44, 3.39)), ("c07", (5.32, 7.13)),
       ("c08", (0.2, 1.19)), ("c08", (2.9, 3.97)),
       ("c09", (0.4, 2.37)), ("c09", (3.5, 7.17)), ("c09", (8.24, 9.5)), ("r1", (3.8, 4.45)),
       ("c10", (1.56, 4.55)), ("c10", (5.48, 7.53)), ("c11", (1.85, 3.73)), ("c11", (5.24, 6.53)),
       # recámara: despedida (cama cálida)
       ("c12", (1.5, 3.51)), ("c13", (1.4, 2.65)), ("c12", (5.2, 6.93)), ("c13", (4.45, 6.65)),
       ("c14", (1.96, 3.45)), ("c14", (4.86, 6.33)), ("c14", (6.84, 8.31)), ("c15", (0.3, 3.05)), ("c15", (4.85, 6.69)),
       # ranchito: refugio
       ("c16", (1.6, 3.11)), ("c16", (4.16, 7.41)), ("c17", (1.5, 3.07)), ("c17", (4.3, 5.99)),
       ("c18", (1.75, 3.9)), ("c18", (5.0, 7.37)), ("c18", (8.18, 9.4)),
       # recámara vacía (vuelve el suspenso)
       ("c19", (1.1, 1.97)), ("c19", (3.6, 4.15)), ("c19", (5.36, 6.83)), ("c20", (0.62, 1.99), C20), ("c20", (3.12, 5.75), C20),
       ("c21", (1.1, 3.39)), ("r2", (3.4, 4.1)), ("c21", (4.78, 6.25)), ("c22", (1.1, 3.07)), ("c22", (4.3, 7.07)),
       # banco
       ("c23", (0.78, 3.51), C23), ("c23", (4.6, 6.15), C23), ("c24", (1.1, 3.89)),
       ("c25", (1.1, 3.8)), ("r3", (1.0, 1.7)), ("c25", (4.95, 7.99)), ("c26", (0.6, 1.83)), ("c26", (2.7, 6.07)),
       ("c27", (0.92, 2.43)), ("c27", (3.4, 5.19)), ("c27", (6.0, 8.31)),
       # ranchito: cara a cara
       ("c28", (0.7, 2.35)), ("c28", (3.6, 4.81)), ("c29", (0.3, 2.77)), ("c29", (3.85, 6.71)),
       ("c30", (0.5, 2.9)), ("c30", (4.0, 5.73)), ("c31", (0.6, 2.43)), ("c31", (3.45, 6.75)),
       ("c32", (3.0, 6.0)), ("BLACK", 0.4), ("c33", (0.29, 3.53)), ("c33", (4.37, 7.42))]

def main():
    cache = D / "lines.json"; L = json.loads(cache.read_text(encoding="utf-8")) if cache.exists() else {}
    for f in sorted(C.glob("c*.mp4")):
        if f.stem not in L and any(isinstance(x[1], int) for x in EDL): L[f.stem] = lines(f)
    for q in R.glob("p*.mov"): q.unlink()
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
    png("cont.png", "CONTINUARÁ", 64, 200, 255); png("wm.png", "MAJESTIC STORIES", 22, 135, 80)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    M = D / "music"
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c12"), at("c19")  # suspenso 0-t1 (expulsión y despacho), cálida t1-t2 (despedida y Nicanor), suspenso t2-fin (Teresa, banco, ranchito)
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
