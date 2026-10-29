"""v2 lashes (more feminine): starts from the ORIGINAL texture (assets/, read only) like lashes.py, and paints
thicker dark anime lashes: a 3-px upper lash line, a long pointed winged flick rising out of the outer corner,
a second shorter flick, and a defined lower lash line with two small lower lashes.
Left eye drawn, right eye mirrored at x = 63 - x. Writes v2/tex/ZeroVolnuttTexture.png (+ 10x before/after).
Never commit the outputs (derivative of the purchased model)."""
import os
from PIL import Image

SRC = r"F:\Claude Proyectos\assets\crashsune\MegamanLegendsModel\ZeroVolnuttTexture.png"
HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(HERE, "tex"), exist_ok=True)
im = Image.open(SRC).convert("RGBA"); px = im.load()
K, L = (30, 14, 22, 255), (78, 34, 34, 255)          # darker than v1 (38,20,26)
skin = px[2, 135]


def is_skin(c):
    return abs(c[0] - skin[0]) + abs(c[1] - skin[1]) + abs(c[2] - skin[2]) < 40


def aa(c, a):   # anti-alias over the side skin (the author's 43 % / 25 % levels)
    return tuple(round(skin[i] + (c[i] - skin[i]) * a) for i in range(3)) + (255,)


pts = []
for x in range(10, 24):                       # upper lid: 3 px thick, 4 px toward the outer corner
    top = next(y for y in range(126, 146) if not is_skin(px[x, y]))
    pts += [(x, top - 1, K), (x, top, K), (x, top + 1, K)]
    if x < 15:
        pts.append((x, top - 2, K))
    if x in (12, 16, 20):                        # little upper lashes poking up
        pts.append((x, top - 2, L if x > 12 else K))
pts += [(9, 133, K), (9, 132, K), (9, 131, K), (8, 131, K), (8, 130, K), (7, 130, K), (7, 129, K),   # winged flick: long,
        (6, 129, K), (6, 128, K), (5, 128, K), (5, 127, L), (4, 127, aa(K, .43)), (4, 126, aa(K, .25))]    # pointed, up and out
pts += [(8, 134, K), (7, 134, K), (7, 135, K), (6, 133, K), (6, 132, aa(K, .43))]                      # 2nd shorter flick
pts += [(x, 146, L) for x in range(11, 21)] + [(x, 147, aa(L, .43)) for x in (12, 13, 14)]   # defined lower lash line
pts += [(10, 145, K), (10, 144, K), (9, 143, K), (9, 144, aa(K, .43)), (8, 142, aa(K, .43))]          # small lower outer lashes
for x, y, c in pts:
    px[x, y] = c; px[63 - x, y] = c
im.save(os.path.join(HERE, "tex", "ZeroVolnuttTexture.png"))
v1 = Image.open(os.path.join(os.path.dirname(HERE), "tex", "ZeroVolnuttTexture.png")).convert("RGBA")
s = Image.new("RGBA", (640, 990), (0, 0, 0, 255))
for i, src in enumerate((Image.open(SRC).convert("RGBA"), v1, im)):
    s.paste(src.crop((0, 118, 64, 150)).resize((640, 320), Image.NEAREST), (0, i * 335))
s.save(os.path.join(HERE, "lashes_v2_compare.png"))
print("ok")
