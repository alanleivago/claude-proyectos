"""vera-01 mix: voice (audio/voice.wav, tools/film_timeline.py) + licensed music bed + real CC0 foley -> audio/mix_v1.wav,
master -14 LUFS integrated, true peak <= -1 dBTP (4x oversampled check). Cue list -> audio/cues_v1.json.
Music: "Lo-Fi - Morning Breeze" by noel.wav (Freesound 678119, CC0, ~89 BPM, A major); credit in render/*.txt anyway.
SFX (all Freesound CC0, audio/sfx_dl/catalog.json): shop door bell 192761, heels on wood 117608, glass clink 104815, saucer 138345,
chair on wood 593180, espresso brew 344452, kitchen night room tone 473718, city noise 473698, woosh 683096, shine chime 879797, cloth 334219.
v2: the bed plays continuously (ducked under the voices) through the tail.
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
bell = norm(fs('door_bell', 192761)); heels = norm(fs('steps_wood', 117608)); clink = norm(fs('glass_lid', 104815)); saucer = norm(fs('plate', 138345))
chair = norm(fs('chair', 593180)); brew = norm(fs('espresso', 344452)); room = norm(fs('street_night', 473718)); city = norm(fs('street_night', 473698))
woosh = norm(fs('whoosh', 683096)); chime = norm(fs('ding', 879797)); cloth = norm(fs('cloth', 334219))
hs = onsets(heels); print('heel onsets', len(hs))

T0 = lambda k: S[k]['t0']
# ambience: room tone everywhere inside, street through the open door in 01, espresso machine murmur at the counter, street outside at the tail
bed(room, 0.0, T0('29'), -40, 1.0, 1.0, 'room tone (kitchen at night)')
bed(city, 0.45, T0('03'), -30, 0.15, 1.2, 'street through the open door (opens at 0.5 s)')
bed(clip(brew, 2.0, 14.0, 0.3, 0.3), T0('03'), T0('14'), -37, 1.0, 1.5, 'espresso machine murmur')
bed(city, T0('29') - 0.3, DUR, -26, 0.5, 2.2, 'street at night (exterior tail)')
# events
cue(0.5, clip(bell, 0, 1.0), -11, 0.4, 'door bell: the door opens (hook)')
for k in range(4): cue(0.05 + k * 0.45, clip(cloth, 0.1 + 0.2 * (k % 2), 0.4, 0.02, 0.1), -27, -0.2, 'rag wiping the table')
steps = norm(fs('steps_wood', 480610)); ss = onsets(steps)
for k in range(3): cue(0.75 + k * 0.5, clip(steps, ss[(k + 1) % len(ss)] - 0.02, 0.35), -21, 0.35, 'Theo steps in')
for t in (T0('02'), T0('14'), T0('21')): cue(t - 0.12, clip(woosh, 0, 0.9), -22, 0, 'mosaic woosh')
cue(T0('04') + 0.1, clip(cloth, 0, 0.6), -24, 0, 'cloth: neck scratch')
cue(T0('12') + 0.1, clip(cloth, 0.2, 0.8), -25, 0, 'cloth: collar fanning')
cue(T0('14') + 0.15, clip(clink, 0, 0.9), -21, 0.2, 'glass dome lifted')
cue(T0('17') + 1.45, clip(saucer, 0, 0.6), -20, 0.3, 'plate set on the window table (off screen)')
for k in range(3): cue(T0('17') + 0.6 + k * 0.38, clip(heels, hs[k + 1] - 0.02, 0.3), -23, 0.3, 'heels: she rounds the counter')
cue(T0('21') + 0.25, clip(chair, 0.3, 1.1), -22, 0.1, 'chair: they sit')
cue(T0('24') + 1.3, clip(saucer, 0, 0.5), -24, 0, 'plate turned')
cue(T0('25') + 0.9, clip(chime, 0, 2.2), -17, 0, 'ding: the label')
cue(T0('27') - 0.05, clip(chair, 0.2, 0.7), -25, 0.2, 'chair: she gets up')
for k in range(3): cue(T0('27') + 0.15 + k * 0.4, clip(heels, hs[(k + 3) % len(hs)] - 0.02, 0.3), -23, 0.2, 'heels: to the door')
cue(T0('28') + 0.35, clip(chime, 0, 2.2), -15, 0, 'ding: heart eyes')

# ---- voice
v, sr = sf.read(str(AUD / 'voice.wav'), dtype='float32', always_2d=True); v = v.mean(1)
voice = np.zeros((N, 2), np.float32); voice[:min(N, len(v))] = v[:N, None]

# ---- music bed: ducked under the voice, out before the key lines, dip under the confession, fade under the tail
mt = load(PIECE / 'audio' / 'music_dl' / 'fs678119' / 'track.mp3')
# v2: the track is sparse (plucks with near-silent dips): a gentle bus compressor fills it so the bed is heard as continuous
_t = Path(tempfile.mkdtemp()); sf.write(str(_t / 'm.wav'), mt, SR, subtype='FLOAT')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(_t / 'm.wav'), '-af', 'acompressor=threshold=-30dB:ratio=3:attack=15:release=350:makeup=2', str(_t / 'c.wav')], check=True, timeout=120)
mt, _ = sf.read(str(_t / 'c.wav'), dtype='float32', always_2d=True); music = np.zeros((N, 2), np.float32); n = min(N, len(mt)); music[:n] = mt[:n]
g = np.ones(N, np.float32)
def ramp(t0, t1, a, b):
    i0, i1 = int(t0 * SR), int(t1 * SR); g[i0:i1] *= np.linspace(a, b, max(1, i1 - i0))
def hold(t0, t1, a): g[int(t0 * SR):int(t1 * SR)] *= a
# v2 (user): the BGM plays the whole film: no drops or silences, only the duck under the voices, a light dip under the confession,
# and it runs through the silent tail (out with the picture's fade in the last second)
ramp(0.0, 0.25, 0.4, 1.0)
ramp(LN['22']['on'] - 0.4, LN['22']['on'], 1.0, 0.75); hold(LN['22']['on'], T0('24') - 0.4, 0.75); ramp(T0('24') - 0.4, T0('24'), 0.75, 1.0)   # -2.5 dB under the confession
ramp(DUR - 1.0, DUR, 1.0, 0.0)
music *= g[:, None]
spk = np.zeros(N, np.float32)
for L in TL['lines']:
    for a, b in L['spans']: spk[int((a - 0.08) * SR):int((b + 0.12) * SR)] = 1
duck = uniform_filter1d(spk, int(0.12 * SR))
meter = pyln.Meter(SR)
mL = meter.integrated_loudness(mt[:n]); vL = meter.integrated_loudness(voice)
music *= 10 ** ((vL - 9.0 - mL) / 20)                                      # v2: bed ~9 LU under the voice (always heard)
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
