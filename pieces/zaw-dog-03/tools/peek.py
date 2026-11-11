"""venv: tile review/raw beats (split panels stacked) into one quick-look sheet.  python tools/peek.py out.jpg beat [beat ...]"""
import os, sys
from PIL import Image, ImageDraw
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); RAW = os.path.join(H, "review", "raw")
ims = []
for n in sys.argv[2:]:
    p = os.path.join(RAW, n + ".png")
    if os.path.exists(p):
        im = Image.open(p).convert("RGB")
    else:
        ps = sorted(f for f in os.listdir(RAW) if f.startswith(n + "_p")); im = Image.new("RGB", (540, 960))
        for k, f in enumerate(ps):
            im.paste(Image.open(os.path.join(RAW, f)).convert("RGB"), (0, k * 960 // len(ps)))
    im = im.resize((360, 640)); ImageDraw.Draw(im).text((6, 6), n, fill="yellow"); ims.append(im)
cols = min(len(ims), 5); rows = (len(ims) + cols - 1) // cols
sh = Image.new("RGB", (cols * 364, rows * 644), (20, 20, 20))
for k, im in enumerate(ims):
    sh.paste(im, ((k % cols) * 364, (k // cols) * 644))
sh.save(sys.argv[1], quality=85)
