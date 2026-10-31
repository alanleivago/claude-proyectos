"""venv: second researcher's textures (the lab scientist) from the lps-hombre atlases.
Head: the Flow face photo (tex/flow/*passport*) pasted on the front of hombre's head atlas by a similarity
transform on the eyes, the grey hair everywhere else turned black; body: white lab coat, slate trousers,
pale blue shirt, black shoes.  python tex/make_sci.py"""
import glob, os
import numpy as np
from PIL import Image, ImageFilter

H = os.path.dirname(os.path.abspath(__file__)); HB = os.path.join(H, "../../lps-hombre/out")
atlas = np.asarray(Image.open(os.path.join(HB, "head_1k.png")).convert("RGB")).astype(np.float32)
photo = Image.open(sorted(glob.glob(os.path.join(H, "flow", "*passport*")))[-1]).convert("RGB")

# hair: low-saturation grey pixels -> near-black brown (keeps the strand texture)
mx, mn = atlas.max(-1), atlas.min(-1); sat = (mx - mn) / np.maximum(mx, 1)
yy, xx = np.mgrid[0:1024, 0:1024]
hair = np.clip((0.30 - sat) / 0.08, 0, 1)
r = np.sqrt(((xx - 275) / 214) ** 2 + ((yy - 375) / 318) ** 2)
hair[(xx < 560) & (yy < 700)] = np.clip((yy[(xx < 560) & (yy < 700)] < 400) * (r[(xx < 560) & (yy < 700)] - 0.92) / 0.08, 0, 1)   # front: scalp above the brows
hb = np.asarray(Image.fromarray((hair * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14))) / 255.0
side = xx >= 560
hair[side] = np.clip((hb[side] - 0.28) / 0.15, 0, 1)                                 # profile: solid hair, ear stays skin
hair[(yy > 740) & (xx < 490)] = np.maximum(hair[(yy > 740) & (xx < 490)], np.clip((hb[(yy > 740) & (xx < 490)] - 0.15) / 0.15, 0, 1))  # crown / back
hair = hair[..., None]
lum = atlas.mean(-1, keepdims=True)
atlas = atlas * (1 - hair) + (lum * 0.16 + np.array([12, 8, 6])) * hair

# face: photo eyes (425,403)/(598,403) -> atlas eyes (180,355)/(368,350)
s = (368 - 180) / (598 - 425); cxp, cyp, cxa, cya = 511.5, 403, 274, 352.5
inv = (1 / s, 0, cxp - cxa / s, 0, 1 / s, cyp - cya / s)
warp = np.asarray(photo.transform((1024, 1024), Image.AFFINE, inv, Image.BICUBIC)).astype(np.float32)
r = np.sqrt(((xx - 275) / 214) ** 2 + ((yy - 375) / 318) ** 2)
m = np.clip((1.12 - r) / 0.08, 0, 1)[..., None]
atlas = atlas * (1 - m) + warp * m
out = Image.fromarray(np.clip(atlas, 0, 255).astype(np.uint8))
out.save(os.path.join(H, "sci_face_1k.png"))                          # paint_heads.py makes the final atlas

body = np.asarray(Image.open(os.path.join(HB, "body_256.png")).convert("RGB")).astype(np.float32)
Z = {"jacket": [0, 0, 128, 128], "torso_front": [128, 0, 128, 128], "trousers": [0, 128, 128, 128], "shoes": [128, 128, 64, 64],
     "shirt": [128, 192, 64, 64], "inner": [192, 192, 64, 64]}
col = {"jacket": (236, 240, 240), "inner": (236, 240, 240), "trousers": (52, 66, 82), "shoes": (34, 30, 30), "shirt": (168, 200, 228)}
for z, c in col.items():
    x, y, w, h = Z[z]; p = body[y:y + h, x:x + w]; l = p.mean(-1, keepdims=True)
    body[y:y + h, x:x + w] = np.array(c) * (0.82 + 0.18 * l / max(l.mean(), 1))
x, y, w, h = Z["torso_front"]; p = body[y:y + h, x:x + w]          # torso front: shirt stays, mustard lapel edges -> white
yel = (p[..., 0] > p[..., 2] + 40)[..., None]
body[y:y + h, x:x + w] = np.where(yel, np.array(col["jacket"]) * (0.82 + 0.18 * p.mean(-1, keepdims=True) / 150), p * np.array([0.9, 0.95, 1.08]))
Image.fromarray(np.clip(body, 0, 255).astype(np.uint8)).save(os.path.join(H, "sci_body_256.png"))
print("ok")
