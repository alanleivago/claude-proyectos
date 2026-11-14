"""Montaje de buen-hijo PARTE 2 (El Buen Hijo; copia del edit.py de recetario-p2: montaje por frases, renders/phr.json de phr.py). Marca de la Parte 1: MAJESTIC STORIES.
Uso: python -I edit.py  -> renders/v1.mp4; --remix -> renders/v3.mp4 (kit _marcas/MAJESTIC: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "MAJESTIC"  # misma marca que la Parte 1 (MAJESTIC STORIES, fuera de la rotación): música + marca de agua (arriba a la izq.) salen de pieces/_marcas/MAJESTIC
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

# v1 por frases (método aprobado de regreso-20/camionero/recetario-p2): rangos de renders/phr.json (python -I phr.py), entrada 0.08 s antes de la voz y salida
# 0.15 s después, cortes solo en fin de frase; mismo personaje = salto dentro del clip (c15->c16 y c23->c24 Aurelia); r1 mudo (ganancia 0) antes de c10;
# ('BLACK', 0.4) entre c28 y c29 (CTA). Formato: (cid, (ini, fin), crop, ganancia). Crops/arranques: los que diga qa_clips.md.
# Medido 2026-11-06: renders/phr.json (small, floor+14) + renders/lv3.json (large-v3 + envolvente floor+7, tramos de 50 ms revisados a mano en los arranques dudosos).
# Crops de borde en la 1.a frase de c03/c07/c08/c10/c12/c20/c28 y c26 (marco de puerta en el borde IZQ. 0-1.5 s del c26 regenerado); c24 >= 1.0; r1 mudo.
# c28 sale en 3.70 (no 3.24) para que el fundido a negro de 0.6 s caiga en silencio y no sobre "buscando". Ganancias por clip hacia ~-19.5 LUFS.
EDL = [('c01', (1.25, 4.63), '', '3dB'), ('c01', (4.95, 6.65), '', '3dB'), ('c01', (6.77, 9.01), '', '3dB'),
       ('c02', (0.94, 2.41), '', '3dB'), ('c02', (3.42, 6.43), '', '3dB'),
       ('c03', (1.05, 3.21), 'crop=580:1031:140:0,', '-2dB'), ('c03', (3.95, 4.77), '', '-2dB'), ('c03', (5.27, 7.76), '', '-2dB'),
       ('c04', (0.88, 3.37), '', '0dB'), ('c04', (4.37, 7.14), '', '0dB'),
       ('c05', (1.0, 1.56), '', '4dB'), ('c05', (3.46, 5.09), '', '4dB'), ('c05', (6.32, 7.83), '', '4dB'),
       ('c06', (0.82, 2.81), '', '1dB'), ('c06', (3.44, 4.97), '', '1dB'), ('c06', (5.41, 6.67), '', '1dB'),
       ('c07', (1.21, 2.94), 'crop=480:853:40:100,', '4dB'), ('c07', (4.42, 5.97), '', '4dB'),
       ('c08', (1.23, 3.16), 'crop=600:1067:120:0,', '-1.5dB'), ('c08', (4.21, 6.25), '', '-1.5dB'), ('c08', (6.91, 8.81), '', '-1.5dB'),
       ('c09', (0.86, 2.44), '', '1dB'), ('c09', (3.42, 4.74), '', '1dB'), ('c09', (5.69, 6.83), '', '1dB'),
       ('r1', (1.0, 2.5), '', 0),
       ('c10', (0.48, 1.9), 'crop=620:1102:100:0,', '2dB'), ('c10', (2.58, 5.55), '', '2dB'),
       ('c11', (1.18, 2.24), '', '1dB'), ('c11', (3.18, 4.75), '', '1dB'), ('c11', (4.97, 5.82), '', '1dB'),
       ('c12', (0.98, 1.87), 'crop=540:960:150:0,', '1dB'), ('c12', (2.72, 3.86), '', '1dB'),
       ('c13', (0.99, 2.55), '', '1dB'), ('c13', (3.03, 4.67), '', '1dB'), ('c13', (5.34, 7.14), '', '1dB'),
       ('c14', (0.73, 2.37), '', '-1dB'), ('c14', (3.43, 5.65), '', '-1dB'),
       ('c15', (0.82, 2.24), '', '-2dB'), ('c15', (2.86, 4.85), '', '-2dB'), ('c15', (5.04, 6.33), '', '-2dB'),
       ('c16', (1.02, 3.62), '', '0dB'), ('c16', (4.96, 7.1), '', '0dB'),
       ('c17', (0.22, 0.85), '', '3dB'), ('c17', (2.46, 4.22), '', '3dB'),
       ('c18', (1.09, 3.37), '', '1dB'), ('c18', (4.45, 6.54), '', '1dB'),
       ('c19', (0.56, 2.5), '', '3dB'), ('c19', (2.86, 5.53), '', '3dB'),
       ('c20', (0.6, 2.8), 'crop=600:1067:120:0,', '1dB'), ('c20', (3.39, 6.79), '', '1dB'),
       ('c21', (1.23, 3.08), '', '-1dB'), ('c21', (4.58, 6.19), '', '-1dB'),
       ('c22', (0.43, 2.62), '', '2dB'), ('c22', (3.44, 6.41), '', '2dB'),
       ('c23', (0.7, 3.41), '', '0dB'), ('c23', (4.42, 6.35), '', '0dB'),
       ('c24', (1.32, 2.29), '', '-1dB'), ('c24', (2.89, 5.09), '', '-1dB'),
       ('c25', (0.52, 1.39), '', '1dB'), ('c25', (2.24, 4.27), '', '1dB'), ('c25', (4.57, 5.43), '', '1dB'),
       ('c26', (0.73, 1.48), 'crop=620:1102:100:0,', '1dB'), ('c26', (2.63, 5.92), '', '1dB'),
       ('c27', (0.04, 1.12), '', '0dB'), ('c27', (1.4, 3.5), '', '0dB'), ('c27', (4.22, 6.9), '', '0dB'),
       ('c28', (1.37, 3.7), 'crop=600:1067:0:0,', '3dB'),
       ('BLACK', 0.4),
       ('c29', (0.44, 3.42), '', '0dB'), ('c29', (4.38, 7.78), '', '0dB')]

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
    # marca MAJESTIC STORIES (kit _marcas: 22 px, alpha 80, x=36, y=210, arriba a la izquierda; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c19"), at("c24")  # suspenso 0-t1 (la carta, el salón, la verdad), cálida t1-t2 (payoff: Román confiesa, el padre cede), suspenso t2-fin (doña Petra, gancho y CTA)
    tv = MUSIC_VOL * 2.4 * TENSION_GAIN
    out = R / ("v3.mp4" if REMIX else "v1.mp4")  # v2 = misma EDL, kit MAJESTIC con la tensión nueva (Orchestral Suspense Loop 1); v3 = además la cálida nueva (Contemplative String Loop, 839571)
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim={BC['tension2_from']}:{BC['tension2_from'] + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,lowpass=f=16000,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / ("mix_v3.wav" if REMIX else "mix.wav")
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
