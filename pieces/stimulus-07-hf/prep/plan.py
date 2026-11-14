words[3]["s"], words[4]["s"] = 0.96, 1.27   # "and" / "coaches" onsets measured by RMS (Whisper put coaches 0.23 s late)
# ---------------- beat plan (video 7: 5 things before ordering uniforms for next season) ----------------
HOOK = dict(kicker=[("YOUTH", 0), ("CLUB", 1), ("DIRECTORS", 2), ("&amp;", 3)], big=("COACHES", 4), end=14, k_base=269, big_base=459,
            key=("5 THINGS", 16))
HOOK_HANDOFF, AFTER_HOOK = 5, 20
BLOCKS = [
    (5, [("watch this first", "w", 5), ("before ordering uniforms", "it", 8), ("for next season.", "it", 11)], []),
    (20, [("and if you skip one,", "w", 20), ("trust me,", "it", 25), ("^you'll feel it.^", "it", 27)], []),
    (30, [("NUMBER ONE,", "caps", 30), ("sign off on the final design.", "it", 32)], [("one", 31)]),
    (38, [("Don't guess that", "w", 38), ("the uniform company knows", "it", 41), ("you like it.", "it", 45)], []),
    (48, [("Ask to see", "w", 48), ("the ~final design file.~", "it", 51)], [("doc", 53)]),
    (55, [("Check your colors,", "w", 55), ("patterns, logos,", "it", 58), ("and your sponsors.", "it", 60)], []),
    (63, [("Then", "w", 63), ("SIGN OFF ON IT.", "caps", 64)], [("check", 66)]),
    (68, [("NUMBER TWO,", "caps", 68), ("a real ~printed sample.~", "it", 70)], [("two", 69)]),
    (74, [("Here's the thing.", "w", 74)], [("idea", 75)]),
    (77, [("Your screen", "w", 77), ("shows one thing,", "it", 79)], [("call", 78)]),
    (82, [("but fabric", "w", 82), ("SHOWS THE TRUTH.", "caps", 84)], []),
    (87, [("Hold it in your hands", "w", 87), ("before you say yes.", "it", 92)], [("quality", 91)]),
    (96, [("NUMBER THREE,", "caps", 96), ("~sizing samples.~", "it", 98)], [("three", 97)]),
    (100, [("Every brand", "w", 100), ("fits a little differently,", "it", 102)], [("sizing", 102)]),
    (106, [("so let your players", "w", 106), ("try them on at practice.", "it", 110)], [("player", 109)]),
    (115, [("NUMBER FOUR,", "caps", 115), ("have a ~hard delivery date.~", "it", 117)], [("calendar", 120)]),
    (122, [("Make sure it's clear", "w", 122), ("when those uniforms", "it", 126), ("have to be in your hands", "it", 129)], []),
    (135, [("NO MATTER WHAT.", "caps", 135)], []),
    (138, [("Start 12 weeks", "w", 138), ("before that date?", "it", 141), ("~Perfect.~", "it", 144)], []),
    (145, [("Start four weeks before?", "w", 145), ("That's a ^panic.^", "it", 149)], []),
    (152, [("And", "w", 152), ("NUMBER FIVE,", "caps", 153), ("~extras.~", "it", 155)], []),
    (156, [("New players show up,", "w", 156), ("jerseys get lost,", "it", 160), ("it happens.", "it", 163)], []),
    (165, [("Grab two or three", "w", 165), ("spare sets per team", "it", 169)], [("kit", 168), ("kit", 168), ("kit", 168)]),
    (173, [("to eliminate", "w", 173), ("~any hassle.~", "it", 175)], [("check", 175)]),
    (177, [("Get those", "w", 177), ("FIVE RIGHT,", "caps", 179)], [("trophy", 179)]),
    (181, [("and uniform day feels like", "w", 181), ("~a Christmas morning,~", "it", 186)], [("happy", 187)]),
    (189, [("not a", "w", 189), ("^return request.^", "it", 191)], [("return", 191)]),
    (193, [("And hey,", "w", 193), ("at Stimulus,", "it", 195)], []),
    (197, [("the design", "w", 197), ("and the printed sample", "it", 199), ("ARE FREE.", "big", 203)], []),
    (205, [("~No deposit.~", "w", 205)], [("free", 206)]),
    (207, [("Start a design request.", "cta", 207), ("Link in bio.", "cta", 211)], []),   # the user's Europa CTA graphic (white + italic gradient line, jersey icon)
]
LIST_HEAD, LIST_END = None, None
CHECKS = []
NUMBERED = True
LIST_TOP = 1120
CTA = []
CTA_TOP = 1020
CAP_TOP, CAP_BOTTOM = 990, 1420   # standing take: chin ~730, hands from ~1420
BURN_OPACITY = 0.38
BURN_CUTS = [8, 12, 15, 20]
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]
CAM_SEQ, CAM_ENTRIES = "DCBEDCBE", "OIO"
CAM_ORIGIN, CAM_X, CAM_Y = "585px 600px", -45, 90   # standing take: head sits high, frame it lower (still covers at 1.16)
K.ICON, K.ICON_DROP = 160, 115
CTA_BASE = 1090
JERSEY_TINT = "navy"
RISERS = [(30, "riser_fast", 1.1), (152, "riser_fast", 1.1), (195, "riser_fast", 1.1)]
MUSIC_VOL = 0.10

# ---------------- b-roll cutaways (client round 2026-11-10): Premiere film burn + purple flash in and out (hfkit.broll via gen5_body) ----------------
BR = ROOT.parent.parent / "Ref videos Dariel/Stimulus/broll"
BROLL = [   # balanced (user 2026-11-10): talking head stays the star  (clip, clip start s, t_in, t_out, crop_x)
    (BR / "link6/Color is Everything/Color is evrything Dyansty__.mov", 5.1, 16.73, 19.40, 0.5),  # "Check your colors, patterns, logos, sponsors" -> patterned red kit w/ sponsor
    (ROOT / "assets/broll/src_futsal.mp4", 0.15, 27.40, 30.00, 0.5),                   # "Hold it in your hands before you say yes" -> Stimulus futsal kit, player holds his jersey (Futsal JOTP Game.MOV @16.15, letterbox cropped)
    (BR / "link6/HSK Tournament Footage/MVI_0864.MP4", 24.0, 47.82, 50.50, 0.5),       # "New players show up, jerseys get lost" -> kids' jersey backs at the goal
]
import atexit   # 00:57 music a bit loud (client): music_v2.mp3 = music.mp3 -4 dB 55.5-60.0 s (original kept)
atexit.register(lambda p=ROOT / "index.html": p.write_text(p.read_text(encoding="utf-8").replace("assets/music.mp3", "assets/music_v2.mp3"), encoding="utf-8"))
