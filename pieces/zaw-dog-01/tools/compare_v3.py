"""venv: ref/compare_v3.jpg - Zaw's frames vs our OLD (people3d skin-modifier people, flat-colour props) and NEW
(people + props built from Flow photos, VLVT method) humans and sets."""
import os, sys
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402
zf = lambda v, t: os.path.join(H, "ref", "frames", v, f"{int(round(t * 4)) + 1:03d}.jpg")
R = lambda *p: os.path.join(H, *p)
ROWS = [("HUMANS", [(zf("I_0fY2sCfaQ", 16.25), "ZAW owner"), (R("review", "people", "owner_full.png"), "OLD owner (skin modifier)"),
                    (R("review", "people2", "owner_rest.png"), "NEW owner (photo sheet)"), (R("review", "people2", "friend_rest.png"), "NEW friend"),
                    (R("review", "people2", "sci_back34.png"), "NEW scientist, back")]),
        ("SETS", [(zf("I_0fY2sCfaQ", 5.0), "ZAW room"), (R("renders", "post", "00600.png"), "OLD living room"),
                  (R("review", "board", "frames", "14_07b.jpg"), "NEW living room"), (R("renders", "post", "00270.png"), "OLD lab"),
                  (R("review", "board", "frames", "07_04a.jpg"), "NEW lab")])]
W, Hh = 300, 533; F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 18)
sh = Image.new("RGB", (W * 5, (Hh + 30) * len(ROWS)), (20, 20, 20)); d = ImageDraw.Draw(sh)
for r, (_, cells) in enumerate(ROWS):
    for k, (p, lab) in enumerate(cells):
        im = Image.open(p).convert("RGB")
        if "people" in p:
            im = ps1_post(im.resize((540, 960)), scale=2)
        sh.paste(im.resize((W, Hh)), (k * W, r * (Hh + 30) + 30))
        d.text((k * W + 6, r * (Hh + 30) + 6), lab, font=F, fill=(255, 120, 120) if lab.startswith("ZAW") else (200, 200, 200) if lab.startswith("OLD") else (120, 230, 255))
sh.save(R("ref", "compare_v3.jpg"), quality=88); print(R("ref", "compare_v3.jpg"))
