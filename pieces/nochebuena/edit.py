"""Montaje de nochebuena PARTE 1 (La Cena de Nochebuena; método aprobado de regreso-20 / canasta-p2: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/MAJESTIC: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "MAJESTIC"  # música + marca de agua salen de pieces/_marcas/MAJESTIC (arriba a la izquierda, x=36, y=210)
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

# v1 por frases (método aprobado de camionero): rangos de renders/phr.json (envolvente de voz) confirmados con faster-whisper large-v3: entra 0.08 s antes de la voz
# y sale 0.15 s después, cortes solo en fin de frase; mismo personaje = salto dentro del clip. QA (qa_clips.md): r1-r7, i1, i2 mudos (ganancia 0); punch-in (crop) en la
# frase 1 de c03/c04/c06/c09/c10/c13/c17/c25; c18 nuevo desde 0.69 (alguien en el borde IZQ. hasta ~0.6 s); c19/c21 desde >= 1.0; i2 4.25-5.75; c23 0.9-3.0;
# c32 sale en 7.45 para que el fundido a negro no pise "le diga"; ganancias por clip hacia ~-19.5 LUFS. BLACK 0.4 s antes del CTA (c33).
EDL = [('c01', (0.41, 2.73)), ('c01', (3.58, 4.62)), ('c01', (5.16, 6.59)), ('c02', (0.74, 2.14)), ('c02', (2.45, 3.49)), ('c02', (4.44, 7.49)),
       ('c03', (0.37, 2.97), 'crop=576:1024:0:40,', '4dB'), ('c03', (3.55, 5.51), '', '4dB'), ('c03', (6.44, 7.64), '', '4dB'), ('r1', (3.5, 5.0), '', 0),
       ('c04', (0.67, 1.71), 'crop=576:1024:144:40,', '2dB'), ('c04', (2.06, 3.59), '', '2dB'), ('c04', (4.24, 7.17), '', '2dB'),
       ('c05', (0.71, 2.80), '', '-2dB'), ('c05', (3.56, 4.91), '', '-2dB'), ('c06', (0.73, 3.34), 'crop=560:996:0:60,'), ('c06', (4.57, 6.95)), ('r2', (4.0, 5.4), '', 0),
       ('c07', (0.75, 3.40)), ('c07', (3.95, 5.98)), ('c07', (6.45, 7.44)), ('c08', (1.19, 2.68), '', '-3dB'), ('c08', (3.54, 5.45), '', '-3dB'), ('c08', (5.96, 7.55), '', '-3dB'),
       ('i2', (4.25, 5.75), '', 0), ('c09', (0.58, 1.59), 'crop=594:1056:0:40,'), ('c09', (2.53, 3.75)), ('c10', (0.73, 2.54), 'crop=540:960:0:60,'), ('c10', (3.57, 5.01)),
       ('i1', (4.0, 5.5), '', 0), ('r3', (2.0, 3.5), '', 0), ('c11', (0.43, 2.84), '', '-3dB'), ('c11', (3.40, 5.10), '', '-3dB'), ('c11', (5.59, 7.38), '', '-3dB'),
       ('c12', (1.07, 2.77)), ('c12', (3.54, 5.29)), ('c13', (0.39, 2.46), 'crop=594:1056:0:40,', '3dB'), ('c13', (3.23, 5.69), '', '3dB'),
       ('c14', (0.92, 3.73), '', '3dB'), ('c14', (4.67, 7.46), '', '3dB'), ('c15', (0.66, 3.41), '', '4dB'), ('c15', (4.54, 5.74), '', '4dB'), ('c15', (6.45, 7.45), '', '4dB'),
       ('r4', (4.0, 5.5), '', 0), ('c16', (1.16, 2.84)), ('c16', (3.82, 6.92)), ('c17', (0.20, 1.02), 'crop=594:1056:0:40,', '-3dB'), ('c17', (2.61, 4.77), '', '-3dB'),
       ('c18', (0.69, 2.38)), ('c18', (3.35, 4.22)), ('c18', (4.66, 7.07)), ('r5', (4.5, 6.0), '', 0), ('c19', (1.33, 3.15), '', '4dB'), ('c19', (4.15, 6.67), '', '4dB'),
       ('c20', (1.52, 3.10)), ('c20', (4.41, 7.22)), ('c21', (1.09, 3.68), '', '-3dB'), ('c21', (4.64, 6.94), '', '-3dB'), ('c22', (0.99, 2.84), '', '-2dB'), ('c22', (3.60, 5.63), '', '-2dB'),
       ('c23', (0.9, 3.0)), ('c24', (0.63, 2.83)), ('c24', (3.44, 6.51)), ('c24', (6.96, 7.67)), ('r6', (4.0, 5.5), '', 0),
       ('c25', (0.63, 1.59), 'crop=594:1056:0:40,'), ('c25', (2.23, 5.44)), ('c26', (0.82, 2.94), '', '2dB'), ('c26', (4.07, 7.36), '', '2dB'),
       ('c27', (0.59, 2.33), '', '4dB'), ('c27', (3.13, 5.11), '', '4dB'), ('c28', (0.26, 1.69)), ('c28', (2.52, 4.01)), ('c28', (4.67, 5.74)),
       ('c29', (0.58, 1.77), '', '-3dB'), ('c29', (3.05, 5.22), '', '-3dB'), ('c30', (0.45, 3.06)), ('c30', (4.22, 6.67)), ('r7', (4.0, 5.5), '', 0),
       ('c31', (0.98, 3.65), '', '3dB'), ('c31', (4.58, 7.18), '', '3dB'), ('c32', (1.33, 2.57), '', '-2dB'), ('c32', (3.48, 7.45), '', '-2dB'),
       ('BLACK', 0.4), ('c33', (0.46, 3.20), '', '-4dB'), ('c33', (4.13, 7.58), '', '-4dB')]

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
    # marca MAJESTIC STORIES (kit _marcas: 22 px, alpha 80, arriba a la izquierda; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c11"), at("c21")  # suspenso 0-t1 (la vergüenza, la presentación), cálida t1-t2 (Ignacio reconoce el ponche, la verdad en la cocina), suspenso t2-fin (la cena, el giro, el gancho y CTA)
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
