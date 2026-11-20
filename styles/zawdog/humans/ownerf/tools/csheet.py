"""csheet.py out.jpg cols thumbw file1 [file2 ...]  (label = basename) ; or with --crop x0,y0,x1,y1 (fractions)"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
a = sys.argv[1:]
crop = None
if a[0] == "--crop":
    crop = [float(x) for x in a[1].split(",")]; a = a[2:]
out, cols, tw = a[0], int(a[1]), int(a[2]); files = a[3:]
ims = []
for f in files:
    im = Image.open(f).convert("RGB")
    if crop:
        W, H = im.size; im = im.crop((int(crop[0]*W), int(crop[1]*H), int(crop[2]*W), int(crop[3]*H)))
    im = im.resize((tw, int(im.size[1] * tw / im.size[0])), Image.LANCZOS); ims.append((os.path.splitext(os.path.basename(f))[0], im))
th = max(i.size[1] for _, i in ims); rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (cols * tw, rows * th), (0, 0, 0)); d = ImageDraw.Draw(S)
try:
    fnt = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 18)
except Exception:
    fnt = ImageFont.load_default()
for k, (n, im) in enumerate(ims):
    x, y = (k % cols) * tw, (k // cols) * th; S.paste(im, (x, y)); d.rectangle((x, y, x + 8 + 11 * len(n), y + 22), fill=(0, 0, 0)); d.text((x + 4, y + 2), n, fill=(255, 255, 0), font=fnt)
S.save(out, quality=88); print(out, S.size)
