"""events.json -> cues.json for sound-layer mix.py (rbx-library). Real Freesound CC0 recordings (cuts/) for every action; the
Late Fee's THUNK is a 3-layer signature (floor bang -5 st + dull thud -4 st + rubber stamp -3 st); far thunks are 2 layers, softer."""
import json, itertools, collections
EV = sorted(json.load(open('events.json')), key=lambda e: e['t'])
DUR = 118.397
c = lambda *f: [f'cuts/{x}.wav' for x in f]
F = {  # key: ([files cycled], align, lift, layers?)
 'THUNK': ([c('thunkA', 'thunkB', 'thunkC')], 'peak', 6.0), 'THUNK_far': ([c('thunkD', 'thunkB')], 'peak', 2.5),
 'stamp': ([c('stamp1'), c('stamp2')], 'peak', 3.0), 'stamp_soft': ([c('stampsoft')], 'peak', 1.5), 'clunk': ([c('clunk1', 'clunk2')], 'peak', 3.0), 'thudbook': ([c('thudbook')], 'peak', 2.5),
 'pages': ([c('pages', 'paper')], 'start', 3.0), 'paper': ([c('paper')], 'start', 1.5), 'pageturn': ([c('pageturn'), c('pageturn2')], 'start', 2.0), 'splat': ([c('splat')], 'peak', 3.0),
 'poof': ([c('poof1'), c('poof2')], 'peak', 3.5), 'spawn': ([c('spawn')], 'start', 2.5), 'whisper': ([c('whisper1'), c('whisper2')], 'start', 2.0), 'creak': ([c('creak1'), c('creak2')], 'start', 2.0),
 'shelfcreak': ([c('shelfcreak')], 'start', 2.0), 'drag': ([c('drag')], 'start', 2.0), 'chain': ([c('chain')], 'start', 1.5), 'skitter': ([c('skitter')], 'start', 2.5), 'tiptoe': ([c('tiptoe')], 'start', 1.5),
 'sticker': ([c('sticker')], 'start', 2.5), 'zip': ([c('zip')], 'start', 2.5), 'tick': ([c('tick')], 'start', 1.5), 'stopwatch': ([c('stopwatch')], 'start', 2.5), 'bell': ([c('bell')], 'peak', 2.5),
 'midnight': ([c('midnight')], 'peak', 3.0), 'alarm': ([c('alarm')], 'start', 2.0), 'horn': ([c('horn')], 'start', 1.5), 'medal': ([c('medal')], 'start', 1.5), 'chute': ([c('chute')], 'start', 3.0),
 'metalslide': ([c('metalslide')], 'start', 2.5), 'land': ([c('land')], 'peak', 3.0), 'dust': ([c('dust')], 'start', 1.5), 'heart': ([c('heart')], 'peak', 2.0), 'gasp': ([c('gasp')], 'start', 1.5),
 'scream': ([c('scream')], 'start', 1.5), 'kidyell': ([c('kidyell')], 'start', 1.0), 'giggle': ([c('giggle1'), c('giggle2'), c('giggle3')], 'start', 1.2), 'kidscheer': ([c('kidscheer')], 'start', 1.5),
 'kids': ([c('kidyell')], 'start', 0.5), 'kidsamb': ([c('giggle3')], 'start', 0.5), 'murmur': ([c('murmur')], 'start', 1.0), 'blanket': ([c('blanket')], 'start', 2.0), 'snore': ([c('snore')], 'start', 1.5),
 'sniff': ([c('sniff')], 'start', 2.0), 'step': ([c('step1'), c('step2')], 'peak', 2.0), 'run': ([c('run')], 'start', 1.5), 'ladder': ([c('ladder')], 'peak', 2.5), 'cloth': ([c('cloth')], 'start', 2.0),
 'bubble': ([c('bubble')], 'start', 2.0), 'creepwhoosh': ([c('creepwhoosh')], 'peak', 2.0), 'stinger': ([c('stinger')], 'peak', 3.5), 'shimmer': ([c('shimmer')], 'start', 0.8), 'shimmer_dark': ([c('shimdark')], 'start', 1.5),
 'boing': ([c('boing')], 'start', 2.0), 'pant': ([c('pant')], 'start', 1.0), 'yawn': ([c('yawn')], 'start', 1.5), 'bookclose': ([c('bookclose')], 'peak', 2.0), 'freeze': ([c('freeze')], 'peak', 3.0),
 'card': ([c('card')], 'start', 2.0), 'shh': ([c('gasp')], 'start', 0.5), 'strain': ([c('pant')], 'start', 0.5), 'yelp': ([c('gasp')], 'start', 1.0),
 'whoosh': ([['whoosh']], 'peak', 2.0), 'swish': ([['swish']], 'peak', 1.5), 'birds': ([c('shimmer')], 'start', 0.0),
}
cyc = {k: itertools.cycle(v[0]) for k, v in F.items()}
HERO = {'THUNK', 'stinger', 'poof', 'freeze', 'midnight'}
cues = []
for i, e in enumerate(EV):
    k = e['k']
    if k == 'birds': continue
    files = next(cyc[k]); _, al, lift = F[k]
    for j, snd in enumerate(files):
        cu = {'id': f'ev-{i:03d}-{k}-{j}', 't': round(e['t'], 3), 'sound': snd, 'align': al, 'weight': 'hero' if k in HERO else 'support', 'lift': lift - j * 0.8}
        if k in ('whoosh', 'swish'): cu['pitch'] = -3
        cu['pan'] = 0.0 if cu['weight'] == 'hero' else round(((-1) ** i) * (0.8 if k in ('whoosh', 'swish', 'step', 'tiptoe', 'skitter') else 0.5), 2)
        cues.append(cu)
sheet = {'fps': 30, 'duration_s': DUR + 3, 'energy': 'punchy', 'lufs': -14, 'kit': '../../../sound-layer/kit', 'room': {'decay_s': 0.7, 'wet_db': -15},
         'music': {'file': 'music_bed.wav', 'start_s': 0, 'loop': False, 'fade_out_s': 1.0}, 'voice': [{'file': '../voice/voice_final.wav', 'start_s': 0}],
         'duck_db': 0, 'cues': cues}
json.dump(sheet, open('cues.json', 'w'), indent=1)
print(len(cues), 'cues', round(len(EV) / DUR * 60, 1), 'events/min;', collections.Counter(e['k'] for e in EV).most_common(8))
