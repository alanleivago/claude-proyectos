# gen.py: writes layers.json — the sound bed for tesla (CC0 recordings + code layers from synth.py). No music.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
def amb(id, file, t0, t1, db, **o): lay(id, file, t0, t1, [[t0, -40], [t0 + 0.3, db], [t1 - 0.3, db], [t1, -40]], **o)
# 1. the street at dawn (0-14): birds, a quiet suburb; the garage door; a dog; the neighbours gasp
amb("morning", f("suburbmorn", "378c302e"), 0, 14.0, -21, src=30)
lay("birds", f("birds", "98041fcc"), 0, 14.0, [[0, -40], [0.3, -25], [13.7, -25], [14.0, -40]])
lay("gdoor", f("garagedoor", "f4fbd5e8"), 0.6, 5.0, [[0.6, -18], [4.6, -18], [5.0, -40]], loop=False)
lay("bark", f("bark", "e5dfe81e"), 5.6, 7.4, [[5.6, -27], [7.4, -27]], loop=False)
lay("gasp", f("murmur", "526fed3a"), 9.0, 11.5, [[9.0, -40], [9.3, -26], [11.5, -40]], src=3)
# 2. the jam (14-22): horns and a busy avenue; people shout when you fly over
amb("city", f("jamhorns", "71543a40"), 14.0, 22.0, -18, src=10)
lay("horns", f("jamhorns", "95e41e58"), 14.0, 17.0, [[14.0, -40], [14.4, -22], [16.6, -22], [17.0, -40]], src=5)
lay("crowd", f("panic", "a222b1dc"), 17.3, 20.0, [[17.3, -40], [17.6, -30], [20.0, -40]])
# 3. the towers (22-32): the city far below, wind past the car
amb("city2", f("jamhorns", "71543a40"), 22.0, 32.0, -28, src=40, lp=1500)
amb("wind", f("wind", "c0b32166"), 22.0, 40.0, -22)
K = 'audio/code/'
lay('c_wake', K + 'wake.wav', 6.6, 8.6, [[6.6, -20], [8.6, -20]], loop=False)
lay('c_launch', K + 'launch.wav', 8.6, 14.0, [[8.6, -14], [14.0, -14]], loop=False)
lay('c_gas1', K + 'gas.wav', 16.9, 19.3, [[16.9, -15], [19.3, -15]], loop=False)
lay('c_land', K + 'land.wav', 19.4, 20.2, [[19.4, -15], [20.2, -15]], loop=False)
lay('c_gas2', K + 'gas.wav', 20.2, 22.6, [[20.2, -16], [22.6, -16]], loop=False)
for k, tt in enumerate([23.6, 26.2, 28.8, 30.9]): lay(f'c_wh{k}', K + 'whoosh.wav', tt, tt + 1.6, [[tt, -17], [tt + 1.6, -17]], loop=False)
lay('c_gas3', K + 'gas.wav', 32.0, 34.4, [[32.0, -20], [34.4, -20]], loop=False)
lay('c_climb', K + 'climb.wav', 32.0, 50.0, [[32.0, -18], [40, -16], [46, -22], [49.6, -30], [50.0, -80]], loop=False)
lay('c_cabin', K + 'cabin.wav', 50.9, 66.0, [[50.9, -26], [65.6, -24], [66.0, -60]], loop=False)
lay('c_star', K + 'starman.wav', 51.0, 60.0, [[51.0, -15], [60.0, -13]], loop=False, hp=420)
lay('c_end', K + 'end.wav', 66.0, 75.0, [[66.0, -32], [75.0, -32]], loop=False)
json.dump(dict(duration_s=75.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
