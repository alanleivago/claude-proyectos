"""events-all.json -> cues.json for sound-layer mix.py: real Freesound CC0 / Wikimedia Commons recordings (chosen with earshot
rank / find / describe / realness, trimmed by cuts.py, see sfx_pick.json) + the kit's real whoosh / swish recordings.
The truck idle, the tea urn, the van and the fire are beds (beds.py), not cues."""
import json, re, itertools, collections
EV = json.load(open('events-all.json')); PICK = json.load(open('sfx_pick.json'))
F = {k: itertools.cycle(v) for k, v in PICK.items()}
RULES = [(r'reversing beep', 'beep'), (r'air brake: truck', 'airbrake'), (r'air brake release', 'airrel'), (r'sparkle', 'sparkle'),
  (r'magic shimmer: books', 'magic'), (r'magic shimmer', 'sparkle'), (r'hydraulic lifter|hydraulic whine', 'hydraulic'), (r'hydraulic short', 'hydraulic_s'),
  (r'lid clatter', 'binlid'), (r'trash bag thud', 'bagthud'), (r'compactor chomp small', 'chomp_s'), (r'compactor chomp', 'chomp'), (r'container thunk', 'thunk'),
  (r'cloth swish', 'swish'), (r'cloth rustle', 'cloth'), (r'landing thud', 'land'), (r'clock clack', 'clack'), (r'bag rustle', 'rustle'), (r'grunt', 'grunt'),
  (r'bag open', 'bagopen'), (r'running', 'step_r'), (r'footsteps wood', 'step_w'), (r'footsteps hard', 'step_r'), (r'footsteps', 'step_s'),
  (r'book handling|books rattle', 'handle'), (r'book thud soft', 'bookdown'), (r'book thud', 'bookthud'), (r'books falling', 'booksfall'), (r'gasp', 'gasp'),
  (r'cab door', 'cabdoor'), (r'metal step', 'metalstep'), (r'crate knock small', 'cratesmall'), (r'crate lid', 'lidopen'), (r'crate', 'crate'),
  (r'door bang', 'doorbang'), (r'glass', 'glass'), (r'dust puff', 'poof'), (r'door close', 'doorclose'), (r'door creak', 'dooropen'), (r'book slide', 'slide'),
  (r'wood creak', 'creak'), (r'yelp', 'yelp'), (r'heavy thud', 'heavythud'), (r'kid', 'kidlaugh'), (r'laugh', 'laugh'), (r'chain', 'chain'),
  (r'sign squeak', 'squeak'), (r'flip counter', 'flap'), (r'beanbag', 'beanbag'), (r'ooh', 'ooh'), (r'bars', 'bars'), (r'page flap', 'page'),
  (r'sob', 'sob'), (r'tissue', 'tissue'), (r'sniff', 'sniff'), (r'bin knock', 'binknock'), (r'marker squeak small', 'marker_strike'), (r'marker squeak', 'marker_strike'),
  (r'marker writing', 'marker_write'), (r'pulls away', 'drive'), (r'sting', 'sting'), (r'metal clunk', 'clunk'), (r'gate slam', 'slam'),
  (r'whoosh soft', 'whoosh_soft'), (r'whoosh', 'whoosh'), (r'.', None)]
LIFT = {'step_s': 0.5, 'step_w': 0.5, 'step_r': 0.5, 'chomp': 7.0, 'chomp_s': 3.5, 'slam': 7.0, 'doorbang': 5.5, 'heavythud': 6.5, 'booksfall': 5.0, 'sob': 5.0,
        'marker_strike': 4.5, 'marker_write': 4.0, 'gasp': 3.0, 'yelp': 3.5, 'laugh': 3.0, 'kidlaugh': 3.0, 'ooh': 4.0, 'hydraulic': 3.5, 'magic': 4.0, 'sting': 4.0,
        'swish': 1.5, 'cloth': 1.0, 'handle': 1.5, 'flap': 2.5, 'beep': 1.5, 'sparkle': 2.0, 'rustle': 1.5, 'bagthud': 3.0, 'bookthud': 3.0, 'creak': 3.5,
        'drive': 3.5, 'crate': 3.5, 'cratesmall': 1.5, 'land': 2.5, 'grunt': 3.0, 'clunk': 3.0, 'airbrake': 2.5, 'airrel': 2.0, 'chain': 3.0, 'squeak': 3.0}
ALIGN = {'sparkle': 'start', 'hydraulic': 'start', 'hydraulic_s': 'start', 'sob': 'start', 'marker_strike': 'start', 'marker_write': 'start', 'drive': 'start', 'sting': 'start',
         'slide': 'start', 'airbrake': 'start', 'booksfall': 'start', 'magic': 'start', 'ooh': 'start', 'kidlaugh': 'start', 'laugh': 'start', 'creak': 'start',
         'rustle': 'start', 'chain': 'start', 'squeak': 'start', 'dooropen': 'start', 'lidopen': 'start', 'cabdoor': 'start'}
HERO = ('chomp', 'slam', 'doorbang', 'heavythud')
# level of each sound's loudest 50 ms against the voice's typical 300 ms level (dB); remix.py renders the SFX at these and
# then rides them >= 5 dB under the voice wherever it speaks (in the gaps they may reach voice - 2 dB)
REL = {'chomp': 0, 'slam': 0, 'doorbang': -2, 'heavythud': 0, 'booksfall': -3, 'sob': -2, 'marker_strike': -4, 'marker_write': -5, 'whoosh': -7,
       'bagthud': -7, 'crate': -7, 'lidopen': -7, 'hydraulic': -6, 'hydraulic_s': -10, 'drive': -4, 'magic': -5, 'sting': -3, 'gasp': -5, 'yelp': -4,
       'laugh': -5, 'kidlaugh': -7, 'ooh': -6, 'bars': -7, 'slide': -8, 'bookthud': -8, 'chain': -8, 'squeak': -8, 'creak': -6, 'cabdoor': -7, 'beep': -10,
       'airbrake': -8, 'airrel': -10, 'clunk': -8, 'flap': -9, 'chomp_s': -7, 'binlid': -8, 'thunk': -8, 'grunt': -7, 'bagopen': -8,
       'swish': -11, 'handle': -11, 'rustle': -11, 'cloth': -12, 'land': -9, 'page': -10, 'tissue': -9, 'sniff': -9, 'bookdown': -10, 'poof': -11, 'glass': -9,
       'cratesmall': -11, 'binknock': -10, 'clack': -10, 'metalstep': -10, 'beanbag': -11, 'sparkle': -10, 'dooropen': -8, 'doorclose': -10,
       'step_s': -14, 'step_w': -14, 'step_r': -13}
PAN = [(r'whip', 0.45), (r'hopper|chomp|hydraulic|lifter|lid clatter|container|blade|beep|air brake|pulls away|gate', 0.3), (r'tea glass', -0.35),
       (r'door bang|door creak|door close', 0.35), (r'into the bin|bin knock|out of the bin', -0.25), (r'cab door|metal step|in the crate', 0.35),
       (r'kid', -0.3), (r'teacher|ooh', 0.2), (r'tissue|pocket|sniff', 0.3), (r'crate down', -0.2), (r'flip counter', 0.15)]
cues, last = [], {}
for i, e in enumerate(EV):
    w = e['what'].lower(); key = next(k for rx, k in RULES if re.search(rx, w))
    if key is None: continue
    soft = key == 'whoosh_soft'; key = 'whoosh' if soft else key
    snd = next(F[key]) if key in F else key
    if last.get(snd, -9) > e['t'] - 0.09: snd = next(F[key]) if key in F else snd   # a run: next take
    if last.get(snd, -9) > e['t'] - 0.09: continue
    last[snd] = e['t']
    c = {'id': f'ev-{i:03d}', 't': round(e['t'], 3), 'sound': snd, 'what': e['what'], 'weight': 'hero' if key in HERO or e['what'].split(':')[0].isupper() else 'support',
         'lift': 1.0 if soft else LIFT.get(key, 3.0), 'rel': -13 if soft else REL.get(key, -10)}
    if 'small' in w or 'far' in w or 'soft' in w and key != 'whoosh': c['lift'] -= 1.5; c['rel'] -= 3
    if key in ALIGN: c['align'] = ALIGN[key]
    if 'avalanche' in w or 'g1' in w: c['rel'] = max(c['rel'], -5)   # the gags in the voice gaps read at voice level
    for rx, pn in PAN:   # screen position / travel direction (a little width; the voice and music stay centred)
        if re.search(rx, w): c['pan'] = pn; break
    if key.startswith('step'): nstep = globals().get('nstep', 0) + 1; globals()['nstep'] = nstep; c['pan'] = 0.18 if nstep % 2 else -0.18
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 61.0, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.45, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 0.6}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}], 'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('.')[0].rstrip('0123456789') for c in cues).most_common())
