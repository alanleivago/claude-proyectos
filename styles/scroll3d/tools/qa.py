"""Pre-delivery checks for a scroll3d piece (run before sending any video):
   python qa.py <piece dir>
   1. FLICKER: frames whose brightness jumps away from BOTH neighbours (a one-frame flash / white field).
   2. VOICE: every spoken run ends with a natural fall (>= 40 ms from -30 to -60 dB), no stray blips (< 120 ms bursts
      in silence), and the pauses are quiet (median <= -60 dB).
   3. MIX NOISE: windows where the music+sfx bed (audio-score.wav) is broadband noise under the voice (high spectral
      flatness for >= 1 s) — the 'ruido de fondo' the user hears."""
import sys, os, glob, numpy as np, soundfile as sf
from PIL import Image
P = sys.argv[1]; bad = 0
fr = sorted(glob.glob(os.path.join(P, 'frames', 'f*.png')))
lum = np.array([np.asarray(Image.open(f).convert('L').resize((90, 160)), dtype=np.float32)[20:130].mean() for f in fr])
d1, d2 = lum[1:-1] - lum[:-2], lum[1:-1] - lum[2:]
flash = [i + 1 for i in range(len(d1)) if (d1[i] > 6 and d2[i] > 6) or (d1[i] < -6 and d2[i] < -6)]
print(f'FLICKER: {len(fr)} frames, {len(flash)} one-frame flashes', flash[:20]); bad += len(flash) > 0
x, sr = sf.read(os.path.join(P, 'voice', 'voice.wav')); n = sr // 100; db = 20 * np.log10(np.sqrt((x[:len(x) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
runs, inn = [], False
for i, v in enumerate(db):
    if v > -45 and not inn: inn, st = True, i
    if v < -65 and inn: inn = False; runs.append((st, i))
clipped = [round(b / 100, 2) for a, b in runs if (b - next((k for k in range(b - 1, a, -1) if db[k] > -30), b)) < 4]
blips = [round(a / 100, 2) for a, b in runs if b - a < 12]
quiet = float(np.median(db[db < -45])) if (db < -45).any() else -99
print(f'VOICE: {len(runs)} runs, clipped ends {clipped}, blips {blips}, pause median {quiet:.0f} dB'); bad += bool(clipped) + bool(blips) + (quiet > -60)
s, sr2 = sf.read(os.path.join(P, 'renders', 'audio-score.wav'), always_2d=True); m = s.mean(1); w = sr2 // 4
flat = []
for k in range(len(m) // w):
    seg = m[k * w:(k + 1) * w]; sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) + 1e-9; lvl = 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9)
    flat.append((np.exp(np.log(sp).mean()) / sp.mean(), lvl))
noisy = [k / 4 for k in range(len(flat) - 3) if all(f > 0.35 and l > -40 for f, l in flat[k:k + 4])]
print(f'MIX NOISE: broadband stretches >= 1 s at {sorted(set(round(t) for t in noisy))[:20]} s'); bad += bool(noisy)
print('QA:', 'PASS' if not bad else f'FAIL ({bad})')
