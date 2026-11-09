"""music_bed.wav for rbx-chess: playful medieval = CC0 lute+flute 'Lover and His Lass' (fs 769808) for the kingdom by day;
Game Night / the Box = CC0 'Eerie Music Box' (fs 417446, -2 st, room tail) over a low drone (fs 172325) with swells on the
scary beats; from 'Now I can go anywhere' (97.2 s) the warm 'Dancing Ducks Music Box' (fs 613087). 1.2 s equal-power crossfades."""
import numpy as np, soundfile as sf, subprocess, io
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.ndimage import uniform_filter1d
SR = 48000; DUR = 105.5; N = int(DUR * SR)
def load(p, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', p] + (['-af', af] if af else []) + ['-ac', '2', '-ar', str(SR), '-f', 'wav', '-']
    return sf.read(io.BytesIO(subprocess.run(cmd, capture_output=True, check=True).stdout), dtype='float64')[0]
def rms(x): return np.sqrt(np.mean(x ** 2)) + 1e-12
def trim(x, db=-45): i = int(np.argmax(np.abs(x).max(1) > 10 ** (db / 20))); return x[max(0, i - int(0.01 * SR)):]
def level(x, w=3.0):
    e = np.sqrt(uniform_filter1d((x ** 2).mean(1), int(w * SR)) + 1e-9); g = np.clip(np.median(e) / e, 0.5, 2.0)
    return x * uniform_filter1d(g, int(0.5 * SR))[:, None]
def loopx(x, n, xf=int(2.0 * SR)):
    out = x.copy()
    while len(out) < n:
        a = np.sqrt(np.linspace(1, 0, xf))[:, None]; b = np.sqrt(np.linspace(0, 1, xf))[:, None]
        out = np.concatenate([out[:-xf], out[-xf:] * a + x[:xf] * b, x[xf:]])
    return out[:n]
lute = level(trim(load('fs/lute_769808.mp3'))); LUTE = loopx(lute, N)
box = load('fs/musicbox_417446.mp3', f'asetrate={int(SR * 2 ** (-2 / 12))},aresample={SR}')
rng = np.random.default_rng(3); t = np.arange(int(2.2 * SR)) / SR
ir = rng.standard_normal((len(t), 2)) * np.exp(-t / 0.55)[:, None]; ir = sosfilt(butter(2, 3500, 'low', fs=SR, output='sos'), ir, axis=0)
wet = np.stack([fftconvolve(box[:, c], ir[:, c])[:len(box)] for c in (0, 1)], 1); box = box + wet * (rms(box) / rms(wet)) * 0.45
box = level(trim(sosfilt(butter(2, 6000, 'low', fs=SR, output='sos'), box, axis=0))); box[:, 1] = np.roll(box[:, 1], int(0.011 * SR))
BOX = loopx(box, N) * (rms(LUTE) / rms(box))
Dsrc = trim(load('fs/drone_172325.mp3')); Dsrc[:, 1] = np.roll(Dsrc[:, 1], -7 * SR)
D = loopx(Dsrc, N); D = D * (rms(BOX) / rms(D)) * 0.55
sw = np.interp(np.arange(N) / SR, [0, 11.5, 13.3, 15, 17.8, 34.7, 38.6, 41.9, 44, 59.4, 62.7, 64, 68.7, 72.3, 74, 84.7, 89.8, 94.2, 97.2],
               [0.5, 0.8, 1.3, 1.4, 0.8, 0.8, 1.3, 1.5, 0.9, 1.0, 1.4, 0.8, 1.1, 1.5, 0.9, 1.3, 1.4, 1.3, 0.6])
D = (D + sosfilt(butter(2, 90, 'low', fs=SR, output='sos'), D, axis=0) * 8.0) * sw[:, None]
warm = level(trim(load('fs/warm_613087.mp3'))); WARM = np.zeros((N, 2)); i0 = int(97.2 * SR); w = warm[:N - i0 + SR]; WARM[i0 - SR // 2:i0 - SR // 2 + len(w)] = w[:N - i0 + SR // 2]
WARM *= rms(LUTE) / rms(w) * 1.1
# section envelopes (seconds): which bed plays when, 1.2 s crossfades
SEC = [(0, 11.5, 'L'), (11.5, 17.8, 'E'), (17.8, 34.7, 'L'), (34.7, 97.2, 'E'), (97.2, DUR + 1, 'W')]
X = 1.2; tt = np.arange(N) / SR; env = {'L': np.zeros(N), 'E': np.zeros(N), 'W': np.zeros(N)}
for a, b, k in SEC: env[k] = np.maximum(env[k], np.clip(np.minimum((tt - a) / X + 0.5, (b - tt) / X + 0.5), 0, 1) if a > 0 else np.clip((b - tt) / X + 0.5, 0, 1))
for k in env: env[k] = np.sqrt(env[k])
out = LUTE * env['L'][:, None] + (BOX + D) * env['E'][:, None] + WARM * env['W'][:, None]
fo = int(1.5 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]; out[:int(0.03 * SR)] *= np.linspace(0, 1, int(0.03 * SR))[:, None]
out *= 0.5 / np.abs(out).max(); sf.write('music_bed.wav', out.astype(np.float32), SR); print('music_bed', out.shape)
