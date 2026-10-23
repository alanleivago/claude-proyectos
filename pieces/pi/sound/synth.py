# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for pi. Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(314)
T = lambda d: np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x): x = x / (np.abs(x).max() + 1e-9) * 0.89; sf.write(os.path.join(out, name), np.stack([x, x], 1).astype(np.float32), SR)
def put(x, y, t):
    i = int(t * SR); m = min(len(y), len(x) - i)
    if m > 0: x[i:i + m] += y[:m]
def chirp(f0, f1, d, c=1.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** c; return np.sin(2 * np.pi * np.cumsum(f) / SR)
# 1. countdown ticks (3 -> 8 s): soft clock ticks, one per second, rising
d = 5.2; x = np.zeros(int(d * SR))
for k in range(5): n = int(0.06 * SR); put(x, (0.5 + 0.12 * k) * bp(rng.standard_normal(n), 2000, 6000) * env(n, 0.001, 0.05, 4), k * 1.0 + 0.2)
save('ticks.wav', x)
# 2. π becomes 3 (8.0): a tape-stop drop and a sub thump — time slows down
d = 2.6; t = T(d); x = 0.6 * chirp(880, 40, d, 0.5) * np.exp(-t * 1.2); put(x, 1.1 * chirp(70, 28, 1.6, 1.2) * env(int(1.6 * SR), 0.004, 1.5, 2.6), 0)
x += 0.3 * lp(rng.standard_normal(len(t)), 400) * np.exp(-t * 2); save('drop.wav', x)
# 3. the slowed world: a low breathing drone with a slow beating (8 -> 56)
d = 48.0; t = T(d); x = 0.35 * np.sin(2 * np.pi * 41 * t + 0.4 * np.sin(2 * np.pi * 0.07 * t)) + 0.25 * np.sin(2 * np.pi * 61.5 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t)) + 0.08 * lp(rng.standard_normal(len(t)), 180)
x *= np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 0.05) * (0.7 + 0.3 * t / d); save('slowdrone.wav', x)
# 4. a slow-motion crack (stone / bread): a low splintering with a pitched-down body (1.6 s)
d = 1.6; t = T(d); x = np.zeros(len(t))
for k in range(18): n = int(rng.uniform(0.05, 0.25) * SR); put(x, rng.uniform(0.3, 0.9) * lp(rng.standard_normal(n), rng.uniform(300, 1400)) * env(n, 0.002, n / SR, 3), rng.uniform(0, 0.8))
x += 0.7 * chirp(90, 40, d, 1) * env(len(t), 0.005, 1.2, 3); save('crack.wav', x)
# 5. a slow metal groan (wheels, Ferris wheel): a bending creak (2.4 s)
d = 2.4; t = T(d); f = 70 + 30 * np.sin(2 * np.pi * 0.6 * t) + 40 * t; x = sum(a * np.sin(2 * np.pi * np.cumsum(f * m) / SR) for m, a in [(1, 1), (2.7, 0.5), (4.1, 0.3)]) * np.sin(np.pi * t / d) ** 0.6 * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 7 * t))); save('groan.wav', x)
# 6. a slow metal clang (manhole covers): a low ring (2 s)
d = 2.0; t = T(d); x = sum(a * np.sin(2 * np.pi * fr * t) * np.exp(-t * dk) for fr, a, dk in [(180, 1, 2.0), (431, 0.6, 2.5), (757, 0.4, 3.0), (1210, 0.25, 4)]) + 0.4 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 18); save('clang.wav', x)
# 7. a slow pop (bubbles, domes): a soft pitched-down pop with a whoosh (1.2 s)
d = 1.2; t = T(d); x = np.zeros(len(t)); put(x, 0.8 * chirp(220, 60, 0.6, 1) * env(int(0.6 * SR), 0.003, 0.5, 3), 0); x += 0.3 * bp(rng.standard_normal(len(t)), 400, 2500) * np.sin(np.pi * t / d) ** 2; save('pop.wav', x)
# 8. the Sun / the sky: a deep warped tone (3 s)
d = 3.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * (55 + 6 * np.sin(2 * np.pi * 0.5 * t)) * t) + 0.3 * np.sin(2 * np.pi * 82 * t) + 0.2 * hp(rng.standard_normal(len(t)), 5000) * 0.2; x *= np.sin(np.pi * t / d); save('sky.wav', x)
# 9. the wedge in your eyes: a rising high whine (3 s)
d = 3.0; t = T(d); x = 0.4 * chirp(2400, 5200, d, 1.5) * (t / d) + 0.4 * np.sin(2 * np.pi * 50 * t) * (t / d); save('whine.wav', x)
# 10. the planet stretching: a long rising rumble (44 -> 56), with a hard cut at the end
d = 11.5; t = T(d); x = lp(rng.standard_normal(len(t)), 120) * (0.2 + 0.8 * (t / d) ** 2) + 0.4 * np.sin(2 * np.pi * (30 + 20 * t / d) * t) * (t / d) ** 2
x *= np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.03); save('rumble.wav', x)
# 11. π COMES BACK (56.0): a huge snap and boom, then ringing
d = 4.0; t = T(d); x = np.zeros(len(t)); put(x, 1.4 * chirp(110, 32, 2.5, 1.3) * env(int(2.5 * SR), 0.002, 2.2, 2.4), 0); put(x, 0.9 * hp(rng.standard_normal(int(0.3 * SR)), 1200) * env(int(0.3 * SR), 0.001, 0.25, 6), 0)
x += 0.15 * np.sin(2 * np.pi * 3141 * t) * np.exp(-t * 0.9); save('back.wav', x)
# 12. end tone
d = 8.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 98 * t) * env(len(t), 1.0, 7, 2.5) + 0.3 * np.sin(2 * np.pi * 147 * t) * env(len(t), 1.4, 6, 3); save('end.wav', x)
print('ok')
