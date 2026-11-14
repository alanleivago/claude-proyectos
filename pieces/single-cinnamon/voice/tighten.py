"""Tighten the pauses of the chosen take, cutting ONLY inside the low-energy gap between two words
(never inside a word). python pieces/single-cinnamon/voice/tighten.py -> voice/voice.wav + voice/cuts.json
Take 12 has no dead silence (VoiceStudio fills gaps with decay/breath at -25..-50 dB), so a pause =
the longest run below THR dBFS (5 ms frames, 3-frame bumps bridged) inside each whisper word gap.
Pauses longer than KEEP lose the excess from the middle of their deep core (< CORE dB, at least
CORE_KEEP of it stays), so word-final consonants and breaths are never touched; 12 ms crossfade.
Needs voice/raw_words.json (python voice/words.py takes/take_18.wav voice/raw_words.json).
"""
import json
from pathlib import Path
import numpy as np, soundfile as sf

HERE = Path(__file__).parent
SRC = HERE / 'takes' / 'take_18.wav'
OUT = HERE / 'voice_tight.wav'
THR = -24.0
KEEP_SENT, KEEP_COMMA = 0.15, 0.12
TAIL = 0.40
CORE, CORE_KEEP = -36.0, 0.05
FR = 200

w = json.load(open(HERE / 'raw_words.json'))
x, sr = sf.read(SRC, dtype='float32')
hop = sr // FR; n = len(x) // hop
db = 20 * np.log10(np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1)) + 1e-9)

def longest_run(a, b, thr=THR):
    i0, i1 = max(0, int(a * FR)), min(n, int(b * FR))
    low = db[i0:i1] < thr
    # bridge bumps of <= 3 frames
    k = 0
    while k < len(low):
        if not low[k]:
            j = k
            while j < len(low) and not low[j]: j += 1
            if 0 < k and j < len(low) and j - k <= 3: low[k:j] = True
            k = j
        else: k += 1
    best, k = (0, 0), 0
    while k < len(low):
        if low[k]:
            j = k
            while j < len(low) and low[j]: j += 1
            if j - k > best[1] - best[0]: best = (k, j)
            k = j
        else: k += 1
    return (i0 + best[0]) / FR, (i0 + best[1]) / FR

cuts, keep, start = [], [], 0.0
for a, b in zip(w, w[1:]):
    if b['s'] - a['e'] < 0.06: continue
    pa, pb = longest_run(a['e'] - 0.15, b['s'] + 0.15)
    L = pb - pa
    K = KEEP_SENT if a['w'][-1] in '.?!' else KEEP_COMMA
    # cut only inside the deep core (< CORE dB): word-final voiced consonants sit at -24..-30
    qa, qb = longest_run(pa, pb, CORE)
    rem = min(L - K, (qb - qa) - CORE_KEEP)
    if rem < 0.03: continue
    mid = (qa + qb) / 2; ca, cb = mid - rem / 2, mid + rem / 2
    keep.append((start, ca)); start = cb
    cuts.append({'after': a['w'], 'at': round(ca, 3), 'removed': round(cb - ca, 3), 'pause': round(L, 3)})
end = min(len(x) / sr, w[-1]['e'] + TAIL)
keep.append((start, end))

xf = int(sr * 0.012)
out = np.zeros(0, dtype='float32')
for a, b in keep:
    seg = x[int(a * sr):int(b * sr)].copy()
    if len(out) and len(seg) > xf:
        r = np.linspace(0, 1, xf, dtype='float32')
        out[-xf:] = out[-xf:] * (1 - r) + seg[:xf] * r
        seg = seg[xf:]
    out = np.concatenate([out, seg])
f = int(sr * 0.03); out[-f:] *= np.linspace(1, 0, f) ** 2
sf.write(OUT, out, sr, subtype='PCM_16')
json.dump({'src': SRC.name, 'keep': keep, 'cuts': cuts}, open(HERE / 'cuts.json', 'w'), indent=1)
print(f'{len(x)/sr:.2f}s -> {len(out)/sr:.2f}s, {len(cuts)} pauses tightened, {sum(c["removed"] for c in cuts):.2f}s removed')
for c in cuts: print(c)
