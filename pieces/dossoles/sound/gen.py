# gen.py: writes layers.json — the sound bed for dossoles (CC0 recordings + code layers from synth.py). No music.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
E = 36.0
# the desert day: night crickets and coyotes fade into dawn birds and wind; the squeaking windmill all day; midday heat
lay("night", f("crickets", "965e8643"), 0, 10, [[0, -40], [0.4, -22], [6, -24], [10, -45]])
lay("coyote", f("coyote", "574b6d5e"), 0.5, 7.5, [[0.5, -30], [5, -30], [7.5, -45]], loop=False)
lay("dawn", f("deswind", "4527418b"), 4, 34.6, [[4, -45], [9, -22], [30, -22], [34.4, -26], [34.6, -80]])
lay("wind", f("deswind", "9e96e237"), 0, 34.6, [[0, -40], [2, -28], [24, -24], [34.4, -24], [34.6, -80]])
lay("mill", f("windmill", "f2d196bf"), 3, 34.6, [[3, -40], [5, -27], [34.4, -27], [34.6, -80]], src=10)
lay("bush", f("cicada", "ef0c80e5"), 20, 34.6, [[20, -40], [25, -28], [34.4, -26], [34.6, -80]], src=40)
# after the eclipse: the ranch quiet, wind back, the windmill; evening crickets and coyotes again
lay("wind2", f("deswind", "9e96e237"), E + 0.5, 68, [[E + 0.5, -45], [E + 3, -26], [62, -27], [68, -40]], src=10)
lay("mill2", f("windmill", "f2d196bf"), E + 2, 66, [[E + 2, -45], [E + 5, -29], [60, -29], [66, -45]], src=60)
lay("insects", f("deswind", "8c5e4a7c"), E + 4, 60, [[E + 4, -45], [E + 8, -27], [58, -28], [60, -40]])
lay("night2", f("crickets", "965e8643"), 58, 68, [[58, -45], [62, -24], [67.6, -24], [68, -45]], src=40)
lay("coyote2", f("coyote", "3d5255f7"), 61, 68, [[61, -32], [67.6, -32], [68, -45]], loop=False)
K = 'audio/code/'
lay('c_riseA', K + 'riseA.wav', 8.0, 17.0, [[8.0, -24], [17.0, -24]], loop=False)
lay('c_riseB', K + 'riseB.wav', 14.0, 23.0, [[14.0, -24], [23.0, -24]], loop=False)
lay('c_heat', K + 'heat.wav', 24.0, 34.6, [[24.0, -26], [34.5, -20], [34.6, -80]], loop=False)
lay('c_ecl', K + 'eclipse.wav', E, E + 9, [[E, -16], [E + 9, -16]], loop=False, hp=300)
lay('c_setB', K + 'setB.wav', 52.0, 58.0, [[52.0, -27], [58.0, -27]], loop=False)
lay('c_setA', K + 'setA.wav', 58.0, 64.0, [[58.0, -27], [64.0, -27]], loop=False)
lay('c_end', K + 'end.wav', 68.0, 76.0, [[68.0, -30], [76.0, -30]], loop=False)
json.dump(dict(duration_s=76.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
