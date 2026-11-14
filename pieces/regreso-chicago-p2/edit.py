"""Montaje de regreso-chicago PARTE 2 (La Casa de Chicago; copia del edit.py aprobado de camionero: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/MAJESTIC: música y marca propias, arriba a la izq.; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "MAJESTIC"  # misma marca que la Parte 1: música + marca de agua (arriba a la izq.) salen de pieces/_marcas/MAJESTIC
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

# v1 por frases (método aprobado de camionero): rangos de renders/phr.json confirmados con envolvente de voz + faster-whisper large-v3: entra 0.08 s antes de la voz
# y sale 0.15 s después, cortes solo en fin de frase; mismo personaje = salto dentro del clip. QA (qa_clips.md): r1-r7 mudos (ganancia 0); r2 0.5-3.1, r5 0-2.5, r6 desde 3.0;
# frase 1 con punch-in en c02 c06 c08 c10 c26 y c11 v2 (capó de una 2.a camioneta en primer plano hasta ~2 s); c11 corta en 5.32 (repite "y me la llevo"); ganancias hacia ~-19.5 LUFS.
EDL = [('c01', (0.13, 3.07), '', '-2dB'), ('c01', (3.52, 5.47), '', '-2dB'), ('c01', (6.1, 7.51), '', '-2dB'), ('c01', (8.1, 9.38), '', '-2dB'), ('c02', (0.83, 3.52),
       'crop=630:1120:0:40,'), ('c02', (4.54, 6.4)), ('c03', (0.52, 3.54)), ('c03', (4.19, 4.9)), ('c03', (5.23, 7.36)), ('c04', (0.91, 3.85)), ('c04', (4.63, 5.45)), ('c04',
       (5.64, 7.42)), ('c05', (1.5, 2.39), '', '6dB'), ('c05', (2.55, 3.73), '', '6dB'), ('c05', (4.6, 7.33), '', '6dB'), ('r1', (1.0, 2.4), '', 0), ('c06', (1.15, 2.93),
       'crop=630:1120:0:40,'), ('c06', (3.79, 5.63)), ('c07', (1.13, 2.46)), ('c07', (3.53, 6.09)), ('c08', (1.56, 3.9), 'crop=630:1120:0:40,', '2dB'), ('c08', (5.05, 7.03), '',
       '2dB'), ('c09', (1.24, 3.63)), ('c09', (4.55, 6.2)), ('r2', (0.8, 3.0), '', 0), ('c10', (0.84, 2.91), 'crop=630:1120:90:40,', '-5dB'), ('c10', (5.13, 6.47), '', '-5dB'),
       ('c11', (1.16, 2.3), 'crop=594:1056:0:40,', '3dB'), ('c11', (3.38, 5.32), '', '3dB'), ('c12', (1.59, 2.75), '', '-2dB'), ('c12', (3.55, 6.48), '', '-2dB'), ('r3', (1.0,
       3.2), '', 0), ('c13', (0.37, 3.82)), ('c13', (4.45, 6.24)), ('c14', (0.59, 1.74)), ('c14', (2.81, 3.6)), ('c14', (4.12, 6.45)), ('c15', (0.85, 1.75), '', '-3dB'), ('c15',
       (3.61, 6.94), '', '-3dB'), ('c16', (0.75, 2.22)), ('c16', (3.05, 5.88)), ('c17', (0.71, 2.59), '', '2dB'), ('c17', (2.89, 4.55), '', '2dB'), ('c17', (5.53, 7.0), '',
       '2dB'), ('r4', (1.0, 2.4), '', 0), ('c18', (0.7, 3.81), '', '2dB'), ('c18', (4.42, 7.75), '', '2dB'), ('c19', (1.04, 2.57)), ('c19', (3.43, 6.81)), ('r5', (0.3, 2.4), '',
       0), ('c20', (1.08, 4.02)), ('c20', (4.52, 5.84)), ('c20', (6.15, 6.99)), ('c21', (1.51, 2.9)), ('c21', (3.61, 5.48)), ('c22', (1.59, 3.01)), ('c22', (4.02, 6.67)),
       ('c23', (0.67, 1.53), '', '-2dB'), ('c23', (2.47, 4.53), '', '-2dB'), ('c23', (5.08, 6.94), '', '-2dB'), ('c24', (0.84, 2.39)), ('c24', (3.65, 4.92)), ('c25', (1.55,
       4.0), '', '2dB'), ('c25', (4.61, 6.61), '', '2dB'), ('c26', (1.23, 2.73), 'crop=594:1056:0:40,', '3dB'), ('c26', (4.26, 5.61), '', '3dB'), ('c26', (6.14, 9.32), '',
       '3dB'), ('r6', (3.0, 4.6), '', 0), ('c27', (0.55, 1.61), '', '-3dB'), ('c27', (3.22, 4.85), '', '-3dB'), ('c28', (1.12, 2.93), '', '2dB'), ('c28', (3.88, 5.98), '',
       '2dB'), ('r7', (1.0, 3.2), '', 0), ('BLACK', 0.4), ('c29', (0.75, 4.01), '', '-3dB'), ('c29', (5.17, 9.15), '', '-3dB')]

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
    # marca MAJESTIC STORIES (kit _marcas: 22 px, alpha 80, x=36 y=210, arriba a la izquierda; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("r5"), at("c24")  # suspenso 0-t1 (la reja, Ulises se va en la camioneta, Yesenia sola), cálida t1-t2 (la maleta de Yesenia y "la primera llave es suya"), suspenso t2-fin (Rebeca no se va, treinta años y CTA)
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
