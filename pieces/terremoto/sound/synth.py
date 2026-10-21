# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code-made layer under the recordings (terremoto): the quake's sub-tremor following the magnitude, rattling
(objects, windows, dishes), debris clatter, collapse rumbles, the wave's roar to a dead stop at 60.0, the underwater churn and
bubbles (no recordings under water). Writes audio/synth.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(1960)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def env(pts, n0, n): p = np.array(pts, float); t = (n0 + np.arange(n)) / SR; return db(np.interp(t, p[:, 0], p[:, 1]))
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
# the tremor: a sub you feel (25-45 Hz with a 3-8 Hz wobble), from the jolt to the end of the shaking
n = int(37 * SR); t = np.arange(n) / SR; sub = np.sin(2 * np.pi * (28 + 8 * np.sin(t * 0.4)) * t) * (0.6 + 0.4 * np.sin(2 * np.pi * (3 + 4 * np.clip(t / 20, 0, 1)) * t)) + 0.6 * norm(lp(brown(n), 60))
put(norm(sub) * env([[10, -60], [10.05, -11], [10.8, -19], [14, -18], [25, -13], [33, -12], [41, -13], [45, -20], [47, -60]], int(10 * SR), n), 10)
# rattling: thousands of tiny clicks (windows, dishes, railings), denser with the magnitude
n = int(36 * SR); x = np.zeros(n); dens = np.interp(np.arange(n) / SR + 10, [10, 11, 14, 25, 33, 42, 46], [40, 10, 60, 160, 220, 160, 0])
for i in range(0, n, int(0.01 * SR)):
    k = rng.poisson(dens[i] * 0.01)
    for _ in range(k): j = i + rng.integers(0, int(0.01 * SR)); m = int(rng.uniform(0.002, 0.012) * SR); x[j:j + m] += rng.standard_normal(min(m, n - j)) * np.exp(-np.arange(min(m, n - j)) / (0.002 * SR)) * rng.uniform(0.2, 1)
put(bp(x, 900, 7000) * db(-18), 10, pan=0.1); put(bp(np.roll(x, 3000), 1200, 9000) * db(-21), 10, pan=-0.3)
# collapse rumbles: low swells under each fall (the facade, the tower, the hill houses)
for t0, g, d in [(31.2, -14, 3.5), (32.6, -16, 3), (35, -18, 3), (39.3, -13, 4.5), (36.5, -21, 3), (38.2, -21, 3), (42, -21, 3)]:
    n = int(d * SR); tt = np.arange(n) / SR; y = norm(lp(brown(n), 160)) * np.minimum(1, tt / 0.08) * np.exp(-tt / (d * 0.4)); put(y * db(g), t0, pan=rng.uniform(-0.5, 0.5))
# debris clatter: bursts of small impacts as things land (bricks, glass, tiles)
for k in range(140):
    t0 = rng.uniform(14, 45); m = int(rng.uniform(0.04, 0.2) * SR); tt = np.arange(m) / SR; y = bp(rng.standard_normal(m), 600, 5000) * np.exp(-tt / 0.03)
    for _ in range(rng.integers(1, 5)): put(y * db(rng.uniform(-30, -20)), t0 + rng.uniform(0, 0.2), pan=rng.uniform(-0.8, 0.8))
# the wave: a band that thickens to a dead stop at 60.0; a sub under it
n = int(6.5 * SR); t = np.arange(n) / SR; w = rng.standard_normal(n); x = norm(bp(w, 40, 260)) * 0.75 + norm(bp(w, 260, 1800)) * 0.4 * np.clip(t / 6.5, 0, 1)
put(x * env([[53.5, -60], [56, -26], [58.5, -14], [59.95, -8], [60.0, -120]], int(53.5 * SR), n), 53.5)
# under the water: the roar muffled, a low churn, hundreds of bubbles
n = int(5.2 * SR); t = np.arange(n) / SR; x = norm(bp(rng.standard_normal(n), 30, 320)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.35 * t))
put(x * env([[60.8, -6], [62, -11], [63.5, -20], [66, -60]], int(60.8 * SR), n), 60.8)
n = int(9 * SR); put(norm(lp(brown(n), 110)) * env([[60.8, -12], [62, -16], [64, -24], [69.6, -50]], int(60.8 * SR), n), 60.8)
for k in range(420):
    t0 = min(60.85 + rng.exponential(1.1), 66.0); d = rng.uniform(0.02, 0.07); m = int(d * SR); tt = np.arange(m) / SR
    f0 = rng.uniform(250, 900) * (1.4 if rng.random() < 0.2 else 1); f = f0 * (1 + 1.8 * tt / d); ph = 2 * np.pi * np.cumsum(f) / SR
    put(np.sin(ph) * np.sin(np.pi * tt / d) ** 2 * db(rng.uniform(-30, -18) - 6 * (t0 - 60.85)), t0, pan=rng.uniform(-0.8, 0.8))
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
