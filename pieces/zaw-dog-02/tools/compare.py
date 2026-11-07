"""venv: ref/compare.jpg - Zaw frame | our board frame, side by side, for the matching shot types."""
import glob, os
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PAIRS = [("r3myShBfXts", 2.0, "01a", "owner + animal, room"), ("I_0fY2sCfaQ", 10.25, "02b", "person centred, animal rear 3/4"),
         ("I_0fY2sCfaQ", 13.0, "10a", "counter, people + props"), ("I_0fY2sCfaQ", 17.25, "13b", "high CU dutch"),
         ("I_0fY2sCfaQ", 0.75, "09", "behind the animal's head"), ("r3myShBfXts", 2.0, "11a", "room at animal height")]
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
