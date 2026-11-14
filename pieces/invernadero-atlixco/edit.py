"""Montaje de invernadero-atlixco PARTE 1 (Las Nochebuenas de Atlixco, VISTA STORIES; copia del edit.py de piloncillo-rio: montaje por frases desde renders/phr.json).
Uso: python -I edit.py  -> renders/share.mp4 (kit _marcas/VISTA: música propia, marca arriba al centro y=135; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "VISTA"  # VISTA STORIES: marca arriba al centro (y=135, 22 px, alfa 80) y música de pieces/_marcas/VISTA
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
# Por armar desde renders/phr.json (python -I phr.py). Objetivo: <=2 s por TRAMO real (sin contar punch-in); piloncillo-rio quedó en 1.56 s/tramo.
# Frases cortas en su plano, mismo personaje = salto dentro de su clip (c17-c18: Hermelinda en la casona; c27-c28: Hermelinda en el patio), insertos y reacciones de ~1.0-1.2 s.
# i01 <= 0.9 s para que "Hasta que den las seis, Efrén" entre antes de los 2 s. BLACK de 0.4 s antes de c34 (CTA).
EDL = [('c01', (1.41, 3.05), '', '-1.5dB'),
       ('c01', (3.77, 5.67), '', '-1.5dB'),
       ('i01', (2.00, 4.00), '', 0),
       ('c02', (0.29, 2.76), '', '-3.5dB'),
       ('c02', (3.72, 5.18), '', '-3.5dB'),
       ('c03', (0.28, 2.73), 'crop=540:960:180:0,', '3.5dB', [(1.0, '')]),
       ('c03', (3.56, 4.97), '', '3.5dB'),
       ('c04', (0.51, 2.45), '', '-4.0dB'),
       ('c04', (3.16, 4.30), '', '-4.0dB'),
       ('c05', (0.23, 2.79), '', '-3.5dB', [(1.51, PUNCH)]),
       ('c05', (3.51, 4.98), '', '-3.5dB'),
       ('c06', (0.49, 1.92), '', '-1.0dB'),
       ('c06', (2.32, 4.35), '', '-1.0dB'),
       ('c07', (0.39, 2.37), '', '-2.0dB'),
       ('c07', (3.50, 5.22), '', '-2.0dB'),
       ('i02', (1.60, 3.00), '', 0),
       ('c08', (0.49, 4.83), 'crop=540:960:0:0,', '3.5dB', [(1.0, ''), (2.66, PUNCH)]),
       ('c09', (1.46, 3.06), '', '-4.0dB'),
       ('c09', (3.41, 5.15), '', '-4.0dB'),
       ('r1', (3.00, 4.30), '', 0),
       ('c10', (1.29, 1.89), '', '1.5dB'),
       ('c10', (2.23, 3.46), '', '1.5dB'),
       ('c10', (4.03, 5.34), '', '1.5dB'),
       ('c11', (0.88, 2.04), 'crop=540:960:0:0,', '-1.0dB', [(1.0, '')]),
       ('c11', (3.03, 4.55), '', '-1.0dB'),
       ('c12', (0.46, 2.22), 'crop=540:960:180:0,', '-4.5dB', [(1.0, '')]),
       ('c12', (2.85, 4.36), '', '-4.5dB'),
       ('c13', (0.50, 2.30), '', '-2.5dB'),
       ('c13', (3.73, 5.18), '', '-2.5dB'),
       ('c14', (1.46, 2.99), '', '-1.0dB'),
       ('c14', (3.33, 5.26), '', '-1.0dB'),
       ('c15', (0.72, 2.22), '', '1.0dB'),
       ('c15', (3.27, 4.73), '', '1.0dB'),
       ('c16', (0.58, 2.26), 'crop=540:960:180:0,', '-0.5dB', [(1.0, '')]),
       ('c16', (3.10, 4.56), '', '-0.5dB'),
       ('i03', (3.00, 4.40), '', 0),
       ('c17', (0.75, 2.39), '', '-2.5dB'),
       ('c17', (3.42, 4.66), '', '-2.5dB'),
       ('c18', (1.28, 2.71), '', '-3.0dB'),
       ('c18', (3.28, 5.06), '', '-3.0dB'),
       ('i04', (3.30, 4.80), '', 0),
       ('c19', (1.51, 2.85), '', '-5.5dB'),
       ('c19', (3.50, 4.96), '', '-5.5dB'),
       ('c20', (0.02, 1.83), '', '-2.5dB'),
       ('c20', (2.91, 4.67), '', '-2.5dB'),
       ('c21', (0.59, 2.40), '', '-4.5dB'),
       ('c21', (2.99, 4.71), '', '-4.5dB'),
       ('r2', (3.00, 4.30), '', 0),
       ('i05', (3.40, 5.00), '', 0),
       ('i06', (3.00, 4.60), '', 0),
       ('c22', (0.22, 2.26), '', '-2.5dB'),
       ('c22', (3.22, 5.23), '', '-2.5dB'),
       ('c23', (0.51, 2.24), '', '-4.5dB'),
       ('c23', (3.07, 3.92), '', '-4.5dB'),
       ('c23', (4.03, 5.44), '', '-4.5dB'),
       ('c24', (1.91, 3.51), 'crop=540:960:180:0,', '1.0dB', [(1.0, '')]),
       ('c24', (3.62, 5.32), '', '1.0dB'),
       ('c25', (0.31, 1.55), '', '3.0dB'),
       ('c25', (2.52, 3.67), '', '3.0dB'),
       ('c26', (0.62, 1.90), '', '-0.5dB'),
       ('c26', (2.99, 4.51), '', '-0.5dB'),
       ('c27', (0.02, 1.97), '', '-1.5dB'),
       ('c27', (2.74, 4.47), '', '-1.5dB'),
       ('c28', (0.39, 2.28), '', '-0.5dB'),
       ('c28', (2.90, 5.60), '', '-0.5dB', [(4.25, PUNCH)]),
       ('c29', (0.40, 1.93), '', '-2.5dB'),
       ('c29', (2.92, 4.75), '', '-2.5dB'),
       ('c30', (0.67, 1.81), '', '-2.5dB'),
       ('c30', (2.69, 4.67), '', '-2.5dB'),
       ('c31', (0.66, 1.62), '', '3.5dB'),
       ('c31', (2.34, 3.77), '', '3.5dB'),
       ('r3', (3.00, 4.30), '', 0),
       ('i07', (3.40, 5.00), '', 0),
       ('r4', (3.00, 4.30), '', 0),
       ('c32', (0.41, 2.02), '', '-2.5dB'),
       ('c32', (3.06, 4.72), '', '-2.5dB'),
       ('c33', (0.52, 1.52), 'crop=540:960:0:0,', '-0.5dB', [(1.0, '')]),
       ('c33', (2.51, 4.56), '', '-0.5dB'),
       ('BLACK', 0.4),
       ('c34', (0.40, 2.97), '', '-4.0dB', [(1.69, PUNCH)]),
       ('c34', (3.38, 6.63), '', '-4.0dB', [(5.0, PUNCH)])]


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
    # VISTA (kit _marcas: marca VISTA STORIES arriba al centro, música propia; sin CONTINUARÁ)
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    # duración real del plano = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corre las camas)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c24"), at("c27")  # suspenso 0-t1 (la maceta rota, "hasta que den las seis", las llaves, la casona, los camiones, "¿quién tiró mi nochebuena?"), cálida t1-t2 ("¿estás bien, mijo?", "tú nunca me has fallado"), suspenso t2-fin (el plazo invertido, el trato firmado, la camioneta negra, Ezequías, CTA)
    tv = MUSIC_VOL * 2.4
    out = R / "share.mp4"
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim={BC['tension2_from']}:{BC['tension2_from'] + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,lowpass=f=16000,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.76:level=false,aresample=48000[a]")
    mix = R / "mix.wav"
    ins_m = ["-i", str(raw), "-stream_loop", "3", "-i", str(M / "calida.mp3"), "-stream_loop", "3", "-i", str(M / "tension.mp3"),
             "-stream_loop", "3", "-i", str(M / "tension.mp3"), "-i", str(M / BC["hit"])]
    # loudnorm en dos pasadas (medición + lineal): en una sola pasada quedaba en -15.4 LUFS
    # lowpass 16 kHz antes de loudnorm: sin él el AAC 192k pasaba de -1.9 a +1.2 dBTP (agudos de Omni)
    m = subprocess.run(["ffmpeg", "-y", "-hide_banner", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5,alimiter=limit=0.76:level=false,", "loudnorm=I=-14:TP=-1.5:print_format=json,"),
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
