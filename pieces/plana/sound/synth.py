# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code-made layer (plana): the snap flat (2 s), the flock's wings, an opening chord (4-18), a low groan as down
tilts, rock tumbles, the whoosh to the rim, a space drone, risers as the edges climb, the hero (to audio/own for combine.py),
debris thuds in the chaos, the card swell. Writes audio/synth.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(2026)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
def T_(d): return np.arange(int(d * SR)) / SR
# the snap: a reversed swell into a soft thump as the world goes flat (1.4-2.2)
tt = T_(0.8); put(bp(rng.standard_normal(len(tt)), 300, 5000) * (tt / 0.8) ** 3 * db(-18), 1.4)
tt = T_(0.8); put((np.sin(2 * np.pi * 60 * tt) * np.exp(-tt / 0.15) + 0.3 * bp(rng.standard_normal(len(tt)), 1500, 6000) * np.exp(-tt / 0.03)) * db(-21), 2.2)
# the flock's wings (2-5)
for k in range(260):
    t0 = 2.0 + rng.random() * 3.2; tt = T_(0.06); put(bp(rng.standard_normal(len(tt)), 400, 3000) * np.sin(np.pi * tt / 0.06) * db(-32 - 6 * rng.random() - 3 * (t0 - 2)), t0, rng.random() * 1.4 - 0.7)
# an opening chord (4-18): a wide, airy fifth stack
tt = T_(14); ch = sum(np.sin(2 * np.pi * f * tt + k) for k, f in enumerate([110, 165, 220, 330, 440, 660])) * np.sin(np.pi * tt / 14) ** 2; put(lp(ch, 2000) * db(-36), 4.0)
# a low groan as "down" starts to tilt (18-22) and grows when steep (31-34)
for t0, d, g in [(18.2, 3.6, -26), (31.0, 3.0, -22)]:
    tt = T_(d); f0 = 45 + 15 * np.sin(np.pi * tt / d); ph = 2 * np.pi * np.cumsum(f0) / SR; y = bp(np.sign(np.sin(ph)) * (0.6 + 0.4 * rng.standard_normal(len(tt))), 60, 700) * np.sin(np.pi * tt / d) ** 2; put(y * db(g), t0)
# rock tumbles (25-34)
for k in range(90):
    t0 = 25 + 9 * rng.random() ** 0.7; tt = T_(0.35); y = (np.sin(2 * np.pi * (70 + 60 * rng.random()) * tt) * np.exp(-tt / 0.08) + 0.4 * bp(rng.standard_normal(len(tt)), 300, 2500) * np.exp(-tt / 0.03)); put(y * db(-30 + 6 * (t0 - 25) / 9 - 4 * rng.random()), t0, rng.random() * 1.4 - 0.7)
# whoosh to the rim and back (33.4, 43.4)
for t0 in [33.2, 43.3]: tt = T_(1.0); put(bp(rng.standard_normal(len(tt)), 300, 6000) * np.sin(np.pi * tt / 1.0) ** 2 * db(-18), t0)
# space drone (34-44)
tt = T_(10); dr = (np.sin(2 * np.pi * 41 * tt) + 0.6 * np.sin(2 * np.pi * 61.5 * tt) + 0.3 * np.sin(2 * np.pi * 123 * tt + np.sin(2 * np.pi * 0.2 * tt))) * np.minimum(1, tt / 1) * np.minimum(1, (10 - tt) / 0.6); put(lp(dr, 500) * db(-26), 34)
# risers as the edges climb (47-58.8), cut dead
tt = T_(11.8); ri = bp(rng.standard_normal(len(tt)), 150, 2500) * (tt / 11.8) ** 2.2; put(ri * db(-22), 47.0)
# the hero: a crushing impact (to audio/own; combine.py puts it into the bed)
tt = T_(3.2); sub = np.sin(2 * np.pi * (40 + 35 * np.exp(-tt / 0.12)) * tt) * np.minimum(1, tt / 0.01) * np.exp(-tt / 1.1)
crk = norm(bp(rng.standard_normal(len(tt)), 600, 8000)) * np.exp(-tt / 0.1) * 0.6; body = norm(lp(brown(len(tt)), 300)) * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.9)
h = sub + crk + body; h /= np.abs(h).max(); sf.write("audio/own/hero.wav", (h * db(-1)).astype(np.float32), SR)
# debris thuds in the chaos (59.8-63.8)
for k in range(30):
    t0 = 59.8 + 4 * rng.random(); tt = T_(0.6); y = np.sin(2 * np.pi * (50 + 40 * rng.random()) * tt) * np.exp(-tt / 0.12) + 0.5 * bp(rng.standard_normal(len(tt)), 200, 1800) * np.exp(-tt / 0.05); put(y * db(-24 - 6 * rng.random()), t0, rng.random() * 1.6 - 0.8)
# the card swell
tt = T_(5); put(norm(lp(brown(len(tt)), 90)) * np.sin(np.pi * tt / 5) * db(-24), 64.3)
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
