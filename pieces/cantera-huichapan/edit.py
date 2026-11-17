"""Montaje de cantera-huichapan PARTE 1 (La Cantera de Huichapan, MAJESTIC STORIES; copia del edit.py de aserrin-huamantla: montaje por frases desde renders/phr.json).
Uso: python -I edit.py  -> renders/share.mp4 (kit _marcas/MAJESTIC: música propia, marca arriba a la izquierda, x=36, y=210; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "MAJESTIC"  # MAJESTIC STORIES: marca arriba a la izquierda, x=36, y=210 (22 px, alfa 80) y música de pieces/_marcas/MAJESTIC
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
# Frases cortas en su plano, mismo personaje = salto dentro de su clip (c28-c29: Rosalba; c26-c27: Sotero; c11→c12 y c19→c20 son cambio de escena, no salto), insertos y reacciones de ~1.0-1.2 s.
# i01 <= 0.9 s para que "Abdías, antes de que acabe el turno…" entre antes de los 2 s. BLACK de 0.4 s antes de c30 (CTA).
EDL = [('i01', (2.0, 3.0), '', 0),
       ('c01', (0.13, 2.68), ER, '0.0dB', [(2.7, '')]),
       ('c01', (3.07, 5.29), '', '0.0dB'),
       ('c02', (0.67, 4.80), '', '1.5dB', [(2.73, PUNCH)]),
       ('c03', (0.54, 2.75), '', '1.5dB'),
       ('c03', (3.44, 4.57), '', '1.5dB'),
       ('c04', (0.67, 2.65), '', '1.5dB'),
       ('c04', (3.49, 5.13), '', '1.5dB'),
       ('c05', (0.79, 1.81), '', '2.5dB'),
       ('c05', (3.38, 4.65), '', '2.5dB'),
       ('c05', (5.18, 5.98), '', '2.5dB'),
       ('c06', (0.62, 5.82), '', '6.5dB', [(3.22, PUNCH)]),
       ('c07', (0.38, 2.47), '', '1.5dB'),
       ('c07', (2.74, 4.21), '', '1.5dB'),
       ('c08', (0.02, 5.54), '', '2.5dB', [(2.78, PUNCH)]),
       ('i02', (2.5, 3.7), '', 0),
       ('c09', (0.36, 1.65), '', '0.5dB'),
       ('c09', (2.25, 3.74), '', '0.5dB'),
       ('c10', (0.02, 5.29), '', '2.0dB', [(2.66, PUNCH)]),
       ('c11', (0.83, 5.81), '', '2.5dB', [(3.32, PUNCH)]),
       ('c12', (0.35, 4.21), '', '3.0dB', [(2.28, PUNCH)]),
       ('c13', (0.07, 0.84), 'crop=640:1138:0:40,', '3.0dB'),  # crops: manga de mezclilla ajena en el borde derecho
       ('c13', (1.19, 2.94), 'crop=640:1138:0:40,', '3.0dB'),
       ('c13', (3.23, 4.76), 'crop=640:1138:0:40,', '3.0dB'),
       ('c14', (0.63, 4.32), '', '4.5dB', [(2.48, PUNCH)]),
       ('c15', (0.17, 1.19), '', '-2.0dB'),
       ('c15', (1.63, 3.29), '', '-2.0dB'),
       ('c15', (3.60, 5.90), '', '-2.0dB'),
       ('c16', (1.07, 2.62), '', '1.0dB'),
       ('c16', (3.57, 4.31), '', '1.0dB'),
       ('c17', (0.05, 4.66), '', '0.0dB', [(2.35, PUNCH)]),
       ('c18', (0.15, 4.33), ER, '2.0dB', [(0.7, ''), (2.24, PUNCH)]),
       ('r1', (3.0, 4.2), '', 0),
       ('c19', (0.56, 2.47), '', '4.0dB'),
       ('c19', (3.41, 5.23), '', '4.0dB'),
       ('c20', (0.26, 2.86), ER, '3.5dB', [(1.3, '')]),
       ('c21', (0.91, 5.30), '', '4.5dB', [(3.1, PUNCH)]),
       ('c22', (1.08, 3.62), '', '4.0dB'),
       ('c22', (4.12, 5.60), '', '4.0dB'),
       ('c23', (0.21, 5.00), '', '3.5dB', [(2.6, PUNCH)]),
       ('c24', (0.44, 2.80), ER, '0.0dB', [(2.8, '')]),
       ('c24', (3.50, 4.90), '', '0.0dB'),
       ('c25', (0.99, 3.37), '', '4.0dB'),
       ('c25', (4.20, 5.01), '', '4.0dB'),
       ('c26', (0.23, 2.34), '', '6.0dB'),
       ('c26', (3.12, 4.92), '', '6.0dB'),
       ('c27', (1.04, 5.77), '', '-0.5dB', [(3.4, PUNCH)]),
       ('i03', (2.0, 3.2), '', 0),
       ('c28', (0.82, 2.69), '', '-2.5dB'),
       ('c28', (3.28, 4.73), '', '-2.5dB'),
       ('c29', (0.48, 4.22), '', '-1.5dB', [(2.35, PUNCH)]),
       ('r2', (2.5, 3.7), '', 0),
       ('BLACK', 0.4),
       ('c30', (0.78, 3.60), '', '-2.5dB', [(1.8, PUNCH)]),
       ('c30', (4.20, 7.85), '', '-2.5dB', [(6.0, PUNCH)])]


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
    # MAJESTIC (kit _marcas: marca MAJESTIC STORIES, marca arriba a la izquierda, x=36, y=210, música propia; sin CONTINUARÁ)
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    # duración real del plano = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corre las camas)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c11"), at("c12")  # suspenso 0-t1 (manos sin guantes, "antes de que acabe el turno", los guantes devueltos, el cobro de Sotero, los lentes pegados), cálida t1-t2 ("no le digas a nadie que hablamos", el celular en llamada), suspenso t2-fin (las mentiras de Sotero, la amenaza, la caseta, "escuché cada palabra", CTA)
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
