# /// script
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""synth.py outdir: code-made SFX for dossoles (layered with the recordings in gen.py). Deterministic."""
import os, sys, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; out = sys.argv[1]; os.makedirs(out, exist_ok=True); rng = np.random.default_rng(31)
T = lambda d: np.arange(int(round(d * SR))) / SR
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'highpass', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def env(n, a, r, shape=3.0):
    n = int(n); t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
def save(name, x, st=None):
    if st is None: st = np.stack([x, x], 1)
    st = st / (np.abs(st).max() + 1e-9) * 0.89; sf.write(os.path.join(out, name), st.astype(np.float32), SR)
def chirp(f0, f1, d, c=1.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** c; return np.sin(2 * np.pi * np.cumsum(f) / SR)
# 1. sunrise tones: sun A (a warm low swell, 9 s) and sun B (a bright high swell, 9 s)
d = 9.0; t = T(d); x = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(98, 1), (147, 0.6), (196, 0.4)]) * np.sin(np.pi * t / d) ** 2; save('riseA.wav', x)
x = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(392, 0.6), (523.3, 0.5), (659.3, 0.4), (784, 0.3), (1046, 0.15)]) * np.sin(np.pi * t / d) ** 2 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.3 * t)); save('riseB.wav', x)
# 2. the heat drone (24 -> 34.6): a dense shimmering chord that grows, then cuts
d = 10.6; t = T(d); x = sum(a * np.sin(2 * np.pi * f * t + 0.5 * np.sin(2 * np.pi * (0.2 + 0.03 * k) * t)) for k, (f, a) in enumerate([(55, 1), (82.4, 0.7), (110, 0.5), (164.8, 0.4), (220, 0.3), (329.6, 0.2)]))
x = x * (0.4 + 0.6 * t / d) + 0.3 * hp(rng.standard_normal(len(t)), 3000) * (t / d) ** 2; x *= np.minimum(1, (d - t) / 0.05); save('heat.wav', x)
# 3. ECLIPSE (36.0, 9 s): a deep sub drop, a dark wide chord, the shimmer fading
d = 9.0; t = T(d); sub = np.zeros(len(t)); n = int(3.0 * SR); sub[:n] = chirp(65, 26, 3.0, 1.3) * env(n, 0.005, 2.6, 2.2)
chord = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(65.4, 1), (77.8, 0.7), (98, 0.6), (155.6, 0.4), (196, 0.3)]) * env(len(t), 0.02, 8, 1.6)
save('eclipse.wav', 1.2 * sub + 0.6 * chord + 0.2 * bp(rng.standard_normal(len(t)), 200, 1200) * env(len(t), 0.01, 3, 2))
# 4. sunset tones: gold (big sets, 6 s) and red (small sets, 6 s, lower)
d = 6.0; t = T(d); x = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(261.6, 1), (329.6, 0.6), (392, 0.5)]) * np.sin(np.pi * t / d) ** 2; save('setB.wav', x)
x = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(130.8, 1), (155.6, 0.6), (196, 0.5)]) * np.sin(np.pi * t / d) ** 2; save('setA.wav', x)
# 5. end tone
d = 8.0; t = T(d); x = 0.5 * np.sin(2 * np.pi * 98 * t) * env(len(t), 1.5, 6, 2.5) + 0.3 * np.sin(2 * np.pi * 147 * t) * env(len(t), 2.0, 5, 3); save('end.wav', x)
print('ok')
