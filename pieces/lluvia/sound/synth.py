# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code-made layer (lluvia): thunder for every bolt on screen (a crack, then a rolling rumble, delayed by distance),
the time-jump whoosh (42.6-43.6), the dinosaur (footsteps thudding closer, breathing, a low growl) and its roar (63.3), the tail.
Writes audio/synth.wav."""
import numpy as np, soundfile as sf
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(232)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
BOLTS = [[1.1, 117, -900], [3.9, -189, -1400], [6.2, 54, -2400], [8.7, 234, -700], [11.0, -117, -520], [13.2, -315, -1800], [16.4, 148, -1300], [19.0, -54, -3000], [21.6, 288, -2100], [25.0, -216, -900], [28.4, 72, -1600], [32.6, -135, -2600], [37.2, 189, -1100], [41.0, -270, -1500], [46.2, 117, -2200], [50.8, -171, -1700]]
for t0, x, z in BOLTS:
    d = np.hypot(x, z); delay = d / 343.0 * 0.35; g = -19 - 6 * np.log10(d / 500)
    n = int(5 * SR); tt = np.arange(n) / SR; crack = bp(rng.standard_normal(n), 800, 8000) * np.exp(-tt / 0.05) * 0.8
    roll = norm(lp(brown(n), 180)) * (np.minimum(1, tt / 0.15) * np.exp(-tt / 1.6)) * (0.7 + 0.3 * np.sin(2 * np.pi * 2.3 * tt) * np.sin(2 * np.pi * 0.7 * tt))
    put((crack * (0.55 if d < 1200 else 0.3) + roll * 0.9) * db(g), t0 + delay, pan=float(np.clip(x / 400, -0.8, 0.8)))
# the time jump: a rising whoosh and a soft swell
n = int(1.6 * SR); tt = np.arange(n) / SR; f = 200 + 4000 * (tt / 1.6) ** 2; w = rng.standard_normal(n); y = np.zeros(n)
for j in range(0, n, 480): y[j:j + 480] = bp(w[j:j + 480], max(80, f[j] * 0.5), min(20000, f[j] * 1.5), 1)
put(y * np.sin(np.pi * tt / 1.6) ** 2 * db(-14), 42.2)
# the dinosaur: footsteps (low thuds, closer and louder), breathing, a growl as it looks at us
for k, ts in enumerate(np.arange(57.0, 62.6, 0.36)):
    n = int(0.5 * SR); tt = np.arange(n) / SR; th = np.sin(2 * np.pi * (60 + 30 * np.exp(-tt / 0.05)) * tt) * np.exp(-tt / 0.12) + 0.3 * bp(rng.standard_normal(n), 200, 1500) * np.exp(-tt / 0.03)
    put(th * db(-34 + 12 * (ts - 57) / 5.6), ts, pan=0.15 if k % 2 else -0.15)
for tb in [58.5, 60.0, 61.3]:
    n = int(1.1 * SR); tt = np.arange(n) / SR; br = bp(rng.standard_normal(n), 300, 1800) * np.sin(np.pi * tt / 1.1) ** 2; put(br * db(-26 + 4 * (tb - 58.5)), tb)
n = int(1.3 * SR); tt = np.arange(n) / SR; gr = np.sin(2 * np.pi * (55 + 8 * np.sin(2 * np.pi * 9 * tt)) * tt) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt)); gr = gr + 0.4 * bp(rng.standard_normal(n), 80, 600)
put(gr * np.sin(np.pi * tt / 1.3) * db(-24), 61.2)
# THE ROAR: a formant-swept rasp over a pitched growl that rises then falls, 1.6 s
n = int(1.8 * SR); tt = np.arange(n) / SR; f0 = 110 + 170 * np.sin(np.pi * np.clip(tt / 1.5, 0, 1)) ** 0.7; ph = 2 * np.pi * np.cumsum(f0) / SR
saw = sum(np.sin(k * ph) / k for k in range(1, 18)); rasp = rng.standard_normal(n) * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * tt))
vo = np.zeros(n)
for fc, bw, gg in [(500, 300, 1.0), (1100, 500, 0.8), (2300, 900, 0.5)]: vo += gg * bp(saw * 0.6 + rasp * 0.7, fc - bw / 2, fc + bw / 2)
sub = np.sin(2 * np.pi * 48 * tt) * 0.8; env_ = np.minimum(1, tt / 0.08) * np.exp(-np.maximum(0, tt - 1.2) / 0.25)
roar = (norm(vo) * 0.9 + sub) * env_; roar /= np.abs(roar).max(); sf.write("audio/own/roar.wav", (roar * db(-1)).astype(np.float32), SR)
# the tail under the card: a low swell
n = int(6 * SR); tt = np.arange(n) / SR; put(norm(lp(brown(n), 90)) * np.exp(-tt / 2.2) * db(-22), 64.4)
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
