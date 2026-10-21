# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""combine.py: audio/bed.wav = recorded bed + synth layer, a hard silence 62.6-63.28 s before the roar.
Order: synth.py, gen.py, bed.py layers.json audio/bed-rec.wav, combine.py, mix.py audio/cues.json, post.py."""
import soundfile as sf, numpy as np
a, sr = sf.read('audio/bed-rec.wav'); b, _ = sf.read('audio/synth.wav'); n = min(len(a), len(b)); m = a[:n] + b[:n]
m[int(62.6 * sr):int(63.28 * sr)] = 0
# the roar goes straight into the bed, well above everything else (the mixer then sets the loudness)
r, _ = sf.read('audio/own/roar.wav'); sub, _ = sf.read('audio/own/hero-sub.wav'); a0 = int(63.28 * sr)
for y, gdb in [(r, 0.0), (sub, -4.0)]:
    y = y if y.ndim == 1 else y.mean(1); y = y[: min(n - a0, int(1.25 * sr))].copy(); f = int(0.12 * sr); y[-f:] *= np.linspace(1, 0, f); y = y * 10 ** (gdb / 20) * np.abs(m).max() * 3.0; m[a0:a0 + len(y)] += y[:, None]
tt = np.arange(n) / sr; m = (m.T * 10 ** (np.interp(tt, [0, 64.5, 64.9, 70], [0, 0, -14, -14]) / 20)).T
sf.write('audio/bed.wav', m.astype(np.float32), sr, subtype='FLOAT'); print('bed.wav ok')
