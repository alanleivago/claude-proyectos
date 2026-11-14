"""Frases por clip (regreso-chicago, copia de encendedor): palabras faster-whisper (small) + envelope de voz (RMS 10 ms) -> renders/phr.json
Frase = palabras separadas por pausa < 0.35 s. Inicio/fin = primer/último tramo de voz cerca de las palabras."""
import json, subprocess, sys, wave, numpy as np
from pathlib import Path
from faster_whisper import WhisperModel
sys.stdout.reconfigure(encoding="utf-8")
D = Path(__file__).parent; C = D / "clips"; R = D / "renders"; R.mkdir(exist_ok=True)
M = WhisperModel("small", device="cpu", compute_type="int8"); out = {}
for f in sorted(C.glob("*.mp4")):
    wav = R / "tmp.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(f), "-ac", "1", "-ar", "16000", str(wav)], check=True)
    w = wave.open(str(wav)); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; w.close()
    h = 160; env = np.array([20 * np.log10(np.sqrt(np.mean(a[i:i + h] ** 2)) + 1e-9) for i in range(0, len(a) - h, h)])
    floor = np.percentile(env[5:], 10); voice = env > max(floor + 14, -48)
    segs, _ = M.transcribe(a, language="es", word_timestamps=True)
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
    out[f.stem] = {"dur": round(len(a) / 16000, 2), "floor": round(float(floor), 1), "phr": res}
    print(f.stem, " | ".join(f"{p['v'][0]}-{p['v'][1]} {p['t']}" for p in res), flush=True)
(R / "phr.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
