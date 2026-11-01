# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the whole sound for gashadokuro: Freesound CC0 recordings picked with earshot (picks.json), the Commons
public-domain wind bed and a code layer (drones, the card bell and boom, the hit's sub drop and cluster, teeth clicks on
the jaw's own chatter clock, whooshes). Every event sits on the picture's clock (src/run.js; cues.json for the hero bones).
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
CU = json.load(open("cues.json"))
WIND = "Howling_wind.ogg"
CUTS = [14.6, 20.6, 26.6, 32.6, 38.6, 51.6, 58.0]

# ---------------------------------------------------------------- beds
bed(WIND, 0, 45.0, [[0, -30], [8.5, -33], [26.6, -31], [27.5, -38], [32.6, -38], [44.9, -34]], lp=1400)   # the mountain wind (Commons)
B("winter_wind_mountain", 0, 4.5, [[0, -28], [4.5, -30]])
B("tree_creaking", 0.4, 4.4, [[0.4, -32], [4.4, -32]], lp=3000)
B("winter_wind_mountain", 8.5, 26.6, [[8.5, -22], [14.6, -23], [20.6, -26], [26.6, -27]])
B("wind_through_grass", 8.5, 27.4, [[8.5, -27], [14.6, -26], [26.6, -27], [27.4, -40]])            # the wind drops out when the clicking starts (27.0)
B("bones_rattle", 27.0, 32.6, [[27.0, -40], [28.5, -24], [32.6, -21]])                              # the field bones tremble (k ramps 27.0–28.5)
B("bones_falling", 32.9, 38.6, [[32.9, -30], [34.5, -22], [38.6, -24]])                             # the field tumbling uphill (t0 32.9–36.2)
B("winter_wind_mountain", 32.6, 45.0, [[32.6, -30], [38.6, -28], [44.9, -30]])
B("stone_grinding", 45.6, 51.6, [[45.6, -18], [50.5, -20], [51.6, -26]], lp=2500)                    # the face lowers (45.6–50.5)
B("monster_breathing_deep", 46.5, 51.6, [[46.5, -26], [50.5, -22], [51.6, -26]], lp=2500)
B("winter_wind_mountain", 51.6, 58.0, [[51.6, -34], [58, -32]])
B("wind_through_grass", 58.0, 71.0, [[58, -25], [70, -27], [71, -30]])
B("winter_wind_mountain", 58.0, 71.0, [[58, -30], [71, -32]])

# ---------------------------------------------------------------- the jaw's chatter clock: chatter(t) = 0.06 + 0.07·max(0, sin 19t) + 0.04·max(0, sin(31t+1));
# a click every time sin 19t peaks (the jaw shuts back) — hook 0–4.5 (far) and the hit 45.6–51 (close, slowing 49–51)
TC = grain(F("teeth_chattering"), 3.86, 0.16, hp=600)
def clicks(t0, t1, g, k=lambda t: 1.0, pan=0.0):
    n0 = int(np.ceil((t0 * 19 - np.pi / 2) / (2 * np.pi)))
    while True:
        t = (np.pi / 2 + 2 * np.pi * n0) / 19
        if t >= t1: break
        a = k(t)
        if a > 0.05 and TC is not None: place(TC, t, g + 20 * np.log10(a), pan)
        n0 += 1
clicks(0.3, 4.4, -24, pan=0.05)
B("teeth_chattering", 0.3, 4.4, [[0.3, -34], [2.2, -30], [4.4, -33]], hp=500)
clicks(45.6, 51.0, -16, k=lambda t: 1 - 0.6 * ss(49, 51, t))
B("teeth_chattering", 45.6, 51.4, [[45.6, -21], [49, -23], [51.4, -32]], hp=400)

# ---------------------------------------------------------------- hook: it rises (0–2.2): a deep grinding swell
O("stone_grinding", 0.05, -24, 2.4, lp=1800)

# ---------------------------------------------------------------- card (4.5–8.5): a breath of shakuhachi, a far temple bell
O("shakuhachi", 5.0, -27, 3.2, lp=5000)
O("temple_bell", 5.6, -29, 2.8, s=65.23, lp=4000)

# ---------------------------------------------------------------- crows (14.6–20.6): caws, pecks on the neck's peck cycle, one takes off at 15.5
O("crow_caw", 14.9, -25, 1.1, pan=-0.3); O("crow_caw", 17.3, -28, 1.1, pan=0.2); O("crow_caw", 19.2, -28, 1.0, pan=-0.1)
O("bird_wings_flapping", 15.45, -23, 1.4, pan=0.2)
PE = G("bones_rattle", 0.06, hp=1500)
for i in range(5):
    w = 3 + i * 0.4
    for n in range(40):
        t = (np.pi / 2 + 2 * np.pi * n - i * 2) / w
        if 14.7 < t < 20.5 and PE is not None and not (i == 4 and t > 15.4): place(PE, t, -30, pan=-0.2 + 0.1 * i)

# ---------------------------------------------------------------- her steps: walkGirl contacts s/L = n + 0.38 + 0.5j (L 0.42)
STP = [G("footsteps_snow", 0.28, off=o) for o in (0.0, 0.55, 1.1, 1.65)]
def steps(t0, t1, speed, g, pan=0.0):
    k = 0
    for n in range(80):
        for j in (0, 1):
            t = t0 + 0.42 * (n + 0.38 + 0.5 * j) / speed
            if t0 < t < t1 and STP[0] is not None: place(STP[k % 4], t - 0.02, g, pan); k += 1
steps(20.6, 26.55, 0.55, -18); steps(38.6, 44.95, 0.5, -16)
steps(0.0, 4.4, 0.42, -40, pan=-0.3)                                                                  # the hook: far, tiny
for t in (21.9, 23.8, 25.6): O("wooden_creak_small", t, -28, 0.5, lp=4000)                        # the lantern pole creaks
# 26.6: she stops; the clicking rises all round
# ---------------------------------------------------------------- the roll (32.6–38.6): every hop of a hero bone lands (sin(1.6·dist + ph) = 0, dist = 1.9·(t − t0))
HB = [G("bones_falling", 0.25, off=o) for o in (0.0, 0.4, 0.9, 1.3)]
for i, e in enumerate(CU["hero"]):
    for n in range(1, 40):
        dist = (n * np.pi - e["ph"]) / 1.6
        if dist <= 0.15: continue
        t = e["t0"] + dist / 1.9
        if t < 38.55 and HB[0] is not None: place(HB[(i + n) % 4], t, -21 if not e["sk"] else -19, pan=-0.3 + 0.07 * i)
O("skull_rolling", 33.1, -22, 3.0)
# ---------------------------------------------------------------- the hand (38.6–45.0): fingers touch down (sin(2π·ph + 1.7i) back to 0, ph = 2.4(t − 38.6)/1.1)
for i in range(5):
    for k in range(30):
        t = 38.6 + ((np.pi * (2 * k + 2) - 1.7 * i) / (2 * np.pi)) * 1.1 / 2.4
        if 38.7 < t < 44.95: put(boom(55 + 6 * i, 0.35, 0.3) * db(-28), t, pan=-0.4); O("bone_crack", t, -30, 0.3, pan=-0.4, lp=2500)
drone(38.6, 45.0, 36, -30, [[38.6, -10], [42, -4], [44.9, 2]], beat=0.25, lp=600)
# the lantern gutters (44.3–44.9) and dies
O("paper_rustle", 44.3, -24, 0.6); n_ = noise(0.25); put(filt(n_, "bandpass", [300, 1500]) * np.exp(-T_(0.25) / 0.08) * db(-28), 44.85)

# ---------------------------------------------------------------- THE HIT (45.6)
put(boom(40, 5.0, 0.5) * db(0), 45.6)
O("cinematic_impact_boom", 45.6, -1, 3.0)
tt = T_(7.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (92.5, 98.0, 138.6, 146.8, 196.0)) * np.exp(-tt / 2.6) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 2200) * db(-13), 45.6, pan=0.1)
O("bones_rattle", 45.62, -8, 2.0)
O("bone_crack", 45.62, -9, 0.6)
# its head and arms settle (50.5): a creak of bone; the teeth close-up (51.6–58): near silence, single clicks when the jaw shuts (sin 2t minima 52.6, 55.75)
O("tree_creaking", 50.4, -22, 1.2, lp=2500)
for t in (52.6, 55.75): place(TC, t, -16) if TC is not None else None
tt = T_(6.2); hi = np.sin(2 * np.pi * 2350 * tt) * 0.6 + np.sin(2 * np.pi * 2363 * tt) * 0.4; put(hi * env(len(tt), 1.0) * np.interp(tt, [0, 5, 6.2], [1, 1, 0]) * db(-40), 51.7)
drone(51.6, 58.0, 32, -32, [[51.6, -2], [58, -8]], beat=0.2, lp=500)
# ---------------------------------------------------------------- day (58–71)
O("crow_caw", 60.4, -28, 1.0, pan=0.3, lp=4000)
O("temple_bell", 63.0, -26, 4.0, s=65.23, lp=3500)

# ---------------------------------------------------------------- code layer
drone(0, 8.5, 41, -31, [[0, -2], [2.2, 0], [4.4, -3], [8.5, -10]])
bcard = bell(98, 3.8); bcard *= np.interp(np.arange(len(bcard)), [0, len(bcard) * 0.6, len(bcard)], [1, 1, 0]); put(bcard * db(-30), 4.75, pan=-0.1); put(boom(60, 2.4, 0.4) * db(-27), 4.75)
drone(20.6, 38.6, 34, -31, [[20.6, -12], [26.6, -6], [32.6, -2], [38.6, -2]], beat=0.2, lp=600)
drone(45.6, 51.6, 30, -24, [[45.6, 3], [51.6, -2]], beat=0.4, lp=600)
drone(58.0, 71.0, 38, -33, [[58, -8], [66, -2], [71, -8]], beat=0.25, lp=500)
put(bell(660, 3.0, ((1, 1), (2.76, 0.3), (5.4, 0.1))) * db(-27), 66.3, pan=0.3)               # the badge
def whoosh(t, g, d=0.6, f0=300, f1=2400):
    n = int(d * SR); x = noise(d); yy = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        fc = f0 + (f1 - f0) * (i / n) ** 2; yy[i:i + seg] = filt(x[max(0, i - 2048):i + seg], "bandpass", [fc * 0.7, fc * 1.4])[-len(yy[i:i + seg]):]
    yy *= (np.arange(n) / n) ** 2.2; put(yy / np.abs(yy).max() * db(g), t - d)
whoosh(4.5, -34, 0.5); put(boom(50, 0.6, 0.3) * db(-30), 4.5); whoosh(8.6, -32, 0.4)
for tc in CUTS: whoosh(tc, -26); put(boom(55, 0.7, 0.3) * db(-20), tc); put(filt(noise(0.06), "bandpass", [800, 3000]) * np.exp(-T_(0.06) / 0.015) * db(-22), tc)
# ---------------------------------------------------------------- master
import os
if os.environ.get('MIX_DEBUG'): sf.write('audio/premaster.wav', out.astype(np.float32), SR, subtype='FLOAT')
blk = int(0.5 * SR); e = np.array([np.sqrt(np.mean(out[i:i + blk] ** 2)) + 1e-9 for i in range(0, N, blk)])
st = np.convolve(e, np.ones(6) / 6, "same"); tgt = np.median(st[st > 1e-4]) * db(2.5)
ride = np.clip(tgt / st, 1, db(6)); ride[int(44.0 / 0.5):int(51.6 / 0.5)] = 1; ride[int(14.0 / 0.5):int(20.8 / 0.5)] = 1; ride[int(4.4 / 0.5):int(8.6 / 0.5)] = 1; ride[int(58.0 / 0.5):] = 1
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
hd = np.interp(np.arange(N) / SR, [0, 46.2, 46.6, 51.4, 51.8, 80], [0, 0, -3, -3, 0, 0]); out *= db(hd)[:, None]   # after the strike the body sits under it: THE HIT stays the loudest moment
# THE HIT must stay the loudest 100 ms: any other window within 1 dB of it is pulled down locally (smooth 0.3 s gain dips)
for _ in range(6):
    w100 = 10 * np.log10(np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1) + 1e-12)
    hitv = w100[int(45.6 / 0.05):int(46.4 / 0.05)].max(); bad = [i for i in range(len(w100)) if not (45.5 <= i * 0.05 <= 46.4) and w100[i] > hitv - 1.0]
    if not bad: break
    dip = np.zeros(N)
    for i in bad: c = int((i * 0.05 + 0.05) * SR); h = int(0.3 * SR); dip[max(0, c - h):c + h] = np.maximum(dip[max(0, c - h):c + h], w100[i] - (hitv - 1.5))
    dip = np.convolve(dip, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same"); out *= db(-dip)[:, None]
arc = np.interp(np.arange(N) / SR, [0, 8.3, 8.7, 20.4, 20.8, 44.9, 45.0, 57.8, 58.4, 80], [-2.0, -2.0, 0, 0, -4.2, -4.2, 0.7, 0.7, -2.5, -2.5]); out *= db(arc)[:, None]   # the story arc: the hit act stays on top, the ending decays
out *= db(-14.5 - meter.integrated_loudness(out)); lim = db(-5.0)   # make-up to the target, then the peak limiter again
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
L2 = meter.integrated_loudness(out)
sf.write("audio/mix.wav", out.astype(np.float32), SR, subtype="FLOAT")
w = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1); i = int(np.argmax(w))
rep = f"LUFS {L2:.1f}  peak {20 * np.log10(np.abs(out).max()):.1f} dBFS  loudest 100 ms at {i * 0.05:.2f} s ({10 * np.log10(w[i]):.1f} dBFS)  silence 45.0-45.6 max {np.abs(out[a:b]).max():.2e}"
w3 = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(3 * SR))[::int(0.25 * SR)].mean(1); j = int(np.argmax(w3)); rep += f"  loudest 3 s at {j * 0.25:.2f} s"
sec = [10 * np.log10(np.mean(out[int(k * SR):int((k + 1) * SR)] ** 2) + 1e-12) for k in range(71)]; rep += "\nper second dBFS: " + " ".join(f"{k}:{v:.0f}" for k, v in enumerate(sec))
open("audio/levels.txt", "w").write(rep + "\n"); print(rep)
