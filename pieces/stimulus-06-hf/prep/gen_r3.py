"""Writes index.html (HyperFrames) for Stimulus 06 from the word timings + the beat plan below.
Shared body (approved v4 code + v5 corrections): styles/stimulus/gen5_body.py
Markup in caption lines:  ^red^  ~green~
Run: python prep/gen.py   then  npx hyperframes check / snapshot / render
"""
import html, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KIT = ROOT.parent.parent / "styles/stimulus"
sys.path.insert(0, str(KIT))
import hfkit as K
K.install(ROOT)
W = json.loads((ROOT / "prep/words_edit.json").read_text())
words, segs, D = W["words"], W["segments"], W["duration"]
OUTRO = 2.336
TOTAL = round(D - 0.3 + OUTRO, 3)
WORD_FIX = {}
for i, s in WORD_FIX.items(): words[i]["s"] = s
ws = lambda i: words[i]["s"]
we = lambda i: words[i]["e"]

# ---------------- beat plan (video 6: jersey reveal party at a bowling alley) ----------------
HOOK = dict(kicker=[("YOUTH", 0), ("CLUB", 1)], big=("DIRECTORS", 2), end=11, k_base=630, k_sz=86)
HOOK_HANDOFF, AFTER_HOOK = None, None
BLOCKS = [
    (3, [("got a brand new uniform", "w", 3), ("for next season?", "it", 8)], [("kit", 7), ("calendar", 9)]),
    (11, [("Don't just post", "w", 11), ("a picture of it ^online,^", "it", 14)], [("call", 15)]),
    (19, [("throw a", "w", 19), ("JERSEY REVEAL PARTY.", "caps", 21)], [("happy", 22)]),
    (24, [("We work with", "w", 24), ("a lot of clubs", "it", 27)], [("people", 30)]),
    (31, [("and one of them", "w", 31), ("does this better", "it", 35)], [("trophy", 37)]),
    (39, [("than any club", "w", 39), ("we've ever seen.", "it", 41)], []),
    (44, [("Every year", "w", 44), ("they take over", "it", 46), ("A BOWLING ALLEY.", "caps", 49)], []),
    (52, [("Families, coaches,", "w", 52), ("players, club members,", "it", 54)], [("group", 52), ("whistle", 53), ("player", 54)]),
    (57, [("everybody's there.", "it", 57)], []),
    (59, [("Here's how", "w", 59), ("their night goes.", "it", 61)], [("clock", 62)]),
    (64, [("FIRST", "big", 64), ("they catch everyone up.", "it", 65)], []),
    (69, [("New coaches, new teams,", "w", 69), ("what's coming this season?", "it", 73)], [("whistle", 70), ("team", 72)]),
    (77, [("Everyone hears it", "w", 77), ("at the same time,", "it", 80)], [("talk", 78)]),
    (84, [("in the", "w", 84), ("SAME ROOM.", "big", 86)], []),
    (88, [("Then they", "w", 88), ("RAISE SOME MONEY,", "caps", 90)], [("hand-money", 92)]),
    (93, [("raffle tickets off,", "w", 93), ("prizes from local businesses,", "it", 96)], [("ticket", 93), ("building", 98)]),
    (100, [("super easy", "w", 100), ("and people actually love it.", "it", 102)], [("happy", 105)]),
    (107, [("In between,", "w", 107), ("everybody just hangs out.", "it", 109)], []),
    (113, [("New families", "w", 113), ("meet the coaches,", "it", 115)], []),
    (118, [("kids meet players", "w", 118), ("from other teams,", "it", 121)], []),
    (124, [("and then at the very end", "w", 124), ("of the night,", "it", 130)], [("clock", 129)]),
    (133, [("THE BIG MOMENT,", "caps", 133)], []),
    (136, [("they reveal", "w", 136), ("the new uniform", "it", 138)], []),
    (141, [("and honestly,", "w", 141), ("the kids ~lose their minds~", "it", 143), ("every single time.", "it", 148)], []),
    (151, [("That's the thing,", "w", 151), ("it's not just showing off", "it", 154), ("the uniform,", "it", 159)], []),
    (161, [("it's the night", "w", 161), ("your whole club feels", "it", 164), ("LIKE A FAMILY", "caps", 168)], []),
    (171, [("and you're", "w", 171), ("RAISING MONEY", "caps", 173), ("while you're at it.", "it", 175)], []),
    (179, [("Planning", "w", 179), ("next season?", "it", 180)], [("calendar", 180)]),
    (182, [("SAVE THIS", "caps", 182), ("for your kickoff night", "it", 184)], []),
]
LIST_HEAD, LIST_END = None, None
CHECKS = []
NUMBERED = True
LIST_TOP = 1120
CTA = [(188, "and share it", "w"), (191, "with your ~club board.~", "it")]
CTA_TOP = 1060
CAP_TOP, CAP_BOTTOM = 1000, 1330   # chin ~1000, hands/jersey on the table from ~1390
BURN_OPACITY = 0.38
BURN_CUTS = [4, 7, 13, 17]
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]
CAM_SEQ, CAM_ENTRIES = "BDCEBDCE", "IOO"
CAM_ORIGIN, CAM_X, CAM_Y = "585px 880px", -45, -150
K.ICON, K.ICON_DROP = 150, 115
CTA_BASE = 1090
JERSEY_TINT = "purple"
RISERS = [(64, "riser_fast", 1.1), (133, "riser_fast", 1.1), (179, "riser_fast", 1.1)]
MUSIC_VOL = 0.10

# ---------------- b-roll cutaways (client round 2026-11-10): Premiere film burn + purple flash in and out (hfkit.broll via gen5_body) ----------------
BR = ROOT.parent.parent / "Ref videos Dariel/Stimulus/broll"
BROLL = [   # balanced (user 2026-11-10): talking head stays the star  (clip, clip start s, t_in, t_out, crop_x)
    (BR / "link6/HSK Tournament Footage/MVI_0843.MP4", 0.5, 13.76, 16.50, 0.6),        # "Families, coaches, players, club members" -> youth game, sideline parents
    (ROOT / "assets/broll/src_img5563.mp4", 0.2, 23.89, 26.54, 0.5),                  # img5563/IMG_5563.MOV @13.7, HLG->SDR tonemapped (HDR source forced a broken HDR render). CLIENT CLIP @00:25 "Everyone hears it at the same time, in the same room" -> kit-reveal crowd + jersey mockups
    (BR / "link6/Josh 100 Clips/18-FG Edit.mov", 12.1, 43.98, 46.70, 0.5),             # "the kids lose their minds every single time" -> team high-fives
]
exec((KIT / "gen5_body.py").read_text(encoding="utf-8"))
