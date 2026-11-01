# board.py STILLS_DIR META.json OUT.png "changed shot list" -> storyboard board: the middle still of every shot (from
# render.mjs --shots: sNN[abc]_fXXXX.png; the opening/ending shots use a and c too), shot number, start time, first words,
# and a CHANGED tag on the shots that differ from v1.
import sys, os, glob, re, json
from PIL import Image, ImageDraw, ImageFont
D, META, OUT, CH = sys.argv[1], sys.argv[2], sys.argv[3], {int(x) for x in sys.argv[4].split(",") if x}
TITLE = sys.argv[5] if len(sys.argv) > 5 else "storyboard"
meta = json.load(open(META, encoding="utf-8")); shots = meta["film"]["shots"]; words = meta["words"]
by = {}
for f in glob.glob(os.path.join(D, "s*_f*.png")):
    m = re.match(r"s(\d+)([abc])_f(\d+)", os.path.basename(f)); by.setdefault(int(m.group(1)), {})[m.group(2)] = f
fb = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 17); fs = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
W, H, CAP, COLS = 216, 384, 40, 8
n = len(shots); rows = (n + COLS - 1) // COLS
im = Image.new("RGB", (W * COLS, 34 + rows * (H + CAP)), (16, 16, 20)); d = ImageDraw.Draw(im)
d.text((8, 7), TITLE, fill=(255, 220, 80), font=fb)
for i, (name, t0, hard) in enumerate(shots):
    k = i + 1; t1 = shots[i + 1][1] if i + 1 < n else meta["film"]["dur"]
    x, y = (i % COLS) * W, 34 + (i // COLS) * (H + CAP)
    f = by.get(k, {}).get("b")
    if f: im.paste(Image.open(f).convert("RGB").resize((W, H), Image.NEAREST), (x, y))
    txt = " ".join(w[2] for w in words if t0 - 0.05 <= w[0] < t1)[:34]
    d.rectangle([x, y + H, x + W - 1, y + H + CAP - 1], fill=(28, 28, 34))
    d.text((x + 5, y + H + 3), f"#{k}  {t0:.1f}s {'C' if hard else 'M'}", fill=(255, 255, 255), font=fb)
    d.text((x + 5, y + H + 22), txt, fill=(200, 200, 210), font=fs)
    if k in CH:
        d.rectangle([x + 2, y + 2, x + 92, y + 22], fill=(254, 44, 85)); d.text((x + 6, y + 3), "CHANGED", fill=(255, 255, 255), font=fb)
im.save(OUT); print("board", OUT, im.size)
