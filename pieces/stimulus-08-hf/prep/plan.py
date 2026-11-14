# ---------------- beat plan (video 8: team store closes after 2 weeks -> ours never closes) ----------------
HOOK = dict(kicker=[], big=("COACHES", 0), end=14, big_base=440, big_sz=270, big_maxw=1010)
HOOK_HANDOFF, AFTER_HOOK = None, None
BLOCKS = [
    (1, [("has this ever", "w", 1), ("happened to you?", "it", 4)], []),
    (7, [("Your team store", "w", 7), ("^closes after two weeks,^", "it", 10)], [("store", 9), ("calendar", 12)]),
    (14, [("then a new player joins", "w", 14), ("in the middle of", "it", 19), ("WEEK SIX.", "big", 23)], []),
    (25, [("^Now what?^", "w", 25)], [("choices", 26)]),
    (27, [("This happens", "w", 27), ("every single season.", "it", 29)], [("season", 31)]),
    (32, [("The store opens,", "w", 32), ("the store ^closes.^", "it", 35)], [("store", 33)]),
    (38, [("The orders ship,", "w", 38), ("then a new kid shows up,", "it", 41)], [("truck", 40), ("player", 44)]),
    (47, [("and now the coach has to", "w", 47), ("place a ^special order^", "it", 53), ("for one kid.", "it", 57)], []),
    (60, [("Meanwhile,", "w", 60), ("the kid's playing", "it", 61), ("^in a pinny.^", "it", 64)], []),
    (67, [("Here's what a", "w", 67), ("GOOD TEAM STORE", "caps", 70), ("actually does.", "it", 73)], []),
    (75, [("It stays open", "w", 75), ("~all season,~", "it", 78)], [("store", 76), ("season", 79)]),
    (80, [("March, November,", "w", 80), ("doesn't matter.", "it", 82)], [("calendar", 80)]),
    (84, [("A player joins,", "w", 84), ("they ~order that night.~", "it", 87)], [("player", 85), ("ticket", 88)]),
    (91, [("It ships to", "w", 91), ("each player's door,", "it", 94)], [("truck", 92)]),
    (97, [("and it arrives", "w", 97), ("FAST.", "big", 100)], []),
    (103, [("And the store keeps", "w", 103), ("game uniforms and warmups", "it", 105), ("all in one link,", "it", 110)], []),
    (114, [("~all season long.~", "it", 114)], [("season", 115)]),
    (117, [("So ask your uniform company", "w", 117), ("ONE SIMPLE QUESTION.", "caps", 122)], []),
    (125, [("Does my store", "w", 125), ("^ever close?^", "it", 128)], [("store", 127)]),
    (130, [("If the answer is yes,", "w", 130), ("get ready for a lot of", "it", 135), ("^special orders.^", "it", 141)], []),
    (143, [("Our team stores", "w", 143), ("NEVER CLOSE,", "caps", 146)], [("store", 145)]),
    (148, [("and they don't cost you", "w", 148), ("~a thing.~", "it", 153)], [("free", 154)]),
    (155, [("Want one", "w", 155), ("for your club?", "it", 157)], [("team", 159)]),
    (160, [("Just reach out.", "w", 160)], [("phone", 161)]),
    (163, [("Next time a new kid", "w", 163), ("joins in week six,", "it", 168)], [("player", 167)]),
]
LIST_HEAD, LIST_END = None, None
CHECKS = []
NUMBERED = True
LIST_TOP = 1120
CTA = [(172, "they can order", "w"), (175, "~that same night.~", "it")]
CTA_TOP = 930
CAP_TOP, CAP_BOTTOM = 900, 1230   # he holds a ball low on his chest: captions sit on the chest ABOVE it (zoom origin on the ball top keeps it below ~1150)
BURN_OPACITY = 0.38
BURN_CUTS = [7, 12, 16, 18]
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]
CAM_SEQ, CAM_ENTRIES = "EBDCEBDC", "IOO"
CAM_ORIGIN, CAM_X, CAM_Y = "585px 1250px", -45, 100
K.ICON, K.ICON_DROP = 130, 105
CTA_BASE = 1090
JERSEY_TINT = "red"
RISERS = [(67, "riser_fast", 1.1), (143, "riser_fast", 1.1)]
MUSIC_VOL = 0.10

# ---------------- client round 2026-11-10 ----------------
# opening zoom-out 172->100 with a speed ramp: fast start, eases out (Premiere ease-out / easeOutQuart), was linear 0.4 s
# A_DUR, A_EASE: now global in hfkit.camera (RAMP_DUR 0.40, same V8 curve)
# b-roll (balanced, 3 cutaways; film burn + purple flash in/out via K.broll)
BR = ROOT.parent.parent / "Ref videos Dariel/Stimulus/broll"
BROLL = [   # (clip, clip start s, t_in, t_out, crop_x)
    (BR / "link6/The Froehlich Project.mp4", 3.8, 11.26, 13.90, 0.47),               # "the orders ship, then a new kid shows up" -> kids in new jerseys walking onto the field
    (BR / "link6/Josh 100 Clips/26-soccoer edit.mov", 6.25, 20.92, 23.95, 0.5),      # "it stays open all season, March, November" -> keeper at sunset. Round 3: out 23.40 -> 23.95 so it covers the
                                                                                      # cut seen at 23.482 (edit frame 563; edit picture runs ~3 frames behind words_edit), out-burn ends 24.25 < next cut 24.316; shot ends 9.38 in the source
    (BR / "link6/Stimulis soccer Girls game.MOV", 28.2, 29.78, 32.40, 0.5),          # "game uniforms and warmups all in one link" -> Stimulus white kit in a match
    (BR / "link6/Stimulis boys game.mov", 13.55, 41.20, 44.25, 0.5),                  # round 3: "our team stores never close, and they don't cost you a thing" -> Stimulus kits: handshake #4, team photo,
                                                                                      # STIMULUS logo on the shorts; in-burn after the 40.749 cut, out 44.25 covers the camera change at 43.877 + the edit cut at 44.002
]
