"""Ambience beds under the whole film, per set: surf (beach), storm (rain+wind+thunder), underwater; 0.35 s crossfades."""
import numpy as np, soundfile as sf, subprocess, io
SR, DUR = 48000, 61.5
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
SRC = {'surf': load('fs/surf_bed_520770.mp3'), 'storm': load('fs/storm_bed_237729.mp3'), 'under': load('fs/underwater_bed2_366159.mp3'),
       'wind': load('fs/storm_bed_117136.mp3')}
SEG = [('surf', 0, 2.4), ('storm', 2.4, 3.3), ('surf', 3.3, 15.0), ('storm', 15.0, 24.6), ('under', 24.6, 33.5), ('surf', 33.5, 39.0),
       ('under', 39.0, 43.1), ('storm', 43.1, 45.2), (None, 45.2, 49.3), ('surf', 49.3, 57.3), ('under', 57.3, 61.5)]
GAIN = {'surf': 1.0, 'storm': 1.0, 'under': 0.8}
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.35 * SR); off = {}
for name, a, b in SEG:
    if not name: continue
    i0, i1 = max(0, int(a * SR) - X // 2), min(len(out), int(b * SR) + X // 2); n = i1 - i0
    s = SRC[name]; o = off.get(name, int(2 * SR)); seg = np.resize(np.roll(s, -o, 0), (n, 2)) * GAIN[name]; off[name] = o + n
    if name == 'storm': seg = seg + np.resize(SRC['wind'], (n, 2)) * 0.5
    env = np.ones(n, 'float32'); env[:X] = np.linspace(0, 1, X); env[-X:] = np.linspace(1, 0, X)
    out[i0:i1] += seg * env[:, None]
sf.write('beds.wav', out, SR); print('beds', out.shape, float(np.abs(out).max()))
