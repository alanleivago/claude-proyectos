# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code-made layer (ciudades): the metro rumble and countdown ticks (0-4), the vanish (a swell sucked into a pop at 4),
car crashes (5.6-8), car alarms that run down (6-17), the grid humming down (10.6-12), crickets (12-17, 31-44), steel groans (36-44),
the bridge hero (sub + crack, written to audio/own for combine.py), far tower falls (48-54), ice creaks (59-63), the card swell.
Writes audio/synth.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(714)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
def T_(d): return np.arange(int(d * SR)) / SR
# the metro on the viaduct (0-4), rolling to a stop after 4
tt = T_(9); spd = np.where(tt < 4, 1, np.exp(-(tt - 4) * 0.4)); cl = (np.sin(2 * np.pi * np.cumsum(1.6 * spd) / SR) > 0.97).astype(float)
y = norm(lp(brown(len(tt)), 160)) * 0.5 * spd + bp(rng.standard_normal(len(tt)), 300, 1200) * cl * 2 * spd
put(y * db(-24), 0, pan=-0.3)
# countdown ticks (3, 2, 1)
for t0 in [1.0, 2.0, 3.0]:
    tt = T_(0.25); put(np.sin(2 * np.pi * 1320 * tt) * np.exp(-tt / 0.04) * db(-22), t0)
# the vanish: a swell sucked in, then a soft pop
tt = T_(1.2); sw = bp(rng.standard_normal(len(tt)), 400, 6000) * (tt / 1.2) ** 3; put(sw[::-1][::-1] * db(-16), 2.8)
tt = T_(0.6); put((np.sin(2 * np.pi * 70 * tt) * np.exp(-tt / 0.12) + 0.3 * bp(rng.standard_normal(len(tt)), 2000, 9000) * np.exp(-tt / 0.03)) * db(-19), 4.0)
# crashes: crunch + glass
def crash(t0, g, pan):
    tt = T_(1.4); body = norm(bp(rng.standard_normal(len(tt)), 200, 2500)) * np.exp(-tt / 0.18) + np.sin(2 * np.pi * 55 * tt) * np.exp(-tt / 0.2) * 1.5
    gl = np.zeros(len(tt))
    for k in range(40): a = int((0.02 + rng.random() * 0.6) * SR); n = int(0.05 * SR); gl[a:a + n] += np.sin(2 * np.pi * (3000 + rng.random() * 5000) * T_(0.05)) * np.exp(-T_(0.05) / 0.01) * rng.random()
    put((body * 0.8 + gl * 0.6) * db(g), t0, pan)
for t0, g, p in [(5.5, -10, -0.2), (6.3, -14, 0.4), (7.4, -16, 0.1), (8.6, -20, -0.5)]: crash(t0, g, p)
# car alarms: a two-tone and a whoop, running down and dying out
tt = T_(10.5); f = np.where((tt * 2.2) % 1 < 0.5, 900, 1250); sq = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)); env = np.minimum(1, tt / 0.1) * np.clip(1 - tt / 10.5, 0, 1) ** 0.6
put(lp(sq, 4000) * env * db(-30), 6.2, pan=0.5)
tt = T_(8); f = 700 + 900 * ((tt * 1.4) % 1); sq = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)); env = np.minimum(1, tt / 0.1) * np.clip(1 - tt / 8, 0, 1) ** 0.5
put(lp(sq, 3500) * env * db(-34), 7.0, pan=-0.6)
# the grid hums down: 60 Hz + harmonics falling in pitch, then gone
tt = T_(2.4); f0 = 60 * (1 - 0.55 * (tt / 2.4) ** 1.5); ph = 2 * np.pi * np.cumsum(f0) / SR; hum = sum(np.sin(k * ph) / k for k in range(1, 9)) * np.clip(1 - tt / 2.4, 0, 1)
put(hum * db(-24), 10.4)
tt = T_(0.4); put(bp(rng.standard_normal(len(tt)), 1500, 8000) * np.exp(-tt / 0.05) * db(-20), 10.45, 0.3)
# crickets
def crickets(t0, t1, g):
    d = t1 - t0; tt = T_(d); y = np.zeros(len(tt))
    for c in range(5):
        fc = 4200 + 600 * c; rate = 2.0 + 0.6 * c; ch = ((tt * rate + c * 0.31) % 1 < 0.12) * (np.sin(2 * np.pi * 30 * tt) > 0)
        y += np.sin(2 * np.pi * fc * tt) * ch * (0.5 + 0.5 * rng.random())
    env = np.minimum(1, tt / 1.5) * np.minimum(1, (d - tt) / 1.5); put(lp(y, 7000) * env * db(g), t0, 0.2)
crickets(11.5, 17.5, -32); crickets(31, 44.3, -36)
# steel groans while things rust (36-44)
for t0, p in [(37.2, 0.3), (39.0, -0.4), (41.6, 0.5)]:
    tt = T_(1.6); f0 = 90 + 40 * np.sin(np.pi * tt / 1.6); ph = 2 * np.pi * np.cumsum(f0) / SR; y = bp(np.sign(np.sin(ph)) * (0.6 + 0.4 * rng.standard_normal(len(tt))), 150, 1500)
    put(y * np.sin(np.pi * tt / 1.6) ** 2 * db(-24), t0, p)
# the bridge hero: a crack of stays snapping, a sub drop (to audio/own; combine.py puts it into the bed)
tt = T_(3.2); sub = np.sin(2 * np.pi * (52 - 18 * tt / 3.2) * tt) * np.minimum(1, tt / 0.02) * np.exp(-tt / 1.1)
crk = norm(bp(rng.standard_normal(len(tt)), 900, 9000)) * np.exp(-tt / 0.06) * 0.6
bang = norm(lp(brown(len(tt)), 300)) * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.7)
h = sub * 1.0 + crk + bang * 0.9; h /= np.abs(h).max(); sf.write("audio/own/hero.wav", (h * db(-1)).astype(np.float32), SR)
# the stays snapping just before (45.0-45.3 is inside the silence; they go after the hit)
for k in range(6):
    tt = T_(0.3); put(np.sin(2 * np.pi * (1800 - 900 * tt / 0.3) * tt) * np.exp(-tt / 0.06) * db(-22), 45.35 + k * 0.11, (k - 2.5) / 3)
# far tower falls: long low rumbles, delayed and quiet (48-54)
for k, t0 in enumerate([48.2, 49.1, 50.3, 51.0, 52.2, 53.3]):
    tt = T_(3.5); y = norm(lp(brown(len(tt)), 140)) * np.minimum(1, tt / 0.3) * np.exp(-tt / 1.2)
    put(y * db(-22 - (k % 2) * 3), t0 + 0.6, pan=((k * 0.37) % 1.2) - 0.6)
# ice creaks (59-63)
for t0 in [59.4, 60.3, 61.6, 62.4]:
    tt = T_(0.8); y = bp(rng.standard_normal(len(tt)), 600, 3500) * (np.sin(2 * np.pi * 38 * tt) > 0.6) * np.exp(-tt / 0.3); put(y * db(-24), t0, rng.random() - 0.5)
# the card swell
tt = T_(4); put(norm(lp(brown(len(tt)), 90)) * np.sin(np.pi * tt / 4) * db(-24), 65.8)
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
