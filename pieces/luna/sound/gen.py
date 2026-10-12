# gen.py: writes layers.json (recorded ambience bed for luna) from the story timeline + meteors.json
import json, math
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))

# wind: the only layer left in the split pause (33.95-38.0)
lay("wind", f("wind", "582e0d21"), 0, 62.42, [[0, -40], [1.5, -18], [16, -15], [33.9, -14], [38, -13], [48, -10], [62.4, -4]], src=30, lp=6000)
lay("gusts", f("wind", "bdf05a61"), 5, 62.42, [[5, -40], [7, -20], [34, -18], [48, -12], [62.4, -8]], src=5, pan=0.4)
# 1. sleeping town (0-5) and the night until the cracks
lay("crickets", f("crickets", "269a5307"), 0, 33.95, [[0, -40], [0.5, -14], [16, -16], [26, -20], [33.9, -24]], src=5)
lay("crickets2", f("crickets", "965e8643"), 0, 33.95, [[0, -40], [0.5, -24], [26, -28], [33.9, -32]], pan=-0.5)
lay("sea", f("lap", "df9d3b7c"), 0, 33.95, [[0, -40], [0.6, -12], [16, -12], [26, -10], [33.9, -12]])
lay("sea2", f("surf", "3ffaa3c2"), 0, 33.95, [[0, -40], [0.6, -16], [16, -14], [33.9, -12]], src=5, pan=-0.2)
lay("dog_far", f("bark", "cf8b1abb"), 1.0, 16, [[1, -18], [16, -22]], src=0, loop=False, pan=-0.6)
lay("bell1", f("bell", "4c33c487"), 0.9, 6.5, [[0.9, -16], [6.5, -30]], loop=False, pan=-0.35)
lay("bell2", f("bell", "4c33c487"), 3.6, 9.0, [[3.6, -18], [9, -32]], loop=False, pan=-0.35)
# 2. the Moon is falling (5-16): shutters, murmur and gasps, a voice through a window, cars
lay("shutters", f("shutter", "d1741c76"), 5.3, 16.5, [[5.3, -14], [16.5, -18]], src=2, pan=0.3)
lay("shutters2", f("shutter", "2ee39268"), 6.0, 16.5, [[6, -18], [16.5, -22]], pan=-0.5)
lay("gasps", f("murmur", "526fed3a"), 6.5, 24.5, [[6.5, -40], [8, -16], [16, -14], [24.5, -22]], src=6, hp=150)
lay("murmur", f("murmur", "7cafca84"), 8, 33.95, [[8, -40], [11, -18], [16, -14], [26, -14], [33.9, -14]], hp=150)
lay("voice_win", f("tv", "04af4161"), 5.3, 26, [[5.3, -40], [6, -24], [16, -24], [26, -34]], lp=2200, hp=300, pan=-0.55)
lay("car1", f("carpass", "bcb3560f"), 6.1, 15.0, [[6.1, -12], [15, -12]], loop=False, pan=0.2)
lay("car2", f("carpass", "32ddca2a"), 13.6, 19.0, [[13.6, -18], [19, -18]], loop=False, pan=-0.3)
lay("barks", f("bark", "489e6362"), 6.4, 16.0, [[6.4, -16], [16, -20]], loop=False, pan=0.6)
# 3. the tide (16-26): the sea swelling, slaps on the wall, ropes, water over the quay
lay("swell", f("surf", "9f3bbba0"), 15.5, 33.95, [[15.5, -40], [22, -10], [26, -7], [33.9, -7]])
lay("ropes", f("rope", "47943714"), 16.5, 33.95, [[16.5, -40], [18, -16], [33.9, -16]], pan=0.4)
lay("overflow", f("rapids", "2791b267"), 22, 33.95, [[22, -40], [24, -16], [33.9, -14]], pan=-0.2)
# 4. the cracks (26-34): deep rumble, enormous rock cracking far away
lay("rumble", f("rumble", "d07e6e1e"), 25.5, 33.95, [[25.5, -40], [30, -4], [33.9, -3]], src=15)
lay("cracks", f("crack", "a315897a"), 26.4, 33.95, [[26.4, -30], [30, -14], [33.9, -8]], lp=2500, pan=0.15)
# 6. the fragments (38-48): fire, alarms, dogs, panic; whoosh + delayed boom per fragment (below)
lay("rumble2", f("rumble", "d07e6e1e"), 38.0, 62.42, [[38, -30], [39.5, -6], [48, -9], [52, -9], [56, -3], [62.4, 4]], src=40)
lay("sea3", f("surf", "9f3bbba0"), 38.0, 48.6, [[38, -30], [39.5, -10], [48.6, -16]], src=20)
lay("fire", f("fire", "914bb44e"), 39, 62.42, [[39, -40], [43, -14], [56, -12], [62.4, -10]])
lay("fire2", f("fire", "57f83b58"), 41, 62.42, [[41, -40], [44, -18], [62.4, -14]], src=60, pan=0.5)
lay("alarm1", f("alarm", "c5904ae8"), 40.6, 62.0, [[40.6, -16], [62, -16]], pan=-0.6)
lay("alarm2", f("alarm", "342038c5"), 42.1, 62.0, [[42.1, -24], [62, -24]], lp=3000, pan=0.55)
lay("alarm3", f("alarm", "f7e1fcac"), 44.3, 62.0, [[44.3, -26], [62, -26]], lp=2500, pan=0.2)
lay("dogs", f("bark", "489e6362"), 38.6, 52, [[38.6, -14], [52, -20]], pan=-0.3)
lay("dogs2", f("bark", "f3344937"), 39.5, 52, [[39.5, -18], [52, -24]], pan=0.6)
lay("panic", f("panic", "a222b1dc"), 38.3, 56, [[38.3, -40], [40, -11], [48, -13], [56, -24]], lp=6000)
# 7. the sea pulls back (48.6-56): suction, gurgles, a siren, the roar
lay("drain", f("drain", "8465ef8b"), 48.4, 57, [[48.4, -40], [50, -13], [53.5, -11], [56, -16], [57, -40]], src=15)
lay("drain2", f("drain", "cde510c9"), 49, 56.5, [[49, -40], [50.5, -14], [56.5, -30]], pan=0.4)
lay("siren", f("siren", "8429e2d6"), 49.6, 62.42, [[49.6, -40], [51.5, -8], [56, -6], [62.4, -4]], src=3, lp=5000, pan=-0.45)
lay("roar", f("surf", "6bc8401a"), 50, 62.42, [[50, -40], [53, -12], [56, -8], [60, -4], [62.4, 0]])
# 8. the wave (56-62.42)
lay("niagara", f("falls", "55d8dda1"), 56, 62.42, [[56, -40], [56.6, -4], [60, -1], [62.4, 4]])
lay("rapids", f("rapids", "d613f646"), 59.5, 62.42, [[59.5, -30], [61, -2], [62.4, 4]])
lay("burst", f("falls", "55d8dda1"), 63.0, 63.85, [[63, 10], [63.4, 3], [63.85, -30]], src=10)
# 10. end card (66-70): muffled bubbles, faint wind
lay("under", f("bubbles", "be1cfee7"), 66, 69.95, [[66, -40], [66.8, -8], [69, -10], [69.9, -40]], src=10, lp=900)
lay("wind_end", f("wind", "582e0d21"), 66, 69.95, [[66, -40], [67, -26], [69.9, -40]], src=90, lp=700)

# the 45 fragments: a falling fire-whoosh, then a delayed distant explosion (light travel + distance)
W = [f("meteor", "0b641901"), f("meteor", "dc1a076b")]
B = [f("explo", "1e423780"), f("explo", "4ed3143d"), f("explo", "f6575711"), f("explo", "572bddbe")]
for i, m in enumerate(json.load(open("meteors.json"))):
    if m["ocean"]: continue                                   # the ocean strike is a cue in cues.json
    gw = max(-24, min(-8, -14 + 8 * math.log10(m["s"])))
    lay(f"whoosh{i}", W[i % 2], m["t0"], m["t0"] + m["dur"] + 0.4, [[m["t0"], gw], [m["t0"] + m["dur"] + 0.4, gw - 6]], loop=False, pan=round(m["panS"] * 0.6, 2))
    tb = m["ti"] + 0.25 + m["Di"] / 12000
    gb = max(-26, min(-9, -12 + 20 * math.log10(m["s"] * 9000 / m["Di"])))
    lay(f"boom{i}", B[i % 4], tb, tb + 4.5, [[tb, gb], [tb + 4.5, gb - 10]], loop=False, pan=round(m["panI"], 2))
# the split: nothing but wind/gusts between 33.95 and 38.0 (layers above end at 33.95 or start at 38)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
