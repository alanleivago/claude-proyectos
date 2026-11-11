"""venv: ref/compare.jpg - Zaw frame | our board frame, side by side, for the matching shot types."""
import glob, os
from PIL import Image, ImageDraw, ImageFont
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PAIRS = [("jf-TfhS02Vo", "012", "01a", "owner + animal, room (the shower hit)"), ("I_0fY2sCfaQ", "006", "03a", "street bridge, black car"),
         ("s1c1m9UB0cg", "030", "06", "seated owner + animal"), ("I_0fY2sCfaQ", "042", "10a", "owner walks off, hallway"),
         ("jf-TfhS02Vo", "053", "12", "the door test"), ("jf-TfhS02Vo", "047", "11a", "animal at the door")]
W, Hh = 300, 533; F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 15)
sh = Image.new("RGB", (W * 6, (Hh + 34) * 2), (20, 20, 20)); d = ImageDraw.Draw(sh)
for k, (vid, t, beat, lab) in enumerate(PAIRS):
    z = Image.open(os.path.join(H, "ref", "frames", vid, f"{t}.jpg")).convert("RGB").resize((W, Hh))
    ours = Image.open(glob.glob(os.path.join(H, "review", "board", "frames", f"*_{beat}.jpg"))[0]).resize((W, Hh))
    x, y = (k % 3) * 2 * W, (k // 3) * (Hh + 34)
    sh.paste(z, (x, y + 34)); sh.paste(ours, (x + W, y + 34))
    d.text((x + 6, y + 7), f"ZAW {vid[:5]} #{t}", font=F, fill=(255, 120, 120))
    d.text((x + W + 6, y + 7), f"OURS {beat} - {lab}", font=F, fill=(120, 220, 255))
sh.save(os.path.join(H, "review", "board", "compare_zaw.jpg"), quality=88); print(os.path.join(H, "review", "board", "compare_zaw.jpg"))
