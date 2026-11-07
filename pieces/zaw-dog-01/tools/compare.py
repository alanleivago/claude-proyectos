"""venv: ref/compare.jpg - Zaw frame | our board frame, side by side, for the matching shot types."""
import glob, os
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PAIRS = [("I_0fY2sCfaQ", 0.75, "01a", "behind-head window"), ("I_0fY2sCfaQ", 3.25, "01b", "window from outside"),
         ("I_0fY2sCfaQ", 10.25, "10a", "owner in doorway"), ("I_0fY2sCfaQ", 13.0, "11", "owner + groceries"),
         ("I_0fY2sCfaQ", 17.25, "08a", "high CU dutch"), ("r3myShBfXts", 2.0, "07a", "owner + animal, room")]
W, Hh = 300, 533; F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 20)
sh = Image.new("RGB", (W * 6, (Hh + 34) * 2), (20, 20, 20)); d = ImageDraw.Draw(sh)
for k, (vid, t, beat, lab) in enumerate(PAIRS):
    z = Image.open(os.path.join(H, "ref", "frames", vid, f"{int(round(t * 4)) + 1:03d}.jpg")).convert("RGB").resize((W, Hh))
    ours = Image.open(glob.glob(os.path.join(H, "review", "board", "frames", f"*_{beat}.jpg"))[0]).resize((W, Hh))
    x, y = (k % 3) * 2 * W, (k // 3) * (Hh + 34)
    sh.paste(z, (x, y + 34)); sh.paste(ours, (x + W, y + 34))
    d.text((x + 6, y + 7), f"ZAW {vid[:5]} {t:.2f}s", font=F, fill=(255, 120, 120))
    d.text((x + W + 6, y + 7), f"OURS {beat} - {lab}", font=F, fill=(120, 220, 255))
sh.save(os.path.join(H, "ref", "compare.jpg"), quality=88); print(os.path.join(H, "ref", "compare.jpg"))
