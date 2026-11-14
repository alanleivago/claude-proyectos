"""Montaje de agua-hacienda PARTE 2 (plantilla hacienda-sangre v2): parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
Uso: python -I edit.py  -> renders/v1.mp4 (+ renders/whisper_lines.json con las líneas detectadas; lines.json es el guion de clips.py)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2

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

# v1 por frases (reglas aprobadas): (clip, (inicio, fin)[, filtro previo de video[, ganancia]]). Rangos de renders/phr.json (phr.py):
# entra 0.08 s antes de la voz y sale 0.15 s después; frases del mismo clip a < 0.4 s se unen, si no, salto dentro del clip.
# Arreglos menores del QA: c10 solo 0-5.4 s; c18 mudo (ganancia 0); c29 sin la repetición (sale a 7.75 s, la voz termina en 7.6);
# c30 regenerado (v2, sin subtítulos): dos frases medidas en phr.json. c37 con cola muda para el fundido a negro.
EDL = [('c01', (0.61, 6.64)), ('c01', (8.04, 9.41)), ('c02', (0.7, 7.13)), ('c03', (0.8, 2.35)), ('c03', (3.4, 6.37)), ('c04', (1.92, 3.32)), ('c04', (4.74, 6.88)), ('c05', (0.76, 2.08)), ('c05', (3.48, 6.0)), ('c06', (1.11, 3.46)), ('c06', (4.02, 6.32)), ('c07', (0.41, 7.28)), ('c08', (0.7, 5.94)), ('c09', (1.54, 4.01)), ('c09', (4.91, 7.92)), ('c10', (0.9, 2.07)), ('c10', (3.82, 5.4)), ('r1', (1.0, 1.8)), ('c11', (0.53, 7.45)), ('c12', (1.26, 4.03)), ('c12', (4.78, 7.29)), ('c13', (1.25, 2.71)), ('c13', (3.63, 6.99)), ('c14', (0.79, 1.88)), ('c14', (2.6, 6.46)), ('c14', (7.08, 9.31)), ('c15', (1.19, 6.92)), ('c16', (1.24, 3.81)), ('c16', (4.91, 7.05)), ('c17', (0.82, 3.93)), ('c17', (4.54, 6.69)), ('c18', (0.5, 2.5), '', 0), ('c19', (0.75, 2.31)), ('c19', (5.0, 6.34)), ('c20', (0.79, 6.88)), ('c21', (1.0, 3.0)), ('c22', (1.45, 2.58)), ('c22', (3.61, 4.68)), ('c22', (6.54, 8.42)), ('c23', (1.15, 8.95)), ('c24', (0.6, 1.75)), ('c24', (2.54, 5.05)), ('c24', (6.35, 8.29)), ('c25', (0.39, 2.71)), ('c25', (5.06, 7.44)), ('c26', (0.5, 2.5)), ('c27', (1.17, 2.5)), ('c27', (3.58, 6.46)), ('c27', (7.43, 9.01)), ('c28', (0.84, 3.24)), ('c28', (4.4, 7.19)), ('r2', (1.0, 1.8)), ('c29', (0.82, 2.06)), ('c29', (3.12, 4.72)), ('c29', (5.47, 7.75)), ('c30', (2.13, 4.11)), ('c30', (5.28, 6.23)), ('c31', (0.89, 5.41)), ('c32', (0.88, 3.04)), ('c32', (4.09, 7.3)), ('c33', (1.4, 2.75)), ('c33', (3.37, 6.56)), ('c34', (0.62, 4.47)), ('c34', (5.14, 6.95)), ('c34', (7.39, 9.02)), ('c35', (1.05, 6.87)), ('c36', (1.68, 2.56)), ('c36', (4.4, 4.95)), ('c35', (7.49, 9.8)), ('c37', (5.05, 7.0)), ('BLACK', 0.4), ('c38', (1.18, 3.92)), ('c38', (4.88, 7.46))]

def main():
    if not EDL: sys.exit("EDL vacía: correr phr.py y armarla con renders/phr.json")
    L = {}  # v1: EDL por rangos medidos (renders/phr.json)
    for q in R.glob("p*.mov"): q.unlink()
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
    t1, t2 = at("c18"), at("c35")  # suspenso 0-t1 (cara a cara), cálida t1-t2 (compuerta, pozo y el jarrito), suspenso t2-fin (escrituras y gancho)
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
    tc = at("c38") if "c38" in STARTS else dur
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-loop", "1", "-i", str(R / "cont.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "3:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
