"""venv: ref/compare_people.jpg - Zaw's owner (their frames) vs our owner + the second person (review/people)."""
import os
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
Z = [("I_0fY2sCfaQ", 10.25, "ZAW owner, back, doorway"), ("I_0fY2sCfaQ", 13.0, "ZAW owner, face CU"), ("I_0fY2sCfaQ", 16.25, "ZAW owner, full")]
O = [("owner_back_walk", "OURS owner, back, walking"), ("owner_face", "OURS owner, face CU"), ("owner_full", "OURS owner, full"), ("friend_full", "OURS line-7 person")]
W, Hh = 300, 533; F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 19)
sh = Image.new("RGB", (W * 4, (Hh + 30) * 2), (20, 20, 20)); d = ImageDraw.Draw(sh)
for k, (v, t, lab) in enumerate(Z):
    sh.paste(Image.open(os.path.join(H, "ref", "frames", v, f"{int(round(t * 4)) + 1:03d}.jpg")).convert("RGB").resize((W, Hh)), (k * W, 30))
    d.text((k * W + 6, 6), lab, font=F, fill=(255, 120, 120))
for k, (n, lab) in enumerate(O):
    sh.paste(Image.open(os.path.join(H, "review", "people", f"{n}.png")).convert("RGB").resize((W, Hh)), (k * W, Hh + 60))
    d.text((k * W + 6, Hh + 36), lab, font=F, fill=(120, 220, 255))
sh.save(os.path.join(H, "ref", "compare_people.jpg"), quality=88); print(os.path.join(H, "ref", "compare_people.jpg"))
