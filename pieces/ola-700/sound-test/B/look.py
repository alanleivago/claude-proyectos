# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "matplotlib"]
# ///
"""look.py out.png file[:start:dur] ... — level curve + spectrogram of a stretch of each recording."""
import subprocess, sys, os
import numpy as np
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
SR = 16000
items = sys.argv[2:]
fig, ax = plt.subplots(len(items), 2, figsize=(14, 1.3 * len(items) + 0.3), squeeze=False, gridspec_kw=dict(width_ratios=[1, 3]))
for row, it in zip(ax, items):
    f, s, d = (it.split("|") + ["0", "45"])[:3]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", s, "-t", d, "-i", f, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float)
    if len(x) < SR: row[0].set_title(f"{os.path.basename(f)} EMPTY", fontsize=7); continue
    n = SR // 10; L = 20 * np.log10(np.sqrt(np.mean(x[: len(x) // n * n].reshape(-1, n) ** 2, axis=1)) + 1e-9)
    row[0].plot(np.arange(len(L)) / 10 + float(s), L, lw=0.7); row[0].set_ylim(-70, 0); row[0].tick_params(labelsize=6)
    row[0].set_title(f"{os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(f))))}/{os.path.basename(f)}  {s}+{d}s  median {np.median(L):.0f} dB", fontsize=7, loc="left")
    row[1].specgram(x, NFFT=1024, Fs=SR, noverlap=512, cmap="magma", vmin=-130); row[1].set_ylim(0, 8000); row[1].tick_params(labelsize=6)
fig.tight_layout(); fig.savefig(sys.argv[1], dpi=70)
print(sys.argv[1])
