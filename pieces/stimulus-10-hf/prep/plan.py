# ---------------- beat plan (video 10: no more car washes -> the team store raises money) ----------------
HOOK = dict(kicker=[("YOUTH", 0), ("COACHES", 1), ("&amp;", 2), ("CLUB", 3)], big=("DIRECTORS", 4), end=15, k_base=357, big_base=547)
HOOK_HANDOFF, AFTER_HOOK = None, None
BLOCKS = [
    (5, [("how many car washes", "w", 5), ("did your club run last year?", "it", 9)], []),
    (15, [("What if next year", "w", 15), ("the answer was", "it", 19), ("ZERO?", "big", 22)], []),
    (23, [("One of our", "w", 23), ("~Minnesota youth clubs~", "it", 25)], [("team", 27)]),
    (29, [("just raised over", "w", 29), ("$16,000", "big", 32), ("on their last uniform cycle.", "it", 34)], []),
    (39, [("^No car wash,^", "w", 39), ("^no bake sale,^", "it", 42)], []),
    (45, [("here's how.", "w", 45)], [("idea", 46)]),
    (47, [("Your team's store", "w", 47), ("can ~raise money~ while it runs,", "it", 50)], [("store", 49)]),
    (56, [("and it's honestly", "w", 56), ("~pretty simple.~", "it", 59)], [("check", 60)]),
    (61, [("First, you can pick", "w", 61), ("A SMALL EXTRA AMOUNT.", "caps", 65)], []),
    (69, [("It sits on top", "w", 69), ("of every item in your store,", "it", 73)], [("tag", 75)]),
    (79, [("And it works on", "w", 79), ("~fan gear too,~", "it", 83)], [("bag", 84)]),
    (86, [("so when your grandma", "w", 86), ("buys a hoodie,", "it", 90)], [("bags", 90)]),
    (93, [("she's helping", "w", 93), ("~fund the club.~", "it", 95)], [("hand-money", 95)]),
    (98, [("With us, the money", "w", 98), ("comes back to you", "it", 102), ("every month,", "it", 106)], []),
    (108, [("in", "w", 108), ("CASH.", "big", 109)], []),
    (111, [("Now, before you sign up", "w", 111), ("for any store brand fundraiser,", "it", 115)], []),
    (120, [("ask", "w", 120), ("TWO THINGS.", "caps", 121)], []),
    # numbered list 123-144 (own element); the block above stays as its header
    (145, [("Set it up once,", "w", 145)], [("system", 147)]),
    (149, [("and your uniform", "w", 149), ("and fan gear order helps pay", "it", 152), ("FOR THE WHOLE SEASON.", "caps", 158)], []),
    (162, [("Curious what", "w", 162), ("your club could raise?", "it", 164)], [("chart-up", 167)]),
    (168, [("Send us", "w", 168), ("~your player count,~", "it", 170)], [("people", 172)]),
    (173, [("we'll run the numbers", "w", 173), ("with you.", "it", 177)], [("list", 176)]),
]
LIST_HEAD, LIST_END = 120, 145
CHECKS = [(123, "Cash or store credit?"), (135, "Can I turn it off anytime?")]
NUMBERED = True
LIST_TOP = 1150
CTA = [(179, "No pressure,", "w"), (181, "just real numbers", "it"), (184, "~for your club.~", "it")]
CTA_TOP = 1000
CAP_TOP, CAP_BOTTOM = 990, 1440   # chin ~790, hands on the table from ~1440
BURN_OPACITY = 0.38
BURN_CUTS = [2, 5, 8, 13]   # same 4 cuts as before the 00:23 cut (segment 8 removed)
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]
CAM_SEQ, CAM_ENTRIES = "BECDBECD", "IOOI"
CAM_ORIGIN, CAM_X, CAM_Y = "585px 880px", -45, -150
K.ICON, K.ICON_DROP = 160, 115
CTA_BASE = 1090
JERSEY_TINT = "teal"
RISERS = [(32, "riser_fast", 0.93), (109, "riser_fast", 1.1), (120, "riser_fast", 1.1)]
MUSIC_VOL = 0.10
# r3 2026-11-11: riser_fast reaches full level at 0.88 s (plateau 0.88-1.15, no hard hit) -> pk 0.93 lands it on the $16,000 counter (count starts ws(32)-0.05); was 1.1 = 0.15 s early

# ---------------- client round 2026-11-10: b-roll (balanced, 3 cutaways; film burn + purple flash in/out via K.broll) ----------------
# times are AFTER the 00:23 cut (prep/cut_v10.py)
BR = ROOT.parent.parent / "Ref videos Dariel/Stimulus/broll"
BROLL = [   # (clip, clip start s, t_in, t_out, crop_x)
    (BR / "link6/Josh 100 Clips/28-Dribble Pull up Shot.mov", 0.0, 11.71, 14.45, 0.5),  # "no car wash, no bake sale, here's how" -> youth basketball game
    (BR / "link6/Frisbee Catch (1).mov", 6.1, 24.93, 27.55, 0.5),                       # "so when your grandma buys a hoodie, she's helping" -> catch with fans on the sideline
    (BR / "link6/Josh 100 Clips/36-Soccer Steal.mov", 0.5, 40.97, 43.70, 0.5),          # "set it up once ... helps pay for the whole season" -> youth match duel
]
