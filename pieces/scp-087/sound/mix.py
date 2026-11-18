# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the whole sound for scp-087: Freesound CC0 recordings picked with earshot (picks.json), the Commons
public-domain wind bed and a code layer (drones, the card bell and boom, the hit's sub drop and cluster, teeth clicks on
the jaw's own chatter clock, whooshes). Every event sits on the picture's clock (sound/cues.json from review/events.mjs: heel strikes, bulb level, torch level, the Thing's stop-motion snaps).
Exact silence 45.0-45.6 s before THE HIT. Writes audio/mix.wav and audio/levels.txt."""
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
PJ = json.load(open("picks.json")); PK = {k: v["file"] for k, v in PJ.items()}
def F(k): return PK.get(k)
def grain(f, s, d, hp=None, lp=None):   # a short slice of a recording, peak-normalised (a hoof, a step, a clink, a bell strike)
    x = load(src(f))[int(s * SR):int((s + d) * SR)].copy(); x = np.vstack([x, np.zeros((max(0, int(d * SR) - len(x)), 2))])
    if hp: x = filt(x, "highpass", hp)
    if lp: x = filt(x, "lowpass", lp)
    fd = int(min(0.04, d / 3) * SR); x[-fd:] *= np.linspace(1, 0, fd)[:, None]; x[:48] *= np.linspace(0, 1, 48)[:, None]; return x / (np.abs(x).max() + 1e-9)
# ---------------------------------------------------------------- the picture's clock
CU = json.load(open("cues.json")); BULB = np.array(CU["bulb"]); TORCH = np.array(CU["torch"])
CUTS = [4.5, 8.5, 14.6, 20.6, 23.0, 24.8, 26.6, 32.6, 38.6, 45.0, 45.6, 51.6, 53.35, 55.1, 56.85, 58.6]
steps = []
for t, i, kind in CU["steps"]:
    if any(0 <= t - c < 0.1 for c in CUTS): continue   # a pose reset at a cut is not a step
    if steps and t - steps[-1][0] < 0.07: continue
    steps.append((t, i, kind))
def seg(k): s = PJ[k].get("seg") or [0, None]; return s[0] or 0.0
def onsets(f, n=12, hp=150, mind=0.18):   # the n strongest single hits in a recording (for steps, clicks, cracks)
    x = load(src(f)).mean(1); x = filt(x, "highpass", hp); e2 = np.convolve(np.abs(x), np.ones(240) / 240, "same"); d = np.diff(e2, prepend=0)
    pk, _ = signal.find_peaks(d, distance=int(mind * SR)); pk = sorted(pk, key=lambda p: -d[p])[:n]; return sorted(p / SR for p in pk)
def grains(k, n, d, hp=None, lp=None):
    f = F(k); 
    if not f: return []
    return [grain(f, max(0, s - 0.01), d, hp, lp) for s in onsets(f, n)]
def place(y, t, g, pan=0.0):
    y = y.copy() if y.ndim == 2 else np.stack([y, y], 1); th = (pan + 1) * np.pi / 4; put(y * np.array([np.cos(th), np.sin(th)]) * 1.414 * db(g), t)
def verb(y, d=2.6, wet=0.6, lp=3000):   # a big concrete stairwell: exponential noise IR, dark
    ir = rng.standard_normal(int(d * SR)) * np.exp(-np.arange(int(d * SR)) / SR / (d / 6.9)); ir = filt(ir, "lowpass", lp); ir /= np.sqrt(np.sum(ir ** 2))
    m = y if y.ndim == 1 else y.mean(1); w = signal.fftconvolve(m, ir)[: len(m) + int(d * SR)]
    dry = np.zeros(len(w)); dry[: len(m)] = m; return np.stack([dry * (1 - wet) + w * wet * 0.9, dry * (1 - wet) + np.roll(w, 300) * wet * 0.9], 1)
WELL = [(0, 4.5), (20.6, 45.0), (45.6, 58.6)]
inwell = lambda t: any(a <= t < b for a, b in WELL)

# ---------------------------------------------------------------- beds
WIND = "Howling_wind.ogg"
for a, b in WELL: bed(F("concrete_stairwell_room_tone"), a, b, [[a, -30], [b, -30]], lp=5000)
bed(WIND, 0, 4.5, [[0, -40], [4.5, -40]], lp=500, rate=0.8)
bed(WIND, 26.6, 45.0, [[26.6, -40], [32, -34], [44.9, -33]], lp=600, rate=0.7)   # air moving up the shaft below the beam
bed(F("wind_window_draft") or WIND, 8.5, 20.6, [[8.5, -33], [14.6, -30], [20.6, -27]], hp=300)   # wind on the windows, a draft under the new door
bed(WIND, 58.6, 71, [[58.6, -40], [71, -46]], lp=1200)
drone(20.6, 45.0, 43.6, -34, [[20.6, -40], [38, -33], [44.9, -30]], beat=0.21, lp=500)
drone(45.6, 58.6, 41.2, -32, [[45.6, -28], [51.6, -32], [58.6, -38]], beat=0.33, lp=600)
# the bulb: buzz gated by the nearest live bulb's level, a tick on each big jump
if F("light_bulb_buzz_flicker"):
    x = load(src(F("light_bulb_buzz_flicker"))); x = filt(x, "highpass", 90); n = N; reps = int(np.ceil(n / len(x))) + 1; y = np.vstack([x] * reps)[:n]; y = y / rms(y) * db(-20)
    lv = np.interp(np.arange(N) / SR, np.arange(len(BULB)) / 24, BULB / max(1e-6, BULB.max())); lv = np.convolve(lv, np.ones(96) / 96, "same")
    m = np.array([1.0 if inwell(t) else 0.0 for t in np.arange(0, T, 1 / 24)]); m = np.interp(np.arange(N) / SR, np.arange(len(m)) / 24, m)
    put(y * (lv * m * db(-10))[:, None], 0)
    for f in range(1, len(BULB)):
        t = f / 24
        if inwell(t) and abs(BULB[f] - BULB[f - 1]) > 0.3: tk = filt(noise(0.012), "bandpass", [1500, 6000]) * np.exp(-T_(0.012) / 0.003); put(tk / np.abs(tk).max() * db(-34), t, pan=0.3)
# ---------------------------------------------------------------- the flashlight: a click at each drop-out and each return
CLK = grains("flashlight_click", 6, 0.08, hp=400)
TOFF = [(1.55, 1.8), (43.55, 43.62), (43.9, 44.05), (44.3, 44.36), (44.55, None), (48.9, 48.98)]
for i, (a, b) in enumerate(TOFF):
    if CLK: place(CLK[i % len(CLK)], a, -22, 0.2)
    if b and CLK: place(CLK[(i + 3) % len(CLK)], b, -24, 0.2)
# ---------------------------------------------------------------- steps on the picture's heel strikes
WLK = grains("boots_walking_linoleum", 10, 0.22, hp=80); STR = grains("footsteps_concrete_stairs", 10, 0.25, hp=80); RUN = grains("running_up_stairs_footsteps", 10, 0.2, hp=80)
for j, (t, i, kind) in enumerate(steps):
    pan = -0.12 if i == 0 else 0.12
    if kind == "floor" and WLK: place(WLK[j % len(WLK)], t, -21, pan)
    elif kind == "stair" and STR: place(verb(STR[j % len(STR)], 1.8, 0.45), t, -18.5 if 38.6 <= t < 45 else -21, pan)
    elif kind == "run" and RUN: place(verb(RUN[j % len(RUN)], 1.4, 0.35), t, -23, pan)
KEY = grains("keys_jingle", 6, 0.3, hp=1500)
for j, (t, i, kind) in enumerate(steps):
    if kind == "floor" and i == 1 and KEY: place(KEY[j % len(KEY)], t + 0.02, -31, 0.25)
# ---------------------------------------------------------------- breath
if F("heavy_breathing_scared"): bed(F("heavy_breathing_scared"), 38.6, 44.5, [[38.6, -38], [43, -32], [44.5, -40]], s0=seg("heavy_breathing_scared"), lp=6000)
if F("breath_running"): bed(F("breath_running"), 51.6, 58.6, [[51.6, -40], [52.0, -32], [57.5, -30], [58.6, -42]], s0=seg("breath_running"))
# ---------------------------------------------------------------- the child crying far below: heavy reverb, never closer, cut mid-sob at B30
if F("child_crying"):
    x = load(src(F("child_crying"))); s = int(seg("child_crying") * SR); x = np.vstack([x[s:], x[:s]]); d0, d1 = 33.6, 43.2; n = int((d1 - d0) * SR)
    while len(x) < n: x = np.vstack([x, x])
    y = filt(x[:n].mean(1), "bandpass", [300, 3500]); y = y / rms(y) * db(-20); g = db(np.interp(np.arange(n) / SR, [0, 1.5, 9.6], [-14, 0, 0])); w = verb(y * g, 3.2, 0.82, 2500)
    w = w[:n]; w[-48:] *= np.linspace(1, 0, 48)[:, None]; put(w * db(-16), d0)   # the cut: dry and wet stop together (it stopped)
# ---------------------------------------------------------------- hook, card, cuts
DRP = grains("water_drip", 4, 0.4, hp=500)
if DRP: place(verb(DRP[0], 2.5, 0.6), 3.0, -30, -0.3); place(verb(DRP[1 % len(DRP)], 2.5, 0.6), 29.4, -32, 0.3)
put(boom(52, 2.4, 0.4) * db(-20), 1.8); put(filt(noise(2.0), "bandpass", [200, 900]) * np.exp(-T_(2.0) / 0.5) * db(-34), 1.8)   # a low sting as it is closer
put(boom(48, 2.8, 0.5) * db(-16), 4.55)   # card hit
if F("shakuhachi"): shot(F("shakuhachi"), 4.9, -22, s=seg("shakuhachi"), d=3.0, fade=1.2)
WSH = grains("whoosh", 4, 0.5, hp=200)
for i, c in enumerate([23.0, 24.8, 53.35, 55.1, 56.85]):
    if WSH: place(WSH[i % len(WSH)], c - 0.18, -27 if c < 50 else -24, 0.0)
DC = "metal_door_close" if F("metal_door_close") else "door_creak_metal"
if F(DC): shot(F(DC), 20.62, -26, s=seg(DC), d=1.2, hp=150, fade=0.4)   # the door shuts behind him
# ---------------------------------------------------------------- THE HIT (45.6): sub drop, impact, a dissonant cluster; then only the hum
put(boom(38, 4.5, 0.55) * db(-6), 45.6)
if F("deep_impact_boom"): shot(F("deep_impact_boom"), 45.6, -4, s=seg("deep_impact_boom"), d=3.5, fade=1.5)
tt = T_(5.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (233.1, 246.9, 277.2, 293.7, 349.2)) * np.exp(-tt / 1.6) * env(len(tt), 0.01); put(filt(cl, "lowpass", 2000) / np.abs(cl).max() * db(-12), 45.62)
# the neck creaks on the stop-motion tilt (hook after the jump, and the face below)
CRK = grains("neck_crack", 8, 0.18, hp=200)
sn = [t for t in CU["snaps"] if (1.8 <= t < 4.4) or (46.0 <= t < 51.5)]
for i, t in enumerate(sn[::3]):
    if CRK: place(CRK[i % len(CRK)], t, -30 if t < 5 else -26, -0.1)
# ---------------------------------------------------------------- dawn: crows, the mop on its swing, the wringer, crying under the tiles
if F("crows_morning"): bed(F("crows_morning"), 58.6, 71, [[58.6, -30], [60, -22], [70, -27]], s0=seg("crows_morning"), hp=400)
MOP = grains("wet_mop_floor", 6, 0.55, hp=120)
k = int(np.ceil(58.9 * 1.35 / np.pi))
while k * np.pi / 1.35 < 70.3:
    t = k * np.pi / 1.35
    if MOP: place(MOP[k % len(MOP)], t - 0.2, -14, 0.15 if k % 2 else -0.15)
    k += 1
if F("mop_bucket_wringer"): shot(F("mop_bucket_wringer"), 59.4, -22, s=seg("mop_bucket_wringer"), d=1.4, fade=0.4)
if F("child_crying"):
    x = load(src(F("child_crying"))); s = int((seg("child_crying") + 3.0) * SR); y = x[s:s + int(4.5 * SR)].mean(1); y = filt(y, "lowpass", 420); y = y / rms(y) * db(-20)
    g = np.interp(np.arange(len(y)) / SR, [0, 1.5, 3.4, 4.5], [0, 1, 1, 0]); put(verb(y * g, 1.6, 0.5, 600) * db(-21), 65.6)   # under the floor
# ---------------------------------------------------------------- master
blk = int(0.5 * SR); e = np.array([np.sqrt(np.mean(out[i:i + blk] ** 2)) + 1e-9 for i in range(0, N, blk)])
st = np.convolve(e, np.ones(6) / 6, "same"); tgt = np.median(st[st > 1e-4]) * db(2.5)
ride = np.clip(tgt / st, 1, db(6)); ride[int(44.0 / 0.5):int(51.6 / 0.5)] = 1; ride[int(4.4 / 0.5):int(8.6 / 0.5)] = 1; ride[int(58.6 / 0.5):] = 1
ride = np.convolve(np.repeat(ride, blk)[:N], np.ones(int(0.6 * SR)) / int(0.6 * SR), "same"); out *= ride[:, None]
out += filt(out, "bandpass", [1200, 4000]) * (db(2) - 1)
out = filt(out, "highpass", 32, 4)   # keep the 20-30 Hz rumble out of small speakers
a, b, f = int(45.0 * SR), int(45.6 * SR), int(0.01 * SR)
out[a - f:a] *= np.linspace(1, 0, f)[:, None]; out[a:b] = 0
tail = np.interp(np.arange(N) / SR, [0, 0.15, 70.0, 71.0], [0, 1, 1, 0]); out *= tail[:, None]
meter = pyln.Meter(SR); out *= db(-20 - meter.integrated_loudness(out))
# master compressor (ratio 3 above -22 dBFS, ~10 ms attack / 150 ms release) so the peaks stop dragging the body down
lv = np.abs(out).max(1); att = signal.lfilter([1 - np.exp(-1 / (0.01 * SR))], [1, -np.exp(-1 / (0.01 * SR))], lv)
rel = signal.lfilter([1 - np.exp(-1 / (0.15 * SR))], [1, -np.exp(-1 / (0.15 * SR))], lv); ev = np.maximum(att, rel)
ed = 20 * np.log10(ev + 1e-9); gr = np.where(ed > -25, (ed + 25) * (1 / 4 - 1), 0); out *= db(gr)[:, None]
out[a:b] = 0
L = meter.integrated_loudness(out); out *= db(-13.3 - L)
lim = db(-5.0)
for _ in range(3):
    if np.abs(out).max() <= lim: break
    g = np.minimum(1, lim / (np.abs(out).max(1) + 1e-9)); g = np.minimum.reduce([np.roll(g, s) for s in range(-240, 241, 24)]); out *= g[:, None]
hd = np.interp(np.arange(N) / SR, [0, 5.3, 5.7, 7.3, 7.7, 46.2, 46.6, 51.4, 51.8, 52.6, 80], [0, 0, -3.5, -3.5, 0, 0, -3, -3.5, -3.5, 0, 0]); out *= db(hd)[:, None]   # after the strike the body sits under it: THE HIT stays the loudest moment
# THE HIT must stay the loudest 100 ms: any other window within 1 dB of it is pulled down locally (smooth 0.3 s gain dips)
for _ in range(6):
    w100 = 10 * np.log10(np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1) + 1e-12)
    hitv = w100[int(45.6 / 0.05):int(46.4 / 0.05)].max(); bad = [i for i in range(len(w100)) if not (45.5 <= i * 0.05 <= 46.4) and w100[i] > hitv - 1.0]
    if not bad: break
    dip = np.zeros(N)
    for i in bad: c = int((i * 0.05 + 0.05) * SR); h = int(0.3 * SR); dip[max(0, c - h):c + h] = np.maximum(dip[max(0, c - h):c + h], w100[i] - (hitv - 1.5))
    dip = np.convolve(dip, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same"); out *= db(-dip)[:, None]
arc = np.interp(np.arange(N) / SR, [0, 8.3, 8.7, 20.4, 20.8, 38.4, 38.8, 44.9, 45.0, 51.4, 51.8, 57.9, 58.8, 80], [-4.0, -4.0, -0.5, -0.5, -3.2, -3.2, -3.2, -3.2, 0.7, 0.7, 0.0, 0.0, -3.0, -3.0]); out *= db(arc)[:, None]   # the story arc: the hit act stays on top, the ending decays
out *= db(-14.2 - meter.integrated_loudness(out)); lim = db(-5.0)   # make-up to the target, then the peak limiter again
for _ in range(4):
    if np.abs(out).max() <= lim: break
    g = np.minimum(1, lim / (np.abs(out).max(1) + 1e-9)); g = np.minimum.reduce([np.roll(g, s) for s in range(-240, 241, 24)]); out *= g[:, None]
out[int(45.0 * SR):int(45.6 * SR)] = 0
# THE HIT must stay the loudest 100 ms: any other window within 1 dB of it is pulled down locally (smooth 0.3 s gain dips)
for _ in range(6):
    w100 = 10 * np.log10(np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1) + 1e-12)
    hitv = w100[int(45.6 / 0.05):int(46.4 / 0.05)].max(); bad = [i for i in range(len(w100)) if not (45.5 <= i * 0.05 <= 46.4) and w100[i] > hitv - 1.0]
    if not bad: break
    dip = np.zeros(N)
    for i in bad: c = int((i * 0.05 + 0.05) * SR); h = int(0.3 * SR); dip[max(0, c - h):c + h] = np.maximum(dip[max(0, c - h):c + h], w100[i] - (hitv - 1.5))
    dip = np.convolve(dip, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same"); out *= db(-dip)[:, None]
out = filt(out, 'lowpass', 15000, 2); out[int(45.0 * SR):int(45.6 * SR)] = 0
# THE HIT must also be the loudest K-weighted momentary (0.4 s) window: dip any other window within 1 LU of it
mm = pyln.Meter(SR, block_size=0.4)
for _ in range(5):
    idx = list(range(0, N - int(0.4 * SR), int(0.1 * SR))); ml = []
    for i in idx:
        with np.errstate(all="ignore"):
            try: v = mm.integrated_loudness(out[i:i + int(0.4 * SR)])
            except Exception: v = -120
        ml.append(v if np.isfinite(v) else -120)
    ml = np.array(ml); tt0 = np.array(idx) / SR; hm = ml[(tt0 >= 45.5) & (tt0 <= 46.6)].max(); bad = np.where(((tt0 < 45.5) | (tt0 > 46.6)) & (ml > hm - 1.0))[0]
    if not len(bad): break
    dip = np.zeros(N)
    for bb in bad: c = idx[bb] + int(0.2 * SR); h = int(0.35 * SR); dip[max(0, c - h):c + h] = np.maximum(dip[max(0, c - h):c + h], ml[bb] - (hm - 1.5))
    dip = np.convolve(dip, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same"); out *= db(-dip)[:, None]
for _ in range(4):   # true-peak safety: 4x oversampled peaks held under -4.5 dBTP so AAC stays below -1.4
    osm = np.abs(signal.resample_poly(out, 4, 1, axis=0)).max(1)[:4 * N].reshape(-1, 4).max(1); lim2 = db(-4.5)
    if osm.max() <= lim2: break
    g = np.minimum(1, lim2 / (osm + 1e-9)); g = np.minimum.reduce([np.roll(g, s_) for s_ in range(-240, 241, 24)]); out *= g[:, None]
out[int(45.0 * SR):int(45.6 * SR)] = 0
L2 = meter.integrated_loudness(out)
sf.write("audio/mix.wav", out.astype(np.float32), SR, subtype="FLOAT")
w = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1); i = int(np.argmax(w))
rep = f"LUFS {L2:.1f}  peak {20 * np.log10(np.abs(out).max()):.1f} dBFS  loudest 100 ms at {i * 0.05:.2f} s ({10 * np.log10(w[i]):.1f} dBFS)  silence 45.0-45.6 max {np.abs(out[a:b]).max():.2e}"
w3 = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(3 * SR))[::int(0.25 * SR)].mean(1); j = int(np.argmax(w3)); rep += f"  loudest 3 s at {j * 0.25:.2f} s"
sec = [10 * np.log10(np.mean(out[int(k * SR):int((k + 1) * SR)] ** 2) + 1e-12) for k in range(71)]; rep += "\nper second dBFS: " + " ".join(f"{k}:{v:.0f}" for k, v in enumerate(sec))
open("audio/levels.txt", "w").write(rep + "\n"); print(rep)
