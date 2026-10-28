# energy_takes.py OUTDIR PREFIX "TEXT" seeds [guidance,...] -> takes + whisper + energy metrics (F0 median/range, pitch
# movement, loudness swing). v2 (ep02 feedback): pick the liveliest natural take of a line by numbers, then by ear.
import sys, os, json, requests, numpy as np, wave, parselmouth, difflib, re
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
out, pre, text = sys.argv[1], sys.argv[2], sys.argv[3]
seeds = [int(s) for s in sys.argv[4].split(",")]; guid = [(None if g == "none" else float(g)) for g in (sys.argv[5] if len(sys.argv) > 5 else "none").split(",")]   # none = server default, like gen2.py
os.makedirs(out, exist_ok=True); m = WhisperModel("small", device="cpu", compute_type="int8"); res = []
norm = lambda s: " ".join(re.sub(r"[^a-z0-9 ]", " ", s.lower().replace("-", " ")).split())
for g in guid:
    for s in seeds:
        fn = os.path.join(out, f"{pre}_g{g if g is None else format(g, 'g')}_s{s}.wav")
        data = dict(text=text, language="en", profile_id="baab32b2", num_step=32, seed=s, effect_preset="raw")
        if g is not None: data["guidance_scale"] = g
        r = requests.post("http://127.0.0.1:3900/generate", data=data, timeout=900)
        r.raise_for_status(); open(fn, "wb").write(r.content)
        w = wave.open(fn); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; sr = w.getframerate()
        segs, _ = m.transcribe(resample_poly(a, 16000, sr).astype(np.float32), language="en", word_timestamps=True, beam_size=5)
        words = [x for sg in segs for x in sg.words]; hyp = " ".join(x.word.strip() for x in words)
        p = parselmouth.Sound(fn).to_pitch_ac(pitch_floor=120, pitch_ceiling=700, time_step=0.01); f = p.selected_array["frequency"]; f = f[f > 0]
        st = 12 * np.log2(f / np.median(f)); hop = int(0.02 * sr)
        rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)]); v = rms[rms > rms.max() * 0.05]
        last = words[-1].end if words else 0
        res.append(dict(file=os.path.basename(fn), g=g, seed=s, match=round(difflib.SequenceMatcher(None, norm(text), norm(hyp)).ratio(), 3), text=hyp,
                        f0_med=round(float(np.median(f))), f0_range_st=round(float(np.percentile(st, 95) - np.percentile(st, 5)), 1),
                        f0_move=round(float(np.mean(np.abs(np.diff(st)))), 3), loud_swing_db=round(float(np.std(20 * np.log10(v + 1e-9))), 1),
                        dur=round(len(a) / sr, 2), tail_after_last_word=round(len(a) / sr - last, 2)))
        print(res[-1], flush=True)
json.dump(res, open(os.path.join(out, f"{pre}_metrics.json"), "w"), indent=1)
