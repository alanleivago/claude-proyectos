# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the whole sound for umibozu in one pass: recorded beds (Wikimedia Commons, CC0 / public domain, see CREDITS.md),
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
    put(y * gg[:, None], t0)
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

# ---------------------------------------------------------------- picks (Freesound CC0 via earshot, picks.json) + Commons
import json as _j
PK = {k: v["file"] for k, v in _j.load(open("picks.json")).items()}
BULB = "fs/light_bulb_pop_break/558969_Fluorescent_Lightbulb_Break_wav.mp3"
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
# beds: rain (stops when the sea goes flat, back after the reveal), the engine/generator, hull creaks, deep bubbles
bed("rain.mp3", 0, 66, [[0, -22], [4.4, -22], [4.6, -40], [8.6, -40], [9.2, -21], [13, -21], [17, -42], [44, -44], [45.6, -24], [66, -24]], lp=7000)
bed(PK["boat_engine_idle"], 9.0, 22.8, [[9, -24], [21.5, -25], [22.8, -60]], src=40, lp=1800)
bed(PK["ship_creaking"], 9.0, 66, [[9, -30], [27, -27], [36, -22], [44.9, -22], [45.6, -24], [66, -28]], src=3)
bed(PK["deep_underwater_bubbles_rumble"], 18.0, 45.0, [[18, -34], [27, -24], [31, -18], [44.8, -20]], src=10)
bed(PK["water_pouring"], 46.0, 62.5, [[46, -22], [62, -22], [62.5, -50]], src=30, lp=5000)
bed(PK["seagulls"], 66.0, 71, [[66, -32], [70.6, -60]], src=80)
bed("Howling_wind.ogg", 0, 9, [[0, -30], [4.4, -30], [4.6, -44], [9, -44]], lp=1500)
# hits
def whale(t, g, s0, d, rate=0.5, lp=900): shot("Blue_Whale_NE_Pacific_1x.oga", t, g, s=s0, d=d, rate=rate, lp=lp)
whale(0.4, -9, 60, 3.5, 0.45); shot("Atlantic_minke_whale_call.ogg", 1.4, -14, rate=0.4, lp=1200)       # hook groan
for k, t in enumerate(np.arange(18.6, 23.0, 1.1)): shot(PK["sonar_ping_underwater"], t, -14 + k, d=1.0)  # sonar, louder each time
for k, t in enumerate(np.linspace(22.9, 26.5, 8)): shot(BULB, t, -18, s=0.0, d=0.5, hp=1500, pan=-0.5 + k / 7)   # lamps pop out
shot(PK["big_splash"], 27.6, -12, lp=2000, rate=0.7)                        # the sea bulges
whale(28.4, -10, 120, 4.0, 0.4)                                                # eyes open
shot("Creaky_wooden_casket.ogg", 31.8, -10, rate=0.4); shot("Dull_thud.ogg", 31.8, -8, rate=0.5, lp=900)   # hand on the rail
shot("Heavy_breathing_2.ogg", 36.4, -12, s=40, d=4.0, rate=0.45, lp=600)      # the voice like the tide
shot("Creaky_wooden_casket.ogg", 39.2, -16, rate=0.6)                         # the ladle taken
whale(46.0, -6, 30, 5.0, 0.38, 700)
for t in np.arange(47.0, 56.0, 2.2): shot(PK["big_splash"], t, -18, rate=0.9, lp=3000)   # scoops (no water lands)
shot("Creaky_wooden_casket.ogg", 57.0, -12, rate=0.5)
shot(PK["big_splash"], 62.4, -8, rate=0.6, lp=2500)                         # the bucket hits the sea; it sinks
shot("Water_bubbles_chortling.ogg", 62.8, -14, s=5, d=3.0, lp=2000)
whale(63.0, -9, 200, 0.95, 0.35, 600)
# monster presence (Freesound CC0 via earshot, pick2.py): roars at the hook, the surfacing and the reveal; growls at the hand;
# a whale moan under the glowing eyes; water pouring off its body as it rises; waves; a draining whirl as it sinks
ROAR, GROWL, MOAN = PK["monster_roar_deep"], PK["giant_creature_growl"], PK["whale_moan"]
shot(ROAR, 0.9, -5, s=1.0, d=3.0, rate=0.6, lp=2500); shot(ROAR, 29.8, -4, s=1.0, d=3.0, rate=0.55, lp=2200); shot(ROAR, 45.7, -3, s=1.0, d=3.0, rate=0.5, lp=2000)
shot(GROWL, 31.8, -8, s=0.1, d=2.2, rate=0.6, lp=1800); shot(GROWL, 57.2, -8, s=0.1, d=2.2, rate=0.55, lp=1600); shot(GROWL, 41.0, -12, s=0.1, d=2.2, rate=0.5, lp=1200)
shot(MOAN, 28.0, -10, s=5.0, d=3.5, rate=0.7, lp=1500); shot(MOAN, 24.5, -18, s=5.0, d=3.0, rate=0.6, lp=900)
bed(PK["waterfall_heavy"], 1.2, 4.6, [[1.2, -12], [3.0, -14], [4.6, -30]], src=17); bed(PK["waterfall_heavy"], 29.8, 35.5, [[29.8, -11], [32, -14], [35.5, -30]], src=12)
shot(PK["huge_wave_crash"], 1.0, -8, s=2.2, d=4.0); shot(PK["huge_wave_crash"], 29.9, -7, s=2.2, d=4.0)
for t in np.arange(47.0, 56.0, 4.5): shot(PK["huge_wave_crash"], t + 0.2, -14, s=3.0, d=2.0)
bed(PK["water_draining_whirlpool"], 62.6, 66.0, [[62.6, -14], [65, -16], [66, -40]], src=27)
put(boom(28, 4.0, 0.3) * db(-4), 29.8); put(boom(36, 3.0, 0.3) * db(-6), 0.9)

# code layer
drone(0, 9.0, 41, -27, [[0, 0], [4.5, -4], [9, -10]])
put(bell(98, 7.0) * db(-9), 4.55, pan=-0.1); put(boom(60, 2.5, 0.4) * db(-6), 4.55)
drone(17.0, 45.0, 34, -26, [[17, -10], [27, -4], [36, 0], [44, 3]], beat=0.2, lp=600)
put(boom(44, 5.5, 0.5) * db(0), 45.6)
tt = T_(7.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (110.0, 116.5, 130.8, 174.6, 185.0)) * np.exp(-tt / 2.8) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 2000) * db(-9), 45.6, pan=0.1); put(bell(73, 9.0) * db(-6), 45.62, pan=-0.15)
drone(45.6, 62.4, 30, -24, [[45.6, 3], [56, 0], [62.4, -2]], beat=0.4, lp=600)
y = filt(noise(0.25), "bandpass", [300, 3000]) * np.exp(-T_(0.25) / 0.05); put(y / np.abs(y).max() * db(-10), 61.6)   # the kick
put(boom(32, 3.0, 0.4) * db(-8), 62.6)
put(bell(660, 3.0, ((1, 1), (2.76, 0.3), (5.4, 0.1))) * db(-26), 67.4, pan=0.3); put(bell(98, 3.5) * db(-18), 68.6)

# ---------------------------------------------------------------- master
# ride the body up: 3 s short-term level toward the film's median, at most +7 dB, never above the reveal; a 2 kHz presence lift
blk = int(0.5 * SR); e = np.array([np.sqrt(np.mean(out[i:i + blk] ** 2)) + 1e-9 for i in range(0, N, blk)])
st = np.convolve(e, np.ones(6) / 6, "same"); tgt = np.median(st[st > 1e-4]) * 1.0
ride = np.clip(tgt / st, 1, db(7)); ride[int(45.0 / 0.5):int(56 / 0.5)] = 1; ride[int(66 / 0.5):] = 1
ride = np.convolve(np.repeat(ride, blk)[:N], np.ones(int(0.6 * SR)) / int(0.6 * SR), "same"); out *= ride[:, None]
out += filt(out, "bandpass", [1200, 4000]) * (db(3) - 1)
a, b, f = int(45.0 * SR), int(45.6 * SR), int(0.01 * SR)
out[a - f:a] *= np.linspace(1, 0, f)[:, None]; out[a:b] = 0
tail = np.interp(np.arange(N) / SR, [0, 70.0, 71.0], [1, 1, 0]); out *= tail[:, None]
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
