# intonation.py FILE... -> per file: last word and the pitch change across it (semitones, last third vs first third); also "cold?" in p06
import sys, numpy as np, wave, parselmouth
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
m = WhisperModel("small", device="cpu", compute_type="int8")
def rise(fn, t0, t1):
    p = parselmouth.Sound(fn).to_pitch_ac(pitch_floor=120, pitch_ceiling=700, time_step=0.01); ts = p.xs(); f = p.selected_array["frequency"]
    sel = (ts >= t0) & (ts <= t1) & (f > 0); f = f[sel]
    if len(f) < 6: return float("nan")
    k = len(f) // 3; return 12 * np.log2(np.median(f[-k:]) / np.median(f[:k]))
for fn in sys.argv[1:]:
    w = wave.open(fn); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; sr = w.getframerate()
    segs, _ = m.transcribe(resample_poly(a, 16000, sr).astype(np.float32), language="en", word_timestamps=True, beam_size=5)
    ws = [x for sg in segs for x in sg.words]
    out = [f"{x.word.strip()}:{rise(fn, x.start, x.end + 0.12):+.1f}" for x in ws if x.word.strip().endswith(("?", ".", "!")) or x is ws[-1]]
    print(fn.split("/")[-1], " ".join(out), flush=True)
