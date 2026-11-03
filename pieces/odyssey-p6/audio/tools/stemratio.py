# voice over the bed in speech, on the export stems (renders/stem-voice.wav vs stem-music + stem-sfx), as measured for p3/p4
import json, sys, numpy as np, soundfile as sf, pyloudnorm as pyln, os
R = sys.argv[1] if len(sys.argv) > 1 else 'renders'
v, sr = sf.read(os.path.join(R, 'stem-voice.wav'), dtype='float32'); m, _ = sf.read(os.path.join(R, 'stem-music.wav'), dtype='float32'); s, _ = sf.read(os.path.join(R, 'stem-sfx.wav'), dtype='float32')
n = min(len(v), len(m), len(s)); v = v if v.ndim == 2 else np.stack([v, v], 1); b = m[:n] + s[:n]; mask = np.zeros(n, bool)
for L in json.load(open(os.path.join(R, '..', 'voice.json')))['lines']: mask[int(L['t0'] * sr):int(L['t1'] * sr)] = True
M = pyln.Meter(sr); lv, lb = M.integrated_loudness(v[:n][mask]), M.integrated_loudness(b[mask]); print(f'voice {lv:.1f} bed {lb:.1f} -> {lv - lb:.1f} dB')
