"""Corta las hojas de Flow (sobre verde croma) en capas PNG transparentes para los personajes cartoon3d.

sprites/sheets.json: [{ "file", "cols", "rows", "names": [...], "mode": "cell" | "trim", "prefix" }]
  cell: lienzo fijo de 320x320 centrado en el centro de la celda (caras: los rasgos no saltan al cambiar)
  trim: recortado al contenido + 2 % de margen (cabeza, pelo, cuerpos); faces.json guarda tamaño y bbox
Salida: sprites/png/<prefix><name>.png y sprites/sprites.json
Uso: python slice_sprites.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1] / "sprites"
OUT, CELL = 320, 300


def key_green(im):
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    spill = g - np.maximum(r, b)
    alpha = np.clip(1 - (spill - 25) / 70, 0, 1)
    g = np.where(spill > 0, np.maximum(r, b), g)   # despill: green never above max(r, b)
    return np.dstack([r, g, b, alpha * 255]).astype(np.uint8), alpha > 0.5


def main():
    spec = json.loads((ROOT / "sheets.json").read_text(encoding="utf-8"))
    (ROOT / "png").mkdir(exist_ok=True)
    meta_p = ROOT / "sprites.json"
    meta = json.loads(meta_p.read_text(encoding="utf-8")) if meta_p.exists() else {}
    for sh in spec:
        im = Image.open(ROOT / "gen" / sh["file"])
        rgba, mask = key_green(im)
        cols, rows, mode = sh["cols"], sh["rows"], sh.get("mode", "cell")
        cw, ch = im.width / cols, im.height / rows
        s = CELL / cw * sh.get("scale", 1)
        lab, _ = ndimage.label(ndimage.binary_dilation(mask, iterations=sh.get("dil", max(2, int(12 / s)))))
        boxes = [o for o in ndimage.find_objects(lab) if o and (o[0].stop - o[0].start) * (o[1].stop - o[1].start) > 300]
        cy = [(b[0].start + b[0].stop) / 2 for b in boxes]; cx = [(b[1].start + b[1].stop) / 2 for b in boxes]
        ri = [min(rows - 1, int(y / ch)) for y in cy]; ci = [min(cols - 1, int(x / cw)) for x in cx]
        rowc = [np.median([cy[k] for k in range(len(boxes)) if ri[k] == r] or [(r + 0.5) * ch]) for r in range(rows)]
        colc = [np.median([cx[k] for k in range(len(boxes)) if ci[k] == c] or [(c + 0.5) * cw]) for c in range(cols)]
        for idx, name in enumerate(sh["names"]):
            if not name:
                continue
            r, c = divmod(idx, cols)
            parts = [k for k in range(len(boxes)) if ri[k] == r and ci[k] == c]
            if not parts:
                print("falta", name); continue
            y0 = min(boxes[k][0].start for k in parts); y1 = max(boxes[k][0].stop for k in parts)
            x0 = min(boxes[k][1].start for k in parts); x1 = max(boxes[k][1].stop for k in parts)
            full = sh.get("prefix", "") + name
            if mode == "cell":
                crop = Image.fromarray(rgba[y0:y1, x0:x1], "RGBA")
                crop = crop.resize((max(1, round(crop.width * s)), max(1, round(crop.height * s))), Image.LANCZOS)
                canvas = Image.new("RGBA", (OUT, OUT), (0, 0, 0, 0))
                canvas.alpha_composite(crop, ((OUT - crop.width) // 2, (OUT - crop.height) // 2))   # features centred: no jump on a swap
                canvas.save(ROOT / "png" / f"{full}.png")
                meta[full] = {"mode": "cell"}
            else:
                m = int(0.02 * max(x1 - x0, y1 - y0))
                y0, x0 = max(0, y0 - m), max(0, x0 - m); y1, x1 = min(im.height, y1 + m), min(im.width, x1 + m)
                Image.fromarray(rgba[y0:y1, x0:x1], "RGBA").save(ROOT / "png" / f"{full}.png")
                meta[full] = {"mode": "trim", "w": x1 - x0, "h": y1 - y0}
    meta_p.write_text(json.dumps(meta, indent=1), encoding="utf-8")
    print(len(meta), "capas")


if __name__ == "__main__":
    main()
