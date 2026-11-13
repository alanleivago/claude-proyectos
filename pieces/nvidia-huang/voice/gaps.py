"""Insert the wordless gag beats into the tightened voice, at sentence boundaries (in the quietest 5 ms of the pause).
python pieces/nvidia-huang/voice/gaps.py -> voice/voice.wav (with gaps) + voice/words.json (shifted)
Input: voice/voice_tight.wav + voice/words_tight.json (tighten.py + words.py). The closing gag (jacket on the empty stage) runs from the last word to 60.5 s.
"""
import json
from pathlib import Path
import numpy as np, soundfile as sf

HERE = Path(__file__).parent
GAPS = [('wife.', 0.9), ('slope?', 0.9)]   # G1 SEND gag (after 'wife.': 'who. Your board' runs together in take 11, no silence to cut), G2 intern skis down the chart; closing gag = last word end -> 60.5 s
w = json.load(open(HERE / 'words_tight.json'))
x, sr = sf.read(HERE / 'voice_tight.wav', dtype='float32')
hop = sr // 200; n = len(x) // hop
db = 20 * np.log10(np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1)) + 1e-9)

# which occurrence of each word the gap follows
want = {'wife.': 1, 'slope?': 1}
pts = []
for word, dur in GAPS:
    k = 0
    for i, q in enumerate(w):
        if q['w'] == word:
            k += 1
            if k == want[word]:
                a, b = q['e'], w[i + 1]['s']
                i0, i1 = int(a * 200), int((b + 0.1) * 200)   # whisper starts run early: look a little past them
                j = i0 + int(np.argmin(db[i0:i1])); assert db[j] < -42, (word, db[j])
                pts.append((j / 200 + 0.0025, dur, word)); break
pts.sort()
out, last, shift = [], 0, []
fd = int(sr * 0.006)
for t, dur, word in pts:
    c = int(t * sr); seg = x[last:c].copy()
    if last: seg[:fd] *= np.linspace(0, 1, fd)
    seg[-fd:] *= np.linspace(1, 0, fd)
    out += [seg, np.zeros(int(round(dur * sr)), dtype='float32')]; last = c
    shift.append((t, dur))
seg = x[last:].copy(); seg[:fd] *= np.linspace(0, 1, fd); out.append(seg)
y = np.concatenate(out)
sf.write(HERE / 'voice.wav', y, sr, subtype='PCM_16')

def sh(t): return round(t + sum(d for p, d in shift if t >= p), 2)
# a word whose whisper start falls before the cut but ends after it belongs after the gap (whisper starts run early)
def shw(q):
    e = sh(q['e']); s = sh(q['s'])
    for p, d in shift:
        if q['s'] < p < q['e']: s = round(p + sum(dd for pp, dd in shift if pp <= p) + 0.02, 2)
    return {'w': q['w'], 's': s, 'e': max(e, round(s + 0.1, 2))}
w2 = [shw(q) for q in w]
json.dump(w2, open(HERE / 'words.json', 'w', encoding='utf-8'), indent=0)
json.dump({'gaps': [{'at_tight': round(p, 3), 'at_final': sh(p) - d, 'dur': d} for p, d in shift]}, open(HERE / 'gaps.json', 'w'), indent=1)
print(f'voice {len(x)/sr:.2f}s -> {len(y)/sr:.2f}s; gaps at', [(round(p, 2), d, wd) for p, d, wd in pts], '; last word ends', w2[-1]['e'])
