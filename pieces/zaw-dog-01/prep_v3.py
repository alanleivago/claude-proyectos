"""venv: revision-3 set textures from Flow photos (VLVT method: real photos instead of flat colours / code textures).
- ref/flow/gen/*2x2-grid-of-four-flat* -> tex/wall_kitchen, wall_lab, roof, siding (128 px tiles, 48 colours)
- ref/flow/gen/*3x3-grid-product* (2 sheets) -> RGBA cut-outs tex/<name>.png (cards / projected boxes) and the magenta
  cells in tex/src/<name>.png; the round ones (mug, vase, jar, ball) also get photoprop profiles for lofting.
python prep_v3.py"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

H = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(H, "tex"); G = os.path.join(H, "ref", "flow", "gen")
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
import photoprop as PP  # noqa: E402

gen = sorted(os.listdir(G))
pick = lambda key, k=0: os.path.join(G, [f for f in gen if key in f][k])


def ps1(im, size, colors=48):
    return im.convert("RGB").resize(size, Image.BOX).quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


q = Image.open(pick("2x2-grid-of-four-flat")).convert("RGB"); w, h = q.size
for k, n in enumerate(("wall_kitchen", "wall_lab", "roof", "siding")):
    cx, cy = k % 2, k // 2
    ps1(q.crop((cx * w // 2 + 8, cy * h // 2 + 8, (cx + 1) * w // 2 - 8, (cy + 1) * h // 2 - 8)), (128, 128)).save(os.path.join(T, f"{n}.png"))


def cutout(cell, name, tex_h=128):
    a = np.asarray(cell.convert("RGB")).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = ~((r > 150) & (b > 150) & (g < 130) & (np.abs(r - b) < 90))
    m = nd.binary_opening(m, iterations=2)
    lab, n = nd.label(m); sizes = nd.sum(m, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 0.05 * sizes.max()])
    keep = nd.binary_erosion(keep, iterations=2)
    ex = np.clip(np.minimum(r, b) - g, 0, None); a[..., 0] -= ex; a[..., 2] -= ex                 # magenta despill
    ys, xs = np.nonzero(keep); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgb = np.clip(a[y0:y1, x0:x1], 0, 255).astype(np.uint8); al = keep[y0:y1, x0:x1]
    _, (iy, ix) = nd.distance_transform_edt(~al, return_indices=True); rgb = rgb[iy, ix]
    tw = max(16, round(tex_h * rgb.shape[1] / rgb.shape[0] / 4) * 4)
    if tw > 256:
        tw, tex_h = 256, max(16, round(256 * rgb.shape[0] / rgb.shape[1] / 4) * 4)
    c = ps1(Image.fromarray(rgb), (tw, tex_h))
    c.putalpha(Image.fromarray((al * 255).astype(np.uint8)).resize((tw, tex_h), Image.BOX).point(lambda v: 255 if v > 127 else 0))
    c.save(os.path.join(T, f"{name}.png"))


ROUND = {"mug", "vase", "jar", "ball"}
for key, k, names in (("3x3-grid-product", 0, ["pillow_y", "pillow_g", "throw", "mug", "vase", "dogbed", "radiator", "crate", "basket"]),
                      ("3x3-grid-product", 1, ["books", "mags", "sneakers_grey", "boots", "ball", "ropebone", "flasks", "jar", "clipboard"])):
    im = Image.open(pick(key, k)).convert("RGB"); w, h = im.size
    for i, n in enumerate(names):
        cx, cy = i % 3, i // 3
        cell = im.crop((cx * w // 3 + 6, cy * h // 3 + 6, (cx + 1) * w // 3 - 6, (cy + 1) * h // 3 - 6))
        cutout(cell, n)
        if n in ROUND:
            ca = np.asarray(cell).astype(int); fg = ~((ca[..., 0] > 150) & (ca[..., 2] > 150) & (ca[..., 1] < 130))
            ex = np.clip(np.minimum(ca[..., 0], ca[..., 2]) - ca[..., 1], 0, None) * fg      # despill the object only
            ca[..., 0] -= ex; ca[..., 2] -= ex
            p = os.path.join(T, "src", f"{n}.png"); Image.fromarray(np.clip(ca, 0, 255).astype(np.uint8)).save(p)
            PP.prepare(p, tex_h=64, colors=32)
            tp = os.path.join(T, "src", f"{n}_tex.png"); ta = np.asarray(Image.open(tp).convert("RGB")).astype(int)
            mg = (ta[..., 0] > 140) & (ta[..., 2] > 140) & (ta[..., 1] < 140)            # keyed holes (mug handle) -> fill
            if mg.any():
                _, (iy, ix) = nd.distance_transform_edt(mg, return_indices=True); ta = ta[iy, ix]
            Image.fromarray(ta.astype(np.uint8)).save(tp)
for n in ("sofa_front", "side_table"):                                          # old cut-outs: magenta despill (pink tint)
    a = np.asarray(Image.open(os.path.join(T, f"{n}.png")).convert("RGBA")).astype(int)
    ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1], 0, None); a[..., 0] -= ex; a[..., 2] -= ex
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA").save(os.path.join(T, f"{n}.png"))
print("prep_v3 done")
