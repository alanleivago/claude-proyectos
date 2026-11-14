"""Montaje de padre-veladoras PARTE 2 (Las Veladoras; método medalla-mezcal-p2 = plantilla reten-sierra v4 / hacienda-sangre v2): frases por clip y orden del guion.
Uso: python -I phr.py (-> renders/phr.json) y luego python -I edit.py  -> renders/v1.mp4
EDL por rangos de renders/phr.json (2026-11-05)."""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "MAJESTIC"  # música + marca de agua salen de pieces/_marcas/MAJESTIC (cada marca suena y se ve distinta)

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

# v1 por frases (método aprobado, copia de hacienda-sangre-p2): (clip, (inicio, fin)[, filtro previo de video[, ganancia]]). Rangos de renders/phr.json
# (phr.py) + envolvente de voz: entra 0.08 s antes de la voz y sale 0.15 s después; mismo personaje = salto dentro del clip.
# QA (qa_clips.md): i1, r1-r6 mudos (ganancia 0); c22 desde 1.13 s (> 0.7 s, sin la mancha); c23 -4 dB; c15 y c17 +3 dB;
# c21 v2 termina en 7.79 s (después repite "...tras manos": corte en el hueco de 7.76 s). c30 v3 (una cadena) medido.
EDL = [("c01", (0.67, 7.69)), ("c01", (8.03, 9.65)), ("c02", (1.40, 4.06)), ("c02", (5.53, 7.40)), ("c03", (0.55, 1.69)), ("c03", (3.10, 4.23)), ("c03", (4.54, 5.58)),
       ("c04", (0.85, 3.10)), ("c04", (3.53, 5.22)), ("c05", (0.56, 1.70)), ("c05", (3.09, 5.19)), ("c05", (5.42, 7.27)), ("c06", (0.93, 2.45)), ("c06", (3.94, 8.05)),
       ("c07", (1.25, 2.10)), ("c07", (3.36, 4.05)), ("c07", (4.45, 7.02)), ("c08", (1.46, 4.60)), ("c08", (5.56, 6.92)), ("r1", (1.0, 2.2), "", 0),
       ("c09", (1.42, 6.63)), ("r2", (0.8, 2.8), "", 0), ("c10", (1.25, 2.45)), ("c10", (3.49, 6.71)), ("c11", (1.08, 2.52)), ("c11", (3.38, 5.21)),
       ("c12", (0.57, 2.71)), ("c12", (3.59, 4.67)), ("c12", (5.03, 6.91)), ("c13", (1.20, 2.36)), ("c13", (3.58, 6.81)), ("c14", (1.13, 2.01)), ("c14", (2.51, 6.34)),
       ("r3", (1.0, 2.2), "", 0), ("c15", (1.98, 4.65), "", "3dB"), ("c15", (5.46, 6.90), "", "3dB"), ("c16", (0.73, 2.32)), ("c16", (3.25, 6.26)),
       ("c17", (1.22, 2.72), "", "3dB"), ("c17", (3.40, 8.93), "", "3dB"), ("c18", (1.42, 3.50)), ("c18", (4.31, 7.19)),
       ("c19", (1.25, 2.02)), ("c19", (3.31, 4.05)), ("c19", (4.94, 6.93)), ("r4", (1.0, 2.2), "", 0), ("c20", (1.22, 3.82)), ("c20", (4.28, 6.63)),
       ("c21", (1.37, 3.80)), ("c21", (4.61, 7.79)), ("c22", (1.13, 4.20)), ("c22", (5.41, 6.69)), ("c23", (1.18, 4.37), "", "-4dB"), ("c23", (4.98, 7.54), "", "-4dB"),
       ("c24", (1.42, 3.55)), ("c24", (4.09, 7.76)), ("i1", (1.0, 2.8), "", 0), ("r5", (1.0, 2.4), "", 0), ("c25", (1.24, 2.42)), ("c25", (3.72, 6.47)),
       ("c26", (1.28, 3.23)), ("c26", (5.47, 6.57)), ("c26", (6.72, 8.90)), ("c27", (0.61, 2.64)), ("c27", (3.57, 7.33)), ("c28", (0.85, 5.57)),
       ("c29", (0.02, 2.38)), ("c29", (3.72, 5.26)), ("c30", (0.95, 2.96)), ("c30", (3.69, 5.75)), ("c30", (6.80, 8.06)), ("r6", (1.0, 3.0), "", 0),
       ("BLACK", 0.4), ("c31", (1.28, 4.48)), ("c31", (5.20, 9.51))]

def main():
    cache = R / "whisper_lines.json"; L = json.loads(cache.read_text(encoding="utf-8")) if cache.exists() else {}
    for f in sorted(C.glob("c*.mp4")):
        if f.stem not in L and any(isinstance(x[1], int) for x in EDL): L[f.stem] = lines(f)
    cache.write_text(json.dumps(L, ensure_ascii=False, indent=1), encoding="utf-8")
    for q in R.glob("p*.mov"): q.unlink()
    parts = []; global STARTS; STARTS = {}
    for i, (cid, x, *pre) in enumerate(EDL):
        p = R / f"p{i:03d}.mov"
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
    subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fcat, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(raw)], check=True)
    # marca MAJESTIC STORIES (sin CONTINUARÁ) + camas musicales: música y posición de marca del kit pieces/_marcas/MAJESTIC
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c17"), at("i1")  # suspenso 0-t1 (¿viene o no?, llega Rufino, las veladoras de noche), cálida t1-t2 (doña Socorro, la primera fila, el techo), suspenso t2-fin (el San Judas de plata, Efraín y CTA)
    tv = MUSIC_VOL * 2.4
    out = R / "v1.mp4"
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim={BC['tension2_from']}:{BC['tension2_from'] + dur - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={dur - t2 - 1.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[0:a][boom][s1][m1][s2]amix=inputs=5:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / "mix.wav"
    ins_m = ["-i", str(raw), "-stream_loop", "3", "-i", str(M / "calida.mp3"), "-stream_loop", "3", "-i", str(M / "tension.mp3"),
             "-stream_loop", "3", "-i", str(M / "tension.mp3"), "-i", str(M / BC["hit"])]
    # loudnorm en dos pasadas (medición + lineal): en una sola pasada quedaba en -15.4 LUFS
    m = subprocess.run(["ffmpeg", "-y", "-hide_banner", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,", "loudnorm=I=-14:TP=-1.5:print_format=json,"),
                        "-map", "[a]", "-t", f"{dur:.2f}", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    ln = f"loudnorm=I=-14:TP=-1.5:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *ins_m, "-filter_complex", fa.replace("loudnorm=I=-14:TP=-1.5", ln), "-map", "[a]", "-t", f"{dur:.2f}", str(mix)], check=True)
    fv = "[0:v][1:v]overlay=shortest=1[v]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "2:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
