# Mix the real-recording SFX cue list (cues.json) into audio/sfx_pro.wav (48 kHz stereo, voice length).
# Each cue: {t, file, [ss, to] trim in the source, gain (dB vs the event reference), pan -1..1, fi/fo fades,
# lp/hp Hz, semi (pitch by resampling), dur (bed: loop the trim to this length), norm: "peak"|"int"}.
# Levels: every clip is first normalised (max 400 ms momentary loudness for events, integrated for beds) to REF LUFS,
# then gain is applied.  REF is set from the voice loudness so 0 dB gain = voice level - 5 dB.
import json, os, subprocess, sys, hashlib
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE = os.path.join(ROOT, 'audio', 'sfxlib', '.cache')
os.makedirs(CACHE, exist_ok=True)
meter = pyln.Meter(SR)
EVENT_OFF, BED_OFF = 5.0, 4.0     # global trims found in the stem check against the music (test_mix round 1)

def load(path):
    k = hashlib.md5(path.encode()).hexdigest()[:12]
    c = os.path.join(CACHE, k + '.wav')
    if not os.path.exists(c):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_f32le', c], check=True)
    x, _ = sf.read(c, dtype='float32')
    return x

def momentary_max(x):
    w = int(0.4 * SR); h = int(0.1 * SR); best = -120
    if len(x) < w: x = np.pad(x, ((0, w - len(x)), (0, 0)))
    for i in range(0, len(x) - w + 1, h):
        seg = x[i:i + w]
        if np.max(np.abs(seg)) < 1e-5: continue
        try: best = max(best, meter.integrated_loudness(seg))
        except Exception: pass
    return best

def filt(x, kind, f):
    sos = butter(4, f, kind, fs=SR, output='sos')
    return sosfilt(sos, x, axis=0).astype('float32')

def fade(x, fi, fo):
    n = len(x)
    if fi > 0:
        k = min(n, int(fi * SR)); x[:k] *= np.linspace(0, 1, k)[:, None] ** 2
    if fo > 0:
        k = min(n, int(fo * SR)); x[n - k:] *= np.linspace(1, 0, k)[:, None] ** 2
    return x

def loop_to(x, dur, xf=1.5):
    n = int(dur * SR); k = int(xf * SR)
    if len(x) >= n: return x[:n].copy()
    k = min(k, len(x) // 3)
    out = x.copy()
    ramp_in = np.linspace(0, 1, k)[:, None]; ramp_out = 1 - ramp_in
    while len(out) < n:
        out[-k:] = out[-k:] * np.sqrt(ramp_out) + x[:k] * np.sqrt(ramp_in)
        out = np.concatenate([out, x[k:]])
    return out[:n]

def render(cues, dur, ref):
    out = np.zeros((int(round(dur * SR)), 2), dtype='float32')
    report = []
    for c in cues:
        x = load(c['file'])
        ss, to = c.get('ss', 0), c.get('to')
        x = x[int(ss * SR): int(to * SR) if to else None].copy()
        if c.get('semi'):
            r = 2 ** (c['semi'] / 12.0)               # >1 up, <1 down: resample so playback is slower/lower
            up, down = 100, int(round(100 * r))
            x = resample_poly(x, up, down, axis=0).astype('float32')
        if c.get('hp'): x = filt(x, 'highpass', c['hp'])
        if c.get('lp'): x = filt(x, 'lowpass', c['lp'])
        if c.get('dur'): x = loop_to(x, c['dur'])
        x = fade(x, c.get('fi', 0.005), c.get('fo', 0.05))
        lv = meter.integrated_loudness(x) if c.get('norm') == 'int' and len(x) > SR else momentary_max(x)
        off = BED_OFF if c.get('norm') == 'int' else EVENT_OFF
        g = 10 ** ((ref + c.get('gain', 0) + off - lv) / 20)
        x *= g
        cl = c.get('ceil', 0.3 if c.get('norm') == 'int' else 0.9)
        if np.abs(x).max() > cl: x = limit(x, cl, rel=c.get('rel', 0.08))
        p = c.get('pan', 0); a = (p + 1) * np.pi / 4
        x[:, 0] *= np.cos(a) * 1.4142; x[:, 1] *= np.sin(a) * 1.4142
        i0 = int(round(c['t'] * SR)) - int(round(c.get('pre', 0) * SR))
        if i0 < 0: x = x[-i0:]; i0 = 0
        i1 = min(len(out), i0 + len(x))
        out[i0:i1] += x[:i1 - i0]
        report.append((c['t'], c.get('name', os.path.basename(c['file'])), c.get('gain', 0), round(len(x) / SR, 2), round(float(np.abs(x).max()), 2)))
    return out, report

def limit(x, ceil, look=0.003, rel=0.08):
    # brickwall-ish peak limiter: gain = ceil/peak over a short window, attack in the lookahead, smooth release
    from scipy.ndimage import maximum_filter1d
    a = np.abs(x).max(1); n = int(look * SR)
    pk = maximum_filter1d(a, 2 * n + 1)
    g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    r = np.exp(-1 / (rel * SR)); out = g.copy()
    from scipy.signal import lfilter
    # release smoothing: follow drops instantly, recover with time constant rel
    for i in range(1, len(out)):
        if out[i] > out[i - 1]: out[i] = out[i - 1] * r + out[i] * (1 - r)
    return (x * out[:, None]).astype('float32')

if __name__ == '__main__':
    cues = json.load(open(sys.argv[1]))
    outp = sys.argv[2]
    vox, _ = sf.read(os.path.join(ROOT, 'voice', 'voice.wav'), dtype='float32')
    if vox.ndim == 1: vox = np.stack([vox, vox], 1)
    dur = 278.307
    vl = meter.integrated_loudness(vox)
    ref = vl - 5.0
    out, rep = render(cues, dur, ref)
    pk = np.max(np.abs(out))
    if pk > 0.8: print('limit: peak', round(float(pk), 2)); out = limit(out, 0.8)
    sf.write(outp, out, SR, subtype='PCM_24')
    print('voice LUFS', round(vl, 1), 'ref', round(ref, 1), 'sfx LUFS', round(meter.integrated_loudness(out), 1), 'peak', round(float(pk), 3))
    for r in rep: print(*r)
