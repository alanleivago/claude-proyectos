# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for tesla (layered with the recordings in gen.py). Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(23)
T = lambda d: np.arange(int(round(d * SR))) / SR
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x, st=None):
    if st is None: st = np.stack([x, x], 1)
    st = st / (np.abs(st).max() + 1e-9) * 0.89; sf.write(os.path.join(out, name), st.astype(np.float32), SR)
noise = lambda d: rng.standard_normal(int(round(d * SR)))
def put(x, y, t):
    i = int(round(t * SR)); m = min(len(y), len(x) - i)
    if m > 0: x[i:i + m] += y[:m]
def chirp(f0, f1, d, curve=1.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** curve; return np.sin(2 * np.pi * np.cumsum(f) / SR)

# 1. the car wakes (6.6): a soft two-tone chime and an electric hum rising
d = 2.0; x = np.zeros(int(d * SR)); t = T(0.5)
for k, f in enumerate([880, 1318]): put(x, np.sin(2 * np.pi * f * t) * env(len(t), 0.005, 0.4, 4) * 0.5, k * 0.18)
put(x, 0.4 * chirp(60, 120, 1.6) * np.minimum(1, T(1.6) / 0.4), 0.3); save('wake.wav', x)
# 2. THE LAUNCH (8.6, 5.4 s): an electric motor whine sweeping up through gears, a deep thump, tyre chirp
d = 5.4; t = T(d); f = 80 + 2600 * (1 - np.exp(-t / 1.1)); whine = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR) + 0.2 * np.sin(2 * np.pi * np.cumsum(f * 3.02) / SR)
whine *= np.minimum(1, t / 0.05) * (0.6 + 0.4 * np.exp(-t / 2)) * np.minimum(1, (d - t) / 0.6)
thump = np.zeros(len(t)); n = int(0.6 * SR); put(thump, chirp(70, 28, 0.6) * env(n, 0.003, 0.5, 3), 0.0)
chirp_ = np.zeros(len(t)); put(chirp_, bp(noise(0.35), 1500, 5000) * env(int(0.35 * SR), 0.005, 0.3, 4), 0.02)
air = hp(noise(d), 800) * np.clip(t / 2.5, 0, 1) * 0.4
save('launch.wav', 0.6 * lp(whine, 9000) + 1.2 * thump + 0.5 * chirp_ + air)
# 3. a cold-gas blast (2.4 s): a hard hiss with a low pressure body
d = 2.4; t = T(d); x = bp(noise(d), 300, 9000) * env(len(t), 0.01, 2.0, 2.4) + 0.6 * lp(noise(d), 200) * env(len(t), 0.01, 0.6, 3)
save('gas.wav', x)
# 4. landing thud + suspension (0.8 s)
d = 0.8; x = chirp(90, 35, d) * env(int(d * SR), 0.002, 0.5, 4) + 0.4 * bp(noise(d), 200, 1500) * env(int(d * SR), 0.002, 0.2, 5); save('land.wav', x)
# 5. the fly-by whoosh for the towers (1.6 s)
d = 1.6; t = T(d); x = bp(noise(d), 200, 4000) * np.sin(np.pi * t / d) ** 3; save('whoosh.wav', x)
# 6. high-altitude pressure: a rising rumble that thins out (32 -> 50)
d = 18.0; t = T(d); k = t / d; x = lp(noise(d), 300) * (0.6 + 0.6 * k) * (1 - k ** 3) + 0.5 * bp(noise(d), 1500, 5000) * (1 - k) ** 2
save('climb.wav', x * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 0.08))
# 7. a cabin tone in space: a faint pure hum, a creak of the canopy (51 -> 66)
d = 15.0; t = T(d); x = 0.3 * np.sin(2 * np.pi * 55 * t) * np.minimum(1, t / 2) + 0.15 * np.sin(2 * np.pi * 110.4 * t) * np.minimum(1, t / 3)
put(x, 0.6 * bp(noise(0.5), 600, 2000) * env(int(0.5 * SR), 0.05, 0.4, 3), 4.0); save('cabin.wav', x)
# 8. STARMAN (51.0): a huge bright swell: a choir-like chord of sines with a sub hit, ringing out
d = 9.0; t = T(d); chord = sum(a * np.sin(2 * np.pi * f * t + 0.003 * f * np.sin(2 * np.pi * 0.25 * t)) for f, a in [(130.8, 1), (196, 0.8), (261.6, 0.7), (329.6, 0.6), (392, 0.5), (523.3, 0.35), (659.3, 0.25)])
chord *= np.minimum(1, t / 0.04) * np.exp(-t * 0.28); sub = chirp(55, 30, 2.0) * env(int(2.0 * SR), 0.003, 1.6, 2.4); x = 0.5 * chord; put(x, 1.3 * sub, 0)
save('starman.wav', x)
# 9. end tone
d = 9.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 98 * t) * env(len(t), 1.5, 7, 2.5) + 0.3 * np.sin(2 * np.pi * 147 * t) * env(len(t), 2.0, 6, 3); save('end.wav', x)
print('ok')
