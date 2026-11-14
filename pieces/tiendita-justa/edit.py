"""Montaje de tiendita-justa PARTE 1 (La Tiendita del Precio Justo, video 25; copia del edit.py de pedida-mano: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/MEXI: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "MEXI"  # MEXI STORIES: música + marca de agua (arriba a la derecha, alineada a la derecha, margen 36, y=210) salen de pieces/_marcas/MEXI
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

# v1 por frases (método aprobado de pedida-mano / masa-honrada): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7, scratch lv3_tj.py).
# Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase; pausas que ahorran < 0.2 s no se cortan. Mismo personaje = salto dentro del clip.
# qa_clips.md: crops en el 1.er tramo c16, c20, c27, c28, c36, c39; c12 y c40 (v2) en todos sus tramos; r1 desde 1.25 (doble hasta 1.1); c26/c32/c40 empiezan tarde por la voz; r1-r3 mudos (ganancia 0).
# Ganancia por clip = -19.5 - LUFS del clip (renders/lufs.txt, redondeo 0.5 dB). c07, c34 y c40 regenerados (v2 OK). BLACK 0.4 s antes del CTA (c42).
EDL = [('c01', (1.01, 5.46), '', '2.5dB'), ('c01', (6.14, 7.42), '', '2.5dB'),
       ('c02', (1.00, 6.70), '', '3dB'),
       ('r1', (1.25, 2.75), '', 0),
       ('c03', (0.95, 4.15), '', '2dB'),
       ('c04', (0.81, 6.43), '', '-3dB'),
       ('c05', (0.91, 3.11), '', '5dB'),
       ('c06', (1.09, 4.15), '', '5dB'), ('c06', (4.82, 6.46), '', '5dB'),
       ('c07', (0.75, 2.53), '', '-1dB'), ('c07', (3.25, 6.41), '', '-1dB'),
       ('c08', (0.35, 5.76), '', '-1dB'),
       ('c09', (0.75, 2.61), '', '-1dB'), ('c09', (3.63, 5.37), '', '-1dB'),
       ('c10', (0.88, 6.93), '', '-3dB'),
       ('c11', (1.07, 4.29), '', '0dB'),
       ('c12', (1.12, 2.82), 'crop=540:960:0:0,', '-1.5dB'), ('c12', (3.51, 5.77), 'crop=540:960:0:0,', '-1.5dB'),
       ('c13', (0.41, 2.12), '', '-1dB'), ('c13', (2.84, 9.04), '', '-1dB'),
       ('c14', (0.80, 2.48), '', '1.5dB'), ('c14', (3.55, 5.09), '', '1.5dB'),
       ('c15', (0.51, 5.08), '', '1.5dB'),
       ('c16', (0.77, 1.93), 'crop=540:960:0:0,', '-3dB'), ('c16', (3.37, 4.73), '', '-3dB'),
       ('c17', (0.70, 6.71), '', '-1.5dB'),
       ('c18', (0.60, 3.59), '', '-3.5dB'), ('c18', (4.08, 7.18), '', '-3.5dB'),
       ('c19', (0.02, 3.35), '', '-2.5dB'), ('c19', (4.06, 5.81), '', '-2.5dB'),
       ('c20', (0.32, 2.01), 'crop=540:960:180:0,', '-1dB'), ('c20', (2.35, 4.11), '', '-1dB'),
       ('c21', (0.84, 5.24), '', '-3.5dB'),
       ('c22', (0.18, 3.04), '', '1.5dB'), ('c22', (4.42, 6.06), '', '1.5dB'),
       ('c23', (0.60, 4.37), '', '3.5dB'),
       ('c24', (0.76, 4.11), '', '5.5dB'), ('c24', (5.34, 6.77), '', '5.5dB'),
       ('c25', (1.40, 3.60), '', '5dB'),
       ('c26', (0.80, 3.07), '', '-4.5dB'), ('c26', (3.96, 6.53), '', '-4.5dB'),
       ('c27', (0.49, 2.52), 'crop=540:960:180:0,', '-3.5dB'), ('c27', (3.49, 5.32), '', '-3.5dB'),
       ('c28', (0.39, 2.16), 'crop=540:960:0:0,', '-4dB'), ('c28', (2.84, 3.89), '', '-4dB'),
       ('c29', (0.50, 2.16), '', '2dB'), ('c29', (2.57, 3.98), '', '2dB'),
       ('c30', (1.14, 6.79), '', '5dB'),
       ('c31', (1.16, 2.96), '', '2.5dB'), ('c31', (4.09, 6.31), '', '2.5dB'),
       ('c32', (1.03, 3.10), '', '4.5dB'), ('c32', (4.21, 7.05), '', '4.5dB'),
       ('c33', (1.00, 2.84), '', '1.5dB'),
       ('c34', (1.74, 3.30), '', '3.5dB'),
       ('c35', (0.44, 6.61), '', '-0.5dB'),
       ('c36', (0.71, 2.73), 'crop=540:960:180:0,', '-3dB'), ('c36', (3.53, 6.94), '', '-3dB'),
       ('c37', (0.48, 2.05), '', '-1dB'), ('c37', (2.73, 4.62), '', '-1dB'),
       ('c38', (0.50, 2.25), '', '-0.5dB'), ('c38', (3.07, 4.24), '', '-0.5dB'),
       ('c39', (0.02, 3.52), 'crop=540:960:180:0,', '-3.5dB'), ('c39', (4.71, 6.85), '', '-3.5dB'),
       ('c40', (1.28, 4.05), 'crop=600:1067:0:0,', '-3dB'),
       ('r2', (1.0, 2.5), '', 0),
       ('c41', (0.42, 5.85), '', '2.5dB'),
       ('r3', (1.0, 2.5), '', 0),
       ('BLACK', 0.4),
       ('c42', (0.65, 3.03), '', '-4.5dB'), ('c42', (3.93, 5.84), '', '-4.5dB'), ('c42', (6.70, 9.03), '', '-4.5dB')]

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
    # marca MEXI STORIES (kit _marcas: 22 px, alpha 80, arriba a la derecha, margen 36, y=210; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c07"), at("c24")  # suspenso 0-t1 (Evaristo pierde clientes), cálida t1-t2 (éxito de Chuy, doña Toña, la bodega, la camioneta), suspenso t2-fin (envidia, la queja, el inspector y CTA)
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
