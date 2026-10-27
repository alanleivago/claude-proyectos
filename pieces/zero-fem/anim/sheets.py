"""python sheets.py -> sheets/<accion>.png (una fila por vista) y library.png (todas las acciones, frame final/medio)"""
import os, glob, json
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FR = os.path.join(HERE, "frames"); OUT = os.path.join(HERE, "sheets"); os.makedirs(OUT, exist_ok=True)
try: font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18); big = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)
except OSError: font = big = ImageFont.load_default()
lib = json.load(open(os.path.join(HERE, "actions.json")))
by = {}
for d in sorted(glob.glob(os.path.join(FR, "*_*"))):
    a, v = os.path.basename(d).rsplit("_", 1); by.setdefault(a, {})[v] = sorted(glob.glob(os.path.join(d, "*.png")))
thumbs = []
for a in lib:
    if a not in by: continue
    rows = [by[a][v] for v in ("3q", "side", "front") if v in by[a]]
    w, h = Image.open(rows[0][0]).size
    sheet = Image.new("RGB", (w * max(map(len, rows)), h * len(rows) + 34), (20, 20, 24))
    d = ImageDraw.Draw(sheet)
    info = lib[a]
    d.text((8, 5), f"{a}  {info['frames']} f  {'loop' if info['loop'] else 'one-shot'}", fill=(255, 220, 80), font=big)
    for r, files in enumerate(rows):
        for i, f in enumerate(files):
            sheet.paste(Image.open(f), (i * w, 34 + r * h))
            d.text((i * w + 6, 34 + r * h + 4), "f" + os.path.basename(f)[2:5].lstrip("0").rjust(1, "0"), fill=(255, 255, 255), font=font)
    sheet.save(os.path.join(OUT, f"{a}.png"))
    last = Image.open(rows[0][-1] if not info["loop"] else rows[0][len(rows[0]) // 3]).copy()
    ImageDraw.Draw(last).text((6, 6), a, fill=(255, 220, 80), font=big)
    thumbs.append(last)
cols = 8; w, h = thumbs[0].size
lib_img = Image.new("RGB", (w * cols, h * ((len(thumbs) + cols - 1) // cols)), (20, 20, 24))
for i, t in enumerate(thumbs): lib_img.paste(t, ((i % cols) * w, (i // cols) * h))
lib_img.save(os.path.join(HERE, "library.png"))
print("sheets", len(thumbs))
