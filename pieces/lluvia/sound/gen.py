# gen.py: writes layers.json — the recorded bed for lluvia (Wikimedia Commons, CC0 / public domain; see CREDITS.md).
import json
R = "rec/"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=R + file, t0=t0, t1=t1, g=g, **o))
CUT = 62.6   # silence before the roar at 63.3
# 1. the storm comes in (0-5): wind, distant thunder, the last birds
lay("wind", "Howling_wind.ogg", 0, 53.5, [[0, -40], [0.5, -24], [5, -22], [30, -20], [43, -22], [50, -24], [53.5, -45]], src=30)
lay("distant", "Light_Rain_Distant_Thunder_July_5th_2016.wav", 0, 9, [[0, -40], [0.5, -18], [5, -16], [9, -40]], src=0)
# 2. the rain (4.5-53): light, then heavy, on the roofs and the window; on water later
lay("rainlight", "Rain_against_the_window.ogg", 4.5, 14, [[4.5, -40], [6, -16], [10, -14], [14, -30]], src=5)
lay("rainheavy", "Rain_and_thunder_1.ogg", 9, 53.5, [[9, -40], [12, -15], [30, -14], [43, -16], [48, -18], [53, -26], [53.5, -50]], src=0)
lay("rainloop", "Listening_to_Raindrops_1035382_-_heavy_loop.mp3", 11, 43, [[11, -40], [14, -18], [42, -18], [43, -40]], lp=7000, pan=0.3)
lay("rainstorm", "Thunderstorm_after_hot_summer_day_17_minutes_01_of_04.ogg", 43, 53.5, [[43, -40], [44, -17], [52, -19], [53.5, -45]], src=40)
# 3. the flood: rushing water through the streets, a church bell drowning
lay("river", "433589_jackthemurray_stream-river-water-up-close.wav", 14.5, 34, [[14.5, -40], [16.5, -14], [24, -12], [30, -18], [34, -40]], lp=5000)
for k, t in enumerate([2.6, 3.4, 18.0]):
    lay(f"dog{k}", "Bark__avk_.wav", t, t + 0.9, [[t, -24], [t + 0.9, -30]], loop=False, lp=2600, pan=-0.4)
# 4. the jungle (34-43): frogs and insects under the rain
lay("frogs", "Edible_frogs_sounds._May._The_Village_of_Krzemienica_d_Voivodeship_Poland.ogg", 34, 53.5, [[34, -40], [36, -18], [52, -20], [53.5, -40]], lp=6000, pan=-0.3)
lay("jungle", "Walk_in_the_rainforest.ogg", 36, CUT, [[36, -40], [38, -22], [53, -20], [55, -12], [62.5, -16]], src=2, lp=9000, pan=0.3)
# 5. the Carnian (43-53): the volcano rumbles; then the rain stops (53-56): drips, birds, the swamp
lay("volcano", "Earthquake.ogg", 47.5, 57, [[47.5, -40], [48.2, -12], [52, -14], [57, -30]], src=20, lp=300)
lay("boom", "Explosions-LS100152.ogg", 47.6, 50, [[47.6, -14], [50, -30]], loop=False, lp=400)
lay("birds", "404114_felix-blume_toucans-singing-in-the-amazonian-rainforest-brazil.ogg", 53.2, CUT, [[53.2, -40], [54.5, -16], [62.5, -20]], src=10, pan=-0.3)
lay("drips", "Rain_against_the_window.ogg", 53, 58, [[53, -30], [54, -24], [58, -40]], src=40, hp=1500)
json.dump(dict(duration_s=70.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
