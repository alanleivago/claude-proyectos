"""rbx-followers SFX + beds: board/shots.json + per-shot actions -> audio/stems/sfx.wav (real Freesound CC0 recordings from fs/,
plus a few sound-layer kit whooshes) and beds.wav (ambience per shot, 0.3 s crossfades). remix.py --own then does the ride + master.
Each clip: decoded to 48 kHz, trimmed to its max length with short fades, peak-normalised, then its dB."""
import json, subprocess, io, glob, os, numpy as np, soundfile as sf
SR = 48000; DUR = 108.7; N = int(DUR * SR)
os.chdir(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open('../board/shots.json')); IDX = json.load(open('fs/index.json'))
def dec(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float64')[0]
CACHE = {}
def clip(key, k=0, mx=1.5, ss=0.0):
    pool = [e['file'] for e in IDX[key]] if key in IDX else sorted(glob.glob(f'../../../sound-layer/kit/{key}/*.wav'))[:4]
    p = pool[k % len(pool)]; ck = (p, mx, ss)
    if ck not in CACHE:
        x = dec(p)[int(ss * SR):int((ss + mx) * SR)]
        e = np.abs(x).max(1); on = np.argmax(e > e.max() * 0.08); x = x[max(0, on - int(0.005 * SR)):]   # trim leading silence
        f = min(len(x) // 4, int(0.08 * SR)); x[-f:] *= np.linspace(1, 0, f)[:, None]; CACHE[ck] = x / (np.abs(x).max() + 1e-9)
    return CACHE[ck]
# key: (fs/kit key, max s, dB, pool rotation)
K = {'squeak': ('squeak', 0.5, -4), 'step': ('step', 0.5, -12), 'steps': ('sneaker', 2.0, -14), 'crowdwalk': ('crowdwalk', 2.5, -12), 'gasp': ('crowdgasp', 2.5, -10),
     'chant': ('chant', 3.0, -10), 'splash': ('splash', 2.5, -6), 'shutter': ('shutter', 0.6, -10), 'mega': ('megaphone', 1.2, -10), 'doors': ('doors', 2.0, -10),
     'bell': ('bell', 3.0, -14), 'chalk': ('chalk', 1.5, -14), 'meow': ('meow', 1.0, -8), 'horns': ('horns', 3.0, -14), 'paper': ('paper', 1.2, -12), 'spoon': ('spoon', 1.0, -12),
     'door': ('door', 1.6, -10), 'heart': ('heart', 3.0, -8), 'laugh': ('laugh', 2.0, -12), 'cloth': ('shrug', 0.8, -12), 'whoosh': ('whoosh', 1.0, -14), 'swish': ('swish', 0.8, -16), 'pop': ('pop', 0.5, -14), 'boom': ('boom', 1.5, -12)}
A = {  # first words of the shot: [(u, key)]
 'In this town': [(0.0, 'swish'), (0.2, 'crowdwalk')], 'everyone has followers': [(0.1, 'steps')], 'And they really do': [(0.0, 'steps'), (0.4, 'crowdwalk')],
 'walking right behind you': [(0.1, 'steps')], 'wherever you go': [(0.0, 'whoosh'), (0.2, 'crowdwalk')], "There's only one way": [(0.1, 'steps')],
 'Turn around and look': [(0.1, 'cloth'), (0.5, 'swish')], 'and they stop following': [(0.15, 'gasp')], 'Forever': [(0.2, 'steps')],
 "That's why famous people": [(0.1, 'crowdwalk')], 'A pop star with': [(0.0, 'whoosh'), (0.3, 'murmur!')], 'took four years to': [(0.0, 'swish')],
 'First dates are crowded': [(0.2, 'laugh')], 'You bring everyone': [(0.0, 'whoosh'), (0.3, 'gasp')], 'And when a cat': [(0.3, 'meow')], 'the highway closes for': [(0.0, 'swish'), (0.2, 'horns')],
 "I've had one follower": [(0.1, 'step'), (0.5, 'step')], "But I know the": [(0.2, 'step'), (0.7, 'step')], 'Squeak': [(0.12, 'squeak')], 'Step': [(0.15, 'step')],
 'One of their shoes': [(0.2, 'squeak'), (0.7, 'step')], 'My dad works nights': [(0.3, 'door')], "He's never home when": [(0.2, 'spoon'), (0.7, 'spoon')],
 'He leaves me notes': [(0.3, 'paper')], 'and every note ends': [(0.0, 'swish')], "Whatever's behind you": [(0.2, 'paper')],
 'Then one day I': [(0.2, 'step')], 'slipped and fell into': [(0.0, 'whoosh'), (0.35, 'splash')], 'Somebody filmed it': [(0.3, 'shutter'), (0.5, 'laugh')], 'By lunch it had': [(0.1, 'pop')],
 'The next morning I': [(0.2, 'door')], 'and the whole street': [(0.0, 'boom'), (0.1, 'gasp')], 'Three million and one': [(0.2, 'heart')], 'All waiting for me': [(0.2, 'murmur!')],
 'I walked to school': [(0.0, 'crowdwalk')], 'They walked to school': [(0.0, 'swish'), (0.1, 'crowdwalk')], 'They followed me into': [(0.1, 'bell')], 'The teacher gave up': [(0.3, 'chalk')],
 'If I stopped they': [(0.3, 'cloth'), (0.35, 'gasp')], 'If I turned left': [(0.0, 'whoosh'), (0.2, 'crowdwalk')], 'So I tried to': [(0.2, 'cloth')],
 'I jumped on the': [(0.1, 'whoosh'), (0.6, 'doors')], 'Three million people got': [(0.1, 'crowdwalk'), (0.5, 'gasp')], 'I grabbed a megaphone': [(0.4, 'mega')], 'Unfollow': [(0.05, 'mega')],
 'Nobody left': [(0.3, 'murmur!')], 'Three days': [(0.1, 'crowdwalk')], 'No home': [(0.0, 'swish')], 'And somewhere in all': [(0.0, 'chant')], 'They were chanting my': [(0.0, 'chant')],
 "Dad's last note was": [(0.2, 'paper')], 'And then really quiet': [(0.0, 'heart')], 'So I turned around': [(0.1, 'cloth'), (0.3, 'swish')], 'Three million people blinked': [(0.3, 'pop')],
 'shrugged': [(0.1, 'cloth')], 'and walked away': [(0.0, 'crowdwalk')], 'The number above my': [(0.2, 'pop')], 'One old shoe': [(0.6, 'squeak')], 'Squeaking': [(0.2, 'squeak')],
 'For eleven years he\'d': [(0.1, 'step'), (0.5, 'squeak')], 'Every crosswalk': [(0.2, 'horns')], 'He was walking me': [(0.3, 'squeak')], 'Now we walk side': [(0.2, 'step'), (0.6, 'squeak')],
 'He still squeaks': [(0.2, 'squeak'), (0.7, 'squeak')], 'Never alone': [(0.3, 'squeak')],
}
norm = lambda w: ''.join(c for c in w.lower() if c.isalnum() or c in "' ")
keys = sorted(A, key=len, reverse=True)
sfx = np.zeros((N, 2)); rot = {}
for sh in S:
    ln = norm(sh['line']); k = next((x for x in keys if ln.startswith(norm(x))), None)
    for u, ev in A.get(k, []):
        if ev.endswith('!'): continue   # beds handle murmur
        src, mx, db = K[ev]; r = rot.get(ev, 0); rot[ev] = r + 1
        x = clip(src, r, mx) * 10 ** (db / 20); pan = 0.0 if ev in ('squeak', 'splash', 'boom', 'heart') else (0.3 if r % 2 else -0.3)
        x = x * np.array([1 - max(0, pan), 1 + min(0, pan)]); t = int((sh['t0'] + u * (sh['t1'] - sh['t0'])) * SR)
        n = min(len(x), N - t); sfx[t:t + n] += x[:n]
os.makedirs('audio/stems', exist_ok=True); sf.write('audio/stems/sfx.wav', sfx.astype(np.float32), SR)
# beds: per shot an ambience (looped, offset), 0.3 s crossfades
def bedfor(i, sh):
    ln = sh['line'].lower(); st = sh['set']
    if st == 'kitchen': return 'fridge'
    if st == 'subway': return 'subway'
    if st == 'classroom': return 'classroom'
    if st == 'bridge': return 'birds' if i >= next(j for j, s in enumerate(S) if s['line'].lower().startswith('and walked away')) or ln.startswith(('that', 'a pop', 'took', 'and when', 'the highway')) else 'murmur'
    if 'date' in ln or 'bring everyone' in ln: return 'cafe'
    if any(w in ln for w in ('fountain', 'one day', 'filmed')): return 'fountain'
    full0 = next(j for j, s in enumerate(S) if s['line'].lower().startswith('the next morning')); full1 = next(j for j, s in enumerate(S) if s['line'].lower().startswith('three days'))
    return 'murmur' if full0 < i < full1 else 'birds'
BED = {}
def bed(k):
    if k not in BED: x = dec(IDX[k][0 if k != 'birds' else 1]['file']); x = x / (np.sqrt((x ** 2).mean()) + 1e-9) * 0.1; BED[k] = np.resize(x, (N, 2)) if len(x) < N else x[:N]
    return BED[k]
beds = np.zeros((N, 2)); fade = int(0.3 * SR)
for i, sh in enumerate(S):
    a = int(sh['t0'] * SR); b = min(N, int(sh['t1'] * SR) + fade); x = bed(bedfor(i, sh))[a:b].copy()
    w = np.ones(len(x)); w[:fade] = np.linspace(0, 1, fade)[:len(w[:fade])]; w[-fade:] = np.minimum(w[-fade:], np.linspace(1, 0, fade)[:len(w[-fade:])]); beds[a:b] += x * w[:, None]
sf.write('beds.wav', beds.astype(np.float32), SR)
print('sfx events', sum(rot.values()), {k: v for k, v in rot.items()})
