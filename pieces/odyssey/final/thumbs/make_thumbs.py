"""Composite the Odyssey thumbnail versions: Flow art (gen/) + real-font titles.
Run: .venv/bin/python pieces/odyssey/final/thumbs/make_thumbs.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

HERE = Path(__file__).parent
GEN = HERE / "gen"
FONTS = HERE.parent / "fonts"
W, H = 1280, 720

ART = {
    "cyclops": "2026-11-02T13-09-51-ancient-greek-black-figure-vase-painting-1.jpg",
    "lone": "2026-11-02T13-10-22-ancient-greek-black-figure-vase-painting-1.jpg",
    "portrait": "2026-11-02T13-11-38-edit-v3draft-keep-everything-exactly-the-1.jpg",
    "ship": "2026-11-02T13-12-05-ancient-greek-black-figure-vase-painting-1.jpg",
    "sirens": "2026-11-02T13-12-59-reimagine-the-vase-scene-of-bncover-as-a-1.jpg",
    "archer": "2026-11-02T13-13-58-wide-169-youtube-thumbnail-in-the-exact--1.jpg",
    "ghosts": "2026-11-02T13-14-39-ancient-greek-black-figure-vase-painting-1.jpg",
}

CREAM = (246, 232, 204)
BLACK = (22, 14, 10)
MAROON = (92, 20, 16)


def font(name, size, weight=None):
    f = ImageFont.truetype(str(FONTS / name), size)
    if weight is not None:
        f.set_variation_by_axes([weight])
    return f


def art(key):
    im = Image.open(GEN / ART[key]).convert("RGB")
    return ImageOps.fit(im, (W, H), Image.LANCZOS)


def text(im, xy, s, f, fill, anchor="la", shadow=None, stroke=0, stroke_fill=None, spacing=0):
    """Draw text with optional soft shadow (color, blur, offset) and stroke; spacing = extra tracking px."""
    def draw_on(d, color, sw=0, sf=None):
        if spacing:
            # manual tracking
            total = sum(f.getlength(c) for c in s) + spacing * (len(s) - 1)
            x, y = xy
            if anchor[0] == "m":
                x -= total / 2
            elif anchor[0] == "r":
                x -= total
            for c in s:
                d.text((x, y), c, font=f, fill=color, anchor="l" + anchor[1], stroke_width=sw, stroke_fill=sf)
                x += f.getlength(c) + spacing
        else:
            d.text(xy, s, font=f, fill=color, anchor=anchor, stroke_width=sw, stroke_fill=sf)

    if shadow:
        col, blur, off = shadow
        layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
        draw_on(ImageDraw.Draw(layer), col, stroke + 2, col)
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
        im.paste(layer, (off, off), layer)
    draw_on(ImageDraw.Draw(im), fill, stroke, stroke_fill)


def arrow(im, x0, x1, y, th, col, head=None):
    d = ImageDraw.Draw(im)
    head = head or th * 2.6
    d.rectangle((x0, y - th / 2, x1 - head * 0.8, y + th / 2), fill=col)
    d.polygon([(x1, y), (x1 - head, y - head * 0.75), (x1 - head, y + head * 0.75)], fill=col)


def grad_band(im, y0, y1, alpha=170, side=None):
    """Soft dark band (vertical fade) or side vignette for legibility."""
    m = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(m)
    if side is None:
        d.rectangle((0, y0, W, y1), fill=alpha)
        m = m.filter(ImageFilter.GaussianBlur(40))
    else:
        x0, x1 = side
        d.rectangle((x0, y0, x1, y1), fill=alpha)
        m = m.filter(ImageFilter.GaussianBlur(80))
    im.paste(Image.new("RGB", im.size, (10, 6, 4)), (0, 0), m)


# ---------- versions ----------

def v1():  # ref OuGeoq_uVts: giant close-up + huge white sans
    im = art("cyclops")
    # Flow left a slightly blue-black box in the lower left: flatten dark pixels there to the body black
    px = im.load()
    for y in range(500, H):
        for x in range(0, 520):
            r, g, b = px[x, y]
            if r + g + b < 110:
                px[x, y] = (6, 4, 3)
    f = font("ArchivoBlack-Regular.ttf", 150)
    sh = ((0, 0, 0, 200), 10, 4)
    text(im, (40, 395), "THE", f, (255, 255, 255), "ls", sh)
    text(im, (40, 545), "ODYSSEY", f, (255, 255, 255), "ls", sh)
    return im


def v2():  # ref 8Z9FQxcCAZ0: flat red + lone figure + Greek hand caps
    im = art("lone")
    f1 = font("CaesarDressing-Regular.ttf", 74)
    f2 = font("CaesarDressing-Regular.ttf", 230)
    f3 = font("CaesarDressing-Regular.ttf", 92)
    sh = ((40, 8, 4, 160), 6, 3)
    cx = 340
    text(im, (cx, 150), "600 MEN LEFT", f1, CREAM, "ms", sh)
    text(im, (cx, 395), "ONE", f2, CREAM, "ms", sh)
    text(im, (cx, 510), "CAME HOME", f3, CREAM, "ms", sh)
    return im


def v3():  # ref ysnzl5fdtMI (favourite): ornate frieze + portrait + round logo badge
    im = art("portrait").convert("RGBA")
    cx, cy, r = 205, 560, 150
    ov = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    d.ellipse((cx - r - 30, cy - r - 30, cx + r + 30, cy + r + 30), fill=(10, 6, 4, 150))
    ov = ov.filter(ImageFilter.GaussianBlur(22))
    im.alpha_composite(ov)
    d = ImageDraw.Draw(im)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=CREAM, width=5)
    d.ellipse((cx - r + 12, cy - r + 12, cx + r - 12, cy + r - 12), outline=CREAM, width=2)
    # band across the circle, like the ODYSSEY channel bug
    bw = 380
    d.rectangle((cx - bw / 2, cy - 38, cx + bw / 2, cy + 38), fill=(16, 10, 7, 255))
    d.line((cx - bw / 2, cy - 38, cx + bw / 2, cy - 38), fill=CREAM, width=3)
    d.line((cx - bw / 2, cy + 38, cx + bw / 2, cy + 38), fill=CREAM, width=3)
    im = im.convert("RGB")
    f = font("Cinzel[wght].ttf", 50, 700)
    text(im, (cx, cy + 2), "ODYSSEY", f, CREAM, "mm", spacing=8)
    fn = font("Cinzel[wght].ttf", 54, 900)
    text(im, (cx - 52, cy - 82), "600", fn, CREAM, "mm")
    arrow(im, cx + 2, cx + 46, cy - 80, 7, CREAM, 18)
    text(im, (cx + 70, cy - 82), "1", fn, CREAM, "mm")
    return im


def v4():  # ref CVo225pUaSA: ship left + stacked Trajan-style serif right
    im = art("ship")
    fbig = font("Cinzel[wght].ttf", 150, 900)
    fmid = font("Cinzel[wght].ttf", 70, 800)
    cx = 1000
    sh = ((246, 232, 204, 120), 8, 0)
    text(im, (cx, 175), "600", fbig, MAROON, "ms", sh)
    text(im, (cx, 255), "SAILED", fmid, MAROON, "ms", sh)
    d = ImageDraw.Draw(im)
    d.rectangle((cx - 190, 290, cx + 190, 297), fill=CREAM)
    text(im, (cx, 445), "ONE", fbig, BLACK, "ms", sh)
    text(im, (cx, 525), "RETURNED", fmid, BLACK, "ms", sh)
    return im


def v5():  # pasted B&N cover: full-bleed vase scene + centred classic small-caps title
    im = art("sirens")
    grad_band(im, 318, 448, 175)
    f = font("CormorantSC-Bold.ttf", 132)
    text(im, (640, 400), "The Odyssey", f, CREAM, "ms", ((0, 0, 0, 230), 6, 3))
    d = ImageDraw.Draw(im)
    d.rectangle((420, 420, 860, 424), fill=CREAM)
    f2 = font("Cinzel[wght].ttf", 40, 800)
    text(im, (640, 475), "ONLY ONE RETURNED", f2, CREAM, "ms", ((0, 0, 0, 255), 6, 2), spacing=4)
    return im


def v6():  # pasted key-border poster: stone texture, black archer, calligraphic title
    im = art("archer")
    f1 = font("Fondamento-Regular.ttf", 130)
    f2 = font("Fondamento-Regular.ttf", 196)
    sh = ((246, 225, 200, 90), 6, 0)
    text(im, (250, 265), "The", f1, BLACK, "ls", sh)
    text(im, (50, 440), "Odyssey", f2, BLACK, "ls", sh)
    f3 = font("Cinzel[wght].ttf", 46, 800)
    text(im, (75, 540), "ONLY ONE CAME HOME", f3, (70, 30, 18), "ls", spacing=3)
    return im


def v7():  # combination: ghost procession (600 -> 1) + key frieze + Cinzel numbers + calligraphic title
    im = art("ghosts")
    fn = font("Cinzel[wght].ttf", 175, 900)
    sh = ((40, 10, 4, 170), 7, 3)
    text(im, (40, 330), "600", fn, BLACK, "ls", sh)
    arrow(im, 418, 525, 268, 20, BLACK, 50)
    text(im, (545, 330), "1", fn, BLACK, "ls", sh)
    ft = font("Fondamento-Regular.ttf", 128)
    text(im, (50, 500), "The Odyssey", ft, CREAM, "ls", ((30, 8, 4, 220), 6, 3))
    return im


VERSIONS = [
    ("v1_cyclops_giant", v1),
    ("v2_lone_survivor", v2),
    ("v3_vase_portrait", v3),
    ("v4_empty_ship", v4),
    ("v5_sirens_cover", v5),
    ("v6_archer_poster", v6),
    ("v7_ghost_crew", v7),
]


def main():
    outs = []
    for name, fn in VERSIONS:
        im = fn()
        p = HERE / f"{name}.jpg"
        im.save(p, quality=90, optimize=True)
        assert p.stat().st_size < 2_000_000
        outs.append((name, im))
        print(name, p.stat().st_size // 1024, "KB")
    # contact sheet: each version 640x360 + its 320x180 mobile inset
    cw, ch, lab = 640, 360, 34
    cols = 2
    rows = (len(outs) + 1) // 2
    sheet = Image.new("RGB", (cols * (cw + 350) + 20, rows * (ch + lab + 20) + 20), (30, 24, 20))
    d = ImageDraw.Draw(sheet)
    lf = font("Cinzel[wght].ttf", 24, 700)
    for i, (name, im) in enumerate(outs):
        x = 20 + (i % cols) * (cw + 350)
        y = 20 + (i // cols) * (ch + lab + 20)
        d.text((x, y), name, font=lf, fill=CREAM)
        sheet.paste(im.resize((cw, ch), Image.LANCZOS), (x, y + lab))
        small = im.resize((320, 180), Image.LANCZOS)
        sx, sy = x + cw + 12, y + lab + ch - 180
        d.rectangle((sx - 3, sy - 3, sx + 323, sy + 183), fill=CREAM)
        sheet.paste(small, (sx, sy))
    sheet.save(HERE / "sheet.jpg", quality=88, optimize=True)
    print("sheet", sheet.size)


if __name__ == "__main__":
    main()
