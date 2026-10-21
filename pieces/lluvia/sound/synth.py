# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made layers for lluvia (1,000 years of rain), layered with the recordings in gen.py. Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(41)
T = lambda d: np.arange(int(round(d * SR))) / SR
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def sweep(f0, f1, d, curve=2.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** (1 / curve); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.89; sf.write(os.path.join(out, name), np.stack([x, x], 1).astype(np.float32), SR)
noise = lambda d: rng.standard_normal(int(round(d * SR)))
def put(x, y, t):
    i = int(round(t * SR)); m = min(len(y), len(x) - i)
    if m > 0: x[i:i + m] += y[:m]

# 1. the rain wall (2 -> 54.4): a dense broadband downpour that keeps growing into a solid wall, plus a low rumble of water
d = 52.4; t = T(d); u = np.clip(t / 38, 0, 1)
hiss = bp(noise(d), 1500, 9000) * (0.2 + 0.8 * u ** 0.8); mid = bp(noise(d), 300, 1500) * (0.1 + 0.9 * u); low = lp(noise(d), 180) * u ** 1.3
x = (hiss + 0.8 * mid + 0.9 * low) * (0.9 + 0.1 * np.sin(2 * np.pi * 0.13 * t)); x *= np.minimum(1, t / 1.5); x[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR)); save('rainwall.wav', x)

# 2. under the water (47 -> 54.4): everything muffled, a slow deep drone and the odd bubble
d = 7.4; t = T(d); x = lp(noise(d), 120) * 0.9 + 0.35 * np.sin(2 * np.pi * 38 * t) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * t))
for _ in range(25):
    i = rng.integers(0, len(t) - 3000); f = rng.uniform(250, 700); y = np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 1.6, 2400)) / SR) * env(2400, 0.001, 0.03, 5); x[i:i + 2400] += 0.12 * y
x *= np.minimum(1, t / 0.6); x[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR)); save('under.wav', x)

# 3. THE THUNDER (54.4): a cracking strike, a huge sub, a rolling tail
d = 4.5; t = T(d); n = len(t)
crack = hp(noise(0.12), 1200) * env(int(round(0.12 * SR)), 0.0003, 0.08, 6); crack = np.concatenate([crack, np.zeros(n - len(crack))])
sub = sweep(60, 22, 2.2, 1.3); sub = np.concatenate([sub, np.zeros(n - len(sub))]) * env(n, 0.003, 2.0, 2.6)
roll = lp(noise(d), 500) * env(n, 0.05, 4.2, 2.2) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * t))
x = 1.2 * crack + 1.4 * sub + 1.0 * roll; save('thunder.wav', x)

# 4. distant thunder rolls (for the lightning flashes 8.2, 15.3, 31.4, 38.6, 44.1)
d = 3.0; t = T(d); n = len(t); x = lp(noise(d), 300) * env(n, 0.15, 2.6, 2.4) + 0.6 * sweep(48, 28, d, 1.3) * env(n, 0.1, 2.4, 2.5); save('roll.wav', x)

# 5. the end card: a low tone that fades
d = 4.9; t = T(d); x = lp(np.sin(2 * np.pi * 43 * t) + 0.5 * np.sin(2 * np.pi * 64.5 * t), 300) * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 2.0); save('end.wav', x)
print('code sfx written to', out)
