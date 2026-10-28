"""events-*.json (what happens on screen) -> cues.json for sound-layer mix.py: real Freesound CC0 recordings where the
kit has nothing real (gulls, thunder, waves, splashes, dog, Lego plastic...), kit types for the rest. Beds go to beds.wav."""
import json, re, itertools
EV = sorted([e for s in ['lib', 'room', 'forest', 'print'] for e in json.load(open(f'events-{s}.json'))], key=lambda e: e['t'])
cyc = lambda *fs: itertools.cycle(fs)
F = {k: cyc(*v) for k, v in {
  'page': ['fs/page_136778.mp3', 'fs/page_397548.mp3', 'fs/page_457767.mp3'], 'drawer': ['fs/drawer_486082.mp3', 'fs/drawer_360949.mp3'],
  'step': ['tap'], 'saw': ['fs/saw_519661.mp3'], 'pen': ['fs/pen_211247.mp3', 'fs/pen_82610.mp3'], 'mailbox': ['fs/mailbox_611284.mp3'],
  'key': ['fs/keyclick_157766.mp3', 'fs/keyclick_585982.mp3'], 'chain': ['fs/chain_593458.mp3', 'fs/chain_368995.mp3'],
  'glass': ['fs/glassknock_368682.mp3', 'fs/glassknock_368680.mp3'], 'pop': ['fs/pop_245645.mp3', 'pop'], 'sparkle': ['fs/sparkle_511485.mp3', 'shimmer'],
  'wood': ['fs/thunk_495645.mp3', 'fs/thunk_495644.mp3'], 'shredder': ['fs/machine_205653.mp3']}.items()}
RULES = [  # regex on 'what' -> key of F or kit type
  (r'^bed:|\(bed|ambience', None), (r'squeak', 'tap'),
  (r'page|paper|sheet|envelope|card|flap|flip', 'page'), (r'drawer|chest lid|lid shuts', 'drawer'), (r'saw', 'saw'),
  (r'pen |scribble|chalk|writing|marker', 'pen'), (r'mailbox', 'mailbox'), (r'trackpad|keyboard|refresh|click', 'key'),
  (r'chain|jingle', 'chain'), (r'glass|bonk|knock', 'glass'), (r'machine|gulps|rumble', 'shredder'),
  (r'sparkle|twinkle|glint|shimmer|glow|chime', 'sparkle'),
  (r'counter|odometer|wheels|digits|ratchet|tick|dial', 'tick'), (r'thunk|thud|slam|platen|stamp|clunk|lock engages|padlock|snap', 'thump'),
  (r'whoosh|swish|swoosh|reach|swing|slide|streak|gust|rush|rustle', 'whoosh'), (r'riser|rising|grow', 'riser'),
  (r'pop|sprout|puff|dot', 'pop'), (r'nod|wooden|tap', 'wood'), (r'step|walk|footstep', 'step'), (r'.', 'tap')]
HERO = set()
cues, last = [], {}
for i, e in enumerate(EV):
    w = e['what'].lower(); key = next(k for rx, k in RULES if re.search(rx, w))
    if key is None: continue
    snd = next(F[key]) if key in F else key
    if last.get(snd, -9) > e['t'] - 0.09: continue          # same sound closer than 90 ms: one
    last[snd] = e['t']
    c = {'id': f'ev-{i:03d}', 't': round(e['t'], 3), 'sound': snd, 'weight': 'hero' if round(e['t'], 2) in HERO else 'support'}
    # levels (user 2026-10-25: SFX were as loud as the voice, gulls too loud): lift = dB over the music+voice bed
    c['lift'] = {'saw': 1.0, 'shredder': 1.0, 'chain': 1.5}.get(key, 3.0 if c['weight'] == 'hero' else 3.0)   # > 0 (mix.py: dB audible over the bed)
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 61.5, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.5, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.2}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
import collections; print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('_')[0] for c in cues).most_common())
