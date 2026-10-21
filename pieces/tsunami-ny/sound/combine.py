# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""combine.py: audio/bed.wav = recorded bed + synth layer, with a hard silence 62.0-62.78 s before the impact.
Order: synth.py, gen.py, bed.py layers.json audio/bed-rec.wav, combine.py, mix.py audio/cues.json."""
import soundfile as sf, numpy as np
a, sr = sf.read('audio/bed-rec.wav'); b, _ = sf.read('audio/synth.wav'); n = min(len(a), len(b)); m = a[:n] + b[:n]
m[int(62.0 * sr):int(62.78 * sr)] = 0
sf.write('audio/bed.wav', m.astype(np.float32), sr, subtype='FLOAT'); print('bed.wav ok')
