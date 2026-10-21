# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for periodo. Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(13)
T = lambda d: np.arange(int(round(d * SR))) / SR
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x): x = x / (np.abs(x).max() + 1e-9) * 0.89; sf.write(os.path.join(out, name), np.stack([x, x], 1).astype(np.float32), SR)
def put(x, y, t):
    i = int(round(t * SR)); m = min(len(y), len(x) - i)
    if m > 0: x[i:i + m] += y[:m]
def chirp(f0, f1, d, c=1.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** c; return np.sin(2 * np.pi * np.cumsum(f) / SR)
# a pain "sting": a low dissonant stab with a cramp twist (for each new scene / level step)
def sting(f=110, d=0.9): t = T(d); x = sum(a * np.sin(2 * np.pi * f * m * t) for m, a in [(1, 1), (1.06, 0.7), (1.5, 0.4)]) * env(len(t), 0.005, 0.7, 4); x += 0.6 * chirp(90, 40, d) * env(len(t), 0.003, 0.5, 5); return x
save('sting.wav', sting())
save('sting_hi.wav', sting(146.8))
# the HUD level tick (a short blip, pitch rising with the level)
for lv in range(1, 12): t = T(0.18); f = 400 + lv * 70; save(f'lv{lv}.wav', (np.sign(np.sin(2 * np.pi * f * t)) * 0.4 + np.sin(2 * np.pi * f * t)) * env(len(t), 0.002, 0.15, 5))
# dumbbells hitting the rubber floor
d = 0.6; x = np.zeros(int(d * SR)); [put(x, lp(rng.standard_normal(int(0.25 * SR)), 900) * env(int(0.25 * SR), 0.001, 0.2, 6) + 0.6 * chirp(120, 60, 0.25) * env(int(0.25 * SR), 0.001, 0.2, 6), tt) for tt in (0.0, 0.12)]; save('drop.wav', x)
# the vote: 4 quick bleeps then an approval chime
d = 4.6; x = np.zeros(int(d * SR))
for k in range(4): t = T(0.12); put(x, np.sin(2 * np.pi * 880 * t) * env(len(t), 0.003, 0.1, 5) * 0.5, k * 0.7)
t = T(1.6); put(x, sum(a * np.sin(2 * np.pi * f * t) for f, a in [(659, 1), (830, 0.8), (988, 0.7)]) * env(len(t), 0.01, 1.4, 3), 3.0); save('vote.wav', x)
# THE LOOK (52.6): a comedic "record scratch" + a low boom
d = 2.4; t = T(d); x = np.zeros(len(t)); n = int(0.35 * SR); put(x, bp(rng.standard_normal(n), 800, 5000) * env(n, 0.002, 0.3, 4) * np.sin(2 * np.pi * 30 * T(0.35)), 0)
put(x, 1.2 * chirp(70, 32, 1.4) * env(int(1.4 * SR), 0.003, 1.2, 2.6), 0.05); save('look.wav', x)
# end tone
d = 6.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 98 * t) * env(len(t), 1.0, 5, 2.5) + 0.3 * np.sin(2 * np.pi * 147 * t) * env(len(t), 1.5, 4, 3); save('end.wav', x)
print('ok')
