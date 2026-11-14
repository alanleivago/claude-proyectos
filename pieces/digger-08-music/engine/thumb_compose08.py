"""Digger 08 vertical cover (A1 style): python thumb_compose06.py RENDERS -> ../portada_1080x1920.png + the title-named copy and a mobile check
sheet. The render is only copied (no brightness/contrast/saturation); sparkles are added around the artifact (Feetham's shower)."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw
R = Path(sys.argv[1]); OUT = Path(__file__).resolve().parent.parent
TITLE = "300 Years of Music Before Spotify"
def sparkle(im, x, y, r):
    d = ImageDraw.Draw(im)
    for rr, col in ((r + 4, (150, 90, 10)), (r, (255, 214, 60))):
        d.polygon([(x, y - rr), (x + rr * 0.24, y - rr * 0.24), (x + rr, y), (x + rr * 0.24, y + rr * 0.24), (x, y + rr), (x - rr * 0.24, y + rr * 0.24), (x - rr, y), (x - rr * 0.24, y - rr * 0.24)], fill=col)
    d.ellipse((x - r * 0.18, y - r * 0.18, x + r * 0.18, y + r * 0.18), fill=(255, 255, 230))
im = Image.open(R / "new.png").convert("RGB")
for s in ((1000, 560, 24), (900, 1500, 16), (1010, 1180, 20), (560, 1650, 14)): sparkle(im, *s)
im.save(OUT / "portada_1080x1920.png"); im.save(OUT / f"{TITLE}.png")
sheet = Image.new("RGB", (360 + 120 + 200, 660), (24, 24, 32))
sheet.paste(im.resize((360, 640), Image.LANCZOS), (10, 10)); sm = im.resize((94, 168), Image.LANCZOS); sheet.paste(sm, (380, 10)); sheet.paste(sm.resize((188, 336), Image.NEAREST), (480, 10))
sheet.save(OUT / "review" / "portada_mobile_check.png"); print("ok")
