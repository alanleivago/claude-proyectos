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
HIT = es(79.0); HUSH = HIT - 0.8
G1, Z = es(83.0), es(44.0)
db = np.interp(t, [0, Z - 1.5, Z - 0.5, Z + 1.5, Z + 2.5, HUSH - 0.5, HUSH, HIT - 0.02, HIT, G1, G1 + 1.5, t[-1]], [-4.5, -4.5, -12, -12, -4.5, -4.5, -60, -60, 8, 8, -3, -3])   # the bgm up (user), silent before the live run
out = x * 10 ** (db / 20)[:, None]

# ---- the recordings: (reference time, kit file, gain dB, pan -1..1)
REC = [
    (1.2, 'whoosh/fs-30240-swoop1-flac-1', -28, 0.0), (6.0, 'shimmer/fs-452371-small-bell-2', -30, 0.0), (10.4, 'cand:arena/transition/ov-385dedf6', -32, 0.0),
    (12.8, 'chime/fs-404104-glass-ding-1', -30, -0.4), (13.6, 'chime/fs-404104-glass-ding-2', -32, 0.4), (18.9, 'click/kenney-interface-switch-003', -22, 0.0),
    (23.4, 'whoosh/fs-30241-swoop2g-flac-1', -28, 0.0), (44.2, 'shimmer/fs-452371-small-bell-2', -30, 0.0),
    (57.0, 'click/kenney-interface-switch-003', -26, 0.0), (63.6, 'whoosh/fs-30240-swoop1-flac-1', -26, 0.0), (71.8, 'click/kenney-interface-switch-003', -26, 0.0),
    (79.0, 'boom/fs-539968-deep-boom-3', -6, 0.0), (89.0, 'paper/fs-151221-page-turn-2-2', -28, 0.0), (101.0, 'shimmer/fs-452371-small-bell-2', -30, 0.0),
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
    fh.write('# Sound credits — shazam\n\nMusic: "Documentary Background Music for Videos" (the user\'s track, `Ref bit y pixels/`).\n\nRecordings (sound-layer kit):\n')
    for f, c in credits.items(): fh.write(f'- `{f}`: {c}\n')
print(f'track-shaped.wav: {DUR:.2f}s, hush {HUSH:.2f}-{HIT:.2f}s, {len(REC)} recordings')
