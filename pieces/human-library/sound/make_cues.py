"""events-*.json (what happens on screen) -> cues.json for sound-layer mix.py: real Freesound CC0 recordings (footsteps,
stamp, paper, pencil, gulp, chuckles, chair, bicycle bell, door, flag), kit types for whooshes, pops and taps.
Beds go to beds.wav (beds.py). Same recipe as pieces/flower-clock/sound."""
import json, re, itertools
EV = sorted([e for s in ['street', 'room'] for e in json.load(open(f'events-{s}.json'))], key=lambda e: e['t'])
cyc = lambda *fs: itertools.cycle(fs)
F = {k: cyc(*v) for k, v in {
  'stepw': [f'fs/stepw_cut{i}.wav' for i in range(6)], 'stepc': [f'fs/stepc_cut{i}.wav' for i in range(6)], 'stamp': ['fs/stamp_470710.mp3'],
  'paper': ['fs/paper_551680.mp3'], 'pencil': ['fs/pencil_761658.mp3'], 'gulp': ['fs/gulp_534336.mp3'], 'laugh': ['fs/laugh_800973.mp3', 'fs/laugh_166134.mp3'],
  'chair': ['fs/chair_232238.mp3'], 'bell': ['fs/bikebell_383602.mp3'], 'door': ['fs/door_811936.mp3'], 'flag': ['fs/flag_cut0.wav', 'fs/flag_cut1.wav']}.items()}
RULES = [  # regex on 'what' -> key of F or kit type
  (r'^bed:|ambience|room tone', None),
  (r'footsteps on wood', 'stepw'), (r'footsteps on cobbles', 'stepc'), (r'rubber stamp', 'stamp'), (r'pencil|scribble', 'pencil'), (r'gulp|swallow', 'gulp'),
  (r'laugh|chuckle', 'laugh'), (r'chair', 'chair'), (r'bicycle bell', 'bell'), (r'door', 'door'), (r'flag', 'flag'), (r'paper|card slide', 'paper'),
  (r'sparkle|twinkle|shimmer', 'shimmer'), (r'thump|thud', 'thump'), (r'whoosh|glide|spin', 'whoosh'), (r'pop', 'pop'), (r'tap|click', 'click'), (r'.', 'tap')]
cues, last = [], {}
for i, e in enumerate(EV):
    w = e['what'].lower(); key = next(k for rx, k in RULES if re.search(rx, w))
    if key is None: continue
    snd = next(F[key]) if key in F else key
    if last.get(snd, -9) > e['t'] - 0.09: continue          # same sound closer than 90 ms: one
    last[snd] = e['t']
    c = {'id': f'ev-{i:03d}', 't': round(e['t'], 3), 'sound': snd, 'weight': 'support'}
    c['lift'] = {'stepw': 1.5, 'stepc': 1.5, 'flag': 1.5, 'laugh': 2.0, 'gulp': 2.0, 'door': 2.0, 'bell': 2.0, 'pop': 2.5}.get(key, 3.0)   # > 0 (mix.py: dB over the bed)
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 61.7, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.5, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.2}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
import collections; print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('_')[0] for c in cues).most_common())
