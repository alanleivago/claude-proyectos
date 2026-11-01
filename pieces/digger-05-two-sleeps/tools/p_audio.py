# adapt the Expedition 01 music + mixer to Digger 05
import os, re
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "audio", "scripts")
def edit(fn, pairs, regex=()):
    p = os.path.join(D, fn); s = open(p, encoding="utf-8").read()
    for a, b in pairs:
        assert a in s, (fn, a[:70]); s = s.replace(a, b)
    for a, b in regex:
        s2 = re.sub(a, b, s, flags=re.S); assert s2 != s, (fn, a[:60]); s = s2
    open(p, "w", encoding="utf-8").write(s)
edit("music_d05.py", [("ITEMS = [pstart(p) - 0.02 for p in (7, 12, 16, 24, 32, 34, 37, 40)]", "ITEMS = []   # digger 05: no ITEM GET cards")],
     [(r"PMAP = \{.*?\}\n", 'PMAP = {1: "manual", 2: "past", 5: "manual", 6: "past", 7: "manual", 9: "closing"}   # digger 05: the night (music box) / the past (soft jazz) / the lab / the goodbye\n')])
edit("mix_d05.py", [
    ('"cut": lambda: None, "end_jingle": lambda: None, "town_ambience": lambda: None, "sea_waves": lambda: None,',
     '''"cut": lambda: None, "end_jingle": lambda: None, "town_ambience": lambda: None, "sea_waves": lambda: None,
        # digger 05 cues
        "tick": lambda: (window(load(D4("clock_ticking", 759501)), 0.0, 1.6, 0.1), -16, 0), "gasp": lambda: (sting((79, 74, 71, 67), 0.06), -15, 0),
        "night_amb": lambda: None, "footsteps": lambda: (window(load(D4("footsteps_cobble", 117628)), 0.0, 2.2, 0.15), -15, 0),
        "straw": lambda: (onset_cut(load(A("zipper", 320144)), 0.9), -12, 0), "bed_creak": lambda: (window(load(D2("wood_door_creak", 778447)), 0.0, 0.7, 0.05), -15, 0),
        "pillow_flop": lambda: (onset_cut(load(D4("pillow", 582114)), 0.6), -12, 0), "comment_pop": lambda: (np.concatenate([blip_up((84, 91), 0.05), np.zeros(int(0.02 * SR)), blip_up((88, 93), 0.07, 0.25, 0.45)]), -11, 0),
        "murmur": lambda: (window(load(D3("crowd_murmur", 260122)), 1.0, 2.2, 0.3), -19, 0), "paper": lambda: (load(K("paper/fs-151221-page-turn-2-2")), -16, 0),
        "gas_whoosh": lambda: (onset_cut(load(K("swish/fs-14175-27-wav-1")), 0.6), -14, 0), "squeeze": lambda: (boing(), -15, 0),
        "punch": lambda: (np.sin(2 * np.pi * np.cumsum(160 * 2 ** (-np.linspace(0, 2.5, int(0.18 * SR)))) / SR) * env(int(0.18 * SR), 0.001, 0.12, 0.0, 0.03), -12, 0),
        "lab_hum": lambda: None, "warm_chord": lambda: (sum(pulse(mtof(m), int(0.9 * SR), 0.5, vib=0.1) for m in (65, 69, 72)) * env(int(0.9 * SR), 0.05, 0.4, 0.5, 0.3) * 0.18, -15, 0),
        "question_pop": lambda: (blip_up((76, 88), 0.06), -14, 0), "birds": lambda: None, "blip": lambda: (blip_up((88, 81), 0.06), -15, 0),'''),
    ('src = {"room": loop_to(load(R3("room_tone_744447")), N),', 'src = {"room": loop_to(load(R3("room_tone_744447")), N), "crickets": loop_to(window(load(R3("night_crickets_451566")), 0.5, 12, 0.5), N),'),
    ('LVL = {"room": -27,', 'LVL = {"crickets": -28, "room": -27,'),
    ("music_exp_stem_", "music_d05_stem_"),
], [(r"AREA = \{.*?\}\n", 'AREA = {1: ["room", "crickets"], 2: ["night"], 4: ["room", "fire"], 5: ["room"], 6: ["night"], 7: ["lab"], 8: ["room", "crickets"], 9: ["lab"], 10: ["birds"]}\n')])
print("ok")
