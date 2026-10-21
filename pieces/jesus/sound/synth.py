# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for jesus. Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(33)
T = lambda d: np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x): x = x / (np.abs(x).max() + 1e-9) * 0.89; sf.write(os.path.join(out, name), np.stack([x, x], 1).astype(np.float32), SR)
def put(x, y, t):
    i = int(round(t * SR)); m = min(len(y), len(x) - i)
    if m > 0: x[i:i + m] += y[:m]
def chirp(f0, f1, d, c=1.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** c; return np.sin(2 * np.pi * np.cumsum(f) / SR)
def brass(f, d, vib=5.0):
    t = T(d); ph = 2 * np.pi * np.cumsum(f * (1 + 0.006 * np.sin(2 * np.pi * vib * t))) / SR
    x = sum(np.sin(k * ph) / k ** 0.9 for k in range(1, 14)); return bp(x, 200, 3500)
# 1. the trumpet (12.6, 4 s): a long brass call, rising a fourth, with a shimmer
d = 4.0; t = T(d); f = np.where(t < 1.2, 233.0, 311.0); x = brass(f, d) * np.minimum(1, t / 0.12) * np.minimum(1, (d - t) / 1.2)
x += 0.4 * brass(f * 1.5, d, 5.5) * np.minimum(1, np.maximum(0, t - 0.4) / 0.4) * np.minimum(1, (d - t) / 1.2); save('trumpet.wav', x)
# 2. the opening (17, 7 s): a deep swell and a high glassy shimmer
d = 7.0; t = T(d); x = 0.6 * np.sin(2 * np.pi * 55 * t) * np.minimum(1, t / 2.5) * np.minimum(1, (d - t) / 2.0)
x += 0.25 * sum(np.sin(2 * np.pi * fr * t + 0.4 * np.sin(2 * np.pi * 0.3 * t)) for fr in [880, 1320, 1760, 2640]) * np.minimum(1, t / 3) * np.minimum(1, (d - t) / 2.5); save('open.wav', x)
# 3. the watch (30.3): two short haptic buzzes
d = 1.2; x = np.zeros(int(d * SR))
for t0 in [0.0, 0.45]: n = int(0.25 * SR); put(x, 0.8 * np.sign(np.sin(2 * np.pi * 170 * np.arange(n) / SR)) * env(n, 0.005, 0.25, 1.0), t0)
save('watch.wav', lp(x, 900))
# 4. the rising (34.6, 6 s): a breathy upward sweep with bells
d = 6.0; t = T(d); x = 0.5 * bp(rng.standard_normal(len(t)), 600, 5000) * np.sin(np.pi * t / d) ** 2 * (0.3 + 0.7 * t / d)
for k in range(9): put(x, 0.25 * np.sin(2 * np.pi * (660 * 2 ** (k / 6)) * T(1.4)) * env(int(1.4 * SR), 0.005, 1.4, 4), 0.4 + k * 0.6)
save('rise.wav', x)
# 5. the crutches' clatter is real; joy: a soft warm chord (41.6, 4 s)
d = 4.0; t = T(d); x = sum(a * np.sin(2 * np.pi * fr * t) for fr, a in [(262, 1), (330, 0.8), (392, 0.7), (523, 0.4)]) * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.5); save('joy.wav', x)
# 6. the sun goes dark (46.5 -> 54): a falling drone; a deep hit at 0 and a boom at 4.5 (51.0)
d = 7.5; t = T(d); x = 0.5 * chirp(110, 38, d, 0.8) * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 1.0) + 0.3 * lp(rng.standard_normal(len(t)), 200) * np.minimum(1, t / 3)
put(x, 1.0 * chirp(60, 30, 2.0, 1.2) * env(int(2.0 * SR), 0.004, 1.8, 2.5), 0.0); put(x, 1.3 * chirp(52, 24, 2.5, 1.2) * env(int(2.5 * SR), 0.003, 2.2, 2.4), 4.5); save('dark.wav', x)
# 7. falling stars (51 -> 61): whistling streaks
d = 10.0; x = np.zeros(int(d * SR))
for k in range(16): dd = rng.uniform(0.7, 1.6); n = int(dd * SR); put(x, 0.35 * chirp(rng.uniform(2500, 4000), rng.uniform(500, 900), dd, 0.7) * np.sin(np.pi * np.arange(n) / n) ** 2, rng.uniform(0, d - 2))
save('stars.wav', x)
# 8. the columns of light (54 -> 61): a soft shimmering hum that grows
d = 7.0; t = T(d); x = sum(0.3 * np.sin(2 * np.pi * fr * t + 0.5 * np.sin(2 * np.pi * 0.7 * t + fr)) for fr in [196, 294, 392, 588]) * np.minimum(1, t / 3) * np.minimum(1, (d - t) / 0.5); save('beams.wav', x)
# 9. THE DESCENT (66.5, 5.5 s): a deep boom with a radiant major swell
d = 5.5; t = T(d); x = np.zeros(len(t)); put(x, 1.4 * chirp(70, 30, 2.4, 1.2) * env(int(2.4 * SR), 0.003, 2.2, 2.2), 0)
x += 0.5 * sum(a * np.sin(2 * np.pi * fr * t) for fr, a in [(131, 1), (196, 0.8), (262, 0.7), (330, 0.6), (392, 0.5), (523, 0.35)]) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.3)
save('descend.wav', x)
# 10b. the tram bell: two bright dings
d = 2.0; x = np.zeros(int(d * SR))
for t0 in [0.0, 0.32]: n = int(1.6 * SR); tt = np.arange(n) / SR; put(x, sum(a * np.sin(2 * np.pi * fr * tt) * np.exp(-tt * k) for fr, a, k in [(1180, 1, 3), (2950, 0.5, 5), (4120, 0.25, 7)]), t0)
save('tram.wav', x)
# 10. end tone
d = 7.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 131 * t) * env(len(t), 1.2, 5.5, 2.5) + 0.3 * np.sin(2 * np.pi * 196 * t) * env(len(t), 1.6, 5, 3); save('end.wav', x)
print('ok')
