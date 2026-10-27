"""Paints feminine anime lashes on the 192px texture's eyes (left eye drawn, right eye mirrored at x=63-x).
Writes tex/ZeroVolnuttTexture.png and a 10x preview of the eye strip."""
import os
from PIL import Image

SRC = r"F:\Claude Proyectos\assets\crashsune\MegamanLegendsModel\ZeroVolnuttTexture.png"
HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(HERE, "tex"), exist_ok=True)
im = Image.open(SRC).convert("RGBA")
px = im.load()
LASH, LASH2 = (38, 20, 26, 255), (92, 44, 40, 255)
skin = px[2, 135]


def is_skin(c):
    return abs(c[0] - skin[0]) + abs(c[1] - skin[1]) + abs(c[2] - skin[2]) < 40


pts = []                                    # (x, y, colour) for the left eye
for x in range(10, 23):                     # upper lid: thicken the top edge of the eye into a lash line
    top = next(y for y in range(126, 146) if not is_skin(px[x, y]))
    pts += [(x, top, LASH), (x, top + 1, LASH)]          # lid line sits on the eye outline, not above it
    if x < 16:                                           # thicker toward the outer corner
        pts.append((x, top - 1, LASH))
pts += [(9, 132, LASH), (9, 131, LASH), (8, 131, LASH), (8, 130, LASH), (7, 130, LASH),   # solid wing at the outer corner
        (7, 129, LASH), (6, 129, LASH2), (6, 128, LASH2),
        (10, 140, LASH2), (10, 141, LASH2), (11, 143, LASH), (12, 144, LASH)]           # lower outer lashes
for x, y, c in pts:
    px[x, y] = c
    px[63 - x, y] = c
stage1 = im.copy()
# second, shorter flick under the outer wing (parallel to it, rooted on the eye outline; x=6 is the
# last texel column the eye polygon shows at these rows); tip at 43% over the side skin like the author's AA
tip = tuple(round(skin[i] + (LASH2[i] - skin[i]) * .43) for i in range(3)) + (255,)
for x, y, c in ((7, 135, LASH), (7, 134, LASH), (6, 133, LASH), (6, 132, tip)):
    px[x, y] = c
    px[63 - x, y] = c

im.save(os.path.join(HERE, "tex", "ZeroVolnuttTexture.png"))
s2 = Image.new("RGBA", (640, 650), (0, 0, 0, 255))                       # before/after of the 2nd flick, 10x
s2.paste(stage1.crop((0, 118, 64, 150)).resize((640, 320), Image.NEAREST), (0, 0))
s2.paste(im.crop((0, 118, 64, 150)).resize((640, 320), Image.NEAREST), (0, 330))
s2.save(os.path.join(HERE, "face", "lash2_compare.png"))
a = Image.open(SRC).convert("RGBA").crop((0, 118, 64, 150)).resize((640, 320), Image.NEAREST)
b = im.crop((0, 118, 64, 150)).resize((640, 320), Image.NEAREST)
s = Image.new("RGBA", (640, 650), (0, 0, 0, 255)); s.paste(a, (0, 0)); s.paste(b, (0, 330))
s.save(os.path.join(HERE, "eyes_compare.png"))
print("ok")
