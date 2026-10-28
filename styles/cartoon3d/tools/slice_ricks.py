"""Corta las hojas de Flow "estilo Ricks Clips" (sprites/gen/ricks) en capas PNG del kit cartoon3d.

Cuerpos: igual que slice_sprites.py (trim). Pelos/gorros: Flow dibuja la curva de la cabeza invisible (un arco fino);
se usa para MEDIR dónde va la pieza (ancho de la cabeza = ancho del arco, coronilla = punto alto del arco) y luego se borra.
Imprime las entradas para la tabla HAIR del kit: [sprite, ancho (D), línea de pelo (fracción desde arriba), x (D)].
Uso: python slice_ricks.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

from slice_sprites import key_green

ROOT = Path(__file__).resolve().parents[1] / "sprites"
G = "ricks/2026-10-27T"
SHEETS = [
    (G + "20-42-10-use-body_fmt-as-the-exact-format-and-dra-1.jpg", 3, 2, "body_", ["police", "guard", "king", "emperor", "smith", "labcoat"]),
    (G + "20-42-35-use-body_fmt-as-the-exact-format-and-dra-1.jpg", 3, 2, "body_", ["polo", "tie", "suit", "raincoat", "hivis", "overalls"]),
    (G + "20-43-00-use-body_fmt-as-the-exact-format-and-dra-1.jpg", 3, 2, "body_", ["blazer", "cardigan", "blouse", "dress", "grandma", "polka"]),
    (G + "20-43-20-use-body_fmt-as-the-exact-format-and-dra-1.jpg", 3, 2, "body_", ["sweater", "hoodie", "bomber", "leather", "burglar", "denim"]),
    (G + "20-44-44-use-hair_fmt-as-the-exact-format-and-dra-2.jpg", 2, 3, "hair_", ["policecap", "beanie", "buckethat", "redcap", "crown", "scholar"]),
    (G + "20-45-25-use-hair_fmt-as-the-exact-format-and-dra-1.jpg", 2, 3, "hair_", ["nightcap", "knitcap", "beret", "hardhat", "cowboy", "tophat"]),
    (G + "20-46-04-use-hair_fmt-as-the-exact-format-and-dra-2.jpg", 2, 3, "hair_", ["bun", "ponytail", "bowl", "buzz", "baldsides", "curlygrey"]),
    (G + "20-46-31-use-hair_fmt-as-the-exact-format-and-dra-2.jpg", 2, 3, "hair_", ["ginger", "sidepart", "tuft", "pigtails", "afro", "slick"]),
]


def main():
    meta_p = ROOT / "sprites.json"; meta = json.loads(meta_p.read_text(encoding="utf-8"))
    hair = {}
    for f, cols, rows, prefix, names in SHEETS:
        im = Image.open(ROOT / "gen" / f); rgba, mask = key_green(im)
        cw, ch = im.width / cols, im.height / rows
        lab, n = ndimage.label(ndimage.binary_dilation(mask, iterations=3))
        objs = [(k + 1, o) for k, o in enumerate(ndimage.find_objects(lab)) if (o[0].stop - o[0].start) * (o[1].stop - o[1].start) > 3000]
        for i, name in enumerate(names):
            r, c = divmod(i, cols)
            mine = [(k, o) for k, o in objs if int(((o[0].start + o[0].stop) / 2) // ch) == r and int(((o[1].start + o[1].stop) / 2) // cw) == c]
            if not mine: print("falta", name); continue
            k, o = max(mine, key=lambda ko: (ko[1][0].stop - ko[1][0].start) * (ko[1][1].stop - ko[1][1].start))
            y0, y1, x0, x1 = o[0].start, o[0].stop, o[1].start, o[1].stop
            cell, cm = rgba[y0:y1, x0:x1].copy(), mask[y0:y1, x0:x1] & (lab[y0:y1, x0:x1] == k)
            if prefix == "hair_":   # drop the thin outline of the invisible head Flow draws under each piece
                cm = ndimage.binary_dilation(ndimage.binary_opening(cm, iterations=4), iterations=5) & cm
                lab2, n2 = ndimage.label(cm)
                if name == "baldsides":   # two side tufts joined by the head outline: keep the tufts only
                    t = ndimage.binary_opening(cm, iterations=7); l3, n3 = ndimage.label(t); sz = ndimage.sum(t, l3, range(1, n3 + 1))
                    keep = np.argsort(sz)[-2:] + 1; cm = ndimage.binary_dilation(np.isin(l3, keep), iterations=8) & cm
                elif n2 > 1: cm = lab2 == (np.argmax(ndimage.sum(cm, lab2, range(1, n2 + 1))) + 1)
            cell[..., 3] = np.where(cm, cell[..., 3], 0)
            ys, xs = np.where(cm); m = 6
            a0, a1, b0, b1 = max(0, ys.min() - m), ys.max() + m, max(0, xs.min() - m), xs.max() + m
            out = cell[a0:a1, b0:b1]; Image.fromarray(out, "RGBA").save(ROOT / "png" / f"{prefix}{name}.png")
            meta[prefix + name] = {"mode": "trim", "w": int(b1 - b0), "h": int(a1 - a0)}
            if prefix == "hair_":   # hairline = where the centre column's top run ends; width so the band there spans ~1.04 D
                al = out[..., 3] > 128; H, Wd = al.shape; mid = al[:, Wd // 2 - 3:Wd // 2 + 3].all(1)
                f0 = int(np.argmax(mid)); rest = ~mid[f0:]; yh = f0 + int(np.argmax(rest)) if rest.any() else H
                row = al[max(0, yh - int(0.03 * H))]; span = row.nonzero()[0]; span = span.max() - span.min() if len(span) else Wd
                hair[name] = [f"hair_{name}", round(1.04 * Wd / span, 3), round(yh / H, 3), 0]
    hair.pop("knitcap", None)   # drawn from below (dark inside covers the forehead): not usable
    hair["ponytail"][1:3] = [1.22, 0.52]; hair["baldsides"][1:3] = [1.15, 0.4]   # measured by eye (preview_hair.py)
    meta_p.write_text(json.dumps(meta, indent=1), encoding="utf-8")
    print(json.dumps(hair))


if __name__ == "__main__":
    main()
