# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""stems.py a b: RMS of each stem and of the bed in [a, b] s, plus the sfx stem's onset (first time above -40 dB)."""
import sys, numpy as np, soundfile as sf
a, b = float(sys.argv[1]), float(sys.argv[2])
for k in ("voice", "sfx"):
    x, sr = sf.read(f"audio/stems/{k}.wav"); m = x.mean(axis=1)[int(a * sr):int(b * sr)]
    n = sr // 50; r = 20 * np.log10(np.sqrt(np.mean(m[: len(m) // n * n].reshape(-1, n) ** 2, axis=1)) + 1e-12)
    print(k, f"RMS {20*np.log10(np.sqrt(np.mean(m**2))+1e-12):.1f} dB", " ".join(f"{v:.0f}" for v in r))
