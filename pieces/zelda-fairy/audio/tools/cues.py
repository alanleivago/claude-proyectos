# zelda-fairy "sonido pro": cue list of real CC0 recordings. Panel starts TB as in src/head.html (board/times.json);
# events on word times from voice.json. Own downloads (Z, audio/sfxlib/raw) + the Odyssey libraries. Writes cues.json for sfxmix.py.
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); PIECE = os.path.dirname(os.path.dirname(HERE))
Z = os.path.join(PIECE, 'audio', 'sfxlib', 'raw') + '/'
LIB = lambda p: os.path.abspath(os.path.join(PIECE, f'../{p}/audio/sfxlib/raw')) + '/'
P5, P3, P1, CY = LIB('odyssey-p5'), LIB('odyssey-p3'), LIB('odyssey-p1'), LIB('odyssey-cyclops')
PICK = json.load(open(os.path.join(HERE, 'pick.json')))      # cat -> chosen files (after the earshot screen) and cat_ss start points
def F(cat, i=0): return cat + '/' + PICK[cat][i % len(PICK[cat])]
def SS(cat, i=0): v = PICK.get(cat + '_ss', [0.0]); v = v if isinstance(v, list) else [v]; return v[i % len(v)]

V = json.load(open(os.path.join(PIECE, 'voice.json'))); L = {l['id']: l for l in V['lines']}; END = V['duration']
LT = lambda i: L[i]['t0']; LE = lambda i: L[i]['t1']
def VW(i, w, n=1):
    k = 0
    for x in L[i]['words']:
        if re.sub(r"[^a-z0-9']", '', x['w'].lower()) == w and (k := k + 1) == n: return x['t0']
    raise KeyError((i, w))
TB = {s['id']: s['t0'] for s in json.load(open(os.path.join(PIECE, 'board', 'times.json')))}

C = []
def cue(t, f, lib=Z, **k): C.append(dict(t=round(t, 3), file=lib + f, name=f, **k))
def z(cat, t, g, i=0, d=None, pan=0, onset=True, **k): ss = SS(cat, i); cue(t, F(cat, i), Z, gain=g, pan=pan, ss=ss, to=(ss + d) if d else None, onset=onset, **k)
def bed(cat, t0, t1, g, i=0, **k): cue(t0, F(cat, i), Z, ss=SS(cat, i), dur=round(t1 - t0, 3), norm='int', gain=g, fi=k.pop('fi', 0.8), fo=k.pop('fo', 0.8), **k)
STEP = [(15.279, 15.62), (5.819, 6.145), (17.09, 17.645), (6.476, 6.75), (11.531, 11.9), (2.094, 2.45)]
def steps(t0, t1, rate, g, pan=0, semi=3, lp=5000):     # small light steps: the cyclops men_steps recording pitched up
    t = t0; i = 0
    while t < t1:
        a, b = STEP[i % len(STEP)]; cue(t - 0.005, 'men_steps/fs503671.mp3', CY, ss=a, to=b, gain=g - (2 if i % 3 == 1 else 0), pan=pan, semi=semi, lp=lp, fo=0.05); t += 1 / rate; i += 1
def slidew(t, i):
    f = ['slide_whoosh/fs843664.mp3', 'slide_whoosh/fs843665.mp3'][i % 2]; a, b = [(0.197, 0.655), (0.068, 0.416)][i % 2]
    cue(t, f, CY, ss=a, to=b, pre=0.25, gain=-17, pan=0.3, hp=150, fi=0.03, fo=0.12)
CH = [('chime/fs169281.mp3', 0.3), ('chime/fs644684.mp3', 0.3), ('chime/fs415446.mp3', 0.2)]
def chime(t, g, pan=0, dur=2.0, k=0, semi=0): f, s = CH[k % 3]; cue(t, f, P3, ss=s, gain=g, pan=pan, fi=0.05, fo=0.8, semi=semi, to=s + dur)
def fairy(t, g, pan=0, k=0, d=1.2): z('wings', t, g, k, d, pan, fo=0.3); z('sparkle', t + 0.05, g - 3, k, d, pan, fo=0.4)
def low(t, g, d=3.0): cue(t, 'rumble/fs222521.mp3', CY, ss=1.99, to=1.99 + d, lp=200, gain=g, fi=0.3, fo=1.2)
def creak(t, g, pan=0, semi=-3): cue(t, 'wood_creak/fs506664.mp3', P1, gain=g, pan=pan, semi=semi, fo=0.2, onset=True)

# beds: bright forest by day, the night forest for the dream, wind for the dark Hyrule
bed('forest_amb', 0, TB['p04'] + 0.4, -20)
bed('night_forest', TB['p04'] - 0.3, TB['p05'] + 0.4, -20)
bed('forest_amb', TB['p05'] - 0.3, TB['p09'] + 0.4, -21, i=1)
bed('wind', TB['p09'] - 0.3, TB['p10'] + 0.3, -26, lp=3000)
bed('wind', TB['p12'] - 0.3, TB['p13'] + 0.3, -21, lp=2500)
bed('forest_amb', TB['p13'] - 0.3, END, -20, fo=2.5)
for i, p in enumerate(['p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12', 'p13', 'p14']): slidew(TB[p], i)

# P01 the hero in a burst of gold
chime(0.15, -17, 0.0, k=0, dur=2.5); z('whoosh', 0.1, -20, 0, 1.2, 0.0)
cue(0.3, F('leaves'), Z, ss=SS('leaves'), to=SS('leaves') + 2.5, gain=-22, pan=-0.3, fi=0.3, fo=0.8)
# P02 the boy with no fairy; the cocky one walks in with his fairy; laughs at "forget"
steps(TB['p02'] + 0.1, TB['p02'] + 1.3, 4.5, -24, 0.4)
fairy(TB['p02'] + 0.6, -21, 0.4, 0)
z('laugh_kid', VW('l02', 'forget') - 0.2, -22, 0, 1.6, 0.4, fo=0.4)
# P03 the girl's fairy swoops past him and back
fairy(VW('l03', 'fairy') - 0.7, -18, 0.3, 1, 1.4); fairy(VW('l03', 'fairy') + 0.5, -21, -0.2, 2, 1.0)
z('sparkle', VW('l03', 'own') - 0.1, -22, 1, 1.0, 0.4)
# P04 night: the dream in a roundel (the desert man)
chime(VW('l04', 'dream') - 0.4, -21, 0.0, k=2, dur=2.5, semi=-5); low(VW('l04', 'dream') - 0.3, -20, 2.5)
# P05 the tree falls sick; the desert man walks in and curses it
z('tree_groan', VW('l05', 'sick') - 0.3, -16, 0, 2.5, 0.2, fi=0.1, fo=0.8)
z('leaves', VW('l05', 'sick'), -21, 1, 2.0, 0.1, onset=False, fi=0.3, fo=0.8)
steps(LT('l06') - 0.3, LT('l06') + 1.0, 3.0, -21, -0.4, semi=-2, lp=3000)
z('curse', VW('l06', 'curse') - 0.25, -14, 0, 2.6, 0.1, onset=False, fi=0.15, fo=1.0)
z('tree_groan', VW('l06', 'curse') + 0.4, -19, 1, 2.0, 0.2, fo=0.8)
# P06 Navi flies in and wakes him
fairy(LT('l07') + 0.3, -19, 0.6, 3, 1.5); fairy(VW('l08', 'name') - 0.1, -17, 0.0, 4, 1.4)
chime(VW('l08', 'navi') - 0.05, -18, 0.0, k=1, dur=2.0, semi=2)
z('gasp', VW('l08', 'name') + 0.05, -24, 0, 0.8, -0.3)
# P07 inside the tree, the curse broken (gold rays); then the tree dies
steps(LT('l09') + 0.1, LT('l09') + 1.5, 4.5, -24, 0.0)
z('whoosh', VW('l09', 'broke') - 0.1, -18, 1, 1.2, 0.0); chime(VW('l09', 'broke') - 0.05, -17, 0.0, k=0, dur=2.0)
z('tree_groan', VW('l09', 'already') - 0.2, -15, 1, 3.0, 0.1, fo=1.2)
z('leaves', VW('l09', 'already'), -18, 2, 3.0, 0.0, onset=False, fi=0.3, fo=1.0)
# P08 he walks out of the forest with Navi
steps(LT('l10') + 0.2, LT('l10') + 4.2, 3.2, -24, 0.0)
fairy(VW('l10', 'leave') - 0.1, -24, 0.2, 5, 0.8)
# P09 the castle; the desert man comes after her; she throws the ocarina
z('castle_bell', LT('l11') - 0.1, -22, 0, 3.0, 0.3, fo=1.5)
steps(LT('l12') + 0.1, LT('l12') + 1.5, 2.6, -21, 0.5, semi=-3, lp=3000)
low(LT('l12') + 0.2, -19, 2.2)
z('toss', VW('l12', 'threw') - 0.05, -20, 0, 0.6, 0.2); z('whoosh', VW('l12', 'threw'), -22, 2, 0.8, -0.1)
chime(VW('l12', 'ocarina') - 0.05, -19, -0.3, k=1, dur=1.5, semi=4)
# P10 he plays the ocarina in the temple, then pulls the sword
z('ocarina', LT('l13') - 0.05, -21, 0, VW('l13', 'pulled') - LT('l13') + 0.2, 0.0, onset=False, fi=0.1, fo=0.4)
z('stone_scrape', VW('l13', 'pulled') - 0.15, -18, 0, 1.0, 0.0)
z('sword_draw', VW('l13', 'pulled') + 0.25, -15, 0, 1.2, 0.0)
chime(VW('l13', 'sword') - 0.05, -16, 0.0, k=0, dur=2.5)
# P11 sealed away for seven years: the time-seal whoosh, a chime for each mark
z('whoosh', LT('l14') - 0.2, -17, 3, 1.6, 0.0, semi=-3)
low(VW('l14', 'sealed') - 0.2, -18, 3.0)
for i in range(7): chime(VW('l14', 'seven') - 0.6 + i * 0.12, -27, -0.45 + 0.15 * i, k=i, dur=0.8, semi=i)
# P12 he wakes a grown man; the desert man rises over the dark castle
z('gasp', LT('l15') + 0.3, -20, 1, 1.0, -0.3)
z('whoosh', LT('l15') + 0.35, -21, 4, 1.0, -0.2)
z('curse', VW('l15', 'desert') - 0.4, -16, 1, 2.6, 0.2, onset=False, fi=0.4, fo=1.0)
low(VW('l15', 'ruled') - 0.2, -16, 3.0)
# P13 back in the bright forest, the road again
steps(LT('l16') + 0.3, LT('l16') + 3.6, 3.2, -24, 0.0)
fairy(VW('l16', 'forest') - 0.1, -22, 0.4, 6, 1.0); z('laugh_kid', VW('l16', 'forest') + 0.2, -26, 1, 1.4, 0.5)
fairy(VW('l16', 'fairy') - 0.1, -19, 0.0, 7, 1.2)
# P14 the end card: the apple lands, AMPHORUS shines
z('apple', TB['p14'] + 0.05, -18, 0, 0.6, 0.0)
chime(TB['p14'] + 0.3, -16, 0.0, k=0, dur=3.0); z('sparkle', TB['p14'] + 0.5, -21, 2, 1.5, 0.0)

for c in C:
    for k in [k for k, v in c.items() if v is None or k == 'ss_add']: del c[k]
json.dump(sorted(C, key=lambda c: c['t']), open(os.path.join(HERE, 'cues.json'), 'w'), indent=0)
print(len(C), 'cues')
