"""vera-01 film timeline: work/timeline.json (tools/sb_timeline.py) + the takes -> engine/film_timeline.json + audio/voice.wav (48 kHz mono).
- voice: every take placed at its 'at' (film time of the take's first sample).
- subtitle cards (UpNext style): one per phrase (a line splits after . ? …), timed by the take's own pauses when it has them
  (else by characters), start 0.1 s before the phrase, typewriter done at 85 % of it, held until the next card or +0.5 s.
- mouth: per speaker, 30 fps levels 0/1/2 from the voice envelope (drives the face-cell flaps in the engine).
usage: python tools/film_timeline.py"""
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

PIECE = Path(__file__).resolve().parents[1]
SR, FPS = 48000, 30
TL = json.loads((PIECE / 'work' / 'timeline.json').read_text(encoding='utf-8'))
N = int((TL['dur'] + 1) * SR); voice = np.zeros(N, np.float32); spk_env = {'V': np.zeros(N, np.float32), 'T': np.zeros(N, np.float32)}


def load(take):
    a, sr = sf.read(str(PIECE / 'voz' / f'{take}.wav'), dtype='float32', always_2d=True); a = a.mean(1)
    return resample_poly(a, SR, sr).astype(np.float32) if sr != SR else a


def env(a, win=0.02):
    w = int(SR * win); e = np.sqrt(np.convolve(a ** 2, np.ones(w) / w, 'same')); return e


SPLIT = {'25_vera': ['It’s had your name on it…', 'since Monday.'], '10_theo': ['A friend.', 'A good… friend.']}   # cards that follow the cut / read better
cards = []
for L in TL['lines']:
    a = load(L['take']); i = int(L['at'] * SR); voice[i:i + len(a)] += a[:N - i]; spk_env[L['spk']][i:i + len(a)] += np.abs(a[:N - i])
    # phrases and their spoken spans: split the text after . ? … and look for the matching pauses in the take
    parts = [p.strip() for p in re.split(r'(?<=[.?…])\s+', L['text']) if p.strip()]
    parts = SPLIT.get(L['take'], parts)
    e = env(a); thr = max(e.max() * 10 ** (-30 / 20), 10 ** (-45 / 20)); on = e > thr
    # speech segments separated by >= 120 ms of silence
    segs, s0, gap = [], None, 0
    for k in range(0, len(on), 240):
        if on[k]:
            if s0 is None: s0 = k
            gap = 0; last = k
        elif s0 is not None:
            gap += 240
            if gap >= int(0.12 * SR): segs.append((s0, last)); s0 = None
    if s0 is not None: segs.append((s0, last))
    if L['take'] in SPLIT and len(parts) == 2:   # forced split: the quietest 20 ms between 30 % and 80 % of the spoken span
        s_on, s_off = L['on'] - L['at'], L['off'] - L['at']; w = int(0.02 * SR)
        ks = range(int((s_on + 0.3 * (s_off - s_on)) * SR), int((s_on + 0.8 * (s_off - s_on)) * SR), w // 2)
        cut = min(ks, key=lambda k: float(np.sqrt(np.mean(a[k:k + w] ** 2)))) / SR
        spans = [(L['on'], L['at'] + cut), (L['at'] + cut + 0.05, L['off'])]
    elif len(parts) > 1 and len(segs) >= len(parts):   # merge segments down to one per phrase (biggest pauses kept)
        while len(segs) > len(parts):
            gaps = [segs[j + 1][0] - segs[j][1] for j in range(len(segs) - 1)]; j = int(np.argmin(gaps)); segs[j:j + 2] = [(segs[j][0], segs[j + 1][1])]
        spans = [(L['at'] + a0 / SR, L['at'] + a1 / SR) for a0, a1 in segs]
    else:   # by characters inside the spoken span
        tot = sum(len(p) for p in parts); t = L['on']; spans = []
        for p in parts: d = (L['off'] - L['on']) * len(p) / tot; spans.append((t, t + d)); t += d
    for p, (t0, t1) in zip(parts, spans):
        cards.append(dict(text=p, spk=L['spk'], shot=L['shot'], start=round(t0 - 0.1, 3), typed=round(t0 + 0.85 * (t1 - t0), 3), spoken_end=round(t1, 3)))
    L['spans'] = [[round(x, 3), round(y, 3)] for x, y in spans]
for k, c in enumerate(cards):
    nxt = cards[k + 1]['start'] if k + 1 < len(cards) else 1e9
    c['end'] = round(min(nxt, c['spoken_end'] + 0.5), 3)
mouth = {}
for s, ev in spk_env.items():
    lv = []
    for f in range(int(TL['dur'] * FPS) + 1):
        seg = ev[int(f / FPS * SR): int((f + 1) / FPS * SR)]; v = float(seg.mean()) if len(seg) else 0
        lv.append(0 if v < 0.012 else 1 if v < 0.05 else 2)
    mouth[s] = ''.join(map(str, lv))
out = dict(dur=TL['dur'], shots=TL['shots'], lines=TL['lines'], cards=cards, mouth=mouth)
(PIECE / 'engine' / 'film_timeline.json').write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding='utf-8')
(PIECE / 'audio').mkdir(exist_ok=True); sf.write(str(PIECE / 'audio' / 'voice.wav'), voice[:int(TL['dur'] * SR)], SR, subtype='PCM_24')
print('dur', TL['dur'], 'cards', len(cards), 'peak', round(float(np.abs(voice).max()), 3))
for c in cards: print(f"{c['start']:6.2f}-{c['end']:6.2f} {c['spk']} {c['text']}")
