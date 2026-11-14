"""Montaje de mariachi-patron PARTE 1 (El Mariachi del Patrón; copia del edit.py de viuda-aguacate: montaje por frases desde renders/phr.json).
Uso: python -I edit.py  -> renders/share.mp4 (kit _marcas/VISTA: música y marca de agua de la marca; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
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

# v1 por frases (plantilla viuda-aguacate): rangos de renders/phr.json. Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase.
# 5.º campo = cambios de encuadre dentro del tramo SIN cortar el audio: [(t_fuente, vf), ...]. Ritmo: punch-in 1.25x en frases > 2.5 s; ningún plano > 3 s.
PUNCH = "crop=576:1024:72:40,"
EL = "crop=540:960:0:0,"
ER = "crop=540:960:180:0,"
EDL = [('i01', (2.60, 3.90), '', 0),
       ('c01', (0.61, 2.88), '', '2dB'),
       ('c01', (3.59, 5.96), '', '2dB'),
       ('i02', (1.50, 2.90), '', '-8dB'),
       ('c02', (0.95, 2.80), '', '4dB'),
       ('c02', (3.29, 5.34), '', '4dB'),
       ('c03', (0.66, 2.88), ER, '1dB', [(0.80, '')]),
       ('c03', (3.56, 5.29), '', '1dB'),
       ('r1', (3.00, 4.20), '', 0),
       ('c04', (1.21, 3.73), '', '1.5dB'),
       ('c04', (4.48, 5.62), '', '1.5dB'),
       ('c05', (1.41, 3.16), '', '4dB'),
       ('c05', (3.84, 5.60), '', '4dB'),
       ('c06', (1.32, 5.54), '', '2dB', [(2.87, PUNCH)]),
       ('c07', (0.33, 2.30), '', '0.5dB'),
       ('c07', (2.83, 4.76), '', '0.5dB'),
       ('c08', (0.78, 5.58), '', '4.5dB', [(3.08, PUNCH)]),
       ('c09', (0.87, 2.80), '', '4.5dB'),
       ('c09', (3.53, 5.36), '', '4.5dB'),
       ('c10', (0.39, 2.56), '', '-1.5dB'),
       ('c10', (3.51, 4.96), '', '-1.5dB'),
       ('r2', (3.50, 4.70), '', 0),
       ('c11', (1.06, 5.64), EL, '2dB', [(2.04, PUNCH)]),
       ('c12', (0.82, 2.65), '', '1.5dB'),
       ('c12', (3.32, 5.10), '', '1.5dB'),
       ('i03', (3.50, 4.80), '', 0),
       ('c13', (0.66, 2.68), '', '1.5dB'),
       ('c13', (3.81, 5.49), '', '1.5dB'),
       ('c14', (0.41, 2.64), '', '4dB'),
       ('c14', (3.27, 4.60), '', '4dB'),
       ('i04', (3.00, 4.30), '', 0),
       ('c15', (0.65, 1.66), '', '3dB'),
       ('c15', (2.39, 5.75), '', '3dB', [(3.28, PUNCH)]),
       ('c16', (0.37, 3.06), '', '-5dB'),
       ('c16', (3.54, 4.39), '', '-5dB'),
       ('i05', (3.10, 4.40), '', 0),
       ('c17', (1.47, 5.65), '', '4dB', [(3.76, PUNCH)]),
       ('c18', (0.35, 4.91), '', '1dB', [(2.55, PUNCH)]),
       ('c19', (0.82, 2.81), '', '5dB'),
       ('c19', (3.39, 4.99), '', '5dB'),
       ('c20', (0.33, 1.77), ER, '6.5dB', [(1.00, '')]),
       ('c20', (2.82, 5.13), '', '6.5dB'),
       ('i06', (3.00, 4.40), '', '-8dB'),
       ('i06', (4.50, 5.50), '', '-8dB'),
       ('c21', (0.88, 4.69), ER, '6dB', [(1.00, ''), (3.62, PUNCH)]),
       ('i07', (3.50, 4.80), '', 0),
       ('c22', (1.33, 2.78), '', '0dB'),
       ('c22', (3.60, 5.46), '', '0dB'),
       ('c23', (0.78, 5.65), ER, '4.5dB', [(0.80, ''), (2.11, PUNCH)]),
       ('c24', (0.54, 4.83), '', '4dB', [(2.30, PUNCH)]),
       ('r3', (3.00, 4.30), '', 0),
       ('c25', (0.55, 2.08), '', '3dB'),
       ('c25', (3.10, 4.89), '', '3dB'),
       ('c26', (0.22, 4.98), ER, '1dB', [(0.80, ''), (2.46, PUNCH)]),
       ('c27', (0.38, 5.39), '', '1dB', [(3.58, PUNCH)]),
       ('c28', (0.53, 4.77), '', '-0.5dB', [(2.22, PUNCH)]),
       ('c29', (0.77, 5.18), '', '-0.5dB', [(2.93, PUNCH)]),
       ('r4', (3.20, 4.40), '', 0),
       ('c30', (0.83, 5.33), EL, '2.5dB', [(1.30, ''), (3.29, PUNCH)]),
       ('r5', (3.50, 4.90), '', 0),
       ('c31', (0.59, 2.90), '', '0.5dB'),
       ('c31', (3.65, 5.17), '', '0.5dB'),
       ('c32', (0.99, 5.15), '', '4dB', [(2.78, PUNCH)]),
       ('c33', (0.15, 2.92), EL, '2dB', [(0.80, '')]),
       ('c33', (3.17, 4.91), '', '2dB'),
       ('c34', (0.66, 2.00), '', '4.5dB'),
       ('c34', (2.98, 3.96), '', '4.5dB'),
       ('c34', (4.23, 5.61), '', '4.5dB'),
       ('r3', (4.40, 5.50), '', 0),  # reacción de Gildardo a "es mi hijo" (revisión API)
       ('c35', (1.13, 5.34), '', '2dB', [(2.93, PUNCH)]),
       ('BLACK', 0.4),
       ('c36', (0.95, 3.43), '', '0.5dB'),
       ('c36', (4.53, 8.31), '', '0.5dB', [(6.64, PUNCH)])]

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
    t1, t2 = at("c27"), at("c30")  # suspenso 0-t1 (sombrero, limosna, reloj, convoy, llegada), cálida t1-t2 (Higinio y Rosendo), suspenso t2-fin (plazo, "Gildardo es mi hijo", CTA)
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
