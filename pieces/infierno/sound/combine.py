# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""combine.py: audio/bed.wav = recorded bed + synth layer, a hard silence 57.8-58.4 s before the blaze.
Order: synth.py, gen.py, bed.py layers.json audio/bed-rec.wav, combine.py, mix.py audio/cues.json, post.py."""
import soundfile as sf, numpy as np
a, sr = sf.read('audio/bed-rec.wav'); b, _ = sf.read('audio/synth.wav'); n = min(len(a), len(b)); m = a[:n] + b[:n]
m[int(57.75 * sr):int(58.5 * sr)] = 0
# the wall goes straight into the bed, well above everything else (the mixer then sets the loudness)
h, _ = sf.read('audio/own/hero.wav'); boom, _ = sf.read('lib/impact-751345.mp3'); a0 = int(58.5 * sr)
for y, gdb, L in [(h, 0.0, 3.0), (boom, -3.0, 2.2)]:
    y = y if y.ndim == 1 else y.mean(1); y = y[: min(n - a0, int(L * sr))].copy(); f = int(0.2 * sr); y[-f:] *= np.linspace(1, 0, f); y = y / np.abs(y).max() * 10 ** (gdb / 20) * np.abs(m).max() * 2.0; m[a0:a0 + len(y)] += y[:, None]
tt = np.arange(n) / sr; m = (m.T * 10 ** (np.interp(tt, [0, 66.4, 67.0, 70], [0, 0, -10, -10]) / 20)).T
sf.write('audio/bed.wav', m.astype(np.float32), sr, subtype='FLOAT'); print('bed.wav ok')
