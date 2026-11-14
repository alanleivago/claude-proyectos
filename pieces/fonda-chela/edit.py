"""Montaje de fonda-chela PARTE 1 (El Jefe Nuevo; copia del edit.py de foto-trucada: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/VISTA: música y marca de agua de la marca; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "VISTA"  # VISTA STORIES: arriba al centro (y=135), alfa 80; música de pieces/_marcas/VISTA
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

# v1 por frases (método aprobado, plantilla monedas-carretera): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7).
# Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase. Mismo personaje = salto dentro del clip.
# qa_clips.md: crops de borde c10 (0-0.4), c16 (todo), c24 (0-1.3), c08 (pizarrón DER., todo); arranques c05 0.55, c25 1.09, c34 0.30, c12 0.92 ("Tía" en 1.00-1.30, la envolvente lo perdía); i01 1.3, i03 1.5;
# J-cut c17 (audio 1.17, imagen 1.5; c18 mudo encima) y c23 (audio 0.23, imagen 1.0; r2 encima); c15 sin "dólares" (3.20-3.44) con r2 tapando el salto;
# c19 (Güero con otra cara que c06/c22): su voz sobre i05 (mano con radio) e i06 (dron, el convoy).
# r*/i* mudos (ganancia 0). Ganancia por clip = -19.5 - LUFS (ebur128, 0.5 dB). BLACK 0.4 s antes del CTA (c36).
# 5.º campo = cambios de encuadre dentro del tramo SIN cortar el audio: [(t_fuente, vf), ...]; vf puede ser (clip, t_inicio, vf) = inserto/reacción encima de la voz.
# Ritmo: punch-in 1.25x o inserto en frases > 3 s; ningún plano > 3 s.
PUNCH = "crop=576:1024:72:40,"
EDGE = "crop=540:960:180:0,"
EDL = [('i01', (1.3, 2.3), '', 0),
       ('c01', (1.16, 3.59), '', '2dB'), ('c01', (4.54, 6.24), '', '2dB'),
       ('i02', (1.0, 2.2), '', 0),
       ('c02', (0.30, 3.90), '', '4.5dB', [(1.90, PUNCH)]),
       ('c03', (0.15, 4.88), '', '3dB', [(2.20, PUNCH)]),
       ('r1', (1.25, 2.45), '', 0),
       ('c04', (1.24, 3.81), '', '1dB'), ('c04', (4.60, 6.22), '', '1dB'),
       ('c05', (0.55, 2.13), '', '5dB'), ('c05', (3.29, 4.81), '', '5dB'),
       ('c06', (1.05, 4.62), '', '2.5dB', [(2.45, PUNCH)]),
       ('i03', (1.5, 2.7), '', 0),
       ('c07', (0.95, 6.21), '', '-1.5dB', [(3.50, PUNCH)]),
       ('c08', (1.79, 3.27), 'crop=540:960:60:60,', '1.5dB'), ('c08', (4.27, 6.05), 'crop=540:960:60:60,', '1.5dB'),
       ('c09', (0.52, 5.03), '', '2.5dB', [(2.25, PUNCH)]),
       ('c10', (0.03, 2.13), EDGE, '-0.5dB', [(0.40, '')]), ('c10', (3.45, 4.73), '', '-0.5dB'),
       ('c11', (0.31, 5.47), '', '-1dB', [(2.37, PUNCH), (3.90, ('i04', 1.0, ''))]),
       ('c12', (0.92, 3.13), '', '1.5dB'), ('c12', (3.70, 5.23), '', '1.5dB'),
       ('c13', (0.02, 4.26), '', '1.5dB', [(2.02, PUNCH)]),
       ('c14', (0.70, 2.23), '', '-2.5dB'), ('c14', (3.41, 5.43), '', '-2.5dB'),
       ('c15', (0.76, 2.00), '', '-1.5dB'), ('c15', (2.47, 3.17), '', '-1.5dB'), ('c15', (3.44, 4.33), ('r2', 1.5, ''), '-1.5dB'),
       ('c16', (2.12, 3.63), EDGE, '2.5dB'), ('c16', (4.42, 6.46), EDGE, '2.5dB'),
       ('c17', (1.17, 2.66), ('c18', 0.05, ''), '2dB', [(1.50, '')]), ('c17', (3.60, 5.71), '', '2dB'),
       ('c18', (0.60, 1.89), '', '-0.5dB'), ('c18', (2.55, 3.91), '', '-0.5dB'),
       ('c19', (0.88, 5.30), ('i05', 0.8, ''), '5.5dB', [(2.54, ('i06', 1.0, ''))]),
       ('c20', (1.39, 2.72), '', '1.5dB'), ('c20', (3.39, 4.78), '', '1.5dB'),
       ('c21', (1.32, 2.67), '', '4dB'), ('c21', (3.57, 5.75), '', '4dB'),
       ('c22', (0.51, 1.89), '', '6.5dB'), ('c22', (2.79, 4.36), '', '6.5dB'),
       ('r3', (1.25, 2.25), '', 0),
       ('c23', (0.23, 2.53), ('r2', 2.5, ''), '3dB', [(1.00, '')]), ('c23', (3.41, 6.31), '', '3dB'),
       ('c24', (0.41, 2.67), EDGE, '-1dB', [(1.30, '')]), ('c24', (3.46, 6.59), '', '-1dB', [(4.65, PUNCH)]),
       ('c25', (1.09, 6.49), '', '0dB', [(3.00, PUNCH), (4.80, '')]),
       ('c26', (0.59, 4.48), '', '-2.5dB', [(2.36, PUNCH)]),
       ('c27', (0.45, 2.65), '', '-1.5dB'), ('c27', (3.62, 4.82), '', '-1.5dB'),
       ('c28', (0.01, 4.71), '', '2dB', [(2.30, PUNCH)]),
       ('c29', (2.57, 4.30), '', '-2dB'), ('c29', (5.02, 6.42), '', '-2dB'),
       ('i07', (1.0, 2.2), '', 0),
       ('c30', (0.67, 2.97), '', '1dB'), ('c30', (3.53, 5.39), '', '1dB'),
       ('c31', (0.80, 6.11), '', '-0.5dB', [(3.22, PUNCH)]),
       ('c32', (0.50, 2.32), '', '2.5dB'), ('c32', (3.07, 4.69), '', '2.5dB'),
       ('r4', (1.25, 2.45), '', 0),
       ('c33', (0.86, 2.78), '', '2.5dB'), ('c33', (4.21, 5.68), '', '2.5dB'),
       ('c34', (0.30, 3.25), '', '2dB', [(1.80, PUNCH)]), ('c34', (3.79, 5.37), '', '2dB'),
       ('c35', (0.87, 3.31), '', '-1.5dB'), ('c35', (4.41, 6.62), '', '-1.5dB'),
       ('r5', (1.25, 2.45), '', 0),
       ('BLACK', 0.4),
       ('c36', (0.75, 4.01), '', '0.5dB', [(2.40, PUNCH)]), ('c36', (4.65, 8.23), '', '0.5dB', [(6.55, PUNCH)])]

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
    t1, t2 = at("c31"), at("c32")  # suspenso 0-t1 (el cobro, el café, el convoy, la inversión, el plazo), cálida t1-t2 (Macario y el fiado de hace treinta años), suspenso t2-fin (qué hacemos con el muchacho, súplica, el café se acaba y CTA)
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
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"  # wm.png de brand_wm ya trae la marca en su posición
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "2:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    n = sum(1 + len(e[4]) if len(e) > 4 else 1 for e in EDL if e[0] != "BLACK")
    print(out, f"{dur:.1f}s", len(parts), "tramos", n, "planos", f"{(dur - 0.4) / n:.2f} s/plano")

if __name__ == "__main__":
    main()
