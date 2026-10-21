# gen.py: writes layers.json — the sound bed for protones (CC0 recordings + code layers from synth.py). No music.
import json, os
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
def amb(id, file, t0, t1, db, **o): lay(id, file, t0, t1, [[t0, -40], [t0 + 0.25, db], [t1 - 0.25, db], [t1, -40]], **o)
G, B = 10.0, 56.5
# 1. the park (0-10): a busy city park, people talking, birds, water lapping at the shore, the city far off; a dog barks in the dog shot
lay("park", f("park", "80fab5e4"), 0, G, [[0, -40], [0.4, -19], [9.3, -19], [9.8, -40], [G, -60]])
lay("talk", f("park", "fcb2a873"), 0, G, [[0, -40], [0.5, -26], [9.3, -26], [9.8, -50], [G, -60]], src=5)
lay("birds", f("birds", "98041fcc"), 0, G, [[0, -40], [0.3, -25], [9.3, -25], [9.8, -50], [G, -60]])
lay("lap", f("lap", "682cbb15"), 0, 6.0, [[0, -40], [0.3, -23], [5.4, -23], [6.0, -40]])
lay("city", f("traffic", "c3575018"), 0, G, [[0, -40], [0.5, -33], [9.3, -33], [9.8, -60]], lp=900)
lay("bark", f("bark", "e5dfe81e"), 6.3, 8.0, [[6.3, -27], [8.0, -27]], loop=False)
lay("geese", f("geese", "ac2e9c97"), 0, 6.2, [[0, -40], [0.3, -23], [5.6, -24], [6.2, -40]], src=2)
lay("kids", f("kids", "997ecd4b"), 0, G, [[0, -40], [0.5, -30], [9.3, -30], [9.8, -60]], src=20)
# 2. the five seconds (10-56): the park smeared and far away under the drone; a faint ringing
lay("parkfar", f("park", "80fab5e4"), G, 56.0, [[G, -40], [G + 1.5, -31], [37.5, -31], [38.5, -40], [52.8, -40], [53.5, -33], [55.9, -33], [56.0, -80]], lp=380, src=12)
lay("ring", f("tinnitus", "4e384d3a"), G + 0.5, 56.0, [[G + 0.5, -50], [G + 3, -42], [55.0, -38], [55.95, -80]], lp=6000)
# zoom (19.8-30): a whoosh into the skin
lay("intoskin", f("whooshb", "45c2cda9"), 19.7, 21.5, [[19.7, -27], [21.5, -27]], loop=False)
# crack (30-38): ice cracking, close
for k, (tt, id) in enumerate([(30.6, "f0e06f5e"), (31.9, "bf163725"), (33.2, "d0d5da51"), (34.4, "8307d942"), (35.6, "a315897a")]):
    lay(f"ice{k}", f("crack", id), tt, tt + 1.5, [[tt, -23 + k], [tt + 1.5, -23 + k]], loop=False)
# rise (38-48): wind as you climb; the Earth's deep rumble
lay("climb", f("wind", "c0b32166"), 38.0, 42.6, [[38.0, -40], [40.5, -24], [42.3, -20], [42.6, -40]])
lay("earth", f("rumble", "d07e6e1e"), 42.5, 48.0, [[42.5, -40], [43.0, -22], [47.6, -24], [48.0, -40]], lp=260)
# fall (48-56): the rush down, wind, cracks closing in
lay("fallwind", f("wind", "dffa67b8"), 49.6, 53.3, [[49.6, -40], [50.2, -25], [53.0, -27], [53.3, -40]])
for k, (tt, id) in enumerate([(53.6, "bf163725"), (54.5, "f0e06f5e"), (55.2, "d0d5da51")]):
    lay(f"ice2{k}", f("crack", id), tt, tt + 0.8, [[tt, -26], [tt + 0.8, -26]], loop=False)
# 7. back (56.5-66): the park at full, people screaming and running, a dog barking, the jogger's steps
lay("park2", f("park", "80fab5e4"), 56.6, 66.0, [[56.6, -26], [57.4, -19], [65.6, -19], [66.0, -40]], src=20)
lay("talk2", f("park", "fcb2a873"), 56.6, 66.0, [[56.6, -40], [57.4, -27], [65.6, -27], [66.0, -40]], src=15)
lay("scream", f("panic", "a222b1dc"), 57.3, 63.5, [[57.3, -40], [57.8, -24], [61.5, -26], [63.5, -40]])
lay("kids2", f("kids", "997ecd4b"), 56.6, 66.0, [[56.6, -40], [57.4, -31], [65.6, -31], [66.0, -40]], src=60)
lay("bark2", f("bark", "489e6362"), 58.2, 61.0, [[58.2, -24], [61.0, -26]], loop=False)
lay("steps", f("steps", "911314cd"), 61.5, 66.0, [[61.5, -40], [62.5, -26], [65.6, -24], [66.0, -40]])
K = 'audio/code/'
lay('c_ticks', K + 'ticks.wav', 4.0, 10.2, [[4.0, -25], [10.2, -25]], loop=False)
lay('c_inv', K + 'inversion.wav', 9.4, 13.0, [[9.4, -23], [13.0, -23]], loop=False)
lay('c_drone', K + 'drone.wav', G, 56.0, [[G, -20], [30, -20], [50, -19], [55.9, -19], [56.0, -80]], loop=False)
lay('c_pings', K + 'pings.wav', G, 56.0, [[G, -31], [56.0, -31]], loop=False)
lay('c_vanish', K + 'vanish.wav', 27.6, 29.2, [[27.6, -23], [29.2, -23]], loop=False)
lay('c_crack', K + 'crackle.wav', 30.0, 38.0, [[30.0, -30], [37.5, -22], [38.0, -40]], loop=False)
lay('c_riser', K + 'riser.wav', 38.0, 42.5, [[38.0, -20], [42.5, -18]], loop=False)
lay('c_pulses', K + 'pulses.wav', 44.49, 48.0, [[44.49, -21], [48.0, -21]], loop=False)
lay('c_fall', K + 'fallwhoosh.wav', 48.0, 51.4, [[48.0, -21], [51.4, -21]], loop=False)
lay('c_heart', K + 'heart.wav', 53.2, 56.0, [[53.2, -26], [55.95, -23], [56.0, -80]], loop=False)
lay('c_crack2', K + 'crackle.wav', 53.2, 56.0, [[53.2, -32], [55.9, -27], [56.0, -80]], loop=False, src=4)
lay('c_bloom', K + 'returnbloom.wav', B, 59.5, [[B, -10], [59.5, -10]], loop=False)
lay('c_end', K + 'end.wav', 66.0, 75.0, [[66.0, -24], [75.0, -24]], loop=False)
json.dump(dict(duration_s=75.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
