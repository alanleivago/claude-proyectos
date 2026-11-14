"""Montaje de sazon-concha PARTE 1 (El Sazón de Doña Concha; copia del edit.py aprobado de fierro-herradura: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/MAJESTIC: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "MAJESTIC"  # MAJESTIC STORIES: música + marca de agua (arriba a la izquierda, x=36, y=210) salen de pieces/_marcas/MAJESTIC
REMIX = "--remix" in sys.argv

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

# v1 por frases (método aprobado de fierro-herradura): rangos de renders/phr.json (envolvente de voz) confirmados con faster-whisper large-v3: entra 0.08 s antes de la voz
# y sale 0.15 s después, cortes solo en fin de frase (pausa >= 0.3 s tras signo de puntuación); mismo personaje = salto dentro del clip. QA (qa_clips.md): r1-r4 e i1 mudos
# (ganancia 0); punch-in (crop) en la frase 1 de c03/c05/c07/c11/c14/c16/c22/c26/c28/c30 (c16 regenerado: figura abajo a la IZQ. hasta ~0.9 s); arranques c09 1.48 (figura DER.
# hasta ~0.6 s), c12 0.83, c28 1.03, c29 1.25, r4 1.0; callejón de noche (c28-c30, r4) oscurecido con eq/colorbalance. Ganancias por clip hacia ~-19.5 LUFS. BLACK 0.4 s antes del CTA (c31).
EDL = [('c01', (0.59, 3.24), '', '0dB'), ('c01', (3.85, 5.68), '', '0dB'), ('c01', (6.62, 8.67), '', '0dB'), ('c02', (0.75, 4.23), '', '2dB'), 
       ('c02', (4.84, 6.90), '', '2dB'), ('c03', (0.69, 2.15), 'crop=576:1024:144:0,', '0dB'), ('c03', (2.27, 3.90), '', '0dB'), ('c03', (4.46, 5.24), '', '0dB'), 
       ('c03', (5.42, 6.55), '', '0dB'), ('c04', (0.52, 1.13), '', '5dB'), ('c04', (1.53, 3.50), '', '5dB'), ('c04', (4.62, 6.29), '', '5dB'), 
       ('c04', (6.52, 7.39), '', '5dB'), ('c05', (0.79, 3.60), 'crop=450:800:0:60,', '5dB'), ('c05', (4.70, 6.66), '', '5dB'), ('c06', (1.02, 3.65), '', '2dB'), 
       ('c06', (4.45, 7.16), '', '2dB'), ('c07', (0.50, 2.20), 'crop=576:1024:0:0,', '-1dB'), ('c07', (2.96, 5.01), '', '-1dB'), ('r1', (1.00, 2.50), '', 0), 
       ('c08', (0.46, 2.64), '', '0dB'), ('c08', (3.52, 5.91), '', '0dB'), ('c08', (6.25, 7.10), '', '0dB'), ('c09', (1.48, 3.01), '', '3dB'), 
       ('c09', (4.22, 6.55), '', '3dB'), ('c10', (0.64, 3.67), '', '3dB'), ('c10', (4.51, 6.88), '', '3dB'), ('c11', (0.65, 1.98), 'crop=540:960:0:0,', '-2dB'), 
       ('c11', (3.46, 6.63), '', '-2dB'), ('c12', (0.83, 2.06), '', '-2dB'), ('c12', (2.25, 3.84), '', '-2dB'), ('c12', (4.58, 7.13), '', '-2dB'), 
       ('i1', (2.00, 3.50), '', 0), ('c13', (1.51, 2.90), '', '0dB'), ('c13', (3.35, 5.61), '', '0dB'), ('c14', (0.61, 2.83), 'crop=594:1056:126:0,', '3dB'), 
       ('c14', (3.13, 4.63), '', '3dB'), ('c15', (1.29, 3.91), '', '2dB'), ('c15', (4.71, 6.88), '', '2dB'), ('r2', (1.00, 2.50), '', 0), 
       ('c16', (0.53, 1.20), 'crop=608:1081:112:0,', '4dB'), ('c16', (1.37, 3.16), '', '4dB'), ('c16', (3.63, 4.76), '', '4dB'), ('c17', (0.75, 4.92), '', '0dB'), 
       ('c17', (5.42, 8.70), '', '0dB'), ('c18', (1.06, 1.83), '', '-2dB'), ('c18', (2.16, 4.06), '', '-2dB'), ('c18', (4.57, 6.29), '', '-2dB'), 
       ('c19', (0.64, 2.47), '', '4dB'), ('c19', (3.41, 7.04), '', '4dB'), ('r3', (1.00, 2.50), '', 0), ('c20', (0.28, 1.30), '', '0dB'), 
       ('c20', (1.48, 7.25), '', '0dB'), ('c21', (0.73, 1.38), '', '-2dB'), ('c21', (1.78, 3.62), '', '-2dB'), ('c21', (4.61, 6.33), '', '-2dB'), 
       ('c22', (0.33, 1.50), 'crop=610:1085:0:0,', '-2dB'), ('c22', (1.78, 2.84), '', '-2dB'), ('c22', (3.27, 4.11), '', '-2dB'), ('c22', (4.46, 5.69), '', '-2dB'), 
       ('c22', (5.88, 7.73), '', '-2dB'), ('c23', (0.89, 2.01), '', '0dB'), ('c23', (2.36, 4.07), '', '0dB'), ('c23', (4.46, 6.72), '', '0dB'), 
       ('c24', (1.37, 2.13), '', '4dB'), ('c24', (3.03, 3.93), '', '4dB'), ('c24', (4.14, 4.85), '', '4dB'), ('c25', (1.15, 2.68), '', '-1dB'), 
       ('c25', (3.48, 5.10), '', '-1dB'), ('c26', (0.54, 1.98), 'crop=612:1088:108:0,', '1dB'), ('c26', (2.55, 5.10), '', '1dB'), ('c27', (0.86, 3.05), '', '-2dB'), 
       ('c27', (3.52, 4.84), '', '-2dB'), ('c28', (1.03, 3.66), 'eq=brightness=-0.045:saturation=0.88,colorbalance=bs=0.04,crop=576:1024:0:128,', '5dB'), 
       ('c28', (4.56, 8.28), 'eq=brightness=-0.045:saturation=0.88,colorbalance=bs=0.04,', '5dB'), 
       ('c29', (1.25, 3.13), 'eq=brightness=-0.045:saturation=0.88,colorbalance=bs=0.04,', '2dB'), 
       ('c29', (3.98, 5.43), 'eq=brightness=-0.045:saturation=0.88,colorbalance=bs=0.04,', '2dB'), 
       ('c30', (0.55, 1.92), 'eq=brightness=-0.045:saturation=0.88,colorbalance=bs=0.04,crop=540:960:0:0,', '6dB'), 
       ('c30', (3.53, 6.00), 'eq=brightness=-0.045:saturation=0.88,colorbalance=bs=0.04,', '6dB'), 
       ('r4', (1.00, 2.50), 'eq=brightness=-0.045:saturation=0.88,colorbalance=bs=0.04,', 0), ('BLACK', 0.4), ('c31', (0.45, 3.53), '', '1dB'), 
       ('c31', (3.91, 5.31), '', '1dB'), ('c31', (5.59, 7.37), '', '1dB'), ('c31', (8.48, 9.59), '', '1dB')]

def main():
    if not EDL: sys.exit("EDL vacía: correr phr.py y armarla con renders/phr.json")
    L = {}  # borrador: frases de whisper por clip (solo para entradas con índice)
    if not REMIX:
        for q in R.glob("p*.mov"): q.unlink()
    parts = []; global STARTS; STARTS = {}
    for i, (cid, x, *pre) in enumerate(EDL):
        p = R / f"p{i:03d}.mov"
        if REMIX and p.exists():
            if cid != "BLACK": STARTS.setdefault(cid, len(parts))
            parts.append(p); continue
        if cid == "BLACK":
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "color=black:720x1280:r=24", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
                            "-t", f"{round(x * 24) / 24:.5f}", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(p)], check=True); parts.append(p); continue
        src = C / f"{cid}.mp4"
        if not src.exists(): print("falta", cid); continue
        if isinstance(x, int):
            if cid not in L: L[cid] = lines(src)
            if x >= len(L[cid]): print("sin línea", cid, x, L[cid]); continue
            s, e, _ = L[cid][x]; s, e = max(0, s - 0.1), e + 0.28
        else: s, e = x
        d = round((e - s) * 24) / 24; fade = i + 1 < len(EDL) and EDL[i + 1][0] == "BLACK"
        vf = (pre[0] if pre else "") + "scale=720:1280,setsar=1,fps=24,tpad=stop_mode=clone:stop_duration=0.5" + (f",fade=t=out:st={d - 0.6:.2f}:d=0.6" if fade else "")
        af = (f"volume={pre[1]}," if len(pre) > 1 else "") + f"aresample=48000,apad,atrim=0:{d:.5f},afade=t=in:d=0.04,afade=t=out:st={d - (0.6 if fade else 0.06):.2f}:d={0.6 if fade else 0.06}"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-i", str(src), "-vf", vf,
                        "-af", af, "-ac", "2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "pcm_s16le", "-frames:v", str(round(d * 24)), str(p)], check=True)
        STARTS.setdefault(cid, len(parts)); parts.append(p)
    lst = R / "list.txt"; lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    raw = R / "raw.mov"
    ins = [x for q in parts for x in ("-i", str(q))]
    fcat = "".join(f"[{k}:v]setpts=N/24/TB[v{k}];[{k}:a]asetpts=N/SR/TB[a{k}];" for k in range(len(parts))) + "".join(f"[v{k}][a{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[v][a]"
    if not (REMIX and raw.exists()): subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fcat, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(raw)], check=True)
    # marca MAJESTIC STORIES (kit _marcas: 22 px, alpha 80, x=36, y=210, arriba a la izquierda; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c25"), at("c28")  # suspenso 0-t1 (cocina, callejón, comedor, Maximiliano derrotado), cálida t1-t2 (Concha vuelve a su cocina), suspenso t2-fin (la sal, Darío y CTA)
    tv = MUSIC_VOL * 2.4
    out = R / "v1.mp4"
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim={BC['tension2_from']}:{BC['tension2_from'] + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,lowpass=f=16000,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / "mix.wav"
    ins_m = ["-i", str(raw), "-stream_loop", "3", "-i", str(M / "calida.mp3"), "-stream_loop", "3", "-i", str(M / "tension.mp3"),
             "-stream_loop", "3", "-i", str(M / "tension.mp3"), "-i", str(M / BC["hit"])]
    # loudnorm en dos pasadas (medición + lineal): en una sola pasada quedaba en -15.4 LUFS
    # lowpass 16 kHz antes de loudnorm: sin él el AAC 192k pasaba de -1.9 a +1.2 dBTP (agudos de Omni)
    m = subprocess.run(["ffmpeg", "-y", "-hide_banner", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,", "loudnorm=I=-14:TP=-1.5:print_format=json,"),
                        "-map", "[a]", "-t", f"{dur:.2f}", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    ln = f"loudnorm=I=-14:TP=-1.5:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5", ln), "-map", "[a]", "-t", f"{dur:.2f}", str(mix)], check=True)
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "2:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
