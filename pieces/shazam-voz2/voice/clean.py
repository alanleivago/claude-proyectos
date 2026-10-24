"""VoiceStudio takes → voice/voice.wav: cut the stray burst before the first word, gentle de-noise, join with pauses.
   The burst: every take opens with a ~0.12 s blip at 0.10 s, then a gap, then speech. Cut at the first sustained
   onset after 0.24 s (40 ms pre-roll). De-noise: high-pass 70 Hz + afftdn; word tails kept whole (no gate)."""
import numpy as np, soundfile as sf, subprocess, sys, os
D = os.path.dirname(os.path.abspath(__file__)); RAW = os.path.join(D, 'raw3'); SR = 48000
PAUSE = [0.45, 0.6, 0.5, 0.5, 0.6, 0.5, 0.7, 0.5, 0.55, 0.6, 0.5, 0.6, 0.5, 0.45, 0.0]
def load(f):
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-af', 'highpass=f=70,afftdn=nr=18:nf=-50:tn=1', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).copy()
def env(x, n=SR // 100): k = len(x) // n; return 20 * np.log10(np.sqrt((x[:k * n].reshape(k, n) ** 2).mean(1)) + 1e-9)
parts, report = [], []
files = sorted(f for f in os.listdir(RAW) if f.endswith('.wav'))
for i, f in enumerate(files):
    x = load(os.path.join(RAW, f)); e = env(x)
    # the stray blip lasts ~0.1 s; speech holds for longer: the first window of 0.2 s that is >= 80 % above -30 dB
    s = next(j for j in range(5, len(e) - 20) if (e[j:j + 20] > -30).mean() >= 0.8 and e[j] > -30)
    a = max(0, (s - 4) * SR // 100); end = len(e) - 1
    while end > s and e[end] < -60: end -= 1                                   # keep the whole decay of the last word
    y = x[a:min(len(x), (end + 25) * SR // 100)].copy()                        # + 250 ms of natural tail
    fi, fo = int(0.008 * SR), int(0.12 * SR); y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo) ** 2
    parts += [y, np.zeros(int(PAUSE[i] * SR), np.float32)]
    report.append(f'{f}: cut {a / SR:.2f}s, len {len(y) / SR:.2f}s')
v = np.concatenate([np.zeros(int(0.15 * SR), np.float32)] + parts + [np.zeros(int(1.2 * SR), np.float32)])
# a very short room tail (120 ms decaying noise, -24 dB wet): word ends before a pause stop softly instead of dead-dry
ir = np.random.default_rng(7).standard_normal(int(0.12 * SR)).astype(np.float32) * np.exp(-np.arange(int(0.12 * SR)) / (0.035 * SR)).astype(np.float32)
ir /= np.sqrt((ir ** 2).sum()); wet = np.convolve(v, ir)[:len(v)] * 10 ** (-24 / 20); v = v + wet
v = v / np.abs(v).max() * 0.89
sf.write(os.path.join(D, 'voice.wav'), v, SR, subtype='PCM_16')
print('\n'.join(report)); ev = env(v); print(f'voice.wav {len(v) / SR:.2f}s; floor in pauses p10 {np.percentile(ev[ev < -30], 50):.1f} dB')
