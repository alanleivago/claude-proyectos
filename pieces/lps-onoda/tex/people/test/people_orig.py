"""venv: the supporting cast as distinct people (user, 2026-10-30: never Kaneda recolours).
Each person = a Flow passport photo (tex/flow/face_<name>.jpg, eyes from eyes.json) pasted on hombre's head and painted
round the head in 3D by paint_heads.py's machinery, plus their own body texture (zones of hombre's body atlas).
Writes tex/people/<name>_head_128.png and <name>_body_256.png."""
import json, os
import numpy as np
from PIL import Image

H = os.path.dirname(os.path.abspath(__file__)); HB = os.path.join(H, "../../lps-hombre/out")
src = open(os.path.join(H, "paint_heads.py")).read()
exec(src[:src.index("prof = np.asarray")])                          # ISL, P, COV, W, paint(), fill_map(), row_colour() ...
OUT = os.path.join(H, "people"); os.makedirs(OUT, exist_ok=True)
EYES = json.load(open(os.path.join(H, "flow", "eyes.json")))
prof = np.asarray(Image.open(os.path.join(HB, "head_1k.png")).convert("RGB")).astype(np.float32)
mx, mn = prof.max(-1), prof.min(-1); hair = np.clip((0.30 - mx.astype(float) * 0 - (mx - mn) / np.maximum(mx, 1)) / 0.08, 0, 1)[..., None]
yy, xx = np.mgrid[0:1024, 0:1024]
face = ISL["front"] & COV
body0 = np.asarray(Image.open(os.path.join(HB, "body_256.png")).convert("RGB")).astype(np.float32)
Z = {"jacket": [0, 0, 128, 128], "torso_front": [128, 0, 128, 128], "trousers": [0, 128, 128, 128], "shoes": [128, 128, 64, 64],
     "shirt": [128, 192, 64, 64], "inner": [192, 192, 64, 64]}
OL, OL2, OL3 = (92, 96, 50), (110, 104, 62), (78, 84, 44)
CAST = {   # name: hair colour, body zone colours
    "akatsu": ((22, 16, 13), {"jacket": OL, "torso_front": OL, "inner": OL, "trousers": OL, "shirt": OL, "shoes": (40, 34, 26)}),
    "shimada": ((22, 16, 13), {"jacket": OL2, "torso_front": OL2, "inner": OL2, "trousers": OL2, "shirt": OL2, "shoes": (52, 40, 28)}),
    "kozuka": ((22, 16, 13), {"jacket": OL3, "torso_front": OL3, "inner": OL3, "trousers": OL3, "shirt": OL3, "shoes": (40, 34, 26)}),
    "suzuki": ((20, 15, 12), {"jacket": (196, 70, 30), "torso_front": (226, 120, 40), "inner": (226, 120, 40), "trousers": (60, 90, 150), "shirt": (226, 120, 40), "shoes": (120, 80, 50)}),
    "woman": ((60, 36, 24), {"jacket": (200, 40, 50), "torso_front": (236, 236, 240), "inner": (236, 236, 240), "trousers": (40, 50, 90), "shirt": (236, 236, 240), "shoes": (120, 30, 30)}),
    "sailor": ((168, 84, 36), {"jacket": (238, 240, 240), "torso_front": (238, 240, 240), "inner": (40, 50, 100), "trousers": (238, 240, 240), "shirt": (40, 50, 100), "shoes": (30, 30, 30)}),
    "oldman": ((170, 170, 168), {"jacket": (110, 112, 116), "torso_front": (200, 200, 205), "inner": (140, 30, 40), "trousers": (100, 102, 108), "shirt": (200, 200, 205), "shoes": (30, 26, 24)}),
    "worker": ((20, 16, 14), {"jacket": (60, 100, 160), "torso_front": (60, 100, 160), "inner": (60, 100, 160), "trousers": (50, 60, 80), "shirt": (60, 100, 160), "shoes": (60, 40, 30)}),
}
for name, (hair_col, zones) in CAST.items():
    e = EYES[f"face_{name}"]; photo = Image.open(os.path.join(H, "flow", f"face_{name}.jpg")).convert("RGB")
    (lx, ly), (rx, ry) = e["l"], e["r"]
    ph = np.asarray(photo).astype(np.float32)
    fc = ph[int(ly):int(ly) + 90, int(lx):int(rx)]                         # cheeks + nose
    if ((fc.max(-1) - fc.min(-1)) / np.maximum(fc.max(-1), 1)).mean() < 0.16:     # Flow made a vintage B&W photo: colourise
        l = ph.mean(-1, keepdims=True) / 255
        ph = np.clip(l * np.array([238.0, 182, 140]) * (0.85 + 0.45 * l), 0, 255)
        photo = Image.fromarray(ph.astype(np.uint8))
    s = (368 - 180) / (rx - lx); cxp, cyp, cxa, cya = (lx + rx) / 2, (ly + ry) / 2, 274, 352.5      # eyes -> atlas eyes
    warp = np.asarray(photo.transform((1024, 1024), Image.AFFINE, (1 / s, 0, cxp - cxa / s, 0, 1 / s, cyp - cya / s), Image.BICUBIC)).astype(np.float32)
    skin = np.median(warp[face & (np.abs(P[..., 0]) < 0.03) & (np.abs(P[..., 2] - 0.1) < 0.03)], 0)
    skin_him = np.median(prof[face & (np.abs(P[..., 0]) < 0.03) & (np.abs(P[..., 2] - 0.1) < 0.03)], 0)
    lum = prof.mean(-1, keepdims=True)
    rec = (prof * (skin / skin_him)) * (1 - hair) + (lum / 160 * np.array(hair_col)) * hair
    wmx, wmn = warp.max(-1), warp.min(-1)
    bg = ((wmx - wmn) / np.maximum(wmx, 1) < 0.10) & (warp.mean(-1) > 150) & (P[..., 2] < 0.12)       # grey studio bg above the hair
    warp = np.where(bg[..., None], skin * 0.93, warp)
    srcm = np.where(face[..., None], warp, rec)
    fill = fill_map(skin, np.array(hair_col, float), 0.215, 0.13, row_colour(srcm), nape=0.12)
    a = np.clip(paint(srcm, *fill, nape_hair=np.array(hair_col, float)), 0, 255).astype(np.uint8)
    Image.fromarray(a).resize((128, 128), Image.BOX).save(os.path.join(OUT, f"{name}_head_128.png"))
    Image.fromarray(a).save(os.path.join(OUT, f"{name}_head_1k.png"))
    body = body0.copy()
    for z, c in zones.items():
        x, y, w, h = Z[z]; p = body[y:y + h, x:x + w]; l = p.mean(-1, keepdims=True)
        body[y:y + h, x:x + w] = np.array(c) * (0.8 + 0.2 * l / max(l.mean(), 1))
    Image.fromarray(np.clip(body, 0, 255).astype(np.uint8)).save(os.path.join(OUT, f"{name}_body_256.png"))
    print(name, "skin", skin.round())
