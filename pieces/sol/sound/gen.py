# gen.py: writes layers.json — the recorded sound bed for sol (CC0 recordings + code layers from synth.py)
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
CUT = 11.0   # the blackout: every sound of the day stops dead

# 1. the plaza on a sunny afternoon (0-11): voices, gulls, the sea, the fountain, kids playing; the ticking countdown on top
lay("crowd", f("murmur", "9783c4b5"), 0, CUT, [[0, -40], [1.0, -15], [CUT, -15]], hp=150)
lay("kids", f("bell", "6d1d7fbd"), 0, CUT, [[0, -40], [0.5, -27], [CUT, -27]], src=30, hp=300, pan=0.3)
lay("gulls", f("gulls", "248c4a57"), 0, CUT, [[0, -40], [0.4, -16], [CUT, -17]], src=40, pan=-0.4)
lay("sea", f("lap", "df9d3b7c"), 0, CUT, [[0, -40], [0.4, -18], [CUT, -18]], pan=-0.2)
lay("fount", f("falls", "0c17d934"), 0, CUT, [[0, -40], [0.4, -17], [CUT, -17]], lp=6000)
# 2. after the silence (12-): screams, dogs, a car alarm, a far civil-defence siren, running feet; the fountain still runs
lay("scream", f("panic", "a222b1dc"), 11.9, 21, [[11.9, -9], [15, -12], [18.5, -18], [21, -40]])
lay("dogs", f("bark", "489e6362"), 12.4, 22, [[12.4, -17], [18, -20], [22, -40]], pan=-0.5)
lay("caralarm", f("alarm", "c5904ae8"), 12.8, 24, [[12.8, -22], [20, -24], [24, -40]], lp=3500, pan=0.6)
lay("siren", f("siren", "1c6e336c"), 13.5, 44.8, [[13.5, -40], [15, -24], [40, -26], [44.6, -28], [44.8, -60]], hp=200, lp=2500, pan=-0.3)
lay("run1", f("steps", "911314cd"), 11.7, 17.5, [[11.7, -16], [16, -20], [17.5, -40]], pan=0.3)
lay("run2", f("steps", "9a3e9d04"), 12.0, 17.0, [[12.0, -18], [17, -40]], pan=-0.4)
lay("fount2", f("falls", "0c17d934"), 12.0, 30, [[12.0, -24], [26.5, -24], [29.5, -45], [30, -60]], lp=4000)
lay("whisper", f("murmur", "7cafca84"), 18, 26, [[18, -40], [20, -26], [25, -27], [26, -40]], lp=900, hp=150)
# 3. the cold (25-): wind rising for the rest, your own breath close, the fountain cracking as it freezes
lay("wind", f("wind", "bdf05a61"), 19, 58.9, [[19, -40], [22, -28], [33, -20], [48, -16], [56, -17], [58.9, -18]], src=20, hp=120)
lay("breath", f("breath", "a218b3ce"), 25.5, 58.9, [[25.5, -40], [27, -23], [57, -22], [58.9, -24]], lp=3500)
for k, (cid, tt) in enumerate([("d0d5da51", 27.6), ("bf163725", 28.9), ("f0e06f5e", 30.2)]):
    lay(f"fcrack{k}", f("crack", cid), tt, tt + 2.0, [[tt, -13], [tt + 2.0, -30]], loop=False, pan=0.15 * (k - 1))
# 4. the sea freezes (33-42): a snowstorm wind, the long ice-crack recording, hulls creaking, a deep groan under it
lay("storm", f("gale", "5f97e977"), 33, 50, [[33, -40], [35, -19], [46, -17], [50, -40]], hp=100)
lay("seaice", f("crack", "a315897a"), 33.2, 42.5, [[33.2, -14], [41.5, -15], [42.5, -40]], src=10)
lay("hulls", f("creak", "9ce7abbd"), 36, 42, [[36, -19], [42, -30]], lp=2000, pan=0.4)
lay("groan", f("rumble", "d07e6e1e"), 33, 42.5, [[33, -40], [35, -17], [41, -17], [42.5, -40]], src=60, lp=220)
# 5. the grid fails (41.6-47.2), people round the oil-drum fires (42.2-52.5), murmurs by the fire
lay("fire", f("fire", "914bb44e"), 42.2, 53, [[42.2, -40], [43, -15], [51, -15], [52.5, -40], [53, -60]])
lay("firecrowd", f("murmur", "93fc7f6c"), 42.5, 52.5, [[42.5, -40], [44, -26], [51, -27], [52.5, -40]], lp=1200, hp=150)
# 6. one year (49-57): wind only, palms creaking under the ice
lay("palm1", f("creak", "dbb044d5"), 50.2, 52.4, [[50.2, -17], [52.4, -30]], loop=False, pan=-0.4)
lay("palm2", f("creak", "0c2109cb"), 54.1, 55.3, [[54.1, -17], [55.3, -30]], loop=False, pan=0.4)
# 7. silence 58.9-60; THE HIT (60.0): the frosted glass splits; then a low tail; the end card's faint wind
lay("ice_hit", f("crack", "8307d942"), 60.0, 61.2, [[60.0, 0], [61.2, -30]], loop=False)
lay("glass_hit", f("glass", "caaa372a"), 60.0, 64.0, [[60.0, -5], [64.0, -36]], loop=False)
lay("tail", f("rumble", "ca2edf84"), 60.0, 64.5, [[60.0, -4], [62, -14], [64.5, -40]], lp=300)
lay("end", f("wind", "d9773f1f"), 63.5, 69.95, [[63.5, -40], [64.5, -32], [69.5, -33], [69.95, -60]], lp=500)
# code-made layers (synth.py) for weight and the constant bed
K = 'audio/code/'
lay('c_tick', K + 'tick.wav', 5.0, 11.0, [[5.0, -12], [11.0, -12]], loop=False)
lay('c_out', K + 'out.wav', 11.0, 11.9, [[11.0, -8], [11.9, -8]], loop=False)
lay('c_drone', K + 'drone.wav', 12.0, 58.9, [[12.0, -11], [30, -10], [58.9, -10]], loop=False)
lay('c_ice', K + 'icesing.wav', 33.2, 42.7, [[33.2, -13], [42.7, -13]], loop=False)
lay('c_grid', K + 'grid.wav', 41.6, 48.0, [[41.6, -12], [48.0, -12]], loop=False)
lay('c_frost', K + 'frost.wav', 53.0, 58.9, [[53.0, -13], [58.9, -9]], loop=False)
lay('c_hit', K + 'hit.wav', 60.0, 63.2, [[60.0, 2], [63.2, 2]], loop=False)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
