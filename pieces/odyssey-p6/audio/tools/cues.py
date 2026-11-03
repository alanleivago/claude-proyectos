# Odyssey p6 (Ithaca, Penelope's Bed, the end): "sonido pro" cue list. Times come from voice.json:
# panel starts TB = first line t0 - 0.25 s (as in src/head.html), the sign-off card at l62's end + 1.6 s; events on word times.
# Real CC0 recordings: the cyclops library (CY), parts 1-5 (P1..P5) and part 6's own (P6). Writes cues.json for sfxmix.py.
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); PIECE = os.path.dirname(os.path.dirname(HERE))
P6 = os.path.join(PIECE, 'audio', 'sfxlib', 'raw') + '/'
LIB = lambda p: os.path.abspath(os.path.join(PIECE, f'../{p}/audio/sfxlib/raw')) + '/'
P5, P4, P3, P2, P1, CY = LIB('odyssey-p5'), LIB('odyssey-p4'), LIB('odyssey-p3'), LIB('odyssey-p2'), LIB('odyssey-p1'), LIB('odyssey-cyclops')
PICK = json.load(open(os.path.join(HERE, 'pick.json')))      # cat -> the chosen P6 files (after the earshot screen), and *_ss start points
def F(cat, i=0): f = PICK[cat][i % len(PICK[cat])]; return f if '/' in f else cat + '/' + f
def SS(cat, i=0): v = PICK.get(cat + '_ss', [0.0]); v = v if isinstance(v, list) else [v]; return v[i % len(v)]

V = json.load(open(os.path.join(PIECE, 'voice.json'))); L = {l['id']: l for l in V['lines']}; END = V['duration']
def LT(i): return L[i]['t0']
def LE(i): return L[i]['t1']
def VW(i, w, n=1):
    k = 0
    for x in L[i]['words']:
        if re.sub(r"[^a-z0-9']", '', x['w'].lower()) == w and (k := k + 1) == n: return x['t0']
    raise KeyError((i, w))
IDS = [f'p{i:02d}' for i in range(1, 64)]
TB = {f'p{i:02d}': (0 if i == 1 else LT(f'l{i:02d}') - 0.25) for i in range(1, 63)}; TB['p63'] = LE('l62') + 1.6
def NX(p): i = IDS.index(p); return TB[IDS[i + 1]] if i + 1 < len(IDS) else END

C = []
def cue(t, f, lib=CY, **k): C.append(dict(t=round(t, 3), file=lib + f, name=f, **k))
def ev(t, f, lib=P6, **k): cue(t, f, lib, onset=True, **k)
def bed(t0, t1, f, g, lib=P1, ss=0, **k): cue(t0, f, lib, ss=ss, dur=round(t1 - t0, 3), norm='int', gain=g, **k)
def span(p, q=None, pre=0.3, post=0.3): return TB[p] - pre, NX(q or p) + post
def pick(cat, t, g, i=0, d=None, pan=0, **k): ss = SS(cat, i); ev(t, F(cat, i), gain=g, pan=pan, ss=ss, to=(ss + d) if d else None, **k)

STEP = [(15.279, 15.62), (5.819, 6.145), (17.09, 17.645), (6.476, 6.75), (11.531, 11.9), (2.094, 2.45)]
def msteps(t0, t1, rate, g, pan=0, semi=0, lp=None):
    t = t0; i = 0
    while t < t1:
        a, b = STEP[i % len(STEP)]; cue(t - 0.005, 'men_steps/fs503671.mp3', ss=a, to=b, gain=g - (2 if i % 3 == 1 else 0), pan=pan, semi=semi, lp=lp, fo=0.05)
        t += 1 / rate; i += 1
def knock(t, g, pan=0, semi=2): cue(t, 'wood/fs521399.mp3', ss=0.051, to=0.4, gain=g, semi=semi, pan=pan, fo=0.08)
def staff(t0, t1, g, pan=0):     # the beggar's slow step and the tap of his staff
    msteps(t0, t1, 1.5, g, pan, semi=-1, lp=3000); t = t0 + 0.3
    while t < t1: knock(t, g - 4, pan, semi=-2); t += 1.33
def boom(t, g, pan=0, tail=2.5):
    cue(t - 0.03, 'thud/fs504626.mp3', ss=0.37, to=1.415, semi=-4, gain=g, pan=pan, lp=2500)
    cue(t, 'rumble/fs222521.mp3', ss=1.99, to=1.99 + tail, lp=220, gain=g - 6, pan=pan, fo=1.0, fi=0.02)
def low(t, g, d=3.0): cue(t, 'rumble/fs222521.mp3', ss=1.99, to=1.99 + d, lp=200, gain=g, fi=0.3, fo=1.2)
def slidew(t, i):
    f = ['slide_whoosh/fs843664.mp3', 'slide_whoosh/fs843665.mp3'][i % 2]; a, b = [(0.197, 0.655), (0.068, 0.416)][i % 2]
    cue(t, f, ss=a, to=b, pre=0.25, gain=-15, pan=0.3, hp=150, fi=0.03, fo=0.12)
CH = [('chime/fs169281.mp3', 0.3), ('chime/fs644684.mp3', 0.3), ('chime/fs415446.mp3', 0.2)]
def chime(t, g, pan=0, dur=2.0, k=0, semi=0): f, s = CH[k % 3]; cue(t, f, P3, ss=s, gain=g, pan=pan, fi=0.05, fo=0.8, semi=semi, to=s + dur)
def creak(t, g, pan=0, semi=-3): ev(t, 'wood_creak/fs506664.mp3', P1, gain=g, pan=pan, semi=semi, fo=0.2)
def whoosh(t, g, pan=0, semi=0): ev(t, 'throw_whoosh/fs475134.mp3', CY, gain=g, pan=pan, semi=semi, fo=0.1)
def thunder(t, g, k=0, pan=0, to=5.0): ev(t, ['thunder/fs534023.mp3', 'thunder/fs760212.mp3', 'thunder/fs760213.mp3'][k % 3], P1, gain=g, pan=pan, to=to, fo=1.5)
def fall(t, g, pan=0, k=0): ev(t, ['body_fall/fs614064.mp3', 'body_fall/fs502553.mp3', 'body_fall/fs519262.mp3'][k % 3], P3, gain=g, pan=pan, to=1.0, fo=0.3)
def clash(t, g, pan=0, k=0): ev(t, ['sword_clash/fs326787.mp3', 'sword_clash/fs326795.mp3', 'sword_clash/fs326862.mp3'][k % 3], P1, gain=g, pan=pan, fo=0.3)
def laughs(t, g, k=0, pan=0.3, d=2.5): pick('men_laugh', t, g, k, d, pan, fi=0.05, fo=0.5)
def murmur(t0, t1, g, k=0, ss_add=0): cue(t0, F('crowd_murmur', k), P6, ss=SS('crowd_murmur', k) + ss_add, dur=round(t1 - t0, 3), norm='int', gain=g, fi=0.5, fo=0.6, lp=4000)
def fire(t0, t1, g, pan=0.4, ss=5): bed(t0, t1, 'fire_crackle/fs350757.mp3', g, CY, ss=ss, fi=0.5, fo=0.6, pan=pan)
def shore(t0, t1, g, ss=0, **k): bed(t0, t1, 'calm_shore/fs521602.mp3', g, ss=ss, **k)
def crickets(t0, t1, g, ss=0): bed(t0, t1, 'crickets/fs268962.mp3', g, ss=ss, fi=0.8, fo=0.8)
def tings(t0, dt, g, n=12, pan0=-0.5, pan1=0.6, semi=0):
    for i in range(n): pick('metal_ting', t0 + i * dt, g - (i % 3), i, 0.6, pan0 + (pan1 - pan0) * i / max(1, n - 1), semi=semi + (i % 2), fo=0.2)

# ================= beds =================
t0, t1 = span('p01'); shore(0, t1, -15, ss=180, fi=0.0, fo=0.8); bed(0, t1, 'seagulls/fs512099.mp3', -25, P4, ss=28, fi=0.0, fo=0.8, pan=-0.4)   # continues part 5's last beach
t0, t1 = span('p02'); bed(t0, t1, 'ghost_wind/fs440962.mp3', -24, ss=30, fi=0.5, fo=0.6); bed(t0, t1, 'sea/fs648859.mp3', -22, CY, ss=40, fi=0.5, fo=0.6)
HALL1 = ('p03', 'p05'); t0, t1 = span(*HALL1); murmur(t0, t1, -20, 0); fire(t0, t1, -25)
t0, t1 = span('p06', 'p09'); bed(t0, t1, 'loom/fs510266.mp3', -21, P3, ss=4, fi=0.6, fo=0.6, pan=0.3)                             # Penelope's room: the loom
crickets(VW('l08', 'night') - 0.3, NX('p08') + 0.3, -28)
t0, t1 = span('p10', 'p11'); murmur(t0, t1, -23, 1); fire(t0, t1, -26, ss=30)
t0, t1 = span('p12', 'p13'); shore(t0, t1, -16, ss=60, fi=0.5, fo=0.6); bed(t0, t1, 'birds/fs731819.mp3', -23, ss=60, fi=0.5, fo=0.6)
t0, t1 = span('p14'); bed(t0, t1, F('village'), -19, P6, ss=SS('village'), fi=0.5, fo=0.6)
GATE = ('p15', 'p23'); t0, t1 = span(*GATE); bed(t0, t1, F('village'), -25, P6, ss=SS('village') + 15, fi=0.5, fo=0.8, lp=3000)
bed(TB['p15'] + 0.5, VW('l23', 'died') + 0.6, F('flies'), -27, P6, ss=SS('flies'), fi=0.8, fo=1.0, pan=-0.4)
HALL2 = ('p24', 'p26'); t0, t1 = span(*HALL2); murmur(t0, t1, -20, 0, 20); fire(t0, t1, -25, ss=40)
NIGHT = ('p27', 'p29'); t0, t1 = span(*NIGHT); crickets(t0, t1, -27, 30); fire(t0, t1, -27, pan=0.0, ss=60)
HALL3 = ('p30', 'p38'); t0, t1 = span(*HALL3); murmur(t0, t1, -21, 1, 15); fire(t0, t1, -25, ss=90)
t0, t1 = span('p39'); murmur(t0, VW('l39', 'shot'), -26, 0, 5); fire(t0, t1, -28, ss=120)                                      # the shot: the hall goes quiet
t0, t1 = span('p40', 'p42'); murmur(t0, t1, -24, 0, 50)
t0, t1 = span('p43'); fire(t0, t1, -26, ss=150)
FIGHT = ('p44', 'p45'); t0, t1 = span(*FIGHT); bed(t0, VW('l45', 'nobody'), 'battle/fs675091.mp3', -14, P1, ss=1, fi=0.3, fo=1.5, lp=4500)
bed(VW('l45', 'standing'), t1, 'ghost_wind/fs675368.mp3', -26, ss=4, fi=0.8, fo=0.6)
ROOM = ('p46', 'p57'); t0, t1 = span(*ROOM); fire(t0, t1, -24, pan=0.0, ss=10)
t0, t1 = span('p55', 'p56'); bed(t0, t1, 'leaves/fs352963.mp3', -26, P5, ss=2.2, fi=0.8, fo=0.6)
t0, t1 = span('p58'); fire(t0, t1, -27, pan=0.0, ss=200)
t0, t1 = span('p59', 'p60'); bed(t0, t1, 'sea/fs648859.mp3', -18, CY, ss=120, fi=0.5, fo=0.8); bed(t0, t1, 'ghost_wind/fs440962.mp3', -26, ss=50, fi=0.5, fo=0.8)
t0, t1 = span('p61', 'p62'); shore(t0, t1, -18, ss=220, fi=0.6, fo=0.6); crickets(t0, t1, -24, 60)
t0 = TB['p63'] - 0.3; shore(t0, END, -21, ss=250, fi=0.6, fo=6.0); crickets(t0, END - 3, -30, 90)                                 # the end card: the night shore, fading under the music

# ================= the frieze sliding panel to panel =================
for i, p in enumerate(IDS[1:]): slidew(TB[p] + 0.1, i)

# ================= events =================
boom(TB['p01'] + 0.4, -7, 0, tail=3.5)                                                                                              # P01 XIII · ITHACA
msteps(VW('l01', 'athena') - 0.2, VW('l01', 'athena') + 1.3, 2.0, -24, -0.4); chime(VW('l01', 'athena') - 0.2, -21, -0.4, k=1, dur=2.0)
chime(VW('l01', 'house') - 0.3, -24, 0.4, k=2, dur=1.6, semi=-2)
for i in range(10): knock(VW('l02', 'twenty') - 0.3 + i * 0.08, -23, -0.4, semi=3) if i % 2 == 0 else None                       # P02 twenty years
for i in range(10): knock(VW('l02', 'twenty') + 0.6 + i * 0.08, -23, 0.4, semi=3) if i % 2 == 0 else None
ev(VW('l02', 'war') - 0.2, 'battle/fs675091.mp3', P1, gain=-24, pan=-0.4, to=2.0, lp=2500, fo=0.8)
cue(VW('l02', 'sea') - 0.3, 'sea/fs550915.mp3', CY, ss=50, to=52.5, gain=-21, pan=0.4, fi=0.2, fo=0.8)
low(VW('l02', 'dead') - 0.3, -17)
msteps(VW('l03', 'moved') - 1.2, VW('l03', 'moved') + 1.4, 3.0, -19, -0.5)                                                         # P03 the suitors walk in
laughs(VW('l03', 'hundred') - 0.2, -21, 0, -0.2, 2.0)
chime(VW('l03', 'penelope') - 0.3, -23, 0.5, k=0, dur=1.6, semi=-2)
for i in range(3): ev(VW('l04', 'drank') - 0.2 + i * 0.3, F('cutlery', i) if 'cutlery' in PICK else 'cutlery/fs761136.mp3', P5, gain=-19, pan=-0.3 + 0.3 * i, to=1.0, fo=0.3)   # P04 the feast
ev(VW('l04', 'ate') - 0.2, 'bite_chew/fs584290.mp3', P1, gain=-20, pan=0.2, to=1.5, fo=0.3)
cue(VW('l04', 'ate') - 0.3, 'sizzle/fs211096.mp3', CY, ss=1, to=4, gain=-22, pan=0.6, fi=0.2, fo=0.8)
laughs(VW('l04', 'servant') - 0.3, -19, 1, 0.1, 2.5)
for i in range(5): knock(VW('l05', 'every') - 0.3 + i * 0.35, -22, 0.4, semi=4)                                                   # P05 every day
ev(VW('l05', 'demanded') - 0.1, F('men_shout'), gain=-21, pan=-0.1, ss=SS('men_shout'), to=SS('men_shout') + 1.6, fo=0.4)
creak(VW('l06', 'tricked') - 0.2, -22, 0.3, -1)                                                                                    # P06 the loom
chime(VW('l07', 'father') - 0.3, -22, 0.6, k=2, dur=1.8, semi=-3)                                                                  # P07 Laertes
cue(VW('l08', 'unpicked') - 0.3, 'cloth/fs737238.mp3', P3, ss=0, to=2.0, gain=-19, pan=0.2, fo=0.5)                                # P08 unpicking by lamplight
cue(VW('l08', 'night') - 0.3, 'fire_ignite/fs171255.mp3', CY, to=1.5, gain=-24, pan=0.5, fo=0.5)
for i in range(3): knock(VW('l09', 'three') - 0.3 + i * 0.25, -20, 0.3, semi=2)                                                   # P09 three years, the maid
cue(VW('l09', 'maids') - 0.2, 'whisper/' + sorted(os.listdir(CY + 'whisper'))[0], CY, to=2.0, gain=-21, pan=-0.3, fo=0.4)
chime(VW('l09', 'away') - 0.2, -22, -0.1, k=1, dur=1.4, semi=-5)
msteps(VW('l10', 'son') - 0.4, VW('l10', 'son') + 1.6, 2.4, -20, -0.4)                                                             # P10 Telemachus
pick('baby_coo', VW('l10', 'baby') - 0.1, -26, 0, 1.5, 0.2, fo=0.4) if 'baby_coo' in PICK else None
cue(VW('l10', 'sailed') - 0.2, 'sail_flap/fs57278.mp3', P2, to=2.0, gain=-22, pan=0.2, fi=0.1, fo=0.6)
pick('knife', VW('l11', 'murder') - 0.15, -16, 0, 1.2, 0.2)                                                                        # P11 the plot, the knife
low(VW('l11', 'murder') - 0.2, -16, 3.5)
chime(VW('l12', 'touched') - 0.2, -17, 0.0, k=0, dur=2.5); chime(VW('l12', 'wand'), -21, 0.2, k=2, dur=2.0, semi=5)               # P12 the wand
chime(VW('l13', 'skin') - 0.3, -19, 0.2, k=1, dur=4.0, semi=-4); low(VW('l13', 'hair') - 0.3, -19, 3.0)                           # P13 the change
cue(VW('l13', 'rags') - 0.3, 'cloth/fs494789.mp3', P3, ss=0, to=1.3, gain=-17, pan=0.2, fo=0.4)
staff(TB['p14'] + 0.2, NX('p14') + 0.3, -19, 0.5)                                                                                  # P14 into town
staff(TB['p18'] - 0.2, VW('l18', 'one') + 0.4, -19, -0.3)                                                                          # P18 to the gate
msteps(VW('l18', 'one') - 0.6, VW('l18', 'one') + 1.8, 2.2, -24, 0.5)
pick('dog_whine', VW('l19', 'knew') - 0.1, -15, 0, 1.6, -0.4, fo=0.4)                                                              # P19-P20 Argos knows him
pick('dog_whine', VW('l20', 'tail') - 0.2, -18, 1, 1.4, -0.4, fo=0.4)
for i in range(4): ev(VW('l20', 'tail') + i * 0.18, 'leaves/fs352963.mp3', P5, gain=-27, pan=-0.5, ss=2.2 + i * 0.3, to=2.4 + i * 0.3, fo=0.08)
pick('dog_whimper', VW('l20', 'up') - 0.2, -17, 0, 2.0, -0.4, fo=0.6)
low(VW('l21', 'away') - 0.3, -22, 2.0)                                                                                             # P21
staff(VW('l22', 'walked') - 0.2, VW('l22', 'walked') + 2.6, -20, 0.2)                                                              # P22 past him, a tear
chime(VW('l22', 'tear') - 0.2, -25, 0.1, k=2, dur=1.6, semi=-5)
pick('dog_whimper', VW('l23', 'master') - 0.2, -21, 1, 1.6, -0.4, fo=0.8)                                                          # P23 Argos dies
low(VW('l23', 'died') - 0.2, -15, 4.0)
laughs(VW('l24', 'fun') - 0.4, -16, 0, 0.3, 3.0)                                                                                   # P24-P26 the jeers, the stools
for k, w in enumerate(['stool', 'footstool', 'hoof']):
    t = VW('l25', w) - 0.5; whoosh(t + 0.05, -19, 0.2 - 0.3 * k, semi=-2 + k)
    pick('stool_hit', t + 0.5, -14 - k, k, 1.0, -0.4); fall(t + 0.55, -25, -0.4, k)
laughs(VW('l25', 'hoof') + 0.2, -18, 1, 0.3, 2.0)
low(VW('l26', 'watched') - 0.3, -19, 3.0)
cue(VW('l27', 'night') - 0.3, 'fire_ignite/fs171255.mp3', CY, to=1.5, gain=-24, pan=0.0, fo=0.5)                                # P27 night talk
chime(VW('l28', 'bow') - 0.2, -20, -0.1, k=0, dur=2.0, semi=-2); pick('bow_creak', VW('l28', 'bow') + 0.2, -22, 0, 1.0, -0.1)   # P28 the bow
for i in range(12): pick('metal_ting', VW('l29', 'twelve') - 0.4 + i * 0.07, -22 - (i % 3), i, 0.5, -0.4 + 0.08 * i, fo=0.2)  # P29 the twelve axes rise
pick('bow_twang', VW('l29', 'shoot') + 0.85, -17, 0, 1.0, -0.6)
whoosh(VW('l29', 'shoot') + 0.95, -18, 0.0, semi=4)
chime(VW('l29', 'marry') - 0.3, -22, -0.6, k=1, dur=1.8, semi=-3)
msteps(TB['p30'] + 0.2, TB['p30'] + 1.6, 2.4, -22, 0.5)                                                                            # P30-P31 they try the bow
pick('bow_creak', VW('l30', 'tried') - 0.1, -15, 1, 1.6, 0.5); pick('bow_creak', VW('l30', 'another') - 0.2, -15, 2, 1.6, 0.6)
cue(VW('l31', 'warmed') - 0.3, 'sizzle/fs234124.mp3', CY, ss=0.5, to=3.0, gain=-21, pan=0.6, fi=0.2, fo=0.6)
cue(VW('l31', 'fat') - 0.2, 'squelch/fs433819.mp3', P4, to=1.0, gain=-24, pan=0.6, fo=0.3)
pick('bow_creak', VW('l31', 'bend') - 0.3, -13, 0, 1.8, 0.4); ev(VW('l31', 'bend') + 1.0, 'moan/fs182018.mp3', P3, gain=-22, pan=0.4, to=1.0, fo=0.3)
staff(VW('l32', 'beggar') - 0.1, VW('l32', 'turn') + 0.4, -20, -0.6)                                                                # P32
laughs(VW('l33', 'laughed') - 0.3, -13, 0, 0.2, 2.2); laughs(VW('l33', 'laughed') - 0.1, -17, 2, 0.5, 2.0)                          # P33 they laugh and shout
pick('jeer', VW('l33', 'shouted') - 0.3, -15, 0, 2.2, 0.3, fi=0.05, fo=0.6)
ev(VW('l33', 'shouted') - 0.1, F('men_shout'), gain=-15, pan=0.4, ss=SS('men_shout') + 2, to=SS('men_shout') + 3.6, fo=0.4)
msteps(VW('l34', 'telemachus') - 0.4, VW('l34', 'handed'), 2.5, -20, 0.1)                                                          # P34 Telemachus hands him the bow
cue(VW('l34', 'bow') - 0.3, 'cloth/fs737238.mp3', P3, ss=0, to=0.8, gain=-22, pan=-0.3, fo=0.3)
pick('bow_creak', VW('l35', 'turned') - 0.1, -21, 1, 1.2, -0.5)                                                                     # P35 the musician
cue(VW('l35', 'lyre') - 0.4, 'lyre/fs191883.mp3', P5, ss=0, to=3.0, gain=-22, pan=-0.2, fi=0.2, fo=0.8)
pick('bow_creak', VW('l36', 'strung') - 0.3, -14, 2, 1.0, -0.5); pick('bow_twang', VW('l36', 'easily') - 0.2, -18, 1, 0.8, -0.5)   # P36 strung
pick('bow_twang', VW('l37', 'plucked') - 0.1, -12, 2, 1.2, -0.5)                                                                    # P37 it sang like a swallow
pick('swallow', VW('l37', 'swallow') - 0.2, -17, 0, 2.2, 0.0, fi=0.05, fo=0.6)
low(VW('l38', 'clear') - 0.3, -22, 2.0); thunder(VW('l38', 'thundered') - 0.1, -6, 0, 0.0, to=5.0)                                 # P38 Zeus thunders
ev(VW('l38', 'thundered') + 0.3, 'men_panic/fs481741.mp3', P2, gain=-22, pan=0.5, to=1.5, fo=0.4)
pick('bow_creak', VW('l39', 'fitted') - 0.2, -13, 0, 1.4, -0.6)                                                                     # P39 THE SHOT
pick('bow_twang', VW('l39', 'shot') - 0.05, -9, 0, 1.0, -0.6)
whoosh(VW('l39', 'shot'), -14, 0.0, semi=3)
tings(VW('l39', 'shot') + 0.1, 1.0 / 12, -22, 12, -0.4, 0.6, semi=2)
pick('arrow_hit', VW('l39', 'shot') + 1.0, -11, 0, 1.2, 0.7)
cue(VW('l40', 'tore') - 0.3, F('cloth_rip'), P6, ss=SS('cloth_rip'), to=SS('cloth_rip') + 1.5, gain=-12, pan=-0.4, fo=0.3)       # P40 the rags off, the threshold
ev(VW('l40', 'leapt') + 0.25, 'thud/fs504626.mp3', CY, gain=-15, pan=-0.4, ss=0.37, to=1.2, lp=3000)
pick('spears', VW('l40', 'poured') - 0.2, -14, 0, 2.0, -0.3)
boom(VW('l40', 'threshold') - 0.1, -14, -0.3, tail=2.0)
pick('bow_twang', VW('l41', 'throat') - 0.4, -11, 1, 1.0, -0.6); whoosh(VW('l41', 'throat') - 0.35, -14, 0.2, semi=3)               # P41 Antinous
pick('arrow_hit', VW('l41', 'throat') - 0.05, -15, 1, 0.8, 0.4)
ev(VW('l41', 'throat') + 0.25, 'cup/fs214186.mp3', P3, gain=-17, pan=0.5)
fall(VW('l41', 'throat') + 1.0, -14, 0.5, 0)
ev(VW('l41', 'throat') + 0.2, 'scream_crowd/fs459101.mp3', P1, gain=-23, pan=0.5, to=2.0, fo=0.8)
boom(VW('l42', 'dogs') - 0.1, -10, -0.2, tail=3.0)                                                                                  # P42 you dogs
for i, w in enumerate(['doors', 'locked']): pick('door_slam', VW('l43', w) - 0.1, -10, i, 1.5, -0.5)                                # P43 doors, bar, spears gone
ev(VW('l43', 'locked') + 0.4, F('wood_bar'), gain=-12, pan=-0.5, ss=SS('wood_bar'), to=SS('wood_bar') + 1.5)
for i in range(4): pick('spears', VW('l43', 'spears') + 0.3 + i * 0.5, -21 - i % 2, 1, 0.6, 0.3)
for i, w in enumerate(['odysseus', 'son', 'servants']): ev(VW('l44', w) - 0.1, 'sword/fs471147.mp3', CY, gain=-20, pan=-0.5 + 0.2 * i)   # P44-P45 the fight
for i in range(8): clash(VW('l44', 'fought') - 0.1 + i * 0.6, -14 - (i % 3), (-0.3, 0.2, 0.4)[i % 3], i)
pick('men_shout', VW('l44', 'hundred') - 0.3, -16, 0, 2.0, 0.5)
for i, w in enumerate(['kept', 'floor', 'nobody']): fall(VW('l45', w) + 0.3, -13, 0.3 + 0.1 * i, i)
for i in range(4): clash(VW('l45', 'kept') - 0.2 + i * 0.55, -16 - i, 0.1, i + 1)
low(VW('l45', 'standing') - 0.3, -15, 4.0)
boom(TB['p46'] + 0.4, -7, 0, tail=3.5)                                                                                              # P46 XIV · PENELOPE'S BED
cue(VW('l46', 'nurse') - 0.4, F('stairs'), P6, ss=SS('stairs'), to=SS('stairs') + 3.4, gain=-15, pan=0.3, fi=0.05, fo=0.5)
ev(VW('l47', 'here') - 0.2, 'woman_cry/fs520285.mp3', P3, gain=-26, pan=-0.3, to=1.0, fo=0.3) if False else None
chime(VW('l47', 'odysseus') - 0.2, -18, 0.2, k=0, dur=2.2)                                                                         # P47 he's home
low(VW('l47', 'killed') - 0.2, -19, 2.5)
msteps(VW('l48', 'came') - 0.5, VW('l48', 'sat') - 0.2, 1.8, -24, -0.4); creak(VW('l48', 'sat') - 0.1, -22, -0.4, -2)            # P48 across the fire, silence
ev(VW('l49', 'furious') - 0.4, 'men_steps/fs503671.mp3', CY, gain=-21, pan=0.5, ss=5.8, to=6.2)                                    # P49 Telemachus
msteps(VW('l49', 'furious') - 0.5, VW('l49', 'furious') + 0.9, 3.0, -20, 0.5)
low(VW('l49', 'cold') - 0.2, -22, 2.0)
for i in range(20): knock(VW('l50', 'waited') - 0.3 + i * 0.04, -27, -0.6, semi=5) if i % 4 == 0 else None                      # P50 twenty years; gods in disguise
chime(VW('l50', 'gods') - 0.2, -19, 0.0, k=1, dur=2.0); chime(VW('l50', 'disguise') - 0.2, -21, 0.0, k=2, dur=1.8, semi=-4)
creak(VW('l51', 'stranger') - 0.3, -23, 0.4, -2)                                                                                   # P51 he stands
msteps(VW('l52', 'nurse') - 0.6, VW('l52', 'nurse') + 0.4, 2.5, -24, -0.6)                                                         # P52 the test: the bed in a roundel
cue(VW('l52', 'bed') - 0.2, F('tree_creak'), P6, ss=SS('tree_creak'), to=SS('tree_creak') + 2.0, gain=-18, pan=0.0, fi=0.05, fo=0.6)
cue(VW('l53', 'giant') - 0.3, 'roar/fs489901.mp3', CY, ss=0.267, to=1.5, semi=-4, gain=-22, pan=-0.4, lp=2000, fo=0.5)              # P53 giant, witch, suitors; the temper
chime(VW('l53', 'witch') - 0.2, -21, 0.0, k=1, dur=1.4, semi=3)
laughs(VW('l53', 'suitors') - 0.2, -22, 1, 0.4, 1.4)
cue(VW('l53', 'temper') - 0.2, 'fire_ignite/fs186374.mp3', CY, to=1.6, gain=-14, pan=0.0, fo=0.5); boom(VW('l53', 'temper'), -13, 0.3, tail=2.0)
boom(VW('l54', 'who') - 0.05, -11, 0.3, tail=2.0); ev(VW('l54', 'nobody') - 0.05, 'thud/fs504626.mp3', CY, gain=-15, ss=0.37, to=1.2, lp=2500, pan=0.3)   # P54 who moved my bed?
cue(VW('l55', 'trunk') - 0.4, F('tree_creak'), P6, ss=SS('tree_creak', 1), to=SS('tree_creak', 1) + 3.0, gain=-14, pan=0.1, fi=0.2, fo=1.0)   # P55 the olive bed grows
cue(VW('l55', 'olive') - 0.2, 'leaves/fs352963.mp3', P5, ss=2.2, to=5.0, gain=-17, pan=0.2, fi=0.2, fo=0.8)
creak(VW('l55', 'built') - 0.1, -19, 0.1, -4)
chime(VW('l56', 'legs') - 0.2, -22, -0.1, k=0, dur=1.6, semi=-2)                                                                   # P56 cut it down? never
ev(VW('l56', 'cut') - 0.1, 'axe_chop/fs442534.mp3', P5, gain=-15, pan=-0.3, to=0.8)
ev(VW('l56', 'down') - 0.1, 'sword/fs471147.mp3', CY, gain=-20, pan=-0.3)
chime(VW('l57', 'two') - 0.3, -20, 0.0, k=2, dur=2.5, semi=-3)                                                                     # P57 only the two of them
msteps(VW('l58', 'ran') - 0.4, VW('l58', 'ran') + 0.6, 4.0, -21, -0.4)                                                             # P58 she runs to him; they cry
cue(VW('l58', 'held') - 0.1, 'cloth/fs737238.mp3', P3, ss=0, to=1.0, gain=-21, pan=0.0, fo=0.3)
cue(VW('l58', 'cried') - 0.2, F('woman_cry'), P6, ss=SS('woman_cry'), to=SS('woman_cry') + 3.8, gain=-19, pan=-0.1, fi=0.2, fo=1.2)
chime(LE('l58') + 0.3, -21, 0.0, k=1, dur=2.5, semi=-5)
for i in range(12): knock(VW('l59', 'lost') + i * 0.12, -22, -0.6 + 0.1 * i, semi=1)                                            # P59 every ship struck out
low(VW('l59', 'way') - 0.2, -20, 2.5)
cue(VW('l60', 'sea') - 0.2, 'sea/fs550915.mp3', CY, ss=50, to=52, gain=-18, pan=-0.5, fi=0.1, fo=0.6)                                # P60 sea and monsters, gods, pride
ev(VW('l60', 'monsters') - 0.1, 'jaw_snap/fs676482.mp3', P4, gain=-17, pan=-0.5)
thunder(VW('l60', 'gods') - 0.1, -14, 1, 0.0, to=3.0)
ev(VW('l60', 'pride') - 0.2, 'shout/' + sorted(os.listdir(CY + 'shout'))[0], CY, gain=-20, pan=0.5, to=1.5, fo=0.4)
chime(VW('l61', 'home') - 0.2, -18, 0.0, k=0, dur=3.0, semi=-2)                                                                    # P61 home
chime(VW('l62', 'athena') - 0.2, -21, -0.2, k=1, dur=2.0); low(VW('l62', 'held') - 0.2, -21, 3.0)                                 # P62 the dawn held back
chime(VW('l62', 'longer') - 0.1, -20, 0.0, k=2, dur=3.0, semi=-5)
boom(TB['p63'] + 0.4, -10, 0, tail=3.5); chime(TB['p63'] + 0.6, -18, 0.0, k=0, dur=3.0)                                            # P63 AMPHORUS, then the calm end card

TRIM = [('p44', 1), ('p45', 1)]
for c in C:
    for p, d in TRIM:
        if TB[p] - 0.45 <= c['t'] < NX(p) - 0.45: c['gain'] = c.get('gain', 0) - d
for c in C:
    for k in [k for k, v in c.items() if v is None]: del c[k]
json.dump(sorted(C, key=lambda c: c['t']), open(os.path.join(HERE, 'cues.json'), 'w'), indent=0)
print(len(C), 'cues')
