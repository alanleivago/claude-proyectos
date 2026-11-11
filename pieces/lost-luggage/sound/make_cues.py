"""events-all.json -> cues.json for sound-layer mix.py: real Freesound CC0 recordings (chosen with earshot rank / find, see
sfx_pick.json) + kit types for whooshes, pops, taps, clicks and shimmers. Recipe: pieces/guinea-rent/sound/make_cues.py.
The carousel motor runs are in beds.py (a bed under the carousel shots), not cues."""
import json, re, itertools, collections
EV = json.load(open('events-all.json')); PICK = json.load(open('sfx_pick.json'))
F = {k: itertools.cycle(v) for k, v in PICK.items()}
RULES = [(r'conveyor motor', None), (r'boom', 'boom'), (r'box shake', 'boxshake'), (r'clunk', 'clunk'), (r'rubber flaps', 'flaps'), (r'footsteps carpet', 'step'), (r'footsteps', 'step'),
  (r'keyboard', 'typing'), (r'paper flip', 'flip'), (r'paper flutter', 'flutter'), (r'drawer', 'drawer'), (r'paper|cash', 'paper'), (r'rubber stamp', 'stamp'), (r'creak', 'creak'), (r'truck', 'truck'),
  (r'car pass', 'carpass'), (r'dolly', 'dolly'), (r'suitcases rattle', 'roll'), (r'latch', 'latch'), (r'lid open', 'lidopen'), (r'price gun', 'pricegun'), (r'gasp', 'gasp'),
  (r'chicken', 'chicken'), (r'boing', 'boing'), (r'cloth flap', 'socks'), (r'bowling', 'bowling'), (r'soft thump', 'thump2'), (r'heavy thud', 'thud'), (r'sliding door', 'slide'),
  (r'cloth rustle', 'cloth'), (r'cloth swish', 'swish'), (r'beep', 'beep'), (r'drawer', 'drawer'), (r'armor clank', 'visor'), (r'rattle', 'rattle'), (r'hiss', 'hiss'),
  (r'pen writing', 'pen'), (r'zipper', 'zip'), (r'washing', 'washer'), (r'sparkle', 'shimmer'), (r'thump', 'thump'), (r'whoosh soft', 'whoosh_soft'), (r'whoosh', 'whoosh'),
  (r'pop', 'pop'), (r'counter click', 'click'), (r'tap', 'tap'), (r'.', 'tap')]
LIFT = {'step': 1.0, 'pop': 2.5, 'boom': 7.0, 'boxshake': 3.5, 'chicken': 4.0, 'bowling': 4.0, 'gasp': 2.5, 'rattle': 4.5, 'hiss': 4.5, 'truck': 4.0, 'carpass': 2.5,
        'latch': 3.5, 'creak': 3.0, 'flutter': 3.5, 'typing': 2.0, 'pen': 2.5, 'swish': 1.5, 'thump2': 3.0, 'visor': 4.0, 'slide': 3.0, 'drawer': 3.5, 'beep': 3.0, 'stamp': 4.0}
ALIGN = {'slide': 'start', 'typing': 'start', 'washer': 'start', 'pen': 'start', 'dolly': 'start', 'roll': 'start'}
cues, last = [], {}
for i, e in enumerate(EV):
    w = e['what'].lower(); key = next(k for rx, k in RULES if re.search(rx, w))
    if key is None: continue
    soft = key == 'whoosh_soft'; key = 'whoosh' if soft else key
    snd = next(F[key]) if key in F else key
    if last.get(snd, -9) > e['t'] - 0.09: continue
    last[snd] = e['t']
    c = {'id': f'ev-{i:03d}', 't': round(e['t'], 3), 'sound': snd, 'weight': 'hero' if key in ('boom', 'stamp') else 'support', 'lift': 2.0 if soft else LIFT.get(key, 3.0)}
    if 'carpet' in w: c['lift'] = 0.0
    if key in ALIGN: c['align'] = ALIGN[key]
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 60.5, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.45, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 0.6}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}], 'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('_')[0] for c in cues).most_common())
