# build the A/B excerpts: A = current (0.9) lines, B = 0.82, C = 0.9 + phrase pauses, D = 0.85 + phrase pauses.
# every take is cut with the trim2 logic (no stretching), checked by Whisper (first/last word), then joined with pauses.
import json, re, sys, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
SR = 24000
EX = {'cold': 'l001 l002 l003 l004 l005 l006', 'seven': 'l162 l163 l164 l165 l166 l167 l168', 'garden': 'l081 l082 l083 l084 l085 l086 l087 l088'}
L = dict(json.load(open('../lines.json'))); AFTER = {l['id']: l['after'] for l in json.load(open('../script.json'))['lines']}
M = WhisperModel('small.en', device='cpu', compute_type='int8')
def dbs(a): hop = int(SR * 0.01); fr = a[:len(a) // hop * hop].reshape(-1, hop); return 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
def trim(a):
    db = dbs(a); hop = int(SR * 0.01); on = db > max(np.percentile(db, 10) + 14, -50); loud = np.median(db[on])
    onset = next(k for k in range(len(db) - 3) if (db[k:k + 3] > loud - 10).all())
    q = [k for k in range(max(0, onset - 40), onset) if db[k] < -45]; k0 = q[-1] if q else max(0, onset - 12)
    while k0 > 0 and db[k0 - 1] < -45 and q and q[-1] - k0 < 4: k0 -= 1
    soft = [k for k in range(len(db)) if db[k] > -55]; s, e = k0 * hop, min(len(a), (soft[-1] + 16) * hop)
    seg = a[s:e].copy(); fi, fo = int(0.015 * SR), int(0.02 * SR); seg[:fi] *= np.linspace(0, 1, fi); seg[-fo:] *= np.linspace(1, 0, fo); return seg
def words(a):
    a16 = np.interp(np.arange(0, len(a) / SR, 1 / 16000), np.arange(len(a)) / SR, a).astype(np.float32)
    segs, _ = M.transcribe(np.concatenate([np.zeros(8000, np.float32), a16, np.zeros(8000, np.float32)]), language='en', word_timestamps=True)
    return [(w.word.strip(), w.start - 0.5, w.end - 0.5) for s in segs for w in s.words]
norm = lambda s: re.sub(r'[^a-z0-9 ]', ' ', s.lower().replace("'", '')).split()
def ok(id, W): got, want = norm(' '.join(w[0] for w in W)), norm(L[id]); return bool(got) and got[0][:3] == want[0][:3] and (got[-1][:3] == want[-1][:3] or got[-1] in want[-1])
def load(path): a, sr = sf.read(path); assert sr == SR; return a if a.ndim == 1 else a.mean(1)
def phrase(a, W, comma=0.22, sent=0.45):   # insert silence at commas / sentence ends inside the line, cut in the quietest frame of the word gap
    db = dbs(a); out, last = [], 0
    for (w, s0, e0), (_, s1, _) in zip(W, W[1:]):
        tgt = sent if re.search(r'[.?!]["”]?$', w) else comma if re.search(r'[,;:—–-]$', w) else 0
        if not tgt: continue
        f0, f1 = int(max(0, e0 - 0.03) * 100), int((s1 + 0.03) * 100); f1 = max(f1, f0 + 1)
        cut = (f0 + int(np.argmin(db[f0:f1]))) * int(SR * 0.01); gap = max(0, s1 - e0)
        piece = a[last:cut].copy(); n = int(0.006 * SR); piece[-n:] *= np.linspace(1, 0, n); out += [piece, np.zeros(int(max(0, tgt - gap) * SR))]
        last = cut; nxt = a[last:last + n].copy()
    tail = a[last:].copy(); n = int(0.006 * SR); tail[:n] *= np.linspace(0, 1, n); out.append(tail); return np.concatenate(out)
VER = {'A': ('cur', False), 'B': ('0.82', False), 'C': ('cur', True), 'D': ('0.85', True)}
report = {}
for v, (src, ph) in VER.items():
    allx = []
    for ex, ids in EX.items():
        parts = []; ids = ids.split()
        for j, id in enumerate(ids):
            if src == 'cur': a = load(f'../{id}.wav')
            else:
                a = trim(load(f'takes_{src}/{id}_s7.wav'))
            W = words(a)
            if not ok(id, W): print('CHECK', v, id, ' '.join(w[0] for w in W), flush=True)
            if ph: a = phrase(a, W)
            parts.append(a)
            if j < len(ids) - 1:
                p = AFTER[id]; p = (0.45 if p == 0.35 else 0.9 if p == 0.8 else p) if ph else p
                parts.append(np.zeros(int(p * SR)))
        x = np.concatenate([np.zeros(int(0.3 * SR))] + parts + [np.zeros(int(0.5 * SR))]); sf.write(f'{v}_{ex}.wav', x, SR)
        nw = sum(len(L[i].split()) for i in ids); report[f'{v}_{ex}'] = (round(len(x) / SR, 1), round(nw / (len(x) / SR) * 60))
        allx += [x, np.zeros(int(1.5 * SR))]
    sf.write(f'{v}_all.wav', np.concatenate(allx), SR)
json.dump(report, open('wpm.json', 'w'), indent=1); print(report)
