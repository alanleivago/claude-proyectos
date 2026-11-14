"""Montaje de fonda-chela-p2 PARTE 2 (El Jefe Nuevo; copia del edit.py de viuda-aguacate: montaje por frases desde renders/lv3.json).
Uso: python -I edit.py  -> renders/share.mp4 (kit _marcas/VISTA: música y marca de agua de la marca; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "VISTA"  # VISTA STORIES (misma marca que la Parte 1): arriba al centro, y=135, alfa 80; música de pieces/_marcas/VISTA
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

# v1 por frases (plantilla viuda-aguacate): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7), entra 0.08 s antes y sale 0.15 s después.
# Cortes solo en fin de frase; mismo personaje = salto dentro del clip por el silencio medido. qa_clips.md: crops de borde c01 c03 c06 c11 c16 c23 c26 c30 (solo mientras dura el borde);
# c18: 'Tía.' va de 0.1 a 1.17 (whisper lo corría a 1.3) -> tres saltos; c23 crop en toda la 1.ª frase y c27 crop entero (revisión API v1).
# c27 sale en 3.58 (Omni repite "atiendo primero"); r1/r5 tomados después de que se va la figura del borde; i06 solo el reloj (1.55-2.90, el resto son otras personas).
# r*/i* mudos (ganancia 0) salvo i07 (campanas reales, -6 dB). Ganancia por clip = -19.5 - LUFS (ebur128, 0.5 dB). BLACK 0.4 s antes del CTA (c34).
# 5.º campo = cambios de encuadre dentro del tramo SIN cortar el audio: [(t_fuente, vf), ...]. Punch-in 1.25x en frases > 2.5 s.
PUNCH = "crop=576:1024:72:40,"
EL = "crop=540:960:0:0,"
CL = "crop=600:1067:120:0,"   # quita borde IZQ. e inferior
CR = "crop=600:1067:0:0,"     # quita borde DER. e inferior
EDL = [('i01', (0.50, 1.45), '', 0),
       ('c01', (0.59, 3.20), CL, '4dB', [(1.25, ''), (2.10, PUNCH)]), ('c01', (3.89, 6.01), '', '4dB'),
       ('r1', (2.00, 3.20), '', 0),
       ('c02', (0.20, 2.36), '', '5dB'), ('c02', (2.73, 4.56), '', '5dB'),
       ('c03', (0.53, 2.62), CR, '4dB', [(1.00, '')]), ('c03', (3.29, 4.80), '', '4dB'),
       ('c04', (0.69, 2.65), '', '1.5dB'), ('c04', (3.57, 5.33), '', '1.5dB'),
       ('i02', (1.50, 2.70), '', 0),
       ('c05', (0.02, 2.27), '', '-1.5dB'), ('c05', (2.82, 4.69), '', '-1.5dB'),
       ('c06', (0.71, 3.82), "crop=576:1024:144:0,", '1.5dB', [(2.40, '')]), ('c06', (4.73, 6.72), '', '1.5dB'),
       ('i03', (3.00, 4.30), '', 0),
       ('c07', (0.48, 2.41), '', '-2dB'), ('c07', (3.10, 5.21), '', '-2dB'),
       ('r2', (3.00, 4.20), '', 0),
       ('c08', (0.53, 2.63), '', '1dB'), ('c08', (3.60, 4.69), '', '1dB'),
       ('c09', (0.45, 2.31), '', '0dB'), ('c09', (2.57, 4.76), '', '0dB'),
       ('i04', (1.50, 2.80), '', 0),
       ('c10', (0.13, 2.55), '', '1dB'), ('c10', (2.90, 4.76), '', '1dB'),
       ('i05', (0.80, 2.10), '', 0),
       ('c11', (0.36, 2.02), "crop=540:960:180:0,", '-2dB', [(1.25, '')]), ('c11', (3.04, 5.13), '', '-2dB'),
       ('c12', (0.54, 2.57), '', '1dB'), ('c12', (4.17, 5.63), '', '1dB'),
       ('i06', (1.55, 2.90), '', 0),
       ('c13', (0.00, 2.17), '', '0.5dB'), ('c13', (2.82, 4.61), '', '0.5dB'),
       ('c14', (0.73, 2.65), '', '-2dB'), ('c14', (3.05, 5.27), '', '-2dB'),
       ('c15', (0.45, 1.98), '', '-2.5dB'), ('c15', (2.51, 4.66), '', '-2.5dB'),
       ('c16', (0.38, 1.74), CL, '2dB', [(1.00, '')]), ('c16', (2.61, 5.29), '', '2dB', [(4.00, PUNCH)]),
       ('r3', (4.40, 5.60), '', 0),
       ('c17', (0.76, 5.60), '', '1dB', [(2.80, PUNCH)]),
       ('c18', (0.02, 1.32), CL, '-0.5dB'), ('c18', (2.10, 3.27), '', '-0.5dB'), ('c18', (3.48, 5.40), '', '-0.5dB'),
       ('c19', (0.56, 2.20), '', '-0.5dB'), ('c19', (2.75, 5.57), '', '-0.5dB', [(4.20, PUNCH)]),
       ('c20', (1.06, 3.70), '', '0.5dB', [(2.30, PUNCH)]), ('c20', (4.69, 6.34), '', '0.5dB'),
       ('i07', (0.10, 1.40), '', '-6dB'),
       ('c21', (1.21, 3.13), '', '-1dB'), ('c21', (3.86, 5.74), '', '-1dB'),
       ('i08', (3.20, 4.40), '', 0),
       ('c22', (0.33, 2.15), '', '2.5dB'), ('c22', (2.59, 4.39), '', '2.5dB'),
       ('c23', (0.02, 2.57), CL, '1.5dB'), ('c23', (2.68, 4.91), '', '1.5dB'),
       ('c24', (0.75, 2.48), '', '1dB'), ('c24', (3.12, 5.32), '', '1dB'),
       ('c25', (0.76, 2.35), '', '-4dB'), ('c25', (3.13, 4.66), '', '-4dB'),
       ('c26', (0.61, 2.81), CL, '2.5dB', [(1.00, '')]), ('c26', (3.40, 5.50), '', '2.5dB'),
       ('r4', (3.00, 4.20), '', 0),
       ('c27', (0.51, 1.76), CL, '-1dB'), ('c27', (2.61, 3.58), CL, '-1dB'),
       ('c28', (0.38, 2.05), '', '-1dB'), ('c28', (2.59, 5.61), '', '-1dB', [(4.00, PUNCH)]),
       ('c29', (0.78, 2.91), '', '6dB'), ('c29', (3.69, 5.61), '', '6dB'),
       ('c30', (0.44, 4.50), CL, '-1dB', [(1.00, ''), (2.60, PUNCH)]),
       ('c31', (0.42, 2.18), '', '4dB'), ('c31', (2.63, 4.47), '', '4dB'),
       ('r5', (3.30, 4.50), '', 0),
       ('c32', (0.63, 2.30), '', '3.5dB'), ('c32', (3.27, 5.70), '', '3.5dB'),
       ('r6', (0.30, 1.50), '', 0),
       ('c33', (0.76, 5.33), '', '1.5dB', [(3.30, PUNCH)]),
       ('BLACK', 0.4),
       ('c34', (0.86, 3.65), '', '0dB', [(2.20, PUNCH)]), ('c34', (4.54, 8.24), '', '0dB', [(6.00, PUNCH)])]

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
    # VISTA (kit _marcas: marca de agua y música de la marca; sin CONTINUARÁ)
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    # duración real del plano = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corre las camas)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c16"), at("i07")  # suspenso 0-t1 (café acabado, casa por casa, el reloj), cálida t1-t2 (Chela decide: mesero un año), suspenso t2-fin (las doce, maletín vacío, la mitad iba a otro, CTA)
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
