# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the whole sound for corpo-seco in one pass: Freesound CC0 recordings picked with earshot (picks.json), a
Commons public-domain wind bed and a code layer (drones, the card bell, the hit's boom and cluster, the fence wire hum,
transition whooshes). Every event is placed on the picture's own clock (the numbers in src/run.js): hooves on the oxen's
gait contacts, the cart song cut on STOP_T, bell strikes on the bell's swing, steps on the walk cycle. Exact silence
45.0-45.6 s before THE HIT. Writes audio/mix.wav and audio/levels.txt."""
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

# ---------------------------------------------------------------- the picture's clock (same numbers as src/run.js)
TREE_S, STOP_T, C = 113.786, 38.9, 1.3
sCart = lambda t: TREE_S - 6.6 - max(0.0, STOP_T - t) * 0.9
CUTS = [8.5, 14.6, 20.6, 26.6, 29.6, 32.6, 35.6, 38.6, 41.6, 50.6, 56.0, 63.0]

# ---------------------------------------------------------------- beds
CRK = F("crickets_night"); WIND = "Howling_wind.ogg"
bed(CRK, 0, 4.5, [[0, -27], [4.5, -29]], s0=40, lp=9000)                                 # hook: sertão night
bed(F("wind_dry_grass"), 0, 4.5, [[0, -27], [4.5, -28]], s0=60)
bed(WIND, 0, 8.5, [[0, -33], [4.5, -36], [8.5, -40]], lp=1200)
bed(F("owl_night"), 5.4, 8.4, [[5.4, -30], [8.4, -32]], s0=12.0, lp=4000)                 # card: a far owl
# house: the oil lamp's flutter, the stove's fire, the room tone
bed(F("fire_crackling_stove"), 8.5, 14.6, [[8.5, -24], [14.6, -24]], s0=37, lp=4500)
drone(8.5, 14.6, 38, -30, [[8.5, -4], [11, 0], [14.6, -2]], beat=0.3, lp=500)
bed(F("oil_lamp"), 8.5, 14.6, [[8.5, -33], [14.6, -33]], s0=0.0, lp=3000)
# chapel at dusk: crickets, dry wind
bed(CRK, 14.6, 26.6, [[14.6, -25], [20.6, -26], [26.6, -28]], s0=10, lp=8000)
bed(F("wind_dry_grass"), 14.6, 26.6, [[14.6, -29], [26.6, -27]], s0=20)
# the road at night: wind in the grass, crickets, a nightjar, the fence wire's hum (code)
bed(F("wind_dry_grass"), 26.6, 45.0, [[26.6, -24], [32.6, -27], [38.6, -27], [44.9, -25]], s0=40)
bed(CRK, 26.6, 45.0, [[26.6, -25], [38.6, -26], [44.9, -29]], s0=25, lp=9000)
bed(F("nightjar"), 26.6, 32.6, [[26.6, -28], [32.6, -32]], s0=32.5, hp=600)
tw = T_(6.0); wire = sum(a * np.sin(2 * np.pi * f * tw + f) for f, a in ((190, 1), (380, 0.4), (571, 0.25))) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * tw))
put(filt(wire, "bandpass", [150, 900]) / rms(wire) * db(-41), 26.6, pan=0.4)
# THE HIT and after: wind, crickets low (the night holds its breath)
bed(F("wind_dry_grass"), 45.6, 56.0, [[45.6, -27], [56, -27]], s0=10)
bed(CRK, 47.0, 56.0, [[47, -36], [56, -31]], s0=5, lp=7000)
# dawn: a bird chorus, a far rooster, wind
bed(F("birds_morning"), 56.0, 71.0, [[56, -25], [63, -27], [70.6, -29]], s0=76)
bed(F("wind_dry_grass"), 56.0, 71.0, [[56, -28], [71, -27]], s0=80)

# ---------------------------------------------------------------- hook (0–4.5): the face in the bark turns (0.7–2.3) and grins (jaw 1.2–2.0)
shot(F("tree_creaking_wood"), 0.65, -14, s=7.9, d=1.8, lp=5000)
shot(F("wood_creak_door_slow"), 1.6, -16, s=74.8, d=1.4, lp=4000)
shot(F("leather_creak"), 1.15, -19, s=33.0, d=1.0)                                       # the dry skin of the jaw
shot(F("zombie_breathing"), 2.2, -17, s=12.6, d=2.0, lp=3500)                              # a dry rasp once it faces us
shot(F("monster_breathing"), 3.4, -24, s=18.0, d=1.0, lp=3000)

# ---------------------------------------------------------------- house (8.5–14.6): Tião raises the strap (9.6–10.9)
shot(F("chair_scrape_floor"), 8.75, -16, s=2.1, d=1.45)
shot(F("leather_belt_whip"), 10.25, -16, s=3.5, d=0.6, lp=6000)                                     # the strap swung up
shot(F("leather_creak"), 10.9, -18, s=34.0, d=0.6)                                         # pulled taut over his head
shot(F("leather_belt_whip"), 13.75, -15, s=3.5, d=0.6, rate=1.15, lp=6000)                          # it comes down (off-screen, under the cut)
put(boom(70, 0.4, 0.2) * db(-22), 14.1)

# ---------------------------------------------------------------- chapel (14.6–20.6): the bell swings 0.25·sin(2.2t), fading 17–20; it strikes at each extreme
KN = F("church_bell_single")
for n in range(40):
    t = (np.pi / 2 + n * np.pi) / 2.2
    if 14.6 <= t < 20.0: amp = (1 - ss(17, 20, t)); place(grain(KN, 5.1, 3.2, lp=5000), t, -23 + 20 * np.log10(max(1e-3, amp)), pan=-0.2) if amp > 0.15 else None
# the dried body (20.6–26.6): a dry crackle when its head jerks (23.6)
shot(F("bone_crack"), 23.58, -12, s=2.3, d=1.2)
shot(F("leather_creak"), 23.62, -17, s=35.0, d=0.8)
shot(F("zombie_breathing"), 24.4, -20, s=14.0, d=1.8, lp=3000)

# ---------------------------------------------------------------- the tree (26.6–32.6): it sinks back into the trunk (29.9–32.3), fingers slide off the lips last (31.2–32.3)
shot(F("tree_creaking_wood"), 29.95, -15, s=8.5, d=2.4, lp=4500)
shot(F("leather_creak"), 31.2, -17, s=36.0, d=1.1)
shot(F("wood_creak_door_slow"), 31.9, -19, s=76.0, d=0.8, lp=3500)

# ---------------------------------------------------------------- the ox cart (32.6 → stops at STOP_T 38.9)
# the cart's song: the carro de boi recording (the axle's singing) + a wooden rolling bed, cut hard on the stop
cart_song = load(src(F("carro_de_boi")))[int(10.0 * SR):int(10.0 * SR) + int((STOP_T - 32.6) * SR)]
ev_ = np.sqrt(np.convolve(cart_song.mean(1) ** 2, np.ones(4800) / 4800, 'same')) + 1e-4; cart_song = cart_song / (ev_ / ev_.mean())[:, None] ** 0.5;   # tame the loudest squeals
cart_song = cart_song / rms(cart_song) * db(-29); cart_song[:int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]; fd = int(0.07 * SR); cart_song[-fd:] *= np.linspace(1, 0, fd)[:, None]
gcs = np.interp(32.6 + np.arange(len(cart_song)) / SR, [32.6, 35.6, 35.65, 38.9], [0, 0, 1.0, 1.0]); put(cart_song * db(gcs)[:, None], 32.6)   # closer from the second shot
roll = load(src(F("ox_cart")))[int(5.0 * SR):int(5.0 * SR) + int((STOP_T - 32.6) * SR)]; roll = roll / rms(roll) * db(-29); roll[:int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]; roll[-fd:] *= np.linspace(1, 0, fd)[:, None]; put(roll, 32.6)
y = filt(noise(0.12), "bandpass", [120, 900]) * np.exp(-T_(0.12) / 0.04); put(y / np.abs(y).max() * db(-15), STOP_T); put(boom(90, 0.3, 0.2) * db(-17), STOP_T)   # the wheels lock: a wooden clunk
shot(F("wood_creak_door_slow"), STOP_T + 0.05, -18, s=75.5, d=0.9, lp=3000)                 # the yoke strains
# hooves: one recorded hoof grain on every contact of every leg (the gait of poseOx: f = (dist/C + ph) mod 1 lands at 0.3)
HV = F("cow_walking"); hoofs = [grain(HV, s, 0.24, lp=4000) for s in (0.78, 1.38, 2.31, 3.14, 3.92, 4.62, 5.18, 5.81)]
k = 0
for i, (ox_off, pan) in enumerate(((0.0, -0.25), (0.31, 0.25))):
    for ph in (0, 0.5, 0.75, 0.25):
        ts = np.arange(32.6, STOP_T, 1 / 240); u = (np.array([sCart(t) for t in ts]) + ox_off) / C + ph; f = np.mod(u, 1)
        for j in np.where((f[:-1] < 0.3) & (f[1:] >= 0.3))[0]: place(hoofs[k % len(hoofs)], ts[j + 1] - 0.01, -19 + (1.0 if ts[j] > 35.6 else 0) , pan); k += 1
# the lantern on the yoke post clinks at the ends of its swing (sin 2.3t): every other extreme, softly
CL = F("metal_clank_chain")
for n in range(80):
    t = (np.pi / 2 + n * np.pi) / 2.3
    if 32.7 <= t < 41.6 and n % 2 == 0: place(grain(CL, 4.2, 0.3, hp=1500), t, -27, pan=-0.15)
# the oxen balk (STOP_T): snorts; the outside front hoof stamps when sin(7t') comes down; a low bellow
SN = F("cow_snort")
shot(SN, STOP_T + 0.1, -13, s=7.6, d=1.6); shot(SN, 40.3, -15, s=17.6, d=1.9)
shot("fs/cow_moo/673472_gloomy_night_cows_wav.mp3", 40.8, -16, s=19.0, d=2.4, lp=3500)
for i, pan in ((0, -0.25), (1, 0.25)):
    for n in range(200):
        t = np.pi * (2 * n + 1) / 7 - i * 0.7
        if STOP_T + 0.3 < t < 41.6: place(hoofs[n % len(hoofs)], t, -16, pan)
        if 45.65 < t < 56.0: place(hoofs[(n + 3) % len(hoofs)], t, -17, pan)
# he climbs down (41.6–43.0): the bed creaks under his steps (41.95, 42.1, 42.45), he jumps (42.55) and lands (42.72)
for t in (41.95, 42.1, 42.45): shot(F("wood_creak_door_slow"), t - 0.05, -21, s=74.9 + t % 1, d=0.45, lp=3000)
shot(F("jump_landing_dirt"), 42.69, -11, s=0.0, d=0.33); put(boom(80, 0.25, 0.2) * db(-18), 42.72)
BT = F("footsteps_dirt_boots"); steps = [grain(BT, s, 0.3) for s in (0.68, 1.27, 1.93, 2.54, 3.2, 3.84)]
for kk in range(6):  # walkMan: foot contacts at s = L·(n + 0.38 + 0.5j), s = 0.55 (t − 43)
    t = 43.0 + 0.6 * (0.38 + 0.5 * kk) / 0.55
    if t < 44.95: place(steps[kk % len(steps)], t - 0.02, -16 - 1.5 * kk, pan=0.1)

# ---------------------------------------------------------------- THE HIT (45.6): the bark splits, it is on his back
shot(F("wood_cracking_splitting"), 45.6, -2, s=2.3, d=1.4)
shot(F("bone_crack"), 45.62, -6, s=2.3, d=1.3)
put(boom(42, 5.0, 0.5) * db(-2), 45.6)
tt = T_(7.0); cl = sum(np.sin(2 * np.pi * f * tt) for f in (98.0, 103.8, 146.8, 155.6, 207.7)) * np.exp(-tt / 2.6) * env(len(tt), 0.02)
put(filt(cl, "lowpass", 2200) * db(-13), 45.6, pan=0.1)
shot(F("zombie_breathing"), 45.8, -7, s=12.5, d=3.6, lp=4000)                            # its dry rasp at his ear
shot("fs/cow_moo/673472_gloomy_night_cows_wav.mp3", 45.9, -15, s=1.0, d=2.2, lp=3500)        # the oxen bellow
shot(F("leather_creak"), 47.5, -18, s=32.6, d=2.0)                                          # its arms tighten
bed(F("monster_breathing"), 49.0, 56.0, [[49, -26], [53, -21], [56, -24]], s0=17.5, lp=3500)
bed(F("cow_breathing"), 46.5, 56.0, [[46.5, -30], [56, -30]], s0=0.0)
# the lantern is torn off the yoke when the oxen jerk (51.4) and lands in the dirt (51.82)
shot(SN, 51.25, -12, s=7.6, d=1.4); shot(F("metal_clank_chain"), 51.4, -17, s=4.2, d=0.35, hp=1200)
shot(F("metal_lantern_drop"), 51.80, -7, s=0.15, d=1.3, lp=6000); shot(F("glass_clink"), 51.83, -20, s=5.0, d=0.5, hp=1500)
# its head turns to us (53.2–53.7)
shot(F("tree_creaking_wood"), 53.15, -16, s=9.0, d=1.0, lp=4000); shot(F("leather_creak"), 53.2, -16, s=33.5, d=0.6)

# ---------------------------------------------------------------- dawn (56–71)
shot(F("rooster_crow"), 58.05, -26, s=2.0, d=1.5, lp=5000)
shot(F("cow_breathing"), 57.4, -31, s=5.0, d=3.0, lp=3000)                                           # an ox shifts in the yoke
shot(F("wood_creak_door_slow"), 60.1, -24, s=77.0, d=1.1, lp=3000)                          # the yoke creaks
shot(F("tree_creaking_wood"), 63.2, -21, s=7.9, d=2.2, lp=4000)                             # the two faces: a dry creak
shot(F("leather_creak"), 64.4, -22, s=35.2, d=1.0)
shot(F("rooster_crow"), 66.8, -30, s=2.0, d=1.5, lp=4000)

# ---------------------------------------------------------------- code layer
drone(0, 8.5, 41, -27, [[0, 0], [4.4, -3], [8.5, -10]])
bcard = bell(98, 3.8); bcard *= np.interp(np.arange(len(bcard)), [0, len(bcard) * 0.6, len(bcard)], [1, 1, 0]); put(bcard * db(-20), 4.75, pan=-0.1); put(boom(60, 2.4, 0.4) * db(-15), 4.75)
drone(20.6, 45.0, 34, -29, [[20.6, -12], [26.6, -8], [38.9, -3], [44.8, 3]], beat=0.2, lp=600)
drone(45.6, 56.0, 30, -24, [[45.6, 3], [52, 0], [56, -4]], beat=0.4, lp=600)
drone(63.0, 71.0, 38, -31, [[63, -6], [66, 0], [71, -6]], beat=0.25, lp=500)
put(bell(660, 3.0, ((1, 1), (2.76, 0.3), (5.4, 0.1))) * db(-27), 66.3, pan=0.3)               # the badge
def whoosh(t, g, d=0.6, f0=300, f1=2400):
    n = int(d * SR); x = noise(d); yy = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        fc = f0 + (f1 - f0) * (i / n) ** 2; yy[i:i + seg] = filt(x[max(0, i - 2048):i + seg], "bandpass", [fc * 0.7, fc * 1.4])[-len(yy[i:i + seg]):]
    yy *= (np.arange(n) / n) ** 2.2; put(yy / np.abs(yy).max() * db(g), t - d)
whoosh(4.5, -30, 0.5); put(boom(50, 0.6, 0.3) * db(-24), 4.5)   # into the card
for tc in CUTS:
    whoosh(tc, -27); put(boom(55, 0.7, 0.3) * db(-20), tc)
# ---------------------------------------------------------------- master
import os
if os.environ.get('MIX_DEBUG'): sf.write('audio/premaster.wav', out.astype(np.float32), SR, subtype='FLOAT')
blk = int(0.5 * SR); e = np.array([np.sqrt(np.mean(out[i:i + blk] ** 2)) + 1e-9 for i in range(0, N, blk)])
st = np.convolve(e, np.ones(6) / 6, "same"); tgt = np.median(st[st > 1e-4]) * db(2.5)
ride = np.clip(tgt / st, 1, db(6)); ride[int(44.6 / 0.5):int(49 / 0.5)] = 1; ride[int(4.4 / 0.5):int(8.6 / 0.5)] = 1; ride[int(51.0 / 0.5):int(52.5 / 0.5)] = 1; ride[int(56.0 / 0.5):] = 1; ride[int(32.6 / 0.5):int(41.6 / 0.5)] = 1; ride[int(14.6 / 0.5):int(20.6 / 0.5)] = 1
ride = np.convolve(np.repeat(ride, blk)[:N], np.ones(int(0.6 * SR)) / int(0.6 * SR), "same"); out *= ride[:, None]
out += filt(out, "bandpass", [1200, 4000]) * (db(2) - 1)
out = filt(out, "highpass", 32, 4)   # keep the 20-30 Hz rumble out of small speakers
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
lim = db(-4.2)
for _ in range(3):
    if np.abs(out).max() <= lim: break
    g = np.minimum(1, lim / (np.abs(out).max(1) + 1e-9)); g = np.minimum.reduce([np.roll(g, s) for s in range(-240, 241, 24)]); out *= g[:, None]
L2 = meter.integrated_loudness(out)
sf.write("audio/mix.wav", out.astype(np.float32), SR, subtype="FLOAT")
w = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(0.1 * SR))[::int(0.05 * SR)].mean(1); i = int(np.argmax(w))
rep = f"LUFS {L2:.1f}  peak {20 * np.log10(np.abs(out).max()):.1f} dBFS  loudest 100 ms at {i * 0.05:.2f} s ({10 * np.log10(w[i]):.1f} dBFS)  silence 45.0-45.6 max {np.abs(out[a:b]).max():.2e}"
w3 = np.lib.stride_tricks.sliding_window_view(out.mean(1) ** 2, int(3 * SR))[::int(0.25 * SR)].mean(1); j = int(np.argmax(w3)); rep += f"  loudest 3 s at {j * 0.25:.2f} s"
sec = [10 * np.log10(np.mean(out[int(k * SR):int((k + 1) * SR)] ** 2) + 1e-12) for k in range(71)]; rep += "\nper second dBFS: " + " ".join(f"{k}:{v:.0f}" for k, v in enumerate(sec))
open("audio/levels.txt", "w").write(rep + "\n"); print(rep)
