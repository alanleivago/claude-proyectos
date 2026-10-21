# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for agua (layered with the recordings in gen.py). Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(91)
T = lambda d: np.arange(int(round(d * SR))) / SR
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def sweep(f0, f1, d, curve=2.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** (1 / curve); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x, st=None):
    if st is None: st = np.stack([x, x], 1)
    st = st / (np.abs(st).max() + 1e-9) * 0.89; sf.write(os.path.join(out, name), st.astype(np.float32), SR)
noise = lambda d: rng.standard_normal(int(round(d * SR)))
def put(x, y, t):
    i = int(round(t * SR)); m = min(len(y), len(x) - i)
    if m > 0: x[i:i + m] += y[:m]
def drip(f, d=0.5):  # a water-drop "plip": a fast upward pitch blip
    t = T(d); fr = f * (1 + 1.6 * (1 - np.exp(-t * 60))); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(len(t), 0.001, 0.08, 6)
def ping(f, d=1.6):
    t = T(d); return sum(a * np.sin(2 * np.pi * f * m * t + m) * np.exp(-t * (2.2 + 2 * m)) for m, a in [(1, 1), (2.0, 0.35), (3.01, 0.15)]) * np.minimum(1, t / 0.002)

# 1. the countdown (0 -> 9): a soft water-drop tick each second, the last three brighter
d = 9.3; x = np.zeros(int(d * SR))
for k in range(9): put(x, drip(900 if k < 6 else 1300, 0.4) * (0.5 if k < 6 else 0.9), k * 1.0 + 0.02)
save('ticks.wav', x)
# 2. THE VANISH (9.0): a reversed suck, a soft airy pop, a sub drop; then dead air (file starts at 8.4)
d = 3.0; x = np.zeros(int(d * SR)); i0 = int(0.6 * SR)
x[:i0] += 0.6 * hp(noise(0.6), 800) * np.linspace(0, 1, i0) ** 3
put(x, 0.7 * sweep(1800, 120, 0.25, 0.5) * env(int(0.25 * SR), 0.001, 0.2, 4), 0.6)
put(x, 1.0 * sweep(80, 30, 1.6, 1.3) * env(int(1.6 * SR), 0.003, 1.4, 2.5), 0.6)
put(x, 0.3 * hp(noise(1.5), 5000) * env(int(1.5 * SR), 0.01, 1.2, 3), 0.6)
save('vanish.wav', x)
# 3. THE DRY DRONE (9 -> 56): a low hollow chord, a dry hiss like a desert wind, a slow heartbeat-like swell (stereo)
d = 47.0; t = T(d)
lo = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(49, 1, 0), (49.3, 0.8, 1), (73.4, 0.45, 2), (98.2, 0.25, 3)])
pad = sum(a * np.sin(2 * np.pi * f * t + 0.4 * np.sin(2 * np.pi * 0.05 * t * (k + 1))) for k, (f, a) in enumerate([(392, 0.2), (466.2, 0.16), (587.3, 0.12), (784, 0.06)]))
air = lp(hp(noise(d), 1200), 5000) * 0.18; grow = np.clip((t - 15) / 32, 0, 1); br = 0.6 + 0.4 * np.sin(2 * np.pi * t / 8.0) ** 2
base = (0.9 * lo + pad * br * (0.7 + 0.6 * grow) + air * (0.6 + grow)) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.06)
save('drone.wav', None, np.stack([base + 0.12 * np.sin(2 * np.pi * 0.09 * t) * pad, base - 0.12 * np.sin(2 * np.pi * 0.09 * t) * pad], 1))
# 4. caption pings (file starts at 9.0)
d = 47.0; x = np.zeros(int(d * SR))
for tt, f in [(0.6, 659), (7.0, 740), (13.6, 880), (18.6, 587), (27.6, 659), (31.3, 784), (35.6, 698), (41.6, 880)]: put(x, ping(f, 1.8), tt)
save('pings.wav', x)
# 5. the heartbeat that speeds up (50 -> 56)
d = 6.0; x = np.zeros(int(d * SR)); tt = 0.2; gap = 0.95
while tt < d - 0.1:
    for off, a in ((0, 1.0), (0.15, 0.7)):
        n = int(0.18 * SR); put(x, a * np.sin(2 * np.pi * 50 * np.arange(n) / SR) * env(n, 0.004, 0.12, 4), tt + off)
    tt += gap; gap = max(0.3, gap * 0.86)
save('heart.wav', lp(x, 400))
# 6. the return (56.5): the water snapping back in, a roar that swells toward the wall (file starts at 56.5, 2.4 s)
d = 2.4; t = T(d); roar = lp(noise(d), 900) * (t / d) ** 2.2 + 0.5 * bp(noise(d), 200, 2500) * (t / d) ** 3
snap = np.zeros(len(t)); put(snap, sweep(120, 2500, 0.15, 0.5) * env(int(0.15 * SR), 0.001, 0.12, 3), 0.0)
save('returnroar.wav', 0.8 * roar + 0.5 * snap)
# 7. the glass refilling: a gentle pour and a ring (file starts at 62.6)
d = 2.0; x = 0.3 * bp(noise(d), 800, 4000) * env(int(d * SR), 0.05, 0.9, 3); put(x, 0.5 * ping(1760, 1.6), 0.5); save('refill.wav', x)
# 8. end tone
d = 9.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 98 * t) * env(len(t), 1.5, 7, 2.5) + 0.3 * np.sin(2 * np.pi * 147 * t) * env(len(t), 2.0, 6, 3)
put(x, 0.5 * drip(1200, 0.6), 3.4); save('end.wav', x)
print('ok')
