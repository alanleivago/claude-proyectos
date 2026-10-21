# gen.py: writes layers.json — the recorded bed for plana (Wikimedia Commons, CC0 / public domain; see CREDITS.md).
import json
R = "rec/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
CUT = 58.8   # silence before the wall arrives at 59.4
# 1. the lake (0-18): wind, water lapping, sheep, birds; cranes call as the flock lifts at 2 s
lay("wind", "Howling_wind.ogg", 0, 33.7, [[0, -22], [18, -21], [26, -18], [29, -13], [33.7, -14]], src=10, lp=3000)
lay("lap", "Shallow_small_river_with_stony_riverbed.ogg", 0, 22, [[0, -25], [20, -26], [22, -40]], lp=5000, pan=-0.2)
lay("sheep", "Corner_of_a_sheep_field_in_summer.ogg", 0, 25, [[0, -26], [22, -28], [25, -40]], pan=0.4)
lay("birds", "Dawnchorus-uk.ogg", 0, 18, [[0, -27], [16, -30], [18, -45]], src=1500)
lay("cranes", "Yellowstone_sound_library_-_Sandhill_Crane_-_001.mp3", 1.9, 8.5, [[1.9, -40], [2.3, -18], [6, -22], [8.5, -40]], src=1, pan=-0.2, lp=6000)
# 2. down tilts (18-34): the lake runs, everything rolls, the wind tears
lay("rush", "Hemlock_stream.ogg", 21.8, 33.7, [[21.8, -40], [23, -18], [31, -16], [33.7, -14]], pan=-0.4)
lay("bleat", "Sheep_bleating.ogg", 25.2, 29.5, [[25.2, -20], [29.5, -30]], loop=False, pan=0.4)
lay("knocks", "Bones_breaking_wood_fire_ice_crackling.ogg", 25, 33.7, [[25, -40], [26.5, -24], [33.7, -18]], src=20, lp=2500, hp=200)
lay("roll", "Earthquake.ogg", 24.5, 33.7, [[24.5, -40], [27, -24], [33.7, -18]], src=30, lp=500)
# 3. the rim (34-44): the ocean roaring at the edge, the mantle grumbling
lay("sea", "Ocean_Waves_on_a_Tropical_Beach.ogg", 34, 44, [[34, -40], [34.6, -20], [43.5, -22], [44, -40]], src=100, lp=2200)
lay("magma", "Earthquake.ogg", 34, 44, [[34, -40], [35, -24], [44, -26]], src=90, lp=300)
# 4. the edges rise (44-58.8): a growing rumble, the oceans pouring, wind
lay("rise", "Earthquake.ogg", 44.2, CUT, [[44.2, -40], [46, -26], [52, -20], [CUT, -15]], src=5, lp=600)
lay("pour", "Ocean_Waves_on_a_Tropical_Beach.ogg", 50, CUT, [[50, -40], [52, -24], [CUT, -16]], src=200, lp=1800)
lay("falls", "Hemlock_stream.ogg", 51, CUT, [[51, -40], [53, -24], [CUT, -18]], src=5, lp=3000, pan=0.3)
lay("wind2", "Howling_wind.ogg", 44.2, CUT, [[44.2, -40], [47, -26], [CUT, -18]], src=60, lp=2500)
# 5. the chaos (59.4-64.3)
lay("chaos", "Earthquake.ogg", 59.6, 64.3, [[59.6, -10], [61, -13], [64.3, -30]], src=60, lp=700)
lay("crack", "Bones_breaking_wood_fire_ice_crackling.ogg", 59.6, 64.2, [[59.6, -16], [64.2, -30]], src=40, hp=300)
lay("water", "Ocean_Waves_on_a_Tropical_Beach.ogg", 59.6, 64.2, [[59.6, -14], [64.2, -30]], src=260, lp=2500)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
