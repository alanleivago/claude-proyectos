# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for electrones (layered with the recordings in gen.py). Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(55)
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
def ping(f, d=1.6, bright=1.0):  # a glassy ping: inharmonic partials, long ring
    t = T(d); y = sum(a * np.sin(2 * np.pi * f * m * t + m) * np.exp(-t * (2.5 + 2 * m)) for m, a in [(1, 1), (2.76, 0.5 * bright), (5.4, 0.25 * bright), (8.9, 0.12 * bright)])
    return y * np.minimum(1, t / 0.002)

# 1. the countdown (4.0 -> 10.0): a soft digital tick per second, the last one higher (file starts at 4.0)
d = 6.2; x = np.zeros(int(d * SR))
for k in range(6):
    L = 0.25; t = T(L); f = 1760 if k < 5 else 2349
    put(x, (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * env(len(t), 0.002, 0.18, 5), k * 1.0)
save('ticks.wav', lp(x, 7000))

# 2. THE INVERSION (10.0): a reversed swell into a bright zap, a sub drop, then a high shimmer that rings into the drone (file starts at 9.4)
d = 3.6; t = T(d); x = np.zeros(len(t)); i0 = int(0.6 * SR)
sw = hp(noise(0.6), 1500) * (np.linspace(0, 1, i0) ** 3); x[:i0] += 0.5 * sw
z = T(3.0); zap = (sweep(3200, 180, 0.35, 0.5) * env(int(0.35 * SR), 0.001, 0.3, 4)); put(x, 0.8 * zap, 0.6)
sub = sweep(90, 28, 2.0, 1.4) * env(int(2.0 * SR), 0.004, 1.8, 2.4); put(x, 1.2 * sub, 0.6)
sh = hp(noise(3.0), 4000) * env(int(3.0 * SR), 0.05, 2.6, 2.2) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * z)); put(x, 0.35 * sh, 0.6)
put(x, 0.5 * ping(1318, 3.0), 0.6)
save('inversion.wav', x)

# 3. THE DRONE (10.0 -> 56.0): a low beating chord, a glassy upper pad that breathes, a faint ticking clock 12x slowed (stereo)
d = 46.0; t = T(d)
lo = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(55, 1, 0), (55.4, 0.8, 1), (82.4, 0.5, 2), (110.3, 0.3, 3)])
pad = sum(a * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.07 * t * (k + 1))) for k, (f, a) in enumerate([(440, 0.25), (523.3, 0.2), (659.3, 0.15), (987.8, 0.08)]))
breath = 0.55 + 0.45 * np.sin(2 * np.pi * t / 7.5) ** 2
air = lp(hp(noise(d), 300), 1800) * 0.25
rise = np.clip((t - 18) / 28, 0, 1)  # the tension grows toward the fall
base = (0.9 * lo + pad * breath * (0.7 + 0.6 * rise) + air * (0.5 + rise)) * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 0.08)
L = base + 0.15 * np.sin(2 * np.pi * 0.11 * t) * pad; R = base - 0.15 * np.sin(2 * np.pi * 0.11 * t) * pad
save('drone.wav', None, np.stack([L, R], 1))

# 4. pings: each scale step of the zoom and the caption beats (one file, starts at 10.0)
d = 46.0; x = np.zeros(int(d * SR))
for tt, f in [(1.0, 880), (5.6, 988), (10.5, 1175), (11.2, 1319), (13.3, 1480), (14.6, 1568), (16.2, 1760), (17.6, 659), (18.0, 523), (18.4, 440), (20.6, 740), (24.2, 698)]:
    put(x, ping(f, 1.8), tt)
save('pings.wav', x)

# 5. the protons vanish in the nucleus (27.6 -> 28.4): six tiny pops falling in pitch, each with a reversed suck
d = 1.6; x = np.zeros(int(d * SR))
for k in range(6):
    put(x, ping(2400 - k * 260, 0.5, 1.4) * 0.8, 0.12 * k)
save('vanish.wav', x)

# 6. crackle: dry granular cracks that thicken (8 s, used for the crack shot and the last seconds)
d = 8.0; t = T(d); x = np.zeros(len(t))
for k in range(900):
    tt = rng.uniform(0, d) ** 0.7 * d ** 0.3; L = int(rng.uniform(0.004, 0.03) * SR); g = rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 4))
    put(x, bp(g, 1500, 9000) * rng.uniform(0.2, 1), tt)
save('crackle.wav', x * (0.3 + 0.7 * t / d))

# 7. rise: a long airy riser with a pitch climb (4.5 s) and the Earth pulses (two deep throbs with a shimmer)
d = 4.5; t = T(d); x = hp(noise(d), 600) * (t / d) ** 2 * 0.6 + 0.5 * sweep(120, 900, d, 0.8) * (t / d) ** 1.5
save('riser.wav', x * np.minimum(1, (d - t) / 0.1))
d = 4.0; t = T(d); x = np.zeros(len(t))
for tt in (0.4, 2.36):
    n = int(1.6 * SR); u = np.arange(n) / SR; th = np.sin(2 * np.pi * 42 * u) * env(n, 0.05, 1.2, 2.5) + 0.3 * hp(rng.standard_normal(n), 5000) * env(n, 0.02, 0.9, 3)
    put(x, th, tt)
save('pulses.wav', x)

# 8. fall: a downward whoosh (3.4 s) and the heartbeat that speeds up toward the end (2.8 s, 53.2 -> 56.0)
d = 3.4; t = T(d); x = lp(noise(d), 4000) * np.sin(np.pi * t / d) ** 2 + 0.6 * sweep(900, 60, d, 1.2) * np.sin(np.pi * t / d)
save('fallwhoosh.wav', x)
d = 2.8; x = np.zeros(int(d * SR)); tt = 0.0; gap = 0.62
while tt < d - 0.1:
    for off, a in ((0, 1.0), (0.14, 0.7)):
        n = int(0.18 * SR); u = np.arange(n) / SR; put(x, a * np.sin(2 * np.pi * 52 * u) * env(n, 0.004, 0.12, 4), tt + off)
    tt += gap; gap = max(0.26, gap * 0.82)
save('heart.wav', lp(x, 400))

# 9. THE RETURN (56.5): a reversed suck that ends in the snap; a huge bright bloom (file starts at 56.5)
d = 3.0; t = T(d); x = np.zeros(len(t))
put(x, sweep(60, 4000, 0.18, 0.5) * env(int(0.18 * SR), 0.001, 0.15, 3) * 0.7, 0.0)
bloom_ = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(220, 1), (330, 0.7), (440, 0.6), (660, 0.4), (880, 0.3)]) * env(len(t), 0.01, 2.6, 2.2)
put(x, 0.4 * bloom_, 0.0); put(x, 0.4 * hp(noise(2.5), 2000) * env(int(2.5 * SR), 0.005, 2.0, 3), 0.0)
save('returnbloom.wav', x)

# 10. the end card: a soft low tone and one gentle ping (9 s)
d = 9.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 110 * t) * env(len(t), 1.5, 7, 2.5) + 0.3 * np.sin(2 * np.pi * 165 * t) * env(len(t), 2.0, 6, 3)
put(x, 0.4 * ping(880, 3.0), 3.4)
save('end.wav', x)
# 11. the burst roar (27 -> 41): granular sizzle growing into a roaring white noise wall
d = 14.0; t = T(d); k = t / d; x = hp(noise(d), 300) * k ** 2.2 * 0.8 + lp(noise(d), 180) * k ** 3 * 1.2
for j in range(1400):
    tt = rng.uniform(0, d) ** 0.6 * d ** 0.4; L = int(rng.uniform(0.003, 0.02) * SR); g = rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 4)); put(x, bp(g, 2000, 12000) * rng.uniform(0.2, 1) * (0.3 + tt / d), tt)
save('burst.wav', x * np.minimum(1, (d - t) / 0.3))
# 12. the Earth glow (41 -> 56): a vast low roar with a slow shimmer
d = 15.0; t = T(d); x = lp(noise(d), 120) * 1.2 + 0.4 * bp(noise(d), 600, 3000) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.2 * t)); save('glow.wav', x * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.5))
# 13. electrons return (56 -> 60): a sparkling cascade of tiny bright pings
d = 4.6; x = np.zeros(int(d * SR))
for j in range(160): f = rng.uniform(1800, 6000); put(x, ping(f, 0.5) * rng.uniform(0.1, 0.4), rng.uniform(0, 3.6) ** 1.2 / 3.6 ** 0.2)
save('electrons.wav', x)
print('ok')
