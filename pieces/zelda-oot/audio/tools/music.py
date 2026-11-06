# The music bed from the user's Zelda mix: one track per chapter (mood map below), each entering on its chapter card,
# trimmed or beat-loop-extended to the chapter, outgoing tracks fade over 2.5 s from a beat near the seam (equal power),
# a slow leveler (3 s RMS, +-5 dB) evens out quiet/loud tracks, bed at -18 LUFS, last 6 s fade out. -> audio/track.wav
# usage (from pieces/zelda-oot, earshot venv for pyloudnorm): python audio/tools/music.py
import json, re, subprocess, io, numpy as np, soundfile as sf, librosa, pyloudnorm
SR = 48000; SRC = 'audio/src/zelda_mix.wav'
def ts(s): p = [int(v) for v in s.split(':')]; return p[0] * 3600 + p[1] * 60 + p[2] if len(p) == 3 else p[0] * 60 + p[1]
TL = [(ts(m[0]), m[1].strip()) for m in re.findall(r'(\d\d:\d\d(?::\d\d)?) ➔ (.+)', open('audio/src/description.txt').read())]
TL = [(t, (TL[k + 1][0] if k + 1 < len(TL) else 4757), n) for k, (t, n) in enumerate(TL)]
TRK = {n: (a, b) for a, b, n in TL}
V = json.load(open('voice.json')); DUR = V['duration']
S = {x['id']: x['t0'] for x in json.load(open('board/times.json'))}
MAP = [  # (panel where the chapter starts, track, why)
  ('p001', "Zelda's Lullaby - Ocarina of Time", 'cold open: the theme everyone knows'),
  ('p005', 'Message from the Goddess - Skyward Sword', 'prologue: the goddesses, solemn'),
  ('p012', "Ilia's Theme - Twilight Princess", 'I forest: pastoral, gentle'),
  ('p024', "Midna's Lament - Twilight Princess", 'II Ganondorf: tragic, melancholic'),
  ('p030', "Zelda's Lullaby - Skyward Sword", 'III garden: Zelda, tender'),
  ('p034', 'Link Will Save Us - Twilight Princess', 'IV stones: hopeful journey'),
  ('p044', "Impa's Fate - Skyward Sword", 'V betrayal: dark, dramatic'),
  ('p050', 'The Hero of Time - Music Box', 'VI seven years: the sleeping hero'),
  ('p056', 'Save Ilia - Twilight Princess', 'VII temples: sad resolve'),
  ('p062', "Fi's Farewell - Skyward Sword", 'VIII Sheik: emotional reveal'),
  ('p071', 'Gate of Time - Skyward Sword', 'IX tower: building tension'),
  ('p078', 'End Credits - Ocarina of Time', 'X beyond time: swelling ending, sign-off'),
]
x, _ = sf.read(io.BytesIO(subprocess.run(['ffmpeg', '-v', 'error', '-i', SRC, '-ar', str(SR), '-ac', '2', '-f', 'wav', '-'], capture_output=True, check=True).stdout), dtype='float32')
def region(name): a, b = TRK[name]; return x[int((a + 0.3) * SR): int((b - 0.8) * SR)]
def beats(y): m = librosa.resample(y.mean(1), orig_sr=SR, target_sr=22050); _, b = librosa.beat.beat_track(y=m, sr=22050, units='time'); return b, m
def extend(y, need):   # loop at a beat-matched point (feature distance), equal-power crossfade, until long enough
    L = len(y) / SR
    if L >= need: return y
    b, m = beats(y); feat = np.vstack([librosa.feature.chroma_cqt(y=m, sr=22050), librosa.feature.mfcc(y=m, sr=22050, n_mfcc=13) / 50]); fps = 22050 / 512
    ctx = lambda t: feat[:, max(0, int(t * fps) - int(3 * fps)):int(t * fps)].mean(1)
    Es = [t for t in b if L * 0.6 < t < L - 3]; Ss = [t for t in b if 6 < t < L * 0.5]
    best = min(((np.linalg.norm(ctx(E) - ctx(S2)), E, S2) for E in Es for S2 in Ss if E - S2 > 20), default=None)
    E, S2 = (best[1], best[2]) if best else (L - 1, 6.0)
    k = int(1.5 * SR); out = y[:int(E * SR) + k // 2].copy(); seg = y[int(S2 * SR) - k // 2:int(E * SR) + k // 2]
    w = np.sin(np.linspace(0, np.pi / 2, k))[:, None]
    while len(out) / SR < need:
        out[-k:] = out[-k:] * w[::-1] + seg[:k] * w; out = np.concatenate([out, seg[k:]])
    print(f'  loop {S2:.1f}-{E:.1f} s (d={best[0] if best else -1:.2f})'); return out
meter = pyloudnorm.Meter(SR); N = int((DUR + 1) * SR); bed = np.zeros((N, 2), np.float32); XF = 2.5
starts = [S[p] for p, _, _ in MAP] + [DUR]
for k, (p, name, why) in enumerate(MAP):
    t0, t1 = starts[k] - (0.3 if k else 0), starts[k + 1]
    y = region(name); y = y * 10 ** ((-20 - meter.integrated_loudness(y)) / 20)   # each track to -20 LUFS before the leveler
    need = t1 - t0 + XF + 0.5; y = extend(y, need)[:int(need * SR)].copy()
    if k + 1 < len(MAP):   # fade out from the beat nearest the seam
        b, _ = beats(y[:int((t1 - t0 + 2) * SR)]); fb = [t for t in b if t1 - t0 - 2.0 < t < t1 - t0 + 0.5]; f0 = fb[-1] if fb else t1 - t0 - 1.0
        n0, n1 = int(f0 * SR), int((f0 + XF) * SR); y[n0:n1] *= np.cos(np.linspace(0, np.pi / 2, n1 - n0))[:, None]; y[n1:] = 0
    if k: n = int(1.2 * SR); y[:n] *= np.sin(np.linspace(0, np.pi / 2, n))[:, None]
    a = int(t0 * SR); y = y[:N - a]; bed[a:a + len(y)] += y
    print(f'{p} {t0:7.1f}-{t1:7.1f}  {name}  ({why})', flush=True)
# slow leveler
hop = SR // 10; r = np.sqrt(np.convolve((bed ** 2).mean(1), np.ones(3 * SR) / (3 * SR), 'same')[::hop] + 1e-10); tgt = np.median(r[r > 1e-4])
g = np.clip(tgt / np.maximum(r, 1e-6), 10 ** (-5 / 20), 10 ** (5 / 20)); g = np.convolve(g, np.ones(20) / 20, 'same'); bed *= np.interp(np.arange(N), np.arange(len(g)) * hop, g)[:, None].astype(np.float32)
bed *= 10 ** ((-18 - meter.integrated_loudness(bed)) / 20); f = int(6 * SR); bed[-f:] *= np.linspace(1, 0, f)[:, None]
sf.write('audio/track.wav', bed, SR, subtype='FLOAT'); print('track.wav', round(N / SR, 1), 's  peak', round(float(np.abs(bed).max()), 2))
