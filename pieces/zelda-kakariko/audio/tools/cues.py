# zelda-kakariko "sonido pro": cue list of real CC0 recordings (Freesound), placed on the panel starts (board/times.json)
# and on the voice's word times (voice.json). Own downloads (K) + libraries of earlier pieces. Writes cues.json for sfxmix.py.
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); PIECE = os.path.dirname(os.path.dirname(HERE))
LIB = lambda p: os.path.abspath(os.path.join(PIECE, f'../{p}/audio/sfxlib/raw')) + '/'
K, ZF, ZO, CY, P1, P3 = PIECE + '/audio/sfxlib/raw/', LIB('zelda-fairy'), LIB('zelda-oot'), LIB('odyssey-cyclops'), LIB('odyssey-p1'), LIB('odyssey-p3')
V = json.load(open(os.path.join(PIECE, 'voice.json'))); L = {l['id']: l for l in V['lines']}; END = V['duration']
LT = lambda i: L[i]['t0']
def VW(i, w, n=1):
    k = 0
    for x in L[i]['words']:
        if re.sub(r"[^a-z0-9']", '', x['w'].lower()) == w and (k := k + 1) == n: return x['t0']
    raise KeyError((i, w))
TB = {s['id']: s['t0'] for s in json.load(open(os.path.join(PIECE, 'board', 'times.json')))}
C = []
def cue(t, lib, f, **k): C.append(dict(t=round(t, 3), file=lib + f, name=f, **{a: b for a, b in k.items() if b is not None}))
def bed(lib, f, t0, t1, g, ss=0, **k): cue(t0, lib, f, ss=ss, dur=round(t1 - t0, 3), norm='int', gain=g, fi=k.pop('fi', 0.8), fo=k.pop('fo', 0.8), **k)
STEP = [(15.279, 15.62), (5.819, 6.145), (17.09, 17.645), (6.476, 6.75), (11.531, 11.9), (2.094, 2.45)]
def steps(t0, t1, rate, g, pan=0, semi=3, lp=5000):
    t = t0; i = 0
    while t < t1:
        a, b = STEP[i % len(STEP)]; cue(t - 0.005, CY, 'men_steps/fs503671.mp3', ss=a, to=b, gain=g - (2 if i % 3 == 1 else 0), pan=pan, semi=semi, lp=lp, fo=0.05); t += 1 / rate; i += 1
def slidew(t, i):
    f = ['slide_whoosh/fs843664.mp3', 'slide_whoosh/fs843665.mp3'][i % 2]; a, b = [(0.197, 0.655), (0.068, 0.416)][i % 2]
    cue(t, CY, f, ss=a, to=b, pre=0.25, gain=-18, pan=0.3, hp=150, fi=0.03, fo=0.12)
CH = [('chime/fs169281.mp3', 0.3), ('chime/fs644684.mp3', 0.3), ('chime/fs415446.mp3', 0.2)]
def chime(t, g, pan=0, dur=2.0, k=0, semi=0): f, s = CH[k % 3]; cue(t, P3, f, ss=s, gain=g, pan=pan, fi=0.05, fo=0.8, semi=semi, to=s + dur)
def low(t, g, d=3.0): cue(t, CY, 'rumble/fs222521.mp3', ss=1.99, to=1.99 + d, lp=200, gain=g, fi=0.3, fo=1.2)
def slam(t, g, pan=0): cue(t, K, 'guillotine/fs669293.mp3', gain=g, pan=pan, onset=True, fo=0.3)
def swish(t, g, pan=0): cue(t, K, 'blade_swish/fs390776.mp3', gain=g, pan=pan, pre=0.12, fo=0.1)
def chain(t, g, pan=0, k=0): cue(t, ZO, ['chain/fs345070.mp3', 'chain/fs344585.mp3'][k % 2], gain=g, pan=pan, to=1.4, fo=0.4)

# ---- beds: night crickets outside, cave drips + low wind underground, fire in the burning village
OUT = [('p01', 'p03'), ('p07', 'p08'), ('p09', 'p11')]; IN = [('p03', 'p04'), ('p05', 'p07'), ('p08', 'p09'), ('p11', 'p14')]
for a, b in OUT: bed(K, 'night_amb/fs719558.mp3', TB[a] - 0.3, TB[b] + 0.4, -22, ss=2.0)
bed(ZF, 'wind/fs567356.mp3', TB['p04'] - 0.3, TB['p05'] + 0.4, -25, lp=2500)
for a, b in IN: bed(ZO, 'cave/fs343742.mp3', TB[a] - 0.3, TB[b] + 0.4, -23, ss=3.0); bed(ZF, 'wind/fs567356.mp3', TB[a] - 0.3, TB[b] + 0.4, -29, lp=900, ss=8.0)
bed(K, 'fire_big/fs630599.mp3', TB['p10'] - 0.2, TB['p11'] + 0.4, -17)
bed(CY, 'fire_crackle/fs181563.mp3', TB['p05'] - 0.3, TB['p06'] + 0.3, -27)      # the torches by the wall
bed(CY, 'fire_crackle/fs181563.mp3', TB['p13'] - 0.3, TB['p14'] + 0.3, -27, ss=5.0)
for i, p in enumerate(['p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12', 'p13', 'p14']): slidew(TB[p], i)

# P01 the village at night: an owl, Link's steps
cue(0.4, K, 'night_amb/fs486390.mp3', ss=1.0, to=3.5, gain=-24, pan=0.5, fi=0.2, fo=0.8)
steps(0.15, 2.2, 3.4, -24, -0.2)
# P02 the earth opens on "temple"; the three guillotines drop in turn
cue(VW('l02', 'temple') - 0.35, CY, 'stone_door/fs50701.mp3', gain=-17, to=2.0, fo=0.6); low(VW('l02', 'temple') - 0.3, -19, 2.5)
tG = VW('l02', 'guillotines') - 0.25
for j, (dl, pan) in enumerate([(0, -0.35), (0.35, 0.0), (0.7, 0.35)]):
    for c in range(3):
        t = tG + dl + c * 1.6
        if t < TB['p03'] - 0.1: swish(t, -22, pan); slam(t + 0.25, -15 - c * 2, pan)
# P03 the Sheikah eye opens; the wrapped Sheikah walks in
chime(VW('l03', 'sheikah') - 0.4, -20, 0.0, k=2, dur=2.5, semi=-5); cue(VW('l03', 'sheikah') - 0.45, ZO, 'magic/fs735062.mp3', gain=-21, fo=0.5)
steps(VW('l03', 'shadows') - 0.3, VW('l03', 'shadows') + 1.3, 3.2, -24, 0.45)
# P04 the eye doorway rises out of the ground, the torches catch
cue(TB['p04'] + 0.15, CY, 'stone_door/fs50701.mp3', gain=-15, to=2.0, fo=0.6); low(TB['p04'] + 0.2, -17, 2.0)
cue(TB['p04'] + 1.0, CY, 'fire_ignite/fs186374.mp3', gain=-21, pan=-0.3, onset=True, fo=0.4)
steps(TB['p04'] + 0.6, TB['p04'] + 2.3, 3.0, -24, -0.3)
# P05 the words stitch in: a whisper under them, a low swell on "bloody"
cue(VW('l05', 'here') - 0.2, ZF, 'curse/fs466658.mp3', gain=-22, onset=False, to=3.5, fi=0.3, fo=1.0); low(VW('l05', 'bloody') - 0.2, -18, 2.5)
# P06 blades drop in rhythm, the spiked walls grind in, the floor vanishes
tB = LT('l06') - 0.1
for j, (dl, pan) in enumerate([(0, 0.2), (0.45, 0.45)]):
    for c in range(3):
        t = tB + dl + c * 1.8
        if t < TB['p07'] - 0.1: swish(t, -21, pan); slam(t + 0.22, -16 - c, pan)
cue(VW('l06', 'spiked') - 0.2, K, 'spikes/fs530075.mp3', gain=-17, pan=-0.4); cue(VW('l06', 'spiked') - 0.1, K, 'spikes/fs530075.mp3', gain=-18, pan=0.4, semi=-2)
cue(VW('l06', 'invisible') - 0.3, ZO, 'magic/fs735062.mp3', gain=-21, fo=0.5)
steps(TB['p06'] + 0.4, TB['p06'] + 3.4, 1.8, -25, 0.0)
# P07 the rope goes down the shaft; the lens glows at the bottom
cue(LT('l07') + 0.2, P1, 'wood_creak/fs506664.mp3', gain=-21, semi=-2, fo=0.3, onset=True); cue(LT('l07') + 1.2, P1, 'wood_creak/fs506664.mp3', gain=-23, semi=-4, fo=0.3, onset=True)
cue(VW('l07', 'lens') - 0.3, ZO, 'sparkle2/fs817466.mp3', gain=-19, fo=0.8); chime(VW('l07', 'truth') - 0.1, -21, 0.0, k=1, dur=1.8, semi=-3)
# P08 Dead Hand: the arms come out of the dirt, the creature groans
cue(VW('l08', 'pale') - 0.3, ZO, 'crumble/fs391919.mp3', gain=-23, pan=0.3, to=1.5, fo=0.4); cue(VW('l08', 'pale') + 0.2, ZO, 'crumble/fs391919.mp3', gain=-25, pan=0.6, ss=0.4, to=1.8, fo=0.4)
cue(VW('l08', 'dead') - 0.1, K, 'groan/fs594010.mp3', gain=-14, pan=0.3, fo=0.4, semi=-2)
# P09 Impa's seal closes over the well
cue(LT('l09') - 0.1, ZF, 'curse/fs466658.mp3', gain=-21, onset=False, to=2.0, fi=0.2, fo=0.6)
cue(VW('l09', 'sealed') - 0.35, ZO, 'magic/fs735062.mp3', gain=-17, fo=0.5); chime(VW('l09', 'sealed') - 0.05, -18, -0.3, k=0, dur=2.2, semi=-2)
# P10 it breaks loose: a whoosh up out of the well, the roofs catch fire
cue(VW('l10', 'broke') - 0.25, ZF, 'whoosh/fs737238.mp3', gain=-15, pan=0.4, semi=-4); low(VW('l10', 'broke') - 0.2, -14, 2.5)
cue(VW('l10', 'broke'), ZF, 'curse/fs466658.mp3', gain=-19, pan=0.4, onset=False, to=2.0, fo=0.6)
cue(TB['p10'] + 0.15, CY, 'fire_ignite/fs186374.mp3', gain=-17, pan=-0.1, onset=True, fo=0.5)
# P11 Bongo Bongo: the drum booms on the hands' beat, Link draws the sword
for k, n in enumerate(range(int(TB['p11'] * 1.1), int(TB['p12'] * 1.1) + 1)):   # beats of the drawn hands: sin peak at TT*1.1 = n + 0.25
    tb = (n + 0.25) / 1.1
    if TB['p11'] + 0.2 <= tb < TB['p12'] - 0.2: cue(tb, ZO, 'drum/fs459217.mp3', gain=-13 - (k % 2) * 2, lp=1800, fo=0.3, onset=True)
cue(VW('l11', 'bongo') - 0.2, ZF, 'sword_draw/fs788532.mp3', gain=-17, pan=-0.4, to=1.2)
# P12 empty cells, chains; the FAN THEORY tag swings down
chain(TB['p12'] + 0.3, -22, 0.3, 0); chain(LT('l13') - 0.2, -21, -0.2, 1)
cue(VW('l13', 'fans') - 0.1, ZF, 'whoosh/fs737238.mp3', gain=-21, semi=3); chain(VW('l13', 'fans') + 0.5, -20, 0.2, 1)
# P13 back at the wall: a last low swell on "words"
low(VW('l14', 'words') - 0.3, -17, 3.0); cue(VW('l14', 'words') - 0.2, ZF, 'curse/fs466658.mp3', gain=-24, onset=False, to=2.5, fo=1.0)
# P14 end card
cue(TB['p14'] + 0.05, ZO, 'drum/fs459217.mp3', gain=-9, lp=1200, fo=0.8, onset=True); low(TB['p14'] + 0.05, -10, 3.2)   # the sign-off sting
chime(TB['p14'] + 0.3, -12, 0.0, k=0, dur=3.2); cue(TB['p14'] + 0.5, ZO, 'sparkle2/fs817466.mp3', gain=-17, fo=1.0)

miss = sorted({c['file'] for c in C if not os.path.exists(c['file'])}); assert not miss, miss
json.dump(sorted(C, key=lambda c: c['t']), open(os.path.join(HERE, 'cues.json'), 'w'), indent=0)
print(len(C), 'cues')
