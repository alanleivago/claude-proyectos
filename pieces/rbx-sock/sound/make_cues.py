"""events.json (what happens on screen, key 'k') -> cues.json for sound-layer mix.py. Real Freesound CC0 recordings
(fs/ whole files, cuts/ trims picked with earshot find) for every action; kit types only for whoosh/swish/boom/pop/tap/thump/shimmer."""
import json, itertools, collections
EV = sorted(json.load(open('events.json')), key=lambda e: e['t'])
F = {  # key: rotation of sounds, align, lift dB
 'steps': (['cuts/step1.wav', 'cuts/step2.wav', 'cuts/step3.wav'], 'peak', 2.0),
 'stomp': (['cuts/stomp1.wav', 'cuts/stomp2.wav'], 'peak', 3.0), 'barestep': (['cuts/bare1.wav', 'cuts/bare2.wav'], 'peak', 2.0),
 'wetstep': (['cuts/wet1.wav', 'cuts/wet2.wav', 'cuts/wet3.wav', 'cuts/wet4.wav'], 'peak', 2.5),
 'cloth': (['fs/sock_pull_494789.mp3', 'fs/sock_pull_494795.mp3', 'fs/blanket_493504.mp3'], 'start', 2.0),
 'blanket': (['fs/blanket_493462.mp3', 'fs/blanket_493457.mp3'], 'start', 2.0),
 'rustle': (['fs/sock_pull_494796.mp3', 'fs/blanket_493457.mp3', 'fs/sock_pull_494789.mp3'], 'start', 2.0),
 'sockpull': (['fs/sock_pull_789038.mp3', 'fs/sock_pull_494796.mp3'], 'peak', 3.0),
 'slide': (['fs/sock_pull_494795.mp3', 'fs/blanket_493504.mp3'], 'start', 1.5), 'crawl': (['fs/blanket_493504.mp3', 'fs/sock_pull_494795.mp3'], 'start', 2.0),
 'stretch': (['fs/cloth_stretch_493190.mp3', 'fs/cloth_stretch_493158.mp3', 'fs/cloth_stretch_493210.mp3'], 'start', 2.5),
 'pull': (['fs/sock_pull_789038.mp3+fs/cloth_stretch_493156.mp3'], 'peak', 3.5), 'release': (['fs/cloth_stretch_493210.mp3'], 'start', 2.5),
 'string': (['fs/knot_712585.mp3'], 'start', 2.5), 'knit': (['cuts/knit1.wav', 'cuts/knit2.wav'], 'start', 2.0),
 'peg': (['fs/clothespin_667382.mp3'], 'peak', 2.0), 'creak': (['fs/creak_646692.mp3', 'fs/creak_506664.mp3'], 'start', 2.0),
 'door': (['cuts/door.wav'], 'start', 2.5), 'whistle': (['fs/whistle_538422.mp3'], 'start', 1.0), 'paper': (['fs/paper_642770.mp3'], 'start', 1.5),
 'gasp': (['cuts/gasp.wav'], 'start', 2.0), 'dryerdoor': (['cuts/dryerdoor.wav'], 'start', 2.0), 'flash': (['fs/flashlight_410359.mp3'], 'peak', 2.5),
 'rummage': (['fs/sock_pull_494796.mp3', 'fs/blanket_493462.mp3'], 'start', 1.5), 'creepy': (['fs/creepy_whoosh_850767.mp3', 'fs/creepy_whoosh_850424.mp3'], 'peak', 2.5),
 'drip': (['fs/drip_792927.mp3'], 'peak', 1.5), 'grate': (['fs/grate_329962.mp3'], 'peak', 2.0),
 'drain': (['fs/drain_529300.mp3', 'cuts/drain2.wav'], 'start', 2.0), 'murmur': (['cuts/whisper.wav', 'cuts/whisper2.wav'], 'start', 1.5),
 'hatch': (['fs/creak_506664.mp3+fs/shingles_164638.mp3'], 'start', 2.5), 'rattle': (['cuts/rattle.wav', 'fs/chute_rattle_805902.mp3'], 'start', 3.0),
 'shower': (['fs/squish_737233.mp3'], 'start', 2.0), 'squelch': (['fs/squish_148974.mp3', 'fs/squish_578792.mp3'], 'peak', 2.0),
 'baby': (['fs/baby_coo_449869.mp3'], 'start', 1.5), 'giggle': (['cuts/giggle.wav', 'cuts/giggle2.wav'], 'start', 1.5),
 'squeak': (['fs/balloon_332684.mp3'], 'peak', 1.5), 'spill': (['fs/paper_642770.mp3+fs/sock_pull_494789.mp3'], 'start', 2.0),
 'splat': (['fs/mashed_181913.mp3'], 'start', 2.5), 'cushion': (['fs/cushion_728541.mp3'], 'peak', 2.5), 'dog': (['cuts/dog.wav'], 'start', 1.5),
 'box': (['fs/paper_642770.mp3'], 'start', 1.5), 'sniff': (['fs/sniff_346681.mp3', 'fs/sniff_346680.mp3'], 'start', 1.5),
 'breath': (['fs/breath_826716.mp3'], 'start', 1.0), 'heart': (['cuts/heart.wav'], 'peak', 2.5), 'tick': (['cuts/tick.wav'], 'start', 1.5),
 'vent': (['fs/vent_641048.mp3', 'fs/chute_rattle_273901.mp3'], 'start', 2.5), 'dryer': (['cuts/dryer.wav'], 'start', 3.0),
 'drum': (['cuts/drum.wav'], 'start', 1.5), 'bedcreak': (['fs/bed_creak_443796.mp3'], 'start', 2.0),
 'clank': (['fs/grate_329962.mp3'], 'peak', 3.0), 'fall': (['cuts/fallwind.wav'], 'start', 2.5),
 'dive': (['fs/whoosh_big_237980.mp3'], 'peak', 4.0), 'land': (['fs/soft_land_614064.mp3+fs/sock_pull_789038.mp3'], 'peak', 3.0),
 'thud': (['fs/cushion_728541.mp3', 'fs/thud_soft_209012.mp3'], 'peak', 2.5),
 'comic': (['fs/comic_95595.mp3+fs/slide_whistle_497093.mp3'], 'start', 3.0), 'dropsock': (['fs/whoosh_soft_623709.mp3'], 'peak', 2.0),
 'chime': (['shimmer'], 'start', 0.5), 'shimmer': (['shimmer'], 'start', 1.0), 'boom': (['boom'], 'peak', 4.0),
 'whoosh': (['whoosh'], 'peak', 2.0), 'swish': (['swish'], 'peak', 1.5), 'pop': (['pop'], 'peak', 2.0),
 'tap': (['tap'], 'peak', 1.5), 'thump': (['thump'], 'peak', 3.0),
}
cyc = {k: itertools.cycle(v[0]) for k, v in F.items()}
HERO = {'boom', 'dive', 'dryer', 'comic', 'rattle'}
cues = []
for i, e in enumerate(EV):
    k = e['k']; snd = next(cyc[k]); _, al, lift = F[k]
    c = {'id': f'ev-{i:03d}-{k}', 't': round(e['t'], 3), 'sound': snd, 'align': al, 'weight': 'hero' if k in HERO else 'support', 'lift': lift}
    if k == 'boom': c['pitch'] = -4
    if k in ('whoosh', 'swish'): c['pitch'] = -3
    if k == 'pop': c['pitch'] = -2          # softer, rounder pops (no bright ding spam)
    if k == 'chime': c['pitch'] = -5
    c['pan'] = 0.0 if c['weight'] == 'hero' else round(((-1) ** i) * (0.8 if k in ('whoosh', 'swish', 'steps', 'stomp', 'wetstep', 'creepy') else 0.6), 2)
    cues.append(c)
sheet = {'fps': 30, 'duration_s': 125.956, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.6, 'wet_db': -16},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.0}, 'voice': [{'file': '../voice/voice_final.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
print(len(cues), 'cues', round(len(cues) / 125.46 * 60, 1), '/min;', collections.Counter(e['k'] for e in EV).most_common(12))
