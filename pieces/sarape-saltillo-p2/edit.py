"""Montaje de sarape-saltillo-p2 PARTE 2 (El Sarape de Saltillo · Parte 2, VISTA STORIES, la misma marca de la Parte 1; copia del edit.py de jipi-becal-p2: montaje por frases desde renders/phr.json, SPEED 1.15).
Uso: python -I edit.py  -> renders/share.mp4 (kit _marcas/VISTA: música propia, marca arriba al centro, y=135; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
SPEED = 1.15  # Atrium acelera 1.15-1.2x (usuario: 1.15x) imagen y voz (tono conservado), salida a 30 fps: fuentes/atrium-vista/velocidad.md
BRAND = "VISTA"  # VISTA STORIES: marca arriba al centro, y=135 (22 px, alfa 80) y música de pieces/_marcas/VISTA
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
# Por armar desde renders/phr.json (python -I phr.py). Objetivo: <=2 s por TRAMO real (sin contar punch-in).
# Frases cortas en su plano, mismo personaje = salto dentro de su clip (c10-c12 Mauricio, c14-c16 Clementina con Fabián en medio), insertos y reacciones de ~1.0-1.2 s.
# Arranca en c01 (Fabián ya hablando en la puerta, sin plano previo de objetos): "¿Suegra? ¿Usted qué hace bajándose de ese carro?" entra antes de los 2 s. Insertos solo en medio. BLACK de 0.4 s antes de c26 (CTA).
EDL = [('c01', (0.56, 1.23), '', '1.5dB'),
       ('c01', (1.49, 3.32), '', '1.5dB'),
       ('c01', (3.68, 6.47), '', '1.5dB', [(5.08, PUNCH)]),
       ('r1', (3.0, 4.2), '', 0),
       ('c02', (0.51, 1.64), '', '0.0dB'),
       ('c02', (2.09, 3.03), '', '0.0dB'),
       ('c02', (3.56, 4.75), '', '0.0dB'),
       ('c02', (5.57, 7.29), '', '0.0dB'),
       ('c03', (0.95, 2.20), '', '2.5dB'),
       ('c03', (3.32, 5.34), '', '2.5dB'),
       ('r2', (3.0, 4.2), '', 0),
       ('c04', (0.70, 2.71), '', '0.5dB'),
       ('c04', (3.51, 5.58), '', '0.5dB'),
       ('c05', (0.74, 5.57), '', '1.0dB', [(3.16, PUNCH)]),
       ('c06', (1.16, 3.04), '', '3.0dB'),
       ('c06', (3.96, 5.27), '', '3.0dB'),
       ('c06', (5.51, 6.93), '', '3.0dB'),
       ('c07', (0.62, 2.78), '', '2.0dB'),
       ('c07', (3.58, 4.82), '', '2.0dB'),
       ('c08', (2.21, 5.45), '', '1.0dB', [(3.83, PUNCH)]),
       ('c09', (0.81, 3.32), '', '-0.5dB'),
       ('c09', (3.92, 5.78), '', '-0.5dB'),
       ('i01', (3.0, 4.4), '', 0),
       ('c10', (0.51, 2.82), '', '3.5dB'),
       ('c10', (3.72, 7.57), '', '3.5dB', [(5.65, PUNCH)]),
       ('c11', (0.69, 4.76), '', '4.0dB', [(2.73, PUNCH)]),
       ('c12', (0.41, 2.80), '', '0.0dB'),
       ('c12', (5.00, 6.90), '', '0.0dB'),
       ('r3', (3.0, 4.2), '', 0),
       ('c13', (0.10, 2.87), '', '3.5dB', [(1.49, PUNCH)]),
       ('c13', (3.19, 5.05), '', '3.5dB'),
       ('c14', (1.13, 7.16), '', '0.0dB', [(4.14, PUNCH)]),
       ('c15', (0.70, 3.27), '', '-1.5dB'),
       ('c15', (3.89, 5.57), '', '-1.5dB'),
       ('c16', (0.46, 3.26), '', '-0.5dB'),  # c16 regenerado (antes "ya se nepan de pulque")
       ('c16', (3.73, 5.86), '', '-0.5dB'),
       ('c17', (0.77, 2.53), '', '0.5dB'),
       ('c17', (3.64, 5.68), '', '0.5dB'),
       ('c18', (0.80, 3.35), '', '0.5dB'),
       ('c18', (4.06, 7.15), '', '0.5dB', [(5.61, PUNCH)]),
       ('i02', (3.5, 5.0), '', 0),
       ('c19', (0.43, 3.39), '', '-1.5dB', [(1.91, PUNCH)]),
       ('c19', (4.06, 5.59), '', '-1.5dB'),
       ('c19', (6.14, 7.33), '', '-1.5dB'),
       ('c20', (0.72, 2.95), '', '0.0dB'),
       ('c20', (3.88, 5.57), '', '0.0dB'),
       ('c21', (0.66, 3.46), '', '-0.5dB', [(2.06, PUNCH)]),
       ('c22', (1.34, 3.90), '', '0.0dB'),
       ('c22', (4.60, 5.86), '', '0.0dB'),
       ('c22', (6.16, 7.38), '', '0.0dB'),
       ('c23', (0.61, 2.21), '', '3.0dB'),
       ('c23', (2.85, 5.56), '', '3.0dB', [(4.21, PUNCH)]),
       ('r4', (3.0, 4.2), '', 0),
       ('c24', (0.02, 4.04), '', '1.0dB', [(2.03, PUNCH)]),
       ('c25', (1.02, 2.85), '', '3.0dB'),
       ('c25', (3.77, 6.81), '', '3.0dB', [(5.29, PUNCH)]),
       ('BLACK', 0.4),
       ('c26', (0.35, 9.3), '', '4.0dB', [(1.8, PUNCH), (6.5, '')])]


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
    fast = R / "raw_fast.mov"
    if not (REMIX and fast.exists()):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-filter_complex",
                        f"[0:v]setpts=PTS/{SPEED},fps=30[v];[0:a]atempo={SPEED}[a]", "-map", "[v]", "-map", "[a]",
                        "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(fast)], check=True)
    raw = fast
    # VISTA (kit _marcas: marca VISTA STORIES arriba al centro, y=135, música propia; sin CONTINUARÁ)
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    # duración real del plano = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corre las camas)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]]) / SPEED
    t1, t2 = at("c19"), at("c24")  # suspenso 0-t1 (el carro del dueño, "fue mi nana", el sarape tirado, Fabián pierde la oficina, Florinda), cálida t1-t2 (el sarape para Tereso, "así lo crié"), suspenso t2-fin (Florinda contra Fabián, su amenaza y CTA)
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
