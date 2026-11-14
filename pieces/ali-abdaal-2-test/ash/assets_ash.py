"""Ashton phase-2 assets: Flow gens -> rembg birefnet-general cutouts (alpha eroded 1 px) -> assets/ash/*.png"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
R = Path(__file__).resolve().parent.parent; F = R / "flow/ash"; O = R / "assets/ash"; O.mkdir(exist_ok=True)
S = new_session("birefnet-general")
SRC = {"clock": "2026-11-12T16-33-36-product-photo-of-a-black-digital-alarm-c-2.jpg",
       "ice": "2026-11-12T16-33-53-product-photo-of-a-large-clear-glass-bow-1.jpg",
       "banana": "2026-11-12T16-34-09-product-photo-of-a-single-ripe-yellow-ba-1.jpg",
       "coach": "2026-11-12T16-34-27-studio-photo-of-a-30-year-old-muscular-f-2.jpg",
       "gym": "2026-11-12T16-34-46-photo-of-a-small-single-storey-neighborh-1.jpg",
       "gymsign": "2026-11-12T16-35-04-isolated-tall-roadside-sign-on-a-single--2.jpg",
       "phone": "2026-11-12T16-35-25-product-photo-of-a-modern-black-smartpho-2.jpg",
       "car": "2026-11-12T16-35-43-clean-high-resolution-photo-of-a-glossy--1.jpg"}
for k, f in SRC.items():
    out = O / f"{k}.png"
    if out.exists(): continue
    im = Image.open(F / f).convert("RGB"); cut = remove(im, session=S)
    a = cut.split()[-1].filter(ImageFilter.MinFilter(3)); a = Image.fromarray(np.where(np.asarray(a) < 12, 0, np.asarray(a)).astype(np.uint8))
    rgba = im.copy(); rgba.putalpha(a); bb = a.getbbox(); rgba.crop(bb).save(out); print(k, rgba.crop(bb).size, bb, im.size)
