"""rbx-rope ambience beds per set (board/shots.json): city = suburb, coast = waves + gulls, Front night = crickets + fog wind,
inside the Fog = fog wind, lawn = playground, ridge = mountain wind (+ dawn birds on Wave Day). 0.3 s crossfades; R channel read
7 s later (wide, decorrelated)."""
import numpy as np, soundfile as sf, subprocess, io, json, glob, pyloudnorm as pl
SR = 48000; DUR = 113.4; N = int(DUR * SR)
def load(name):
    p = sorted(glob.glob(f'fs/{name}*.mp3'))[0]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    x = sf.read(io.BytesIO(raw), dtype='float64')[0]; x = x * 10 ** ((-30 - pl.Meter(SR).integrated_loudness(x)) / 20)
    return np.resize(x, (max(len(x), 20 * SR), 2))
S = {'sub': load('suburb_381759'), 'waves': load('seagulls_479528'), 'crick': load('night_town_383479'), 'wind': load('fog_wind_844818'),
     'play': load('playground_629652'), 'mtn': load('mountain_wind_615440'), 'birds': load('birds_dawn_611453')}
MIX = {'city': {'sub': 0.9}, 'coast': {'waves': 1.0}, 'night': {'crick': 0.7, 'wind': 0.6}, 'fog': {'wind': 1.0}, 'lawn': {'play': 0.8},
       'ridge': {'mtn': 0.9}, 'day': {'mtn': 0.5, 'birds': 0.7}, 'dawn': {'birds': 0.7, 'wind': 0.3}}
FOG = set(range(53, 58)); DAY = set(range(95, 103))
shots = json.load(open('../board/shots.json')); seg = []
for s in shots:
    n = s['i'] + 1; k = s['set']
    k = 'fog' if n in FOG else 'dawn' if n == 94 else 'night' if k == 'front' else 'day' if (k == 'ridge' and n in DAY) else k
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
