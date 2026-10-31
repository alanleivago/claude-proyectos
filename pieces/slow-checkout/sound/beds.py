"""Ambience beds per set (supermarket, canal street, quiet home with clock, office); 0.35 s crossfades."""
import numpy as np, soundfile as sf, subprocess, io
SR, DUR = 48000, 61.5
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
SRC = {'store': load('fs/store_bed_617520.mp3'), 'street': load('fs/street_bed_582919.mp3'), 'home': load('fs/home_bed_398843.mp3'), 'office': load('fs/office_bed_556390.mp3')}
SEG = [('store', 0, 32.7), ('street', 32.7, 35.3), ('office', 35.3, 37.6), ('home', 37.6, 41.3), ('street', 41.3, 44.1), ('office', 44.1, 46.1),
       ('store', 46.1, 51.7), ('office', 51.7, 54.4), ('store', 54.4, 61.5)]
GAIN = {'store': 1.0, 'street': 0.8, 'home': 1.4, 'office': 1.4}
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.35 * SR); off = {}
for name, a, b in SEG:
    if not name: continue
    i0, i1 = max(0, int(a * SR) - X // 2), min(len(out), int(b * SR) + X // 2); n = i1 - i0
    s = SRC[name]; o = off.get(name, int(2 * SR)); seg = np.resize(np.roll(s, -o, 0), (n, 2)) * GAIN[name]; off[name] = o + n
    env = np.ones(n, 'float32'); env[:X] = np.linspace(0, 1, X); env[-X:] = np.linspace(1, 0, X)
    out[i0:i1] += seg * env[:, None]
sf.write('beds.wav', out, SR); print('beds', out.shape, float(np.abs(out).max()))
