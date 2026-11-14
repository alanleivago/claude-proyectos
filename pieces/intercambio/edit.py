"""Montaje de intercambio PARTE 1 (La Virgen de los Villaseñor; copia del edit.py de sazon-concha / fierro-herradura: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/MEXI: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "MEXI"  # MEXI STORIES: música + marca de agua (arriba a la derecha, margen 36, y=210) salen de pieces/_marcas/MEXI
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

# v1 por frases (método aprobado de sazon-concha): rangos de renders/phr.json (envolvente de voz, ataques suaves con umbral floor+7) confirmados con faster-whisper large-v3
# (sin cortes dentro de palabra; c13 y c21 partidos en la pausa >= 0.3 s que small había unido): entra 0.08 s antes de la voz y sale 0.15 s después, cortes solo en fin de frase;
# mismo personaje = salto dentro del clip. QA (qa_clips.md): r1-r4 e i1 mudos (ganancia 0), r4 oscurecido; crops de borde solo en la frase que cubre el borde (c02/c03/c06/c08/c11/
# c13/c22/c26/c28/c29); crop de todo el clip en c07 (432:768:0:200), c23 (450:800:0:200), c24 (540:960:0:160) y c27 (600:1067:0:0, saca el pesebre de la hoja de la sala);
# arranques c03 >= 0.38, c06 >= 0.5, c08 >= 1.1, c11 >= 0.9, c16 >= 0.6, c28 >= 0.7, c29 >= 0.6, r1 >= 0.5, r2 >= 1.1. Ganancias por clip hacia ~-19.5 LUFS. BLACK 0.4 s antes del CTA (c32).
EDL = [('c01', (1.15, 2.59), '', '1dB'),
       ('c01', (2.76, 3.63), '', '1dB'),
       ('c01', (4.43, 8.07), '', '1dB'),
       ('c02', (0.64, 2.26), 'crop=600:1067:0:0,', '2dB'),
       ('c02', (2.58, 4.89), '', '2dB'),
       ('c03', (0.66, 2.88), '', '2dB'),
       ('c03', (3.96, 4.87), '', '2dB'),
       ('c03', (4.92, 6.13), '', '2dB'),
       ('c04', (0.25, 0.96), '', '0dB'),
       ('c04', (1.12, 2.48), '', '0dB'),
       ('c04', (3.23, 6.24), '', '0dB'),
       ('c05', (0.67, 3.02), '', '0dB'),
       ('c05', (4.38, 6.91), '', '0dB'),
       ('c06', (0.67, 2.65), 'crop=580:1031:140:0,', '0dB'),
       ('c06', (3.4, 4.65), '', '0dB'),
       ('c06', (5.24, 7.55), '', '0dB'),
       ('c07', (0.58, 1.67), 'crop=432:768:0:200,', '-1dB'),
       ('c07', (1.87, 3.98), 'crop=432:768:0:200,', '-1dB'),
       ('c07', (4.36, 7.53), 'crop=432:768:0:200,', '-1dB'),
       ('c08', (1.1, 2.14), 'crop=600:1067:120:0,', '-1dB'),
       ('c08', (2.37, 4.31), '', '-1dB'),
       ('c08', (5.05, 6.81), '', '-1dB'),
       ('r1', (1.0, 2.5), '', 0),
       ('c09', (0.4, 2.28), '', '4dB'),
       ('c09', (2.94, 4.6), '', '4dB'),
       ('c10', (0.76, 1.97), '', '-2dB'),
       ('c10', (2.63, 4.97), '', '-2dB'),
       ('c11', (1.16, 3.54), 'crop=600:1067:120:0,', '3dB'),
       ('c11', (4.51, 6.39), '', '3dB'),
       ('c12', (0.78, 3.07), '', '4dB'),
       ('c12', (4.16, 6.31), '', '4dB'),
       ('c13', (0.56, 3.01), 'crop=530:942:0:0,', '3dB'),
       ('c13', (3.45, 5.38), '', '3dB'),
       ('c14', (0.29, 1.7), '', '-2dB'),
       ('c14', (2.57, 3.5), '', '-2dB'),
       ('c14', (3.65, 5.55), '', '-2dB'),
       ('i1', (3.2, 5.6), '', 0),
       ('c15', (1.02, 2.38), '', '-1dB'),
       ('c15', (3.35, 7.28), '', '-1dB'),
       ('c16', (1.11, 2.99), '', '-1dB'),
       ('c16', (4.13, 6.77), '', '-1dB'),
       ('c17', (0.33, 2.38), '', '0dB'),
       ('c17', (3.04, 5.46), '', '0dB'),
       ('c18', (0.61, 3.57), '', '-3dB'),
       ('c18', (4.23, 5.33), '', '-3dB'),
       ('c18', (5.8, 7.11), '', '-3dB'),
       ('r2', (1.1, 2.6), '', 0),
       ('c19', (0.42, 2.07), '', '-1dB'),
       ('c19', (2.64, 5.07), '', '-1dB'),
       ('c20', (0.95, 2.34), '', '-1dB'),
       ('c20', (2.58, 3.38), '', '-1dB'),
       ('c20', (4.39, 6.37), '', '-1dB'),
       ('r3', (1.0, 2.5), '', 0),
       ('c21', (0.54, 3.09), '', '1dB'),
       ('c21', (3.96, 6.67), '', '1dB'),
       ('c22', (0.38, 3.71), 'crop=600:1067:120:0,', '0dB'),
       ('c22', (4.57, 7.1), '', '0dB'),
       ('c23', (0.77, 3.31), 'crop=450:800:0:200,', '-2dB'),
       ('c23', (3.92, 4.85), 'crop=450:800:0:200,', '-2dB'),
       ('c24', (0.34, 2.19), 'crop=540:960:0:160,', '-1dB'),
       ('c24', (2.71, 3.81), 'crop=540:960:0:160,', '-1dB'),
       ('c24', (4.05, 7.11), 'crop=540:960:0:160,', '-1dB'),
       ('c25', (0.06, 2.11), '', '-3dB'),
       ('c25', (2.64, 3.94), '', '-3dB'),
       ('c25', (4.0, 5.51), '', '-3dB'),
       ('c26', (0.42, 2.05), 'crop=620:1102:100:0,', '-1dB'),
       ('c26', (3.03, 4.53), '', '-1dB'),
       ('c27', (0.7, 2.6), 'crop=600:1067:0:0,', '0dB'),
       ('c27', (2.7, 4.2), 'crop=600:1067:0:0,', '0dB'),
       ('c28', (0.73, 2.8), 'crop=600:1067:120:0,', '-1dB'),
       ('c28', (3.49, 6.38), '', '-1dB'),
       ('c29', (1.12, 3.73), '', '1dB'),
       ('c29', (4.62, 6.1), '', '1dB'),
       ('c30', (0.67, 2.13), '', '1dB'),
       ('c30', (2.82, 3.83), '', '1dB'),
       ('c31', (0.62, 3.94), '', '0dB'),
       ('c31', (5.25, 7.94), '', '0dB'),
       ('r4', (3.0, 5.0), 'eq=brightness=-0.08:saturation=0.9,', 0),
       ('BLACK', 0.4),
       ('c32', (0.47, 4.4), '', '-4dB'),
       ('c32', (5.22, 8.78), '', '-4dB')]

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
    # marca MEXI STORIES (kit _marcas: 22 px, alpha 80, arriba a la derecha, margen 36, y=210; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c27"), at("c29")  # suspenso 0-t1 (intercambio, patio, la Virgen, el giro), cálida t1-t2 (Fabiola pone la Virgen en el nacimiento), suspenso t2-fin (lo que escondió Casimiro y CTA)
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
