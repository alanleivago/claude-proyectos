"""Montaje de camionero PARTE 1 (El Camionero; copia del edit.py aprobado de regreso-20: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/MEXI: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "MEXI"  # rotación MEXI STORIES: música + marca de agua (arriba a la der.) salen de pieces/_marcas/MEXI
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

# v1 por frases (método aprobado de regreso-20): rangos de renders/phr.json confirmados con envolvente de voz + faster-whisper large-v3: entra 0.08 s antes de la voz
# y sale 0.15 s después, cortes solo en fin de frase (pausas >= 0.35 s); mismo personaje = salto dentro del clip. QA (qa_clips.md): r1-r3 e i1 mudos (ganancia 0);
# c05/c16/c30 frase 1 con punch-in (crop) por alguien en el borde al inicio (izq./der./der.); ganancias por clip hacia ~-19.5 LUFS. Media 1.86 s por plano.
EDL = [('c01', (0.89, 3.66)), ('c01', (3.96, 5.68)), ('c02', (0.73, 3.17)), ('c02', (4.6, 6.75)), ('c03', (0.05, 3.47)), ('c03', (4.08, 5.1)), ('c03', (6.06, 8.97)),
       ('c04', (0.55, 2.14), '', '3dB'), ('c04', (2.76, 5.1), '', '3dB'), ('c05', (0.93, 3.83), 'crop=630:1120:90:60,', '-4dB'), ('c05', (4.71, 7.22), '', '-4dB'), ('c06',
       (0.69, 2.39)), ('c06', (3.38, 5.28)), ('c07', (0.53, 2.73), '', '-3dB'), ('c07', (3.62, 4.69), '', '-3dB'), ('c07', (4.87, 6.97), '', '-3dB'), ('r1', (1.5, 3.0), '', 0),
       ('c08', (0.63, 2.8)), ('c08', (3.62, 6.74)), ('c09', (0.17, 2.66), '', '2dB'), ('c09', (3.11, 4.66), '', '2dB'), ('c09', (5.29, 6.86), '', '2dB'), ('c10', (0.75, 3.24),
       '', '-2dB'), ('c10', (4.04, 4.77), '', '-2dB'), ('c10', (5.57, 7.51), '', '-2dB'), ('i1', (3.5, 5.3), '', 0), ('c11', (0.55, 1.69)), ('c11', (2.58, 5.02)), ('c12', (0.58,
       1.65), '', '4dB'), ('c12', (1.77, 2.78), '', '4dB'), ('c12', (3.77, 5.71), '', '4dB'), ('c13', (0.67, 2.72)), ('c13', (3.28, 4.75)), ('c14', (0.75, 3.34), '', '2dB'),
       ('c14', (4.44, 6.52), '', '2dB'), ('c15', (0.98, 1.82)), ('c15', (2.01, 3.54)), ('c15', (4.16, 4.93)), ('c16', (0.55, 2.8), 'crop=594:1056:0:40,', '-2dB'), ('c16', (3.63,
       4.38), '', '-2dB'), ('r2', (4.0, 5.8), '', 0), ('c17', (0.86, 1.99), '', '-5dB'), ('c17', (2.3, 3.48), '', '-5dB'), ('c17', (4.41, 7.09), '', '-5dB'), ('c18', (1.03,
       3.44)), ('c18', (5.38, 6.83)), ('c19', (0.67, 4.26)), ('c20', (0.32, 2.87)), ('c20', (3.42, 4.96)), ('c21', (1.12, 3.6)), ('c21', (4.17, 7.55)), ('c22', (1.38, 2.42)),
       ('c22', (3.32, 5.11)), ('c23', (1.05, 3.11), '', '-2dB'), ('c23', (3.66, 7.64), '', '-2dB'), ('c24', (0.58, 1.98), '', '-4dB'), ('c24', (2.49, 3.38), '', '-4dB'), ('c24',
       (4.65, 6.26), '', '-4dB'), ('c25', (0.43, 2.37)), ('c25', (3.59, 4.59)), ('c26', (1.57, 3.14), '', '-3dB'), ('c27', (0.79, 2.87), '', '2dB'), ('c27', (3.97, 6.72), '',
       '2dB'), ('c28', (0.49, 1.38), '', '-2dB'), ('c28', (1.5, 3.4), '', '-2dB'), ('c28', (4.03, 5.29), '', '-2dB'), ('c29', (0.53, 2.03), '', '2dB'), ('c29', (3.18, 4.79), '',
       '2dB'), ('c30', (0.66, 2.6), 'crop=630:1120:0:40,', '0dB'), ('c30', (3.44, 5.1)), ('c30', (5.59, 6.81)), ('c31', (0.21, 1.09), '', '4dB'), ('c31', (1.3, 2.63), '',
       '4dB'), ('c31', (3.22, 5.21), '', '4dB'), ('c32', (0.58, 1.38), '', '4dB'), ('c32', (2.38, 3.15), '', '4dB'), ('c32', (3.97, 5.31), '', '4dB'), ('c32', (5.69, 6.92), '',
       '4dB'), ('r3', (3.5, 5.9), '', 0), ('BLACK', 0.4), ('c33', (0.6, 3.53), '', '-2dB'), ('c33', (4.28, 7.16), '', '-2dB'), ('c33', (7.49, 9.31), '', '-2dB')]

def main():
    if not EDL: sys.exit("EDL vacía: correr phr.py y armarla con renders/phr.json")
    L = {}  # v1: EDL por rangos medidos (renders/phr.json)
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
            if x >= len(L[cid]): print("sin línea", cid, x, L[cid]); continue
            s, e, _ = L[cid][x]; s, e = max(0, s - 0.1), e + 0.28
        else: s, e = x
        d = round((e - s) * 24) / 24; fade = i + 1 < len(EDL) and EDL[i + 1][0] == "BLACK"
        vf = (pre[0] if pre else "") + "scale=720:1280,fps=24,tpad=stop_mode=clone:stop_duration=0.5" + (f",fade=t=out:st={d - 0.6:.2f}:d=0.6" if fade else "")
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
    # marca MEXI STORIES (kit _marcas: 22 px, alpha 80, y=210, arriba a la derecha; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c30"), at("c32")  # suspenso 0-t1 (andén, monitores, cuarto cerrado, el giro, Clemente a dirección), cálida t1-t2 (Teófilo digno y la disculpa), suspenso t2-fin (la familia de Leonor y CTA)
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
    tc = at("c30") if "c30" in STARTS else dur
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "2:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
