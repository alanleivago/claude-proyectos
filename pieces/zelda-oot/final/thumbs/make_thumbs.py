"""zelda-oot thumbnails in the approved AMPHORUS cream design (Odyssey v5d band / v5c shadow): Flow tapestry art,
cream title in 1689 GLC Garamond with tracking, cream rule, subtitle. Two versions: band (dark blurred band behind the
text, no shadow) and shadow (soft drop shadow, no band).  Run: .venv/bin/python pieces/zelda-oot/final/thumbs/make_thumbs.py
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
ODY = Path(__file__).resolve().parents[3] / 'odyssey' / 'final' / 'thumbs'
sys.path.insert(0, str(ODY))
from make_thumbs import W, H, CREAM, font, text, grad_band  # noqa: E402
HERE = Path(__file__).parent
TITLE, SUB = 'OCARINA OF TIME', 'TOLD ON A TAPESTRY'
SH_T, SH_S, RULE = ((0, 0, 0, 230), 6, 3), ((0, 0, 0, 255), 6, 2), (330, 950)
def base(): return ImageOps.fit(Image.open(HERE / 'gen' / 'art_dark.jpg').convert('RGB'), (W, H), Image.LANCZOS)
def make(shadow, band):
    im = base()
    if band: grad_band(im, 318, 448, 175)
    text(im, (640, 400), TITLE, font('1689-glc-garamond-pro-normal.otf', 104), CREAM, 'ms', SH_T if shadow else None, spacing=12)
    if shadow:
        m = Image.new('RGBA', im.size, (0, 0, 0, 0)); ImageDraw.Draw(m).rectangle((RULE[0], 422, RULE[1], 426), fill=(0, 0, 0, 230))
        b = im.convert('RGBA'); b.alpha_composite(m.filter(ImageFilter.GaussianBlur(4)), (3, 3)); im.paste(b.convert('RGB'))
    ImageDraw.Draw(im).rectangle((RULE[0], 420, RULE[1], 424), fill=CREAM)
    text(im, (640, 475), SUB, font('1689-glc-garamond-pro-normal.otf', 44), CREAM, 'ms', SH_S if shadow else None, spacing=6)
    return im
for name, sh, bd in (('thumbnail_band', False, True), ('thumbnail_shadow', True, False)):
    im = make(sh, bd); p = HERE.parent / f'{name}.jpg'; im.save(p, quality=90, optimize=True); assert im.size == (W, H) and p.stat().st_size < 2_000_000; print(p)
