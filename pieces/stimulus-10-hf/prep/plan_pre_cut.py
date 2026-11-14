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
    (79, [("only your club leaders", "w", 79), ("see that extra part.", "it", 83)], []),
    (87, [("And it works on", "w", 87), ("~fan gear too,~", "it", 91)], [("bag", 92)]),
    (94, [("so when your grandma", "w", 94), ("buys a hoodie,", "it", 98)], [("bags", 98)]),
    (101, [("she's helping", "w", 101), ("~fund the club.~", "it", 103)], [("hand-money", 103)]),
    (106, [("With us, the money", "w", 106), ("comes back to you", "it", 110), ("every month,", "it", 114)], []),
    (116, [("in", "w", 116), ("CASH.", "big", 117)], []),
    (119, [("Now, before you sign up", "w", 119), ("for any store brand fundraiser,", "it", 123)], []),
    (128, [("ask", "w", 128), ("TWO THINGS.", "caps", 129)], []),
    # numbered list 131-152 (own element); the block above stays as its header
    (153, [("Set it up once,", "w", 153)], [("system", 155)]),
    (157, [("and your uniform", "w", 157), ("and fan gear order helps pay", "it", 160), ("FOR THE WHOLE SEASON.", "caps", 166)], []),
    (170, [("Curious what", "w", 170), ("your club could raise?", "it", 172)], [("chart-up", 175)]),
    (176, [("Send us", "w", 176), ("~your player count,~", "it", 178)], [("people", 180)]),
    (181, [("we'll run the numbers", "w", 181), ("with you.", "it", 185)], [("list", 184)]),
]
LIST_HEAD, LIST_END = 128, 153
CHECKS = [(131, "Cash or store credit?"), (143, "Can I turn it off anytime?")]
NUMBERED = True
LIST_TOP = 1150
CTA = [(187, "No pressure,", "w"), (189, "just real numbers", "it"), (192, "~for your club.~", "it")]
CTA_TOP = 1000
CAP_TOP, CAP_BOTTOM = 990, 1440   # chin ~790, hands on the table from ~1440
BURN_OPACITY = 0.38
BURN_CUTS = [2, 5, 9, 14]
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]
CAM_SEQ, CAM_ENTRIES = "BECDBECD", "IOOI"
CAM_ORIGIN, CAM_X, CAM_Y = "585px 880px", -45, -150
K.ICON, K.ICON_DROP = 160, 115
CTA_BASE = 1090
JERSEY_TINT = "teal"
RISERS = [(32, "riser_fast", 1.1), (117, "riser_fast", 1.1), (128, "riser_fast", 1.1)]
MUSIC_VOL = 0.10

