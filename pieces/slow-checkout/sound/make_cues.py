"""events-*.json (what happens on screen) -> cues.json for sound-layer mix.py: real Freesound CC0 recordings where the
kit has nothing real (scanner, till, laughs, sighs, bike bells, birds, cat...), kit types for the rest. Beds go to beds.wav."""
import json, re, itertools
EV = sorted([e for s in ['storea', 'storeb', 'nl', 'lane'] for e in json.load(open(f'events-{s}.json'))], key=lambda e: e['t'])
cyc = lambda *fs: itertools.cycle(fs)
F = {k: cyc(*v) for k, v in {
  'scan': ['fs/scan_144418.mp3', 'fs/scan_202530.mp3'], 'till': ['fs/till_728224.mp3'], 'laugh': ['fs/laugh_800973.mp3', 'fs/laugh_166134.mp3'],
  'sigh': ['fs/sigh_253778.mp3'], 'chime': ['fs/doorchime_192761.mp3'], 'bike': ['fs/bikebell_383602.mp3', 'fs/bikebell_383627.mp3'],
  'birds': ['fs/birds_234391.mp3'], 'paper': ['fs/paper_642770.mp3'], 'drip': ['fs/sweat_792927.mp3'], 'cat': ['fs/cat_817884.mp3'],
  'murmur': ['fs/murmur_867051.mp3']}.items()}
RULES = [  # regex on 'what' -> key of F or kit type
  (r'^bed:|\(bed|ambience|room tone', None), (r'squeak|screech', 'tap'),
  (r'scan|beep', 'scan'), (r'till|register|receipt|ka-ching|cha-ching', 'till'), (r'laugh|chuckle|giggle|ha ha', 'laugh'), (r'sigh|huff|exhale', 'sigh'),
  (r'door chime|shop bell|ding-dong', 'chime'), (r'bike bell|bicycle bell|bell ring', 'bike'), (r'bird|chirp|gull', 'birds'),
  (r'meow|cat ', 'cat'), (r'sweat|drip|drop', 'drip'), (r'murmur|chatter|crowd', 'murmur'),
  (r'page|paper|photo|card|chart|flip|rustle', 'paper'),
  (r'sparkle|twinkle|glint|shimmer|glow|heart', 'shimmer'), (r'counter|digits|odometer|roll|tick|clock|dial|wheel', 'tick'),
  (r'thunk|thud|slam|stamp|clunk|bump|lands|knock|slap', 'thump'),
  (r'whoosh|swish|swoosh|reach|swing|slide|streak|gust|rush|zip|whip', 'whoosh'), (r'riser|rising|grow|swell', 'riser'),
  (r'pop|puff|pin', 'pop'), (r'click|tap|button|beeps?', 'click'), (r'step|walk|footstep|run|sprint', 'tap'), (r'.', 'tap')]
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
    c['lift'] = {'murmur': 1.0, 'birds': 1.0, 'bike': 1.5, 'drip': 1.5}.get(key, 3.0 if c['weight'] == 'hero' else 3.0)   # > 0 (mix.py: dB audible over the bed)
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 61.5, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.5, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.2}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
import collections; print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('_')[0] for c in cues).most_common())
