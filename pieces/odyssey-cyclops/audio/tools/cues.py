# The Cyclops: "sonido pro" cue list. Times resolved from src/score.js (SUB/SUBEND panel times, VW word times, LT/LE
# line times; see audio/SFX_CUES.md). Writes audio/tools/cues.json for sfxmix.py.
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
L = os.path.join(os.path.dirname(HERE), 'sfxlib', 'raw') + '/'

TB = [0, 16.161, 26.965, 32.557, 41.001, 48.162, 55.04, 62.838, 65.713, 76.582, 82.85, 89.836, 94.66, 107.007, 114.652,
      125.782, 141.717, 155.682, 159.584, 175.096, 194.553, 202.765, 216.864, 219.948, 227.902, 239.096, 247.354, 260.256]
HIT = 165.36
C = []
def cue(t, f, **k): C.append(dict(t=round(t, 3), file=L + f, name=f, **k))

# the sounds
SHEEP = [('sheep/fs362283.mp3', 0.102, 1.85), ('sheep/fs362283.mp3', 9.145, 10.714), ('sheep/fs362283.mp3', 11.805, 12.74),
         ('sheep/fs692898.mp3', 0.149, 1.79), ('sheep/fs692898.mp3', 2.459, 3.597), ('sheep/fs677221.mp3', 0.033, 1.205)]
STEP = [(15.279, 15.62), (5.819, 6.145), (17.09, 17.645), (6.476, 6.75), (11.531, 11.9), (2.094, 2.45)]   # rocks (fs503671)
def bleat(t, i, g, pan=0.3, lp=None, semi=0):
    f, a, b = SHEEP[i % len(SHEEP)]; cue(t, f, ss=a, to=b, gain=g, pan=pan, lp=lp, semi=semi, fo=0.15)
def mstep(t, i, g, pan=0, semi=0, lp=None):
    a, b = STEP[i % len(STEP)]; cue(t - 0.005, 'men_steps/fs503671.mp3', ss=a, to=b, gain=g, pan=pan, semi=semi, lp=lp, fo=0.05)
def gstep(t, g, pan=0.4, lp=None):          # a giant's footfall: a heavy body-fall on dirt, lowered, over a deep boom
    cue(t - 0.03, 'thud/fs504626.mp3', ss=0.37, to=1.415, semi=-4, gain=g, pan=pan, lp=lp or 2500)
    cue(t - 0.02, 'giant_steps/fs349081.mp3', ss=3.233, to=3.945, semi=-7, gain=g - 3, pan=pan, lp=lp or 900, fo=0.25)
def gsteps(t0, t1, rate, g, pan=0.4, lp=None):
    t = t0; i = 0
    while t < t1: gstep(t, g - (1.5 if i % 2 else 0), pan + (0.06 if i % 2 else -0.06), lp); t += 1 / rate; i += 1
def msteps(t0, t1, rate, g, pan=0, semi=0, lp=None):
    t = t0; i = 0
    while t < t1: mstep(t, i, g - (2 if i % 3 == 1 else 0), pan, semi, lp); t += 1 / rate; i += 1
def grind(t, g, pan=0.5): cue(t, 'stone_door/fs457529.mp3', ss=4.9, to=6.443, semi=-3, gain=g, pan=pan, fi=0.08, fo=0.3)
def boom(t, g, pan=0): gstep(t, g, pan); cue(t, 'rumble/fs222521.mp3', ss=1.99, to=4.5, lp=220, gain=g - 6, pan=pan, fo=1.0, fi=0.02)
def roar(t, f, a, b, semi, g, pan=0, fo=0.4): cue(t, f, ss=a, to=b, semi=semi, gain=g, pan=pan, fo=fo)
def fireup(t, g): cue(t, 'fire_ignite/fs534702.mp3', ss=0.019, to=1.74, gain=g, fo=0.4)
def sizzle(t, d, g, pan=0): cue(t, 'sizzle/fs365071.mp3', ss=0.65, to=0.65 + d, gain=g, pan=pan, fi=0.02, fo=0.5)
def bones(t, g, k=0, pan=0.2):
    f = [('bone/fs422723.mp3', 1.519, 2.795), ('bone/fs192146.mp3', 0.069, 0.665), ('bone/fs392883.mp3', 0.25, 0.637)][k]
    cue(t, f[0], ss=f[1], to=f[2], gain=g, pan=pan, lp=6000)
def shout(t, k, g, pan, lp=1400):
    f, a, b = [('shout/fs480805.mp3', 9.631, 10.668), ('shout/fs316640.mp3', 5.031, 6.3), ('shout/fs316640.mp3', 6.3, 7.043)][k % 3]
    cue(t, f, ss=a, to=b, gain=g, pan=pan, lp=lp, fo=0.2, fi=0.05)

# ---- beds (norm by integrated loudness) ----
cue(0, 'sea/fs648859.mp3', ss=5, dur=34, norm='int', gain=-10, fi=1.5, fo=4.0)                       # p01-p03 the sea
cue(0.3, 'oars/fs588307.mp3', ss=2, dur=27.0, norm='int', gain=-17, fi=1.0, fo=1.5, pan=-0.2)          # p01-p02 oars
cue(63.4, 'fire_crackle/fs350757.mp3', dur=175.6 - 63.4, norm='int', gain=-6, ceil=0.4, rel=0.015, fi=0.6, fo=1.0)        # p08-p19 fire
cue(194.55, 'fire_crackle/fs350757.mp3', ss=8, dur=216.9 - 194.55, norm='int', gain=-8, ceil=0.35, rel=0.015, fi=1.0, fo=1.5)  # p21 fire
cue(160.0, 'fire_crackle/fs181563.mp3', ss=2, dur=3.6, norm='int', gain=-14, fi=0.3, fo=0.8)           # p19 coals roar up
cue(93.9, 'snore/fs432996.mp3', dur=107.2 - 93.9, norm='int', gain=-12, fi=0.5, fo=1.0, pan=0.2)       # p12-p13 snoring
cue(158.4, 'snore/fs432996.mp3', ss=10.0, dur=HIT - 1.2 - 158.4, norm='int', gain=-11, fi=0.4, fo=0.8, pan=0.2)  # p18-p19
cue(216.6, 'sea/fs648859.mp3', ss=40, dur=278.307 - 216.6, norm='int', gain=-10, fi=1.0, fo=3.0)       # p22-p24c the sea
cue(219.95, 'oars/fs588307.mp3', ss=10, dur=260.3 - 219.95, norm='int', gain=-17, fi=1.0, fo=2.0, pan=-0.2)  # p23-p24b oars
cue(264.4, 'rumble/fs222521.mp3', dur=277.0 - 264.4, lp=260, norm='int', gain=-10, fi=3.0, fo=2.5)    # p24c Poseidon rumble

# ---- the frieze sliding panel to panel ----
for i, t in enumerate(TB[1:]):
    f = ['slide_whoosh/fs843664.mp3', 'slide_whoosh/fs843665.mp3'][i % 2]
    a, b = [(0.197, 0.655), (0.068, 0.416)][i % 2]
    cue(t + 0.1, f, ss=a, to=b, pre=0.25, gain=-15, pan=0.3, hp=150, fi=0.03, fo=0.12)

# ---- events ----
for i, t in enumerate([2.8, 6.3, 10.1, 13.9]): bleat(t, i, -20, 0.6, lp=2500)                      # p01 goats far off
msteps(27.27, 32.5, 2.8, -17)                                                                         # p03 the climb
for i, t in enumerate([33.3, 34.9, 36.4, 38.1, 39.6]): bleat(t, i + 1, -12, 0.3)                    # p04 lambs in pens
cue(41.45, 'whisper/fs763864.mp3', ss=7.6, to=10.42, gain=-7, pan=-0.3, fi=0.2, fo=0.4)              # p05 whispering
msteps(48.36, 52.76, 6.0, -21, 0.4, semi=5)                                                           # p06 flock trot (light)
for i, t in enumerate([48.66, 50.0, 51.5, 52.9]): bleat(t, i + 2, -10, 0.4)
gsteps(48.9, 52.5, 1.4, -1, 0.4)                                                                      # the giant comes home
roar(56.92, 'roar/fs132874.mp3', 0.27, 1.29, -5, -7, 0.4)                                            # p07 grunt on lift
grind(60.3, -3); boom(61.9, 1, 0.3)                                                                   # stone in the doorway
fireup(63.3, -5)                                                                                      # p08 fire lit
roar(64.6, 'roar/fs489901.mp3', 0.267, 1.879, -6, -5, 0.3)                                          # he saw them (growl)
msteps(66.24, 68.0, 3, -14, -0.3)                                                                     # p09 a step forward
roar(77.3, 'laugh/fs134720.mp3', 0.118, 2.015, -5, -2, 0.35, fo=0.3)                                  # p10 the laugh
roar(81.7, 'laugh/fs119459.mp3', 2.252, 3.957, -5, -8, 0.35, fo=0.3)
cue(83.36, 'throw_whoosh/fs475131.mp3', ss=0.011, to=0.44, pre=0.2, gain=-7, pan=0.1)               # p11 the grab
bones(84.85, 2, 1); cue(85.82, 'thud/fs346692.mp3', ss=0.482, to=1.4, gain=-5, pan=0.1); bones(87.42, -5, 1)
for i in range(3): cue(91.1 + i * 0.3, 'gulp/fs445970.mp3', ss=0.085, to=0.545, semi=-5, gain=-11, pan=0.3)  # p12 milk
cue(91.96, 'thud/fs504626.mp3', ss=0.37, to=1.415, semi=-3, gain=-6, pan=0.2)                        # lies down
cue(95.47, 'sword/fs107589.mp3', ss=0.011, to=0.92, gain=-6, pan=-0.3)                              # p13 sword drawn
bones(109.54, -13, 2)                                                                                 # p14 breakfast
msteps(109.9, 114.2, 6.0, -21, 0.5, semi=5)
for i, t in enumerate([110.3, 111.9, 113.6]): bleat(t, i, -11, 0.5)
gsteps(111.1, 115.7, 1.4, -2, 0.5); grind(111.6, -4, 0.6); boom(113.2, -1, 0.5)
cue(119.82, 'wood/fs452554.mp3', ss=0.043, to=0.6, gain=-8, pan=-0.1)                               # p15 wood cut
for i in range(6): cue(121.02 + i * 0.31, 'wood/fs521399.mp3', ss=0.051, to=0.4, gain=-10 - (i % 2) * 2, semi=3, fo=0.08)
cue(122.12, 'fire_ignite/fs186374.mp3', ss=1.274, to=2.6, gain=-13); sizzle(122.22, 1.7, -9, 0.1)  # hardened in fire
cue(123.86, 'thud/fs346695.mp3', ss=0.622, to=1.3, gain=-13)                                        # hidden
gsteps(126.08, 129.2, 1.4, -2, 0.4); bones(127.88, -13, 2, 0.3)                                      # p16 home, eats
for i in range(4): cue(137.64 + i * 0.27, 'gulp/fs445970.mp3', ss=0.085, to=0.545, semi=-5, gain=-8 - i, pan=0.3)  # drinks
roar(154.32, 'laugh/fs119459.mp3', 3.957, 5.355, -6, -11, 0.3)                                       # p17 the grin
cue(156.49, 'thud/fs504626.mp3', ss=0.37, to=1.415, semi=-5, gain=1, pan=0.2); boom(156.52, -2, 0.2)  # p18 falls
fireup(160.1, -8); sizzle(161.66, 1.4, -13)                                                           # p19 the stake
for i, t in enumerate([164.91, 165.04, 165.17, 165.29]): mstep(t, i, -12, -0.2)
cue(HIT, 'throw_whoosh/fs475135.mp3', ss=0.137, to=0.6, pre=0.3, gain=-4, pan=-0.1)                 # the drive
cue(HIT, 'stab/fs395373.mp3', ss=0.18, to=1.745, gain=3, pan=0)                                      # THE STRIKE
cue(HIT, 'stab/fs385966.mp3', ss=0.176, to=0.8, gain=0, pan=0.1)
boom(HIT + 0.01, 0, 0); sizzle(HIT + 0.02, 2.6, -1, 0.1)
roar(HIT + 0.08, 'roar/fs607201.mp3', 0.046, 2.76, -4, 4, 0.1, fo=0.8)                              # the scream of pain
roar(HIT + 0.3, 'roar/fs489901.mp3', 0.267, 2.725, -6, 1, 0.3, fo=0.8)
cue(167.84, 'sizzle/fs365071.mp3', ss=0.65, to=2.65, gain=-7, pan=0.1, fo=0.4)                         # the twist
roar(172.08, 'roar/fs429083.mp3', 0.191, 2.73, -4, 4, 0.0, fo=0.8)                                   # he screamed
roar(172.28, 'roar/fs607201.mp3', 0.046, 2.76, -6, 1, 0.3, fo=0.8)
cue(172.38, 'rumble/fs222521.mp3', ss=1.99, to=7.0, lp=300, gain=-4, fi=0.1, fo=2.0)                 # the mountain rang
gsteps(175.4, 178.7, 1.5, -10, -0.5, lp=900); gsteps(175.7, 179.0, 1.5, -10, 0.5, lp=900)           # p20 neighbours
for k, (t, p) in enumerate([(178.53, -0.5), (179.79, 0.5), (180.95, -0.5)]): shout(t, k, -8, p)
roar(184.44, 'roar/fs489901.mp3', 0.267, 2.725, -4, 1, 0.0, fo=0.8)                                  # roars back
for k, t in enumerate([186.1, 186.9, 187.6]): shout(t, k + 1, -16, 0.5 if k % 2 else -0.5, lp=1000)
gsteps(193.28, 196.9, 1.5, -13, -0.6, lp=800); gsteps(193.6, 197.1, 1.5, -13, 0.6, lp=800)          # they go home
grind(196.06, -5, -0.3)                                                                               # p21 stone aside
for i in range(10): bleat(195.55 + i * 2.1, i, -13, 0.3)
for i in range(4): cue(199.88 + i * 0.8, 'slide_whoosh/fs843664.mp3', ss=0.197, to=0.655, gain=-16, pan=-0.2)  # hands on wool
cue(214.52, 'slide_whoosh/fs843665.mp3', ss=0.068, to=0.416, gain=-13, pan=-0.1)
msteps(216.96, 218.4, 6, -13, -0.3)                                                                   # p22 the run
cue(218.06, 'oars/fs438846.mp3', ss=2.5, to=4.5, norm='int', gain=-11, fi=0.3, fo=0.6, pan=-0.2)     # oars pulling hard
cue(239.74, 'rock_crack/fs157804.mp3', ss=0.0, to=5.9, semi=-3, gain=-1, pan=-0.5, fo=1.0)          # p24 hill torn off
cue(239.8, 'rumble/fs222521.mp3', ss=1.99, to=5.5, lp=400, gain=-5, pan=-0.5, fo=1.2)
roar(240.04, 'roar/fs132874.mp3', 0.27, 1.29, -6, -6, -0.5)
roar(241.38, 'roar/fs607201.mp3', 0.046, 2.0, -6, -3, -0.5)                                         # the throw
cue(242.63, 'throw_whoosh/fs475134.mp3', ss=0.011, to=0.9, semi=-4, pre=1.0, gain=-2, pan=0.2)     # boulder flies
cue(242.63, 'splash/fs442773.mp3', ss=0.0, to=2.2, gain=4, pan=0.3)                                  # SPLASH
cue(242.66, 'splash/fs583348.mp3', ss=0.0, to=3.3, semi=-3, gain=0, pan=0.3)
boom(242.63, -1, 0.3)
cue(243.4, 'sea/fs550915.mp3', ss=53, to=58, norm='int', gain=-8, fi=0.6, fo=2.0)                    # the wave rocks the ship
boom(273.26, 5, 0)                                                                                    # p24c "heard"
cue(273.25, 'thud/fs346692.mp3', ss=0.482, to=1.4, semi=-4, gain=8)
cue(273.26, 'stab/fs385966.mp3', ss=0.176, to=0.8, semi=-5, gain=3)                       # punch on "heard"
cue(273.3, 'rumble/fs222521.mp3', ss=1.99, to=8.0, lp=250, gain=-2, fo=2.5)

for c in C:
    for k in [k for k, v in c.items() if v is None]: del c[k]
json.dump(sorted(C, key=lambda c: c['t']), open(os.path.join(HERE, 'cues.json'), 'w'), indent=0)
print(len(C), 'cues')
