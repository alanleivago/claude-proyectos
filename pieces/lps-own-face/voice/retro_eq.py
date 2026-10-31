"""venv: the LowPolyShorts narration filter, measured. LPS voice (4 refs, demucs vocal stems in
fuentes/lowpolyshorts-style/refs-audio/sep) vs our voice: long-term spectra in 1/6-octave bands -> a matching
FIR (linear phase, +-24 dB). The result is the retro "radio" voice: lows under ~150 Hz cut, steep roll-off above ~3 kHz.
voice/voice.wav -> voice/voice_retro.wav (same timing).  python voice/retro_eq.py"""
import glob, os, subprocess
import numpy as np
from scipy.signal import welch, firwin2, fftconvolve

H = os.path.dirname(os.path.abspath(__file__)); SR = 44100
REFS = sorted(glob.glob(os.path.join(H, "../../../fuentes/lowpolyshorts-style/refs-audio/sep/htdemucs/*/vocals.wav")))


def load(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.float32).copy()


def ltas(x):
    f, P = welch(x, SR, nperseg=8192)
    return f, P / P[(f > 300) & (f < 3000)].mean()             # level-free: normalised on the speech core


f, ref = ltas(np.concatenate([load(p) for p in REFS]))
v = load(os.path.join(H, "voice.wav")); _, ours = ltas(v)
cent = 40 * 2 ** (np.arange(0, 9.2, 1 / 6))                   # 1/6-octave smoothing, 40 Hz .. 22 kHz
g = []
for c in cent:
    m = (f >= c / 2 ** (1 / 12)) & (f < c * 2 ** (1 / 12))
    g.append(10 * np.log10(ref[m].mean() / max(ours[m].mean(), 1e-20)) if m.any() else 0)
g = np.clip(np.array(g), -24, 24)
g[cent > 12000] = np.minimum(g[cent > 12000], g[cent <= 12000][-1])   # our TTS is empty up there: never lift its noise
freq = np.concatenate([[0], cent[cent < SR / 2], [SR / 2]]); gain = np.concatenate([[g[0]], g[cent < SR / 2], [g[cent < SR / 2][-1]]])
fir = firwin2(4097, freq / (SR / 2), 10 ** (gain / 20))
y = fftconvolve(v, fir)[2048:2048 + len(v)]
from scipy.signal import butter, sosfilt                        # user wanted MORE of it: narrower band + light tube grit
y = sosfilt(butter(2, 230, "highpass", fs=SR, output="sos"), y)
y = sosfilt(butter(4, 2900, "lowpass", fs=SR, output="sos"), y)
y = np.tanh(2.2 * y / np.abs(y).max()) / np.tanh(2.2)
y *= np.sqrt((v ** 2).mean() / (y ** 2).mean())               # same loudness, the mix sets the level
import wave
with wave.open(os.path.join(H, "voice_retro.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(y / max(1, np.abs(y).max() / 0.98), -1, 1) * 32767).astype(np.int16).tobytes())
print("EQ dB @", {int(c): round(x, 1) for c, x in zip(cent[::6], g[::6])})
