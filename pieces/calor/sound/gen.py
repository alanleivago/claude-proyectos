# gen.py: writes layers.json — the recorded bed for calor (Wikimedia Commons, CC0 / public domain; see CREDITS.md).
import json
R = "rec/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
CUT = 56.0   # silence before the steel gives way at 56.6
# 1. the beach (0-4.3): waves, gulls, a crowd; then the crowd yells and runs (4.3-7.6)
lay("waves", "Ocean_Waves_on_a_Tropical_Beach.ogg", 0, 22, [[0, -12], [4, -12], [11, -17], [16, -26], [22, -45]], src=40, pan=-0.4)
lay("gulls", "Gulls_above_the_street_at_dawn.ogg", 0, 6.5, [[0, -15], [4.5, -15], [6.5, -40]], src=3)
lay("gull1", "Gull_1.ogg", 0.6, 5.5, [[0.6, -20], [5.5, -30]], src=2, pan=-0.5)
lay("crowd", "360703_eguobyte_large-crowd-medium-distance-stereo.wav", 0, 4.6, [[0, -16], [4.3, -15], [4.6, -30]], src=12, pan=0.3)
lay("panic", "Street_parade_carnival_people_yelling_kamelle_kamelle.ogg", 4.2, 7.8, [[4.2, -30], [4.6, -15], [6.5, -18], [7.8, -40]], src=60, pan=0.2, lp=5000)
# 2. the heat (6.6-25): the asphalt sizzles, the sea boils, oil-like sizzles everywhere
lay("sizzle", "Oil_boiling.ogg", 6.6, 25.3, [[6.6, -40], [9, -28], [16, -24], [25.3, -22]], hp=1500, pan=0.3)
lay("boil", "Boiling_lentils.ogg", 11.4, 25.3, [[11.4, -40], [12.6, -17], [18, -15], [21.8, -15], [22.5, -22], [25.3, -22]], pan=-0.45, lp=6000)
lay("boil2", "Oil_boiling.ogg", 12, 25.3, [[12, -40], [14, -22], [21.8, -20], [22.5, -27], [25.3, -26]], src=8, pan=-0.6, lp=3000)
# popcorn (19.6-21.8): crackles
lay("crackle", "Silvester_fireworks_from_the_street_02_cool_stuff.ogg", 19.6, 21.8, [[19.6, -26], [20.2, -20], [21.8, -34]], src=30, hp=900, pan=0.35)
# 3. fire (25.3-48): paper catches, petrol, the station, then everything burns
lay("fire1", "Dry_grass_burning_in_open_fireplace.ogg", 25.2, 48, [[25.2, -40], [26, -20], [31, -18], [33, -14], [44, -15], [48, -24]])
lay("fire2", "Bones_breaking_wood_fire_ice_crackling.ogg", 26, 50, [[26, -40], [28, -22], [33, -16], [46, -18], [50, -30]], src=5, pan=0.4)
lay("roar", "Howling_wind.ogg", 31, CUT, [[31, -40], [33, -16], [44, -16], [48, -20], [55.9, -22]], src=40, lp=1200)
lay("station", "Explosions-LS100152.ogg", 29.6, 33, [[29.6, -9], [33, -24]], loop=False, lp=2500, pan=0.4)
for k, (t, p) in enumerate([(27.4, 0.5), (28.3, 0.3), (29.0, 0.6), (30.8, 0.2), (31.4, 0.5)]):
    lay(f"car{k}", "Explosion_10.ogg", t, t + 2.4, [[t, -20 - 2 * (k % 2)], [t + 2.4, -36]], loop=False, lp=1800, pan=p)
# 4. embers and steel (48-56): the fire dies, the metal groans
lay("embers", "Bones_breaking_wood_fire_ice_crackling.ogg", 48, CUT, [[48, -24], [55.9, -28]], src=40, hp=700, pan=-0.2)
lay("groan", "Rusty_metal_door_clasp.ogg", 51, CUT, [[51, -36], [53, -22], [55.9, -18]], src=6, lp=1600, pan=0.4)
lay("cab", "Metal_cabinet_door_jarring.ogg", 53.5, CUT, [[53.5, -26], [55.9, -20]], src=1, lp=2000, pan=-0.3)
# 5. after the hit (56.6-64.5): the rumble, the steam where the steel hits the sea, embers
lay("rumble", "Earthquake.ogg", 56.8, 64.3, [[56.8, -12], [59, -16], [64.3, -32]], src=60, lp=400)
lay("hiss", "Oil_boiling.ogg", 57.4, 64.3, [[57.4, -24], [58.5, -18], [64.3, -30]], hp=2000, pan=-0.5)
lay("crash2", "Explosion_10.ogg", 57.6, 60, [[57.6, -16], [60, -30]], loop=False, lp=900, pan=-0.4)
lay("embers2", "Dry_grass_burning_in_open_fireplace.ogg", 58, 64.3, [[58, -40], [59.5, -26], [64.3, -32]], src=10, hp=500)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
