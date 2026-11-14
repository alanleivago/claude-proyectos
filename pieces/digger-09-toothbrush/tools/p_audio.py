# music_d09.py + mix_d09.py from the digger-07 versions (areas per paragraph, cue sounds, beds)
D7 = r"F:/Claude Proyectos/pieces/digger-07-navigation/audio/scripts"; D9 = r"F:/Claude Proyectos/pieces/digger-09-toothbrush/audio/scripts"
m = open(f"{D7}/music_d07.py", encoding="utf-8").read()
a = m[m.index("PMAP = {"):m.index("\n", m.index("PMAP = {"))]
m = m.replace(a, 'PMAP = {1: "past", 6: "manual", 8: "dungeon", 11: "past", 12: "closing"}   # digger 09: desert + oasis / China / prison + shop / 1938 lab / goodbye')
open(f"{D9}/music_d09.py", "w", encoding="utf-8").write(m)
x = open(f"{D7}/mix_d07.py", encoding="utf-8").read()
R = [
 ('ROOT = r"F:/Claude Proyectos/pieces/digger-07-navigation"', 'ROOT = r"F:/Claude Proyectos/pieces/digger-09-toothbrush"'),
 ('music_d07_stem_', 'music_d09_stem_'),
 ('C7 = lambda k, i: f"{P}/digger-07-navigation/audio/cand/{k}/{i}.mp3";', 'C7 = lambda k, i: f"{P}/digger-07-navigation/audio/cand/{k}/{i}.mp3"; C9 = lambda k, i: f"{P}/digger-09-toothbrush/audio/cand/{k}/{i}.mp3";'),
 ('        "chime": lambda: (load(K("chime/fs-185822-single-chime-1")), -13, 0),',
  '        "chime": lambda: (load(K("chime/fs-185822-single-chime-1")), -13, 0),\n'
  '        # digger 09 cues (Freesound CC0, picked with earshot rank)\n'
  '        "drone_buzz": lambda: (window(load(C9("drone", 854352)), 0.5, 4.5, 0.4), -15, 0), "sand_whoosh": lambda: (window(load(R3("wind_454213")), 0.5, 1.8, 0.2), -12, 0),\n'
  '        "sparkle": lambda: (sting((88, 95, 100), 0.05), -17, 0), "pop": lambda: (blip_up((72, 84), 0.05), -14, 0), "brush_scrub": lambda: (window(load(C9("toothbrush", 547529)), 0.3, 2.0, 0.1), -13, 0),\n'
  '        "twig_chew": lambda: (onset_cut(load(C9("chew_wood", 707805)), 0.8), -13, 0), "market_amb": lambda: (window(load(C9("market", 522991)), 1.0, 5.0, 0.5), -20, 0),\n'
  '        "oink": lambda: (onset_cut(load(C9("pig_oink", 442907)), 1.2), -12, 0), "gross": lambda: (sting((67, 63, 58), 0.08), -14, 0),\n'
  '        "jail_door": lambda: (onset_cut(load(C7("wood_crash", 343164)), 1.0), -12, -0.01), "drill": lambda: (window(load(A("zipper", 320144)), 0.0, 1.2, 0.05), -15, 0),\n'
  '        "tie": lambda: (load(K("paper/fs-151221-page-turn-2-2")), -17, 0), "drip": lambda: (np.concatenate([onset_cut(load(C7("stone_tap", 350343)), 0.1) * 0.5, np.zeros(int(0.25 * SR)), onset_cut(load(C7("stone_tap", 350343)), 0.1) * 0.4]), -18, 0),\n'
  '        "germs": lambda: (np.concatenate([blip_up((60, 63), 0.06), blip_up((61, 64), 0.06), blip_up((59, 62), 0.06)]), -15, 0), "machine": lambda: (lab_hum(int(2.5 * SR)) * env(int(2.5 * SR), 0.2, 2.0, 0.6, 0.3), -20, 0),'),
 ('src.update({"waves":', 'src.update({"desert": loop_to(window(load(C9("wind_desert", 645305)), 0.5, 30, 0.6), N), "waves":'),
 ('LVL = {"waves": -22,', 'LVL = {"desert": -24, "waves": -22,'),
]
for a, b in R:
    assert x.count(a) == 1, a[:70]; x = x.replace(a, b)
i = x.index("AREA = {"); j = x.index("\n", i)
x = x[:i] + 'AREA = {1: ["desert"], 4: ["desert", "birds"], 6: ["room"], 8: ["room", "drip"], 10: ["room"], 11: ["lab"], 12: ["desert", "birds"]}' + x[j:]
open(f"{D9}/mix_d09.py", "w", encoding="utf-8").write(x); print("ok")
