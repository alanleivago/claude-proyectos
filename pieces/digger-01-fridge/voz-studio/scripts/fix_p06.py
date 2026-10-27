# fix_p06.py: wh-question "Why not just make cold?" always falls in the TTS -> take q06b seed 6 (flattest), raise the
# pitch of "cold?" with a gentle PSOLA ramp (0 -> +6 st) and splice it into p06 between "Operator Mike asks," and "Mike..."
# cutting p06 only in silence (< -45 dBFS).
import numpy as np, parselmouth, soundfile as sf, wave
from parselmouth.praat import call
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
V2 = r"F:/Claude Proyectos/pieces/digger-01-fridge/voz-studio/v2/megagirl"
m = WhisperModel("small", device="cpu", compute_type="int8")
def words(x, sr):
    segs, _ = m.transcribe(resample_poly(x, 16000, sr).astype(np.float32), language="en", word_timestamps=True, beam_size=5)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
q, sr = sf.read(f"{V2}/q06b/megagirl_q_s6.wav"); wq = words(q, sr); print(wq)
w0, w1 = [(s, e) for t, s, e in wq if t.lower().startswith("cold")][0]
snd = parselmouth.Sound(q, sr); man = call(snd, "To Manipulation", 0.01, 120, 700)
pt = call(man, "Extract pitch tier"); n = call(pt, "Get number of points")
for i in range(1, n + 1):
    t = call(pt, "Get time from index", i); f = call(pt, "Get value at index", i)
    if t >= w0:
        k = min(1.0, (t - w0) / max(0.05, (w1 + 0.1 - w0))); call(pt, "Remove point", i); call(pt, "Add point", t, f * 2 ** (7 * k / 12))
call([man, pt], "Replace pitch tier"); out = call(man, "Get resynthesis (overlap-add)")
qq = out.values[0]
def sil(x, sr, t0, t1):   # quietest 20 ms point in [t0, t1]
    best = (1e9, t0); t = t0
    while t + 0.02 <= t1:
        seg = x[int(t * sr):int((t + 0.02) * sr)]; v = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9); best = min(best, (v, t + 0.01)); t += 0.005
    return best
p, sr2 = sf.read(f"{V2}/raw/megagirl_p06.wav"); wp = words(p, sr2); print(wp)
ia = [i for i, (t, s, e) in enumerate(wp) if t.lower().startswith("asks")][0]
im = [i for i, (t, s, e) in enumerate(wp) if t.lower().startswith("mike")][1]
va, ca = sil(p, sr2, wp[ia][2] - 0.02, wp[ia + 1][1] + 0.02); vm, cm = sil(p, sr2, wp[im - 1][2] - 0.02, wp[im][1] + 0.02)
print("cuts", round(ca, 3), round(va, 1), "dB |", round(cm, 3), round(vm, 1), "dB")
assert va < -36 and vm < -36   # breath-level gaps between words (TTS floor ~-40 dBFS)
A = p[:int(ca * sr2)]; C = p[int(cm * sr2):]
# trim the question's own head/tail silence
e = np.abs(qq); on = np.where(e > 0.01)[0]; Q = qq[max(0, on[0] - int(0.03 * sr)):on[-1] + int(0.08 * sr)]
f = int(0.015 * sr2); A[-f:] *= np.linspace(1, 0, f); C[:f] *= np.linspace(0, 1, f)
new = np.concatenate([A, np.zeros(int(0.22 * sr2)), Q, np.zeros(int(0.3 * sr2)), C])
sf.write(f"{V2}/alt/megagirl_p06_s1.wav", p, sr2, subtype="PCM_16"); sf.write(f"{V2}/raw/megagirl_p06.wav", new, sr2, subtype="PCM_16")
print("p06 new", round(len(new) / sr2, 2), "s")
