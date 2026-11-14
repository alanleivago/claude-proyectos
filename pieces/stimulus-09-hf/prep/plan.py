words[1]["s"], words[2]["s"] = 0.51, 0.79   # "uniform" / "parent" onsets by RMS (Whisper had them 0.2-0.4 s late)
# ---------------- beat plan (video 9: the uniform parent volunteer -> let families order themselves) ----------------
HOOK = dict(kicker=[("HEY,", 0), ("UNIFORM", 1)], big=("PARENT!", 2), end=11, k_base=622, k_sz=78, big_sz=250, big_maxw=960)
HOOK_HANDOFF, AFTER_HOOK = None, None
BLOCKS = [
    (3, [("yeah you,", "it", 3)], []),
    (5, [("the one who", "w", 5), ("collects the sizes,", "it", 8)], [("size", 10)]),
    (11, [("chases the payments", "w", 11), ("and sorts the boxes,", "it", 14)], [("hand-money", 13), ("box", 17)]),
    (18, [("this one's", "w", 18), ("FOR YOU,", "caps", 20)], []),
    (22, [("and for every club director", "w", 22), ("who wants to ~keep you.~", "it", 27)], [("leader", 26)]),
    (32, [("And honestly,", "w", 32), ("can you blame them?", "it", 34)], []),
    (38, [("Think about", "w", 38), ("THEIR JOB,", "caps", 40)], []),
    (42, [("collecting sizes", "w", 42), ("from ^80 families,^", "it", 44)], [("sizing", 43), ("people", 46)]),
    (47, [("chasing payments", "w", 47), ("on ^Venmo,^", "it", 49)], [("call", 50)]),
    (51, [("and fixing", "w", 51), ("^the spreadsheet,^", "it", 53)], [("list", 54)]),
    (55, [("sorting through", "w", 55), ("a ^mountain of boxes,^", "it", 57)], [("packages", 58)]),
    (61, [("handing out jerseys", "w", 61), ("at practice,", "it", 64)], [("shirt", 63)]),
    (66, [("and then dealing with", "w", 66), ("^all the swaps,^", "it", 70)], [("exchange", 72)]),
    (73, [("all for", "w", 73), ("FREE.", "big", 75)], []),
    (76, [("So here's how you take it", "w", 76), ("off their plate.", "it", 82)], []),
    (85, [("Let families", "w", 85), ("~order for themselves.~", "it", 87)], [("people", 86)]),
    (90, [("ONE TEAM STORE,", "caps", 90), ("one link,", "it", 93)], [("store", 91)]),
    (95, [("shipped to", "w", 95), ("~each player's door.~", "it", 97)], [("truck", 95)]),
    (100, [("Nobody sorting boxes", "w", 100), ("in their garage,", "it", 103)], [("box", 102)]),
    (106, [("and send order questions", "w", 106), ("straight to the uniform company,", "it", 110)], []),
    (115, [("not to", "w", 115), ("^your volunteer.^", "it", 117)], [("person", 118)]),
    (119, [("Your volunteer should be", "w", 119), ("~coaching, cheering,~", "it", 123)], [("whistle", 123)]),
    (125, [("or just", "w", 125), ("enjoying the game,", "it", 127)], [("ball", 129)]),
    (130, [("not running", "w", 130), ("A WAREHOUSE.", "caps", 132)], []),
    (134, [("Know your club's", "w", 134), ("~uniform parent?~", "it", 137)], [("person", 138)]),
    (139, [("Send this", "w", 139), ("TO THEM.", "caps", 141)], []),
]
LIST_HEAD, LIST_END = None, None
CHECKS = []
NUMBERED = True
LIST_TOP = 1120
CTA = [(143, "Trust me,", "w"), (145, "~they'll thank you.~", "it")]
CTA_TOP = 1030
CAP_TOP, CAP_BOTTOM = 1000, 1360   # seated low in frame: chin ~990, clasped hands from ~1300
BURN_OPACITY = 0.38
BURN_CUTS = [4, 8, 12, 14]
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]
CAM_SEQ, CAM_ENTRIES = "CDEBCDEB", "OIOO"
CAM_ORIGIN, CAM_X, CAM_Y = "585px 880px", -45, -150
K.ICON, K.ICON_DROP = 130, 105
CTA_BASE = 1090
JERSEY_TINT = "purple"
RISERS = [(76, "riser_fast", 1.1), (134, "riser_fast", 1.1)]
MUSIC_VOL = 0.10

# ---------------- client round 2026-11-10: b-roll (balanced, 3 cutaways; film burn + purple flash in/out via K.broll) ----------------
BR = ROOT.parent.parent / "Ref videos Dariel/Stimulus/broll"
BROLL = [   # (clip, clip start s, t_in, t_out, crop_x)
    (BR / "link6/KFA v Saint Paul United FC/MVI_2145.MP4", 0.1, 10.25, 12.95, 0.6),  # round 3: right after "And honestly" -> "can you blame them? Think about their job" -> red kits
                                                                                      # (Stimulus Athletic on the chest) in a match; in-burn starts 9.82 after the 9.43 cut and the hook title
    (BR / "link6/Josh 100 Clips/32-Baseball Warmup.mov", 1.3, 19.63, 22.40, 0.5),    # "handing out jerseys at practice, dealing with all the swaps" -> player warming up in uniform
    (BR / "link6/frisbee edit.mov", 7.9, 27.86, 30.55, 0.5),                         # "one team store, one link, shipped to each player's door" -> teammates in matching kits
    (BR / "link6/frisbee catch edit.mov", 9.8, 38.14, 40.90, 0.5),                   # "coaching, cheering, or just enjoying the game" -> team celebrating
]
