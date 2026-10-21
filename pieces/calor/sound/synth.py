# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code-made layer (calor): the fair's organ waltz that winds down when everyone runs (0-6), footsteps on the
boardwalk, a heat drone that climbs with the temperature (4-56), balloon and ball pops (10-11.6), plastic creaks, distant
thunder under the cloud, popcorn pops, the hush (21.8-25.3), ignition whooshes, car fuel pops, a fire roar, steel groans,
the steel hero (to audio/own for combine.py), the card swell. Writes audio/synth.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(550)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
def T_(d): return np.arange(int(d * SR)) / SR
# the fair's organ: a waltz (3/4) in C, reedy; at 4.6 it winds down like a tape stop and dies by 6
tt = T_(6.4); spd = np.where(tt < 4.6, 1.0, np.clip(1 - (tt - 4.6) / 1.4, 0, 1)); ph_t = np.cumsum(spd) / SR
mel = [72, 76, 79, 79, 77, 76, 74, 77, 81, 81, 79, 77, 76, 79, 84, 84, 83, 81, 79, 77, 76, 74, 72, 72]
bas = [48, 55, 55, 50, 55, 55, 53, 57, 57, 48, 55, 55]
beat = 0.32; y = np.zeros(len(tt))
for k in range(len(tt)):
    pass
idx = (ph_t / beat).astype(int); fm = 440 * 2 ** ((np.array(mel)[idx % len(mel)] - 69) / 12); fb = 440 * 2 ** ((np.array(bas)[(idx // 2) % len(bas)] - 69) / 12)
pm = 2 * np.pi * np.cumsum(fm * spd) / SR; pb = 2 * np.pi * np.cumsum(fb * spd) / SR; env = 0.6 + 0.4 * np.exp(-((ph_t % beat) / 0.12))
y = (np.sin(pm) + 0.5 * np.sin(2 * pm) + 0.3 * np.sin(3 * pm) + 0.2 * np.sign(np.sin(pm)) * 0.3) * env * 0.6 + (np.sin(pb) + 0.4 * np.sin(2 * pb)) * 0.45 * (0.5 + 0.5 * np.exp(-((ph_t % (beat * 3)) / 0.15)))
y = lp(y, 3500) * spd ** 0.5 * np.minimum(1, tt / 0.3); put(y * db(-27), 0, 0.45)
# footsteps on the boardwalk as everyone runs (4.4-7.4)
for ts in np.arange(4.4, 7.4, 0.11):
    n = int(0.08 * SR); u = np.arange(n) / SR; put(bp(rng.standard_normal(n), 300, 2400) * np.exp(-u / 0.015) * db(-30 + 4 * rng.random() - 6 * (ts - 4.4) / 3), ts + rng.random() * 0.05, rng.random() - 0.5)
# the heat drone: a low sine cluster + shimmering band climbing with the temperature, ducked in the hush and gone before the hit
tt = T_(52); temp = 24 + 10 * tt; f0 = 45 + 0.09 * temp
ph = 2 * np.pi * np.cumsum(f0) / SR; dr = np.sin(ph) + 0.5 * np.sin(1.5 * ph + 0.3) + 0.3 * np.sin(2.01 * ph)
sh = bp(rng.standard_normal(len(tt)), 2500, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * tt))
env = np.clip(tt / 6, 0, 1) * (1 - 0.6 * np.clip((tt + 4 - 21.8) / 0.6, 0, 1) * np.clip((25.3 - tt - 4) / 0.4, 0, 1)) * np.clip((52 - tt) / 0.3, 0, 1)
put((dr * 0.6 + sh * 0.12) * env * db(-26) * (1 + 0.8 * np.clip(tt / 50, 0, 1)), 4.0)
# pops: balloons and beach balls (10-11.6)
R = np.random.default_rng(10)
for k in range(30):
    t0 = 10 + R.random() * 1.7; n = int(0.12 * SR); u = np.arange(n) / SR; y = (bp(R.standard_normal(n), 800, 7000) * np.exp(-u / 0.01) + 0.6 * np.sin(2 * np.pi * 110 * u) * np.exp(-u / 0.03)); put(y * db(-18 - 10 * R.random()), t0, R.random() * 1.6 - 0.8)
# plastic creaks as it melts (14.6-16.5)
for t0 in [14.8, 15.3, 15.9, 16.3]:
    tt = T_(0.6); y = bp(np.sign(np.sin(2 * np.pi * (180 + 80 * tt) * tt)) * rng.standard_normal(len(tt)) ** 2, 400, 3000) * np.sin(np.pi * tt / 0.6) ** 2; put(y * db(-30), t0, rng.random() - 0.5)
# distant thunder under the cloud (17.5-23)
for t0 in [17.6, 20.4, 22.6]:
    tt = T_(4); y = norm(lp(brown(len(tt)), 160)) * np.minimum(1, tt / 0.3) * np.exp(-tt / 1.3); put(y * db(-26), t0, -0.4)
# popcorn (19.6-21.6): many small pops
for k in range(70):
    t0 = 19.6 + rng.random() * 2.0; n = int(0.06 * SR); u = np.arange(n) / SR; put(bp(rng.standard_normal(n), 1200, 6000) * np.exp(-u / 0.006) * db(-22 - 8 * rng.random()), t0, 0.35 + 0.2 * rng.random())
# ignition whooshes: paper (25.3), wood (31.6)
for t0, g in [(25.2, -16), (31.5, -12)]:
    tt = T_(1.6); y = lp(rng.standard_normal(len(tt)), 900) * (np.minimum(1, tt / 0.15) * np.exp(-tt / 0.6)); put(norm(y) * db(g), t0)
# a fire roar (31.6-50): brown noise with flicker
tt = T_(18.5); y = norm(lp(brown(len(tt)), 250)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.9 * tt) * np.sin(2 * np.pi * 2.3 * tt)) * np.minimum(1, tt / 1.2) * np.clip((18.5 - tt) / 4, 0, 1); put(y * db(-22), 31.6)
# steel groans (50-56)
for t0, p in [(50.6, 0.4), (52.4, -0.3), (54.2, 0.5), (55.2, -0.4)]:
    tt = T_(1.5); f0 = 70 + 30 * np.sin(np.pi * tt / 1.5); ph = 2 * np.pi * np.cumsum(f0) / SR; y = bp(np.sign(np.sin(ph)) * (0.6 + 0.4 * rng.standard_normal(len(tt))), 120, 1400)
    put(y * np.sin(np.pi * tt / 1.5) ** 2 * db(-26 + 2 * (t0 - 50.6)), t0, p)
# the steel hero: a deep crack + sub drop + metal shear (to audio/own; combine.py puts it into the bed)
tt = T_(3.4); sub = np.sin(2 * np.pi * (50 - 18 * tt / 3.4) * tt) * np.minimum(1, tt / 0.02) * np.exp(-tt / 1.2)
crk = norm(bp(rng.standard_normal(len(tt)), 900, 9000)) * np.exp(-tt / 0.07) * 0.6
shear = bp(np.sign(np.sin(2 * np.pi * (240 - 120 * tt / 3.4) * tt)) * rng.standard_normal(len(tt)), 300, 2500) * np.exp(-tt / 0.9) * 0.5
bang = norm(lp(brown(len(tt)), 300)) * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.8)
h = sub + crk + shear + bang * 0.9; h /= np.abs(h).max(); sf.write("audio/own/hero.wav", (h * db(-1)).astype(np.float32), SR)
# the cranes and the pier hitting the sea (57-59): low thuds
for t0, p in [(57.4, -0.5), (57.8, -0.6), (58.2, -0.4), (58.6, 0.3)]:
    tt = T_(2.5); y = norm(lp(brown(len(tt)), 180)) * np.minimum(1, tt / 0.05) * np.exp(-tt / 0.6); put(y * db(-20), t0, p)
# the card swell
tt = T_(5); put(norm(lp(brown(len(tt)), 90)) * np.sin(np.pi * tt / 5) * db(-24), 64.3)
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
