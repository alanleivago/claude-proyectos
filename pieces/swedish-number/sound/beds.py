"""Ambience beds per set (call center, winter village, living room, cottage kitchen, tourism office; the globe has none); 0.35 s crossfades."""
import numpy as np, soundfile as sf, subprocess, io
SR, DUR = 48000, 61.5
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
SRC = {'calls': load('fs/callcenter_bed_579568.mp3'), 'winter': load('fs/winter_bed_574284.mp3'), 'home': load('fs/home_bed_398843.mp3'), 'office': load('fs/office_bed_556390.mp3')}
SEG = [(None, 0, 2.68), ('calls', 2.68, 4.98), ('winter', 4.98, 6.18), ('home', 6.18, 7.70), ('winter', 7.70, 11.50), ('home', 11.50, 13.78), ('home', 13.78, 15.32),
       ('home', 15.32, 24.60), ('office', 24.60, 38.18), ('winter', 38.18, 40.18), ('office', 40.18, 44.08), ('winter', 44.08, 45.58), ('home', 45.58, 48.04),
       (None, 48.04, 57.54), ('home', 57.54, 61.5)]
GAIN = {'calls': 1.0, 'winter': 1.2, 'home': 1.4, 'office': 1.4}
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.35 * SR); off = {}
for name, a, b in SEG:
    if not name: continue
    i0, i1 = max(0, int(a * SR) - X // 2), min(len(out), int(b * SR) + X // 2); n = i1 - i0
    s = SRC[name]; o = off.get(name, int(2 * SR)); seg = np.resize(np.roll(s, -o, 0), (n, 2)) * GAIN[name]; off[name] = o + n
    env = np.ones(n, 'float32'); env[:X] = np.linspace(0, 1, X); env[-X:] = np.linspace(1, 0, X)
    out[i0:i1] += seg * env[:, None]
sf.write('beds.wav', out, SR); print('beds', out.shape, float(np.abs(out).max()))
