# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code-made layer (encoger): a falling tone as you shrink, the ant's footsteps, a plink and a whoosh at every
zoom inward, a watery drone and chimes in the drop, the tardigrade's slow heartbeat, the cell's pulse and blips, the colour
draining (a closing filter), a spinning shimmer for the DNA, the atom's hiss and sub, the nucleus' buzz, the quark hero
(to audio/own for combine.py), the quarks' sparkle and chord, the card swell. Writes audio/synth.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 80.0; N = int(T * SR); rng = np.random.default_rng(80)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
def T_(d): return np.arange(int(d * SR)) / SR
def tone(f, d, a=0.01, r=0.4): tt = T_(d); return np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / a) * np.exp(-tt / r)
# shrinking (4-16): a falling glide that keeps going down, airy
tt = T_(12); f = 440 * 2 ** (-tt / 4.5); ph = 2 * np.pi * np.cumsum(f) / SR; y = (np.sin(ph) + 0.4 * np.sin(2 * ph)) * np.sin(np.pi * tt / 12) ** 2; put(y * db(-30), 4.0)
# the ant's footsteps (9.4-15.6)
for ts in np.arange(9.4, 15.6, 0.09):
    tt = T_(0.04); put(bp(rng.standard_normal(len(tt)), 1500, 7000) * np.exp(-tt / 0.006) * db(-34 + 6 * np.sin(np.pi * (ts - 9.4) / 6.2)), ts + rng.random() * 0.02, 0.2)
# a plink on the drop (18.6) and a whoosh at every zoom inward
put((tone(1760, 0.6, 0.002, 0.12) + 0.5 * tone(2640, 0.6, 0.002, 0.08)) * db(-22), 18.6)
for t0 in [19.6, 33.6, 44.6, 50.6, 56.4, 61.2]:
    tt = T_(1.0); w = np.zeros(len(tt)); nz = rng.standard_normal(len(tt)); f = 300 + 4000 * (tt / 1.0) ** 2
    for j in range(0, len(tt), 480): w[j:j + 480] = bp(nz[j:j + 480], max(80, f[j] * 0.5), min(20000, f[j] * 1.5), 1)
    put(w * np.sin(np.pi * tt / 1.0) ** 2 * db(-20), t0)
# the drop (20-34): a watery drone, soft chimes
tt = T_(14); dr = (np.sin(2 * np.pi * 110 * tt + 0.5 * np.sin(2 * np.pi * 0.3 * tt)) + 0.6 * np.sin(2 * np.pi * 165 * tt) + 0.3 * np.sin(2 * np.pi * 220 * tt)) * np.minimum(1, tt / 1.5) * np.minimum(1, (14 - tt) / 1)
put(lp(dr, 900) * db(-30), 20.2)
for k, tc in enumerate(np.arange(21, 33, 0.9)): put(tone(880 * 2 ** ([0, 7, 12, 4, 9, 16][k % 6] / 12), 1.6, 0.01, 0.6) * db(-34), tc, np.sin(k) * 0.6)
# the tardigrade's slow heartbeat (26-34)
for tb in np.arange(26, 34, 1.1):
    for dt, g in [(0, 0), (0.25, -4)]: tt = T_(0.4); put(np.sin(2 * np.pi * 52 * tt) * np.exp(-tt / 0.09) * db(-24 + g + 6 * (tb - 26) / 8), tb + dt)
# the cell (34-45): a pulse, bubbly blips; the colour drains (40-45): everything closes down
tt = T_(11); pulse = np.sin(2 * np.pi * 70 * tt) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.2 * tt)) * np.minimum(1, tt / 1) * np.minimum(1, (11 - tt) / 1); put(pulse * db(-28), 34.2)
for k in range(40): t0 = 34.4 + rng.random() * 6; put(tone(600 + rng.random() * 900, 0.2, 0.003, 0.05) * db(-32), t0, rng.random() - 0.5)
tt = T_(5); nz = rng.standard_normal(len(tt)); y = np.zeros(len(tt))
for j in range(0, len(tt), 480): y[j:j + 480] = lp(nz[j:j + 480], max(200, 4000 * (1 - j / len(tt)) ** 2), 1)
put(y * db(-30) * np.sin(np.pi * tt / 5), 40.0)
# DNA (45-51): a spinning shimmer
tt = T_(6.2); arp = sum(np.sin(2 * np.pi * f * tt) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * tt + k * 2.1)) for k, f in enumerate([330, 495, 660, 990])) * np.minimum(1, tt / 0.8) * np.minimum(1, (6.2 - tt) / 0.6)
put(arp * db(-34), 45.2, 0.0)
# the atom (51-57): a fine hiss and a sub
tt = T_(6); put((bp(rng.standard_normal(len(tt)), 4000, 12000) * 0.5 + np.sin(2 * np.pi * 38 * tt)) * np.minimum(1, tt / 1) * np.minimum(1, (6 - tt) / 0.5) * db(-32), 51.2)
# the nucleus (57-62): a dense buzz, rising
tt = T_(5); f0 = 55 + 20 * tt / 5; ph = 2 * np.pi * np.cumsum(f0) / SR; y = sum(np.sin(k * ph) / k for k in range(1, 12)) * np.minimum(1, tt / 0.6) * np.minimum(1, (5 - tt) / 0.1); put(lp(y, 1500) * db(-26), 57.0)
# the hero: a deep impact and a bright chord bloom (to audio/own; combine.py puts it into the bed)
tt = T_(4.0); sub = np.sin(2 * np.pi * (36 + 40 * np.exp(-tt / 0.1)) * tt) * np.minimum(1, tt / 0.005) * np.exp(-tt / 1.2)
chord = sum(np.sin(2 * np.pi * f * tt) for f in [220, 277.2, 329.6, 440, 554.4, 659.3]) / 3 * np.minimum(1, tt / 0.05) * np.exp(-tt / 1.6)
crack = norm(bp(rng.standard_normal(len(tt)), 2000, 10000)) * np.exp(-tt / 0.05) * 0.4
h = sub * 1.1 + chord * 0.6 + crack; h /= np.abs(h).max(); sf.write("audio/own/hero.wav", (h * db(-1)).astype(np.float32), SR)
# the quarks (63-74): sparkles, a glowing pad that fades with the camera
for k in range(160): t0 = 63 + rng.random() * 10; put(tone(2000 + rng.random() * 4000, 0.08, 0.001, 0.02) * db(-36 - 6 * rng.random()), t0, rng.random() * 1.6 - 0.8)
tt = T_(11); pad = sum(np.sin(2 * np.pi * f * tt + k) for k, f in enumerate([110, 164.8, 220, 277.2])) * np.minimum(1, tt / 2) * np.minimum(1, (11 - tt) / 3); put(lp(pad, 1800) * db(-32), 63.0)
# the card swell
tt = T_(5.6); put(norm(lp(brown(len(tt)), 90)) * np.sin(np.pi * tt / 5.6) * db(-24), 74.0)
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
