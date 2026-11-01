"""swedish-number bodies (Flow sheets 2026-10-30, sprites/gen/ricks) -> sprites/png/body_<name>.png.
Background = green connected to the border only (a green garment never gets keyed). Uso: python slice_bodies3.py"""
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from slice_sprites import key_green
ROOT = Path(__file__).resolve().parents[1] / "sprites"; G = ROOT / "gen" / "ricks"
A, B = "2026-10-30T22-40-02-use-body_sheet_ref-as-the-exact-format-a-1.jpg", "2026-10-30T22-40-02-use-body_sheet_ref-as-the-exact-format-a-2.jpg"
PICK = [(A, 0, 0, "pajamas"), (A, 0, 1, "apron"), (A, 0, 2, "turtleneck"), (B, 1, 0, "parka"), (B, 1, 1, "sweatshirt"), (B, 1, 2, "vest")]
meta_p = ROOT / "sprites.json"; meta = json.loads(meta_p.read_text(encoding="utf-8"))
for f, r, c, name in PICK:
    im = Image.open(G / f); rgba, mask = key_green(im)
    lab, n = ndimage.label(~mask); edge = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    bg = np.isin(lab, list(edge)); fg = ~bg
    a = np.array(rgba); a[..., 3] = np.where(fg, np.maximum(a[..., 3], 255 * fg), 0); a[..., 3] = np.where(bg, rgba[..., 3] * 0, a[..., 3])
    # soft edge: keep key alpha on the outer 2 px
    ring = fg & ~ndimage.binary_erosion(fg, iterations=2); a[..., 3] = np.where(ring, rgba[..., 3], a[..., 3])
    cw, ch = im.width / 3, im.height / 2
    cell = np.zeros(fg.shape, bool); cell[int(r * ch):int((r + 1) * ch), int(c * cw):int((c + 1) * cw)] = True
    l2, _ = ndimage.label(ndimage.binary_opening(fg, iterations=3)); ids, cnt = np.unique(l2[cell & (l2 > 0)], return_counts=True)
    k = ids[np.argmax(cnt)]; comp = ndimage.binary_dilation(l2 == k, iterations=4) & fg & cell
    ys, xs = np.where(comp); m = 6
    out = a[max(0, ys.min() - m):ys.max() + m, max(0, xs.min() - m):xs.max() + m].copy()
    cm = comp[max(0, ys.min() - m):ys.max() + m, max(0, xs.min() - m):xs.max() + m]; out[..., 3] = np.where(cm, out[..., 3], 0)
    Image.fromarray(out, "RGBA").save(ROOT / "png" / f"body_{name}.png"); meta["body_" + name] = {"mode": "trim", "w": out.shape[1], "h": out.shape[0]}
    print(name, out.shape)
meta_p.write_text(json.dumps(meta, indent=1), encoding="utf-8")
