"""QA de clips (método pedida-mano/qa_clips.md): hojas de 5 fotogramas por clip (0.05 s, 25/50/75/95 %) en renders/qa/sheet_N.jpg (6 clips por hoja),
transcripción faster-whisper large-v3 con tiempos de frase (renders/lv3.json, mismo formato que phr.json) y LUFS por clip. Uso: python -I qa.py [ID ...]"""
import json, subprocess, sys, wave, re, numpy as np
from pathlib import Path
from PIL import Image
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; Q = R / "qa"; Q.mkdir(parents=True, exist_ok=True)
L = json.loads((D / "lines.json").read_text(encoding="utf-8"))
want = sys.argv[1:]
order = [k for k in L if (C / f"{k}.mp4").exists() and (not want or k in want)]
dur = lambda f: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)], capture_output=True, text=True).stdout)

def frame(f, t, w=180):
    p = Q / "tmp.png"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.2f}", "-i", str(f), "-frames:v", "1", "-vf", f"scale={w}:-2", str(p)], check=True)
    return Image.open(p).convert("RGB").copy()

rows = []
for k in order:
    f = C / f"{k}.mp4"; d = dur(f)
    ims = [frame(f, t) for t in (0.05, d * .25, d * .5, d * .75, d * .95)]
    rows.append((k, ims))
from PIL import ImageDraw
for n in range(0, len(rows), 6):
    chunk = rows[n:n + 6]; w, h = chunk[0][1][0].size
    S = Image.new("RGB", (w * 5, h * len(chunk)), "white"); dr = ImageDraw.Draw(S)
    for i, (k, ims) in enumerate(chunk):
        for j, im in enumerate(ims): S.paste(im.resize((w, h)), (j * w, i * h))
        dr.rectangle((0, i * h, 44, i * h + 18), fill="black"); dr.text((3, i * h + 3), k, fill="yellow")
    S.save(Q / f"sheet_{n // 6 + 1}{'_' + '_'.join(want) if want else ''}.jpg", quality=85)

from faster_whisper import WhisperModel
M = WhisperModel("large-v3", device="cpu", compute_type="int8")
lv = json.loads((R / "lv3.json").read_text(encoding="utf-8")) if (R / "lv3.json").exists() else {}
for k in order:
    f = C / f"{k}.mp4"; wav = R / "tmp.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(f), "-ac", "1", "-ar", "16000", str(wav)], check=True)
    w = wave.open(str(wav)); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; w.close()
    h = 160; env = np.array([20 * np.log10(np.sqrt(np.mean(a[i:i + h] ** 2)) + 1e-9) for i in range(0, len(a) - h, h)])
    floor = np.percentile(env[5:], 10); voice = env > max(floor + 7, -48)
    segs, _ = M.transcribe(a, language="es", word_timestamps=True, vad_filter=False)
    ws = [x for s in segs for x in s.words]; ph = []
    for x in ws:
        if ph and x.start - ph[-1][1] < 0.35: ph[-1][1] = x.end; ph[-1][2] += x.word
        else: ph.append([x.start, x.end, x.word])
    res = []
    for s, e, t in ph:
        i0, i1 = int(max(0, s - 0.3) * 100), int(min(len(voice) - 1, (e + 0.4) * 100))
        v = np.where(voice[i0:i1])[0]
        vs, ve = ((i0 + v[0]) / 100, (i0 + v[-1] + 1) / 100) if len(v) else (s, e)
        res.append({"w": [round(s, 2), round(e, 2)], "v": [round(vs, 2), round(ve, 2)], "t": t.strip()})
    m = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(f), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True, errors="ignore").stderr
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", m)[-1])
    lv[k] = {"dur": round(len(a) / 16000, 2), "lufs": lufs, "phr": res}
    print(f"{k} [{lufs} LUFS] esperado: {' | '.join(L[k]) or '(mudo)'}\n    oído: " + " | ".join(f"{p['v'][0]}-{p['v'][1]} {p['t']}" for p in res), flush=True)
(R / "lv3.json").write_text(json.dumps(lv, ensure_ascii=False, indent=1), encoding="utf-8")
print("FIN QA", flush=True)
