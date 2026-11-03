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
  'stepw': [f'fs/stepw_cut{i}.wav' for i in range(6)], 'stepc': [f'fs/stepc_cut{i}.wav' for i in range(6)], 'stamp': pick('stamp'),
  'pencil': pick('pencil'), 'laugh': pick('laugh', 2), 'chair': pick('chair'), 'plate': ['fs/plate_128285.mp3'], 'clink': ['fs/clink_568758.mp3', 'fs/clink_568757.mp3'], 'cutlery': pick('cutlery'),
  'chalk': pick('chalk'), 'applause': ['fs/applause_483545.mp3'], 'crowd': ['fs/crowdlaugh_538223.mp3'], 'chew': ['fs/chew_467625.mp3'], 'kbell': pick('kbell'), 'noren': pick('noren'), 'slide': ['fs/slide_726355.mp3'], 'boom': ['fs/boom_840508.mp3'], 'bass': ['fs/boom_617043.mp3'], 'debris': ['fs/debris_675851.mp3'], 'screama': ['fs/scream_751702.mp3'], 'screamb': ['fs/scream_697545.mp3']}.items()}
RULES = [  # regex on 'what' -> key of F or kit type
  (r'boom explosion', 'boom'), (r'bass impact', 'bass'), (r'debris', 'debris'), (r'scream a', 'screama'), (r'scream b', 'screamb'),
  (r'footsteps on wood', 'stepw'), (r'footsteps on stone', 'stepc'), (r'rubber stamp', 'stamp'), (r'pencil|scribble', 'pencil'), (r'crowd laughter', 'crowd'),
  (r'laugh|chuckle', 'laugh'), (r'chair', 'chair'), (r'plate down', 'plate'), (r'spoon clink: the spoon', 'cutlery'), (r'clink', 'clink'), (r'chalk', 'chalk'),
  (r'applause', 'applause'), (r'chew', 'chew'), (r'kitchen bell', 'kbell'), (r'cloth swish', 'noren'), (r'sliding door', 'slide'),
  (r'sparkle|twinkle|shimmer', 'shimmer'), (r'thump|thud', 'thump'), (r'whoosh|glide|spin', 'whoosh'), (r'pop', 'pop'), (r'tick', 'click'), (r'tap|click', 'click'), (r'.', 'tap')]
cues, last = [], {}
for i, e in enumerate(EV):
    w = e['what'].lower(); key = next(k for rx, k in RULES if re.search(rx, w))
    if key is None: continue
    snd = next(F[key]) if key in F else key
    if last.get(snd, -9) > e['t'] - 0.09: continue          # same sound closer than 90 ms: one
    last[snd] = e['t']
    c = {'id': f'ev-{i:03d}', 't': round(e['t'], 3), 'sound': snd, 'weight': 'support'}
    c['lift'] = {'stepw': 1.5, 'stepc': 1.5, 'laugh': 2.0, 'crowd': 2.0, 'applause': 2.0, 'chew': 2.5, 'noren': 1.5, 'pop': 2.5, 'boom': 9.0, 'bass': 8.0, 'debris': 5.0, 'screama': 4.0, 'screamb': 4.0}.get(key, 3.0)   # > 0 (mix.py: dB over the bed)
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 61.0, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.5, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 0 if ALT else 1.2}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues_boom.json' if ALT else 'cues.json', 'w'), indent=1)
import collections; print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('_')[0] for c in cues).most_common())
