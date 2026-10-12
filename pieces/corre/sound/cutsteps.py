# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""cutsteps.py in.mp3 outdir: find the footfalls in a running recording and save each as stepNN.wav (from 10 ms before its peak, 0.22 s)."""
import subprocess, sys, os, numpy as np, soundfile as sf
SR = 48000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).astype(float); n = int(0.005 * SR)
env = np.sqrt(np.convolve(x * x, np.ones(n) / n, mode="same")); thr = env.max() * 0.35; peaks = []; i = 0
while i < len(env):
    if env[i] > thr:
        j = i + int(np.argmax(env[i:i + int(0.08 * SR)])); peaks.append(j); i = j + int(0.18 * SR)
    else: i += 1
os.makedirs(sys.argv[2], exist_ok=True); k = 0
for p in peaks:
    a = max(0, p - int(0.01 * SR)); y = x[a:a + int(0.22 * SR)].copy()
    if len(y) < int(0.2 * SR): continue
    f = int(0.06 * SR); y[-f:] *= np.linspace(1, 0, f); y[:48] *= np.linspace(0, 1, 48); y /= np.abs(y).max() + 1e-9; y *= 0.7
    k += 1; sf.write(os.path.join(sys.argv[2], f"step{k:02d}.wav"), y.astype(np.float32), SR)
print(k, "steps at", [round(p / SR, 2) for p in peaks])
