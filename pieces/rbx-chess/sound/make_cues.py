"""events.json (what happens on screen, key 'k') -> cues.json for sound-layer mix.py. Real Freesound CC0 recordings
(fs/ whole files, cuts/ trims picked with earshot find) for every action; kit types only for whoosh/swish/boom/pop/tap/thump/shimmer."""
import json, itertools, collections
EV = sorted(json.load(open('events.json')), key=lambda e: e['t'])
F = {  # key: rotation of sounds, align, lift dB
 'steps': (['cuts/step1.wav', 'cuts/step2.wav', 'cuts/step3.wav'], 'peak', 2.0), 'piece': (['fs/chess_piece_546119.mp3'], 'peak', 2.5),
 'wheels': (['cuts/wheels1.wav', 'cuts/wheels2.wav'], 'start', 2.0), 'stop': (['thump'], 'peak', 2.0),
 'bell': (['cuts/bell.wav'], 'start', 1.0), 'schoolbell': (['cuts/bell.wav'], 'start', 0.5), 'murmur': (['cuts/murmur1.wav', 'cuts/murmur2.wav'], 'start', 1.5),
 'lid': (['cuts/rumble.wav+fs/whoosh_big_237980.mp3'], 'start', 3.0), 'rumble': (['cuts/rumble.wav'], 'start', 2.5),
 'handwhoosh': (['cuts/handwhoosh.wav'], 'start', 3.0), 'creepy': (['fs/creepy_whoosh_850767.mp3', 'fs/creepy_whoosh_850424.mp3'], 'peak', 2.5),
 'boxthud': (['cuts/boxthud.wav'], 'peak', 3.0), 'hop': (['fs/whoosh_soft_623709.mp3'], 'peak', 2.0), 'land': (['fs/soft_land_614064.mp3', 'fs/soft_land_519262.mp3'], 'peak', 3.0),
 'page': (['fs/page_turn_484933.mp3'], 'start', 2.0), 'gasp': (['cuts/gasp.wav'], 'start', 2.0), 'crowdgasp': (['cuts/crowdgasp.wav'], 'start', 2.0),
 'fogwind': (['cuts/fogwind.wav'], 'start', 2.0), 'wind': (['cuts/wind.wav'], 'start', 1.5), 'heart': (['cuts/heart.wav'], 'peak', 2.5),
 'strain': (['fs/cloth_stretch_493190.mp3'], 'start', 2.0), 'sizzle': (['cuts/sizzle.wav'], 'start', 1.5), 'pans': (['cuts/pans.wav'], 'peak', 2.0),
 'doorrattle': (['fs/door_rattle_216869.mp3'], 'start', 2.5), 'magic': (['fs/magic_shimmer_844398.mp3'], 'start', 3.0),
 'shimmer': (['shimmer'], 'start', 1.0), 'boom': (['boom'], 'peak', 4.0), 'whoosh': (['whoosh'], 'peak', 2.0), 'swish': (['swish'], 'peak', 1.5),
 'pop': (['pop'], 'peak', 2.0), 'tap': (['tap'], 'peak', 1.5), 'thump': (['thump'], 'peak', 3.0),
}
cyc = {k: itertools.cycle(v[0]) for k, v in F.items()}
HERO = {'boom', 'handwhoosh', 'lid', 'magic', 'boxthud'}
cues = []
for i, e in enumerate(EV):
    k = e['k']; snd = next(cyc[k]); _, al, lift = F[k]
    c = {'id': f'ev-{i:03d}-{k}', 't': round(e['t'], 3), 'sound': snd, 'align': al, 'weight': 'hero' if k in HERO else 'support', 'lift': lift}
    if k == 'boom': c['pitch'] = -4
    if k in ('whoosh', 'swish'): c['pitch'] = -3
    if k == 'pop': c['pitch'] = -2          # softer, rounder pops (no bright ding spam)
    if k == 'chime': c['pitch'] = -5
    c['pan'] = 0.0 if c['weight'] == 'hero' else round(((-1) ** i) * (0.8 if k in ('whoosh', 'swish', 'steps', 'hop', 'creepy', 'wheels') else 0.6), 2)
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 106.0, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.6, 'wet_db': -16},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.0}, 'voice': [{'file': '../voice/voice_final.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
print(len(cues), 'cues', round(len(cues) / 105.5 * 60, 1), '/min;', collections.Counter(e['k'] for e in EV).most_common(12))
