# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the sound for The Lost Second, no voice. The captions talk: the user's 'Talking 1 Loop' plays while each caption
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
REVEAL, CARD, LOGO = S0('reveal'), S0('card'), S0('logo')
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
    n = int(dur * SR); src = np.roll(TK[rate], int(k * 0.37 * SR) % len(TK[rate]), axis=0)   # each caption starts on a different syllable
    y = np.vstack([src] * (n // len(src) + 2))[:n]
    if rate < 0.8: y = reverb(y, 1.2, 0.25)[:n + int(0.6 * SR)]   # the deep lines get a little room
    put(fades(y / rms(y[:n]) * db(-20), 0.01, 0.12), t0, g)
# how disturbing each line is -> how slow (and low) the loop gets
RATE = [('hook', 1.0), ('phones', 0.97), ('labs', 0.95), ('exact', 0.93), ('govt', 0.92), ('strange', 0.9), ('cameras', 0.89),
        ('frames', 0.88), ('tamper', 0.87), ('every', 0.85), ('places', 0.83), ('back', 0.8), ('thousands', 0.78), ('closer', 0.75),
        ('turn', 0.7), ('noface', 0.7), ('before', 0.68), ('monk', 0.67), ('cave', 0.66), ('photo', 0.65), ('step', 0.63),
        ('count', 0.6), ('left', 0.55), ('facing', 0.47), ('deleted', 0.6), ('walls', 0.59), ('observ', 0.58), ('vote', 0.57),
        ('why', 0.55), ('clocks', 0.54), ('tick', 0.52), ('face', 0.47)]
RT = sorted((V[i]['t0'] - 0.3, r) for i, r in RATE)
rate_at = lambda t: [r for a, r in RT if t >= a][-1] if t >= RT[0][0] else 1.0
for k, c in enumerate(D['subs']):
    rate = min(0.07, max(0.025, (c['t1'] - c['t0']) / c['n']))
    talk(c['t0'], c['n'] * rate + 0.04, rate_at(c['t0']), -7, k)
talk(CARD + 0.5, 21 * 0.07, 0.45, -5, 99)   # the end card types its line in the deepest voice

# ---- sources (Freesound CC0, see CREDITS.md)
FS = 'fs/'
DR1 = FS + 'cinematic_sub_drone/871189_Textured_Low_Drone_Loop.mp3'        # act 1: textured low drone
DR2 = FS + 'dark_ambient_drone/596463_Dark_London_Night_Atmo_Thriller_Soundsca.mp3'   # act 2: a dark night thriller atmo
PAD = FS + 'cinematic_sub_drone/872936_Dark_Voice_Drone_02_Loop.mp3'          # act 2 records: a dark voice drone
DR3 = FS + 'dark_ambient_drone/560618_Dark_Ghost_House.mp3'                 # act 3: dark ghost house
SUB = FS + 'dark_drone_ambient_low/172325_drone0003_flac.mp3'                # the constant sub under everything
SWELL = FS + 'dark_ambient_drone/452999_Postapocalyptic_Drone.mp3'          # swells at the turns
TICK = FS + 'clock_ticking/790019_Foley_Object_Clock_Old_Tick_Sequence_Ste.mp3'
STATIC = FS + 'tv_static/756799_CRT_TV_High_band_VHF_Scan.mp3'
HUM = FS + 'electrical_hum/785942_SFX_GEOFON_HUM_ELECTRICAL_BOARD_4824_01.mp3'
REW = FS + 'tape_rewind/452902_cassette_tape_deck_rewind_fast_to_slow_s.mp3'
PROJ = FS + 'film_projector/585471_Super_8_camera_LONG_filming.mp3'
CLICK = FS + 'camera_shutter/521854_Camera_Manual_Click_wav.mp3'
SUBWAY = FS + 'subway_platform_ambience/451720_Underground_Train_Station_Ambience.mp3'
MARKET = FS + 'african_market/424269_Souks_Marrakesch_2_wav.mp3'
WIND = FS + 'wind_field/861757_Wind_Low_Frequency_Warm_and_Strong.mp3'
PAPER = FS + 'paper_rustle/707835_PAPER_RUSTLING.mp3'
DRIP = FS + 'cave_water_drip/162116_Water_Dripping_Large_Echo_.mp3'
FIRE = FS + 'fire_crackling/676385_Fire_Crackling.mp3'
BOOM = FS + 'deep_impact_reverb/825392_010_LOW_IMPACT.mp3'
HELL = FS + 'deep_impact_reverb/826216_POWERFUL_RUMBLY_HELLISH_IMPACT.mp3'
DEEP = FS + 'horror_impact_hit/500657_Deep_wav.mp3'
RUMBLE = FS + 'earthquake_rumble/483287_R29_03_Long_Rumble_for_Earthquake_or_Exp.mp3'
SCRAPE = FS + 'stone_scraping_grinding/743257_Short_Grind_Sound.mp3'
POWER = FS + 'deep_impact_reverb/826215_ELECTRIC_LONG_BOOMY_PUNCH.mp3'
ARC = FS + 'electric_spark/871766_ELECArc_Sparking_Electricity_Bed.mp3'
CROWD = FS + 'outdoor_crowd_murmur/834339_Outdoors_Walla.mp3'

out = BUS['bed']
# ---- the BGM bed: a constant sub, a texture per act, swells and booms at the turns
EVERY, TURN, COUNT = S0('cam'), S0('turn'), S0('count')
bed(SUB, 0.0, QUIET, -19, lp=220, fi=3.0, fo=0.05)
bed(SUB, REVEAL + 0.4, LOGO, -21, src=11, lp=220, fi=2.0, fo=0.6)
bed(DR1, 0.0, EVERY + 1.0, -17, lp=900, fi=4.0, fo=1.5)                         # act 1: clocks and cameras
bed(DR2, EVERY - 0.5, QUIET, -20, lp=700, fi=1.5, fo=0.05, level=2)                      # act 2: the man
bed(PAD, S0('before'), QUIET, -22, lp=3000, fi=4.0, fo=0.05, rate=0.85)         # act 2: the records, a choral layer
bed(DR3, REVEAL + 0.8, LOGO, -20, lp=2500, fi=2.5, fo=1.2, level=2)                       # act 3: the aftermath
for t in (EVERY, TURN, COUNT):                                                   # the turns: a swell into a low boom
    bed(SWELL, t - 4.0, t + 3.5, -15 if t != COUNT else -14, lp=1500, fi=3.8, fo=3.0)
out = BUS['sfx']   # the booms are hits: they go on the SFX bus, where its own limiter handles their peaks
for t in (EVERY, TURN, COUNT): hit(BOOM, t, -12, lp=900, fo=1.2, verb=2.5)
hit(BOOM, VW('exact', 'removed'), -13, lp=700, fo=1.0, verb=2.0)                # "removed"
out = BUS['bed']

out = BUS['sfx']
# ---- clocks: the hook's tower ticks (one missing on "skipped"), the wristwatch, the stuck hand, the one stray tick
TK1 = dict(s=13.354, d=0.38)
skip = VW('hook', 'skipped')
for k in range(-6, 9):
    t = skip + k
    if k == 0 or t < 0.3 or t > S1('clock') - 0.1: continue
    hit(TICK, t, -16 if k < 0 else -18, lp=5000, fo=0.12, verb=0.8, **TK1)
for k in range(1, int(S1('watch') - S0('watch')) + 1):
    hit(TICK, S0('watch') + k, -18, fo=0.12, **TK1)
for k in range(1, int((S1('why') - S0('why')) * 2)):
    if k % 3 == 0: continue                                                      # tick, tick, (missing)
    hit(TICK, S0('why') + k * 0.5, -19, lp=4000, fo=0.12, verb=0.8, **TK1)
TT_ = VW('tick', 'tick')                                                         # the single huge tick, ringing
hit(TICK, TT_, -2, rate=0.55, lp=3000, fo=0.2, verb=5.0, **TK1)
hit(BOOM, TT_, -14, lp=300, fo=1.5)

# ---- cameras: CCTV static + hum on the monitor shots, tape rewind + frame clicks on the tape, booms on the turns
for k in ('monitors', 'monOne', 'tamper', 'cam', 'tokyo', 'lagos', 'iowa', 'lima', 'grid', 'closer', 'turn', 'noface'):
    a, b = shot[k]
    bed(HUM, a, b, -24, hp=60, lp=2500, fi=0.02, fo=0.02, src=a % 7)
    bed(STATIC, a, b, -26 if k not in ('grid', 'noface') else -23, hp=400, lp=7000, fi=0.02, fo=0.02, src=a % 11)
    hit(STATIC, a, -18, s=(a * 3) % 20, d=0.18, hp=300, lp=8000, fo=0.06)        # a burst of snow on each cut to a feed
per = (S1('monOne') - S0('monOne') - 0.3) / 24
for k in range(1, 24): hit(CLICK, S0('monOne') + k * per, -20, hp=500, fo=0.05)
bed(REW, S0('tamper'), S1('tamper'), -19, src=2.0, hp=150, fi=0.1, fo=0.1)
for k in range(1, int((S1('tamper') - S0('tamper')) * 6)):
    if k % 2 == 0: hit(CLICK, S0('tamper') + k / 6, -24, hp=500, fo=0.05)
per = (S1('closer') - S0('closer') - 0.2) / 24
for k in range(1, 24): hit(CLICK, S0('closer') + k * per, -20 + k * 0.2, hp=500, fo=0.05)
nf = VW('noface', 'soon') + 0.35                                                  # the tape runs out into snow
hit(REW, nf - 0.4, -14, s=60.0, d=0.5, fo=0.1)
bed(STATIC, nf, S1('noface'), -17, src=30, hp=300, lp=9000, fi=0.01, fo=0.3)
bed(SUBWAY, S0('cam'), S1('tokyo'), -20, lp=6000, fi=0.6, fo=0.05)                # places
bed(MARKET, S0('lagos'), S1('lagos'), -19, src=5, lp=7000, fi=0.03, fo=0.05)
bed(WIND, S0('iowa'), S1('iowa') + 0.3, -19, src=10, fi=0.05, fo=0.4)
bed(CROWD, S0('lima'), S1('lima'), -24, lp=4000, fi=0.05, fo=0.3)
wf = VW('walls', 'face') - 0.1                                                    # cameras turned to the walls
hit(STATIC, wf, -18, s=7, d=0.25, hp=300, fo=0.08)
bed(HUM, wf, S1('walls'), -24, hp=60, lp=2500, fi=0.02, fo=0.3)

bed(HUM, S0('lab'), S1('labClose'), -24, hp=60, lp=3000, fi=0.05, fo=0.1, src=20)   # the lab: server-room hum
bed(DR2, S0('govt'), S1('govt'), -19, src=40, lp=5000, fi=0.1, fo=0.6)            # governments: a night city far off
# ---- the records: paper, a cave with a torch, a projector; a low hit per step cut; scratches for the count
bed(PAPER, S0('before') + 0.2, S0('before') + 4.0, -21, lp=6000, fi=0.3, fo=1.0)
hit(PAPER, S0('photo') + 0.1, -18, s=2.0, d=1.2, lp=6000, fo=0.5)
bed(DRIP, S0('cave'), S1('cave'), -23, src=3, fi=0.5, fo=0.1)
bed(FIRE, S0('cave'), S1('cave'), -25, lp=5000, fi=0.5, fo=0.1)
bed(PROJ, S0('film'), S1('film'), -19, src=4, hp=120, lp=6000, fi=0.1, fo=0.1)
for t in (S0('step'), VW('step', 'skipped') - 0.1, VW('step', 'one') - 0.1):
    hit(DEEP, t, -12, rate=0.8, lp=1500, fo=0.6)
c0, c1 = S0('count') + 0.15, V['count']['t1'] - 0.2                               # a scratch per tally mark
for i in range(23): hit(SCRAPE, c0 + (c1 - c0) * i / 23, -22, s=0.0, d=0.12, hp=800, lp=6000, fo=0.04)

# a soft low thud on the plain cuts (the camera feeds, turns and steps have their own accents), so no cut lands dead
for k in ('city', 'watch', 'lab', 'labClose', 'govt', 'before', 'cave', 'photo', 'film', 'walls', 'observ', 'vote', 'why', 'people', 'tick', 'phone'):
    hit(DEEP, S0(k), -21, rate=0.75, lp=350, fo=0.8)
BUS['sfx'] *= db(-3.5)   # picture SFX sit ~5 dB under the talking loop (the stingers below stay full)
# ---- the reveal: hard silence, then the loudest hit of the film, a rumble and the ring-out
for b in BUS.values(): b[int(QUIET * SR):int(REVEAL * SR)] = 0
hit(HELL, REVEAL, -10, lp=6000, fo=1.5, verb=4.0)
hit(DEEP, REVEAL, -10, rate=0.6, fo=1.5, verb=3.0)
hit(RUMBLE, REVEAL, -9, d=4.5, lp=1200, fo=1.2)
for k in range(1, 8):                                                             # glitch bursts while it flickers
    t = REVEAL + 0.6 + k * 0.33 + (k * 0.137) % 0.1
    if t < V['left']['t1'] + 0.25: hit(STATIC, t, -25, s=k * 2.3, d=0.07, hp=500, fo=0.03)
hit(BOOM, S0('facing'), -12, lp=500, fo=1.5, verb=3.0)
hit(DEEP, CARD + 0.4, -10, rate=0.7, lp=1200, fo=1.2, verb=2.5)                    # the card: one low hit

# ---- the end screen (~20 s for the YouTube end cards): a low ambient bed so it isn't dead, fading out at the end
out = BUS['bed']
bed(SUB, LOGO + 0.6, T, -23, src=40, lp=300, fi=2.5, fo=5.0)
bed(DR3, LOGO + 1.5, T, -28, src=60, lp=1200, fi=4.0, fo=5.0)
bed(FS + 'mountain_wind_howling/615440_Mount_Horeb.mp3', LOGO + 2.0, T, -30, lp=1500, fi=4.0, fo=5.0)
out = BUS['sfx']
# ---- the Madfable outro: an electrical power-on as the red flickers in (4 steps of 0.11 s), a low hit as the name dissolves
hit(POWER, LOGO, -10, lp=4000, fo=0.8)
for k in range(4): hit(ARC, LOGO + k * 0.11, -17, s=1.0 + k * 0.7, d=0.1, hp=300, fo=0.03)   # one crackle per flicker step
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
