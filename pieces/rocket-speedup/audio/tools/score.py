# score.py: the whole soundtrack of rocket-speedup, deterministic. Real recordings (assets/, Freesound CC0 / CC BY,
# manifests in assets/manifests) placed on the picture's events + a code-synth layer for weight (engine sub, cabin hum,
# Mach thump, drones, the hit's sub-boom, countdown pips). No music, no voice.
# Writes work/premaster.wav and stems (work/stems/*.wav), then master.py -> final.wav (-14 LUFS, TP <= -1.5 dBTP).
#   usage: F:/earshot/.venv/Scripts/python.exe -I tools/score.py
import os, sys, json, zlib, subprocess
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000; DUR = 510.0; N = int(DUR * SR)
MUSIC_DB = -9.8
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER = os.path.expanduser("~/.claude/skills/real-sound/scripts/master.py")
BUS = {k: np.zeros((N, 2), np.float64) for k in ("amb", "sfx", "synth", "hit", "music")}
LOG = []

def db(x): return 10 ** (x / 20)
def rng(name): return np.random.default_rng(2026 + zlib.crc32(name.encode()))
def filt(x, kind, f, order=2): return signal.sosfilt(signal.butter(order, f, btype=kind, fs=SR, output="sos"), x, axis=0)
def env(t, pts):   # dB breakpoints -> linear gain over the time array t (<= -90 dB = silence)
    v = np.interp(t, [p[0] for p in pts], [p[1] for p in pts]); g = db(v); g[v <= -90] = 0; return g

_cache = {}
def load(f):
    if f in _cache: return _cache[f]
    x, sr = sf.read(os.path.join(A, "assets", f), dtype="float64", always_2d=True)
    if x.shape[1] == 1: x = np.repeat(x, 2, 1)
    x = x[:, :2]
    if sr != SR: x = signal.resample_poly(x, SR, sr, axis=0)
    _cache[f] = x; return x

def find(fid):
    for d in os.listdir(os.path.join(A, "assets")):
        p = os.path.join(A, "assets", d)
        if os.path.isdir(p):
            for n in os.listdir(p):
                if n.startswith(fid + "_"): return f"{d}/{n}"
    raise SystemExit("missing " + fid)

def place(bus, fid, t, peak_db, src=(0, None), fi=0.01, fo=0.1, rate=1.0, lp=None, hp=None, pts=None, loop_to=None):
    """put a recording (Freesound id) at film time t, normalised to peak_db; src = (start, end) s in the file;
    rate = playback speed (pitch); loop_to = film time to loop until (crossfaded); pts = dB automation in film time"""
    x = load(find(fid)); s0 = int(src[0] * SR); s1 = int(src[1] * SR) if src[1] else len(x); x = x[s0:s1]
    if rate != 1.0: x = signal.resample(x, int(len(x) / rate), axis=0) if len(x) < SR * 40 else signal.resample_poly(x, 100, int(round(100 * rate)), axis=0)
    if loop_to:
        L = int((loop_to - t) * SR); xf = int(min(2.0 * SR, len(x) // 4)); out = np.zeros((L, 2)); pos = 0
        w = np.linspace(0, 1, xf)[:, None]
        while pos < L:
            seg = x.copy(); seg[:xf] *= w if pos else 1; seg[-xf:] *= w[::-1]
            n = min(len(seg), L - pos); out[pos:pos + n] += seg[:n]; pos += len(seg) - xf
        x = out
    if hp: x = filt(x, "high", hp)
    if lp: x = filt(x, "low", lp)
    pk = np.max(np.abs(x)) + 1e-12; x = x * (db(peak_db) / pk)
    nfi, nfo = max(1, int(fi * SR)), max(1, int(fo * SR))
    x[:nfi] *= np.linspace(0, 1, nfi)[:, None]; x[-nfo:] *= np.linspace(1, 0, nfo)[:, None]
    i0 = int(round(t * SR)); i1 = min(N, i0 + len(x)); x = x[: i1 - i0]
    if pts: x = x * env(np.arange(i0, i1) / SR, pts)[:, None]
    BUS[bus][i0:i1] += x; LOG.append([bus, fid, round(t, 2), peak_db])

def synth(name, t0, t1, x, peak_db, pts=None, bus="synth"):
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x * (db(peak_db) / (np.max(np.abs(x)) + 1e-12)); i0 = int(t0 * SR); i1 = min(N, i0 + len(x)); x = x[: i1 - i0]
    if pts: x = x * env(np.arange(i0, i1) / SR, pts)[:, None]
    BUS[bus][i0:i1] += x; LOG.append([bus, name, t0, peak_db])
def tt(t0, t1): return np.arange(int(t0 * SR), int(t1 * SR)) / SR
def brown(n, r): x = np.cumsum(r.standard_normal(n)); x = x - filt(x, "low", 0.3); return x / (np.std(x) + 1e-9)
def decor(x, ms=13): d = int(ms * SR / 1000); y = np.r_[np.zeros(d), x[:-d]]; return np.stack([x * 0.8 + y * 0.2, x * 0.2 + y * 0.8], 1)

# ======================= the teaser (0-5.2: the starbow), black 5.2-6.0 =======================
place("amb", "fs-425984", 0.0, -13, src=(10, 18), fi=0.4, fo=0.6, lp=4000, pts=[[0, -8], [4.6, 0], [5.15, -30]])
place("sfx", "fs-376576", 1.4, -25, fo=0.3, pts=[[1.4, -6], [5.0, 0], [5.18, -40]])
t = tt(0, 5.2); synth("teaser sub", 0, 5.2, np.sin(2 * np.pi * 41 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t)), -26, [[0, -20], [1.5, 0], [5.0, 0], [5.2, -60]])

# the teaser's chaos: alarms, hull stress, sparks, the glass cracking, everything shaking
EVS = json.load(open(os.path.join(A, "work", "events.json")))
place("sfx", "fs-345815", 0.05, -19, loop_to=5.15, fo=0.05)
place("sfx", "fs-207555", 0.0, -11, src=(5, 11), fi=0.05, fo=0.1, pts=[[0, -4], [3, 0], [5.15, 0], [5.2, -60]])
place("sfx", "fs-397948", 0.1, -12, fo=0.4); place("sfx", "fs-417045", 2.4, -14, rate=1.4, fo=0.4)
place("hit", "fs-390721", 1.6, -6, fi=0.002); place("sfx", "fs-418194", 1.62, -10)
for k, (ts, kk, fl) in enumerate(EVS["stress"]):
    if ts > 355.1 or ts < 350: continue
    tt0 = ts - 350.0; place("sfx", ["fs-119468", "fs-119467", "fs-119465"][k % 3], tt0, -12 - 4 * (1 - kk), fo=0.1)
    if fl: place("sfx", ["fs-341611", "fs-341612", "fs-315918"][k % 3], tt0, -15, src=(0, 1.0), fo=0.2)
for b in range(11): place("sfx", ["fs-341612", "fs-315918"][b % 2], 0.35 + b * 0.42, -18, src=(0, 0.7), fo=0.2)   # sparks bursting from the console
# ======================= the pad (6-22), liftoff (22) =======================
place("amb", "fs-690190", 6.0, -16, src=(20, 60), fi=0.8, lp=1600, loop_to=34, pts=[[6, -6], [8, 0], [21, 0], [25, -6], [31, -40]])   # the crowd, heard through the hull
place("amb", "fs-351609", 6.0, -24, fi=1.0, lp=2500, loop_to=30, pts=[[6, 0], [22, 0], [28, -40]])   # wind over the scrub
place("amb", "fs-438786", 6.2, -24, src=(2, 40), fi=0.6, lp=5000, pts=[[6.2, -4], [15, 0], [22, 2], [26, -40]])   # LOX vents
place("sfx", "fs-212104", 12.0, -24, src=(0, 12), fi=0.5, fo=1.0, lp=3000)   # T-10: the deluge / pumps spin up
place("sfx", "fs-189831", 20.4, -26, lp=1800, fo=1.5)   # the crowd cheers
place("sfx", "fs-189830", 23.0, -28, lp=1400, fo=2.0)
for k in range(10, 0, -1):   # T-10..T-1: countdown pips on the console (1 kHz, the last three higher)
    t0 = LIFTOFF = 22.0; t0 = 22.0 - k; f = 1000 if k > 3 else 1500; t = tt(0, 0.09)
    synth(f"pip {k}", t0, t0 + 0.09, np.sin(2 * np.pi * f * t) * np.exp(-t * 18) * (1 - np.exp(-t * 900)), -27)
# ignition and liftoff: the shuttle launch + a CC0 launch, a deep rumble under, the cabin rattles
place("sfx", "fs-207555", 18.5, -20, src=(0, 20), fi=1.5, fo=3.0, pts=[[18.5, -6], [22, 0], [36, 0], [38.5, -30]])
place("sfx", "fs-93078", 21.0, -15.5, src=(8, 73), fi=0.4, fo=6, lp=7000, pts=[[21, -10], [22.2, 0], [45, -1], [60, -10], [72, -26], [86, -60]])
place("sfx", "fs-182794", 21.6, -17.5, fi=0.2, fo=5, lp=5000, pts=[[21.6, -6], [22.4, 0], [40, -4], [48, -30]])
place("sfx", "fs-571421", 22.2, -25, hp=200, loop_to=62, fi=0.6, pts=[[22.2, -8], [24, 0], [44, 0], [52, -10], [62, -40]])   # hull rattle
r = rng("roar"); t = tt(21.5, 92); x = filt(brown(len(t), r), "low", 90); w = np.sin(2 * np.pi * 31 * t) * 0.4
synth("engine sub", 21.5, 92, x + w, -18, [[21.5, -40], [22.4, 0], [45, 0], [60, -8], [75, -20], [92, -60]])
place("sfx", "fs-182050", 44.6, -17, lp=2500, fo=2.0)   # Mach 1: the boom (from inside, muffled)
t = tt(0, 0.6); synth("mach thump", 44.7, 45.3, np.sin(2 * np.pi * (60 - 30 * t) * t) * np.exp(-t * 7), -16)
place("amb", "fs-350678", 38.0, -25, lp=3000, loop_to=54, fi=2.0, pts=[[38, -12], [43.5, 0], [46, 0], [50, -8], [54, -40]])   # the cloud deck rushing past
# the air thins: the roar narrows to a hum; the cabin's own sounds take over and stay for the whole trip
place("amb", "fs-715175", 48.0, -19, lp=7000, loop_to=500, fi=3.0, pts=[[48, -20], [62, 0], [300, 0], [326, -6], [332, -14], [398, -14], [404, -8], [470, -12], [496, -30], [500, -60]])
place("amb", "fs-211994", 52.0, -21, hp=150, loop_to=498, fi=3.0, pts=[[52, -20], [70, 0], [320, 0], [326, -40], [332, -12], [398, -12], [404, -6], [460, -8], [496, -40]])   # fans
t = tt(55, 499); hum = np.sin(2 * np.pi * 60 * t) + 0.5 * np.sin(2 * np.pi * 120 * t + 0.3) + 0.2 * np.sin(2 * np.pi * 180 * t)
synth("cabin hum", 55, 499, hum * (0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * t)), -20, [[55, -30], [75, 0], [325, 0], [326.2, -40], [332, -8], [398, -8], [404, 0], [496, -6], [499, -60]])

place("amb", "fs-558650", 100.0, -21, fi=6.0, lp=3000, loop_to=326.0, pts=[[100, -20], [140, 0], [250, -4], [262, -20], [300, -20], [325, -40], [325.1, -80]])
r = rng("chirps"); tc = 100.0
while tc < 320:
    if not (124 < tc < 136 or 249 < tc < 266):
        t = tt(0, 0.22); f = r.choice([1760, 2093, 2349, 2637]); x = np.sin(2 * np.pi * f * t) * np.exp(-t * 28) * (1 - np.exp(-t * 600))
        x = np.r_[x, np.zeros(int(0.07 * SR)), x * 0.6] if r.random() < 0.5 else x
        synth(f"chirp {tc:.1f}", tc, tc + len(x) / SR, x, -36 + r.uniform(-3, 2))
    tc += r.uniform(5.5, 9.5)
# ======================= cutoff -> FAILED (88-100) =======================
for tc, fid in ((90.0, "fs-842467"), (90.6, "fs-842455"), (91.3, "fs-842462"), (92.0, "fs-842461"), (92.8, "fs-842467")):
    place("sfx", fid, tc, -14, fo=0.05)
place("sfx", "fs-345815", 90.5, -29, loop_to=96.6, pts=[[90.5, 0], [96.2, 0], [96.6, -40]])
place("sfx", "fs-467882", 93.3, -28)

# ======================= the record (112), the Moon (124-140), Parker (158) =======================
place("sfx", "fs-351879", 96.6, -26, fo=0.6)
place("sfx", "fs-397948", 127.5, -17, fo=1.5)
place("sfx", "fs-184313", 126.0, -19, src=(0, 18), fi=2.0, fo=4.0, pts=[[126, -10], [131, 0], [144, -30]])
place("sfx", "fs-316658", 155.6, -12, fo=1.0)
place("sfx", "fs-414422", 158.6, -16)
# the planets: each its own pass
place("sfx", "fs-417045", 185.5, -16, fo=1.2)                                     # Mars
place("sfx", "fs-417044", 196.8, -20, rate=0.7, fo=2.0); place("sfx", "fs-856174", 198.5, -26)   # Jupiter: huge, low
place("sfx", "fs-34653", 204.0, -22, src=(0, 10), fi=1.5, fo=3.0); place("sfx", "fs-397948", 205.0, -16, rate=1.15, fo=1.2)   # Saturn: the rings shimmer
place("sfx", "fs-391445", 219.0, -20, lp=3000, fo=1.0)                            # Pluto: faint
place("sfx", "fs-260383", 236.0, -22, src=(0, 12), fi=0.5, fo=1.5, hp=500)         # Voyager 1's bleeps
place("sfx", "fs-417045", 238.5, -15, rate=1.3, fo=1.0)
place("sfx", "fs-352661", 238.0, -29)

# ======================= the cruise's events: the comet, the asteroid belt, Kuiper ice, the dust hiss, micro-impacts =======================
EV = json.load(open(os.path.join(A, "work", "events.json")))
place("sfx", "fs-417044", 170.0, -19, rate=0.85, fo=2.0); place("sfx", "fs-34653", 170.5, -26, src=(10, 20), fi=1.0, fo=2.5)   # the comet
for k, (tc, d, sz) in enumerate(EV["rocks"]):
    if d > 700 or sz < 30: continue
    place("sfx", ["fs-414422", "fs-391449", "fs-391445"][k % 3], tc - 0.35, -16 - 10 * (d / 700), rate=0.8 if tc < 210 else 1.1, lp=6000 if tc < 210 else None, fo=0.4)
    if tc > 210: place("sfx", "fs-121366", tc - 0.1, -30, src=(0, 1.5), fo=0.6)   # ice: a glassy crackle
r = rng("dusthiss"); t = tt(140, 325.1); x = decor(filt(filt(r.standard_normal(len(t)), "high", 2500), "low", 9000))
synth("dust hiss", 140, 325.1, x, -30, [[140, -40], [180, -14], [265, -6], [320, 0], [324.9, 0], [325.05, -80]])
for k, tm in enumerate(EV["micro"]):
    place("sfx", ["fs-418194", "fs-121366"][k % 2], tm, -22, src=(0, 0.6), fo=0.15, hp=1500)
    t = tt(0, 0.12); synth(f"micro tick {k}", tm, tm + 0.12, np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 60), -30)
# ======================= radiation (250-265), tension (265-325) =======================
place("sfx", "fs-211557", 249.0, -24, src=(0, 18), fi=2.0, fo=3.0, pts=[[249, -14], [253, -2], [262, 0], [267, -40]])
place("sfx", "fs-345814", 252.0, -31, loop_to=264, pts=[[252, 0], [263.5, 0], [264, -40]])
place("amb", "fs-547644", 262.0, -17, fi=6.0, loop_to=325.0, pts=[[262, -24], [280, -8], [310, 0], [324.7, 0], [325.05, -80]])
place("amb", "fs-401205", 290.0, -21, fi=5.0, loop_to=325.0, lp=3000, pts=[[290, -20], [318, 0], [324.7, 0], [325.05, -80]])
place("sfx", "fs-417044", 316.5, -23, fo=1.2)                                     # Proxima
t = tt(265, 325.1); f = 40 + 25 * ((t - 265) / 60) ** 2
synth("tension rise", 265, 325.1, np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR), -24, [[265, -30], [300, -8], [324.9, 0], [325.05, -80]])

# ======================= THE HIT (326.2): near-silence 325.1-326.2, then the loudest moment =======================
place("hit", "fs-131145", 326.2, -1.5, src=(0, 7), fi=0.002, fo=3.5)   # the body of the hit: a long explosion
for fid, pk, kw in (("fs-243613", -1.0, {}), ("fs-377303", -2.0, {}), ("fs-505113", -4.0, {"fo": 4.0}), ("fs-390721", -5.0, {}), ("fs-418194", -6.0, {}), ("fs-41164", -4.0, {"fo": 3.0})):
    place("hit", fid, 326.2, pk, fi=0.002, **kw)
t = tt(0, 4.0); synth("hit sub", 326.2, 330.2, np.sin(2 * np.pi * (55 * np.exp(-t * 0.8) + 25) * t) * np.exp(-t * 0.9), -1.0, bus="hit")
r = rng("hitbody"); t = tt(0, 2.6); synth("hit body", 326.2, 328.8, decor(filt(brown(len(t), r), "low", 900) * np.exp(-t * 1.3)), -2.0, bus="hit")
r = rng("hitnoise"); t = tt(0, 1.2); synth("hit crack", 326.2, 327.4, decor(filt(r.standard_normal(len(t)), "high", 1800) * np.exp(-t * 6)), -6, bus="hit")
place("sfx", "fs-345815", 327.6, -27, loop_to=334, pts=[[327, -6], [333.5, 0], [334, -40]])
place("sfx", "fs-121366", 328.0, -24, fo=2.0)   # the glass settles, creaking

# the galaxy act's chaos (343-455): hull stress creaks, alarm blips, radiation crackles on the flashes
for k, (ts, kk, fl) in enumerate(EVS["stress"]):
    if ts < 343 or ts > 455: continue
    place("sfx", ["fs-119468", "fs-119467", "fs-119465"][k % 3], ts, -15 - 6 * (1 - kk), fo=0.15)
    place("sfx", "fs-467882", ts + 0.05, -26, fo=0.1)
    if fl: place("sfx", ["fs-341611", "fs-315918"][k % 2], ts, -19, src=(0, 0.8), fo=0.2); place("sfx", "fs-211557", ts, -24, src=(4, 5.2), fo=0.3)
place("sfx", "fs-402459", 360.0, -22, src=(2, 18), fi=1.0, fo=3.0); place("sfx", "fs-402459", 418.0, -20, src=(2, 18), fi=1.0, fo=3.0)   # the glass groans
# ======================= the starbow (330-400): lowest; the galaxy (400-460): rising; the end =======================
place("amb", "fs-425984", 331.0, -24, fi=5.0, loop_to=400, lp=2000, pts=[[331, -10], [345, 0], [398, 0], [404, -20]])
place("amb", "fs-558650", 395.0, -14, fi=6.0, loop_to=497, pts=[[395, -20], [420, -6], [455, 0], [470, -4], [490, -10], [497, -60]])
place("sfx", "fs-271945", 381.5, -22, lp=2500, fo=2.0)          # the galactic centre: a soft low stab
place("sfx", "fs-376574", 412.0, -18, fo=0.6); place("sfx", "fs-376576", 441.0, -18, fo=0.6)   # rising into the edge, into Andromeda
t = tt(400, 497); f = 55 + 20 * (t - 400) / 60
synth("rising drone", 400, 497, np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.6 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(f * 3.0) / SR), -27, [[400, -14], [455, -2], [462, 0], [480, -10], [496, -40], [497, -80]])
t = tt(484, 494); synth("red giant", 484, 494, np.sin(2 * np.pi * 36 * t) * (1 - np.exp(-(t - 484) * 0.6)), -18, [[484, -20], [488, 0], [494, -60]])
t = tt(498.4, 509.5); tone = np.sin(2 * np.pi * 220 * t) + 0.5 * np.sin(2 * np.pi * 330 * t) + 0.25 * np.sin(2 * np.pi * 440 * t)
synth("last tone", 498.4, 509.5, decor(tone * np.exp(-(t - 498.4) * 0.35)), -36, [[498.4, -40], [499.2, 0], [507, -14], [509.5, -80]])

# the hit bus: driven into a soft clipper so it is dense (low crest), the loudest thing in the film at the same peak
h = BUS["hit"]; pk = np.max(np.abs(h)) + 1e-12; h = np.tanh(4.0 * h / pk) / np.tanh(4.0); BUS["hit"] = h * db(-1.0)
place("sfx", "fs-408141", 498.4, -20, fo=1.5)
place("sfx", "fs-34653", 499.0, -18, src=(0, 11), fi=0.05, fo=1.2, pts=[[499, 0], [508.5, -3], [509.9, -30]])
place("sfx", "fs-351879", 501.2, -22, fo=0.5)   # ALTERBASE appears
# a UI tick on the console each time a caption lands, a soft click when the HUD's NEXT target is reached
import re as _re
_caps = [float(m) for m in _re.findall(r"\[([0-9.]+), '", open(os.path.join(A, "..", "src", "scenes.js"), encoding="utf8").read().split("const CAPS")[1].split("];")[0])]
for k, tc in enumerate(_caps):
    if 325 < tc < 326.4 or tc > 497: continue
    place("sfx", ["fs-842471", "fs-842465", "fs-842462"][k % 3] if False else ["fs-842455", "fs-842462", "fs-842461"][k % 3], tc - 0.05, -27 if tc < 330 or tc > 400 else -31, fo=0.05)
# the music bed (tools/music.py): quiet under the cruise, predominant from the starbow on
_m, _ = sf.read(os.path.join(A, "work", "music.wav"), dtype="float64", always_2d=True); BUS["music"][:len(_m)] += _m[:N] * db(MUSIC_DB)
# alarm pulses locked to the picture's red lamp: on every "on" edge of the flashing (teaser every 0.5 s, cockpit alarms every 2/3 s)
def pulse(t0, f=880.0, pk=-24):
    t = tt(0, 0.16); x = (np.sign(np.sin(2 * np.pi * f * t)) * 0.4 + np.sin(2 * np.pi * f * t)) * np.exp(-t * 14) * (1 - np.exp(-t * 800))
    synth(f"pulse {t0:.2f}", t0, t0 + 0.16, decor(filt(x, "low", 4000)), pk)
for k in range(11): pulse(k * 0.5, 980, -21)
for a0, b0 in ((90.5, 96.5), (252, 264), (326.2, 334)):
    n = int(np.ceil(a0 * 3 / 2.0)) * 2
    while n / 3 < b0:
        if n / 3 >= a0: pulse(n / 3, 740, -25)
        n += 2
# ======================= gates: hard black 5.2-6.0, near-silence before the hit, silence after the last tone =======================
def gate(t0, t1, depth_db=-90, r=0.02):
    g = np.ones(N); i0, i1 = int(t0 * SR), int(t1 * SR); n = int(r * SR); v = 0 if depth_db <= -90 else db(depth_db)
    g[i0:i1] = v; g[i0 - n:i0] = np.linspace(1, v, n); g[i1:i1 + n] = np.linspace(v, 1, n); return g[:, None]
G = gate(5.2, 6.0, -90, 0.03) * gate(325.1, 326.19, -62, 0.04)
G[int(509.95 * SR):] = 0
for k in BUS: BUS[k] *= G
pre = sum(BUS.values())
os.makedirs(os.path.join(A, "work", "stems"), exist_ok=True)
for k, x in BUS.items(): sf.write(os.path.join(A, "work", "stems", f"{k}.wav"), x.astype(np.float32), SR, subtype="FLOAT")
pp = os.path.join(A, "work", "premaster.wav"); sf.write(pp, pre.astype(np.float32), SR, subtype="FLOAT")
json.dump(LOG, open(os.path.join(A, "work", "score_log.json"), "w"))
fin = os.path.join(A, "final.wav")
r = subprocess.run([sys.executable, "-I", MASTER, pp, fin, "--lufs", "-14", "--ceiling", "0.70", "--max-tp", "-2.2", "--no-glue", "--json", os.path.join(A, "work", "master.json")], capture_output=True, text=True)
print(r.stdout[-1500:], r.stderr[-1500:])
