"""Ambience beds per place (street at dawn, depot break room, brick-factory library hall, loading bay, village classroom,
prison cell, street in the morning) with 0.3 s crossfades on the whips, + layers: the garbage truck idling under the
street takes, the tea urn bubbling until it is buried (19.5 s, then muffled), the van idling in the bay, a fire crackle
inside the cosy truck library (gate open 59.40 -> slammed 60.86). Recipe: pieces/lost-luggage/sound/beds.py."""
import numpy as np, soundfile as sf, subprocess, io, json, re
from scipy.signal import butter, sosfilt
SR, DUR = 48000, 61.0
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
B = json.load(open('beds_pick.json')); SRC = {k: load(v) for k, v in B.items()}
src = open('../src/shots.js', encoding='utf-8').read(); rows = [(float(t), s) for t, s in re.findall(r'\["\w+", ([\d.]+), \'(\w+)\'', src)]
SEG = []
for i, (t, s) in enumerate(rows):   # merge consecutive shots of one place
    if SEG and SEG[-1][0] == s: SEG[-1][2] = rows[i + 1][0] if i + 1 < len(rows) else DUR
    else: SEG.append([s, t, rows[i + 1][0] if i + 1 < len(rows) else DUR])
SEG = [('street2' if s == 'street' and a > 50 else s, a, b) for s, a, b in SEG]
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.3 * SR); off = {}
def lay(name, a, b, level=0.05, x=X, filt=None):
    i0, i1 = max(0, int(a * SR) - x // 2), min(len(out), int(b * SR) + x // 2); n = i1 - i0
    s = SRC[name]; s = s / (np.sqrt(np.mean(s ** 2)) + 1e-9) * level
    o = off.get(name, int(min(2 * SR, len(s) // 4))) % max(1, len(s) - SR); seg = np.resize(np.roll(s, -o, 0), (n, 2)); off[name] = o + n
    seg[:, 1] = np.resize(np.roll(s[:, 1], -(o + int(0.43 * SR)), 0), n)   # decorrelated right channel (the beds read mono)
    if filt is not None: seg = sosfilt(filt, seg, axis=0).astype('float32')
    env = np.ones(n, 'float32'); env[:x] = np.linspace(0, 1, x); env[-x:] = np.linspace(1, 0, x)
    out[i0:i1] += seg * env[:, None]
for name, a, b in SEG: lay(name, a, b); print('bed', name, a, b)
lay('idle', 0.0, 17.06, 0.035, x=int(1.2 * SR)); lay('idle', 53.42, 59.1, 0.03)               # the truck idling (rolls in from 0, pulls away at 59.05)
lay('urn', 17.06, 19.55, 0.022); lay('urn', 19.55, 26.19, 0.012, filt=butter(2, 700, 'low', fs=SR, output='sos'))   # buried under books at 19.5
lay('van', 46.14, 48.60, 0.02)
lay('fire', 59.40, 60.86, 0.05, x=int(0.12 * SR))
sf.write('beds.wav', out, SR, subtype='FLOAT'); print('beds', len(SEG), float(np.abs(out).max()))
