"""V5 (Sirens) font comparison: V5 layout, Greek key on top, NO band behind the text,
each title font with and without the soft drop shadow, subtitle TOLD ON A GREEK VASE.
Run: .venv/bin/python pieces/odyssey/final/thumbs/make_v5c.py
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).parent))
from make_thumbs import HERE, W, H, CREAM, art, font, text  # noqa: E402

BAND = 50   # the art's own meander strip (y 670..720), flipped onto the top edge
SUB = "TOLD ON A GREEK VASE"
SH_T = ((0, 0, 0, 230), 6, 3)    # V5 title shadow
SH_S = ((0, 0, 0, 255), 6, 2)    # V5 subtitle shadow
RULE = (330, 950)                # longer divider (V5 was 420..860)


def base():
    im = art("sirens")
    im.paste(im.crop((0, H - BAND, W, H)).transpose(Image.FLIP_TOP_BOTTOM), (0, 0))
    return im


# name: (title, title font, tracking, subtitle font, subtitle tracking)
FONTS = {
    "v5font": ("The Odyssey", lambda: font("CormorantSC-Bold.ttf", 132), 0,
               lambda: font("Cinzel[wght].ttf", 40, 800), 4),
    "amphorus": ("THE ODYSSEY", lambda: font("1689-glc-garamond-pro-normal.otf", 120), 14,
                 lambda: font("1689-glc-garamond-pro-normal.otf", 44), 6),
    "fell": ("THE ODYSSEY", lambda: font("IMFeENsc28P.ttf", 112), 22,
             lambda: font("IMFeENsc28P.ttf", 44), 8),
    "cormorant": ("THE ODYSSEY", lambda: font("CormorantGaramond[wght].ttf", 118, 500), 30,
                  lambda: font("CormorantGaramond[wght].ttf", 42, 600), 10),
}


def make(key, shadow):
    title, ft, tsp, fs, ssp = FONTS[key]
    im = base()
    text(im, (640, 400), title, ft(), CREAM, "ms", SH_T if shadow else None, spacing=tsp)
    d = ImageDraw.Draw(im)
    if shadow:  # the rule gets the same soft shadow as the text
        from PIL import ImageFilter
        m = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(m).rectangle((RULE[0], 422, RULE[1], 426), fill=(0, 0, 0, 230))
        m = m.filter(ImageFilter.GaussianBlur(4))
        b = im.convert("RGBA"); b.alpha_composite(m, (3, 3)); im.paste(b.convert("RGB"))
        d = ImageDraw.Draw(im)
    d.rectangle((RULE[0], 420, RULE[1], 424), fill=CREAM)
    text(im, (640, 475), SUB, fs(), CREAM, "ms", SH_S if shadow else None, spacing=ssp)
    return im


def main():
    outs = []
    for key in FONTS:
        for shadow in (True, False):
            name = f"v5c_{key}_{'shadow' if shadow else 'noshadow'}"
            im = make(key, shadow)
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
    sheet.save(HERE / "sheet_v5c.jpg", quality=88, optimize=True)
    print("ok", len(outs))


if __name__ == "__main__":
    main()
