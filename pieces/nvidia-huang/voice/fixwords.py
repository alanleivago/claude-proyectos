"""Caption text = the script's own words (whisper writes '5%', '33', 'NVIDIA', 'co -founded'); timings stay whisper's.
python voice/fixwords.py -> voice/words.json (rewritten) + src/words.js"""
import json, difflib, re
from pathlib import Path
H = Path(__file__).parent
w = json.load(open(H / 'words.json')); ref = (H.parent / 'script.txt').read_text(encoding='utf-8').split()
n = lambda t: re.sub(r'[^a-z0-9]', '', t.lower())
out = []
for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, [n(q['w']) for q in w], [n(r) for r in ref], autojunk=False).get_opcodes():
    if op == 'equal':
        out += [{'w': r, 's': q['s'], 'e': q['e']} for q, r in zip(w[i1:i2], ref[j1:j2])]
    elif op == 'replace':   # spread the script words over the whisper span, by length
        s, e = w[i1]['s'], w[i2 - 1]['e']; L = sum(len(r) for r in ref[j1:j2]); t = s
        for r in ref[j1:j2]:
            d = (e - s) * len(r) / L; out.append({'w': r, 's': round(t, 2), 'e': round(t + d, 2)}); t += d
    else: raise SystemExit(f'{op}: {[q["w"] for q in w[i1:i2]]} vs {ref[j1:j2]}')
json.dump(out, open(H / 'words.json', 'w', encoding='utf-8'), indent=0)
(H.parent / 'src' / 'words.js').write_text('const WORDS = ' + json.dumps(out, separators=(',', ':'), ensure_ascii=False) + ';\n', encoding='utf-8')
print(len(out), 'words; last', out[-1])
