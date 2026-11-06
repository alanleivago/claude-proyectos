"""Ambience beds per set (board/shots.json): street day = suburb birds, bedroom/living/kitchen = room tone (+ far crickets at night),
laundry = dryer/washer hum + room tone, chute = wind tunnel, cave = cave drips/rumble, classroom = real classroom,
hospital = hospital ambience, bathroom = shower running. 0.3 s crossfades; R channel read 7 s later (wide, decorrelated)."""
import numpy as np, soundfile as sf, subprocess, io, json, glob, pyloudnorm as pl
SR = 48000; DUR = 125.4556 + 0.5; N = int(DUR * SR)
def load(name):
    p = sorted(glob.glob(f'fs/{name}*.mp3'))[0]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    x = sf.read(io.BytesIO(raw), dtype='float64')[0]; x = x * 10 ** ((-30 - pl.Meter(SR).integrated_loudness(x)) / 20)
    return np.resize(x, (max(len(x), 20 * SR), 2))
S = {'birds': load('morning_388196'), 'room': load('roomtone_837886'), 'crick': load('crickets_425425'), 'hum': load('dryer_drum_411914'),
     'wind': load('chute_wind_454355'), 'cave': load('cave_516566'), 'class': load('classroom_708407'), 'hosp': load('hospital_348110'), 'shower': load('shower_442845')}
MIX = {'street': {'birds': 0.9}, 'bedroom': {'room': 0.8, 'crick': 0.25}, 'living': {'room': 0.8}, 'kitchen': {'room': 0.8},
       'laundry': {'hum': 0.55, 'room': 0.5}, 'chute': {'wind': 1.0}, 'cave': {'cave': 1.0}, 'classroom': {'class': 0.9},
       'hospital': {'hosp': 0.9}, 'bathroom': {'shower': 0.9}, 'nightliving': {'room': 0.8, 'crick': 0.3}}
shots = json.load(open('../board/shots.json')); seg = []
for s in shots:
    k = s['set']
    if k == 'living' and 55 <= s['i'] <= 65: k = 'nightliving'      # evening couch / midnight stairs
    if seg and seg[-1][0] == k: seg[-1][2] = s['t1']
    else: seg.append([k, s['t0'], s['t1']])
seg[-1][2] = DUR
out = np.zeros((N, 2)); X = int(0.3 * SR); off = {}
for k, a, b in seg:
    i0, i1 = max(0, int(a * SR) - X // 2), min(N, int(b * SR) + X // 2); n = i1 - i0
    y = np.zeros((n, 2))
    for src, g in MIX[k].items():
        o = off.get(src, int(3 * SR)); z = np.resize(np.roll(S[src], -o, 0), (n, 2)); z[:, 1] = np.resize(np.roll(S[src][:, 1], -o - 7 * SR), n)
        y += z * g; off[src] = o + n
    env = np.ones(n); f = min(X, n // 2); env[:f] = np.linspace(0, 1, f); env[-f:] = np.linspace(1, 0, f)
    if i0 == 0: env[:f] = 1
    out[i0:i1] += y * env[:, None]
from scipy.signal import butter, sosfilt
out = out + sosfilt(butter(2, 120, 'low', fs=SR, output='sos'), out, axis=0) * 3.5   # warmer, wider low end (L/R decorrelated)
fo = int(1.0 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
sf.write('beds.wav', out.astype(np.float32), SR); print('beds', len(seg), 'segments', out.shape)
