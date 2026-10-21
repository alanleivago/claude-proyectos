# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX layers for the oxygen piece (combined with the recordings in gen.py).
Each file starts at its own event time (gen.py places it). Deterministic (seeded)."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(7)
T = lambda d: np.arange(int(round(d * SR))) / SR
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def sweep(f0, f1, d, curve=2.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** (1 / curve); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def env(n, a, r, shape=3.0):
    n = int(n)
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4)); return e
def save(name, x, st=False):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    if not st: x = np.stack([x, x], 1)
    sf.write(os.path.join(out, name), x.astype(np.float32), SR)
noise = lambda d: rng.standard_normal(int(round(d * SR)))

# 1. the pressure blow when the oxygen goes (5.0): a sucked-in air rush, a massive sub thump, a dull ear "pop", then a ringing ear
d = 1.6; n = int(d * SR); suck = bp(noise(0.45), 300, 3000) * np.linspace(0, 1, int(round(0.45 * SR))) ** 3
thump = sweep(55, 24, d, 1.5) * env(n, 0.005, d, 3.5) + 0.6 * lp(noise(d), 160) * env(n, 0.002, 0.5, 4)
pop = bp(noise(0.08), 400, 1600) * env(int(round(0.08 * SR)), 0.001, 0.08, 6) * 0.7
x = np.zeros(int((0.45 + d) * SR)); x[:len(suck)] += 0.35 * suck; i0 = len(suck); x[i0:i0 + n] += thump; x[i0:i0 + len(pop)] += pop
save('pop.wav', x)
ring = T(9.0); tin = (np.sin(2 * np.pi * 5850 * ring) + 0.3 * np.sin(2 * np.pi * 6140 * ring)) * np.minimum(1, ring / 0.05) * np.exp(-ring / 3.2)
save('ring.wav', tin)

# 2. the "compressed breathing": a pulse every 0.46 s (band-passed air, fast attack, slow release) over a slow drone near 370 Hz
d = 48.0; t = T(d); per = 0.46; ph = (t % per) / per
breath = bp(noise(d), 260, 1300) * (np.exp(-ph * 5.5) * np.minimum(1, ph / 0.04)) * (0.75 + 0.25 * np.sin(2 * np.pi * t / 7.3))
vib = 1 + 0.004 * np.sin(2 * np.pi * 0.31 * t); f0 = 368 * vib
drone = (np.sin(2 * np.pi * np.cumsum(f0) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f0 / 2) / SR) + 0.25 * np.sin(2 * np.pi * np.cumsum(f0 * 1.5) / SR))
drone = lp(drone, 900) * (0.55 + 0.45 * np.exp(-ph * 2.5))   # the drone ducks with each breath (pumping)
x = 0.8 * breath + 0.35 * drone; x *= np.minimum(1, t / 1.3) * np.minimum(1, (d - t) / 0.8)
save('breath.wav', x)

# 3. weight under the collapse (27-37): low thuds with a short crumble tail, every ~0.9-1.4 s
d = 10.5; x = np.zeros(int(d * SR)); tt = 0.2
while tt < d - 1.5:
    n = int(round(1.4 * SR)); th = sweep(rng.uniform(55, 75), 28, 1.4, 1.3) * env(n, 0.003, 1.2, 4) + 0.5 * lp(noise(1.4), rng.uniform(300, 700)) * env(n, 0.002, 0.7, 5)
    i = int(tt * SR); x[i:i + n] += th * rng.uniform(0.6, 1.0); tt += rng.uniform(0.85, 1.4)
save('collapse.wav', x)

# 4. the floor (34.4-37.6 ripple, 37.4 it gives way): a churning sub rumble that wobbles with the ripple, then a crack and a drop
d = 4.6; t = T(d); rum = lp(noise(d), 90) * 3 * (0.6 + 0.4 * np.sin(2 * np.pi * 1.2 * t)) * np.minimum(1, t / 0.8)
crk = hp(noise(0.5), 1200) * env(int(round(0.5 * SR)), 0.001, 0.3, 7); i = int(round(3.0 * SR)); rum[i:i + len(crk)] += 1.5 * crk
drop = sweep(70, 26, 1.6, 1.4) * env(int(round(1.6 * SR)), 0.004, 1.6, 3); rum[i:i + len(drop)] += 1.6 * drop
save('floor.wav', rum)

# 5. the build before the silence (50.0-52.95): a rising whoosh + tone that stops dead
d = 2.95; t = T(d); rise = bp(noise(d), 200, 6000) * (t / d) ** 3 + 0.4 * sweep(80, 900, d, 0.6) * (t / d) ** 2
rise[-int(round(0.01 * SR)):] *= np.linspace(1, 0, int(round(0.01 * SR))); save('rise.wav', rise)

# 6. the return (55.0): a falling sub drop, an explosion of air, then a roar that thickens until the front reaches you (59.5)
d = 7.5; t = T(d); n = len(t)
sub = sweep(62, 20, 3.5, 1.2); sub = np.concatenate([sub, np.zeros(n - len(sub))]) * env(n, 0.004, 3.4, 2.5)
boom = lp(noise(d), 1).copy()
for k, (f, g) in enumerate([(9000, 1.0), (3000, 0.8), (700, 0.9)]): boom += g * lp(noise(d), f) * env(n, 0.002, 1.5 + k, 3)
roar = lp(noise(d), 1500) * np.clip((t - 0.6) / 3.9, 0, 1) ** 1.6 * (1 - np.clip((t - 4.6) / 2.9, 0, 1))
crackle = np.zeros(n)
for _ in range(900):
    i = rng.integers(int(round(0.3 * SR)), n - 2000); crackle[i:i + 300] += hp(noise(300 / SR), 2500) * env(300, 0.0005, 0.006, 5) * rng.uniform(0.2, 1)
x = 1.4 * sub + 0.9 * boom + 0.9 * roar + 0.5 * crackle * np.clip(t / 1.5, 0, 1)
save('blast.wav', x)

# 7. the glass of the lens cracking when the front hits (59.5): a sharp crack, a spray of tinkles
d = 2.2; n = int(d * SR); x = hp(noise(0.12), 2000) * env(int(round(0.12 * SR)), 0.0005, 0.12, 6); x = np.concatenate([x, np.zeros(n - len(x))])
for _ in range(140):
    i = rng.integers(0, n - 4000); f = rng.uniform(3000, 9000); tk = np.sin(2 * np.pi * f * np.arange(3000) / SR) * env(3000, 0.0003, 0.04, 6); x[i:i + 3000] += tk * rng.uniform(0.05, 0.3) * np.exp(-i / SR * 1.5)
save('crack.wav', x)
print('code sfx written to', out)
