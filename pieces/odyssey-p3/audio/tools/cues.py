# Odyssey p3 (Circe, the Underworld): "sonido pro" cue list. Times come from voice.json:
# panel starts TB = first line (or word) t0 - 0.25 s (as in src/head.html), events on word times (the same offsets the scenes use).
# Real CC0 recordings: the cyclops library (CY), part 1's (P1), part 2's (P2) and part 3's own (P3). Writes cues.json for sfxmix.py.
# Ghost murmurs = real crowd recordings and real wind, pitched down and low-passed (no synthesis).
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); PIECE = os.path.dirname(os.path.dirname(HERE))
P3 = os.path.join(PIECE, 'audio', 'sfxlib', 'raw') + '/'
P2 = os.path.abspath(os.path.join(PIECE, '../odyssey-p2/audio/sfxlib/raw')) + '/'
P1 = os.path.abspath(os.path.join(PIECE, '../odyssey-p1/audio/sfxlib/raw')) + '/'
CY = os.path.abspath(os.path.join(PIECE, '../odyssey-cyclops/audio/sfxlib/raw')) + '/'
PICK = json.load(open(os.path.join(HERE, 'pick.json')))      # cat -> the chosen P3 file names (after earshot verify)
def F(cat, i=0): f = PICK[cat][i % len(PICK[cat])]; return f if '/' in f else cat + '/' + f

V = json.load(open(os.path.join(PIECE, 'voice.json'))); L = {l['id']: l for l in V['lines']}; END = V['duration']
def LT(i): return L[i]['t0']
def LE(i): return L[i]['t1']
def VW(i, w, n=1):
    k = 0
    for x in L[i]['words']:
        if re.sub(r"[^a-z0-9']", '', x['w'].lower()) == w and (k := k + 1) == n: return x['t0']
    raise KeyError((i, w))
PS = [('p01', 'l01'), ('p02', 'l02'), ('p03', 'l04'), ('p04', 'l05'), ('p05', 'l06'), ('p06', 'l07'), ('p07', 'l08'), ('p08', 'l09'), ('p09', 'l10'), ('p10', 'l12'),
      ('p11', 'l13'), ('p12', 'l14'), ('p13', 'l14', 'odysseus'), ('p14', 'l15'), ('p15', 'l16'), ('p16', 'l17'), ('p17', 'l19'), ('p18', 'l20'), ('p19', 'l22'),
      ('p20', 'l23'), ('p21', 'l24'), ('p22', 'l25'), ('p23', 'l26'), ('p24', 'l27'), ('p25', 'l28'), ('p26', 'l29'), ('p27', 'l30'), ('p28', 'l31'), ('p29', 'l32'),
      ('p30', 'l33'), ('p31', 'l35'), ('p32', 'l36'), ('p33', 'l37'), ('p34', 'l38'), ('p35', 'l40'), ('p36', 'l41'), ('p37', 'l43'), ('p38', 'l46'), ('p39', 'l48'),
      ('p40', 'l50'), ('p41', 'l52'), ('p42', 'l55'), ('p43', 'l56'), ('p44', 'l58'), ('p45', 'l59'), ('p46', 'l61'), ('p47', 'l64'), ('p48', 'l66')]
TB = {p[0]: (0 if p[1] == 'l01' else (VW(p[1], p[2]) if len(p) > 2 else LT(p[1])) - 0.25) for p in PS}
IDS = [p[0] for p in PS]
def NX(p): i = IDS.index(p); return TB[IDS[i + 1]] if i + 1 < len(IDS) else END

C = []
def cue(t, f, lib=CY, **k): C.append(dict(t=round(t, 3), file=lib + f, name=f, **k))
def ev(t, f, lib=P3, **k): cue(t, f, lib, onset=True, **k)
def bed(t0, t1, f, g, lib=P1, ss=0, **k): cue(t0, f, lib, ss=ss, dur=round(t1 - t0, 3), norm='int', gain=g, **k)
def span(p, q=None, pre=0.3, post=0.3): return TB[p] - pre, NX(q or p) + post

STEP = [(15.279, 15.62), (5.819, 6.145), (17.09, 17.645), (6.476, 6.75), (11.531, 11.9), (2.094, 2.45)]
def msteps(t0, t1, rate, g, pan=0, semi=0, lp=None):
    t = t0; i = 0
    while t < t1:
        a, b = STEP[i % len(STEP)]; cue(t - 0.005, 'men_steps/fs503671.mp3', ss=a, to=b, gain=g - (2 if i % 3 == 1 else 0), pan=pan, semi=semi, lp=lp, fo=0.05)
        t += 1 / rate; i += 1
def boom(t, g, pan=0, tail=2.5):
    cue(t - 0.03, 'thud/fs504626.mp3', ss=0.37, to=1.415, semi=-4, gain=g, pan=pan, lp=2500)
    cue(t, 'rumble/fs222521.mp3', ss=1.99, to=1.99 + tail, lp=220, gain=g - 6, pan=pan, fo=1.0, fi=0.02)
def slidew(t, i):
    f = ['slide_whoosh/fs843664.mp3', 'slide_whoosh/fs843665.mp3'][i % 2]; a, b = [(0.197, 0.655), (0.068, 0.416)][i % 2]
    cue(t, f, ss=a, to=b, pre=0.25, gain=-15, pan=0.3, hp=150, fi=0.03, fo=0.12)
def knock(t, g, pan=0, semi=2): cue(t, 'wood/fs521399.mp3', ss=0.051, to=0.4, gain=g, semi=semi, pan=pan, fo=0.08)
def chime(t, g, pan=0, dur=2.0, k=0, semi=0): cue(t, F('chime', k), P3, ss=PICK.get('chime_ss', [0.5])[k % len(PICK.get('chime_ss', [0.5]))], to=None, dur=None, gain=g, pan=pan, fi=0.05, fo=0.8, semi=semi, cut=dur)
def pig(t, k, g, pan=0):
    f, lib, a, b = [(F('pig_squeal', 0), P3, 4.02, 5.16), ('pig/fs233177.mp3', P1, 0, 1.2), (F('pig_squeal', 0), P3, 1.82, 3.64), (F('pig_squeal', 1), P3, 0, 1.7)][k % 4]
    ev(t, f, lib, gain=g, pan=pan, fo=0.3, ss=a, to=b)
def gulp(t, g, pan=0): ev(t, 'gulp/fs445970.mp3', CY, gain=g, pan=pan, fo=0.2)
def thudk(t, g, pan=0): cue(t, 'thud/fs346692.mp3', ss=0.482, to=1.2, gain=g, pan=pan)
def murmur(t0, t1, g, ss=5, semi=-5, lp=900, k=0, fi=1.0, fo=1.0, pan=0):                # the dead: a real crowd pitched down, muffled
    cue(t0, F('crowd_murmur', k), P3, ss=ss, dur=round(t1 - t0, 3), norm='int', gain=g, semi=semi, lp=lp, fi=fi, fo=fo, pan=pan)
def moan(t, k, g, pan=0, semi=-3): ev(t, F('moan', k), P3, gain=g, pan=pan, semi=semi, lp=2200, fo=0.5, cut=2.2)
def sword(t, g, pan=0): ev(t, 'sword/fs471147.mp3', CY, gain=g, pan=pan)
def whoosh(t, g, pan=0, semi=0): ev(t, 'throw_whoosh/fs475134.mp3', CY, gain=g, pan=pan, semi=semi, fo=0.1)

# ================= beds =================
t0, t1 = span('p01'); bed(0, t1, 'sea/fs648859.mp3', -15, CY, ss=5, fi=0.3, fo=0.8); bed(0, t1, 'birds/fs731819.mp3', -21, ss=40, fi=0.3, fo=0.8)   # P01 open sea
t0, t1 = span('p02'); bed(t0, t1, 'harbour_calm/fs637206.mp3', -17, P2, ss=3, fi=0.4, fo=0.6); bed(t0, t1, 'sail_flap/fs57280.mp3', -23, P2, ss=12, fi=0.5, fo=0.6, pan=0.2)  # P02 deck
t0, t1 = span('p03'); bed(t0, t1, 'calm_shore/fs521602.mp3', -18, ss=10, fi=0.5, fo=0.8, pan=-0.3)                                               # P03 beach
t0, t1 = span('p03', 'p05'); bed(t0, t1, F('forest'), -16, P3, ss=10, fi=0.8, fo=0.8)                                                               # P03-P05 the forest
t0, t1 = span('p06', 'p07'); bed(t0, t1, 'fire_crackle/fs350757.mp3', -25, CY, ss=5, fi=0.5, fo=0.6)                                            # P06-P07 Circe's hall: hearth
t0, t1 = span('p08'); bed(t0, t1, F('forest'), -17, P3, ss=53, fi=0.5, fo=0.6)                                                                     # P08 outside
t0, t1 = span('p09', 'p10'); bed(t0, t1, 'fire_crackle/fs350757.mp3', -25, CY, ss=20, fi=0.5, fo=0.6)                                           # P09-P10 hall
t0, t1 = span('p11'); bed(t0, t1, F('forest'), -18, P3, ss=75, fi=0.5, fo=0.6)                                                                     # P11 the sty
bed(t0 + 0.6, t1, 'pig/fs233186.mp3', -18, P1, fi=0.5, fo=0.6)
t0, t1 = span('p12'); bed(t0, t1, 'calm_shore/fs521602.mp3', -16, ss=30, fi=0.4, fo=0.6); bed(t0, t1, 'sea/fs648859.mp3', -22, CY, ss=50, fi=0.4, fo=0.6)   # P12 shore
t0, t1 = span('p13', 'p16'); bed(t0, t1, F('forest'), -16, P3, ss=0, fi=0.6, fo=0.8)                                                            # P13-P16 forest path
t0, t1 = span('p17', 'p20'); bed(t0, t1, 'fire_crackle/fs350757.mp3', -25, CY, ss=30, fi=0.5, fo=0.6)                                           # P17-P20 hall
t0, t1 = span('p21'); bed(t0, t1, F('forest'), -18, P3, ss=59, fi=0.5, fo=0.6)                                                                    # P21 sty
t0, t1 = span('p22'); bed(t0, t1, 'crowd_drunk/fs651364.mp3', -22, lp=2500, ss=5, fi=0.6, fo=0.8)                                                # P22 a year of feasting
t0, t1 = span('p22', 'p24'); bed(t0, t1, 'fire_crackle/fs350757.mp3', -25, CY, ss=40, fi=0.5, fo=0.6)
t0, t1 = span('p25'); bed(t0 - 0.2, t1, 'ghost_wind/fs440962.mp3', -20, ss=10, fi=2.0, fo=0.8)                                                 # P25 the dark creeps in
t0, t1 = span('p26'); bed(t0, t1, 'sea/fs648859.mp3', -16, CY, ss=70, fi=0.5, fo=1.0); bed(t0 + 1, t1, 'ghost_wind/fs440962.mp3', -20, ss=25, fi=3.0, fo=0.8)   # P26 to the end of the world
UW = [('p27', 'p38'), ('p42', 'p47')]
for a, b in UW:
    t0, t1 = span(a, b, pre=0.4, post=0.5)
    bed(t0, t1, 'ghost_wind/fs440962.mp3', -18, ss=30, lp=2500, fi=1.0, fo=1.0)                                                                   # the underworld: dark wind
    bed(t0, t1, 'wind_howl/fs735347.mp3', -27, ss=5, lp=600, fi=1.0, fo=1.0)
murmur(TB['p29'] - 0.2, NX('p33'), -21, ss=5, fi=1.5)                                                                                              # P29-P33 the crowd of the dead
murmur(TB['p30'], NX('p30') + 0.3, -20, ss=30, k=1, semi=-4, pan=0.3)
murmur(TB['p36'], NX('p38'), -26, ss=50, fi=1.0)
murmur(TB['p42'], NX('p47'), -27, ss=80, k=1, fi=1.0)
t0, t1 = span('p34'); bed(t0, VW('l39', 'morning'), 'crickets/fs268962.mp3', -21, fi=0.5, fo=0.6); bed(VW('l39', 'morning') - 0.3, t1, 'birds/fs731819.mp3', -19, ss=60, fi=0.6, fo=0.6)   # P34 night / morning at Circe's
t0, t1 = span('p35'); bed(t0, t1, 'calm_shore/fs521602.mp3', -16, ss=40, fi=0.5, fo=0.6); bed(t0, t1, 'oars/fs588307.mp3', -22, CY, ss=20, fi=0.5, fo=0.6, pan=0.5)  # P35 the shore
t0, t1 = span('p39', 'p41'); bed(t0, t1, 'sea/fs648859.mp3', -17, CY, ss=90, fi=0.6, fo=0.6)                                                 # P39-P41 the vision
bed(TB['p41'], NX('p41'), 'crowd_drunk/fs651364.mp3', -26, lp=2200, ss=40, fi=1.0, fo=0.5, pan=0.4)                                             #   the suitors' feast
t0, t1 = span('p48'); bed(t0, t1, 'ghost_wind/fs440962.mp3', -22, ss=50, fi=0.3, fo=2.0); bed(VW('l66', 'light') - 0.5, END, 'birds/fs731819.mp3', -19, ss=100, fi=2.5, fo=3.0)  # P48 back to the light

# ================= the frieze sliding panel to panel =================
for i, p in enumerate(IDS[1:]): slidew(TB[p] + 0.1, i)

# ================= events =================
boom(TB['p01'] + 0.3, -6, 0, tail=3.5)                                                                                # P01 VI · CIRCE
for i, t in enumerate([TB['p02'] + 0.6, TB['p02'] + 2.8]): ev(t, 'wood_creak/fs506664.mp3', P1, gain=-17 - i, pan=-0.3, semi=-5, fo=0.2)  # P02 deck
cue(VW('l03', 'giants') - 0.3, 'roar/fs444445.mp3', ss=0.0, to=2.0, semi=-4, gain=-17, pan=0.2, lp=1500, fo=0.5)       #   the giants remembered
for i in range(5): knock(VW('l04', 'lots') - 0.2 + i * 0.18, -19 - i % 2, -0.3, semi=6)                                  # P03 lots shaken out
msteps(VW('l04', 'eurylochus') + 0.1, NX('p03'), 2.3, -18, 0.2)
msteps(TB['p04'] + 0.2, VW('l05', 'house'), 2.2, -18, -0.3)                                                             # P04 into the forest
chime(VW('l05', 'stone') - 0.3, -22, 0.2, k=0)                                                                           #   the polished stone gleams
ev(VW('l06', 'lions') - 0.4, F('lion', 0), gain=-11, pan=0.4, fo=0.4, cut=2.0)                                          # P05 lions, wolves
ev(VW('l06', 'wolves') - 0.3, F('wolf', 0), gain=-13, pan=0.6, fo=0.4, cut=1.8)
cue(VW('l06', 'wagging') - 0.2, F('dog_pant', 0), P3, ss=PICK.get('dog_pant_ss', 0.5), to=PICK.get('dog_pant_ss', 0.5) + 3.0, gain=-16, pan=0.5, fi=0.1, fo=0.6)
hum0 = VW('l07', 'singing') - 0.6                                                                                       # P06 Circe sings at the loom
cue(hum0, F('hum_woman', 0), P3, ss=PICK.get('hum_ss', 0.5), dur=round(NX('p07') - hum0 + 0.2, 3), norm='int', gain=-13, pan=0.2, fi=0.8, fo=0.8)
cue(VW('l07', 'loom') - 0.5, F('loom', 0), P3, ss=40.0, to=40.0 + (NX('p06') - VW('l07', 'loom') + 0.6), gain=-14, pan=0.25, fi=0.1, fo=0.6)   # the shuttle and beater (earshot find: 0:40-0:50)
ev(VW('l07', 'loom') - 0.2, F('loom', 1), gain=-16, pan=0.3, ss=5.39, to=6.81)
msteps(TB['p06'], TB['p06'] + 2.2, 2.4, -19, -0.4)
ev(VW('l08', 'circe') - 0.1, F('cup', 0), gain=-16, pan=0.3, cut=1.0)                                                  # P07 the cup, the food
knock(VW('l08', 'cheese') - 0.2, -19, 0.0, semi=-2)
ev(VW('l08', 'honey') - 0.2, F('cup', 1), gain=-18, pan=0.0, cut=1.0)
cue(VW('l08', 'wine') - 0.25, 'pour/fs164050.mp3', P1, ss=0.0, to=2.0, gain=-15, pan=0.05, fi=0.05, fo=0.5)
cue(TB['p08'] + 0.1, F('hum_woman', 0), P3, ss=PICK.get('hum_ss', 0.5) + 20, dur=round(NX('p08') - TB['p08'], 3), norm='int', gain=-22, lp=900, pan=0.4, fi=0.6, fo=0.6)  # P08 her song through the walls
cue(VW('l09', 'wrong') - 0.3, 'rumble/fs222521.mp3', ss=1.99, to=4.5, lp=220, gain=-14, fi=0.2, fo=1.0)
gulp(VW('l10', 'drugged') - 0.5, -15, -0.3)                                                                              # P09 drugged; the wand; pigs
for i in range(3): chime(VW('l11', 'touched') - 0.3 + i * 0.45, -18 - i, 0.3 - 0.3 * i, dur=1.2, k=i)
for i in range(3): pig(VW('l11', 'pigs') - 0.4 + i * 0.45 + 1.3, i, -10 - i, -0.4 + 0.3 * i)
pig(VW('l11', 'grunting') - 0.1, 3, -12, 0.0)
cue(TB['p10'] + 0.2, 'pig/fs233186.mp3', P1, ss=0.0, to=4.7, gain=-12, fi=0.2, fo=0.6)                               # P10 the pig breathes; the cruel part
cue(VW('l12', 'cruel') - 0.3, 'sobbing/fs643669.mp3', P1, ss=0.5, to=3.5, gain=-21, lp=2500, semi=-2, fi=0.2, fo=0.8)
for i in range(3): pig(TB['p11'] + 0.4 + i * 0.5, i + 1, -16 - i, -0.4 + 0.3 * i)                                    # P11 the sty
ev(VW('l13', 'acorns') - 0.2, F('acorn', 0), gain=-14, pan=0.1, cut=2.0)
pig(VW('l13', 'acorns') + 0.8, 3, -15, 0.2)
cue(TB['p12'] + 0.1, F('run_sand', 0), P3, ss=PICK.get('run_ss', 0.0), dur=round(VW('l14', 'ship') - TB['p12'] + 0.3, 3), norm='int', gain=-12, pan=-0.2, fi=0.05, fo=0.3)  # P12 he runs
sword(VW('l14', 'sword') - 0.3, -10, -0.2)                                                                               # P13 sword, alone
msteps(VW('l14', 'alone') - 0.3, VW('l14', 'alone') + 3.2, 2.0, -17, 0.0)
ev(VW('l15', 'stopped') - 0.5, F('wings', 0), gain=-13, pan=0.4, cut=1.6)                                              # P14 Hermes lands
chime(VW('l15', 'hermes') - 0.3, -19, 0.4, k=1)
ev(VW('l16', 'plant') - 0.4, F('rustle', 0), gain=-15, pan=0.0, cut=1.5)                                               # P15 moly
chime(VW('l16', 'flower') - 0.3, -20, 0.0, k=2, semi=2)
boom(VW('l16', 'moly') - 0.2, -12, 0, tail=2.5)
chime(VW('l18', 'wand') - 0.4, -21, 0.2, k=0, dur=1.0)                                                                 # P16 the plan on the ledge
sword(VW('l18', 'sword') - 0.3, -14, -0.2); whoosh(VW('l18', 'kill') - 0.2, -15, -0.1)
cue(VW('l19', 'drank') - 0.6, 'pour/fs164050.mp3', P1, ss=0.0, to=1.5, gain=-18, pan=0.2, fi=0.05, fo=0.4)          # P17 he drinks
gulp(VW('l19', 'drank') - 0.1, -12, -0.1)
for i in range(3): chime(VW('l20', 'touched') - 0.3 + i * 0.5, -16 - i, -0.1, dur=1.4, k=i)                           # P18 the wand fails
cue(VW('l21', 'nothing') - 0.3, 'rumble/fs222521.mp3', ss=1.99, to=3.5, lp=200, gain=-16, fi=0.05, fo=0.8)
sword(VW('l22', 'drew') - 0.3, -7, -0.2)                                                                                # P19 sword; she drops to her knees
thudk(VW('l22', 'dropped') - 0.1, -12, 0.3); ev(VW('l22', 'knees') - 0.2, F('cloth', 0), gain=-16, pan=0.3, cut=0.8)
chime(VW('l23', 'hermes') - 0.3, -22, -0.2, k=1)                                                                        # P20 Hermes remembered
for i in range(3): chime(VW('l24', 'turned') - 0.3 + i * 0.35, -18 - i, 0.3 * (i - 1), dur=1.2, k=i)                 # P21 the men come back
for i in range(3): pig(VW('l24', 'turned') - 0.2 + i * 0.35, i, -18 - i, 0.3 * (i - 1))
cue(VW('l24', 'younger') - 0.2, 'laugh/fs528357.mp3', ss=0.0, to=2.5, gain=-20, lp=3000, pan=0.1, fi=0.1, fo=0.6)
for i in range(12): knock(TB['p22'] + 0.2 + i * max(0.08, (VW('l25', 'year') - TB['p22'] - 0.6) / 12), -20 - i % 2)    # P22 twelve strokes
cue(VW('l26', 'remember') - 0.4, 'calm_shore/fs521602.mp3', P1, ss=20, to=24, gain=-17, pan=-0.2, fi=0.5, fo=1.2)      # P23 home in the roundel
thudk(VW('l27', 'asked') - 0.2, -17, -0.2)                                                                               # P24 he kneels
moan(VW('l28', 'dead') - 0.4, 0, -20, -0.5, semi=-5)                                                                    # P25 the house of the dead
boom(TB['p26'] + 0.3, -6, 0, tail=4.0)                                                                                  # P26 VII · THE UNDERWORLD
cue(VW('l29', 'never') - 0.4, 'rumble/fs222521.mp3', ss=1.99, to=5.0, lp=200, gain=-15, fi=0.5, fo=1.5)
cue(VW('l30', 'dug') - 0.3, F('dig', 0), P3, ss=3.02, to=3.02 + min(3.0, VW('l30', 'poured') - VW('l30', 'dug') + 0.2), gain=-12, pan=-0.2, fi=0.03, fo=0.3)   # earshot find: 0:03.0-0:06.0            # P27 the pit, the offerings
for w, f, lib, g, ss, to in [('milk', 'pour/fs164050.mp3', P1, -15, 0.0, 1.2), ('honey', F('drip', 0), P3, -16, 0.0, 1.2), ('wine', 'pour/fs164050.mp3', P1, -15, 1.0, 2.1),
                              ('water', 'pour/fs164050.mp3', P1, -14, 0.3, 1.4)]:
    cue(VW('l30', w) - 0.3, f, lib, ss=ss, to=to, gain=g, pan=0.1, fi=0.05, fo=0.3)
cue(VW('l30', 'barley') - 0.3, F('grain', 0), P3, ss=PICK.get('grain_ss', 0.3), to=PICK.get('grain_ss', 0.3) + 1.8, gain=-14, pan=0.1, fi=0.05, fo=0.5)
ev(VW('l31', 'ram') - 0.2, 'sheep/fs171151.mp3', CY, gain=-13, pan=0.4, fo=0.3)                                      # P28 the ram and the ewe
ev(VW('l31', 'ewe') - 0.2, 'hooves/fs677221.mp3', CY, gain=-14, pan=0.6, fo=0.3)
ev(VW('l31', 'cut') - 0.2, 'stab/fs395372.mp3', CY, gain=-10, pan=0.4)
for i in range(2): ev(VW('l31', 'cut') + 0.4 + i * 0.3, F('body_fall', i), gain=-13, pan=0.5, cut=1.0)
cue(VW('l31', 'blood') - 0.3, F('drip', 1), P3, ss=0.0, to=2.5, gain=-16, pan=0.0, fi=0.05, fo=0.6)
cue(VW('l32', 'dead') - 0.5, 'rumble/fs222521.mp3', ss=1.99, to=5.5, lp=220, gain=-12, fi=0.3, fo=1.5)                # P29 the dead rise
for i in range(3): moan(VW('l32', 'dark') - 0.3 + i * 0.7, i, -18 - i, 0.2 + 0.2 * i, semi=-4)
for w, k, pan in [('brides', 1, 0.2), ('young', 2, 0.35), ('old', 3, 0.5), ('soldiers', 0, 0.7)]: moan(VW('l33', w) - 0.3, k, -15, pan, semi=-3)   # P30 each kind of the dead
cue(VW('l34', 'terrible') - 0.4, 'scream_crowd/fs675052.mp3', P1, ss=1.0, to=4.5, semi=-5, lp=1200, gain=-15, pan=0.4, fi=0.2, fo=1.0)
msteps(VW('l34', 'pushing') - 0.3, VW('l34', 'pushing') + 1.5, 3.0, -19, 0.4, semi=-3, lp=1500)
gulp(VW('l35', 'blood') - 0.2, -16, 0.2)                                                                                 # P31 one drinks, and speaks
cue(VW('l35', 'speak') - 0.3, 'whisper/fs763864.mp3', ss=2.0, to=4.0, gain=-17, pan=0.2, lp=3000, fi=0.1, fo=0.5)
for i in range(3): whoosh(VW('l36', 'held') - 0.2 + i * 0.63, -15 - i, -0.2)                                        # P32 he holds them back
moan(VW('l36', 'held') + 0.3, 2, -18, 0.4)
moan(VW('l37', 'elpenor') - 0.3, 1, -15, 0.3, semi=0)                                                                    # P33 Elpenor
cue(VW('l38', 'sleep') - 0.3, 'snore/fs684528.mp3', ss=0.0, to=4.0, gain=-19, pan=0.3, fi=0.3, fo=0.8)              # P34 asleep on the roof, the fall
msteps(VW('l39', 'morning') + 0.2, VW('l39', 'stepped') - 0.1, 2.5, -20, 0.4)
whoosh(VW('l39', 'stepped') + 0.2, -16, 0.4, semi=-3)
ev(VW('l39', 'neck') - 0.2, F('body_fall', 2), gain=-10, pan=0.4, cut=1.0); ev(VW('l39', 'neck') - 0.15, 'bone/fs488659.mp3', CY, gain=-14, pan=0.4)
moan(VW('l40', 'begged') - 0.3, 1, -16, -0.2, semi=0)                                                                    # P35 his shade begs
cue(VW('l41', 'mother') - 0.2, F('woman_cry', 0), P3, ss=PICK.get('cry_ss', 0.5), to=PICK.get('cry_ss', 0.5) + 2.5, gain=-21, lp=2500, pan=0.4, fi=0.3, fo=0.8)  # P36 his mother
chime(VW('l42', 'alive') - 0.3, -24, 0.0, k=1)
cue(VW('l44', 'drink') - 0.3, F('woman_cry', 0), P3, ss=PICK.get('cry_ss', 0.5) + 3, to=PICK.get('cry_ss', 0.5) + 5.5, gain=-21, lp=2500, pan=0.4, fi=0.3, fo=0.8)   # P37 kept back
cue(VW('l45', 'hardest') - 0.4, 'rumble/fs222521.mp3', ss=1.99, to=4.5, lp=200, gain=-17, fi=0.5, fo=1.5)
for i in range(4): knock(TB['p38'] + 0.4 + i * 0.75, -21, 0.5, semi=-5)                                                 # P38 Tiresias' staff on the ground
gulp(VW('l47', 'drank') - 0.2, -17, 0.3)
boom(VW('l47', 'truth') - 0.2, -11, 0, tail=3.0)
ev(VW('l48', 'poseidon') - 0.3, 'thunder/fs534023.mp3', P1, gain=-10, to=4.0, fo=1.5)                                   # P39 Poseidon; his son
cue(VW('l48', 'son') - 0.3, 'roar/fs489901.mp3', ss=0.267, to=1.879, semi=-5, gain=-17, pan=0.5, lp=1800, fo=0.4)
boom(VW('l49', 'thing') - 0.2, -14, 0, tail=2.0)
ev(VW('l50', 'cattle') - 0.2, 'cow/fs513557.mp3', P1, gain=-14, pan=0.1, fo=0.4)                                         # P40 the Sun's cattle
ev(VW('l50', 'cattle') + 0.9, 'cow/fs847404.mp3', P1, gain=-17, pan=-0.3, fo=0.4)
ev(VW('l52', 'touch') - 0.2, 'cow/fs847404.mp3', P1, gain=-14, pan=-0.5, semi=-2, fo=0.4)                                # P41 the curse
ev(VW('l52', 'touch') + 0.3, 'stab/fs395373.mp3', CY, gain=-12, pan=-0.5)
ev(VW('l52', 'destroyed') - 0.4, 'thunder/fs760212.mp3', P1, gain=-8, to=4.0, fo=1.5)
ev(VW('l52', 'destroyed') - 0.0, 'ship_break/fs257752.mp3', P2, gain=-10, pan=-0.3, fo=0.5)
cue(VW('l52', 'die') - 0.3, 'scream_crowd/fs675052.mp3', P1, ss=5.0, to=7.0, gain=-18, lp=3000, pan=-0.3, fi=0.05, fo=0.5)
ev(VW('l54', 'bread') - 0.2, F('cup', 2), gain=-16, pan=0.4, cut=1.0)
cue(VW('l54', 'courting') - 0.2, 'laugh/fs380100.mp3', ss=0.0, to=2.0, gain=-19, lp=3000, pan=0.5, fi=0.05, fo=0.5)
gulp(VW('l55', 'drink') - 0.1, -17, 0.3)                                                                                 # P42 his mother drinks
cue(VW('l57', 'missing') - 0.3, F('woman_cry', 1), P3, ss=PICK.get('cry_ss2', 0.5), to=PICK.get('cry_ss2', 0.5) + 3.0, gain=-21, lp=3000, pan=0.3, fi=0.3, fo=1.0)  # P43
for w, n in [('reached', 1), ('three', 2), ('slipped', 1)]:                                                             # P44 three times
    t = VW('l58', w, n) - 0.4; ev(t, F('cloth', 1), gain=-15, pan=0.2, cut=0.8)
    cue(t + 0.2, 'ghost_wind/fs675368.mp3', P1, ss=3.0, to=5.0, gain=-19, pan=0.4, fi=0.3, fo=0.8)
moan(VW('l60', 'agamemnon') - 0.3, 3, -16, 0.3, semi=-2)                                                                # P45 Agamemnon
ev(VW('l60', 'murdered') - 0.2, 'stab/fs385966.mp3', CY, gain=-14, pan=0.3)
boom(VW('l61', 'achilles') - 0.3, -10, 0.2, tail=3.0)                                                                  # P46 Achilles
chime(VW('l63', 'king') - 0.3, -20, 0.2, k=2)
cue(VW('l65', 'field') - 0.3, 'cow/fs513557.mp3', P1, gain=-21, pan=-0.2, lp=2500, fo=0.4)                               # P47 the hired hand's field
cue(VW('l65', 'field'), 'birds/fs731819.mp3', P1, ss=10, to=13, gain=-22, pan=-0.2, fi=0.4, fo=0.8)
chime(VW('l65', 'king') - 0.3, -22, 0.2, k=2, semi=-5)
msteps(VW('l66', 'climbed') - 0.2, END - 1.5, 1.8, -19, 0.0)                                                            # P48 the climb

# climaxes trimmed (as p2)
TRIM = [('p30', 2), ('p41', 2)]
for c in C:
    for p, d in TRIM:
        if TB[p] - 0.45 <= c['t'] < NX(p) - 0.45: c['gain'] = c.get('gain', 0) - d
for c in C:
    for k in [k for k, v in c.items() if v is None]: del c[k]
    if 'cut' in c:                                              # cut = keep at most this many seconds after ss
        if 'to' not in c: c['to'] = c.get('ss', 0) + c['cut']
        del c['cut']
json.dump(sorted(C, key=lambda c: c['t']), open(os.path.join(HERE, 'cues.json'), 'w'), indent=0)
print(len(C), 'cues')
