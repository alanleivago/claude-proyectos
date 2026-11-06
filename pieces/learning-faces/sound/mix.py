# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the sound for Learning Faces (from Bells) (copied from The Lost Second), no voice. The captions talk: the user's 'Talking 1 Loop' plays while each caption
types, slowed (and so lowered) more as the story turns disturbing. Under it a dark sub/drone bed that changes texture per act
(clocks and cameras / the man and the records / the aftermath) and swells at the turns, plus CC0 Freesound SFX on the picture
(see CREDITS.md). Hard silence before "There is one left."; the reveal is the loudest hit. Madfable outro: power-on + low hit.
Master -11 LUFS (TARGET), true peak held by an oversampled limiter -> audio/mix.wav. Deterministic (fixed seeds)."""
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
REVEAL, CARD, LOGO = S0('wasnt'), S0('card'), S0('logo')
TARGET = -13.0   # user: louder (was -14); -11 sounded squashed: -13 keeps the gain reduction small (measured)

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



out = BUS['talk']
# ---- the talking loop under every caption (the user's Talking 1 Loop.wav), slower and lower as it darkens
TALK = load('../../../Ref 1 bit pixelated junji ito madfable/Talking 1 Loop.wav')
TK = {}
def talk(t0, dur, rate, g, k=0):
    if rate not in TK: TK[rate] = signal.resample(TALK, int(len(TALK) / rate)) if rate != 1 else TALK
    n = int(dur * SR); src = np.roll(TK[rate], int(k * 0.37 * SR) % len(TK[rate]), axis=0)
    y = np.vstack([src] * (n // len(src) + 2))[:n]
    if rate < 0.8: y = reverb(y, 1.2, 0.25)[:n + int(0.6 * SR)]
    put(fades(y / rms(y[:n]) * db(-20), 0.01, 0.12), t0, g)
RATE = [('1960', 1.0), ('saw', 0.97), ('camera', 0.95), ('back', 0.95), ('first', 0.9), ('still', 0.84), ('second', 0.84), ('holes', 0.78),
        ('moved', 0.76), ('late', 0.7), ('strange', 0.78), ('better', 0.72), ('three', 0.7), ('species', 0.74), ('smiled', 0.62), ('general', 0.7),
        ('theirs', 0.58), ('refused', 0.7), ('alone', 0.66), ('tape', 0.66), ('dark', 0.6), ('turns', 0.56), ('smiling', 0.5), ('wasnt', 0.42),
        ('empty', 0.55), ('shut', 0.6), ('piccard', 0.58), ('three_faces', 0.5), ('next', 0.46)]
RT = sorted((V[i]['t0'] - 0.3, r) for i, r in RATE)
rate_at = lambda t: [r for a, r in RT if t >= a][-1] if t >= RT[0][0] else 1.0
for k, c in enumerate(D['subs']):
    rate = min(0.07, max(0.025, (c['t1'] - c['t0']) / c['n']))
    talk(c['t0'], c['n'] * rate + 0.04, rate_at(c['t0']), -7, k)
talk(CARD + 0.5, 26 * 0.07, 0.45, -5, 99)

# ---- sources (Freesound CC0, see CREDITS.md)
import glob
F = lambda d, i=0: sorted(glob.glob('fs/' + d + '/*.mp3'))[i]
SUB = F('dark_drone_ambient_low', 0); DR1 = F('cinematic_sub_drone', 2); DR2 = F('dark_ambient_drone', 3); DR3 = F('dark_ambient_drone', 2)
SWELL = F('dark_ambient_drone', 0); PADS = F('horror_ambience_pad', 3)
UW = F('underwater_ambience_deep', 3); UW2 = F('deep_impact_reverb', 0)
SONAR = F('sonar_ping', 3); SONAR2 = F('sonar_ping', 2)
HULL = F('submarine_hull_creak', 0); BUBB = F('underwater_bubbles', 0)
KNOCK = F('metal_knock_glass', 1); BEEP = F('camcorder_beep', 0); LENS = F('camcorder_beep', 2)
HUM = F('fluorescent_light_hum', 3); HEART = F('heartbeat_slow', 3)
PAPER = F('paper_rustle', 4); SHUT = F('camera_shutter', 2)
SLIME = F('wet_squelch', 1); SLIME2 = F('wet_squelch', 2)
BOOM = F('deep_impact_reverb', 1); HELL = F('deep_impact_reverb', 3); DEEP = F('horror_impact_hit', 2)
RUMBLE = F('earthquake_rumble', 0); STATIC = F('tv_static', 3); GLITCH = F('tv_static', 2)
POWER = F('deep_impact_reverb', 2); ARC = F('electric_spark', 4); DRIP = F('cave_water_drip', 0)
def opt(d, i=0):
    g = sorted(glob.glob('fs/' + d + '/*.mp3')); return g[min(i, len(g) - 1)] if g else None
SEA = opt('ocean_waves_night', 3); GASP = None   # no usable gasp in the downloads (a yawn, a UI pop, a screech): left out
CLOCK = opt('clock_ticking', 2); VHS = opt('vhs', 1); HATCH = opt('submarine_interior', 3); SUBI = opt('submarine_interior', 1)
FLESH = opt('flesh', 2)

out = BUS['bed']
# ---- BGM bed: a constant sub; act 1 (1960 / the return) a textured drone, act 2 (the dives) the deep-water rumble and a
# dark thriller atmo, act 3 (the tape) ghost-house dark; swells into the turns
DEEPS = [k for k in ('1960', 'saw', 'first', 'still', 'holes', 'moved', 'late', 'three', 'smiled', 'dark', 'turns', 'smiling', 'wasnt', 'three_faces', 'next')]
QUIET = VL1 = V['smiling']['t1'] + 0.9
bed(SUB, 0.0, QUIET, -19, lp=220, fi=3.0, fo=0.05)
bed(SUB, REVEAL + 0.4, LOGO, -21, src=11, lp=220, fi=2.0, fo=0.6)
bed(DR1, 0.0, S0('first') + 1.0, -19, lp=900, fi=4.0, fo=1.5)
bed(DR2, S0('first') - 0.5, S0('refused') + 1.0, -21, lp=700, fi=1.5, fo=1.0, level=2)
bed(PADS, S0('strange'), S0('theirs') + 2, -23, lp=3500, fi=3.0, fo=1.5, rate=0.85)
bed(DR3, S0('refused') - 0.5, QUIET, -21, lp=2000, fi=2.0, fo=0.05, level=2)
bed(DR3, REVEAL + 0.8, LOGO, -20, src=30, lp=2500, fi=2.5, fo=1.2, level=2)
for t in (S0('holes'), S0('smiled'), S0('theirs'), S0('turns')): bed(SWELL, t - 4.0, t + 3.0, -15, lp=1500, fi=3.8, fo=2.5)
# the deep: underwater rumble on every shot below the surface
for k in DEEPS:
    if k in ('wasnt',): continue
    bed(UW, S0(k), min(S1(k), QUIET), -20, src=sum(map(ord, k)) % 20, lp=1800, fi=0.4, fo=0.4)

out = BUS['sfx']
for t in (S0('holes'), VW('theirs', 'theirs'), S0('turns')): hit(BOOM, t, -16, lp=900, fo=1.2, verb=2.5)
# ---- 1960: the Trieste sinking (hull groans, a ping), the sand cloud (a muffled rumble), the deck (sea, wind of voices)
for j in range(3): hit(HULL, S0('1960') + 1.0 + j * 2.4, -15, s=2.0 + j * 3, d=1.6, lp=2500, fo=0.6, verb=1.5)
hit(SONAR2, S0('1960') + 0.6, -18, d=2.5, lp=4000, fo=1.0, verb=2.0)
hit(RUMBLE, VW('saw', 'sand') - 0.2, -19, d=3.0, lp=500, fo=1.2)
if SEA: bed(SEA, S0('camera'), S1('camera'), -20, lp=4000, fi=0.4, fo=0.4)
if SEA: bed(SEA, S0('back'), S1('back'), -22, src=10, lp=4000, fi=0.4, fo=0.4)
hit(F('electric_spark', 3), S0('back') + 0.5, -26, d=1.0, hp=300, fo=0.3)       # the deck floodlights buzz
if HATCH: hit(HATCH, S0('back') + 2.5, -18, d=1.5, fo=0.5)
# ---- the dives: sonar pings as the clock, bubbles on the descent, hull creaks; the thing is silent (the horror)
for k in ('first', 'still', 'holes', 'moved', 'three', 'smiled'):
    t = S0(k) + 0.5
    while t < S1(k) - 1.0: hit(SONAR, t, -17 if k == 'first' else -20, d=2.0, lp=4500, fo=0.8, verb=2.5); t += 4.2
hit(BUBB, S0('first') + 0.2, -18, d=3.0, lp=3500, fo=0.8)
for k in ('still', 'holes', 'three', 'smiled'): hit(HULL, S0(k) + 1.6, -18, s=6.0, d=1.8, lp=2500, fo=0.6, verb=1.5)
hit(SONAR, VW('still', 'still') - 0.05, -14, d=0.3, fo=0.2, lp=4000)                    # it held still: a ping cut short
hit(SLIME, VW('holes', 'eyes'), -18, rate=0.6, lp=2500, fo=0.5, verb=1.5)                  # the face pressed in
hit(SLIME2, VW('holes', 'mouth'), -19, rate=0.55, lp=2500, fo=0.5, verb=1.5)
# ---- the mirror: breath held, the knock of his hand on the glass; its hand a second later (a wet echo)
if GASP: hit(GASP, VW('moved', 'same') - 0.1, -16, d=1.2, lp=6000, fo=0.3)
hit(KNOCK, VW('moved', 'moved') + 0.6, -14, d=0.5, hp=150, fo=0.2)
hit(KNOCK, VW('moved', 'moved') + 1.6, -18, d=0.5, hp=150, lp=1800, fo=0.2, verb=1.5)      # its own, one second late
hit(KNOCK, S0('late') + 0.4, -15, d=0.5, hp=150, fo=0.2); hit(KNOCK, S0('late') + 1.4, -19, d=0.5, lp=1500, fo=0.2, verb=2.0)
bed(HEART, S0('moved'), S1('late'), -21, lp=300, fi=0.5, fo=0.5)
# ---- the lab: fluorescent hum, the prints, the books, the photos
for k in ('strange', 'better', 'species', 'general', 'theirs'): bed(HUM, S0(k), S1(k), -27, src=sum(map(ord, k)) % 10, lp=6000, fi=0.3, fo=0.3)
for j in range(5): hit(SHUT, S0('better') + 0.5 + j * 0.7, -24, fo=0.1)                     # pins pressed in, one per print
bed(PAPER, S0('species') + 0.3, S0('species') + 2.5, -24, lp=6000, fi=0.3, fo=0.6)
bed(PAPER, S0('general') + 0.2, S0('general') + 2.0, -24, src=3, lp=6000, fi=0.3, fo=0.6)
hit(DEEP, VW('theirs', 'theirs'), -13, rate=0.6, lp=1200, fo=1.4, verb=3.0)
if CLOCK: bed(CLOCK, S0('refused'), S1('refused'), -24, lp=6000, fi=0.4, fo=0.4)
if HATCH: hit(HATCH, VW('alone', 'alone') - 0.2, -14, d=1.6, fo=0.6, verb=1.0)          # the hatch closes on him
if SEA: bed(SEA, S0('alone'), S1('alone'), -24, src=20, lp=4000, fi=0.3, fo=0.4)
# ---- the tape: the evidence bag, the tape running, forty minutes of dark water, the camera turning
hit(PAPER, S0('tape') + 0.3, -22, d=1.2, lp=6000, fo=0.3)
if VHS: hit(VHS, S0('tape') + 1.5, -18, d=2.0, fo=0.5)
hit(BEEP, S0('dark') + 0.2, -16, fo=0.1)
bed(UW, S0('dark'), S1('dark'), -18, src=33, lp=1500, fi=0.3, fo=0.3)
bed(STATIC, S0('dark'), S1('dark'), -34, hp=2000, lp=7000, fi=0.3, fo=0.3)
hit(LENS, VW('turns', 'turns') - 0.1, -15, fo=0.2)
bed(SUBI, S0('turns'), QUIET, -24, lp=3000, fi=0.4, fo=0.05)
# a soft low thud on every plain cut
for k, _, _ in D['shots']:   # every cut gets a new attack (earshot: 29 of 43 cuts had none): a low thud + a soft camera-cut tick
    if k in ('1960', 'wasnt', 'card', 'logo'): continue
    hit(DEEP, S0(k), -19, rate=0.75, lp=350, fo=0.8)
    hit(F('camera_shutter', 3), S0(k), -30, hp=800, lp=6000, fo=0.05)
for t in (VW('first', 'pale') - 0.1, VW('general', 'faces') - 0.1):   # round 14: the mid-beat cuts to the alternate framings
    hit(DEEP, t, -20, rate=0.75, lp=350, fo=0.8); hit(F('camera_shutter', 3), t, -30, hp=800, lp=6000, fo=0.05)
BUS['sfx'] *= db(-3.5)
# ---- the reveal: hard silence (beat 23 ends black), then the loudest moment: the hellish hit, the rumble, glitch bursts;
# then quiet: only the sub and a wet slide as the eyes sink
for b in BUS.values(): b[int(QUIET * SR):int((REVEAL + 0.2) * SR)] = 0
FACE_IN = REVEAL + 0.2   # round 10: the face comes in (under the VHS tracking glitch) 0.2 s after the black: the hit lands on it
hit(HELL, FACE_IN, -9, lp=6000, fo=1.5, verb=4.0)
hit(DEEP, FACE_IN, -10, rate=0.6, fo=1.5, verb=3.0)
hit(RUMBLE, FACE_IN, -4, d=4.5, lp=1200, fo=1.2)
hit(BOOM, FACE_IN, -4, lp=900, fo=1.5, verb=3.0)
for k in range(6): hit(GLITCH if k % 2 else STATIC, FACE_IN + k / 24, -19, s=k * 1.3, d=0.045, hp=400, fo=0.01)   # one tape burst per glitch frame
hit(FLESH, REVEAL + 0.6 + 4.3, -17, rate=0.6, lp=2500, d=1.5, fo=0.8, verb=2.0)   # the final drop of the eyes
# ---- after: the empty cabin (drips, hull), the archive, Piccard (a clock), three faces (sub swell), the next one
bed(DRIP, S0('empty'), S1('empty'), -22, src=2, fi=0.3, fo=0.3)
hit(HULL, S0('empty') + 1.0, -18, s=8.0, d=2.0, lp=2500, fo=0.8, verb=2.0)
bed(HUM, S0('shut'), S1('shut'), -28, lp=5000, fi=0.4, fo=0.4)
hit(F('camera_shutter', 0), S0('shut') + 1.0, -22, fo=0.3)
if CLOCK: bed(CLOCK, S0('piccard'), S1('piccard'), -25, src=7, lp=5000, fi=0.4, fo=0.6)
bed(SWELL, S0('three_faces') - 1.0, S1('three_faces'), -16, lp=1500, fi=2.0, fo=1.0)
hit(SONAR, S0('three_faces') + 1.0, -20, d=2.5, lp=3500, fo=1.0, verb=3.0)
hit(SLIME, VW('next', 'next'), -16, rate=0.5, lp=2000, fo=0.6, verb=2.5)
hit(DEEP, CARD + 0.4, -12, rate=0.6, lp=1200, fo=1.5, verb=3.0)

out = BUS['bed']
bed(SUB, LOGO + 0.6, T, -23, src=40, lp=300, fi=2.5, fo=5.0)
bed(DR3, LOGO + 1.5, T, -28, src=60, lp=1200, fi=4.0, fo=5.0)
out = BUS['sfx']
hit(POWER, LOGO, -10, lp=4000, fo=0.8)
for k in range(4): hit(ARC, LOGO + k * 0.11, -17, s=1.0 + k * 0.7, d=0.1, hp=300, fo=0.03)
hit(BOOM, LOGO + 0.45, -7, lp=600, fo=1.6, verb=3.0)

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
TALK_G, BED_G, SFX_G = db(-12.5), db(3.5), db(3.5)   # user: the talking loop 12.5 dB down (three rounds), BGM and SFX 3.5 dB up
# what the previous master did (tanh soft clip at -11 LUFS): its gain reduction per sample, for the report
old = narrow(BUS['talk'] * db(-10.5) + BUS['bed'] * BED_G + BUS['sfx'] * SFX_G)
for _ in range(5): old *= db(-11 - meter.integrated_loudness(old)); lin_old = np.abs(old).max(1); c = db(-1.2); old = c * np.tanh(old / c)
gr_report('previous master (tanh)', uniform_filter1d(20 * np.log10(np.maximum(np.abs(old).max(1), 1e-9) / np.maximum(lin_old, 1e-9)), int(0.01 * SR)))
del old
# the bed was sub-heavy: its drones put peaks ~12 dB over the ceiling while adding little loudness, so the tanh stage
# saturated it most of the time (the 'squashed' sound). Trim the subsonic and shelve the lows ~5 dB down under 90 Hz.
BED = filt(BUS['bed'], 'highpass', 35, 4); BED = BED - 0.45 * filt(BED, 'lowpass', 90, 2)
SFX = filt(BUS['sfx'], 'highpass', 30, 4)
PRE = narrow(BUS['talk'] * TALK_G + BED * BED_G + SFX * SFX_G); lin = db(TARGET - meter.integrated_loudness(PRE))
# each bus is peak-controlled at the gain it will finally play at, so this loops until the gain settles:
# - the SFX transients (ticks, clicks, booms) by a fast limiter on their own bus (the bed is not ducked under them)
# - the bed's recordings (12-20 dB crest) by a slow fader-ride, the gain eased over ~0.25 s
# then the master limiter only touches the rare peaks left
for it in range(6):
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
