"""v4 sheet (bigger butt, thicker thighs) vs v3. python -I tools/wanim/fixes_v4.py before|after|compose"""
import os, sys
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import anim_review as AR

TMP = AR.TMP; u = AR.u; S = AR.S
SHOTS = []
for c, f, lab, z, ext in ((None, 1, "rest", 0.80, 0.85), ("walk", 9, "walk", 0.80, 0.85), ("sit_chair", 30, "sit", 0.62, 0.85)):
    for v in ("side", "3qb", "back", "front"):
        SHOTS.append(("B", c, f, v, u([0, 0, z]), ext, f"{lab} {v}"))
for c, f, lab in (("hands_on_knees", 22, "hands_on_knees"), ("kneel", 40, "kneel"), ("sit_floor", 60, "sit_floor")):
    for v in ("front", "side"):
        SHOTS.append(("C", c, f, v, u([0, 0, 0.5]), 1.3, f"{lab} {v}"))
BEFORE = {"B": os.path.join(ROOT, "ref", "v3", "waitress_shorts_v3.blend"), "C": os.path.join(ROOT, "ref", "v3", "waitress_jeans_v3.blend")}


def render(tag):
    for opt in "BC":
        sh = [dict(out=os.path.join(TMP, f"f4_{tag}_{i}.png"), clip=c, frame=f, view=v, ctr=ctr, ext=ext * S, noarms=(v == "side" and c in (None, "walk")))
              for i, (o, c, f, v, ctr, ext, _) in enumerate(SHOTS) if o == opt]
        AR.render(AR.GLB[opt] if tag == "after" else BEFORE[opt], sh, 300)


def compose():
    F = AR.font(18); F2 = AR.font(15); W = 300; per = 4
    rows = (len(SHOTS) + per - 1) // per
    im = Image.new("RGB", (per * (2 * W + 16) + 10, 40 + rows * (W + 24)), (34, 36, 42)); d = ImageDraw.Draw(im)
    d.text((10, 10), "v4: bigger butt + thicker thighs tapering to the knee (left = v3, right = v4); side views of rest / walk with the arms hidden",
           fill=(240, 240, 240), font=F)
    for k, s in enumerate(SHOTS):
        r, q = divmod(k, per); x = 10 + q * (2 * W + 16); y = 40 + r * (W + 24)
        im.paste(Image.open(os.path.join(TMP, f"f4_before_{k}.png")).convert("RGB"), (x, y))
        im.paste(Image.open(os.path.join(TMP, f"f4_after_{k}.png")).convert("RGB"), (x + W, y))
        d.text((x + 4, y + W + 3), s[6], fill=(210, 210, 210), font=F2)
    im.save(os.path.join(ROOT, "review", "fixes_v4.png")); print("FIXES4", im.size)


if __name__ == "__main__":
    a = sys.argv[1]
    if a in ("before", "after"): render(a)
    else: compose()
