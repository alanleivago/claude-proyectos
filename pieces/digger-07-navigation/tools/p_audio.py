# builds audio/scripts/music_d07.py and mix_d07.py from the digger-06 versions (paths, area map, cue sounds, beds)
D6 = r"F:/Claude Proyectos/pieces/digger-06-bathing/audio/scripts"; D7 = r"F:/Claude Proyectos/pieces/digger-07-navigation/audio/scripts"
m = open(f"{D6}/music_d06.py", encoding="utf-8").read()
a = m[m.index("PMAP = {"):m.index("\n", m.index("PMAP = {"))]
m = m.replace(a, 'PMAP = {1: "dungeon", 2: "manual", 3: "past", 5: "dungeon", 7: "boss", 8: "closing"}   # digger 07: lost at sea / the stars / beach + Rome / compass + charts / longitude + Harrison / satellites + goodbye')
open(f"{D7}/music_d07.py", "w", encoding="utf-8").write(m)
x = open(f"{D6}/mix_d06.py", encoding="utf-8").read()
R = [
 ('ROOT = r"F:/Claude Proyectos/pieces/digger-06-bathing"', 'ROOT = r"F:/Claude Proyectos/pieces/digger-07-navigation"'),
 ('music_d06_stem_', 'music_d07_stem_'),
 ('        "shower_run": lambda: None,\n',
  '        "shower_run": lambda: None,\n'
  '        # digger 07 cues (Freesound CC0, picked with earshot rank; see CREDITS.md)\n'
  '        "sea_amb": lambda: None, "night_amb": lambda: None, "beach_amb": lambda: None,\n'
  '        "twinkle": lambda: (np.concatenate([blip_up((88, 95), 0.05, 0.25, 0.4), np.zeros(int(0.03 * SR)), blip_up((91, 100), 0.06, 0.25, 0.35)]), -15, 0),\n'
  '        "wind": lambda: (window(load(R3("wind_454213")), 0.5, 2.4, 0.4), -14, 0), "sand_drop": lambda: (onset_cut(load(D2("wood_thud", 325267)), 0.5), -13, 0),\n'
  '        "stone_tap": lambda: (onset_cut(load(C7("stone_tap", 350343)), 0.5), -11, 0), "splat": lambda: (onset_cut(load(C6("bath_splash", 333349)), 0.4), -15, 0),\n'
  '        "creak": lambda: (window(load(C7("ship_creak", 338286)), 0.0, 2.0, 0.2), -15, 0), "crash": lambda: (onset_cut(load(C7("wood_crash", 343164)), 1.4), -9, -0.01),\n'
  '        "chime": lambda: (load(K("chime/fs-185822-single-chime-1")), -13, 0), "whoosh": lambda: (onset_cut(load(K("whoosh/fs-109747-hit-with-swooshed-material-a-2")), 0.8), -14, 0),\n'),
 ('C6 = lambda k, i: f"{P}/digger-06-bathing/audio/cand/{k}/{i}.mp3";', 'C6 = lambda k, i: f"{P}/digger-06-bathing/audio/cand/{k}/{i}.mp3"; C7 = lambda k, i: f"{P}/digger-07-navigation/audio/cand/{k}/{i}.mp3";'),
 ('src.update({"river":', 'src.update({"waves": loop_to(window(load(C7("waves", 876387)), 0.5, 30, 0.6), N), "river":'),
 ('LVL = {"river": -21,', 'LVL = {"waves": -22, "river": -21,'),
]
for a, b in R:
    assert x.count(a) == 1, a[:70]; x = x.replace(a, b)
i = x.index("AREA = {"); j = x.index("\n", i)
x = x[:i] + 'AREA = {1: ["waves", "wind"], 2: ["night"], 3: ["waves", "birds"], 4: ["birds"], 5: ["waves"], 6: ["room"], 7: ["waves"], 8: ["town", "birds"], 9: ["lab"]}' + x[j:]
open(f"{D7}/mix_d07.py", "w", encoding="utf-8").write(x); print("ok")
