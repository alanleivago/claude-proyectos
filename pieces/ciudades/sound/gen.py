# gen.py: writes layers.json — the recorded bed for ciudades (Wikimedia Commons, CC0 / public domain; see CREDITS.md).
import json
R = "rec/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
CUT = 44.4   # silence before the bridge at 45.2
# 1. the city (0-4): street, traffic from the avenue, a crowd, horns; at 4 s the people are gone (the crowd and horns stop dead)
lay("street", "Sunday_in_the_city_street_noise1.ogg", 0, 4.02, [[0, -14], [4, -12]], src=20)
lay("crowd", "360703_eguobyte_large-crowd-medium-distance-stereo.wav", 0, 4.02, [[0, -18], [4, -16]], src=10, pan=0.2)
lay("highway", "Highway_from_bridge_center.ogg", 0, 12, [[0, -15], [4, -15], [5, -19], [9, -26], [12, -45]], src=30)
lay("horns", "Horn_03_R.wav", 0, 4.02, [[0, -24], [4, -22]], src=5, pan=0.4)
lay("street2", "Sunday_in_the_city_street_noise2.ogg", 4, 10.6, [[4, -26], [10.6, -40]], src=60, lp=3000)
# 2. the crashes (5.6-9): metal on metal
lay("metal1", "Metal_cabinet_door_jarring.ogg", 5.5, 7.5, [[5.5, -12], [7.5, -24]], loop=False, src=0.2, pan=-0.2)
lay("metal2", "Rusty_metal_door_clasp.ogg", 7.2, 9.5, [[7.2, -18], [9.5, -30]], loop=False, src=2, pan=0.4)
# 3. the night (10.6-17): wind; later dogs (17-25)
lay("wind", "Howling_wind.ogg", 9, CUT, [[9, -45], [12, -26], [17, -24], [21, -30], [30, -30], [40, -24], [44.4, -22]], src=10, lp=5000)
for k, (t, p) in enumerate([(17.6, -0.4), (18.3, -0.35), (19.4, 0.5), (20.1, 0.45), (21.7, -0.2), (23.4, 0.3), (24.2, 0.3)]):
    lay(f"dog{k}", "Bark__avk_.wav", t, t + 0.9, [[t, -16 - 2 * (k % 3)], [t + 0.9, -24]], loop=False, lp=3200, pan=p)
# 4. the leaves and the rain (21-26)
lay("rain", "Rain_and_thunder_1.ogg", 20.5, 27, [[20.5, -45], [21.5, -16], [25.5, -16], [27, -45]], src=5)
lay("window", "Rain_against_the_window.ogg", 21, 26.5, [[21, -40], [22, -22], [26.5, -40]], src=12, pan=0.3)
lay("leaves", "Leaves_falling_from_the_trees_during_autumn_in_the_forest.wav", 22, 30, [[22, -40], [24, -20], [30, -40]], src=30, pan=-0.3)
# 5. the weeds, the grass, the rust (26-44): birds in the courtyards, then a whole chorus; creaks in the steel
lay("courtyard", "493231-AMB-CityCourtyardEarlyMorningBirds.wav", 26, CUT, [[26, -40], [28, -18], [36, -16], [44.4, -20]], src=40)
lay("garden", "Garden_at_Pioneer_Works.wav", 31, CUT, [[31, -40], [33, -22], [44.4, -22]], src=5, pan=-0.3)
lay("creak", "Rusty_metal_door_clasp.ogg", 36.5, 43, [[36.5, -40], [37.5, -20], [43, -20]], src=8, lp=2500, pan=0.3)
# the Ferris wheel (40) and the metro viaduct (43) fall
lay("wheel", "Explosion_10.ogg", 40.1, 42.6, [[40.1, -14], [42.6, -30]], loop=False, lp=900, pan=0.5)
lay("metro", "Earthquake.ogg", 43.0, CUT, [[43, -14], [44.3, -18]], src=40, lp=500)
lay("metroB", "Explosions-LS100152.ogg", 43.05, CUT, [[43.05, -14], [44.3, -26]], loop=False, lp=700, src=0.0)
# 6. after the bridge (45.2-): the rumble of the collapse, the towers falling far away (48-54)
lay("rumble", "Earthquake.ogg", 45.6, 55, [[45.6, -12], [48, -16], [54, -20], [55, -45]], src=60, lp=400)
lay("debris", "Bones_breaking_wood_fire_ice_crackling.ogg", 45.4, 49, [[45.4, -18], [49, -36]], src=3, hp=400)
# 7. the forest (53-59): a dawn chorus; wolves howl (54-60); the ice (59-63): wind; the last forest (63-66)
lay("chorus", "Dawnchorus-uk.ogg", 52.5, 59.5, [[52.5, -40], [54.5, -16], [59.5, -40]], src=600)
lay("wolves", "Wolf_howls.ogg", 54.2, 60.5, [[54.2, -16], [60.5, -30]], src=1, pan=-0.3, lp=6000)
lay("icewind", "Howling_wind.ogg", 58.8, 63.8, [[58.8, -40], [59.6, -12], [63, -14], [63.8, -40]], src=70)
lay("chorus2", "Dawnchorus-uk.ogg", 63, 66.5, [[63, -40], [64, -18], [66.5, -40]], src=1300)
lay("stream", "Hemlock_stream.ogg", 63, 66.5, [[63, -40], [64, -26], [66.5, -40]], pan=0.3)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
