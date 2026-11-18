"""venv: review/selfcheck_sheet.jpg from review/iso/*.png (shots.py iso): the two humans isolated (key pose, head front /
3/4 / profile, shoulder seam, both hands, the pointing hand from the side) and the dog (sitting levelled, happy, shocked,
eating; front / side / face). Self-check BEFORE the board.  python tools/selfcheck_sheet.py"""
import os
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); I = os.path.join(H, "review", "iso")
F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 15)
FT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
rows = [("owner_tease", ["front", "34", "side", "head_f", "head_34", "head_side", "shoulder", "handR", "handL"]),
        ("owner_raised", ["front", "34", "side", "head_f", "head_34", "head_side", "shoulder", "handR", "handL"]),
        ("owner_startle", ["front", "34", "side", "head_f", "head_34", "head_side", "shoulder", "handR", "handL"]),
        ("owner_laugh", ["front", "34", "side", "head_f", "head_34", "head_side", "shoulder", "handR", "handL"]),
        ("sci_offer", ["front", "34", "side", "head_f", "head_34", "head_side", "shoulder", "handR", "handL"]),
        ("sci_laugh", ["front", "34", "side", "head_f", "head_34", "head_side", "shoulder", "handR", "handL"]),
        ("dog", ["trot1_side", "trot2_side", "trot3_side", "trot2_rear34", "sad_side", "sad_face", "noseup_side", "noseup_face"]),
        ("prop", ["lab_front", "lab_back", "ramp"])]
W, Hh = 240, 320
S = Image.new("RGB", (9 * (W + 4) + 4, len(rows) * (Hh + 24) + 40), (20, 20, 20)); d = ImageDraw.Draw(S)
d.text((8, 8), "zaw-dog #8 v2 self-check (before the board): kit v6.1 humans (skin match, soft face edge, shoulder reweight), mocap poses, hands, dog trot, lab", font=FT, fill=(255, 230, 40))
for r, (tag, views) in enumerate(rows):
    for c, v in enumerate(views):
        p = os.path.join(I, f"{tag}_{v}.png") if True else os.path.join(I, f"{tag}_{v}.png")
        if not os.path.exists(p):
            continue
        x, y = 4 + c * (W + 4), 40 + r * (Hh + 24)
        S.paste(Image.open(p).convert("RGB").resize((W, Hh)), (x, y + 20))
        d.text((x + 2, y + 2), f"{tag} {v}", font=F, fill=(230, 230, 230))
S.save(os.path.join(H, "review", "selfcheck_sheet.jpg"), quality=88); print(os.path.join(H, "review", "selfcheck_sheet.jpg"))
