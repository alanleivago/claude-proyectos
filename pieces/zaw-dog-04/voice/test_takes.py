"""venv: which takes survive the retro EQ? Each candidate -> atempo 1.1 -> the same retro chain as retro_eq.py (FIR matched
on the current full voice) -> Whisper small.en + medium.en.   python voice/test_takes.py l11_a l11_b ..."""
import glob, os, subprocess, sys
import numpy as np
from scipy.signal import welch, firwin2, fftconvolve, butter, sosfilt
from faster_whisper import WhisperModel
V = os.path.dirname(os.path.abspath(__file__)); SR = 44100
REFS = sorted(glob.glob(os.path.join(V, "../../../fuentes/lowpolyshorts-style/refs-audio/sep/htdemucs/*/vocals.wav")))
def load(p, tempo=1.0, sr=SR):
    af = ["-af", f"atempo={tempo}"] if tempo != 1.0 else []
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p] + af + ["-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.float32).copy()
def ltas(x):
    f, P = welch(x, SR, nperseg=8192); return f, P / P[(f > 300) & (f < 3000)].mean()
f, ref = ltas(np.concatenate([load(p) for p in REFS])); _, ours = ltas(load(os.path.join(V, "voice.wav")))
cent = 40 * 2 ** (np.arange(0, 9.2, 1 / 6)); g = []
for c in cent:
    m = (f >= c / 2 ** (1 / 12)) & (f < c * 2 ** (1 / 12)); g.append(10 * np.log10(ref[m].mean() / max(ours[m].mean(), 1e-20)) if m.any() else 0)
g = np.clip(np.array(g), -24, 24); g[cent > 12000] = np.minimum(g[cent > 12000], g[cent <= 12000][-1])
freq = np.concatenate([[0], cent[cent < SR / 2], [SR / 2]]); gain = np.concatenate([[g[0]], g[cent < SR / 2], [g[cent < SR / 2][-1]]])
fir = firwin2(4097, freq / (SR / 2), 10 ** (gain / 20))
def retro(v):
    y = fftconvolve(v, fir)[2048:2048 + len(v)]
    y = sosfilt(butter(2, 230, "highpass", fs=SR, output="sos"), y); y = sosfilt(butter(4, 2900, "lowpass", fs=SR, output="sos"), y)
    return np.tanh(2.2 * y / np.abs(y).max()) / np.tanh(2.2)
ms = {n: WhisperModel(n, compute_type="int8") for n in ("small.en", "medium.en")}
for name in sys.argv[1:]:
    x = retro(load(os.path.join(V, "takes", f"{name}.wav"), 1.1)); x16 = np.interp(np.arange(0, len(x), SR / 16000), np.arange(len(x)), x).astype(np.float32)
    x16 = np.concatenate([np.zeros(4000, np.float32), x16 * 0.6])
    print(name, f"{len(x) / SR:.2f}s", " | ".join(f"{k}: " + " ".join(s.text for s in m.transcribe(x16, language="en", beam_size=5)[0]).strip() for k, m in ms.items()))
