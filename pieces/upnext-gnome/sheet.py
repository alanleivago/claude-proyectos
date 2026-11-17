"""Review sheet: reference gnome (original reels) | turnaround | expressions | key poses.

    node render.mjs && python sheet.py [v1]      # -> review/sheet_<v>.png"""
import os, sys, json
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FR = os.path.join(HERE, "review", "frames")
REF = os.path.join(HERE, "..", "..", "fuentes", "jongmin-design", "remake", "cuts", "DeDhBizhWi3_sheet.jpg")
V = sys.argv[1] if len(sys.argv) > 1 else "v1"
labels = json.load(open(os.path.join(FR, "labels.json")))
F = lambda s: ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", s)
W, PAD, BG, FG = 2700, 24, (28, 30, 34), (235, 235, 235)
sheet = Image.new("RGB", (W, 3600), BG); d = ImageDraw.Draw(sheet)
y = PAD
d.text((PAD, y), f"Pip the gnome (UpNext) - review {V} - unlit three.js render of out/gnome_anim.glb", font=F(34), fill=FG); y += 56


def tile(img, x, y, w, h, label=None):
    sheet.paste(img.resize((w, h), Image.NEAREST if img.width < w else Image.LANCZOS), (x, y))
    if label:
        d.rectangle((x, y + h - 30, x + w, y + h), fill=(0, 0, 0))
        d.text((x + 6, y + h - 27), label, font=F(20), fill=FG)


# row 1: reference + turnaround
d.text((PAD, y), "Reference: @jongmin.design gnome (DeDh)", font=F(24), fill=(250, 200, 120))
d.text((PAD + 5 * 222 + 40, y), "Turnaround (rest pose)", font=F(24), fill=(150, 210, 250)); y += 34
ref = Image.open(REF)
for i, (c, r) in enumerate([(1, 0), (5, 1), (4, 2), (0, 3), (6, 3)]):
    tile(ref.crop((c * 270, r * 480 + 24, c * 270 + 270, r * 480 + 480)), PAD + i * 222, y, 216, 365)
for i, v in enumerate(["front", "3q", "side", "3qb", "back"]):
    tile(Image.open(os.path.join(FR, f"turn_{v}.png")), PAD + 5 * 222 + 40 + i * 282, y, 274, 365, v)
y += 365 + 30

# expressions: A = Servbot-style eyes (default atlas), B = small gnome eyes + brows (review v1)
for v, title, size, cols in (("a", "Expressions A - Servbot-style eyes (tex/gnome_eyes.png, default in gnome_anim.glb)", 330, 8),
                             ("b", "Expressions B - small eyes + white brows (tex/gnome_eyes_b.png, gnome_anim_eyesB.glb)", 176, 15)):
    d.text((PAD, y), title, font=F(24), fill=(150, 210, 250)); y += 34
    ex = sorted(k for k in labels if k.startswith(f"expr{v}_"))
    for i, k in enumerate(ex):
        tile(Image.open(os.path.join(FR, k + ".png")).crop((0, 30, 360, 390)), PAD + (i % cols) * (size + 2) + (0 if v == "a" else 0),
             y + (i // cols) * (size + 10), size, size, labels[k] if size > 200 else labels[k][:14])
    y += ((len(ex) + cols - 1) // cols) * (size + 10) + 20

# row 4: poses
d.text((PAD, y), "Key poses (clip + frame @30fps)", font=F(24), fill=(150, 210, 250)); y += 34
po = sorted(k for k in labels if k.startswith("pose_"))
for i, k in enumerate(po):
    tile(Image.open(os.path.join(FR, k + ".png")), PAD + (i % 6) * 440, y + (i // 6) * 570, 420, 560, labels[k])
y += ((len(po) + 5) // 6) * 570
sheet = sheet.crop((0, 0, W, y + PAD))
out = os.path.join(HERE, "review", f"sheet_{V}.png")
sheet.save(out); print("SHEET", out, sheet.size)
