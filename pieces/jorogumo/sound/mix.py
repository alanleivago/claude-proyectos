# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the whole sound for jorogumo in one pass: recorded beds (Wikimedia Commons, CC0 / public domain, see CREDITS.md),
recorded hits placed on the picture, and a code-made layer (temple bell, drones, the thread hum, the reveal hit, the mask
splitting, footsteps, heartbeat). Hard silence 45.0-45.6 s before the reveal; master to -15 LUFS, peaks under -1 dBFS.
Writes audio/mix.wav and audio/levels.txt."""
import subprocess
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal

SR, T = 48000, 75.0; N = int(T * SR); rng = np.random.default_rng(1834)
out = np.zeros((N, 2))
db = lambda x: 10 ** (x / 20)
def load(p, mono=False):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2); return x.mean(1) if mono else x
def filt(x, kind, f, o=2): return signal.sosfilt(signal.butter(o, f, kind, fs=SR, output="sos"), x, axis=0)
def rms(x): return np.sqrt(np.mean(x ** 2)) + 1e-12
def T_(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.01, r=None):
    e = np.minimum(1, np.arange(n) / max(1, a * SR))
    if r: e *= np.exp(-np.arange(n) / (r * SR))
    return e
def put(y, t0, g=0.0, pan=0.0):
    if y.ndim == 1: th = (pan + 1) * np.pi / 4; y = np.stack([y * np.cos(th) * 1.414, y * np.sin(th) * 1.414], 1)
    a = int(t0 * SR); y = y[: max(0, N - a)]; out[a:a + len(y)] += y * db(g)
# a recorded bed between t0 and t1, normalised to -20 dBFS RMS, gain points [[t, dB]], optional filters, looped
def bed(f, t0, t1, pts, src=0.0, hp=None, lp=None):
    x = load("rec/" + f); s = int(src * SR) % len(x); x = np.vstack([x[s:], x[:s]]); n = int((t1 - t0) * SR)
    while len(x) < n: x = np.vstack([x, x])
    y = x[:n].copy()
    if hp: y = filt(y, "highpass", hp)
    if lp: y = filt(y, "lowpass", lp)
    y = y / rms(y) * db(-20); tt = t0 + np.arange(n) / SR; P = np.array(pts, float)
    gg = db(np.interp(tt, P[:, 0], P[:, 1])); fd = min(int(0.05 * SR), n // 2); gg[:fd] *= np.linspace(0, 1, fd); gg[-fd:] *= np.linspace(1, 0, fd)
    put(y * gg[:, None], t0)
# a recorded one-shot: a slice [s, s+d] of a file, peak-normalised to g dBFS, placed so it starts at t
def shot(f, t, g, s=0.0, d=None, hp=None, lp=None, pan=0.0, fade=0.05, rate=1.0):
    x = load("rec/" + f if not f.startswith("own/") else f); a = int(s * SR); y = x[a: a + int(d * SR)] if d else x[a:]
    if rate != 1.0: y = signal.resample(y, int(len(y) / rate))
    if hp: y = filt(y, "highpass", hp)
    if lp: y = filt(y, "lowpass", lp)
    fd = min(int(fade * SR), len(y) // 2); y = y.copy(); y[-fd:] *= np.linspace(1, 0, fd)[:, None]; y[:64] *= np.linspace(0, 1, 64)[:, None]
    y = y / (np.abs(y).max() + 1e-9) * db(g)
    if pan: th = (pan + 1) * np.pi / 4; y = y * np.array([np.cos(th), np.sin(th)]) * 1.414
    put(y, t)

# ---------------------------------------------------------------- recorded beds
bed("James_River_Rapids_1.ogg", 0, 45.0, [[0, -24], [3.8, -24], [4.5, -40], [8.6, -40], [9.2, -18], [27, -18], [36, -17], [43.5, -19], [45.0, -60]], src=20, lp=2400)
bed("James_River_Rapids_1.ogg", 45.6, 75, [[45.6, -19], [56, -19], [56.4, -32], [61.6, -32], [61.8, -40], [66, -40], [66.2, -22], [73.5, -24], [75, -60]], src=140, lp=2600)
bed("Howling_wind.ogg", 0, 4.6, [[0, -30], [4.6, -40]], src=10, lp=1500)
for k in range(5): shot("Jer-Cricket.ogg", 0.3 + k * 0.85, -34, pan=0.4)
bed("Cicada_20200619.wav", 9.0, 22.7, [[9, -22], [18, -22], [21.6, -26], [22.5, -26]], src=4, hp=1200)
bed("Leaves_falling_from_the_trees_during_autumn_in_the_forest.wav", 9.0, 36, [[9, -30], [36, -32]], src=40)
bed("Dawnchorus-uk.ogg", 9.0, 18, [[9, -33], [18, -36]], src=900, lp=6000)
bed("Hemlock_stream.ogg", 9.0, 44.5, [[9, -32], [44.5, -32]], lp=3000)
bed("Walk_in_the_rainforest.ogg", 61.6, 66, [[61.6, -26], [66, -28]], src=3, lp=3500)
bed("Dawnchorus-uk.ogg", 66.0, 75, [[66, -24], [72, -24], [74.6, -50]], src=1600, lp=7000)
bed("Heavy_breathing_2.ogg", 61.6, 66, [[61.6, -18], [66, -20]], src=12)

# ---------------------------------------------------------------- recorded hits
for t in (27.82, 28.66):   # the axe through the threads into the stump
    shot("Dull_thud.ogg", t, -8, lp=3000); shot("Bones_breaking_wood_fire_ice_crackling.ogg", t + 0.01, -14, s=6.2, d=0.25, hp=800)
shot("Creaky_wooden_casket.ogg", 31.7, -22, rate=0.7, lp=3000); shot("Creaky_wooden_casket.ogg", 33.6, -24, rate=0.6, lp=2500)
shot("Creaky_wooden_casket.ogg", 37.2, -16, rate=0.55); shot("Creaky_wooden_casket.ogg", 37.9, -14, rate=0.45)
shot("Earthquake.ogg", 37.0, -16, s=40, d=4.0, lp=400)
shot("Bones_breaking_wood_fire_ice_crackling.ogg", 38.6, -6, s=20.0, d=1.6, hp=200)   # the roots snap
shot("Dull_thud.ogg", 38.6, -5, lp=1200, rate=0.6)
shot("Bathtub_water_splashes.ogg", 40.5, -6, s=2.0, d=1.6, lp=6000)                  # in
shot("Water_bubbles_chortling.ogg", 41.0, -20, s=5, d=3.2, lp=2500)
shot("own/whisper.aiff", 58.7, -10, hp=300, rate=0.92)
shot("Bones_breaking_wood_fire_ice_crackling.ogg", 59.4, -8, s=31.0, d=0.9, hp=300)  # the mask splits
for t in (67.6, 69.3, 71.0): shot("Holga_shuttersound.ogg", t, -20, d=0.4, pan=0.5)

# ---------------------------------------------------------------- the code layer
def bell(f0, d, partials=((1, 1), (2.76, 0.5), (5.40, 0.25), (8.93, 0.12), (0.5, 0.6))):
    tt = T_(d); return sum(a * np.sin(2 * np.pi * f0 * r * tt * (1 + 0.0007 * np.sin(2 * np.pi * 3 * tt))) * np.exp(-tt / (d / (1 + r * 0.6))) for r, a in partials) * env(len(tt), 0.004)
def boom(f0, d, drop=0.5):
    tt = T_(d); f = f0 * (1 - drop * (1 - np.exp(-tt / 0.15))); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt / (d * 0.35)) * env(len(tt), 0.003)
def noise(d): return rng.standard_normal(int(d * SR))
def brown(d): x = np.cumsum(rng.standard_normal(int(d * SR))); x = signal.lfilter([1, -1], [1, -0.995], x); return x / (np.abs(x).max() + 1e-9)
def drone(t0, t1, f0, g, pts=None, beat=0.3, lp=900):
    d = t1 - t0; tt = T_(d); y = sum(np.sin(2 * np.pi * f0 * m * tt + m) * a for m, a in ((1, 1), (1.5, 0.4), (2.01, 0.3), (3.0, 0.12)))
    y *= 0.8 + 0.2 * np.sin(2 * np.pi * beat * tt); y = filt(y + 0.15 * brown(d), "lowpass", lp)
    P = np.array(pts or [[t0, 0], [t1, 0]], float); gg = db(np.interp(t0 + tt, P[:, 0], P[:, 1]))
    fd = int(0.8 * SR); gg[:fd] *= np.linspace(0, 1, fd); gg[-fd:] *= np.linspace(1, 0, fd)
    put(y / rms(y) * db(g) * gg, t0)
# night drone under the oath; the card's temple bell and a low drum
drone(0, 9.0, 55, -30, [[0, -6], [4.5, 0], [9, -10]])
put(bell(110, 7.0) * db(-9), 4.55, pan=-0.1); put(boom(70, 2.5, 0.4) * db(-6), 4.55)
# the thread: a thin glassy hum that rises while he wakes and ties them (18-45)
def hum(t0, t1, g, pts):
    d = t1 - t0; tt = T_(d); y = sum(np.sin(2 * np.pi * f * tt + 0.7 * np.sin(2 * np.pi * 5.3 * tt + f)) for f in (1760, 1763.5, 2637, 3520.8)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.9 * tt))
    P = np.array(pts, float); gg = db(np.interp(t0 + tt, P[:, 0], P[:, 1])); fd = int(0.5 * SR); gg[:fd] *= np.linspace(0, 1, fd); gg[-fd:] *= np.linspace(1, 0, fd)
    put(y / rms(y) * db(g) * gg, t0, pan=0.15)
hum(15.0, 44.9, -36, [[15, -12], [18.4, -4], [22.6, 0], [27, -2], [36, 2], [38.6, 6], [44.6, 0]])
drone(18.0, 45.0, 49, -30, [[18, -10], [27, -4], [36, 0], [44, 2]], beat=0.25)
# the stump dragged: a gravelly scrape 38.6-40.5
y = filt(noise(1.9), "bandpass", [300, 2500]) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * T_(1.9)))) * np.linspace(1, 0.4, int(1.9 * SR)); put(y / rms(y) * db(-20), 38.6, pan=-0.2)
put(boom(45, 2.0, 0.3) * db(-8), 40.5)
# THE REVEAL (45.6): sub drop, a dissonant cluster, a cracked temple bell, after 0.6 s of nothing
put(boom(52, 5.0, 0.5) * db(0), 45.6)
tt = T_(7.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (233.1, 246.9, 261.6, 349.2, 370.0, 493.9)) * np.exp(-tt / 2.8) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 3000) * db(-10), 45.6, pan=0.1); put(bell(87, 9.0) * db(-6), 45.62, pan=-0.15)
y = filt(noise(1.2), "highpass", 2000) * np.exp(-T_(1.2) / 0.25); put(y / np.abs(y).max() * db(-12), 45.6)
drone(45.6, 61.6, 41, -26, [[45.6, 2], [56, 0], [58.6, -4], [59.4, 4], [61.6, 2]], beat=0.5, lp=700)
# the close-up: a low breath of wind; the split: a wet crack and a skittering chitter
put(filt(brown(3.0), "lowpass", 500) * db(-18), 56.2)
y = filt(noise(0.35), "bandpass", [200, 1800]) * np.exp(-T_(0.35) / 0.06); put(y / np.abs(y).max() * db(-6), 59.4)
for k in range(70):
    tk = 59.5 + k * 0.03 + rng.random() * 0.012; y = filt(noise(0.012), "bandpass", [2500, 7000]) * np.hanning(int(0.012 * SR)); put(y / np.abs(y).max() * db(-16 + 6 * np.sin(np.pi * k / 70)), tk, pan=rng.uniform(-0.5, 0.5))
put(boom(60, 2.4, 0.3) * db(-8), 59.4)
# the run: footsteps on gravel and a racing heart
for k, t in enumerate(np.arange(61.7, 66.0, 0.31)):
    y = filt(noise(0.09), "bandpass", [500, 5000]) * np.exp(-T_(0.09) / 0.025); put(y / np.abs(y).max() * db(-14), t, pan=0.3 * (1 if k % 2 else -1))
for t in np.arange(61.7, 66.0, 0.42):
    for dt, g in ((0, -12), (0.13, -16)): put(boom(48, 0.25, 0.2) * db(g), t + dt)
# dawn: a soft high bell for the glinting thread, then the last bell under the fade
put(bell(880, 3.0, ((1, 1), (2.76, 0.3), (5.4, 0.1))) * db(-26), 70.2, pan=0.3)
put(bell(110, 6.0) * db(-18), 72.8)

# ---------------------------------------------------------------- master
a, b, f = int(45.0 * SR), int(45.6 * SR), int(0.01 * SR)
out[a - f:a] *= np.linspace(1, 0, f)[:, None]; out[a:b] = 0
tail = np.interp(np.arange(N) / SR, [0, 74.0, 75.0], [1, 1, 0]); out *= tail[:, None]
meter = pyln.Meter(SR); L = meter.integrated_loudness(out); out *= db(-14 - L)
pk = np.abs(out).max(); lim = db(-2.0)
if pk > lim:   # soft-knee limiter on the few peaks above -1 dBFS
    g = np.minimum(1, lim / (np.abs(out).max(1) + 1e-9))
    g = np.minimum.reduce([np.roll(g, s) for s in range(-240, 241, 24)]); out *= g[:, None]
L2 = meter.integrated_loudness(out)
sf.write("audio/mix.wav", out.astype(np.float32), SR, subtype="FLOAT")
w = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1); i = int(np.argmax(w))
rep = f"LUFS {L2:.1f}  peak {20 * np.log10(np.abs(out).max()):.1f} dBFS  loudest 100 ms at {i * 0.05:.2f} s ({10 * np.log10(w[i]):.1f} dBFS)  silence 45.0-45.6 max {np.abs(out[a:b]).max():.2e}"
open("audio/levels.txt", "w").write(rep + "\n"); print(rep)
