"""upnext-01 mix: voice (audio/voice.wav) + original score (audio/music.wav, ducked so the voice sits ~14 dB over it) + CC0 foley
on the actions -> audio/mix_<mentor>.wav, master -14 LUFS integrated, true peak <= -1 dBTP.
usage: python tools/mix_film.py pip|metalshadow"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d

PIECE = Path(__file__).resolve().parents[1]
AUD = PIECE / 'audio'; DL = AUD / 'sfx_dl'; KIT = PIECE.parents[1] / 'sound-layer' / 'kit'
SR = 48000
MENTOR = sys.argv[1] if len(sys.argv) > 1 else 'pip'
TL = json.loads((PIECE / 'engine' / 'film_timeline.json').read_text(encoding='utf-8'))
DUR = TL['dur']; N = int(DUR * SR)


def load(p):
    if p.suffix.lower() in ('.mp3', '.ogg', '.flac'):
        tmp = Path(tempfile.mkdtemp()) / 'x.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(p), '-ar', str(SR), '-ac', '2', str(tmp)], check=True, timeout=60); p = tmp
    a, sr = sf.read(str(p), dtype='float32', always_2d=True)
    if a.shape[1] == 1: a = np.repeat(a, 2, 1)
    if sr != SR: a = resample_poly(a, SR, sr, axis=0).astype(np.float32)
    return a[:, :2]


def onsets(a, thr=0.25, gap=0.18):
    e = np.sqrt(np.maximum(0, uniform_filter1d(a.mean(1) ** 2, 480))); m = e.max(); out, last = [], -9
    for i in range(0, len(e), 240):
        if e[i] > thr * m and (i / SR - last) > gap: out.append(i / SR); last = i / SR
    return out


def clip(a, start=0.0, dur=None, fade=0.03):
    x = a[int(start * SR): int((start + dur) * SR) if dur else None].copy(); f = int(fade * SR)
    if len(x) > 2 * f: x[-f:] *= np.linspace(1, 0, f)[:, None]
    return x


def find(cue, stem):
    return next((DL / cue).glob(f'{stem}*'))


sfx = np.zeros((N + SR * 4, 2), np.float32)
def put(x, t, db, pan=0.0):
    i = int(t * SR); g = 10 ** (db / 20); x = x * g
    x = x * np.array([np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)]) * 1.41
    sfx[i:i + len(x)] += x[: len(sfx) - i]


def norm_peak(x): return x / max(1e-6, np.abs(x).max())


# ---- sources (all CC0: Freesound downloads in audio/sfx_dl/catalog.json + Kenney / Freesound CC0 from sound-layer/kit)
tap = norm_peak(load(find('phone_tap', 'fs332713')))
pop = norm_peak(load(KIT / 'pop' / 'fs-242113-pop-or-bloop-1.wav'))
pop2 = norm_peak(load(KIT / 'pop' / 'fs-221091-cartoon-pop-or-drip-1.wav'))
switch = norm_peak(load(find('light_switch', 'fs440499')))
sheets_up = norm_peak(load(find('sheets', 'fs573730')))
sheets = norm_peak(load(find('sheets', 'fs644490')))
creak = norm_peak(load(find('bed_creak', 'fs444389')))
small = norm_peak(load(find('steps_small', 'fs392482')))
boots = norm_peak(load(find('steps_wood', 'fs798870')))
door = norm_peak(load(find('door_open', 'fs219499')))
alarm = norm_peak(load(find('alarm', 'fs369879')))
thud = norm_peak(load(find('thud', 'fs417994')))
crick = norm_peak(load(find('crickets', 'fs129678')))
puff = norm_peak(load(find('sigh_puff', 'fs532234')))
book = norm_peak(load(KIT / '_raw' / 'rpg' / 'bookPlace2.ogg')) if (KIT / '_raw' / 'rpg' / 'bookPlace2.ogg').exists() else tap
cloth = norm_peak(load(KIT / '_raw' / 'rpg' / 'cloth2.ogg'))
whoosh_dir = KIT / 'swish'; sw = sorted(whoosh_dir.glob('*.wav'))
swish = norm_peak(load(sw[0])) if sw else cloth
bs = onsets(boots); ss = onsets(small)
print('boot onsets', len(bs), 'small', len(ss))
bs = bs if len(bs) >= 4 else bs + [0.0] * 4

CUES = []
def cue(t, x, db, pan=0.0, name=''): CUES.append((round(t, 2), name, db)); put(x, t, db, pan)
cue(0.95, clip(tap, 0, 0.3), -24, 0.2, 'phone tap'); cue(2.05, clip(tap, 0, 0.3), -26, 0.2, 'phone tap')
cue(4.0, clip(pop, 0, 0.6), -17, 0, 'pop: Four. Now.')
cue(7.70, clip(pop2, 0, 0.5), -20, 0, 'pop: Nope')
cue(9.32, clip(switch, 0, 0.5), -18, 0.3, 'lamp switch (light comes up)')
cue(11.9, clip(sheets_up, 0.2, 2.2), -15, -0.1, 'sheets: sitting up')
cue(13.45, clip(creak, 0, 1.2), -20, -0.1, 'bed creak: she sits on the edge')
cue(22.95, clip(pop, 0, 0.6), -17, 0, 'pop: Time to cheat'); cue(22.5, clip(swish, 0, 0.6), -23, -0.3, 'swish into the turn')
cue(17.35, clip(swish, 0, 0.6), -24, 0.3, 'swish into the close-up')
for k, t in enumerate(ss[:3]): cue(24.85 + k * 0.33, clip(small, t - 0.02, 0.25), -19, -0.2, 'small steps')
cue(28.7, clip(pop2, 0, 0.5), -21, 0, 'pop: Nah')
cue(30.15, clip(swish, 0, 0.6), -22, 0, 'swish into the demo')
if MENTOR == 'metalshadow':
    cue(31.0, clip(thud, 0, 1.0), -17, -0.1, 'thud: MetalShadow flops on the mat')
    cue(35.3, clip(cloth, 0, 0.6), -20, -0.1, 'cloth: gets up')
cue(31.5, clip(puff, 0, 0.8), -15, -0.1, 'sigh puff')
cue(37.0, clip(swish, 0, 0.5), -24, 0.1, 'swish: point')
cue(41.95, clip(pop, 0, 0.6), -19, 0, 'pop: Eh.'); cue(41.95, clip(cloth, 0, 0.5), -24, 0.1, 'cloth: shrug')
cue(46.52, clip(book, 0, 0.5), -17, 0.2, 'phone set on the nightstand')
x = clip(crick, 0, 2.2, 0.5); x[: int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]; cue(47.4, x, -31, 0, 'night crickets')
x = clip(alarm, 0.3, 1.0); cue(51.4, x, -21, 0.25, 'alarm clock 8:24')
cue(52.45, clip(sheets, 0.4, 0.9), -21, -0.1, 'quilt off')
for k in range(2): cue(52.42 + k * 0.42, clip(boots, bs[k + 2] - 0.02, 0.3), -17, -0.1, 'boots land on the mat')
cue(53.85, clip(cloth, 0, 0.6), -23, 0, 'cloth: stands')
cue(58.0, clip(pop, 0, 0.6), -18, 0, 'pop: That counts')
for k in range(int((64.0 - 61.05) / 0.58)):
    t = 61.05 + k * 0.58
    if not (62.05 < t < 62.15): cue(t, clip(boots, bs[(k % max(1, len(bs) - 2)) + 2 if len(bs) > 3 else 0] - 0.02, 0.32), -18 - (2 if t > 62.1 else 0), 0.15 if k % 2 else -0.15, 'boots on wood')
cue(62.3, clip(door, 0, 1.0), -19, 0.35, 'door creak')

# ---- music: ducked under the voice (voice ~14 dB over it while she / he talks)
voice = load(AUD / 'voice.wav')[:N]
# v2 review: earshot flagged 1-3 kHz as a bit honky (the voice is the loudest layer): gentle -2 dB peaking EQ at 2.2 kHz (Q 1)
from scipy.signal import lfilter
def peq(x, f0, gdb, q):
    A = 10 ** (gdb / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q)
    b = np.array([1 + al * A, -2 * np.cos(w), 1 - al * A]); a = np.array([1 + al / A, -2 * np.cos(w), 1 - al / A])
    return lfilter(b / a[0], a / a[0], x, axis=0).astype(np.float32)
voice = peq(voice, 2200, -2.0, 1.0)
# v2 music: REAL recorded track, "Late Nights In Osaka" by YellowTree (Freesound 595751, CC BY 4.0; credit in the caption file),
# lo-fi beat 90.7 BPM, A minor, sparse keys intro until 22.4 s where the beat drops in. Edit: offset so the beat lands on the
# 22.75 s cut ("Time to cheat"), runs on bar lines (2.646 s) to the end, drops out before each punchline, 1.2 s fade at the end.
MTRACK = AUD / 'music_dl' / '4a0d8040-b1a4-4fe2-afbd-01295149ab8b' / 'track.mp3'
OFFSET = 22.4 - 22.75                                                     # track time = film time + OFFSET
mt = load(MTRACK); music = np.zeros((N, 2), np.float32)
src0 = int(max(0, OFFSET) * SR); dst0 = int(max(0, -OFFSET) * SR); n = min(N - dst0, len(mt) - src0); music[dst0:dst0 + n] = mt[src0:src0 + n]
DROPS = [(3.45, 4.0), (7.15, 7.70), (28.15, 28.7), (41.4, 41.95), (57.45, 58.0), (69.95, 70.9)]
ts = np.arange(N) / SR; gate = np.ones(N, np.float32)
for a_, b_ in DROPS: gate *= np.where(ts < a_ - 0.08, 1, np.where(ts < a_, (a_ - ts) / 0.08, np.where(ts < b_, 0, np.where(ts < b_ + 0.03, (ts - b_) / 0.03, 1))))
gate *= np.clip(ts / 0.4, 0, 1) * np.clip((DUR - ts) / 1.2, 0, 1)
music *= gate[:, None]
ve = np.sqrt(np.maximum(0, uniform_filter1d(voice.mean(1) ** 2, int(0.05 * SR))))
duck = uniform_filter1d(np.clip(ve / 0.02, 0, 1), int(0.25 * SR))
meter = pyln.Meter(SR)
mL = meter.integrated_loudness(music); vL = meter.integrated_loudness(voice)
music *= 10 ** ((vL - 10.5 - mL) / 20)                                   # base: 10.5 LU under the voice (keeps the LRA ~ref)
music *= (10 ** (-4.5 / 20) * duck + (1 - duck))[:, None]                # 4.5 dB more while someone talks (~15 dB under the voice)

print('peaks voice %.3f music %.3f sfx %.3f' % (np.abs(voice).max(), np.abs(music).max(), np.abs(sfx[:N]).max()), 'mL', mL)
mix = voice + music + sfx[:N]
# master: -14 LUFS, then a soft limiter so the true peak stays <= -1 dBTP (4x oversampled check)
mix *= 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
for _ in range(3):
    up = resample_poly(mix, 4, 1, axis=0); tp = 20 * np.log10(np.abs(up).max())
    if tp <= -1.2: break
    lim = 10 ** (-1.4 / 20); mix = np.tanh(mix / lim) * lim
    mix *= 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
out = AUD / f'mix_{MENTOR}.wav'; sf.write(str(out), mix.astype(np.float32), SR, subtype='PCM_24')
sf.write(str(AUD / f'sfx_{MENTOR}.wav'), sfx[:N], SR, subtype='PCM_24')
(AUD / f'cues_{MENTOR}.json').write_text(json.dumps(CUES, indent=0), encoding='utf-8')
print(out, 'LUFS %.2f' % meter.integrated_loudness(mix), 'TP %.2f dBTP' % (20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max())), len(CUES), 'cues')
