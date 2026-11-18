"""AIRY profile pictures v2: his_idle through the reference camera f001 (tights), 3 cute expressions x 8 flat colours,
head centred for the circle crop (head box found from the render's alpha). python branding/v2/make_pfp.py"""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.dirname(os.path.abspath(__file__)))
EXPR = {"happy": "pfp2_0", "sparkle": "pfp2_1", "wink": "pfp2_2"}
COLS = {"teal": (38, 196, 214), "bubblegum": (255, 122, 178), "lavender": (180, 158, 240), "mint": (128, 226, 184),
        "peach": (255, 186, 148), "sky": (112, 186, 255), "butter": (255, 224, 104), "coral": (255, 116, 108)}


def head_box(a):
    rows = np.nonzero(a.max(1) > 8)[0]; top = rows[0]
    w = np.array([(np.ptp(np.nonzero(a[y] > 8)[0]) if (a[y] > 8).any() else 0) for y in range(a.shape[0])])
    lo, hi = top + 650, top + 1150; neck = lo + int(np.argmin(w[lo:hi]))      # narrowest row under the bob = the neck
    ys, xs = np.nonzero(a[top:neck] > 8)
    return xs.min(), top, xs.max(), neck


for ename, src in EXPR.items():
    fg = Image.open(f"../../review/engine2/brand_{src}.png").convert("RGBA"); a = np.asarray(fg)[..., 3]
    x0, y0, x1, y1 = head_box(a); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; size = int(1.55 * max(x1 - x0, y1 - y0))
    cy += 0.07 * size                                            # a little turtleneck under the chin
    box = (int(cx - size / 2), int(cy - size / 2), int(cx - size / 2) + size, int(cy - size / 2) + size)
    crop = fg.crop(box); print(ename, "head", (x0, y0, x1, y1), "crop", box)
    for cname, col in COLS.items():
        im = Image.new("RGBA", crop.size, col + (255,)); im.alpha_composite(crop); im = im.convert("RGB")
        im.resize((1080, 1080), Image.LANCZOS).save(f"pfp_{ename}_{cname}_1080.png")
# grid sheet: rows = expressions, cols = colours, circles
T = 300; fnt = ImageFont.truetype("arial.ttf", 18)
G = Image.new("RGB", (len(COLS) * (T + 20) + 20, len(EXPR) * (T + 50) + 20), (26, 26, 28)); d = ImageDraw.Draw(G)
m = Image.new("L", (T, T), 0); ImageDraw.Draw(m).ellipse([0, 0, T - 1, T - 1], fill=255)
for r, en in enumerate(EXPR):
    for c, cn in enumerate(COLS):
        im = Image.open(f"pfp_{en}_{cn}_1080.png").resize((T, T), Image.LANCZOS); x, y = 20 + c * (T + 20), 20 + r * (T + 50)
        G.paste(im, (x, y), m); d.text((x, y + T + 6), f"pfp_{en}_{cn}", fill=(220, 220, 220), font=fnt)
G.save("pfp_grid.png"); print("pfp_grid.png", G.size)
