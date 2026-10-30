# splice_operator.py: the opening "Operator…" from digger-01 v3 (approved, same megagirl voice) + the rest of ep02's
# opening take ("I dug up another human artifact…"). Both are raw 24 kHz VoiceStudio takes; cuts only in silence
# (quietest 20 ms window between "Operator" and "I", must be < -42 dBFS), 8 ms fades, the ep01 pause kept.
# Also saves the reusable clip pieces/voice-fx/megagirl_operator.wav (raw) + megagirl_operator_clean.wav (clean chain).
import numpy as np, soundfile as sf, subprocess
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
EP1 = r"F:/Claude Proyectos/pieces/digger-01-fridge/voz-studio/v2/megagirl/raw/megagirl_p01.wav"
import sys
EP2 = sys.argv[1] if len(sys.argv) > 1 else r"F:/Claude Proyectos/pieces/digger-04-alarm/voz-studio/takes/v3_p01/T_gNone_s9.wav"
OUT = sys.argv[2] if len(sys.argv) > 2 else r"F:/Claude Proyectos/pieces/digger-04-alarm/voz-studio/takes/raw/megagirl_p01.wav"
VFX = r"F:/Claude Proyectos/pieces/voice-fx/"
m = WhisperModel("small", device="cpu", compute_type="int8")
def words(x, sr):
    segs, _ = m.transcribe(resample_poly(x, 16000, sr).astype(np.float32), language="en", word_timestamps=True, beam_size=5)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
def quietest(x, sr, t0, t1):
    best = (1e9, t0); t = t0
    while t + 0.02 <= t1:
        seg = x[int(t * sr):int((t + 0.02) * sr)]; v = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9); best = min(best, (v, t + 0.01)); t += 0.005
    return best
def cut_after_operator(fn):
    x, sr = sf.read(fn); x = x.mean(1) if x.ndim > 1 else x; ws = words(x, sr); print(fn.split("/")[-1], ws[:3])
    op = [w for w in ws if w[0].lower().startswith("operator")][0]; nx = ws[ws.index(op) + 1]
    v, tc = quietest(x, sr, op[2] - 0.02, max(nx[1] + 0.02, nx[2] - 0.08)); print("  cut", round(tc, 3), "s at", round(v, 1), "dB  (Operator ends", round(op[2], 2), ", next word", nx[0], round(nx[1], 2), ")")
    assert v < -42, "no silence"
    return x, sr, int(tc * sr), ws
a, sra, ca, wa = cut_after_operator(EP1); b, srb, cb, wb = cut_after_operator(EP2); assert sra == srb
n = int(0.008 * sra); head = a[:ca].copy(); head[-n:] *= np.linspace(1, 0, n); tail = b[cb:].copy(); tail[:n] *= np.linspace(0, 1, n)
# keep ep01's own pause after "Operator…": measure the silence that follows the cut in ep01, add the same before ep02's "I"
gap_a = [w for w in wa if w[0].lower().startswith("i")][0][1] - ca / sra; gap_b = [w for w in wb if w[0] == "I" or w[0].lower() == "i"][0][1] - cb / srb
pad = max(0.0, gap_a - gap_b); y = np.concatenate([head, np.zeros(int(pad * sra)), tail])
sf.write(OUT, y, sra, subtype="PCM_16"); print("spliced", round(len(y) / sra, 2), "s, pause pad", round(pad, 2), "->", OUT)
op_end = ca + int(0.25 * sra); clip = a[:min(len(a), ca)].copy(); clip[-n:] *= np.linspace(1, 0, n)
sf.write(VFX + "megagirl_operator.wav", clip, sra, subtype="PCM_16")
subprocess.run(["python", "-I", VFX + "retro_voice.py", VFX + "megagirl_operator.wav", VFX + "megagirl_operator_clean.wav", "--preset", "genre", "--eq", "0"], check=True, capture_output=True)
print("clip", round(len(clip) / sra, 2), "s ->", VFX + "megagirl_operator.wav (+ _clean)")
print("whisper new p01:", " ".join(w[0] for w in words(y, sra)))
