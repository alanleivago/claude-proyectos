"""AIRY branding v2 contact sheet: profile-picture grid + the 3 banners (guides, phone safe area, 1500x500)"""
import os
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.dirname(os.path.abspath(__file__)))
fb = ImageFont.truetype("arialbd.ttf", 26); fs = ImageFont.truetype("arial.ttf", 20)
pg = Image.open("pfp_grid.png"); pg = pg.resize((2540, int(pg.height * 2540 / pg.width)), Image.LANCZOS)
S = Image.new("RGB", (2600, 90 + pg.height + 3 * 900 + 40), (28, 28, 30)); d = ImageDraw.Draw(S)
d.text((30, 20), "AIRY - PROFILE PICTURES (his_idle through the reference camera f001; rows: happy / sparkle / wink, all with blush)", fill=(255, 255, 255), font=fb)
S.paste(pg, (30, 70)); y = 90 + pg.height
for v in "ABC":
    d.text((30, y), f"BANNER {v}  (yellow = desktop band, red = phone / safe area 1546x423, green = 1500x500 crop)", fill=(255, 255, 255), font=fb)
    S.paste(Image.open(f"_banner_{v}_safezones.png").resize((1280, 720), Image.LANCZOS), (30, y + 40))
    S.paste(Image.open(f"banner_{v}_2560x1440.png").crop((507, 508, 2053, 931)).resize((1236, 338), Image.LANCZOS), (1340, y + 40))
    d.text((1340, y + 384), "phone / safe area view", fill=(220, 220, 220), font=fs)
    S.paste(Image.open(f"banner_{v}_1500x500.png").resize((1236, 412), Image.LANCZOS), (1340, y + 420)); d.text((1340, y + 836), "1500x500", fill=(220, 220, 220), font=fs)
    y += 900
S.save("airy_branding_contact_sheet.png"); print("airy_branding_contact_sheet.png", S.size)
