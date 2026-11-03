"""Ambience beds per set (street: city + far tram; reading room: quiet library room tone; canal shots: water lapping
over the street); 0.35 s crossfades."""
import numpy as np, soundfile as sf, subprocess, io
SR, DUR = 48000, 61.7
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
SRC = {'street': load('fs/street_bed_440203.mp3'), 'lib': load('fs/library_bed_406497.mp3'), 'canal': load('fs/canal_bed_692542.mp3')}
SEG = [('street', 0, 1.88), ('lib', 1.88, 38.75), ('street', 38.75, 47.0), ('canal', 38.75, 47.0), ('lib', 47.0, DUR)]
GAIN = {'street': 1.0, 'lib': 1.3, 'canal': 0.7}
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.35 * SR); off = {}
for name, a, b in SEG:
    i0, i1 = max(0, int(a * SR) - X // 2), min(len(out), int(b * SR) + X // 2); n = i1 - i0
    s = SRC[name]; o = off.get(name, int(2 * SR)); seg = np.resize(np.roll(s, -o, 0), (n, 2)) * GAIN[name]; off[name] = o + n
    env = np.ones(n, 'float32'); env[:X] = np.linspace(0, 1, X); env[-X:] = np.linspace(1, 0, X)
    out[i0:i1] += seg * env[:, None]
sf.write('beds.wav', out, SR); print('beds', out.shape, float(np.abs(out).max()))
