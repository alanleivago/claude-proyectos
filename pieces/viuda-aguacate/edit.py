"""Montaje de viuda-aguacate PARTE 1 (La Viuda del Aguacate; copia del edit.py de fonda-chela: montaje por frases desde renders/lv3.json).
Uso: python -I edit.py  -> renders/share.mp4 (kit _marcas/MEXI: música y marca de agua de la marca; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "MEXI"  # MEXI STORIES: arriba a la derecha (margen 36, y=210), alfa 80; música de pieces/_marcas/MEXI
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

# v1 por frases (método aprobado, plantilla fonda-chela/monedas-carretera): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7).
# Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase. Mismo personaje = salto dentro del clip.
# qa_clips.md: crops de borde c05 c06 c09 (rebozo gris ajeno abajo DER. hasta 1.5, visto en v1) c18 c24 c25 (figura blanca IZQ. hasta 1.1) c26 c27 c30 (solo mientras dura el borde; c24 nuevo: sombrero doble arriba DER. hasta ~2.1 s, crop en toda la 1.ª frase);
# arranques c01 c04 c08 c09 c11 c23 c25 c31 c32; c03 sale en 5.50 (sin "doña Ingracia"); insertos solo en sus tramos útiles (i05 3.0-6.0, i06 llegada y escoltas).
# c24 regenerado: "Soy Nicandro Solórzano. | Licenciado, | usted me firmó unos papeles en Zamora." (saltos en las pausas).
# r*/i* mudos (ganancia 0) salvo i02 e i06 (foley real, -8 dB). Ganancia por clip = -19.5 - LUFS (ebur128, 0.5 dB). BLACK 0.4 s antes del CTA (c36).
# 5.º campo = cambios de encuadre dentro del tramo SIN cortar el audio: [(t_fuente, vf), ...]; vf puede ser (clip, t_inicio, vf) = inserto/reacción encima de la voz.
# Ritmo: punch-in 1.25x en frases > 2.5 s; ningún plano > 3 s.
PUNCH = "crop=576:1024:72:40,"
EL = "crop=540:960:0:0,"
EDL = [('i01', (4.60, 5.70), '', 0),
       ('c01', (1.49, 3.50), '', '2.5dB'), ('c01', (5.09, 6.84), '', '2.5dB'),
       ('i02', (2.00, 3.40), '', '-8dB'),
       ('c02', (0.20, 2.18), '', '2.5dB'), ('c02', (3.03, 4.91), '', '2.5dB'),
       ('c03', (0.50, 2.56), '', '6dB'), ('c03', (3.68, 5.50), '', '6dB'),
       ('r1', (3.00, 4.10), '', 0),
       ('c04', (1.02, 3.70), '', '0dB', [(2.40, PUNCH)]), ('c04', (4.48, 6.09), '', '0dB'),
       ('c05', (0.90, 3.13), 'crop=540:960:180:0,', '3dB', [(1.25, '')]), ('c05', (3.76, 5.16), '', '3dB'),
       ('c06', (0.58, 2.02), EL, '3dB', [(0.90, '')]), ('c06', (2.63, 4.01), '', '3dB'),
       ('c07', (0.45, 2.35), '', '2dB'), ('c07', (3.50, 5.07), '', '2dB'),
       ('c08', (0.74, 2.66), '', '4.5dB'), ('c08', (3.49, 5.12), '', '4.5dB'),
       ('c09', (0.75, 3.46), EL, '-0.5dB', [(1.50, ''), (2.10, PUNCH)]), ('c09', (4.44, 5.87), '', '-0.5dB'),
       ('c10', (0.62, 2.05), '', '-1.5dB'), ('c10', (2.54, 4.19), '', '-1.5dB'),
       ('r2', (4.00, 5.00), '', 0),
       ('c11', (1.21, 3.21), '', '0.5dB'), ('c11', (3.68, 5.15), '', '0.5dB'),
       ('c12', (0.32, 2.64), '', '2dB'), ('c12', (3.36, 5.20), '', '2dB'),
       ('i03', (4.40, 5.70), '', 0),
       ('c13', (0.75, 3.42), '', '2dB', [(1.90, PUNCH)]), ('c13', (3.89, 5.51), '', '2dB'),
       ('c14', (0.72, 2.68), '', '-0.5dB'), ('c14', (3.49, 4.91), '', '-0.5dB'),
       ('i04', (1.20, 2.50), '', 0),
       ('c15', (0.98, 2.82), '', '5dB'), ('c15', (3.50, 6.63), '', '5dB', [(5.00, PUNCH)]),
       ('c16', (0.77, 3.38), '', '1.5dB', [(2.10, PUNCH)]), ('c16', (4.15, 6.00), '', '1.5dB'),
       ('i05', (3.40, 4.60), '', 0),
       ('c17', (0.53, 1.84), '', '0dB'), ('c17', (2.79, 3.81), '', '0dB'),
       ('c18', (0.75, 2.43), EL, '-2.5dB', [(1.00, '')]), ('c18', (3.36, 4.61), '', '-2.5dB'),
       ('c19', (0.85, 3.09), '', '3dB'), ('c19', (3.66, 5.15), '', '3dB'),
       ('c20', (0.48, 2.47), '', '-0.5dB'), ('c20', (3.20, 4.77), '', '-0.5dB'),
       ('i06', (2.00, 3.30), '', '-8dB'),
       ('c21', (0.76, 3.16), '', '5dB'), ('c21', (3.88, 5.53), '', '5dB'),
       ('i06', (4.10, 5.10), '', '-8dB'),
       ('i07', (4.70, 5.80), '', 0),
       ('c22', (0.99, 2.42), '', '0dB'), ('c22', (3.02, 5.13), '', '0dB'),
       ('c23', (0.45, 1.80), '', '5dB'), ('c23', (3.07, 4.74), '', '5dB'),
       ('c24', (0.10, 2.54), EL, '3.5dB'), ('c24', (3.09, 4.26), '', '3.5dB'), ('c24', (4.95, 7.32), '', '3.5dB'),
       ('r3', (3.30, 4.60), '', 0),
       ('c25', (0.70, 2.36), 'crop=540:960:180:0,', '0dB', [(1.10, '')]), ('c25', (3.20, 5.58), '', '0dB'),
       ('c26', (0.79, 2.60), 'crop=540:960:90:0,', '3.5dB', [(0.90, '')]), ('c26', (3.41, 5.44), '', '3.5dB'),
       ('c27', (0.61, 2.24), EL, '4dB', [(1.00, '')]), ('c27', (2.94, 4.79), '', '4dB'),
       ('c28', (1.30, 3.54), '', '-3.5dB'), ('c28', (4.48, 6.59), '', '-3.5dB'),
       ('c29', (0.51, 2.71), '', '1dB'), ('c29', (4.06, 5.81), '', '1dB'),
       ('r4', (3.50, 4.70), '', 0),
       ('c30', (0.73, 2.35), EL, '0dB', [(0.90, '')]), ('c30', (2.97, 5.05), '', '0dB'),
       ('r5', (3.00, 4.30), '', 0),
       ('c31', (1.20, 3.07), '', '4dB'), ('c31', (4.08, 6.84), '', '4dB', [(5.50, PUNCH)]),
       ('c32', (0.65, 2.13), '', '5.5dB'), ('c32', (3.22, 5.26), '', '5.5dB'),
       ('c33', (0.40, 1.87), '', '0dB'), ('c33', (2.20, 3.36), '', '0dB'),
       ('c34', (0.56, 3.15), '', '7.5dB', [(1.90, PUNCH)]), ('c34', (4.06, 5.71), '', '7.5dB'),
       ('c35', (1.24, 3.75), '', '3.5dB', [(2.60, PUNCH)]), ('c35', (4.96, 6.40), '', '3.5dB'),
       ('BLACK', 0.4),
       ('c36', (0.32, 4.17), '', '-2dB', [(2.40, PUNCH)]), ('c36', (5.11, 8.77), '', '-2dB', [(6.60, PUNCH)])]

def main():
    if not EDL: sys.exit("EDL vacía: correr phr.py y armarla con renders/phr.json")
    L = {}  # v1: EDL por rangos medidos (renders/lv3.json)
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
        tail = "tpad=stop_mode=clone:stop_duration=0.5" + (f",fade=t=out:st={d - 0.6:.2f}:d=0.6" if fade else "")
        sw = pre[2] if len(pre) > 2 else []
        if sw or isinstance(pre[0], tuple):  # cambio de encuadre sin cortar el audio: un trim por tramo y concat; (clip, t, vf) = inserto encima de la voz
            bs = [0] + [round((t - s) * 24) / 24 for t, _ in sw] + [d + 0.5]; vfs = [pre[0]] + [v for _, v in sw]; k = len(vfs)
            loc = [j for j in range(k) if not isinstance(vfs[j], tuple)]; xin = []; fc = ""
            if loc: fc = f"[0:v]split={len(loc)}" + "".join(f"[s{j}]" for j in loc) + ";"
            for j in range(k):
                if isinstance(vfs[j], tuple):
                    c2, t2, v2 = vfs[j]; n = 1 + len(xin) // 4; xin += ["-ss", f"{t2:.2f}", "-i", str(C / f"{c2}.mp4")]
                    fc += f"[{n}:v]trim=start=0:end={bs[j + 1] - bs[j]:.5f},setpts=PTS-STARTPTS,{v2}scale=720:1280,setsar=1,fps=24[o{j}];"
                else: fc += f"[s{j}]trim=start={bs[j]:.5f}:end={bs[j + 1]:.5f},setpts=PTS-STARTPTS,{vfs[j]}scale=720:1280,setsar=1,fps=24[o{j}];"
            fc += "".join(f"[o{j}]" for j in range(k)) + f"concat=n={k}:v=1:a=0,{tail}[v]"
            vargs = [*xin, "-filter_complex", fc, "-map", "[v]", "-map", "0:a"]
        else: vargs = ["-vf", (pre[0] if pre else "") + "scale=720:1280,setsar=1,fps=24," + tail]
        af = (f"volume={pre[1]}," if len(pre) > 1 else "") + f"aresample=48000,apad,atrim=0:{d:.5f},afade=t=in:d=0.04,afade=t=out:st={d - (0.6 if fade else 0.06):.2f}:d={0.6 if fade else 0.06}"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-i", str(src), *vargs,
                        "-af", af, "-ac", "2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "pcm_s16le", "-frames:v", str(round(d * 24)), str(p)], check=True)
        STARTS.setdefault(cid, len(parts)); parts.append(p)
    lst = R / "list.txt"; lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    raw = R / "raw.mov"
    ins = [x for q in parts for x in ("-i", str(q))]
    fcat = "".join(f"[{k}:v]setpts=N/24/TB[v{k}];[{k}:a]asetpts=N/SR/TB[a{k}];" for k in range(len(parts))) + "".join(f"[v{k}][a{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[v][a]"
    if not (REMIX and raw.exists()): subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fcat, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(raw)], check=True)
    # MEXI (kit _marcas: marca de agua y música de la marca; sin CONTINUARÁ)
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    # duración real del plano = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corre las camas)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c27"), at("c30")  # suspenso 0-t1 (candado, oferta, ropero, convoy, llegada), cálida t1-t2 (Engracia y la promesa a Lauro), suspenso t2-fin (plazo, el comprador es Arnulfo, CTA)
    tv = MUSIC_VOL * 2.4
    out = R / "share.mp4"
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
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"  # wm.png de brand_wm ya trae la marca en su posición
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "2:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    n = sum(1 + len(e[4]) if len(e) > 4 else 1 for e in EDL if e[0] != "BLACK")
    print(out, f"{dur:.1f}s", len(parts), "tramos", n, "planos", f"{(dur - 0.4) / n:.2f} s/plano")

if __name__ == "__main__":
    main()
