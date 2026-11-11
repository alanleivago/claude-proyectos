"""events-all.json (what happens on screen) -> cues.json for sound-layer mix.py: real Freesound CC0 recordings (footsteps,
stamp, paper, pencil, gulp, chuckles, chair, bicycle bell, door, flag), kit types for whooshes, pops and taps.
Beds go to beds.wav (beds.py). Same recipe as pieces/flower-clock/sound."""
import json, re, itertools
import glob
import os
ALT = os.environ.get('ALT') == '1'
EV = json.load(open('events-boom.json' if ALT else 'events-all.json'))
cyc = lambda *fs: itertools.cycle(fs)
pick = lambda k, n=1: (sorted(glob.glob(f'fs/{k}_*.mp3')) or ['MISSING'])[:n]
F = {k: cyc(*v) for k, v in {
  'stepw': [f'fs/stepw_cut{i}.wav' for i in range(6)], 'stepc': [f'fs/stepc_cut{i}.wav' for i in range(6)], 'stamp': pick('stamp'), 'paper': pick('paper'),
  'laugh': pick('laugh', 2), 'chair': pick('chair'), 'knock': ['fs/knock_369710.wav'], 'sniff': pick('sniff', 3), 'truck': pick('truck'),
  'clunk': ['fs/clunk2_94130.mp3'], 'creak': pick('creak'), 'slam': ['fs/clunk2_94130.mp3'], 'slamhit': ['fs/slamhit_531862.wav'], 'cashreg': pick('cashreg', 2),
  'flip': pick('flip', 3), 'slap': pick('slap'), 'brush': ['fs/brush_559696.mp3'], 'thud': ['fs/thud_536766.mp3'], 'scrape': pick('scrape'),
  'rustle': (pick('rustle') + pick('rustle2'))[:1], 'swish': pick('swish', 2)}.items()}
RULES = [  # regex on 'what' -> key of F or kit type
  (r'footsteps on marble', 'stepw'), (r'footsteps on stone', 'stepc'), (r'rubber stamp', 'stamp'), (r'paper flip', 'flip'), (r'paper slap', 'slap'), (r'paper', 'paper'),
  (r'laugh|chuckle', 'laugh'), (r'chair', 'chair'), (r'knock', 'knock'), (r'sniff', 'sniff'), (r'truck', 'truck'), (r'clunk', 'clunk'), (r'creak', 'creak'),
  (r'door slam', 'slam'), (r'slam hit', 'slamhit'), (r'neon', 'shimmer'), (r'cash register', 'cashreg'), (r'brush', 'brush'), (r'heavy thud', 'thud'), (r'scrape', 'scrape'), (r'money rustle', 'rustle'),
  (r'trombone', None), (r'cloth swish', 'swish'), (r'sparkle|twinkle|shimmer', 'shimmer'), (r'thump|thud', 'thump'), (r'whoosh soft', 'whoosh_soft'),
  (r'whoosh|glide|spin', 'whoosh'), (r'pop', 'pop'), (r'tick', 'click'), (r'tap|click', 'click'), (r'.', 'tap')]
cues, last = [], {}
for i, e in enumerate(EV):
    w = e['what'].lower(); key = next(k for rx, k in RULES if re.search(rx, w))
    if key is None: continue
    soft = key == 'whoosh_soft'; key = 'whoosh' if soft else key
    snd = next(F[key]) if key in F else key
    if snd == 'MISSING': print('MISSING', e); continue
    if last.get(snd, -9) > e['t'] - 0.09: continue          # same sound closer than 90 ms: one
    last[snd] = e['t']
    c = {'id': f'ev-{i:03d}', 't': round(e['t'], 3), 'sound': snd, 'weight': 'support'}
    c['lift'] = 1.0 if soft else {'stepw': 1.5, 'stepc': 1.5, 'laugh': 2.0, 'crowd': 2.0, 'applause': 2.0, 'chew': 2.5, 'noren': 1.5, 'pop': 2.5, 'truck': 3.5, 'slam': 5.0, 'slamhit': 3.0, 'brush': 2.0, 'sniff': 3.0}.get(key, 3.0)   # > 0 (mix.py: dB over the bed)
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 60.5, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.5, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.0}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues_boom.json' if ALT else 'cues.json', 'w'), indent=1)
import collections; print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('_')[0] for c in cues).most_common())
