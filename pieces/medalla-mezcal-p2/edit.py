"""Montaje de medalla-mezcal PARTE 2 (plantilla hacienda-sangre v2): parte cada clip en sus líneas (faster-whisper, pausas > GAP) y las ordena según el guion.
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

# v1 por frases (reglas aprobadas, plantilla agua-hacienda-p2 v2): (clip, (inicio, fin)[, filtro previo de video[, ganancia]]). Rangos de renders/phr.json
# (phr.py) + envolvente de voz: entra 0.08 s antes de la voz y sale 0.15 s después; frases del mismo clip a < 0.4 s se unen, si no, salto dentro del clip.
# QA: c01 sin el arranque repetido "y hoy" (4.1-4.5 s); c26 zoom 108 %; c27, c30 y los planos mudos (r1, i1, c15, i2, r2) con ganancia 0;
# c31 partido en el corte duro de 6.46 s; c38 con cola muda para el fundido a negro.
EDL = [('c01', (0.6, 3.15)), ('c01', (6.38, 7.72)), ('c01', (8.33, 9.75)), ('c02', (0.1, 1.01)), ('c02', (3.37, 7.14)), ('c03', (1.55, 4.12)), ('c04', (1.2, 3.11)), ('c04', (5.4, 7.43)), ('r1', (1.0, 1.8), '', 0), ('c05', (1.25, 2.67)), ('c05', (3.43, 5.04)), ('c05', (6.12, 7.91)), ('c06', (0.54, 2.51)), ('c06', (3.55, 4.97)), ('c06', (5.93, 7.11)), ('c07', (1.35, 3.93)), ('c07', (4.61, 5.37)), ('c07', (6.02, 7.47)), ('c08', (0.66, 3.8)), ('c08', (4.64, 6.79)), ('c09', (1.15, 2.63)), ('c09', (3.59, 7.03)), ('i1', (0.8, 2.4), '', 0), ('c10', (1.17, 3.71)), ('c10', (4.52, 5.91)), ('c10', (7.08, 8.74)), ('c11', (2.14, 3.35)), ('c11', (4.45, 5.68)), ('c11', (6.2, 7.17)), ('c12', (0.84, 4.22)), ('c12', (5.23, 6.47)), ('c12', (7.35, 9.16)), ('c13', (0.7, 2.34)), ('c13', (3.4, 4.69)), ('c13', (5.5, 7.25)), ('c14', (1.88, 3.4)), ('c14', (4.39, 7.56)), ('c15', (1.0, 3.0), '', 0), ('c16', (0.75, 2.44)), ('c16', (3.57, 6.77)), ('c17', (0.7, 2.31)), ('c17', (3.99, 6.63)), ('i2', (2.8, 5.4), '', 0), ('c18', (1.65, 2.73)), ('c18', (3.47, 4.76)), ('c18', (5.96, 7.99)), ('c19', (1.09, 2.87)), ('c19', (4.11, 5.84)), ('c19', (6.44, 7.5)), ('r2', (2.6, 3.6), '', 0), ('c20', (1.66, 2.93)), ('c20', (4.29, 6.06)), ('c21', (0.58, 3.87)), ('c21', (5.0, 7.09)), ('c22', (1.18, 3.46)), ('c22', (4.45, 6.58)), ('c22', (7.56, 8.99)), ('c23', (3.2, 4.07)), ('c24', (0.98, 3.01)), ('c24', (5.25, 7.83)), ('c25', (1.35, 3.87)), ('c25', (4.98, 6.35)), ('c26', (1.21, 2.63), 'scale=778:1382,crop=720:1280,'), ('c26', (4.42, 5.85), 'scale=778:1382,crop=720:1280,'), ('c27', (0.5, 2.5), '', 0), ('c28', (0.79, 2.76)), ('c28', (4.08, 6.91)), ('c29', (1.03, 2.81)), ('c29', (4.46, 5.84)), ('c30', (0.5, 2.5), '', 0), ('c31', (0.5, 2.15)), ('c31', (3.84, 5.14)), ('c31', (6.84, 8.21)), ('c32', (0.85, 3.42)), ('c32', (5.09, 6.85)), ('c33', (0.37, 3.34)), ('c33', (4.48, 5.79)), ('c34', (0.58, 2.88)), ('c34', (4.14, 7.33)), ('c35', (0.8, 3.85)), ('c35', (4.59, 7.22)), ('c35', (8.04, 9.81)), ('c36', (0.65, 1.48)), ('c36', (2.62, 3.7)), ('c37', (2.09, 4.75)), ('c37', (5.95, 7.77)), ('c38', (0.84, 2.46)), ('c38', (3.41, 5.0)), ('BLACK', 0.4), ('c39', (1.03, 2.51)), ('c39', (3.67, 6.46))]

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
    t1, t2 = at("c31"), at("c35")  # suspenso 0-t1 (portón, medallas, Tobías), cálida t1-t2 (bienvenida, el anillo), suspenso t2-fin (secreto de Tobías y gancho)
    tv = MUSIC_VOL * 2.4
    out = R / "v1.mp4"
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim=20:{20 + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / "mix.wav"
    ins_m = ["-i", str(raw), "-stream_loop", "3", "-i", str(M / "calida.mp3"), "-stream_loop", "3", "-i", str(M / "tension.mp3"),
             "-stream_loop", "3", "-i", str(M / "tension.mp3"), "-i", str(M / "boom" / "701308.mp3")]
    # loudnorm en dos pasadas (medición + lineal): en una sola pasada quedaba en -15.4 LUFS
    m = subprocess.run(["ffmpeg", "-y", "-hide_banner", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,", "loudnorm=I=-14:TP=-1.5:print_format=json,"),
                        "-map", "[a]", "-t", f"{dur:.2f}", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    ln = f"loudnorm=I=-14:TP=-1.5:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5", ln), "-map", "[a]", "-t", f"{dur:.2f}", str(mix)], check=True)
    tc = at("c39") if "c39" in STARTS else dur
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-loop", "1", "-i", str(R / "cont.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "3:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
