# music.py: an original suspense bed for the space part (no themes copied): pipe-organ drones on G, a slow repeating organ
# ostinato in G minor, swelling cello sections and ticking, all from real CC0 / CC BY recordings (assets/organ), pitched and
# arranged in code, through a long synthetic hall reverb. Quiet from ~95 s, building and predominant from 343 s to the end.
#   usage: F:/earshot/.venv/Scripts/python.exe -I tools/music.py   -> work/music.wav (48 kHz stereo, 510 s, pre-master)
import os, numpy as np, soundfile as sf
from scipy import signal
SR = 48000; N = int(510 * SR)
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def db(x): return 10 ** (x / 20)
def load(f):
    x, sr = sf.read(os.path.join(A, "assets", "organ", f), dtype="float64", always_2d=True)
    if x.shape[1] == 1: x = np.repeat(x, 2, 1)
    if sr != SR: x = signal.resample_poly(x, SR, sr, axis=0)
    return x[:, :2]
def find(fid): return next(n for n in os.listdir(os.path.join(A, "assets", "organ")) if n.startswith(fid + "_"))
def env(t, pts):
    v = np.interp(t, [p[0] for p in pts], [p[1] for p in pts]); g = db(v); g[v <= -90] = 0; return g
def pitch(x, ratio): return signal.resample(x, max(16, int(len(x) / ratio)), axis=0)
out = {k: np.zeros((N, 2)) for k in ("drone", "ost", "cello", "tick")}
def put(bus, x, t):
    i0 = int(t * SR); i1 = min(N, i0 + len(x)); out[bus][i0:i1] += x[: i1 - i0]
def loop(x, t0, t1, xf=3.0):
    L = int((t1 - t0) * SR); n = int(xf * SR); y = np.zeros((L, 2)); pos = 0; w = np.linspace(0, 1, n)[:, None]
    while pos < L:
        s = x.copy(); s[:n] *= w if pos else 1; s[-n:] *= w[::-1]; m = min(len(s), L - pos); y[pos:pos + m] += s[:m]; pos += len(s) - n
    return y
T = np.arange(N) / SR

# ---- drones: the G1 and G3 organ pads, looped, under the whole space part
g1 = load(find("fs-78194")); g3 = load(find("fs-78196"))
for x, pk in ((g1, 0.0), (g3, -5.0)):
    y = loop(x / np.max(np.abs(x)) * db(pk), 95, 510); put("drone", y, 95)
out["drone"] *= env(T, [[0, -90], [95, -40], [112, -10], [140, -8], [262, -7], [324.9, -5], [325.05, -90], [330, -90], [343, -14], [400, -6], [460, -2], [480, -3], [497, -10], [509.8, -90]])[:, None]
# ---- the ostinato: organ grains pitched to a four-note figure (G - D - Bb - D, then G - Eb - C - Eb), 70 BPM eighths
org = load(find("fs-784109")); org = org[int(1.0 * SR):int(1.9 * SR)]; org /= np.max(np.abs(org))
E8 = 60 / 70 / 2
FIG = [[1, 1.4983, 1.1892, 1.4983], [1, 1.5874, 1.3348, 1.5874], [1, 1.4983, 1.1892, 1.4983], [0.8909, 1.3348, 1.1892, 1.3348]]
grain_cache = {}
def grain(r):
    if r not in grain_cache:
        g = pitch(org, r)[: int(0.75 * SR)].copy(); n = len(g); e = np.ones(n); a = int(0.012 * SR); e[:a] = np.linspace(0, 1, a); rel = int(0.35 * SR)
        e[-rel:] *= np.linspace(1, 0, rel) ** 1.5; grain_cache[r] = g * e[:, None]
    return grain_cache[r]
k = 0; t = 150.0
while t < 497:
    bar = k // 8; fig = FIG[bar % 4]; note = fig[(k // 2) % 4] if t < 265 else fig[k % 4]
    if t < 265 and k % 2: k += 1; t += E8; continue          # sparse quarters in the cruise
    if 324.8 < t < 343: k += 1; t += E8; continue           # out for the hit and the first quiet of the starbow
    acc = 1.0 if k % 8 == 0 else 0.8
    put("ost", grain(note) * acc, t); k += 1; t += E8
out["ost"] *= env(T, [[150, -20], [200, -17], [265, -14], [324.7, -9], [325, -90], [343, -20], [380, -10], [440, -4], [470, -2], [488, -10], [497, -40]])[:, None]
# ---- cello sections: slow swells on G2, D3, Bb2 from the starbow on (and two early ones under the cruise)
cel = load(find("fs-372839")); cel = cel[int(0.8 * SR):int(10.5 * SR)]; cel /= np.max(np.abs(cel))
def swell(t, r, dur=8.0, pk=0.0):
    x = pitch(cel, r); x = loop(x, 0, dur, 1.5) if len(x) < dur * SR else x[: int(dur * SR)].copy(); n = len(x); tt = np.arange(n) / SR
    e = np.minimum(1, tt / 3.0) * np.minimum(1, (dur - tt) / 3.0); put("cello", x * e[:, None] * db(pk), t)
for t0, r in ((205, 1.0), (285, 1.4983)): swell(t0, r, 9, -8)
seq = [1.0, 1.4983, 1.1892, 1.3348, 1.0, 1.4983, 0.8909, 1.0]
for i, t0 in enumerate(np.arange(343, 492, 7.0)): swell(t0, seq[i % len(seq)], 9.5, -2 if t0 > 420 else -6)
out["cello"] *= env(T, [[200, -10], [330, -10], [343, -8], [420, 0], [480, 0], [497, -30]])[:, None]
# ---- ticking: a clock, quiet in the cruise, closer in the galaxy act
tk = load(find("fs-78563")); tk = signal.sosfilt(signal.butter(2, 900, "high", fs=SR, output="sos"), tk, axis=0); tk /= np.max(np.abs(tk))
put("tick", loop(tk, 150, 325, 1.0), 150); put("tick", loop(tk, 343, 494, 1.0), 343)
out["tick"] *= env(T, [[150, -34], [200, -30], [262, -26], [324.7, -22], [325, -90], [343, -26], [420, -18], [470, -16], [492, -30], [494, -90]])[:, None]
# ---- the hall: a long synthetic stereo reverb on everything but the ticks
r = np.random.default_rng(70); n = int(4.2 * SR); tt = np.arange(n) / SR
ir = np.stack([r.standard_normal(n), r.standard_normal(n)], 1) * np.exp(-tt * 1.65)[:, None]; ir = signal.sosfilt(signal.butter(2, 5500, "low", fs=SR, output="sos"), ir, axis=0); ir /= np.sqrt(np.sum(ir ** 2, 0))
mus = out["drone"] + out["ost"] * 0.9 + out["cello"]
wet = np.stack([signal.oaconvolve(mus[:, c], ir[:, c])[:N] for c in range(2)], 1)
mix = mus * 0.55 + wet * 0.8 + out["tick"]
mix = signal.sosfilt(signal.butter(2, 35, "high", fs=SR, output="sos"), mix, axis=0)
mix /= np.max(np.abs(mix)) + 1e-12
sf.write(os.path.join(A, "work", "music.wav"), (mix * 0.9).astype(np.float32), SR, subtype="FLOAT")
print("music.wav written")
