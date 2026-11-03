# Odyssey p1 (cold open, the Horse, Ismarus, the Lotus-Eaters): "sonido pro" cue list. Times from voice.json (panel
# starts TB = first line - 0.25 s, word times). Real CC0 recordings: the cyclops library (CY) plus audio/sfxlib (P1).
# Writes audio/tools/cues.json for sfxmix.py.
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
P1 = os.path.join(os.path.dirname(HERE), 'sfxlib', 'raw') + '/'
CY = os.path.abspath(os.path.join(HERE, '../../../odyssey-cyclops/audio/sfxlib/raw')) + '/'

TB = [0, 2.54, 8.78, 16.7, 20.57, 29.47, 37.67, 44.57, 48.31, 54.6, 58.31, 63.14, 68.54, 75.78, 82.94, 92.38, 99.75,
      106.76, 112.31, 114.9, 124.19, 126.4, 137.18, 143.44, 149.89, 163.03, 168.33, 175.91, 182.25, 194.07, 212.24]
END = 225.467
HIT = 113.72          # "ash"
C = []
def cue(t, f, lib=CY, **k): C.append(dict(t=round(t, 3), file=lib + f, name=f, **k))
def ev(t, f, **k): cue(t, f, P1, onset=True, **k)                                    # a new event, aligned on its transient
def bed(t0, t1, f, g, lib=P1, ss=0, **k): cue(t0, f, lib, ss=ss, dur=round(t1 - t0, 3), norm='int', gain=g, **k)

STEP = [(15.279, 15.62), (5.819, 6.145), (17.09, 17.645), (6.476, 6.75), (11.531, 11.9), (2.094, 2.45)]
def mstep(t, i, g, pan=0, semi=0, lp=None):
    a, b = STEP[i % len(STEP)]; cue(t - 0.005, 'men_steps/fs503671.mp3', ss=a, to=b, gain=g, pan=pan, semi=semi, lp=lp, fo=0.05)
def msteps(t0, t1, rate, g, pan=0, semi=0, lp=None):
    t = t0; i = 0
    while t < t1: mstep(t, i, g - (2 if i % 3 == 1 else 0), pan, semi, lp); t += 1 / rate; i += 1
def gstep(t, g, pan=0.4, lp=None):
    cue(t - 0.03, 'thud/fs504626.mp3', ss=0.37, to=1.415, semi=-4, gain=g, pan=pan, lp=lp or 2500)
    cue(t - 0.02, 'giant_steps/fs349081.mp3', ss=3.233, to=3.945, semi=-7, gain=g - 3, pan=pan, lp=lp or 900, fo=0.25)
def boom(t, g, pan=0, tail=2.5):
    gstep(t, g, pan); cue(t, 'rumble/fs222521.mp3', ss=1.99, to=1.99 + tail, lp=220, gain=g - 6, pan=pan, fo=1.0, fi=0.02)
def shout(t, k, g, pan, lp=1400):
    f, a, b = [('shout/fs480805.mp3', 9.631, 10.668), ('shout/fs316640.mp3', 5.031, 6.3), ('shout/fs316640.mp3', 6.3, 7.043)][k % 3]
    cue(t, f, ss=a, to=b, gain=g, pan=pan, lp=lp, fo=0.2, fi=0.05)
def clash(t, k, g, pan=0): ev(t, ['sword_clash/fs326862.mp3', 'sword_clash/fs326795.mp3', 'sword_clash/fs326787.mp3'][k % 3], gain=g, pan=pan, fo=0.3)
def fall(t, g, pan=0): cue(t, 'thud/fs346692.mp3', ss=0.482, to=1.4, gain=g, pan=pan)
def arrow(t, g, pan=0): ev(t, 'arrows/fs394181.mp3', gain=g, pan=pan, fo=0.05)
def creak(t, g, pan=0, semi=-3): ev(t, 'wood_creak/fs506664.mp3', gain=g, pan=pan, semi=semi, fo=0.2)
def splash(t, g, pan=0): cue(t, 'splash/fs442773.mp3', ss=0.0, to=2.2, gain=g, pan=pan, fo=0.6)
def roar(t, f, a, b, semi, g, pan=0, fo=0.4): cue(t, f, ss=a, to=b, semi=semi, gain=g, pan=pan, fo=fo)
def fireup(t, g): cue(t, 'fire_ignite/fs534702.mp3', ss=0.019, to=1.74, gain=g, fo=0.4)

# ---- beds ----
bed(0, 2.9, 'wind_howl/fs623604.mp3', -22, ss=5, lp=2500, fi=0.3, fo=0.6)                                     # P01 the plain
bed(2.3, 9.2, 'sea/fs648859.mp3', -12, CY, ss=5, fi=0.4, fo=0.8)                                      # P02 the shore
bed(16.5, 21.0, 'wind_howl/fs623604.mp3', -12, lp=700, fi=0.3, fo=0.6)                                       # P04 the dead
cue(16.6, 'rumble/fs222521.mp3', ss=1.99, to=6.0, lp=180, gain=-12, fi=0.3, fo=1.0)
bed(20.5, 29.8, 'crowd_drunk/fs651364.mp3', -22, lp=1800, fi=0.6, fo=0.8)                             # P05 the suitors' hall
bed(29.3, 38.0, 'sea/fs648859.mp3', -11, CY, ss=40, fi=0.4, fo=1.0)                                   # P06 twelve ships
bed(29.5, 34.6, 'oars/fs588307.mp3', -18, CY, ss=2, fi=0.5, fo=0.8, pan=-0.2)
bed(37.6, 44.9, 'wind_howl/fs623604.mp3', -24, ss=20, lp=2500, fi=0.4, fo=0.6)                                # P07 the camp
bed(48.2, 54.9, 'battle/fs675094.mp3', -12, lp=3500, fi=0.3, fo=0.8)                                  # P09 the siege
bed(54.5, 58.6, 'fire_crackle/fs350757.mp3', -16, CY, fi=0.5, fo=0.6)                                 # P10 pyre
bed(58.2, 63.4, 'sea/fs550915.mp3', -16, CY, ss=10, fi=0.5, fo=0.6)                                   # P11 the beach
bed(63.0, 68.8, 'birds/fs731819.mp3', -16, ss=30, fi=0.5, fo=0.6)                                     # P12 Ithaca
bed(63.0, 68.8, 'sea/fs648859.mp3', -20, CY, ss=70, fi=0.5, fo=0.6)
bed(68.4, 76.0, 'wind_howl/fs623604.mp3', -25, ss=30, lp=2500, fi=0.4, fo=0.6)                               # P13 thinking
bed(84.3, 88.4, 'big_fire/fs483318.mp3', -12, ss=5, fi=0.3, fo=1.0)                                   # P15 the camp burns
bed(85.4, 92.6, 'sea/fs648859.mp3', -14, CY, ss=100, fi=0.6, fo=0.8)                                  #     empty beach
bed(85.5, 88.5, 'oars/fs588307.mp3', -19, CY, ss=12, fi=0.4, fo=0.8, pan=0.3)
bed(94.6, 99.0, 'crowd_party/fs764054.mp3', -10, fi=0.4, fo=1.0)                                      # P16 drank and danced
bed(95.2, 99.0, 'drum_frame/fs699895.mp3', -16, fi=0.3, fo=1.0, pan=0.2)
bed(98.4, 107.0, 'crickets/fs268962.mp3', -22, fi=1.0, fo=0.8)                                        # P16-P17 night
bed(106.6, 112.5, 'sea/fs550915.mp3', -12, CY, ss=20, fi=0.5, fo=0.5)                                 # P18 the fleet
bed(106.8, 112.4, 'oars/fs588307.mp3', -15, CY, ss=5, fi=0.6, fo=0.5)
bed(112.2, 124.5, 'big_fire/fs483318.mp3', -7, ss=15, fi=0.4, fo=1.2)                                 # P19-P20 Troy burns
bed(112.4, 124.4, 'scream_crowd/fs675052.mp3', -18, lp=2500, fi=0.8, fo=1.0)
bed(126.3, 137.4, 'sea/fs648859.mp3', -14, CY, ss=130, fi=0.5, fo=0.8)                                # P22 loading
bed(137.1, 143.7, 'birds/fs731819.mp3', -17, ss=80, fi=0.6, fo=0.6)                                   # P23 Ismarus
bed(143.4, 150.2, 'battle/fs675093.mp3', -10, lp=4000, fi=0.2, fo=0.8)                                # P24 the raid
bed(150.4, 163.3, 'crowd_drunk/fs690597.mp3', -14, lp=3000, ss=10, fi=0.8, fo=0.6)                    # P25 the drunk beach
bed(157.6, 163.3, 'fire_crackle/fs350757.mp3', -12, CY, ss=20, fi=0.6, fo=0.6)
bed(150.0, 163.3, 'sea/fs648859.mp3', -20, CY, ss=160, fi=0.5, fo=0.6)
bed(163.0, 168.6, 'battle/fs675091.mp3', -9, fi=0.3, fo=0.6)                                          # P26 down the hills
bed(168.3, 176.0, 'battle/fs675094.mp3', -12, lp=3000, fi=0.2, fo=2.0)                                # P27 losses
bed(175.8, 182.6, 'storm/fs700454.mp3', -8, ss=20, fi=0.3, fo=0.8)                                    # P28 storm
bed(175.8, 182.6, 'wind_howl/fs623604.mp3', -12, fi=0.3, fo=0.8)
bed(175.8, 182.6, 'sea/fs550915.mp3', -9, CY, ss=53, fi=0.3, fo=0.8)
bed(182.2, END, 'calm_shore/fs521602.mp3', -14, fi=1.0, fo=3.0)                                       # P29-P31 the gentle shore
bed(182.4, 212.5, 'birds/fs731819.mp3', -17, ss=10, fi=1.2, fo=1.0)
bed(218.0, END, 'oars/fs588307.mp3', -14, CY, ss=8, fi=0.6, fo=2.5, pan=-0.1)                          # P31 they row

# ---- the frieze sliding panel to panel ----
for i, t in enumerate(TB[1:]):
    f = ['slide_whoosh/fs843664.mp3', 'slide_whoosh/fs843665.mp3'][i % 2]
    a, b = [(0.197, 0.655), (0.068, 0.416)][i % 2]
    cue(t + 0.1, f, ss=a, to=b, pre=0.25, gain=-15, pan=0.3, hp=150, fi=0.03, fo=0.12)

# ---- events ----
for i, t in enumerate([0.6, 1.5]): ev(t, 'crows/fs813114.mp3', gain=-20, pan=0.4 - i * 0.6, lp=4000)  # P01 birds cross
splash(6.97, -9, 0.3); splash(7.35, -12, -0.2); splash(7.7, -14, 0.1)                                # P02 ships sink
gstep(10.4, -6, 0.3)                                                                                 # P03 the giant
ev(13.4, 'pig/fs233177.mp3', gain=-12, pan=-0.2)                                                     #     pigs
roar(14.0, 'roar/fs489901.mp3', 0.267, 1.879, -3, -9, 0.3); roar(15.0, 'roar/fs132874.mp3', 0.27, 1.29, -2, -11, -0.3)  # the six heads
cue(18.7, 'whisper/fs763864.mp3', ss=7.6, to=10.42, gain=-10, pan=0.0, fi=0.3, fo=0.6, lp=3000)    # P04 the shades crowd
msteps(20.9, 24.6, 2.2, -16, -0.2)                                                                   # P05 the beggar walks in
ev(25.86, 'arrows/fs384916.mp3', gain=-6, pan=0.1)                                                       #     the bow
splash(34.92, -6, -0.3); cue(34.95, 'sea/fs550915.mp3', ss=53, to=57, norm='int', gain=-8, fi=0.3, fo=1.5)  # P06 a wave swamps
roar(36.4, 'roar/fs489901.mp3', 0.267, 1.879, -5, -14, 0.4)                                          #     the monsters
boom(41.5, -10, 0)                                                                                   # P07 Odysseus himself
ev(44.8, 'cart_wheels/fs443055.mp3', gain=-14, fo=0.6, pan=-0.3); creak(45.4, -14); creak(46.2, -16, 0.2)  # P08 the horse rolls in
boom(46.68, -4, 0, tail=3.5)                                                                         #     I · THE HORSE
for i, t in enumerate([49.3, 49.6, 50.0, 51.0, 51.4]): arrow(t, -13, 0.4 - 0.2 * i)                 # P09 arrows
for i, t in enumerate([50.3, 51.9, 52.6]): clash(t, i, -10, 0.2 - 0.2 * i)
fall(53.6, -8, -0.2); fall(53.95, -10, 0.2)                                                          #     the walls held
ev(55.4, 'sobbing/fs157163.mp3', gain=-18, pan=-0.1, fo=0.8)                                         # P10 grief
shout(59.2, 0, -14, -0.4); shout(60.06, 1, -15, 0.4)                                                 # P11 the quarrel
creak(61.3, -12, 0.3, -5); creak(62.2, -15, 0.4, -6)                                                 #     ships rotting
cue(64.8, 'sheep/fs692898.mp3', ss=0.149, to=1.79, gain=-16, pan=0.3, lp=3500, fo=0.15)             # P12 the goat
for i, t in enumerate([69.42]): ev(t, 'chains/fs611669.mp3', gain=-17, pan=-0.2, to=1.0, fo=0.3)     # P13 Ajax flexes (armour)
cue(74.77, 'wood/fs452554.mp3', ss=0.043, to=0.6, gain=-14)                                          #     the trick (a knock)
ev(76.0, 'cart_wheels/fs443055.mp3', gain=-12, fo=0.8, pan=-0.2, ss=0)                               # P14 the push
msteps(76.1, 79.0, 2.6, -18, -0.1); creak(77.0, -11, 0, -6)
creak(78.84, -9, 0.1, -2)                                                                             #     hollow: the panel opens
ev(80.82, 'gate/fs456763.mp3', gain=-13, pan=0.4, lp=4000, fo=1.0)                                  #     the gates
fireup(84.3, -8)                                                                                     # P15 torch to the tents
ev(87.1, 'gate/fs456763.mp3', gain=-14, pan=-0.4, lp=4000, fo=1.0); msteps(87.6, 89.8, 2.4, -19, -0.3)  # the Trojans come out
ev(92.9, 'rope_strain/fs676988.mp3', gain=-12, pan=-0.2); ev(93.2, 'cart_wheels/fs443055.mp3', gain=-11, fo=0.8)  # P16 dragged in
creak(93.8, -11, 0.1, -6); ev(94.0, 'rope_strain/fs676988.mp3', gain=-14, pan=0.2)
ev(95.49, 'pour/fs164050.mp3', gain=-14, pan=0.3, fo=0.5)                                            #     drank
creak(100.62, -7, 0, -4); creak(100.9, -11, 0.1, -7)                                                 # P17 the hatch
ev(103.5, 'arrows/fs590606.mp3', gain=-14, semi=-6)                                                  #     rope drops
ev(103.75, 'rope_strain/fs676988.mp3', gain=-11)
msteps(104.4, 105.4, 3, -16, 0.2)
ev(105.6, 'gate/fs456763.mp3', gain=-8, pan=0.3, fo=1.0)                                             #     opens the gates
ev(107.5, 'war_horn/fs539956.mp3', gain=-16, pan=-0.4, lp=2000, fo=1.0)                              # P18 the army comes back
boom(HIT, 2, 0, tail=4.0); cue(HIT - 0.02, 'rock_crack/fs157804.mp3', ss=0.0, to=3.0, semi=-3, gain=-6, fo=1.0)  # P19 ASH
cue(118.1, 'fire_ignite/fs186374.mp3', ss=1.274, to=2.6, gain=-8)  # P20 temples burn
ev(119.52, 'scream_woman/fs520271.mp3', gain=-9, pan=0.2, lp=5000)                                  #     dragged from the altar
ev(121.2, 'scream_woman/fs697545.mp3', gain=-14, pan=-0.3, lp=4500)
cue(124.6, 'rumble/fs222521.mp3', ss=1.99, to=6.0, lp=300, gain=-9, fi=0.3, fo=1.2)                 # P21 the gods saw
ev(124.9, 'thunder/fs760212.mp3', gain=-12, to=5.0, lp=3000, fo=1.5)
msteps(126.7, 128.4, 2.6, -18, -0.2)                                                                  # P22 loading
ev(128.73, 'coins/fs213979.mp3', gain=-11, pan=-0.2)
ev(129.22, 'chains/fs611669.mp3', gain=-13, pan=0.2, to=1.6, fo=0.4)
ev(129.82, 'pour/fs164050.mp3', gain=-14, pan=0.1, fo=0.4)
bed(131.0, 135.0, 'oars/fs588307.mp3', -17, CY, ss=14, fi=0.5, fo=1.0)
boom(135.26, -10, 0)                                                                                  #     ten years
boom(140.03, -4, 0, tail=3.5)                                                                         # P23 II · ISMARUS
cue(140.0, 'fire_crackle/fs350757.mp3', ss=30, to=33.0, gain=-22, fi=0.5, fo=1.0)
ev(144.22, 'arrows/fs394181.mp3', gain=-8, semi=-3)                                                   # P24 the spear
for i, t in enumerate([145.0, 145.6, 146.22, 146.9]): clash(t, i, -9, 0.3 - 0.2 * i)
fall(146.5, -7, 0.2); fall(147.0, -9, -0.2)
ev(147.39, 'scream_woman/fs520269.mp3', gain=-11, pan=0.3, lp=5000)
ev(149.3, 'cow/fs513557.mp3', gain=-12, pan=0.3)
shout(156.5, 2, -14, 0.3)                                                                             # P25 they didn't listen
ev(158.4, 'cow/fs847404.mp3', gain=-17, pan=-0.4)
ev(164.65, 'war_horn/fs539956.mp3', gain=-9, pan=0.4, fo=1.0)                                        # P26 the neighbours
msteps(165.0, 168.2, 5.0, -16, 0.3)
for i, t in enumerate([168.8, 169.4, 170.36, 171.2]): clash(t, i, -10, -0.2 + 0.15 * i)              # P27 the losses
fall(172.14, -6, -0.1); fall(172.6, -8, 0.2)
for i, t in enumerate([173.3, 174.6]): ev(t, 'crows/fs741365.mp3', gain=-18, pan=0.4 - 0.8 * i, to=1.6, fo=0.4, lp=4000)
ev(176.55, 'thunder/fs534023.mp3', gain=-4, to=6.0, fo=1.5)                                           # P28 the storm
ev(179.9, 'thunder/fs760213.mp3', gain=-9, to=4.0, fo=1.2, pan=0.3)
for i in range(9): cue(178.27 + i * 0.22, 'wood/fs521399.mp3', ss=0.051, to=0.4, gain=-17 - (i % 2), semi=2, fo=0.08)  # nine strokes
msteps(190.3, 192.2, 2.6, -18, 0.3, lp=3000)                                                          # P29 three men ashore
for i, t in enumerate([198.28, 199.1]): ev(t, 'bite_chew/fs584290.mp3', gain=-14 - 3 * i, pan=0.2 - 0.3 * i)  # P30 eating the flower
ev(214.5, 'sobbing/fs643669.mp3', gain=-11, pan=-0.2, fo=0.8)                                        # P31 in tears
ev(214.96, 'rope_strain/fs676988.mp3', gain=-11, pan=-0.1)
cue(216.33, 'wood/fs452554.mp3', ss=0.043, to=0.6, gain=-12, pan=0.1)                               #     the benches
cue(218.31, 'oars/fs438846.mp3', ss=2.5, to=4.5, norm='int', gain=-12, fi=0.3, fo=0.6, pan=-0.2)     #     row

for c in C:
    for k in [k for k, v in c.items() if v is None]: del c[k]
json.dump(sorted(C, key=lambda c: c['t']), open(os.path.join(HERE, 'cues.json'), 'w'), indent=0)
print(len(C), 'cues')
