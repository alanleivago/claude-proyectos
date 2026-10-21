# gen.py: writes layers.json — the recorded bed for eterno (Wikimedia Commons, CC0 / public domain; see CREDITS.md).
import json
R = "rec/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
CUT = 59.8   # silence before the tower at 60.4
# 1. the bay town (0-25): waves, gulls, a boat by the wharf, birds, the murmur of the town; bells when deaths stop
lay("waves", "Ocean_Waves_on_a_Tropical_Beach.ogg", 0, 30.4, [[0, -16], [14, -17], [25, -22], [30.4, -40]], src=60, pan=-0.3, lp=7000)
lay("gulls", "Gulls_above_the_street_at_dawn.ogg", 0, 24, [[0, -17], [14, -20], [24, -40]], src=5)
lay("boat", "Boat_by_a_wharf_1.ogg", 0, 14, [[0, -24], [14, -36]], pan=0.3)
lay("birds", "Dawnchorus-uk.ogg", 0, 17, [[0, -22], [12, -24], [17, -40]], src=900, pan=-0.2)
lay("town", "360703_eguobyte_large-crowd-medium-distance-stereo.wav", 0, 30.4, [[0, -30], [14, -26], [25, -22], [30.4, -40]], src=20, lp=3000)
lay("bells", "Church_bells_-_Leverkusen,_2007.oga", 10.0, 14.5, [[10.0, -40], [10.4, -17], [13.5, -19], [14.5, -40]], src=4, pan=0.2)
# 2. growth (14-25): drills, chainsaws for the farms, the traffic swelling
lay("drill", "Pneumatic_drill_-_The_Cleveland_Pneumatic_Tool_Company.ogg", 14.2, 25, [[14.2, -40], [15, -26], [25, -28]], lp=4000, pan=0.4)
lay("saw", "Chainsaw_1.ogg", 17, 21.5, [[17, -40], [17.6, -24], [21, -26], [21.5, -40]], src=3, lp=5000, pan=-0.3)
lay("traffic", "Highway_from_bridge_center.ogg", 16, 30.4, [[16, -40], [20, -28], [25, -22], [30.4, -30]], src=50, lp=3000)
# 3. night (25-30.4): the city hum; (crickets are synth)
# 4. under water (30.9-41): bubbles, a distant whale
lay("bub", "Water_bubbles_chortling.ogg", 30.6, 41.2, [[30.6, -20], [31.5, -26], [41.2, -30]], lp=2500)
lay("bub2", "Bubbles.wav", 30.4, 32, [[30.4, -14], [32, -30]], loop=False, lp=4000)
lay("whale", "Humpback_whale_moo.ogg", 32.5, 40.5, [[32.5, -40], [33.5, -28], [40.5, -34]], src=2, lp=1800, pan=-0.4)
lay("bub3", "Bubbles.wav", 40.6, 42, [[40.6, -18], [42, -34]], loop=False, src=1, hp=600)
# 5. the towers (41-59.8): the city, traffic, drills, wind high up
lay("city", "Sunday_in_the_city_street_noise1.ogg", 41, CUT, [[41, -30], [43, -22], [52, -23], [CUT, -24]], src=80)
lay("traffic2", "Highway_from_bridge_center.ogg", 41, CUT, [[41, -34], [44, -25], [CUT, -25]], src=120, lp=4000)
lay("drill2", "Pneumatic_drill_-_The_Cleveland_Pneumatic_Tool_Company.ogg", 45, CUT, [[45, -32], [52, -28], [CUT, -27]], src=2, pan=0.4, lp=5000)
lay("saw2", "Chainsaw_1.ogg", 56.2, CUT, [[56.2, -32], [57, -28], [CUT, -28]], src=12, pan=-0.2)
lay("wind", "Howling_wind.ogg", 48, CUT, [[48, -40], [52, -28], [CUT, -26]], src=20, lp=2500)
# 6. after the tower (60.4-64.3): the rumble, wind at the top
lay("rumble", "Earthquake.ogg", 60.6, 64.3, [[60.6, -12], [62, -18], [64.3, -34]], src=60, lp=500)
lay("wind2", "Howling_wind.ogg", 61, 64.4, [[61, -36], [62.5, -22], [64.4, -32]], src=50, lp=4000)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
