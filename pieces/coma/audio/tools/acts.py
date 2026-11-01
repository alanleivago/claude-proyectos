"""Per-act 100 ms RMS (median / p90, dBFS) of the master and each stem."""
import sys, numpy as np, soundfile as sf
ACTS = [(0, 16), (16, 36), (36, 56.6), (56.6, 57), (57, 64), (64, 75)]
files = {'master': 'out/audio/soundtrack.wav', 'music': 'out/audio/stems/music.wav', 'sfx': 'out/audio/stems/sfx.wav', 'amb': 'out/audio/stems/amb.wav'}
res = {}
for k, f in files.items():
    x, sr = sf.read(f, always_2d=True); x = x.mean(1); h = int(sr * 0.1)
    n = len(x) // h; r = 20 * np.log10(np.sqrt((x[:n * h].reshape(n, h) ** 2).mean(1)) + 1e-9)
    t = np.arange(n) * 0.1 + 0.05
    res[k] = [(np.median(r[(t >= a) & (t < b)]), np.percentile(r[(t >= a) & (t < b)], 90)) for a, b in ACTS]
print('act            ' + ''.join(f'{k:>16}' for k in files))
for i, (a, b) in enumerate(ACTS):
    print(f'{a:5.2f}-{b:5.2f}    ' + ''.join(f'  {res[k][i][0]:6.1f}/{res[k][i][1]:6.1f}' for k in files))
m = res['master']
print(f"p90 gift - p90 peak: {m[4][1] - m[2][1]:+.1f} dB (need >= +1)")
print(f"median gift - median goodbye: {m[4][0] - m[5][0]:+.1f} dB (need >= 6)")
# sfx+amb vs music per 1 s, to find empty stretches / too-loud spots
x = {k: sf.read(files[k], always_2d=True)[0].mean(1) for k in ('music', 'sfx', 'amb')}
sr = 48000
for s in range(75):
    seg = lambda k: 20 * np.log10(np.sqrt((x[k][s * sr:(s + 1) * sr] ** 2).mean()) + 1e-9)
    if len(sys.argv) > 1:
        print(f'{s:2d}s music {seg("music"):6.1f} sfx {seg("sfx"):6.1f} amb {seg("amb"):6.1f}')
