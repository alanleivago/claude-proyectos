"""Montaje de chofer-patrona-p2 PARTE 2 (El Chofer de la Patrona, MAJESTIC, la misma marca de la Parte 1; copia del edit.py de chofer-patrona: montaje por frases desde renders/phr.json).
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

# v1 por frases (plantilla viuda-aguacate): rangos de renders/phr.json. Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase.
# 5.º campo = cambios de encuadre dentro del tramo SIN cortar el audio: [(t_fuente, vf), ...]. Ritmo: punch-in 1.25x en frases > 2.5 s; ningún plano > 3 s.
PUNCH = "crop=576:1024:72:40,"
EL = "crop=540:960:0:0,"
ER = "crop=540:960:180:0,"
# Por armar desde renders/phr.json (python -I phr.py) tras generar los clips. Objetivo: <=2 s por TRAMO real (sin contar punch-in); la Parte 1 quedó en 1.61 s/tramo.
# Frases cortas en su plano, mismo personaje = salto dentro de su clip, insertos y reacciones de ~1.0-1.2 s. i01 (recordatorio en la tableta) <= 0.9 s para que
# "¿A Treviño le diste mi maletín?" entre antes de los 2 s. Mudos con ganancia 0 salvo i02 (troca entrando) e i03 (portón): foley a -8 dB si suenan limpios.
# Orden: i01 c01-c04 r1 c05-c10 i02 i03 i04 c11-c14 r2 c15-c17 i05 c18 r3 c19 c20 i06 i07 c21-c25 r4 c26-c31 i08 c32 c33 ('BLACK', 0.4) c34 (CTA).
EDL = [('c01', (0.02, 2.43), '', '1.0dB'),
       ('c01', (2.99, 4.37), '', '1.0dB'),
       ('i01', (3.30, 4.90), '', 0),
       ('c02', (0.66, 2.26), '', '1.0dB'),
       ('c02', (3.32, 5.28), '', '1.0dB'),
       ('c03', (0.72, 2.39), '', '-0.5dB'),
       ('c03', (2.91, 5.01), '', '-0.5dB'),
       ('c04', (0.24, 2.27), '', '1.5dB'),
       ('c04', (2.86, 4.59), '', '1.5dB'),
       ('r1', (3.00, 4.30), '', 0),
       ('c05', (0.67, 5.33), '', '-3.0dB', [(3.0, PUNCH)]),
       ('c06', (0.47, 2.29), 'crop=540:960:180:0,', '-0.5dB', [(1.1, '')]),
       ('c06', (3.85, 5.24), '', '-0.5dB'),
       ('c07', (0.30, 2.60), '', '-1.5dB'),
       ('c07', (3.01, 5.03), '', '-1.5dB'),
       ('c08', (0.69, 3.36), '', '-1.5dB', [(2.02, PUNCH)]),
       ('c08', (3.75, 5.19), '', '-1.5dB'),
       ('c09', (0.75, 2.26), '', '-1.0dB'),
       ('c09', (3.08, 4.50), '', '-1.0dB'),
       ('c10', (0.74, 2.43), '', '0.5dB'),
       ('c10', (3.28, 5.53), '', '0.5dB'),
       ('i02', (3.60, 5.00), '', 0),
       ('i03', (0.50, 1.90), '', 0),
       ('i04', (4.20, 5.60), '', 0),
       ('c11', (1.08, 2.58), '', '3.5dB'),
       ('c11', (3.99, 5.32), '', '3.5dB'),
       ('c12', (0.34, 0.77), '', '-1.0dB'),
       ('c12', (1.14, 3.22), '', '-1.0dB'),
       ('c12', (3.64, 4.53), '', '-1.0dB'),
       ('c13', (0.31, 2.17), '', '-0.5dB'),
       ('c13', (3.12, 4.65), '', '-0.5dB'),
       ('c14', (0.68, 2.75), '', '2.0dB'),
       ('c14', (3.54, 5.33), '', '2.0dB'),
       ('r2', (3.00, 4.30), '', 0),
       ('c15', (0.71, 2.78), '', '2.5dB'),
       ('c15', (3.64, 5.14), '', '2.5dB'),
       ('c16', (0.53, 2.78), '', '5.5dB'),
       ('c16', (3.34, 4.41), '', '5.5dB'),
       ('c17', (0.03, 2.50), '', '-4.0dB'),
       ('c17', (3.11, 4.30), '', '-4.0dB'),
       ('i05', (1.60, 3.00), '', 0),
       ('c18', (0.62, 2.60), '', '3.0dB'),
       ('c18', (3.71, 4.86), '', '3.0dB'),
       ('r3', (3.00, 4.30), '', 0),
       ('c19', (0.77, 2.10), 'crop=540:960:180:0,', '2.0dB', [(1.2, '')]),
       ('c19', (3.17, 4.97), '', '2.0dB'),
       ('c20', (0.22, 1.80), '', '1.0dB'),
       ('c20', (2.62, 4.43), '', '1.0dB'),
       ('i06', (1.50, 3.00), '', 0),
       ('i07', (3.40, 4.80), '', 0),
       ('c21', (1.17, 2.46), '', '1.5dB'),
       ('c21', (3.38, 4.84), '', '1.5dB'),
       ('c22', (0.28, 1.75), 'crop=540:960:180:0,', '-1.0dB', [(1.0, '')]),
       ('c22', (2.39, 4.28), '', '-1.0dB'),
       ('c23', (0.19, 2.59), '', '1.5dB'),
       ('c23', (3.50, 4.95), '', '1.5dB'),
       ('c24', (0.45, 2.21), '', '-2.0dB'),
       ('c24', (2.36, 3.72), '', '-2.0dB'),
       ('c25', (1.06, 3.01), 'crop=540:960:180:0,', '0.0dB', [(1.0, '')]),
       ('c25', (3.67, 4.61), '', '0.0dB'),
       ('r4', (3.00, 4.30), '', 0),
       ('c26', (0.37, 2.40), '', '4.0dB'),
       ('c26', (3.19, 5.48), '', '4.0dB'),
       ('c27', (0.40, 1.85), '', '1.5dB'),
       ('c27', (2.55, 4.41), '', '1.5dB'),
       ('c28', (0.19, 1.63), '', '-0.5dB'),
       ('c28', (2.23, 4.59), '', '-0.5dB'),
       ('c29', (0.32, 1.95), '', '2.5dB'),
       ('c29', (2.90, 5.10), '', '2.5dB'),
       ('c30', (0.32, 2.28), 'crop=540:960:180:0,', '4.0dB', [(1.0, '')]),
       ('c30', (2.74, 5.06), '', '4.0dB'),
       ('c31', (0.74, 2.37), '', '-2.5dB'),
       ('c31', (3.15, 4.80), '', '-2.5dB'),
       ('i08', (1.00, 2.80), '', 0),
       ('c32', (0.58, 1.88), '', '1.5dB'),
       ('c32', (1.93, 3.56), '', '1.5dB'),
       ('c33', (0.40, 2.39), '', '1.0dB'),
       ('c33', (3.91, 5.25), '', '1.0dB'),
       ('BLACK', 0.4),
       ('c34', (0.64, 3.35), '', '-1.5dB', [(2.0, PUNCH)]),
       ('c34', (4.26, 5.61), '', '-1.5dB'),
       ('c34', (6.02, 9.52), '', '-1.5dB', [(7.77, PUNCH)])]


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
    t1, t2 = at("c21"), at("i08")  # suspenso 0-t1 (pagaré falso, llega Treviño, portón cerrado, maletín y troca), cálida t1-t2 (perdón a Lencho, "su papá me pidió que lo cuidara", la troca para Lencho), suspenso t2-fin (al panteón, CTA)
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
