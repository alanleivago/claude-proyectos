"""Montaje de huipil-robado PARTE 1 (El Huipil Robado; copia del edit.py de masa-honrada: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/VISTA: música y marca de agua de la marca; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "VISTA"  # VISTA STORIES: arriba al centro, y=135, alfa 80; música de pieces/_marcas/VISTA
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

# v1 por frases (método aprobado de regreso-20-p2 / tiendita-justa): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7, scratch lv3.py).
# Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase; pausas que ahorran < 0.2 s no se cortan. Mismo personaje = salto dentro del clip.
# qa_clips.md: crops en el 1.er tramo c02, c11, c20, c27, c28 (576:1024), c33; arranques c10/c16 >= 0.3, c25 >= 0.8, c30 >= 0.4; r1 2.0, r2/r3 1.25, r4 2.5 (colibrí); r1-r4 mudos (ganancia 0).
# Ganancia por clip = -19.5 - LUFS del clip (ebur128, redondeo 0.5 dB). BLACK 0.4 s antes del CTA (c35).
EDL = [('c01', (0.58, 8.25), '', '-0.5dB'),
       ('c02', (0.49, 6.87), 'crop=600:1067:0:0,', '-1dB'),
       ('c03', (0.80, 2.84), '', '3dB'), ('c03', (4.13, 7.39), '', '3dB'),
       ('c04', (1.00, 3.14), '', '0dB'), ('c04', (3.79, 5.19), '', '0dB'),
       ('c05', (1.24, 3.41), '', '0dB'), ('c05', (4.39, 7.26), '', '0dB'),
       ('r1', (2.00, 3.50), '', 0),
       ('c06', (1.25, 7.46), '', '-3dB'),
       ('c07', (1.09, 6.65), '', '1dB'),
       ('c08', (1.32, 7.47), '', '-1.5dB'),
       ('c09', (1.02, 6.75), '', '1dB'),
       ('r2', (1.25, 2.75), '', 0),
       ('c10', (0.69, 3.57), '', '-1dB'), ('c10', (3.87, 6.95), '', '-1dB'),
       ('c11', (1.57, 6.75), 'crop=600:1067:120:0,', '4dB'),
       ('c12', (0.36, 4.24), '', '-1dB'), ('c12', (4.44, 7.69), '', '-1dB'),
       ('c13', (0.75, 6.26), '', '2dB'),
       ('c14', (0.26, 6.86), '', '-1.5dB'),
       ('c15', (0.82, 3.57), '', '-1.5dB'), ('c15', (4.35, 7.27), '', '-1.5dB'),
       ('c16', (0.44, 2.37), '', '-0.5dB'), ('c16', (2.63, 5.35), '', '-0.5dB'),
       ('c17', (0.42, 6.02), '', '1dB'),
       ('c18', (0.77, 3.74), '', '0dB'), ('c18', (4.05, 5.65), '', '0dB'),
       ('c19', (0.81, 2.70), '', '1.5dB'), ('c19', (3.35, 5.40), '', '1.5dB'),
       ('c20', (0.33, 2.59), 'crop=600:1067:120:0,', '-2.5dB'), ('c20', (3.93, 5.57), '', '-2.5dB'),
       ('c21', (0.81, 3.62), '', '-2dB'), ('c21', (3.97, 5.56), '', '-2dB'),
       ('c22', (0.44, 2.04), '', '4.5dB'), ('c22', (2.57, 5.45), '', '4.5dB'),
       ('c23', (0.60, 4.66), '', '-3dB'),
       ('c24', (1.52, 4.62), '', '-1.5dB'), ('c24', (5.19, 7.47), '', '-1.5dB'),
       ('c25', (1.24, 1.93), '', '-2dB'), ('c25', (3.08, 5.51), '', '-2dB'), ('c25', (5.77, 7.94), '', '-2dB'),
       ('c26', (0.23, 5.02), '', '0dB'),
       ('c27', (0.02, 2.35), 'crop=600:1067:120:0,', '2.5dB'), ('c27', (2.97, 4.63), '', '2.5dB'), ('c27', (4.95, 7.30), '', '2.5dB'),
       ('c28', (0.02, 2.32), 'crop=576:1024:0:0,', '-1.5dB'), ('c28', (3.01, 5.35), '', '-1.5dB'),
       ('c29', (0.83, 5.69), '', '-1.5dB'),
       ('r3', (1.25, 2.75), '', 0),
       ('c30', (1.11, 2.65), '', '1.5dB'), ('c30', (3.99, 7.43), '', '1.5dB'),
       ('c31', (0.47, 5.96), '', '1.5dB'),
       ('c32', (0.53, 2.60), '', '0.5dB'), ('c32', (2.91, 6.49), '', '0.5dB'),
       ('c33', (1.00, 2.65), 'crop=600:1067:120:0,', '-0.5dB'), ('c33', (2.87, 4.18), '', '-0.5dB'),
       ('c34', (0.62, 7.70), '', '-0.5dB'),
       ('r4', (2.50, 4.50), '', 0),
       ('BLACK', 0.4),
       ('c35', (0.37, 4.56), '', '1.5dB'), ('c35', (5.31, 9.18), '', '1.5dB')]

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
        vf = (pre[0] if pre else "") + "scale=720:1280,setsar=1,fps=24,tpad=stop_mode=clone:stop_duration=0.5" + (f",fade=t=out:st={d - 0.6:.2f}:d=0.6" if fade else "")
        af = (f"volume={pre[1]}," if len(pre) > 1 else "") + f"aresample=48000,apad,atrim=0:{d:.5f},afade=t=in:d=0.04,afade=t=out:st={d - (0.6 if fade else 0.06):.2f}:d={0.6 if fade else 0.06}"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-i", str(src), "-vf", vf,
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
    t1, t2 = at("c10"), at("c14")  # suspenso 0-t1 (la humillación y la blusa en la página de Romina), cálida t1-t2 (deciden bajar a la feria), suspenso t2-fin (Romina las bloquea, la feria, la calle de noche, el colibrí y CTA)
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
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
