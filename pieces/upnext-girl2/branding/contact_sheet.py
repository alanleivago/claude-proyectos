"""branding contact sheet: profile pictures (circle + square) and both banners (full, mobile safe area, 1500x500)"""
import os
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.dirname(os.path.abspath(__file__)))
fb = ImageFont.truetype("arialbd.ttf", 26); fs = ImageFont.truetype("arial.ttf", 20)
S = Image.new("RGB", (2600, 2560), (28, 28, 30)); d = ImageDraw.Draw(S)
d.text((30, 20), "PROFILE PICTURES (his_idle through the reference camera f001, tights model)", fill=(255, 255, 255), font=fb)
x = 30
for name in ("teal", "pink", "teal_smile", "pink_smile"):
    im = Image.open(f"pfp_{name}_1080.png").resize((420, 420), Image.LANCZOS); m = Image.new("L", im.size, 0); ImageDraw.Draw(m).ellipse([0, 0, 419, 419], fill=255)
    S.paste(im, (x, 70), m); S.paste(im.resize((120, 120), Image.LANCZOS), (x + 300, 500)); d.text((x, 500), f"pfp_{name}", fill=(220, 220, 220), font=fs)
    x += 640
y = 660
for v in ("A", "B"):
    d.text((30, y), f"BANNER {v}  (2560x1440 with guides: yellow = desktop band, red = mobile / safe area 1546x423, green = 1500x500 crop)", fill=(255, 255, 255), font=fb)
    S.paste(Image.open(f"_banner_{v}_safezones.png").resize((1280, 720), Image.LANCZOS), (30, y + 40))
    S.paste(Image.open(f"banner_{v}_2560x1440.png").crop((507, 508, 2053, 931)).resize((1236, 338), Image.LANCZOS), (1340, y + 40))
    d.text((1340, y + 384), "mobile / safe area view", fill=(220, 220, 220), font=fs)
    S.paste(Image.open(f"banner_{v}_1500x500.png").resize((1236, 412), Image.LANCZOS), (1340, y + 420)); d.text((1340, y + 836), "1500x500 crop", fill=(220, 220, 220), font=fs)
    y += 920
S = S.crop((0, 0, 2600, y)); S.save("branding_contact_sheet.png"); print("branding_contact_sheet.png", S.size)
