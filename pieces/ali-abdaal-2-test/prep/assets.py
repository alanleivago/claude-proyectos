"""Ref-replica assets: Flow gens -> rembg birefnet-general cutouts (alpha eroded 1 px, no halo) -> assets/img/*.png"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
R = Path(r"F:\Claude Proyectos\pieces\ali-abdaal-2-test"); F = R / "flow/out"; O = R / "assets/img"
S = new_session("birefnet-general")
SRC = {
 "worker": "2026-11-12T15-31-33-studio-photo-of-a-25-year-old-man-smilin-2.jpg",
 "sign": "2026-11-12T15-33-15-isolated-tall-roadside-restaurant-sign-o-2.jpg",
 "building": "2026-11-12T16-09-05-photo-of-a-small-single-storey-fast-food-1.jpg",   # v1: tower + sign left, canopy right (ref composition); v0 = building_v0.png
 "kiosk": "2026-11-12T15-36-01-recreate-aa2_kiosk-as-a-clean-sharp-phot-1.jpg",
 "car": "2026-11-12T15-34-20-recreate-aa2_car-as-a-clean-high-resolut-1.jpg",
 "bbq": "2026-11-12T15-35-43-recreate-aa2_bbq-as-a-clean-high-resolut-1.jpg",
 "sweetsour": "2026-11-12T15-35-01-recreate-aa2_sweetsour-as-a-clean-high-r-2.jpg",
}
for k, f in SRC.items():
    out = O / f"{k}.png"
    if out.exists(): continue
    im = Image.open(F / f).convert("RGB")
    cut = remove(im, session=S)
    a = cut.split()[-1].filter(ImageFilter.MinFilter(3))           # erode 1 px: no cream halo
    a = Image.fromarray(np.where(np.asarray(a) < 12, 0, np.asarray(a)).astype(np.uint8))
    rgba = im.copy(); rgba.putalpha(a)
    bb = a.getbbox(); rgba = rgba.crop(bb)
    rgba.save(out); print(k, rgba.size, bb)
