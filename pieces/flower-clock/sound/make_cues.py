"""events-*.json (what happens on screen) -> cues.json for sound-layer mix.py: real Freesound CC0 recordings where the
kit has nothing real (phone bells, keypad, chewing, gulps, cow, snow steps, laughs, cheers, paper, books, snoring...),
kit types for the rest. Beds go to beds.wav (beds.py). Same recipe as pieces/slow-checkout/sound."""
import json, re, itertools
EV = sorted([e for s in ['hall', 'out', 'classic', 'floor', 'world', 'date'] for e in json.load(open(f'events-{s}.json'))], key=lambda e: e['t'])
cyc = lambda *fs: itertools.cycle(fs)
F = {k: cyc(*v) for k, v in {
  'button': ['fs/button_874828.mp3', 'fs/button_874829.mp3'], 'buzzer': ['fs/buzzer_259290.mp3'], 'trolley': ['fs/trolley_825813.mp3'],
  'plane': ['fs/plane_805168.mp3'], 'scissors': ['fs/scissors_629513.mp3'], 'gasp': ['fs/gasp_686364.mp3', 'fs/gasp_677888.mp3'], 'stamp': ['fs/stamp_470710.mp3'],
  'tug': ['fs/tug_683807.mp3'], 'gulp': ['fs/gulp_534336.mp3'], 'laugh': ['fs/laugh_800973.mp3', 'fs/laugh_166134.mp3'], 'sigh': ['fs/sigh_253778.mp3'],
  'paper': ['fs/paper_642770.mp3'], 'cheer': ['fs/cheer_858309.mp3']}.items()}
RULES = [  # regex on 'what' -> key of F or kit type
  (r'^bed:|ambience|room tone', None),
  (r'big button press', 'button'), (r'buzzer', 'buzzer'), (r'clock tick', 'tick'), (r'trolley', 'trolley'), (r'airplane|flyby', 'plane'), (r'scissors', 'scissors'),
  (r'gasp', 'gasp'), (r'stamp', 'stamp'), (r'electric cart motor', 'tug'), (r'gulp|swallow', 'gulp'), (r'laugh|chuckle', 'laugh'), (r'sigh|scoff|huff', 'sigh'),
  (r'paper|rustle|card|flip', 'paper'), (r'cheer|applause', 'cheer'),
  (r'sparkle|twinkle|shimmer|glint', 'shimmer'), (r'digits', 'tick'), (r'gavel|thump|thud|slam|clunk|creak', 'thump'), (r'whoosh|swish|swing|glide', 'whoosh'), (r'riser', 'riser'),
  (r'pop', 'pop'), (r'click|tap|drip|drop', 'click'), (r'.', 'tap')]
HERO = set()
cues, last = [], {}
for i, e in enumerate(EV):
    w = e['what'].lower(); key = next(k for rx, k in RULES if re.search(rx, w))
    if key is None: continue
    snd = next(F[key]) if key in F else key
    if last.get(snd, -9) > e['t'] - 0.09: continue          # same sound closer than 90 ms: one
    last[snd] = e['t']
    c = {'id': f'ev-{i:03d}', 't': round(e['t'], 3), 'sound': snd, 'weight': 'hero' if round(e['t'], 2) in HERO else 'support'}
    # levels (approved balance): lift = dB over the music+voice bed; ambient-ish real recordings a bit lower
    c['lift'] = {'tick': 1.5, 'trolley': 1.5, 'plane': 2.0, 'tug': 1.5, 'buzzer': 2.0, 'gasp': 2.0, 'laugh': 2.0}.get(key, 3.0)   # > 0 (mix.py: dB audible over the bed)
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 61.5, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.5, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.2}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
import collections; print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('_')[0] for c in cues).most_common())
