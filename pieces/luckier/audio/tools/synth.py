# synth.py: the light code-synth layer for luckier (on top of the recordings; deterministic: numpy default_rng(SEED + crc32(name))).
# Components (all pre-master dBFS peaks): the teaser rise into the cut, a sub under the big red-counter jumps, the space drone
# (asteroid / swerve), the slow-motion coin shimmer (flip again -> spin, dead by 465.9), and a tiny E7 ping on the edge tick.
# Writes the given path (48 kHz stereo float, 510.0 s) + a .json log of every component.
import os, sys, json, zlib
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000; DUR = 510.0; N = int(DUR * SR)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "work", "synth.wav")
SEED = 2026
out = np.zeros((N, 2), np.float32); log = []

def rng(name): return np.random.default_rng(SEED + zlib.crc32(name.encode()))
def db(x): return 10 ** (x / 20)
def tt(t0, t1): return np.arange(int(round(t0 * SR)), int(round(t1 * SR))) / SR
def ramp(t, pts):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]; v = np.interp(t, xs, ys); g = db(v); g[v <= -119] = 0; return g
def filt(x, kind, f, order=2): return signal.sosfilt(signal.butter(order, f, btype=kind, fs=SR, output="sos"), x, axis=0)
def brown(n, r):
    x = np.cumsum(r.standard_normal(n)); x = x - filt(x, "low", 0.5); return x / (np.std(x) + 1e-9)
def smooth(n, r, rate):
    k = max(2, int(n / SR * rate) + 2); return np.interp(np.linspace(0, k - 1, n), np.arange(k), r.random(k))
def decor(x, ms=11):
    d = int(ms * SR / 1000); y = np.r_[np.zeros(d), x[:-d]]; return np.stack([x * 0.85 + y * 0.15, x * 0.15 + y * 0.85], 1)
def add(name, t0, x, peak_db):
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x * (db(peak_db) / (np.max(np.abs(x)) + 1e-12))
    i0 = int(round(t0 * SR)); i1 = min(N, i0 + len(x)); out[i0:i1] += x[: i1 - i0].astype(np.float32)
    log.append({"name": name, "t0": round(t0, 3), "t1": round(t0 + len(x) / SR, 3), "peak_dbfs": peak_db})

A1, E2, A2, E3, A3 = 55.0, 82.41, 110.0, 164.81, 220.0

# 1. teaser rise 1.6-6.15: an A-minor tone cluster gliding up a whole tone + a noise swell; hard stop at 6.15 (black from 6.2)
def teaser():
    r = rng("teaser"); t0, t1 = 1.6, 6.15; t = tt(t0, t1); u = (t - t0) / (t1 - t0)
    x = np.zeros((len(t), 2))
    for f, a in ((A2, 1.0), (E3, 0.6), (A3, 0.45), (2 * E3, 0.25)):
        fr = f * 2 ** (2 * u ** 1.6 / 12)
        for ch, det in ((0, -0.15), (1, 0.15)):
            x[:, ch] += a * np.sin(2 * np.pi * np.cumsum(fr + det) / SR + r.random() * 6.28)
    nz = filt(r.standard_normal(len(t)), "band", [600, 5000], 2)
    x += 0.5 * decor(nz * u ** 2)
    x *= ramp(t, [(t0, -40), (3.5, -16), (5.6, -3), (6.1, 0), (6.15, 0)])[:, None]
    x[-int(0.005 * SR):] *= np.linspace(1, 0, int(0.005 * SR))[:, None]
    add("teaser.rise", t0, x, -19)
teaser()

# 2. the red counter's big jumps (t0 + 0.8): a short A1 sub under the recorded thud
def sub(T):
    t = np.arange(int(1.1 * SR)) / SR
    x = (np.sin(2 * np.pi * A1 * t) + 0.35 * np.sin(2 * np.pi * A2 * t)) * (1 - np.exp(-t / 0.006)) * np.exp(-t / 0.32)
    add(f"counter.sub@{T}", T, x, -17)
for T in (97, 106, 268, 322, 331, 340): sub(T + 0.8)

# 3. space 412-430: a low A pedal and a dark air, swelling on the swerve (425.5)
def space():
    r = rng("space"); t0, t1 = 412.0, 430.5; t = tt(t0, t1)
    lfo = 0.6 + 0.4 * smooth(len(t), r, 0.1)
    x = np.zeros((len(t), 2))
    for f, a in ((A1, 1.0), (E2, 0.5), (A2, 0.25)):
        for ch, det in ((0, -0.06), (1, 0.06)): x[:, ch] += a * lfo * np.sin(2 * np.pi * (f + det) * t + r.random() * 6.28)
    x += 0.4 * decor(filt(brown(len(t), r), "low", 120, 4), 23)
    x *= ramp(t, [(t0, -40), (413.5, -8), (421, -6), (425.5, 0), (428, -6), (430.4, -120)])[:, None]
    add("space.drone", t0, x, -19)
space()

# 4. the coin in slow motion 451.4-465.9: glassy partials (A5, E6, A6, C7) beating slowly; nothing left by 465.9
def shimmer():
    r = rng("shimmer"); t0, t1 = 451.4, 465.9; t = tt(t0, t1)
    x = np.zeros((len(t), 2))
    for f in (880.0, 1318.5, 1760.0, 2093.0):
        am = 0.3 + 0.7 * smooth(len(t), r, 0.6) ** 2; pan = r.uniform(-0.6, 0.6)
        s = am * np.sin(2 * np.pi * f * t + r.random() * 6.28 + 0.003 * np.sin(2 * np.pi * 0.21 * t)) / (f / 880)
        x[:, 0] += s * np.sqrt((1 - pan) / 2); x[:, 1] += s * np.sqrt((1 + pan) / 2)
    x *= ramp(t, [(t0, -40), (454, -12), (458, -4), (462, -3), (464.6, -14), (465.85, -60), (465.9, -120)])[:, None]
    add("coin.shimmer", t0, x, -31)
shimmer()

# 5. the edge 466.70: a tiny clean E7 ping on top of the recorded tick (no tail beyond 0.5 s)
def ping():
    t = np.arange(int(0.5 * SR)) / SR
    x = np.sin(2 * np.pi * 2637.0 * t) * (1 - np.exp(-t / 0.0008)) * np.exp(-t / 0.09)
    add("edge.ping", 466.70, x, -33)
ping()

assert np.isfinite(out).all()
os.makedirs(os.path.dirname(OUT), exist_ok=True)
sf.write(OUT, out, SR, subtype="FLOAT")
json.dump({"seed": SEED, "sr": SR, "duration": DUR, "components": log}, open(OUT.replace(".wav", ".json"), "w"), indent=1)
print(len(log), "components")
