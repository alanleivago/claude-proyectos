# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the sound for Bells (copied from The Lost Second), no voice. The captions talk: the user's 'Talking 1 Loop' plays while each caption
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
REVEAL, CARD, LOGO = S0('looking'), S0('card'), S0('logo')
TARGET = -13.0   # user: louder (was -14); -11 sounded squashed: -13 keeps the gain reduction small (measured)
QUIET = REVEAL - 0.9   # everything stops here: the silence before the hit

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
# ---- the talking loop: one take per caption chunk, as long as its typing, resampled (rate < 1 = slower and lower)
TALK = load('../../../Ref 1 bit pixelated junji ito madfable/Talking 1 Loop.wav')
TK = {}
def talk(t0, dur, rate, g, k=0):
    if rate not in TK: TK[rate] = signal.resample(TALK, int(len(TALK) / rate)) if rate != 1 else TALK
    n = int(dur * SR); src = np.roll(TK[rate], int(k * 0.37 * SR) % len(TK[rate]), axis=0)
    y = np.vstack([src] * (n // len(src) + 2))[:n]
    if rate < 0.8: y = reverb(y, 1.2, 0.25)[:n + int(0.6 * SR)]
    put(fades(y / rms(y[:n]) * db(-20), 0.01, 0.12), t0, g)
RATE = [('hook', 1.0), ('never', 0.97), ('why', 0.95), ('died', 0.9), ('silent', 0.85), ('dogs', 0.85), ('strange', 0.84), ('fog', 0.82),
        ('sunrise', 0.8), ('face', 0.72), ('hour', 0.68), ('rope', 0.7), ('log', 0.7), ('asleep', 0.6), ('oldest', 0.64), ('other', 0.7),
        ('inscr', 0.68), ('fourth', 0.62), ('war', 0.66), ('winter', 0.6), ('seventh', 0.6), ('hung', 0.56), ('open', 0.5), ('looking', 0.45),
        ('rang', 0.55), ('notall', 0.45), ('road', 0.55), ('near', 0.52), ('who', 0.47)]
RT = sorted((V[i]['t0'] - 0.3, r) for i, r in RATE)
rate_at = lambda t: [r for a, r in RT if t >= a][-1] if t >= RT[0][0] else 1.0
for k, c in enumerate(D['subs']):
    rate = min(0.07, max(0.025, (c['t1'] - c['t0']) / c['n']))
    talk(c['t0'], c['n'] * rate + 0.04, rate_at(c['t0']), -7, k)
talk(CARD + 0.5, 30 * 0.07, 0.45, -5, 99)   # the end card types its line in the deepest voice

# ---- sources (Freesound CC0, see CREDITS.md)
FS = 'fs/'
DR1 = FS + 'cinematic_sub_drone/871189_Textured_Low_Drone_Loop.mp3'
DR2 = FS + 'dark_ambient_drone/596463_Dark_London_Night_Atmo_Thriller_Soundsca.mp3'
PAD = FS + 'cinematic_sub_drone/872936_Dark_Voice_Drone_02_Loop.mp3'
DR3 = FS + 'dark_ambient_drone/560618_Dark_Ghost_House.mp3'
SUB = FS + 'dark_drone_ambient_low/172325_drone0003_flac.mp3'
SWELL = FS + 'dark_ambient_drone/452999_Postapocalyptic_Drone.mp3'
BELL = FS + 'church_bell_toll/180329_Creepy_church_bell_mp3.mp3'; BS = 11.305       # one deep toll (earshot find: z +4.7)
BELL2 = FS + 'church_bell_toll/611469_Church_Bell_wav.mp3'                       # a lighter church bell (the town, the inscription)
DOGS = [FS + 'dog_howling/558724_dogs_howling_yelping_distance_far_05_wav.mp3', FS + 'dog_howling/558722_dogs_howling_yelping_distance_far_07_wav.mp3', FS + 'dog_howling/558723_dogs_howling_yelping_distance_far_06_wav.mp3']
CREAK = FS + 'rope_creak/554651_tree_wind_creaking_wav.mp3'
CREAK2 = FS + 'rope_creak/861827_Creaking_Metal_Wire_of_Wooden_Gate.mp3'
SNOW = FS + 'footsteps_snow/773736_Footsteps_Snow_1_Walk.mp3'
WIND = FS + 'wind_field/861757_Wind_Low_Frequency_Warm_and_Strong.mp3'
HOWL = FS + 'mountain_wind_howling/615440_Mount_Horeb.mp3'
PAPER = FS + 'paper_rustle/707835_PAPER_RUSTLING.mp3'
DRIP = FS + 'cave_water_drip/162116_Water_Dripping_Large_Echo_.mp3'
FIRE = FS + 'fire_crackling/676385_Fire_Crackling.mp3'
BOOM = FS + 'deep_impact_reverb/825392_010_LOW_IMPACT.mp3'
HELL = FS + 'deep_impact_reverb/826216_POWERFUL_RUMBLY_HELLISH_IMPACT.mp3'
DEEP = FS + 'horror_impact_hit/500657_Deep_wav.mp3'
RUMBLE = FS + 'earthquake_rumble/483287_R29_03_Long_Rumble_for_Earthquake_or_Exp.mp3'
SCRAPE = FS + 'stone_scraping_grinding/743239_Metal_Grinding_2.mp3'
STATIC = FS + 'tv_static/756799_CRT_TV_High_band_VHF_Scan.mp3'
CLICK = FS + 'camera_shutter/553077_Foley_Mechanism_Camera_Button_Mono_H5_wa.mp3'
CROWD = FS + 'outdoor_crowd_murmur/834339_Outdoors_Walla.mp3'
TRAIN = FS + 'train_steam_freight/591944_Train_Passing_By_79_with_Steam_Whistle_H.mp3'
SLIME = FS + 'wet_squelch/433829_Slime_5_wav.mp3'
POWER = FS + 'deep_impact_reverb/826215_ELECTRIC_LONG_BOOMY_PUNCH.mp3'
ARC = FS + 'electric_spark/871766_ELECArc_Sparking_Electricity_Bed.mp3'
STEPS = FS + 'footsteps_gravel_walking/401345_SFX_Steps_Gravel_Walk_wav.mp3'

def toll(t, g, rate=1.0, lp=None, verb=0.0, d=5.0): hit(BELL, t, g, s=BS, d=d, rate=rate, lp=lp, fo=2.0, verb=verb)

out = BUS['bed']
# ---- BGM bed: a constant sub; act 1 drone (the bell era), act 2 night thriller atmo (the face, the log), a choral layer
# for the records, act 3 ghost-house dark after the reveal; swells into the turns
FACE, WAR, SEV = S0('face'), S0('war'), S0('seventh')
bed(SUB, 0.0, QUIET, -19, lp=220, fi=3.0, fo=0.05)
bed(SUB, REVEAL + 0.4, LOGO, -21, src=11, lp=220, fi=2.0, fo=0.6)
bed(DR1, 0.0, S0('fog') + 1.0, -18, lp=900, fi=4.0, fo=1.5)
bed(DR2, S0('fog') - 0.5, SEV + 1.0, -20, lp=700, fi=1.5, fo=1.0, level=2)
bed(PAD, S0('log'), S0('war'), -22, lp=3000, fi=4.0, fo=1.5, rate=0.85)
bed(DR3, SEV - 0.5, QUIET, -21, lp=2000, fi=2.0, fo=0.05, level=2)
bed(DR3, REVEAL + 0.8, LOGO, -20, src=30, lp=2500, fi=2.5, fo=1.2, level=2)
for t in (S0('silent'), FACE, VW('asleep', 'asleep'), WAR, S0('open')):
    bed(SWELL, t - 4.0, t + 3.0, -15, lp=1500, fi=3.8, fo=2.5)
out = BUS['sfx']
for t in (FACE, VW('asleep', 'asleep'), WAR): hit(BOOM, t, -16, lp=900, fo=1.2, verb=2.5)

out = BUS['sfx']
# ---- the bell is the clock: tolls every ~4.4 s under the opening (it rang every hour), through plague and war, the monks
# pulling; on "silent" the toll is cut mid-ring (the first silence in six centuries)
t, k = 1.0, 0
while t < S0('died') - 0.5:
    toll(t, -8 if k == 0 else -11, lp=5000 if t < S0('why') else 3500, verb=1.5); t += 4.4; k += 1
hit(BELL, VW('silent', 'silent') - 1.2, -10, s=BS, d=1.15, fo=0.02)   # the last toll, choked off
bed(WIND, 0.0, S0('never'), -24, src=5, fi=2.0, fo=0.5)
bed(CROWD, S0('never'), VW('never', 'war') - 0.1, -26, lp=2500, fi=0.5, fo=0.3)          # plague street murmur, far
bed(FS + 'earthquake_rumble/483287_R29_03_Long_Rumble_for_Earthquake_or_Exp.mp3', VW('never', 'war') - 0.1, S1('never'), -22, lp=400, fi=0.1, fo=0.6)   # far shelling
for j in range(3): hit(BOOM, VW('never', 'war') + 0.4 + j * 1.7, -20, lp=500, fo=0.8)
for j in range(4): hit(CREAK, S0('why') + 0.6 + j * 2.2, -17, s=3.0 + j, d=0.9, lp=4000, fo=0.3)    # the rope creaks as they pull
bed(HOWL, S0('died'), S1('died'), -22, lp=3000, fi=0.4, fo=0.4)                         # winter wind at the dead monk
bed(WIND, S0('silent'), S1('silent'), -22, src=20, fi=0.3, fo=0.5)
# ---- the dogs, the fog, sunrise
for j, f in enumerate(DOGS): hit(f, S0('dogs') + 0.4 + j * 1.6, -9 - j * 2, lp=6000, fo=0.8, verb=2.0)
bed(HOWL, S0('dogs'), S1('dogs'), -24, src=10, lp=3000, fi=0.2, fo=0.4)
bed(FS + 'fire_crackling/163996_Wood_heater.mp3', S0('strange'), S1('strange'), -28, lp=3000, fi=0.3, fo=0.3)   # the room, a stove
bed(RUMBLE, S0('fog'), S1('fog'), -18, lp=300, fi=1.5, fo=1.0)
bed(WIND, S0('fog'), S1('sunrise'), -23, src=40, fi=0.5, fo=1.0)
bed(CROWD, S0('sunrise'), S1('sunrise'), -29, lp=1800, fi=1.0, fo=0.5)
# ---- the face; the eyes opening hour by hour: a wet sound per opening
bed(FS + 'horror_ambience_pad/400367_strings_19.mp3', FACE - 0.5, S1('hour'), -24, lp=4000, fi=2.0, fo=1.0)
for t in (VW('hour', 'eyelids') - 0.1, VW('hour', 'more') - 0.1): hit(SLIME, t, -15, rate=0.6, lp=2500, fo=0.4, verb=1.5)
# ---- the rope cut from above
for j in range(3): hit(STEPS, S0('rope') + 0.3 + j * 0.5, -22, s=1.0 + j * 0.5, d=0.4, fo=0.1)
hit(CREAK2, VW('rope', 'cut') - 0.05, -14, fo=0.4)
hit(DEEP, VW('rope', 'above'), -14, rate=0.7, lp=1200, fo=1.0, verb=2.0)
# ---- the log: steps in the archive, paper, a low hit on "asleep"
for j in range(6): hit(STEPS, S0('log') + 0.4 + j * 0.62, -24, s=2.0 + j * 0.4, d=0.4, lp=3000, fo=0.1, verb=1.0)
bed(PAPER, S0('asleep') + 0.3, VW('asleep', 'asleep') - 0.4, -22, lp=6000, fi=0.3, fo=0.4)
hit(DEEP, VW('asleep', 'asleep'), -15, rate=0.6, lp=1200, fo=1.4, verb=3.0)
bed(PAPER, S0('oldest'), S0('oldest') + 2.5, -24, src=4, lp=5000, fi=0.4, fo=1.0)
# ---- historians, the inscription (a bell hit per phrase), the scratched line
hit(CLICK, S0('other') + 0.3, -22, lp=6000, fo=0.1)
for w in ('call', 'mourn', 'break'): hit(BELL2, VW('inscr', w) - 0.1, -13, rate=0.85, d=3.0, fo=1.5, verb=1.5)
hit(SCRAPE, S0('fourth') + 0.4, -16, d=2.5, hp=200, lp=6000, fo=0.8)
# ---- 1939-45: a freight train, the foundry roar
bed(TRAIN, S0('war'), S1('war'), -19, src=8, lp=5000, fi=0.6, fo=1.0)
bed(FIRE, VW('war', 'melted') - 1.0, S1('war'), -18, lp=3000, fi=0.6, fo=1.0)
bed(HOWL, S0('winter'), S1('winter'), -21, lp=3000, fi=0.4, fo=0.6)
# ---- the seventh night: steps in snow, torches, the rope, blood dripping
bed(SNOW, S0('seventh'), S1('seventh'), -17, lp=6000, fi=0.3, fo=0.3)
bed(FIRE, S0('seventh'), S1('seventh'), -25, lp=4000, fi=0.3, fo=0.3)
for j in range(4): hit(CREAK, S0('hung') + 0.3 + j * 1.3, -15, s=6.0 + j, d=0.9, lp=4000, fo=0.3)
bed(DRIP, S0('hung'), S1('hung'), -22, src=2, fi=0.3, fo=0.3)
bed(HOWL, S0('open'), QUIET, -22, lp=2500, fi=0.5, fo=0.05)
# a soft low thud on every plain cut and mid-shot swap (the turns have their own accents), so no cut lands dead
for k in ('never', 'why', 'died', 'silent', 'strange', 'sunrise', 'hour', 'rope', 'log', 'asleep', 'oldest', 'other', 'inscr', 'fourth', 'winter', 'seventh', 'hung', 'notall', 'road', 'near', 'who'):
    hit(DEEP, S0(k), -21, rate=0.75, lp=350, fo=0.8)
for t in (VW('never', 'war') - 0.12, VW('why', 'villagers') - 0.12, VW('rang', 'and') - 0.12): hit(DEEP, t, -20, rate=0.8, lp=400, fo=0.7)
BUS['sfx'] *= db(-3.5)
# ---- the reveal: hard silence, then the loudest moment: the hellish hit, a huge low toll, the rumble, glitch bursts
for b in BUS.values(): b[int(QUIET * SR):int(REVEAL * SR)] = 0
hit(HELL, REVEAL, -10, lp=6000, fo=1.5, verb=4.0)
hit(DEEP, REVEAL, -10, rate=0.6, fo=1.5, verb=3.0)
toll(REVEAL, -2, rate=0.7, lp=4000, verb=4.0, d=6.0)
hit(RUMBLE, REVEAL, -4, d=4.5, lp=1200, fo=1.2)
hit(RUMBLE, REVEAL + 0.05, -6, s=6.0, d=3.0, lp=600, fo=1.0)
hit(BOOM, REVEAL, -4, lp=900, fo=1.5, verb=3.0)
for k in range(1, 8):
    t = REVEAL + 0.15 + k * 0.12
    if t < VW('looking', 'village') + 0.35: hit(STATIC, t, -24, s=k * 2.3, d=0.06, hp=500, fo=0.03)
# ---- the bell rings: three tolls, the eyes close; "not all the way": silence and one wet blink
for j in range(3): toll(S0('rang') + 0.3 + j * 2.2, -8, verb=2.5)
hit(SLIME, VW('notall', 'way') + 0.2, -17, rate=0.5, lp=2000, fo=0.5, verb=2.0)
bed(HOWL, S0('road'), S1('road'), -23, lp=2500, fi=0.5, fo=0.5)
toll(VW('road', 'sent'), -22, rate=0.9, lp=2000, verb=3.0)                                # the new monk: a toll far off
bed(FS + 'outdoor_crowd_murmur/634880_Generic_Exterior_Walla.mp3', S0('near'), S1('near'), -30, lp=2500, fi=0.5, fo=0.5)
for j in range(3): hit(BELL2, S0('near') + 1.0 + j * 2.6, -15, rate=1.0, d=3.0, fo=1.5, verb=2.0)
for j in range(2): hit(CREAK, S0('who') + 0.8 + j * 3.0, -18, s=9.0 + j, d=1.2, lp=3500, fo=0.4)
toll(CARD + 0.4, -10, rate=0.8, lp=2500, verb=3.0)                                        # the card: one low toll

out = BUS['bed']
bed(SUB, LOGO + 0.6, T, -23, src=40, lp=300, fi=2.5, fo=5.0)
bed(DR3, LOGO + 1.5, T, -28, src=60, lp=1200, fi=4.0, fo=5.0)
bed(HOWL, LOGO + 2.0, T, -30, lp=1500, fi=4.0, fo=5.0)
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
