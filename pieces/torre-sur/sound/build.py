"""torre-sur soundtrack: cue list -> sfx.wav (no voice) + mix.wav (voice + sfx), 48 kHz stereo, 67.709 s, -14 LUFS.
Every sound is a real recording (fs/ = Freesound CC0, kit = sound-layer CC0) except two code sub layers (impact, PARTE 2 sting).
Levels: 'rms' = RMS dBFS of the trimmed segment, 'pk' = peak dBFS. env = [[t_abs, dB offset], ...]; ramp = [dB at start, dB at end].
Buses: bed (ducked under the voice), fx (one-shots, not ducked), hit (impacts, not ducked, exempt from the hard-cut rules).
Run: F:/earshot/.venv/Scripts/python.exe -I build.py"""
import io, json, subprocess, os
import numpy as np, soundfile as sf, pyloudnorm as pl
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.ndimage import uniform_filter1d, maximum_filter1d

os.chdir(os.path.dirname(os.path.abspath(__file__)))
SR = 48000; DUR = 67.709; N = round(DUR * SR); CUT = 64.2; STING = 65.0
KIT = 'F:/Claude Proyectos/sound-layer/kit/'

def ticks():  # accelerating clock-tick riser 32.85 -> 35.0
    t, dt, out = 32.85, 0.42, []
    while t < 34.97:
        out.append(round(t, 3)); t += dt; dt = max(0.055, dt * 0.8)
    return out

C = [
 # --- 0-5.25 floor-89 office: HVAC, keyboards, distant phone, murmur; jet growing from 2 s
 dict(id='office:hvac', f='fs/hvac_708021.mp3', t=0, s=10, d=5.3, rms=-40, fo=.05, bus='bed'),
 dict(id='office:typing', f='fs/typing_636044.mp3', t=0, s=2.2, d=5.3, rms=-36, hp=200, lp=7000, fi=.3, fo=.05, bus='bed'),
 *[dict(id=f'office:phone{i}', f='fs/phone2_332073.mp3', t=t, s=0, d=1.9, rms=-45, hp=400, lp=3200, rev=.35, fo=.3, bus='bed') for i, t in enumerate([.4, 2.5])],
 dict(id='office:murmur', f='fs/lobby_757318.mp3', t=0, s=2, d=5.3, rms=-41, lp=4000, fi=.3, fo=.05, bus='bed'),
 dict(id='jet1:approach', f='fs/jet_623151.mp3', t=2.0, s=10.5, d=3.28, rms=-30, ramp=[-16, 2], fi=1.2, fo=.04, bus='fx'),
 # --- 5.6 first impact (after 0.3 s near-silence): the loudest SFX moment of the first half
 dict(id='impact:explosion', f='fs/explosion_848083.mp3', t=5.6, s=0, d=3.4, pk=-1, onset=True, fo=1.6, bus='hit'),
 dict(id='impact:thunder', f=KIT + 'boom/fs-320782-huge-explosion-thunder-explo-3.wav', t=5.6, s=0, d=2.7, pk=-3, onset=True, fo=1.2, bus='hit'),
 dict(id='impact:sub', synth='sub', t=5.6, d=2.6, f0=46, f1=26, pk=-4, bus='hit'),
 dict(id='impact:rattle', f='fs/rattle_104347.mp3', t=5.62, s=.3, d=2.7, pk=-9, fo=.6, bus='hit'),
 dict(id='mug:smash', f='fs/mug_338018.mp3', t=6.3, s=0, d=1.6, pk=-7, onset=True, fo=.4, bus='fx', duck=-8),
 # --- 6.6-15 panic: screams, shouts, running, fire alarm, chairs, papers, phones
 dict(id='panic:crowd', f='fs/panic_491405.mp3', t=6.5, s=1.0, d=8.9, rms=-25, fi=.25, fo=.8, bus='bed', duck=-12),
 dict(id='panic:screams', f='fs/murmur_480725.mp3', t=6.7, s=20, d=11.8, rms=-29, rev=.25, fi=.3, fo=1.2, bus='bed', duck=-12),
 dict(id='panic:running', f='fs/running_480674.mp3', t=7.0, s=1.0, d=8.2, rms=-30, fi=.2, fo=.6, bus='bed'),
 dict(id='alarm:floor89', f='fs/alarm_678345.mp3', t=7.4, s=.2, e=3.7, d=11.2, loop=True, rms=-31, fi=.05, fo=.3, bus='bed'),
 dict(id='alarm:lobby', f='fs/alarm_678345.mp3', t=18.4, s=.2, e=3.7, d=6.6, loop=True, rms=-40, lp=2500, rev=.3, fi=.1, fo=.4, bus='bed'),
 dict(id='panic:chair1', f='fs/chair_776569.mp3', t=8.0, s=.2, d=1.0, pk=-16, fo=.2, bus='fx'),
 dict(id='panic:chair2', f='fs/chair_776569.mp3', t=11.7, s=2.1, d=1.0, pk=-17, fo=.2, bus='fx'),
 dict(id='panic:papers1', f='fs/papers_272015.mp3', t=9.8, s=.2, d=2.6, pk=-17, fo=.3, bus='fx'),
 dict(id='panic:papers2', f='fs/papers_272015.mp3', t=13.4, s=.6, d=2.2, pk=-19, fo=.3, bus='fx'),
 *[dict(id=f'panic:phone{i}', f='fs/phone2_332073.mp3', t=t, s=0, d=1.9, rms=-44, hp=400, lp=3000, rev=.3, fo=.3, bus='bed') for i, t in enumerate([9.0, 11.1, 13.2])],
 dict(id='tension:low', f='fs/drone_870028.mp3', t=6.6, s=40, d=26.0, rms=-39, lp=900, fi=2, fo=.4, bus='bed'),
 # --- 18.5-25 elevator lobby: buttons, ding, doors onto a packed car
 dict(id='lobby:crowd', f='fs/murmur_480725.mp3', t=18.3, s=40, d=6.9, rms=-35, lp=3500, fi=.4, fo=.3, bus='bed'),
 dict(id='lobby:steps', f='fs/running_480674.mp3', t=18.5, s=10, d=4.0, rms=-37, fi=.3, fo=.4, bus='bed'),
 *[dict(id=f'lobby:button{i}', f='fs/button_719432.mp3', t=t, s=0, d=.45, pk=p, onset=True, fo=.1, bus='fx')
   for i, (t, p) in enumerate([(19.0, -13), (19.35, -14.5), (20.9, -13.5), (21.3, -15), (21.9, -13)])],
 dict(id='lobby:ding', f='fs/ding2_571511.mp3', t=22.75, s=0, d=1.5, pk=-18, rev=.2, fo=.3, bus='fx'),
 dict(id='lobby:doors', f='fs/doors_341186.mp3', t=21.7, s=0, d=3.6, pk=-14, fo=.4, bus='fx', duck=-6),
 dict(id='lobby:packedcar', f='fs/lobby_757318.mp3', t=23.0, s=12, d=2.2, rms=-31, fi=.3, fo=.3, bus='bed'),
 # --- 25-32.6 stair A: echoing steps on concrete, crowd in the stairwell, fire door bang 31.5
 dict(id='stairs:crowd', f='fs/stairs_553897.mp3', t=24.9, s=0, e=13, d=7.8, loop=True, rms=-30, rev=.35, fi=.15, fo=.3, bus='bed'),
 dict(id='stairs:close', f='fs/stairs_643040.mp3', t=25.2, s=1.0, d=5.6, rms=-31, rev=.3, fi=.1, fo=.3, bus='bed'),
 dict(id='stairs:close2', f='fs/stairs_643040.mp3', t=29.2, s=2.0, d=3.4, rms=-32, rev=.3, fi=.2, fo=.3, bus='bed'),
 dict(id='stairs:echo', f='fs/stairwell_862279.mp3', t=25.5, s=13.0, d=7.2, rms=-34, rev=.2, fo=.4, bus='bed'),
 dict(id='stairs:people', f='fs/murmur_480725.mp3', t=25.0, s=55, d=7.7, rms=-37, lp=3000, rev=.5, fi=.2, fo=.3, bus='bed'),
 dict(id='stairs:firedoor', f='fs/firedoor_483191.mp3', t=31.5, s=.8, d=2.0, pk=-9, onset=True, rev=.4, fo=.5, bus='fx'),
 # --- 33-35 time jump: muffled drone + accelerating clock ticks + riser
 dict(id='jump:drone', f='fs/drone_870028.mp3', t=32.7, s=5, d=2.4, rms=-31, lp=450, fi=.3, fo=.08, bus='fx'),
 dict(id='jump:riser', f=KIT + 'riser/fs-503800-riser-1-wav-1.wav', t=31.54, s=0, d=3.41, pk=-15, fi=.8, fo=.03, bus='fx'),
 *[dict(id=f'jump:tick{i}', f=KIT + f'tick/fs-398275-clock-tick-{i % 3 + 1}.wav', t=t, s=0, d=.15, pk=-18 + 6 * i / 12, onset=True, bus='fx')
   for i, t in enumerate(ticks())],
 # --- 35-49 sky lobby 78: reverberant hall walla, tense quiet under l15, ding 48
 dict(id='sky:walla', f='fs/lobby_859385.mp3', t=35.0, s=5, d=14.2, rms=-30, rev=.45, big=True, fi=.05, fo=.4, bus='bed',
      env=[[35, 0], [43.0, 0], [44.6, -8], [47.4, -8], [48.4, -3]]),
 dict(id='sky:ding', f='fs/ding2_571511.mp3', t=48.65, s=0, d=1.5, pk=-18, rev=.35, big=True, fo=.3, bus='fx'),
 dict(id='sky:doors', f='fs/doors_341186.mp3', t=48.8, s=.3, d=3.0, pk=-19, fo=.4, bus='fx'),
 dict(id='music:drone', f='fs/drone_870028.mp3', t=35.0, s=8, d=29.2, rms=-34, fi=.5, bus='bed',
      env=[[35, -3], [43.2, -3], [44.4, 3], [47.5, 3], [49, -1], [54.5, 0], [59.5, 3], [64.2, 9]]),
 # --- 49-54.5 elevator ride: hum, cable whir, arrival ding
 dict(id='lift:hum', f='fs/lift_825478.mp3', t=49.0, s=2, d=5.6, rms=-28, fi=.2, fo=.2, bus='bed'),
 dict(id='lift:cable', f='fs/lift_130052.mp3', t=49.0, s=10, d=5.5, rms=-34, hp=150, fi=.4, fo=.3, bus='bed'),
 dict(id='lift:ding', f='fs/ding2_571511.mp3', t=54.15, s=0, d=1.5, pk=-18, rev=.15, fo=.3, bus='fx'),
 dict(id='lift:doors', f='fs/doors_341186.mp3', t=53.9, s=.8, d=2.8, pk=-18, fo=.4, bus='fx'),
 # --- 54.5-64.2 empty office: HVAC, sirens far below, unanswered phone; jet 59.5-64.2
 dict(id='empty:hvac', f='fs/hvac_708021.mp3', t=54.5, s=40, d=9.7, rms=-38, fi=.2, bus='bed'),
 dict(id='empty:sirens', f='fs/sirens_572411.mp3', t=54.5, s=10, d=9.7, rms=-40, hp=200, lp=2500, rev=.3, fi=.5, bus='bed'),
 *[dict(id=f'empty:phone{i}', f='fs/phone2_332073.mp3', t=t, s=0, d=1.9, rms=-48, hp=400, lp=2800, rev=.35, fo=.3, bus='bed') for i, t in enumerate([55.4, 57.5])],
 dict(id='jet2:flyby', f='fs/jet_623151.mp3', t=59.46, s=11.9, d=4.74, rms=-27, ramp=[-18, 1.5], fi=.4, bus='fx', duck=-8),
 dict(id='jet2:roar', f='fs/jet_251962.mp3', t=59.48, s=4.7, d=4.72, rms=-29, ramp=[-16, -1], fi=.4, bus='fx', duck=-8),
 dict(id='jet2:riser', f=KIT + 'riser/fs-571112-bass-riser-fx-e-1.wav', t=59.5, s=0, d=4.7, pk=-9, fi=.3, bus='fx', duck=-3),
 dict(id='jet2:rattle', f='fs/rattle_104347.mp3', t=62.9, s=0, d=1.3, pk=-15, fi=.2, bus='fx'),
 # --- 64.2 HARD CUT to silence; 65.0 PARTE 2 sting decaying to the end
 dict(id='sting:boom', f=KIT + 'boom/fs-539968-deep-boom-3.wav', t=STING, s=0, d=2.215, pk=-14.5, onset=True, fo=.6, bus='hit'),
 dict(id='sting:sub', synth='sub', t=STING, d=2.65, f0=40, f1=30, pk=-18, bus='hit'),
]

_cache = {}
def load(p):
    if p not in _cache:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
        _cache[p] = sf.read(io.BytesIO(raw))[0]
    return _cache[p]

def filt(x, hp=None, lp=None):
    if hp: x = sosfilt(butter(2, hp, 'hp', fs=SR, output='sos'), x, axis=0)
    if lp: x = sosfilt(butter(2, lp, 'lp', fs=SR, output='sos'), x, axis=0)
    return x

_ir = {}
def reverb(x, wet, big=False):  # processing only: decaying-noise impulse response (stairwell / hall)
    key = big
    if key not in _ir:
        rng = np.random.default_rng(7); n = int((2.6 if big else 1.4) * SR); tt = np.arange(n) / SR
        ir = rng.standard_normal((n, 2)) * np.exp(-tt / (0.55 if big else 0.28))[:, None]
        ir = filt(ir, hp=120, lp=5000); _ir[key] = ir / np.sqrt((ir ** 2).sum(0))
    w = fftconvolve(x, _ir[key], axes=0)[:len(x)]
    w *= np.sqrt((x ** 2).mean() / ((w ** 2).mean() + 1e-12))
    return x * (1 - wet * .5) + w * wet

def fade(x, fi=0, fo=0):
    n = len(x)
    if fi: k = min(n, int(fi * SR)); x[:k] *= np.linspace(0, 1, k)[:, None]
    k = min(n, int(max(fo, .005) * SR)); x[n - k:] *= np.linspace(1, 0, k)[:, None]
    return x

def render(c):
    d = int(c['d'] * SR)
    if c.get('synth') == 'sub':  # code weight layer: pitch-dropping sine with a fast attack, exp decay
        tt = np.arange(d) / SR; f = c['f1'] + (c['f0'] - c['f1']) * np.exp(-tt / .35)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, tt / .006) * np.exp(-tt / (c['d'] / 3.2))
        x = np.stack([y, y], 1); off = 0
    else:
        src = load(c['f']); a = int(c['s'] * SR)
        if c.get('loop'):
            b = int(c['e'] * SR); seg = src[a:b]; xf = int(.3 * SR); out = seg.copy()
            while len(out) < d:
                r = np.linspace(0, 1, xf)[:, None]
                out = np.concatenate([out[:-xf], out[-xf:] * (1 - r) + seg[:xf] * r, seg[xf:]])
            x = out[:d].copy()
        else:
            x = src[a:a + d].copy()
        off = 0
        if c.get('onset'):  # put the first point within 20 dB of the peak on t
            m = np.abs(x).max(1); off = int(np.argmax(m > m.max() * .1))
        x = filt(x, c.get('hp'), c.get('lp'))
        if c.get('rev'): x = reverb(x, c['rev'], c.get('big', False))
    x = fade(x, c.get('fi', 0), c.get('fo', 0))
    if 'rms' in c: x *= 10 ** (c['rms'] / 20) / (np.sqrt((x ** 2).mean()) + 1e-12)
    else: x *= 10 ** (c['pk'] / 20) / (np.abs(x).max() + 1e-12)
    if c.get('ramp'): x *= 10 ** (np.linspace(*c['ramp'], len(x)) / 20)[:, None]
    return x, int(c['t'] * SR) - off

# voice + ducking: each cue drops by its bus's duck dB while a line plays (beds -9, hits -10, one-shots 0)
v = sf.read('../voice/voice.wav')[0]; v = np.stack([v, v], 1) if v.ndim == 1 else v
v = v[:N] * 10 ** ((-20 - pl.Meter(SR).integrated_loudness(v)) / 20)
lines = json.load(open('../voice.json', encoding='utf-8'))['lines']
act = np.zeros(N)
for l in lines: act[int((l['t0'] - .08) * SR):int((l['t1'] + .25) * SR)] = 1
act = uniform_filter1d(maximum_filter1d(act, int(.06 * SR)), int(.15 * SR))  # 0..1 smoothed
DUCK = dict(bed=-9, fx=0, hit=-14)  # default dB while a line plays; a cue may set duck=
under = {}
bus = {k: np.zeros((N, 2)) for k in ('bed', 'fx', 'hit')}
for c in C:
    x, i0 = render(c)
    if c.get('env'):
        tt = (i0 + np.arange(len(x))) / SR; e = np.array(c['env'])
        x *= 10 ** (np.interp(tt, e[:, 0], e[:, 1]) / 20)[:, None]
    dk = c.get('duck', DUCK[c['bus']])
    j0 = max(0, i0); j1 = min(N, i0 + len(x))
    bus[c['bus']][j0:j1] += x[j0 - i0:j1 - i0] * (10 ** (dk * act[j0:j1] / 20))[:, None]
    for l in lines:  # which cues sit under each line (masking report)
        k0, k1 = max(j0, int(l['t0'] * SR)), min(j1, int(l['t1'] * SR))
        if k1 > k0: under.setdefault(l['id'], []).append((round(10 * np.log10(np.mean(x[k0 - i0:k1 - i0] ** 2 * (10 ** (dk * act[k0:k1] / 20))[:, None] ** 2) + 1e-12), 1), c['id']))


# near-silence 5.3-5.6 before the first impact; HARD CUT 64.2; sting alone from 65.0, gone by the end
tt = np.arange(N) / SR
for k in bus:
    bus[k][(tt >= 5.3) & (tt < 5.595) & (k != 'hit')] *= 0
    bus[k][tt >= CUT] *= 0 if k != 'hit' else 1
bus['hit'][(tt >= CUT) & (tt < STING - .05)] = 0
tail = (tt >= DUR - .25); bus['hit'][tail] *= np.linspace(1, 0, tail.sum())[:, None]
sfx = bus['bed'] + bus['fx'] + bus['hit']

# master: -14 LUFS, lookahead limiter at -2.3 dBFS (AAC adds overs), then trim to measured -14
def limit(x, thr=10 ** (-2.3 / 20)):
    env = np.abs(x).max(1); gg = np.minimum(1, thr / np.maximum(env, 1e-9)); la = int(.005 * SR)
    gl = -maximum_filter1d(-gg, 2 * la + 1, origin=0); gl = np.concatenate([gl[la:], np.ones(la)])
    a, r, cur, out = np.exp(-1 / (.002 * SR)), np.exp(-1 / (.12 * SR)), 1.0, np.empty_like(gl)
    for i, xg in enumerate(gl): cur = xg if xg < cur else r * cur + (1 - r) * xg; out[i] = cur
    return np.clip(x * out[:, None], -thr, thr), out

M = pl.Meter(SR)
mix = v + sfx; gain = 10 ** ((-14 - M.integrated_loudness(mix)) / 20)
for _ in range(3):
    m2 = limit(mix * gain)[0]; gain *= 10 ** ((-14 - M.integrated_loudness(m2)) / 20)
m2, lg = limit(mix * gain); G = gain * lg[:, None]  # stems carry the same master gain + limiter curve
os.makedirs('stems', exist_ok=True)
sf.write('mix.wav', m2.astype(np.float32), SR, subtype='PCM_24')
sf.write('sfx.wav', (sfx * G).astype(np.float32), SR, subtype='PCM_24')
for k in bus: sf.write(f'stems/{k}.wav', (bus[k] * G).astype(np.float32), SR, subtype='PCM_24')
sf.write('stems/voice.wav', (v * G).astype(np.float32), SR, subtype='PCM_24')
json.dump([{k: c[k] for k in c} for c in C], open('cues.json', 'w'), indent=1)
json.dump({k: sorted(u, reverse=True)[:4] for k, u in under.items()}, open('under_voice.json', 'w'), indent=1)
print('LUFS', round(M.integrated_loudness(m2), 2), 'peak dBFS', round(20 * np.log10(np.abs(m2).max()), 2), 'master gain dB', round(20 * np.log10(gain), 2), 'samples', len(m2))
