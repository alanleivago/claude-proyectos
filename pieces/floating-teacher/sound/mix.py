# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the whole sound for floating-teacher in one pass: recorded beds (Wikimedia Commons, CC0 / public domain, see CREDITS.md),
recorded hits placed on the picture, and a code-made layer (temple bell, drones, the thread hum, the reveal hit, the mask
splitting, footsteps, heartbeat). Hard silence 45.0-45.6 s before the reveal; master to -15 LUFS, peaks under -1 dBFS.
Writes audio/mix.wav and audio/levels.txt."""
import subprocess
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal

SR, T = 48000, 71.0; N = int(T * SR); rng = np.random.default_rng(1834)
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
    x = load(f if f.startswith("fs/") else "rec/" + f); s = int(src * SR) % len(x); x = np.vstack([x[s:], x[:s]]); n = int((t1 - t0) * SR)
    while len(x) < n: x = np.vstack([x, x])
    y = x[:n].copy()
    if hp: y = filt(y, "highpass", hp)
    if lp: y = filt(y, "lowpass", lp)
    y = y / rms(y) * db(-20); tt = t0 + np.arange(n) / SR; P = np.array(pts, float)
    gg = db(np.interp(tt, P[:, 0], P[:, 1])); fd = min(int(0.05 * SR), n // 2); gg[:fd] *= np.linspace(0, 1, fd); gg[-fd:] *= np.linspace(1, 0, fd)
    y = y * gg[:, None]; y[:, 1] = np.roll(y[:, 1], int(0.013 * SR)); y[:, 0] *= 1.2; y[:, 1] *= 0.8
    put(y, t0)
# a recorded one-shot: a slice [s, s+d] of a file, peak-normalised to g dBFS, placed so it starts at t
def shot(f, t, g, s=0.0, d=None, hp=None, lp=None, pan=0.0, fade=0.05, rate=1.0):
    x = load(f if f.startswith(("own/", "fs/")) else "rec/" + f); a = int(s * SR); y = x[a: a + int(d * SR)] if d else x[a:]
    if rate != 1.0: y = signal.resample(y, int(len(y) / rate))
    if hp: y = filt(y, "highpass", hp)
    if lp: y = filt(y, "lowpass", lp)
    fd = min(int(fade * SR), len(y) // 2); y = y.copy(); y[-fd:] *= np.linspace(1, 0, fd)[:, None]; y[:64] *= np.linspace(0, 1, 64)[:, None]
    y = y / (np.abs(y).max() + 1e-9) * db(g)
    if pan: th = (pan + 1) * np.pi / 4; y = y * np.array([np.cos(th), np.sin(th)]) * 1.414
    put(y, t)

# ---------------------------------------------------------------- picks (Freesound CC0 via earshot, picks.json) + Commons (rec/)
import json as _j
PK = {k: v["file"] for k, v in _j.load(open("picks.json")).items()}
CHALKDROP = "fs/pencil_drop/451649_pencil_drop_wav.mp3"
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
def pick(k, i=0): return PK[k]
BREATH, CRACK, CREAK, FLOOR = PK["heavy_breathing_wet"], PK["neck_crack_bones"], PK["creak_wood"], PK["wooden_floor_creak"]
CHALK, SCREECH, GASP = PK["chalk"], PK["screech_chalkboard"], PK["gasp_scared"]

# ---- beds: rain on the windows + the tin roof (all the way, except the hard silence), a quiet classroom room tone, wind at the end
bed(PK["rain_window"], 0, 64.6, [[0, -24], [4.4, -24], [4.6, -40], [8.7, -40], [9.2, -17], [18, -18], [27, -21], [36, -20], [44.2, -26], [44.9, -50], [45.6, -30], [55, -30], [64.6, -34]], src=20)
bed(PK["rain_tin_roof"], 0, 64.6, [[0, -27], [4.4, -27], [4.6, -44], [8.7, -44], [9.2, -21], [18, -22], [27, -26], [44.2, -25], [44.9, -55], [45.6, -32], [64.6, -36]], src=60, lp=6000)
bed(PK["classroom_ambience_quiet"], 9.0, 19.8, [[9, -26], [19.5, -30], [19.8, -60]], src=10)
bed(PK["wind_empty_building"], 63.8, 71, [[63.8, -40], [64.6, -30], [70, -31], [71, -60]], src=20, lp=4000)
bed("Rain_against_the_window.ogg", 64.2, 71, [[64.2, -45], [65, -36], [70.5, -38], [71, -60]], src=10)

# ---- the clock: a tick every second from 9 s; louder in its own shot (40.5-45); it stops at 42.6 (last tick 42.0); pendulum tock
TICK, TOCK = PK["clock_ticking"], PK["pendulum_clock_tick_tock"]
tk = _j.load(open("picks.json"))["clock_ticking"]["seg"]; tc = _j.load(open("picks.json"))["pendulum_clock_tick_tock"]["seg"]
for s in range(9, 43):
    g = -26 if s < 40 else -12
    if s in range(19, 27): g = -27          # in the silence after she stops, the tick is louder
    if s >= 36 and s < 40: g = -26
    shot(TICK, s + 0.0, g, s=tk[0], d=0.22, hp=500, pan=0.35); 
    if s >= 40: shot(TOCK, s + 0.5, -18, s=tc[0], d=0.2, hp=200, pan=0.35)
shot(TOCK, 42.6, -14, s=tc[0], d=0.25, hp=150, rate=0.8, pan=0.35)    # the last half-swing, then nothing

# ---- chalk: taps and strokes while she writes (9.4-12.8 and 14.5-19.6), the stop, the fall and the break
cs = 0.0
for t0, t1, n in [(9.4, 12.8, 15), (14.5, 19.6, 16)]:
    for k, t in enumerate(np.linspace(t0, t1, n)):
        shot(CHALK, t, -27 if t < 18 else -22, s=(k * 0.29) % 5.8, d=0.24, hp=1200, lp=7000, pan=-0.15)
shot(CHALKDROP, 21.62, -10, s=_j.load(open("picks.json")).get("_drop", {}).get("s", 5.176), d=0.6, hp=300)   # hits the platform and breaks
shot(PK["bone_crack"], 21.64, -24, s=2.35, d=0.25, hp=2500)

# ---- the teacher: creaks, neck cracks, wet breathing above
shot(CREAK, 0.25, -9, s=12.5, d=2.4, rate=0.7, lp=3000)                     # hook: the ceiling boards take her weight
shot(BREATH, 0.6, -5, s=9.85, d=3.6, rate=0.85, lp=4000)
shot(CRACK, 2.62, -7, s=0.13, d=0.6)                                          # the head twitches
shot(GASP, 1.6, -18, s=28.66, d=1.2, rate=0.6, lp=2000)                      # a long intake of breath, slowed
shot(FLOOR, 23.6, -18, s=0.13, d=3.0, rate=0.8)                               # the arm drops; the floor creaks
shot(CRACK, 24.4, -14, s=0.13, d=0.6, rate=0.8); shot(CRACK, 25.6, -12, s=0.13, d=0.6, rate=0.7)   # the neck lengthens
shot(BREATH, 25.0, -20, s=9.85, d=2.0, rate=0.7, lp=2500)
shot(FLOOR, 28.2, -9, s=0.13, d=2.6, rate=0.9); shot(PK["shoe"], 29.9, -11, s=28.33, d=1.5, lp=4000, rate=0.7)   # heels rise, slide out
shot(FLOOR, 30.0, -9, s=0.13, d=3.0, rate=0.75)
bed(PK["hair_rustle_fabric"], 30.5, 36.0, [[30.5, -34], [33, -28], [36, -32]], src=20, lp=5000)
shot(CREAK, 32.5, -9, s=12.5, d=3.0, rate=0.6, lp=2500); shot(CREAK, 35.0, -10, s=13.5, d=2.5, rate=0.55, lp=2500)
shot(BREATH, 33.0, -10, s=9.85, d=3.0, rate=0.75, lp=3000)
shot("Heavy_breathing_2.ogg", 36.4, -15, s=10, d=4.0, hp=300, lp=4000, pan=-0.2)   # my mother counting her breaths
shot("Heavy_breathing_2.ogg", 40.4, -17, s=20, d=3.6, hp=300, lp=4000, pan=-0.2)

# ---- the reveal (45.6): the loudest moment after exact silence
shot(CRACK, 45.6, -2, s=0.13, d=0.6, rate=0.6); shot(SCREECH, 45.62, -8, s=0.0, d=1.0, rate=0.5, lp=3500)
shot(BREATH, 46.0, -14, s=9.85, d=4.9, rate=0.75, lp=3500, pan=0.2); shot(BREATH, 50.6, -8, s=9.85, d=4.9, rate=0.7, lp=3000)
shot(CREAK, 47.5, -19, s=12.5, d=3.0, rate=0.6, lp=2500); shot(CRACK, 52.5, -6, s=0.13, d=0.6, rate=0.75)   # the head jerks
shot(BREATH, 53.4, -10, s=9.85, d=2.0, rate=0.65, lp=2500)

# ---- the board writes by itself; the boy; the bell; the empty chair
for k, t in enumerate(np.arange(55.15, 55.9, 0.12)): shot(CHALK, t, -22, s=1.0 + k * 0.4, d=0.14, lp=2500)   # erasing swipes
for k, t in enumerate(np.arange(55.9, 58.9, 0.2)): shot(CHALK, t, -16, s=(k * 0.29) % 5.8, d=0.24, hp=1200, lp=7000, pan=0.1)
shot(SCREECH, 56.2, -16, s=0.0, d=1.0, rate=0.8, hp=1500); shot(SCREECH, 57.6, -18, s=0.2, d=0.8, rate=0.7, hp=1500)
shot(BREATH, 59.5, -12, s=9.85, d=2.4, rate=0.7, lp=3000)
shot(GASP, 60.6, -8, s=28.66, d=1.3)
shot(CREAK, 61.4, -12, s=12.5, d=0.8, rate=0.5, lp=2000)
# the Japanese school chime (Westminster quarters) at the hard cut to the empty chair
for k, (f, dt) in enumerate([(659.3, 0), (523.3, 0.62), (587.3, 1.24), (392.0, 1.86), (392.0, 3.1), (587.3, 3.72), (659.3, 4.34), (523.3, 4.96)]):
    if 62.0 + dt < 64.6: put(bell(f, 2.2, ((1, 1), (2.0, 0.35), (3.0, 0.12), (4.2, 0.05))) * db(-17) * np.exp(-0 * T_(2.2)), 62.0 + dt, pan=0.25)

# ---- accents on the cuts: a short breathy swell peaking on the cut (filtered noise), and a low knock
def swell(t, g, d=0.5, f=(300, 2500)):
    y = filt(noise(d), "bandpass", list(f)) * np.linspace(0, 1, int(d * SR)) ** 2; y = y / np.abs(y).max() * db(g); put(np.stack([y, np.roll(y, 400)], 1), t - d)
for tc in (13.5, 22.5, 31.5, 36.0, 40.5, 50.5, 55.0, 59.5, 64.0): swell(tc, -22)
for tc in (13.5, 22.5, 31.5, 40.5, 50.5, 55.0, 59.5): put(boom(70, 0.5, 0.3) * db(-13), tc); shot(FLOOR, tc, -20, s=0.2, d=0.4, hp=400)
shot(PK["hair_rustle_fabric"], 23.5, -14, s=21.0, d=0.6, lp=6000); shot(TICK, 24.08, -20, s=_j.load(open('picks.json'))['clock_ticking']['seg'][0], d=0.2, hp=500)
shot(FLOOR, 33.9, -16, s=1.0, d=1.2, rate=0.8, pan=0.3); shot(CREAK, 23.5, -16, s=13.0, d=1.0, rate=0.7, lp=3000, pan=-0.3)

# ---- code layer: drones, the card hit, the reveal hit
drone(0, 4.5, 41, -19, [[0, 0], [2.6, 2], [4.5, -6]])
put(boom(50, 1.8, 0.4) * db(-13), 0.3); put(boom(38, 2.0, 0.4) * db(-13), 2.62)
put(bell(98, 6.5) * db(-17), 4.42, pan=-0.1); put(boom(60, 2.5, 0.4) * db(-14), 4.42)
drone(19.6, 45.0, 33, -25, [[19.6, -6], [27, -3], [31, 0], [36, 2], [44.2, 4]], beat=0.2, lp=600)
put(boom(42, 5.5, 0.5) * db(2), 45.6); put(boom(28, 4.0, 0.3) * db(0), 45.6)
tt = T_(7.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (110.0, 116.5, 130.8, 174.6, 185.0)) * np.exp(-tt / 2.8) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 2200) * db(-11), 45.6, pan=0.1); put(bell(73, 8.0) * db(-12), 45.62, pan=-0.15)
drone(45.6, 62.0, 30, -24, [[45.6, 0], [47, -5], [55, -3], [62.0, -3]], beat=0.4, lp=600)
drone(64.0, 71.0, 36, -33, [[64, -2], [70, -4]], beat=0.15, lp=500)
put(bell(98, 3.5) * db(-22), 68.6)

# ---------------------------------------------------------------- master
# ride the body up: 3 s short-term level toward the film's median, at most +7 dB, never above the reveal; a 2 kHz presence lift
blk = int(0.5 * SR); e = np.array([np.sqrt(np.mean(out[i:i + blk] ** 2)) + 1e-9 for i in range(0, N, blk)])
st = np.convolve(e, np.ones(6) / 6, "same"); tgt = np.median(st[st > 1e-4]) * 1.5
ride = np.clip(tgt / st, 1, db(8)); ride[int(45.0 / 0.5):int(55 / 0.5)] = 1; ride[int(62 / 0.5):] = 1
ride = np.convolve(np.repeat(ride, blk)[:N], np.ones(int(0.6 * SR)) / int(0.6 * SR), "same"); out *= ride[:, None]
out += filt(out, "bandpass", [1200, 4000]) * (db(3) - 1)
a, b, f = int(45.0 * SR), int(45.6 * SR), int(0.01 * SR)
out[a - f:a] *= np.linspace(1, 0, f)[:, None]; out[a:b] = 0
tail = np.interp(np.arange(N) / SR, [0, 70.0, 71.0], [1, 1, 0]); out *= tail[:, None]
# a smooth compressor (ratio 3 above 14 dB under the 99.9th percentile level, 5 ms attack / 150 ms release), then normalise
lvl = np.abs(out).max(1); ka, kr = np.exp(-1 / (0.005 * SR)), np.exp(-1 / (0.15 * SR)); env_ = np.empty(N); e_ = 0.0
for i_ in range(N):
    v = lvl[i_]; e_ = ka * e_ + (1 - ka) * v if v > e_ else kr * e_ + (1 - kr) * v; env_[i_] = e_
thr = np.percentile(env_, 99.9) * db(-14); gr = np.where(env_ > thr, (thr / (env_ + 1e-12)) ** (1 - 1 / 3), 1.0); out *= gr[:, None]
out[int(45.0 * SR):int(45.6 * SR)] = 0
meter = pyln.Meter(SR); L = meter.integrated_loudness(out); out *= db(-13.9 - L)
pk = np.abs(out).max(); lim = db(-3.0)
if pk > lim:   # soft-knee limiter on the few peaks above -1 dBFS
    g = np.minimum(1, lim / (np.abs(out).max(1) + 1e-9))
    g = np.minimum.reduce([np.roll(g, s) for s in range(-240, 241, 24)]); out *= g[:, None]
L2 = meter.integrated_loudness(out)
sf.write("audio/mix.wav", out.astype(np.float32), SR, subtype="FLOAT")
w = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1); i = int(np.argmax(w))
rep = f"LUFS {L2:.1f}  peak {20 * np.log10(np.abs(out).max()):.1f} dBFS  loudest 100 ms at {i * 0.05:.2f} s ({10 * np.log10(w[i]):.1f} dBFS)  silence 45.0-45.6 max {np.abs(out[a:b]).max():.2e}"
open("audio/levels.txt", "w").write(rep + "\n"); print(rep)
