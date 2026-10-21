# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code-made layer that gives the recordings more body (asteroide).
Writes audio/synth.wav (everything but the hero sub) and audio/own/hero-sub.wav, audio/own/glass.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(1908)
out = np.zeros((N, 2)); tt = np.arange(N) / SR
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def env(pts, n0, n):   # piecewise-linear dB envelope over absolute times
    p = np.array(pts, float); t = (n0 + np.arange(n)) / SR; return db(np.interp(t, p[:, 0], p[:, 1]))
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
# 1. the flash: no boom, only a thin ringing in the ears (31.05-36)
n = int(5 * SR); t = np.arange(n) / SR; ring = (np.sin(2 * np.pi * 4700 * t) + 0.6 * np.sin(2 * np.pi * 6150 * t + 1) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t)))
for t0, gdb in [(31.05, -38), (31.65, -41), (32.35, -43)]: put(ring * np.minimum(1, t / 0.25) * np.exp(-t / 1.8) * db(gdb), t0)
# 2. the heat (33-46): a low, rising pressure under everything
n = int(13 * SR); x = norm(lp(brown(n), 90)); put(x * env([[33, -60], [36, -30], [43, -27], [46, -40]], int(33 * SR), n), 33)
# 3. the quake (43-50): a deep rumble with a 6-9 Hz tremor and a jolt at the start
n = int(7.5 * SR); t = np.arange(n) / SR; x = norm(lp(brown(n), 70)) * (0.7 + 0.3 * np.sin(2 * np.pi * (6 + 3 * np.sin(t)) * t))
put(x * env([[43, -60], [43.08, -19], [43.6, -22], [47, -24], [50.5, -60]], int(43 * SR), n), 43)
# 4. the wall coming (49-56.6): a roar that thickens and climbs, cut dead at 56.6
n = int(7.6 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n); x = norm(bp(x, 60, 300)) * 0.7 + norm(bp(x, 300, 1400)) * 0.3 * np.clip(t / 7.6, 0, 1)
x *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.9 * t) * np.sin(2 * np.pi * 0.37 * t + 1)
put(x * env([[49, -50], [52, -26], [55, -16], [56.5, -11], [56.6, -90]], int(49 * SR), n), 49)
# 5. after the blast: debris whooshes past (doppler-ish band sweeps, panned across) and a long low tail
for k in range(12):
    t0 = 57.35 + rng.uniform(0, 2.2) * rng.uniform(0.3, 1); d = rng.uniform(0.25, 0.6); n = int(d * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); f = 600 + 2400 * np.sin(np.pi * t / d); y = np.zeros(n)
    for j in range(0, n, 480): y[j:j + 480] = bp(x[j:j + 480], max(80, f[j] * 0.5), min(20000, f[j] * 1.6), 1)
    y *= np.sin(np.pi * t / d) ** 2 * db(rng.uniform(-24, -16)); put(y, t0, pan=rng.choice([-1, 1]) * rng.uniform(0.3, 0.9))
n = int(12.5 * SR); put(norm(lp(brown(n), 110)) * env([[57.3, -14], [59, -20], [63, -26], [69.5, -40], [69.9, -90]], int(57.3 * SR), n), 57.3)
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT")
# hero sub: a falling sine (68 -> 26 Hz) with a noise crack on top
n = int(3.0 * SR); t = np.arange(n) / SR; f = 26 + 42 * np.exp(-t / 0.5); ph = 2 * np.pi * np.cumsum(f) / SR
sub = np.sin(ph) * np.exp(-t / 1.1) * np.minimum(1, t / 0.004); crack = bp(rng.standard_normal(n), 200, 6000) * np.exp(-t / 0.08) * 0.6
h = sub + crack; h /= np.abs(h).max(); sf.write("audio/own/hero-sub.wav", (h * db(-1)).astype(np.float32), SR)
# the lens cracking: a sharp tick, then resonant glass partials and tinkles
n = int(1.6 * SR); t = np.arange(n) / SR; g = bp(rng.standard_normal(n), 2500, 12000) * np.exp(-t / 0.012) * 1.5
for fr, dk, a in [(2830, 0.18, 0.5), (4410, 0.14, 0.45), (7120, 0.09, 0.4), (9050, 0.06, 0.3), (3570, 0.22, 0.3)]: g += a * np.sin(2 * np.pi * fr * t) * np.exp(-t / dk)
for k in range(26):
    t0 = rng.uniform(0.05, 1.2); fr = rng.uniform(3000, 9000); m = t >= t0; g[m] += rng.uniform(0.05, 0.2) * np.sin(2 * np.pi * fr * (t[m] - t0)) * np.exp(-(t[m] - t0) / 0.03)
g /= np.abs(g).max(); sf.write("audio/own/glass.wav", (g * db(-1)).astype(np.float32), SR)
print("synth ok, peak", 20 * np.log10(np.abs(out).max()))
