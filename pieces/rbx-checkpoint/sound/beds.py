"""rbx-rope ambience beds per set (board/shots.json): city = suburb, coast = waves + gulls, Front night = crickets + fog wind,
inside the Fog = fog wind, lawn = playground, ridge = mountain wind (+ dawn birds on Wave Day). 0.3 s crossfades; R channel read
7 s later (wide, decorrelated)."""
import numpy as np, soundfile as sf, subprocess, io, json, glob, pyloudnorm as pl
SR = 48000; DUR = 107.800000; N = int(DUR * SR)
def load(name):
    p = sorted(glob.glob(f'fs/{name}*.mp3'))[0]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    x = sf.read(io.BytesIO(raw), dtype='float64')[0]; x = x * 10 ** ((-30 - pl.Meter(SR).integrated_loudness(x)) / 20)
    return np.resize(x, (max(len(x), 20 * SR), 2))
S = {'town': load('town_818390'), 'fair': load('carnival_579801'), 'night': load('night_town_383479'), 'wind': load('fog_wind_844818'), 'class': load('classroom_205173'),
     'pool': load('waterpark_565475'), 'room': load('roomtone'), 'play': load('playground_629652')}
MIX = {'town': {'town': 0.9}, 'fair': {'fair': 1.0, 'town': 0.3}, 'dusk': {'wind': 0.7, 'town': 0.3}, 'night': {'night': 0.8, 'wind': 0.5}, 'school': {'class': 1.0}, 'pool': {'pool': 0.9},
       'house': {'room': 0.8}, 'yard': {'play': 0.9}, 'sepia': {'town': 0.5}}
DUSK = set(range(41, 49)); FAIR = {39, 40}; SEPIA = {20, 21, 22, 23, 25, 69, 70}
shots = json.load(open('../board/shots.json')); seg = []
for s in shots:
    n = s['i'] + 1; k = s['set']
    k = 'fair' if n in FAIR else 'sepia' if n in SEPIA else 'dusk' if (k == 'hole' and n in DUSK) else 'night' if k == 'hole' else k
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
fo = int(1.0 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
sf.write('beds.wav', out.astype(np.float32), SR); print('beds', len(seg), 'segments', out.shape)
