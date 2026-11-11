"""events.json -> cues.json for sound-layer mix.py. Real Freesound CC0 recordings (cuts/) for every action; sound-layer kit
types only for whoosh/swish/boom/pop/thump/shimmer accents."""
import json, itertools, collections
EV = sorted(json.load(open('events.json')), key=lambda e: e['t'])
DUR = 107.800000
F = {
 'poof': (['cuts/poof1.wav', 'cuts/poof3.wav', 'cuts/poof2.wav', 'cuts/poof4.wav'], 'peak', 4.0), 'spawn': (['cuts/spawn1.wav', 'cuts/spawn2.wav'], 'start', 2.5), 'boing': (['cuts/boing.wav'], 'start', 2.0),
 'trip': (['cuts/trip1.wav', 'cuts/trip2.wav', 'cuts/trip3.wav'], 'peak', 3.5), 'stairs': (['cuts/stairs.wav'], 'start', 3.5), 'flap': (['cuts/flap.wav'], 'start', 1.5), 'whistle': (['cuts/whistle.wav'], 'start', 5.0),
 'whistlesoft': (['cuts/whistle.wav'], 'start', 0.5), 'bark': (['cuts/bark1.wav', 'cuts/bark2.wav'], 'start', 3.0), 'pant': (['cuts/pant.wav'], 'start', 1.5), 'whine': (['cuts/whine.wav'], 'start', 2.5),
 'earflap': (['cuts/earflap.wav'], 'start', 3.0), 'chew': (['cuts/chew.wav'], 'start', 3.0), 'sniff': (['cuts/sniff.wav'], 'start', 2.5), 'rumble': (['cuts/rumble.wav'], 'start', 3.5), 'collapse': (['cuts/collapse.wav'], 'start', 4.5),
 'debris': (['cuts/debris1.wav', 'cuts/debris2.wav'], 'start', 3.0), 'crack': (['cuts/crack.wav'], 'peak', 4.0), 'rockbreak': (['cuts/rockbreak.wav'], 'peak', 3.5), 'gravel': (['cuts/gravel.wav'], 'start', 2.5),
 'scream': (['cuts/scream.wav'], 'start', 1.5), 'yell': (['cuts/kidyell.wav'], 'start', 1.0), 'kidyell': (['cuts/kidyell.wav'], 'start', 1.5), 'gasp': (['cuts/gasp.wav'], 'start', 2.0), 'ooh': (['cuts/ooh.wav'], 'start', 2.0),
 'cheer': (['cuts/cheer.wav', 'cuts/cheer2.wav'], 'start', 2.5), 'murmur': (['cuts/murmur.wav'], 'start', 1.5), 'ladder': (['cuts/ladder.wav'], 'peak', 3.0), 'lasso': (['cuts/lasso.wav'], 'start', 2.5),
 'rope': (['cuts/rope.wav'], 'start', 2.5), 'grab': (['cuts/grab.wav'], 'peak', 2.5), 'tuba': (['cuts/tuba.wav'], 'start', 2.0), 'tubalow': (['cuts/tubalow.wav'], 'start', 2.5), 'drums': (['cuts/drums.wav'], 'start', 1.5),
 'splash': (['cuts/splash.wav'], 'peak', 3.5), 'dig': (['cuts/dig.wav'], 'peak', 3.0), 'snore': (['cuts/snore.wav'], 'start', 2.0), 'step': (['cuts/step1.wav', 'cuts/step2.wav'], 'peak', 2.0), 'blanket': (['cuts/blanket.wav'], 'start', 2.0),
 'chalk': (['cuts/chalk.wav'], 'start', 2.0), 'kidscheer': (['cuts/kidscheer.wav'], 'start', 2.0), 'giggle': (['cuts/giggle.wav'], 'start', 1.0), 'fall': (['cuts/fall.wav'], 'start', 2.0), 'swanee': (['cuts/swanee.wav'], 'start', 2.0),
 'heart': (['cuts/heart.wav'], 'peak', 2.0), 'land': (['cuts/land.wav'], 'peak', 3.0), 'pant_h': (['cuts/pant.wav'], 'start', 0.5), 'kids': (['cuts/kidscheer.wav'], 'start', 0.5), 'carnival': (['cuts/cheer2.wav'], 'start', 0.5),
 'shimmer': (['cuts/shimmer.wav'], 'start', 0.5), 'boom': (['boom'], 'peak', 3.5), 'whoosh': (['whoosh'], 'peak', 2.0), 'swish': (['swish'], 'peak', 1.5), 'thump': (['thump'], 'peak', 2.5),
}
cyc = {k: itertools.cycle(v[0]) for k, v in F.items()}
HERO = {'boom', 'collapse', 'whistle', 'crack', 'poof', 'splash', 'stairs'}
cues = []
for i, e in enumerate(EV):
    k = e['k']; snd = next(cyc[k]); _, al, lift = F[k]
    c = {'id': f'ev-{i:03d}-{k}', 't': round(e['t'], 3), 'sound': snd, 'align': al, 'weight': 'hero' if k in HERO else 'support', 'lift': lift}
    if k == 'boom': c['pitch'] = -4
    if k in ('whoosh', 'swish'): c['pitch'] = -3
    if k == 'pop': c['pitch'] = -2
    c['pan'] = 0.0 if c['weight'] == 'hero' else round(((-1) ** i) * (0.85 if k in ('whoosh', 'swish', 'step', 'zip', 'grab') else 0.6), 2)
    cues.append(c)
sheet = {'fps': 30, 'duration_s': DUR + 3, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.6, 'wet_db': -16},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.0}, 'voice': [{'file': '../voice/voice_final.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
print(len(cues), 'cues', round(len(cues) / DUR * 60, 1), '/min;', collections.Counter(e['k'] for e in EV).most_common(10))
