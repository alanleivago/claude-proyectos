# builds audio/scripts/music_d06.py and mix_d06.py from the digger-05 versions (paths, area map, cue sounds, beds)
import os
D5 = r"F:/Claude Proyectos/pieces/digger-05-two-sleeps/audio/scripts"; D6 = r"F:/Claude Proyectos/pieces/digger-06-bathing/audio/scripts"
m = open(f"{D5}/music_d05.py", encoding="utf-8").read()
a = 'PMAP = {1: "manual", 2: "past", 5: "manual", 6: "past", 7: "manual", 9: "closing"}'
assert a in m
m = m.replace(a, 'PMAP = {1: "manual", 2: "past", 4: "dungeon", 5: "manual", 6: "past", 7: "dungeon", 8: "closing"}   # digger 06: the bedroom / river+Rome / stews / doctors / tin tub / Feetham / modern shower + goodbye')
open(f"{D6}/music_d06.py", "w", encoding="utf-8").write(m)

x = open(f"{D5}/mix_d05.py", encoding="utf-8").read()
R = [
 ('ROOT = r"F:/Claude Proyectos/pieces/digger-05-two-sleeps"', 'ROOT = r"F:/Claude Proyectos/pieces/digger-06-bathing"'),
 ('music_d05_stem_', 'music_d06_stem_'),
 ('music_d *= db((voice_l - 13) - lufs(music_d))', 'music_d *= db((voice_l - 14) - lufs(music_d))   # d06 (user): voice ~14 dB over the music'),
 ('        "question_pop": lambda: (blip_up((76, 88), 0.06), -14, 0), "birds": lambda: None, "blip": lambda: (blip_up((88, 81), 0.06), -15, 0),\n',
  '        "question_pop": lambda: (blip_up((76, 88), 0.06), -14, 0), "birds": lambda: None, "blip": lambda: (blip_up((88, 81), 0.06), -15, 0),\n'
  '        # digger 06 cues (Freesound CC0, chosen with earshot rank; see CREDITS.md)\n'
  '        "meter": lambda: (sting((79, 84, 88), 0.05), -15, 0), "sniff": lambda: (onset_cut(load(C6("sniff", 346677)), 0.9), -12, 0),\n'
  '        "splash": lambda: (window(load(C6("bath_splash", 417786)), 0.0, 1.4, 0.06), -11, 0), "shiver_brr": lambda: (onset_cut(load(C6("shiver", 436785)), 1.2), -12, 0),\n'
  '        "teeth": lambda: (window(load(D1("teeth", 517676)), 0.0, 1.4, 0.08), -14, 0), "water_amb": lambda: (window(load(C6("bath_splash", 333349)), 0.0, 2.2, 0.1), -16, 0),\n'
  '        "oil_pour": lambda: (onset_cut(load(C6("oil_pour", 700153)), 1.6), -13, 0), "scrape": lambda: (onset_cut(load(C6("metal_scrape", 337843)), 1.4), -13, 0),\n'
  '        "steam_hiss": lambda: (window(load(D3("steam_hiss", 479296)), 0.0, 1.6, 0.15), -16, 0), "zap": lambda: (load(K("zap/" + ZAP)), -13, 0),\n'
  '        "stamp": lambda: (onset_cut(load(Z3("stamp", 683031)), 0.6), -9, -0.01), "cloth": lambda: (onset_cut(load(ZL("cloth", 320142)), 1.0), -12, 0),\n'
  '        "spray": lambda: (onset_cut(load(C6("spray_bottle", 536407)), 1.2), -11, 0), "water_pour": lambda: (window(load(Z3("water_glug", 845133)), 0.0, 1.5, 0.08), -13, 0),\n'
  '        "pump": lambda: (np.concatenate([onset_cut(load(C6("hand_pump", 832470)), 1.0), onset_cut(load(C6("hand_pump", 832466)), 1.0)]), -12, 0),\n'
  '        "chain_pull": lambda: (window(load(D2("chain_pull", 593458)), 0.0, 1.0, 0.05), -12, 0), "water_splash": lambda: (window(load(D2("water_tank_gush", 271668)), 0.0, 2.5, 0.2), -11, 0),\n'
  '        "shower_run": lambda: None,\n'),
 ('R3 = lambda n: f"{P}/digger-03-lock/audio/cand/reuse/{n}.mp3"',
  'R3 = lambda n: f"{P}/digger-03-lock/audio/cand/reuse/{n}.mp3"\n'
  'C6 = lambda k, i: f"{P}/digger-06-bathing/audio/cand/{k}/{i}.mp3"; D1 = lambda k, i: f"{P}/digger-01-fridge/audio/cand/{k}/{i}.mp3"\n'
  'Z3 = lambda k, i: f"{P}/zombie-03-station/audio/cand/{k}/{i}.mp3"; ZL = lambda k, i: f"{P}/zombie-03-station/largo/audio/cand/{k}/{i}.mp3"\n'
  'ZAP = sorted(os.listdir(f"{KIT}/zap"))[0][:-4]'),
 ('LVL = {"crickets": -28,', 'src.update({"river": loop_to(window(load(C6("river", 734931)), 0.5, 30, 0.6), N), "shower": loop_to(window(load(C6("shower", 365656)), 0.3, 8, 0.4), N)})\nLVL = {"river": -21, "shower": -22, "crickets": -28,'),
 ('AREA = {1: ["room", "crickets"], 2: ["night"], 4: ["room", "fire"], 5: ["room"], 6: ["night"], 7: ["lab"], 8: ["room", "crickets"], 9: ["lab"], 10: ["birds"]}',
  'AREA = {1: ["room", "birds"], 2: ["river", "birds"], 3: ["room", "drip"], 4: ["room", "fire"], 5: ["room", "birds"], 6: ["room", "fire"], 7: ["room"], 8: ["shower"], 9: ["room"]}'),
]
for a, b in R:
    assert x.count(a) == 1, a[:60]
    x = x.replace(a, b)
open(f"{D6}/mix_d06.py", "w", encoding="utf-8").write(x); print("ok")
