"""lib-mml / sheet.py — arma preview.png con todos los renders de previews/ y etiquetas.
  python sheet.py
"""
import json, os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))
stats = json.load(open(os.path.join(OUT, "data", "stats.json")))
vpath = os.path.join(OUT, "variants.json")
variants = json.load(open(vpath)) if os.path.exists(vpath) else {}
tiles = []
for mid, st in stats.items():
    for v in ["orig"] + variants.get(st["tex"], []):
        p = os.path.join(OUT, "previews", "%s__%s.png" % (mid, v))
        if os.path.exists(p):
            d = st["dims_m"]
            tiles.append((p, "%s / %s" % (mid, v), "%.2f x %.2f x %.2f m" % (d[0], d[1], d[2])))
T, COLS, LAB = 300, 8, 34
rows = (len(tiles) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * T, rows * (T + LAB)), (40, 40, 40))
dr = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("arial.ttf", 14)
except OSError:
    font = ImageFont.load_default()
for i, (p, a, b) in enumerate(tiles):
    x, y = (i % COLS) * T, (i // COLS) * (T + LAB)
    sheet.paste(Image.open(p).convert("RGB").resize((T, T), Image.LANCZOS), (x, y))
    dr.text((x + 6, y + T + 2), a, fill=(255, 255, 255), font=font)
    dr.text((x + 6, y + T + 18), b, fill=(190, 190, 190), font=font)
sheet.save(os.path.join(OUT, "preview.png"))
print("preview.png", len(tiles), "tiles")
