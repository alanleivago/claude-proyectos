"""V5 font comparison with V5's blurred dark band behind the text and no text shadow.
Run: .venv/bin/python pieces/odyssey/final/thumbs/make_v5d.py
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).parent))
import make_v5c  # noqa: E402
from make_thumbs import HERE, W, H, CREAM, font, grad_band  # noqa: E402

_base = make_v5c.base


def banded_base():
    im = _base()
    grad_band(im, 318, 448, 175)   # exactly the band of the original V5
    return im


make_v5c.base = banded_base


def main():
    outs = []
    for key in make_v5c.FONTS:
        name = f"v5d_{key}_band"
        im = make_v5c.make(key, shadow=False)
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
    sheet.save(HERE / "sheet_v5d.jpg", quality=88, optimize=True)
    print("ok", len(outs))


if __name__ == "__main__":
    main()
