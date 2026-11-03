"""V5 (Sirens) alternatives: same art, Greek key on top, title-font and subtitle variants.
Run: .venv/bin/python pieces/odyssey/final/thumbs/make_v5b.py
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, str(Path(__file__).parent))
from make_thumbs import HERE, W, H, CREAM, art, font, text  # noqa: E402

BAND = 50          # the art's own meander strip is y 670..720
BROWN = (52, 40, 32)
RED = (200, 30, 45)


def base():
    im = art("sirens")
    strip = im.crop((0, H - BAND, W, H)).transpose(Image.FLIP_TOP_BOTTOM)
    im.paste(strip, (0, 0))
    return im


def tracked_width(s, f, sp):
    return sum(f.getlength(c) for c in s) + sp * (len(s) - 1)


def dark_band(im, y0, y1, alpha=175):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rectangle((0, y0, W, y1), fill=alpha)
    m = m.filter(ImageFilter.GaussianBlur(40))
    im.paste(Image.new("RGB", im.size, (10, 6, 4)), (0, 0), m)


def solid_band(im, y0, y1, alpha=235):
    """Image-3 style flat dark-brown band, edged by thin cream rules."""
    ov = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    d.rectangle((0, y0, W, y1), fill=BROWN + (alpha,))
    d.rectangle((0, y0 + 6, W, y0 + 8), fill=CREAM + (200,))
    d.rectangle((0, y1 - 8, W, y1 - 6), fill=CREAM + (200,))
    base = im.convert("RGBA")
    base.alpha_composite(ov)
    return base.convert("RGB")


def red_label(im, cx, cy, s, f, sp):
    """Everyman-style red label with an ornamental dotted white border."""
    tw = tracked_width(s, f, sp)
    w, h = tw + 76, 74
    x0, y0 = cx - w / 2, cy - h / 2
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle((x0 + 4, y0 + 6, x0 + w + 4, y0 + h + 6), fill=(0, 0, 0, 140))
    sh = sh.filter(ImageFilter.GaussianBlur(6))
    b = im.convert("RGBA"); b.alpha_composite(sh); im.paste(b.convert("RGB"))
    d = ImageDraw.Draw(im)
    d.rectangle((x0, y0, x0 + w, y0 + h), fill=RED)
    # ornamental border: a ring of small white dots between two thin rules
    d.rectangle((x0 + 5, y0 + 5, x0 + w - 5, y0 + h - 5), outline=(255, 255, 255), width=1)
    d.rectangle((x0 + 15, y0 + 15, x0 + w - 15, y0 + h - 15), outline=(255, 255, 255), width=1)
    step = 9
    x = x0 + 10
    while x <= x0 + w - 10:
        for yy in (y0 + 10, y0 + h - 10):
            d.ellipse((x - 2, yy - 2, x + 2, yy + 2), fill=(255, 255, 255))
        x += step
    y = y0 + 10 + step
    while y <= y0 + h - 10 - step / 2:
        for xx in (x0 + 10, x0 + w - 10):
            d.ellipse((xx - 2, y - 2, xx + 2, y + 2), fill=(255, 255, 255))
        y += step
    text(im, (cx, cy + 1), s, f, (255, 255, 255), "mm", spacing=sp)


AMPH = "1689-glc-garamond-pro-normal.otf"   # BF_CAPS: the AMPHORUS sign-off font (bfLogo, letterSpacing 0.12*size)
SH = ((0, 0, 0, 235), 6, 3)


def a1():  # AMPHORUS font, cream, dark band, ONLY ONE RETURNED
    im = base()
    dark_band(im, 312, 470)
    f = font(AMPH, 118)
    text(im, (640, 405), "THE ODYSSEY", f, CREAM, "ms", SH, spacing=14)
    d = ImageDraw.Draw(im); d.rectangle((440, 424, 840, 427), fill=CREAM)
    text(im, (640, 470), "ONLY ONE RETURNED", font(AMPH, 42), CREAM, "ms", SH, spacing=6)
    return im


def a2():  # AMPHORUS font, cream on the image-3 brown band, 600 MEN LEFT. ONE CAME HOME.
    im = base()
    im = solid_band(im, 300, 495)
    text(im, (640, 412), "THE ODYSSEY", font(AMPH, 122), CREAM, "ms", spacing=15)
    text(im, (640, 466), "600 MEN LEFT. ONE CAME HOME.", font("Cinzel[wght].ttf", 38, 700), CREAM, "ms", spacing=4)
    return im


def b1():  # image-3 cover: brown band, widely tracked old-style SC, HOMER above
    im = base()
    im = solid_band(im, 285, 480)
    text(im, (640, 338), "HOMER", font("CormorantSC-Bold.ttf", 52), CREAM, "ms", spacing=26)
    text(im, (640, 448), "THE ODYSSEY", font("IMFeENsc28P.ttf", 112), CREAM, "ms", spacing=22)
    return im


def b2():  # image-3 cover band + TEN YEARS TO GET HOME
    im = base()
    im = solid_band(im, 300, 495)
    text(im, (640, 410), "THE ODYSSEY", font("IMFeENsc28P.ttf", 116), CREAM, "ms", spacing=22)
    text(im, (640, 468), "TEN YEARS TO GET HOME", font("CormorantSC-Bold.ttf", 42), CREAM, "ms", spacing=10)
    return im


def c1():  # Everyman: thin wide-tracked roman caps in white + red label THE WHOLE STORY above
    im = base()
    dark_band(im, 330, 450, 150)
    red_label(im, 640, 292, "THE WHOLE STORY", font("Cinzel[wght].ttf", 34, 700), 8)
    text(im, (640, 432), "THE ODYSSEY", font("CormorantGaramond[wght].ttf", 116, 600), (255, 255, 255), "ms", SH, spacing=30)
    return im


def c2():  # Everyman, red label below with the hook
    im = base()
    dark_band(im, 320, 440, 150)
    text(im, (640, 420), "THE ODYSSEY", font("CormorantGaramond[wght].ttf", 116, 600), (255, 255, 255), "ms", SH, spacing=30)
    red_label(im, 640, 486, "600 MEN LEFT. ONE CAME HOME.", font("Cinzel[wght].ttf", 32, 700), 4)
    return im


VERSIONS = [
    ("v5b_a1_amphorus_cream_only_one", a1),
    ("v5b_a2_amphorus_band_600men", a2),
    ("v5b_b1_fell_band_homer", b1),
    ("v5b_b2_fell_band_ten_years", b2),
    ("v5b_c1_everyman_whole_story", c1),
    ("v5b_c2_everyman_600men", c2),
]


def main():
    outs = []
    for name, fn in VERSIONS:
        im = fn()
        p = HERE / f"{name}.jpg"
        im.save(p, quality=90, optimize=True)
        assert im.size == (W, H) and p.stat().st_size < 2_000_000
        outs.append((name, im))
    cw, ch, lab, cols = 640, 360, 34, 2
    rows = (len(outs) + 1) // 2
    sheet = Image.new("RGB", (cols * (cw + 350) + 20, rows * (ch + lab + 20) + 20), (30, 24, 20))
    d = ImageDraw.Draw(sheet)
    lf = font("Cinzel[wght].ttf", 22, 700)
    for i, (name, im) in enumerate(outs):
        x = 20 + (i % cols) * (cw + 350)
        y = 20 + (i // cols) * (ch + lab + 20)
        d.text((x, y), name, font=lf, fill=CREAM)
        sheet.paste(im.resize((cw, ch), Image.LANCZOS), (x, y + lab))
        sx, sy = x + cw + 12, y + lab + ch - 180
        d.rectangle((sx - 3, sy - 3, sx + 323, sy + 183), fill=CREAM)
        sheet.paste(im.resize((320, 180), Image.LANCZOS), (sx, sy))
    sheet.save(HERE / "sheet_v5.jpg", quality=88, optimize=True)
    print("ok", len(outs))


if __name__ == "__main__":
    main()
