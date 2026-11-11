"""venv: zaw-dog #3 textures from this piece's Flow images (ref/flow/gen, one image per call).
- *3x3-grid-product*  -> RGBA cut-outs tex/<name>.png: armchair_front, armchair_side, tissue_box, bed_front, bed_side,
                         headboard, bedside, magnet, slippers (VLVT: the photos the furniture boxes are projected from)
- *clear-acrylic*     -> tex/acrylic.png (reflections + edges on black: the door's additive glass layer)
- *grid-of-18*        -> tex/port_00..17.png (line 3's portrait cards)
- *2x2-grid...funny*  -> tex/pic_bed1..4.png (funny dog pictures, bedroom + living room night)
- *night-sky*         -> tex/sky_night.png
- tag_doggo.png: the channel's wall tag "DOGGO POLY SHORTS"
python prep_03.py"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd

H = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(H, "tex"); G = os.path.join(H, "ref", "flow", "gen")
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
    c.save(os.path.join(T, f"{name}.png")); print(name, c.size)


im = Image.open(pick("3x3-grid-product")).convert("RGB"); w, h = im.size
for i, n in enumerate(["armchair_front", "armchair_side", "tissue_box", "bed_front", "bed_side", "headboard", "bedside", "magnet", "slippers"]):
    cx, cy = i % 3, i // 3
    cutout(im.crop((cx * w // 3 + 12, cy * h // 3 + 12, (cx + 1) * w // 3 - 12, (cy + 1) * h // 3 - 12)), n, 160 if "bed" in n or "arm" in n else 96)
ac = Image.open(pick("clear-acrylic")).convert("L"); ac.resize((128, 256), Image.BOX).save(os.path.join(T, "acrylic.png"))
q = Image.open(pick("grid-of-18")).convert("RGB"); w, h = q.size
for k in range(18):
    cx, cy = k % 6, k // 6
    ps1(q.crop((cx * w // 6 + 5, cy * h // 3 + 5, (cx + 1) * w // 6 - 5, (cy + 1) * h // 3 - 5)), (96, 96)).save(os.path.join(T, f"port_{k:02d}.png"))
q = Image.open(pick("2x2-grid-of-four-separate-funny")).convert("RGB"); w, h = q.size
for k in range(4):
    cx, cy = k % 2, k // 2
    ps1(q.crop((cx * w // 2 + 6, cy * h // 2 + 6, (cx + 1) * w // 2 - 6, (cy + 1) * h // 2 - 6)), (112, 112)).save(os.path.join(T, f"pic_bed{k + 1}.png"))
ps1(Image.open(pick("evening-nigh")), (256, 144), 64).save(os.path.join(T, "sky_night.png"))
sg = Image.new("RGB", (512, 160), (32, 40, 64)); d = ImageDraw.Draw(sg); d.rectangle((0, 0, 511, 159), outline=(250, 214, 60), width=10)
for size in range(64, 20, -2):                                                       # fit the whole name inside the border
    f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", size)
    if d.textlength("DOGGO POLY SHORTS", font=f) < 512 - 2 * 30:
        break
d.text((256, 80), "DOGGO POLY SHORTS", font=f, fill=(250, 214, 60), anchor="mm")
sg.resize((256, 80), Image.BOX).save(os.path.join(T, "tag_doggo.png"))
print("prep_03 done")
