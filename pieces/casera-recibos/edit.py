"""Montaje de casera-recibos PARTE 1 (La Casera de los Recibos; copia del edit.py de masa-honrada: montaje por frases, renders/phr.json de phr.py).
Uso: python -I edit.py  -> renders/v1.mp4 (kit _marcas/MAJESTIC: música y marca de agua de la marca; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "MAJESTIC"  # MAJESTIC STORIES: arriba a la izquierda (x=36, y=210), alfa 80; música de pieces/_marcas/MAJESTIC
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

# v1 por frases (método aprobado de huipil-robado): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7, scratch lv3.py).
# Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase; pausas que ahorran < 0.2 s no se cortan. Mismo personaje = salto dentro del clip.
# qa_clips.md: crops 540:960 en el 1.er tramo (x=180: c02 c08 c16 c22 c25 c29; x=0: c03 c12 c21 c24 c26 c28); arranques c05 >= 0.4, c11 >= 0.75, r4 >= 2.75;
# r1 (regenerado: quieta, labios cerrados) 1.0-2.5, r2/r3 1.0-2.5; r1-r4 mudos (ganancia 0). Ganancia por clip = -19.5 - LUFS del clip (ebur128, 0.5 dB). BLACK 0.4 s antes del CTA (c33).
EDL = [('c01', (0.71, 5.46), '', '1dB'), ('c01', (6.17, 8.78), '', '1dB'),
       ('c02', (0.45, 3.84), 'crop=540:960:180:0,', '-1dB'), ('c02', (4.07, 6.20), '', '-1dB'),
       ('c03', (0.29, 3.87), 'crop=540:960:0:0,', '-2dB'), ('c03', (4.38, 7.51), '', '-2dB'),
       ('c04', (0.00, 3.31), '', '3.5dB'), ('c04', (4.24, 7.15), '', '3.5dB'),
       ('c05', (0.40, 2.65), '', '1.5dB'), ('c05', (2.91, 5.57), '', '1.5dB'),
       ('c06', (0.00, 2.56), '', '3dB'), ('c06', (3.07, 5.03), '', '3dB'),
       ('c07', (0.31, 3.37), '', '0.5dB'), ('c07', (3.94, 7.34), '', '0.5dB'),
       ('c08', (0.00, 5.10), 'crop=540:960:180:0,', '3.5dB'), ('c08', (5.32, 7.41), '', '3.5dB'),
       ('r1', (1.00, 2.50), '', 0),
       ('c09', (0.59, 4.08), '', '4dB'), ('c09', (4.54, 7.05), '', '4dB'),
       ('c10', (0.82, 3.60), '', '-2dB'), ('c10', (5.20, 6.99), '', '-2dB'),
       ('c11', (1.98, 4.01), '', '4dB'), ('c11', (4.60, 7.70), '', '4dB'),
       ('c12', (0.31, 3.45), 'crop=540:960:0:0,', '-1.5dB'), ('c12', (4.00, 5.49), '', '-1.5dB'),
       ('c13', (0.16, 4.80), '', '4.5dB'), ('c13', (5.13, 7.72), '', '4.5dB'),
       ('r2', (1.00, 2.50), '', 0),
       ('c14', (0.72, 6.74), '', '4dB'),
       ('c15', (0.78, 3.10), '', '-2.5dB'), ('c15', (4.52, 6.30), '', '-2.5dB'),
       ('r3', (1.00, 2.50), '', 0),
       ('c16', (0.15, 7.65), 'crop=540:960:180:0,', '2dB'),
       ('c17', (0.94, 6.63), '', '0dB'),
       ('c18', (0.35, 7.33), '', '-1dB'),
       ('c19', (0.29, 3.50), '', '-1dB'), ('c19', (3.99, 7.63), '', '-1dB'),
       ('c20', (0.00, 1.93), '', '-1dB'), ('c20', (2.70, 5.47), '', '-1dB'),
       ('c21', (0.46, 4.19), 'crop=540:960:0:0,', '1.5dB'), ('c21', (4.67, 7.33), '', '1.5dB'),
       ('c22', (0.21, 5.76), 'crop=540:960:180:0,', '1dB'),
       ('c23', (0.82, 3.53), '', '1dB'), ('c23', (4.74, 7.34), '', '1dB'),
       ('c24', (0.00, 7.23), 'crop=540:960:0:0,', '1.5dB'),
       ('c25', (0.00, 4.17), 'crop=540:960:180:0,', '1.5dB'), ('c25', (4.55, 6.95), '', '1.5dB'),
       ('c26', (0.00, 3.19), 'crop=540:960:0:0,', '3.5dB'), ('c26', (3.48, 5.70), '', '3.5dB'),
       ('c27', (0.09, 2.16), '', '0.5dB'), ('c27', (2.75, 5.71), '', '0.5dB'),
       ('c28', (0.82, 5.83), 'crop=540:960:0:0,', '-1.5dB'),
       ('c29', (0.15, 4.69), 'crop=540:960:180:0,', '2.5dB'),
       ('c30', (0.12, 2.74), '', '-2.5dB'), ('c30', (3.08, 6.78), '', '-2.5dB'),
       ('c31', (0.00, 2.05), '', '1dB'), ('c31', (2.47, 5.75), '', '1dB'),
       ('c32', (1.02, 2.72), '', '1.5dB'), ('c32', (3.01, 4.85), '', '1.5dB'),
       ('r4', (2.75, 4.50), '', 0),
       ('BLACK', 0.4),
       ('c33', (0.50, 4.29), '', '-4.5dB'), ('c33', (5.14, 8.63), '', '-4.5dB')]

def main():
    if not EDL: sys.exit("EDL vacía: correr phr.py y armarla con renders/phr.json")
    L = {}  # v1: EDL por rangos medidos (renders/lv3.json)
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
    # MAJESTIC (kit _marcas: marca de agua y música de la marca; sin CONTINUARÁ)
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    # duración real del plano = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corre las camas)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c16"), at("c30")  # suspenso 0-t1 (los recibos, la amenaza, el desalojo antes de Nochebuena), cálida t1-t2 (doña Pachita y el ponche, el hospital, el plan de Graciela), suspenso t2-fin (Chelo renta el cuarto a la inquilina nueva y CTA)
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
    fv = f"[0:v][1:v]overlay=shortest=1[w];[w]null[v]"  # wm.png de brand_wm ya trae la marca en su posición
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-loop", "1", "-i", str(R / "wm.png"), "-i", str(mix),
                    "-filter_complex", fv, "-map", "[v]", "-map", "2:a", "-t", f"{dur:.2f}", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    print(out, f"{dur:.1f}s", len(parts), "planos")

if __name__ == "__main__":
    main()
