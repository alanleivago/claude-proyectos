# Odyssey p2 (Aeolus and the Bag of Winds, the Laestrygonians): "sonido pro" cue list. Times come from voice.json:
# panel starts TB = first line t0 - 0.25 s (as in src/head.html), events on word times (the same offsets the scenes use).
# Real CC0 recordings: the cyclops library (CY), part 1's library (P1) and part 2's own (P2). Writes cues.json for sfxmix.py.
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); PIECE = os.path.dirname(os.path.dirname(HERE))
P2 = os.path.join(PIECE, 'audio', 'sfxlib', 'raw') + '/'
P1 = os.path.abspath(os.path.join(PIECE, '../odyssey-p1/audio/sfxlib/raw')) + '/'
CY = os.path.abspath(os.path.join(PIECE, '../odyssey-cyclops/audio/sfxlib/raw')) + '/'

V = json.load(open(os.path.join(PIECE, 'voice.json'))); L = {l['id']: l for l in V['lines']}; END = V['duration']
def LT(i): return L[i]['t0']
def VW(i, w, n=1):
    k = 0
    for x in L[i]['words']:
        if re.sub(r"[^a-z0-9']", '', x['w'].lower()) == w and (k := k + 1) == n: return x['t0']
    raise KeyError((i, w))
PS = [('p01', 'l01'), ('p02', 'l02'), ('p03', 'l03'), ('p04', 'l04'), ('p05', 'l05'), ('p06', 'l06'), ('p07', 'l07'), ('p09', 'l09'), ('p10', 'l10'),
      ('p11', 'l11'), ('p12', 'l12'), ('p13', 'l13'), ('p15', 'l15'), ('p16', 'l16'), ('p17', 'l17'), ('p18', 'l18'), ('p19', 'l19'), ('p21', 'l21'),
      ('p22', 'l22'), ('p23', 'l23'), ('p24', 'l24'), ('p26', 'l26'), ('p27', 'l27'), ('p28', 'l28'), ('p29', 'l29'), ('p30', 'l30')]
TB = {p: (0 if l == 'l01' else LT(l) - 0.25) for p, l in PS}
IDS = [p for p, _ in PS]
def NX(p): i = IDS.index(p); return TB[IDS[i + 1]] if i + 1 < len(IDS) else END

C = []
def cue(t, f, lib=CY, **k): C.append(dict(t=round(t, 3), file=lib + f, name=f, **k))
def ev(t, f, lib=P2, **k): cue(t, f, lib, onset=True, **k)                       # a new event, aligned on its transient
def bed(t0, t1, f, g, lib=P1, ss=0, **k): cue(t0, f, lib, ss=ss, dur=round(t1 - t0, 3), norm='int', gain=g, **k)
def span(p, pre=0.3, post=0.3): return TB[p] - pre, NX(p) + post

STEP = [(15.279, 15.62), (5.819, 6.145), (17.09, 17.645), (6.476, 6.75), (11.531, 11.9), (2.094, 2.45)]
def msteps(t0, t1, rate, g, pan=0, semi=0, lp=None):
    t = t0; i = 0
    while t < t1:
        a, b = STEP[i % len(STEP)]; cue(t - 0.005, 'men_steps/fs503671.mp3', ss=a, to=b, gain=g - (2 if i % 3 == 1 else 0), pan=pan, semi=semi, lp=lp, fo=0.05)
        t += 1 / rate; i += 1
def gstep(t, g, pan=0.4, lp=None):
    cue(t - 0.03, 'thud/fs504626.mp3', ss=0.37, to=1.415, semi=-4, gain=g, pan=pan, lp=lp or 2500)
    cue(t - 0.02, 'giant_steps/fs349081.mp3', ss=3.233, to=3.945, semi=-7, gain=g - 3, pan=pan, lp=lp or 900, fo=0.25)
def boom(t, g, pan=0, tail=2.5):
    gstep(t, g, pan); cue(t, 'rumble/fs222521.mp3', ss=1.99, to=1.99 + tail, lp=220, gain=g - 6, pan=pan, fo=1.0, fi=0.02)
def shout(t, k, g, pan, lp=1400):
    f, a, b = [('shout/fs480805.mp3', 9.631, 10.668), ('shout/fs316640.mp3', 5.031, 6.3), ('shout/fs316640.mp3', 6.3, 7.043)][k % 3]
    cue(t, f, ss=a, to=b, gain=g, pan=pan, lp=lp, fo=0.2, fi=0.05)
def creak(t, g, pan=0, semi=-3): ev(t, 'wood_creak/fs506664.mp3', P1, gain=g, pan=pan, semi=semi, fo=0.2)
def knock(t, g, pan=0, semi=2): cue(t, 'wood/fs521399.mp3', ss=0.051, to=0.4, gain=g, semi=semi, pan=pan, fo=0.08)
def whoosh(t, g, pan=0, semi=0): ev(t, 'throw_whoosh/fs475134.mp3', CY, gain=g, pan=pan, semi=semi, fo=0.1)
def gust(t, g, pan=0, dur=2.5, ss=0.5, k=0):
    f, lib, n = [('wind_gust/fs731722.mp3', P2, 7.6), ('wind_howl/fs623604.mp3', P1, 39.0)][k % 2]
    cue(t, f, lib, ss=ss, to=min(n, ss + dur), gain=g, pan=pan, fi=0.15, fo=0.8)
def roar(t, f, a, b, semi, g, pan=0, fo=0.4): cue(t, f, ss=a, to=b, semi=semi, gain=g, pan=pan, fo=fo)
def bigsplash(t, g, pan=0): ev(t, 'rock_water/fs583348.mp3', gain=g, pan=pan, fo=0.6); cue(t + 0.02, 'splash/fs442773.mp3', ss=0.0, to=2.1, gain=g - 5, pan=-pan * 0.5, fo=0.6, semi=-3)
def crack(t, g, pan=0, k=0): ev(t, ['ship_break/fs257752.mp3', 'ship_break/fs403646.mp3'][k % 2], gain=g, pan=pan, fo=0.5)
def scream(t, k, g, pan=0): f, lib, a, b = [('scream_crowd/fs675052.mp3', P1, 1.0, 3.0), ('shout/fs480805.mp3', CY, 9.631, 10.668), ('scream_crowd/fs675052.mp3', P1, 5.0, 7.0)][k % 3]; cue(t, f, lib, ss=a, to=b, gain=g, pan=pan, lp=4500, fi=0.03, fo=0.4)

# ---- beds ----
t0, t1 = span('p01'); bed(0, t1, 'sea/fs648859.mp3', -15, CY, ss=5, fi=0.3, fo=0.8); bed(0, t1, 'birds/fs731819.mp3', -19, ss=40, fi=0.3, fo=0.8)   # P01 a calm morning sea
t0, t1 = span('p02'); bed(t0, t1, 'sea/fs648859.mp3', -16, CY, ss=20, fi=0.5, fo=0.8)                                                               # P02 the floating island
bed(VW('l02', 'winds') - 0.8, t1, 'wind_howl/fs623604.mp3', -18, ss=5, lp=1800, fi=0.8, fo=0.8)
t0, t1 = span('p03'); t1 = NX('p04') + 0.3; bed(t0, t1, 'fire_crackle/fs350757.mp3', -24, CY, ss=5, fi=0.6, fo=0.8)                               # P03-P04 the palace: hearth
bed(t0, t1, 'wind_howl/fs735347.mp3', -30, ss=10, lp=900, fi=0.6, fo=0.8)                                                                           #   the winds kept in the walls
t0, t1 = span('p05'); bed(t0, t1, 'wind_howl/fs623604.mp3', -14, ss=20, lp=500, fi=0.4, fo=0.6)                                                    # P05 winds trapped in the bag (muffled)
t0, t1 = span('p06'); bed(t0, NX('p07') + 0.3, 'sea/fs550915.mp3', -14, CY, ss=30, fi=0.4, fo=0.8)                                                 # P06-P07 sailing home
bed(t0, NX('p07') + 0.3, 'sail_flap/fs57280.mp3', -22, P2, ss=12, fi=0.6, fo=0.8, pan=0.2)
t0, t1 = span('p09'); bed(t0, NX('p10') + 0.3, 'calm_shore/fs521602.mp3', -15, ss=10, fi=0.6, fo=0.8)                                              # P09-P10 Ithaca
bed(t0, NX('p10') + 0.3, 'birds/fs731819.mp3', -17, ss=90, fi=0.6, fo=0.8)
t0, t1 = span('p11'); t1 = NX('p15') + 0.3; bed(t0, t1, 'harbour_calm/fs637206.mp3', -17, P2, ss=3, fi=0.6, fo=0.4)                              # P11-P15 on deck, Ithaca in sight
bed(t0, t1, 'sea/fs648859.mp3', -22, CY, ss=60, fi=0.6, fo=0.4)
t0, t1 = span('p16'); bed(t0, NX('p17') + 0.4, 'storm/fs700454.mp3', -7, ss=30, fi=0.15, fo=1.0)                                                  # P16-P17 every wind at once
bed(t0, NX('p17') + 0.4, 'wind_howl/fs623604.mp3', -10, ss=8, fi=0.15, fo=1.0)
bed(t0 + 0.2, NX('p16'), 'sail_flap/fs57280.mp3', -12, P2, ss=5, fi=0.1, fo=0.4)
bed(TB['p17'] - 0.2, NX('p17') + 0.4, 'sea/fs550915.mp3', -8, CY, ss=53, fi=0.3, fo=1.0)
t0, t1 = span('p18'); t1 = NX('p19') + 0.3; bed(t0, t1, 'fire_crackle/fs350757.mp3', -24, CY, ss=20, fi=0.6, fo=0.8)                              # P18-P19 back in the palace
bed(t0, t1, 'wind_howl/fs735347.mp3', -28, ss=30, lp=900, fi=0.6, fo=0.8)
t0, t1 = span('p21'); bed(t0, t1, 'sea/fs648859.mp3', -16, CY, ss=70, fi=0.5, fo=0.8); bed(t0, t1, 'ghost_wind/fs440962.mp3', -22, ss=10, fi=1.0, fo=0.8)  # P21 further away
t0, t1 = span('p22'); bed(t0, NX('p24') + 0.3, 'oars/fs588307.mp3', -15, CY, ss=2, fi=0.5, fo=1.0, pan=-0.1)                                      # P22-P24 rowing, the harbour
bed(t0, NX('p22') + 0.3, 'sea/fs550915.mp3', -20, CY, ss=10, fi=0.5, fo=0.6)
bed(TB['p23'] - 0.3, NX('p26') + 0.3, 'harbour_calm/fs851577.mp3', -17, P2, ss=20, fi=0.8, fo=0.6)
bed(TB['p23'] - 0.3, NX('p24') + 0.3, 'birds/fs731819.mp3', -20, ss=120, fi=0.8, fo=0.8)
t0, t1 = span('p26'); bed(t0, NX('p26') + 0.3, 'rumble/fs222521.mp3', -18, CY, ss=1.99, lp=200, fi=0.6, fo=0.6)                                     # P26 the giants
t0, t1 = span('p27'); bed(t0, NX('p28') + 0.4, 'scream_crowd/fs675052.mp3', -18, lp=3000, fi=0.6, fo=1.0)                                           # P27-P28 the massacre
bed(t0, NX('p29') + 0.3, 'sea/fs550915.mp3', -14, CY, ss=40, fi=0.4, fo=0.8)
t0, t1 = span('p29'); bed(TB['p29'] + 1.5, NX('p29') + 0.3, 'oars/fs438846.mp3', -12, CY, ss=2, fi=0.4, fo=0.6)                                    # P29 row!
t0, t1 = span('p30'); bed(t0, END, 'sea/fs648859.mp3', -15, CY, ss=40, fi=0.5, fo=3.0); bed(t0, END, 'oars/fs588307.mp3', -19, CY, ss=20, fi=0.6, fo=3.0)  # P30 alone
bed(t0, END, 'ghost_wind/fs440962.mp3', -24, ss=30, fi=1.0, fo=3.0)

# ---- the frieze sliding panel to panel ----
for i, p in enumerate(IDS[1:]):
    f = ['slide_whoosh/fs843664.mp3', 'slide_whoosh/fs843665.mp3'][i % 2]; a, b = [(0.197, 0.655), (0.068, 0.416)][i % 2]
    cue(TB[p] + 0.1, f, ss=a, to=b, pre=0.25, gain=-15, pan=0.3, hp=150, fi=0.03, fo=0.12)

# ---- events ----
boom(VW('l02', 'aeolus') - 0.2, -5, 0, tail=3.5)                                                                     # P02 IV · AEOLUS
gust(VW('l02', 'winds') - 0.3, -14, -0.3, 3.0)
cue(VW('l03', 'troy') - 0.2, 'battle/fs675094.mp3', P1, ss=3, to=6.0, gain=-22, lp=1800, fi=0.3, fo=1.0, pan=0.2)    # P03 the stories of Troy
msteps(VW('l04', 'leave') - 0.4, VW('l04', 'bag') - 0.3, 2.2, -18, -0.2)                                              # P04 Aeolus walks over
ev(VW('l04', 'bag') - 0.1, 'leather_bag/fs501012.mp3', gain=-13, pan=-0.1, fo=0.3)                                   #     the leather bag
ev(VW('l04', 'cord') - 0.2, 'coins/fs646673.mp3', P1, gain=-20, pan=0.0, fo=0.4, semi=5)                             #     the silver cord glints
for i, t in enumerate([TB['p05'] + 0.5, VW('l05', 'trapped') - 0.3, VW('l05', 'course') - 0.2]):                     # P05 the bag strains
    ev(t, ['leather_bag/fs501012.mp3', 'leather_bag/fs501015.mp3', 'cord_creak/fs501013.mp3'][i], gain=-12 - i, pan=0.1 * (i - 1))
gust(VW('l06', 'west') - 0.3, -10, -0.5, 3.2, ss=3.5)                                                                # P06 the west wind
for i in range(9): knock(VW('l07', 'nine') - 0.2 + i * 0.12, -17 - (i % 2))                                          # P07 nine strokes
for i, t in enumerate([LT('l08') + 0.3, LT('l08') + 2.6, LT('l08') + 4.6]): creak(t, -14 - i, -0.4, -5)               #     the steering oar creaks
for i, t in enumerate([VW('l09', 'ithaca') - 0.3]): shout(t + 0.5, 1, -18, 0.3, lp=2500)                            # P09 Ithaca! (a man calls out)
ev(VW('l10', 'people') - 0.3, 'sheep/fs692898.mp3', CY, gain=-22, pan=0.4, lp=3000, fo=0.3)                         # P10 life on the shore
creak(VW('l11', 'closed') - 0.2, -16, -0.4, -6)                                                                       # P11 he sleeps; the oar swings loose
cue(LT('l12') - 0.1, 'whisper/fs763864.mp3', ss=2.0, to=5.0, gain=-13, pan=0.0, fi=0.2, fo=0.5, lp=3500)             # P12 whispering
cue(LT('l13') - 0.1, 'whisper/fs810476.mp3', ss=1.0, to=4.0, gain=-15, pan=0.2, fi=0.2, fo=0.5, lp=3500)              # P13
ev(VW('l13', 'gold') - 0.2, 'coins/fs213979.mp3', P1, gain=-14, pan=-0.2); ev(VW('l13', 'silver') - 0.2, 'coins/fs758585.mp3', P1, gain=-17, pan=0.2, to=1.6, fo=0.4)
ev(VW('l15', 'untied') - 0.3, 'rope_strain/fs676988.mp3', P1, gain=-11, pan=-0.1)                                     # P15 the cord pulled loose
ev(VW('l15', 'cord') - 0.2, 'cord_creak/fs501012.mp3', gain=-12, pan=0.1)
cue(VW('l15', 'cord'), 'wind_howl/fs623604.mp3', P1, ss=2, to=4.0, lp=1200, gain=-16, fi=0.6, fo=0.3)                 #     the winds start to leak
HIT = VW('l16', 'wind') - 0.3                                                                                          # P16 every wind at once
cue(HIT - 0.4, 'wind_burst/fs347549.mp3', P2, ss=0.0, to=1.9, gain=-6, fi=0.02, fo=0.4)
gust(HIT, -2, 0.0, 4.5, ss=0.8); gust(HIT + 0.15, -6, -0.6, 4.0, ss=2.0, k=1); gust(HIT + 0.3, -6, 0.6, 4.0, ss=3.0)
boom(VW('l16', 'once') - 0.2, -2, 0, tail=4.0)
ev(VW('l16', 'once') - 0.1, 'thunder/fs534023.mp3', P1, gain=-6, to=5.0, fo=1.5)
scream(HIT + 0.4, 0, -14, -0.3); scream(HIT + 0.7, 1, -16, 0.4)
for i, t in enumerate([HIT + 0.5, HIT + 0.65]): cue(t, 'thud/fs346692.mp3', ss=0.482, to=1.3, gain=-11 - 2 * i, pan=0.5 * (1 - 2 * i))
shout(VW('l16', 'once') + 0.4, 0, -12, -0.4)                                                                          #     Odysseus wakes shouting
ev(TB['p17'] + 0.5, 'thunder/fs760212.mp3', P1, gain=-6, to=5.0, fo=1.5, pan=0.2)                                     # P17 the storm throws them back
ev(VW('l17', 'back'), 'thunder/fs760213.mp3', P1, gain=-9, to=4.0, fo=1.2, pan=-0.3)
for i, t in enumerate([TB['p17'] + 1.5, TB['p17'] + 3.0, TB['p17'] + 4.6]): creak(t, -12 - i, 0.3 - 0.3 * i, -6)
msteps(TB['p18'] + 0.2, VW('l18', 'begged') - 0.3, 2.4, -17, -0.3)                                                   # P18 he walks in and kneels
cue(VW('l18', 'begged') - 0.1, 'thud/fs346692.mp3', ss=0.482, to=1.2, gain=-16, pan=-0.1)
cue(VW('l19', 'out') - 0.5, 'rumble/fs222521.mp3', ss=1.99, to=5.0, lp=260, gain=-12, fi=0.1, fo=1.0)               # P19 get out
msteps(VW('l19', 'out') + 0.6, VW('l19', 'out') + 3.6, 2.2, -19, -0.4)
ev(VW('l20', 'hate') - 0.3, 'thunder/fs534023.mp3', P1, gain=-15, to=4.0, lp=1500, fo=1.5)
boom(LT('l22') - 0.1, -5, 0, tail=3.5)                                                                               # P22 V · THE LAESTRYGONIANS
for i in range(6): knock(VW('l23', 'six') - 0.2 + i * 0.12, -17 - (i % 2))                                           # P23 six strokes
for i in range(4): creak(VW('l24', 'eleven') + i * 0.7, -17 - i % 2, 0.3, -4)                                         # P24 eleven ships glide in
ev(VW('l25', 'tied') - 0.2, 'rope_strain/fs676988.mp3', P1, gain=-12, pan=-0.4)
cue(VW('l25', 'rock'), 'wood/fs452554.mp3', ss=0.043, to=0.6, gain=-14, pan=-0.4)
roar(VW('l26', 'laestrygonians') - 0.3, 'roar/fs444445.mp3', 0.0, 2.4, -4, -8, 0.3)                                # P26 the giants rise
roar(VW('l26', 'giants') - 0.2, 'roar/fs489901.mp3', 0.267, 1.879, -5, -12, -0.4)
gstep(VW('l26', 'giants') + 0.4, -11, -0.3); gstep(VW('l26', 'giants') + 1.0, -12, 0.4)
tT = VW('l27', 'threw') - 0.4                                                                                          # P27 boulders, ships like eggshells
roar(TB['p27'] + 0.3, 'roar/fs132874.mp3', 0.27, 1.29, -3, -14, 0.3)
for i in range(11):
    th = tT + 0.5 + i * 0.32; pan = -0.3 if i % 2 == 0 else 0.3
    if i % 2 == 0 or i < 4: whoosh(th, -14, pan * 1.5, semi=-4)
    if i in (0, 2, 4, 6, 8, 10): bigsplash(th + 0.9, -6 - (i % 4), pan * 0.5)
    if i in (1, 4, 7, 10): crack(th + 0.92, -6 - i % 3, -pan * 0.4, i)
for i, t in enumerate([tT + 1.6, tT + 2.4, tT + 3.3]): scream(t, i, -15 - i, 0.3 - 0.3 * i)
boom(VW('l27', 'eggshells') - 0.3, -4, 0, tail=3.0)
tSp = VW('l28', 'speared') - 0.3                                                                                     # P28 speared like fish
for i, d in enumerate([0, 1.0, 2.0]):
    t = tSp + d + 0.2; ev(t, ['stab/fs395372.mp3', 'stab/fs539163.mp3', 'stab/fs564230.mp3'][i], CY, gain=-10, pan=0.2); scream(t - 0.3, i, -17, -0.2)
    cue(t + 0.35, 'splash/fs436792.mp3', ss=0.0, to=1.7, gain=-14, pan=-0.2, fo=0.5)
for i in range(3): gstep(VW('l28', 'home') + 0.3 + i * 0.55, -14 - i, 0.5)
tC = VW('l29', 'cut') - 0.3                                                                                          # P29 the rope cut, row!
ev(tC + 0.15, 'sword/fs471147.mp3', CY, gain=-8, pan=-0.2)
ev(tC + 0.3, 'rope_untie/fs841835.mp3', gain=-11, pan=-0.3)
shout(VW('l29', 'screamed') - 0.1, 0, -7, -0.2, lp=3000)
for i in range(4): bigsplash(TB['p29'] + 0.4 + i * 0.9 + 0.2, -16 - i, 0.3)
for i in range(11): knock(TB['p30'] + 1.0 + i * 0.12, -18 - (i % 2), semi=-2)                                        # P30 eleven struck out
boom(VW('l31', 'left') - 0.3, -8, 0, tail=3.0)

# the climaxes are trimmed so that, with the stem raised +8 dB in the premix, the SFX sit ~10-12 dB under the voice and the
# burst / storm / boulders stay ~5-6 dB under it
TRIM = [('p16', 8), ('p17', 8), ('p27', 5), ('p28', 2), ('p15', 1)]
for c in C:
    for p, d in TRIM:
        if TB[p] - 0.45 <= c['t'] < NX(p) - 0.45: c['gain'] = c.get('gain', 0) - d
for c in C:
    for k in [k for k, v in c.items() if v is None]: del c[k]
json.dump(sorted(C, key=lambda c: c['t']), open(os.path.join(HERE, 'cues.json'), 'w'), indent=0)
print(len(C), 'cues')
