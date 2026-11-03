"""Ambience beds per set (alley: Tokyo street at night; restaurant: chatter + cutlery; care home: quiet room + clock); 0.35 s crossfades."""
import numpy as np, soundfile as sf, subprocess, io, glob
SR, DUR = 48000, 61.0
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
first = lambda k: sorted(glob.glob(f'fs/{k}_*.mp3'))[0]
SRC = {'alley': load('fs/alley_bed_364825.mp3'), 'rest': load('fs/rest_bed_474740.mp3'), 'care': load('fs/care_bed_501007.mp3')}
import os
ALT = os.environ.get('ALT') == '1'
SEG = [('alley', 0, 1.94), ('rest', 1.94, 23.36), ('alley', 23.36, 26.86), ('rest', 26.86, 28.82), ('care', 28.82, 37.64), ('rest', 37.64, 57.94 if ALT else DUR)] + ([('alley', 57.94, DUR)] if ALT else [])
GAIN = {'alley': 1.0, 'rest': 1.0, 'care': 1.2}
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.35 * SR); off = {}
for name, a, b in SEG:
    i0, i1 = max(0, int(a * SR) - X // 2), min(len(out), int(b * SR) + X // 2); n = i1 - i0
    s = SRC[name]; o = off.get(name, int(2 * SR)); seg = np.resize(np.roll(s, -o, 0), (n, 2)) * GAIN[name]; off[name] = o + n
    env = np.ones(n, 'float32'); env[:X] = np.linspace(0, 1, X); env[-X:] = np.linspace(1, 0, X)
    out[i0:i1] += seg * env[:, None]
out[-1:] = 0; sf.write('beds_boom.wav' if ALT else 'beds.wav', out, SR); print('beds', out.shape, float(np.abs(out).max()))
