"""vera-02 mix: voice (audio/voice.wav, tools/film_timeline.py) + CC0 music + real CC0 foley -> audio/mix_<tag>.wav,
master -14 LUFS integrated, true peak <= -1 dBTP (4x oversampled check). Cue list -> audio/cues_<tag>.json.
Music (Freesound, CC0): diner radio bed "Chill Lofi - lost stars" by noel.wav (680400) until the jukebox; the song he picked
"TheEternalLighthouse - a soft slow piano..." by jcmbo369 (819108) from the needle drop in 24b to the end.
SFX (Freesound CC0, audio/sfx_dl/catalog.json, picked with earshot rank/find): raindrops on window sill 394935 (inside bed),
light rain on street 380651 (open door + exterior), room tone 473718, shop door bell 192761, steps 480610, cloth whip 19291,
cloth 334219, mug on table 404922, wooden knock 179997, leather couch sit 593145, pouring coffee 432775, coin in jukebox 637369,
needle drop 556722, woosh 683096, shine chime 879797.
usage: python tools/mix_film.py [tag=v1]"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.ndimage import uniform_filter1d
from scipy.signal import resample_poly

PIECE = Path(__file__).resolve().parents[1]
AUD = PIECE / 'audio'; DL = AUD / 'sfx_dl'; SR = 48000
TAG = sys.argv[1] if len(sys.argv) > 1 else 'v1'
TL = json.loads((PIECE / 'engine' / 'film_timeline.json').read_text(encoding='utf-8'))
DUR = TL['dur']; N = int(DUR * SR); S = {s['id']: s for s in TL['shots']}
LN = {l['shot']: l for l in TL['lines']}


def load(p):
    tmp = Path(tempfile.mkdtemp()) / 'x.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(p), '-ar', str(SR), '-ac', '2', str(tmp)], check=True, timeout=120)
    a, _ = sf.read(str(tmp), dtype='float32', always_2d=True); return a[:, :2]


def fs(cue, fid): return load(DL / cue / f'fs{fid}.mp3')
def norm(x): return x / max(1e-6, np.abs(x).max())


def clip(a, start=0.0, dur=None, fin=0.005, fout=0.04):
    x = a[int(start * SR): int((start + dur) * SR) if dur else None].copy(); fi, fo = int(fin * SR), int(fout * SR)
    if len(x) > fi + fo: x[:fi] *= np.linspace(0, 1, fi)[:, None]; x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return x


def onsets(a, thr=0.3, gap=0.15):
    e = np.sqrt(np.maximum(0, uniform_filter1d(a.mean(1) ** 2, 480))); m = e.max(); out, last = [], -9
    for i in range(0, len(e), 240):
        if e[i] > thr * m and (i / SR - last) > gap: out.append(i / SR); last = i / SR
    return out


sfx = np.zeros((N + SR * 6, 2), np.float32); CUES = []
def cue(t, x, db, pan=0.0, name=''):
    i = int(t * SR); x = x * 10 ** (db / 20) * np.array([np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)]) * 1.41
    sfx[i:i + len(x)] += x[: len(sfx) - i]; CUES.append(dict(t=round(t, 2), name=name, db=db))


def bed(x, t0, t1, db, fin=0.6, fout=0.8, name=''):   # looped ambience between t0 and t1 with fades
    n = int((t1 - t0) * SR); reps = int(np.ceil(n / len(x))) + 1; y = np.concatenate([x] * reps)[:n].copy()
    fi, fo = int(fin * SR), int(fout * SR); y[:fi] *= np.linspace(0, 1, fi)[:, None]; y[-fo:] *= np.linspace(1, 0, fo)[:, None]
    cue(t0, y, db, 0, name)


# ---- sources
bell = norm(fs('door_bell', 192761)); room = norm(fs('street_night', 473718)); rainIn = norm(fs('rain_window', 394935)); rainOut = norm(fs('rain_window', 380651))
steps = norm(fs('steps_wood', 480610)); whip = norm(fs('cloth', 19291)); cloth = norm(fs('cloth', 334219)); mugd = norm(fs('mug_table', 404922)); knock = norm(fs('mug_table', 179997))
sit = norm(fs('vinyl_seat', 593145)); pour = norm(fs('pour', 432775)); coin = norm(fs('jukebox', 637369)); needle = norm(fs('needle', 556722))
woosh = norm(fs('whoosh', 683096)); chime = norm(fs('ding', 879797))
T0 = lambda k: S[k]['t0']
# ambience: rain on the windows + room tone inside, the open door lets the street rain in (01), the exterior tail is all rain
bed(room, 0.0, T0('27'), -42, 1.0, 1.0, 'room tone')
bed(rainIn, 0.0, T0('27') + 0.3, -29, 0.6, 1.0, 'rain on the windows (inside)')
bed(rainOut, 0.25, T0('03'), -27, 0.3, 1.2, 'rain through the open door')
bed(rainOut, T0('27') - 0.3, DUR, -21, 0.5, 2.0, 'rain outside (exterior tail)')
# events
cue(0.3, clip(bell, 0, 1.0), -11, 0.4, 'door bell: the door opens')
ss = onsets(steps)
for k in range(3): cue(0.75 + k * 0.5, clip(steps, ss[(k + 1) % len(ss)] - 0.02, 0.35), -22, 0.35, 'Theo steps in, wet')
for t in (T0('02'), T0('14'), T0('18')): cue(t - 0.12, clip(woosh, 0, 0.9), -22, 0, 'mosaic woosh')
cue(T0('05') + 0.3 + 0.5, clip(whip, 0, 0.7), -19, 0.1, 'towel toss (whip)')
cue(T0('05') + 0.3 + 1.1, clip(cloth, 0.1, 0.4), -21, -0.2, 'towel caught')
cue(T0('06') + 0.15, clip(cloth, 0, 1.2), -23, 0, 'towel on his hair')
cue(T0('14') + 1.2, clip(mugd, 0, 0.8), -19, 0.2, 'mug set on the booth table')
for k in range(3): cue(T0('16') + 0.4 + 0.7 + 0.3 * k, clip(knock, 0, 0.3), -25 - 2 * k, 0.1, 'pat on the table')
cue(T0('17') + 0.35, clip(sit, 0.2, 1.4), -21, 0.1, 'booth seat: he sits')
cue(T0('18') + 0.35 + 0.5, clip(knock, 0, 0.3), -27, 0, 'carafe lifted')
cue(T0('18') + 0.35 + 1.3, clip(pour, 0.44, 1.5, 0.05, 0.25), -18, 0, 'pouring the last cup')
cue(T0('18') + 0.35 + 3.45, clip(mugd, 0, 0.6), -22, 0, 'carafe set down')
cue(T0('20') + 0.15 + 0.35, clip(cloth, 0.2, 0.6), -24, -0.1, 'umbrella lifted (fabric)')
cue(T0('20') + 0.15 + 0.98, clip(knock, 0, 0.35), -19, 0, 'umbrella laid on the table')
cue(T0('21') + 0.3, clip(chime, 0, 2.2), -17, 0, 'ding: the tag')
cue(T0('24b') + 0.05, clip(coin, 0, 0.8), -24, -0.3, 'jukebox: coin')
cue(T0('24b') + 0.55, clip(needle, 2.95, 1.2, 0.005, 0.3), -21, -0.3, 'jukebox: needle drop')
cue(T0('25') + 0.6 + 0.4, clip(cloth, 0, 0.6), -25, 0, 'towel picked up')
cue(T0('26') + 0.35, clip(chime, 0, 2.2), -15, 0, 'ding: heart eyes')

# ---- voice
v, sr = sf.read(str(AUD / 'voice.wav'), dtype='float32', always_2d=True); v = v.mean(1)
voice = np.zeros((N, 2), np.float32); voice[:min(N, len(v))] = v[:N, None]

# ---- music: diner radio bed until the jukebox, then the slow song he picked (from the needle drop in 24b) through the tail
def track(fid, comp=True):
    mt = load(PIECE / 'audio' / 'music_dl' / fid / 'track.mp3')
    if not comp: return mt
    _t = Path(tempfile.mkdtemp()); sf.write(str(_t / 'm.wav'), mt, SR, subtype='FLOAT')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(_t / 'm.wav'), '-af', 'acompressor=threshold=-30dB:ratio=3:attack=15:release=350:makeup=2', str(_t / 'c.wav')], check=True, timeout=120)
    return sf.read(str(_t / 'c.wav'), dtype='float32', always_2d=True)[0]
meter = pyln.Meter(SR)
SW = T0('24b') + 0.75
radio, song = track('fs680400'), track('fs819108')
music = np.zeros((N, 2), np.float32)
def place(x, t0, t1, fin, fout, lufs):
    a = x[:int((t1 - t0) * SR)].copy(); a *= 10 ** ((lufs - meter.integrated_loudness(x[:min(len(x), 30 * SR)])) / 20)
    fi, fo = int(fin * SR), int(fout * SR); a[:fi] *= np.linspace(0, 1, fi)[:, None]; a[-fo:] *= np.linspace(1, 0, fo)[:, None]
    i0 = int(t0 * SR); music[i0:i0 + len(a)] += a[:N - i0]
voice_l = meter.integrated_loudness(voice)
place(radio, 0.0, SW - 0.1, 0.25, 0.7, voice_l - 6.0)   # v2 (user): the BGM was too quiet
place(song, SW, DUR, 0.05, 1.0, voice_l - 5.0)
g = np.ones(N, np.float32)
def ramp(t0, t1, a, b):
    i0, i1 = int(t0 * SR), int(t1 * SR); g[i0:i1] *= np.linspace(a, b, max(1, i1 - i0))
def hold(t0, t1, a): g[int(t0 * SR):int(t1 * SR)] *= a
ramp(LN['24']['on'] - 0.6, LN['24']['on'], 1.0, 0.7); hold(LN['24']['on'], T0('24b') - 0.2, 0.7); ramp(T0('24b') - 0.2, T0('24b'), 0.7, 1.0)   # -3 dB dip under her blush line
music *= g[:, None]
spk = np.zeros(N, np.float32)
for L in TL['lines']:
    for a, b in L['spans']: spk[int((a - 0.08) * SR):int((b + 0.12) * SR)] = 1
duck = uniform_filter1d(spk, int(0.12 * SR))
music *= (10 ** (-5.0 / 20) * duck + (1 - duck))[:, None]                  # 5 dB more while someone talks (~14 dB under)
mix = voice + music + sfx[:N]

# ---- master: -14 LUFS integrated, limiter, true peak <= -1 dBTP
def tp(x): return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-9)
gain = 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20); out = AUD / f'mix_{TAG}.wav'
for _ in range(5):
    tmp = Path(tempfile.mkdtemp()) / 'm.wav'; sf.write(str(tmp), mix * gain, SR, subtype='FLOAT')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(tmp), '-af', 'alimiter=limit=0.66:attack=1:release=60:level=0:asc=1', '-ar', str(SR), '-c:a', 'pcm_s24le', str(out)], check=True, timeout=300)
    m, _ = sf.read(str(out), dtype='float32', always_2d=True); L_ = meter.integrated_loudness(m); T_ = tp(m)
    if abs(L_ + 14.0) <= 0.3 and T_ <= -3.2: break   # v2: 2+ dB headroom for the AAC encode (it overshot +3.7 dB at 24.5 s)
    gain *= 10 ** ((-14.0 - L_) / 20)
sf.write(str(AUD / f'music_{TAG}.wav'), music, SR, subtype='PCM_24'); sf.write(str(AUD / f'sfx_{TAG}.wav'), sfx[:N], SR, subtype='PCM_24')
(AUD / f'cues_{TAG}.json').write_text(json.dumps(CUES, indent=1), encoding='utf-8')
print(out, 'LUFS %.2f' % L_, 'TP %.2f dBTP' % T_, len(CUES), 'cues')
