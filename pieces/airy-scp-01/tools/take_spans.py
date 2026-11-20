"""speech span of every take in voz/ (20 ms RMS above max(-45 dBFS, peak - 30 dB)) -> work/take_durs.json {take: [on, off, len]}"""
import glob, json, os
import numpy as np, soundfile as sf
out = {}
for f in sorted(glob.glob('voz/*.wav')):
    a, sr = sf.read(f, always_2d=True); a = a.mean(1); w = int(sr * 0.02); h = w // 2
    e = 20 * np.log10(np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) + 1e-9 for i in range(0, len(a) - w, h)]))
    idx = np.where(e > max(-45, e.max() - 30))[0]
    out[os.path.basename(f)[:-4]] = (round(idx[0] * h / sr, 2), round((idx[-1] * h + w) / sr, 2), round(len(a) / sr, 2))
json.dump(out, open('work/take_durs.json', 'w'), indent=1); print(len(out), 'takes')
