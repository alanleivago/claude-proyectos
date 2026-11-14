"""Montaje de camionero PARTE 2 (El Camionero; copia del edit.py de buen-hijo-p2: montaje por frases, renders/phr.json de phr.py). Marca de la Parte 1: MEXI STORIES.
Uso: python -I edit.py  -> renders/v1.mp4; --remix -> renders/v2.mp4 (kit _marcas/MEXI: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "MEXI"  # misma marca que la Parte 1 (MEXI STORIES, fuera de la rotación): música + marca de agua (arriba a la der.) salen de pieces/_marcas/MEXI
REMIX = "--remix" in sys.argv
TENSION_GAIN = 1.0  # ajuste de la cama de tensión para que tenga la presencia de la de VISTA (gardenia v1)

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

# v1 por frases (método aprobado de pedida-mano): rangos de renders/phr.json (small, floor+14) confirmados con renders/lv3.json (large-v3 + envolvente floor+7).
# Entra 0.08 s antes de la voz y sale 0.15 s después, cortes solo en fin de frase; pausas que ahorran < 0.2 s no se cortan (c24). Mismo personaje = salto dentro del clip.
# Formato: (cid, (ini, fin), pre, ganancia[, (clip_tapa, ini_tapa, s)]). qa_clips.md: c06 desde >= 0.4 (entra 1.41); c09 (0.74) y c11 (0.69) entran después del borde
# (0-0.3 / 0-0.5), sin crop; c16 regenerado sin borde. i1 1.0-2.5 (monitor pequeño, placa ilegible) y r1 mudos (ganancia 0). Ganancias por clip hacia ~-19.5 LUFS.
# c27 regenerado: se quita el 2.º "de las" (5.95-6.23) y "cámaras" va tapado con la reacción muda de Leonor (c28 0.8-1.47, ojos muy abiertos, boca quieta; empalma casi continuo con c28 1.54). BLACK 0.4 s antes del CTA (c29).
EDL = [('c01', (0.45, 7.18), '', '2.5dB'),
       ('c01', (8.46, 9.32), '', '2.5dB'),
       ('c02', (1.29, 2.49), '', '-1dB'),
       ('c02', (3.17, 3.75), '', '-1dB'),
       ('c02', (4.63, 7.39), '', '-1dB'),
       ('c03', (1.49, 3.75), '', '1.5dB'),
       ('c03', (5.43, 7.51), '', '1.5dB'),
       ('c04', (0.22, 7.7), '', '-1dB'),
       ('c05', (0.82, 2.21), '', '-1dB'),
       ('c05', (3.37, 6.67), '', '-1dB'),
       ('c06', (1.41, 2.12), '', '-6dB'),
       ('c06', (2.62, 4.76), '', '-6dB'),
       ('c07', (0.92, 4.34), '', '-1dB'),
       ('c07', (5.51, 7.65), '', '-1dB'),
       ('c08', (0.58, 3.71), '', '-0.5dB'),
       ('c08', (4.4, 7.31), '', '-0.5dB'),
       ('i1', (1.0, 2.5), '', 0),
       ('c09', (0.74, 2.3), '', '6dB'),
       ('c09', (3.26, 5.38), '', '6dB'),
       ('c10', (1.14, 6.96), '', '2.5dB'),
       ('c11', (0.69, 2.33), '', '2.5dB'),
       ('c11', (3.02, 5.53), '', '2.5dB'),
       ('r1', (1.0, 2.5), '', 0),
       ('c12', (0.75, 2.44), '', '-2.5dB'),
       ('c12', (3.6, 5.23), '', '-2.5dB'),
       ('c13', (2.05, 3.69), '', '2dB'),
       ('c13', (4.47, 7.62), '', '2dB'),
       ('c14', (0.59, 2.31), '', '1.5dB'),
       ('c14', (3.04, 6.42), '', '1.5dB'),
       ('c15', (1.32, 2.6), '', '0.5dB'),
       ('c15', (3.56, 6.92), '', '0.5dB'),
       ('c16', (1.19, 4.5), '', '0.5dB'),
       ('c16', (5.12, 7.1), '', '0.5dB'),
       ('c17', (1.16, 2.71), '', '-2dB'),
       ('c17', (3.62, 5.0), '', '-2dB'),
       ('c18', (0.51, 2.49), '', '-0.5dB'),
       ('c18', (3.46, 4.13), '', '-0.5dB'),
       ('c19', (1.1, 3.44), '', '-2dB'),
       ('c19', (4.55, 7.94), '', '-2dB'),
       ('c20', (0.9, 3.32), '', '1dB'),
       ('c20', (5.13, 6.86), '', '1dB'),
       ('c21', (0.59, 2.77), '', '1dB'),
       ('c21', (3.82, 5.85), '', '1dB'),
       ('c22', (0.65, 1.2), '', '5dB'),
       ('c22', (2.58, 3.63), '', '5dB'),
       ('c22', (4.22, 4.97), '', '5dB'),
       ('c23', (1.03, 2.65), '', '1.5dB'),
       ('c23', (3.59, 6.39), '', '1.5dB'),
       ('c24', (0.67, 4.14), '', '-0.5dB'),
       ('c24', (4.65, 6.47), '', '-0.5dB'),
       ('c25', (0.36, 3.73), '', '2dB'),
       ('c25', (4.62, 6.49), '', '2dB'),
       ('c26', (0.86, 2.31), '', '-3.5dB'),
       ('c26', (3.41, 4.53), '', '-3.5dB'),
       ('c27', (1.03, 2.66), '', '2.5dB'),
       ('c27', (3.48, 5.95), '', '2.5dB'), ('c27', (6.23, 6.9), '', '2.5dB', ('c28', 0.8, 0.67)),
       ('c28', (1.54, 2.22), '', '2.5dB'),
       ('c28', (3.42, 4.27), '', '2.5dB'),
       ('BLACK', 0.4),
       ('c29', (0.32, 5.78), '', '-3.5dB'),
       ('c29', (6.62, 8.9), '', '-3.5dB')]

def main():
    if not EDL: sys.exit("EDL vacía: correr phr.py y armarla con renders/phr.json")
    L = {}  # v1: EDL por rangos medidos (renders/phr.json)
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
        if len(pre) > 2:  # tapa: los primeros k s de imagen salen de otro clip (cc desde cs, mudo); el audio sigue siendo el de este plano (salto de voz tapado)
            cc, cs, k = pre[2]; k = round(k * 24) / 24
            fj = (f"[0:v]scale=720:1280,setsar=1,fps=24,tpad=stop_mode=clone:stop_duration=0.5,trim=end_frame={round(min(k, d) * 24)},setpts=PTS-STARTPTS[a0];"
                  + (f"[1:v]{vf},trim=end_frame={round((d - k) * 24)},setpts=PTS-STARTPTS[b0];[a0][b0]concat=n=2:v=1:a=0[v];" if round((d - k) * 24) > 0 else "[a0]null[v];") + f"[2:a]{af}[a]")
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{cs:.2f}", "-i", str(C / f"{cc}.mp4"), "-ss", f"{s + k:.2f}", "-i", str(src), "-ss", f"{s:.2f}", "-i", str(src),
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
    # marca MEXI STORIES (kit _marcas: 22 px, alpha 80, margen 36, y=210, arriba a la derecha; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c21"), at("c27")  # suspenso 0-t1 (el nombre, monitores, Iván confiesa), cálida t1-t2 (payoff: Iván fuera, Teófilo jefe de andén), suspenso t2-fin (Arturo, gancho y CTA)
    tv = MUSIC_VOL * 2.4 * TENSION_GAIN
    out = R / ("v2.mp4" if REMIX else "v1.mp4")  # v2 = misma EDL, otra mezcla del kit MEXI
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim={BC['tension2_from']}:{BC['tension2_from'] + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,lowpass=f=16000,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / ("mix_v2.wav" if REMIX else "mix.wav")
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
