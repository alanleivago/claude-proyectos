# regen_q.py PROFILE OUTDIR PREFIX "TEXT" seeds -> takes + whisper + final-word pitch contour (rise in semitones)
import sys, os, requests, numpy as np, wave, parselmouth, json
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
prof, out, pre, text, seeds = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], [int(s) for s in sys.argv[5].split(",")]
m = WhisperModel("small", device="cpu", compute_type="int8"); os.makedirs(out, exist_ok=True); res = []
def contour(fn, t0, t1):
    snd = parselmouth.Sound(fn); p = snd.to_pitch_ac(pitch_floor=120, pitch_ceiling=700, time_step=0.01)
    ts = p.xs(); f = p.selected_array["frequency"]; sel = (ts >= t0) & (ts <= t1) & (f > 0)
    return ts[sel], f[sel]
for s in seeds:
    fn = os.path.join(out, f"{pre}_s{s}.wav")
    r = requests.post("http://127.0.0.1:3900/generate", data=dict(text=text, language="en", profile_id=prof, num_step=32, seed=s, effect_preset="raw"), timeout=900)
    open(fn, "wb").write(r.content)
    w = wave.open(fn); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; sr = w.getframerate()
    segs, _ = m.transcribe(resample_poly(a, 16000, sr).astype(np.float32), language="en", word_timestamps=True, beam_size=5)
    words = [x for sg in segs for x in sg.words]; hyp = " ".join(x.word.strip() for x in words)
    q = [x for x in words if x.word.strip().endswith("?")]; lw = q[0] if q else words[-1]; ts, f = contour(fn, lw.start, lw.end + 0.15)
    if len(f) < 6: rise = float("nan")
    else:
        k = len(f) // 3; rise = 12 * np.log2(np.median(f[-k:]) / np.median(f[:k]))
    res.append(dict(seed=s, text=hyp, last=lw.word.strip(), rise_st=round(float(rise), 2), dur=round(len(a) / sr, 2)))
    print(res[-1], flush=True)
json.dump(res, open(os.path.join(out, f"{pre}_pitch.json"), "w"), indent=1)
