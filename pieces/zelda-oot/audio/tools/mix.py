# full mix for previews (and the master): bed = music (gm dB) + sfx (gs dB), sidechain-ducked under the voice (-duck dB,
# 120 ms attack / 600 ms release), + voice; master to -14 LUFS with a true-peak ceiling of -1.2 dBTP (4x oversampled limiter).
# prints voice-over-bed in speech (target ~3.7 dB like the Odyssey parts). usage: mix.py gm gs duck [out.wav] [--clips]
import sys, json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly
from scipy.ndimage import maximum_filter1d
gm, gs, duck = float(sys.argv[1]), float(sys.argv[2]), float(sys.argv[3]); out = sys.argv[4] if len(sys.argv) > 4 and not sys.argv[4].startswith('--') else 'audio/mix_master.wav'
SR = 48000; M = pyln.Meter(SR)
v, _ = sf.read('voice/voice.wav', dtype='float32'); v = np.stack([v, v], 1) if v.ndim == 1 else v
m, _ = sf.read('audio/track.wav', dtype='float32'); s, _ = sf.read('audio/sfx_pro.wav', dtype='float32')
n = len(v); m = np.pad(m, ((0, max(0, n - len(m))), (0, 0)))[:n]; s = np.pad(s, ((0, max(0, n - len(s))), (0, 0)))[:n]
bed = m * 10 ** (gm / 20) + s * 10 ** (gs / 20)
hop = 480; env = np.sqrt(np.convolve((v ** 2).mean(1), np.ones(hop) / hop, 'same')[::hop]); on = (20 * np.log10(env + 1e-9) > -40).astype(float)
g = np.ones_like(on); a, r = np.exp(-1 / 12), np.exp(-1 / 60); tgt = 10 ** (-duck / 20)
for i in range(1, len(on)): want = tgt if on[i] else 1.0; g[i] = g[i - 1] * (a if want < g[i - 1] else r) + want * (1 - (a if want < g[i - 1] else r))
bed *= np.interp(np.arange(n), np.arange(len(g)) * hop, g)[:, None].astype(np.float32)
mask = np.zeros(n, bool)
for L in json.load(open('voice.json'))['lines']: mask[int(L['t0'] * SR):int(L['t1'] * SR)] = True
print(f'voice over bed in speech: {M.integrated_loudness(v[mask]) - M.integrated_loudness(bed[mask]):.1f} dB')
x = v + bed; x *= 10 ** ((-14 - M.integrated_loudness(x)) / 20)
# tame any 3 s stretch more than 3 LU above the integrated level (slow, smoothed gain; keeps the body as it is)
st = np.array([M.integrated_loudness(x[i:i + 3 * SR]) if np.abs(x[i:i + 3 * SR]).max() > 1e-4 else -70 for i in range(0, len(x) - 3 * SR, SR // 2)])
red = np.clip(st - (-14 + 3.0), 0, None); red = np.convolve(np.maximum.accumulate(red[::-1])[::-1] * 0 + red, np.ones(5) / 5, 'same')
gt = 10 ** (-np.interp(np.arange(len(x)), np.arange(len(red)) * (SR // 2) + 1.5 * SR, red) / 20); x = x * gt[:, None]; x *= 10 ** ((-14 - M.integrated_loudness(x)) / 20)
up = resample_poly(x, 4, 1, axis=0); pk = maximum_filter1d(np.abs(up).max(1), 4 * 48 * 3); c = 10 ** (-1.2 / 20)
gl = np.minimum(1, c / np.maximum(pk, 1e-9)); gl = np.minimum.reduceat(gl, np.arange(0, len(gl), 4))[:len(x)]
gs_ = gl.copy()
for i in range(1, len(gs_)): gs_[i] = min(gl[i], gs_[i - 1] + (1 - gs_[i - 1]) * (1 - np.exp(-1 / (0.08 * SR))))
x = x * gs_[:, None]
up = resample_poly(x, 4, 1, axis=0); print('master', round(M.integrated_loudness(x), 2), 'LUFS, true peak', round(20 * np.log10(np.abs(up).max()), 2), 'dBTP')
sf.write(out, x, SR, subtype='PCM_24'); print(out)
