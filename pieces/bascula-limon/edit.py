"""Montaje de bascula-limon PARTE 1 (La Báscula Arreglada; copia del edit.py de huipil-robado: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/SINMARCA: música y marca de agua de la marca; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "SINMARCA"  # SIN MARCA: brand_wm() da un png transparente (sin marca de agua); música propia de pieces/_marcas/SINMARCA
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

# v1 por frases (método aprobado de foto-trucada/casera-recibos): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7).
# Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase; pausas que ahorran < 0.2 s no se cortan. Mismo personaje = salto dentro del clip.
# qa_clips.md: hflip c01 c05; crops de borde c03 c09 c10 c11 c15 c22 c23 c25 c30; arranques c03 0.75, c04 >= 0.75, c05 >= 0.3, c06 >= 0.75, c15 0.6, c16 >= 0.5, c23 0.5.
# r1-r4 mudos (ganancia 0). Ganancia por clip = -19.5 - LUFS (ebur128, 0.5 dB). BLACK 0.4 s antes del CTA (c31).
# 5.º campo = cambios de encuadre dentro del tramo SIN cortar el audio: [(t_fuente, vf), ...] (fin del crop de borde o punch-in en planos > 3 s).
PUNCH = "crop=576:1024:72:40,"
EDL = [('c01', (0.90, 2.85), 'hflip,', '2dB'), ('c01', (3.44, 5.03), 'hflip,', '2dB'), ('c01', (6.04, 8.92), 'hflip,', '2dB', [(7.30, 'hflip,' + PUNCH)]),
       ('c02', (0.50, 2.83), '', '-1dB'), ('c02', (3.25, 4.55), '', '-1dB'),
       ('c03', (0.75, 2.72), 'crop=600:1067:120:0,', '3dB'), ('c03', (3.57, 4.87), '', '3dB'),
       ('c04', (0.82, 2.43), '', '-1dB'), ('c04', (3.45, 4.95), '', '-1dB'),
       ('c05', (0.54, 2.80), 'hflip,', '0.5dB'), ('c05', (3.73, 5.55), 'hflip,', '0.5dB'),
       ('r1', (1.0, 2.5), '', 0),
       ('c06', (1.08, 3.98), '', '-0.5dB'), ('c06', (4.66, 7.12), '', '-0.5dB'),
       ('c07', (0.02, 2.69), '', '-3.5dB'), ('c07', (3.53, 4.76), '', '-3.5dB'),
       ('c08', (0.63, 1.44), '', '-1.5dB'), ('c08', (1.78, 3.69), '', '-1.5dB'), ('c08', (4.16, 5.29), '', '-1.5dB'),
       ('c09', (0.50, 3.34), 'crop=540:960:0:0,', '-2dB', [(2.40, '')]), ('c09', (4.29, 7.52), '', '-2dB', [(5.92, PUNCH)]),
       ('c10', (0.56, 2.44), 'crop=540:960:180:0,', '-1dB', [(1.10, '')]), ('c10', (3.41, 5.34), '', '-1dB'),
       ('c11', (0.21, 0.85), 'crop=540:960:180:0,', '-2.5dB'), ('c11', (1.48, 4.17), '', '-2.5dB'), ('c11', (4.38, 7.39), '', '-2.5dB', [(6.18, PUNCH)]),
       ('c12', (0.31, 2.78), '', '-4dB'), ('c12', (3.14, 5.17), '', '-4dB'),
       ('c13', (1.36, 5.07), '', '-0.5dB', [(2.75, PUNCH)]), ('c13', (5.38, 7.56), '', '-0.5dB'),
       ('c14', (0.53, 2.48), '', '-1dB'), ('c14', (2.98, 5.12), '', '-1dB'),
       ('c15', (0.60, 2.82), 'crop=600:1067:0:0,', '-1.5dB'), ('c15', (3.48, 4.52), '', '-1.5dB'),
       ('r2', (1.5, 3.5), '', 0),
       ('c16', (0.62, 2.35), '', '-0.5dB'), ('c16', (2.89, 5.82), '', '-0.5dB'),
       ('c17', (0.56, 2.36), '', '1dB'), ('c17', (3.25, 5.33), '', '1dB'),
       ('c18', (0.12, 2.94), '', '2.5dB'), ('c18', (3.39, 5.77), '', '2.5dB'),
       ('c19', (0.52, 3.02), '', '-1dB'), ('c19', (3.74, 5.64), '', '-1dB'),
       ('c20', (0.04, 0.75), '', '4dB'), ('c20', (1.05, 4.05), '', '4dB', [(2.85, PUNCH)]), ('c20', (5.69, 7.63), '', '4dB'),
       ('c21', (0.56, 2.39), '', '1dB'), ('c21', (2.78, 4.43), '', '1dB'), ('c21', (5.03, 7.64), '', '1dB'),
       ('c22', (0.11, 1.96), 'crop=600:1067:0:0,', '-4dB', [(1.40, '')]), ('c22', (2.38, 4.61), '', '-4dB'),
       ('c23', (0.50, 2.73), 'crop=576:1024:144:0,', '0dB', [(1.00, '')]), ('c23', (3.53, 4.72), '', '0dB'),
       ('r3', (1.25, 2.75), '', 0),
       ('c24', (0.75, 2.66), '', '-0.5dB'), ('c24', (3.44, 5.62), '', '-0.5dB'),
       ('c25', (0.18, 1.82), 'crop=504:896:216:0,', '-3dB'), ('c25', (2.09, 3.53), '', '-3dB'), ('c25', (3.81, 5.20), '', '-3dB'),
       ('c26', (0.62, 2.08), '', '-2.5dB'), ('c26', (3.30, 4.89), '', '-2.5dB'),
       ('c27', (0.36, 4.12), '', '1.5dB', [(2.45, PUNCH)]), ('c27', (4.53, 6.57), '', '1.5dB'),
       ('c28', (1.09, 4.93), '', '-1dB', [(2.86, PUNCH)]), ('c28', (5.75, 7.14), '', '-1dB'),
       ('c29', (0.26, 1.68), '', '-2.5dB'), ('c29', (2.39, 4.30), '', '-2.5dB'),
       ('c30', (0.53, 1.84), 'crop=600:1067:120:0,', '-0.5dB'), ('c30', (2.58, 3.88), '', '-0.5dB'),
       ('r4', (1.25, 2.75), '', 0),
       ('BLACK', 0.4),
       ('c31', (0.76, 3.70), '', '-3dB'), ('c31', (4.74, 7.62), '', '-3dB', [(5.70, PUNCH)]), ('c31', (8.19, 9.44), '', '-3dB')]

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
        if sw:  # cambio de encuadre sin cortar el audio: un trim por tramo y concat
            bs = [0] + [round((t - s) * 24) / 24 for t, _ in sw] + [d + 0.5]; vfs = [pre[0]] + [v for _, v in sw]; k = len(vfs)
            fc = f"[0:v]split={k}" + "".join(f"[s{j}]" for j in range(k)) + ";" + "".join(
                f"[s{j}]trim=start={bs[j]:.5f}:end={bs[j + 1]:.5f},setpts=PTS-STARTPTS,{vfs[j]}scale=720:1280,setsar=1,fps=24[o{j}];" for j in range(k)) + \
                "".join(f"[o{j}]" for j in range(k)) + f"concat=n={k}:v=1:a=0,{tail}[v]"
            vargs = ["-filter_complex", fc, "-map", "[v]", "-map", "0:a"]
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
    # SINMARCA (kit _marcas: marca de agua transparente y música de la marca; sin CONTINUARÁ)
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    # duración real del plano = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corre las camas)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c10"), at("c13")  # (guion: la cálida entra en c10, "La decisión") suspenso 0-t1 (la báscula, la humillación y la cuenta de Daniela), cálida t1-t2 (deciden probar con el bulto), suspenso t2-fin (la prueba, el veto, el porche, el gancho y CTA)
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
