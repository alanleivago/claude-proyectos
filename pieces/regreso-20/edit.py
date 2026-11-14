"""Montaje de regreso-20 PARTE 1 (El Regreso; método aprobado de canasta-p2 / chocolate-rancho-p2: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/VISTA: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "VISTA"  # música + marca de agua salen de pieces/_marcas/VISTA
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

# v1 por frases (método aprobado de canasta-p2): rangos de renders/phr.json confirmados con envolvente de voz + faster-whisper large-v3: entra 0.08 s antes de la voz
# y sale 0.15 s después, cortes solo en fin de frase; mismo personaje = salto dentro del clip. QA (qa_clips.md): r1-r5 e i1 mudos (ganancia 0), r4 desde 1.6 s,
# c05 corta en 5.3 s; c01 -3 dB, c19 +3 dB, c02/c05/c09 +2 dB. c14 solo 1ª frase, c14b la 2ª. Media 1.97 s por plano.
EDL = [('c01', (0.57, 2.02), '', '-3dB'), ('c01', (2.45, 5.93), '', '-3dB'), ('c01', (6.2, 7.36), '', '-3dB'), ('r1', (1.0, 2.3), '', 0), ('c02', (0.75, 1.61), '', '2dB'), ('c02', (2.07, 3.73), '', '2dB'),
       ('c02', (4.45, 5.99), '', '2dB'), ('c03', (1.09, 2.78)), ('c03', (3.0, 4.78)), ('c03', (5.58, 7.1)), ('c04', (0.56, 1.71)), ('c04', (2.85, 6.39)),
       ('c05', (0.47, 2.76), '', '2dB'), ('c05', (3.54, 5.3), '', '2dB'), ('c06', (0.3, 2.45)), ('c06', (3.29, 5.6)), ('c07', (1.49, 3.29)), ('c07', (4.29, 5.28)),
       ('c07', (5.41, 7.59)), ('c08', (0.51, 2.29)), ('c08', (2.84, 5.85)), ('c09', (0.56, 3.02), '', '2dB'), ('c09', (3.96, 5.82), '', '2dB'), ('c09', (5.97, 7.46), '', '2dB'),
       ('c10', (0.09, 1.85)), ('c10', (2.73, 5.39)), ('c11', (1.15, 3.96)), ('c11', (4.53, 7.27)), ('c12', (1.06, 3.11)), ('c12', (3.89, 4.95)),
       ('r2', (1.2, 2.7), '', 0), ('i1', (1.0, 2.6), '', 0), ('c13', (0.63, 2.71)), ('c13', (3.57, 4.71)), ('c13', (5.07, 6.85)), ('c14', (1.52, 3.68)),
       ('c14b', (0.84, 4.8)), ('c15', (0.55, 2.0)), ('c15', (3.06, 4.99)), ('c16', (0.76, 2.42)), ('c16', (3.4, 4.86)), ('c17', (0.97, 2.21)),
       ('c17', (2.58, 4.02)), ('c17', (4.52, 7.61)), ('r3', (1.0, 2.3), '', 0), ('c18', (0.58, 2.02)), ('c18', (2.6, 4.75)), ('c19', (1.09, 3.72), '', '3dB'),
       ('c19', (4.6, 7.08), '', '3dB'), ('c20', (0.42, 2.55)), ('c20', (3.51, 5.26)), ('c20', (5.75, 7.36)), ('c21', (0.61, 1.84)), ('c21', (2.68, 4.5)),
       ('c22', (0.7, 2.56)), ('c22', (3.35, 7.77)), ('c23', (0.55, 2.97)), ('c23', (4.28, 6.76)), ('c23', (6.85, 7.67)), ('c24', (0.81, 3.89)),
       ('c24', (4.81, 7.21)), ('c25', (0.69, 1.97)), ('c25', (2.61, 5.78)), ('c26', (0.27, 2.57)), ('c26', (3.57, 4.65)), ('r4', (1.6, 3.6), '', 0),
       ('c27', (0.71, 1.73)), ('c27', (2.57, 5.24)), ('c28', (1.44, 2.89)), ('c28', (4.07, 6.71)), ('c29', (1.02, 2.25)), ('c29', (3.15, 5.22)),
       ('r5', (1.2, 2.8), '', 0), ('c30', (1.11, 2.32)), ('c30', (2.72, 4.35)), ('c30', (5.0, 7.24)), ('BLACK', 0.4), ('c31', (0.8, 2.86)),
       ('c31', (3.8, 7.31))]

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
    # marca VISTA STORIES (kit _marcas: 22 px, alpha 80, y=135, arriba al centro; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c17"), at("c22")  # suspenso 0-t1 (la venta, la discusión, la firma), cálida t1-t2 (don Bernardo le ofrece quedarse), suspenso t2-fin (los dos aparte, la despedida, el retrato de Julián y CTA)
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
