# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code layer (infierno): a heartbeat that slows and stops (2.6-4.4), the ear-ring after the bang, a low drone
in the dark, the drop into the fall (whoosh), sub pulses in the tunnel, the plunge into the fireball, a phone vibration
(34-37), a sub swell under heaven, the riser to the silence, the blaze hero (to audio/own), the tail. Writes audio/synth.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(666)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
def T_(d): return np.arange(int(d * SR)) / SR
def beat(t0, g):
    for dt, gg in [(0, 0), (0.24, -5)]: tt = T_(0.35); put(np.sin(2 * np.pi * (58 - 10 * tt) * tt) * np.exp(-tt / 0.07) * db(g + gg), t0 + dt)
# heartbeat under the party (0-3.6) and slowing to a stop after the bang
for k, tb in enumerate(np.arange(0.3, 3.4, 0.47)): beat(tb, -24)
for tb, g in [(3.85, -16), (4.65, -18), (5.8, -22)]: beat(tb, g)
# the ring in the ears after the bang (3.7-7)
tt = T_(3.4); put(np.sin(2 * np.pi * 3100 * tt) * np.exp(-tt / 1.4) * np.minimum(1, tt / 0.05) * db(-28), 3.6)
# a low drone in the dark (4.8-11)
tt = T_(6.4); dr = (np.sin(2 * np.pi * 41 * tt) + 0.5 * np.sin(2 * np.pi * 61.7 * tt)) * np.minimum(1, tt / 1.2) * np.minimum(1, (6.4 - tt) / 0.5); put(lp(dr, 300) * db(-24), 4.8)
# the drop into the fall: a falling whoosh at 10.9
tt = T_(1.6); nz = rng.standard_normal(len(tt)); y = np.zeros(len(tt)); f = 5000 * (1 - tt / 1.6) ** 2 + 200
for j in range(0, len(tt), 480): y[j:j + 480] = bp(nz[j:j + 480], max(80, f[j] * 0.5), min(20000, f[j] * 1.5), 1)
put(y * np.sin(np.pi * tt / 1.6) * db(-14), 10.8)
# sub pulses in the tunnel, faster as you fall (11-16)
tp = 11.4
while tp < 16:
    tt = T_(0.5); put(np.sin(2 * np.pi * 38 * tt) * np.exp(-tt / 0.15) * db(-22 + 3 * (tp - 11) / 5), tp); tp += max(0.25, 0.9 - 0.13 * (tp - 11))
# the plunge into the fireball (17.6): a whoomp
tt = T_(2.2); put((np.sin(2 * np.pi * (60 - 25 * tt / 2.2) * tt) * np.exp(-tt / 0.6) + 0.5 * norm(lp(brown(len(tt)), 400)) * np.exp(-tt / 0.5)) * db(-22), 17.65)
# the phone: two vibrations (34.6, 35.6)
for tv in [34.6, 35.6]: tt = T_(0.45); put(lp(np.sign(np.sin(2 * np.pi * 150 * tt)), 600) * (np.sin(2 * np.pi * 24 * tt) > 0) * db(-26), tv)
tt = T_(3); put(norm(lp(brown(len(tt)), 200)) * np.minimum(1, tt / 0.3) * np.minimum(1, (3 - tt) / 0.3) * db(-36), 34.0)
# a sub swell under heaven (43-49)
tt = T_(6); put(np.sin(2 * np.pi * 55 * tt) * np.sin(np.pi * tt / 6) ** 2 * db(-24), 43.2)
# the riser into the silence (54.8-57.8), cut dead
tt = T_(3.0); ri = bp(rng.standard_normal(len(tt)), 150, 3000) * (tt / 3.0) ** 2.4; put(ri * db(-16) * (1 - (tt > 2.9)), 54.8)
# the blaze hero (to audio/own): a deep boom + a roaring flare
tt = T_(3.4); sub = np.sin(2 * np.pi * (34 + 46 * np.exp(-tt / 0.1)) * tt) * np.minimum(1, tt / 0.004) * np.exp(-tt / 1.3)
fl = norm(bp(rng.standard_normal(len(tt)), 200, 6000)) * np.minimum(1, tt / 0.03) * np.exp(-tt / 1.0)
body = norm(lp(brown(len(tt)), 300)) * np.minimum(1, tt / 0.005) * np.exp(-tt / 0.9)
h = sub * 1.1 + fl * 0.45 + body; h /= np.abs(h).max(); sf.write("audio/own/hero.wav", (h * db(-1)).astype(np.float32), SR)
# the tail under the card
tt = T_(3.4); put(norm(lp(brown(len(tt)), 90)) * np.sin(np.pi * tt / 3.4) * db(-26), 66.6)
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
