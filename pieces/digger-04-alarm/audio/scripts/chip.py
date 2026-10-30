# chip.py — NES-style chiptune synthesis (pulse 12.5/25/50 %, 4-bit triangle, LFSR noise), all original code.
# Used by music.py (the bed) and sfx_chip.py (stingers, blips, pops). 44.1 kHz mono float.
import numpy as np
SR = 44100

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)

def env(n, a=0.004, d=0.08, s=0.6, r=0.05, hold=None):
    """ADSR in seconds -> array of n samples (hold = seconds before release, default n - r)"""
    t = np.arange(n) / SR; hold = (n / SR - r) if hold is None else hold
    e = np.where(t < a, t / max(a, 1e-6), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-6), s))
    rel = np.clip((t - hold) / max(r, 1e-6), 0, 1); return e * (1 - rel)

def pulse(freq, n, duty=0.25, vib=0.0, vib_hz=5.5, slide=None):
    """freq Hz (scalar or array) -> naive pulse (chip aliasing on purpose; music.py low-passes the mix a bit)"""
    f = np.full(n, float(freq)) if np.isscalar(freq) else freq
    if slide is not None: f = f * 2 ** (np.linspace(0, slide, n) / 12)
    if vib: f = f * 2 ** (vib * np.sin(2 * np.pi * vib_hz * np.arange(n) / SR) / 12)
    ph = np.cumsum(f) / SR % 1.0
    return np.where(ph < duty, 1.0, -1.0) * 0.5

def tri(freq, n, slide=None):
    f = np.full(n, float(freq)) if np.isscalar(freq) else freq
    if slide is not None: f = f * 2 ** (np.linspace(0, slide, n) / 12)
    ph = np.cumsum(f) / SR % 1.0
    x = 1 - 4 * np.abs(ph - 0.5)                     # -1..1 triangle
    return np.round(x * 7.5) / 7.5 * 0.55            # 4-bit steps like the 2A03

_LFSR = {}
def noise(n, period=1, short=False, seed=1):
    """2A03-style LFSR noise; period = samples per step (higher = darker)"""
    key = (short,)
    if key not in _LFSR:
        r, out = 1, np.empty(32767, np.float32)
        tap = 6 if short else 1
        for i in range(32767):
            b = (r ^ (r >> tap)) & 1; r = (r >> 1) | (b << 14); out[i] = 1.0 if r & 1 else -1.0
        _LFSR[key] = out
    seq = _LFSR[key]; idx = (np.arange(n) // max(1, int(period)) + seed * 977) % len(seq)
    return seq[idx] * 0.45

def kick(n=int(0.16 * SR)):
    f = 110 * 2 ** (-np.linspace(0, 3.2, n)); return tri(f, n) * env(n, 0.001, 0.12, 0.0, 0.02) * 1.6

def snare(n=int(0.14 * SR)): return (noise(n, 2) * 0.9 + tri(190, n) * 0.4) * env(n, 0.001, 0.1, 0.0, 0.02)

def hat(n=int(0.045 * SR)): return noise(n, 1, short=False, seed=5) * env(n, 0.0005, 0.035, 0.0, 0.005) * 0.55

def place(buf, x, at):
    i = int(round(at * SR))
    if i >= len(buf) or i + len(x) <= 0: return
    j0 = max(0, -i); i0 = max(0, i); k = min(len(x) - j0, len(buf) - i0)
    buf[i0:i0 + k] += x[j0:j0 + k]

def lowpass(x, fc):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, fc / (SR / 2), output="sos"), x)

def highpass(x, fc):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, fc / (SR / 2), btype="high", output="sos"), x)
