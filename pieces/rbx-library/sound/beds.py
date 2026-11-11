"""rbx-library ambience beds per shot (board/shots.json) -> beds.wav, plus the Late Fee tension bed -> tension.wav (dark sub drone
+ 'move through the dark' pad, only under her sections). 0.3 s crossfades; R channel read 7 s later (wide, decorrelated)."""
import numpy as np, soundfile as sf, subprocess, io, json, glob, pyloudnorm as pl
SR = 48000; DUR = 118.397; N = int(DUR * SR)
def load(name):
    p = sorted(glob.glob(f'fs/{name}*.mp3'))[0]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    x = sf.read(io.BytesIO(raw), dtype='float64')[0]; x = x * 10 ** ((-30 - pl.Meter(SR).integrated_loudness(x)) / 20)
    return np.resize(x, (max(len(x), 20 * SR), 2))
S = {'birds': load('morning_388196'), 'night': load('night_town_425425'), 'room': load('roomtone_837886'), 'tick': load('clock_tick_759501'), 'tunnel': load('chute_wind_454355'),
     'walla': load('crowd_murmur_867051'), 'play': load('playground_629652'), 'chute': load('chute_wind_438861'), 'drone': load('drone_612796'), 'pad': load('tension_724667'), 'whisper': load('whisper_489897')}
MIX = {'morning': {'birds': 0.9, 'walla': 0.15}, 'night': {'night': 0.9}, 'sepia': {'night': 0.5}, 'house': {'room': 0.7, 'tick': 0.45}, 'libnight': {'room': 0.6, 'tunnel': 0.35, 'whisper': 0.18},
       'libday': {'room': 0.6, 'walla': 0.35}, 'school': {'play': 0.9}, 'chute': {'chute': 1.0}}
NIGHT_ST = {4, 5, 21, 22, 23, 24, 64}; SEPIA = {25, 26}; LIBDAY = set(range(27, 29)) | {32, 33, 43, 44} | set(range(107, 113)) | {114, 116, 117, 118}
TENSE = set(range(4, 15)) | {26} | set(range(47, 52)) | set(range(61, 64)) | set(range(64, 96))
shots = json.load(open('../board/shots.json'))
def kind(s):
    n, k = s['i'] + 1, s['set']
    if k == 'street': return 'sepia' if n in SEPIA else 'night' if n in NIGHT_ST else 'morning'
    if k in ('room', 'stairs'): return 'house'
    if k == 'lib': return 'libday' if n in LIBDAY else 'libnight'
    return k
def render(segs, mix):
    out = np.zeros((N, 2)); X = int(0.3 * SR); off = {}
    for k, a, b in segs:
        if k not in mix: continue
        i0, i1 = max(0, int(a * SR) - X // 2), min(N, int(b * SR) + X // 2); n = i1 - i0; y = np.zeros((n, 2))
        for src, g in mix[k].items():
            o = off.get(src, int(3 * SR)); z = np.resize(np.roll(S[src], -o, 0), (n, 2)); z[:, 1] = np.resize(np.roll(S[src][:, 1], -o - 7 * SR), n); y += z * g; off[src] = o + n
        env = np.ones(n); f = min(X, n // 2); env[:f] = np.linspace(0, 1, f); env[-f:] = np.linspace(1, 0, f)
        if i0 == 0: env[:f] = 1
        out[i0:i1] += y * env[:, None]
    fo = int(1.0 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]; return out
def segs_of(f):
    seg = []
    for s in shots:
        k = f(s)
        if seg and seg[-1][0] == k: seg[-1][2] = s['t1']
        else: seg.append([k, s['t0'], s['t1']])
    seg[-1][2] = DUR; return seg
b = render(segs_of(kind), MIX); sf.write('beds.wav', b.astype(np.float32), SR)
t = render(segs_of(lambda s: 'tense' if s['i'] + 1 in TENSE else 'none'), {'tense': {'drone': 0.8, 'pad': 0.6}}); sf.write('tension.wav', t.astype(np.float32), SR)
print('beds + tension written')
