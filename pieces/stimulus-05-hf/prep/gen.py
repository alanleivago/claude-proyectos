"""Writes index.html (HyperFrames) for Stimulus 05 from the word timings + the beat plan below.
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

# ---------------- beat plan (video 5: wrong name / doesn't fit -> a good company just remakes it) ----------------
HOOK = dict(kicker=[("THE", 0), ("JERSEYS", 1)], big=("FINALLY", 2), end=8, k_base=428, big_base=603)
HOOK_HANDOFF, AFTER_HOOK = None, None
BLOCKS = [
    (3, [("show up.", "it", 3)], [("box", 3)]),
    (5, [("And there's a", "w", 5), ("WRONG NAME", "big", 8), ("on the back.", "it", 10)], []),
    (13, [("Or it just", "w", 13), ("^doesn't fit.^", "it", 16)], [("size", 16)]),
    (18, [("A lot of coaches", "w", 18), ("get stuck in this", "it", 22), ("^back and forth.^", "it", 26)], [("whistle", 21), ("exchange", 26)]),
    (29, [("Whose fault", "w", 29), ("was it?", "it", 31)], [("choices", 29)]),
    (33, [("Who pays", "w", 33), ("for ^shipping?^", "it", 35)], [("hand-money", 34), ("truck", 36)]),
    (37, [("Here's what a", "w", 37), ("GOOD UNIFORM COMPANY", "caps", 40), ("does instead.", "it", 43)], [("quality", 40)]),
    (45, [("They", "w", 45), ("REMAKE IT.", "big", 46)], []),
    (48, [("They don't ask", "w", 48), ("whose fault it was.", "it", 51)], [("talk", 50)]),
    (55, [("They cover shipping", "w", 55), ("~both ways.~", "it", 58)], [("return", 58)]),
    (60, [("No arguing", "w", 60), ("over who pays.", "it", 62)], [("handshake", 61)]),
    (65, [("And they ship", "w", 65), ("the new ones", "it", 68), ("straight to the ~player's house.~", "it", 71)], [("truck", 67), ("player", 74)]),
    (76, [("Look,", "w", 76), ("^mistakes happen,^", "it", 77)], []),
    (79, [("but the fix", "w", 79), ("SHOULDN'T BE A FIGHT.", "caps", 82)], [("deal", 85)]),
    (86, [("So ask how a company", "w", 86), ("handles it", "it", 91), ("before you order.", "it", 93)], [("search", 88), ("ticket", 95)]),
    (96, [("At Stimulus,", "w", 96)], []),
    # numbered list 98-107 (own element); the block above stays as its header
    (108, [("we remake it.", "w", 108), ("~No questions asked.~", "it", 111)], [("check", 110)]),
    (114, [("Want a uniform company", "w", 114), ("like that?", "it", 118)], [("kit", 116)]),
    (120, [("Start your free design", "cta", 120), ("request.", "cta", 124)], []),
]
LIST_HEAD, LIST_END = 96, 108
CHECKS = [(98, "If it doesn't fit,"), (102, "Wrong name or number,")]
NUMBERED = True
LIST_TOP = 1120
CTA = [(125, "Link in bio.", "big")]
CTA_TOP = 1010
CAP_TOP, CAP_BOTTOM = 990, 1400   # jersey on the table below
BURN_OPACITY = 0.38
BURN_CUTS = [1, 4, 10, 11]
BURN_CLIPS = [(0.542, 0.20), (0.709, 0.51), (0.959, 0.33), (0.542, 0.13)]
CAM_SEQ, CAM_ENTRIES = "CEBDCEBD", "OOIOOOIOOIIO"   # r4: cuts 23.86 + 26.36 (frames 572, 632) punch in ON the cut (was a static cut + zoom 12 frames later)
CAM_ORIGIN, CAM_X, CAM_Y = "585px 880px", -45, -150
K.ICON, K.ICON_DROP = 150, 115
CTA_BASE = 1090
JERSEY_TINT = "green"
RISERS = [(46, "riser_fast", 1.1), (96, "riser_fast", 1.1), (120, "riser_fast", 1.1)]
MUSIC_VOL = 0.13   # user: BGM a bit louder (v5 only)

# ---------------- b-roll cutaways (client round 2026-11-10): Premiere film burn + purple flash in and out (hfkit.broll via gen5_body) ----------------
BR = ROOT.parent.parent / "Ref videos Dariel/Stimulus/broll"
BROLL = [   # balanced (user 2026-11-10): talking head stays the star  (clip, clip start s, t_in, t_out, crop_x)
    (BR / "link6/KFA v Saint Paul United FC/MVI_2112.MP4", 0.0, 15.15, 17.75, 0.5),  # r3 2026-11-11 (show Stimulus jerseys): player in the purple/white Stimulus kit, logo on the chest (was Orono Girls keeper)
    (BR / "link6/Josh 100 Clips/20-FG Block.mov", 5.3, 27.40, 30.10, 0.5),             # "if it doesn't fit, or the name or number's wrong" -> jersey backs FINK #5 / #4
]

exec((KIT / "gen5_body.py").read_text(encoding="utf-8"))
