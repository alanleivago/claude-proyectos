# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "scipy", "soundfile", "pyloudnorm"]
# ///
"""mix.py — the sound for amigara, no voice. The captions talk: the user's 'Talking 1 Loop' plays while each caption types,
slowed (and so lowered) more as the story gets more disturbing. Under it, CC0 Freesound beds and hits (see CREDITS.md).
Hard silence before the reveal; the reveal is the loudest hit. Master -14 LUFS, peaks under -1 dBFS -> audio/mix.wav."""
import json, subprocess
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy import signal

D = json.load(open('subs.json')); SR = 48000; T = D['dur']; N = int(T * SR)
out = np.zeros((N, 2)); db = lambda x: 10 ** (x / 20)
shot = {k: (a, b) for k, a, b in D['shots']}
REVEAL, CARD = shot['reveal'][0], shot['card'][0]

def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)
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
def bed(f, t0, t1, g, src=0.0, hp=None, lp=None, fi=0.4, fo=0.4):
    x = load(f); s = int(src * SR) % len(x); x = np.vstack([x[s:], x[:s]]); n = int((t1 - t0) * SR)
    while len(x) < n: x = np.vstack([x, x])
    y = x[:n]
    if hp: y = filt(y, 'highpass', hp)
    if lp: y = filt(y, 'lowpass', lp)
    put(fades(y / rms(y) * db(-20), fi, fo), t0, g)
def hit(f, t, g, s=0.0, d=None, rate=1.0, lp=None, fo=0.3):
    x = load(f)[int(s * SR):]
    if d: x = x[:int(d * SR)]
    if rate != 1.0: x = signal.resample(x, int(len(x) / rate))
    if lp: x = filt(x, 'lowpass', lp)
    put(fades(x / (np.abs(x).max() + 1e-9) * db(-6), 0.003, fo), t, g)

# ---- the talking loop: one take per caption chunk, as long as its typing, resampled (rate < 1 = slower and lower)
TALK = load('../../../Ref 1 bit pixelated junji ito madfable/Talking 1 Loop.wav')
def talk(t0, dur, rate, g, k=0):
    n = int(dur * SR); src = signal.resample(TALK, int(len(TALK) / rate)) if rate != 1 else TALK
    src = np.roll(src, int(k * 0.37 * SR) % len(src), axis=0)   # each caption starts on a different syllable
    y = np.vstack([src] * (n // len(src) + 2))[:n]
    put(fades(y / rms(y) * db(-20), 0.01, 0.06), t0, g)
# how disturbing each caption is -> how slow the voice gets (the user's eerie stretch)
RATE = [(0, 1.0), (9.7, 0.88), (13.6, 0.76), (18.4, 0.7), (21.0, 0.68), (25.0, 0.64), (29.1, 0.6), (32.5, 0.56), (36.6, 0.48)]
rate_at = lambda t: [r for a, r in RATE if t >= a - 1e-6][-1]
for k, c in enumerate(D['subs']):
    rate = min(0.05, max(0.025, (c['t1'] - c['t0']) / c['n']))
    talk(c['t0'], c['n'] * rate + 0.04, rate_at(c['t0']), -7, k)
talk(CARD + 0.5, 21 * 0.07, 0.45, 2)   # the end card types its line in the deepest voice

# ---- beds (Freesound CC0)
F = lambda d: 'fs/' + d + '/' + __import__('os').listdir('fs/' + d)[0]
WIND = 'fs/mountain_wind_howling/615440_Mount_Horeb.mp3'
CROWD = 'fs/outdoor_crowd_murmur/834339_Outdoors_Walla.mp3'
DRIP = 'fs/cave_water_drip/162116_Water_Dripping_Large_Echo_.mp3'
GRAVEL = 'fs/footsteps_gravel_walking/509253_walking_in_gravel_wav.mp3'
SCRAPE = 'fs/stone_scraping_grinding/354093_Stone_scratching_over_rock_close_up_back.mp3'
BUZZ = 'fs/fluorescent_light_buzz/383485_Fluorescent_lamps_in_hospital_02_wav.mp3'
DRONE = 'fs/dark_drone_ambient_low/172325_drone0003_flac.mp3'
RUMBLE = 'fs/earthquake_rumble/483287_R29_03_Long_Rumble_for_Earthquake_or_Exp.mp3'
DEEP = 'fs/horror_impact_hit/500657_Deep_wav.mp3'
QUIET = REVEAL - 0.9   # everything stops here: the silence before the hit

bed(WIND, 0, shot['man'][0] + 0.3, -21, lp=4000)
bed(WIND, shot['man'][0], QUIET, -20, src=20, lp=2500, fo=0.05)
hit(RUMBLE, 0.0, -15, d=4.5, lp=900, fo=1.5)
bed(CROWD, shot['crowd'][0] - 0.2, shot['man'][0] + 1.0, -20, lp=5000, fo=1.0)
bed(DRONE, shot['man'][0], QUIET, -13, lp=600, fi=2.0, fo=0.05)
bed(DRONE, shot['owaki'][0], shot['enter'][1], -14, src=8, lp=500, fi=1.0)
hit(SCRAPE, shot['manFit'][0] + 0.5, -12, d=1.6, lp=3000, fo=0.6)
bed(DRIP, shot['empty'][0], shot['empty'][1] + 0.2, -9, fo=0.1)
bed(GRAVEL, shot['path'][0], shot['hisHole'][0] + 0.05, -16, fo=0.05)
hit(DEEP, shot['hisHole'][0], -14, rate=0.8, lp=2000)
hit(SCRAPE, shot['enter'][0], -10, s=1.0, d=shot['enter'][1] - shot['enter'][0], rate=0.7, lp=1500, fo=0.05)
bed(BUZZ, shot['tunnel'][0], QUIET, -14, hp=80, lp=3000, fo=0.05)
bed(DRIP, shot['stretch'][0], QUIET, -15, src=3, fo=0.05)
# the reveal: the deepest hit, a rumble and a long scrape (the crawl), then the ring-out into the card
hit(DEEP, REVEAL, 0, rate=0.6, d=(shot['logo'][0] - REVEAL) * 0.6, fo=1.5)   # rings out by the logo
hit(RUMBLE, REVEAL, -4, d=4.0, lp=1200, fo=0.8)
hit(SCRAPE, REVEAL + 0.15, -4, d=2.8, rate=0.55, lp=4500, fo=0.8)
out[int(QUIET * SR):int(REVEAL * SR)] = 0
# the Madfable outro: a soft scrape while the spiral draws itself, a low hit as the name lands
LOGO = shot['logo'][0]
hit(SCRAPE, LOGO + 0.3, -6, s=2.0, d=1.5, rate=0.6, lp=2500, fo=0.4)
hit(DEEP, LOGO + 1.8, -2, rate=0.8, d=1.6, lp=1800, fo=1.0)

meter = pyln.Meter(SR); L = meter.integrated_loudness(out)
for _ in range(4):   # gain to -14 LUFS, then a soft limiter (tanh) holds the peaks under -1 dBFS; repeat until it settles
    out *= db(-14 - meter.integrated_loudness(out)); c = db(-1.2); out = c * np.tanh(out / c)
L2 = meter.integrated_loudness(out)
sf.write('audio/mix.wav', out, SR)
print('LUFS %.1f -> %.1f, peak %.1f dBFS, silence %.2f-%.2f' % (L, L2, 20 * np.log10(np.abs(out).max()), QUIET, REVEAL))
