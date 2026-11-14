# ---------------- beat plan (video 3: 4 questions before picking a uniform company) ----------------
HOOK = dict(end_word=16)
HOOK_HANDOFF, AFTER_HOOK = 12, 17   # caption block that hands over to the key words, first block after them
# blocks: (first word, [(line text, style, word where the line appears)], icons [(name, word)])
# style: w | it | big (gold + yellow line) | caps (uppercase gradient + RGB) | sep (glowing separator) | orw (white "or")
BLOCKS = [
    (3, [("& directors,", "it", 3)], []),
    (5, [("picking a new", "w", 5), ("UNIFORM COMPANY", "caps", 8), ("this season?", "it", 10)], []),
    (12, [("Ask these", "w", 12)], []),
    (17, [("The answers tell you", "w", 17), ("way more than", "it", 21), ("THE PRICE SHEET", "caps", 24)], [("receipt", 25)]),
    (27, [("QUESTION 1", "caps", 27), ("If it doesn't fit,", "w", 28), ("what happens?", "it", 32)], [("ruler", 31)]),
    (34, [("The answer you want:", "w", 34), ("WE REMAKE IT", "big", 39)], []),
    (42, [("not,", "w", 42), ("^\"whose fault is it?\"^", "it", 44)], []),
    (48, [("QUESTION 2", "caps", 48), ("Can I reorder", "w", 49), ("this exact design", "it", 52), ("in three years?", "it", 55)], [("calendar", 56)]),
    (58, [("Some big brands", "w", 58), ("^stop making old styles,^", "it", 61)], []),
    (65, [("then your new players", "w", 65), ("^don't match.^", "it", 69)], [("users", 68)]),
    (71, [("It's important to know", "w", 71), ("you can get", "it", 75), ("THE SAME DESIGN", "caps", 78), ("years down the line.", "it", 81)], []),
    (85, [("QUESTION 3", "caps", 85), ("When I call,", "w", 86), ("who picks up?", "it", 89)], [("phone-call", 88)]),
    (92, [("A real person", "w", 92), ("or a ^robot?^", "it", 95)], [("user", 93), ("bot", 97)]),
    (98, [("Who do you want solving", "w", 98), ("your last-minute", "it", 103), ("CHALLENGES?", "caps", 106)], []),
    (107, [("And", "w", 107), ("QUESTION 4", "caps", 108), ("Who sits between", "w", 109), ("me and the factory?", "it", 112)], [("factory", 115)]),
    (116, [("Every company", "w", 116), ("in the middle", "it", 119), ("^adds to your price.^", "it", 122)], [("badge-dollar-sign", 123)]),
    (126, [("Ask all four", "w", 126), ("ON YOUR NEXT CALL", "caps", 129)], [("phone-call", 131)]),
    (133, [("You'll know real fast", "w", 133), ("WHO'S GOT YOUR BACK", "caps", 137), ("after the order ships.", "it", 141)], [("handshake", 139)]),
    (145, [("Here's how we handle it", "w", 145), ("AT STIMULUS", "caps", 151)], []),
    # numbered list 153-170 (own element); the block above stays as its header
]
LH = {"w": 110, "it": 102, "big": 200, "caps": 108, "sep": 36}   # line heights (px) -> icon row sits under the block
FS = {"w": 86, "it": 82, "caps": 94}   # caption sizes; any line wider than 960 px is scaled down to fit
ICON_GAP = 30   # last baseline -> icon ink = same air as between caption lines (~52 px incl. the icon's own padding)
LIST_HEAD, LIST_END = 145, 171           # header block word, word where the list leaves
CHECKS = [(153, "We remake it."), (156, "Your design stays."), (161, "A real person."), (166, "Factory direct.")]
NUMBERED = True
CTA = [(171, "Want to compare?", "w"), (174, "Link in bio.", "big")]
BURN_OPACITY = 0.38
BURN_CUTS = [2, 6, 9, 12]   # which real cuts (index in cut list) get a film burn
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]   # (duration, peak offset) of assets/burnN.mp4
# camera: hard scale change on real cuts AND on these sentence starts; eased zoom-ins on the ZMOVES words
HARD = [17, 27, 34, 48, 58, 71, 85, 92, 98, 107, 116, 126, 133, 145, 153, 156, 161, 166, 171]
ZOOM = [1.16, 1.27, 1.17, 1.28, 1.18, 1.27, 1.16, 1.28, 1.27, 1.17, 1.28, 1.16, 1.27, 1.18]
ZMOVES = [2, 8, 14, 24, 31, 40, 45, 51, 56, 61, 69, 79, 90, 97, 105, 112, 122, 128, 137, 151, 154, 158, 164, 169, 174]
ZSTEP, ZDUR, ZMAX = 0.09, 0.9, 1.42
RISERS = [(27, "riser_fast", 1.1), (85, "riser_fast", 1.1), (145, "riser_fast", 1.1)]

