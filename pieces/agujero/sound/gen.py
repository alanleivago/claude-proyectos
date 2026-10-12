# gen.py: writes layers.json — the recorded sound bed for agujero (all CC0 recordings)
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))

# 1. the hilltop at dusk -> night (0-13): crickets, a soft wind, the town far below, a dog, one bell
lay("crickets", f("crickets", "269a5307"), 0, 40, [[0, -40], [0.5, -12], [13, -12], [23, -16], [33, -24], [40, -40]], src=5)
lay("crickets2", f("crickets", "965e8643"), 0, 33, [[0, -40], [2, -22], [23, -26], [33, -40]], pan=-0.5)
lay("breeze", f("wind", "582e0d21"), 0, 23, [[0, -40], [0.5, -22], [13, -20], [23, -16]], src=30, lp=700)
lay("town", f("traffic", "dd85e3a5"), 0, 26, [[0, -40], [0.5, -26], [20, -26], [26, -40]], lp=1500, pan=0.2)
lay("dog", f("bark", "cf8b1abb"), 2.0, 14, [[2, -24], [14, -28]], loop=False, pan=0.5, lp=3000)
lay("bell", f("bell", "4c33c487"), 3.2, 12, [[3.2, -18], [12, -36]], loop=False, pan=-0.3, lp=2500)
# 2. the Moon is torn apart (5-13): a far rumble, enormous rock cracking very far away
lay("rumbleA", f("rumble", "d07e6e1e"), 5, 33, [[5, -40], [8, -16], [13, -12], [23, -10], [33, -8]], src=15, lp=220)
lay("cracksA", f("crack", "a315897a"), 7, 13.5, [[7, -40], [9, -22], [12, -20], [13.5, -40]], lp=1200, pan=0.4)
# 3. the disk ignites (13-23): the hum grows, the wind rises
lay("hum", f("rumble", "d07e6e1e"), 13, 61, [[13, -40], [18, -16], [23, -12], [33, -9], [43, -6], [53, -6], [60.5, -10], [61, -60]], src=60, lp=140)
lay("wind", f("wind", "582e0d21"), 18, 61, [[18, -40], [23, -18], [33, -13], [43, -12], [53, -11], [60, -15], [61, -60]], src=90)
# 4. the pull (23-33): gusts, dogs, car alarms, the town's voices, the grid failing
lay("gusts", f("wind", "bdf05a61"), 23, 61, [[23, -40], [26, -16], [33, -12], [53, -10], [61, -60]], src=5, pan=0.4)
lay("dogs", f("bark", "489e6362"), 24, 38, [[24, -18], [38, -26]], pan=-0.3, lp=3500)
lay("alarm1", f("alarm", "c5904ae8"), 26, 50, [[26, -26], [50, -30]], pan=-0.6, lp=2500)
lay("alarm2", f("alarm", "342038c5"), 28.5, 50, [[28.5, -30], [50, -34]], lp=2000, pan=0.55)
lay("crowd", f("murmur", "7cafca84"), 25, 40, [[25, -40], [28, -24], [38, -26], [40, -40]], lp=2500, pan=0.2)
lay("panic", f("panic", "a222b1dc"), 30, 45, [[30, -40], [33, -26], [43, -28], [45, -40]], lp=2200)
# 5. everything loose falls upwards (33-43): trees creaking and tearing, rocks, the wind roaring past as you lift
lay("creak", f("rope", "c96b9b23"), 33, 46, [[33, -40], [35, -14], [43, -14], [46, -30]], pan=-0.3)
lay("creak2", f("rope", "47943714"), 34, 46, [[34, -40], [36, -18], [46, -30]], pan=0.4)
lay("quake", f("rumble", "ca2edf84"), 34, 56, [[34, -40], [38, -14], [46, -10], [53, -11], [56, -30]])
lay("roarwind", f("wind", "dffa67b8"), 36, 61, [[36, -40], [40, -15], [53, -11], [60, -15], [61, -60]], src=20)
# 6. the Earth is next (43-53): the crust cracks, lava hisses and crackles, houses tear free (glass, timber)
lay("lava", f("fire", "914bb44e"), 41, 56, [[41, -40], [44, -14], [53, -13], [56, -30]])
lay("lava2", f("fire", "57f83b58"), 42, 56, [[42, -40], [45, -16], [56, -30]], src=60, pan=0.4)
lay("deep", f("falls", "55d8dda1"), 43, 61, [[43, -40], [46, -16], [53, -13], [60, -15], [61, -60]], lp=500)
for k, (gid, t) in enumerate([("3ed51915", 41.2), ("caaa372a", 43.0), ("a878655c", 44.6), ("07c4e075", 46.3), ("522b0218", 48.1), ("3ed51915", 50.0)]):
    lay(f"glass{k}", f("glass", gid), t, t + 2.4, [[t, -20], [t + 2.4, -36]], loop=False, lp=4000, pan=0.5 if k % 2 else -0.5)
# 7. climbing through the clouds (53-61): the roar thins as you rise; silence 61-62.5
# 8. THE HIT (62.5): a burst under the hit (so the mixer sizes it as the loudest), then a long low tail into the end card
lay("burst", f("falls", "55d8dda1"), 62.5, 63.4, [[62.5, 10], [62.9, 2], [63.4, -30]], src=10)
lay("tail", f("rumble", "d07e6e1e"), 62.5, 69.9, [[62.5, -2], [64.5, -14], [69.9, -40]], src=40, lp=260)
lay("end", f("wind", "582e0d21"), 64, 69.95, [[64, -40], [65, -30], [69.5, -32], [69.95, -60]], src=120, lp=400)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
