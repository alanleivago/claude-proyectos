"""Corta las hojas de expresiones de Flow (rasgos marrones sobre verde croma) en capas PNG transparentes.

Cada cara queda en un lienzo fijo de 320x320 centrado en el centro de su celda (fila/columna medidos sobre las
propias caras), así los ojos no saltan de lugar al cambiar de expresión. Las hojas 4x4 se escalan para que su
celda mida lo mismo que la de las hojas 4x3.

Uso: python slice_faces.py   (lee faces/sheets.json, escribe faces/png/<nombre>.png y faces/faces.json)
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1] / "faces"
OUT = 320          # lado del lienzo de cada cara
CELL = 300         # celda de referencia (hojas 1200 px / 4 columnas)


def key_green(im):
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    spill = g - np.maximum(r, b)
    alpha = np.clip(1 - (spill - 25) / 70, 0, 1)
    g2 = np.where(spill > 0, np.maximum(r, b) + np.clip(spill, 0, 0) , g)   # despill: green never above max(r, b)
    rgba = np.dstack([r, np.minimum(g, g2), b, alpha * 255]).astype(np.uint8)
    return rgba, alpha > 0.5


def main():
    spec = json.loads((ROOT / "sheets.json").read_text(encoding="utf-8"))
    (ROOT / "png").mkdir(exist_ok=True)
    meta = {}
    for sh in spec:
        im = Image.open(ROOT / "gen" / sh["file"])
        rgba, mask = key_green(im)
        cols, rows = sh["cols"], sh["rows"]
        s = CELL / (im.width / cols)
        lab, n = ndimage.label(ndimage.binary_dilation(mask, iterations=int(18 / s)))
        objs = ndimage.find_objects(lab)
        boxes = [o for o in objs if o and (o[0].stop - o[0].start) * (o[1].stop - o[1].start) > 400]
        cy = [(b[0].start + b[0].stop) / 2 for b in boxes]; cx = [(b[1].start + b[1].stop) / 2 for b in boxes]
        # row / column centres measured on the faces themselves
        ri = [min(rows - 1, int(y / im.height * rows)) for y in cy]; ci = [min(cols - 1, int(x / im.width * cols)) for x in cx]
        rowc = [np.median([cy[k] for k in range(len(boxes)) if ri[k] == r] or [(r + 0.5) * im.height / rows]) for r in range(rows)]
        colc = [np.median([cx[k] for k in range(len(boxes)) if ci[k] == c] or [(c + 0.5) * im.width / cols]) for c in range(cols)]
        for idx, name in enumerate(sh["names"]):
            if not name:
                continue
            r, c = divmod(idx, cols)
            parts = [k for k in range(len(boxes)) if ri[k] == r and ci[k] == c]
            if not parts:
                print("falta", name); continue
            y0 = min(boxes[k][0].start for k in parts); y1 = max(boxes[k][0].stop for k in parts)
            x0 = min(boxes[k][1].start for k in parts); x1 = max(boxes[k][1].stop for k in parts)
            crop = Image.fromarray(rgba[y0:y1, x0:x1], "RGBA")
            crop = crop.resize((max(1, round(crop.width * s)), max(1, round(crop.height * s))), Image.LANCZOS)
            canvas = Image.new("RGBA", (OUT, OUT), (0, 0, 0, 0))
            px = OUT / 2 + (x0 - colc[c]) * s; py = OUT / 2 + (y0 - rowc[r]) * s
            canvas.alpha_composite(crop, (int(round(px)), int(round(py))))
            canvas.save(ROOT / "png" / f"{name}.png")
            meta[name] = {"sheet": sh["file"], "box": [int(px), int(py), crop.width, crop.height]}
    (ROOT / "faces.json").write_text(json.dumps(meta, indent=1), encoding="utf-8")
    print(len(meta), "caras/extras")


if __name__ == "__main__":
    main()
