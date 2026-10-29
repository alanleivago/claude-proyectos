# gen.py: writes layers.json — the recorded bed for infierno (Freesound CC0 previews in lib/; see CREDITS.md).
import json
R = "lib/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
def one(id, file, t, d, db, src=0, **o): lay(id, file, t, t + d, [[t, db], [t + d, db]], loop=False, src=src, **o)
CUT = 57.75   # black silence before the blaze at 58.4
# 1. the fiesta (0-3.6): the brass band, the crowd, fireworks; everything cut dead by the bang
lay("band", "band-257422.mp3", 0, 3.55, [[0, -13], [3.45, -13], [3.55, -60]], src=60, pan=0.15)
lay("crowd", "nycrowd-141253.mp3", 0, 3.55, [[0, -18], [3.45, -18], [3.55, -60]], src=20)
lay("fws", "fwcrowd-244769.mp3", 0, 3.55, [[0, -22], [3.45, -22], [3.55, -60]], src=6, pan=-0.2)
one("bang", "fwclose-456314.mp3", 3.5, 1.9, -12, src=11.72)
one("thud", "bodyfall-673424.mp3", 3.95, 1.4, -10)
# muffled party heard from outside the body (4.8-9), fading
lay("muff", "band-257422.mp3", 4.8, 9.2, [[4.8, -40], [5.4, -30], [8.0, -34], [9.2, -50]], src=84, lp=420)
lay("muffc", "nycrowd-141253.mp3", 4.8, 9.2, [[4.8, -40], [5.4, -32], [9.2, -50]], src=40, lp=500)
# 2. the rise (9-11): a soft choir far above, then it goes; the wind of the fall (11-16)
lay("light", "choir-808032.mp3", 8.8, 11.2, [[8.8, -40], [9.6, -26], [10.5, -26], [11.2, -50]], src=40)
lay("howl", "howl-852822.mp3", 10.5, 18.1, [[10.5, -40], [11.3, -22], [16, -19], [17.6, -18], [18.1, -40]], src=30)
lay("tunnel", "tunnelwind-454355.mp3", 11, 18.1, [[11, -40], [12, -24], [17.6, -22], [18.1, -40]], src=5, pan=0.2)
lay("roarF", "fireroar-698209.mp3", 13, 18.1, [[13, -40], [16, -22], [17.8, -19], [18.1, -30]], src=87)
# 3. the lake (18-43): fire, lava, the screams of millions, crackle near
lay("fire", "fireroar-698209.mp3", 18, CUT, [[18, -24], [20, -18], [26, -16], [31, -40], [34, -40], [37, -18], [43, -20], [49, -17], [55, -15], [57.7, -14]], src=9, pan=-0.35)
lay("firelarge", "firelarge-483318.mp3", 18, CUT, [[18, -30], [26, -20], [31, -50], [37, -22], [57.7, -18]], src=3, pan=0.3)
lay("lava", "lava-474851.mp3", 18, CUT, [[18, -24], [26, -22], [31, -50], [37, -24], [57.7, -24]], lp=900, pan=-0.2)
lay("wails", "wails-705709.mp3", 19, CUT, [[19, -40], [21, -22], [25, -18], [31, -40], [34, -50], [37, -24], [57.7, -20]], src=30, pan=0.4)
lay("screams", "screamagony-563011.mp3", 22, 31, [[22, -40], [22.6, -19], [30, -18], [31, -50]], pan=0.35)
lay("hellscape", "hellscape-785700.mp3", 26, CUT, [[26, -30], [28, -21], [31, -45], [37, -24], [57.7, -20]], src=10, pan=-0.4)
lay("crackle", "crackle-588401.mp3", 26, CUT, [[26, -26], [31, -50], [37, -24], [57.7, -24]], src=20, pan=-0.3)
one("pain", "painscream-764370.mp3", 27.2, 3.6, -17, pan=0.25)
# memory (31-34): the party again, warm, slowed and far; phone (34-37): a quiet room tone + vibration (synth)
lay("memband", "band-257422.mp3", 31, 34.1, [[31, -40], [31.2, -15], [33.8, -16], [34.1, -60]], src=86, lp=2600, pan=0.2)
lay("memcrowd", "nycrowd-141253.mp3", 31, 34.1, [[31, -40], [31.2, -19], [34.1, -60]], src=60, lp=3000, pan=-0.3)
# water (37-43): the drop, the sizzle at ~41
one("drop", "drop-414104.mp3", 39.6, 2.2, -16, src=5)
one("sizzle", "sizzle-235597.mp3", 40.9, 2.4, -12)
one("steam", "steam-479295.mp3", 41.0, 2.0, -18, hp=600)
# heaven (43-49): the choir across the gap, far and bright
lay("heaven", "choirb-500862.mp3", 43, 49.6, [[43, -40], [43.8, -20], [47, -21], [49.6, -45]], hp=250)
lay("epiph", "epiphany-749740.mp3", 43.2, 48.5, [[43.2, -40], [44, -27], [48.5, -45]], src=2)
# devil (55-57.8): a deep quake under it
lay("quake", "quake-680510.mp3", 54.6, CUT, [[54.6, -40], [55.5, -18], [57.7, -14]], src=4, lp=400)
# 4. the blaze (58.4-63) and never (63-67)
lay("blaze", "fireroar-698209.mp3", 58.6, 67, [[58.6, -10], [62.6, -12], [64.2, -22], [66.3, -28], [67, -50]], src=87, pan=0.3)
lay("blaze2", "firelarge-483318.mp3", 58.6, 67, [[58.6, -14], [62.6, -16], [64.2, -26], [67, -50]], src=20, pan=-0.3)
lay("bscream", "crowdscream-459101.mp3", 58.7, 66, [[58.7, -16], [62, -20], [64, -32], [66, -45]], pan=-0.3)
lay("bwails", "wails-705709.mp3", 58.7, 67, [[58.7, -20], [62.6, -22], [64.5, -30], [66.3, -32], [67, -50]], src=120)
# accents on the cuts (earshot bank: whooshes peaking on the cut, a hit for the card)
for tc, p in [(9.0, 0.3), (18.0, 0), (26.0, -0.3), (31.0, 0.2), (34.0, -0.2), (37.0, 0.3), (43.0, 0), (49.0, -0.3), (55.0, 0.2)]:
    one(f"wh{tc}", "x-whdeep.wav", tc - 1.0, 1.6, -16, pan=p)
for tc in [8.04, 10.58]: one(f"wf{tc}", "x-whfast.wav", tc - 0.5, 0.8, -20)
for tc in [26.0, 37.0, 49.0]: one(f"rb{tc}", "x-rumble.wav", tc, 1.4, -20)
one("cardhit", "x-impdeep.wav", 67.0, 3.0, -14)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
