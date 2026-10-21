# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py: the code-made layer (saturno): Saturn's low hum growing as it nears, ice meteors (rising whistles + whooshes) and
their impacts (a bright crack, a low thump, a hiss of steam), the tear of the ground, the lift's roar to a dead stop at 59.0,
the inside of the clouds (a low howl). Writes audio/synth.wav."""
import numpy as np, soundfile as sf, json
from scipy import signal
SR, T = 48000, 70.0; N = int(T * SR); rng = np.random.default_rng(1610)
out = np.zeros((N, 2))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, "lowpass", fs=SR, output="sos"), x)
def env(pts, n0, n): p = np.array(pts, float); t = (n0 + np.arange(n)) / SR; return db(np.interp(t, p[:, 0], p[:, 1]))
def put(y, t0, pan=0.0):
    a = int(t0 * SR); y = y[: N - a]; th = (pan + 1) * np.pi / 4; out[a:a + len(y), 0] += y * np.cos(th) * 1.414; out[a:a + len(y), 1] += y * np.sin(th) * 1.414
def brown(n): x = np.cumsum(rng.standard_normal(n)); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def norm(x): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12)
# Saturn's hum: two low partials and a slow beat, growing from 6 s
n = int(53 * SR); t = np.arange(n) / SR; hum = np.sin(2 * np.pi * 41 * t) + 0.6 * np.sin(2 * np.pi * 61.7 * t + 1) + 0.3 * np.sin(2 * np.pi * 82.3 * t) ; hum *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.21 * t)
put(norm(hum) * env([[6, -60], [14, -30], [22, -22], [30, -18], [46, -14], [58.95, -12], [59.0, -120]], int(6 * SR), n), 6)
# the ice meteors: the same impact times as the picture (seeded like world.js is not reachable here: an even rain + the big ones)
hits = sorted([31 + rng.random() ** 0.8 * 22 for _ in range(110)])
for k, th in enumerate(hits):
    big = rng.random() < 0.12; d = rng.uniform(0.6, 1.2); m = int(d * SR); tt = np.arange(m) / SR
    f = 900 + 2600 * (tt / d) ** 2; ph = 2 * np.pi * np.cumsum(f) / SR; wh = (0.4 * np.sin(ph) + bp(rng.standard_normal(m), 1500, 7000)) * (tt / d) ** 2
    put(wh * db(rng.uniform(-30, -22)), th - d, pan=rng.uniform(-0.8, 0.8))
    m = int(1.6 * SR); tt = np.arange(m) / SR; crack = bp(rng.standard_normal(m), 1200, 9000) * np.exp(-tt / 0.03); thump = np.sin(2 * np.pi * (55 + 40 * np.exp(-tt / 0.08)) * tt) * np.exp(-tt / 0.35); hiss = bp(rng.standard_normal(m), 3000, 9000) * np.exp(-tt / 0.7) * 0.25
    put((crack * 0.8 + thump * (1.4 if big else 0.7) + hiss) * db((-14 if big else -22) + rng.uniform(-3, 2) - 6 * (th > 53)), th, pan=rng.uniform(-0.7, 0.7))
# the tear of the ground: low groans
for t0 in [45.5, 47.5, 49.8, 51.5]:
    n = int(3 * SR); tt = np.arange(n) / SR; y = norm(lp(brown(n), 140)) * np.minimum(1, tt / 0.1) * np.exp(-tt / 1.4); put(y * db(-12), t0, pan=rng.uniform(-0.5, 0.5))
# the lift: a roar that climbs to a dead stop at 59.0
n = int(7 * SR); t = np.arange(n) / SR; w = rng.standard_normal(n); x = norm(bp(w, 40, 300)) * 0.7 + norm(bp(w, 300, 2400)) * 0.45 * np.clip(t / 7, 0, 1)
put(x * env([[52.0, -60], [54, -22], [57, -12], [58.95, -8], [59.0, -120]], int(52 * SR), n), 52)
# inside: a muffled howl and a low churn, fading under the card
n = int(9.5 * SR); t = np.arange(n) / SR; x = norm(bp(rng.standard_normal(n), 60, 500)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.4 * t)) + 0.6 * norm(lp(brown(n), 90))
put(norm(x) * env([[60.2, -8], [61.5, -12], [62.5, -20], [69.5, -50], [69.9, -90]], int(60.2 * SR), n), 60.2)
sf.write("audio/synth.wav", out.astype(np.float32), SR, subtype="FLOAT"); print("synth ok")
