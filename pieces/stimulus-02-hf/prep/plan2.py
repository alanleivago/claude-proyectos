# ---------------- beat plan (video 2: bulk order vs team store) ----------------
HOOK = dict(end_word=10)
# blocks: (first word, [(line text, style, word where the line appears)], icons [(name, word)])
# style: w | it | big (gold + yellow line) | caps (uppercase gradient + RGB) | sep (glowing separator)
BLOCKS = [
    (11, [("and you're spending", "w", 11), ("your weekend", "it", 14)], []),
    (16, [("SORTING JERSEYS", "caps", 16), ("in the garage.", "it", 18)], [("shirt", 17)]),
    (21, [("Here's how to pick", "w", 21), ("", "sep", 25), ("THE RIGHT PLAN", "caps", 25)], []),
    (31, [("First,", "w", 31), ("BULK ORDER", "big", 32)], []),
    (34, [("The coach orders", "w", 34), ("for everyone,", "it", 37)], [("clipboard-list", 36)]),
    (42, [("one sheet,", "w", 42), ("", "sep", 44), ("ONE BOX", "caps", 44)], [("package", 45)]),
    (46, [("ships to you.", "it", 46)], [("truck", 46)]),
    (49, [("Great when", "w", 49), ("~the club pays,~", "it", 52)], [("wallet", 54)]),
    (55, [("rosters are small", "w", 55)], [("users", 56)]),
    (59, [("and you're", "w", 59), ("^pressed for time.^", "it", 61)], [("clock", 62)]),
    (64, [("Second,", "w", 64), ("TEAM STORE", "big", 66)], []),
    (68, [("each player orders", "w", 68), ("their own online.", "it", 71)], [("smartphone", 72)]),
    (74, [("It ships right", "w", 74), ("", "sep", 77), ("TO THEIR DOOR", "caps", 77)], [("truck", 79)]),
    (80, [("Great when", "w", 80), ("~families pay,~", "it", 83)], [("users", 84)]),
    (85, [("the club's big", "w", 85), ("or players join", "it", 88), ("mid-season.", "it", 91)], []),
    (94, [("Want the quick test?", "w", 94)], [("zap", 96)]),
    (98, [("Ask yourself", "w", 98), ("THREE QUESTIONS", "caps", 100)], []),
    # numbered list 102-133 (own element); the block above stays as its header
    (134, [("Small order, club pays,", "w", 134), ("you hand them out:", "it", 138), ("GO BULK", "big", 142)], []),
    (144, [("Big order, families pay,", "w", 144), ("shipped to their door:", "it", 148), ("TEAM STORE", "big", 152)], []),
    (155, [("Three questions", "w", 155), ("that save you", "it", 157), ("HOURS", "big", 161)], []),
    (162, [("of ^sorting,^", "w", 162), ("^chasing payments^", "it", 164), ("^& swapping sizes.^", "it", 166)], []),
]
LH = {"w": 110, "it": 102, "big": 200, "caps": 108, "sep": 36}   # line heights (px) -> icon row sits under the block
FS = {"w": 86, "it": 82, "caps": 94}   # caption sizes; any line wider than 960 px is scaled down to fit
LIST_HEAD, LIST_END = 98, 134            # header block word, word where the list leaves
CHECKS = [(102, "How many uniforms?"), (110, "Sizes & payments?"), (118, "Hand out or ship?")]
NUMBERED = True
CTA = [(169, "Still not sure?", "w"), (172, "Tell us your club size,", "w"), (177, "we'll pick for you.", "it"), (186, "Link in bio.", "big")]
BURN_OPACITY = 0.38
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]   # (duration, peak offset) of assets/burnN.mp4
# camera: hard scale change on real cuts AND on these sentence starts; eased zoom-ins on the ZMOVES words
HARD = [21, 31, 49, 64, 80, 94, 102, 110, 118, 134, 144, 155, 169]
ZOOM = [1.16, 1.27, 1.17, 1.28, 1.18, 1.27, 1.16, 1.28, 1.27, 1.17, 1.28, 1.16, 1.27, 1.18]
ZMOVES = [4, 9, 13, 16, 25, 32, 36, 44, 52, 56, 61, 66, 70, 77, 83, 87, 96, 100, 104, 113, 122, 128, 136, 142, 146, 152, 157, 161, 165, 172, 186]
ZSTEP, ZDUR, ZMAX = 0.09, 0.9, 1.42
RISERS = [(9, "riser_fast", 1.1), (32, "riser_fast", 1.1), (66, "riser_fast", 1.1), (100, "riser_fast", 1.1), (186, "riser_fast", 1.1)]

