"""events-*.json (what happens on screen) -> cues.json for sound-layer mix.py: real Freesound CC0 recordings where the
kit has nothing real (gulls, thunder, waves, splashes, dog, Lego plastic...), kit types for the rest. Beds go to beds.wav."""
import json, re, itertools
EV = sorted([e for s in ['beach', 'storm', 'sea', 'hunt'] for e in json.load(open(f'events-{s}.json'))], key=lambda e: e['t'])
cyc = lambda *fs: itertools.cycle(fs)
F = {k: cyc(*v) for k, v in {
  'gull': ['fs/gull_479595.mp3', 'fs/gull_861350.mp3', 'fs/gull_836859.mp3'], 'thunder': ['fs/thunder_193170.mp3'],
  'crash': ['fs/wave_crash_789511.mp3'], 'splash': ['fs/splash_big_442773.mp3', 'fs/splash_big_9508.mp3', 'fs/splash_big_398032.mp3'],
  'bark': ['fs/dog_bark_630648.mp3'], 'pant': ['fs/dog_pant_841349.mp3'], 'gasp': ['fs/crowd_gasp_333412.mp3', 'fs/crowd_gasp_763988.mp3'],
  'alarm': ['fs/alarm_bell_418705.mp3'], 'popper': ['fs/confetti_26349.mp3'], 'lego': ['fs/lego_rattle_398512.mp3', 'fs/lego_rattle_398509.mp3'],
  'legobig': ['fs/lego_rattle_398502.mp3'], 'page': ['fs/paper_flip_484933.mp3', 'fs/paper_flip_484940.mp3'],
  'sparkle': ['fs/sparkle_511485.mp3', 'shimmer'], 'bubbles': ['fs/bubbles_718503.mp3', 'pop'], 'creak': ['fs/container_scrape_530486.mp3'],
  'metal': ['fs/container_scrape_530486.mp3'], 'chain': ['fs/metal_chain_386174.mp3']}.items()}
RULES = [  # regex on 'what' -> key of F or kit type
  (r'^bed:|\(bed|beach bed\)|surf and wind|evening surf|ribbons hum', None),
  (r'gull, distant|^seagull cry$', 'gull'), (r'gull', None), (r'thunder|lightning', 'thunder'), (r'wave crash|smashes into the bow|slams the bow|breaker crashes|massive wave|wave breaks|storm waves crashing', 'crash'),
  (r'splash', 'splash'), (r'bark', 'bark'), (r'pant', 'pant'), (r'gasp|scream|shout|yell', 'gasp'), (r'alarm bell', 'alarm'),
  (r'confetti cannon', 'popper'), (r'avalanche|cascade|bucket full|big clatter|pieces rattle|tumbling and click|tumbling and clatter', 'legobig'),
  (r'lego|plastic|brick|dragon clatters|plink|clack', 'lego'), (r'page|paper|calendar|flutter|confetti', 'page'),
  (r'whir|ticking|odometer|reels spinning|flip board|split-flap|tally|scribble|string pulled', 'tick'),
  (r'sparkle|twinkle|glint|shimmer|glow|swells', 'sparkle'), (r'bubble|bloop|blub|gulp', 'bubbles'),
  (r'into sand|rubbery|bucket handle|cloth|rustle', 'tap'),
  (r'creak|groan|shudder|rattle', 'creak'), (r'screech|scrape|burst open|metal bang', 'metal'), (r'chain', 'chain'),
  (r'riser|bursts up|rising|builds|roar', 'riser'), (r'thud|thump|lands|slam|stamp|thunk|clunk|knock', 'thump'),
  (r'ding|chime|bell|jackpot', 'chime'), (r'whoosh|swish|reach|whip|swing|darts|streak|rush', 'whoosh'),
  (r'click|clink|jingle|tap', 'click'), (r'pop|pin', 'pop'), (r'step|paws|trot|footstep|sniff', 'tap'), (r'.', 'tap')]
HERO = {14.06, 19.05, 22.4, 23.22, 56.74, 4.45, 53.16}
cues, last = [], {}
for i, e in enumerate(EV):
    w = e['what'].lower(); key = next(k for rx, k in RULES if re.search(rx, w))
    if key is None: continue
    snd = next(F[key]) if key in F else key
    if last.get(snd, -9) > e['t'] - 0.09: continue          # same sound closer than 90 ms: one
    last[snd] = e['t']
    c = {'id': f'ev-{i:03d}', 't': round(e['t'], 3), 'sound': snd, 'weight': 'hero' if round(e['t'], 2) in HERO else 'support'}
    # levels (user 2026-10-25: SFX were as loud as the voice, gulls too loud): lift = dB over the music+voice bed
    c['lift'] = {'gull': 0.2, 'gasp': 0.6, 'thunder': 1.0, 'crash': 2.0, 'alarm': 0.4, 'pant': 0.5, 'bark': 1.0}.get(key, 3.0 if c['weight'] == 'hero' else 3.0)   # > 0 (mix.py: dB audible over the bed)
    if key == 'creak': c['pitch'] = -6   # low metal groan, not a squeak
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 61.5, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.5, 'wet_db': -18},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.2}, 'voice': [{'file': '../voice/voice.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
import collections; print(len(cues), collections.Counter(c['sound'].split('/')[-1].split('_')[0] for c in cues).most_common())
