# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code layer (papel): a soft shimmer as the column leaves the atmosphere (29-31), a low cosmic pad (38-61.5)
that slowly rises in pitch with the folds, the universe hero sub (to audio/own for combine.py). Writes audio/synth.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(103)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def T_(d): return np.arange(int(d * SR)) / SR
# shimmer leaving the atmosphere
tt = T_(3.0); y = sum(np.sin(2 * np.pi * f * tt + k) for k, f in enumerate([1320, 1760, 1980, 2640])) * np.sin(np.pi * tt / 3) ** 2; put(y * db(-38), 29.0)
# the cosmic pad: an open fifth whose pitch creeps up as the folds accelerate, cut dead at 61.5
tt = T_(23.5); f0 = 55 * 2 ** (np.clip(tt / 23.5, 0, 1) ** 2 * 1.0); ph = 2 * np.pi * np.cumsum(f0) / SR
pad = (np.sin(ph) + 0.6 * np.sin(1.5 * ph + 0.4) + 0.35 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * np.minimum(1, tt / 2.5)
for side, p in [(0, -0.5), (1, 0.5)]: put(lp(pad * (1 + 0.15 * np.sin(2 * np.pi * (0.13 + 0.05 * side) * tt)), 1200) * db(-40), 38.0, p)
# the universe hero: a deep sub drop with a long bloom (combine.py puts it straight into the bed)
tt = T_(4.0); sub = np.sin(2 * np.pi * (32 + 50 * np.exp(-tt / 0.12)) * tt) * np.minimum(1, tt / 0.004) * np.exp(-tt / 1.6)
bl = sum(np.sin(2 * np.pi * f * tt + k) for k, f in enumerate([110, 164.8, 220, 329.6, 440])) / 3 * np.minimum(1, tt / 0.3) * np.exp(-tt / 2.0)
h = sub + 0.5 * bl; h /= np.abs(h).max(); sf.write("audio/own/hero.wav", (h * db(-1)).astype(np.float32), SR)
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
