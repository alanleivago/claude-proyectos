# splice_op.py IN OUT: the approved "Operator…" clip (pieces/voice-fx/megagirl_operator.wav) + 0.4 s pause + this take after its own "Operator" (cut only in silence)
import sys, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
IN, OUT = sys.argv[1:3]
x, sr = sf.read(IN); x = x.mean(1) if x.ndim > 1 else x
op, sro = sf.read(r"F:/Claude Proyectos/pieces/voice-fx/megagirl_operator.wav"); op = op.mean(1) if op.ndim > 1 else op
if sro != sr: op = resample_poly(op, sr, sro)
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(resample_poly(x, 16000, sr).astype(np.float32), language="en", word_timestamps=True, beam_size=5)
ws = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
o = [w for w in ws if w[0].lower().startswith("operator")][0]; nx = ws[ws.index(o) + 1]
best = (1e9, o[2]); t = o[2] - 0.02
while t + 0.02 <= nx[1] + 0.02:
    seg = x[int(t * sr):int((t + 0.02) * sr)]; v = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9); best = min(best, (v, t + 0.01)); t += 0.005
v, tc = best; print("cut", round(tc, 3), round(v, 1), "dB; next", nx); assert v < -40
c = int(tc * sr); tail = x[c:].copy(); a = np.abs(tail); i0 = int(np.argmax(a > a.max() * 0.03)); tail = tail[max(0, i0 - int(0.03 * sr)):]
n = int(0.008 * sr); tail[:n] *= np.linspace(0, 1, n); head = op.copy(); head[-n:] *= np.linspace(1, 0, n)
y = np.concatenate([head, np.zeros(int(0.4 * sr)), tail]); sf.write(OUT, y, sr, subtype="PCM_16"); print("ok", round(len(y) / sr, 2))
