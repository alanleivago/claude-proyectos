# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""combine.py: audio/bed.wav = recorded bed + synth layer, a hard silence 59.0-60.18 s; the bed 7 dB down after the hit's
first punch. Order: synth.py, gen.py, bed.py layers.json audio/bed-rec.wav, combine.py, mix.py audio/cues.json, post.py."""
import soundfile as sf, numpy as np
a, sr = sf.read('audio/bed-rec.wav'); b, _ = sf.read('audio/synth.wav'); n = min(len(a), len(b)); m = a[:n] + b[:n]
tt = np.arange(n) / sr; m[int(59.0 * sr):int(60.18 * sr)] = 0
m = (m.T * 10 ** ((np.interp(tt, [0, 60.65, 61.2, 70], [0, 0, -7, -7]) + np.interp(tt, [0, 45, 45.6, 52, 53, 70], [0, 0, -3, -3, 0, 0])) / 20)).T
sf.write('audio/bed.wav', m.astype(np.float32), sr, subtype='FLOAT'); print('bed.wav ok')
