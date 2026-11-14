# thumb.py: the YouTube thumbnail (1280x720) from a clean render (no HUD): crop in on the window, big readable text.
#   usage: python tools/thumb.py plate.png renders/thumb.png
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
# crop towards the window and the ring (the plate is 1920x1080)
box = (230, 60, 1690, 881); im = im.crop(box).resize((1280, 720), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.12); im = ImageEnhance.Color(im).enhance(1.15)
d = ImageDraw.Draw(im, "RGBA")
F = lambda s: ImageFont.truetype("C:/Windows/Fonts/impact.ttf", s)
def text(xy, s, size, fill, anchor="la"):
    f = F(size); x, y = xy
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
    ds.text((x + 4, y + 6), s, font=f, fill=(0, 0, 0, 220), anchor=anchor); sh = sh.filter(ImageFilter.GaussianBlur(6)); im.paste(sh, (0, 0), sh)
    d2 = ImageDraw.Draw(im); d2.text((x, y), s, font=f, fill=fill, anchor=anchor, stroke_width=4, stroke_fill=(10, 10, 14))
text((40, 26), "IT NEVER", 118, (255, 255, 255))
text((40, 140), "STOPS.", 118, (244, 184, 74))
text((1240, 600), "99.99% LIGHT SPEED", 64, (255, 255, 255), "ra")
im.save(out); print("wrote", out, im.size)
