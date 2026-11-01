"""Sound design for cavernas: real CC0 recordings (Freesound previews in audio/fs, the sound-layer library) placed on
the beats, which are timed to the voice (voice.json). Writes audio/track.wav (beds + effects, no voice) at -14 LUFS;
export.mjs lays the voice on top. Run: python audio/mix_track.py (from the piece folder or anywhere)."""
import json, os, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SR = 48000; LIB = r'F:\Claude Proyectos\sound-layer\kit'
V = json.load(open(os.path.join(ROOT, 'voice.json'), encoding='utf-8'))
DUR = V['duration']; N = int(DUR * SR)
LINE = {l['id']: l for l in V['lines']}
ORDER = [l['id'] for l in V['lines']]
S = {k: (0 if i == 0 else LINE[k]['t0'] - 0.35) for i, k in enumerate(ORDER)}           # shot starts (as in head.html)
E = {k: (S[ORDER[i + 1]] if i + 1 < len(ORDER) else DUR) for i, k in enumerate(ORDER)}   # shot ends

def fs(name): return next(os.path.join(HERE, 'fs', f) for f in os.listdir(os.path.join(HERE, 'fs')) if f.startswith(name))
def load(path, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path] + (['-af', af] if af else []) + ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
def norm(x, peak_db=-3):
    p = np.abs(x).max() or 1; return x * (10 ** (peak_db / 20) / p)

out = np.zeros((N, 2), np.float32)
def place(clip, t, db=0, fin=0.01, fout=0.05, dur=None, off=0.0, loop=False):
    a = int(off * SR); c = clip[a:]
    if dur is not None:
        n = int(dur * SR)
        if loop and len(c) < n: c = np.concatenate([c] + [clip] * (n // len(clip) + 1))
        c = c[:n]
    c = c.copy(); n = len(c); fi, fo = int(fin * SR), int(fout * SR)
    if fi: c[:min(fi, n)] *= np.linspace(0, 1, min(fi, n))[:, None]
    if fo: c[-min(fo, n):] *= np.linspace(1, 0, min(fo, n))[:, None]
    i = int(t * SR); j = min(N, i + n)
    if j > i: out[i:j] += c[:j - i] * 10 ** (db / 20)

# ---- sources (all checked with earshot describe: what they are)
drone = norm(load(fs('drone_2')), -3)                                  # dark tense ambient music (Szegvari, CC0)
night = norm(load(fs('night_1')), -3)                                  # crickets, distant barks
steps = norm(load(fs('steps_2')), -3)                                  # footsteps on gravel
steps_in = norm(load(fs('steps_2'), 'lowpass=f=2500,aecho=0.8:0.6:60:0.35'), -3)
cave = norm(load(fs('cave_amb_0')), -3)                                # large cave, low rumble
uw = norm(load(fs('uw_amb_1')), -3)                                    # underwater cave ambience
bub = norm(load(fs('bubbles_1'), 'lowpass=f=3000'), -3)                # deep bubbly rumble
heart = norm(load(fs('heartbeat_0')), -3)
ring = norm(load(fs('tinnitus_1')), -3)
splash = norm(load(fs('splash_1')), -3)
wade = norm(load(fs('wading_2'), 'aecho=0.8:0.5:50:0.3'), -3)
pour = norm(load(fs('concrete_2')), -3)
thud = [norm(load(os.path.join(LIB, p), 'lowpass=f=900'), -3) for p in [r'thump\fs-342535-medium-thud-1-1.wav', r'thump\fs-405535-thud-4-wav-1.wav', r'thump\fs-496187-light-body-thud-on-clothing-1.wav']]
boom_short = norm(load(os.path.join(LIB, r'boom\fs-13895-43-wav-1.wav'), 'lowpass=f=600'), -3)
drop = norm(load(os.path.join(LIB, r'boom\fs-141570-4-sec-drop-wav-1.wav')), -3)
cold = norm(load(os.path.join(LIB, r'hit\fs-130855-cold-cave-a-mp3-1.wav')), -3)
slab = norm(load(os.path.join(LIB, r'hit\fs-452665-wheelbarrow-down-on-concrete-2.wav')), -3)

UNDER = ['hook', 'dive1', 'wide', 'black1', 'chase', 'panic', 'turn', 'pull', 'found']
PAY = S['found']                       # the payoff hit lands on the cut to "los encontraron así"
# ---- music bed: the drone the whole way, out for the 0.8 s before the payoff, back low after
env = np.ones(N, np.float32)
k0, k1 = int((PAY - 0.9) * SR), int((PAY - 0.15) * SR); env[k0:k1] = np.linspace(1, 0, k1 - k0); env[k1:int(PAY * SR)] = 0
env[int(PAY * SR):] = 0.7
d = drone[:N] if len(drone) >= N else np.concatenate([drone, drone])[:N]
d = d * env[:, None]; d[:int(2 * SR)] *= np.linspace(0, 1, int(2 * SR))[:, None]; d[-int(3 * SR):] *= np.linspace(1, 0, int(3 * SR))[:, None]
out += d * 10 ** (-17 / 20)

# ---- beds per place
place(night, S['mount'] - 0.3, -20, 0.4, 2.0, dur=E['gallery'] - S['mount'] + 0.3)            # outside at night
place(steps, S['mount'] + 0.2, -17, 0.3, 0.6, dur=E['mount'] - S['mount'] - 0.2)
place(steps_in, S['gallery'], -19, 0.2, 0.8, dur=E['gallery'] - S['gallery'], off=8)
place(cave, S['gallery'], -24, 1.0, 1.0, dur=E['chamber'] - S['gallery'], loop=True)           # the cave's room tone
for k in ['wait', 'last2', 'empty']: place(cave, S[k], -24, 0.3, 0.4, dur=E[k] - S[k], off=10, loop=True)
place(cave, S['dive2'], -25, 0.2, 0.4, dur=1.9, off=20)
for k in ['chamber', 'wait']: place(wade, S[k], -22, 0.3, 0.4, dur=E[k] - S[k], off=3)
for k in UNDER:                                                                                  # under water: muffled cave
    t0 = S[k] + (1.8 if k == 'dive1' else 0); place(uw, t0, -14, 0.15, 0.25, dur=E[k] - t0 - (0.9 if k == 'found' else 0), off=(t0 * 3.7) % 10, loop=True)
place(uw, S['rope'], -18, 0.3, 0.4, dur=E['rope'] - S['rope'] - 0.6, off=4, loop=True)
place(uw, S['dive2'] + 1.8, -14, 0.1, 0.3, dur=E['dive2'] - S['dive2'] - 1.8, off=6, loop=True)
place(uw, S['last2'] + 2.0, -20, 0.1, 0.3, dur=E['last2'] - S['last2'] - 2.0, off=2, loop=True)

# ---- events
place(cold, 0.15, -9, 0.01, 1.5)                                                                 # cold open
place(splash, S['rope'] + 0.3, -16, 0.01, 0.3); place(splash, S['rope'] + 1.5, -19, 0.01, 0.3)   # they cross
for k, dt, db in [('dive1', 1.8, -8), ('dive2', 1.8, -8), ('last2', 2.0, -10), ('last2', 3.2, -12)]:
    place(splash, S[k] + dt, db, 0.005, 0.4)
for k, dt, dur, db in [('dive1', 2.0, 4.5, -18), ('wide', 0, 3.5, -22), ('chase', 0, 3.6, -16), ('panic', 0, 3.4, -11), ('turn', 0.5, 3.5, -18), ('pull', 0, 2.8, -15)]:
    place(bub, S[k] + dt, db, 0.2, 0.6, dur=dur, off=(S[k] * 2.3) % 40)
place(boom_short, S['black1'] + 1.95, -6, 0.005, 0.8)                                            # she goes out
place(heart, S['chase'], -14, 0.8, 0.3, dur=E['panic'] - S['chase'] - 1.0, loop=True)
place(heart, S['turn'], -15, 0.6, 1.2, dur=E['pull'] - S['turn'] - 0.4, off=3, loop=True)
w = [x for x in LINE['chase']['words'] if x['w'].lower().startswith('zumban')]
place(ring, (w[0]['t0'] if w else S['chase'] + 0.5), -26, 1.2, 1.0, dur=3.4)                    # "le zumban los oídos"
place(thud[0], S['chase'] + 3.0, -6, 0.002, 0.2)                                                 # her head meets the feet ahead
for i, dt in enumerate([0.4, 1.1, 1.6, 2.4, 2.9]): place(thud[i % 3], S['panic'] + dt, -5 - i, 0.002, 0.2)   # head against the roof
for i, dt in enumerate([0.6, 1.4, 2.2]): place(thud[(i + 1) % 3], S['pull'] + dt, -10, 0.002, 0.2)            # pulling at the legs
g = np.ones(N, np.float32); a, b = int((PAY - 1.1) * SR), int((PAY - 0.85) * SR); g[a:b] = np.linspace(1, 0, b - a); g[b:int(PAY * SR)] = 0
out *= g[:, None]                                                                                # everything out for ~0.85 s before it
place(drop, PAY, -1, 0.002, 2.5); place(cold, PAY, -4, 0.002, 2.5)                               # the payoff: loudest, after silence
place(pour, S['seal'] + 0.3, -14, 0.4, 0.8, dur=2.8, off=5)
place(slab, S['seal'] + 3.0, -6, 0.002, 0.6)

# ---- master to -14 LUFS (measured), peaks under -1.5 dBFS
tmp = os.path.join(HERE, '_track_raw.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', tmp], input=out.astype(np.float32).tobytes(), check=True)
m = subprocess.run(['ffmpeg', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
af = f"loudnorm=I=-16:TP=-1.5:LRA=14:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:linear=true"
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', af, '-ar', str(SR), os.path.join(HERE, 'track.wav')], check=True)
os.remove(tmp)
print('track.wav', round(DUR, 2), 's; raw', j['input_i'], 'LUFS', j['input_tp'], 'dBTP; payoff at', round(PAY, 2))
