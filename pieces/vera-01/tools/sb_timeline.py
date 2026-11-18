"""vera-01 storyboard timeline from the test takes: every shot is cut to its line (speech onset/offset measured at -40 dBFS in voz/<take>.wav).
shot = lead (silence before the voice) + speech + tail; inserts / beats have fixed lengths. Writes work/timeline.json:
{dur, shots: [{id, t0, t1}], lines: [{take, spk, text, shot, at (take start), on, off (speech in film time)}]}.
usage: python tools/sb_timeline.py"""
import json
from pathlib import Path

PIECE = Path(__file__).resolve().parents[1]
LINES = {n[:2]: (n, k, t) for n, k, t in json.loads((PIECE / 'work' / 'lines.json').read_text(encoding='utf-8'))}
D = json.loads((PIECE / 'work' / 'take_durs.json').read_text(encoding='utf-8'))
LEAD, TAIL, MIN = 0.2, 0.25, 1.2
BEAT = {'01': (2.2, 0.45), '13': (0.45, 0.35), '14': (0.75, 0.4), '21': (0.75, 0.35), '23': (0.95, 0.4), '25': (1.8, 0.6),
        '27': (1.4, 0.4), '28': (0.3, 1.1)}                       # (lead, tail) overrides: mosaic-ins, the dramatic pause, the twist hold
FIXED = {'02': 1.3, '29': 3.0}                                    # insert / silent tail

t, shots, lines = 0.0, [], []
for i in range(1, 30):
    sid = f'{i:02d}'
    if sid in FIXED:
        shots.append(dict(id=sid, t0=round(t, 2), t1=round(t + FIXED[sid], 2))); t += FIXED[sid]; continue
    take, spk, text = LINES[sid]; s, e, _ = D[take]; lead, tail = BEAT.get(sid, (LEAD, TAIL))
    on = t + lead; off = on + (e - s); t1 = max(t + MIN, off + tail)
    lines.append(dict(take=take, spk=spk, text=text.replace('...', '…'), shot=sid, at=round(on - s, 3), on=round(on, 2), off=round(off, 2)))
    if sid == '25':   # top-shot insert holds 2.5 s, then 25b (Vera CU) carries "since Monday."
        shots.append(dict(id='25', t0=round(t, 2), t1=round(on + 2.3, 2))); shots.append(dict(id='25b', t0=round(on + 2.3, 2), t1=round(t1, 2))); t = t1; continue
    shots.append(dict(id=sid, t0=round(t, 2), t1=round(t1, 2))); t = t1
out = dict(dur=round(t, 2), shots=shots, lines=lines)
(PIECE / 'work' / 'timeline.json').write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding='utf-8')
print('dur', out['dur'], 's,', len(shots), 'shots, mean', round(t / len(shots), 2), 's/shot')
for x in shots: print(x['id'], x['t0'], x['t1'], round(x['t1'] - x['t0'], 2))
