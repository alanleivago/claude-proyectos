# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""combine.py: audio/bed.wav = recorded bed + synth layer, hard silence 60.0-60.78 s, the bed 7 dB down after the impact's
first punch so the impact is the loudest moment. Order: synth.py, gen.py, bed.py layers.json audio/bed-rec.wav, combine.py,
mix.py audio/cues.json, post.py."""
import soundfile as sf, numpy as np
a, sr = sf.read('audio/bed-rec.wav'); b, _ = sf.read('audio/synth.wav'); n = min(len(a), len(b)); m = a[:n] + b[:n]
tt = np.arange(n) / sr; m[int(60.0 * sr):int(60.78 * sr)] = 0
m = (m.T * 10 ** ((np.interp(tt, [0, 61.25, 61.8, 70], [0, 0, -7, -7]) + np.interp(tt, [0, 30.6, 31.2, 41.5, 42.5, 70], [0, 0, -3.5, -3.5, 0, 0])) / 20)).T   # the quake peak sits under the impact
sf.write('audio/bed.wav', m.astype(np.float32), sr, subtype='FLOAT'); print('bed.wav ok')
