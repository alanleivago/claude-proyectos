"""venv: wall easter eggs for lps-erfurt, VARIED (user 2026-11-02 + #4 brief):
  real memes (imgflip templates, generic User-Agent): drake, pikachu, buttons
  gross-up portraits, Courage/SpongeBob style (NOT Kaneda): grossup_monk, grossup_jester (Flow)
  weird realistic paintings: snail (knight on a snail), goose (goose in a ruff) (Flow)
  video-game art: boxart ("CASTLE PLUMBER 64", PS1 case) (Flow)
  medieval comic: comic (3 panels, the party upstairs) (Flow)
All PS1 palette, ~200-224 px."""
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


def label(d, xy, text, w, size, fill=(255, 255, 255), stroke=2):
    d.text(xy, text, font=fit(d, text, w, size), fill=fill, anchor="mm", stroke_width=stroke, stroke_fill=(0, 0, 0))


# Drake: left half is the two Drake panels, right half white text boxes
im = ps1(Image.open(S / "drake.jpg").convert("RGB").resize((224, 224), Image.LANCZOS)); d = ImageDraw.Draw(im)
for (y, a, b) in ((56, "CHECK THE", "BEAMS"), (168, "INVITE 60", "MORE NOBLES")):
    label(d, (168, y - 10), a, 100, 20, (20, 20, 20), 0); label(d, (168, y + 12), b, 100, 20, (20, 20, 20), 0)
im.save(E / "drake.png")

im = ps1(Image.open(S / "pikachu.jpg").convert("RGB").resize((200, 200), Image.LANCZOS))
c = Image.new("RGB", (200, 244), (250, 250, 250)); c.paste(im, (0, 44)); d = ImageDraw.Draw(c)
label(d, (100, 14), "NOBLES WHEN THE FLOOR", 190, 18, (20, 20, 20), 0)
label(d, (100, 34), "GOES *CREAK*", 190, 18, (20, 20, 20), 0)
c.save(E / "pikachu.png")

im = ps1(Image.open(S / "buttons.jpg").convert("RGB").resize((148, 224), Image.LANCZOS)); d = ImageDraw.Draw(im)
for (x0, y0, x1, y1), (l1, l2) in (((4, 4, 72, 34), ("STAND ON", "THE FLOOR")), ((76, 4, 144, 34), ("SIT IN THE", "WINDOW"))):
    d.rectangle((x0, y0, x1, y1), fill=(252, 252, 248), outline=(20, 20, 20), width=1)      # clean label cards above the buttons
    label(d, ((x0 + x1) / 2, y0 + 9), l1, x1 - x0 - 6, 13, (20, 20, 20), 0); label(d, ((x0 + x1) / 2, y0 + 22), l2, x1 - x0 - 6, 13, (20, 20, 20), 0)
im.save(E / "buttons.png")

crops = {"snail": (0.09, 0.09, 0.91, 0.91)}
for name in ("grossup_monk", "grossup_jester", "snail", "goose", "boxart", "comic"):
    im = Image.open(S / f"{name}.jpg").convert("RGB")
    if name in crops:
        a, b, c_, e = crops[name]; im = im.crop((int(a * im.width), int(b * im.height), int(c_ * im.width), int(e * im.height)))
    h = 200; w = round(h * im.width / im.height)
    if w > 320:
        w = 320; h = round(w * im.height / im.width)
    ps1(im.resize((w, h), Image.LANCZOS)).save(E / f"{name}.png")
print(sorted(p.name for p in E.glob("*.png")))
