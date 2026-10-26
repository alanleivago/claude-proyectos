# tube.py: the barrel 470-497.5 as a huge hollow tube of water. Real recordings (breaking waves, waves against rocks,
# the spillway rush; all already credited) are summed and convolved with a code-made "tube" impulse response:
# a long cavernous decay (RT60 ~3 s) whose early part is a set of tube resonances (feedback-comb modes). Two IRs with
# different mode tunings are crossfaded by a slow LFO so the tube "breathes". Deterministic (seeded).
# Writes work/tube.wav (48 kHz stereo float, 510 s, silent outside 469-497.6); combine.py adds it to the ambience stem.
import os, subprocess, io, zlib
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000; N = int(510 * SR)
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(1468 + zlib.crc32(b"tube"))

def load(p, start, dur):
    r = subprocess.run(["ffmpeg", "-v", "quiet", "-ss", str(start), "-t", str(dur), "-i", os.path.join(A, p),
                        "-f", "wav", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True)
    x, _ = sf.read(io.BytesIO(r.stdout), always_2d=True)
    return np.pad(x, ((0, max(0, int(dur * SR) - len(x))), (0, 0)))[: int(dur * SR)]

def rms(x): return np.sqrt(np.mean(x ** 2)) + 1e-12

T0, T1 = 469.0, 497.6; D = T1 - T0
src = (load("assets/roar/fs-861756_sea-waves-heavily-crashing-on-the-shorel.ogg", 30.0, D) / rms(load("assets/roar/fs-861756_sea-waves-heavily-crashing-on-the-shorel.ogg", 30.0, D))
       + 0.8 * load("assets/tube/fs-506443_seawaves-against-rocks.ogg", 20.0, D) / rms(load("assets/tube/fs-506443_seawaves-against-rocks.ogg", 20.0, D))
       + 0.6 * load("assets/board/fs-497695_water-over-damn-spillway-wav.ogg", 30.0, D) / rms(load("assets/board/fs-497695_water-over-damn-spillway-wav.ogg", 30.0, D)))

def tube_ir(modes_ms, seed, rt60=3.0, L=3.5):
    r = np.random.default_rng(seed); n = int(L * SR); t = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for ch in (0, 1):
        tail = r.standard_normal(n) * 10 ** (-3 * t / rt60)                          # cavernous diffuse decay
        tail = signal.sosfilt(signal.butter(2, [80, 2600], "band", fs=SR, output="sos"), tail)
        early = np.zeros(n); early[0] = 1.0
        for k, ms in enumerate(modes_ms):                                            # tube modes: feedback combs
            d = int(ms * (1 + 0.013 * ch) * SR / 1000); g = 0.93 - 0.02 * k
            imp = np.zeros(n); imp[::d] = g ** np.arange(len(imp[::d]))
            early += 0.35 * imp
        early = signal.sosfilt(signal.butter(2, 3200, "low", fs=SR, output="sos"), early)
        ir[:, ch] = 0.6 * early / rms(early) + tail / rms(tail)
    return ir / np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))

irA = tube_ir([9.7, 14.3, 21.1, 31.6], 11)
irB = tube_ir([11.2, 16.9, 24.4, 35.3], 12)
def conv(x, ir): return np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in (0, 1)], 1)
wa, wb = conv(src, irA), conv(src, irB)
t = np.arange(len(src)) / SR
lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t + 1.3)                                  # the tube breathes (~14 s)
wet = wa * np.sqrt(lfo)[:, None] + wb * np.sqrt(1 - lfo)[:, None]
dry = signal.sosfilt(signal.butter(2, 1800, "low", fs=SR, output="sos"), src, axis=0)
y = 0.85 * wet / rms(wet) + 0.35 * dry / rms(dry)
y = signal.sosfilt(signal.butter(2, 45, "high", fs=SR, output="sos"), y, axis=0)
am = 0.8 + 0.2 * np.sin(2 * np.pi * 0.11 * t)                                         # slow swell
tt = t + T0
env_db = np.interp(tt, [469.0, 470.6, 473.0, 488.0, 493.0, 497.5, 497.6], [-60, -10, 0, 0, -8, -45, -120])
y = y * (am * 10 ** (env_db / 20))[:, None]
y *= 10 ** (-9 / 20) / np.max(np.abs(y))                                                # peak -9 dBFS (pre-master)
out = np.zeros((N, 2), np.float32); i0 = int(T0 * SR); out[i0:i0 + len(y)] = y
sf.write(os.path.join(A, "work", "tube.wav"), out, SR, subtype="FLOAT")
print("tube.wav written, peak -9 dBFS, span", T0, T1)
