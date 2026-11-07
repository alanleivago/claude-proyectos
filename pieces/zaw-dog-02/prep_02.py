"""venv: zaw-dog #2 textures from this piece's Flow images (ref/flow/gen, one image per call).
- *3x3-grid-product* -> RGBA cut-outs tex/<name>.png (ball2, cup_red, cup_blue, biscuit, box_clear, clipboard2, bowl_steel, mug_red, succulent)
  + photoprop profiles (tex/src) for the lofted round ones (ball2, cup_red, cup_blue, bowl_steel, mug_red, succulent)
- *2x2-grid-of-four-separate-funny* -> pic_lab1..4 (complete pictures, funny dogs)
- lab_sign2: "DOG COGNITION LAB" (the kitchen dressed as a lab)
python prep_02.py"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd

H = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(H, "tex"); G = os.path.join(H, "ref", "flow", "gen")
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
import photoprop as PP  # noqa: E402
gen = sorted(os.listdir(G)); pick = lambda key: os.path.join(G, next(f for f in gen if key in f))


def ps1(im, size, colors=48):
    return im.convert("RGB").resize(size, Image.BOX).quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


def bgmask(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; mx = np.maximum(np.maximum(r, g), b) + 1
    return ((r > 150) & (b > 150) & (g < 130) & (np.abs(r - b) < 90)) | (((r - g) / mx > 0.42) & ((b - g) / mx > 0.30))


def cutout(cell, name, tex_h=128):
    a = np.asarray(cell.convert("RGB")).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = nd.binary_opening(~bgmask(a), iterations=2)
    lab, n = nd.label(m); sizes = nd.sum(m, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 0.05 * sizes.max()])
    keep = nd.binary_erosion(nd.binary_fill_holes(keep), iterations=2)
    ex = np.clip(np.minimum(r, b) - g, 0, None); a[..., 0] -= ex; a[..., 2] -= ex
    ys, xs = np.nonzero(keep); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgb = np.clip(a[y0:y1, x0:x1], 0, 255).astype(np.uint8); al = keep[y0:y1, x0:x1]
    _, (iy, ix) = nd.distance_transform_edt(~al, return_indices=True); rgb = rgb[iy, ix]
    tw = max(16, round(tex_h * rgb.shape[1] / rgb.shape[0] / 4) * 4)
    c = ps1(Image.fromarray(rgb), (tw, tex_h))
    c.putalpha(Image.fromarray((al * 255).astype(np.uint8)).resize((tw, tex_h), Image.BOX).point(lambda v: 255 if v > 127 else 0))
    c.save(os.path.join(T, f"{name}.png"))
    src = np.clip(a, 0, 255).astype(np.uint8).copy(); src[~keep] = (255, 0, 255)          # clean magenta for photoprop
    return Image.fromarray(src)


ROUND = {"ball2", "cup_red", "cup_blue", "bowl_steel", "mug_red", "succulent"}
im = Image.open(pick("3x3-grid-product")).convert("RGB"); w, h = im.size
for i, n in enumerate(["ball2", "cup_red", "cup_blue", "biscuit", "box_clear", "clipboard2", "bowl_steel", "mug_red", "succulent"]):
    cx, cy = i % 3, i // 3
    cell = im.crop((cx * w // 3 + 6, cy * h // 3 + 6, (cx + 1) * w // 3 - 6, (cy + 1) * h // 3 - 6))
    src = cutout(cell, n)
    if n in ROUND:
        p = os.path.join(T, "src", f"{n}.png"); src.save(p); PP.prepare(p, tex_h=64, colors=32)
q = Image.open(pick("2x2-grid-of-four-separate-funny")).convert("RGB"); w, h = q.size
for k in range(4):
    cx, cy = k % 2, k // 2
    ps1(q.crop((cx * w // 2 + 4, cy * h // 2 + 4, (cx + 1) * w // 2 - 4, (cy + 1) * h // 2 - 4)), (112, 112)).save(os.path.join(T, f"pic_lab{k + 1}.png"))
sg = Image.new("RGB", (512, 128), (234, 238, 244)); d = ImageDraw.Draw(sg); d.rectangle((0, 0, 511, 127), outline=(32, 58, 110), width=10)
for size in range(80, 20, -2):
    f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", size)
    if d.textlength("DOG COGNITION LAB", font=f) < 512 - 2 * 44:
        break
d.text((256, 66), "DOG COGNITION LAB", font=f, fill=(32, 58, 110), anchor="mm"); sg.resize((256, 64), Image.BOX).save(os.path.join(T, "lab_sign2.png"))
print("prep_02 done")
# face portraits (the four secondary people) from their own head atlases: the front tile, for the floating portraits
import json as _j
for n in ("researcher", "pointer", "stranger_a", "stranger_b"):
    J = _j.load(open(os.path.join(T, "people2", f"{n}.json"))); r = J["head"]["front"]
    hd = Image.open(os.path.join(T, "people2", f"{n}_head.png")).convert("RGB"); w, h = hd.size
    hd.crop((int(r["u0"] * w), 0, int(r["u1"] * w), h)).resize((96, 128), Image.BOX).save(os.path.join(T, f"face_{n}.png"))
print("faces done")
