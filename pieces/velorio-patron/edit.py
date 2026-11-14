"""Montaje de velorio-patron PARTE 1 (El Velorio del Patrón; copia del edit.py de viuda-aguacate: montaje por frases desde renders/lv3.json).
Uso: python -I edit.py  -> renders/share.mp4 (kit _marcas/MAJESTIC: música y marca de agua de la marca; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "MAJESTIC"  # MAJESTIC STORIES: arriba a la izquierda (x=36, y=210), alfa 80; música de pieces/_marcas/MAJESTIC
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

# v1 por frases (plantilla viuda-aguacate): rangos medidos en renders/lv3.json (large-v3) + envolvente (renders/segs.json).
# Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase. Mismo personaje = salto dentro del clip.
# qa_clips.md: crops de borde (figura/hombro ajeno en el borde IZQ. los primeros ~1 s) c01 c06 c11 c17 c19 c20 c21 c26 c28; c22 y c27 crop toda la 1.ª frase.
# i06 fuera (revisión: escolta de traje gris y caras clonadas; la de negro con gafas la bloquea Flow). i05 fuera (manos envejecidas y manga larga azul; Nati va de manga corta). c21: crop en toda la 1.ª frase (encaje negro ajeno hasta ~2 s).
# r*/i* mudos (ganancia 0: Omni alucina "¡Suscríbete!"). Ganancia por clip = -19.5 - LUFS (ebur128, 0.5 dB). BLACK 0.4 s antes del CTA (c32).
# 5.º campo = cambios de encuadre dentro del tramo SIN cortar el audio; punch-in 1.25x a mitad de las frases > 2.5 s.
PUNCH = "crop=576:1024:72:40,"
EDL = [('i01', (2.0, 3.4), '', 0),
       ('c01', (0.73, 3.12), 'crop=540:960:180:0,', '6.0dB', [(1.0, '')]),
       ('c01', (4.00, 5.82), '', '6.0dB'),
       ('c02', (0.64, 3.52), '', '1.5dB', [(2.08, PUNCH)]),
       ('c02', (4.10, 5.58), '', '1.5dB'),
       ('c03', (0.41, 2.64), '', '1.0dB'),
       ('c03', (3.39, 5.74), '', '1.0dB'),
       ('c04', (0.50, 2.38), '', '0.0dB'),
       ('c04', (2.83, 5.53), '', '0.0dB', [(4.18, PUNCH)]),
       ('r1', (2.6, 3.6), '', 0),
       ('c05', (0.57, 2.70), '', '5.5dB'),
       ('c05', (3.45, 5.35), '', '5.5dB'),
       ('i02', (0.2, 1.3), '', 0),
       ('c06', (0.45, 2.11), 'crop=540:960:180:0,', '5.5dB', [(0.9, '')]),
       ('c06', (2.74, 5.17), '', '5.5dB'),
       ('r2', (2.1, 3.1), '', 0),
       ('c07', (0.66, 2.49), '', '-0.5dB'),
       ('c07', (3.27, 4.83), '', '-0.5dB'),
       ('i03', (3.1, 4.2), '', 0),
       ('c08', (0.75, 3.27), '', '2.0dB', [(2.01, PUNCH)]),
       ('c08', (3.80, 6.39), '', '2.0dB', [(5.09, PUNCH)]),
       ('c09', (1.40, 5.59), '', '3.0dB', [(3.49, PUNCH)]),
       ('c10', (0.51, 4.06), '', '3.0dB', [(2.29, PUNCH)]),
       ('c10', (5.11, 7.31), '', '3.0dB'),
       ('i04', (2.1, 3.2), '', 0),
       ('c11', (0.43, 3.16), 'crop=540:960:180:0,', '-0.5dB', [(1.0, ''), (1.79, PUNCH)]),
       ('c11', (3.63, 4.97), '', '-0.5dB'),
       ('c12', (0.82, 2.62), '', '3.0dB'),
       ('c12', (3.19, 5.22), '', '3.0dB'),
       ('r3', (0.3, 1.4), '', 0),
       ('c13', (0.19, 3.08), '', '1.5dB', [(1.64, PUNCH)]),
       ('c13', (3.52, 5.32), '', '1.5dB'),
       ('c14', (0.50, 2.15), '', '6.0dB'),
       ('c14', (3.10, 4.85), '', '6.0dB'),
       ('c15', (0.62, 2.46), '', '2.0dB'),
       ('c15', (3.15, 4.93), '', '2.0dB'),
       ('c16', (0.71, 2.31), '', '4.5dB'),
       ('c16', (3.12, 5.72), '', '4.5dB', [(4.42, PUNCH)]),
       ('c17', (0.23, 1.57), 'crop=540:960:180:0,', '3.5dB', [(1.0, '')]),
       ('c17', (2.04, 4.47), '', '3.5dB'),
       ('c18', (0.60, 2.58), '', '1.0dB'),
       ('c18', (3.54, 5.37), '', '1.0dB'),
       ('c19', (0.65, 2.96), 'crop=540:960:180:0,', '4.5dB', [(1.2, '')]),
       ('c19', (3.56, 5.26), '', '4.5dB'),
       ('i07', (2.5, 3.6), '', 0),
       ('c20', (0.28, 1.67), 'crop=540:960:180:0,', '2.5dB', [(1.0, '')]),
       ('c20', (2.58, 4.70), '', '2.5dB'),
       ('r4', (2.6, 3.6), '', 0),
       ('c21', (0.36, 2.34), 'crop=540:960:180:0,', '2.5dB'),
       ('c21', (2.80, 4.77), '', '2.5dB'),
       ('c22', (0.49, 2.08), 'crop=540:960:180:0,', '3.5dB'),
       ('c22', (2.74, 4.85), '', '3.5dB'),
       ('c23', (0.38, 2.34), '', '-0.5dB'),
       ('c23', (3.15, 5.34), '', '-0.5dB'),
       ('c24', (0.36, 2.32), '', '6.0dB'),
       ('c24', (3.40, 6.04), '', '6.0dB', [(4.72, PUNCH)]),
       ('c25', (0.49, 2.45), '', '-1.5dB'),
       ('c25', (2.84, 4.73), '', '-1.5dB'),
       ('c26', (0.06, 2.75), 'crop=540:960:180:0,', '4.0dB', [(0.8, ''), (1.41, PUNCH)]),
       ('c26', (3.57, 5.28), '', '4.0dB'),
       ('c27', (0.61, 2.79), 'crop=540:960:90:0,', '0.5dB'),
       ('c27', (3.24, 5.31), '', '0.5dB'),
       ('c28', (0.58, 3.42), 'crop=540:960:180:0,', '0.0dB', [(1.4, ''), (2.0, PUNCH)]),
       ('c28', (4.02, 5.35), '', '0.0dB'),
       ('r5', (2.6, 3.6), '', 0),
       ('i08', (2.1, 3.4), '', 0),
       ('c29', (0.77, 2.42), '', '2.5dB'),
       ('c29', (3.22, 4.91), '', '2.5dB'),
       ('c30', (1.39, 5.54), '', '-0.5dB', [(3.46, PUNCH)]),
       ('r6', (2.6, 3.6), '', 0),
       ('c31', (0.74, 2.73), '', '4.5dB'),
       ('c31', (3.59, 5.47), '', '4.5dB'),
       ('i09', (3.0, 4.1), '', 0),
       ('BLACK', 0.4),
       ('c32', (0.42, 3.06), '', '-1.5dB', [(1.74, PUNCH)]),
       ('c32', (3.99, 7.67), '', '-1.5dB', [(5.83, PUNCH)])]

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
    # MAJESTIC (kit _marcas: marca de agua y música de la marca; sin CONTINUARÁ)
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    # duración real del plano = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corre las camas)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c22"), at("c26")  # suspenso 0-t1 (la corren, la carta, el anillo, la escolta), cálida t1-t2 (ella lo cuidó al final), suspenso t2-fin (oferta, "¿qué ordena?", portón, carta sellada, CTA)
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
