# make_mix4.py: builds mix4.py (digger-04) from the ep03 mixer (mix3.py): ep04 paths, cue->sound table, code sounds, beds
s = open('mix3.py', encoding='utf-8').read()
s = s.replace('# mix3.py (digger-03 the lock)', '# mix4.py (digger-04 the alarm clock)')
s = s.replace('ROOT = r"F:/Claude Proyectos/pieces/digger-03-lock"', 'ROOT = r"F:/Claude Proyectos/pieces/digger-04-alarm"')
s = s.replace('U = lambda name: f"{CAND}/reuse/{name}.mp3"', 'U = lambda name: f"F:/Claude Proyectos/pieces/digger-03-lock/audio/cand/reuse/{name}.mp3"   # ep03 CC0 reuse (wind, room tone, crickets)')
s = s.replace('music4_stem_', 'music5_stem_')
a = s.index('# ---------- digger-03 code sounds ----------'); b = s.index('F = lambda k:')
s = s[:a] + '''# ---------- digger-04 code sounds ----------
def tick_fast(): return np.concatenate([np.concatenate([pulse(mtof(96), int(0.012 * SR), 0.5) * 0.3, np.zeros(int(0.1 * SR))]) for _ in range(14)])
def puff():   # pea shooter puff: short band-passed breath burst
    from scipy.signal import butter, sosfilt
    n = int(0.11 * SR); x = sosfilt(butter(2, [500 / (SR / 2), 2600 / (SR / 2)], btype="band", output="sos"), np.random.default_rng(4).standard_normal(n))
    return x * env(n, 0.004, 0.06, 0.0, 0.03) * 0.8
def bonk(): n = int(0.2 * SR); f = 420 * 2 ** (-np.linspace(0, 1.6, n)); return (tri(f, n) * 0.8 + np.pad(punch(), (0, n))[:n] * 0.5) * env(n, 0.001, 0.15, 0.0, 0.03)
def buzzer(k=2): return np.concatenate([pulse(mtof(m), int(0.16 * SR), 0.5) * env(int(0.16 * SR), 0.003, 0.1, 0.7, 0.03) * 0.4 for m in (45, 41)[:k]])
def sad_trombone():
    out = []
    for i, m in enumerate((55, 54, 53, 52)):
        n = int((0.22 if i < 3 else 0.6) * SR); out.append(pulse(mtof(m), n, 0.25) * env(n, 0.01, 0.1, 0.7, 0.05) * 0.4)
    return np.concatenate(out)
def phone_ring():   # a modern marimba-ish ringtone (code): two short phrases
    out = []
    for m in (79, 83, 86, 83, 79, 0, 79, 83, 86, 91):
        n = int(0.11 * SR); out.append(np.zeros(n) if m == 0 else (tri(mtof(m), n) * 0.7 + pulse(mtof(m) * 2, n, 0.5) * 0.08) * env(n, 0.002, 0.09, 0.0, 0.02))
    return np.concatenate(out) * 0.7
def nail_push(): n = int(0.18 * SR); f = 900 * 2 ** (np.linspace(0, -0.6, n)); return (tri(f, n) * 0.3 + noise(n, 2) * 0.12) * env(n, 0.01, 0.12, 0.0, 0.04)
''' + s[b:]
a = s.index('    R = {'); b = s.index('    return R[kind]() if kind in R else None')
s = s[:a] + '''    R = {
        "birds_dawn": lambda: (window(load(F("rooster")), 0.0, 3.2, 0.1), -15, 0.4), "sun_shimmer": lambda: (ting(), -17, 0), "sun_sting": lambda: (sting(), -14, 0),
        "snore": lambda: (window(load(F("snoring")), 0.0, 2.2, 0.15), -15, 0), "gasp": lambda: (sting((79, 74, 71, 67), 0.06), -15, 0),
        "clock_tick_fast": lambda: (tick_fast(), -17, 0), "nail_push": lambda: (nail_push(), -14, 0),
        "candle_fizz": lambda: (window(load(F("candle_flame")), 0.5, 3.5, 0.3), -19, 0), "nail_drop": lambda: (onset_cut(load(F("nail_drop")), 0.5), -12, -0.01),
        "clang": lambda: (onset_cut(load(F("metal_clang")), 1.6), -5, -0.01),
        "steam_whistle": lambda: (window(load(F("steam_whistle")), 0.0, 2.2, 0.15), -13, 0), "run_steps": lambda: (window(load(F("running_cobble")), 0.0, 1.8, 0.1), -14, 0),
        "gate_slam": lambda: (onset_cut(load(F("iron_gate")), 1.5), -7, -0.01), "buzzer": lambda: (buzzer(), -14, 0), "cash_register": lambda: (onset_cut(load(F("cash_register")), 1.5), -10, -0.01),
        "spring_boing": lambda: (boing(), -14, 0), "coin_flip": lambda: (onset_cut(load(F("coins")), 0.6), -15, 0), "coins_land": lambda: (onset_cut(load(F("coins")), 1.0), -10, -0.01),
        "coin_ting": lambda: (ting(), -14, 0.02), "footsteps_cobble": lambda: (window(load(F("footsteps_cobble")), 0.0, 2.6, 0.15), -16, 0),
        "tap_glass": lambda: (onset_cut(load(F("glass_tap")), 0.3), -11, -0.01),
        "mailbox_creak": lambda: (window(load(f"{EP1}/mailbox/508281.mp3"), 0.0, 0.9, 0.04), -16, 0),
        "paper": lambda: (load(K("paper/fs-151221-page-turn-2-2")), -16, 0), "comment_pop": lambda: (notif(), -11, 0),
        "bird_chirp": lambda: (window(load(F("birds_morning")), 3.0, 2.2, 0.2), -15, 0), "no_buzz": lambda: (buzzer(1), -16, 0),
        "pea_puff": lambda: (puff(), -12, 0), "pea_tick": lambda: (onset_cut(load(F("pebble_glass")), 0.3), -9, -0.01),
        "window_slam": lambda: (onset_cut(load(F("window_open")), 1.0), -8, -0.01), "grumble": lambda: (onset_cut(load(F("grumble")), 1.2), -12, 0),
        "tick": lambda: (onset_cut(load(F("clock_ticking")), 0.3), -14, 0), "tick_tock": lambda: (window(load(F("clock_ticking")), 0.0, 2.6, 0.15), -14, 0),
        "bell_ring": lambda: (window(load(F("alarm_bell")), 0.0, 2.2, 0.08), -8, -0.01), "many_alarms": lambda: (_many(), -12, 0),
        "sad_trombone": lambda: (sad_trombone(), -15, 0), "button_click": lambda: (onset_cut(load(F("button_click")), 0.3), -8, -0.01),
        "pillow_flop": lambda: (onset_cut(load(F("pillow")), 0.6), -12, 0), "phone_alarm": lambda: (phone_ring(), -14, 0), "tap": lambda: (onset_cut(load(F("button_click")), 0.2), -13, 0),
        "pea_bonk": lambda: (bonk(), -10, 0), "question_pop": lambda: (pop_chip(), -14, 0), "blip": lambda: (blip_up((88, 81), 0.06), -15, 0),
        "label": lambda: (blip_up(), -14, 0), "punch": lambda: (punch(), -13, -0.01), "pop": lambda: (pop_chip(), -14, 0), "follow_pop": lambda: (notif(), -12, 0),
        "end_jingle": lambda: None, "wind_winter": lambda: None, "factory_hum": lambda: None, "london_fog": lambda: None, "cut": lambda: None,
        "mosaic": lambda: (onset_cut(load(K("swish/fs-14175-27-wav-1")), 0.35), -24, -0.1),
    }
''' + s[b:]
s = s.replace("def S(kind):", '''def _many():
    b = load(F("alarm_bell")); n = int(3.6 * SR); out = np.zeros(n)
    for i, (d, g) in enumerate(((0.0, 1.0), (0.45, 0.7), (0.9, 0.55))):
        w = window(b, 0.25 * i, 2.6, 0.1); i0 = int(d * SR); k = min(len(w), n - i0); out[i0:i0 + k] += w[:k] * g
    return out
def S(kind):''')
s = s.replace("REVEAL = {'wood_thud', 'ice_break', 'padlock_land', 'label', 'sting', 'lock_click', 'detector_lock', 'rock_thud', 'surprise_sting'}",
              "REVEAL = {'clang', 'gate_slam', 'bell_ring', 'window_slam', 'button_click', 'label', 'sting', 'pea_tick', 'pea_bonk', 'tap_glass'}")
s = s.replace('if c["kind"] not in ("end_jingle", "wind_start", "night_crickets", "cut"): missing.add(c["kind"])',
              'if c["kind"] not in ("end_jingle", "wind_winter", "factory_hum", "london_fog", "cut"): missing.add(c["kind"])')
a = s.index('wind = load(U("wind_454213"))'); b = s.index('for i in range(len(shots)):')
s = s[:a] + '''wind = load(U("wind_454213")); room = load(U("room_tone_744447")); crick = load(U("night_crickets_451566"))
birds = load(F("birds_morning")); fac = load(F("factory_ambience")); tick = load(F("clock_ticking"))
beds = {"wind": norm_peak(loop_to(wind, N), -1) * db(-21), "room": norm_peak(loop_to(room, N), -1) * db(-25),
        "night": norm_peak(loop_to(window(crick, 0.5, 12, 0.5), N), -1) * db(-26), "tick": norm_peak(loop_to(window(tick, 0, 8, 0.3), N), -1) * db(-28),
        "birds": norm_peak(loop_to(window(birds, 0.5, 20, 0.5), N), -1) * db(-24), "factory": norm_peak(loop_to(window(fac, 0.5, 15, 0.5), N), -1) * db(-25)}
def gate(i):
    a, b = T0[i], T0[i + 1]; g = np.zeros(N); f = int(0.15 * SR); i0, i1 = int(a * SR), int(b * SR)
    g[max(0, i0 - f):i1 + f] = 1
    if i0 - f > 0: g[i0 - f:i0 + f] = np.linspace(0, 1, 2 * f)
    if i1 + f < N: g[i1 - f:i1 + f] = np.linspace(1, 0, 2 * f)
    return g
BED = {1: ["birds", "room"], 2: ["birds", "room"], 3: ["wind", "room"], **{k: ["room"] for k in (4, 5, 6, 7)}, 8: ["factory", "night"], 9: ["factory", "night"],
       10: ["room", "tick"], **{k: ["night"] for k in (11, 12, 13, 16, 17, 18, 19, 20, 25)}, 14: ["birds"], 15: ["birds", "room"], 21: ["room", "tick"], 22: ["room", "tick"],
       23: ["room", "tick"], 24: ["birds"], **{k: ["room", "birds"] for k in (26, 27, 28)}, **{k: ["birds"] for k in (29, 30, 31)}}
''' + s[b:]
open('mix4.py', 'w', encoding='utf-8').write(s)
print('mix4 written')
