"""venv: review/raw/*.png -> one contact sheet (quick look while staging).  python tools/contact.py [beat ...] -> review/contact.jpg"""
import os, sys
from PIL import Image, ImageDraw
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); R = os.path.join(H, "review", "raw")
names = sys.argv[1:] or sorted(f[:-4] for f in os.listdir(R) if f.endswith(".png"))
W, Hh, cols = 270, 480, min(7, len(names))
sh = Image.new("RGB", (cols * W, ((len(names) + cols - 1) // cols) * Hh), (20, 20, 20))
for k, n in enumerate(names):
    im = Image.open(os.path.join(R, n + ".png")).convert("RGB").resize((W, Hh))
    ImageDraw.Draw(im).text((6, 6), n, fill="yellow"); sh.paste(im, ((k % cols) * W, (k // cols) * Hh))
sh.save(os.path.join(H, "review", "contact.jpg"), quality=85); print(os.path.join(H, "review", "contact.jpg"))
