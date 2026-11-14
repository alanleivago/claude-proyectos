"""Montaje de mecanico P1: parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
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
# c30 (Fermín: "Mañana hablo con el proveedor de refacciones") funde a negro: ("BLACK", 0.4) antes del CTA c31.
# Saltos dentro del clip: c04, c07 (3 frases), c10 (3.6-7.2 s, sin el primer '¿Dónde está Evaristo?'), c13, c17 (sin el '¿Ah?'), c27. c31 desde 0.55 s. Cola muda de c30 hasta 7.87 s.
EDL = [('c01', (1.06, 6.45)), ('c02', (1.24, 2.94)), ('c02', (4.17, 6.64)), ('c03', (0.58, 2.73)), ('c03', (4.02, 5.61)), ('c04', (1.05, 4.35)), ('c04', (5.23, 6.77)), ('c05', (1.68, 3.49)), ('c06', (0.56, 2.37)), ('c06', (3.38, 5.11)), ('c07', (1.04, 1.68)), ('c07', (2.44, 3.82)), ('c07', (4.59, 6.15)), ('c08', (1.46, 2.68)), ('c08', (3.39, 4.36)), ('c09', (0.95, 3.22)), ('c09', (4.24, 6.63)), ('c10', (3.67, 4.77)), ('c10', (5.27, 7.28)), ('c11', (1.28, 3.41)), ('c11', (4.61, 7.15)), ('c12', (0.47, 1.25)), ('c12', (2.16, 3.87)), ('c13', (0.39, 2.02)), ('c13', (2.61, 4.8)), ('c14', (0.46, 2.19)), ('c14', (4.02, 6.55)), ('c15', (0.64, 2.13)), ('c15', (3.42, 5.25)), ('c16', (1.17, 3.51)), ('c16', (4.5, 6.63)), ('c17', (0.65, 3.12)), ('c17', (5.13, 6.8)), ('c18', (1.22, 3.77)), ('c19', (0.02, 3.43)), ('c19', (4.56, 6.36)), ('c20', (0.67, 4.34)), ('c21', (1.6, 2.73)), ('c21', (3.41, 5.17)), ('c22', (0.66, 1.98)), ('c22', (2.51, 5.19)), ('c23', (1.21, 3.11)), ('c23', (4.38, 6.56)), ('c24', (0.4, 2.9)), ('c24', (4.57, 6.57)), ('c25', (1.21, 3.11)), ('c25', (4.38, 5.37)), ('c26', (0.92, 2.65)), ('c26', (3.6, 6.17)), ('c27', (0.59, 2.96)), ('c27', (4.29, 6.33)), ('c28', (0.26, 2.0)), ('c28', (3.15, 5.64)), ('c29', (0.69, 2.33)), ('c29', (3.95, 6.14)), ('c30', (0.41, 3.68)), ('c30', (4.55, 7.87)), ('BLACK', 0.4), ('c31', (0.55, 3.22)), ('c31', (4.29, 7.54))]

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
    t1, t2 = at("c22"), at("c28")  # suspenso 0-t1 (despido, sobrino, Celso descubre la verdad), cama cálida t1-t2 (la oferta de Celso y la falla encontrada), suspenso t2-fin (Fermín y Osvaldo, proveedor, CTA)
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
