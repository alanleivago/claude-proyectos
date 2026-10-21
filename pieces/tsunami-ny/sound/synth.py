# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code-made layer under the recordings (tsunami-ny): the city's hum, the suction's low pull, the wall's roar
building to a dead stop at 62.0, a sub you feel as it nears, the underwater churn. Writes audio/synth.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(1720)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def env(pts, n0, n): p = np.array(pts, float); t = (n0 + np.arange(n)) / SR; return db(np.interp(t, p[:, 0], p[:, 1]))
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
# the city's hum (traffic, ventilation), fading as the city stops
n = int(50 * SR); put(norm(lp(brown(n), 220)) * env([[0, -60], [0.5, -30], [24, -32], [45, -36], [50, -60]], 0, n), 0)
# the drain's low pull (11-23)
n = int(12.5 * SR); t = np.arange(n) / SR; x = norm(lp(brown(n), 80)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * t))
put(x * env([[11, -60], [13, -22], [18, -20], [23.5, -60]], int(11 * SR), n), 11)
# the wall's roar: a band that thickens and climbs from 28 to the dead stop at 62.0; a sub that grows under it
n = int(34 * SR); t = np.arange(n) / SR; w = rng.standard_normal(n)
x = norm(bp(w, 40, 250)) * 0.75 + norm(bp(w, 250, 1600)) * 0.35 * np.clip(t / 34, 0, 1) + norm(bp(w, 1600, 6000)) * 0.12 * np.clip((t - 20) / 14, 0, 1)
x *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.6 * t) * np.sin(2 * np.pi * 0.23 * t + 1)
put(x * env([[28, -60], [35, -30], [45, -20], [55, -13], [61.95, -8], [62.0, -120]], int(28 * SR), n), 28)
n = int(20 * SR); t = np.arange(n) / SR; sub = np.sin(2 * np.pi * (32 + 4 * np.sin(t * 0.7)) * t) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * t))
put(sub * env([[42, -60], [50, -26], [58, -16], [61.95, -12], [62.0, -120]], int(42 * SR), n), 42)
# under the water: a low churn and slow pulses (62.8-69.5)
n = int(6.7 * SR); t = np.arange(n) / SR; x = norm(lp(brown(n), 120)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.5 * t))
put(x * env([[62.8, -12], [64, -16], [66, -24], [69.5, -50]], int(62.8 * SR), n), 62.8)
# under the water: the roar muffled (low band, slow swell) and hundreds of bubbles (short rising sine chirps), thinning out
n = int(5.5 * SR); t = np.arange(n) / SR; w = rng.standard_normal(n); x = norm(bp(w, 30, 320)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.35 * t))
put(x * env([[62.8, -6], [64, -11], [65.6, -20], [68.3, -60]], int(62.8 * SR), n), 62.8)
for k in range(420):
    t0 = 62.85 + rng.exponential(1.1); t0 = min(t0, 68.0); d = rng.uniform(0.02, 0.07); m = int(d * SR); tt = np.arange(m) / SR
    f0 = rng.uniform(250, 900) * (1.4 if rng.random() < 0.2 else 1); f = f0 * (1 + 1.8 * tt / d); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.sin(np.pi * tt / d) ** 2 * db(rng.uniform(-30, -18) - 6 * (t0 - 62.85))
    put(y, t0, pan=rng.uniform(-0.8, 0.8))
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
