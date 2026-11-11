"""Ambience beds per set (bank hall, vault warehouse, dairy cellar, piazza); 0.35 s crossfades."""
import numpy as np, soundfile as sf, subprocess, io, glob, json
SR, DUR = 48000, 60.5
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
B = json.load(open('beds_pick.json'))   # {bank, vault, dairy, piazza: file}
SRC = {k: load(v) for k, v in B.items()}
SEG = [('bank', 0, 2.84), ('vault', 2.84, 3.88), ('bank', 3.88, 9.04), ('dairy', 9.04, 22.76), ('piazza', 22.76, 25.26), ('bank', 25.26, 33.59),
       ('piazza', 33.59, 38.55), ('bank', 38.55, 40.69), ('vault', 40.69, 51.65), ('bank', 51.65, DUR)]
GAIN = {'bank': 1.0, 'vault': 1.1, 'dairy': 1.1, 'piazza': 1.0}
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.35 * SR); off = {}
for name, a, b in SEG:
    i0, i1 = max(0, int(a * SR) - X // 2), min(len(out), int(b * SR) + X // 2); n = i1 - i0
    s = SRC[name]; s = s / (np.sqrt(np.mean(s ** 2)) + 1e-9) * 0.05
    o = off.get(name, int(2 * SR)) % max(1, len(s) - SR); seg = np.resize(np.roll(s, -o, 0), (n, 2)) * GAIN[name]; off[name] = o + n
    env = np.ones(n, 'float32'); env[:X] = np.linspace(0, 1, X); env[-X:] = np.linspace(1, 0, X)
    out[i0:i1] += seg * env[:, None]
out[-1:] = 0; sf.write('beds.wav', out, SR, subtype='FLOAT'); print('beds', out.shape, float(np.abs(out).max()))
