"""Montaje de recetario PARTE 2 (El Recetario; copia del edit.py de camionero: montaje por frases, renders/phr.json de phr.py). Marca de la Parte 1: MEXI STORIES.
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/MEXI: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "MEXI"  # misma marca que la Parte 1 (MEXI STORIES, fuera de la rotación): música + marca de agua (arriba a la der.) salen de pieces/_marcas/MEXI
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

# v1 por frases (método aprobado de regreso-20/camionero): rangos de renders/phr.json (python -I phr.py), entrada 0.08 s antes de la voz y salida 0.15 s después,
# cortes solo en fin de frase; mismo personaje = salto dentro del clip; r1 mudo (ganancia 0); ('BLACK', 0.4) entre c29 y c30 (CTA). Formato: (cid, (ini, fin), crop, ganancia).
# 2026-11-06: c01 y c20 regenerados ("fue" claro; "Mireya…" presente). Rangos de la envolvente de voz (floor+14, bordes extendidos a floor+6), cada segmento confirmado con large-v3.
# QA: crops c18 600:1067:120:0, c22 576:1024:0:70, c24 560:996:0:0, c25 540:960:0:100 en su 1.ª frase; c02 desde 0.98 (>=0.5), c04 desde 0.87 (>=0.75), c08 y c29 arrancan
# después del borde (sin crop); r1 2.0-3.5 mudo. Ganancias por clip hacia ~-19.5 LUFS.
EDL = [('c01', (0.27, 2.87), '', '-2dB'), ('c01', (3.22, 6.43), '', '-2dB'), ('c01', (7.43, 9.61), '', '-2dB'), ('c02', (0.98, 2.46), '', '3dB'),
       ('c02', (4.36, 5.86), '', '3dB'), ('c02', (5.91, 7.5), '', '3dB'), ('c03', (1.25, 3.19), '', '0dB'), ('c03', (3.99, 5.66), '', '0dB'),
       ('c03', (6.16, 7.59), '', '0dB'), ('c04', (0.87, 3.98), '', '-2dB'), ('c04', (4.56, 7.16), '', '-2dB'), ('c05', (0.52, 1.31), '', '3dB'),
       ('c05', (1.95, 4.16), '', '3dB'), ('c06', (1.48, 2.93), '', '2dB'), ('c06', (3.8, 5.26), '', '2dB'), ('c07', (1.35, 3.4), '', '2dB'),
       ('c07', (4.03, 5.91), '', '2dB'), ('c08', (1.01, 3.64), '', '0dB'), ('c08', (4.21, 6.36), '', '0dB'), ('c09', (0.66, 3.67), '', '3dB'),
       ('c09', (4.07, 5.6), '', '3dB'), ('c10', (1.04, 4.44), '', '1dB'), ('c10', (5.25, 6.94), '', '1dB'), ('c11', (1.86, 3.04), '', '4dB'),
       ('c12', (1.01, 2.66), '', '1dB'), ('c12', (3.58, 6.63), '', '1dB'), ('r1', (2.0, 3.5), '', 0), ('c13', (1.09, 3.64), '', '1dB'),
       ('r1', (2.0, 3.5), '', 0), ('c13', (4.99, 6.47), '', '1dB'), ('c14', (0.63, 3.3), '', '2dB'), ('c14', (4.23, 6.0), '', '2dB'),
       ('c15', (1.17, 4.0), '', '2dB'), ('c15', (5.04, 6.69), '', '2dB'), ('c16', (0.16, 2.54), '', '1dB'), ('c16', (3.41, 6.11), '', '1dB'),
       ('c17', (0.77, 2.71), '', '-1dB'), ('c17', (3.39, 6.74), '', '-1dB'), ('c18', (1.68, 3.55), 'crop=600:1067:120:0,', '1dB'), ('c19', (1.12, 2.24), '', '1dB'),
       ('c19', (2.9, 5.21), '', '1dB'), ('c20', (1.72, 4.81), '', '0dB'), ('c20', (5.29, 7.35), '', '0dB'), ('c21', (0.53, 1.93), '', '1dB'),
       ('c21', (3.59, 4.74), '', '1dB'), ('c21', (5.7, 6.9), '', '1dB'), ('c22', (0.61, 2.22), 'crop=576:1024:0:70,', '1dB'), ('c22', (3.02, 5.92), '', '1dB'),
       ('c23', (1.04, 2.35), '', '3dB'), ('c23', (3.19, 6.31), '', '3dB'), ('c24', (0.31, 2.52), 'crop=560:996:0:0,', '2dB'), ('c24', (3.55, 5.98), '', '2dB'),
       ('c25', (0.58, 2.72), 'crop=540:960:0:100,', '0dB'), ('c25', (3.51, 4.35), '', '0dB'), ('c25', (4.63, 6.84), '', '0dB'), ('c26', (2.39, 3.71), '', '3dB'),
       ('c26', (3.99, 5.7), '', '3dB'), ('c27', (0.98, 2.37), '', '-1dB'), ('c27', (3.25, 6.33), '', '-1dB'), ('c28', (0.74, 2.12), '', '4dB'),
       ('c28', (3.41, 4.59), '', '4dB'), ('c28', (5.08, 7.04), '', '4dB'), ('c29', (1.2, 2.44), '', '2dB'), ('c29', (2.54, 5.09), '', '2dB'),
       ('BLACK', 0.4), ('c30', (0.69, 4.57), '', '-2dB'), ('BLACK', 0.4), ('c30', (5.55, 8.77), '', '-2dB')]

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
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-i", str(src), "-vf", vf,
                        "-af", af, "-ac", "2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "pcm_s16le", "-frames:v", str(round(d * 24)), str(p)], check=True)
        STARTS.setdefault(cid, len(parts)); parts.append(p)
    lst = R / "list.txt"; lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    raw = R / "raw.mov"
    ins = [x for q in parts for x in ("-i", str(q))]
    fcat = "".join(f"[{k}:v]setpts=N/24/TB[v{k}];[{k}:a]asetpts=N/SR/TB[a{k}];" for k in range(len(parts))) + "".join(f"[v{k}][a{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[v][a]"
    if not (REMIX and raw.exists()): subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fcat, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(raw)], check=True)
    # marca MEXI STORIES (kit _marcas: 22 px, alpha 80, y=210, arriba a la derecha; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c20"), at("c26")  # suspenso 0-t1 (oficina, cocina, cafetería), cálida t1-t2 (lanzamiento y la libreta de vuelta), suspenso t2-fin (falta una página, gancho y CTA)
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
