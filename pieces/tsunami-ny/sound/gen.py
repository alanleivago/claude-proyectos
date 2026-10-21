# gen.py: writes layers.json — the recorded bed for tsunami-ny (Wikimedia Commons, CC0 / public domain; see CREDITS.md)
import json
R = "rec/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
CUT = 62.0   # everything stops dead here; the impact lands at 62.8
# 1. an ordinary evening (0-11): the city below, gulls, the harbour lapping, a helicopter up the Hudson, horns
lay("city", "Garden_at_Pioneer_Works.wav", 0, 50, [[0, -40], [0.4, -15], [11, -16], [18, -22], [24, -24], [45, -26], [50, -40]], src=3)
lay("street", "Gulls_above_the_street_at_dawn.ogg", 0, 26, [[0, -40], [0.5, -20], [18, -22], [24, -30], [26, -50]], src=2, pan=0.2)
lay("harbour", "Ocean_Waves_on_a_Tropical_Beach.ogg", 0, 16, [[0, -40], [0.5, -27], [10, -28], [16, -50]], src=40, lp=2500, pan=0.4)
lay("gulls", "Gull_1.ogg", 3.5, 21, [[3.5, -24], [12, -22], [18, -18], [21, -40]], src=4, lp=6000, pan=0.45)
lay("gull2", "Western_Gull_Golden_Gate_National_Recreation_Area.ogg", 14.5, 19.2, [[14.5, -18], [19.2, -30]], loop=False, pan=-0.3)
lay("heli", "Helicopter_over_quiet_neighbourhood.ogg", 2, 46, [[2, -40], [6, -26], [20, -20], [30, -18], [36, -26], [46, -50]], src=0, lp=4000, pan=0.5)
for k, (f, t, g, p) in enumerate([("Car_Horn.wav", 2.4, -22, -0.3), ("Horn_03_R.wav", 6.6, -26, 0.4), ("Car_Horn.wav", 9.1, -24, 0.1)]):
    lay(f"horn{k}", f, t, t + 3.4, [[t, g], [t + 3.4, g - 8]], loop=False, lp=3500, pan=p, src=3.0 if f.startswith("Horn_03") else 0)
# 2. the harbour drains (11-24): a huge suction, gurgling, the wind finding its way in; then an eerie quiet
lay("suck", "Kitchen_sink_draining_water.ogg", 11, 23.5, [[11, -40], [12.5, -16], [17, -14], [20.5, -20], [23.5, -45]], src=4, lp=900)
lay("gurgle", "Water_bubbles_chortling.ogg", 12, 22, [[12, -40], [14, -22], [20, -24], [22, -45]], lp=1400, pan=0.3)
lay("wind", "Howling_wind.ogg", 16, CUT, [[16, -45], [20, -28], [30, -24], [45, -18], [55, -14], [61.9, -12]], src=10)
# 3. the line, the wall (24-37): the civil-defence siren, police, a rumble you feel, the roar beginning
lay("siren", "Civil-defense-siren-waver.ogg", 25, CUT, [[25, -40], [27.5, -18], [40, -16], [55, -18], [61.9, -22]], src=2, lp=5000, pan=-0.35)
lay("police", "American_police_siren_i.ogg", 29, CUT, [[29, -40], [30, -24], [50, -20], [61.9, -22]], src=0, lp=4500, pan=0.4)
lay("rumble", "Earthquake.ogg", 26, CUT, [[26, -45], [31, -18], [45, -12], [58, -8], [61.9, -8]], src=40)
lay("roar", "Storm_in_Quebec_on_August_10__2023.flac", 28, CUT, [[28, -45], [34, -26], [45, -16], [55, -9], [61.9, -5]], src=1060, lp=5000)
lay("surf", "Ocean_Waves_on_a_Tropical_Beach.ogg", 40, CUT, [[40, -40], [48, -18], [58, -10], [61.9, -7]], src=120, lp=3000)
# 4. the bridge goes (39-41): steel groaning and a far boom
lay("steel", "Metal_cabinet_door_jarring.ogg", 39.2, 42.5, [[39.2, -14], [42.5, -24]], loop=False, lp=1500, pan=0.3)
lay("creak", "Rusty_metal_door_clasp.ogg", 38.6, 44, [[38.6, -18], [44, -28]], loop=False, lp=2200, pan=0.4)
lay("farboom", "Explosion_10.ogg", 39.6, 42.3, [[39.6, -16], [42.3, -40]], loop=False, lp=450)
# 5. panic (50-62): horns everywhere, a crowd yelling, screams near and far, dogs
for k, (f, t, g, p) in enumerate([("Car_Horn.wav", 50.2, -18, 0.3), ("Horn_03_R.wav", 51.4, -20, -0.4), ("Car_Horn.wav", 52.9, -17, -0.2), ("Horn_03_R.wav", 54.0, -19, 0.5), ("Car_Horn.wav", 55.6, -16, 0.0)]):
    lay(f"hornP{k}", f, t, t + 3.4, [[t, g], [t + 3.4, g - 8]], loop=False, lp=4000, pan=p, src=3.0 if f.startswith("Horn_03") else 0)
lay("crowd", "Street_parade_carnival_people_yelling_kamelle_kamelle.ogg", 51, CUT, [[51, -40], [53, -16], [61.9, -14]], src=12, lp=3200, pan=0.2)
lay("murmur", "360703_eguobyte_large-crowd-medium-distance-stereo.wav", 50, CUT, [[50, -40], [52, -18], [61.9, -16]], src=5, lp=2600, hp=200)
for k, (f, t, g, p) in enumerate([("UncleSigmund_-_ahhh__cc0___freesound_.mp3", 53.6, -10, -0.5), ("Nick121087_-_Demonic_Woman_Scream__cc0___freesound_.mp3", 55.2, -12, 0.55),
        ("Cri_Wilhelm__Joseph_SARDIN_.wav", 56.9, -14, 0.25), ("UncleSigmund_-_ahhh__cc0___freesound_.mp3", 58.3, -13, 0.7), ("NOW_screaming.ogg", 59.6, -16, -0.3), ("Nick121087_-_Demonic_Woman_Scream__cc0___freesound_.mp3", 60.7, -14, -0.6)]):
    lay(f"scream{k}", f, t, min(CUT, t + 4.0), [[t, g], [t + 2.4, g - 4], [t + 4.0, g - 18]], loop=False, lp=3800, pan=p)
for k, t in enumerate([52.4, 53.1, 57.7, 59.0]):
    lay(f"dog{k}", "Bark__avk_.wav", t, t + 0.9, [[t, -14], [t + 0.9, -22]], loop=False, lp=3200, pan=-0.6 if k % 2 else 0.5)
# 6. the towers go (56-61): deep booms, steel
for k, t in enumerate([56.2, 58.6, 60.1]):
    lay(f"tower{k}", "Explosions-LS100152.ogg", t, t + 1.8, [[t, -8], [t + 1.8, -30]], loop=False, lp=700, pan=[-0.3, 0.2, -0.1][k])
lay("steel2", "Metal_cabinet_door_jarring.ogg", 57.0, 61.9, [[57, -14], [61.9, -16]], src=2, lp=1800, pan=-0.3)
# 7. under the water (62.8-66): only the first burst is recorded; the muffled roar and the bubbles are synthesized (synth.py) — the bubble recordings carried a voice
lay("burst", "Ocean_Waves_on_a_Tropical_Beach.ogg", 62.8, 63.6, [[62.8, 6], [63.1, 0], [63.6, -30]], src=200)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
