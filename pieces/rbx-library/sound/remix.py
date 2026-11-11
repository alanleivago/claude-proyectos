# final mix (from lego-sea/remix.py): sound-layer mixer for the SFX stem, then voice_final.wav UNTOUCHED (one gain only, the
# master gain) + music 20 LU under the voice + beds 22 LU under + SFX bus ridden >= 4.5 dB under the voice's short-term level
# while it speaks; master -14 LUFS, true-peak limiter, length = voice + 0.5 s. Writes audio/final_mix.wav (48 kHz stereo).
import soundfile as sf, pyloudnorm as pl, numpy as np, subprocess, sys, io, json
from scipy.ndimage import uniform_filter1d, maximum_filter1d
from scipy.signal import resample_poly
SR = 48000; SFX_DB = 2.0
r = subprocess.run([sys.executable, '../../../sound-layer/scripts/mix.py', 'cues.json'], capture_output=True, text=True)
if r.returncode: sys.exit(r.stderr)
v, sr = sf.read('../voice/voice_final.wav', dtype='float64'); assert sr == SR
if v.ndim == 1: v = np.stack([v, v], 1)
N = int(118.397 * SR); v = np.pad(v, ((0, max(0, N - len(v))), (0, 0)))[:N]   # = video length (last word ends 112.89 s)
def fitn(x): return np.pad(x, ((0, max(0, N - len(x))), (0, 0)))[:N]
M = pl.Meter(SR); lv = M.integrated_loudness(v)
# SFX stem: undo the mixer's own voice level so the SFX keep their solved gain relative to OUR voice
vs = fitn(sf.read('audio/stems/voice.wav')[0]); s = fitn(sf.read('audio/stems/sfx.wav')[0])
s = s * 10 ** ((lv - M.integrated_loudness(vs)) / 20) * 10 ** (SFX_DB / 20)   # SFX_DB: bus trim before the ride (width / presence)
m = fitn(sf.read('music_bed.wav', dtype='float64')[0]); from scipy.signal import butter as _b, sosfilt as _sf; m = m + _sf(_b(2, 70, 'low', fs=SR, output='sos'), m, axis=0) * 2.5   # sub weight under the BGM (earshot: thin bottom)
m = m * 10 ** (((lv - 9) - M.integrated_loudness(m)) / 20)
b = fitn(sf.read('beds.wav', dtype='float64')[0]); b = b * 10 ** (((lv - 22) - M.integrated_loudness(b)) / 20)
# Late Fee tension bed (14 LU under the voice) + the BGM dipped 4 dB under her sections (light horror, rbx-sock level)
tb = fitn(sf.read('tension.wav', dtype='float64')[0]); tb = tb * 10 ** (((lv - 14) - M.integrated_loudness(tb)) / 20)
te = uniform_filter1d(np.abs(tb).mean(1), int(0.5 * SR)); te = te / (te.max() + 1e-12); dip = 10 ** (-4 * np.clip(te * 6, 0, 1) / 20); m = m * dip[:, None]; b = b + tb
# SFX ride: short-term (0.4 s) RMS envelopes; while the voice speaks the SFX bus stays >= 4.5 dB under it,
# in the pauses under (voice median - 2 dB) so a hit can still land in a breath
env = lambda x, w: np.sqrt(uniform_filter1d((x ** 2).mean(1), int(w * SR)) + 1e-12)
ve = env(v, 0.4); se = env(s, 0.05); vmed = np.median(ve[ve > np.percentile(ve, 40)])
speak = maximum_filter1d((ve > vmed * 0.2).astype(float), int(0.15 * SR)) > 0
tgt = np.where(speak, ve * 10 ** (-5.0 / 20), vmed * 10 ** (-2 / 20))
g = np.minimum(1, tgt / se); g = -maximum_filter1d(-g, int(0.06 * SR)); g = uniform_filter1d(g, int(0.04 * SR))
s = s * g[:, None]
# the Late Fee's signature THUNK sits OUTSIDE the ride: 3 layers (floor bang, dull thud, rubber stamp) at voice level +2 LU
# (far thunks -5 LU), a little room tail, centred; it is the one sound that must cut through the narration
th = np.zeros((N, 2)); EVS = json.load(open('events.json'))
def cut(n): return sf.read(f'cuts/{n}.wav', dtype='float64')[0]
LAY = {'THUNK': (['thunkA', 'thunkB', 'thunkC'], 2.0), 'THUNK_far': (['thunkD', 'thunkB'], -5.0)}
for e in EVS:
    if e['k'] not in LAY: continue
    names, rel = LAY[e['k']]; z = sum(np.pad(cut(n), (0, 2 * SR))[:2 * SR] * w for n, w in zip(names, (1.0, 0.8, 0.6)))
    tail = np.convolve(z, np.exp(-np.arange(int(0.5 * SR)) / (0.12 * SR)) * 0.002)[:len(z)]; z = z + tail
    L1 = M.integrated_loudness(np.stack([z, z], 1)[:int(0.6 * SR)]) if np.abs(z).max() > 0 else -70
    z = z * 10 ** (((lv + rel) - L1) / 20); i0 = int((e['t'] - 0.01) * SR); n = min(len(z), N - i0)
    if n > 0: th[i0:i0 + n] += z[:n, None]
s = s + th
for name, x in (('voice', v), ('music', m), ('beds', b), ('sfx', s)): sf.write(f'audio/stems/{name}_final.wav', x.astype(np.float32), SR)
mid = (m[:, 0] + m[:, 1]) / 2; sid = (m[:, 0] - m[:, 1]) / 2 * 1.6; m = np.stack([mid + sid, mid - sid], 1)   # wider music (earshot: nearly mono)
mix = v + m + b + s; gain = 10 ** ((-14 - M.integrated_loudness(mix)) / 20)
def tp(x): return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12)
def limit(x, thr_db):   # look-ahead peak limiter (5 ms attack, 80 ms release) on the 4x oversampled peak envelope
    thr = 10 ** (thr_db / 20); pk = np.abs(resample_poly(x, 4, 1, axis=0)).max(1).reshape(-1, 4).max(1)[:len(x)]
    gg = np.minimum(1, thr / np.maximum(pk, 1e-9)); la = int(0.005 * SR)
    gl = -maximum_filter1d(-gg, 2 * la + 1, origin=0)          # min over +-5 ms: gain falls before the peak
    a = np.exp(-1 / (0.005 * SR)); rl = np.exp(-1 / (0.08 * SR)); c = 1.0; out = np.empty_like(gl)
    for i, xx in enumerate(gl): c = a * c + (1 - a) * xx if xx < c else rl * c + (1 - rl) * xx; out[i] = min(c, xx)
    return x * out[:, None]
for _ in range(4):
    out = limit(mix * gain, -1.6); L = M.integrated_loudness(out)
    if abs(L + 14) < 0.1: break
    gain *= 10 ** ((-14 - L) / 20)
fo = int(0.4 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
sf.write('audio/final_mix.wav', out.astype(np.float32), SR, subtype='PCM_24')
rep = dict(len_s=round(len(out) / SR, 4), voice_len_s=round(len(sf.read('../voice/voice_final.wav')[0]) / SR, 4), lufs=round(M.integrated_loudness(out), 2), true_peak_dbtp=round(tp(out), 2),
           voice_gain_db=round(20 * np.log10(gain), 2), music_lu_under=9, beds_lu_under=22, tension_lu_under=14, sfx_ride_db=-5.0)
json.dump(rep, open('audio/final-report.json', 'w'), indent=1); print(rep)
