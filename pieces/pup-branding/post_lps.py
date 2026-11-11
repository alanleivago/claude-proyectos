"""venv: renders/banner_lps_raw.png -> banner_lps.png (PS1 dither, no words), banner_lps_safezones.png,
review/banner_lps_phone.png (the 1546x423 strip at real phone width 390 px, plus the desktop strip).
python post_lps.py"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402

SUP = "/System/Library/Fonts/Supplemental/"
SAFE = {"TV (whole image)": (0, 0, 2560, 1440), "desktop max 2560x423": (0, 508, 2560, 931),
        "tablet 1855x423": (352, 508, 2207, 931), "SAFE ALL DEVICES 1546x423": (507, 508, 2053, 931)}
COLS = {"TV (whole image)": (255, 255, 255), "desktop max 2560x423": (80, 200, 255), "tablet 1855x423": (255, 160, 40),
        "SAFE ALL DEVICES 1546x423": (60, 255, 90)}
LABEL_AT = {"TV (whole image)": (20, 24), "desktop max 2560x423": (20, 468), "tablet 1855x423": (372, 943),
            "SAFE ALL DEVICES 1546x423": (527, 987)}

im = ps1_post(Image.open(os.path.join(H, "renders", "banner_lps_raw.png")).convert("RGB"))
im.save(os.path.join(H, "banner_lps.png"))
ov = im.convert("RGBA"); lay = Image.new("RGBA", ov.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
x0, y0, x1, y1 = SAFE["SAFE ALL DEVICES 1546x423"]
ld.rectangle((0, 0, 2560, y0), fill=(0, 0, 0, 110)); ld.rectangle((0, y1, 2560, 1440), fill=(0, 0, 0, 110))
ld.rectangle((0, y0, x0, y1), fill=(0, 0, 0, 50)); ld.rectangle((x1, y0, 2560, y1), fill=(0, 0, 0, 50))
fl = ImageFont.truetype(SUP + "Arial Bold.ttf", 30)
for k, (a, b, c, e) in SAFE.items():
    ld.rectangle((a + 3, b + 3, c - 4, e - 4), outline=COLS[k] + (255,), width=6)
    ld.text(LABEL_AT[k], k, font=fl, fill=COLS[k] + (255,), stroke_width=4, stroke_fill=(0, 0, 0, 255))
Image.alpha_composite(ov, lay).convert("RGB").save(os.path.join(H, "banner_lps_safezones.png"))
strip = im.crop(SAFE["SAFE ALL DEVICES 1546x423"])
sheet = Image.new("RGB", (1100, 560), (28, 28, 30)); d = ImageDraw.Draw(sheet); f = ImageFont.truetype(SUP + "Arial.ttf", 20)
d.text((20, 10), "phone (all devices strip at 390 px, real size)", font=f, fill=(200, 200, 200))
sheet.paste(strip.resize((390, 107), Image.LANCZOS), (20, 40))
d.text((20, 165), "same phone strip, 2x zoom (nearest) to inspect", font=f, fill=(200, 200, 200))
sheet.paste(strip.resize((390, 107), Image.LANCZOS).resize((780, 214), Image.NEAREST), (20, 195))
d.text((20, 425), "desktop strip at 1060 px", font=f, fill=(200, 200, 200))
sheet.paste(im.crop(SAFE["desktop max 2560x423"]).resize((1060, 175), Image.LANCZOS).crop((0, 0, 1060, 110)), (20, 450))
os.makedirs(os.path.join(H, "review"), exist_ok=True)
sheet.save(os.path.join(H, "review", "banner_lps_phone.png"))
print("ok")
