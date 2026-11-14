"""Montaje de viuda-aguacate-p2 PARTE 2 (La Viuda del Aguacate; copia del edit.py de viuda-aguacate: montaje por frases).
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

# BORRADOR (sin clips todavía): EDL por índices de frase (faster-whisper small) y mudos por rangos a ojo. Tras generar: python -I phr.py, QA (qa_clips.md),
# pasar cada tramo a rangos medidos (renders/lv3.json o phr.json: entrada 0.08 s antes de la voz, salida 0.15 s después), ganancia por clip = -19.5 - LUFS,
# crops de borde donde haga falta y punch-in 1.25x en frases > 2.5 s (ningún plano > 3 s). Mismo personaje = salto dentro del clip. BLACK 0.4 s antes del CTA (c34).
# Insertos/reacciones mudos (ganancia 0) salvo i03 (puerta y pasos) e i04 (papel roto): foley a -8 dB si suenan limpios.
# 5.º campo = cambios de encuadre dentro del tramo SIN cortar el audio: [(t_fuente, vf), ...] (ver viuda-aguacate/edit.py).
PUNCH = "crop=576:1024:72:40,"
EL = "crop=540:960:0:0,"
EDL = [('i01', (1.00, 2.10), '', 0),
       ('c01', (0.82, 2.53), '', '0.0dB'),
       ('c01', (3.21, 5.38), '', '0.0dB'),
       ('c02', (0.39, 2.10), '', '-1.0dB'),
       ('c02', (2.70, 4.69), '', '-1.0dB'),
       ('r1', (3.00, 4.20), '', 0),
       ('i02', (3.30, 4.50), '', 0),
       ('c03', (0.73, 3.15), '', '0.5dB'),
       ('c03', (3.56, 5.50), '', '0.5dB'),
       ('i03', (3.60, 4.90), '', 0),
       ('c04', (1.07, 1.52), '', '-1.5dB'),
       ('c04', (2.23, 3.33), '', '-1.5dB'),
       ('c04', (3.61, 5.22), '', '-1.5dB'),
       ('c05', (0.72, 2.67), '', '0.0dB'),
       ('c05', (3.65, 4.88), '', '0.0dB'),
       ('c06', (1.02, 2.79), '', '3.5dB'),
       ('c06', (3.50, 4.76), '', '3.5dB'),
       ('c07', (0.57, 2.23), '', '-1.0dB'),
       ('c07', (3.61, 4.46), '', '-1.0dB'),
       ('c08', (0.18, 2.36), '', '4.0dB'),
       ('c08', (3.08, 4.45), '', '4.0dB'),
       ('c09', (0.48, 2.20), '', '5.5dB'),
       ('c09', (3.49, 5.53), '', '5.5dB'),
       ('r2', (3.00, 4.20), '', 0),
       ('c10', (1.04, 2.97), '', '1.0dB'),
       ('c10', (3.47, 4.54), '', '1.0dB'),
       ('c11', (1.15, 3.34), '', '5.0dB'),
       ('c11', (4.02, 5.72), '', '5.0dB'),
       ('r3', (3.00, 4.20), '', 0),
       ('c12', (0.84, 2.40), '', '0.5dB'),
       ('c12', (3.27, 4.36), '', '0.5dB'),
       ('c13', (0.14, 2.48), '', '1.5dB'),
       ('c13', (3.03, 5.60), '', '1.5dB', [(4.31, PUNCH)]),
       ('i04', (3.90, 5.20), '', 0),
       ('c14', (0.57, 2.23), '', '4.0dB'),
       ('c14', (2.82, 4.78), '', '4.0dB'),
       ('c15', (0.66, 2.50), '', '1.0dB'),
       ('c15', (2.82, 5.13), '', '1.0dB'),
       ('c16', (0.55, 2.53), 'crop=540:960:90:0,', '-1.5dB', [(1.1, '')]),
       ('c16', (3.46, 4.72), '', '-1.5dB'),
       ('c17', (0.56, 2.57), '', '-1.5dB'),
       ('c17', (3.21, 4.96), '', '-1.5dB'),
       ('c18', (0.26, 2.09), '', '2.0dB'),
       ('c18', (3.40, 5.42), '', '2.0dB'),
       ('i05', (3.00, 4.30), '', 0),
       ('c19', (0.60, 2.61), '', '-1.0dB'),
       ('c19', (3.54, 4.96), '', '-1.0dB'),
       ('c20', (0.50, 2.56), '', '-1.0dB'),
       ('c20', (3.38, 5.31), '', '-1.0dB'),
       ('c21', (0.60, 2.36), '', '-1.5dB'),
       ('c21', (2.96, 4.51), '', '-1.5dB'),
       ('r4', (3.00, 4.20), '', 0),
       ('c22', (0.92, 2.79), '', '1.5dB'),
       ('c22', (3.30, 5.61), '', '1.5dB'),
       ('c23', (1.13, 2.97), '', '3.0dB'),
       ('c23', (3.93, 5.39), '', '3.0dB'),
       ('c24', (0.79, 2.41), 'crop=540:960:90:0,', '5.0dB', [(1.6, '')]),
       ('c24', (3.13, 5.04), '', '5.0dB'),
       ('i06', (1.50, 2.80), '', 0),
       ('c25', (0.76, 2.10), '', '0.5dB'),
       ('c25', (3.04, 4.00), '', '0.5dB'),
       ('c26', (0.69, 3.03), '', '4.0dB'),
       ('c26', (3.77, 5.38), '', '4.0dB'),
       ('i07', (2.00, 3.30), '', 0),
       ('c27', (0.54, 2.26), '', '0.0dB'),
       ('c27', (3.10, 5.41), '', '0.0dB'),
       ('c28', (1.09, 4.20), '', '0.5dB', [(2.65, PUNCH)]),
       ('c29', (0.90, 2.63), '', '-0.5dB'),
       ('c29', (3.48, 4.97), '', '-0.5dB'),
       ('c29', (5.75, 6.87), '', '-0.5dB'),
       ('c30', (0.94, 2.83), '', '-3.0dB'),
       ('c30', (3.57, 5.21), '', '-3.0dB'),
       ('r5', (2.00, 3.30), '', 0),
       ('c31', (0.99, 5.35), '', '5.0dB', [(3.17, PUNCH)]),
       ('c32', (0.42, 1.97), 'crop=480:853:120:0,', '1.5dB'),
       ('c32', (2.53, 3.57), 'crop=480:853:120:0,', '1.5dB'),
       ('c32', (4.22, 5.93), '', '1.5dB'),
       ('i08', (3.00, 4.30), '', 0),
       ('c33', (0.96, 2.62), '', '-0.5dB'),
       ('c33', (3.43, 5.75), '', '-0.5dB'),
       ('BLACK', 0.4),
       ('c34', (0.66, 3.60), '', '0.0dB', [(2.13, PUNCH)]),
       ('c34', (4.59, 8.30), '', '0.0dB', [(6.45, PUNCH)])]


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
    t1, t2 = at("c10"), at("c13")  # suspenso 0-t1 (llamada, llega Arnulfo, padre contra hijo), cálida t1-t2 (Lauro era su padrino), suspenso t2-fin (castigos, se mete el sol, CTA)
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
