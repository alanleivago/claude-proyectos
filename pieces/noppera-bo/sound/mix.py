# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py: the whole sound for noppera-bo. Freesound CC0 recordings picked with earshot (picks.json) and a code layer
(drones, the card bell and boom, the hit sub drop and cluster). Every event sits on the picture clock (src/run.js).
Exact silence 29.4-30.0 s before THE HIT. Writes audio/mix.wav and audio/levels.txt."""
import subprocess, json
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal

SR, T = 48000, 40.0; N = int(T * SR); rng = np.random.default_rng(1994)
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
SIL0, HIT = 29.4, 30.0
CUTS = [12.5, 19.0, 24.5]

# ---------------------------------------------------------------- beds (outside: rain; inside: rain on the roof, the irori)
B("heavy_rain_night", 0, 24.5, [[0, -24], [4, -28], [7, -22], [19, -20], [24.5, -22]], lp=6000)
B("rain", 0, 24.5, [[0, -28], [24.5, -28]], hp=800)
B("heavy_rain_night", 24.5, 40.0, [[24.5, -32], [29.3, -34], [30, -32], [40, -34]], lp=1500)    # muffled through the roof
B("room_tone_night", 24.5, 40.0, [[24.5, -34], [40, -36]], hp=60)
B("fireplace_crackle", 24.5, 29.4, [[24.5, -30], [29.3, -32]], hp=200); B("fireplace_crackle", 30.0, 40.0, [[30, -31], [36.5, -31], [37, -38], [40, -40]], hp=200)
B("woman_sobbing", 0.0, 4.0, [[0, -22], [4, -24]], hp=150)                                        # the hook: she is crying
B("woman_sobbing", 7.0, 16.5, [[7, -30], [12.5, -24], [16.4, -22]], hp=150)                       # nearer as he comes; stops dead at 16.5
B("gasp_scared_man", 16.6, 19.0, [[16.6, -22], [19, -24]]); B("gasp_scared_man", 19.0, 24.5, [[19, -20], [24.5, -22]]); B("gasp_scared_man", 24.5, 29.3, [[24.5, -26], [29.3, -32]])

# ---------------------------------------------------------------- the stuttering candle (hook) and the dying lamp (end)
SP = [G("candle_flame_sputter", 0.18, off=o) for o in (0.0, 0.3, 0.7)]
def lamp_events(t0, t1, dmg, g):
    prev, k = 1.0, 0
    for t in np.arange(t0, t1, 0.05):
        v = 1 + (broken(t) - 1) * dmg
        if SP[0] is not None and prev > 0.7 and v < 0.5: place(SP[k % 3], t, g, -0.2); k += 1
        if SP[0] is not None and prev < 0.5 and v > 0.7: place(SP[(k + 1) % 3], t, g - 6, -0.2); k += 1
        prev = v
lamp_events(0.0, 3.95, 1.0, -22); lamp_events(30.0, 35.5, 0.45, -28); lamp_events(35.5, 36.9, 1.0, -22)
O("candle_flame_sputter", 36.5, -20, 0.5)

# ---------------------------------------------------------------- his steps (walkMan L 0.46 at 0.95 m/s, 7.0–12.7; contacts at s/L = n + 0.4 + 0.5j) and the run (L 0.7 at 2.1 m/s)
ST = [G("footsteps_mud", 0.3, off=o) for o in (0.0, 0.6, 1.2, 1.8)]
k = 0
for n in range(40):
    for jj in (0, 0.5):
        t = 7.0 + 0.46 * (n + 0.4 + jj) / 0.95
        if 7.0 < t < 12.6 and ST[0] is not None: place(ST[k % 4], t, -20, 0.1); k += 1
RN = [G("running_footsteps_wet", 0.25, off=o) for o in (0.0, 0.5, 1.0, 1.5)]
k = 0
for n in range(40):
    for jj in (0, 0.5):
        t = 19.0 + 0.7 * (n + 0.4 + jj) / 2.1
        if 19.0 < t < 24.45 and RN[0] is not None: place(RN[k % 4], t, -17, 0.0); k += 1
for t in (8.6, 10.4, 12.0): O("wooden_creak", t, -30, 0.5, lp=3000)          # the lantern pole creaks
O("wooden_creak", 13.3, -26, 0.6, lp=3000)                                     # he kneels
# ---------------------------------------------------------------- the first reveal (16.5): the sobbing stops; a hit and a swell
put(boom(48, 2.5, 0.4) * db(-12), 16.5); O("cinematic_impact_boom", 16.5, -10, 2.0, lp=3000)
drone(16.5, 24.5, 38, -26, [[16.5, 0], [19, -3], [24.5, -6]], beat=0.4, lp=700)
# ---------------------------------------------------------------- home: he kneels on the boards (24.6)
O("wooden_floor_creak", 24.7, -24, 0.8, lp=3500)

# ---------------------------------------------------------------- THE HIT (30.0): she turns
put(boom(40, 4.5, 0.5) * db(0), HIT)
O("cinematic_impact_boom", HIT, -1, 3.0)
tt = T_(5.5); cl = sum(np.sin(2 * np.pi * f * tt) for f in (92.5, 98.0, 138.6, 146.8, 196.0)) * np.exp(-tt / 2.4) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 2200) * db(-13), HIT, pan=0.1)
O("bone_crack", HIT + 0.05, -12, 0.4)
# the face tears open in 5 jerks over 31.6–33.0 (a wet tear on each), the strands snap
for i in range(5):
    t = 31.6 + (i + 0.55) * 0.28
    O("flesh_tearing", t, -14 + i * 0.5, 0.35, s=S("flesh_tearing") + i * 0.6)
O("paper_tearing", 32.2, -22, 0.6, lp=2500)
drone(30.0, 35.5, 30, -21, [[30, 3], [35.5, -1]], beat=0.4, lp=600)
O("creepy_whisper", 33.6, -18, 1.2, rate=0.8, lp=5000)
# ---------------------------------------------------------------- code layer
drone(0, 7.0, 41, -31, [[0, -2], [2.0, 0], [3.9, -3], [7.0, -10]])
O("shakuhachi", 4.4, -26, 2.4, lp=5000)
bcard = bell(98, 3.0); bcard *= np.interp(np.arange(len(bcard)), [0, len(bcard) * 0.6, len(bcard)], [1, 1, 0]); put(bcard * db(-30), 4.2, pan=-0.1); put(boom(60, 2.0, 0.4) * db(-27), 4.2)
drone(7.0, 16.5, 34, -32, [[7, -10], [12.5, -6], [16.4, -3]], beat=0.2, lp=600)
drone(24.5, 29.4, 34, -30, [[24.5, -6], [29.3, 0]], beat=0.25, lp=600)
put(bell(660, 2.6, ((1, 1), (2.76, 0.3), (5.4, 0.1))) * db(-28), 36.1, pan=0.3)               # the badge
def whoosh(t, g, d=0.6, f0=300, f1=2400):
    n = int(d * SR); x = noise(d); yy = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        fc = f0 + (f1 - f0) * (i / n) ** 2; yy[i:i + seg] = filt(x[max(0, i - 2048):i + seg], "bandpass", [fc * 0.7, fc * 1.4])[-len(yy[i:i + seg]):]
    yy *= (np.arange(n) / n) ** 2.2; put(yy / np.abs(yy).max() * db(g), t - d)
whoosh(4.0, -34, 0.5); put(boom(50, 0.6, 0.3) * db(-30), 4.0); whoosh(7.1, -32, 0.4)
for tc in CUTS: whoosh(tc, -27); put(boom(55, 0.7, 0.3) * db(-21), tc)
put(boom(55, 0.7, 0.3) * db(-22), 35.5)
# ---------------------------------------------------------------- master
blk = int(0.5 * SR); e = np.array([np.sqrt(np.mean(out[i:i + blk] ** 2)) + 1e-9 for i in range(0, N, blk)])
st = np.convolve(e, np.ones(6) / 6, "same"); tgt = np.median(st[st > 1e-4]) * db(2.5)
ride = np.clip(tgt / st, 1, db(6)); ride[int(28.5 / 0.5):int(35.5 / 0.5)] = 1; ride[int(3.9 / 0.5):int(7.1 / 0.5)] = 1; ride[int(16.3 / 0.5):int(17.5 / 0.5)] = 1; ride[int(35.5 / 0.5):] = 1
ride = np.convolve(np.repeat(ride, blk)[:N], np.ones(int(0.6 * SR)) / int(0.6 * SR), "same"); out *= ride[:, None]
out += filt(out, "bandpass", [1200, 4000]) * (db(2) - 1)
out = filt(out, "highpass", 32, 4)
a, b, f = int(SIL0 * SR), int(HIT * SR), int(0.01 * SR)
out[a - f:a] *= np.linspace(1, 0, f)[:, None]; out[a:b] = 0
tail = np.interp(np.arange(N) / SR, [0, 0.15, 39.3, 40.0], [0, 1, 1, 0]); out *= tail[:, None]
meter = pyln.Meter(SR); out *= db(-20 - meter.integrated_loudness(out))
lv = np.abs(out).max(1); att = signal.lfilter([1 - np.exp(-1 / (0.01 * SR))], [1, -np.exp(-1 / (0.01 * SR))], lv)
rel = signal.lfilter([1 - np.exp(-1 / (0.15 * SR))], [1, -np.exp(-1 / (0.15 * SR))], lv); ev = np.maximum(att, rel)
ed = 20 * np.log10(ev + 1e-9); gr = np.where(ed > -25, (ed + 25) * (1 / 4 - 1), 0); out *= db(gr)[:, None]
out[a:b] = 0
hd = np.interp(np.arange(N) / SR, [0, 30.6, 31.0, 35.0, 35.4, 80], [0, 0, -1.5, -1.5, 0, 0]); out *= db(hd)[:, None]
arc = np.interp(np.arange(N) / SR, [0, 6.8, 7.2, 18.8, 19.2, 29.3, 29.4, 35.3, 35.8, 80], [-2.0, -2.0, -2.0, -2.0, -3.2, -3.2, 0.8, 0.8, -5.0, -5.0]); out *= db(arc)[:, None]
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
sec = [10 * np.log10(np.mean(out[int(k * SR):int((k + 1) * SR)] ** 2) + 1e-12) for k in range(40)]; rep += "\nper second dBFS: " + " ".join(f"{k}:{v:.0f}" for k, v in enumerate(sec))
open("audio/levels.txt", "w").write(rep + "\n"); print(rep)
