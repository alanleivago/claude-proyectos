"""airy-scp-01 film timeline: voz/takes.json + voz/<id>.wav -> engine/film_timeline.json + voz/voice.wav (48 kHz mono, git-ignored).
passthesalt pace: every reply starts GAP s after the previous one ends (speech span: 20 ms RMS above max(-45 dBFS, peak - 30 dB));
the only silences are after 23 ("...Oh.", 1.0 s) and row 32 (2.0 s silent two-shot), plus TAIL s after 33 (black + stone crack).
- shots: one per GUION row, ids '01'..'33'; each cut lands CUT s before the next voice (always inside the gap, never on speech).
- lines: {take, spk, text, shot, at (film time of the take's first sample), on, off, spans, words [[word, t0, t1]] in film time}.
- cards (UpNext subtitles): one per phrase (split after . ? …), timed by the Whisper words, else the take's own pauses, else by characters;
  start 0.1 s before the phrase, typed at 85 %, held until the next card or +0.5 s. Row 23 has no card.
- mouth: {'airy': '0120…', 'guard': '…'} 30 fps levels 0/1/2 from each speaker's voice envelope.
Speaker keys = the engine's character kinds: 'airy', 'guard'.
usage: .venv/bin/python pieces/airy-scp-01/tools/film_timeline.py"""
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

PIECE = Path(__file__).resolve().parents[1]
SR, FPS = 48000, 30
LEAD0, GAP, CUT, TAIL = 0.25, 0.18, 0.08, 1.2
GAP_AFTER = {'23': 0.35}                  # "...Oh." then a short beat (review note #8: 1.0 s was too long)
MIN_DUR = 61.0                            # if the dialogue comes out shorter, the missing time goes ONLY into the silent row 32
SILENT = {'32': 2.0}                      # rows with no line: base shot length (row 32 may grow to reach MIN_DUR)
NOCARD = {'23'}
TAKES = {x['take']: x for x in json.loads((PIECE / 'voz' / 'takes.json').read_text(encoding='utf-8'))}
ROWS = [f'{i:02d}' for i in range(1, 34)]


def load(take):
    a, sr = sf.read(str(PIECE / 'voz' / f'{take}.wav'), dtype='float32', always_2d=True); a = a.mean(1)
    return resample_poly(a, SR, sr).astype(np.float32) if sr != SR else a


def span(a):
    w = int(SR * 0.02); h = w // 2
    e = 20 * np.log10(np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) + 1e-9 for i in range(0, len(a) - w, h)]))
    idx = np.where(e > max(-45, e.max() - 30))[0]
    return idx[0] * h / SR, (idx[-1] * h + w) / SR


def env(a, win=0.02):
    w = int(SR * win); return np.sqrt(np.convolve(a ** 2, np.ones(w) / w, 'same'))


# ---- placement ----
audio = {sid: load(sid) for sid in ROWS if sid not in SILENT}


def place(extra32=0.0):
    prev_off, pending, shots, lines = None, 0.0, [], []
    for sid in ROWS:
        if sid in SILENT:   # the silent two-shot starts CUT after the previous line ends
            t0 = prev_off + (GAP - CUT); shots.append(dict(id=sid, t0=t0, spk=None, text='')); pending = t0 + SILENT[sid] + extra32; continue
        X = TAKES[sid]; s, e = span(audio[sid])
        if prev_off is None: on = LEAD0
        elif pending: on = pending + CUT; pending = 0.0
        else: on = prev_off + GAP_AFTER.get(lines[-1]['shot'], GAP)
        at = on - s; off = at + e
        t0 = 0.0 if not shots else on - CUT
        shots.append(dict(id=sid, t0=t0, spk=X['spk'], text=X['line'].replace('...', '…')))
        words = [[w, round(max(at + w0, on), 3), round(min(at + w1, off), 3)] for w, w0, w1 in X['words']]
        lines.append(dict(take=sid, spk=X['spk'], text=X['line'].replace('...', '…'), shot=sid, at=round(at, 3), on=round(on, 3), off=round(off, 3), words=words))
        prev_off = off
    return shots, lines, round(prev_off + TAIL, 2)


shots, lines, dur = place()
EXTRA32 = 0.0
if dur < MIN_DUR: EXTRA32 = round(MIN_DUR - dur + 0.01, 2); shots, lines, dur = place(EXTRA32)   # breathing room only before 33
for i, x in enumerate(shots):
    x['t1'] = shots[i + 1]['t0'] if i + 1 < len(shots) else dur
    x['t0'], x['t1'] = round(x['t0'], 3), round(x['t1'], 3)
    shots[i] = dict(id=x['id'], t0=x['t0'], t1=x['t1'], spk=x['spk'], text=x['text'])

# ---- voice track, cards, mouth ----
N = int((dur + 1) * SR); voice = np.zeros(N, np.float32); spk_env = {'airy': np.zeros(N, np.float32), 'guard': np.zeros(N, np.float32)}
cards = []
for L in lines:
    a = audio[L['take']]; i = int(round(L['at'] * SR)); voice[i:i + len(a)] += a[:N - i]; spk_env[L['spk']][i:i + len(a)] += np.abs(a[:N - i])
    parts = [p.strip() for p in re.split(r'(?<=[.?!…])\s+', L['text']) if p.strip()]
    e = env(a); thr = max(e.max() * 10 ** (-30 / 20), 10 ** (-45 / 20)); on = e > thr
    segs, s0, gap, last = [], None, 0, 0   # speech segments separated by >= 120 ms of silence
    for k in range(0, len(on), 240):
        if on[k]:
            if s0 is None: s0 = k
            gap = 0; last = k
        elif s0 is not None:
            gap += 240
            if gap >= int(0.12 * SR): segs.append((s0, last)); s0 = None
    if s0 is not None: segs.append((s0, last))
    nt = [len(p.replace('…', ' ').split()) for p in parts]; W = L['words']
    if len(parts) > 1 and len(W) == sum(nt):   # Whisper words line up with the script words: phrase = its own words
        spans, k = [], 0
        for n in nt: spans.append((W[k][1], W[k + n - 1][2])); k += n
        spans[-1] = (spans[-1][0], max(spans[-1][1], L['off']))
    elif len(parts) > 1 and len(segs) >= len(parts):   # merge segments down to one per phrase (biggest pauses kept)
        while len(segs) > len(parts):
            gaps = [segs[j + 1][0] - segs[j][1] for j in range(len(segs) - 1)]; j = int(np.argmin(gaps)); segs[j:j + 2] = [(segs[j][0], segs[j + 1][1])]
        spans = [(L['at'] + a0 / SR, L['at'] + a1 / SR) for a0, a1 in segs]
    else:   # by characters inside the spoken span
        tot = sum(len(p) for p in parts); t = L['on']; spans = []
        for p in parts: d = (L['off'] - L['on']) * len(p) / tot; spans.append((t, t + d)); t += d
    L['spans'] = [[round(x, 3), round(y, 3)] for x, y in spans]
    if L['take'] in NOCARD: continue
    for p, (t0, t1) in zip(parts, spans):
        cards.append(dict(text=p, spk=L['spk'], shot=L['shot'], start=round(t0 - 0.1, 3), typed=round(t0 + 0.85 * (t1 - t0), 3), spoken_end=round(t1, 3)))
for k, c in enumerate(cards):
    nxt = cards[k + 1]['start'] if k + 1 < len(cards) else 1e9
    c['end'] = round(min(nxt, c['spoken_end'] + 0.5), 3); c['typed'] = min(c['typed'], c['end'])
mouth = {}
for s, ev in spk_env.items():
    lv = []
    for f in range(int(dur * FPS) + 1):
        seg = ev[int(f / FPS * SR): int((f + 1) / FPS * SR)]; v = float(seg.mean()) if len(seg) else 0
        lv.append(0 if v < 0.012 else 1 if v < 0.05 else 2)
    mouth[s] = ''.join(map(str, lv))
out = dict(dur=dur, fps=FPS, speakers={'airy': 'AIRY 60ea9b99', 'guard': 'GUARD 8bd4e6c7'}, shots=shots, lines=lines, cards=cards, mouth=mouth)
(PIECE / 'engine' / 'film_timeline.json').write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding='utf-8')
sf.write(str(PIECE / 'voz' / 'voice.wav'), voice[:int(dur * SR)], SR, subtype='PCM_24')

# ---- report ----
nw = sum(len(L['text'].replace('…', ' ').split()) for L in lines)
for s in shots[1:]:   # every cut on silence
    for L in lines:
        if L['on'] < s['t0'] < L['off']: print('WARNING cut', s['id'], s['t0'], 'inside', L['take'])
gaps = [round(float(lines[i + 1]['on'] - lines[i]['off']), 2) for i in range(len(lines) - 1)]
print(f"row 32 extra {EXTRA32} s | dur {dur} s | {len(shots)} shots | {len(cards)} cards | {nw} words -> {nw / dur:.2f} w/s overall | peak {np.abs(voice).max():.3f}")
print('gaps', gaps)
for s in shots:
    L = next((x for x in lines if x['shot'] == s['id']), None)
    print(f"{s['id']} {s['t0']:6.2f}-{s['t1']:6.2f} " + (f"{L['spk']:5s} voice {L['on']:6.2f}-{L['off']:6.2f}  {L['text']}" if L else '(silent)'))
