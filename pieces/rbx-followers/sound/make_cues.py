"""events.json -> cues.json for sound-layer mix.py. Real Freesound CC0 recordings (cuts/) for every action; sound-layer kit
types only for whoosh/swish/boom/pop/thump/shimmer accents."""
import json, itertools, collections
EV = sorted(json.load(open('events.json')), key=lambda e: e['t'])
DUR = 108.7
F = {  # key: rotation of sounds, align, lift dB
 'creak': (['cuts/creak1.wav', 'cuts/creak2.wav', 'cuts/creakw.wav'], 'start', 2.5), 'strain': (['cuts/strain.wav', 'cuts/tension.wav'], 'start', 2.5),
 'yank': (['cuts/yank.wav'], 'peak', 3.5), 'slip': (['cuts/slip.wav'], 'start', 3.0), 'grab': (['cuts/grab.wav'], 'peak', 2.5), 'pulley': (['cuts/creakw.wav'], 'start', 2.5),
 'heave': (['cuts/heave1.wav', 'cuts/heave2.wav'], 'start', 3.0), 'grunt': (['cuts/grunt1.wav', 'cuts/grunt2.wav', 'cuts/grunt3.wav'], 'start', 2.0),
 'cheer': (['cuts/cheer.wav', 'cuts/cheer2.wav'], 'start', 2.0), 'kidscheer': (['cuts/kidscheer.wav'], 'start', 2.0), 'kids': (['cuts/kids.wav'], 'start', 1.0),
 'tractor': (['cuts/tractor.wav'], 'start', 3.5), 'elephant': (['cuts/elephant.wav'], 'start', 4.0), 'stomp': (['cuts/stomp.wav'], 'peak', 3.5),
 'inhale': (['cuts/inhale.wav'], 'start', 2.0), 'sneeze': (['cuts/sneeze.wav'], 'start', 4.0), 'zip': (['cuts/zip.wav'], 'start', 2.5),
 'landslide': (['cuts/landslide.wav'], 'start', 3.5), 'gravel': (['cuts/gravel.wav'], 'start', 2.5), 'scrape': (['cuts/gravel.wav'], 'start', 2.0), 'stumble': (['cuts/gravel.wav'], 'start', 2.0),
 'chalk': (['cuts/chalk.wav'], 'start', 2.5), 'stake': (['cuts/stake.wav'], 'peak', 3.0), 'bells': (['cuts/bells.wav'], 'start', 1.5), 'cloth': (['cuts/cloth.wav'], 'start', 2.0),
 'giggle': (['cuts/giggle.wav'], 'start', 1.5), 'step': (['cuts/step1.wav', 'cuts/step2.wav'], 'peak', 2.0), 'gasp': (['cuts/gasp.wav'], 'start', 2.0),
 'heart': (['cuts/heart.wav'], 'peak', 2.5), 'murmur': (['cuts/murmur.wav'], 'start', 1.5), 'crowdgasp': (['cuts/crowdgasp.wav'], 'start', 2.0),
 'fogwind': (['cuts/fogwind.wav'], 'start', 2.0), 'rumble': (['cuts/rumble.wav'], 'start', 2.5), 'mtnwind': (['cuts/mtnwind.wav'], 'start', 1.5),
 'birds': (['cuts/birds.wav'], 'start', 1.0), 'gulls': (['cuts/gulls.wav'], 'start', 1.5), 'creakwood': (['cuts/creakw.wav'], 'start', 3.0), 'shout': (['swish'], 'peak', 1.5),
 'shimmer': (['shimmer'], 'start', 1.0), 'boom': (['boom'], 'peak', 4.0), 'whoosh': (['whoosh'], 'peak', 2.0), 'swish': (['swish'], 'peak', 1.5),
 'pop': (['pop'], 'peak', 2.0), 'thump': (['thump'], 'peak', 3.0),
}
cyc = {k: itertools.cycle(v[0]) for k, v in F.items()}
HERO = {'boom', 'sneeze', 'elephant', 'tractor', 'landslide', 'heave'}
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
