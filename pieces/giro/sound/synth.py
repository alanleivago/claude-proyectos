# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for giro (the Earth stops spinning), layered with the recordings in gen.py.
Each file starts at its own event time (gen.py places it). Deterministic (seeded)."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(31)
T = lambda d: np.arange(int(round(d * SR))) / SR
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def sweep(f0, f1, d, curve=2.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** (1 / curve); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x, st=False):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    if not st: x = np.stack([x, x], 1)
    sf.write(os.path.join(out, name), x.astype(np.float32), SR)
noise = lambda d: rng.standard_normal(int(round(d * SR)))
def put(x, y, t):
    i = int(round(t * SR)); m = min(len(y), len(x) - i)
    if m > 0: x[i:i + m] += y[:m]

# 1. the brake (11.0): the whole ground lurches — a deep groaning sub, a hard thump, cracks running through the street, a long shudder
d = 4.0; t = T(d); n = len(t)
groan = sweep(48, 22, d, 1.2) * env(n, 0.01, 3.6, 2.2) + 0.5 * sweep(72, 30, d, 1.4) * env(n, 0.02, 2.5, 2.5)
thump = lp(noise(0.6), 140) * env(int(round(0.6 * SR)), 0.002, 0.4, 5)
shud = lp(noise(d), 260) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)) * env(n, 0.05, 3.5, 2.5)
x = 1.3 * groan + 0.6 * shud; put(x, 1.8 * thump, 0.0)
for k in range(9):
    L = int(round(0.25 * SR)); c = hp(noise(0.25), 900) * env(L, 0.0005, 0.12, 6) + 0.4 * lp(noise(0.25), 400) * env(L, 0.001, 0.2, 5); put(x, c * rng.uniform(0.4, 1.0), 0.05 + k * rng.uniform(0.12, 0.3))
save('brake.wav', x)

# 2. the wind wall (17.0 -> 60.8): rushing air that keeps rising in level and pitch, gusting, until it is a solid roar; it stops dead
d = 43.8; t = T(d); u = t / d
w = noise(d); low = lp(w, 300) * (0.5 + 0.5 * u); mid = bp(noise(d), 300, 1800) * (0.15 + 0.85 * u ** 1.2); high = bp(noise(d), 1800, 9000) * (0.05 + 0.95 * u ** 1.6)
gust = 0.75 + 0.25 * np.sin(2 * np.pi * 0.31 * t + 2 * np.sin(2 * np.pi * 0.07 * t)) * (1 - 0.6 * u)
howl = sweep(180, 900, d, 0.8) * 0.12 * u ** 2 + sweep(260, 1300, d, 0.8) * 0.08 * u ** 2
x = (1.1 * low + 0.9 * mid + 0.7 * high) * gust * (0.15 + 0.85 * u ** 0.9) + howl
x *= np.minimum(1, t / 2.0); x[-int(0.006 * SR):] *= np.linspace(1, 0, int(0.006 * SR)); save('windwall.wav', x)

# 3. debris (20 -> 60.8): impacts — thuds, cracks, metal clangs — getting denser and heavier
d = 40.8; x = np.zeros(int(round(d * SR))); tt = 0.2
while tt < d - 0.6:
    u = tt / d; L = int(round(0.5 * SR)); kind = rng.random()
    if kind < 0.45: y = lp(noise(0.5), rng.uniform(200, 600)) * env(L, 0.001, 0.3, 6) + sweep(rng.uniform(60, 110), 35, 0.5, 1.3) * env(L, 0.002, 0.3, 5) * 0.8
    elif kind < 0.8: y = hp(noise(0.5), rng.uniform(800, 2500)) * env(L, 0.0005, 0.12, 7)
    else: f = rng.uniform(300, 900); y = (np.sin(2 * np.pi * f * T(0.5)) + 0.6 * np.sin(2 * np.pi * f * 2.71 * T(0.5))) * env(L, 0.001, 0.4, 5) * 0.6 + hp(noise(0.5), 1500) * env(L, 0.0005, 0.05, 7) * 0.5
    put(x, y * rng.uniform(0.3, 1.0) * (0.4 + 0.6 * u), tt); tt += rng.uniform(0.35, 1.1) * (1 - 0.7 * u)
x[-int(0.006 * SR):] *= np.linspace(1, 0, int(0.006 * SR)); save('debris.wav', x)

# 4. the wind goes supersonic (50.3): an N-wave boom (double crack) and a rolling tail
d = 3.0; t = T(d); n = len(t); x = np.zeros(n)
nw = np.linspace(1, -1, int(0.03 * SR)); put(x, nw, 0.0); put(x, -0.8 * nw[::-1] * 0 + 0.0 * nw, 0.0)
crack = hp(noise(0.08), 400) * env(int(round(0.08 * SR)), 0.0003, 0.05, 6); put(x, 1.2 * crack, 0.0); put(x, 1.0 * crack, 0.18)
x += 1.0 * lp(noise(d), 180) * env(n, 0.01, 2.6, 2.8) + 0.8 * sweep(55, 24, d, 1.3) * env(n, 0.005, 2.4, 3)
save('sonic.wav', x)

# 5. THE HIT (61.8): the ocean slams into the glass — a huge sub, a broadband water slam, the glass splitting
d = 2.6; t = T(d); n = len(t)
sub = sweep(56, 22, 1.8, 1.3); sub = np.concatenate([sub, np.zeros(n - len(sub))]) * env(n, 0.002, 1.6, 2.8)
slam = lp(noise(d), 1).copy()
for k, (f, g) in enumerate([(9000, 1.0), (2500, 0.9), (600, 1.0)]): slam += g * lp(noise(d), f) * env(n, 0.002, 0.8 + 0.4 * k, 3.2)
crk = hp(noise(0.14), 1600) * env(int(round(0.14 * SR)), 0.0003, 0.1, 7); crk = np.concatenate([crk, np.zeros(n - len(crk))])
x = 1.5 * sub + 1.0 * slam + 0.9 * crk; save('hit.wav', x)

# 6. under the water (61.9 -> 63.0): everything muffled, a low churning rumble, bubbles
d = 1.4; t = T(d); n = len(t); x = lp(noise(d), 140) * 1.2 * env(n, 0.01, 1.3, 2)
for _ in range(70):
    i = rng.integers(0, n - 3000); f = rng.uniform(250, 900); y = np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 1.6, 2400)) / SR) * env(2400, 0.001, 0.03, 5); x[i:i + 2400] += 0.15 * y
x[-int(0.2 * SR):] *= np.linspace(1, 0, int(0.2 * SR)); save('under.wav', x)

# 7. the end card (63.5 -> 70): a low dark tone that fades
d = 6.4; t = T(d); x = lp(np.sin(2 * np.pi * 41 * t) + 0.6 * np.sin(2 * np.pi * 61.5 * t) + 0.3 * lp(noise(d), 120), 300) * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 2.5)
save('end.wav', x)
print('code sfx written to', out)
