"""python contact.py <dir> <out.png> [cols=8]  - labelled contact sheet of every png in dir (sorted by name order given in files)"""
import sys, os, glob
from PIL import Image, ImageDraw, ImageFont
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 8
fs = sorted(glob.glob(os.path.join(d, "*.png")), key=os.path.getmtime)
ims = [Image.open(f) for f in fs]; w, h = ims[0].size
s = Image.new("RGB", (cols * w, ((len(ims) + cols - 1) // cols) * h), (20, 20, 20)); dr = ImageDraw.Draw(s)
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 16)
for i, (p, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * w, (i // cols) * h; s.paste(im, (x, y)); dr.text((x + 4, y + 4), os.path.basename(p)[:-4], font=f, fill=(0, 0, 0))
s.save(out); print(out, s.size)
