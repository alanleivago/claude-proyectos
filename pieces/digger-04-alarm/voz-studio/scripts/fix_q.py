# fix_q.py IN OUT WORD SEMITONES (v2: splices only the word back into the untouched take): the TTS can't raise wh-questions -> rewrite the pitch of WORD (first match) as a
# rise of SEMITONES (linear in st) from its first voiced F0, via Praat PSOLA (overlap-add); the rest of the take is untouched
import sys, numpy as np, parselmouth, soundfile as sf
from parselmouth.praat import call
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
fi, fo, word, st = sys.argv[1], sys.argv[2], sys.argv[3].lower(), float(sys.argv[4])
x, sr = sf.read(fi); x = x.mean(1) if x.ndim > 1 else x
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(resample_poly(x, 16000, sr).astype(np.float32), language="en", word_timestamps=True, beam_size=5)
ws = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
w0, w1 = [(s, e) for t, s, e in ws if t.lower().strip("?.,!").startswith(word)][0]
w1 += 0.25
snd = parselmouth.Sound(x, sr); man = call(snd, "To Manipulation", 0.01, 120, 700)
pt = call(man, "Extract pitch tier"); n = call(pt, "Get number of points")
pts = [(call(pt, "Get time from index", i), call(pt, "Get value at index", i)) for i in range(1, n + 1)]
inw = [(t, f) for t, f in pts if w0 <= t <= w1]; w0 = inw[0][0]; w1 = inw[-1][0] + 0.01
f_start = np.median([f for t, f in inw[:4]])
for t, f in inw: call(pt, "Remove points between", t - 1e-4, t + 1e-4)
for t, f in inw:
    k = (t - w0) / (w1 - w0); call(pt, "Add point", t, f_start * 2 ** (st * k / 12) * (f / f_start) ** 0.15)
call([man, pt], "Replace pitch tier"); out = call(man, "Get resynthesis (overlap-add)").values[0][:len(x)]
# v2 (user: the fully resynthesised take sounded robotic): keep the ORIGINAL audio everywhere and only splice the PSOLA'd
# word in: in at the word's unvoiced onset (the two signals are time-aligned and identical there), out in the silence after it
ws0 = [s_ for t, s_, e in ws if t.lower().strip("?.,!\"").startswith(word)][0]
i0 = int((ws0 - 0.02) * sr); i1 = int((w1 + 0.12) * sr); f = int(0.015 * sr); y = x.copy()
fade = np.linspace(0, 1, f); y[i0:i0 + f] = x[i0:i0 + f] * (1 - fade) + out[i0:i0 + f] * fade; y[i0 + f:i1 - f] = out[i0 + f:i1 - f]; y[i1 - f:i1] = out[i1 - f:i1] * (1 - fade) + x[i1 - f:i1] * fade
sf.write(fo, y, sr, subtype="PCM_16"); print("word", word, round(w0, 2), round(w1, 2), "f_start", round(f_start), "points", len(inw))
