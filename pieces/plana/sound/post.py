# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""post.py: the planned silence before the impact made absolute on the master (reverb tails and pre-rolls removed):
audio/mix.wav zeroed 58.8-59.4 s with 10 ms fades. Run after mix.py."""
import soundfile as sf, numpy as np
x, sr = sf.read('audio/mix.wav'); a, b, f = int(58.8 * sr), int(59.4 * sr), int(0.01 * sr)
x[a - f:a] *= np.linspace(1, 0, f)[:, None]; x[a:b] = 0; x[b:b + f] *= np.linspace(0, 1, f)[:, None]
sf.write('audio/mix.wav', x.astype(np.float32), sr, subtype='FLOAT'); print('mix.wav gated')
