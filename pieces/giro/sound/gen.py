# gen.py: writes layers.json — the sound bed for giro (CC0 recordings + code layers from synth.py)
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
B, HUSH, HIT = 11.0, 60.5, 61.8

# 1. a busy city morning (0-11): street traffic, people, a horn now and then, a car passing below you
lay("street", f("traffic2", "0115cfba"), 0, 12.5, [[0, -40], [0.4, -15], [11, -15], [12.5, -26]], src=20)
lay("crowd", f("murmur", "9783c4b5"), 0, 11.6, [[0, -40], [0.4, -17], [11, -17], [11.6, -40]], hp=150)
lay("horns", f("horns", "6011c30a"), 0, 11.2, [[0, -40], [0.5, -26], [11, -26], [11.2, -40]], src=30, pan=0.4)
lay("pass", f("carpass", "32ddca2a"), 3.2, 8.5, [[3.2, -20], [8.5, -30]], loop=False, pan=-0.3)
lay("pass2", f("carpass", "bcb3560f"), 7.6, 11.0, [[7.6, -22], [11.0, -32]], loop=False, pan=0.3)
# 2. the brake (11): the ground lurches — quake, cracking, a crash, screams, alarms, dogs
lay("quake", f("rumble", "ca2edf84"), B, 17.5, [[B, -11], [13, -14], [17.5, -40]])
lay("crash", f("glass", "3ed51915"), B + 0.3, B + 3.5, [[B + 0.3, -12], [B + 3.5, -30]], loop=False, pan=0.3)
lay("smash", f("woodbreak", "6b55a812"), B + 0.15, B + 2.0, [[B + 0.15, -11], [B + 2.0, -30]], loop=False, pan=-0.3)
lay("scream", f("panic", "a222b1dc"), B + 0.4, 20, [[B + 0.4, -10], [15, -13], [19, -20], [20, -40]])
lay("alarm", f("alarm", "c5904ae8"), 12.2, 24, [[12.2, -21], [20, -24], [24, -40]], lp=3500, pan=0.5)
lay("alarm2", f("alarm", "342038c5"), 13.0, 22, [[13.0, -24], [22, -40]], lp=3000, pan=-0.5)
lay("dogs", f("bark", "489e6362"), 12.6, 20, [[12.6, -20], [20, -40]], pan=-0.4)
# 3. the wind comes and keeps rising into a wall of noise (17-60.8): recorded gales layered with the code wind wall
lay("wind1", f("wind", "bdf05a61"), 16.5, HUSH, [[16.5, -40], [19, -22], [30, -16], [45, -13], [HUSH, -12]], src=40, hp=80)
lay("wind2", f("gale", "ac153b09"), 20, HUSH, [[20, -40], [24, -22], [40, -15], [HUSH, -13]], src=10, hp=100)
lay("wind3", f("wind", "dffa67b8"), 27, HUSH, [[27, -40], [31, -20], [50, -14], [HUSH, -13]], src=60)
# debris, metal, glass, collapses (25-60.8)
for k, (cat, gid, tt, g) in enumerate([("glass", "a878655c", 26.0, -16), ("woodbreak", "ba4c5ab1", 29.5, -15), ("glass", "caaa372a", 33.2, -15), ("rumble", "aeed2fa9", 35.0, -14),
                                         ("glass", "07c4e075", 38.0, -15), ("woodbreak", "ba4c5ab1", 41.0, -14), ("rumble", "a2ee6837", 43.5, -14), ("glass", "522b0218", 46.0, -14), ("rumble", "32db03ce", 48.0, -13)]):
    lay(f"deb{k}", f(cat, gid), tt, min(tt + 4.5, HUSH), [[tt, g], [min(tt + 4.5, HUSH), -32]], loop=False, pan=0.4 if k % 2 else -0.4)
lay("collapse", f("rumble", "d07e6e1e"), 33, HUSH, [[33, -40], [36, -17], [50, -14], [HUSH, -13]], src=20, lp=500)
# the ocean coming (57-60.8): a rising roar of water under the wind
lay("water", f("falls", "55d8dda1"), 56.8, HUSH, [[56.8, -40], [58.5, -19], [HUSH, -15]])
lay("water2", f("surf", "9f3bbba0"), 57.0, HUSH, [[57.0, -40], [59, -19], [HUSH, -17]], src=5)
# 4. silence 60.8-61.8; THE HIT (61.8); under water; the end card's low tone
lay("hitw", f("falls", "55d8dda1"), HIT, HIT + 1.2, [[HIT, 4], [HIT + 0.4, -4], [HIT + 1.2, -30]], src=12)
lay("hitg", f("glass", "3ed51915"), HIT, HIT + 2.5, [[HIT, -4], [HIT + 2.5, -30]], loop=False)
lay("bubbles", f("bubbles", "be1cfee7"), HIT + 0.2, 63.0, [[HIT + 0.2, -16], [63.0, -40]], src=10, lp=1500)
K = 'audio/code/'
lay('c_brake', K + 'brake.wav', B, B + 4.0, [[B, -9], [B + 4.0, -9]], loop=False)
lay('c_wind', K + 'windwall.wav', 17.0, HUSH, [[17.0, -9], [55, -9], [HUSH, -11]], loop=False)
lay('c_debris', K + 'debris.wav', 20.0, HUSH, [[20.0, -11], [HUSH, -10]], loop=False)
lay('c_sonic', K + 'sonic.wav', 50.3, 53.3, [[50.3, -6], [53.3, -6]], loop=False)
lay('c_hit', K + 'hit.wav', HIT, HIT + 2.6, [[HIT, 4], [HIT + 2.6, 4]], loop=False)
lay('c_under', K + 'under.wav', HIT + 0.1, HIT + 1.5, [[HIT + 0.1, -10], [HIT + 1.5, -10]], loop=False)
lay('c_end', K + 'end.wav', 63.5, 69.9, [[63.5, -16], [69.9, -16]], loop=False)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
