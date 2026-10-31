"""Compose the self-check sheets from out/renders (venv python).
    .venv/bin/python pieces/lps-hombre/sheets.py [ref_walk.png ref_face.png]
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
REN = ROOT / "out" / "renders"
OUT = ROOT / "out"


def backdrop(size):
    w, h = size
    y = np.linspace(0, 1, h)[:, None, None]
    top, bot = np.array([150, 152, 158.0]), np.array([108, 108, 112.0])
    g = top * (1 - y) + bot * y
    return Image.fromarray(np.broadcast_to(g, (h, w, 3)).astype(np.uint8))


def flat(path):
    im = Image.open(path).convert("RGBA")
    bg = backdrop(im.size).convert("RGBA")
    bg.alpha_composite(im)
    return bg.convert("RGB")


def row(names, scale=0.5, labels=None):
    ims = [flat(REN / f"{n}.png") for n in names]
    ims = [im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS) for im in ims]
    w, h = ims[0].size
    sheet = Image.new("RGB", (w * len(ims), h))
    d = ImageDraw.Draw(sheet)
    for i, im in enumerate(ims):
        sheet.paste(im, (i * w, 0))
        d.text((i * w + 12, 12), (labels or names)[i], fill=(255, 235, 48))
    return sheet


row(["turn_front", "turn_34", "turn_side", "turn_back"], labels=["front", "3/4", "side", "back"]).save(OUT / "turnaround.png")
row(["pose_rest", "pose_pointing", "pose_walk"], labels=["rest", "pointing", "walk"]).save(OUT / "poses.png")
row(["hand_point", "hand_rest"], labels=["hand pointing", "hand rest"]).save(OUT / "hands.png")
row(["head_front", "head_34", "head_side", "head_back"], labels=["head front", "3/4", "side", "back"]).save(OUT / "head_views.png")

if len(sys.argv) > 2:
    refs = [Image.open(p).convert("RGB").resize((540, 960), Image.LANCZOS) for p in sys.argv[1:3]]
    ours = [flat(REN / "cmp_walk.png").resize((540, 960), Image.LANCZOS), flat(REN / "cmp_face.png").resize((540, 960), Image.LANCZOS)]
    sheet = Image.new("RGB", (1080, 1920))
    d = ImageDraw.Draw(sheet)
    for i, (r, o) in enumerate(zip(refs, ours)):
        sheet.paste(r, (0, i * 960)); sheet.paste(o, (540, i * 960))
        d.text((12, i * 960 + 12), "REF LowPolyShorts", fill=(255, 235, 48))
        d.text((552, i * 960 + 12), "ours", fill=(255, 235, 48))
    sheet.save(OUT / "compare.png")
print("ok")
