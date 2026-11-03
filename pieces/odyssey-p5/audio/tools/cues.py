# Odyssey p5 (Calypso, the Phaeacians): "sonido pro" cue list. Times come from voice.json:
# panel starts TB = first line (or word) t0 - 0.25 s (as in src/head.html), events on word times (the same offsets the scenes use).
# Real CC0 recordings: the cyclops library (CY), parts 1-4 (P1..P4) and part 5's own (P5). Writes cues.json for sfxmix.py.
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); PIECE = os.path.dirname(os.path.dirname(HERE))
P5 = os.path.join(PIECE, 'audio', 'sfxlib', 'raw') + '/'
P4 = os.path.abspath(os.path.join(PIECE, '../odyssey-p4/audio/sfxlib/raw')) + '/'
P3 = os.path.abspath(os.path.join(PIECE, '../odyssey-p3/audio/sfxlib/raw')) + '/'
P2 = os.path.abspath(os.path.join(PIECE, '../odyssey-p2/audio/sfxlib/raw')) + '/'
P1 = os.path.abspath(os.path.join(PIECE, '../odyssey-p1/audio/sfxlib/raw')) + '/'
CY = os.path.abspath(os.path.join(PIECE, '../odyssey-cyclops/audio/sfxlib/raw')) + '/'
PICK = json.load(open(os.path.join(HERE, 'pick.json')))      # cat -> the chosen P5 file names (after earshot verify), and *_ss start points
def F(cat, i=0): f = PICK[cat][i % len(PICK[cat])]; return f if '/' in f else cat + '/' + f
def SS(cat, i=0, d=0.0): v = PICK.get(cat + '_ss', [d]); v = v if isinstance(v, list) else [v]; return v[i % len(v)]

V = json.load(open(os.path.join(PIECE, 'voice.json'))); L = {l['id']: l for l in V['lines']}; END = V['duration']
def LT(i): return L[i]['t0']
def LE(i): return L[i]['t1']
def VW(i, w, n=1):
    k = 0
    for x in L[i]['words']:
        if re.sub(r"[^a-z0-9']", '', x['w'].lower()) == w and (k := k + 1) == n: return x['t0']
    raise KeyError((i, w))
PS = [('p01', 'l01'), ('p02', 'l02'), ('p03', 'l03'), ('p04', 'l04'), ('p05', 'l05'), ('p06', 'l06'), ('p07', 'l08'), ('p08', 'l09'), ('p09', 'l10'), ('p10', 'l11'),
      ('p11', 'l12'), ('p12', 'l13'), ('p13', 'l14'), ('p14', 'l15'), ('p15', 'l16'), ('p16', 'l17'), ('p17', 'l19'), ('p18', 'l20'), ('p19', 'l21'), ('p20', 'l22'),
      ('p21', 'l23'), ('p22', 'l24'), ('p23', 'l25'), ('p24', 'l26'), ('p25', 'l27'), ('p26', 'l28'), ('p27', 'l29'), ('p28', 'l30'), ('p29', 'l31'), ('p30', 'l32', 'father'),
      ('p31', 'l33'), ('p32', 'l34'), ('p33', 'l35'), ('p34', 'l36'), ('p35', 'l37'), ('p36', 'l39'), ('p37', 'l39', 'name'), ('p38', 'l40'), ('p39', 'l41'), ('p40', 'l42'),
      ('p41', 'l43'), ('p42', 'l44'), ('p43', 'l45')]
TB = {p[0]: (0 if p[1] == 'l01' else (VW(p[1], p[2]) if len(p) > 2 else LT(p[1])) - 0.25) for p in PS}
IDS = [p[0] for p in PS]
def NX(p): i = IDS.index(p); return TB[IDS[i + 1]] if i + 1 < len(IDS) else END

C = []
def cue(t, f, lib=CY, **k): C.append(dict(t=round(t, 3), file=lib + f, name=f, **k))
def ev(t, f, lib=P5, **k): cue(t, f, lib, onset=True, **k)
def bed(t0, t1, f, g, lib=P1, ss=0, **k): cue(t0, f, lib, ss=ss, dur=round(t1 - t0, 3), norm='int', gain=g, **k)
def span(p, q=None, pre=0.3, post=0.3): return TB[p] - pre, NX(q or p) + post

STEP = [(15.279, 15.62), (5.819, 6.145), (17.09, 17.645), (6.476, 6.75), (11.531, 11.9), (2.094, 2.45)]
def msteps(t0, t1, rate, g, pan=0, semi=0, lp=None):
    t = t0; i = 0
    while t < t1:
        a, b = STEP[i % len(STEP)]; cue(t - 0.005, 'men_steps/fs503671.mp3', ss=a, to=b, gain=g - (2 if i % 3 == 1 else 0), pan=pan, semi=semi, lp=lp, fo=0.05)
        t += 1 / rate; i += 1
def sand_run(t0, t1, g, pan=0):
    t = t0; i = 0
    while t < t1: cue(t, 'run_sand/fs584322.mp3', P3, ss=0.2 + (i % 4) * 0.45, to=0.2 + (i % 4) * 0.45 + 0.3, gain=g - (i % 2), pan=pan, fo=0.05); t += 0.27; i += 1
def boom(t, g, pan=0, tail=2.5):
    cue(t - 0.03, 'thud/fs504626.mp3', ss=0.37, to=1.415, semi=-4, gain=g, pan=pan, lp=2500)
    cue(t, 'rumble/fs222521.mp3', ss=1.99, to=1.99 + tail, lp=220, gain=g - 6, pan=pan, fo=1.0, fi=0.02)
def slidew(t, i):
    f = ['slide_whoosh/fs843664.mp3', 'slide_whoosh/fs843665.mp3'][i % 2]; a, b = [(0.197, 0.655), (0.068, 0.416)][i % 2]
    cue(t, f, ss=a, to=b, pre=0.25, gain=-15, pan=0.3, hp=150, fi=0.03, fo=0.12)
def knock(t, g, pan=0, semi=2): cue(t, 'wood/fs521399.mp3', ss=0.051, to=0.4, gain=g, semi=semi, pan=pan, fo=0.08)
CH = [('chime/fs169281.mp3', 0.3), ('chime/fs644684.mp3', 0.3), ('chime/fs415446.mp3', 0.2)]
def chime(t, g, pan=0, dur=2.0, k=0, semi=0): f, s = CH[k % 3]; cue(t, f, P3, ss=s, gain=g, pan=pan, fi=0.05, fo=0.8, semi=semi, to=s + dur)
def creak(t, g, pan=0, semi=-3): ev(t, 'wood_creak/fs506664.mp3', P1, gain=g, pan=pan, semi=semi, fo=0.2)
def rope(t, g, pan=0): ev(t, 'rope_strain/fs676988.mp3', P1, gain=g, pan=pan)
def whoosh(t, g, pan=0, semi=0): ev(t, 'throw_whoosh/fs475134.mp3', CY, gain=g, pan=pan, semi=semi, fo=0.1)
def splash(t, g, pan=0, k=0): f, b = [('splash/fs442773.mp3', 2.1), ('splash/fs436792.mp3', 1.7), ('splash/fs583348.mp3', 3.3)][k % 3]; ev(t, f, CY, gain=g, pan=pan, to=b, fo=0.4)
def thunder(t, g, k=0, pan=0, to=5.0): ev(t, ['thunder/fs534023.mp3', 'thunder/fs760212.mp3', 'thunder/fs760213.mp3'][k % 3], P1, gain=g, pan=pan, to=to, fo=1.5)
def wings(t, g, pan=0, k=0): ev(t, ['wings/fs543110.mp3', 'wings/fs642879.mp3'][k % 2], P3, gain=g, pan=pan, to=1.4, fo=0.3)
def lyre(t0, t1, g, k=0, pan=-0.4, ss_add=0): cue(t0, F('lyre', k), P5, ss=SS('lyre', k) + ss_add, dur=round(t1 - t0, 3), norm='int', gain=g, pan=pan, fi=0.4, fo=0.8)
def laugh(t, g, k=0, pan=0.3, d=2.5): cue(t, F('women_laugh', k), P5, ss=SS('women_laugh', k), to=SS('women_laugh', k) + d, gain=g, pan=pan, fi=0.05, fo=0.5)
def ball(t, g, pan=0, k=0): ev(t, F('ball', k), gain=g, pan=pan, ss=SS('ball', k), to=SS('ball', k) + 0.4, fo=0.08, lp=4000)

# ================= beds =================
t0, t1 = span('p01'); bed(0, t1, 'sea/fs648859.mp3', -14, CY, ss=10, fi=0.3, fo=0.8); bed(0, t1, 'crickets/fs268962.mp3', -28, fi=0.5, fo=0.8)   # P01 night sea
ISLE = [('p02', 'p07'), ('p15', 'p17')]                                                                                              # Calypso's island: springs, birds
for a, b in ISLE:
    t0, t1 = span(a, b); bed(t0, t1, F('spring'), -19, P5, ss=SS('spring'), fi=0.6, fo=0.6, pan=-0.2); bed(t0, t1, 'birds/fs731819.mp3', -22, ss=40 + t0 % 60, fi=0.6, fo=0.6)
    bed(t0, t1, 'calm_shore/fs521602.mp3', -22, ss=t0 % 50, fi=0.6, fo=0.6, pan=0.4)
t0, t1 = span('p08', 'p11'); bed(t0, t1, 'calm_shore/fs521602.mp3', -15, ss=70, fi=0.5, fo=0.8); bed(t0, t1, 'seagulls/fs512099.mp3', -25, P4, ss=4, fi=0.6, fo=0.8, pan=0.4)
for p in ['p12', 'p14']: t0, t1 = span(p); bed(t0, t1, 'ghost_wind/fs440962.mp3', -22, ss=60 + t0 % 30, fi=0.5, fo=0.6)               # Olympus
t0, t1 = span('p13'); bed(t0, t1, 'sea/fs648859.mp3', -17, CY, ss=60, fi=0.4, fo=0.6)
bed(VW('l14', 'feast') - 0.4, t1, F('feast'), -24, P5, ss=SS('feast'), to=15.7, fi=0.6, fo=0.6, pan=0.6)                                    # P13 Poseidon's feast, far off
t0, t1 = span('p18'); bed(t0, t1, 'calm_shore/fs521602.mp3', -18, ss=100, fi=0.4, fo=0.6); bed(t0, t1, 'birds/fs731819.mp3', -22, ss=150, fi=0.4, fo=0.6)
t0, t1 = span('p19', 'p20'); bed(t0, t1, 'sea/fs648859.mp3', -15, CY, ss=80, fi=0.4, fo=0.6); bed(t0, t1, 'sail_flap/fs57278.mp3', -24, P2, fi=0.4, fo=0.6, pan=0.2)
t0, t1 = span('p21'); bed(t0, t1, 'storm/fs700454.mp3', -10, ss=20, fi=0.6, fo=0.8); bed(VW('l23', 'cloud'), t1, F('rain'), -16, P5, ss=SS('rain'), fi=0.8, fo=0.8)
t0, t1 = span('p22'); bed(t0, t1, 'sea/fs550915.mp3', -13, CY, ss=30, fi=0.4, fo=0.6); bed(t0, t1, 'wind_howl/fs735347.mp3', -24, ss=20, lp=1200, fi=0.5, fo=0.6)
t0, t1 = span('p23'); bed(t0, t1, F('stream'), -15, P5, ss=SS('stream'), fi=0.5, fo=0.6); bed(t0, t1, 'calm_shore/fs521602.mp3', -21, ss=120, fi=0.4, fo=0.6, pan=-0.5)
t0, t1 = span('p24'); bed(t0, t1, F('stream'), -21, P5, ss=SS('stream') + 20, fi=0.5, fo=0.6); bed(VW('l26', 'slept') - 0.5, t1, 'crickets/fs268962.mp3', -27, ss=10, fi=1.0, fo=0.6)
t0, t1 = span('p25', 'p29'); bed(t0, t1, F('stream'), -18, P5, ss=SS('stream') + 30, fi=0.5, fo=0.8); bed(t0, t1, 'birds/fs731819.mp3', -21, ss=200, fi=0.5, fo=0.8)
HALL = ('p30', 'p38'); t0, t1 = span(*HALL); bed(t0, t1, 'fire_crackle/fs350757.mp3', -24, CY, ss=5, fi=0.5, fo=0.8, pan=0.4)    # the Phaeacian hall
t0, t1 = span('p30'); bed(t0, t1, F('feast'), -24, P5, ss=SS('feast') + 3, to=15.7, fi=0.5, fo=0.6)
t0, t1 = span('p31', 'p32'); bed(t0, t1, F('feast'), -27, P5, ss=SS('feast') + 6, to=15.7, fi=0.5, fo=0.6)
lyre(TB['p31'] + 0.3, NX('p33') - 0.2, -17, 0)                                                                                     # Demodocus' lyre, stops when the king speaks
t0, t1 = span('p36', 'p37'); bed(t0, t1, 'ghost_wind/fs675368.mp3', -26, P1, ss=4, fi=0.6, fo=0.8)
t0, t1 = span('p38'); bed(VW('l40', 'midnight') - 0.3, t1, 'crickets/fs268962.mp3', -28, ss=20, fi=1.0, fo=0.6)
t0, t1 = span('p39'); bed(t0, t1, 'harbour_calm/fs637206.mp3', -16, P2, ss=6, fi=0.4, fo=0.6); bed(t0, t1, 'seagulls/fs512099.mp3', -26, P4, ss=12, fi=0.5, fo=0.6, pan=-0.4)
t0, t1 = span('p40'); bed(t0, t1, 'sea/fs648859.mp3', -15, CY, ss=100, fi=0.5, fo=0.6); bed(t0, t1, 'oars/fs588307.mp3', -19, CY, ss=8, fi=0.5, fo=0.6)
bed(VW('l42', 'skimmed') - 0.4, t1, 'wind_gust/fs567887.mp3', -18, P2, fi=0.8, fo=0.6, pan=0.3)
t0, t1 = span('p41', 'p42'); bed(t0, t1, 'calm_shore/fs521602.mp3', -15, ss=150, fi=0.6, fo=0.8); bed(t0, t1, 'seagulls/fs512099.mp3', -24, P4, ss=20, fi=0.6, fo=0.8, pan=0.4)
t0, t1 = span('p43'); bed(t0, END, 'calm_shore/fs521602.mp3', -15, ss=180, fi=0.4, fo=3.0); bed(t0, END, 'seagulls/fs512099.mp3', -25, P4, ss=28, fi=0.8, fo=3.0, pan=-0.4)

# ================= the frieze sliding panel to panel =================
for i, p in enumerate(IDS[1:]): slidew(TB[p] + 0.1, i)

# ================= events =================
boom(TB['p01'] + 0.4, -6, 0, tail=3.5)                                                                                              # P01 XI · CALYPSO
for i in range(10): knock(VW('l01', 'tenth') - 0.4 + i * 0.08, -22, -0.2, semi=3) if i % 2 == 0 else None
creak(VW('l01', 'threw') - 0.6, -15, -0.3); splash(VW('l01', 'threw') + 0.3, -11, 0.1, 2)
ev(VW('l01', 'threw') + 1.0, 'body_fall/fs614064.mp3', P3, gain=-14, pan=0.2, to=1.0)
chime(VW('l02', 'beautiful') - 0.3, -22, 0.1, k=1, dur=1.8)                                                                        # P02 Calypso
msteps(VW('l02', 'nymph') - 0.2, VW('l02', 'nymph') + 2.2, 1.6, -24, -0.1)
ev(VW('l03', 'fed') - 0.2, 'cup/fs214186.mp3', P3, gain=-17, pan=0.1)                                                              # P03 the cup
chime(VW('l03', 'love') - 0.3, -22, 0.0, k=2, dur=2.0, semi=-2)
cue(VW('l04', 'leave') - 0.3, 'rumble/fs222521.mp3', ss=1.99, to=4.0, lp=200, gain=-17, fi=0.3, fo=1.2)                           # P04
for i in range(7): knock(VW('l05', 'seven') - 0.3 + i * 0.3, -18 - i % 2, -0.3, semi=1)                                           # P05 seven years
ev(VW('l06', 'offered') - 0.2, 'cup/fs368614.mp3', P3, gain=-18, pan=0.2)                                                           # P06 immortality
chime(VW('l07', 'immortal') - 0.4, -17, 0.1, k=0, dur=2.5); chime(VW('l07', 'immortal') - 0.1, -21, -0.1, k=2, dur=2.0, semi=5)
ev(VW('l08', 'old') - 0.3, 'sword/fs471147.mp3', CY, gain=-22, pan=-0.2); ev(VW('l08', 'die') - 0.3, 'sword/fs471147.mp3', CY, gain=-21, pan=0.2)   # P07 two strokes
msteps(TB['p08'] + 0.2, VW('l09', 'sat') - 0.3, 2.3, -21, -0.3)                                                                    # P08 to the rocks, weeping
cue(VW('l09', 'cried') - 0.2, 'sobbing/fs643669.mp3', P1, ss=1.0, to=4.0, gain=-20, pan=0.0, fi=0.2, fo=1.0)
chime(VW('l10', 'smoke') - 0.3, -22, 0.5, k=1, dur=2.5, semi=-3)                                                                    # P09 the smoke of Ithaca
cue(VW('l10', 'die') - 0.3, 'rumble/fs222521.mp3', ss=1.99, to=4.0, lp=200, gain=-18, fi=0.3, fo=1.2)
ev(VW('l11', 'forever') + 0.5, 'sword/fs471147.mp3', CY, gain=-21, pan=-0.4)                                                       # P10 forever struck out, Penelope
chime(VW('l11', 'wife') - 0.3, -21, 0.4, k=0, dur=2.0, semi=-2)
chime(VW('l13', 'pity') - 0.3, -20, 0.0, k=1, dur=2.0)                                                                             # P12 the gods take pity
boom(VW('l14', 'far') - 0.2, -16, 0.4, tail=2.0)                                                                                   # P13 the world's edge
cue(VW('l14', 'feast') - 0.2, 'fire_crackle/fs382616.mp3', CY, ss=2, to=5, gain=-24, pan=0.6, fi=0.2, fo=0.8)
msteps(VW('l15', 'zeus') - 2.0, VW('l15', 'zeus'), 2.2, -21, -0.3)                                                                  # P14 Athena to Zeus
chime(VW('l15', 'wisdom') - 0.3, -20, -0.2, k=2, dur=1.6)
ev(VW('l15', 'clever') - 0.2, 'wood/fs521401.mp3', CY, gain=-18, pan=0.2)
wings(VW('l16', 'hermes') - 0.3, -15, -0.4, 0); wings(VW('l16', 'hermes') + 0.9, -17, -0.2, 1)                                     # P15 Hermes flies down
ev(VW('l16', 'go') + 0.1, 'body_fall/fs502553.mp3', P3, gain=-22, pan=-0.1, to=0.8)
ev(VW('l17', 'furious') - 0.3, 'wind_burst/fs494789.mp3', P2, gain=-14, pan=0.2, to=2.0, fo=0.6)   # P16 Calypso furious
boom(VW('l17', 'furious') - 0.1, -15, 0.2, tail=2.0)
wings(VW('l19', 'but') - 0.1, -16, -0.3, 1)                                                                                         # P17 Hermes leaves
for i, w in enumerate(['cut', 'down', 'trees']): ev(VW('l20', w) - 0.1, F('axe_chop', i), gain=-9 - i % 2, pan=-0.3, ss=SS('axe_chop', i), to=SS('axe_chop', i) + 0.8)   # P18 the axe
ev(VW('l20', 'tools') - 0.2, 'sword/fs471147.mp3', CY, gain=-20, pan=0.3)
cue(VW('l20', 'trees') + 0.2, F('tree_fall'), P5, ss=SS('tree_fall'), to=SS('tree_fall') + 3.5, gain=-9, pan=-0.5, fi=0.02, fo=0.8)
for i in range(4): ev(VW('l20', 'built') - 0.1 + i * 0.22, ['wood/fs452554.mp3', 'wood/fs669467.mp3'][i % 2], CY, gain=-13 - i % 2, pan=0.4, semi=-3, lp=3000, fo=0.2)
rope(VW('l20', 'raft') - 0.1, -15, 0.4); creak(VW('l20', 'hands'), -17, 0.5)
cue(NX('p18') - 1.4, 'splash/fs436792.mp3', CY, to=1.7, gain=-17, pan=0.6, fo=0.5)
for i in range(18): knock(VW('l21', 'eighteenth') - 0.3 + i * 0.1, -22 - i % 2, -0.5, semi=4) if i % 3 == 0 else None           # P19 eighteen days
chime(VW('l21', 'land') - 0.3, -21, 0.5, k=1, dur=2.0)
cue(VW('l22', 'poseidon') - 0.6, 'rumble/fs222521.mp3', ss=1.99, to=5.0, lp=250, gain=-11, fi=0.4, fo=1.2, pan=-0.4)                 # P20 Poseidon rises
splash(VW('l22', 'poseidon') - 0.2, -11, -0.4, 0)
boom(VW('l22', 'saw') - 0.1, -10, -0.3, tail=2.5)
thunder(VW('l23', 'cloud') - 0.2, -8, 0, -0.2, to=6.0); thunder(VW('l23', 'stirred') - 0.1, -9, 1, 0.3)                              # P21 the storm
cue(VW('l23', 'trident') - 0.2, 'sea/fs550915.mp3', CY, ss=50, to=53, gain=-9, fi=0.2, fo=1.0)
ev(VW('l23', 'apart') - 0.3, 'ship_break/fs257752.mp3', P2, gain=-7, pan=0.3, fo=0.6); ev(VW('l23', 'apart'), 'wood_crack/fs403646.mp3', P4, gain=-10, pan=0.4, to=1.5)
splash(VW('l23', 'apart') + 0.6, -10, 0.4, 1)
cue(TB['p22'] + 0.3, 'paddle2/fs390006.mp3', P4, ss=0, to=NX('p22') - TB['p22'], gain=-16, pan=0.0, fi=0.3, fo=0.5)               # P22 swimming two days, two nights
for i in range(2): knock(VW('l24', 'two') - 0.3 + i * 0.4, -19, 0.4, semi=2)
for i in range(3): knock(VW('l25', 'third') - 0.4 + i * 0.25, -19, -0.5, semi=2)                                                 # P23 crawling out of the river
cue(VW('l25', 'dragged') - 0.2, 'drag2/fs535762.mp3', P4, ss=0, to=3.0, gain=-14, pan=0.0, fi=0.1, fo=0.6)
cue(VW('l25', 'dead') - 0.2, 'moan/fs182018.mp3', P3, ss=0, to=1.6, gain=-22, pan=0.0, fi=0.05, fo=0.6)
cue(VW('l26', 'leaves') - 0.5, F('leaves'), P5, ss=SS('leaves'), to=SS('leaves') + 3.0, gain=-12, pan=0.0, fi=0.1, fo=0.8)           # P24 the leaf bed
cue(VW('l26', 'slept') + 0.2, 'snore/fs684528.mp3', CY, ss=0, to=2.5, gain=-26, pan=0.0, fi=0.3, fo=0.8)
boom(TB['p25'] + 0.4, -6, 0, tail=3.5)                                                                                              # P25 XII · THE PHAEACIANS
t, i = TB['p25'] + 0.4, 0
while t < NX('p25'): ball(t, -13 - i % 2, -0.4 if i % 2 == 0 else 0.0, i); t += 1.1; i += 1
laugh(VW('l27', 'girls') - 0.3, -16, 0, 0.0)
cue(VW('l28', 'wash') - 0.3, F('wring'), P5, ss=SS('wring'), to=SS('wring') + 2.5, gain=-13, pan=0.1, fi=0.05, fo=0.5)             # P26 washing
laugh(VW('l28', 'maids') - 0.2, -20, 1, 0.4, d=2.0)
ev(VW('l29', 'stepped') - 0.6, 'rustle2/fs489915.mp3', P3, gain=-10, pan=-0.4, to=1.8)                                              # P27 out of the bush
msteps(VW('l29', 'stepped') - 0.4, VW('l29', 'stepped') + 1.6, 2.0, -20, -0.4)
cue(VW('l30', 'maids') - 0.3, 'scream_woman/fs520269.mp3', P1, ss=0, to=1.4, gain=-13, pan=0.3, fo=0.4)                              # P28 the maids run
sand_run(VW('l30', 'ran') - 0.3, NX('p28') + 0.6, -17, 0.5)
chime(VW('l31', 'ground') - 0.3, -22, 0.4, k=0, dur=1.8)                                                                            # P29 she stands; the clothes
cue(VW('l32', 'clothes') - 0.1, 'cloth/fs737238.mp3', P3, ss=0, to=1.5, gain=-14, pan=0.2, fo=0.4)
msteps(TB['p30'] - 0.2, TB['p30'] + 2.6, 2.3, -20, -0.4)                                                                            # P30 into the hall
boom(VW('l32', 'king') - 0.2, -17, 0.3, tail=2.0)
splash(VW('l32', 'sailors') - 0.2, -22, 0.0, 1)
cue(VW('l33', 'trojan') - 0.3, 'battle/fs675091.mp3', P1, ss=2, to=5, gain=-23, pan=0.2, lp=2500, fi=0.3, fo=1.0)                    # P31 the song of Troy
ev(VW('l34', 'horse') - 0.2, 'wood_creak/fs547466.mp3', P1, gain=-19, pan=0.2, semi=-4, fo=0.3)                                    # P32 the horse, the clever man
chime(VW('l34', 'clever') - 0.2, -22, 0.2, k=1, dur=1.6)
cue(VW('l35', 'cloak') - 0.3, 'cloth/fs494789.mp3', P3, ss=0, to=1.2, gain=-16, pan=0.0, fo=0.4)                                     # P33 he weeps
cue(VW('l35', 'wept') - 0.2, 'sobbing/fs157163.mp3', P1, ss=0.5, to=3.5, gain=-19, pan=0.0, fi=0.2, fo=1.0)
creak(VW('l36', 'king') - 0.2, -21, 0.3, 2)                                                                                         # P34 the king asks
cue(VW('l37', 'cyclops') - 0.3, 'roar/fs489901.mp3', CY, ss=0.267, to=1.9, semi=-4, gain=-21, pan=0.3, lp=2000, fo=0.5)             # P35 "I am Odysseus"
boom(VW('l38', 'odysseus') - 0.1, -6, 0, tail=3.5)
for i in range(11): whoosh(VW('l39', 'told') + 0.2 + i * 0.45, -22 - i % 2, 0.7 - 0.14 * i, semi=-2)                               # P36 the story told: the roundels pass
ev(VW('l39', 'cattle') - 0.1, 'cow/fs847404.mp3', P1, gain=-21, pan=-0.3, fo=0.4)
cue(VW('l39', 'lost') - 0.6, 'hum_woman/fs646179.mp3', P3, ss=0.5, to=4.0, gain=-27, pan=0.2, lp=2500, fi=0.6, fo=1.2)              # P37 the dead crew
cue(VW('l39', 'every') - 0.3, 'ghost_wind/fs440962.mp3', P1, ss=10, to=14, gain=-21, pan=0.4, fi=0.5, fo=1.2)
cue(VW('l40', 'silence') - 0.3, 'rumble/fs222521.mp3', ss=1.99, to=4.0, lp=200, gain=-22, fi=0.5, fo=1.2)                           # P38 silence until midnight
for i in range(3): ev(VW('l41', 'gifts') - 0.2 + i * 0.35, F('cutlery', i), P5, gain=-19, pan=-0.4 + 0.2 * i, to=1.2, fo=0.3)   # P39 gifts loaded
msteps(VW('l41', 'put') - 0.3, VW('l41', 'put') + 1.6, 2.4, -21, -0.3)
creak(VW('l41', 'ships') - 0.1, -18, 0.5)
cue(VW('l42', 'death') - 0.3, 'rumble/fs222521.mp3', ss=1.99, to=4.0, lp=200, gain=-19, fi=0.4, fo=1.2)                             # P40 the night crossing
ev(VW('l42', 'hawk') - 0.3, F('hawk'), gain=-15, pan=0.5, ss=SS('hawk'), to=SS('hawk') + 1.5, fo=0.4)
ev(VW('l42', 'skimmed') - 0.2, 'throw_whoosh/fs475131.mp3', CY, gain=-17, pan=0.2)
cue(VW('l43', 'woke') - 0.2, 'cloth/fs737238.mp3', P3, ss=0, to=1.2, gain=-19, pan=0.0, fo=0.4)                                      # P41 he wakes
chime(VW('l43', 'recognise') - 0.3, -23, -0.2, k=2, dur=1.8, semi=-3)
boom(VW('l44', 'ithaca') - 0.2, -7, 0, tail=3.5); chime(VW('l44', 'ithaca'), -17, 0.0, k=0, dur=3.0)                                  # P42 ITHACA
cue(VW('l45', 'cyclops') - 0.3, 'roar/fs489901.mp3', CY, ss=0.267, to=2.2, semi=-5, gain=-20, pan=0.3, lp=1800, fo=0.8)             # P43 as the Cyclops prayed
chime(LE('l45') + 0.5, -21, 0.0, k=1, dur=3.0, semi=-5)

# climaxes trimmed (as p2/p3/p4)
TRIM = [('p21', 1)]
for c in C:
    for p, d in TRIM:
        if TB[p] - 0.45 <= c['t'] < NX(p) - 0.45: c['gain'] = c.get('gain', 0) - d
for c in C:
    for k in [k for k, v in c.items() if v is None]: del c[k]
json.dump(sorted(C, key=lambda c: c['t']), open(os.path.join(HERE, 'cues.json'), 'w'), indent=0)
print(len(C), 'cues')
