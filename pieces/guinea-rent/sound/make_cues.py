"""events-all.json -> cues.json for sound-layer mix.py: real Freesound CC0 recordings (guinea pigs, stamps, paper, pen, door,
footsteps, hammer, cardboard, explosion, debris) + kit types for whooshes, pops and taps. Recipe: pieces/cheese-bank/sound."""
import json, re, itertools, glob, collections
EV = json.load(open('events-all.json')); PICK = json.load(open('sfx_pick.json'))   # key -> [files] (chosen with earshot rank)
cyc = lambda fs: itertools.cycle(fs)
F = {k: cyc(v) for k, v in PICK.items()}
RULES = [(r'boom', 'boom'), (r'debris', 'debris'), (r'box shake', 'boxshake'), (r'cardboard', 'cardboard'), (r'sad squeak', 'squeak'), (r'wheek', 'wheek'), (r'squeak', 'squeak'),
  (r'footsteps', 'step'), (r'rubber stamp', 'stamp'), (r'pen writing', 'pen'), (r'paper flip', 'flip'), (r'paper', 'paper'), (r'hammer', 'hammer'), (r'door open', 'door'),
  (r'phone', 'phone'), (r'scurry', 'scurry'), (r'boing', 'boing'), (r'gasp', 'gasp'), (r'heavy thud', 'thud'), (r'soft thump', 'thump2'), (r'cloth swish', 'swish'),
  (r'sparkle', 'shimmer'), (r'thump', 'thump'), (r'whoosh soft', 'whoosh_soft'), (r'whoosh', 'whoosh'), (r'pop', 'pop'), (r'tap', 'click'), (r'.', 'tap')]
LIFT = {'step': 1.5, 'pop': 2.5, 'squeak': 3.5, 'wheek': 3.5, 'boom': 9.0, 'debris': 5.0, 'boxshake': 4.0, 'cardboard': 4.0, 'scurry': 2.0, 'pen': 3.0, 'swish': 1.5, 'thump2': 3.0, 'phone': 2.0}
cues, last = [], {}
for i, e in enumerate(EV):
    w = e['what'].lower(); key = next(k for rx, k in RULES if re.search(rx, w))
    soft = key == 'whoosh_soft'; key = 'whoosh' if soft else key
    snd = next(F[key]) if key in F else key
    if last.get(snd, -9) > e['t'] - 0.09: continue
    last[snd] = e['t']
    cues.append({'id': f'ev-{i:03d}', 't': round(e['t'], 3), 'sound': snd, 'weight': 'hero' if key == 'boom' else 'support', 'lift': 1.0 if soft else LIFT.get(key, 3.0)})
sheet = {'fps': 30, 'duration_s': 60.5, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.45, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 0.6}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}], 'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('_')[0] for c in cues).most_common())
