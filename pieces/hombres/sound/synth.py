# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for hombres (layered with the recordings in gen.py). Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(51)
T = lambda d: np.arange(int(round(d * SR))) / SR
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def sweep(f0, f1, d, curve=2.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** (1 / curve); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.89; sf.write(os.path.join(out, name), np.stack([x, x], 1).astype(np.float32), SR)
noise = lambda d: rng.standard_normal(int(round(d * SR)))
def put(x, y, t):
    i = int(round(t * SR)); m = min(len(y), len(x) - i)
    if m > 0: x[i:i + m] += y[:m]

# 1. the scoreboard countdown (4.0 -> 9.0): one arena beep per number (6,5,4,3,2,1), each a bright square-ish tone with a hall tail
d = 6.0; x = np.zeros(int(d * SR))
for k in range(6):
    L = 0.32; t = T(L); f = 988 if k < 5 else 1318
    b = (np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * t)) * env(len(t), 0.003, 0.28, 4)
    b = lp(b, 6000); put(x, b, k * 1.0)
tail = lp(x, 3000); x = x + 0.25 * np.concatenate([np.zeros(int(0.09 * SR)), tail[:-int(0.09 * SR)]]); save('beeps.wav', x)

# 2. THE BUZZER (10.0): the arena horn — a fat buzzy chord, then the shimmer of every man vanishing (a rising airy whoosh + sub drop)
d = 3.2; t = T(d); n = len(t)
horn = sum(np.sign(np.sin(2 * np.pi * f * t + k)) * a for k, (f, a) in enumerate([(220, 1), (277, 0.8), (330, 0.7), (110, 0.6)])) * (np.minimum(1, t / 0.01) * (t < 1.4) + (t >= 1.4) * np.exp(-(t - 1.4) * 9))
horn = lp(horn, 3500)
sub = sweep(70, 26, 1.6, 1.3); sub = np.concatenate([sub, np.zeros(n - len(sub))]) * env(n, 0.003, 1.4, 2.6)
shim = hp(noise(d), 3000) * np.clip((t - 0.05) / 0.6, 0, 1) * np.exp(-np.maximum(0, t - 0.7) * 1.8) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t))
x = 0.9 * horn + 1.3 * sub + 0.5 * shim; save('buzzer.wav', x)

# 3. a soft vanish shimmer (for the father at 14.6)
d = 1.8; t = T(d); x = hp(noise(d), 2500) * env(len(t), 0.25, 1.4, 2.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)) + 0.3 * sweep(900, 2400, d, 0.6) * env(len(t), 0.2, 1.4, 3)
save('shimmer.wav', x)

# 4. the cockpit warning (25-33): a master-caution chime repeating, plus the autopilot disconnect wail
d = 8.0; x = np.zeros(int(d * SR))
for k in range(8):
    L = 0.5; t = T(L); c = (np.sin(2 * np.pi * 880 * t) + 0.6 * np.sin(2 * np.pi * 1108 * t)) * env(len(t), 0.004, 0.45, 4); put(x, c, 0.3 + k * 0.95)
save('caution.wav', x)

# 5. power down (73.4): a hum that sags and dies; power up (93.0): a click, a hum that rises
d = 1.6; t = T(d); f = 60 * (1 - 0.6 * (t / d) ** 2); hum = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) / k for k in range(1, 6)) * (1 - t / d) ** 1.5
save('powerdown.wav', lp(hum, 1200) + 0.6 * lp(noise(d), 200) * env(len(t), 0.001, 0.15, 6))
d = 2.5; t = T(d); f = 60 * (0.4 + 0.6 * np.minimum(1, t / 0.8)); hum = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) / k for k in range(1, 6)) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 1.0)
clk = hp(noise(0.03), 1500) * env(int(0.03 * SR), 0.0005, 0.02, 6); x = lp(hum, 1500) * 0.7; put(x, 1.2 * clk, 0.0); save('powerup.wav', x)

# 6. the ultrasound heartbeat (140-152): fast whooshing fetal heartbeat
d = 12.0; t = T(d); x = np.zeros(len(t)); per = 60 / 145
for k in range(int(d / per)):
    L = 0.18; b = lp(noise(L), 600) * env(int(L * SR), 0.01, 0.15, 5); put(x, b, k * per)
x = lp(x, 900) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8); save('fetal.wav', x)

# 7. the end card: a low warm tone that fades
d = 7.8; t = T(d); x = lp(np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.5 * t) + 0.25 * np.sin(2 * np.pi * 110 * t), 400) * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 2.5)
save('end.wav', x)
print('code sfx written to', out)
