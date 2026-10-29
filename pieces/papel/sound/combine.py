# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""combine.py: audio/bed.wav = recorded bed + synth layer, a hard silence 61.5-62.0 s before the universe.
Order: synth.py, gen.py, bed.py layers.json audio/bed-rec.wav, combine.py, mix.py audio/cues.json, post.py."""
import soundfile as sf, numpy as np
a, sr = sf.read('audio/bed-rec.wav'); b, _ = sf.read('audio/synth.wav'); n = min(len(a), len(b)); m = a[:n] + b[:n]
m[int(61.5 * sr):int(62.0 * sr)] = 0
# the wall goes straight into the bed, well above everything else (the mixer then sets the loudness)
h, _ = sf.read('audio/own/hero.wav'); boom, _ = sf.read('lib/x-impdeep.wav'); a0 = int(62.0 * sr)
for y, gdb, L in [(h, 0.0, 3.0), (boom, -3.0, 2.2)]:
    y = y if y.ndim == 1 else y.mean(1); y = y[: min(n - a0, int(L * sr))].copy(); f = int(0.2 * sr); y[-f:] *= np.linspace(1, 0, f); y = y / np.abs(y).max() * 10 ** (gdb / 20) * np.abs(m).max() * 2.0; m[a0:a0 + len(y)] += y[:, None]
tt = np.arange(n) / sr; m = (m.T * 10 ** (np.interp(tt, [0, 69.0, 69.6, 70], [0, 0, -12, -12]) / 20)).T
sf.write('audio/bed.wav', m.astype(np.float32), sr, subtype='FLOAT'); print('bed.wav ok')
