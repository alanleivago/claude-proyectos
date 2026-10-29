# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the whole sound for inunaki in one pass: Freesound CC0 recordings picked with earshot (picks.json), Wikimedia
Commons CC0 / public-domain beds (rec/, see CREDITS.md) placed on the picture, and a code layer (drones, the card bell,
the sickle's ring, the reveal hit with a dissonant cluster, sub booms). Exact silence 45.0-45.6 s before the reveal;
master to -14.5 LUFS, peaks under -1.4 dBFS. Writes audio/mix.wav and audio/levels.txt."""
import subprocess, json
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal

SR, T = 48000, 71.0; N = int(T * SR); rng = np.random.default_rng(1994)
out = np.zeros((N, 2))
db = lambda x: 10 ** (x / 20)
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)
def filt(x, kind, f, o=2): return signal.sosfilt(signal.butter(o, f, kind, fs=SR, output="sos"), x, axis=0)
def rms(x): return np.sqrt(np.mean(x ** 2)) + 1e-12
def T_(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.01): return np.minimum(1, np.arange(n) / max(1, a * SR))
def put(y, t0, g=0.0, pan=0.0):
    if y.ndim == 1: th = (pan + 1) * np.pi / 4; y = np.stack([y * np.cos(th) * 1.414, y * np.sin(th) * 1.414], 1)
    a = int(t0 * SR); y = y[: max(0, N - a)]; out[a:a + len(y)] += y * db(g)
def src(f): return f if f.startswith(("fs/", "own/")) else "rec/" + f
# a bed between t0 and t1, normalised to -20 dBFS RMS, gain points [[t, dB]], looped, optional filters and playback rate
def bed(f, t0, t1, pts, s0=0.0, hp=None, lp=None, rate=1.0):
    x = load(src(f))
    if rate != 1.0: x = signal.resample(x, int(len(x) / rate))
    s = int(s0 * SR) % len(x); x = np.vstack([x[s:], x[:s]]); n = int((t1 - t0) * SR)
    if len(x) < n:   # loop with 0.4 s equal-power crossfades (no click at the seam)
        cf = min(int(0.4 * SR), len(x) // 3); w = np.linspace(0, 1, cf)[:, None]; seg = x.copy()
        while len(x) < n: x = np.vstack([x[:-cf], x[-cf:] * np.sqrt(1 - w) + seg[:cf] * np.sqrt(w), seg[cf:]])
    y = x[:n].copy()
    if hp: y = filt(y, "highpass", hp)
    if lp: y = filt(y, "lowpass", lp)
    y = y / rms(y) * db(-20); tt = t0 + np.arange(n) / SR; P = np.array(pts, float)
    gg = db(np.interp(tt, P[:, 0], P[:, 1])); fd = min(int(0.05 * SR), n // 2); gg[:fd] *= np.linspace(0, 1, fd); gg[-fd:] *= np.linspace(1, 0, fd)
    put(y * gg[:, None], t0)
# a one-shot: slice [s, s+d] peak-normalised to g dBFS at time t
def shot(f, t, g, s=0.0, d=None, hp=None, lp=None, pan=0.0, fade=0.05, rate=1.0):
    x = load(src(f)); a = int(s * SR); y = x[a: a + int(d * SR)] if d else x[a:]
    if rate != 1.0: y = signal.resample(y, int(len(y) / rate))
    if hp: y = filt(y, "highpass", hp)
    if lp: y = filt(y, "lowpass", lp)
    fd = min(int(fade * SR), len(y) // 2); y = y.copy(); y[-fd:] *= np.linspace(1, 0, fd)[:, None]; y[:64] *= np.linspace(0, 1, 64)[:, None]
    y = y / (np.abs(y).max() + 1e-9) * db(g)
    if pan: th = (pan + 1) * np.pi / 4; y = y * np.array([np.cos(th), np.sin(th)]) * 1.414
    put(y, t)
def echo(y, d=0.09, k=0.45, n=5):   # a tunnel slap echo
    o = y.copy()
    for i in range(1, n): s = int(d * i * SR); o[s:] += y[:len(y) - s] * k ** i
    return o
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
def ring(t, g, f0=1870, d=1.6):   # steel ringing (the sickle)
    tt = T_(d); y = sum(a * np.sin(2 * np.pi * f0 * r * tt) * np.exp(-tt / (d * 0.3 / r)) for r, a in ((1, 1), (1.47, 0.6), (2.31, 0.35), (3.1, 0.2)))
    y += filt(noise(d), "highpass", 4000) * np.exp(-tt / 0.03) * 0.5; put(y / np.abs(y).max() * db(g) * env(len(tt), 0.002), t, pan=0.25)

PK = {k: v["file"] for k, v in json.load(open("picks.json")).items()}
F = lambda k: PK[k]
PICKUP = "fs/flashlight_click/474009_Picking_Up_Flashlight.mp3"

# ---------------------------------------------------------------- beds
# rain: outside shots; muffled inside the tunnel; gone in the village; light by day
bed("rain.mp3", 0, 71, [[0, -21], [4.3, -21], [4.6, -40], [8.7, -40], [9.2, -20], [27, -21], [29.6, -21], [30.5, -33], [36, -44], [40.5, -40], [44.9, -40],
                        [45.6, -44], [55, -44], [55.4, -22], [64, -22], [64.4, -33], [70, -34]], lp=7000)
bed(F("rain_forest"), 9.0, 27.0, [[9, -27], [27, -27]], lp=5000)
IDLE = "fs/car_engine_idle_old/772236_Old_big_Toyota_car_idle.mp3"   # a steady idle (the old start/stop file had a drive-up in it)
bed(IDLE, 0, 4.5, [[0, -31], [4.5, -33]], lp=1200)                  # the car idles behind the camera
# the arrival, timed to the picture: the car drives up the road head-on (9-13.5), rolls in behind the camera and STOPS at
# CAR_STOP = 14.3 (run.js): approach recording aligned so its closest moment lands on the stop; brake squeal ending on the
# stop frame; a suspension thunk on it; handbrake 0.6 s later; then the idle while we walk away
CAR_STOP = 14.3
APPROACH = "fs/car_approaching_arriving/119827_CarApproaching_Asphalt_leaves_aif.mp3"
bed(APPROACH, 9.0, CAR_STOP + 0.5, [[9, -28], [12, -23], [13.4, -19], [CAR_STOP, -19], [CAR_STOP + 0.5, -32]], s0=13.0 - (CAR_STOP - 9.0))
shot("fs/car_brake_squeak_stop/508901_Car_Arriving_and_Parking_drive_up_short_.mp3", CAR_STOP - 0.75, -18, s=15.0, d=0.75, hp=900, fade=0.03)
put(boom(70, 0.45, 0.3) * db(-11), CAR_STOP); y0 = filt(noise(0.09), "bandpass", [150, 900]) * np.exp(-T_(0.09) / 0.03); put(y0 / np.abs(y0).max() * db(-13), CAR_STOP)
ys = filt(noise(0.35), "bandpass", [300, 2500]) * np.linspace(0.3, 1, int(0.35 * SR)) ** 2; put(ys / np.abs(ys).max() * db(-19), CAR_STOP - 0.35)   # tyres scrubbing into the stop
bed(IDLE, CAR_STOP - 0.2, 36.0, [[CAR_STOP - 0.2, -24], [CAR_STOP + 0.6, -19], [18, -22], [27, -26], [29.6, -30], [31, -40], [36, -46]], lp=1600)
bed(F("car_wipers"), 9.0, 13.5, [[9, -27], [13.5, -29]], s0=8.0, lp=4000)
bed("Howling_wind.ogg", 0, 9.0, [[0, -31], [9, -36]], lp=1400)
bed(F("water_drip_cave_echo"), 18.0, 27.0, [[18, -30], [27, -30]], s0=10, hp=300)              # rain dripping off the board
bed(F("water_drip_cave_echo"), 29.6, 45.0, [[29.6, -27], [40.5, -27], [44.8, -32]], s0=20)
bed(F("tunnel_ambience"), 29.6, 55.0, [[29.6, -30], [36, -26], [44.9, -24], [45.6, -24], [55, -26]], s0=5, lp=900)
bed(F("footsteps_wet_asphalt"), 27.0, 29.6, [[27, -22], [29.6, -22]], s0=25)
fs_t = load(src(F("footsteps_tunnel_echo")))[int(9.9 * SR):int(40 * SR)]
for (t0, t1, g) in ((29.6, 40.5, -21), (40.5, 44.9, -27)):
    y = fs_t[: int((t1 - t0) * SR)].copy(); y = echo(y / rms(y) * db(g)); fd = int(0.1 * SR); y[:fd] *= np.linspace(0, 1, fd)[:, None]; y[-fd:] *= np.linspace(1, 0, fd)[:, None]; put(y, t0)
bed(F("bamboo_flute"), 37.0, 45.0, [[37, -40], [40.5, -30], [44.8, -30]], lp=2500, rate=0.85)     # far festival flute
bed(F("dogs_howling_night"), 38.5, 45.0, [[38.5, -36], [40.5, -24], [44.8, -22]])
bed(F("birds_rain"), 64.0, 71.0, [[64, -28], [70.6, -34]], s0=40)

# ---------------------------------------------------------------- hits on the picture
shot(F("wet_breathing_creature"), 0.5, -12, s=12.3, d=3.6, lp=3000)               # hook: it breathes, lifts its head
shot(F("cloth_rustle_fabric"), 0.9, -20, s=22.5, d=2.0)
ring(2.2, -18)                                                                   # the sickle comes up into the light
shot(F("dogs_howling_night"), 6.0, -26, s=0.5, d=3.0, lp=3000)                   # card: a far dog
shot(F("handbrake_car"), CAR_STOP + 0.6, -14, s=1.36, d=1.1)                    # parked
shot(F("flashlight_click"), 18.15, -16, s=0.0, d=0.35)                            # his flashlight on
shot(F("male_laugh"), 27.35, -10, d=1.0); shot(F("male_laugh"), 28.4, -13, d=1.0, rate=0.95)
shot(F("dogs_howling_night"), 40.6, -14, s=0.0, d=5.9)                            # the village dogs
shot(F("taiko"), 42.2, -22, lp=900, rate=0.8); shot(F("taiko"), 43.6, -19, lp=900, rate=0.8)
# THE HIT (45.6): taiko + boom + cluster + bell; then they all turn (45.85) — a cloth rush and wet breaths
shot(F("taiko"), 45.6, -2, rate=0.7, lp=2500); shot(F("deep_impact_boom_hit"), 45.6, -5, s=9.0, d=2.6, lp=4000)
shot(F("cloth_rustle_fabric"), 45.82, -10, s=23.0, d=1.0, rate=0.8)
bed(F("wet_breathing_creature"), 47.6, 55.0, [[47.6, -26], [50.5, -18], [55, -18]], s0=3)
shot(F("cloth_rustle_fabric"), 52.0, -16, s=24.0, d=2.2); ring(53.6, -17, 1650)
# I run: footsteps (sped-up asphalt), scared breathing, the door; then the car pulls away behind the camera
bed(F("footsteps_wet_asphalt"), 55.0, 58.7, [[55, -18], [58.6, -18]], s0=30, rate=1.7)
bed(F("heavy_breathing_scared"), 55.0, 60.5, [[55, -17], [59, -18], [60.5, -30]], s0=31)
shot(F("car_door_slam"), 58.65, -10, s=39.2, d=0.6)
bed(F("car_accelerate_away"), 59.0, 64.0, [[59, -20], [60.5, -14], [62, -20], [64, -34]], s0=1.6, lp=3000)   # the rev starts as we cut low (59.2) and recedes
shot(F("cloth_rustle_fabric"), 60.4, -18, s=25, d=1.3)                            # it folds down
bed(F("wet_breathing_creature"), 60.0, 64.0, [[60, -26], [61.6, -20], [64, -22]], s0=14)
shot(PICKUP, 61.55, -11, s=2.0, d=1.6)                                            # the flashlight is picked up (rattles)
shot(F("dogs_howling_night"), 67.2, -32, s=1.0, d=3.0, lp=2500)

# transition accents: a soft whoosh into each cut (peak on the cut) and a low thump on it
def whoosh(t, g, d=0.7, f0=300, f1=2400):
    n = int(d * SR); x = noise(d); y = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        fc = f0 + (f1 - f0) * (i / n) ** 2; y[i:i + seg] = filt(x[max(0, i - 2048):i + seg], "bandpass", [fc * 0.7, fc * 1.4])[-len(y[i:i + seg]):]
    e2 = (np.arange(n) / n) ** 2.2; y *= e2; put(y / np.abs(y).max() * db(g), t - d, pan=0.0)
for tc in (9.0, 13.5, 18.0, 22.5, 27.0, 29.6, 36.0, 40.5, 50.5, 55.0, 59.0):
    whoosh(tc, -24); put(boom(55, 0.8, 0.3) * db(-17), tc); y = filt(noise(0.06), "bandpass", [600, 3000]) * np.exp(-T_(0.06) / 0.012); put(y / np.abs(y).max() * db(-26), tc)
whoosh(57.0, -16, 0.35, 600, 4000); put(boom(70, 0.5, 0.3) * db(-16), 57.0)   # the whip back over the shoulder

# the failing sodium lamp in the hook (same table as LAMP in run.js): a hum + the recorded flicker buzz while it is on,
# a click and a tick of arcing on every switch
LAMP = [[0, 0.42, 1], [0.42, 0.55, 0], [0.55, 0.62, 1], [0.62, 0.95, 0], [0.95, 1.7, 1], [1.7, 1.78, 0], [1.78, 1.86, 1], [1.86, 2.25, 0], [2.25, 3.05, 1], [3.05, 3.12, 0], [3.12, 3.6, 1], [3.6, 3.95, 0], [3.95, 4.5, 1]]
tl = T_(4.5); gate = np.zeros(len(tl))
for a0, b0, on in LAMP:
    if on: gate[int(a0 * SR):int(b0 * SR)] = 1
gate = np.convolve(gate, np.ones(int(0.006 * SR)) / int(0.006 * SR), "same")
hum = sum(a * np.sin(2 * np.pi * 100 * k * tl + k) for k, a in ((1, 1), (2, 0.6), (3, 0.45), (4, 0.25), (6, 0.15))) + 0.25 * filt(noise(4.5), "bandpass", [2000, 6000])
put(hum / rms(hum) * db(-33) * gate * np.interp(tl, [0, 4.15, 4.5], [1, 1, 0]), 0.0, pan=-0.3)
buzz = load("fs/fluorescent_light_flicker/232446_Lights_Flicker_on_and_some_electrical_No.mp3")[int(24.8 * SR):int(24.8 * SR) + len(tl)]
put(buzz / rms(buzz) * db(-30) * (gate * np.interp(tl, [0, 4.15, 4.5], [1, 1, 0]))[:, None], 0.0)
for a0, b0, on in LAMP[1:]:
    c = filt(noise(0.04), "bandpass", [1500, 7000]) * np.exp(-T_(0.04) / 0.006); put(c / np.abs(c).max() * db(-13 if on else -16), a0 - 0.004, pan=-0.3)
    if on: z = filt(noise(0.12), "highpass", 3000) * (rng.random(int(0.12 * SR)) < 0.02) * np.exp(-T_(0.12) / 0.04); put(z / (np.abs(z).max() + 1e-9) * db(-22), a0, pan=-0.3)

# ---------------------------------------------------------------- code layer
drone(0, 9.0, 41, -27, [[0, 0], [4.4, -3], [9, -10]])
bcard = bell(98, 4.5); bcard *= np.interp(np.arange(len(bcard)), [0, len(bcard) * 0.6, len(bcard)], [1, 1, 0]); put(bcard * db(-14), 4.55, pan=-0.1); put(boom(60, 2.5, 0.4) * db(-11), 4.55)
drone(22.5, 45.0, 34, -28, [[22.5, -12], [27, -6], [36, -1], [44.8, 3]], beat=0.2, lp=600)
put(boom(44, 5.5, 0.5) * db(-2), 45.6)
tt = T_(7.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (110.0, 116.5, 130.8, 174.6, 185.0)) * np.exp(-tt / 2.8) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 2000) * db(-12), 45.6, pan=0.1); put(bell(73, 9.0) * db(-10), 45.62, pan=-0.15)
drone(45.6, 64.0, 30, -24, [[45.6, 3], [55, 0], [64, -3]], beat=0.4, lp=600)
put(boom(32, 3.0, 0.4) * db(-7), 61.6); put(boom(36, 2.5, 0.4) * db(-9), 63.3)     # the grab; the beam turns on us
put(bell(660, 3.0, ((1, 1), (2.76, 0.3), (5.4, 0.1))) * db(-26), 66.4, pan=0.3); put(bell(98, 3.5) * db(-18), 68.0)

# ---------------------------------------------------------------- master
import os
if os.environ.get('MIX_DEBUG'): sf.write('audio/premaster.wav', out.astype(np.float32), SR, subtype='FLOAT')
blk = int(0.5 * SR); e = np.array([np.sqrt(np.mean(out[i:i + blk] ** 2)) + 1e-9 for i in range(0, N, blk)])
st = np.convolve(e, np.ones(6) / 6, "same"); tgt = np.median(st[st > 1e-4]) * db(2.5)
ride = np.clip(tgt / st, 1, db(9)); ride[int(44.6 / 0.5):int(49 / 0.5)] = 1; ride[:int(9 / 0.5)] = 1; ride[int(13.2 / 0.5):int(15.5 / 0.5)] = 1; ride[int(63.8 / 0.5):] = 1
ride = np.convolve(np.repeat(ride, blk)[:N], np.ones(int(0.6 * SR)) / int(0.6 * SR), "same"); out *= ride[:, None]
out += filt(out, "bandpass", [1200, 4000]) * (db(2) - 1)
a, b, f = int(45.0 * SR), int(45.6 * SR), int(0.01 * SR)
out[a - f:a] *= np.linspace(1, 0, f)[:, None]; out[a:b] = 0
tail = np.interp(np.arange(N) / SR, [0, 70.0, 71.0], [1, 1, 0]); out *= tail[:, None]
meter = pyln.Meter(SR); out *= db(-20 - meter.integrated_loudness(out))
# master compressor (ratio 3 above -22 dBFS, ~10 ms attack / 150 ms release) so the peaks stop dragging the body down
lv = np.abs(out).max(1); att = signal.lfilter([1 - np.exp(-1 / (0.01 * SR))], [1, -np.exp(-1 / (0.01 * SR))], lv)
rel = signal.lfilter([1 - np.exp(-1 / (0.15 * SR))], [1, -np.exp(-1 / (0.15 * SR))], lv); ev = np.maximum(att, rel)
ed = 20 * np.log10(ev + 1e-9); gr = np.where(ed > -25, (ed + 25) * (1 / 4 - 1), 0); out *= db(gr)[:, None]
out[a:b] = 0
L = meter.integrated_loudness(out); out *= db(-14.5 - L)
lim = db(-3.9)
for _ in range(3):
    if np.abs(out).max() <= lim: break
    g = np.minimum(1, lim / (np.abs(out).max(1) + 1e-9)); g = np.minimum.reduce([np.roll(g, s) for s in range(-240, 241, 24)]); out *= g[:, None]
L2 = meter.integrated_loudness(out)
sf.write("audio/mix.wav", out.astype(np.float32), SR, subtype="FLOAT")
w = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1); i = int(np.argmax(w))
rep = f"LUFS {L2:.1f}  peak {20 * np.log10(np.abs(out).max()):.1f} dBFS  loudest 100 ms at {i * 0.05:.2f} s ({10 * np.log10(w[i]):.1f} dBFS)  silence 45.0-45.6 max {np.abs(out[a:b]).max():.2e}"
open("audio/levels.txt", "w").write(rep + "\n"); print(rep)
