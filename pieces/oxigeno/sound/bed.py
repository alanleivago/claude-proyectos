# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""Build an ambience bed from recordings: bed.py layers.json out.wav
Each layer: {"file", "t0", "t1", "src": offset s, "g": [[t, dB], ...], "pan", "hp", "lp", "loop"}.
Gain points are linear in dB between points; edges fade 50 ms. Loops with a 0.5 s crossfade when the file is short."""
import json, subprocess, sys
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000

def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)

def fill(x, n, loop):
    if len(x) >= n or not loop: return x[:n]
    xf = int(0.5 * SR); out = x.copy()
    while len(out) < n:
        r = np.linspace(0, 1, xf)[:, None]
        out = np.vstack([out[:-xf], out[-xf:] * (1 - r) + x[:xf] * r, x[xf:]])
    return out[:n]

C = json.load(open(sys.argv[1])); T = C["duration_s"]; N = int(T * SR)
mix = np.zeros((N, 2)); cache = {}
for L in C["layers"]:
    if L["file"] not in cache: cache[L["file"]] = load(L["file"])
    x = cache[L["file"]]; s0 = int(L.get("src", 0) * SR) % max(1, len(x)); x = np.vstack([x[s0:], x[:s0]]) if L.get("loop", True) else x[s0:]
    a, b = int(L["t0"] * SR), min(N, int(L["t1"] * SR)); y = fill(x, b - a, L.get("loop", True)).copy()
    if L.get("hp"): y = signal.sosfilt(signal.butter(2, L["hp"], "highpass", fs=SR, output="sos"), y, axis=0)
    if L.get("lp"): y = signal.sosfilt(signal.butter(2, L["lp"], "lowpass", fs=SR, output="sos"), y, axis=0)
    y = y / (np.sqrt(np.mean(y ** 2)) + 1e-12) * 10 ** (-20 / 20)          # every layer to -20 dBFS RMS, then its gain points
    pts = np.array(L["g"], float); tt = (a + np.arange(len(y))) / SR
    g = 10 ** (np.interp(tt, pts[:, 0], pts[:, 1]) / 20)
    f = min(int(0.05 * SR), len(y) // 2); g[:f] *= np.linspace(0, 1, f); g[len(g) - f:] *= np.linspace(1, 0, f)
    p = L.get("pan", 0.0); th = (p + 1) * np.pi / 4
    y = y * g[:, None]; mix[a:a + len(y), 0] += y[:, 0] * np.cos(th) * 1.414; mix[a:a + len(y), 1] += y[:, 1] * np.sin(th) * 1.414
sf.write(sys.argv[2], mix.astype(np.float32), SR, subtype="FLOAT")
print(sys.argv[2], f"peak {20*np.log10(np.abs(mix).max()+1e-12):.1f} dBFS")
