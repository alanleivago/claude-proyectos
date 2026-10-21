import json, re, unicodedata, sys
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()))
segs = json.load(open('voice/words.json', encoding='utf-8'))
W = [w for s in segs for w in s['words']]
lines = [l.strip().split('|', 1) for l in open('voice/lines.txt', encoding='utf-8') if l.strip()]
TAIL = float(sys.argv[1]); dur = float(sys.argv[2])
out, i = [], 0
for lid, text in lines:
    target, acc, ws = norm(text), '', []
    while i < len(W) and len(acc) < len(target):
        w = W[i]; acc += norm(w['w']); ws.append({'w': w['w'].strip(), 't0': round(w['s'], 3), 't1': round(w['e'], 3)}); i += 1
    if acc != target: print('MISMATCH', lid, acc, '!=', target)
    out.append({'id': lid, 'text': text, 't0': ws[0]['t0'], 't1': ws[-1]['t1'], 'words': ws})
print('left over', len(W) - i)
json.dump({'duration': round(dur + TAIL, 3), 'lead': 0, 'tail': TAIL, 'lines': out}, open('voice.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for l in out: print(f"{l['id']:12s} {l['t0']:6.2f}-{l['t1']:6.2f}")
