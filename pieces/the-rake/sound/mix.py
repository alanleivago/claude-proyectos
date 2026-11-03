# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py: the whole sound for the-rake. Freesound CC0 recordings picked with earshot (picks.json) and a code layer
(drones, the card bell and boom, the hit sub drop and cluster). Every event sits on the picture clock (src/run.js).
Exact silence 40.0-40.6 s before THE HIT. Writes audio/mix.wav and audio/levels.txt."""
import subprocess, json
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal

SR, T = 48000, 62.0; N = int(T * SR); rng = np.random.default_rng(1994)
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



PJ = json.load(open("picks.json")); PK = {k: v["file"] for k, v in PJ.items()}
def F(k): return PK.get(k)
def grain(f, s, d, hp=None, lp=None):   # a short slice of a recording, peak-normalised (a hoof, a step, a clink, a bell strike)
    x = load(src(f))[int(s * SR):int((s + d) * SR)].copy()
    if hp: x = filt(x, "highpass", hp)
    if lp: x = filt(x, "lowpass", lp)
    fd = int(min(0.04, d / 3) * SR); x[-fd:] *= np.linspace(1, 0, fd)[:, None]; x[:48] *= np.linspace(0, 1, 48)[:, None]; return x / (np.abs(x).max() + 1e-9)
def place(g, t, gain, pan=0.0):
    y = g * db(gain)
    if pan: th = (pan + 1) * np.pi / 4; y = y * np.array([np.cos(th), np.sin(th)]) * 1.414
    put(y, t)
def ss(a, b, x): u = np.clip((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u)

def S(k): s = PJ.get(k, {}).get("seg") or [0]; return float(s[0] or 0)
def B(k, t0, t1, pts, **kw):
    if F(k): bed(F(k), t0, t1, pts, s0=kw.pop("s0", S(k)), **kw)
def O(k, t, g, d, **kw):
    if F(k): shot(F(k), t, g, s=kw.pop("s", S(k)), d=d, **kw)
def G(k, d, off=0.0, **kw): return grain(F(k), S(k) + off, d, **kw) if F(k) else None

PJ = json.load(open("picks.json")); PK = {k: v["file"] for k, v in PJ.items()}
def F(k): return PK.get(k)
def grain(f, s, d, hp=None, lp=None):   # a short slice of a recording, peak-normalised
    x = load(src(f))[int(s * SR):int((s + d) * SR)].copy()
    if hp: x = filt(x, "highpass", hp)
    if lp: x = filt(x, "lowpass", lp)
    fd = int(min(0.04, d / 3) * SR); x[-fd:] *= np.linspace(1, 0, fd)[:, None]; x[:48] *= np.linspace(0, 1, 48)[:, None]; return x / (np.abs(x).max() + 1e-9)
def place(g, t, gain, pan=0.0):
    y = g * db(gain)
    if pan: th = (pan + 1) * np.pi / 4; y = y * np.array([np.cos(th), np.sin(th)]) * 1.414
    put(y, t)
def ss(a, b, x): u = np.clip((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u)
def S(k): s = PJ.get(k, {}).get("seg") or [0]; return float(s[0] or 0)
def B(k, t0, t1, pts, **kw):
    if F(k): bed(F(k), t0, t1, pts, s0=kw.pop("s0", S(k)), **kw)
def O(k, t, g, d, **kw):
    if F(k): shot(F(k), t, g, s=kw.pop("s", S(k)), d=d, **kw)
def G(k, d, off=0.0, **kw): return grain(F(k), S(k) + off, d, **kw) if F(k) else None
# the picture's clocks (src/run.js)
def hsh(i, k): return (np.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1.0
def broken(t): s = np.floor(t * 20); h = hsh(s, 9); burst = hsh(np.floor(t * 2.5), 4) > 0.55; return (1 if h > 0.45 else 0.18 if h > 0.25 else 0.0) if burst else (0.12 if h > 0.94 else 1)
SIL0, HIT = 40.0, 40.6
CUTS = [14.0, 20.0, 26.0, 32.0, 37.0, 46.0, 52.0]

# ---------------------------------------------------------------- beds
B("winter_wind_house", 0, 40.0, [[0, -27], [4.5, -30], [8.5, -22], [14, -29], [26, -31], [32, -30], [39.9, -33]], lp=2500)
B("room_tone_night", 0, 40.0, [[0, -36], [8.5, -40], [14, -34], [40, -34]], hp=60)
B("fireplace_crackle", 14.0, 40.0, [[14, -34], [20, -33], [26, -28], [32, -31], [40, -36]], hp=200)   # the irori (loudest across it, 26–32)
B("old_woman_breathing_sleeping", 26.0, 32.6, [[26, -27], [30, -26], [31.4, -30], [32.6, -40]])       # her breath; it bends over her (30–31.4)
B("scared_breathing_woman", 14.6, 20.0, [[14.6, -34], [17, -30], [20, -31]])
B("scared_breathing_woman", 37.0, 39.95, [[37, -27], [39.9, -25]])
B("winter_wind_house", 46.0, 62.0, [[46, -28], [52, -26], [61, -28], [62, -34]], lp=2200)
B("room_tone_night", 52.0, 62.0, [[52, -34], [62, -36]], hp=60)
B("heartbeat", 32.9, 39.95, [[32.9, -38], [37, -31], [39.9, -28]], lp=900)

# ---------------------------------------------------------------- the damaged lamp: a sputter on every drop-out, a soft catch when it comes back
SP = [G("candle_flame_sputter", 0.18, off=o) for o in (0.0, 0.3, 0.7)]
def lamp_events(t0, t1, dmg, g):
    prev, k = 1.0, 0
    for t in np.arange(t0, t1, 0.05):
        v = 1 + (broken(t) - 1) * dmg
        if SP[0] is not None and prev > 0.7 and v < 0.5: place(SP[k % 3], t, g, -0.25); k += 1
        if SP[0] is not None and prev < 0.5 and v > 0.7: place(SP[(k + 1) % 3], t, g - 6, -0.25); k += 1
        prev = v
lamp_events(0.0, 4.45, 1.0, -21); lamp_events(14.0, 19.95, 0.6, -27)
B("candle_flame_sputter", 0, 4.45, [[0, -30], [4.4, -32]], hp=300)

# ---------------------------------------------------------------- joints: the head ticks (hook 0.7–1.6, the tilt 23.1–24.6), a dry crack on each step
CR = [G("bone_crack", 0.25, off=o) for o in (0.0, 0.12)]
for i, t in enumerate([0.7, 1.0, 1.3, 1.6]):
    if CR[0] is not None: place(CR[i % 2], t - 0.03, -20)
for i in range(6):
    t = 22.8 + (i + 0.9) * 0.3
    if CR[0] is not None: place(CR[i % 2], t - 0.02, -15 - (5 - i) * 0.6)
O("creature_hiss", 24.7, -27, 1.4, lp=3000)

# ---------------------------------------------------------------- the crawl (26.6–30): a claw tick on every limb landing (gait Lc 0.55, len 2.305)
CL = [G("claws_scratching_wood", 0.12, off=o) for o in (0.0, 0.2, 0.45, 0.7)]
LEN, LC = 2.305, 0.55
def s_of(t): return LEN * ss(26.6, 30.0, t)
for j, off in enumerate((0.0, 0.5, 0.5, 0.0)):
    pf = None
    for t in np.arange(26.6, 30.05, 0.005):
        u = s_of(t) / LC - off; f = u - np.floor(u)
        if pf is not None and pf < 0.4 <= f and CL[0] is not None: place(CL[(j + int(t * 7)) % 4], t, -19 if j < 2 else -23, -0.1 + 0.1 * j)
        pf = f
for t in (27.3, 28.8): O("wooden_floor_creak", t, -24, 0.9, lp=4000)
for t in (16.2, 18.6): O("wooden_floor_creak", t, -28, 0.9, lp=3500)
O("wooden_floor_creak", 30.2, -26, 0.9, lp=3500)

# ---------------------------------------------------------------- the match (32.85), it turns (33.2), scrambles (34.0–34.8), tears the paper (34.85)
O("match_strike", 32.82, -17, 1.2)
O("creature_hiss", 33.25, -21, 1.1, lp=4000)
O("claws_scratching_wood", 33.95, -20, 0.9)
O("paper_tearing", 34.83, -15, 1.0)
O("wooden_floor_creak", 35.2, -24, 0.7, lp=3000)
# ---------------------------------------------------------------- I run (37–39.1): bare feet on the boards (walkWoman L 0.5, 1.5 m/s, contacts at s/L = n + 0.4 + 0.5j)
FT = [G("barefoot_running_wooden_floor", 0.22, off=o) for o in (0.0, 0.5, 1.0, 1.5)]
k = 0
for n in range(12):
    for jj in (0, 0.5):
        t = 37 + 0.5 * (n + 0.4 + jj) / 1.5
        if 37.0 < t < 39.1 and FT[0] is not None: place(FT[k % 4], t, -17, 0.05); k += 1
O("candle_flame_sputter", 39.4, -20, 0.4)    # the match gutters
put(filt(noise(0.2), "bandpass", [300, 1500]) * np.exp(-T_(0.2) / 0.06) * db(-26), 39.72)

# ---------------------------------------------------------------- THE HIT (40.6)
put(boom(40, 5.0, 0.5) * db(0), HIT)
O("cinematic_impact_boom", HIT, -1, 3.0)
tt = T_(6.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (92.5, 98.0, 138.6, 146.8, 196.0)) * np.exp(-tt / 2.4) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 2200) * db(-13), HIT, pan=0.1)
O("creature_hiss", HIT + 0.02, -10, 1.6, lp=5000)
O("bone_crack", HIT + 0.02, -9, 0.5)
# it looks up (41.3–41.9): a slow neck crack; it speaks my name (43.4–44.6): a whisper pitched down, close
O("bone_crack", 41.35, -16, 0.4); O("bone_crack", 41.75, -18, 0.4)
O("creepy_whisper", 43.35, -13, 1.4, rate=0.82, lp=6000)
drone(40.6, 46.0, 30, -21, [[40.6, 3], [46, -1]], beat=0.4, lp=600)
# ---------------------------------------------------------------- morning (46–52): a far dog, a temple bell
O("dog_barking_distant", 47.4, -30, 1.6, lp=3000, pan=0.3)
O("temple_bell", 48.6, -27, 3.4, lp=3500)
# ---------------------------------------------------------------- years later (52–62): a soft scrape of claws on the engawa, the drone
O("claws_scratching_wood", 54.4, -27, 1.2, lp=2500, pan=-0.4); O("claws_scratching_wood", 57.9, -29, 1.0, lp=2500, pan=-0.4)
O("bone_crack", 55.6, -27, 0.3, pan=-0.4)

# ---------------------------------------------------------------- code layer
drone(0, 8.5, 41, -31, [[0, -2], [2.2, 0], [4.4, -3], [8.5, -10]])
O("shakuhachi", 5.0, -26, 3.0, lp=5000)
bcard = bell(98, 3.8); bcard *= np.interp(np.arange(len(bcard)), [0, len(bcard) * 0.6, len(bcard)], [1, 1, 0]); put(bcard * db(-30), 4.75, pan=-0.1); put(boom(60, 2.4, 0.4) * db(-27), 4.75)
drone(14.0, 40.0, 34, -31, [[14, -12], [20, -8], [26, -6], [32, -5], [40, -4]], beat=0.2, lp=600)
drone(52.0, 62.0, 36, -32, [[52, -6], [57, -2], [62, -8]], beat=0.25, lp=500)
put(bell(660, 3.0, ((1, 1), (2.76, 0.3), (5.4, 0.1))) * db(-28), 57.3, pan=0.3)               # the badge
def whoosh(t, g, d=0.6, f0=300, f1=2400):
    n = int(d * SR); x = noise(d); yy = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        fc = f0 + (f1 - f0) * (i / n) ** 2; yy[i:i + seg] = filt(x[max(0, i - 2048):i + seg], "bandpass", [fc * 0.7, fc * 1.4])[-len(yy[i:i + seg]):]
    yy *= (np.arange(n) / n) ** 2.2; put(yy / np.abs(yy).max() * db(g), t - d)
whoosh(4.5, -34, 0.5); put(boom(50, 0.6, 0.3) * db(-30), 4.5); whoosh(8.6, -32, 0.4)
for tc in CUTS: whoosh(tc, -27); put(boom(55, 0.7, 0.3) * db(-21), tc); put(filt(noise(0.06), "bandpass", [800, 3000]) * np.exp(-T_(0.06) / 0.015) * db(-23), tc)

# the house outside (8.5-14): a second pass of the wind from another part of the take, plus a code gust layer
B("winter_wind_house", 8.5, 14.0, [[8.5, -21], [11, -19], [14, -24]], s0=S("winter_wind_house") + 20, lp=3000)
B("dog_barking_distant", 9.5, 13.8, [[9.5, -30], [13.8, -32]], lp=3000)
_g = filt(brown(5.5), "lowpass", 700); _tt = T_(5.5); put(_g * (0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * _tt)) * np.interp(_tt, [0, 0.5, 5.0, 5.5], [0, 1, 1, 0]) * db(-24), 8.5)

# ---------------------------------------------------------------- master
blk = int(0.5 * SR); e = np.array([np.sqrt(np.mean(out[i:i + blk] ** 2)) + 1e-9 for i in range(0, N, blk)])
st = np.convolve(e, np.ones(6) / 6, "same"); tgt = np.median(st[st > 1e-4]) * db(2.5)
ride = np.clip(tgt / st, 1, db(6)); ride[int(39.0 / 0.5):int(46.0 / 0.5)] = 1; ride[int(4.4 / 0.5):int(8.6 / 0.5)] = 1; ride[int(52.0 / 0.5):] = 1
ride = np.convolve(np.repeat(ride, blk)[:N], np.ones(int(0.6 * SR)) / int(0.6 * SR), "same"); out *= ride[:, None]
out += filt(out, "bandpass", [1200, 4000]) * (db(2) - 1)
out = filt(out, "highpass", 32, 4)
a, b, f = int(SIL0 * SR), int(HIT * SR), int(0.01 * SR)
out[a - f:a] *= np.linspace(1, 0, f)[:, None]; out[a:b] = 0
tail = np.interp(np.arange(N) / SR, [0, 0.15, 61.2, 62.0], [0, 1, 1, 0]); out *= tail[:, None]
meter = pyln.Meter(SR); out *= db(-20 - meter.integrated_loudness(out))
lv = np.abs(out).max(1); att = signal.lfilter([1 - np.exp(-1 / (0.01 * SR))], [1, -np.exp(-1 / (0.01 * SR))], lv)
rel = signal.lfilter([1 - np.exp(-1 / (0.15 * SR))], [1, -np.exp(-1 / (0.15 * SR))], lv); ev = np.maximum(att, rel)
ed = 20 * np.log10(ev + 1e-9); gr = np.where(ed > -25, (ed + 25) * (1 / 4 - 1), 0); out *= db(gr)[:, None]
out[a:b] = 0
hd = np.interp(np.arange(N) / SR, [0, 41.2, 41.6, 45.8, 46.2, 80], [0, 0, -1.5, -1.5, 0, 0]); out *= db(hd)[:, None]
arc = np.interp(np.arange(N) / SR, [0, 8.3, 8.7, 25.8, 26.2, 39.9, 40.0, 51.8, 52.4, 80], [-2.0, -2.0, -2.0, -2.0, -3.2, -3.2, 0.8, 0.8, -5.0, -5.0]); out *= db(arc)[:, None]
def limit(lim):
    global out
    for _ in range(4):
        if np.abs(out).max() <= lim: break
        g = np.minimum(1, lim / (np.abs(out).max(1) + 1e-9)); g = np.minimum.reduce([np.roll(g, s) for s in range(-240, 241, 24)]); out *= g[:, None]
def guard():   # THE HIT stays the loudest 100 ms
    global out
    for _ in range(6):
        w100 = 10 * np.log10(np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1) + 1e-12)
        hitv = w100[int(HIT / 0.05):int((HIT + 0.8) / 0.05)].max(); bad = [i for i in range(len(w100)) if not (HIT - 0.1 <= i * 0.05 <= HIT + 0.8) and w100[i] > hitv - 1.0]
        if not bad: break
        dip = np.zeros(N)
        for i in bad: c = int((i * 0.05 + 0.05) * SR); h = int(0.3 * SR); dip[max(0, c - h):c + h] = np.maximum(dip[max(0, c - h):c + h], w100[i] - (hitv - 1.5))
        dip = np.convolve(dip, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same"); out *= db(-dip)[:, None]
out *= db(-14.8 - meter.integrated_loudness(out)); limit(db(-7.0)); out[a:b] = 0; guard()
out *= db(-14.8 - meter.integrated_loudness(out)); limit(db(-7.0)); out[a:b] = 0; guard()
L2 = meter.integrated_loudness(out)
# true-peak stage: AAC overshoots sharp transients, so limit the 4x-oversampled signal to -4.5 dBTP, then make up loudness
out = filt(out, "lowpass", 15000, 4)
def tplimit(lim):
    global out
    for _ in range(4):
        up = signal.resample_poly(out, 4, 1, axis=0); pk = np.abs(up).max(1).reshape(-1, 4).max(1)[:N]
        if pk.max() <= lim: break
        g = np.minimum(1, lim / (pk + 1e-9)); w = int(0.004 * SR); g = np.minimum.reduce([np.roll(g, s) for s in range(-w, w + 1, 8)])
        g = np.convolve(g, np.ones(97) / 97, "same"); out *= np.minimum(g, 1)[:, None]
for _ in range(3): out *= db(-15.2 - meter.integrated_loudness(out)); tplimit(db(-4.5)); out[a:b] = 0
L2 = meter.integrated_loudness(out)
sf.write("audio/mix.wav", out.astype(np.float32), SR, subtype="FLOAT")
w = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1); i = int(np.argmax(w))
rep = f"LUFS {L2:.1f}  peak {20 * np.log10(np.abs(out).max()):.1f} dBFS  loudest 100 ms at {i * 0.05:.2f} s ({10 * np.log10(w[i]):.1f} dBFS)  silence {SIL0}-{HIT} max {np.abs(out[a:b]).max():.2e}"
w3 = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(3 * SR))[::int(0.25 * SR)].mean(1); j = int(np.argmax(w3)); rep += f"  loudest 3 s at {j * 0.25:.2f} s"
sec = [10 * np.log10(np.mean(out[int(k * SR):int((k + 1) * SR)] ** 2) + 1e-12) for k in range(62)]; rep += "\nper second dBFS: " + " ".join(f"{k}:{v:.0f}" for k, v in enumerate(sec))
open("audio/levels.txt", "w").write(rep + "\n"); print(rep)

