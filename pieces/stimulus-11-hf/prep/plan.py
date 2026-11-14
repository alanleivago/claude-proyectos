# ---------------- beat plan (video 11: sizing off last year's jersey -> sizing kit at practice) ----------------
HOOK = dict(kicker=[("ARE", 0), ("YOU", 1)], big=("SIZING", 2), end=12, k_base=323, k_sz=104, big_sz=270, big_maxw=1000)
HOOK_HANDOFF, AFTER_HOOK = None, None
BLOCKS = [
    (3, [("your team off of", "w", 3), ("^last year's jersey?^", "it", 7)], [("shirt", 9)]),
    (10, [("~Totally normal.~", "w", 10)], []),
    (12, [("Most clubs do,", "w", 12), ("but it's a big reason", "it", 15)], [("team", 13)]),
    (20, [("kids end up in", "w", 20), ("^the wrong size.^", "it", 24)], [("size", 26)]),
    (27, [("Here's", "w", 27), ("THE PROBLEM.", "caps", 28)], []),
    (30, [("Every brand", "w", 30), ("makes sizes a little different.", "it", 32)], [("sizing", 33)]),
    (37, [("A youth large", "w", 37), ("from one company", "it", 40)], [("shirt", 39)]),
    (43, [("fits like a", "w", 43), ("^medium^ from another.", "it", 46)], [("building", 48)]),
    (49, [("And kids grow,", "w", 49), ("~like a lot.~", "it", 52)], [("growth", 51)]),
    (55, [("So here's how you size a team", "w", 55), ("THE RIGHT WAY.", "caps", 62)], []),
    (65, [("First,", "w", 65), ("GET A SIZING KIT", "caps", 66), ("from your uniform company.", "it", 70)], []),
    (74, [("Every size", "w", 74), ("in the same style", "it", 76), ("you're ordering.", "it", 80)], []),
    (82, [("Then,", "w", 82), ("bring it to practice.", "it", 83)], []),
    (87, [("Players try on the uniforms", "w", 87), ("and find their ~true size.~", "it", 92)], []),
    (97, [("Fifteen minutes.", "w", 97), ("~Done.~", "it", 99)], [("clock", 98)]),
    (101, [("Oh, and", "w", 101), ("BONUS TIP?", "caps", 102)], [("idea", 103)]),
    (104, [("Kids stuck", "w", 104), ("between two sizes?", "it", 106)], [("two", 107)]),
    (109, [("GO UP.", "big", 109)], []),
    (111, [("They'll grow into it", "w", 111), ("by mid-season.", "it", 115)], [("season", 116)]),
    (118, [("Size a team once", "w", 118), ("the right way,", "it", 122)], [("check", 124)]),
    (125, [("and those", "w", 125), ("\"can we swap my kid's jersey\"", "it", 127), ("type of emails,", "it", 133)], []),
    (136, [("pretty much", "w", 136), ("~disappear.~", "it", 138)], []),
    (139, [("That's how we do it", "w", 139), ("at Stimulus.", "it", 144)], []),
    (146, [("~Sizing samples~", "w", 146), ("go out before anyone orders.", "it", 148)], [("box", 148)]),
]
LIST_HEAD, LIST_END = None, None
CHECKS = []
NUMBERED = True
LIST_TOP = 1120
CTA = [(153, "So every kid gets", "w"), (157, "~the right fit~", "it"), (160, "the first time.", "it")]
CTA_TOP = 1000
CAP_TOP, CAP_BOTTOM = 990, 1390   # standing take: chin ~760, hands from ~1420
BURN_OPACITY = 0.38
BURN_CUTS = [3, 5, 9, 12]
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]
CAM_SEQ, CAM_ENTRIES = "ECBDECBD", "OOIOOIOOIOOII"   # round 4: 13th kept cut (real jump at 44.13 s, frame 1058) punches in ON the cut instead of a no-op reset
CAM_ORIGIN, CAM_X, CAM_Y = "585px 600px", -45, 90
K.ICON, K.ICON_DROP = 160, 115
CTA_BASE = 1090
JERSEY_TINT = "green"
RISERS = [(55, "riser_fast", 1.1), (100, "riser_fast", 1.1), (139, "riser_fast", 1.1)]
MUSIC_VOL = 0.10

# ---------------- client round 2026-11-10 ----------------
# opening zoom-out 172->100 with a speed ramp: fast start, eases out (Premiere ease-out / easeOutQuart), was linear 0.4 s
# A_DUR, A_EASE: now global in hfkit.camera (RAMP_DUR 0.40, same V8 curve)
# b-roll (balanced, 3 cutaways; film burn + purple flash in/out via K.broll). Hmong Canon clips were shot sideways:
# assets/broll/src/*_rot_at<s>.mp4 = the segment from <s> rotated upright (ffmpeg transpose=1), so clip start = 0
SRC = ROOT / "assets/broll/src"
BROLL = [   # (clip, clip start s, t_in, t_out, crop_x)
    (SRC / "A006D044_260801JZ_CANON_rot_at0.5.mp4", 0.0, 13.48, 16.10, 0.5),   # "and kids grow, like a lot" -> three little kids in red jerseys
    (SRC / "A006D041_260801CT_CANON_rot_at14.mp4", 0.0, 23.20, 25.90, 0.5),    # "bring it to practice, players try on the uniforms" -> player on the practice field
    (SRC / "A006D100_260801KG_CANON_rot_at7.mp4", 0.0, 34.10, 36.75, 0.5),     # "size a team once the right way" -> team in matching numbered jerseys. Round 3: in 34.41 -> 34.10 so it covers
                                                                                # the jump in the raw take at 34.201 (edit frame 820, not in words_edit segments); out 36.75 stays before the source zoom (clip 2.7 s)
]
