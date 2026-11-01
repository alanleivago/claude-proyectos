"""Ambience beds per set (auction hall murmur, countryside, old auction room, warehouse floor, greenhouse morning, cafe; the map has none); 0.35 s crossfades."""
import numpy as np, soundfile as sf, subprocess, io
SR, DUR = 48000, 61.5
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
SRC = {'hall': load('fs/hall_bed_480717.mp3'), 'country': load('fs/country_bed_466073.mp3'), 'room': load('fs/auctionroom_bed_457286.mp3'), 'ware': load('fs/warehouse_bed_240895.mp3'),
       'green': load('fs/greenhouse_bed_700637.mp3'), 'cafe': load('fs/cafe_bed_524483.mp3')}
SEG = [('hall', 0, 4.42), ('country', 4.42, 8.20), ('hall', 8.20, 35.04), ('room', 35.04, 37.16), ('hall', 37.16, 46.68), ('ware', 46.68, 51.08), ('green', 51.08, 52.98),
       (None, 52.98, 55.66), ('cafe', 55.66, 57.32), ('hall', 57.32, 61.5)]
GAIN = {'hall': 1.0, 'country': 1.2, 'room': 0.9, 'ware': 1.2, 'green': 1.3, 'cafe': 1.1}
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.35 * SR); off = {}
for name, a, b in SEG:
    if not name: continue
    i0, i1 = max(0, int(a * SR) - X // 2), min(len(out), int(b * SR) + X // 2); n = i1 - i0
    s = SRC[name]; o = off.get(name, int(2 * SR)); seg = np.resize(np.roll(s, -o, 0), (n, 2)) * GAIN[name]; off[name] = o + n
    env = np.ones(n, 'float32'); env[:X] = np.linspace(0, 1, X); env[-X:] = np.linspace(1, 0, X)
    out[i0:i1] += seg * env[:, None]
sf.write('beds.wav', out, SR); print('beds', out.shape, float(np.abs(out).max()))
