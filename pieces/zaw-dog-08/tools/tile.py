"""venv: tile images into one sheet.  python tools/tile.py out.jpg cols w h img1 img2 ..."""
import sys
from PIL import Image, ImageDraw
out, cols, w, h = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]); fs = sys.argv[5:]
rows = -(-len(fs) // cols); s = Image.new("RGB", (cols * w, rows * (h + 18)), (20, 20, 20)); d = ImageDraw.Draw(s)
for k, f in enumerate(fs):
    x, y = (k % cols) * w, (k // cols) * (h + 18)
    s.paste(Image.open(f).convert("RGB").resize((w, h)), (x, y + 18)); d.text((x + 3, y + 3), f.split("/")[-1][:40], fill=(255, 230, 40))
s.save(out, quality=88); print(out)
