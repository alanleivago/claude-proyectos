"""events-*.json (what happens on screen) -> cues.json for sound-layer mix.py: real Freesound CC0 recordings where the
kit has nothing real (phone bells, keypad, chewing, gulps, cow, snow steps, laughs, cheers, paper, books, snoring...),
kit types for the rest. Beds go to beds.wav (beds.py). Same recipe as pieces/slow-checkout/sound."""
import json, re, itertools
EV = sorted([e for s in ['world', 'nope', 'north', 'home', 'stuga', 'hq'] for e in json.load(open(f'events-{s}.json'))], key=lambda e: e['t'])
cyc = lambda *fs: itertools.cycle(fs)
F = {k: cyc(*v) for k, v in {
  'ring': ['fs/ring_old_332073.mp3', 'fs/ring_old_509742.mp3'], 'mring': ['fs/ring_mobile_717287.mp3'], 'dial': ['fs/dial_857830.mp3'],
  'chew': ['fs/chew_364923.mp3', 'fs/chew_842099.mp3'], 'gulp': ['fs/gulp_534336.mp3'], 'moo': ['fs/moo_513557.mp3'], 'snow': ['fs/snowstep_384421.mp3'],
  'cheer': ['fs/cheer_858309.mp3', 'fs/cheer_333405.mp3'], 'horn': ['fs/partyhorn_170583.mp3'], 'crumple': ['fs/crumple_461694.mp3'], 'tear': ['fs/tear_710162.mp3', 'fs/tear_343098.mp3'],
  'book': ['fs/bookthud_484900.mp3', 'fs/bookthud_484904.mp3'], 'switch': ['fs/switch_623712.mp3'], 'bin': ['fs/bin_427390.mp3'], 'snore': ['fs/snore_684528.mp3'],
  'typing': ['fs/typing_152956.mp3'], 'bonk': ['fs/bonk_80407.mp3'], 'laugh': ['fs/laugh_800973.mp3', 'fs/laugh_166134.mp3', 'fs/laugh_589850.mp3'],
  'murmur': ['fs/murmur_867051.mp3'], 'paper': ['fs/paper_642770.mp3'], 'sigh': ['fs/sigh_253778.mp3']}.items()}
RULES = [  # regex on 'what' -> key of F or kit type
  (r'^bed:|ambience|room tone', None),
  (r'telephone ring|ring bell', 'ring'), (r'ringing tone', 'mring'), (r'dtmf', 'dial'), (r'chew|munch', 'chew'), (r'gulp|swallow', 'gulp'), (r'moo', 'moo'),
  (r'snow footstep|crunch', 'snow'), (r'cheer|applause', 'cheer'), (r'party horn', 'horn'), (r'crumple', 'crumple'), (r'tear|rip', 'tear'),
  (r'book drop|thud into', 'book'), (r'lever|switch', 'switch'), (r'trash can', 'bin'), (r'snor', 'snore'), (r'typing', 'typing'), (r'bonk', 'bonk'),
  (r'laugh|chuckle|giggle', 'laugh'), (r'murmur|chatter', 'murmur'), (r'sigh|yawn', 'sigh'),
  (r'paper|brochure|rustle|card|flip', 'paper'),
  (r'sparkle|twinkle|shimmer|glint', 'shimmer'), (r'tick|digits|clock', 'tick'), (r'chime|ding|clink|cow bell|bike bell|clank', 'click'),
  (r'thump|thud|slam|stamp|slap|clunk|clap', 'thump'), (r'whoosh|swish|swing|glide|gust|scrape', 'whoosh'), (r'riser', 'riser'),
  (r'pop', 'pop'), (r'click|tap|keypad|drip|drop', 'click'), (r'.', 'tap')]
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
    c['lift'] = {'murmur': 1.0, 'cheer': 1.5, 'snore': 1.5, 'typing': 1.5, 'ring': 2.0, 'mring': 2.0}.get(key, 3.0)   # > 0 (mix.py: dB audible over the bed)
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 61.5, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.5, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.2}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
import collections; print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('_')[0] for c in cues).most_common())
