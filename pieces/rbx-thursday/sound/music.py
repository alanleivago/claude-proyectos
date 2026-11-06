"""music_bed.wav: horror = CC0 music-box lullaby (fs 381973) slowed 3 semitones + soft room tail, over a low drone (fs 871189);
from 'After that, everything changed' (107.1 s) it crossfades into a warm Brahms lullaby music box (fs 416384) and the drone leaves."""
import numpy as np, soundfile as sf, subprocess, io
from scipy.signal import fftconvolve, butter, sosfilt
SR = 48000; DUR = 119.742 + 0.5; N = int(DUR * SR); WARM = 107.10
def load(p, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', p] + (['-af', af] if af else []) + ['-ac', '2', '-ar', str(SR), '-f', 'wav', '-']
    return sf.read(io.BytesIO(subprocess.run(cmd, capture_output=True, check=True).stdout), dtype='float64')[0]
def fit(x, n, off=0):
    x = np.roll(x, -off, 0); return np.resize(x, (n, 2)) if len(x) < n else x[:n]
def rms(x): return np.sqrt(np.mean(x ** 2)) + 1e-12
r = 2 ** (-3 / 12)
box = load('fs/musicbox_381973.mp3', f'asetrate={int(SR * r)},aresample={SR}')
rng = np.random.default_rng(3); t = np.arange(int(2.2 * SR)) / SR      # small dark room tail, eerie
ir = (rng.standard_normal((len(t), 2)) * np.exp(-t / 0.55)[:, None]); ir = sosfilt(butter(2, 3500, 'low', fs=SR, output='sos'), ir, axis=0)
wet = np.stack([fftconvolve(box[:, c], ir[:, c])[:len(box)] for c in (0, 1)], 1); box = box + wet * (rms(box) / rms(wet)) * 0.45
box = sosfilt(butter(2, 6000, 'low', fs=SR, output='sos'), box, axis=0)
drone = load('fs/drone_871189.mp3')
warm = load('fs/musicbox_416384.mp3')
i0 = int(WARM * SR); X = int(1.6 * SR)
H = fit(box, N); D = fit(drone, N)
D = D * (rms(H) / rms(D)) * 0.55                                      # drone ~5 dB under the box
# drone swells on the scary beats (reveal 52 s, eye 79 s, stare 90-101 s), quieter early
sw = np.interp(np.arange(N) / SR, [0, 44, 51.5, 60, 77, 80, 88, 101.5, 104, WARM], [0.7, 0.8, 1.3, 1.0, 1.1, 1.4, 1.2, 1.5, 0.8, 0.5])
D = D * sw[:, None]
W = np.zeros((N, 2)); w = warm[int(0.0 * SR):][:N - i0 + X]; W[i0 - X:i0 - X + len(w)] = w
W = W * (rms(H[:i0]) / rms(w)) * 1.15
env_h = np.ones(N); env_h[i0 - X:i0 + X] = np.linspace(1, 0, 2 * X); env_h[i0 + X:] = 0
env_w = 1 - env_h; env_w[:i0 - X] = 0
out = (H + D) * env_h[:, None] + W * env_w[:, None]
fo = int(1.5 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]; out[:int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR))[:, None]
out *= 0.5 / np.abs(out).max()
sf.write('music_bed.wav', out.astype(np.float32), SR); print('music_bed', out.shape)
