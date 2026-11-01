# splice_operator.py: the approved opening "Operator…" clip (pieces/voice-fx/megagirl_operator.wav, raw, same megagirl voice)
# + the rest of this episode's p01 take ("my detector says…"). Cut only in silence (quietest 20 ms window between "Operator"
# and "my", must be < -42 dBFS), 8 ms fades, keeps a natural 0.45 s pause after "Operator…".
import sys, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
IN, OUT = sys.argv[1], sys.argv[2]
CLIP = r"F:/Claude Proyectos/pieces/voice-fx/megagirl_operator.wav"
m = WhisperModel("small", device="cpu", compute_type="int8")
def words(x, sr):
    segs, _ = m.transcribe(resample_poly(x, 16000, sr).astype(np.float32), language="en", word_timestamps=True, beam_size=5)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
def quietest(x, sr, t0, t1):
    best = (1e9, t0); t = t0
    while t + 0.02 <= t1:
        seg = x[int(t * sr):int((t + 0.02) * sr)]; v = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9); best = min(best, (v, t + 0.01)); t += 0.005
    return best
b, sr = sf.read(IN); b = b.mean(1) if b.ndim > 1 else b; ws = words(b, sr); print(ws[:3])
op = [w for w in ws if w[0].lower().startswith("operator")][0]; nx = ws[ws.index(op) + 1]
v, tc = quietest(b, sr, op[2] - 0.02, max(nx[1] + 0.02, nx[2] - 0.08)); print("cut", round(tc, 3), "s at", round(v, 1), "dB; next word", nx[0], round(nx[1], 2)); assert v < -42, "no silence"
a, sra = sf.read(CLIP); a = a.mean(1) if a.ndim > 1 else a
if sra != sr: a = resample_poly(a, sr, sra)
n = int(0.008 * sr); tail = b[int(tc * sr):].copy(); tail[:n] *= np.linspace(0, 1, n)
pad = max(0.0, 0.45 - (nx[1] - tc))
y = np.concatenate([a, np.zeros(int(pad * sr)), tail]); sf.write(OUT, y, sr, subtype="PCM_16")
print("spliced", round(len(y) / sr, 2), "s ->", OUT); print("whisper:", " ".join(w[0] for w in words(y, sr)))
