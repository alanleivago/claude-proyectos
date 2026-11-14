# ---------------- beat plan (video 4: big brands stop making your style, custom never goes away) ----------------
HOOK = dict(end_word=15)
HOOK_HANDOFF, AFTER_HOOK = 6, 16   # caption block that hands over to the key words, first block after them
# blocks: (first word, [(line text, style, word where the line appears)], icons [(name, word)])
# style: w | it | big (gold + yellow line) | caps (uppercase gradient + RGB) | sep (glowing separator) | orw (white "or")
BLOCKS = [
    (3, [("& athletic directors,", "it", 3)], []),
    (6, [("if your team wears", "w", 6), ("A BIG NAME BRAND,", "caps", 10)], []),
    (16, [("You look down your bench,", "w", 16)], []),
    (21, [("three kids,", "w", 21), ("THREE DIFFERENT JERSEYS,", "caps", 23), ("same team.", "it", 26)], [("shirt", 25)]),
    (28, [("Sounds crazy, right?", "w", 28)], []),
    (31, [("It actually happened", "w", 31), ("to our founder,", "it", 34), ("JASON", "big", 37)], []),
    (38, [("He was coaching", "w", 38), ("a high school team.", "it", 41)], [("users", 44)]),
    (45, [("Their uniforms came from", "w", 45), ("A BIG NAME BRAND.", "caps", 49)], [("store", 51)]),
    (53, [("Next year,", "w", 53), ("they needed", "it", 55), ("a few more jerseys,", "it", 57)], [("shirt", 60)]),
    (61, [("but the brand", "w", 61), ("^stopped making their style.^", "it", 64)], []),
    (68, [("So every new kid", "w", 68), ("got whatever", "it", 72), ("^looked close.^", "it", 74)], []),
    (76, [("And to match again,", "w", 76), ("the school had to buy", "it", 80), ("A WHOLE NEW SET", "caps", 85)], [("package", 88)]),
    (92, [("That's", "w", 92), ("A LOT OF MONEY", "big", 93), ("for a few new kids.", "it", 97)], []),
    (102, [("And that's the catch", "w", 102), ("with big brand uniforms.", "it", 106)], []),
    (110, [("When they stop making a style,", "w", 110), ("^it's gone.^", "it", 116)], []),
    (118, [("CUSTOM", "big", 118), ("works differently.", "it", 119)], []),
    (121, [("Here's why.", "w", 121)], [("zap", 122)]),
    (123, [("Your design", "w", 123), ("NEVER GOES AWAY.", "caps", 125)], [("lock", 127)]),
    (128, [("Order one jersey", "w", 128), ("10 years from now", "it", 131), ("~and it still matches.~", "it", 135)], [("calendar", 138)]),
    (139, [("New player joins", "w", 139), ("mid-season,", "it", 142), ("SAME KIT.", "big", 144)], []),
    (146, [("They order it that night", "w", 146), ("and it arrives", "it", 151), ("at their door fast.", "it", 154)], [("truck", 156)]),
    (158, [("You're paying for", "w", 159), ("YOUR CLUB'S LOOK,", "caps", 162)], []),
    (165, [("not for a big logo", "w", 165), ("^& a company in the middle.^", "it", 170)], []),
    (176, [("Name brand looks great", "w", 176), ("on day one.", "it", 180)], []),
    (183, [("CUSTOM", "big", 183), ("~still matches in year five.~", "it", 184)], []),
    (189, [("At Stimulus", "w", 189)], []),
    # numbered list 191-203 (own element); the block above stays as its header
]
LH = {"w": 110, "it": 102, "big": 200, "caps": 108, "sep": 36}   # line heights (px) -> icon row sits under the block
FS = {"w": 86, "it": 82, "caps": 94}   # caption sizes; any line wider than 960 px is scaled down to fit
ICON_GAP = 30   # last baseline -> icon ink = same air as between caption lines (~52 px incl. the icon's own padding)
LIST_HEAD, LIST_END = 189, 204           # header block word, word where the list leaves
CHECKS = [(191, "Your design never goes away."), (196, "Remade 10 years from now.")]
NUMBERED = True
CTA = [(204, "Contact us today,", "w"), (208, "your school may qualify", "it"), (215, "for a free design & sample.", "it"), (222, "Link in bio.", "big")]
BURN_OPACITY = 0.38
BURN_CUTS = [2, 7, 12, 18]   # which real cuts (index in cut list) get a film burn
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]   # (duration, peak offset) of assets/burnN.mp4
# camera: hard scale change on real cuts AND on these sentence starts; eased zoom-ins on the ZMOVES words
HARD = [16, 21, 28, 31, 38, 45, 53, 61, 68, 76, 92, 102, 110, 118, 121, 123, 128, 139, 146, 158, 165, 176, 183, 189, 196, 204, 222]
ZOOM = [1.16, 1.27, 1.17, 1.28, 1.18, 1.27, 1.16, 1.28, 1.27, 1.17, 1.28, 1.16, 1.27, 1.18]
ZMOVES = [2, 10, 14, 23, 29, 37, 40, 50, 64, 74, 85, 94, 105, 116, 118, 125, 131, 137, 144, 153, 162, 169, 179, 185, 193, 198, 216, 222]
ZSTEP, ZDUR, ZMAX = 0.09, 0.9, 1.42
RISERS = [(31, "riser_fast", 1.1), (118, "riser_fast", 1.1), (189, "riser_fast", 1.1)]

