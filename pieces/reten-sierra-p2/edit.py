"""Montaje de reten-sierra PARTE 2 (El Retén; método aprobado medalla-mezcal-p2 / hacienda-sangre v2): EDL por frases medidas en renders/phr.json (phr.py).
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

# v1 por frases (reglas aprobadas, copia de medalla-mezcal-p2): (clip, (inicio, fin)[, filtro previo de video[, ganancia]]). Rangos de renders/phr.json
# (phr.py) + envolvente de voz: entra 0.08 s antes de la voz y sale 0.15 s después; frases del mismo clip a < 0.4 s se unen, si no, salto dentro del clip.
# QA (qa_clips.md): c04 cortado en 5.08 s (repite "vámonos de aquí"); c07 frase 2 desde 4.46 s y c29 desde 5.50 s (tartamudeos);
# c31 sin la repetición "estaría muy orgulloso" (4.10-5.15 s); c17 a -6 dB (0.5); mudos (ganancia 0): c03, i1, r1, c18, r2, c30, r3;
# silencios >= 0.45 s dentro de una frase larga se saltan solo en fin de frase/oración. c36 v2 no dice "Sí, patrona." (aceptado).
EDL = [('c01', (0.72, 5.13)), ('c01', (5.64, 6.94)), ('c01', (7.68, 9.5)), ('c02', (1.32, 2.79)), ('c02', (3.27, 7.89)), ('c03', (0.5, 2.3), '', 0), ('c04', (1.09, 2.28)), ('c04', (3.37, 5.08)), ('c05', (2.52, 3.58)), ('c05', (4.52, 7.18)), ('c06', (1.31, 3.44)), ('c06', (4.43, 6.36)), ('c06', (7.34, 9.34)), ('c07', (1.3, 2.68)), ('c07', (4.46, 6.9)), ('c08', (0.02, 2.24)), ('c08', (3.44, 5.21)), ('c08', (5.68, 6.85)), ('c09', (0.73, 3.09)), ('c09', (4.63, 5.92)), ('c10', (1.2, 3.71)), ('c10', (4.65, 6.55)), ('i1', (0.8, 2.6), '', 0), ('c11', (1.41, 4.2)), ('c11', (5.5, 8.77)), ('r1', (1.0, 2.0), '', 0), ('c12', (2.56, 3.53)), ('c12', (5.53, 6.95)), ('c13', (1.63, 3.04)), ('c13', (3.41, 4.81)), ('c14', (1.59, 2.46)), ('c14', (3.54, 5.92)), ('c15', (0.67, 2.56)), ('c15', (3.36, 6.35)), ('c16', (0.94, 3.38)), ('c16', (4.58, 7.02)), ('c17', (0.84, 2.1), '', 0.5), ('c17', (3.06, 5.03), '', 0.5), ('c18', (0.5, 3.0), '', 0), ('c19', (1.21, 2.26)), ('c19', (3.25, 5.46)), ('c19', (6.27, 9.01)), ('c20', (2.07, 4.18)), ('c20', (4.99, 6.62)), ('c20', (7.44, 9.13)), ('c21', (0.87, 2.26)), ('c21', (2.84, 3.75)), ('c21', (4.33, 8.24)), ('c21', (8.57, 9.31)), ('c22', (0.84, 1.68)), ('c22', (3.13, 4.88)), ('c23', (0.74, 2.85)), ('c23', (3.48, 5.56)), ('c23', (6.23, 9.14)), ('c24', (0.49, 1.33)), ('c24', (4.41, 7.05)), ('c25', (1.36, 3.35)), ('c25', (4.41, 5.49)), ('c25', (5.76, 7.48)), ('c26', (1.67, 2.8)), ('c26', (3.45, 5.22)), ('c26', (5.95, 7.33)), ('c27', (2.8, 4.77)), ('c28', (2.21, 3.62)), ('c28', (4.46, 5.67)), ('c28', (6.08, 6.98)), ('c29', (0.57, 3.4)), ('c29', (5.5, 7.45)), ('r2', (1.0, 2.4), '', 0), ('c30', (0.6, 3.0), '', 0), ('c31', (0.8, 2.31)), ('c31', (2.88, 4.1)), ('c31', (5.15, 6.69)), ('c32', (1.53, 3.73)), ('c32', (4.53, 7.39)), ('c33', (2.1, 4.04)), ('c33', (5.43, 6.24)), ('c34', (1.19, 3.33)), ('c34', (4.54, 7.42)), ('c35', (1.29, 3.96)), ('c35', (5.21, 6.46)), ('c36', (2.92, 4.15)), ('c36', (5.19, 7.44)), ('c37', (1.76, 3.47)), ('c38', (2.66, 4.14)), ('c38', (4.9, 7.28)), ('r3', (1.2, 3.2), '', 0), ('BLACK', 0.4), ('c39', (0.96, 3.75)), ('c39', (4.4, 7.23))]

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
    t1, t2 = at("c31"), at("c35")  # suspenso 0-t1 (refuerzos, el reloj, Pineda, Garza solo), cálida t1-t2 (cabina, el abuelo), suspenso t2-fin (Teodoro y gancho)
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
