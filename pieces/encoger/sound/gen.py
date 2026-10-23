# gen.py: writes layers.json — the recorded bed for encoger (Wikimedia Commons, CC0 / public domain; see CREDITS.md).
import json
R = "rec/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
CUT = 62.0   # silence before the quarks at 62.6
# 1. the forest (0-20): birds, the rainforest, leaves, a stream — muffling as you shrink
lay("birds", "Dawnchorus-uk.ogg", 0, 14, [[0, -15], [4, -15], [10, -24], [14, -45]], src=700, lp=7000)
lay("forest", "Walk_in_the_rainforest.ogg", 0, 20.4, [[0, -18], [6, -21], [14, -29], [20.4, -40]], src=2, lp=4000)
lay("leaves", "Leaves_falling_from_the_trees_during_autumn_in_the_forest.wav", 0, 16, [[0, -27], [16, -40]], src=20, pan=0.3)
lay("stream", "433589_jackthemurray_stream-river-water-up-close.wav", 4, 20.4, [[4, -40], [8, -30], [16, -24], [20.4, -26]], lp=1400, pan=-0.3)
lay("drip", "Rain_against_the_window.ogg", 14, 20.4, [[14, -40], [16, -30], [20.4, -26]], src=30, hp=1500, pan=0.2)
# 2. inside the drop (20-34): bubbles, a far whale-like moan
lay("bub", "Water_bubbles_chortling.ogg", 20.0, 34.6, [[20.0, -22], [21, -24], [33, -26], [34.6, -40]], lp=2400)
lay("bub2", "Bubbles.wav", 19.8, 21.4, [[19.8, -16], [21.4, -32]], loop=False, lp=3500)
lay("moan", "Humpback_whale_moo.ogg", 23, 33, [[23, -40], [24, -30], [33, -34]], src=5, lp=900, pan=-0.4)
# 5. the hero (62.6-): a deep rumble under it
lay("rumble", "Earthquake.ogg", 62.7, 70, [[62.7, -14], [64, -20], [70, -40]], src=60, lp=300)
json.dump(dict(duration_s=80.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
