# gen.py: writes layers.json — the sound bed for papel (Freesound CC0 previews in lib/, earshot bank accents x-*.wav; CREDITS.md).
import json
R = "lib/"
F = json.load(open("folds.json"))          # [n, landing time, swing duration]
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
def one(id, file, t, d, db, src=0, **o): lay(id, file, t, t + d, [[t, db], [t + d, db]], loop=False, src=src, **o)
CUT = 61.5   # black silence before the universe at 62.0
# 1. the studio (0-19): room tone, the city through the glass, paper in hand
lay("room", "roomtone-149428.mp3", 0, 15.8, [[0, -22], [14.3, -22], [15.8, -45]], src=10, lp=6000)
lay("cityin", "cityeve-708019.mp3", 0, 15.8, [[0, -26], [14, -26], [15.8, -40]], src=20, lp=3500, pan=-0.3)
lay("hands", "papersheets-450043.mp3", 0, 4.2, [[0, -30], [0.2, -24], [3.8, -26], [4.2, -45]], src=2)
# a real crease on each fold at the desk (folds 1-14), one of seven takes, lower as the stack gets thick
TAKES = [("crease-705165.mp3", 2.008, 1.9), ("crease-705165.mp3", 5.933, 1.9), ("paperhandle-456769.mp3", 5.757, 1.3), ("crease-705165.mp3", 21.407, 1.55),
         ("paperhandle-456769.mp3", 13.593, 1.9), ("crease-705165.mp3", 0.643, 1.25), ("paperhandle-456769.mp3", 11.724, 1.85)]
for n, tl, d in F[1:15]:
    f, s, du = TAKES[n % 7]; one(f"crease{n}", f, max(0, tl - d - 0.15), min(du, 1.2), -14 - 0.4 * n, src=s, pan=0.1 * ((n % 3) - 1))
# the ceiling breaks (14.42), debris; out into the wind (15.6)
one("ceiling", "x-ceiling.wav", 14.38, 1.3, -10)
one("debris", "papersheets-450043.mp3", 14.5, 2.0, -20, src=10, hp=800)
lay("wind", "highwind-570890.mp3", 15.4, 29.6, [[15.4, -40], [16.2, -20], [25, -18], [28.6, -20], [29.6, -45]])
lay("cityout", "cityeve-708019.mp3", 15.6, 25, [[15.6, -40], [16.4, -26], [22, -30], [25, -45]], src=60, pan=0.2)
# folds 15-29 outdoors: deep whooshes peaking on each landing
for n, tl, d in F[15:30]: one(f"whd{n}", "x-whdeep.wav", tl - 0.8, 1.2, -19 + 0.15 * (n - 15), pan=0.15 * ((n % 3) - 1))
# the airliner (clouds)
one("plane", "airliner-235956.mp3", 25.6, 4.0, -18, src=4, pan=-0.4)
one("jet", "jet-251962.mp3", 26.0, 3.2, -24, src=8, pan=0.3, lp=4000)
# 3. space (29-61.5): the station hum, then the dark cosmos; folds as sub pulses, accelerating; a riser into the cut
lay("station", "station-686237.mp3", 29.2, 40, [[29.2, -40], [30.2, -24], [38, -26], [40, -40]], src=10)
lay("dark", "darkatmo-583590.mp3", 37, CUT, [[37, -40], [39, -27], [55, -25], [61.4, -22]], src=20)
lay("deep", "deepdrone-854838.mp3", 44, CUT, [[44, -40], [46, -31], [61.4, -25]], src=60, pan=0.2)
for n, tl, d in F[30:53]: one(f"whs{n}", "x-whfast.wav", tl - 0.4, 0.6, -24 + 0.1 * (n - 30), pan=0.2 * ((n % 3) - 1))
for n, tl, d in F[30:103]: one(f"sub{n}", "x-sub.wav", tl, 0.28, -24 if n < 53 else -27 + 3 * (n - 53) / 50)
lay("riser", "riser45-649825.mp3", 52.0, CUT, [[52, -40], [56, -26], [61.4, -17]], src=0)
# 4. the universe (62): the hit + a long cosmic swell; 5. the record (66-68): the room at night, one small crease
one("uhit", "x-impdeep.wav", 62.0, 4.0, -8)
one("uboom", "riserhit-822419.mp3", 61.99, 3.0, -12, src=4.27)
lay("cosmos", "deepdrone-854838.mp3", 62.1, 66.1, [[62.1, -30], [63, -20], [65.6, -22], [66.1, -50]], src=150)
lay("night", "roomtone-149428.mp3", 66.0, 68.0, [[66.0, -40], [66.3, -28], [67.8, -30], [68.0, -50]], src=60, lp=5000)
one("wad", "crease-705165.mp3", 66.5, 1.0, -22, src=10.435)
one("card", "x-impdeep.wav", 68.0, 2.0, -13)
for tc, p in [(4.0, 0.2), (10.0, -0.2), (14.0, 0.2), (19.0, 0), (25.0, -0.3), (29.0, 0.3), (33.0, 0), (38.0, -0.2), (44.0, 0.2), (48.0, 0), (53.0, -0.2), (57.0, 0.2), (66.0, 0)]:
    one(f"cut{tc}", "x-whdeep.wav", tc - 0.8, 1.2, -17, pan=p)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
