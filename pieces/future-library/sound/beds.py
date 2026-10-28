"""Ambience beds under the whole film, per set: surf (beach), storm (rain+wind+thunder), underwater; 0.35 s crossfades."""
import numpy as np, soundfile as sf, subprocess, io
SR, DUR = 48000, 61.5
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
SRC = {'hall': load('fs/hall_bed_613781.mp3'), 'room': load('fs/shop_bed_474832.mp3'), 'forest': load('fs/forest_bed_463903.mp3'), 'shop': load('fs/shop_bed_474830.mp3'), 'plaza': load('fs/crowd_260121.mp3')}
SEG = [('plaza', 0, 1.3), ('hall', 1.3, 10.2), ('room', 10.2, 26.1), ('forest', 26.1, 37.2), ('room', 37.2, 39.8), ('forest', 39.8, 42.2),
       ('shop', 42.2, 54.5), ('forest', 54.5, 58.9), ('room', 58.9, 61.5)]
GAIN = {'hall': 1.0, 'room': 1.6, 'forest': 0.8, 'shop': 1.6, 'plaza': 0.7}
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.35 * SR); off = {}
for name, a, b in SEG:
    if not name: continue
    i0, i1 = max(0, int(a * SR) - X // 2), min(len(out), int(b * SR) + X // 2); n = i1 - i0
    s = SRC[name]; o = off.get(name, int(2 * SR)); seg = np.resize(np.roll(s, -o, 0), (n, 2)) * GAIN[name]; off[name] = o + n
    env = np.ones(n, 'float32'); env[:X] = np.linspace(0, 1, X); env[-X:] = np.linspace(1, 0, X)
    out[i0:i1] += seg * env[:, None]
sf.write('beds.wav', out, SR); print('beds', out.shape, float(np.abs(out).max()))
