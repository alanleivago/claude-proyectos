"""events.json (what happens on screen, key 'k') -> cues.json for sound-layer mix.py. Real Freesound CC0 recordings
(fs/ whole files, cuts/ trims picked with earshot find) for every action; kit types only for whoosh/swish/boom/riser/tap/click."""
import json, itertools, collections
EV = sorted(json.load(open('events.json')), key=lambda e: e['t'])
F = {  # key: rotation of sounds, align, lift dB over the bed (mix.py), extra
 'hammer': (['cuts/hammer1.wav', 'cuts/hammer2.wav', 'cuts/hammer3.wav'], 'peak', 3.0),
 'bell': (['cuts/school_bell.wav'], 'start', 2.0), 'slam': (['fs/desk_slam_137084.mp3', 'fs/desk_slam_137086.mp3'], 'peak', 3.0),
 'chalk': (['cuts/chalk1.wav', 'fs/chalk_233049.mp3'], 'start', 2.0), 'creak': (['fs/creak_646692.mp3', 'fs/creak_506664.mp3', 'fs/creak_646691.mp3'], 'start', 2.0),
 'nail': (['cuts/nail.wav'], 'start', 2.0), 'drop': (['fs/board_drop_577454.mp3', 'fs/board_drop_577455.mp3'], 'peak', 3.5),
 'rumble': (['cuts/rumble.wav'], 'start', 1.5), 'shingles': (['cuts/rattle.wav'], 'start', 2.0),
 'church': (['cuts/church.wav'], 'start', 2.0), 'clock': (['cuts/tick.wav'], 'start', 1.5), 'tick': (['cuts/tick.wav'], 'start', 1.0),
 'alarm': (['cuts/alarmtick.wav'], 'start', 1.0), 'wind': (['cuts/wind.wav'], 'start', 1.5),
 'cheer': (['cuts/cheer.wav'], 'start', 1.0), 'clink': (['fs/mug_clink_368614.mp3'], 'peak', 2.5),
 'engine': (['cuts/car.wav'], 'start', 1.5), 'cardoor': (['fs/car_door_437039.mp3'], 'peak', 3.0),
 'steps': (['cuts/step1.wav', 'cuts/step2.wav', 'cuts/step3.wav'], 'peak', 2.0), 'sniff': (['fs/sniff_346680.mp3', 'fs/sniff_346671.mp3'], 'start', 2.0),
 'pour': (['fs/water_pour_164050.mp3'], 'start', 1.5), 'meow': (['fs/cat_meow_730098.mp3'], 'start', 2.0),
 'blanket': (['fs/blanket_493462.mp3', 'fs/blanket_493457.mp3'], 'start', 2.0), 'trunk': (['fs/trunk_slam_136535.mp3'], 'peak', 3.0),
 'mug': (['fs/mug_clink_615308.mp3'], 'peak', 2.0), 'heart': (['cuts/heart1.wav', 'cuts/heart2.wav'], 'peak', 2.5),
 'breath': (['cuts/breath.wav'], 'start', 1.5), 'breathB': (['cuts/breathB.wav'], 'start', 1.5),
 'scratch': (['cuts/scratch.wav'], 'start', 1.5), 'ladder': (['cuts/step2.wav', 'cuts/step3.wav'], 'peak', 2.0),
 'paper': (['cuts/paper.wav'], 'start', 1.5), 'suitcase': (['cuts/zip.wav'], 'start', 1.5), 'balloon': (['fs/balloon_332674.mp3'], 'start', 1.5),
 'cardboard': (['fs/cardboard_459429.mp3', 'fs/cardboard_459440.mp3'], 'start', 2.0), 'pull': (['fs/creak_506664.mp3+fs/nail_squeak_795590.mp3'], 'start', 2.0),
 'bedcreak': (['cuts/bedcreak.wav'], 'start', 1.5), 'cry': (['fs/sniff_346681.mp3'], 'start', 1.5), 'trophy': (['fs/trophy_842172.mp3'], 'peak', 1.5),
 'blink': (['fs/squish_148974.mp3'], 'peak', 2.5), 'window': (['fs/door_open_371296.mp3'], 'start', 2.0),
 'whooshbig': (['fs/whoosh_big_237980.mp3'], 'peak', 4.0), 'riser': (['fs/riser_511874.mp3'], 'end', 3.0),
 'whoosh': (['whoosh'], 'peak', 2.0), 'swish': (['swish'], 'peak', 1.5), 'boom': (['boom'], 'peak', 4.0),
 'thump': (['thump'], 'peak', 3.0), 'tap': (['tap'], 'peak', 1.5), 'click': (['click'], 'peak', 2.0),
}
cyc = {k: itertools.cycle(v[0]) for k, v in F.items()}
HERO = {'boom', 'whooshbig', 'bell', 'church'}
cues = []
EV += [{'t': t, 'k': 'swish', 'what': 'soft swish into the cut'} for t in (10.44, 14.30, 40.90, 68.14, 73.24)]   # earshot critique: cuts with no sound
EV.sort(key=lambda e: e['t'])
for i, e in enumerate(EV):
    k = e['k']
    if k == 'breath' and 'hear it breathing' in e['what'] or 'breathing again' in e['what']: k = 'breathB'
    snd = next(cyc[k]); _, al, lift = F[k]
    c = {'id': f'ev-{i:03d}-{k}', 't': round(e['t'], 3), 'sound': snd, 'align': al, 'weight': 'hero' if k in HERO else 'support', 'lift': lift}
    if k == 'boom': c['pitch'] = -4          # dark, low reveal hit
    if k in ('whoosh', 'swish'): c['pitch'] = -3
    c['pan'] = 0.0 if c['weight'] == 'hero' else round(((-1) ** i) * (0.35 if k in ('whoosh', 'swish', 'steps') else 0.2), 2)   # width: alternate sides
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 120.242, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.6, 'wet_db': -16},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.0}, 'voice': [{'file': '../voice/voice_final.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
print(len(cues), 'cues', round(len(cues) / 2.0, 1), '/min;', collections.Counter(e['k'] for e in EV).most_common(12))
