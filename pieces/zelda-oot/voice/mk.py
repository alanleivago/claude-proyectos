# script.md -> lines.json (id, text) + script.json (pauses) + chapters.json (line id each chapter starts on)
# a line = one or more sentences of a paragraph, 8..34 words; pause 0.35 inside a paragraph, 0.8 between paragraphs,
# 3.6 before a chapter card (the card lands 1.8 s ahead of its first line and holds 1.5 s longer)
import json, re
md = open('../script.md').read().split('## 0 · Cold open')[1]
chapters, paras = [], []
cur = '0 · Cold open'
for blk in re.split(r'\n\s*\n', md):
    b = blk.strip()
    if not b: continue
    if b.startswith('## '): cur = b[3:].strip(); continue
    if b.startswith('*[') or b.startswith('#'): continue
    paras.append((cur, b))
lines, n = [], 0
for ci, (ch, p) in enumerate(paras):
    sents = re.findall(r'[^.!?]+[.!?]+["”]?|[^.!?]+$', p); sents = [s.strip() for s in sents if s.strip()]
    groups = []
    for s in sents:
        if groups and (len(groups[-1].split()) < 8 or len(s.split()) < 4) and len(groups[-1].split()) + len(s.split()) <= 34: groups[-1] += ' ' + s
        else: groups.append(s)
    for gi, g in enumerate(groups):
        n += 1; lid = 'l%03d' % n
        if gi == 0 and (not lines or lines[-1]['ch'] != ch): chapters.append([ch, lid])
        lines.append({'id': lid, 'text': g, 'ch': ch, 'last': gi == len(groups) - 1})
for i, L in enumerate(lines):
    nxt = lines[i + 1] if i + 1 < len(lines) else None
    L['after'] = 0.35 if not L['last'] else (3.6 if nxt and nxt['ch'] != L['ch'] else 0.8)
json.dump([[L['id'], L['text']] for L in lines], open('lines.json', 'w'), indent=0)
json.dump({'lead': 0.6, 'tail': 16.0, 'lines': [{'id': L['id'], 'text': L['text'], 'after': L['after'], 'file': L['id'] + '.wav'} for L in lines]}, open('script.json', 'w'), indent=1)
json.dump(chapters, open('chapters.json', 'w'), indent=0)
print(len(lines), 'lines', sum(len(L['text'].split()) for L in lines), 'words'); print(chapters)
