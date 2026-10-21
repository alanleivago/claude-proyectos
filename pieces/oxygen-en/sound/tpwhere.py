# /// script
# dependencies = ["numpy", "scipy"]
# ///
"""tpwhere.py file: the 8 loudest 4x-oversampled peaks of an audio/video file (decoded by ffmpeg), with times."""
import subprocess, sys, numpy as np
from scipy import signal
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-vn", "-ac", "2", "-ar", "48000", "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2).mean(1)
o = np.abs(signal.resample_poly(x, 4, 1)); blk = 4 * 4800; n = len(o) // blk
pk = o[: n * blk].reshape(n, blk).max(1); idx = np.argsort(pk)[::-1][:8]
print(" ".join(f"{i * 0.1:.1f}s:{20 * np.log10(pk[i] + 1e-9):.1f}dB" for i in sorted(idx)))
