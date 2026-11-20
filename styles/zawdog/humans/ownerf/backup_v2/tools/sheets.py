"""review sheets for ownerf: expressions.jpg (Flow portrait | in-game front | in-game 3/4, per expression) and
head_hands.jpg (head front / 3/4 / profile / back + hands open / point / fist).
    .venv/bin/python sheets.py expressions|headhands <work_dir> <out.jpg>"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

mode, W, out = sys.argv[1], sys.argv[2], sys.argv[3]
D = os.path.abspath(os.path.join(W, ".."))
FB = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
FS = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 17)
BG = (24, 24, 26)


def grid(rows, cw, ch, title, row_labels=None, col_labels=None):
    lw = 150 if row_labels else 0
    top = 60 + (30 if col_labels else 0)
    S = Image.new("RGB", (lw + cw * max(len(r) for r in rows) + 10, top + ch * len(rows) + 10), BG); d = ImageDraw.Draw(S)
    d.text((12, 14), title, fill=(255, 255, 255), font=FB)
    if col_labels:
        for j, c in enumerate(col_labels):
            d.text((lw + j * cw + 8, 62), c, fill=(255, 220, 90), font=FS)
    for i, r in enumerate(rows):
        if row_labels:
            d.text((12, top + i * ch + ch // 2 - 10), row_labels[i], fill=(255, 220, 90), font=FB)
        for j, p in enumerate(r):
            if p and os.path.exists(p):
                im = Image.open(p).convert("RGB"); im.thumbnail((cw - 6, ch - 6), Image.LANCZOS)
                S.paste(im, (lw + j * cw + (cw - im.size[0]) // 2, top + i * ch + (ch - im.size[1]) // 2))
    return S


if mode == "expressions":
    EX = ["neutral", "smile", "surprised", "crying", "laughing", "scared"]
    rows = [[os.path.join(D, "faces", e + ".jpg") for e in EX],
            [os.path.join(W, "rv", f"ex_{e}_0.png") for e in EX],
            [os.path.join(W, "rv", f"ex_{e}_30.png") for e in EX]]
    S = grid(rows, 300, 320, "ownerf - 6 face swaps (kit names: P.face('neutral'|'smile'|'surprised'|'crying'|'laughing'|'scared'))",
             row_labels=["Flow photo", "in game", "in game 3/4"], col_labels=EX)
elif mode == "headhands":
    rows = [[os.path.join(W, "cmp", f"head_{v}.png") for v in ("0", "40", "90", "180")],
            [os.path.join(W, "rv", f"hand_{h}_{v}.png") for h, v in (("open", "60"), ("point", "-30"), ("fist", "60"), ("point", "60"))]]
    S = grid(rows, 400, 400, "ownerf - head (front, 3/4, profile, back) and hands (open, index point, fist, point seen from the thumb side)",
             row_labels=["head", "hands"], col_labels=["front / open", "3/4 / point", "profile / fist", "back / point (other side)"])
S.save(out, quality=90)
print(out, S.size)
