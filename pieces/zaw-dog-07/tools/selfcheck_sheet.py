"""venv: review/selfcheck_sheet.jpg from review/iso/*.png (shots.py iso): the two humans isolated (key pose, head front /
3/4 / profile, shoulder seam, both hands, the pointing hand from the side) and the dog (sitting levelled, happy, shocked,
eating; front / side / face). Self-check BEFORE the board.  python tools/selfcheck_sheet.py"""
import os
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); I = os.path.join(H, "review", "iso")
F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 15)
FT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
rows = [("owner_point", ["front", "side", "head_f", "head_34", "head_side", "shoulder", "handR", "hand_point_side"]),
        ("owner_cry", ["front", "head_f", "head_34", "head_side", "shoulder", "handL", "handR", "side"]),
        ("mailman_point", ["front", "side", "head_f", "head_side", "shoulder", "handL", "hand_point_side", "handR"]),
        ("mailman_laugh", ["front", "head_f", "head_34", "head_side", "shoulder", "handL", "handR", "side"]),
        ("dog", ["sit_front", "sit_side", "sit_face", "happy_front", "happy_side", "shocked_front", "eat_front", "eat_side"])]
W, Hh = 240, 320
S = Image.new("RGB", (8 * (W + 4) + 4, len(rows) * (Hh + 24) + 40), (20, 20, 20)); d = ImageDraw.Draw(S)
d.text((8, 8), "zaw-dog #7 v2 self-check (isolated, before the board): body_fix seams, pointing hands, crying face, levelled sit", font=FT, fill=(255, 230, 40))
for r, (tag, views) in enumerate(rows):
    for c, v in enumerate(views):
        p = os.path.join(I, f"{tag}_{v}.png") if tag != "dog" else os.path.join(I, f"dog_{v}.png")
        if not os.path.exists(p):
            continue
        x, y = 4 + c * (W + 4), 40 + r * (Hh + 24)
        S.paste(Image.open(p).convert("RGB").resize((W, Hh)), (x, y + 20))
        d.text((x + 2, y + 2), f"{tag} {v}", font=F, fill=(230, 230, 230))
S.save(os.path.join(H, "review", "selfcheck_sheet.jpg"), quality=88); print(os.path.join(H, "review", "selfcheck_sheet.jpg"))
