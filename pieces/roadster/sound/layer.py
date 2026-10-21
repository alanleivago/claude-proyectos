"""The music file for the export: the user's documentary track, shaped to the story, plus a few real recordings.
   usage: python sound/layer.py   (run from the piece folder) -> audio/track-shaped.wav + sound/CREDITS.md
The track starts 4 s in (as in bitpix), sits at -1.5 dB, goes silent 1.15 s before "11 GB" and comes back +1.5 dB on it.
The recordings come from sound-layer/kit, placed in reference time and mapped to the Spanish clock with ANCH (head.html),
quiet (-20 to -30 dB): they add texture to the code SFX, they never lead."""
import json, os, re, subprocess
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__)); PIECE = os.path.dirname(HERE); KIT = os.path.join(PIECE, '..', '..', 'sound-layer', 'kit')
SRC = os.path.join(PIECE, '..', '..', 'Ref bit y pixels', 'Documentary Background Music for Videos.mp3')
SR = 48000
V = json.load(open(os.path.join(PIECE, 'voice.json'), encoding='utf-8')); DUR = V['duration']
head = open(os.path.join(PIECE, 'src', 'head.html'), encoding='utf-8').read()
body = head[head.index('const ANCH = ['):head.index('];', head.index('const ANCH = ['))]
ANCH = [tuple(float(x) if x != 'DURATION' else DUR for x in m) for m in re.findall(r'\[([\d.]+), ([\d.]+|DURATION)\]', body)]
def es(r):
    for (r0, s0), (r1, s1) in zip(ANCH, ANCH[1:]):
        if r <= r1: return s0 + (s1 - s0) * (r - r0) / (r1 - r0)
    return DUR

# ---- the track
os.makedirs(os.path.join(PIECE, 'audio'), exist_ok=True)
raw = os.path.join(PIECE, 'audio', 'track.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '4', '-t', str(DUR + 1), '-i', SRC, '-ar', str(SR), '-ac', '2', raw], check=True)
x, _ = sf.read(raw, always_2d=True); t = np.arange(len(x)) / SR
HIT = es(59.6); HUSH = HIT - 0.9
M1, M15, M2 = es(25.4), es(50.7), es(64.0)   # quieter under the explanation, back up for the cold gas, full from the launch
db = np.interp(t, [0, M1 - 1, M1, M15 - 1, M15, HUSH - 0.5, HUSH, HIT - 0.02, HIT, M2, M2 + 2, t[-1]], [-1.5, -1.5, -7, -7, 0, 0, -60, -60, 6, 6, -5, -5])
out = x * 10 ** (db / 20)[:, None]

# ---- the recordings: (reference time, kit file, gain dB, pan -1..1)
REC = [
    (0.55, 'cand:carpass/transition/ov-1ab55f26', -26, 0.4), (1.3, 'whoosh/fs-30240-swoop1-flac-1', -26, 0.0),
    (3.6, 'whoosh/fs-30241-swoop2g-flac-1', -26, 0.0), (4.1, 'cand:arena/transition/ov-385dedf6', -30, 0.0), (5.0, 'thump/fs-389999-thump-cloth-1', -22, 0.0),
    (5.4, 'whoosh/fs-449992-whoosh-short-low-wav-1', -24, 0.0),
    (7.6, 'cand:carpass/transition/ov-bcb3560f', -24, -0.3), (11.7, 'thump/fs-389665-thump-close-wav-2', -26, 0.0),
    (18.5, 'whoosh/fs-30240-swoop1-flac-1', -24, 0.0), (21.2, 'click/kenney-interface-switch-003', -24, -0.2), (23.3, 'click/kenney-interface-switch-003', -22, 0.2),
    (25.9, 'cand:carpass/transition/ov-1ab55f26', -20, -0.4),
    (32.7, 'swish/fs-388003-double-swish-1', -28, 0.0), (42.4, 'shimmer/fs-452371-small-bell-2', -30, 0.2),
    (51.6, 'click/kenney-interface-switch-003', -24, 0.0),
    (54.8, 'pop/fs-188381-3-popping-pops-1', -30, 0.3),
    (64.0, 'whoosh/fs-30241-swoop2g-flac-1', -24, 0.0), (71.8, 'shimmer/fs-452371-small-bell-2', -32, -0.2),
    (74.9, 'thump/fs-389999-thump-cloth-1', -32, 0.0), (59.6, 'boom/fs-539968-deep-boom-3', -4, 0.0), (75.2, 'cand:arena/transition/ov-385dedf6', -32, 0.0),
]
credits = {}
CAT = {c['id']: c for c in json.load(open(os.path.join(KIT, 'catalog.json'), encoding='utf-8'))['sounds']}
for r, f, g, pan in REC:
    if f.startswith('cand:'):
        base = os.path.join(KIT, '..', 'work', 'cand', f[5:]); meta = json.load(open(base + '.json', encoding='utf-8')); src = meta['source']
        credits[f] = f'"{src["title"]}" by {src["creator"]} ({src["license"].upper()}, {src.get("landing", src.get("url", ""))})'; wav = base + '.wav'
    else:
        meta = CAT[f]; credits[f] = meta['credit']; wav = os.path.join(KIT, f + '.wav')
    y, sr = sf.read(wav, always_2d=True)
    if sr != SR: y = np.stack([np.interp(np.arange(int(len(y) * SR / sr)) * sr / SR, np.arange(len(y)), y[:, c]) for c in range(y.shape[1])], 1)
    if y.shape[1] == 1: y = np.repeat(y, 2, 1)
    y = y / (np.abs(y).max() + 1e-9) * 10 ** (g / 20)
    y = y * np.array([min(1, 1 - pan), min(1, 1 + pan)])
    fade = int(0.03 * SR); y[-fade:] *= np.linspace(1, 0, fade)[:, None]
    i0 = int(max(0, es(r) - meta.get('peak_offset_s', 0)) * SR); i1 = min(len(out), i0 + len(y)); out[i0:i1] += y[:i1 - i0]
sf.write(os.path.join(PIECE, 'audio', 'track-shaped.wav'), out.astype(np.float32), SR, subtype='FLOAT')
with open(os.path.join(HERE, 'CREDITS.md'), 'w', encoding='utf-8') as fh:
    fh.write('# Sound credits — roadster\n\nMusic: "Documentary Background Music for Videos" (the user\'s track, `Ref bit y pixels/`).\n\nRecordings (sound-layer kit):\n')
    for f, c in credits.items(): fh.write(f'- `{f}`: {c}\n')
print(f'track-shaped.wav: {DUR:.2f}s, hush {HUSH:.2f}-{HIT:.2f}s, {len(REC)} recordings')
