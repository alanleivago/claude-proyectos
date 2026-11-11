"""Ambience beds per set (apartment, the lady's cottage, the Swiss office); 0.3 s crossfades on the cuts."""
import numpy as np, soundfile as sf, subprocess, io, json, re
SR, DUR = 48000, 60.5
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
B = json.load(open('beds_pick.json')); SRC = {k: load(v) for k, v in B.items()}
src = open('../src/shots.js', encoding='utf-8').read(); rows = [(float(t), s) for t, s in re.findall(r'\["s\d+", ([\d.]+), \'(\w+)\'', src)]
SEG = [(s, t, rows[i + 1][0] if i + 1 < len(rows) else DUR) for i, (t, s) in enumerate(rows)]
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.3 * SR); off = {}
for name, a, b in SEG:
    i0, i1 = max(0, int(a * SR) - X // 2), min(len(out), int(b * SR) + X // 2); n = i1 - i0
    s = SRC[name]; s = s / (np.sqrt(np.mean(s ** 2)) + 1e-9) * 0.05
    o = off.get(name, int(2 * SR)) % max(1, len(s) - SR); seg = np.resize(np.roll(s, -o, 0), (n, 2)); off[name] = o + n
    env = np.ones(n, 'float32'); env[:X] = np.linspace(0, 1, X); env[-X:] = np.linspace(1, 0, X)
    out[i0:i1] += seg * env[:, None]
sf.write('beds.wav', out, SR, subtype='FLOAT'); print('beds', len(SEG), float(np.abs(out).max()))
