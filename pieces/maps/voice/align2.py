"""Script lines + whisper words → ../voice.json. Words are matched by sequence alignment (difflib), so Whisper's
   mishearings don't shift anything; the captions show the script's spelling with the heard times."""
import json, re, unicodedata, difflib, sys
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()))
segs = json.load(open('words.json', encoding='utf-8')); W = [w for s in segs for w in s['words']]
lines = [l.strip().split('|', 1) for l in open('lines.txt', encoding='utf-8') if l.strip()]
S = [(i, w) for i, (_, t) in enumerate(lines) for w in t.split()]
a = [norm(w) for _, w in S]; b = [norm(w['w']) for w in W]
t0 = [None] * len(S); t1 = [None] * len(S)
for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
    if tag == 'equal':
        for k in range(i2 - i1): t0[i1 + k], t1[i1 + k] = W[j1 + k]['s'], W[j1 + k]['e']
    elif tag == 'replace' and j2 > j1:
        s0, s1 = W[j1]['s'], W[j2 - 1]['e']
        for k in range(i2 - i1): t0[i1 + k] = s0 + (s1 - s0) * k / (i2 - i1); t1[i1 + k] = s0 + (s1 - s0) * (k + 1) / (i2 - i1)
for k in range(len(S)):   # words Whisper skipped: interpolate between neighbours
    if t0[k] is None:
        p = next((t1[j] for j in range(k - 1, -1, -1) if t1[j] is not None), 0); n = next((t0[j] for j in range(k + 1, len(S)) if t0[j] is not None), p + 0.3)
        t0[k], t1[k] = p, min(n, p + 0.3); print('missing:', S[k][1])
out = []
for i, (lid, text) in enumerate(lines):
    ks = [k for k in range(len(S)) if S[k][0] == i]
    out.append({'id': lid, 'text': text, 't0': round(t0[ks[0]], 3), 't1': round(t1[ks[-1]], 3), 'words': [{'w': S[k][1], 't0': round(t0[k], 3), 't1': round(t1[k], 3)} for k in ks]})
dur = float(sys.argv[1])
json.dump({'duration': dur, 'lead': 0, 'tail': 1.2, 'lines': out}, open('../voice.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for l in out: print(f"{l['id']:11s} {l['t0']:6.2f}-{l['t1']:6.2f}")
