# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the whole sound for black-cave: Freesound CC0 recordings picked with earshot (picks.json), the Commons
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
# ================================================================ BLACK CAVE: every event on the picture's clock (src/run.js)
import math
def hsh(i, k=1.0): v = math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - math.floor(v)
def broken(t, k=1.0):   # = run.js broken(): 1/9 s steps, low when h < 0.25k
    s = math.floor(t * 9); h = hsh(s, 11); h2 = hsh(math.floor(t * 23), 12)
    if h < 0.25 * k: return 0.15 + 0.3 * h2
    if h < 0.4 * k: return 0.6 + 0.3 * h2
    return 1.0
def flicker_events(t0, t1, k, fn=None):   # times where the lamp level jumps (each 1/9 s step that changes), with the jump size
    ev = []; prev = None; t = math.ceil(t0 * 9) / 9
    while t < t1:
        v = (fn or (lambda x: broken(x, k)))(t + 1e-4)
        if prev is not None and abs(v - prev) > 0.2: ev.append((t, v - prev))
        prev = v; t += 1 / 9
    return ev
def sm(a, b, x): u = min(1, max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u)
def Gon(k, d, n, hp=None, span=None):   # n grains starting just before the n strongest onsets inside the picked segment
    if not F(k): return [None]
    seg = PJ[k].get("seg") or [0, 3]; s0, s1 = float(seg[0] or 0), float(seg[1] or 3)
    if span: s1 = max(s1, s0 + span)
    x = load(src(F(k))); a, b = int(s0 * SR), min(len(x), int(s1 * SR)); m = np.abs(x[a:b]).mean(1); e = np.convolve(m, np.ones(240) / 240, "same")
    on = np.maximum(0, np.diff(e, prepend=e[0])); idx = []
    for i in np.argsort(on)[::-1]:
        if all(abs(i - j) > int(0.12 * SR) for j in idx): idx.append(i)
        if len(idx) >= n: break
    return [grain(F(k), s0 + max(0, i - int(0.005 * SR)) / SR, d, hp=hp) for i in sorted(idx)]
WIND = "Howling_wind.ogg"
CUTS = [14.6, 20.6, 26.6, 32.6, 38.6, 51.6, 58.0]
CLK = (Gon("lamp_click", 0.08, 1, hp=400))[0]
def lampclicks(evs, g):
    for t, dv in evs:
        if CLK is not None: place(CLK, t, g + (0 if dv < 0 else -4), 0.1)
        put(filt(noise(0.05), "bandpass", [2000, 6000]) * np.exp(-T_(0.05) / 0.01) * db(g - 6), t)   # a filament tick
def buzz(t0, t1, g, fn):   # the bulb's buzz, gated by the lamp level
    d = t1 - t0; tt = T_(d); y = (np.sign(np.sin(2 * np.pi * 120 * tt)) * 0.3 + np.sin(2 * np.pi * 240 * tt)) + 0.3 * filt(noise(d), "bandpass", [1500, 4000])
    lv = np.array([fn(t0 + x) for x in tt[::480]]); lv = np.repeat(lv, 480)[:len(tt)]; jitter = np.abs(np.diff(lv, prepend=lv[0])) * 30
    put(filt(y, "bandpass", [100, 5000]) * (0.25 * lv + np.minimum(1, jitter)) * db(g), t0)

# ---------------------------------------------------------------- beds
B("cave_tone", 0, 4.5, [[0, -28], [4.5, -30]], lp=3000)
B("cave_drip", 0, 4.5, [[0, -30], [4.5, -30]])
B("wind_brush", 8.5, 20.6, [[8.5, -25], [14.6, -27], [20.6, -30]])
bed(WIND, 8.5, 20.6, [[8.5, -34], [20.6, -36]], lp=1200)
B("night_crickets", 8.5, 20.6, [[8.5, -27], [14.6, -28], [20.6, -32]], hp=1500)
put(filt(brown(12.1), "lowpass", 140) * db(-38), 8.5)                                                # the town's hum below
B("cave_tone", 20.6, 45.0, [[20.6, -24], [26.6, -26], [38.6, -24], [44.9, -26]], lp=2500)
B("cave_drip", 20.6, 32.6, [[20.6, -27], [26.6, -30], [32.6, -32]])
B("breath_panic", 38.8, 44.9, [[38.8, -34], [41, -26], [44.3, -24], [44.9, -40]], lp=5000)        # his breath panics
B("cave_tone", 45.6, 51.6, [[45.6, -22], [51.6, -26]], lp=2000)
B("monster_breathing_deep", 46.0, 51.4, [[46, -30], [48.5, -22], [51.4, -30]], lp=2200)            # a deep breath in the rock as the jaw opens
B("generator", 51.6, 58.0, [[51.6, -27], [58, -28]], lp=3500)
B("wind_brush", 51.6, 58.0, [[51.6, -32], [58, -32]])
B("night_crickets", 58.0, 71.0, [[58, -30], [66, -32], [71, -36]], hp=1500)
B("wind_brush", 58.0, 71.0, [[58, -24], [66, -27], [71, -30]])
bed(WIND, 58.0, 71.0, [[58, -36], [71, -40]], lp=1000)

# ---------------------------------------------------------------- hook (0–4.5): the flashlight stutters; a wet slide of skin out of the crack; long nails tap the stone
hookL = lambda t: broken(t, 0.6)
lampclicks(flicker_events(0.0, 4.4, 0.6, hookL), -26); buzz(0, 4.45, -38, hookL)
O("squelch", 0.25, -24, 1.6, lp=4000)                                                              # the hand slides out (0.1–2.0)
O("cloth", 0.9, -32, 1.0, lp=3000)                                                                 # skin dragging over rock as it spreads (0.9–2.0)
NL = Gon("nails", 0.07, 4, hp=800, span=2)
def taps(t0, t1, fi, g, gain_k=lambda t: 1.0, pan=0.0):   # a fingertip lands when 7t + 1.3·fi reaches (2m+1)π (run.js fingerPts tap)
    for m in range(60):
        t = ((2 * m + 1) * math.pi - 1.3 * fi) / 7
        if t0 < t < t1 and NL[0] is not None: place(NL[(m + fi) % 4], t, g + 20 * math.log10(max(1e-3, gain_k(t))), pan)
taps(2.0, 4.45, 1, -14, lambda t: sm(2.0, 2.4, t))
for fi in (0, 2, 3): taps(2.1, 4.45, fi, -26, lambda t: sm(2.0, 2.4, t), pan=0.1 * fi)
O("cave_drip", 3.3, -26, 0.6)

# ---------------------------------------------------------------- card (4.5–8.5)
O("shakuhachi", 5.0, -27, 3.2, lp=5000)
O("cave_drip", 7.2, -30, 0.5)

# ---------------------------------------------------------------- grate (14.6–20.6): cooling metal ticks, his steps on gravel (walkP L 0.62, s = 0.55(t − 14.6)), the cave breathes out
STP = Gon("steps_gravel", 0.3, 4, span=3)
k_ = 0
for n in range(20):
    for j in (0, 1):
        t = 14.6 + 0.62 * (n + 0.38 + 0.5 * j) / 0.55
        if 14.65 < t < 20.55 and STP[0] is not None: place(STP[k_ % 4], t - 0.02, -19 - 6 * sm(18, 20.5, t), 0.0); k_ += 1
for t in (14.9, 15.7, 16.9, 18.2, 19.6): O("metal_tick", t, -28, 0.25, pan=-0.2)
put(filt(brown(6.0), "lowpass", 400) * np.interp(T_(6.0), [0, 2, 6], [0, 1, 0.6]) * db(-30), 14.6)  # cold air out of the mouth

# ---------------------------------------------------------------- chamber (20.6–26.6): he crawls in: each hand plants when sin(ph) crosses 0 (ph = 14·ss(20.9, 26.4, t))
SCR = Gon("crawl_rock", 0.45, 4, span=3)
def plants(t0, t1, fph, g, pan=0.0):
    prev = None; c = 0; tt = t0
    while tt < t1:
        v = math.sin(fph(tt))
        if prev is not None and (prev < 0) != (v < 0) and SCR[0] is not None: place(SCR[c % 4], tt, g, pan); c += 1
        prev = v; tt += 0.01
plants(20.6, 26.6, lambda t: sm(20.9, 26.4, t) * 14, -20)
O("cloth", 21.3, -28, 1.2); O("cloth", 23.9, -28, 1.2)
# ---------------------------------------------------------------- cutaway (26.6–32.6): scrape-pause-scrape (ph = 10·k), grit trickles
plants(26.6, 32.6, lambda t: sm(26.6, 32.6, t) * 10, -21)
O("grit", 27.6, -26, 2.0); O("grit", 30.8, -28, 1.6)
drone(20.6, 45.0, 34, -31, [[20.6, -12], [26.6, -6], [32.6, -3], [38.6, -1], [44.9, 2]], beat=0.25, lp=600)

# ---------------------------------------------------------------- flicker (32.6–38.6): the headlamp breaks at 33.4; nails tick on rock as the fingers come up (tap 0.5, finger 2); a whisper of his name
fl7 = lambda t: 1.0 if t < 33.4 else broken(t, 1.6)
lampclicks(flicker_events(33.4, 38.55, 1.6, fl7), -22); buzz(32.6, 38.6, -34, fl7)
taps(34.2, 38.5, 2, -22, lambda t: 0.5 * sm(34.2, 35.0, t)); taps(36.2, 38.5, 0, -26, lambda t: 0.3, pan=-0.2)
O("whisper", 35.2, -24, 1.4, lp=6000, pan=-0.1); O("whisper", 37.0, -27, 1.2, lp=5000, pan=0.1)
O("squelch", 36.2, -30, 0.6)                                                                        # the second hand slides up
# ---------------------------------------------------------------- grip (38.6–45.0): wet skin on glove leather, a long drag as it pulls (pull = ss(39.5, 44.8)); the lamp clicks out 44.3–44.9
O("squelch", 38.75, -22, 0.8); O("squelch", 39.3, -26, 0.7, pan=0.15)
B("crawl_rock", 39.5, 44.9, [[39.5, -40], [41, -27], [44.3, -24], [44.9, -40]], lp=3000)
flg = lambda t: (1.0 if t < 40 else broken(t, 0.45 if t < 43.2 else 0.9)) if t < 44.3 else (1 - sm(44.3, 44.9, t)) * (0.5 + 0.5 * math.sin(t * 47) ** 2)
lampclicks(flicker_events(40.0, 44.3, 0.45, lambda t: flg(t)), -24); buzz(38.6, 44.95, -34, flg)
for i in range(7): t = 44.3 + i * 0.6 / 7; place(CLK, t, -22 - i, 0.1) if CLK is not None else None   # the strobe as it dies
O("lamp_click", 44.88, -18, 0.15); O("buzz", 44.3, -26, 0.6, lp=6000)

# ---------------------------------------------------------------- THE HIT (45.6): the lamp snaps back on; a sub drop, an impact, a wet many-toothed exhale
put(boom(40, 5.0, 0.5) * db(0), 45.6)
O("cinematic_impact_boom", 45.6, -1, 3.0)
place(CLK, 45.6, -8) if CLK is not None else None
tt = T_(7.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (92.5, 98.0, 138.6, 146.8, 196.0)) * np.exp(-tt / 2.6) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 2200) * db(-13), 45.6, pan=0.1)
O("squelch", 45.65, -10, 1.0); O("monster_breathing_deep", 45.7, -12, 1.8, lp=3000)
B("teeth_grind", 46.2, 49.0, [[46.2, -24], [47.5, -16], [49, -24]], lp=6000)                       # the jaw opens 46.2–48.5
O("bone_crack", 46.25, -16, 0.4); O("bone_crack", 47.6, -18, 0.4)
flh = lambda t: (0.55 + 0.45 * broken(t, 0.7)) if t < 50.4 else (1 - sm(50.4, 51.3, t)) * broken(t, 1.5)
lampclicks(flicker_events(46.2, 51.3, 0.7, flh), -20); buzz(45.6, 51.4, -30, flh)
drone(45.6, 51.6, 30, -24, [[45.6, 3], [51.6, -2]], beat=0.4, lp=600)

# ---------------------------------------------------------------- rescue (51.6–58): generator, floodlight buzz, shovels, radio, a voice faintly talking in the rock
buzz(51.6, 58.0, -38, lambda t: 1.0)
for t in (52.3, 53.6, 55.1, 56.4, 57.5): O("shovel", t, -26, 0.6, pan=-0.35)
O("radio", 53.0, -30, 1.6, pan=0.35, lp=4000); O("radio", 56.0, -32, 1.2, pan=0.35, lp=4000)
O("whisper", 54.5, -34, 2.0, lp=1200)                                                              # him talking, deep in the rock (muffled)
# ---------------------------------------------------------------- sealed (58–71): dusk wind, a distant call from inside, very faint
O("whisper", 62.4, -38, 1.6, lp=900)
O("temple_bell", 64.0, -37, 4.0, s=S("temple_bell"), lp=3500)
drone(58.0, 71.0, 38, -33, [[58, -8], [66, -2], [71, -8]], beat=0.25, lp=500)

# ---------------------------------------------------------------- code layer: the card, the cuts, the badge
drone(0, 8.5, 41, -31, [[0, -2], [2.2, 0], [4.4, -3], [8.5, -10]])
bcard = bell(98, 3.8); bcard *= np.interp(np.arange(len(bcard)), [0, len(bcard) * 0.6, len(bcard)], [1, 1, 0]); put(bcard * db(-30), 4.75, pan=-0.1); put(boom(60, 2.4, 0.4) * db(-27), 4.75)
put(bell(660, 3.0, ((1, 1), (2.76, 0.3), (5.4, 0.1))) * db(-34), 66.3, pan=0.3)               # the badge
def whoosh(t, g, d=0.6, f0=300, f1=2400):
    n = int(d * SR); x = noise(d); yy = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        fc = f0 + (f1 - f0) * (i / n) ** 2; yy[i:i + seg] = filt(x[max(0, i - 2048):i + seg], "bandpass", [fc * 0.7, fc * 1.4])[-len(yy[i:i + seg]):]
    yy *= (np.arange(n) / n) ** 2.2; put(yy / np.abs(yy).max() * db(g), t - d)
whoosh(4.5, -34, 0.5); put(boom(50, 0.6, 0.3) * db(-30), 4.5); whoosh(8.6, -32, 0.4)
for tc in CUTS: whoosh(tc, -28); put(boom(55, 0.7, 0.3) * db(-22), tc)
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
