"""Ambience beds per location (airport hall with announcements, the Alabama street, the sorting warehouse, the store, the
museum) + the carousel motor under the carousel shots; 0.3 s crossfades on the cuts. Recipe: pieces/guinea-rent/sound/beds.py."""
import numpy as np, soundfile as sf, subprocess, io, json, re
SR, DUR = 48000, 60.5
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
B = json.load(open('beds_pick.json')); SRC = {k: load(v) for k, v in B.items()}
src = open('../src/shots.js', encoding='utf-8').read(); rows = [(float(t), s) for t, s in re.findall(r'\["s\d+", ([\d.]+), \'(\w+)\'', src)]
SEG = [(s, t, rows[i + 1][0] if i + 1 < len(rows) else DUR) for i, (t, s) in enumerate(rows)]
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.3 * SR); off = {}
def lay(name, a, b, level=0.05):
    i0, i1 = max(0, int(a * SR) - X // 2), min(len(out), int(b * SR) + X // 2); n = i1 - i0
    s = SRC[name]; s = s / (np.sqrt(np.mean(s ** 2)) + 1e-9) * level
    o = off.get(name, int(2 * SR)) % max(1, len(s) - SR); seg = np.resize(np.roll(s, -o, 0), (n, 2)); off[name] = o + n
    seg[:, 1] = np.resize(np.roll(s[:, 1], -(o + int(0.43 * SR)), 0), n)   # decorrelated right channel (the beds read mono)
    env = np.ones(n, 'float32'); env[:X] = np.linspace(0, 1, X); env[-X:] = np.linspace(1, 0, X)
    out[i0:i1] += seg * env[:, None]
for name, a, b in SEG: lay(name, a, b)
CAROUSEL = [(0.0, 5.62), (32.56, 34.80), (53.12, 56.58), (58.10, 60.5)]   # shots that see the running carousel
for a, b in CAROUSEL: lay('conveyor', a, b, 0.03)
if 'crowd' in SRC:
    for name, a, b in SEG:
        if name == 'store': lay('crowd', a, b, 0.025)
sf.write('beds.wav', out, SR, subtype='FLOAT'); print('beds', len(SEG), float(np.abs(out).max()))
