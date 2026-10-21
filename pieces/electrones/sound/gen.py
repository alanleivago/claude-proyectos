# gen.py: writes layers.json — the sound bed for electrones (CC0 recordings + code layers from synth.py). No music.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
G, B, BOOM = 10.0, 56.0, 61.4
cut = lambda db: [[0, -40], [0.4, db], [G - 0.12, db], [G, -80]]
# 1. the rooftop at sunset (0-10): the city below, friends talking and laughing, the grill crackling
lay("city", f("cityeve", "2165dddd"), 0, G, cut(-24), src=20)
lay("talk", f("park", "fcb2a873"), 0, G, cut(-26), src=4)
lay("murmur", f("murmur", "93fc7f6c"), 0, G, cut(-30))
lay("grill", f("fire", "166449d3"), 0, G, cut(-29), hp=1500)
lay("traffic", f("traffic", "c3575018"), 0, G, cut(-31), lp=1200, src=60)
# 2. without electrons (10-56): silence of the city; electricity crackle when the charges repel
lay("buzz", f("crackle", "8f663384"), 27.2, 34.0, [[27.2, -45], [30, -30], [34, -24]], hp=800)
lay("buzz2", f("crackle", "7a88c062"), 33.0, 41.0, [[33.0, -40], [36, -24], [40.6, -20], [41.0, -60]], hp=800)
lay("xfrm", f("crackle", "d3526c86"), 41.0, 55.9, [[41.0, -40], [43, -30], [55.5, -28], [55.9, -80]], lp=400)
K = 'audio/code/'
lay('c_ticks', K + 'ticks.wav', 4.0, 10.2, [[4.0, -24], [10.2, -24]], loop=False)
lay('c_inv', K + 'inversion.wav', 9.4, 13.0, [[9.4, -27], [13.0, -27]], loop=False)
lay('c_drone', K + 'drone.wav', G, 27.5, [[G, -21], [27.0, -21], [27.5, -30]], loop=False)
lay('c_pings', K + 'pings.wav', G, 27.0, [[G, -32], [27.0, -32]], loop=False)
lay('c_burst', K + 'burst.wav', 27.0, 41.0, [[27.0, -30], [40.4, -21], [41.0, -40]], loop=False)
lay('c_glow', K + 'glow.wav', 41.0, 56.0, [[41.0, -24], [53, -22], [55.9, -26], [56.0, -80]], loop=False)
lay('c_fall', K + 'fallwhoosh.wav', 50.0, 53.4, [[50.0, -22], [53.4, -22]], loop=False)
lay('c_elec', K + 'electrons.wav', B, B + 4.6, [[B, -20], [B + 4.6, -22]], loop=False)
lay('c_bloom', K + 'returnbloom.wav', BOOM, BOOM + 3.0, [[BOOM, -13], [BOOM + 3.0, -14]], loop=False, hp=650)
lay('c_tail', K + 'glow.wav', BOOM + 1.0, 66.0, [[BOOM + 1.0, -40], [BOOM + 1.6, -16], [65.4, -19], [66.0, -50]], loop=False, hp=450)
lay('c_end', K + 'end.wav', 66.0, 75.0, [[66.0, -30], [75.0, -30]], loop=False)
json.dump(dict(duration_s=75.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
