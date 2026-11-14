"""Montaje de gardenia PARTE 1 (La Boda de las Gardenias, video 23; copia del edit.py de intercambio: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/VISTA: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "VISTA"  # VISTA STORIES: música + marca de agua (arriba al centro, y=135) salen de pieces/_marcas/VISTA
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

# v1 por frases (método aprobado de buen-hijo-p2): rangos de renders/phr.json (small, floor+14) confirmados con renders/lv3.json (large-v3 + envolvente floor+7;
# arranques dudosos revisados a mano en tramos de 50 ms). Entra 0.08 s antes de la voz y sale 0.15 s después, cortes solo en fin de frase; pausas < 0.5 s no se cortan.
# Mismo personaje = salto dentro del clip. Formato: (cid, (ini, fin), crop, ganancia[, J]). Crops de borde (qa_clips.md) solo en el tramo que arranca con el borde visible.
# c20 nuevo descartado (camina hasta ~1.75 s y "Aquí estoy yo" sube como pregunta): fallback old/c20_v1 con crop=450:800:270:0 y J-cut de 0.13 s
# (el audio entra en 1.07, la imagen en 1.20; los 0.13 s de imagen siguen en c19). Arranques: c04/c29/c31/c24 después del borde; r1-r5 mudos desde 1.0 (r5 >= 0.2).
# Ganancias por clip hacia ~-19.5 LUFS. BLACK 0.4 s antes del CTA (c34).
EDL = [('c01', (1.4, 6.6), '', '3.5dB'), ('c01', (7.21, 8.71), '', '3.5dB'),
       ('c02', (0.62, 2.37), 'crop=600:1067:0:0,', '0dB'), ('c02', (3.36, 4.89), '', '0dB'),
       ('c03', (0.97, 3.85), '', '2.5dB'), ('c03', (4.71, 7.57), '', '2.5dB'),
       ('c04', (1.3, 3.9), '', '2.5dB'), ('c04', (4.78, 7.31), '', '2.5dB'),
       ('c05', (0.7, 2.32), 'crop=540:960:0:0,', '1.5dB'), ('c05', (3.21, 5.39), '', '1.5dB'),
       ('c06', (0.66, 3.52), '', '-0.5dB'), ('c06', (4.52, 5.56), '', '-0.5dB'),
       ('c07', (0.6, 1.84), '', '1dB'), ('c07', (2.48, 4.71), '', '1dB'),
       ('c08', (0.88, 2.23), '', '3.5dB'), ('c08', (3.57, 6.64), '', '3.5dB'),
       ('c09', (1.3, 4.53), '', '-0.5dB'), ('c09', (5.11, 7.64), '', '-0.5dB'),
       ('c10', (0.84, 4.78), '', '1dB'), ('c10', (5.24, 6.67), '', '1dB'),
       ('c11', (1.51, 3.27), '', '-2dB'), ('c11', (3.86, 7.4), '', '-2dB'),
       ('c12', (0.42, 3.26), '', '3.5dB'), ('c12', (3.54, 5.87), '', '3.5dB'),
       ('r1', (1.0, 2.5), '', 0),
       ('c13', (0.81, 2.25), '', '1.5dB'), ('c13', (2.86, 5.36), '', '1.5dB'),
       ('c14', (0.52, 2.26), 'crop=540:960:0:0,', '0.5dB'), ('c14', (3.23, 6.43), '', '0.5dB'),
       ('c15', (1.15, 4.24), '', '2.5dB'), ('c15', (4.92, 6.77), '', '2.5dB'),
       ('c16', (0.34, 1.67), 'crop=540:960:0:0,', '3.5dB'), ('c16', (2.73, 6.18), '', '3.5dB'),
       ('r2', (1.0, 2.5), '', 0),
       ('c17', (0.91, 2.97), '', '5.5dB'), ('c17', (3.73, 5.4), '', '5.5dB'),
       ('c18', (0.7, 2.08), 'crop=540:960:0:0,', '2.5dB'), ('c18', (3.48, 7.04), '', '2.5dB'),
       ('c19', (0.51, 1.61), '', '3.5dB'), ('c19', (2.26, 5.25), '', '3.5dB'),
       ('old/c20_v1', (1.07, 4.19), 'crop=450:800:270:0,', '1dB', 0.13),
       ('c21', (1.02, 2.11), 'crop=540:960:0:0,', '1dB'), ('c21', (3.66, 5.38), '', '1dB'),
       ('c22', (0.57, 3.23), 'crop=600:1067:120:0,', '4.5dB'), ('c22', (4.33, 7.6), '', '4.5dB'),
       ('c23', (0.79, 3.98), 'crop=540:960:180:0,', '2.5dB'), ('c23', (4.76, 7.04), '', '2.5dB'),
       ('c24', (1.34, 2.57), '', '3dB'), ('c24', (3.21, 5.33), '', '3dB'),
       ('c25', (0.8, 3.24), 'crop=600:1067:120:0,', '4.5dB'), ('c25', (4.41, 6.18), '', '4.5dB'), ('c25', (6.6, 7.49), '', '4.5dB'),
       ('c26', (0.64, 2.47), 'crop=540:960:180:0,', '-1.5dB'), ('c26', (3.17, 5.67), '', '-1.5dB'), ('c26', (5.96, 7.44), '', '-1.5dB'),
       ('r3', (1.0, 2.5), '', 0),
       ('c27', (0.82, 1.81), '', '-0.5dB'), ('c27', (3.32, 4.43), '', '-0.5dB'), ('c27', (4.97, 6.87), '', '-0.5dB'),
       ('c28', (0.8, 2.4), 'crop=600:1067:120:0,', '-0.5dB'), ('c28', (3.25, 5.57), '', '-0.5dB'),
       ('c29', (1.36, 3.71), '', '-2.5dB'), ('c29', (4.46, 5.91), '', '-2.5dB'),
       ('c30', (0.41, 1.84), 'crop=600:1067:120:0,', '3.5dB'), ('c30', (2.83, 5.39), '', '3.5dB'),
       ('c31', (1.07, 1.89), '', '3.5dB'), ('c31', (2.5, 3.46), '', '3.5dB'),
       ('c32', (1.18, 2.57), '', '3dB'), ('c32', (3.28, 4.65), '', '3dB'), ('c32', (4.92, 7.1), '', '3dB'),
       ('r4', (1.0, 2.5), '', 0),
       ('c33', (1.06, 2.05), '', '2dB'), ('c33', (3.0, 4.05), '', '2dB'), ('c33', (4.37, 5.67), '', '2dB'),
       ('r5', (1.0, 2.5), '', 0),
       ('BLACK', 0.4),
       ('c34', (0.49, 4.05), '', '-1dB'), ('c34', (4.63, 8.41), '', '-1dB')]

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
        if len(pre) > 2:  # J-cut: el audio entra en s; la imagen sigue J s en el plano anterior (desde su salida) y entra en s+J
            j = round(pre[2] * 24) / 24; pc, (ps, pe), *pp = EDL[i - 1]
            fj = (f"[0:v]{pp[0] if pp else ''}scale=720:1280,setsar=1,fps=24,trim=end_frame={round(j * 24)},setpts=PTS-STARTPTS[a0];"
                  f"[1:v]{vf},trim=end_frame={round((d - j) * 24)},setpts=PTS-STARTPTS[b0];[a0][b0]concat=n=2:v=1:a=0[v];[2:a]{af}[a]")
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{pe:.2f}", "-i", str(C / f"{pc}.mp4"), "-ss", f"{s + j:.2f}", "-i", str(src), "-ss", f"{s:.2f}", "-i", str(src),
                            "-filter_complex", fj, "-map", "[v]", "-map", "[a]", "-ac", "2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "pcm_s16le",
                            "-frames:v", str(round(d * 24)), str(p)], check=True)
        else: subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-i", str(src), "-vf", vf,
                        "-af", af, "-ac", "2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "pcm_s16le", "-frames:v", str(round(d * 24)), str(p)], check=True)
        STARTS.setdefault(cid, len(parts)); parts.append(p)
    lst = R / "list.txt"; lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    raw = R / "raw.mov"
    ins = [x for q in parts for x in ("-i", str(q))]
    fcat = "".join(f"[{k}:v]setpts=N/24/TB[v{k}];[{k}:a]asetpts=N/SR/TB[a{k}];" for k in range(len(parts))) + "".join(f"[v{k}][a{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[v][a]"
    if not (REMIX and raw.exists()): subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fcat, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(raw)], check=True)
    # marca VISTA STORIES (kit _marcas: 22 px, alpha 80, arriba al centro, y=135; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("old/c20_v1"), at("c33")  # suspenso 0-t1 (humillación, gardenia, bajón), cálida t1-t2 (llega Gilberto, el mole, la puerta del salón y el payoff), suspenso t2-fin (Leticia llama a Abel y CTA)
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
