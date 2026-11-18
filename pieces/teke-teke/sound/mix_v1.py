# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the whole sound for teke-teke: Freesound CC0 recordings picked with earshot (picks.json), the Commons
public-domain wind bed and a code layer (drones, the card bell and boom, the hit's sub drop and cluster, teeth clicks on
the jaw's own chatter clock, whooshes). Every event sits on the picture's clock (src/run.js: the crossing lamp clock, the crawl plants, the walk cycles, the train).
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
# ================================================================ TEKE TEKE: every event on the picture's clock (src/run.js)
import math
def hsh(i, k=1.0): v = math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - math.floor(v)
def sm(a, b, x): u = min(1, max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u)
def Gon(k, d, n, hp=None, lp=None, span=None, whole=False):   # n grains starting just before the n strongest onsets (inside the picked segment, or the whole file)
    if not F(k): return [None]
    x = load(src(F(k)))
    if whole: s0, s1 = 0.0, len(x) / SR
    else:
        seg = PJ[k].get("seg") or [0, 3]; s0, s1 = float(seg[0] or 0), float(seg[1] or 3)
        if span: s1 = max(s1, s0 + span)
    a, b = int(s0 * SR), min(len(x), int(s1 * SR)); m = np.abs(x[a:b]).mean(1); e = np.convolve(m, np.ones(240) / 240, "same")
    on = np.maximum(0, np.diff(e, prepend=e[0])); idx = []
    for i in np.argsort(on)[::-1]:
        if all(abs(i - j) > int(0.15 * SR) for j in idx): idx.append(i)
        if len(idx) >= n: break
    return [grain(F(k), s0 + max(0, i - int(0.004 * SR)) / SR, d, hp=hp, lp=lp) for i in sorted(idx)]
WIND = "Howling_wind.ogg"
# ---------------------------------------------------------------- the crossing: lamps alternate every 1/2.3 s (run.js crossing(): ph = (t·1.15) mod 1); one bell strike per switch
BELL = Gon("fumikiri", 0.4, 2, hp=300) if F("fumikiri") else Gon("crossing_bell", 0.42, 2, hp=300)
def bells(t0, t1, off, g, gk=lambda t: 1.0, pan=0.0):
    k = math.ceil((t0 + off) * 2.3)
    while (k / 2.3 - off) < t1:
        t = k / 2.3 - off
        if BELL[0] is not None and gk(t) > 0.01: place(BELL[k % len(BELL)], t, g + 20 * math.log10(gk(t)), pan)
        k += 1
def motor(t0, t1, g):   # the barrier motor: a whirring hum with a gear whine, eased in and out
    d = t1 - t0; tt = T_(d); f = 95 + 25 * np.sin(np.pi * tt / d); ph = 2 * np.pi * np.cumsum(f) / SR
    y = 0.6 * np.sign(np.sin(ph)) + 0.4 * np.sin(ph * 3.01) + 0.15 * filt(noise(d), "bandpass", [800, 2400]); y = filt(y, "lowpass", 2500) * np.interp(tt, [0, 0.15, d - 0.25, d], [0, 1, 1, 0])
    put(y / rms(y) * db(g), t0, pan=0.2)
    if F("motor"): O("motor", t0, g + 2, d, lp=4000, pan=0.2)
# ---------------------------------------------------------------- beds
bed(WIND, 0, 71, [[0, -30], [4.4, -30], [8.5, -31], [20.6, -32], [38.6, -30], [44.9, -28], [45.6, -30], [51.6, -32], [58.6, -33], [71, -38]], lp=1400)
B("snow_wind", 0, 4.5, [[0, -27], [4.5, -28]])
B("snow_wind", 8.5, 45.0, [[8.5, -24], [14.6, -24], [20.6, -28], [32.6, -30], [38.6, -28], [44.9, -27]])
B("snow_wind", 45.6, 71.0, [[45.6, -30], [51.6, -30], [58.6, -27], [66, -29], [71, -33]])
put(filt(brown(36.5), "lowpass", 160) * db(-46), 8.5)                                               # the town's low hum
# ---------------------------------------------------------------- hook (0–4.5): the bell rings with the lamps (crossing(t + 0.3)); her nails scrape the wall as the fingers dig and tap
bells(0.0, 4.45, 0.3, -17, pan=0.35)
NC = Gon("nails_concrete", 0.22, 3, hp=500, whole=True); NL = Gon("nails", 0.07, 4, hp=800, span=2)
def taps(t0, t1, ai, fi, g, gk=lambda t: 1.0, pan=0.0, tight=False):   # fingertip lands when 11(t + 0.7·ai) + 1.7·fi reaches (2m+1)π (run.js fingerPtsG)
    for m in range(400):
        t = ((2 * m + 1) * math.pi - 1.7 * fi) / 11 - 0.7 * ai
        if t0 < t < t1 and NL[0] is not None and gk(t) > 0.05: place(NL[(m + fi) % len(NL)], t, g + 20 * math.log10(gk(t)), pan)
for ai in (0, 1):
    for fi in (1, 2): taps(0.5, 4.45, ai, fi, -20 - 3 * (fi - 1), lambda t: sm(0.5, 1.0, t), pan=(-0.2 if ai else 0.2))
if NC[0] is not None: place(NC[0], 0.45, -19, 0.2); place(NC[1 % len(NC)], 0.75, -21, -0.2); place(NC[2 % len(NC)], 2.6, -22, 0.1)
O("drip", 1.8, -30, 0.6)
drone(0, 8.5, 41, -32, [[0, -2], [2.2, 0], [4.4, -3], [8.5, -10]])
# ---------------------------------------------------------------- card (4.5–8.5)
O("shakuhachi", 5.0, -26, 3.2, lp=5000)
bells(5.2, 8.2, 0.0, -36, gk=lambda t: 1 - sm(5.5, 8.2, t), pan=-0.3)
# ---------------------------------------------------------------- town (8.5–14.6): snow hush, a far dog, the streetlamp buzz, one distant horn; marks (14.6–20.6): a faint rhythmic scrape far down the line
# (no dog: the candidates had birdsong, wrong for a winter night)
buzz_d = 6.1; tt = T_(buzz_d); put(filt(np.sin(2 * np.pi * 120 * tt) + 0.5 * np.sin(2 * np.pi * 240 * tt) + 0.2 * noise(buzz_d), "bandpass", [100, 3000]) * np.interp(tt, [0, 0.3, buzz_d - 0.3, buzz_d], [0, 1, 1, 0]) * db(-50), 8.5, pan=0.3)
O("train_horn", 12.4, -38, 2.2, lp=1500, pan=-0.5)
for k in range(9): O("nails_concrete", 15.6 + k * 0.52, -40 - 2 * abs(k - 4) * 0.5, 0.18, lp=2500, s=S("nails_concrete") + (k % 3) * 0.2, pan=-0.3)
drone(14.6, 20.6, 36, -39, [[14.6, -6], [20.6, -10]], beat=0.2, lp=500)
# ---------------------------------------------------------------- walk (20.6–28.1): two pairs of boots on the walk cycle (walkP L 0.62, s = 1.1(t − 20.6); Kenta s + 0.31)
STP = Gon("snow_steps", 0.32, 6, span=4)
def steps(t0, t1, s_of_plant, g, pan):
    c = 0
    for n in range(-2, 40):
        for j in (0, 1):
            t = s_of_plant(0.62 * (n + 0.38 + 0.5 * j))
            if t0 < t < t1 and STP[0] is not None: place(STP[c % len(STP)], t - 0.01, g + 1.5 * (hsh(n * 2 + j, 3) - 0.5), pan); c += 1
steps(20.65, 28.1, lambda s: 20.6 + s / 1.1, -22, -0.15)
steps(20.65, 28.1, lambda s: 20.6 + (s - 0.31) / 1.1, -23, 0.15)
if STP[0] is not None: place(STP[1 % len(STP)], 28.6, -25, -0.1); place(STP[2 % len(STP)], 29.1, -26, 0.15); place(STP[3 % len(STP)], 29.45, -27, 0.1)   # they turn round
B("breath_run", 28.3, 32.6, [[28.3, -42], [29, -36], [32.6, -38]], lp=3000, s0=0.5)
# ---------------------------------------------------------------- hear (28.1–): teke. teke. teke. — three dry taps, close and behind, then silence
KN = Gon("knock", 0.18, 3, hp=200, whole=True)
for i, t in enumerate((28.25, 28.72, 29.18)):
    if KN[0] is not None: place(KN[i % len(KN)], t, -15 - i, -0.25)
    if NL[0] is not None: place(NL[i % len(NL)], t + 0.01, -22, -0.25)
drone(28.1, 38.6, 34, -32, [[28.1, -8], [32.6, -3], [38.6, 0]], beat=0.25, lp=600)
# ---------------------------------------------------------------- wall (32.6–38.6): a wet drip from her hair, nails clicking on the wall top (tap 0.5), cloth dragging over concrete as she pulls over (35.6–38.4)
for ai in (0, 1): taps(32.6, 38.55, ai, 1, -26, lambda t: 0.5, pan=-0.3)
for t in (33.4, 34.9, 36.6, 37.8): O("drip", t, -30, 0.5, pan=-0.3)
DR = "cloth_drag"
O(DR, 35.6, -22, 2.8, lp=5000, pan=-0.3)
# ---------------------------------------------------------------- chase (38.6–45.0): she drops (38.6–39.4, a thump at 39.4); the elbow plants (s = 0.6k, s = 3τ + 0.125τ², τ = t − 39.4) are the teke-teke;
# Kenta runs (L 1.15, s = 2.85(t − 38.6)); the bell takes over as they near the crossing; the barrier motor at 43.0
O(DR, 38.62, -20, 0.8, lp=5000)
put(boom(70, 0.5, 0.3) * db(-17), 39.4)
SC = Gon("snow_crunch", 0.2, 3, whole=True)
if SC[0] is not None: place(SC[0], 39.4, -14)
def tau(s): return (-3 + math.sqrt(9 + 0.5 * s)) / 0.25
k = 1
while True:
    t = 39.4 + tau(0.6 * k)
    if t >= 44.95: break
    side = -0.15 if k % 2 else 0.15
    if KN[0] is not None: place(KN[k % len(KN)], t, -13 + 3 * sm(39.4, 44.9, t), side)   # the elbow
    if NL[0] is not None: place(NL[k % len(NL)], t + 0.035, -19, side)                     # nails right after
    if SC[0] is not None: place(SC[k % len(SC)], t + 0.01, -23, side)                       # snow kicked up
    k += 1
RUN = Gon("snow_run", 0.25, 6, span=4) if F("snow_run") else STP
c = 0
for n in range(0, 30):
    for j in (0, 1):
        t = 38.6 + 1.15 * (n + 0.38 + 0.5 * j) / 2.85
        if 38.6 < t < 44.95 and RUN[0] is not None: place(RUN[c % len(RUN)], t, -25 + 1.5 * (hsh(c, 4) - 0.5), 0.25); c += 1
B("breath_run", 38.8, 44.95, [[38.8, -34], [40, -26], [44.9, -23]], lp=5000, s0=S("breath_run"))
bells(38.6, 44.95, 0.0, -24, gk=lambda t: 0.3 + 0.7 * sm(39, 44.5, t), pan=0.3)
motor(43.0, 44.6, -29)
drone(38.6, 44.95, 33, -28, [[38.6, -3], [44.9, 3]], beat=0.5, lp=700)
# ---------------------------------------------------------------- THE HIT (45.6): a sub drop, an impact, a bell clang; then her whisper close, his breath trembling; the bell keeps the lamp clock
put(boom(40, 5.0, 0.5) * db(0), 45.6)
O("cinematic_impact_boom", 45.6, -1, 3.0)
if BELL[0] is not None: place(BELL[0], 45.6, -6, 0.2)
tt = T_(7.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (92.5, 98.0, 138.6, 146.8, 196.0)) * np.exp(-tt / 2.6) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 2200) * db(-14), 45.6, pan=0.1)
O("gasp", 45.75, -18, 0.8)
O("whisper", 46.5, -17, 2.4, lp=7000, pan=-0.15)
O("whisper", 49.2, -24, 1.6, lp=5000, pan=-0.15)
B("breath_panic", 46.3, 51.5, [[46.3, -30], [48, -24], [51.4, -28]], lp=5000)
bells(46.3, 51.5, 0.0, -30, pan=0.35)
drone(45.6, 51.6, 30, -25, [[45.6, 3], [51.6, -2]], beat=0.4, lp=600)
# ---------------------------------------------------------------- train (51.6–58.6): bell, the barrier motor (51.8–53.2), the horn, the pass-by aligned so its loudest moment sits on the front passing (54.5), the bell stops 57.4–57.8
bells(51.6, 57.8, 0.0, -23, gk=lambda t: 1 - sm(57.4, 57.8, t), pan=0.25)
motor(51.8, 53.2, -26)
O("train_horn", 53.05, -23, 1.4, lp=6000, pan=-0.3)
if F("train_pass"):
    x = load(src(F("train_pass"))); e = np.convolve(np.abs(x).mean(1), np.ones(4800) / 4800, "same"); pk = int(np.argmax(e)) / SR
    a0 = max(0.0, pk - 1.9); y = x[int(a0 * SR):int((pk + 2.4) * SR)].copy(); n = len(y); w = np.interp(np.arange(n) / SR, [0, 0.5, n / SR - 0.9, n / SR], [0, 1, 1, 0]); y *= w[:, None]
    y = filt(y, 'lowpass', 7000); y = y / (np.abs(y).max() + 1e-9) * db(-18.5); put(y, 54.5 - (pk - a0))
    print("train_pass peak at", round(pk, 2), "s in the file; placed so it lands at 54.5")
put(filt(noise(3.0), "bandpass", [200, 3000]) * np.interp(T_(3.0), [0, 0.6, 2.4, 3.0], [0, 1, 1, 0]) * db(-24), 53.6, pan=0.0)   # the wind gust and snow blast
O("snow_wind", 56.4, -26, 2.0)
# ---------------------------------------------------------------- dawn (58.6–71): dawn wind, a far crow, the bell silent
O("crow", 62.2, -31, 2.0, lp=6000, pan=0.4)
O("crow", 66.8, -35, 1.6, lp=5000, pan=-0.3)
drone(58.6, 71.0, 38, -34, [[58.6, -6], [66, -2], [71, -8]], beat=0.25, lp=500)
# ---------------------------------------------------------------- code layer: the card, the cuts, the badge
bcard = bell(98, 3.8); bcard *= np.interp(np.arange(len(bcard)), [0, len(bcard) * 0.6, len(bcard)], [1, 1, 0]); put(bcard * db(-30), 4.75, pan=-0.1); put(boom(60, 2.4, 0.4) * db(-27), 4.75)
put(bell(660, 3.0, ((1, 1), (2.76, 0.3), (5.4, 0.1))) * db(-34), 66.3, pan=0.3)               # the badge
def whoosh(t, g, d=0.6, f0=300, f1=2400):
    n = int(d * SR); x = noise(d); yy = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        fc = f0 + (f1 - f0) * (i / n) ** 2; yy[i:i + seg] = filt(x[max(0, i - 2048):i + seg], "bandpass", [fc * 0.7, fc * 1.4])[-len(yy[i:i + seg]):]
    yy *= (np.arange(n) / n) ** 2.2; put(yy / np.abs(yy).max() * db(g), t - d)
whoosh(4.5, -34, 0.5); put(boom(50, 0.6, 0.3) * db(-30), 4.5); whoosh(8.6, -32, 0.4)
for tc in [14.6, 20.6, 26.6, 32.6, 38.6, 51.6, 58.6]: whoosh(tc, -30); put(boom(55, 0.7, 0.3) * db(-24), tc)
# ---------------------------------------------------------------- master
import os
if os.environ.get('MIX_DEBUG'): sf.write('audio/premaster.wav', out.astype(np.float32), SR, subtype='FLOAT')
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
hd = np.interp(np.arange(N) / SR, [0, 46.2, 46.6, 51.4, 51.8, 53.0, 53.6, 56.4, 57.0, 80], [0, 0, -3, -3, 0, 0, -3, -3, 0, 0]); out *= db(hd)[:, None]   # after the strike the body sits under it: THE HIT stays the loudest moment
# THE HIT must stay the loudest 100 ms: any other window within 1 dB of it is pulled down locally (smooth 0.3 s gain dips)
for _ in range(6):
    w100 = 10 * np.log10(np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1) + 1e-12)
    hitv = w100[int(45.6 / 0.05):int(46.4 / 0.05)].max(); bad = [i for i in range(len(w100)) if not (45.5 <= i * 0.05 <= 46.4) and w100[i] > hitv - 1.0]
    if not bad: break
    dip = np.zeros(N)
    for i in bad: c = int((i * 0.05 + 0.05) * SR); h = int(0.3 * SR); dip[max(0, c - h):c + h] = np.maximum(dip[max(0, c - h):c + h], w100[i] - (hitv - 1.5))
    dip = np.convolve(dip, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same"); out *= db(-dip)[:, None]
arc = np.interp(np.arange(N) / SR, [0, 8.3, 8.7, 20.4, 20.8, 38.4, 38.8, 44.9, 45.0, 57.9, 58.8, 80], [-1.5, -1.5, -0.5, -0.5, -2.5, -2.5, -1.0, -1.0, 0.7, 0.7, -3.0, -3.0]); out *= db(arc)[:, None]   # the story arc: the hit act stays on top, the ending decays
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
