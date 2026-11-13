"""Ambience beds per place (keynote arena crowd, newsroom with teletypes, HQ floor on a Sunday, quiet boardroom, trading
floor with phones, the empty hall after the show) with 0.3 s crossfades on the whips, + layers: the web press running under
the newsroom (full speed 11.12-19.64, then winding down as 12(1-u)^2 to the dead stop at 20.80, rev 4), the reporter's typewriter
(until 18.32), a press-room tone on the wall TVs (rev 4), the MEGASPEED light-box hum (on at 16.44), busy-office keyboards under the trading floor, the shopping cart
wheels (through the door 50.91 -> the whip 55.58). The arena crowd hushes while the spot narrows (5.12-5.86).
Recipe: pieces/trash-library/sound/beds.py."""
import numpy as np, soundfile as sf, subprocess, io, json, re
from scipy.signal import butter, sosfilt
SR, DUR = 48000, 64.2
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
B = json.load(open('beds_pick.json')); SRC = {k: load(v) for k, v in B.items()}
src = open('../src/shots.js', encoding='utf-8').read(); rows = [(float(t), s) for t, s in re.findall(r'\["\w+", ([\d.]+), \'(\w+)\'', src)]
SEG = []
for i, (t, s) in enumerate(rows):   # merge consecutive shots of one place
    if SEG and SEG[-1][0] == s: SEG[-1][2] = rows[i + 1][0] if i + 1 < len(rows) else DUR
    else: SEG.append([s, t, rows[i + 1][0] if i + 1 < len(rows) else DUR])
SEG = [('stage2' if s == 'stage' and a > 50 else s, a, b) for s, a, b in SEG]
out = np.zeros((int(DUR * SR), 2), 'float32'); X = int(0.3 * SR); off = {}
def lay(name, a, b, level=0.05, x=X, filt=None, env_fn=None):
    i0, i1 = max(0, int(a * SR) - x // 2), min(len(out), int(b * SR) + x // 2); n = i1 - i0
    s = SRC[name]; s = s / (np.sqrt(np.mean(s ** 2)) + 1e-9) * level
    o = off.get(name, int(min(2 * SR, len(s) // 4))) % max(1, len(s) - SR); seg = np.resize(np.roll(s, -o, 0), (n, 2)); off[name] = o + n
    seg[:, 1] = np.resize(np.roll(s[:, 1], -(o + int(0.43 * SR)), 0), n)   # decorrelated right channel (the beds read mono)
    if filt is not None: seg = sosfilt(filt, seg, axis=0).astype('float32')
    env = np.ones(n, 'float32'); env[:x] = np.linspace(0, 1, x); env[-x:] = np.linspace(1, 0, x)
    if env_fn is not None: env *= env_fn((i0 + np.arange(n)) / SR).astype('float32')
    out[i0:i1] += seg * env[:, None]
for name, a, b in SEG: lay(name, a, b); print('bed', name, a, b)
hush = lambda t: 1 - 0.6 * np.clip((t - 5.12) / 0.3, 0, 1) * np.clip((6.10 - t) / 0.24, 0, 1)   # the crowd hushes under the narrowed spot
i0, i1 = 0, int(11.4 * SR); out[i0:i1] *= hush(np.arange(i0, i1) / SR)[:, None]
press = lambda t: np.where(t < 19.64, 1.0, (1 - np.clip((t - 19.64) / 1.16, 0, 1)) ** 2)   # web speed (o3 ease) 3(1-u)^2 -> dead stop 20.80 (rev 4)
lay('press', 11.12, 20.80, 0.05, x=int(0.06 * SR), env_fn=press)
lay('press', 19.64, 20.80, 0.02, x=int(0.06 * SR), filt=butter(2, 500, 'low', fs=SR, output='sos'), env_fn=lambda t: np.sqrt(np.clip(press(t), 0, 1)))   # the heavy rollers spin down
lay('typewriter', 11.12, 18.32, 0.012, x=int(0.2 * SR))
lay('hum', 16.44, 27.28, 0.008, x=int(0.05 * SR))
lay('office', 35.82, 55.58, 0.02)
lay('cart', 50.91, 55.58, 0.035, x=int(0.25 * SR))
# rev 4: the wall TVs show people talking (spokesperson 24.98-26.04, president 38.14-40.08): a press-room tone through a TV speaker
tv = butter(2, [350, 3200], 'band', fs=SR, output='sos')
lay('tvroom', 24.98, 26.04, 0.012, x=int(0.08 * SR), filt=tv); lay('tvroom', 38.14, 40.08, 0.012, x=int(0.08 * SR), filt=tv)
sf.write('beds.wav', out, SR, subtype='FLOAT'); print('beds', len(SEG), float(np.abs(out).max()))
