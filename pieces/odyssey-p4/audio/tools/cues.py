# Odyssey p4 (the Sirens, Scylla and Charybdis, the Cattle of the Sun): "sonido pro" cue list. Times come from voice.json:
# panel starts TB = first line t0 - 0.25 s (as in src/head.html), events on word times (the same offsets the scenes use).
# Real CC0 recordings: the cyclops library (CY), parts 1-3 (P1, P2, P3) and part 4's own (P4). Writes cues.json for sfxmix.py.
# The Sirens' song = real female vocal / humming recordings (P3's hum_woman + P4's vocalise), never synthesized.
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); PIECE = os.path.dirname(os.path.dirname(HERE))
P4 = os.path.join(PIECE, 'audio', 'sfxlib', 'raw') + '/'
P3 = os.path.abspath(os.path.join(PIECE, '../odyssey-p3/audio/sfxlib/raw')) + '/'
P2 = os.path.abspath(os.path.join(PIECE, '../odyssey-p2/audio/sfxlib/raw')) + '/'
P1 = os.path.abspath(os.path.join(PIECE, '../odyssey-p1/audio/sfxlib/raw')) + '/'
CY = os.path.abspath(os.path.join(PIECE, '../odyssey-cyclops/audio/sfxlib/raw')) + '/'
PICK = json.load(open(os.path.join(HERE, 'pick.json')))      # cat -> the chosen P4 file names (after earshot verify), and *_ss start points
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
PS = [('p01', 'l01'), ('p02', 'l02'), ('p03', 'l03'), ('p04', 'l04'), ('p05', 'l05'), ('p06', 'l06'), ('p07', 'l07'), ('p08', 'l08'), ('p09', 'l10'), ('p10', 'l11'),
      ('p11', 'l12'), ('p12', 'l14'), ('p13', 'l16'), ('p14', 'l17'), ('p15', 'l19'), ('p16', 'l20'), ('p17', 'l21'), ('p18', 'l22'), ('p19', 'l23'), ('p20', 'l24'),
      ('p21', 'l25'), ('p22', 'l26'), ('p23', 'l27'), ('p24', 'l28'), ('p25', 'l29'), ('p26', 'l30'), ('p27', 'l31'), ('p28', 'l32'), ('p29', 'l33'), ('p30', 'l34'),
      ('p31', 'l36'), ('p32', 'l37'), ('p33', 'l38'), ('p34', 'l40'), ('p35', 'l41'), ('p36', 'l42'), ('p37', 'l45'), ('p38', 'l46'), ('p39', 'l48'), ('p40', 'l50'),
      ('p41', 'l51'), ('p42', 'l52'), ('p43', 'l53'), ('p44', 'l55'), ('p45', 'l56'), ('p46', 'l57'), ('p47', 'l59'), ('p48', 'l60')]
TB = {p[0]: (0 if p[1] == 'l01' else LT(p[1]) - 0.25) for p in PS}
IDS = [p[0] for p in PS]
def NX(p): i = IDS.index(p); return TB[IDS[i + 1]] if i + 1 < len(IDS) else END

C = []
def cue(t, f, lib=CY, **k): C.append(dict(t=round(t, 3), file=lib + f, name=f, **k))
def ev(t, f, lib=P4, **k): cue(t, f, lib, onset=True, **k)
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
CH = [('chime/fs169281.mp3', 0.3), ('chime/fs644684.mp3', 0.3), ('chime/fs415446.mp3', 0.2)]
def chime(t, g, pan=0, dur=2.0, k=0, semi=0): f, s = CH[k % 3]; cue(t, f, P3, ss=s, gain=g, pan=pan, fi=0.05, fo=0.8, semi=semi, to=s + dur)
def creak(t, g, pan=0, semi=-3): ev(t, 'wood_creak/fs506664.mp3', P1, gain=g, pan=pan, semi=semi, fo=0.2)
def rope(t, g, pan=0): ev(t, 'rope_strain/fs676988.mp3', P1, gain=g, pan=pan)
def whoosh(t, g, pan=0, semi=0): ev(t, 'throw_whoosh/fs475134.mp3', CY, gain=g, pan=pan, semi=semi, fo=0.1)
def shout(t, k, g, pan=0):
    f, a, b = [('shout/fs480805.mp3', 9.631, 10.668), ('shout/fs316640.mp3', 5.031, 6.3), ('shout/fs316640.mp3', 6.3, 7.043)][k % 3]
    cue(t, f, CY, ss=a, to=b, gain=g, pan=pan, fo=0.15)
def scream(t, k, g, pan=0):
    f, lib, a, b = [(F('man_scream', 0), P4, SS('man_scream', 0), SS('man_scream', 0) + 1.6), (F('man_scream', 1), P4, SS('man_scream', 1), SS('man_scream', 1) + 1.6),
                    ('scream_crowd/fs675052.mp3', P1, 1.0, 3.0), ('shout/fs480805.mp3', CY, 9.631, 10.668)][k % 4]
    cue(t, f, lib, ss=a, to=b, gain=g, pan=pan, fi=0.02, fo=0.3)
def snap(t, k, g, pan=0): ev(t, F('jaw_snap', k), gain=g, pan=pan, ss=SS('jaw_snap', k), to=SS('jaw_snap', k) + 1.2, fo=0.2)
def splash(t, g, pan=0, k=0): f, b = [('splash/fs442773.mp3', 2.1), ('splash/fs436792.mp3', 1.7), ('splash/fs583348.mp3', 3.3)][k % 3]; ev(t, f, CY, gain=g, pan=pan, to=b, fo=0.4)
def thunder(t, g, k=0, pan=0, to=5.0): ev(t, ['thunder/fs534023.mp3', 'thunder/fs760212.mp3', 'thunder/fs760213.mp3'][k % 3], P1, gain=g, pan=pan, to=to, fo=1.5)
def moo(t, g, pan=0, k=0, semi=0): ev(t, ['cow/fs513557.mp3', 'cow/fs847404.mp3'][k % 2], P1, gain=g, pan=pan, semi=semi, fo=0.4)
def song(t0, t1, g, k=0, pan=0.3, lp=None, fi=1.0, fo=1.2, ss_add=0):           # the Sirens: real women's voices
    f, lib, s = [(F('vocalise', 0), P4, SS('vocalise', 0)), ('hum_woman/fs646179.mp3', P3, 0.5), (F('vocalise', 1), P4, SS('vocalise', 1))][k % 3]
    cue(t0, f, lib, ss=s + ss_add, dur=round(t1 - t0, 3), norm='int', gain=g, pan=pan, lp=lp, fi=fi, fo=fo)

# ================= beds =================
t0, t1 = span('p01'); bed(0, t1, 'calm_shore/fs521602.mp3', -15, ss=10, fi=0.3, fo=0.8); bed(0, t1, 'birds/fs731819.mp3', -21, ss=120, fi=0.3, fo=0.8)    # P01 the shore at dawn
for a, b in [('p02', 'p03'), ('p08', 'p10')]:                                                                                     # the Sirens' isle
    t0, t1 = span(a, b); bed(t0, t1, 'harbour_calm/fs637206.mp3', -17, P2, ss=3, fi=0.5, fo=0.6); bed(t0, t1, F('seagulls'), -25, P4, ss=SS('seagulls'), fi=0.6, fo=0.6, pan=0.4)
for a, b, s in [('p04', 'p06', 10), ('p11', 'p13', 40), ('p20', 'p20', 70), ('p25', 'p25', 90), ('p29', 'p31', 110)]:          # the deck
    t0, t1 = span(a, b); bed(t0, t1, 'harbour_calm/fs851577.mp3', -19, P2, ss=s, fi=0.5, fo=0.6)
    bed(t0, t1, 'oars/fs588307.mp3', -21, CY, ss=s % 30 + 2, fi=0.6, fo=0.6, pan=-0.2)
t0, t1 = span('p07'); bed(t0, t1, 'sea/fs648859.mp3', -15, CY, ss=20, fi=0.4, fo=0.6); bed(t0, VW('l07', 'flat') + 0.5, 'wind_gust/fs731722.mp3', -20, P2, fi=0.3, fo=1.5)   # P07 the wind drops
t0, t1 = span('p14'); bed(t0, t1, 'sea/fs648859.mp3', -15, CY, ss=40, fi=0.4, fo=0.6); bed(t0, t1, 'oars/fs588307.mp3', -17, CY, ss=5, fi=0.5, fo=0.6, pan=-0.1)
STRAIT = [('p15', 'p17'), ('p22', 'p24'), ('p45', 'p47')]
for a, b in STRAIT:                                                                                                                # the strait: sea, the whirlpool's roar, wind in the rocks
    t0, t1 = span(a, b); bed(t0, t1, 'sea/fs550915.mp3', -15, CY, ss=10, fi=0.5, fo=0.6); bed(t0, t1, F('whirlpool'), -17, P4, ss=SS('whirlpool'), fi=0.8, fo=0.8, pan=-0.3)
    bed(t0, t1, 'wind_howl/fs735347.mp3', -26, ss=5, lp=900, fi=0.8, fo=0.8)
t0, t1 = span('p16'); bed(t0, t1, F('drain'), -14, P4, ss=SS('drain'), fi=0.6, fo=0.8)                                         # P16 Charybdis close
t0, t1 = span('p18'); bed(t0, t1, 'fire_crackle/fs350757.mp3', -25, CY, ss=5, fi=0.5, fo=0.6)                                  # P18 Circe's hall
t0, t1 = span('p19'); bed(t0, t1, 'ghost_wind/fs440962.mp3', -26, ss=40, fi=0.5, fo=0.5)                                       # P19 the scales
t0, t1 = span('p21'); bed(t0, t1, 'sea/fs648859.mp3', -15, CY, ss=60, fi=0.4, fo=0.6); bed(t0, t1, 'oars/fs588307.mp3', -18, CY, ss=12, fi=0.4, fo=0.6)
t0, t1 = span('p26', 'p27'); bed(t0, t1, 'sea/fs648859.mp3', -16, CY, ss=80, fi=0.4, fo=0.8); bed(t0, t1, 'oars/fs588307.mp3', -18, CY, ss=20, fi=0.4, fo=0.8)
t0, t1 = span('p28'); bed(t0, t1, 'sea/fs648859.mp3', -17, CY, ss=100, fi=0.4, fo=0.6); bed(t0, t1, 'birds/fs731819.mp3', -20, ss=60, fi=0.5, fo=0.6)  # P28 green and quiet
t0, t1 = span('p32'); bed(t0, t1, 'calm_shore/fs521602.mp3', -16, ss=40, fi=0.4, fo=0.6)                                       # P32 the beach
t0, t1 = span('p33'); bed(t0, VW('l38', 'south'), 'storm/fs700454.mp3', -9, ss=20, fi=0.4, fo=0.8)                            # P33 the storm, then the south wind
bed(VW('l38', 'south') - 0.5, t1, 'wind_gust/fs830009.mp3', -15, P2, fi=0.8, fo=0.8, pan=0.4)
t0, t1 = span('p34'); bed(t0, t1, 'calm_shore/fs521602.mp3', -17, ss=60, fi=0.4, fo=0.6); bed(t0, t1, F('seagulls'), -22, P4, ss=SS('seagulls') + 3, fi=0.5, fo=0.6, pan=-0.3)
t0, t1 = span('p35', 'p36'); bed(t0, t1, 'wind_howl/fs623604.mp3', -25, ss=10, lp=1500, fi=0.5, fo=0.6); bed(t0, t1, 'birds/fs731819.mp3', -22, ss=200, fi=0.5, fo=0.6)
t0, t1 = span('p37', 'p38'); bed(t0, t1, 'fire_crackle/fs350757.mp3', -17, CY, ss=20, fi=0.4, fo=0.6); bed(t0, t1, 'sizzle/fs365071.mp3', -22, CY, ss=0.65, fi=0.5, fo=0.6, pan=0.3)
t0, t1 = span('p39'); bed(t0, t1, 'ghost_wind/fs440962.mp3', -21, ss=60, fi=0.5, fo=0.6)                                       # P39 Olympus
t0, t1 = span('p40'); bed(t0, t1, 'sea/fs648859.mp3', -15, CY, ss=120, fi=0.4, fo=0.6); bed(t0, t1, 'wind_gust/fs567887.mp3', -20, P2, fi=0.8, fo=0.6)
t0, t1 = span('p41', 'p43'); bed(t0, t1, 'storm/fs700454.mp3', -13, ss=40, fi=0.4, fo=1.5)                                     # P41-P43 the wreck
t0, t1 = span('p44'); bed(t0, t1, 'sea/fs648859.mp3', -17, CY, ss=140, fi=0.6, fo=0.6); bed(t0, t1, 'crickets/fs268962.mp3', -30, fi=0.6, fo=0.6)   # P44 night drift
t0, t1 = span('p48'); bed(t0, END, 'sea/fs648859.mp3', -16, CY, ss=160, fi=0.4, fo=3.0); bed(t0, END, F('seagulls'), -27, P4, ss=SS('seagulls') + 6, fi=1.0, fo=3.0, pan=0.5)

# the Sirens' song: faint from P02, close in P08-P10, reaching the ship, fading through P14
song(TB['p02'] + 0.4, NX('p03') + 0.3, -17, k=0, pan=0.3)
song(VW('l07', 'song') - 1.0, NX('p07') + 0.3, -16, k=0, pan=0.6, ss_add=10, fi=1.5)
song(TB['p08'] - 0.3, NX('p10') + 0.3, -12, k=0, pan=0.25, ss_add=20)
song(TB['p08'] + 0.5, NX('p10') + 0.3, -18, k=1, pan=-0.2)
song(TB['p11'] - 0.3, NX('p13') + 0.3, -18, k=2, pan=0.5, lp=3500)
song(TB['p14'] - 0.3, VW('l17', 'faded') + 2.5, -16, k=0, pan=-0.6, ss_add=40, fo=2.5)

# ================= the frieze sliding panel to panel =================
for i, p in enumerate(IDS[1:]): slidew(TB[p] + 0.1, i)

# ================= events =================
boom(TB['p01'] + 0.4, -6, 0, tail=3.5)                                                                                              # P01 VIII · THE SIRENS
chime(VW('l01', 'warned') - 0.4, -21, -0.1, k=0, dur=1.5)                                                                           #   Circe's wand
msteps(TB['p01'] + 0.1, TB['p01'] + 2.4, 2.4, -20, -0.4)
ev(VW('l02', 'two') - 0.2, F('wings', 0) if 'wings' in PICK else 'wings/fs543110.mp3', P3, gain=-16, pan=0.3, to=1.4)            # P02 the Sirens alight
ev(VW('l03', 'steered') - 0.2, 'wood_creak/fs547466.mp3', P1, gain=-16, pan=-0.4, semi=-3, fo=0.3)                                   # P03 a ship turns to the rocks
ev(VW('l03', 'bones') - 0.3, F('bones', 0), gain=-11, pan=0.2, ss=SS('bones', 0), to=SS('bones', 0) + 1.5, fo=0.3)
cue(VW('l03', 'skin') - 0.4, 'rumble/fs222521.mp3', ss=1.99, to=4.0, lp=220, gain=-16, fi=0.2, fo=1.0)
ev(VW('l04', 'wax') - 0.3, F('wax', 0), gain=-11, pan=-0.2, ss=SS('wax', 0), to=SS('wax', 0) + 0.8)                                 # P04 the wax pressed in
ev(VW('l04', 'wax') + 0.4, F('wax', 1), gain=-13, pan=-0.4, ss=SS('wax', 1), to=SS('wax', 1) + 0.8)
creak(TB['p05'] + 0.4, -18, 0.3)                                                                                                    # P05 he leans to the sea
chime(VW('l05', 'hear') - 0.3, -24, -0.3, k=1, dur=1.2)
rope(VW('l06', 'tie') - 0.3, -12, -0.1); ev(VW('l06', 'mast') - 0.2, 'cord_creak/fs501012.mp3', P2, gain=-13, pan=0.1)                # P06 tied to the mast
ev(VW('l06', 'foot') - 0.2, 'rope_untie/fs841835.mp3', P2, gain=-14, pan=0.2)
rope(VW('l06', 'tighter') - 0.2, -10, 0.0); creak(VW('l06', 'tighter') - 0.1, -16, 0.1, -5)
ev(VW('l07', 'flat') - 0.3, 'sail_flap/fs57280.mp3', P2, gain=-19, pan=0.3, ss=5, to=7, fo=0.8)                                      # P07 the sail falls slack
boom(VW('l09', 'odysseus') - 0.3, -16, 0, tail=2.0)                                                                                  # P08 his name in the song
boom(VW('l10', 'troy') - 0.3, -13, -0.3, tail=2.0); cue(VW('l10', 'troy'), 'fire_crackle/fs350757.mp3', CY, ss=30, to=33, gain=-21, pan=-0.4, fi=0.3, fo=0.8)   # P09 Troy burning
chime(VW('l10', 'earth') - 0.3, -19, 0.1, k=2, dur=2.0)
chime(VW('l11', 'knowing') - 0.3, -22, 0.3, k=0, dur=1.5)                                                                           # P10
chime(VW('l13', 'fame') - 0.3, -19, -0.3, k=1, dur=1.5); chime(VW('l13', 'know') - 0.3, -19, 0.3, k=2, dur=1.5)                      # P11 the crown, the eye
shout(VW('l14', 'begged') - 0.2, 0, -10, -0.1)                                                                                      # P12 he begs, he pulls
shout(VW('l15', 'shouted') - 0.1, 1, -9, -0.1); rope(VW('l15', 'pulled') - 0.2, -9, -0.1); creak(VW('l15', 'pulled'), -12, 0.0, -6)
shout(VW('l15', 'skin') - 0.1, 2, -12, -0.1); rope(VW('l15', 'cut') - 0.2, -11, 0.1)
msteps(VW('l16', 'two') - 0.2, VW('l16', 'two') + 1.3, 3.0, -18, 0.2)                                                              # P13 tied tighter
rope(VW('l16', 'tied') - 0.2, -10, 0.2); ev(VW('l16', 'tighter') - 0.1, 'cord_creak/fs501013.mp3', P2, gain=-11, pan=-0.2)
ev(VW('l18', 'wax') - 0.3, F('wax', 2), gain=-15, pan=0.2, ss=SS('wax', 2), to=SS('wax', 2) + 0.8)                                 # P14 the wax out
cue(VW('l18', 'narrowest') - 0.5, 'rumble/fs222521.mp3', ss=1.99, to=5.0, lp=220, gain=-15, fi=0.5, fo=1.5)
boom(TB['p15'] + 0.4, -6, 0, tail=3.5)                                                                                              # P15 IX · SCYLLA AND CHARYBDIS
cue(VW('l20', 'swallowed') - 0.4, F('drain'), P4, ss=SS('drain') + 10, to=SS('drain') + 14, gain=-11, fi=0.2, fo=1.0)                 # P16 Charybdis swallows
for i in range(3): knock(VW('l20', 'three') - 0.2 + i * 0.25, -18, 0.5, semi=-2)
ev(VW('l20', 'every') - 0.2, 'wood_creak/fs583239.mp3', P1, gain=-14, pan=0.2, semi=-4, fo=0.4); ev(VW('l20', 'close') - 0.2, 'ship_break/fs257752.mp3', P2, gain=-14, pan=0.1, lp=2500, fo=0.6)
cue(VW('l21', 'scylla') - 0.3, 'roar/fs489901.mp3', ss=0.267, to=2.725, semi=-3, gain=-11, pan=0.4, fo=0.8)                         # P17 Scylla
for i in range(6): knock(VW('l21', 'six') - 0.2 + i * 0.12, -19, -0.5, semi=-2)
snap(VW('l21', 'teeth') - 0.2, 0, -10, 0.4); snap(VW('l21', 'teeth') + 0.4, 1, -13, 0.5)
cue(TB['p18'] + 0.2, 'whisper/fs763864.mp3', CY, ss=2.0, to=3.5, gain=-22, pan=0.3, lp=3000, fi=0.3, fo=0.6)                        # P18 Circe's warning (memory)
cue(VW('l22', 'fight') - 0.3, F('whirlpool'), P4, ss=SS('whirlpool') + 8, to=SS('whirlpool') + 11, gain=-20, pan=-0.3, fi=0.3, fo=0.8)
cue(VW('l22', 'both') - 0.1, 'roar/fs489901.mp3', ss=0.267, to=1.879, semi=-4, gain=-20, pan=0.3, lp=2000, fo=0.4)
boom(VW('l22', 'choose') - 0.2, -12, 0, tail=2.0)
ev(VW('l23', 'whole') - 0.3, F('scales', 0), gain=-13, pan=-0.3, ss=SS('scales', 0), to=SS('scales', 0) + 1.2)                       # P19 the scales tip
ev(VW('l23', 'men') - 0.3, F('scales', 1), gain=-11, pan=0.3, ss=SS('scales', 1), to=SS('scales', 1) + 1.2); creak(VW('l23', 'men'), -15, 0.0, 2)
cue(VW('l24', 'nothing') - 0.4, 'rumble/fs222521.mp3', ss=1.99, to=4.5, lp=200, gain=-15, fi=0.4, fo=1.2)                           # P20 tells them nothing
ev(VW('l25', 'armour') - 0.2, 'chains/fs611669.mp3', P1, gain=-14, pan=0.3, to=1.2, fo=0.3)                                         # P21 armour, spears
ev(VW('l25', 'spears') - 0.2, 'sword/fs471147.mp3', CY, gain=-15, pan=0.3)
msteps(VW('l25', 'stood') - 0.3, VW('l25', 'bow') + 0.2, 2.2, -18, 0.4)
cue(VW('l26', 'terror') - 0.3, 'scream_crowd/fs675052.mp3', P1, ss=1.0, to=3.0, gain=-22, lp=2500, pan=-0.2, fi=0.3, fo=0.6)        # P22 terror
cue(VW('l26', 'whirlpool') - 0.3, F('drain'), P4, ss=SS('drain') + 20, to=SS('drain') + 24, gain=-13, pan=-0.5, fi=0.3, fo=1.0)
cue(VW('l27', 'heads') - 0.6, 'roar/fs607201.mp3', ss=0.046, to=2.76, semi=-3, gain=-6, pan=0.3, fo=0.8)                             # P23 the six heads come down
for i in range(6): whoosh(VW('l27', 'heads') - 0.4 + i * 0.12, -13 - i % 2, -0.5 + 0.2 * i, semi=-4)
boom(VW('l27', 'down') + 0.2, -7, 0, tail=2.5)
for i in range(6): snap(VW('l28', 'moment') - 0.2 + i * 0.22, i, -9 - (i % 2) * 2, -0.5 + 0.2 * i)                                  # P24 six men taken
for i, w in enumerate(['lifted', 'air', 'screaming', 'name']): scream(VW('l28', w) - 0.2, i, -9 - i % 2, -0.4 + 0.25 * i)
scream(VW('l28', 'reaching') - 0.2, 0, -12, 0.3)
whoosh(VW('l28', 'screaming') + 0.3, -12, 0.2)
cue(VW('l29', 'save') - 0.4, 'rumble/fs222521.mp3', ss=1.99, to=4.5, lp=200, gain=-14, fi=0.3, fo=1.5)                              # P25 not a single one
cue(VW('l30', 'shot') - 0.3, 'wind_gust/fs727097.mp3', P2, ss=0, to=3, gain=-14, pan=0.3, fi=0.1, fo=1.0)                           # P26 out of the strait
chime(VW('l31', 'pitiful') - 0.4, -24, -0.3, k=1, dur=2.5, semi=-5)                                                                 # P27
boom(TB['p28'] + 0.4, -6, 0, tail=3.5)                                                                                              # P28 X · THE CATTLE OF THE SUN
moo(VW('l32', 'cattle') - 0.1, -14, 0.3, 0); moo(VW('l32', 'lowing') - 0.2, -16, 0.5, 1); moo(VW('l32', 'lowing') + 1.4, -20, 0.1, 0, semi=-2)
chime(VW('l33', 'prophecy') - 0.4, -20, -0.2, k=0, dur=2.0)                                                                        # P29 the prophecy (Tiresias)
cue(VW('l33', 'prophecy') - 0.2, 'whisper/fs763864.mp3', CY, ss=2.0, to=3.8, gain=-22, pan=-0.2, lp=3000, fi=0.2, fo=0.6)
cue(VW('l34', 'worn') - 0.3, 'snore/fs684528.mp3', ss=0.0, to=3.0, gain=-22, pan=0.4, fi=0.3, fo=0.8)                               # P30 worn out
creak(VW('l35', 'stood') - 0.2, -16, -0.2)
cue(VW('l36', 'iron') - 0.2, 'sword/fs471147.mp3', ss=0.0, to=1.0, gain=-19, pan=-0.3, fo=0.5)                                       # P31 made of iron
for i in range(3): knock(VW('l37', 'swear') - 0.2 + i * 0.3, -17, -0.2 + 0.2 * i, semi=-1)                                          # P32 the oath
moo(VW('l37', 'cattle') - 0.1, -18, 0.5, 1)
thunder(VW('l38', 'storm') - 0.3, -6, 0, -0.2, to=6.0); thunder(VW('l38', 'storm') + 1.2, -10, 2, 0.3)                              # P33 the storm
for i in range(30): knock(VW('l39', 'month') - 0.6 + i * 0.05, -24, 0.0, semi=4) if i % 3 == 0 else None
splash(VW('l40', 'fished') - 0.2, -18, 0.4, 1)                                                                                      # P34 fishing, birds, hunger
ev(VW('l40', 'birds') - 0.3, 'wings/fs543110.mp3', P3, gain=-17, pan=0.2, to=1.4)
cue(VW('l40', 'starved') - 0.4, 'rumble/fs222521.mp3', ss=1.99, to=4.0, lp=200, gain=-18, fi=0.3, fo=1.2)
cue(VW('l41', 'praying') - 0.3, F('hum_women') if 'hum_women' in PICK else 'whisper/fs763864.mp3', P4 if 'hum_women' in PICK else CY, ss=SS('hum_women', 0, 2.0), to=SS('hum_women', 0, 2.0) + 3.0, gain=-26, pan=0.5, lp=2500, fi=0.5, fo=1.0)   # P35 his prayer, far off
for t in [VW('l42', 'starving'), VW('l43', 'kill'), VW('l44', 'drown')]: shout(t - 0.1, 1, -21, -0.3)                              # P36 the speech; the cattle
moo(VW('l43', 'cattle') - 0.1, -15, 0.6, 0)
splash(VW('l44', 'gulp') - 0.2, -13, 0.3, 2)
msteps(VW('l45', 'back') - 0.3, VW('l45', 'back') + 2.2, 2.2, -19, -0.5)                                                          # P37 the roast, the prophecy returns
cue(VW('l45', 'smell') - 0.3, 'sizzle/fs365071.mp3', CY, ss=0.65, to=2.65, gain=-14, pan=0.3, fi=0.1, fo=0.6)
boom(LE('l45') + 0.2, -11, 0, tail=2.5); chime(LE('l45') + 0.3, -18, -0.1, k=2, dur=2.5)
cue(VW('l46', 'strangest') - 0.4, 'rumble/fs222521.mp3', ss=1.99, to=4.5, lp=220, gain=-15, fi=0.3, fo=1.2)                         # P38 hides crawl, meat moos
for i in range(2): cue(VW('l47', 'crawled') - 0.3 + i * 0.6, F('drag', i) if 'drag' in PICK else F('squelch', i), P4, ss=SS('drag', i), to=SS('drag', i) + 2.0, gain=-13 - i, pan=-0.4 + 0.3 * i, fi=0.05, fo=0.5)
ev(VW('l47', 'crawled') + 0.2, F('squelch', 0), gain=-15, pan=-0.3, ss=SS('squelch', 0), to=SS('squelch', 0) + 1.0)
moo(VW('l47', 'mooed') - 0.2, -10, 0.4, 0, semi=-3); moo(VW('l47', 'mooed') + 0.5, -13, 0.6, 1, semi=-5)
ev(VW('l48', 'sun') - 0.3, 'fire_ignite/' + sorted(os.listdir(CY + 'fire_ignite'))[0], CY, gain=-16, pan=-0.3, fo=0.5)              # P39 the Sun's anger, Zeus
boom(VW('l48', 'zeus') - 0.2, -12, 0.3, tail=2.0)
thunder(VW('l48', 'punish') - 0.1, -16, 2, 0.4, to=3.0)
cue(VW('l49', 'dead') - 0.3, 'ghost_wind/fs675368.mp3', P1, ss=3.0, to=6.0, gain=-18, pan=0.0, fi=0.4, fo=1.0)
chime(VW('l49', 'shine') - 0.3, -19, 0.0, k=1, dur=2.0)
ev(VW('l50', 'sailed') - 0.3, 'sail_flap/fs57280.mp3', P2, gain=-15, pan=0.3, ss=5, to=7, fo=0.6)                                     # P40 the thunderbolt
cue(VW('l50', 'thunderbolt') - 0.8, 'rumble/fs222521.mp3', ss=1.99, to=3.0, lp=300, gain=-14, fi=0.5, fo=0.2)
thunder(VW('l50', 'thunderbolt') + 0.1, -2, 1, 0.1, to=6.0)
ev(VW('l51', 'mast') - 0.2, F('wood_crack', 0), gain=-8, pan=0.3, ss=SS('wood_crack', 0), to=SS('wood_crack', 0) + 1.5)             # P41 the mast falls on the helmsman
creak(VW('l51', 'came') - 0.2, -10, 0.3, -7)
ev(VW('l51', 'crushed') - 0.1, 'thud/fs346692.mp3', CY, gain=-6, pan=0.0, ss=0.482, to=1.2); ev(VW('l51', 'crushed'), 'bone/fs488659.mp3', CY, gain=-11, pan=0.0)
ev(VW('l51', 'skull') - 0.1, 'body_fall/fs614064.mp3', P3, gain=-13, pan=-0.2, to=1.0)
cue(VW('l52', 'smoke') - 0.3, 'fire_crackle/fs382616.mp3', CY, ss=2, to=6, gain=-16, pan=0.2, fi=0.3, fo=0.8)                          # P42 smoke; men thrown overboard
ev(VW('l52', 'thrown') - 0.3, 'men_panic/fs481741.mp3', P2, gain=-12, pan=0.0, to=2.5, fo=0.5)
for i in range(4): splash(VW('l52', 'thrown') + 0.7 + i * 0.3, -11 - i, [-0.6, 0.5, 0.7, -0.8][i], i)
for i in range(3): splash(VW('l53', 'waves') + i * 0.9, -19, -0.4 + 0.4 * i, 1)                                                     # P43 around the wreck, under
for i in range(6): cue(VW('l53', 'under') - 0.2 + i * 0.35, 'rock_water/fs583348.mp3', P2, ss=0.0, to=1.2, gain=-17 - i % 2, pan=-0.6 + 0.24 * i, lp=1500, fo=0.4)
cue(VW('l54', 'all') - 0.2, 'rumble/fs222521.mp3', ss=1.99, to=5.0, lp=200, gain=-12, fi=0.1, fo=2.0)
rope(VW('l55', 'lashed') - 0.2, -12, -0.2); creak(VW('l55', 'keel') - 0.1, -14, -0.1, -4)                                           # P44 the raft, the night current
cue(VW('l55', 'night') - 0.2, F('paddle', 0) if 'paddle' in PICK else 'rock_water/fs83740.mp3', P4 if 'paddle' in PICK else P2, ss=SS('paddle', 0), to=SS('paddle', 0) + 3, gain=-19, pan=0.2, fi=0.3, fo=0.8)
cue(VW('l56', 'charybdis') - 0.6, F('drain'), P4, ss=SS('drain') + 30, to=SS('drain') + 34, gain=-10, pan=-0.3, fi=0.4, fo=1.0)        # P45 back to Charybdis
cue(VW('l57', 'sucked') - 0.4, F('drain'), P4, ss=SS('drain') + 40, to=SS('drain') + 43, gain=-9, pan=-0.2, fi=0.1, fo=0.8)           # P46 sucked down; the leap; the fig tree
creak(VW('l57', 'sucked'), -11, -0.2, -6)
whoosh(VW('l57', 'jumped') - 0.1, -10, 0.3, semi=-2)
ev(VW('l57', 'grabbed') - 0.1, 'rustle2/fs489915.mp3', P3, gain=-11, pan=0.4, to=1.5)
cue(VW('l58', 'bat') - 0.2, 'birds/fs731819.mp3', P1, ss=30, to=34, gain=-23, pan=0.5, fi=0.5, fo=1.0)
cue(VW('l58', 'spit') - 0.3, F('whirlpool'), P4, ss=SS('whirlpool') + 16, to=SS('whirlpool') + 19, gain=-15, fi=0.3, fo=1.0)
splash(VW('l59', 'eventually') - 0.2, -12, -0.2, 2)                                                                                  # P47 the wood comes up; he drops; he paddles
splash(VW('l59', 'dropped') - 0.1, -9, 0.3, 0)
cue(VW('l59', 'paddled') - 0.2, F('paddle', 0) if 'paddle' in PICK else 'rock_water/fs83740.mp3', P4 if 'paddle' in PICK else P2, ss=SS('paddle', 0) + 3, to=SS('paddle', 0) + 7, gain=-14, pan=0.2, fi=0.1, fo=0.8)
for i in range(9): knock(VW('l60', 'nine') - 0.3 + i * 0.18, -19 - i % 2, -0.4, semi=3)                                            # P48 nine days; DC -> I
tE = LE('l60') + 0.6
boom(tE, -13, 0.2, tail=2.0); ev(tE + 0.9, 'sword/fs471147.mp3', CY, gain=-20, pan=0.2)
boom(tE + 1.6, -9, 0.4, tail=3.0)

# climaxes trimmed (as p2/p3)
TRIM = [('p24', 1), ('p42', 1)]
for c in C:
    for p, d in TRIM:
        if TB[p] - 0.45 <= c['t'] < NX(p) - 0.45: c['gain'] = c.get('gain', 0) - d
for c in C:
    for k in [k for k, v in c.items() if v is None]: del c[k]
json.dump(sorted(C, key=lambda c: c['t']), open(os.path.join(HERE, 'cues.json'), 'w'), indent=0)
print(len(C), 'cues')
