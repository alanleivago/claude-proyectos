# gen.py: writes layers.json — the recorded sound bed for oxigeno (all CC0 recordings)
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))

# 1. the café terrace at golden hour (0-5): voices, glasses, gulls, the sea below, boat engines
lay("crowd", f("murmur", "7cafca84"), 0, 5.2, [[0, -40], [0.4, -12], [5.0, -12], [5.2, -40]], hp=150)
lay("crowd2", f("murmur", "93fc7f6c"), 0, 5.2, [[0, -40], [0.4, -16], [5.2, -40]], hp=150, pan=0.4)
lay("clink1", f("clink", "e25560ac"), 1.2, 3.5, [[1.2, -14], [3.5, -30]], loop=False, pan=0.35)
lay("clink2", f("clink", "e98d27d0"), 2.8, 5.0, [[2.8, -16], [5.0, -40]], loop=False, pan=-0.3)
lay("gulls", f("gulls", "248c4a57"), 0, 5.2, [[0, -40], [0.4, -14], [5.2, -40]], src=12, pan=-0.4)
lay("sea", f("lap", "df9d3b7c"), 0, 17.5, [[0, -40], [0.4, -16], [5, -16], [5.2, -26], [17.5, -26]], pan=-0.2)
lay("boat1", f("motorboat", "4afc821c"), 0, 16.0, [[0, -40], [0.4, -18], [13.4, -18], [15.8, -40]], pan=0.4)
lay("boat2", f("motorboat", "6fc93951"), 0, 16.0, [[0, -40], [0.4, -22], [13.4, -22], [15.8, -40]], pan=-0.5)
lay("pit", f("fire", "914bb44e"), 0, 11.2, [[0, -40], [0.4, -16], [11.0, -16], [11.2, -60]], pan=-0.15)
# 2. the oxygen goes (5.0): a dull pressure thump (cue), then everything heard as through water: muffled + a ringing
lay("muffle", f("muffle", "44742ad5"), 5.0, 37.6, [[5.0, -14], [6.5, -18], [17, -20], [37.6, -22]], lp=700)
lay("ring", f("tinnitus", "3dc9eb64"), 5.05, 14, [[5.05, -18], [7, -22], [14, -40]], lp=6000)
lay("crowd_m", f("murmur", "7cafca84"), 5.2, 17, [[5.2, -18], [9, -24], [17, -40]], lp=500, hp=150)
# 3. fires out (11), engines die (13.4-15.8): the fire hisses out; the engines are heard muffled, slowing
lay("hiss", f("fizz", "47f7e118"), 10.9, 13.5, [[10.9, -14], [11.4, -16], [13.5, -40]], pan=-0.15)
# 4. the sea turns to hydrogen (17.5-27): a vast hiss and boil, water draining, hulls settling
lay("boil", f("fizz", "308a6547"), 17.5, 30, [[17.5, -40], [19, -10], [24, -8], [27.5, -14], [30, -40]], lp=3000)
lay("drain", f("drain", "8465ef8b"), 18, 28, [[18, -40], [20, -12], [26, -14], [28, -40]], src=15, lp=1200)
lay("rumble", f("rumble", "d07e6e1e"), 17.5, 53, [[17.5, -40], [20, -16], [27, -12], [37, -10], [45, -10], [53, -13]], src=15, lp=400)
# 5. glass and concrete crumble (27-37): crunching, glass, timber, distant collapses — all muffled (thin air)
lay("crunch", f("woodbreak", "90ad0317"), 27, 38, [[27, -40], [29, -14], [36, -13], [38, -30]], lp=1600)
for k, (gid, tt) in enumerate([("3ed51915", 27.6), ("caaa372a", 29.0), ("a878655c", 30.6), ("07c4e075", 32.1), ("522b0218", 33.9), ("3ed51915", 35.4)]):
    lay(f"glass{k}", f("glass", gid), tt, tt + 2.4, [[tt, -17], [tt + 2.4, -32]], loop=False, lp=2600, pan=0.5 if k % 2 else -0.5)
lay("quake", f("rumble", "ca2edf84"), 30, 40, [[30, -40], [33, -13], [38, -11], [40, -22]], lp=600)
# 6. the terrace gives way (37.6): a big timber crack, then the fall: rushing air, debris
lay("break", f("woodbreak", "ba4c5ab1"), 37.2, 44.4, [[37.2, -10], [40, -16], [44.4, -40]], loop=False)
lay("break2", f("woodbreak", "93438db4"), 37.5, 41.0, [[37.5, -14], [41, -32]], loop=False, pan=0.3)
lay("fallwind", f("wind", "dffa67b8"), 37.6, 53.0, [[37.6, -40], [39, -12], [47, -10], [52.5, -14], [53.0, -60]], src=20, lp=1800)
lay("debris", f("woodbreak", "90ad0317"), 38, 52, [[38, -40], [40, -18], [50, -22], [52, -40]], src=40, lp=1400, pan=-0.2)
# 7. silence 53-55; THE HIT (55): a burst under it, then the roar of the hydrogen burning, long tail
lay("burst", f("falls", "55d8dda1"), 55.0, 55.9, [[55.0, 10], [55.4, 2], [55.9, -30]], src=10)
lay("fire", f("flame", "0c4714cb"), 55.0, 63.0, [[55.0, -6], [57, -8], [61, -14], [63, -40]], src=2)
lay("fire2", f("flame", "c112a03e"), 55.0, 63.0, [[55.0, -8], [58, -10], [63, -40]], src=40, pan=0.3)
lay("tail", f("rumble", "d07e6e1e"), 55.0, 66.5, [[55.0, -2], [58, -10], [66.5, -40]], src=40, lp=260)
lay("end", f("wind", "582e0d21"), 64, 69.95, [[64, -40], [65, -30], [69.5, -32], [69.95, -60]], src=120, lp=400)
# code-made layers (synth.py), under and around the recordings for weight
K = 'audio/code/'
lay('c_pop', K + 'pop.wav', 4.55, 6.6, [[4.55, -8], [6.6, -8]], loop=False)
lay('c_ring', K + 'ring.wav', 5.05, 14.0, [[5.05, -22], [14.0, -30]], loop=False)
lay('c_breath', K + 'breath.wav', 5.2, 53.2, [[5.2, -9], [36, -10], [53.2, -9]], loop=False)
lay('c_collapse', K + 'collapse.wav', 27.0, 37.5, [[27.0, -9], [37.5, -9]], loop=False)
lay('c_floor', K + 'floor.wav', 34.4, 39.0, [[34.4, -8], [39.0, -8]], loop=False)
lay('c_rise', K + 'rise.wav', 50.0, 52.95, [[50.0, -8], [52.95, -8]], loop=False)
lay('c_blast', K + 'blast.wav', 55.0, 62.5, [[55.0, 2], [62.5, 2]], loop=False)
lay('c_crack', K + 'crack.wav', 59.5, 61.7, [[59.5, -6], [61.7, -6]], loop=False)
lay('glasshit', f('glass', '07c4e075'), 59.5, 62.0, [[59.5, -8], [62.0, -24]], loop=False)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
