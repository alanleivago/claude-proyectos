# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code-made layer (eterno): billboard blips (3, 2, 1 → 0), a soft chord when death stops, crane hums and
hammering as the town grows, crickets at night, the dive (a whoosh and a plunge), the underwater drone, the jellyfish's pulse,
a slow heartbeat as it ages, little chimes as the polyps bud, the surfacing, tower rises (low swells), piles in the sea,
the hero (to audio/own for combine.py), the card swell. Writes audio/synth.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(122)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
def T_(d): return np.arange(int(d * SR)) / SR
def tone(f, d, a=0.01, r=0.3): tt = T_(d); return np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / a) * np.exp(-tt / r)
# the billboard: digital blips as it counts down, a brighter one at 0
for t0, f in [(1.3, 880), (2.6, 880), (4.0, 1320)]: put((tone(f, 0.3, 0.003, 0.06) + 0.5 * tone(f * 2, 0.3, 0.003, 0.04)) * db(-22), t0, -0.1)
# a soft major chord swelling as death stops (4-9)
tt = T_(6); ch = sum(np.sin(2 * np.pi * f * tt) for f in [261.6, 329.6, 392.0, 523.3]) * np.sin(np.pi * tt / 6) ** 2; put(lp(ch, 2500) * db(-32), 4.0)
# hammering and crane hums while the town grows (14-25)
for ts in np.arange(14.5, 25, 0.37):
    if rng.random() < 0.6: tt = T_(0.15); put(bp(rng.standard_normal(len(tt)), 600, 4000) * np.exp(-tt / 0.02) * db(-34 + 4 * rng.random()), ts + rng.random() * 0.1, rng.random() * 1.2 - 0.6)
tt = T_(11); hum = (np.sin(2 * np.pi * 98 * tt) + 0.5 * np.sin(2 * np.pi * 147 * tt)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * tt)) * np.sin(np.pi * tt / 11); put(lp(hum, 600) * db(-34), 14.0, 0.3)
# crickets at night (24.6-30.4)
tt = T_(5.8); y = np.zeros(len(tt))
for c in range(6): fc = 4300 + 500 * c; rate = 2.1 + 0.5 * c; y += np.sin(2 * np.pi * fc * tt) * (((tt * rate + c * 0.29) % 1) < 0.12) * (np.sin(2 * np.pi * 32 * tt) > 0) * (0.5 + 0.5 * rng.random())
put(lp(y, 7000) * np.minimum(1, tt / 1.2) * np.minimum(1, (5.8 - tt) / 0.5) * db(-30), 24.6, -0.2)
# the dive: a rising whoosh, then a plunge (30.3-31.2)
tt = T_(1.2); w = bp(rng.standard_normal(len(tt)), 300, 5000) * (tt / 1.2) ** 2; put(w * db(-18), 29.6)
tt = T_(1.5); pl = norm(lp(brown(len(tt)), 400)) * np.minimum(1, tt / 0.02) * np.exp(-tt / 0.4) + bp(rng.standard_normal(len(tt)), 800, 5000) * np.exp(-tt / 0.15) * 0.6; put(pl * db(-21), 30.8)
# under water: a low drone (31-41), the jellyfish's soft pulses, a slow heartbeat as it ages, chimes as the polyps bud
tt = T_(10.4); dr = (np.sin(2 * np.pi * 55 * tt) + 0.5 * np.sin(2 * np.pi * 82.4 * tt + 0.3) + 0.3 * np.sin(2 * np.pi * 110 * tt)) * np.minimum(1, tt / 1) * np.minimum(1, (10.4 - tt) / 0.5)
put(lp(dr, 400) * db(-28), 30.8)
for tp in np.arange(31.2, 35.5, 1 / 0.9): tt = T_(0.6); put(np.sin(2 * np.pi * 70 * tt) * np.exp(-tt / 0.15) * db(-26), tp)
for tb in [35.6, 36.5, 37.6]:
    for dt in [0, 0.22]: tt = T_(0.4); put(np.sin(2 * np.pi * 50 * tt) * np.exp(-tt / 0.09) * db(-27 + 2 * (tb - 35.6)), tb + dt)
for k, tc in enumerate(np.arange(38.0, 41.0, 0.21)): put((tone(880 * 2 ** ([0, 4, 7, 12, 7, 4][k % 6] / 12), 1.2, 0.005, 0.5) * 0.6) * db(-30), tc, np.sin(k) * 0.6)
# surfacing (40.6-41.4): a reverse whoosh into air
tt = T_(1.0); w = bp(rng.standard_normal(len(tt)), 500, 7000) * (tt / 1.0) ** 3; put(w * db(-18), 40.4)
# tower rises: low swelling rumbles, more and closer (41-59.8); piles in the sea (52-56)
R = np.random.default_rng(41)
for t0 in sorted(R.uniform(41, 59.5, 26)):
    tt = T_(2.6); y = norm(lp(brown(len(tt)), 160)) * np.sin(np.pi * tt / 2.6) ** 2; put(y * db(-34 + 4 * (t0 - 41) / 18.5), t0, R.uniform(-0.7, 0.7))
for tp in np.arange(52.2, 56, 0.45):
    tt = T_(0.5); put((np.sin(2 * np.pi * 48 * tt) * np.exp(-tt / 0.1) + 0.4 * bp(rng.standard_normal(len(tt)), 200, 1200) * np.exp(-tt / 0.03)) * db(-31), tp + rng.random() * 0.1, -0.3)
# the hero: a rising roar that slams to a stop + sub + crack (to audio/own; combine.py puts it into the bed)
tt = T_(3.0); sub = np.sin(2 * np.pi * (44 + 30 * np.exp(-tt / 0.15)) * tt) * np.minimum(1, tt / 0.01) * np.exp(-tt / 1.0)
crk = norm(bp(rng.standard_normal(len(tt)), 700, 8000)) * np.exp(-tt / 0.08) * 0.6; body = norm(lp(brown(len(tt)), 350)) * np.minimum(1, tt / 0.01) * np.exp(-tt / 0.7)
glass = np.zeros(len(tt))
for k in range(60): a = int(rng.random() * 0.8 * SR); n = int(0.05 * SR); glass[a:a + n] += np.sin(2 * np.pi * (2500 + rng.random() * 5000) * np.arange(n) / SR) * np.exp(-np.arange(n) / SR / 0.012) * rng.random()
h = sub + crk + body * 0.9 + glass * 0.25; h /= np.abs(h).max(); sf.write("audio/own/hero.wav", (h * db(-1)).astype(np.float32), SR)
# the rush just before the silence (58.6-59.8): a riser that cuts dead
tt = T_(1.2); ri = bp(rng.standard_normal(len(tt)), 200, 3000) * (tt / 1.2) ** 2.5; put(ri * db(-24), 58.6)
# the card swell
tt = T_(5); put(norm(lp(brown(len(tt)), 90)) * np.sin(np.pi * tt / 5) * db(-24), 64.3)
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
