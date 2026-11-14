"""Montaje de regreso-20 PARTE 2 (El Regreso; copia del edit.py de camionero-p2: montaje por frases, renders/phr.json de phr.py). Marca de la Parte 1: VISTA STORIES.
Uso: python -I edit.py  -> renders/v1.mp4; --remix -> renders/v2.mp4 (kit _marcas/VISTA: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "VISTA"  # misma marca que la Parte 1 (VISTA STORIES, fuera de la rotación): música + marca de agua (arriba al centro, y=135) salen de pieces/_marcas/VISTA
REMIX = "--remix" in sys.argv
TENSION_GAIN = 1.0  # ajuste de la cama de tensión para que tenga la presencia de la de VISTA (gardenia v1)

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

# v1 por frases (método aprobado de tiendita-justa / camionero-p2): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7, scratch lv3.py).
# Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase; pausas que ahorran < 0.2 s no se cortan. Mismo personaje = salto dentro del clip.
# qa_clips.md: crops en el 1.er tramo c04, c05, c08, c09, c10, c12, c14, c16, c17, c19, c22, c26, c27; r1 desde 2.0, c15/c24 empiezan tarde por la voz; r1 y r2 mudos (ganancia 0).
# i1 (v2) fuera: una 2.a hoja aparece al abrirla (fallback de qa_clips.md: c03 -> c04 directo). c13 regenerado (v2 OK, sin repetición).
# Ganancia por clip = -19.5 - LUFS del clip (renders/lufs.txt, redondeo 0.5 dB). BLACK 0.4 s antes del CTA (c29).
EDL = [('c01', (1.56, 2.92), '', '4.5dB'), ('c01', (3.31, 6.72), '', '4.5dB'),
       ('c02', (0.46, 7.51), '', '0dB'),
       ('c03', (0.14, 3.43), '', '0dB'), ('c03', (4.28, 7.32), '', '0dB'),
       ('c04', (0.34, 2.31), 'crop=540:960:0:0,', '3.5dB'), ('c04', (2.86, 4.72), '', '3.5dB'),
       ('c05', (1.12, 2.66), 'crop=540:960:180:0,', '5dB'), ('c05', (3.51, 6.73), '', '5dB'),
       ('c06', (0.27, 3.52), '', '3dB'), ('c06', (4.61, 6.20), '', '3dB'),
       ('c07', (0.97, 1.78), '', '3dB'), ('c07', (2.02, 7.36), '', '3dB'),
       ('c08', (0.45, 3.73), 'crop=540:960:150:0,', '0.5dB'), ('c08', (3.96, 6.73), '', '0.5dB'),
       ('c09', (0.40, 2.55), 'crop=540:960:0:0,', '1dB'), ('c09', (3.05, 4.82), '', '1dB'),
       ('c10', (0.16, 6.40), 'crop=540:960:180:0,', '1.5dB'),
       ('c11', (0.81, 1.59), '', '-3dB'), ('c11', (1.91, 3.30), '', '-3dB'),
       ('c12', (0.70, 6.61), 'crop=540:960:180:0,', '1dB'),
       ('r1', (2.0, 3.5), '', 0),
       ('c13', (1.45, 4.46), '', '3dB'), ('c13', (4.97, 7.04), '', '3dB'),
       ('c14', (0.57, 2.44), 'crop=540:960:0:0,', '-1.5dB'), ('c14', (3.03, 5.03), '', '-1.5dB'),
       ('c15', (1.42, 6.31), '', '3.5dB'),
       ('c16', (0.40, 2.08), 'crop=540:960:180:0,', '1dB'), ('c16', (2.38, 5.24), '', '1dB'),
       ('c17', (0.60, 1.82), 'crop=540:960:0:0,', '3.5dB'), ('c17', (3.12, 6.88), '', '3.5dB'),
       ('c18', (1.19, 3.48), '', '4.5dB'), ('c18', (4.18, 6.22), '', '4.5dB'),
       ('c19', (1.36, 3.84), 'crop=540:960:0:0,', '3.5dB'), ('c19', (4.50, 7.23), '', '3.5dB'),
       ('c20', (0.59, 2.51), '', '-2dB'), ('c20', (3.69, 5.20), '', '-2dB'),
       ('c21', (0.92, 2.36), '', '2.5dB'), ('c21', (3.31, 5.34), '', '2.5dB'),
       ('c22', (0.84, 2.51), 'crop=540:960:90:0,', '5dB'), ('c22', (3.38, 4.55), '', '5dB'),
       ('r2', (1.0, 3.5), '', 0),
       ('c23', (1.02, 3.61), '', '4dB'), ('c23', (4.29, 5.20), '', '4dB'),
       ('c24', (1.47, 3.64), '', '2.5dB'), ('c24', (5.14, 7.19), '', '2.5dB'),
       ('c25', (1.12, 3.72), '', '3.5dB'),
       ('c26', (0.56, 1.90), 'crop=540:960:90:0,', '3dB'), ('c26', (2.39, 4.49), '', '3dB'),
       ('c27', (0.90, 3.65), 'crop=540:960:0:0,', '-1.5dB'), ('c27', (4.50, 6.26), '', '-1.5dB'),
       ('c28', (0.88, 4.51), '', '3.5dB'),
       ('BLACK', 0.4),
       ('c29', (0.56, 4.36), '', '-2.5dB'), ('c29', (5.79, 8.65), '', '-2.5dB')]

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
            if cid not in L: L[cid] = lines(src)
            if x >= len(L[cid]): print("sin línea", cid, x, L[cid]); continue
            s, e, _ = L[cid][x]; s, e = max(0, s - 0.1), e + 0.28
        else: s, e = x
        d = round((e - s) * 24) / 24; fade = i + 1 < len(EDL) and EDL[i + 1][0] == "BLACK"
        vf = (pre[0] if pre else "") + "scale=720:1280,setsar=1,fps=24,tpad=stop_mode=clone:stop_duration=0.5" + (f",fade=t=out:st={d - 0.6:.2f}:d=0.6" if fade else "")
        af = (f"volume={pre[1]}," if len(pre) > 1 else "") + f"aresample=48000,apad,atrim=0:{d:.5f},afade=t=in:d=0.04,afade=t=out:st={d - (0.6 if fade else 0.06):.2f}:d={0.6 if fade else 0.06}"
        if len(pre) > 2:  # tapa: los primeros k s de imagen salen de otro clip (cc desde cs, mudo); el audio sigue siendo el de este plano (salto de voz tapado)
            cc, cs, k = pre[2]; k = round(k * 24) / 24
            fj = (f"[0:v]scale=720:1280,setsar=1,fps=24,tpad=stop_mode=clone:stop_duration=0.5,trim=end_frame={round(min(k, d) * 24)},setpts=PTS-STARTPTS[a0];"
                  + (f"[1:v]{vf},trim=end_frame={round((d - k) * 24)},setpts=PTS-STARTPTS[b0];[a0][b0]concat=n=2:v=1:a=0[v];" if round((d - k) * 24) > 0 else "[a0]null[v];") + f"[2:a]{af}[a]")
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{cs:.2f}", "-i", str(C / f"{cc}.mp4"), "-ss", f"{s + k:.2f}", "-i", str(src), "-ss", f"{s:.2f}", "-i", str(src),
                            "-filter_complex", fj, "-map", "[v]", "-map", "[a]", "-ac", "2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "pcm_s16le",
                            "-frames:v", str(round(d * 24)), str(p)], check=True)
        else: subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-i", str(src), "-vf", vf,
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
    # duración real del plano en raw.mov = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corría las camas ~0.5-0.9 s)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    # suspenso 0-t1 (la verdad, el testamento), cálida t1-t2 (Bernardo lo hizo por Leonor, la trampa de la firma),
    # suspenso t2-t3 (portal: Clemencia se delata, Joaquín la deja), cálida t3-fin (justicia: Leonor dueña, perdón con condiciones, CTA)
    t1, t2, t3 = at("c09"), at("r1"), at("c23")  # tensión desde r1: llega Joaquín (con la cálida sonaba alegre)
    tv = MUSIC_VOL * 2.4 * TENSION_GAIN
    out = R / ("v2.mp4" if REMIX else "v1.mp4")  # v2 = misma EDL, otra mezcla del kit VISTA
    fa = (f"[4:a]lowpass=f=2500,volume=0.3[boom];"
          f"[2:a]atrim=0:{t1 + 1},afade=t=in:d=0.3,afade=t=out:st={t1 - 0.5:.2f}:d=1.5,volume={tv:.2f}[s1];"
          f"[1:a]atrim=0:{t2 - t1 + 1.5},afade=t=in:d=1,afade=t=out:st={t2 - t1:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t1 * 1000)}:all=1[m1];"
          f"[3:a]atrim={BC['tension2_from']}:{BC['tension2_from'] + t3 - t2 + 1},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={t3 - t2 - 0.5:.2f}:d=1.5,volume={tv:.2f},adelay={int(t2 * 1000)}:all=1[s2];"
          f"[5:a]atrim=0:{dur - t3 + 1},afade=t=in:d=1,afade=t=out:st={dur - t3 - 1.5:.2f}:d=1.5,volume={MUSIC_VOL},adelay={int(t3 * 1000)}:all=1[m2];"
          f"[0:a][boom][s1][m1][s2][m2]amix=inputs=6:normalize=0:duration=first,lowpass=f=16000,loudnorm=I=-14:TP=-1.5,alimiter=limit=0.80:level=false,aresample=48000[a]")
    mix = R / ("mix_v2.wav" if REMIX else "mix.wav")
    ins_m = ["-i", str(raw), "-stream_loop", "3", "-i", str(M / "calida.mp3"), "-stream_loop", "3", "-i", str(M / "tension.mp3"),
             "-stream_loop", "3", "-i", str(M / "tension.mp3"), "-i", str(M / BC["hit"]), "-stream_loop", "3", "-i", str(M / "calida.mp3")]
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
