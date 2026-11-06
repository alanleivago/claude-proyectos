"""Ambience beds per set (board/shots.json): street night = crickets + night wind, sky = wind + far crickets,
bedroom/kitchen = room tone + crickets through the boards, classroom = real classroom, morning/day = suburb birds. 0.3 s crossfades."""
import numpy as np, soundfile as sf, subprocess, io, json, pyloudnorm as pl
SR = 48000; DUR = 119.742 + 0.5; N = int(DUR * SR)
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    x = sf.read(io.BytesIO(raw), dtype='float64')[0]; return x * 10 ** ((-30 - pl.Meter(SR).integrated_loudness(x)) / 20)
S = {'crick': load('fs/crickets_425425.mp3'), 'wind': load('fs/wind_bed_708611.mp3'), 'room': load('fs/roomtone_837886.mp3'),
     'class': load('fs/classroom_708407.mp3'), 'birds': load('fs/morning_388196.mp3')}
MIX = {'street': {'crick': 1.0, 'wind': 0.6}, 'sky': {'wind': 1.0, 'crick': 0.35}, 'bedroom': {'room': 0.7, 'crick': 0.3},
       'kitchen': {'room': 0.7, 'crick': 0.25}, 'classroom': {'class': 0.9}, 'day': {'birds': 0.9}, 'warm': {'crick': 0.9, 'wind': 0.25}}
shots = json.load(open('../board/shots.json')); seg = []
for s in shots:
    k = s['set']
    if s['i'] in (80, 88): k = 'day'                       # morning boards-off, day roof squint
    elif s['i'] >= 81 and k == 'street': k = 'warm'        # finale nights: calmer, less wind
    if seg and seg[-1][0] == k: seg[-1][2] = s['t1']
    else: seg.append([k, s['t0'], s['t1']])
seg[-1][2] = DUR
out = np.zeros((N, 2)); X = int(0.3 * SR); off = {}
for k, a, b in seg:
    i0, i1 = max(0, int(a * SR) - X // 2), min(N, int(b * SR) + X // 2); n = i1 - i0
    y = np.zeros((n, 2))
    for src, g in MIX[k].items():
        o = off.get(src, int(3 * SR)); z = np.resize(np.roll(S[src], -o, 0), (n, 2)); z[:, 1] = np.resize(np.roll(S[src][:, 1], -o - 7 * SR), n)   # R from 7 s later: wide, decorrelated
        y += z * g; off[src] = o + n
    env = np.ones(n); f = min(X, n // 2); env[:f] = np.linspace(0, 1, f); env[-f:] = np.linspace(1, 0, f)
    if i0 == 0: env[:f] = 1
    out[i0:i1] += y * env[:, None]
fo = int(1.0 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
sf.write('beds.wav', out.astype(np.float32), SR); print('beds', len(seg), 'segments', out.shape)
