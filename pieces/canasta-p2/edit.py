"""Montaje de canasta PARTE 2 (La Canasta; método aprobado de chocolate-rancho-p2: montaje por frases, renders/phr.json de phr.py).
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

# v1 por frases (método aprobado, copia de chocolate-rancho-p2): (clip, (inicio, fin)[, filtro previo de video[, ganancia]]). Rangos de renders/phr.json
# (phr.py) + envolvente de voz (umbral -36 dB) y faster-whisper large-v3: entra 0.08 s antes de la voz y sale 0.15 s después, cortes solo en pausas de fin de frase; mismo personaje = salto dentro del clip.
# QA (qa_clips.md): r1-r6 e i1 mudos (ganancia 0); c07 arranca en 1.36 s (>0.9 s, sin la mancha rosa); c03/c24 -3 dB, c02/c16/c29 +3 dB; r4 nuevo (de espaldas hacia las puertas).
EDL = [('c01', (1.17, 3.29)), ('c01', (3.96, 6.29)), ('c01', (7.41, 9.35)), ('c02', (1.49, 2.26), '', '3dB'), ('c02', (2.86, 4.67), '', '3dB'), ('c02', (5.39, 6.46), '', '3dB'),
       ('c03', (1.16, 3.11), '', '-3dB'), ('c03', (3.5, 7.53), '', '-3dB'), ('c04', (1.27, 4.49)), ('c04', (5.5, 6.85)), ('r1', (1.0, 2.4), '', 0),
       ('c05', (1.15, 3.16)), ('c05', (4.64, 7.08)), ('c06', (1.18, 3.31)), ('c06', (3.73, 5.28)), ('r2', (0.8, 2.6), '', 0),
       ('c07', (1.36, 2.49)), ('c07', (3.15, 4.98)), ('c07', (5.73, 7.0)), ('c08', (0.82, 1.84)), ('c08', (2.56, 5.19)), ('c08', (6.29, 7.6)),
       ('c09', (0.62, 3.66)), ('c09', (4.78, 6.96)), ('c10', (1.31, 2.32)), ('c10', (2.65, 4.55)), ('c10', (5.74, 7.26)),
       ('c11', (0.47, 3.02)), ('c11', (3.77, 5.46)), ('c11', (5.87, 7.12)), ('c12', (0.68, 1.44)), ('c12', (1.75, 3.34)), ('c12', (4.57, 6.58)),
       ('c13', (0.75, 3.11)), ('c13', (3.53, 6.26)), ('c14', (0.87, 2.34)), ('c14', (3.38, 6.22)), ('c15', (1.48, 3.24)), ('c15', (3.58, 5.18)),
       ('c16', (1.58, 4.41), '', '3dB'), ('c16', (5.25, 6.89), '', '3dB'), ('r3', (1.0, 2.4), '', 0),
       ('c17', (1.2, 3.31)), ('c17', (4.13, 7.31)), ('c18', (0.5, 2.51)), ('c18', (3.54, 6.91)), ('c19', (0.5, 3.88)), ('c19', (4.82, 7.05)),
       ('c20', (1.13, 2.57)), ('c20', (3.34, 5.09)), ('c21', (0.9, 2.32)), ('c21', (3.54, 6.1)), ('r4', (3.4, 5.2), '', 0),
       ('c22', (2.19, 4.66)), ('c23', (1.13, 4.69)), ('c23', (5.12, 7.16)), ('c24', (1.43, 2.08), '', '-3dB'), ('c24', (2.48, 4.25), '', '-3dB'), ('c24', (5.03, 7.75), '', '-3dB'),
       ('c25', (1.11, 2.55)), ('c25', (3.43, 5.55)), ('i1', (0.8, 2.6), '', 0), ('c26', (0.83, 3.54)), ('c26', (4.78, 7.67)),
       ('c27', (1.21, 2.33)), ('c27', (3.21, 4.94)), ('c28', (1.5, 3.69)), ('c28', (4.99, 5.98)), ('r5', (1.0, 2.6), '', 0),
       ('c29', (1.44, 4.9), '', '3dB'), ('c29', (6.02, 6.89), '', '3dB'), ('c29', (7.26, 8.89), '', '3dB'), ('r6', (1.0, 3.2), '', 0),
       ('BLACK', 0.4), ('c30', (0.49, 4.25)), ('c30', (5.49, 9.38))]

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
    t1, t2 = at("c23"), at("i1")  # suspenso 0-t1 (lluvia, recepción, permisos, Horacio a la salida), cálida t1-t2 (Maribel y don Eusebio), suspenso t2-fin (papeles, Montiel y CTA)
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
