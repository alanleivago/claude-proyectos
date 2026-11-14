"""Montaje de madrina-central PARTE 1 (La Madrina de la Central; copia del edit.py de viuda-aguacate: montaje por frases desde renders/lv3.json).
Uso: python -I edit.py  -> renders/share.mp4 (kit _marcas/SINMARCA: música de la marca, marca de agua transparente; --remix reusa renders/p*.mov y raw.mov, misma EDL)"""
import json, subprocess, sys, wave
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
GAP = 0.35
MUSIC_VOL = 0.13   # cama bajo la voz, como las refs
BRAND = "SINMARCA"  # SIN MARCA: brand_wm da png transparente; música de pieces/_marcas/SINMARCA
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

# v1 por frases (método aprobado, plantilla viuda-aguacate): rangos de renders/lv3.json (faster-whisper large-v3 + envolvente floor+7).
# Entra ~0.08 s antes de la voz y sale ~0.15 s después; cortes solo en fin de frase. Mismo personaje = salto dentro del clip (también en pausas largas: c03 c23 c27 c33).
# qa_clips.md: i01 solo 3.0-6.0 (gancho: cadena tensa); c02 0.53-2.42 + 3.66-4.75 (sin Nicandro ni Eva); c27 sin el "¿Y ahora?" repetido; r5 (Nicandro) -> cola muda de c12;
# crop c05 (letrero) en todo el clip; crops de borde c04 (camisa de cuadros DER. en la 1.ª frase; c04 regenerado) c14 c22 c24 c27 c32 solo mientras dura el borde; arranques c01 c03 c07 c14 c16 c23 c26 c33 c35.
# r*/i* mudos (ganancia 0) salvo i01 (foley de cadena, -8 dB). Ganancia por clip = -19.5 - LUFS (ebur128, 0.5 dB). BLACK 0.4 s antes del CTA (c36).
# 5.º campo = cambios de encuadre dentro del tramo SIN cortar el audio: [(t_fuente, vf), ...]. Ritmo: punch-in 1.25x en frases > 2.5 s.
PUNCH = "crop=576:1024:72:40,"
EL = "crop=540:960:0:0,"
ER = "crop=540:960:180:0,"
SIGN = "crop=630:1120:45:160,"
EDL = [('i01', (3.50, 4.75), '', '-8dB'),
       ('c01', (0.45, 2.29), '', '4.5dB'), ('c01', (3.45, 5.41), '', '4.5dB'),
       ('c02', (0.53, 2.42), '', '6.5dB'), ('c02', (3.66, 4.77), '', '6.5dB'),
       ('c03', (1.10, 2.62), '', '4.5dB'), ('c03', (3.32, 5.35), '', '4.5dB'),
       ('i02', (3.40, 4.60), '', 0),
       ('c04', (0.39, 2.63), EL, '1.5dB'), ('c04', (3.26, 4.93), '', '1.5dB'),
       ('c05', (1.28, 4.07), SIGN, '2dB', [(2.70, 'crop=504:896:108:180,')]), ('c05', (4.69, 6.17), SIGN, '2dB'),
       ('r1', (1.50, 2.70), '', 0),
       ('c06', (0.29, 2.46), '', '3.5dB'), ('c06', (3.04, 4.74), '', '3.5dB'),
       ('c07', (0.85, 2.20), '', '4dB'), ('c07', (3.37, 4.85), '', '4dB'),
       ('c08', (0.18, 2.34), '', '-1dB'), ('c08', (2.98, 4.58), '', '-1dB'),
       ('i03', (2.40, 3.60), '', 0),
       ('c09', (0.56, 2.02), '', '0.5dB'), ('c09', (2.57, 4.60), '', '0.5dB'),
       ('c10', (0.58, 2.59), '', '1dB'), ('c10', (3.95, 6.89), '', '1dB', [(5.30, PUNCH)]),
       ('c11', (0.97, 2.93), '', '4dB'), ('c11', (3.48, 5.42), '', '4dB'),
       ('c12', (0.76, 3.10), '', '3.5dB'), ('c12', (4.18, 6.13), '', '3.5dB'),
       ('r2', (2.00, 3.20), '', 0),
       ('c13', (0.84, 2.64), '', '3dB'), ('c13', (3.54, 5.09), '', '3dB'),
       ('c14', (0.55, 2.40), 'crop=600:1067:0:0,', '4.5dB', [(1.40, '')]), ('c14', (3.32, 4.88), '', '4.5dB'),
       ('c15', (0.07, 2.40), '', '4.5dB'), ('c15', (3.09, 4.59), '', '4.5dB'),
       ('c16', (0.55, 2.81), '', '-2dB'), ('c16', (3.66, 5.44), '', '-2dB'),
       ('c17', (0.47, 2.24), '', '3dB'), ('c17', (2.54, 3.68), '', '3dB'),
       ('c18', (0.25, 2.88), '', '-0.5dB', [(1.90, PUNCH)]), ('c18', (3.57, 5.05), '', '-0.5dB'),
       ('c19', (1.05, 3.72), '', '2dB', [(2.70, PUNCH)]), ('c19', (4.54, 6.75), '', '2dB'),
       ('i04', (1.80, 3.00), '', 0),
       ('c20', (0.61, 2.51), '', '-2.5dB'), ('c20', (3.42, 4.88), '', '-2.5dB'),
       ('i05', (1.00, 2.20), '', 0),
       ('c21', (0.75, 2.17), '', '-6dB'), ('c21', (2.87, 4.60), '', '-6dB'),
       ('c22', (0.67, 2.36), EL, '1.5dB', [(1.10, '')]), ('c22', (3.18, 4.79), '', '1.5dB'),
       ('r3', (3.30, 4.50), '', 0),
       ('c23', (0.62, 1.55), '', '3.5dB'), ('c23', (2.22, 3.10), '', '3.5dB'), ('c23', (3.62, 5.35), '', '3.5dB'),
       ('c24', (0.37, 1.45), ER, '5dB', [(1.10, '')]), ('c24', (2.57, 4.55), '', '5dB'),
       ('i06', (2.90, 4.10), '', 0),
       ('c25', (0.57, 2.02), '', '4.5dB'), ('c25', (2.77, 4.33), '', '4.5dB'),
       ('c26', (1.12, 2.75), '', '4.5dB'), ('c26', (3.57, 5.70), '', '4.5dB'),
       ('c27', (0.77, 1.85), ER, '3dB', [(1.10, '')]), ('c27', (2.47, 4.25), '', '3dB'), ('c27', (6.12, 7.65), '', '3dB'),
       ('c28', (0.57, 2.55), '', '2dB'), ('c28', (3.02, 4.45), '', '2dB'),
       ('c29', (0.62, 2.70), '', '1dB'), ('c29', (3.87, 6.55), '', '1dB', [(5.00, PUNCH)]),
       ('c30', (0.37, 2.06), '', '4.5dB'), ('c30', (2.62, 4.20), '', '4.5dB'),
       ('c31', (0.52, 3.27), '', '4dB', [(1.90, PUNCH)]), ('c31', (3.78, 6.46), '', '4dB', [(5.10, PUNCH)]),
       ('r4', (1.00, 2.20), '', 0),
       ('c32', (0.37, 2.77), EL, '3.5dB', [(1.50, '')]), ('c32', (3.59, 4.99), '', '3.5dB'),
       ('c33', (1.10, 1.95), '', '2.5dB'), ('c33', (2.87, 4.11), '', '2.5dB'), ('c33', (4.88, 7.34), '', '2.5dB'),
       ('c34', (1.12, 2.95), '', '4dB'), ('c34', (3.47, 5.65), '', '4dB'),
       ('c12', (6.10, 7.30), '', 0),  # r5 sale con Nicandro: cola muda de c12 (Rubén con ojos húmedos)
       ('c35', (0.62, 3.97), '', '7dB', [(2.30, PUNCH)]), ('c35', (4.63, 7.50), '', '7dB'),
       ('BLACK', 0.4),
       ('c36', (0.46, 3.16), '', '-1.5dB', [(2.00, PUNCH)]), ('c36', (4.17, 7.85), '', '-1.5dB', [(6.00, PUNCH)])]

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
        tail = "tpad=stop_mode=clone:stop_duration=0.5" + (f",fade=t=out:st={d - 0.6:.2f}:d=0.6" if fade else "")
        sw = pre[2] if len(pre) > 2 else []
        if sw or isinstance(pre[0], tuple):  # cambio de encuadre sin cortar el audio: un trim por tramo y concat; (clip, t, vf) = inserto encima de la voz
            bs = [0] + [round((t - s) * 24) / 24 for t, _ in sw] + [d + 0.5]; vfs = [pre[0]] + [v for _, v in sw]; k = len(vfs)
            loc = [j for j in range(k) if not isinstance(vfs[j], tuple)]; xin = []; fc = ""
            if loc: fc = f"[0:v]split={len(loc)}" + "".join(f"[s{j}]" for j in loc) + ";"
            for j in range(k):
                if isinstance(vfs[j], tuple):
                    c2, t2, v2 = vfs[j]; n = 1 + len(xin) // 4; xin += ["-ss", f"{t2:.2f}", "-i", str(C / f"{c2}.mp4")]
                    fc += f"[{n}:v]trim=start=0:end={bs[j + 1] - bs[j]:.5f},setpts=PTS-STARTPTS,{v2}scale=720:1280,setsar=1,fps=24[o{j}];"
                else: fc += f"[s{j}]trim=start={bs[j]:.5f}:end={bs[j + 1]:.5f},setpts=PTS-STARTPTS,{vfs[j]}scale=720:1280,setsar=1,fps=24[o{j}];"
            fc += "".join(f"[o{j}]" for j in range(k)) + f"concat=n={k}:v=1:a=0,{tail}[v]"
            vargs = [*xin, "-filter_complex", fc, "-map", "[v]", "-map", "0:a"]
        else: vargs = ["-vf", (pre[0] if pre else "") + "scale=720:1280,setsar=1,fps=24," + tail]
        af = (f"volume={pre[1]}," if len(pre) > 1 else "") + f"aresample=48000,apad,atrim=0:{d:.5f},afade=t=in:d=0.04,afade=t=out:st={d - (0.6 if fade else 0.06):.2f}:d={0.6 if fade else 0.06}"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s:.2f}", "-i", str(src), *vargs,
                        "-af", af, "-ac", "2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "pcm_s16le", "-frames:v", str(round(d * 24)), str(p)], check=True)
        STARTS.setdefault(cid, len(parts)); parts.append(p)
    lst = R / "list.txt"; lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    raw = R / "raw.mov"
    ins = [x for q in parts for x in ("-i", str(q))]
    fcat = "".join(f"[{k}:v]setpts=N/24/TB[v{k}];[{k}:a]asetpts=N/SR/TB[a{k}];" for k in range(len(parts))) + "".join(f"[v{k}][a{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[v][a]"
    if not (REMIX and raw.exists()): subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fcat, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", str(raw)], check=True)
    # SINMARCA (kit _marcas: marca de agua y música de la marca; sin CONTINUARÁ)
    sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    BC, M = brand(BRAND); brand_wm(BRAND, R / "wm.png")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)], capture_output=True, text=True).stdout)
    # duración real del plano = duración del stream de video (format=duration de los .mov suma ~0.02 s por plano y corre las camas)
    dl = lambda q: float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(q)], capture_output=True, text=True).stdout)
    at = lambda cid: sum(dl(q) for q in parts[:STARTS[cid]])
    t1, t2 = at("c33"), at("c35")  # suspenso 0-t1 (grúa, bodega, puertas, el ahijado, el plazo), cálida t1-t2 (el papá de Rubén cargó sin cobrar), suspenso t2-fin (llega la comadre Imelda y CTA)
    tv = MUSIC_VOL * 2.4
    out = R / "share.mp4"
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
    n = sum(1 + len(e[4]) if len(e) > 4 else 1 for e in EDL if e[0] != "BLACK")
    print(out, f"{dur:.1f}s", len(parts), "tramos", n, "planos", f"{(dur - 0.4) / n:.2f} s/plano")

if __name__ == "__main__":
    main()
