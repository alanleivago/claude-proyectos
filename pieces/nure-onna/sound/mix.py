# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the sound for Nure-onna (adapted from pieces/lost-second/sound/mix.py), no voice. The captions talk: the user's 'Talking 1 Loop' plays while each caption
types, slowed (and so lowered) more as the story turns disturbing. Under it a dark sub/drone bed that changes texture per act
(clocks and cameras / the man and the records / the aftermath) and swells at the turns, plus CC0 Freesound SFX on the picture
(see CREDITS.md). Hard silence before "There is one left."; the reveal is the loudest hit. Madfable outro: power-on + low hit.
Master -13 LUFS (TARGET), true peak held by an oversampled limiter -> audio/mix.wav. Deterministic (fixed seeds)."""
import json, subprocess
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal

D = json.load(open('subs.json')); SR = 48000; T = D['dur']; N = int(T * SR)
V = {l['id']: l for l in json.load(open('../voice.json'))['lines']}
out = np.zeros((N, 2)); db = lambda x: 10 ** (x / 20)
BUS = {k: np.zeros((N, 2)) for k in ('talk', 'bed', 'sfx')}   # put() writes into `out`, pointed at one bus per section
shot = {k: (a, b) for k, a, b in D['shots']}
S0 = lambda k: shot[k][0]; S1 = lambda k: shot[k][1]
def VW(i, w, n=1):
    k = 0
    for x in V[i]['words']:
        if ''.join(c for c in x['w'].lower() if c.isalpha() or c == "'") == w:
            k += 1
            if k == n: return x['t0']
    return V[i]['t0']
REVEAL, CARD, LOGO = S0('reveal'), S0('card'), S0('logo')
TARGET = -13.0   # user: louder (was -14); -11 sounded squashed: -13 keeps the gain reduction small (measured)
QUIET = REVEAL - 0.85   # everything stops here: the exact silence before the hit

def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)
CACHE = {}
def ld(p):
    if p not in CACHE: CACHE[p] = load(p)
    return CACHE[p]
def filt(x, kind, f, o=2): return signal.sosfilt(signal.butter(o, f, kind, fs=SR, output='sos'), x, axis=0)
def rms(x): return np.sqrt(np.mean(x ** 2)) + 1e-12
def put(y, t0, g=0.0):
    a = int(t0 * SR)
    if a >= N: return
    y = y[: N - a]; out[a:a + len(y)] += y * db(g)
def fades(y, fi=0.05, fo=0.05):
    y = y.copy(); a, b = min(len(y) // 2, int(fi * SR)), min(len(y) // 2, int(fo * SR))
    if a: y[:a] *= np.linspace(0, 1, a)[:, None]
    if b: y[-b:] *= np.linspace(1, 0, b)[:, None]
    return y
def bed(f, t0, t1, g, src=0.0, hp=None, lp=None, fi=0.4, fo=0.4, rate=1.0, level=3):   # level: every bed is slow-ridden to at most 3 dB over its median level
    x = ld(f)
    if rate != 1.0: x = signal.resample(x, int(len(x) / rate))
    s = int(src * SR) % len(x); n = int((t1 - t0) * SR)
    y = join(x[s:], x[:s]) if s > int(0.1 * SR) else x
    while len(y) < n: y = join(y, x)   # every loop seam is crossfaded (a raw seam clicked: +5 dB overs after AAC)
    y = y[:n]
    if hp: y = filt(y, 'highpass', hp)
    if lp: y = filt(y, 'lowpass', lp)
    if level:   # a slow ride (2 s) on a recording with loud passages: anything louder than its own average + level dB comes down
        from scipy.ndimage import uniform_filter1d as uf
        e = np.sqrt(uf((y ** 2).mean(1), int(2 * SR)) + 1e-12); y = y * np.minimum(1, np.median(e) * db(level) / e)[:, None]   # relative to its typical (median) level
    put(fades(y / rms(y) * db(-20), fi, fo), t0, g)
def join(a, b, xf=0.06):
    k = min(int(xf * SR), len(a) // 2, len(b) // 2); r = np.linspace(0, 1, k)[:, None]
    return np.vstack([a[:-k], a[-k:] * (1 - r) + b[:k] * r, b[k:]])
def hit(f, t, g, s=0.0, d=None, rate=1.0, lp=None, hp=None, fo=0.3, verb=0.0):
    x = ld(f)[int(s * SR):]
    if d: x = x[:int(d * SR)]
    if rate != 1.0: x = signal.resample(x, int(len(x) / rate))
    if lp: x = filt(x, 'lowpass', lp)
    if hp: x = filt(x, 'highpass', hp)
    x = fades(x, 0.003, fo)
    if verb: x = reverb(x, verb)
    put(x / (np.abs(x).max() + 1e-9) * db(-6), t, g)
def reverb(x, sec, wet=0.75):
    """a big hall tail: convolution with a decaying (seeded) noise impulse, darker as it decays"""
    n = int(sec * SR); r = np.random.default_rng(7); t = np.arange(n) / SR
    ir = r.standard_normal((n, 2)) * np.exp(-t * 6.9 / sec)[:, None]; ir = filt(ir, 'lowpass', 3500); ir[0] = 0
    y = np.vstack([x, np.zeros((n, 2))]); w = signal.fftconvolve(y, ir, axes=0)[:len(y)]
    return y * (1 - wet) + w / (np.abs(w).max() + 1e-9) * np.abs(x).max() * wet * 1.4

import glob as _g
def F(i):   # a Freesound id -> its file (this piece's fs/ first, then lost-second's)
    for d in ('fs/', '../../lost-second/sound/fs/'):
        m = sorted(_g.glob(d + '*/%s_*' % i))
        if m: return m[0]
    raise FileNotFoundError(i)

out = BUS['talk']
# ---- the talking loop: one take per caption chunk, as long as its typing; slower (lower) as the story darkens
TALK = load('../../../Ref 1 bit pixelated junji ito madfable/Talking 1 Loop.wav')
TK = {}
def talk(t0, dur, rate, g, k=0):
    if rate not in TK: TK[rate] = signal.resample(TALK, int(len(TALK) / rate)) if rate != 1 else TALK
    n = int(dur * SR); src = np.roll(TK[rate], int(k * 0.37 * SR) % len(TK[rate]), axis=0)
    y = np.vstack([src] * (n // len(src) + 2))[:n]
    if rate < 0.8: y = reverb(y, 1.2, 0.25)[:n + int(0.6 * SR)]
    put(fades(y / rms(y[:n]) * db(-20), 0.01, 0.12), t0, g)
RATE = [('hook', 0.93), ('grandma', 0.95), ('shore', 0.9), ('smile', 0.82), ('heavy', 0.72), ('slid', 0.55), ('body', 0.47), ('stone', 0.5)]
RT = sorted((V[i]['t0'] - 0.3, r) for i, r in RATE)
rate_at = lambda t: [r for a, r in RT if t >= a][-1] if t >= RT[0][0] else 1.0
for k, c in enumerate(D['subs']):
    rate = min(0.07, max(0.025, (c['t1'] - c['t0']) / c['n']))
    talk(c['t0'], c['n'] * rate + 0.04, rate_at(c['t0']), -7, k)
talk(CARD + 0.5, 9 * 0.07, 0.45, -5, 99)   # the card types "nure-onna" in the deepest voice

# ---- sources (Freesound CC0, see CREDITS.md)
DRONE = F(871189); GHOST = F(560618); SUB = F(172325); SWELL = F(452999)
SEA = F(465435); STORM = F(426076); WIND = F(546869); WIND_IN = F(623604); STEPS = F(403604); CLOTH = F(850705)
SAND_HIT = F(543699); GRIND = F(743257); SLAB = F(844329); SCRATCH = F(354093)
BOOM = F(825392); HELL = F(826216); DEEP = F(500657); RUMBLE = F(483287); POWER = F(826215); ARC = F(871766)
SLITHER = F(433825); SURGE = F(803679); CREAK = F(590158)   # picked with earshot rank/find

GRAN, SHORE, OTS, SMILE, STONE, TOWER, OLD = S0('gran'), S0('shore'), S0('ots'), S0('smile'), S0('stone'), S0('tower'), S0('oldman')
out = BUS['bed']
# ---- the bed: the textured low drone + a constant sub; the ghost-house drone for the aftermath; swells at the turns
bed(SUB, 0.0, QUIET, -20, lp=220, fi=1.5, fo=0.05)
bed(DRONE, 0.0, QUIET, -17, lp=1000, fi=1.2, fo=0.05)
bed(SWELL, STONE - 2.0, QUIET, -23, lp=1500, fi=4.0, fo=0.05)                     # the weight: dread builds into the silence
bed(SUB, REVEAL + 0.3, LOGO, -20, src=11, lp=220, fi=1.0, fo=0.6)
bed(GHOST, REVEAL + 0.6, LOGO, -20, lp=2500, fi=2.0, fo=1.2, level=2)
bed(SEA, 0.0, GRAN + 0.2, -17, lp=7000, fi=0.05, fo=0.2)                          # night sea and foam under the hook
bed(SEA, SHORE, QUIET, -18, src=9, lp=7000, fi=0.6, fo=0.05)
bed(STORM, REVEAL, OLD, -18, src=20, lp=5000, fi=0.05, fo=0.6)                    # the sea heaving after the reveal
bed(WIND, GRAN, SHORE + 0.4, -18, src=12, lp=6000, fi=0.3, fo=0.5)                # winter wind at the grandmother's door
bed(WIND_IN, OLD, CARD, -27, src=3, lp=3000, fi=2.0, fo=0.8, level=1)                      # the old house, wind outside
bed(SUB, LOGO + 0.6, T, -23, src=40, lp=300, fi=1.0, fo=2.0)   # the 5 s end screen: low, fading out with it                       # the end screen: low, alive, fading
bed(GHOST, LOGO + 1.0, T, -28, src=60, lp=1200, fi=1.5, fo=2.0)

out = BUS['sfx']
# ---- the hook: she breaks the surface
hit(SURGE, 0.05, -14, s=63.3, d=3.2, lp=6000, fo=0.8)
hit(DEEP, 0.1, -17, rate=0.7, lp=600, d=2.5, fo=1.2, verb=2.0)
hit(DEEP, VW('hook', "don't"), -17, rate=0.6, lp=500, d=2.5, fo=1.0, verb=2.0)           # "don't."
# ---- the grandmother: a door slides, the wind gusts
hit(SCRATCH, GRAN + 0.05, -20, d=0.6, rate=0.8, hp=200, lp=4000, fo=0.2)
hit(DEEP, S0('granCU'), -23, rate=0.75, lp=350, d=2.5, fo=0.8)
# ---- the walk: footsteps on sand along the shore
bed(STEPS, SHORE + 0.3, OTS - 0.6, -26, src=4, hp=120, lp=7000, fi=0.2, fo=0.5, level=1)
hit(DEEP, SHORE, -23, rate=0.75, lp=350, d=2.5, fo=0.8)
# ---- the bundle: cloth on the offer and when he takes it; her smile stretches with a slow creak
hit(CLOTH, OTS + 0.3, -21, s=1.0, d=1.6, hp=150, fo=0.4)
hit(SCRATCH, VW('smile', 'wide') - 0.15, -17, s=0.5, d=1.4, rate=0.6, hp=120, lp=3000, fo=0.5)
hit(DEEP, VW('smile', 'wide'), -16, rate=0.6, lp=500, d=2.5, fo=1.0, verb=2.0)
hit(CLOTH, STONE + 0.1, -21, s=4.0, d=1.2, hp=150, fo=0.4)
# ---- the weight: a stone crunch on each "heavy", heavier every time
for j, w in enumerate(('heavy', 'heavier', 'go')):
    t = VW('heavy', w)
    hit(GRIND, t - 0.04, -18 + j * 1.5, rate=0.8 - j * 0.1, lp=4000 - j * 800, fo=0.3)
    hit(SAND_HIT, t, -17 + j * 1.5, s=(8.172, 11.401, 24.409)[j], d=0.9, lp=3000, fo=0.3)
    hit(DEEP, t, -22 + j * 2, rate=0.6 - j * 0.05, lp=400, d=1.2, fo=0.5)
hit(SLAB, VW('heavy', 'go') + 0.3, -30, d=2.0, rate=0.7, lp=1800, fo=0.8)
# a soft low thud on every plain cut, so no cut lands dead (earshot timeline: 5 cuts had no hit)
for k in ('gran', 'ots', 'smile', 'stone', 'oldman'):
    hit(DEEP, S0(k), -24, rate=0.75, lp=350, d=1.5, fo=0.6)
for k in ('gran', 'granCU', 'shore', 'ots', 'stone', 'oldman'):   # ...with a soft textured attack the ear (and earshot) catches
    hit(SAND_HIT, S0(k) - 0.01, -24, s=11.401, d=0.9, lp=3000, fo=0.3)   # earshot find: the cleanest thud
BUS['sfx'] *= db(-3.5)   # picture SFX sit under the talking loop; the stingers below stay full
# ---- the reveal: exact silence, then the loudest hit, the wet slither and the water surge
r0 = int((QUIET - 1.4) * SR); r1 = int(QUIET * SR)   # everything sinks away over 1.4 s, then exact silence
for b in BUS.values(): b[r0:r1] *= np.linspace(1, 0, r1 - r0)[:, None] ** 1.5
for b in BUS.values(): b[int(QUIET * SR):int(REVEAL * SR)] = 0
hit(HELL, REVEAL, -5, lp=6000, fo=1.5, verb=4.0)
hit(DEEP, REVEAL, -7, rate=0.55, fo=1.5, verb=3.0)
hit(SURGE, REVEAL + 0.05, -10, s=43.6, d=3.4, lp=7000, fo=1.0)
hit(RUMBLE, REVEAL, -5, d=4.0, lp=1200, fo=1.2)
bed(SLITHER, REVEAL + 0.6, TOWER, -24, src=10.5, rate=0.85, hp=80, lp=6000, fi=0.6, fo=0.6, level=1)
# ---- the tower: a low boom as we look up, the body still sliding
hit(BOOM, TOWER, -11, lp=900, fo=1.6, verb=3.0)
hit(HELL, TOWER, -17, lp=3000, d=2.5, fo=1.2)   # the boom alone is pure sub: a mid-range body so it reads
bed(SLITHER, TOWER, OLD - 0.3, -27, src=6, rate=0.7, hp=80, lp=3500, fi=0.5, fo=0.6, level=1)
# ---- years later: the house creaks, the bundle settles
hit(CREAK, OLD + 0.6, -22, lp=5000, fo=0.6)
hit(CREAK, VW('stone', 'heavier') - 0.2, -22, s=1.0, rate=0.85, lp=4000, fo=0.6)
hit(DEEP, OLD, -23, rate=0.7, lp=400, d=2.5, fo=1.0)
hit(DEEP, VW('stone', 'winter'), -18, rate=0.55, lp=500, d=2.5, fo=1.4, verb=2.5)
# ---- the card and the Madfable outro
hit(DEEP, CARD + 0.4, -13, rate=0.7, lp=1200, d=2.5, fo=1.2, verb=2.5)
hit(POWER, LOGO, -13, lp=4000, fo=0.8)
for k in range(4): hit(ARC, LOGO + k * 0.11, -17, s=1.0 + k * 0.7, d=0.1, hp=300, fo=0.03)
hit(BOOM, LOGO + 0.45, -11, lp=600, fo=1.6, verb=3.0)

from scipy.ndimage import minimum_filter1d, uniform_filter1d
meter = pyln.Meter(SR)
def lvl(x):   # a bus's typical loud level: the 90th percentile of its 400 ms RMS windows that are active
    w = int(0.4 * SR); r = np.array([20 * np.log10(rms(x[j:j + w])) for j in range(0, N - w, w)]); return np.percentile(r[r > -60], 90)
print('bus levels (pre-master, dB): talk %.1f, bed %.1f, sfx %.1f' % tuple(lvl(BUS[k]) for k in ('talk', 'bed', 'sfx')))
def narrow(x):   # narrower image (the beds and reverbs were very wide), and nothing near Nyquist (hard clicks rang after AAC)
    M, Sd = (x[:, 0] + x[:, 1]) / 2, (x[:, 0] - x[:, 1]) / 2 * 0.55; return filt(np.stack([M + Sd, M - Sd], 1), 'lowpass', 16000, 8)
def limiter(x, ceil_db=-2.0, r=0.06):
    """a transparent true-peak limiter (no saturation): 4x-oversampled peaks; the needed gain is held over +-r and then
    averaged over r, so it eases in about r before a peak and out about r after it: no clicks, no fast pumping"""
    up = signal.resample_poly(x, 4, 1, axis=0); pk = np.abs(up).max(1)[: len(x) * 4].reshape(-1, 4).max(1)
    need = np.minimum(1, db(ceil_db) / np.maximum(pk, 1e-9)); R = int(r * SR)
    g = uniform_filter1d(minimum_filter1d(need, 2 * R + 1), R); return x * g[:, None], np.minimum(g, 1)
def gr_report(name, gr):
    bad = np.where(gr < -3)[0]; secs = sorted(set(int(v) for v in np.round(bad / SR)))
    print('%s: max GR %.1f dB at %.2fs; time with GR > 1 dB %.1f%%, > 3 dB %.1f%%; > 3 dB around %s' % (name, -gr.min(), gr.argmin() / SR, (gr < -1).mean() * 100, (gr < -3).mean() * 100, secs[:24]))
TALK_G, BED_G, SFX_G = db(-12.5), db(5.5), db(3.5)   # nure-onna: the bed sits higher (sea, wind, drone carry the night)   # user: the talking loop 12.5 dB down (three rounds), BGM and SFX 3.5 dB up
# the bed was sub-heavy: its drones put peaks ~12 dB over the ceiling while adding little loudness, so the tanh stage
# saturated it most of the time (the 'squashed' sound). Trim the subsonic and shelve the lows ~5 dB down under 90 Hz.
BED = filt(BUS['bed'], 'highpass', 35, 4); BED = BED - 0.45 * filt(BED, 'lowpass', 90, 2)
SFX = filt(BUS['sfx'], 'highpass', 30, 4)
PRE = narrow(BUS['talk'] * TALK_G + BED * BED_G + SFX * SFX_G); lin = db(TARGET - meter.integrated_loudness(PRE))
# each bus is peak-controlled at the gain it will finally play at, so this loops until the gain settles:
# - the SFX transients (ticks, clicks, booms) by a fast limiter on their own bus (the bed is not ducked under them)
# - the bed's recordings (12-20 dB crest) by a slow fader-ride, the gain eased over ~0.25 s
# then the master limiter only touches the rare peaks left
for it in range(12):
    sfx_l, gs = limiter(SFX * SFX_G * lin, ceil_db=-2.2, r=0.025)
    bed_l, gb = limiter(BED * BED_G * lin, ceil_db=-2.2, r=0.5)
    PRE = narrow(BUS['talk'] * TALK_G + (bed_l + sfx_l) / lin)
    out, g = limiter(PRE * lin); step = TARGET - meter.integrated_loudness(out); lin *= db(step)
    if abs(step) < 0.05: break
sfx_l, gs = limiter(SFX * SFX_G * lin, ceil_db=-2.2, r=0.025); bed_l, gb = limiter(BED * BED_G * lin, ceil_db=-2.2, r=0.5)
PRE = narrow(BUS['talk'] * TALK_G + (bed_l + sfx_l) / lin)
gr_report('sfx bus limiter', 20 * np.log10(gs)); gr_report('bed bus fader-ride', 20 * np.log10(gb))
out, g = limiter(PRE * lin); gr_report('master limiter', 20 * np.log10(g))
L2 = meter.integrated_loudness(out)
def aac_peaks(x):   # encode to AAC 256k as the mux does, decode, and return the 4x-oversampled peak per sample of x
    import tempfile, os
    with tempfile.TemporaryDirectory() as d:
        w, m = os.path.join(d, 'a.wav'), os.path.join(d, 'a.m4a'); sf.write(w, x, SR, subtype='PCM_24')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-c:a', 'aac', '-b:a', '256k', m], check=True)
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', m, '-f', 'f32le', '-ac', '2', '-ar', str(SR * 4), '-'], capture_output=True, check=True).stdout
    up = np.abs(np.frombuffer(raw, np.float32).reshape(-1, 2)).max(1); n = min(len(up) // 4, len(x))
    return up[: n * 4].reshape(-1, 4).max(1), n
# AAC overshoots short dense transients (the reveal's glitch bursts, the fire) by up to ~3.5 dB: find where the encoded
# file passes -1.3 dBTP and pull those few spots down with a smooth 80 ms envelope, then check again
for it in range(5):
    pk, n = aac_peaks(out); over = np.where(pk > db(-1.6))[0]
    print('aac pass %d: max %.2f dBTP, %d samples over' % (it, 20 * np.log10(pk.max()), len(over)))
    if not len(over): break
    g = np.ones(N); g[over] = db(-1.9) / pk[over]
    w = int(0.04 * SR); g = uniform_filter1d(minimum_filter1d(g, 2 * w + 1), w); out = out * g[:, None]
sf.write('audio/mix.wav', out, SR, subtype='PCM_24')
st = np.abs(np.diff(out, axis=0)).max(1); print('sample steps > 0.25 at', [round(i / SR, 2) for i in np.where(st > 0.25)[0][:10]])
sf.write('audio/stem-nontalk.wav', (bed_l + sfx_l), SR, subtype='PCM_24')   # for realness checks without the 8-bit talking loop
w = int(0.4 * SR); env = [rms(out[i:i + w]) for i in range(0, N - w, w // 2)]; i = int(np.argmax(env))
up = signal.resample_poly(out, 4, 1, axis=0)
print('true peak (4x) %.2f dBTP' % (20 * np.log10(np.abs(up).max())))
print('LUFS %.1f -> %.2f, peak %.2f dBFS, silence %.2f-%.2f, loudest 400ms window at %.2fs (reveal %.2f)' % (
    meter.integrated_loudness(PRE), L2, 20 * np.log10(np.abs(out).max()), QUIET, REVEAL, i * w / 2 / SR, REVEAL))
for tt in (i * w / 2 / SR, REVEAL + 0.3, 1.0, 20.0):   # which bus makes a window loud (post-limiter levels)
    a = int(tt * SR); print('at %.2fs: talk %.1f bed %.1f sfx %.1f dB' % (tt, 20 * np.log10(rms(BUS['talk'][a:a + w] * TALK_G * lin)), 20 * np.log10(rms(bed_l[a:a + w])), 20 * np.log10(rms(sfx_l[a:a + w]))))
for nm, x in (('talk', BUS['talk'] * TALK_G * lin), ('bed', bed_l), ('sfx', sfx_l)):
    st = np.abs(np.diff(x, axis=0)).max(1); print(nm, 'steps > 0.15 at', [round(i / SR, 2) for i in np.where(st > 0.15)[0][:6]])
