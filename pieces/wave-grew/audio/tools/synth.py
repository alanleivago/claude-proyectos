# synth.py: the code-synth presence layer for wave-grew (pov3d rule: recordings + synth on top).
# Deterministic: numpy default_rng(SEED) per component name. Writes audio/stems/synth.wav (48 kHz stereo float, 510.0 s).
# Every component is listed in COMPONENTS with its time span and peak level (dBFS, pre-master).
import os, sys, json, zlib
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000
DUR = 510.0
N = int(DUR * SR)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "stems", "synth.wav")
SEED = 1468
LV = json.load(open(os.path.join(ROOT, "design", "synth_levels.json"))) if os.path.exists(
    os.path.join(ROOT, "design", "synth_levels.json")) else {}
out = np.zeros((N, 2), np.float32)
log = []

def rng(name): return np.random.default_rng(SEED + zlib.crc32(name.encode()))
def db(x): return 10 ** (x / 20)
def tt(t0, t1): return np.arange(int(t0 * SR), int(t1 * SR)) / SR

def ramp(t, pts):
    """piecewise-linear dB envelope over absolute times; -120 = silence"""
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    g = db(np.interp(t, xs, ys)); g[np.interp(t, xs, ys) <= -119] = 0
    return g

def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")

def filt(x, kind, f, order=2): return signal.sosfilt(sos(kind, f, order), x, axis=0)

def brown(n, r):
    x = np.cumsum(r.standard_normal(n)); x = x - signal.sosfilt(sos("low", 0.5), x)  # leaky: remove drift
    return x / (np.std(x) + 1e-9)

def pink(n, r):
    w = r.standard_normal(n); b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]; a = [1, -2.494956002, 2.017265875, -0.522189400]
    x = signal.lfilter(b, a, w); return x / (np.std(x) + 1e-9)

def smooth_noise(n, r, rate_hz):
    """slow random modulation in 0..1"""
    k = max(2, int(n / SR * rate_hz) + 2)
    pts = r.random(k); xi = np.linspace(0, k - 1, n)
    return np.interp(xi, np.arange(k), pts)

def add(name, t0, x, peak_db=None):
    lvl = LV.get(name, 0.0)
    if x.ndim == 1: x = np.stack([x, x], 1)
    if peak_db is not None:
        x = x * (db(peak_db) / (np.max(np.abs(x)) + 1e-12))
    x = x * db(lvl)
    i0 = int(round(t0 * SR)); i1 = min(N, i0 + len(x))
    out[i0:i1] += x[: i1 - i0].astype(np.float32)
    log.append({"name": name, "t0": round(t0, 3), "t1": round(t0 + len(x) / SR, 3),
                "peak_dbfs": round(20 * np.log10(np.max(np.abs(x)) + 1e-12), 1)})

def decor(x, r, ms=11):
    """make a stereo pair from mono by a short all-pass-ish delay mix"""
    d = int(ms * SR / 1000); y = np.r_[np.zeros(d), x[:-d]]
    return np.stack([x * 0.85 + y * 0.15, x * 0.15 + y * 0.85], 1)

C1, C2, G2, C3 = 32.703, 65.406, 97.999, 130.813

# 1. teaser drone 0-6.2 (Earth inside the glass ring): C pedal + slow swell, glassy shimmer; silent by 6.2
def teaser():
    r = rng("teaser"); t = tt(0, 6.2)
    x = np.zeros((len(t), 2))
    for f, a in [(C1, 1.0), (C2, 0.7), (G2, 0.35), (C3, 0.22)]:
        for ch, det in ((0, -0.08), (1, 0.08)):
            x[:, ch] += a * np.sin(2 * np.pi * (f + det) * t + r.random() * 6.28)
    rum = filt(brown(len(t), r), "low", 140, 4)
    x += 0.5 * decor(rum, r)
    e = ramp(t, [(0, -24), (0.4, -14), (3.0, -6), (5.0, -3), (5.85, -4), (6.15, -120)])
    add("teaser.drone", 0, x * e[:, None], -14)
    sh = np.zeros((len(t), 2))
    for f in (1046.5, 1244.5, 1568.0, 2093.0, 2489.0):
        am = 0.4 + 0.6 * smooth_noise(len(t), r, 1.5)
        for ch in (0, 1):
            sh[:, ch] += am * np.sin(2 * np.pi * f * (1 + (ch - 0.5) * 0.0012) * t + r.random() * 6.28) / (f / 1000)
    e2 = ramp(t, [(0, -120), (0.6, -40), (2.5, -14), (4.6, -6), (5.6, -8), (6.1, -120)])
    add("teaser.shimmer", 0, sh * e2[:, None], -29)
teaser()

# 2. wave body rumble 7-288: the wall of water, grows with the wave; thins with the air 240-280
def body():
    r = rng("body"); t = tt(7, 290)
    x = filt(brown(len(t), r), "low", 110, 4) + 0.35 * filt(pink(len(t), r), "band", [80, 260], 2)
    x = decor(x, r, 17)
    e = ramp(t, [(7, -120), (12, -48), (40, -38), (68, -31), (70.5, -25), (74, -27), (90, -24), (140, -20),
                 (160, -19), (181.5, -18), (185, -18), (240, -19), (262, -26), (276, -40), (288, -120)])
    add("body.rumble", 7, x * e[:, None], -1)
body()

# 3. whooshes: band-noise swells with a moving centre (lighthouse 101, cloud in/out, ISS 299)
def whoosh(name, apex, dur, f0, f1, peak, pan_from=-0.6, pan_to=0.6, lp=None):
    r = rng(name); t0 = apex - dur * 0.6; t = np.arange(int(dur * SR)) / SR
    n = pink(len(t), r)
    fc = f0 * (f1 / f0) ** (t / dur)
    # time-varying band-pass by blockwise state-variable filter
    y = np.zeros_like(n); low = band = 0.0; q = 0.7
    fcb = 2 * np.sin(np.pi * np.clip(fc, 20, 12000) / SR)
    for i in range(len(n)):
        hi = n[i] - low - q * band; band += fcb[i] * hi; low += fcb[i] * band; y[i] = band
    if lp: y = filt(y, "low", lp, 2)
    e = np.exp(-((t - dur * 0.6) / (dur * 0.24)) ** 2)
    p = np.interp(t, [0, dur], [pan_from, pan_to])
    st = np.stack([y * e * np.sqrt((1 - p) / 2), y * e * np.sqrt((1 + p) / 2)], 1)
    add(name, t0, st, peak)
whoosh("wh.lighthouse", 101.0, 1.8, 300, 2400, -16, 0.7, -0.8)
whoosh("wh.cloud_in", 182.2, 3.2, 200, 1500, -15, -0.3, 0.3, lp=3000)
whoosh("wh.cloud_out", 185.6, 2.6, 1500, 300, -18, 0.3, -0.3, lp=4000)
whoosh("wh.iss", 299.0, 2.6, 400, 1800, -26, -0.8, 0.8, lp=5000)

# 4. space: C pedal drone + "water ring" glass tones 268-467.3; ocean-drain swell 340-366; Moon lift 405-455
def space():
    r = rng("space"); t0, t1 = 262.0, 467.30; t = tt(t0, t1)
    x = np.zeros((len(t), 2))
    lfo = 0.6 + 0.4 * smooth_noise(len(t), r, 0.08)
    for f, a in [(C1, 1.0), (C2, 0.6), (G2, 0.22)]:
        for ch, det in ((0, -0.05), (1, 0.05)):
            x[:, ch] += a * lfo * np.sin(2 * np.pi * (f + det) * t + r.random() * 6.28)
    x += 0.35 * decor(filt(brown(len(t), r), "low", 90, 4), r, 23)
    e = ramp(t, [(t0, -120), (276, -22), (292, -12), (340, -11), (354, -6), (366, -11), (405, -10), (440, -6),
                 (455, -5), (467.0, -3), (467.29, -3), (467.30, -120)])
    add("space.drone", t0, x * e[:, None], -7)
    g = np.zeros((len(t), 2))
    for f in (523.25, 783.99, 1046.5, 1244.5, 1568.0, 2093.0):
        am = smooth_noise(len(t), r, 0.25) ** 2
        ph = r.random() * 6.28
        pan = r.uniform(-0.8, 0.8)
        s = am * np.sin(2 * np.pi * f * t + ph + 0.002 * np.sin(2 * np.pi * 0.17 * t)) / (f / 523)
        g[:, 0] += s * np.sqrt((1 - pan) / 2); g[:, 1] += s * np.sqrt((1 + pan) / 2)
    e = ramp(t, [(t0, -120), (285, -30), (300, -10), (440, -8), (455, -6), (466.5, -10), (467.29, -12), (467.30, -120)])
    add("space.glass", t0, g * e[:, None], -27)
space()

def drain_swell():
    r = rng("oceans"); t0, t1 = 336.0, 370.0; t = tt(t0, t1)
    x = filt(brown(len(t), r), "low", 70, 4) + 0.6 * np.sin(2 * np.pi * 27.5 * t) * (0.7 + 0.3 * smooth_noise(len(t), r, 0.5))
    x = decor(x, r, 29)
    e = ramp(t, [(t0, -120), (342, -18), (356, 0), (362, -4), (369.5, -120)])
    add("space.oceans_drain", t0, x * e[:, None], -9)
drain_swell()

# 5. riser 447-467.30 (tension), hard cut into the near-silence
def riser():
    r = rng("riser"); t0, t1 = 447.0, 467.30; t = tt(t0, t1); u = (t - t0) / (t1 - t0)
    f = 110 * 2 ** (2.0 * u ** 1.4)  # two octaves up
    ph = 2 * np.pi * np.cumsum(f) / SR
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(2 + 14 * u ** 2) / SR)
    tone = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(1.5 * ph)) * trem
    nz = pink(len(t), r)
    fc = 300 * (6000 / 300) ** (u ** 1.6)
    y = np.zeros_like(nz); low = band = 0.0
    fcb = 2 * np.sin(np.pi * fc / SR)
    for i in range(len(nz)):
        hi = nz[i] - low - 0.8 * band; band += fcb[i] * hi; low += fcb[i] * band; y[i] = band
    x = decor(0.5 * tone + y * 1.2, r, 9)
    e = ramp(t, [(t0, -60), (455, -24), (463, -9), (467.0, 0), (467.29, 0), (467.30, -120)])
    x = x * e[:, None]
    x[-int(0.006 * SR):] *= np.linspace(1, 0, int(0.006 * SR))[:, None]
    add("riser", t0, x, -15)
riser()

# 6. THE HIT 468.0: sub drop + crack + long rumble tail (recordings layered on the sfx bus)
def hit():
    r = rng("hit"); T = 468.0; t = np.arange(int(12 * SR)) / SR
    f = 24 + 46 * np.exp(-t / 0.55)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - np.exp(-t / 0.004)) * np.exp(-t / 2.2)
    add("hit.sub", T, sub, -7.0)
    n = int(0.6 * SR); tc = np.arange(n) / SR
    crack = filt(r.standard_normal(n), "high", 900, 2) * np.exp(-tc / 0.07)
    for k in range(9):  # ice splinters in the first 400 ms
        o = int(r.uniform(0.02, 0.42) * SR); m = int(0.012 * SR)
        crack[o:o + m] += 0.6 * r.standard_normal(m) * np.exp(-np.arange(m) / (0.003 * SR)) * np.exp(-o / SR / 0.3)
    add("hit.crack", T, decor(crack, r, 7), -3)
    tail = filt(brown(len(t), r), "low", 260, 4) * np.exp(-t / 3.5) * (1 - np.exp(-t / 0.01))
    add("hit.tail", T, decor(tail, r, 31), -3.0)
hit()

# 7. the barrel 469.5-497.5: hollow tube roar (comb-filtered noise), fades to silence by 497.5
def barrel():
    r = rng("barrel"); t0, t1 = 469.0, 497.6; t = tt(t0, t1)
    nz = pink(len(t), r)
    out2 = np.zeros((len(t), 2))
    for ch, dms in ((0, 7.3), (1, 8.1)):
        d = int(dms * SR / 1000); b = np.zeros(d + 1); b[0] = 1; a = np.zeros(d + 1); a[0] = 1; a[d] = -0.82
        y = signal.lfilter(b, a, nz if ch == 0 else np.roll(nz, 4800))
        out2[:, ch] = filt(y, "band", [90, 1400], 2)
    rum = filt(brown(len(t), r), "low", 90, 4)
    am = 0.75 + 0.25 * smooth_noise(len(t), r, 0.15)
    x = (out2 + 0.8 * rum[:, None]) * am[:, None]
    e = ramp(t, [(t0, -120), (470.5, -14), (474, -2), (482, 0), (490, -5), (495, -18), (497.5, -120)])
    add("barrel.roar", t0, x * e[:, None], -24)
barrel()

assert np.isfinite(out).all()
os.makedirs(os.path.dirname(OUT), exist_ok=True)
sf.write(OUT, out, SR, subtype="FLOAT")
json.dump({"seed": SEED, "sr": SR, "duration": DUR, "components": log}, open(OUT.replace(".wav", ".json"), "w"), indent=1)
print(json.dumps(log, indent=0))
