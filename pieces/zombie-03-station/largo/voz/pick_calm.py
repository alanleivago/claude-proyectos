# Genera varias semillas de las tomas dadas y elige la mas tranquila que whisper oye bien.
# Tranquila = F0 medio y energia (RMS de los tramos con voz) mas cerca de la mediana de todas las tomas de Ava
# (una lectura gritada sube F0 y energia). python pick_calm.py g1 q3 n5 l3 ...
import sys, json, os, shutil, re, numpy as np, soundfile as sf
import gen  # reutiliza tts(), heard(), norm() y T de gen.py (sin argumentos no genera nada nuevo si ya existen)
from takes import T
SEEDS = [1, 2, 3, 4, 5]
def stats(path):
    x, sr = sf.read(path); x = x if x.ndim == 1 else x.mean(1)
    H = int(0.03 * sr); fr = [x[i:i + H] for i in range(0, len(x) - H, H // 2)]
    e = np.array([np.sqrt(np.mean(f ** 2)) for f in fr]); v = e > e.max() * 0.2
    f0s = []
    for f, ok in zip(fr, v):
        if not ok: continue
        f = f - f.mean(); ac = np.correlate(f, f, "full")[len(f) - 1:]
        lo, hi = int(sr / 400), int(sr / 120); k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > 0.3 * ac[0]: f0s.append(sr / k)
    return float(np.median(f0s)) if f0s else 0.0, float(20 * np.log10(np.mean(e[v]) + 1e-9))
base = [stats(f"takes/{t[0]}.wav") for t in T if t[2] == "ava" and os.path.exists(f"takes/{t[0]}.wav")]
mf0 = np.median([b[0] for b in base]); mdb = np.median([b[1] for b in base])
print(f"mediana Ava: F0 {mf0:.0f} Hz, energia {mdb:.1f} dB")
TX = {t[0]: t for t in T}
for tid in sys.argv[1:]:
    _, ch, who, text, reuse, gap = TX[tid]; os.makedirs(f"calm/{tid}", exist_ok=True); best = None
    for s in SEEDS:
        gen.seed = s; out = f"calm/{tid}/s{s}.wav"
        if not os.path.exists(out): gen.tts(text, gen.VOICE[who], out)
        h, d = gen.heard(out); ok = gen.norm(h) == gen.norm(text.replace("A.M.", "AM"))
        f0, db = stats(out); score = abs(np.log2(max(f0, 1) / mf0)) * 12 + max(0, db - mdb) * 0.5 + (0 if ok else 100) + (60 if h.strip().endswith('?') and not text.endswith('?') else 0)
        print(f"  {tid} s{s} F0 {f0:4.0f} E {db:5.1f} {'OK ' if ok else 'DIF'} score {score:5.1f} | {h}")
        if best is None or score < best[0]: best = (score, out)
    shutil.copy(best[1], f"takes/{tid}.wav"); print(f"=> {tid}: {best[1]}")
