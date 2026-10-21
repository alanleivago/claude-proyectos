# gen.py: writes layers.json — the recorded bed for saturno (Wikimedia Commons, CC0 / public domain; see CREDITS.md).
# Not used on purpose: Bubbles.wav, Water_bubbles_chortling.ogg, Storm_in_Quebec (voices in them).
import json
R = "rec/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
CUT = 59.0   # everything stops dead here; the hit lands at 60.2
# 1. dusk on the fjord (0-14): water lapping, a soft wind, gulls, a dog far away
lay("lap", "Shallow_small_river_with_stony_riverbed.ogg", 0, 22, [[0, -40], [0.4, -11], [14, -12], [21, -20], [22, -50]], lp=4000)
lay("breeze", "Howling_wind.ogg", 0, CUT, [[0, -45], [0.5, -23], [14, -22], [30, -22], [46, -18], [53, -10], [58.9, -6]], src=30)
lay("gulls", "Gull_1.ogg", 1.0, 13, [[1, -16], [10, -15], [13, -40]], src=2, pan=0.4)
for k, t in enumerate([4.2, 4.9, 11.0]):
    lay(f"dog{k}", "Bark__avk_.wav", t, t + 0.9, [[t, -28], [t + 0.9, -34]], loop=False, lp=2500, pan=-0.5)
# 2. the fjord drains (21.5-25.5) and surges back (25.5-32): suction, then the rush of water
lay("suck", "Kitchen_sink_draining_water.ogg", 21.5, 26, [[21.5, -40], [22.5, -16], [25, -15], [26, -40]], src=4, lp=900)
lay("surge", "Ocean_Waves_on_a_Tropical_Beach.ogg", 25.2, 46, [[25.2, -40], [27, -10], [31, -9], [36, -16], [46, -22]], src=60, lp=5000)
lay("creak", "Rusty_metal_door_clasp.ogg", 26, 33, [[26, -22], [33, -32]], loop=False, lp=3000, pan=0.4)
# 3. the ice rain (30-46): crowds, sirens, dogs; steam
lay("crowd", "Street_parade_carnival_people_yelling_kamelle_kamelle.ogg", 31, 52, [[31, -40], [33, -22], [46, -20], [52, -40]], src=12, lp=3000, pan=0.2)
lay("siren", "Civil-defense-siren-waver.ogg", 30.5, CUT, [[30.5, -40], [33, -22], [50, -20], [58.9, -24]], src=2, lp=4500, pan=-0.4)
for k, (f, t, g, p) in enumerate([("UncleSigmund_-_ahhh__cc0___freesound_.mp3", 34.2, -16, -0.4), ("Nick121087_-_Demonic_Woman_Scream__cc0___freesound_.mp3", 39.6, -18, 0.5), ("NOW_screaming.ogg", 44.4, -20, 0.2)]):
    lay(f"scream{k}", f, t, t + 4, [[t, g], [t + 2.4, g - 4], [t + 4, g - 18]], loop=False, lp=3800, pan=p)
lay("avalanche", "Killiney_Hill_Storm_Floris_20250804_1537.ogg", 39.5, 48, [[39.5, -40], [41, -18], [46, -20], [48, -40]], src=10, lp=1600, pan=0.3)
# 4. the Roche limit (45.5-53): the ground tears
lay("quake", "Earthquake.ogg", 45.3, CUT, [[45.3, -40], [45.5, -8], [50, -7], [55, -9], [58.9, -10]], src=20)
for k, (t, g) in enumerate([(46.2, -10), (48.0, -12), (50.4, -11)]):
    lay(f"tear{k}", "Explosions-LS100152.ogg", t, t + 2, [[t, g], [t + 2, -30]], loop=False, lp=600, pan=[-0.4, 0.4, 0][k])
# 5. the lift (52.4-59): debris, timber, the roar of the wind dragging everything up
lay("debris", "Leaves_falling_from_the_trees_during_autumn_in_the_forest.wav", 52.4, CUT, [[52.4, -40], [54, -14], [58.9, -10]], src=20)
lay("steel", "Metal_cabinet_door_jarring.ogg", 52.6, CUT, [[52.6, -22], [58.9, -16]], src=0, lp=2500, pan=-0.3)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
