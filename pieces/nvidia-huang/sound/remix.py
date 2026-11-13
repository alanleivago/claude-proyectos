# final mix (trash-library recipe): mix.py for the music + voice stems; the SFX are rendered here from cues.json
# at a level set per cue against the voice ('rel', see make_cues.py; mix.py's bed-relative solve left the gags under a quiet
# bed far too low), through mix.py's shared room, then ridden >= 5 dB under the voice while it speaks (gaps: up to voice
# - 2 dB). Music voice -16.5 LU, beds voice -22 LU, -14 LUFS, limiter -2.2 dBFS; muxed on the silent v5 picture (video stream copied).
import soundfile as sf, pyloudnorm as pl, numpy as np, subprocess, sys, shutil, json
sys.path.insert(0, '../../../sound-layer/scripts'); import mix as MX
from scipy.ndimage import uniform_filter1d, maximum_filter1d
r0 = subprocess.run([sys.executable, '../../../sound-layer/scripts/mix.py', 'cues.json'], capture_output=True, text=True); print(r0.stdout[-200:], r0.stderr[-600:])
v, sr = sf.read('audio/stems/voice.wav'); v = v * 10 ** (2 / 20); m, _ = sf.read('audio/stems/music.wav'); r, _ = sf.read('beds.wav')
M = pl.Meter(sr); lv = M.integrated_loudness(v); N = len(v)
rms = lambda x, w: np.sqrt(uniform_filter1d((x ** 2).mean(1) if x.ndim > 1 else x ** 2, max(1, int(w * sr))) + 1e-12)
ve = rms(v, 0.3); vmed = np.median(ve[ve > np.percentile(ve, 40)])
# ---- SFX: each cue at vmed + rel (its loudest 50 ms), panned, one shared room
C = json.load(open('cues.json')); kit = MX.Kit(C['kit']); s = np.zeros((N, 2)); fr = np.zeros((N, 2)); rep = []
for c in C['cues']:
    c['time'] = c['t']; x, used = MX.build_event(c, kit); al = c.get('align', 'peak')
    ex = 20 * np.log10(rms(x, 0.01)); p = int(np.argmax(ex >= ex.max() - 6))   # 'peak' = its arrival (first 10 ms within 6 dB of the loudest), real-sfx rule
    st = int(round((c['t'] - (p / sr if al == 'peak' else 0.0)) * sr)); a0, a1 = max(0, st), min(N, st + len(x))
    if a1 <= a0: continue
    g = vmed * 10 ** (c['rel'] / 20) / rms(x, 0.05).max(); g = min(g, 10 ** (-3 / 20) / (np.abs(x).max() + 1e-9))
    if c.get('free'):   # rev 4: a finished clip after the voice (the meme explosion): loudness set against the voice ('lu'), no rider, no room
        g = 10 ** ((lv + c.get('lu', -1.0) - M.integrated_loudness(np.pad(x, (0, max(0, int(0.5 * sr) - len(x)))))) / 20)
        y = x[a0 - st:a1 - st] * g; fr[a0:a1] += y[:, None] * np.sqrt(0.5); rep.append((c['id'], c['t'], c['what'], round(20 * np.log10(g), 1))); continue
    th = (np.clip(c.get('pan', 0.0), -0.6, 0.6) + 1) * np.pi / 4; y = x[a0 - st:a1 - st] * g
    s[a0:a1, 0] += y * np.cos(th); s[a0:a1, 1] += y * np.sin(th); rep.append((c['id'], c['t'], c['what'], round(20 * np.log10(g), 1)))
rm = C.get('room', {}); s = MX.room(s, float(rm.get('decay_s', 0.45)), float(rm.get('wet_db', -18)))
sf.write('audio/stems/sfx_dry.wav', s, sr)
m = m * 10 ** (((lv - 16.5) - M.integrated_loudness(m)) / 20)   # earshot: 20 LU read absent; 18 LU still 'heard in 58 %' -> 16.5 LU
se = rms(s, 0.05)
tgt = np.where(ve > vmed * 0.25, ve * 10 ** (-5.0 / 20), vmed * 10 ** (-2 / 20))   # >= 5 dB under the voice; in the gaps up to the voice level - 2 dB
g = np.minimum(1, tgt / se)
g = -maximum_filter1d(-g, int(0.06 * sr)); g = uniform_filter1d(g, int(0.04 * sr))
s = s * g[:, None] + fr; sf.write('audio/stems/sfx.wav', s, sr)
r = r * 10 ** (((lv - 22) - M.integrated_loudness(r)) / 20)
sf.write('audio/stems/voice_mix.wav', v, sr); sf.write('audio/stems/music_mix.wav', m, sr); sf.write('audio/stems/beds_mix.wav', r, sr)
n = min(len(v), len(m), len(s), len(r)); mix = v[:n] + m[:n] + s[:n] + r[:n]
G = 10 ** ((-14 - M.integrated_loudness(mix)) / 20); mix *= G
thr = 10 ** (-2.2 / 20); env = np.abs(mix).max(1); g = np.minimum(1, thr / np.maximum(env, 1e-9)); la = int(0.005 * sr)
gl = np.repeat(np.minimum.reduceat(g, np.arange(0, len(g), la)), la)[:len(g)]; gl = np.minimum(gl, np.concatenate([gl[la:], np.ones(la)]))
a = np.exp(-1 / (0.005 * sr)); rl = np.exp(-1 / (0.08 * sr)); cc = 1.0; out = np.empty_like(gl)
for i, x in enumerate(gl): cc = a * cc + (1 - a) * x if x < cc else rl * cc + (1 - rl) * x; out[i] = cc
mix = np.clip(mix * out[:, None], -0.8, 0.8); sf.write('audio/final_mix.wav', mix, sr)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '../renders/nvidia-huang_silent_v5.mp4', '-i', 'audio/final_mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '../renders/nvidia-huang.mp4'], check=True)
shutil.copy('../renders/nvidia-huang.mp4', '../renders/final.mp4')
json.dump(rep, open('audio/sfx-gains.json', 'w'), indent=0)
print('mix', round(M.integrated_loudness(mix), 2), 'LUFS; voice', round(lv, 1), 'music', round(M.integrated_loudness(m[:n]), 1), 'beds', round(M.integrated_loudness(r[:n]), 1), 'sfx', round(M.integrated_loudness(s[:n]), 1), 'master gain', round(20 * np.log10(G), 1), 'cues', len(rep))
