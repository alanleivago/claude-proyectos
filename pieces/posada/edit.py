"""Montaje de posada PARTE 1 (La Posada del Mercado; copia de regreso-20: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/MEXI: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs (la cálida va x2.0: con 0.13 quedaba 1.7 dB bajo la tensión y con los grillos de c16-c20 no se oía, earshot Music 0.39)
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "MEXI"  # música + marca de agua salen de pieces/_marcas/MEXI (arriba a la derecha)
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

# v1 por frases (método de regreso-20): rangos de renders/phr.json + envolvente de voz (RMS 10 ms), confirmados con faster-whisper large-v3: entra 0.08 s antes
# de la voz y sale 0.15 s después, cortes solo en fin de frase; mismo personaje = salto dentro del clip. QA (qa_clips.md): mudos r*/i* (ganancia 0), r3 bajo como
# ambiente; c11 desde 1.1, c13b desde 0.8 (en la frase), r3 desde 1.5, r5 desde 2.2, c22 hasta 3.42 (valle de RMS entre los dos "Herminia"; en 3.22 cortaba la última sílaba), i1 hasta el final (apagón ~5.5), i3 3.6-5.2 (se encienden a ~4.0). Insertos mudos 1.2-1.6 s para el ritmo.
# Regenerados v2: r2 desde 2.0 s (antes se ven foquitos prendidos arriba); c07/c16/c21/c23 con punch-in (crop) en la 1.ª frase para sacar la figura oscura
# del borde (0-1.4 s en c16, 0-2.3 s en c21/c23, astilla 0-0.55 s en c07); c16 nuevo no dice "Y este pueblo también": esa frase sale de clips/old/c16_v1 (4.13-5.97,
# figura ya fuera desde 3.5 s). c17 zoom 1.15 abajo-izq. (saca los foquitos de arriba a la der.). Ganancias por clip hacia -18 LUFS.
Z = lambda w, h, x, y: f"crop={w}:{h}:{x}:{y},"
EDL = [('c01', (0.64, 2.13)), ('c01', (2.75, 4.54)), ('c01', (5.56, 7.68)), ('r1', (1.0, 2.2), '', 0),
       ('c02', (0.19, 2.94)), ('c02', (3.32, 5.22)), ('c02', (5.37, 7.99)),
       ('c03', (0.06, 2.13), '', '-3dB'), ('c03', (2.71, 4.21), '', '-3dB'), ('c03', (4.39, 7.77), '', '-3dB'),
       ('c04', (0.44, 3.60)), ('c04', (4.44, 6.21)), ('c04', (6.71, 7.90)), ('c05', (1.09, 3.60)), ('c05', (4.05, 5.77)),
       ('c06', (0.15, 2.96), '', '-2dB'), ('c06', (3.40, 5.80), '', '-2dB'), ('c06', (5.94, 7.87), '', '-2dB'),
       ('c07', (0.41, 2.06), Z(662, 1178, 58, 51)), ('c07', (2.91, 5.55)), ('i1', (4.6, 6.0), '', 0), ('r2', (2.0, 3.3), '', 0),
       ('c08', (0.58, 1.46), '', '4dB'), ('c08', (1.90, 3.16), '', '4dB'), ('c08', (4.27, 5.46), '', '4dB'),
       ('c09', (1.06, 2.47)), ('c09', (2.74, 4.95)), ('c09', (5.24, 7.61)), ('r3', (1.5, 2.9), '', 0.6),
       ('c10', (0.79, 2.65), '', '1dB'), ('c10', (3.32, 4.58), '', '1dB'), ('c10', (4.68, 6.55), '', '1dB'), ('c10', (6.85, 7.85), '', '1dB'),
       ('c11', (1.10, 2.75)), ('c11', (3.25, 4.79)), ('c12', (1.06, 3.69), '', '5dB'), ('c12', (4.53, 5.96), '', '5dB'), ('c12', (6.23, 7.60), '', '5dB'),
       ('c13', (0.97, 2.07)), ('c13', (2.54, 4.24)), ('c13', (4.79, 7.45)), ('c13b', (1.19, 5.85)),
       ('c14', (1.09, 2.13)), ('c14', (2.57, 5.44)), ('c15', (1.07, 3.54)), ('c15', (4.45, 7.73)), ('i2', (1.0, 2.3), '', 0), ('r4', (1.2, 2.5), '', 0),
       ('c16', (0.09, 2.02), Z(562, 998, 0, 128)), ('c16', (2.65, 4.70)), ('old/c16_v1', (4.13, 5.97), '', '1.5dB'),
       ('c17', (0.67, 2.98), Z(626, 1113, 0, 167)), ('c17', (3.49, 5.61), Z(626, 1113, 0, 167)), ('c17', (5.92, 7.58), Z(626, 1113, 0, 167)),
       ('c18', (0.27, 1.92), '', '4dB'), ('c18', (3.46, 4.40), '', '4dB'), ('i3', (3.6, 5.2), '', 0), ('r5', (2.2, 3.5), '', 0),
       ('c19', (1.20, 4.34), '', '-2dB'), ('c19', (4.98, 7.68), '', '-2dB'),
       ('c20', (0.49, 2.60), '', '2dB'), ('c20', (3.07, 6.38), '', '2dB'), ('c20', (6.54, 7.96), '', '2dB'), ('i4', (1.0, 2.3), '', 0),
       ('c21', (0.49, 1.05), Z(504, 896, 0, 154), '-2dB'), ('c21', (1.19, 2.49), Z(562, 998, 0, 128), '-2dB'), ('c21', (2.91, 6.38), '', '-2dB'), ('c21', (6.62, 7.71), '', '-2dB'),
       ('c22', (0.30, 3.42), '', '-2dB'),
       ('c23', (0.40, 1.15), Z(504, 896, 0, 154), '2dB'), ('c23', (1.64, 4.12), Z(612, 1088, 0, 96), '2dB'), ('c23', (4.58, 7.72), '', '2dB'),
       ('r6', (1.0, 2.2), '', 0), ('r7', (1.2, 2.6), '', 0), ('c24', (1.60, 2.84), '', '5dB'), ('c24', (3.99, 7.84), '', '5dB'), ('BLACK', 0.4),
       ('c25', (0.42, 3.46), '', '-2dB'), ('c25', (3.74, 8.00), '', '-2dB')]

def main():
    if not EDL: sys.exit("EDL vacía: correr phr.py y armarla con renders/phr.json")
    L = {}  # frases por clip (solo para entradas por índice del borrador)
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
    # marca MEXI STORIES (kit _marcas: 22 px, alpha 80, arriba a la derecha; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c16"), at("c21")  # suspenso 0-t1 (Bruno corre la posada, apaga las luces, la carpeta), cálida t1-t2 (las luces vuelven, pidiendo posada, ponche), suspenso t2-fin (el aparte, Bruno bajo el nacimiento y CTA)
    tv = MUSIC_VOL * 2.4
    out = R / "v1.mp4"
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL * 2.0:.3f},adelay={int(t1 * 1000)}:all=1[m1];"
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
    tc = at("c24") if "c24" in STARTS else dur
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "2:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
