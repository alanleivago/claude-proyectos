"""venv: wall easter eggs from REAL memes (imgflip templates, user 2026-10-31: real internet images OK).
  distracted   - Distracted Boyfriend: MY EYES / LITERALLY ANYTHING / THE LINE I WAS READING
  thisisfine   - This Is Fine: MY BRAIN, 3x A SECOND
  monkey       - Monkey Puppet side-eye: ME WATCHING MY OWN EYES IN THE MIRROR
meme_mirror / mona_selfie are copied from lps-own-face (the user liked them; same mirror set)."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

H = Path(__file__).resolve().parent; E = H / "eggs"; S = E / "src"
IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"
f = lambda s: ImageFont.truetype(IMPACT, s)


def ps1(im):
    im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.15)).enhance(1.08)
    return Image.fromarray((np.asarray(im) // 8 * 8 + 4).astype(np.uint8))


def fit(d, text, w, size):
    while d.textlength(text, font=f(size)) > w:
        size -= 1
    return f(size)


def label(d, xy, text, w, size, anchor="mm"):
    d.text(xy, text, font=fit(d, text, w, size), fill=(255, 255, 255), anchor=anchor, stroke_width=2, stroke_fill=(0, 0, 0))


im = ps1(Image.open(S / "distracted.jpg").convert("RGB").resize((240, 160), Image.LANCZOS)); d = ImageDraw.Draw(im)
label(d, (52, 120), "LITERALLY", 90, 18); label(d, (52, 138), "ANYTHING", 90, 18)
label(d, (140, 40), "MY EYES", 70, 18)
label(d, (200, 110), "THE LINE I", 76, 15); label(d, (200, 126), "WAS READING", 76, 15)
im.save(E / "distracted.png")

im = ps1(Image.open(S / "thisisfine.jpg").convert("RGB").crop((0, 0, 290, 282)).resize((160, 156), Image.LANCZOS))
c = Image.new("RGB", (160, 200), (250, 250, 250)); c.paste(im, (0, 44)); d = ImageDraw.Draw(c)
d.text((80, 14), "MY BRAIN,", font=fit(d, "MY BRAIN,", 150, 20), fill=(20, 20, 20), anchor="mm")
d.text((80, 34), "3x A SECOND", font=fit(d, "3x A SECOND", 150, 20), fill=(20, 20, 20), anchor="mm")
c.save(E / "thisisfine.png")

im = ps1(Image.open(S / "monkey.jpg").convert("RGB").crop((0, 384, 461, 768)).resize((180, 150), Image.LANCZOS))
c = Image.new("RGB", (180, 196), (20, 20, 20)); c.paste(im, (0, 46)); d = ImageDraw.Draw(c)
d.text((90, 14), "ME WATCHING MY OWN", font=fit(d, "ME WATCHING MY OWN", 170, 18), fill=(255, 255, 255), anchor="mm")
d.text((90, 34), "EYES IN THE MIRROR", font=fit(d, "EYES IN THE MIRROR", 170, 18), fill=(255, 255, 255), anchor="mm")
c.save(E / "monkey.png")
print(sorted(p.name for p in E.glob("*.png")))

# v2 (user 2026-11-02): mix of kinds per set, Courage / SpongeBob spirit — gross-up portraits of the cast, weird
# realistic paintings, a random object photo, video-game box art (all Flow, PS1 palette, ~200 px tall).
for name, box in (("chicken", None), ("duck", None),
                  ("boxart", None), ("potato", None), ("goldfish", None)):
    im = Image.open(S / f"{name}.jpg").convert("RGB")
    h = 200; w = round(h * im.width / im.height)
    ps1(im.resize((w, h), Image.LANCZOS)).save(E / f"{name}.png")
print(sorted(p.name for p in E.glob("*.png")))

# v3 (user 2026-11-02): the gross-up Kaneda was too weird -> his normal self taking a tourist selfie in Paris
# (build.py --selfie renders the Kaneda model in front of a Flow Eiffel Tower photo -> src/kaneda_selfie_raw.png).
if (S / "kaneda_selfie_raw.png").exists():
    im = Image.open(S / "kaneda_selfie_raw.png").convert("RGB").crop((100, 0, 600, 667)).resize((150, 200), Image.LANCZOS)   # crop off the dark corner
    c = Image.new("RGB", (160, 224), (246, 244, 236)); c.paste(ps1(im), (5, 5)); d = ImageDraw.Draw(c)
    d.text((80, 214), "PARIS 2019 :)", font=f(14), fill=(40, 40, 40), anchor="mm")
    c.save(E / "kaneda_selfie.png")
