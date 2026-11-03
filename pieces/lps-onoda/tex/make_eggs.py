"""venv: wall easter eggs from REAL photos / memes (user, 2026-10-31: real internet images, copyright no concern).
Sources in tex/eggs/src (Wikimedia Commons + imgflip). Composited at 160x224 like the other posters (nearest in Blender).
  missing_panda      - Bao Li chewing bamboo (Commons)            + MISSING / REWARD: 1 BAMBOO
  wanted_yeti        - Patterson-Gimlin film frame 352 (Commons)  + HAVE YOU SEEN / PLEASE CALL SUZUKI
  dummies            - Hiroo Onoda, 1944 portrait (Commons)        on a "for DUMMIES" cover
  surrender_economy  - Roll Safe meme (imgflip)                    + SURRENDER? IN THIS ECONOMY?"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

H = Path(__file__).resolve().parent; E = H / "eggs"; S = E / "src"
IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"
f = lambda s: ImageFont.truetype(IMPACT, s)
rng = np.random.default_rng(8)


def paper(w, h, base=(236, 226, 196)):
    return Image.fromarray((np.zeros((h, w, 3)) + base + rng.normal(0, 5, (h, w, 3))).clip(0, 255).astype(np.uint8))


def photo(name, box, size, sat=1.15, contrast=1.1):
    """Crop box (fractions x0, y0, x1, y1) -> size, a bit punchier, 5-bit colour like a PS1 texture."""
    im = Image.open(S / name).convert("RGB"); W, Hh = im.size
    im = im.crop((int(box[0] * W), int(box[1] * Hh), int(box[2] * W), int(box[3] * Hh))).resize(size, Image.LANCZOS)
    im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(sat)).enhance(contrast)
    return Image.fromarray((np.asarray(im) // 8 * 8 + 4).astype(np.uint8))


def fit(d, text, w, size):
    while d.textlength(text, font=f(size)) > w:
        size -= 1
    return f(size)


def poster(name, title, sub, pic, col, base=(236, 226, 196)):
    im = paper(160, 224, base); d = ImageDraw.Draw(im)
    d.text((80, 24), title, font=fit(d, title, 148, 30), fill=col, anchor="mm")
    im.paste(pic, (14, 44)); d.rectangle((13, 43, 146, 184), outline=(30, 24, 18), width=1)
    d.text((80, 204), sub, font=fit(d, sub, 148, 15), fill=col, anchor="mm")
    im.save(E / f"{name}.png")


poster("missing_panda", "MISSING", "REWARD: 1 BAMBOO", photo("Bao_Li.jpg", (0.34, 0.06, 0.62, 0.66), (132, 140)), (30, 20, 14))
poster("wanted_yeti", "HAVE YOU SEEN", "PLEASE CALL SUZUKI", photo("Patterson_Gimlin_Bigfoot.jpg", (0.34, 0.4, 0.62, 0.92), (132, 140), 1.0, 1.25), (140, 20, 20))

im = paper(160, 224, (250, 236, 120)); d = ImageDraw.Draw(im)              # bookshop: For Dummies parody with the real Onoda
d.rectangle((0, 0, 160, 34), fill=(20, 20, 20)); d.text((80, 17), "for DUMMIES", font=f(22), fill=(250, 236, 120), anchor="mm")
d.text((80, 52), "SURRENDERING", font=fit(d, "SURRENDERING", 150, 22), fill=(20, 20, 20), anchor="mm")
d.text((80, 74), "AFTER 29 YEARS", font=fit(d, "AFTER 29 YEARS", 150, 20), fill=(20, 20, 20), anchor="mm")
im.paste(photo("Hiroo_Onoda_young.jpg", (0.05, 0.02, 0.95, 0.85), (92, 106), 1.0, 1.15), (34, 90))
d.ellipse((126, 168, 156, 198), fill=(200, 30, 30)); d.text((141, 183), "29\nYRS", font=f(9), fill=(255, 255, 255), anchor="mm", align="center")
d.text((80, 211), "A Reference for the Rest of Us!", font=f(10), fill=(20, 20, 20), anchor="mm"); im.save(E / "dummies.png")

im = paper(160, 224, (226, 236, 246)); d = ImageDraw.Draw(im)              # staff pick: Roll Safe meme
d.text((80, 18), "STAFF PICK", font=f(24), fill=(30, 30, 30), anchor="mm")
im.paste(photo("rollsafe.jpg", (0.18, 0.0, 0.82, 1.0), (140, 100)), (10, 36))
d.text((80, 156), "SURRENDER?", font=fit(d, "SURRENDER?", 148, 26), fill=(255, 255, 255), anchor="mm", stroke_width=2, stroke_fill=(0, 0, 0))
d.text((80, 184), "IN THIS ECONOMY?", font=fit(d, "IN THIS ECONOMY?", 148, 22), fill=(255, 255, 255), anchor="mm", stroke_width=2, stroke_fill=(0, 0, 0))
d.text((80, 212), "Taniguchi Books, Tokyo", font=f(11), fill=(30, 30, 30), anchor="mm"); im.save(E / "surrender_economy.png")
print("eggs", sorted(p.name for p in E.glob("*.png")))
