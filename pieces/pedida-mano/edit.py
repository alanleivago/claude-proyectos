"""Montaje de pedida-mano PARTE 1 (La Pedida de Mano, video 24; copia del edit.py de gardenia: montaje por frases, renders/phr.json de phr.py).
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

# v1 por frases (método aprobado de gardenia): rangos de renders/phr.json (small, floor+14) confirmados con renders/lv3.json (large-v3 + envolvente floor+7).
# Entra 0.08 s antes de la voz y sale 0.15 s después, cortes solo en fin de frase; pausas que ahorran < 0.2 s no se cortan. Mismo personaje = salto dentro del clip.
# Formato: (cid, (ini, fin), pre, ganancia[, J]). qa_clips.md: hflip en c11/c12; crops de borde c13/c20/c21 en el primer tramo; arranques c05>=0.5, c09>=0.95,
# c28>=0.75, c33>=0.7, c34>=0.75; c01 "Quítela" desde 3.48 (envolvente desde 3.56) y c23 "Ay" desde 1.2 (envolvente desde 1.28). r1-r4 mudos (ganancia 0).
# Ganancias por clip hacia ~-19.5 LUFS. BLACK 0.4 s antes del CTA (c35). c26/c31/c35 regenerados (QA OK; old/ en clips/old).
EDL = [('c01', (1.02, 1.61), '', '-3dB'), ('c01', (1.87, 3.23), '', '-3dB'), ('c01', (3.48, 9.49), '', '-3dB'),
       ('c02', (0.53, 2.55), '', '3dB'), ('c02', (3.16, 5.6), '', '3dB'),
       ('c03', (0.59, 3.87), '', '1.5dB'), ('c03', (4.62, 7.41), '', '1.5dB'),
       ('c04', (0.67, 2.34), '', '-2dB'), ('c04', (3.1, 5.45), '', '-2dB'),
       ('c05', (0.64, 2.37), '', '-2dB'), ('c05', (3.45, 6.91), '', '-2dB'),
       ('c06', (1.34, 3.64), '', '4dB'), ('c06', (4.57, 6.38), '', '4dB'),
       ('c07', (0.54, 1.97), '', '-1.5dB'), ('c07', (2.55, 6.42), '', '-1.5dB'),
       ('c08', (0.79, 1.6), '', '0.5dB'), ('c08', (1.81, 4.01), '', '0.5dB'), ('c08', (4.56, 6.75), '', '0.5dB'),
       ('c09', (1.34, 2.24), '', '0.5dB'), ('c09', (3.04, 6.36), '', '0.5dB'),
       ('c10', (1.64, 3.78), '', '3dB'), ('c10', (4.46, 7.01), '', '3dB'),
       ('r1', (1.0, 2.5), '', 0),
       ('c11', (0.55, 1.77), 'hflip,', '3dB'), ('c11', (2.09, 3.67), 'hflip,', '3dB'), ('c11', (4.57, 6.59), 'hflip,', '3dB'),
       ('c12', (1.54, 3.59), 'hflip,', '2.5dB'), ('c12', (4.21, 6.29), 'hflip,', '2.5dB'),
       ('c13', (0.7, 3.68), 'crop=540:960:180:0,', '-1.5dB'), ('c13', (4.65, 5.54), '', '-1.5dB'), ('c13', (5.76, 6.67), '', '-1.5dB'),
       ('c14', (0.78, 2.84), '', '-1dB'), ('c14', (3.34, 5.14), '', '-1dB'),
       ('c15', (0.83, 3.32), '', '2dB'), ('c15', (3.79, 5.6), '', '2dB'),
       ('c16', (1.22, 2.96), '', '2.5dB'),
       ('c17', (0.6, 3.63), '', '0dB'), ('c17', (4.52, 7.09), '', '0dB'),
       ('c18', (0.49, 3.28), '', '2dB'), ('c18', (4.5, 5.29), '', '2dB'), ('c18', (5.52, 6.36), '', '2dB'),
       ('r2', (1.0, 2.5), '', 0),
       ('c19', (0.56, 1.97), '', '-1.5dB'), ('c19', (2.73, 5.4), '', '-1.5dB'),
       ('c20', (0.66, 2.23), 'crop=540:960:180:0,', '-2.5dB'), ('c20', (3.16, 5.56), '', '-2.5dB'),
       ('c21', (0.25, 1.09), 'crop=540:960:0:0,', '-1dB'), ('c21', (2.41, 5.59), '', '-1dB'),
       ('c22', (1.19, 3.11), '', '1.5dB'), ('c22', (4.21, 6.94), '', '1.5dB'),
       ('c23', (1.2, 4.53), '', '1.5dB'), ('c23', (4.82, 7.56), '', '1.5dB'),
       ('c24', (1.13, 2.51), '', '1.5dB'), ('c24', (3.41, 6.71), '', '1.5dB'),
       ('c25', (1.18, 3.89), '', '4dB'), ('c25', (4.41, 7.52), '', '4dB'),
       ('c26', (0.38, 2.47), '', '-2dB'), ('c26', (3.49, 6.09), '', '-2dB'),
       ('c27', (1.01, 2.02), '', '0.5dB'), ('c27', (2.63, 6.73), '', '0.5dB'),
       ('c28', (1.22, 3.02), '', '1.5dB'), ('c28', (4.5, 6.01), '', '1.5dB'),
       ('c29', (0.71, 2.58), '', '1.5dB'), ('c29', (3.79, 6.75), '', '1.5dB'),
       ('c30', (1.75, 3.17), '', '1dB'), ('c30', (4.03, 7.02), '', '1dB'),
       ('r3', (1.0, 2.5), '', 0),
       ('c31', (0.62, 2.2), '', '0dB'), ('c31', (2.64, 3.77), '', '0dB'),
       ('c32', (1.16, 3.14), '', '2dB'), ('c32', (4.41, 7.18), '', '2dB'),
       ('c33', (0.7, 2.04), '', '6dB'), ('c33', (3.56, 6.39), '', '6dB'),
       ('c34', (0.87, 1.87), '', '3.5dB'), ('c34', (2.45, 5.59), '', '3.5dB'),
       ('r4', (1.0, 2.5), '', 0),
       ('BLACK', 0.4),
       ('c35', (0.78, 2.56), '', '-1.5dB'), ('c35', (2.88, 5.26), '', '-1.5dB'), ('c35', (5.62, 7.77), '', '-1.5dB'), ('c35', (8.33, 9.52), '', '-1.5dB')]

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
    # marca MAJESTIC STORIES (kit _marcas: 22 px, alpha 80, arriba a la izquierda, x=36, y=210; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c19"), at("c33")  # suspenso 0-t1 (estacionamiento, la llamada, el comedor), cálida t1-t2 (llega Lorenzo, el giro y el payoff), suspenso t2-fin (Beatriz y Lorenzo se conocían, y CTA)
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
