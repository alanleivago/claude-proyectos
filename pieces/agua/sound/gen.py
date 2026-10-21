# gen.py: writes layers.json — the sound bed for agua (CC0 recordings + code layers from synth.py). No music.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
G, B, HIT = 9.0, 56.5, 58.7
cut = lambda db: [[0, -40], [0.4, db], [G - 0.12, db], [G, -80]]
# 1. the promenade (0-9): gulls over the harbour, water lapping at the seawall, the sea, the fountain behind, people, kids, leaves, sparrows
lay("gulls", f("seagull", "84d6ed5c"), 0, G, cut(-21), src=8)
lay("lapwall", f("lap", "df9d3b7c"), 0, G, cut(-22))
lay("sea", f("ocean", "bec31077"), 0, G, cut(-27), src=20)
lay("fount", f("fountain", "2a34f1c3"), 0, G, cut(-25), src=4)
lay("talk", f("park", "fcb2a873"), 0, G, cut(-28), src=10)
lay("kids", f("kids", "997ecd4b"), 0, G, cut(-31), src=40)
lay("leaves", f("leaves", "4a62b938"), 0, G, cut(-31), src=30)
lay("birds", f("birds", "98041fcc"), 0, G, cut(-31))
lay("steps", f("steps", "e160926c"), 0, G, cut(-34))
# 2. without water (9-56): almost nothing: a far, smeared wind in the leaves and a faint ringing
lay("dryair", f("leaves", "4a62b938"), G, 56.0, [[G, -60], [G + 1.5, -37], [55.0, -35], [55.95, -80]], lp=700, src=60)
lay("ring", f("tinnitus", "4e384d3a"), G + 0.6, 56.0, [[G + 0.6, -55], [G + 3, -44], [55.0, -40], [55.95, -80]], lp=6000)
# 3. the sea comes back (56.5): the water rushing in, the breaker crashing into the wall, spray, the flooded promenade, people screaming, the dog
lay("rush", f("flood", "0f83f23e"), B, 64.0, [[B, -30], [HIT - 0.2, -16], [HIT + 1.0, -18], [63.5, -24], [64.0, -40]], src=10, hp=260)
lay("crash", f("wavecrash", "039fc124"), HIT - 0.3, 64.0, [[HIT - 0.3, -26], [HIT, -13], [HIT + 2.5, -18], [63.6, -24], [64.0, -40]], src=12, hp=260)
lay("groyne", f("splash", "01522247"), HIT - 0.1, 64.0, [[HIT - 0.1, -22], [HIT + 0.3, -15], [63.6, -24], [64.0, -40]], src=30, hp=260)
lay("gulls2", f("seagull", "6d2d138c"), HIT + 0.4, 64.0, [[HIT + 0.4, -40], [HIT + 1.5, -24], [63.6, -25], [64.0, -40]], src=20)
lay("scream", f("panic", "a222b1dc"), HIT + 0.2, 63.6, [[HIT + 0.2, -40], [HIT + 0.7, -23], [62.5, -26], [63.6, -40]])
lay("bark", f("bark", "489e6362"), HIT + 0.8, 63.0, [[HIT + 0.8, -29], [63.0, -31]], loop=False)
lay("sea2", f("ocean", "bec31077"), 60.0, 64.0, [[60.0, -40], [61.5, -24], [63.6, -24], [64.0, -40]], src=60)
K = 'audio/code/'
lay('c_ticks', K + 'ticks.wav', 0.0, 9.3, [[0.0, -24], [9.3, -24]], loop=False)
lay('c_vanish', K + 'vanish.wav', 8.4, 11.4, [[8.4, -26], [11.4, -26]], loop=False)
lay('c_drone', K + 'drone.wav', G, 56.0, [[G, -21], [30, -21], [50, -19], [55.9, -18], [56.0, -80]], loop=False)
lay('c_pings', K + 'pings.wav', G, 56.0, [[G, -35], [56.0, -35]], loop=False)
lay('c_heart', K + 'heart.wav', 50.0, 56.0, [[50.0, -30], [55.9, -25], [56.0, -80]], loop=False)
lay('c_roar', K + 'returnroar.wav', B, B + 2.4, [[B, -20], [B + 2.4, -14]], loop=False, hp=320)
lay('c_refill', K + 'refill.wav', 62.6, 64.6, [[62.6, -31], [64.6, -31]], loop=False)
lay('c_end', K + 'end.wav', 64.0, 73.0, [[64.0, -24], [73.0, -24]], loop=False)
json.dump(dict(duration_s=73.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
