# gen.py: writes layers.json — the recorded bed for terremoto (Wikimedia Commons, CC0 / public domain; see CREDITS.md).
# Not used on purpose: Bubbles.wav and Water_bubbles_chortling.ogg (a voice in them), Storm_in_Quebec (a voice in it).
import json
R = "rec/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
CUT = 60.0   # everything stops dead here; the impact lands at 60.8
# 1. a quiet afternoon on the coast (0-10): surf, gulls, the city, a far horn
lay("surf", "Ocean_Waves_on_a_Tropical_Beach.ogg", 0, 50, [[0, -40], [0.4, -10], [10, -11], [14, -24], [40, -28], [45, -22], [49.5, -18], [50, -40]], src=10)
lay("city", "Garden_at_Pioneer_Works.wav", 0, 14, [[0, -40], [0.5, -14], [10, -14], [11, -26], [14, -50]], src=3)
lay("gulls", "Gull_1.ogg", 1.5, 12, [[1.5, -16], [10, -16], [10.6, -10], [12, -40]], src=2, pan=-0.3)
lay("gulls2", "Gulls_above_the_street_at_dawn.ogg", 0, 11, [[0, -40], [0.5, -24], [11, -40]], src=5, pan=0.3)
lay("horn", "Car_Horn.wav", 6.2, 9.6, [[6.2, -26], [9.6, -34]], loop=False, lp=3500, pan=0.4)
# 2. the jolt and the shaking (10-45): the deep rumble that grows with the magnitude, the wind of it, steel and glass, sirens, dogs, screams
lay("rumble", "Earthquake.ogg", 10, 46, [[10, -40], [10.1, -9], [11, -15], [14, -13], [19, -10], [25, -8], [33, -7], [41, -8], [44, -13], [46, -50]], src=20)
lay("rumble2", "Earthquake.ogg", 13, 46, [[13, -40], [18, -16], [28, -11], [41, -11], [46, -50]], src=90, pan=0.4)
lay("wind", "Howling_wind.ogg", 18, 46, [[18, -45], [24, -24], [35, -18], [44, -26], [46, -50]], src=8)
lay("steel", "Metal_cabinet_door_jarring.ogg", 12, 45, [[12, -24], [20, -16], [40, -16], [45, -40]], src=0, lp=2500, pan=-0.3)
lay("creak", "Rusty_metal_door_clasp.ogg", 14, 45, [[14, -26], [25, -18], [45, -40]], src=0, lp=3000, pan=0.4)
lay("siren", "Civil-defense-siren-waver.ogg", 22, CUT, [[22, -40], [25, -22], [40, -20], [50, -18], [59.9, -22]], src=2, lp=5000, pan=-0.4)
lay("police", "American_police_siren_i.ogg", 28, CUT, [[28, -40], [29, -26], [50, -22], [59.9, -24]], src=0, lp=4000, pan=0.35)
for k, t in enumerate([10.5, 11.2, 15.8, 16.5, 21.0, 33.2, 47.1, 47.8]):
    lay(f"dog{k}", "Bark__avk_.wav", t, t + 0.9, [[t, -18], [t + 0.9, -26]], loop=False, lp=3200, pan=-0.5 if k % 2 else 0.5)
for k, (f, t, g, p) in enumerate([("UncleSigmund_-_ahhh__cc0___freesound_.mp3", 14.6, -14, -0.4), ("Nick121087_-_Demonic_Woman_Scream__cc0___freesound_.mp3", 20.2, -16, 0.5),
        ("Cri_Wilhelm__Joseph_SARDIN_.wav", 27.0, -16, 0.2), ("UncleSigmund_-_ahhh__cc0___freesound_.mp3", 33.6, -14, 0.6), ("NOW_screaming.ogg", 38.4, -18, -0.3), ("Nick121087_-_Demonic_Woman_Scream__cc0___freesound_.mp3", 56.3, -14, -0.5)]):
    lay(f"scream{k}", f, t, t + 4.0, [[t, g], [t + 2.4, g - 4], [t + 4.0, g - 18]], loop=False, lp=3800, pan=p)
lay("crowd", "Street_parade_carnival_people_yelling_kamelle_kamelle.ogg", 12, 46, [[12, -40], [14, -20], [30, -18], [44, -24], [46, -45]], src=12, lp=3000, pan=0.2)
lay("murmur", "360703_eguobyte_large-crowd-medium-distance-stereo.wav", 45, CUT, [[45, -40], [47, -24], [55, -20], [59.9, -18]], src=5, lp=2400, hp=200)
# 3. the building across sheds its face (31-36), the tower falls (39-43): collapses
for k, (t, g) in enumerate([(31.3, -11), (32.4, -13), (33.8, -14), (39.4, -11), (40.6, -14)]):
    lay(f"collapse{k}", "Explosions-LS100152.ogg", t, t + 2.0, [[t, g], [t + 2.0, -30]], loop=False, lp=650, pan=[0.4, 0.5, 0.3, -0.2, 0][k])
lay("farboom", "Explosion_10.ogg", 41.0, 43.5, [[41, -12], [43.5, -40]], loop=False, lp=400, pan=0.3)
# 4. quiet (45-50), the sea goes out (50-56): suction; it comes back (56-60): the roar
lay("suck", "Kitchen_sink_draining_water.ogg", 50, 56.5, [[50, -40], [51.2, -16], [55, -14], [56.5, -40]], src=4, lp=900)
lay("river", "Shallow_small_river_with_stony_riverbed.ogg", 50.5, 56.5, [[50.5, -40], [52, -22], [56.5, -40]], lp=3000, pan=0.3)
lay("roar", "Ocean_Waves_on_a_Tropical_Beach.ogg", 55.5, CUT, [[55.5, -40], [57, -14], [59.9, -4]], src=200, lp=5000)
lay("wind2", "Howling_wind.ogg", 55.5, CUT, [[55.5, -45], [59.9, -12]], src=60)
# 5. the impact: the water's burst (the rest under water is synthesized)
lay("burst", "Ocean_Waves_on_a_Tropical_Beach.ogg", 60.8, 61.6, [[60.8, 6], [61.1, 0], [61.6, -30]], src=300)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
