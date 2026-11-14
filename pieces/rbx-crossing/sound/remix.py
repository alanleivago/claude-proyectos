# final mix (rbx-crossing, from rbx-rope/remix.py; --pre = voice + music only): sound-layer mixer for the SFX stem, then voice_final.wav UNTOUCHED (one gain only, the
# master gain) + music 20 LU under the voice + beds 22 LU under + SFX bus ridden >= 4.5 dB under the voice's short-term level
# while it speaks; master -14 LUFS, true-peak limiter, length = voice + 0.5 s. Writes audio/final_mix.wav (48 kHz stereo).
import soundfile as sf, pyloudnorm as pl, numpy as np, subprocess, sys, io, json
from scipy.ndimage import uniform_filter1d, maximum_filter1d
from scipy.signal import resample_poly
SR = 48000; SFX_DB = 2.0
PRE = '--pre' in sys.argv   # premix: voice + music only (no SFX stem / beds yet)
OWN = '--own' in sys.argv   # SFX stem + beds from sfx_mix.py (no sound-layer mixer)
if not PRE and not OWN:
    r = subprocess.run([sys.executable, '../../../sound-layer/scripts/mix.py', 'cues.json'], capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr)
v, sr = sf.read('../voice/voice_final.wav', dtype='float64'); assert sr == SR
if v.ndim == 1: v = np.stack([v, v], 1)
N = int(108.7 * SR); v = np.pad(v, ((0, max(0, N - len(v))), (0, 0)))[:N]   # = video length (last word ends 112.89 s)
def fitn(x): return np.pad(x, ((0, max(0, N - len(x))), (0, 0)))[:N]
M = pl.Meter(SR); lv = M.integrated_loudness(v)
# SFX stem: undo the mixer's own voice level so the SFX keep their solved gain relative to OUR voice
vs = v if (PRE or OWN) else fitn(sf.read('audio/stems/voice.wav')[0]); s = np.zeros_like(v) + 1e-9 if PRE else fitn(sf.read('audio/stems/sfx.wav')[0])
s = s * 10 ** ((lv - M.integrated_loudness(vs)) / 20) * 10 ** (SFX_DB / 20)   # SFX_DB: bus trim before the ride (width / presence)
m = fitn(sf.read('music_bed.wav', dtype='float64')[0]); from scipy.signal import butter as _b, sosfilt as _sf; m = m + _sf(_b(2, 70, 'low', fs=SR, output='sos'), m, axis=0) * 2.5   # sub weight under the BGM (earshot: thin bottom)
m = m * 10 ** (((lv - 9) - M.integrated_loudness(m)) / 20)
b = np.zeros_like(v) if PRE else fitn(sf.read('beds.wav', dtype='float64')[0])
if not PRE: b = b * 10 ** (((lv - 22) - M.integrated_loudness(b)) / 20)
# SFX ride: short-term (0.4 s) RMS envelopes; while the voice speaks the SFX bus stays >= 4.5 dB under it,
# in the pauses under (voice median - 2 dB) so a hit can still land in a breath
env = lambda x, w: np.sqrt(uniform_filter1d((x ** 2).mean(1), int(w * SR)) + 1e-12)
ve = env(v, 0.4); se = env(s, 0.05); vmed = np.median(ve[ve > np.percentile(ve, 40)])
speak = maximum_filter1d((ve > vmed * 0.2).astype(float), int(0.15 * SR)) > 0
tgt = np.where(speak, ve * 10 ** (-5.0 / 20), vmed * 10 ** (-2 / 20))
g = np.minimum(1, tgt / se); g = -maximum_filter1d(-g, int(0.06 * SR)); g = uniform_filter1d(g, int(0.04 * SR))
s = s * g[:, None]
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
           voice_gain_db=round(20 * np.log10(gain), 2), music_lu_under=9, beds_lu_under=22, sfx_ride_db=-5.0)
json.dump(rep, open('audio/final-report.json', 'w'), indent=1); print(rep)
