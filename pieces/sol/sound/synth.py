# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir [variant]: code-made SFX layers for the sun piece (combined with the recordings in gen.py).
variant 'en' gives the English version its own takes: other seeds, pitches, tick rate and timings (same intent).
Each file starts at its own event time (gen.py places it). Deterministic (seeded)."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; EN = len(sys.argv) > 2 and sys.argv[2] == 'en'; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(23 if EN else 11)
P = 1.12 if EN else 1.0   # EN pitch factor
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

# 1. the countdown (5-11): a dry clock tick (accelerating a little) over a hum that swells and then stops dead at 11.0
d = 6.0; t = T(d); x = np.zeros(len(t)); tt = 0.0; per = 0.5 if not EN else 0.4
while tt < d - 0.05:
    n = int(round(0.03 * SR)); k = bp(noise(0.03), 1800 * P, 5200 * P) * env(n, 0.0005, 0.02, 6) + 0.4 * np.sin(2 * np.pi * 2400 * P * np.arange(n) / SR) * env(n, 0.0005, 0.015, 6)
    put(x, k * (0.6 + 0.4 * tt / d), tt); tt += per * (1 - 0.45 * tt / d)
hum = (np.sin(2 * np.pi * 110 * P * t) + 0.5 * np.sin(2 * np.pi * 165 * P * t) + 0.3 * np.sin(2 * np.pi * 220.7 * P * t)) * (t / d) ** 2.2
x = x + 0.5 * lp(hum, 1200); x[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR)); save('tick.wav', x)

# 2. the blackout (11.0): a deep power-down — a falling sub and a dull thud, gone in under a second (then silence)
d = 0.9; t = T(d); x = sweep(70 * P, 22, d, 1.3) * env(len(t), 0.003, 0.7, 3.5) + 0.5 * lp(noise(d), 220) * env(len(t), 0.002, 0.25, 5)
save('out.wav', x)

# 3. the cold bed (12-60): a constant low drone (two detuned sub tones, breathing slowly) + a thin high "air" that grows colder
d = 48.0; t = T(d); f0 = (41 if not EN else 46) * (1 + 0.003 * np.sin(2 * np.pi * 0.07 * t))
dr = np.sin(2 * np.pi * np.cumsum(f0) / SR) + 0.7 * np.sin(2 * np.pi * np.cumsum(f0 * 1.007) / SR) + 0.35 * np.sin(2 * np.pi * np.cumsum(f0 * 2.01) / SR)
dr *= 0.7 + 0.3 * np.sin(2 * np.pi * t / (9.0 if not EN else 7.4))
air = bp(noise(d), 2500 * P, 7000 * P) * (0.15 + 0.85 * np.clip((t - 10) / 30, 0, 1)) * (0.7 + 0.3 * np.sin(2 * np.pi * t / 5.3))
x = lp(dr, 300) + 0.25 * air; x *= np.minimum(1, t / 3.0) * np.minimum(1, (d - t) / 0.05); save('drone.wav', x)

# 4. the sea freezing (33-42): ice "singing" — long dispersive chirps (laser-like pew) and deep booms as the sheet locks
d = 9.5; x = np.zeros(int(d * SR)); tt = 0.3
while tt < d - 1.6:
    L = round(rng.uniform(0.5, 1.2), 3); n = int(round(L * SR)); f_hi, f_lo = rng.uniform(1800, 3800) * P, rng.uniform(180, 420) * P
    ch = sweep(f_hi, f_lo, L, 0.45) * env(n, 0.002, L, 3.0); ch = ch + 0.5 * bp(ch, 300, 2000)
    put(x, ch * rng.uniform(0.4, 0.9), tt)
    if rng.random() < 0.45: n2 = int(1.4 * SR); put(x, sweep(rng.uniform(60, 90), 30, 1.4, 1.3) * env(n2, 0.003, 1.2, 3.5) * 0.9, tt + rng.uniform(0, 0.3))
    tt += rng.uniform(0.45, 1.0)
save('icesing.wav', x)

# 5. the grid (41.6-47.2): a 50 Hz mains buzz with harmonics; it drops in steps (relay clunks) until silence
d = 6.4; t = T(d); m = 50 if not EN else 60
buzz = sum((1 / k) * np.sin(2 * np.pi * m * k * t + k) for k in range(1, 9)); buzz = np.clip(buzz * 1.6, -1, 1)
cuts = np.sort(rng.uniform(0.6, 5.6, 7)); g = np.ones(len(t))
for i, c in enumerate(cuts): g[t >= c] = 1 - (i + 1) / len(cuts)
x = 0.5 * buzz * lp(g, 40) * np.minimum(1, t / 0.4)
for c in cuts: n = int(round(0.18 * SR)); put(x, (lp(noise(0.18), 900) + sweep(140, 60, 0.18, 1.2)) * env(n, 0.001, 0.12, 5) * 0.9, c)
save('grid.wav', x)

# 6. frost growing on the lens (54-59.9): fine crystalline crackle that thickens, a thin rising whine; stops dead
d = 5.9; t = T(d); n = len(t); x = np.zeros(n)
for _ in range(1800):
    i = int(rng.uniform(0, 1) ** 0.5 * (n - 900)); f = rng.uniform(4000, 11000) * P; L = 600
    x[i:i + L] += hp(noise(L / SR), 3000) * env(L, 0.0002, 0.004, 6) * rng.uniform(0.2, 1) + 0.2 * np.sin(2 * np.pi * f * np.arange(L) / SR) * env(L, 0.0002, 0.006, 6)
x = x * (t / d) ** 1.4 + 0.15 * sweep(900 * P, 3200 * P, d, 0.7) * (t / d) ** 3; x[-int(0.005 * SR):] *= np.linspace(1, 0, int(0.005 * SR)); save('frost.wav', x)

# 7. THE HIT (60.0): the frozen glass splits — a huge sub thump, a sharp crack, a splintering spray, a long icy ring
d = 3.2; t = T(d); n = len(t)
sub = sweep(58 * P, 24, 1.6, 1.3); sub = np.concatenate([sub, np.zeros(n - len(sub))]) * env(n, 0.002, 1.4, 3)
crk = hp(noise(0.16), 1600) * env(int(round(0.16 * SR)), 0.0003, 0.12, 7); crk = np.concatenate([crk, np.zeros(n - len(crk))])
spl = np.zeros(n)
for _ in range(260):
    i = rng.integers(0, int(1.4 * SR)); L = 2400; f = rng.uniform(2500, 9000)
    spl[i:i + L] += (np.sin(2 * np.pi * f * np.arange(L) / SR) * 0.6 + hp(noise(L / SR), 4000)) * env(L, 0.0003, 0.03, 6) * rng.uniform(0.1, 0.5) * np.exp(-i / SR * 1.8)
ring = (np.sin(2 * np.pi * 2093 * P * t) + 0.6 * np.sin(2 * np.pi * 3136 * P * t * 1.003)) * env(n, 0.01, 3.0, 2.5) * 0.12
x = 1.5 * sub + 1.1 * crk + 0.8 * spl + ring; save('hit.wav', x)
print('code sfx written to', out)
