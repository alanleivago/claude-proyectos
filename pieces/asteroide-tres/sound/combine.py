# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""combine.py: audio/bed.wav = recorded bed + synth layer, hard silence 56.6-57.28 s, the bed 8 dB down after the blast's
first punch (57.75-58.3) so the impact is the loudest moment; also audio/own/hero-boom.wav = the kit boom with its
rolling-thunder tail shortened. Order: synth.py, gen.py, bed.py layers.json audio/bed-rec.wav, combine.py, mix.py."""
import soundfile as sf, numpy as np
x, sr = sf.read('../../../sound-layer/kit/boom/fs-320782-huge-explosion-thunder-explo-3.wav'); m = np.abs(x if x.ndim == 1 else x.mean(1)); pk = int(np.argmax(m))
t = np.arange(len(x)) / sr - pk / sr; g = np.where(t < 0.45, 1, np.exp(-(t - 0.45) / 0.55)); y = (x.T * g).T if x.ndim > 1 else x * g
sf.write('audio/own/hero-boom.wav', y.astype(np.float32), sr)
a, sr = sf.read('audio/bed-rec.wav'); b, _ = sf.read('audio/synth.wav'); n = min(len(a), len(b)); m = a[:n] + b[:n]
tt = np.arange(n) / sr; m[int(56.6 * sr):int(57.28 * sr)] = 0
m = (m.T * 10 ** (np.interp(tt, [0, 57.75, 58.3, 70], [0, 0, -6, -6]) / 20)).T
sf.write('audio/bed.wav', m.astype(np.float32), sr, subtype='FLOAT'); print('bed.wav ok')
