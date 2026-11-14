"""Montaje de fierro-herradura PARTE 1 (El Fierro de Herradura; copia del edit.py aprobado de nochebuena: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/VISTA: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "VISTA"  # VISTA STORIES: música + marca de agua (arriba al centro, y=135) salen de pieces/_marcas/VISTA
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

# v1 por frases (método aprobado de nochebuena): rangos de renders/phr.json (envolvente de voz) confirmados con faster-whisper large-v3: entra 0.08 s antes de la voz
# y sale 0.15 s después, cortes solo en fin de frase; mismo personaje = salto dentro del clip. QA (qa_clips.md): r1-r3, i1, i2 mudos (ganancia 0); punch-in (crop) en la
# frase 1 de c02/c03/c05/c07/c09/c14/c23/c27; c17 regenerado con crop=608:1081:0:0 en todo el clip (vuelve un sombrero crema en el borde DER.); r1 4.0-5.5, r2 desde 1.0,
# c16 desde 1.02 ("Papá…" arranca en 1.10; el paneo ya terminó), c25 desde 1.51 ("Jacinta…"), c29 desde 1.09; i2 regenerado sin letras 2.9-4.4 (sale una mano en 4.5);
# c01 desde 0.80 (ruido antes de la voz), c28 desde 3.24 ("Mmm" en 0.8-1.8). Ganancias por clip hacia ~-19.5 LUFS. BLACK 0.4 s antes del CTA (c30).
EDL = [('c01', (0.80, 4.20), '', '4dB'), ('c01', (5.41, 7.21), '', '4dB'), ('c01', (7.70, 9.10), '', '4dB'), ('c02', (0.40, 2.70), 'crop=576:1024:0:0,'),
       ('c02', (3.62, 6.19)), ('c03', (0.60, 1.98), 'crop=594:1056:126:0,', '2dB'), ('c03', (2.20, 4.34), '', '2dB'), ('c03', (5.25, 8.63), '', '2dB'),
       ('c04', (0.54, 1.88), '', '3dB'), ('c04', (2.06, 3.66), '', '3dB'), ('c04', (4.72, 6.37), '', '3dB'), ('c04', (6.95, 9.24), '', '3dB'),
       ('c05', (0.41, 2.96), 'crop=540:960:0:0,', '2dB'), ('c05', (3.58, 5.79), '', '2dB'), ('c06', (1.05, 2.42)), ('c06', (2.64, 4.25)), ('c06', (5.10, 7.16)),
       ('c06', (7.84, 9.61)), ('c07', (0.37, 2.21), 'crop=624:1109:0:0,'), ('c07', (2.76, 5.51)), ('r1', (4.00, 5.50), '', 0), ('c08', (0.36, 2.35), '', '-4dB'),
       ('c08', (2.91, 6.08), '', '-4dB'), ('c09', (0.29, 2.54), 'crop=594:1056:126:0,', '3dB'), ('c09', (3.27, 4.85), '', '3dB'), ('c09', (5.38, 7.43), '', '3dB'),
       ('c10', (0.29, 3.48), '', '2dB'), ('c10', (4.43, 5.95), '', '2dB'), ('c10', (6.41, 7.68), '', '2dB'), ('c11', (1.07, 3.70), '', '3dB'),
       ('c11', (4.55, 7.20), '', '3dB'), ('i1', (2.00, 3.50), '', 0), ('c12', (1.23, 3.24), '', '-1dB'), ('c12', (4.49, 6.32), '', '-1dB'),
       ('c13', (0.70, 2.34), '', '2dB'), ('c13', (3.59, 6.66), '', '2dB'), ('c14', (0.29, 2.41), 'crop=594:1056:126:0,', '2dB'), ('c14', (3.16, 5.73), '', '2dB'),
       ('c15', (0.66, 3.75), '', '-2dB'), ('c15', (4.55, 6.08), '', '-2dB'), ('c16', (1.02, 1.63), '', '5dB'), ('c16', (2.66, 5.22), '', '5dB'),
       ('c16', (5.92, 8.47), '', '5dB'), ('c17', (0.64, 2.30), 'crop=608:1081:0:0,', '4dB'), ('c17', (3.22, 5.30), 'crop=608:1081:0:0,', '4dB'),
       ('c18', (0.26, 1.90), '', '1dB'), ('c18', (2.72, 5.91), '', '1dB'), ('r2', (1.00, 2.50), '', 0), ('c19', (0.49, 3.68), '', '2dB'), ('c19', (4.89, 7.00), '', '2dB'),
       ('c19', (7.25, 9.43), '', '2dB'), ('c20', (0.71, 2.96), '', '4dB'), ('c20', (4.10, 6.80), '', '4dB'), ('c21', (0.68, 2.48), '', '4dB'),
       ('c21', (3.54, 4.82), '', '4dB'), ('c22', (0.36, 1.65), '', '-4dB'), ('c22', (1.96, 3.70), '', '-4dB'), ('c22', (4.24, 6.85), '', '-4dB'),
       ('i2', (2.90, 4.40), '', 0), ('c23', (0.32, 1.66), 'crop=560:996:0:0,', '3dB'), ('c23', (2.16, 5.22), '', '3dB'), ('c24', (0.62, 2.83), '', '-1dB'),
       ('c24', (3.66, 5.52), '', '-1dB'), ('c25', (1.51, 2.25), '', '3dB'), ('c25', (3.03, 3.88), '', '3dB'), ('c25', (4.61, 6.50), '', '3dB'),
       ('c26', (1.37, 3.36), '', '3dB'), ('c26', (3.95, 5.22), '', '3dB'), ('c27', (0.33, 1.74), 'crop=630:1120:90:0,', '2dB'), ('c27', (2.62, 5.35), '', '2dB'),
       ('c28', (3.24, 5.12), '', '-4dB'), ('c28', (5.49, 7.31), '', '-4dB'), ('c29', (1.09, 1.86), '', '2dB'), ('c29', (2.54, 4.66), '', '2dB'),
       ('c29', (6.25, 7.21), '', '2dB'), ('c29', (7.59, 9.07), '', '2dB'), ('r3', (3.00, 4.50), '', 0), ('BLACK', 0.4), ('c30', (0.45, 3.22), '', '-5dB'),
       ('c30', (4.58, 5.93), '', '-5dB'), ('c30', (6.26, 9.56), '', '-5dB')]

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
    # marca VISTA STORIES (kit _marcas: 22 px, alpha 80, y=135, arriba al centro; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c22"), at("c27")  # suspenso 0-t1 (corral, juez, libro de fierros, Fulgencio derrotado), cálida t1-t2 (Lucero gana, listón, disculpa de Cristóbal), suspenso t2-fin (la otra firma, Mauricio y CTA)
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
