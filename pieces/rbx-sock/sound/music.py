"""music_bed.wav: creepy part = CC0 'Eerie Music Box' (fs 417446) slowed 2 semitones + dark room tail, looped with a crossfade,
over a low drone (fs 172325); from 'After that, everything changed' (110.0 s, words.json) it crossfades into the warm
'Dancing Ducks Music Box' (fs 613087) and the drone leaves. Different tracks from rbx-thursday, same mood."""
import numpy as np, soundfile as sf, subprocess, io
from scipy.signal import fftconvolve, butter, sosfilt
SR = 48000; DUR = 125.4556 + 0.5; N = int(DUR * SR); WARM = 110.0
def load(p, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', p] + (['-af', af] if af else []) + ['-ac', '2', '-ar', str(SR), '-f', 'wav', '-']
    return sf.read(io.BytesIO(subprocess.run(cmd, capture_output=True, check=True).stdout), dtype='float64')[0]
def rms(x): return np.sqrt(np.mean(x ** 2)) + 1e-12
def loopx(x, n, xf=int(2.0 * SR)):          # loop with an equal-power crossfade at each seam
    out = x.copy()
    while len(out) < n:
        a = np.sqrt(np.linspace(1, 0, xf))[:, None]; b = np.sqrt(np.linspace(0, 1, xf))[:, None]
        out = np.concatenate([out[:-xf], out[-xf:] * a + x[:xf] * b, x[xf:]])
    return out[:n]
r = 2 ** (-2 / 12)
box = load('fs/musicbox_417446.mp3', f'asetrate={int(SR * r)},aresample={SR}')
rng = np.random.default_rng(3); t = np.arange(int(2.2 * SR)) / SR
ir = rng.standard_normal((len(t), 2)) * np.exp(-t / 0.55)[:, None]; ir = sosfilt(butter(2, 3500, 'low', fs=SR, output='sos'), ir, axis=0)
wet = np.stack([fftconvolve(box[:, c], ir[:, c])[:len(box)] for c in (0, 1)], 1); box = box + wet * (rms(box) / rms(wet)) * 0.45
box = sosfilt(butter(2, 6000, 'low', fs=SR, output='sos'), box, axis=0)
def trim(x, db=-45):                       # drop the leading silence so the music is audible from frame 0
    i = int(np.argmax(np.abs(x).max(1) > 10 ** (db / 20))); return x[max(0, i - int(0.01 * SR)):]
def level(x, w=3.0):                       # slow leveller: evens out the quiet / loud passages (+-6 dB max)
    from scipy.ndimage import uniform_filter1d
    e = np.sqrt(uniform_filter1d((x ** 2).mean(1), int(w * SR)) + 1e-9); g = np.clip(np.median(e) / e, 0.5, 2.0)
    return x * uniform_filter1d(g, int(0.5 * SR))[:, None]
box = level(trim(box))
box[:, 1] = np.roll(box[:, 1], int(0.011 * SR))                 # 11 ms Haas on R: the mono music box gets width
i0 = int(WARM * SR); X = int(1.6 * SR)
H = loopx(box, N)
Dsrc = trim(load('fs/drone_172325.mp3')); Dsrc[:, 1] = np.roll(Dsrc[:, 1], -7 * SR)   # R from 7 s later: wide drone
D = loopx(Dsrc, N); D = D * (rms(H) / rms(D)) * 0.55          # drone ~5 dB under the box
# drone swells on the scary beats: drain counting 37.8, chute rattle 63, crawl/vent 71-74, midnight/arm 74.7-90, cave 91-109
sw = np.interp(np.arange(N) / SR, [0, 30, 37.5, 40, 62.5, 64, 71, 74.5, 79, 90, 92, 104, 106, 109, WARM],
               [0.7, 0.75, 1.2, 0.8, 1.2, 0.9, 1.2, 1.4, 1.5, 1.4, 1.3, 1.2, 1.3, 0.9, 0.5])
D = D * sw[:, None]
warm = level(trim(load('fs/warm_613087.mp3')))
W = np.zeros((N, 2)); w = warm[:N - i0 + X]; W[i0 - X:i0 - X + len(w)] = w
W = W * (rms(H[:i0]) / rms(w)) * 1.15
env_h = np.ones(N); env_h[i0 - X:i0 + X] = np.linspace(1, 0, 2 * X); env_h[i0 + X:] = 0
env_w = 1 - env_h; env_w[:i0 - X] = 0
Dl = sosfilt(butter(2, 90, 'low', fs=SR, output='sos'), D, axis=0); D = D + Dl * 8.0   # more sub under the creepy part
out = (H + D) * env_h[:, None] + W * env_w[:, None]
fo = int(1.5 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]; out[:int(0.03 * SR)] *= np.linspace(0, 1, int(0.03 * SR))[:, None]
out *= 0.5 / np.abs(out).max()
sf.write('music_bed.wav', out.astype(np.float32), SR); print('music_bed', out.shape)
