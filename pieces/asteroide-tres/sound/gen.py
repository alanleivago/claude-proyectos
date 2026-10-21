# gen.py: writes layers.json — the recorded bed for asteroide (Wikimedia Commons recordings, CC0 / public domain; see CREDITS.md)
import json
R = "rec/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
# 1. sunrise over the river town (0-28): a dawn chorus, the river below, a steam train crossing far right->left, a dog
lay("birds", "R'eveil_des_oiseaux.ogg", 0, 30, [[0, -40], [0.4, -13], [20, -14], [26, -20], [28.5, -34], [30, -60]], src=20, hp=300)
lay("birds2", "20090610_0_ambience.ogg", 0, 30, [[0, -40], [0.5, -20], [24, -22], [28.5, -40], [30, -60]], pan=-0.4, hp=250)
lay("river", "Shallow_small_river_with_stony_riverbed.ogg", 0, 57.3, [[0, -40], [0.5, -25], [26, -26], [29, -38], [31, -42], [43, -30], [49, -28], [56.4, -34], [56.6, -90]], lp=5000, pan=0.15)
lay("train", "South_Australian_Railways_Garratt_406_starts_off.ogg", 0, 40, [[0, -40], [0.6, -27], [26, -29], [33, -32], [40, -60]], src=60, lp=2200, pan=0.35)
lay("whistle", "Parovoz_sound.ogg", 3.2, 6.6, [[3.2, -24], [6.6, -30]], loop=False, lp=3000, pan=0.4)
for k, t in enumerate([14.2, 15.0, 17.6, 34.4, 35.1, 43.6, 44.1, 44.9]):
    lay(f"dog{k}", "Bark__avk_.wav", t, t + 0.9, [[t, -22 if t > 40 else -26], [t + 0.9, -30]], loop=False, lp=3500, pan=0.5 if k % 2 else 0.35)
lay("leaves", "Leaves_falling_from_the_trees_during_autumn_in_the_forest.wav", 0, 57.3, [[0, -40], [1, -32], [28, -36], [43, -22], [49, -18], [56.4, -16], [56.6, -90]], src=10)
# 2. the heat (33-46): crackle off the roofs and the dry grass; the wind rises
lay("crackle", "Bones_breaking_wood_fire_ice_crackling.ogg", 33.5, 49, [[33.5, -40], [36, -24], [43, -22], [49, -40]], hp=500)
lay("wind", "Killiney_Hill_Storm_Floris_20250804_1537.ogg", 32, 57.3, [[32, -50], [37, -28], [46, -22], [52, -16], [56.4, -12], [56.6, -90]], src=4)
# 3. the quake (43-50): a recorded deep rumble, wood creaking in the houses
lay("quake", "Earthquake.ogg", 43, 51, [[43, -50], [43.1, -14], [47, -18], [51, -40]], src=30)
lay("creak", "Bones_breaking_wood_fire_ice_crackling.ogg", 43.2, 56.6, [[43.2, -22], [50, -18], [56.5, -14], [56.6, -90]], src=30, lp=2500, pan=-0.2)
# 4. the wall (49-56.6): a storm's roar climbing; one far boom when the front breaks over the hills; everything cut dead at 56.6
lay("roar", "Storm_in_Quebec_on_August_10__2023.flac", 48, 56.6, [[48, -50], [51, -24], [54, -14], [56.4, -6], [56.6, -90]], src=1060, lp=6000)
lay("farboom", "Explosion_10.ogg", 49.6, 52.3, [[49.6, -18], [52.3, -40]], loop=False, lp=500)
# 5. after the blast (57.3-70): debris, the storm passing, settling dust, a low tail under the card
lay("after", "Storm_in_Quebec_on_August_10__2023.flac", 57.3, 66, [[57.3, -12], [58.5, -17], [62, -24], [66, -45]], src=1080, lp=3500)
lay("rubble", "Leaves_falling_from_the_trees_during_autumn_in_the_forest.wav", 57.3, 64, [[57.3, -16], [60, -24], [64, -40]], src=60)
lay("burst2", "Explosions-LS100150.ogg", 58.5, 60.0, [[58.5, 0], [60.0, -30]], loop=False, lp=3000, pan=0.3)
lay("burst3", "Explosion_10.ogg", 59.7, 62.4, [[59.7, -2], [62.4, -30]], loop=False, lp=2500, pan=-0.3)
lay("burst", "Explosions-LS100152.ogg", 57.3, 59.3, [[57.3, 6], [57.8, 0], [59.3, -30]], loop=False)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
