"""Montaje de masa-honrada PARTE 1 (La Masa Honrada, video 26; copia del edit.py de pedida-mano: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/SINMARCA: música propia y SIN marca de agua; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "SINMARCA"  # SIN MARCA: video sin marca de agua (brand_wm devuelve un png transparente); la música sale de pieces/_marcas/SINMARCA
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

# v1 por frases (método aprobado de pedida-mano / camionero-p2): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7, scratch lv3.py).
# Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase; pausas que ahorran < 0.2 s no se cortan. Mismo personaje = salto dentro del clip.
# qa_clips.md: crops en el 1.er tramo c06 (placa, 0-3 s), c17, c24, c32; inicio tardío c04 >= 1.1, c25 >= 1.05, c30 >= 0.5; r2 3.25-4.75; r1-r5 mudos (ganancia 0).
# Ganancia por clip = -19.5 - LUFS del clip (redondeo 0.5 dB). c27 y c34 regenerados (v2 OK). BLACK 0.4 s antes del CTA (c34).
EDL = [('c01', (0.67, 2.72), '', '-2dB'), ('c01', (3.25, 6.34), '', '-2dB'), ('c01', (7.47, 9.52), '', '-2dB'),
       ('c02', (0.27, 3.98), '', '-2.5dB'), ('c02', (4.54, 6.81), '', '-2.5dB'),
       ('c03', (1.01, 3.82), '', '-2.5dB'), ('c03', (4.46, 7.09), '', '-2.5dB'),
       ('c04', (1.10, 5.42), '', '-0.5dB'),
       ('c05', (0.26, 3.59), '', '-3.5dB'), ('c05', (4.47, 6.61), '', '-3.5dB'),
       ('r1', (1.0, 2.5), '', 0),
       ('c06', (0.76, 3.87), 'crop=600:1067:120:213,', '0dB'), ('c06', (4.59, 6.51), '', '0dB'),
       ('c07', (0.99, 7.41), '', '-1.5dB'),
       ('c08', (0.02, 2.21), '', '2dB'), ('c08', (2.81, 4.59), '', '2dB'),
       ('c09', (0.06, 6.30), '', '-5dB'),
       ('c10', (0.06, 6.80), '', '-2dB'),
       ('c11', (0.02, 2.45), '', '-0.5dB'), ('c11', (3.15, 4.31), '', '-0.5dB'),
       ('r2', (3.25, 4.75), '', 0),
       ('c12', (0.11, 7.69), '', '-0.5dB'),
       ('c13', (0.50, 2.39), '', '4.5dB'), ('c13', (2.87, 5.38), '', '4.5dB'),
       ('c14', (0.62, 2.30), '', '-1dB'), ('c14', (3.06, 5.15), '', '-1dB'),
       ('c15', (1.10, 6.78), '', '1.5dB'),
       ('c16', (0.52, 2.75), '', '2dB'), ('c16', (3.39, 6.26), '', '2dB'),
       ('r3', (1.0, 2.5), '', 0),
       ('c17', (0.85, 5.87), 'crop=540:960:0:0,', '1.5dB'),
       ('c18', (0.58, 4.46), '', '2.5dB'),
       ('c19', (0.78, 2.84), '', '-3dB'), ('c19', (3.91, 8.60), '', '-3dB'),
       ('c20', (0.64, 2.57), '', '0dB'), ('c20', (3.10, 5.38), '', '0dB'),
       ('c21', (0.65, 1.82), '', '-2.5dB'), ('c21', (2.29, 4.39), '', '-2.5dB'),
       ('c22', (0.39, 7.36), '', '0.5dB'),
       ('c23', (1.07, 7.37), '', '1.5dB'),
       ('c24', (0.16, 3.35), 'crop=600:1067:0:0,', '0dB'), ('c24', (3.81, 6.05), '', '0dB'),
       ('c25', (1.05, 3.86), '', '-0.5dB'), ('c25', (4.50, 6.13), '', '-0.5dB'),
       ('c26', (0.46, 2.19), '', '-2dB'), ('c26', (2.89, 4.95), '', '-2dB'),
       ('c27', (0.48, 4.17), '', '1dB'), ('c27', (5.15, 6.14), '', '1dB'),
       ('r4', (1.0, 2.5), '', 0),
       ('c28', (0.21, 4.19), '', '2.5dB'), ('c28', (5.24, 6.98), '', '2.5dB'),
       ('c29', (0.88, 6.48), '', '-1.5dB'),
       ('c30', (0.70, 2.32), '', '-2dB'), ('c30', (3.02, 4.38), '', '-2dB'),
       ('c31', (0.60, 7.17), '', '1.5dB'),
       ('c32', (0.28, 3.32), 'crop=600:1067:120:0,', '1.5dB'), ('c32', (3.52, 5.24), '', '1.5dB'),
       ('c33', (0.68, 2.37), '', '-1dB'), ('c33', (2.96, 5.99), '', '-1dB'),
       ('r5', (1.0, 2.5), '', 0),
       ('BLACK', 0.4),
       ('c34', (0.34, 4.92), '', '-3.5dB'), ('c34', (5.40, 8.77), '', '-3.5dB')]

def main():
    if not EDL: sys.exit("EDL vacía: correr phr.py y armarla con renders/phr.json")
    L = {}  # borrador: frases de whisper por clip (solo para entradas con índice)
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
    # SINMARCA (kit _marcas: sin texto, wm.png transparente; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c22"), at("c31")  # suspenso 0-t1 (la amenaza, el truco, se van los clientes, la cena, la confrontación), cálida t1-t2 (la colonia vuelve con Lupe, cae Yesenia, le da trabajo), suspenso t2-fin (Yesenia trama, Lupe ya lo sabe, y CTA)
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
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "2:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
