# Estimated voice.json for the storyboard round (no voice yet): word times from syllable counts at Mad 3 / speed 0.82.
# Replaced by the real Whisper timings after the voice is generated.
import json, re
lines = [l.rstrip('\n').split('|', 1) for l in open('script_lines.txt') if l.strip()]
SYL = 0.15; GAP_WORD = 0.03; PUNCT = {',': 0.22, '.': 0.42, ':': 0.3, '?': 0.42}
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w)) - (1 if w.endswith('e') and len(w) > 3 and not w.endswith('le') else 0)
    return max(1, n)
t = 0.6; out = []
for lid, text in lines:
    ws = []; t0 = t
    for w in text.split():
        d = 0.06 + SYL * syl(w); ws.append({'w': w, 't0': round(t, 3), 't1': round(t + d, 3), 'est': True}); t += d + GAP_WORD
        if w[-1] in PUNCT and w != text.split()[-1]: t += PUNCT[w[-1]]
    out.append({'id': lid, 'text': text, 't0': round(t0, 3), 't1': round(ws[-1]['t1'], 3), 'words': ws}); t = ws[-1]["t1"] + 0.4
json.dump({'duration': round(t + 4.5, 3), 'lead': 0.6, 'tail': 6, 'lines': out}, open('voice.json', 'w'), indent=1)
print('voice end', round(t, 2), 'duration', round(t + 4.5, 2))
