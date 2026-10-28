"""Exact Ricks Clips hairstyles (one Flow image per hairstyle, made from a crop of the real character: sprites/gen/ricks2)
-> sprites/png/hair_rk_<name>.png + HAIR entries [sprite, width in head diameters, hairline fraction from top].
The hairline is measured in the middle columns (first background pixel below the cap); the width puts the outer edge
just past the head outline so the sideburns hug the head.
Uso: python slice_ricks2.py"""
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
from slice_sprites import key_green

ROOT = Path(__file__).resolve().parents[1] / "sprites"; G = ROOT / "gen" / "ricks2"
PICK = {  # name: (file stem fragment, width over the head)
    'kyle': ('21-56-44-copy-exactly-the-hairstyle-from-r_kyle-i-1', 1.06), 'bun': ('22-03-10-copy-exactly-the-hairstyle-from-r_bun-id-1', 1.07),
    'curly': ('22-04-25-copy-exactly-the-hairstyle-from-h2_curly-2', 1.2), 'genius': ('22-05-15-copy-exactly-the-hairstyle-from-h2_geniu-1', 1.06)   # sideburns cropped to 60 % afterwards (they ran past the jaw),
    'edison': ('22-06-01-copy-exactly-the-hairstyle-from-h2_ediso-1', 1.06), 'darkbowl': ('21-59-40-copy-exactly-the-hairstyle-from-r_darkbo-2', 1.06),
    'darkfringe': ('22-00-14-copy-exactly-the-hairstyle-from-r_darkfr-1', 1.06), 'brownshort': ('22-00-55-copy-exactly-the-hairstyle-from-r_browns-2', 1.06),
    'glasses': ('22-01-33-copy-exactly-the-hairstyle-from-r_glasse-2', 1.06), 'boss': ('22-02-11-copy-exactly-the-hairstyle-from-r_boss-i-1', 1.06)}
out = {}
for n, (stem, kw) in PICK.items():
    im = Image.open(G / f"2026-10-27T{stem}.jpg"); rgba, mask = key_green(im)
    lab, k = ndimage.label(ndimage.binary_dilation(mask, iterations=2)); sizes = ndimage.sum(mask, lab, range(1, k + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 0.02 * sizes.max()]) & mask
    a = np.array(rgba); a[..., 3] = np.where(keep, a[..., 3], 0)
    ys, xs = np.where(a[..., 3] > 40); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    al = a[..., 3] > 40; h, w = al.shape; mid = al[:, int(w * 0.45):int(w * 0.55)]
    hl = []
    for col in mid.T:   # first background pixel after the top cap, per middle column
        top = np.argmax(col); gap = np.argmax(~col[top:]); hl.append((top + gap) / h if gap else 1.0)
    hl = float(np.median(hl))
    Image.fromarray(a).save(ROOT / "png" / f"hair_rk_{n}.png"); out[f"rk_{n}"] = [f"hair_rk_{n}", kw, round(hl, 3)]
    print(n, w, h, out[f"rk_{n}"])
json.dump(out, open(ROOT / "_rk_hair.json", "w"), indent=0)
