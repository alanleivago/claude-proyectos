"""events-all.json -> cues.json for sound-layer mix.py: real Freesound CC0 recordings (chosen with earshot rank / find /
describe / realness, trimmed by cuts.py, see sfx_pick.json) + the kit's real whoosh / swish / paper / pop / key recordings.
The arena crowd, the printing press, the reporters' typewriter, the sign hum and the cart wheels are beds (beds.py), not cues."""
import json, re, itertools, collections, subprocess
# the house pizzicato (61.4 s) stretched 2.2 % (atempo, pitch kept) to 62.8 s, so its last note lands on the jacket hung back (62.4-62.46) and
# the song ends under the rev-4 meme explosion (62.45-64.2: the clip's own audio carries the end)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '../../../styles/cartoon3d/audio/music_bed_529008.flac', '-af', f'atempo={61.4 / 62.8:.5f}', '-ar', '48000', 'music_bed.wav'], check=True)
EV = json.load(open('events-all.json')); PICK = json.load(open('sfx_pick.json'))
F = {k: itertools.cycle(v) for k, v in PICK.items()}
RULES = [(r'crowd cheer', 'cheer'), (r'big whoosh', 'flyby'), (r'hydraulic', 'hydraulic'), (r'magic shimmer', 'magic'), (r'lever clunk|metal clunk small|lever', 'clunk_s'),
  (r'metal clunk', 'clunk'), (r'led blip small|led beep small', 'led_s'), (r'led blip', 'led'), (r'pop', 'pop'), (r'landing thud', 'land'), (r'cloth swish', 'swish'),
  (r'cloth rustle', 'cloth'), (r'paper unfold', 'unfold'), (r'paper handle', 'paper'), (r'spotlight clunk', 'spot'), (r'screen off|screens off', 'screenoff'),
  (r'crowd ooh', 'ooh'), (r'light switch', 'switch'), (r'leather rustle', 'leather'), (r'sparkle ting', 'ting'), (r'sparkle', 'sparkle'), (r'clapping', 'clap'),
  (r'calendar tear', 'tear'), (r'paper flutter', 'flutter'), (r'paper slide|card slide', 'slide'), (r'stamp slam: no relation', 'stamp'), (r'alleged stamp', 'alleged'), (r'doors swing', 'doors'), (r'meme explosion', 'explosion'), (r'ink splat', 'splat'),
  (r'sign flicker', 'flick'), (r'pin tap', 'pin'), (r'cash rain', 'cashrain'), (r'cash bundle', 'cashthud'), (r'crowd gasp', 'crowdgasp'), (r'gasp', 'gasp'),
  (r'press dead stop', 'pressstop'), (r'tv switch', 'tvswitch'), (r'static small', 'static_s'), (r'static', 'static'), (r'flip card|flip counter', 'flap'),
  (r'key press', 'key'), (r'send key', 'send'), (r'chair creak', 'creak'), (r'phone buzz', 'buzz'), (r'chair swivel', 'swivel'), (r'cord tap', 'cord'),
  (r'blinds', 'blinds'), (r'folder slam', 'folder'), (r'glasses rattle', 'glasses'), (r'cup clink', 'cup'), (r'glass clink', 'glass'),
  (r'mug clatter', 'mug'), (r'coffee splash', 'splash'), (r'ticker', 'beep'), (r'marker', 'marker'), (r'footsteps carpet', 'step_c'), (r'footsteps wood', 'step_w'),
  (r'ski clack', 'skiclack'), (r'ski landing', 'skiland'), (r'ski run', 'ski'), (r'glass shatter', 'shatter'), (r'wind rush', 'wind'), (r'glass tinkle', 'tinkle'),
  (r'cart rattle', 'cartin'), (r'cardboard', 'cardboard'), (r'mop stroke', 'mop'), (r'bucket', 'bucket'), (r'hanger', 'hanger'), (r'trombone', 'trombone'),
  (r'paper land', 'pagein'), (r'filed stamp', 'filed'), (r'whoosh soft', 'whoosh_soft'), (r'whoosh', 'whoosh'), (r'swish', 'swish'), (r'.', None)]
LIFT = {'explosion': 7.0, 'alleged': 5.0, 'doors': 4.0, 'step_c': 0.5, 'step_w': 0.5, 'key': 0.5, 'stamp': 7.0, 'filed': 7.0, 'folder': 7.0, 'shatter': 7.0, 'buzz': 4.0, 'cheer': 4.0, 'flyby': 5.0, 'spot': 4.5,
        'mug': 4.5, 'splash': 4.0, 'pressstop': 4.5, 'ting': 4.0, 'tear': 4.0, 'flick': 4.0, 'blinds': 4.0, 'skiland': 4.0, 'ski': 4.0, 'trombone': 4.0, 'hanger': 3.5,
        'swish': 1.5, 'cloth': 1.0, 'paper': 1.5, 'flap': 2.5, 'led': 2.0, 'led_s': 1.5, 'pop': 1.5, 'beep': 2.0, 'sparkle': 2.0, 'gasp': 3.0, 'crowdgasp': 3.5}
ALIGN = {'explosion': 'start', 'doors': 'start', 'cheer': 'start', 'hydraulic': 'start', 'magic': 'start', 'unfold': 'start', 'screenoff': 'start', 'ooh': 'start', 'clap': 'start', 'tear': 'start',
         'slide': 'start', 'flick': 'start', 'cashrain': 'start', 'crowdgasp': 'start', 'gasp': 'start', 'static': 'start', 'creak': 'start', 'buzz': 'start',
         'swivel': 'start', 'blinds': 'start', 'glasses': 'start', 'marker': 'start', 'ski': 'start', 'wind': 'start', 'cartin': 'start', 'trombone': 'start',
         'leather': 'start', 'sparkle': 'start', 'ting': 'start', 'flutter': 'start', 'mop': 'start'}
HERO = ('stamp', 'filed', 'folder', 'shatter', 'flyby', 'spot', 'explosion')
# level of each sound's loudest 50 ms against the voice's typical 300 ms level (dB); remix.py renders the SFX at these and
# then rides them >= 5 dB under the voice wherever it speaks (in the gaps they may reach voice - 2 dB)
REL = {'explosion': 4, 'alleged': -3, 'doors': -5, 'stamp': 0, 'filed': 0, 'folder': 0, 'shatter': 2, 'flyby': -3, 'cheer': -4, 'spot': -4, 'buzz': -4, 'mug': -5, 'splash': -5, 'pressstop': -5,
       'ting': -4, 'tear': -5, 'flick': -6, 'blinds': -5, 'skiland': -3, 'ski': -1, 'wind': -3, 'trombone': -4, 'hanger': -5, 'bucket': -6, 'crowdgasp': -5,
       'gasp': -6, 'ooh': -6, 'clap': -8, 'whoosh': -7, 'hydraulic': -6, 'magic': -7, 'clunk': -6, 'clunk_s': -9, 'led': -9, 'led_s': -12, 'pop': -11,
       'land': -9, 'swish': -11, 'cloth': -12, 'unfold': -8, 'paper': -10, 'screenoff': -8, 'switch': -9, 'leather': -8, 'sparkle': -9, 'flutter': -9,
       'slide': -8, 'splat': -9, 'pin': -6, 'cashrain': -6, 'cashthud': -10, 'tvswitch': -7, 'static': -8, 'static_s': -11, 'flap': -8, 'key': -12, 'send': -5,
       'creak': -9, 'swivel': -7, 'cord': -11, 'glasses': -6, 'cup': -9, 'glass': -8, 'beep': -9, 'marker': -9, 'step_c': -14, 'step_w': -13,
       'skiclack': -9, 'tinkle': -10, 'cartin': -8, 'cardboard': -9, 'mop': -9, 'pagein': -6}
PAN = [(r'whip', 0.45), (r'chip|lift', 0.0), (r'calendar cell|bars grow|chip icon|year flick', 0.15), (r'lever|press dead', -0.35), (r'pin tap|singapore|red string', 0.3),
       (r'cash', 0.2), (r'alleged|doors|agent', -0.3), (r'tv switch|static burst: to|a smear', -0.3), (r'flip card', 0.25), (r'phone buzz', 0.0), (r'chair swivel', 0.2), (r'blinds', 0.15),
       (r'glasses|cup clink', -0.25), (r'mug|coffee', -0.2), (r'shatter|tinkle|takeoff', 0.35), (r'cart|cardboard', 0.3), (r'bucket|mop', -0.25), (r'hanger', 0.2)]
GAGS = [(32.0, 32.94), (50.30, 51.28), (60.56, 64.2)]   # G1 SEND / phones, G2 ski run, the closing jacket gag
cues, last, nstep, nbuzz = [], {}, 0, 0
for i, e in enumerate(EV):
    w = e['what'].lower(); key = next(k for rx, k in RULES if re.search(rx, w))
    if key is None: continue
    soft = key == 'whoosh_soft'; key = 'whoosh' if soft else key
    snd = next(F[key]) if key in F else key
    if last.get(snd, -9) > e['t'] - 0.09: snd = next(F[key]) if key in F else snd   # a run: next take
    if last.get(snd, -9) > e['t'] - 0.09 and key != 'key': continue
    last[snd] = e['t']
    c = {'id': f'ev-{i:03d}', 't': round(e['t'], 3), 'sound': snd, 'what': e['what'], 'weight': 'hero' if key in HERO or e['what'].split(':')[0].isupper() else 'support',
         'lift': 1.0 if soft else LIFT.get(key, 3.0), 'rel': -13 if soft else REL.get(key, -10)}
    if 'small' in w or 'far' in w or 'soft' in w and key != 'whoosh': c['lift'] = max(0.5, c['lift'] - 1.5); c['rel'] -= 3
    if key in ALIGN: c['align'] = ALIGN[key]
    if any(g0 <= e['t'] < g1 for g0, g1 in GAGS): c['rel'] += 4   # the wordless gags read near the voice level (the rider caps them at voice - 2 dB)
    if key == 'explosion': c.update(free=True, lu=-1.0)   # rev 4 final hit: the clip's own audio at voice -1 LU (remix.py: not ridden, master limiter only)
    if key == 'trombone': c['pitch'] = -1   # A4 wah -> G#4 (the pizzicato bed sits on C / G / G#)
    if key == 'buzz': nbuzz += 1; c['pan'] = [-0.3, 0.3, 0.0][nbuzz % 3]   # phones all over the floor
    for rx, pn in PAN:   # screen position / travel direction (a little width; the voice and music stay centred)
        if 'pan' not in c and re.search(rx, w): c['pan'] = pn; break
    if key.startswith('step') or key == 'key': nstep += 1; c['pan'] = 0.15 if nstep % 2 else -0.15
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 64.2, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.45, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 0.3}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}], 'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('.')[0].rstrip('0123456789') for c in cues).most_common())
