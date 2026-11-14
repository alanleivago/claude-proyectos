# thumb2.py: thumbnail in the reference channels' style (Whatfinity / Edgecount / Elapsed):
# clean frame fills the thumbnail, a left column of serif text: small spaced caps label, a huge number, an italic line.
#   usage: python tools/thumb2.py plate.png out.png "LABEL" "BIG" "italic line" [crop x0 y0 x1 y1]
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
src, out, label, big, line = sys.argv[1:6]
box = tuple(int(v) for v in sys.argv[6:10]) if len(sys.argv) >= 10 else (260, 40, 1860, 940)
im = Image.open(src).convert("RGB").crop(box).resize((1280, 720), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.1); im = ImageEnhance.Color(im).enhance(1.2); im = ImageEnhance.Brightness(im).enhance(1.08)
# soft dark falloff behind the text column
sh = Image.new("L", im.size, 0); ds = ImageDraw.Draw(sh)
for x in range(760):
    ds.line([(x, 0), (x, 720)], fill=int(225 * (1 - x / 760) ** 1.3))
im.paste(Image.new("RGB", im.size, (6, 6, 10)), (0, 0), sh)
F = "C:/Windows/Fonts/"
def put(xy, s, font, fill=(255, 255, 255), spacing=0):
    x, y = xy; lay = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for ch in (s if spacing else [s]):
        d.text((x, y), ch, font=font, fill=fill + (255,)); x += (font.getlength(ch) + spacing) if spacing else 0
    shadow = Image.new("RGBA", im.size, (0, 0, 0, 0)); shadow.putalpha(lay.getchannel("A").filter(ImageFilter.GaussianBlur(8)).point(lambda a: int(a * 0.85)))
    im.paste(Image.new("RGB", im.size, (0, 0, 0)), (3, 5), shadow); im.paste(lay, (0, 0), lay)
put((46, 190), label, ImageFont.truetype(F + "georgia.ttf", 30), (235, 235, 240), spacing=7)
put((38, 232), big, ImageFont.truetype(F + "georgia.ttf", 132))
put((46, 420), line, ImageFont.truetype(F + "georgiai.ttf", 46), (240, 240, 245))
im.save(out); print("wrote", out, im.size)
