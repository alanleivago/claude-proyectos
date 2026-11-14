"""Montaje de nochebuena PARTE 2 (La Cena de Nochebuena; copia del edit.py de regreso-20-p2: montaje por frases, renders/phr.json de phr.py). Marca de la Parte 1: MAJESTIC STORIES.
Uso: python -I edit.py  -> renders/v1.mp4; --remix -> renders/v2.mp4 (kit _marcas/MAJESTIC: música y marca propias; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
TENSION_AT = 0.0  # no se usa: las camas van por t1/t2
BRAND = "MAJESTIC"  # misma marca que la Parte 1 (nochebuena/edit.py, fuera de la rotación): música + marca de agua (arriba a la izquierda, x=36, y=210) salen de pieces/_marcas/MAJESTIC
REMIX = "--remix" in sys.argv
TENSION_GAIN = 1.0

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

# v1 por frases (método aprobado de casera-recibos / regreso-20-p2): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7, scratch lv3.py).
# Entra 0.08 s antes de la voz y sale 0.15 s después; cortes solo en fin de frase; pausas que ahorran < 0.2 s no se cortan. Mismo personaje = salto dentro del clip.
# qa_clips.md: arranques c01 >= 0.9, c03 >= 0.85, c06 >= 1.0, c23 >= 0.8, r1 >= 0.6, r3 >= 0.75; i1 solo 0-2.5; crops c24 (0-1.4) y c25 (0-0.8) en su 1.er tramo.
# i1, r1, r2, r3 mudos (ganancia 0). Ganancia por clip = -19.5 - LUFS (renders/lufs.txt, redondeo 0.5 dB). c21 sigue hasta 4.4 (rompe el papel). BLACK 0.4 s antes del CTA (c27).
EDL = [('c01', (0.96, 2.52), '', '2dB'), ('c01', (3.11, 5.13), '', '2dB'),
       ('c02', (0.94, 6.25), '', '0dB'),
       ('c03', (0.86, 3.41), '', '0dB'), ('c03', (3.74, 5.96), '', '0dB'),
       ('c04', (0.45, 5.87), '', '1.5dB'),
       ('r1', (0.6, 2.0), '', 0),
       ('c05', (0.21, 3.52), '', '0dB'), ('c05', (4.02, 6.54), '', '0dB'),
       ('i1', (0.2, 1.6), '', 0),
       ('c06', (1.01, 5.83), '', '-3.5dB'),
       ('c07fx', (0.51, 6.88), '', '1.5dB'),  # c07 v2 sin la "a" (2.64-2.73 fuera) + i1 1.6-2.5 tapando 2.35-3.25 (qa_clips.md)
       ('c08', (0.22, 2.79), '', '1dB'), ('c08', (3.38, 6.09), '', '1dB'),
       ('c09', (0.02, 5.88), '', '-1.5dB'),
       ('c10', (0.17, 4.80), '', '-1dB'),
       ('c11', (0.22, 3.20), '', '1.5dB'), ('c11', (3.67, 6.49), '', '1.5dB'),
       ('c12', (1.85, 4.40), '', '-3dB'),
       ('c13', (0.27, 4.37), '', '3dB'),
       ('c14', (1.22, 7.49), '', '3dB'),
       ('r2', (1.0, 2.4), '', 0),
       ('c15', (0.46, 1.79), '', '5dB'), ('c15', (2.53, 5.15), '', '5dB'),
       ('c16', (0.54, 5.77), '', '2.5dB'),
       ('c17', (1.51, 4.41), '', '4.5dB'), ('c17', (4.58, 7.02), '', '4.5dB'),
       ('c18', (0.66, 3.63), '', '-2dB'), ('c18', (4.07, 6.94), '', '-2dB'),
       ('c19', (0.80, 4.29), '', '-0.5dB'),
       ('c20', (1.09, 7.32), '', '-0.5dB'),
       ('r3', (0.8, 2.2), '', 0),
       ('c21', (0.36, 4.40), '', '3.5dB'),
       ('c22', (0.13, 4.77), '', '3dB'),
       ('c23', (0.80, 2.80), '', '-1dB'), ('c23', (3.40, 7.19), '', '-1dB'),
       ('c24', (0.14, 1.72), 'crop=540:960:30:0,', '-1.5dB'), ('c24', (1.72, 5.36), '', '-1.5dB'),
       ('c25', (0.02, 2.82), 'crop=576:1024:72:0,', '-4dB'), ('c25', (3.11, 6.48), '', '-4dB'),
       ('c26', (0.06, 5.04), '', '-4.5dB'),
       ('BLACK', 0.4),
       ('c27', (0.57, 3.37), '', '0dB'), ('c27', (3.88, 7.68), '', '0dB')]

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
    # marca MAJESTIC STORIES (kit _marcas: 22 px, alpha 80, arriba a la izquierda x=36 y=210; sin CONTINUARÁ) + camas musicales del kit
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    # duración real del plano en raw.mov = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corría las camas ~0.5-0.9 s)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    # suspenso 0-t1 (patio: Herminia oyó la trampa; cocina: se lo cuenta a Ignacio), cálida t1-t2 (Herminia decide leerlo, Ignacio a su lado),
    # suspenso t2-t3 (la firma: el papel dice Regina, Ignacio corre a su hija), cálida t3-fin (perdón, la cabecera, la piñata, CTA)
    t1, t2, t3 = at("c09"), at("c11"), at("c22")  # cálida desde c09 (c07/c08: revelación y enojo van en tensión)
    tv = MUSIC_VOL * 2.4 * TENSION_GAIN
    out = R / ("v2.mp4" if REMIX else "v1.mp4")  # v2 = misma EDL, otra mezcla del kit MAJESTIC
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
