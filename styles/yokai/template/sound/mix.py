# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the whole sound for behemoth in one pass: recorded beds (Wikimedia Commons, CC0 / public domain, see CREDITS.md),
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

# ---------------------------------------------------------------- recorded beds (rain everywhere at night, wind on the summit)
bed("rain.mp3", 0, 66.0, [[0, -22], [4.5, -36], [8.6, -36], [9.2, -21], [45.0, -21], [45.6, -24], [56, -22], [66, -24]], lp=7000)
bed("Rain_and_thunder.ogg", 9.0, 44.9, [[9, -32], [44.9, -28]], src=30, lp=3000)
bed("Howling_wind.ogg", 0, 75, [[0, -26], [4.4, -26], [4.6, -40], [8.6, -40], [9.2, -27], [36, -24], [44.8, -22], [45.0, -60], [45.6, -26], [66, -30], [75, -32]], src=5, lp=2500)
bed("Earthquake.ogg", 18.2, 27.2, [[18.2, -40], [19.0, -18], [26, -22], [27.2, -40]], src=60, lp=300)
bed("Earthquake.ogg", 36.0, 45.0, [[36, -30], [38.4, -14], [44.8, -18]], src=20, lp=500)
bed("Heavy_breathing_2.ogg", 40.6, 45.0, [[40.6, -14], [45, -16]], src=30)
bed("Dawnchorus-uk.ogg" if False else "Howling_wind.ogg", 66.0, 75, [[66, -34], [74.6, -60]], src=70, lp=1200)

# ---------------------------------------------------------------- recorded hits
def whale(t, g, s0, d, rate=0.5, lp=900): shot("Blue_Whale_NE_Pacific_1x.oga", t, g, s=s0, d=d, rate=rate, lp=lp)
whale(0.6, -10, 60, 3.0)                                                     # the hook: a groan from the clouds
shot("Atlantic_minke_whale_call.ogg", 1.8, -14, rate=0.45, lp=1200)
whale(29.0, -12, 120, 4.0, 0.45)                                             # the cloud with scales
shot("Bones_breaking_wood_fire_ice_crackling.ogg", 38.4, -8, s=20.0, d=1.4, hp=150, rate=0.6)  # the rim breaks
shot("Dull_thud.ogg", 38.4, -6, lp=900, rate=0.5)
whale(46.2, -8, 30, 5.0, 0.4, 700)                                           # it looks down
shot("Heavy_breathing_2.ogg", 56.3, -10, s=50, d=3.5, rate=0.55, lp=800)        # its breath at the eye
for t in (68.0, 70.6, 72.4): shot("Holga_shuttersound.ogg", t, -22, d=0.4, pan=0.4)

# ---------------------------------------------------------------- "sonido pro": Freesound CC0 picks chosen with earshot (picks.json)
RAIN_CAR = "fs/heavy_rain_car_roof_inside/875619_Rain_Storm_Heavy_Rain_on_Roof_Inside_a_C.mp3"
THUNDER = "fs/thunder_rumble_distant/574386_Rolling_thunder_closer_rain_drops_ms_77m.mp3"
GROWL = "fs/monster_growl_deep/803037_Creature_Monster_Alien_Vocal_FX_8_wav.mp3"
ROCKS = "fs/rockslide_falling_rocks/608957_Rockslide_1_wav.mp3"
STEP = "fs/giant_footstep_impact/813053_Big_robot_footstep_002.mp3"
ENGINE = "fs/old_truck_engine/487161_R19_48_Old_Large_Truck_Start_Idle_Out_wa.mp3"
CRACK = "fs/wet_flesh_crack/385963_Wet_Pineapple_Break_wav.mp3"
bed(RAIN_CAR, 60.4, 66.0, [[60.4, -20], [65.4, -21], [66, -40]], src=20)
bed(ENGINE, 60.4, 66.0, [[60.4, -24], [66, -26]], src=58, lp=1500)
for t, g in ((11.2, -16), (24.0, -14), (33.5, -12), (52.0, -12)): shot(THUNDER, t, g, s=0, d=6, lp=2500, fade=1.5)
shot(GROWL, 1.0, -9, rate=0.6, lp=2500); shot(GROWL, 31.0, -12, rate=0.5, lp=1500); shot(GROWL, 46.0, -6, rate=0.55, lp=3000); shot(GROWL, 58.6, -10, rate=0.7, lp=2000)
shot(ROCKS, 38.3, -7, s=5.6, d=3.5, fade=1.0)
for t in np.arange(61.0, 66.0, 1.4): shot(STEP, t - 0.2, -7, s=0.2, d=1.3, rate=0.75, lp=1200)
shot(CRACK, 45.62, -10, rate=0.6, lp=4000); shot(CRACK, 38.42, -12, rate=0.5)

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
drone(0, 9.0, 41, -26, [[0, 0], [4.5, -4], [9, -10]])
put(bell(98, 7.0) * db(-9), 4.55, pan=-0.1); put(boom(60, 2.5, 0.4) * db(-6), 4.55)                 # the card
# the dome motor whining as it turns by itself (22.8-26.8), the telescope's slew (19-22)
for a, b, f0, g in ((19.0, 22.2, 180, -26), (22.8, 26.8, 120, -22)):
    d = b - a; tt = T_(d); f = f0 * (1 + 0.15 * np.sin(np.pi * tt / d)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sign(np.sin(3 * ph))) * np.sin(np.pi * tt / d) ** 0.5; put(filt(y, "lowpass", 1800) * db(g), a, pan=0.2)
drone(18.0, 45.0, 36, -26, [[18, -8], [27, -4], [36, 0], [44, 3]], beat=0.2, lp=600)
# the hand's grip: rocks tumbling (38.4-41)
for k in range(40):
    tk = 38.5 + k * 0.06 + rng.random() * 0.05; y = filt(noise(0.08), "bandpass", [200, 3000]) * np.exp(-T_(0.08) / 0.02); put(y / np.abs(y).max() * db(-12 - 8 * k / 40), tk, pan=rng.uniform(-0.4, 0.4))
# the run: steps on cinder
for k, t in enumerate(np.arange(40.7, 44.8, 0.3)):
    y = filt(noise(0.09), "bandpass", [400, 4000]) * np.exp(-T_(0.09) / 0.025); put(y / np.abs(y).max() * db(-14), t, pan=0.3 * (1 if k % 2 else -1))
# THE REVEAL (45.6): sub drop, low cluster, a cracked bell, after 0.6 s of nothing
put(boom(44, 5.5, 0.5) * db(0), 45.6)
tt = T_(7.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (110.0, 116.5, 130.8, 174.6, 185.0)) * np.exp(-tt / 2.8) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 2000) * db(-9), 45.6, pan=0.1); put(bell(73, 9.0) * db(-6), 45.62, pan=-0.15)
y = filt(noise(1.2), "highpass", 1500) * np.exp(-T_(1.2) / 0.25); put(y / np.abs(y).max() * db(-12), 45.6)
drone(45.6, 60.4, 33, -24, [[45.6, 3], [56, 0], [60.4, -2]], beat=0.4, lp=600)
# the drive: engine and wipers, and giant footfalls in the clouds every 1.4 s
d = 66 - 60.4; tt = T_(d); f = 38 + 6 * np.sin(np.pi * tt / d); ph = 2 * np.pi * np.cumsum(f) / SR; y = filt(np.sign(np.sin(ph)) * 0.6 + np.sin(2 * ph) * 0.4 + 0.3 * brown(d), "lowpass", 500)
gg = np.minimum(1, tt / 0.4) * np.minimum(1, (d - tt) / 0.6); put(y / rms(y) * db(-24) * gg, 60.4)
for t in np.arange(61.0, 66.0, 1.4): put(boom(32, 1.4, 0.3) * db(-6), t); put(filt(noise(0.6), "lowpass", 300) * np.exp(-T_(0.6) / 0.15) * db(-14), t)
# dusk: a soft high bell, the last low bell
put(bell(660, 3.0, ((1, 1), (2.76, 0.3), (5.4, 0.1))) * db(-26), 70.2, pan=0.3)
put(bell(98, 6.0) * db(-18), 72.8)

# ---------------------------------------------------------------- master
# ride the body up: 3 s short-term level toward the film's median, at most +7 dB, never above the reveal; a 2 kHz presence lift
blk = int(0.5 * SR); e = np.array([np.sqrt(np.mean(out[i:i + blk] ** 2)) + 1e-9 for i in range(0, N, blk)])
st = np.convolve(e, np.ones(6) / 6, "same"); tgt = np.median(st[st > 1e-4]) * 1.0
ride = np.clip(tgt / st, 1, db(7)); ride[int(45.0 / 0.5):int(56 / 0.5)] = 1
ride = np.convolve(np.repeat(ride, blk)[:N], np.ones(int(0.6 * SR)) / int(0.6 * SR), "same"); out *= ride[:, None]
out += filt(out, "bandpass", [1200, 4000]) * (db(3) - 1)
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
