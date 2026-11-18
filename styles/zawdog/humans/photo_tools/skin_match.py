"""Kit v6.1 (2026-11-16, user: "her body/skin is GREY while her face photo is normal flesh tone"): every visible skin texel
of a kit human's body texture (head, ears, neck, hands, bare arms) recoloured to the FACE PHOTO's skin tone
(look.json "cheek"), keeping the texture's own shading (luminance ratio), so the feathered face oval blends into a skin
of the same colour. Garments (Flow photo texels) are never touched: only skin texels are changed (by bone region:
head / neck / hands, plus warm skin-like texels on the arms and legs).
Also feathers the face mask (faces/mask.png): blurred a little wider, so the photo edge fades out invisibly
(forehead, cheeks, chin) instead of the old hard oval; the neck is ALWAYS body skin.
Writes humans/<name>/body.png and faces/mask.png (first run keeps body_v6.png / faces/mask_v6.png as backups).
Run kit_fix.py afterwards to pack them into <name>.blend.
    .venv/bin/python -I styles/zawdog/humans/photo_tools/skin_match.py <name> <texmap_dir> [--src body_fix.png]
texmap_dir holds <name>.neg.npz / <name>.pos.npz from pieces/zaw-dog-08/tools/texmap.py (per-texel rest pos / bone)."""
import json
import shutil
import sys
from pathlib import Path

import cv2
import numpy as np

name, tmd = sys.argv[1], Path(sys.argv[2])
HD = Path(__file__).resolve().parents[1] / name
if not (HD / "body_v6.png").exists():
    shutil.copy(HD / "body.png", HD / "body_v6.png")
if not (HD / "faces" / "mask_v6.png").exists():
    shutil.copy(HD / "faces" / "mask.png", HD / "faces" / "mask_v6.png")
src = Path(sys.argv[sys.argv.index("--src") + 1]) if "--src" in sys.argv else HD / "body_v6.png"
img = cv2.imread(str(src)).astype(np.float32)                           # BGR
out = img.copy()
look = json.loads((HD / "look.json").read_text())
cheek = np.array(look["cheek"][::-1], np.float32)                       # RGB -> BGR

HEADB = ("head", "neck", "jaw", "eye", "special", "orbicularis", "levator", "oris", "temporalis", "risorius")   # (not tongue / teeth: the mouth stays red)
HANDB = ("wrist", "finger", "metacarpal", "thumb")
skin = np.zeros(img.shape[:2], bool); hand = np.zeros_like(skin)
for side in ("neg", "pos"):
    d = np.load(tmd / f"{name}.{side}.npz"); nm = [str(n) for n in d["names"]]; vb = d["bone"]; ok = d["mat"] >= 0
    hb = np.isin(vb, [i for i, n in enumerate(nm) if n.startswith(HEADB)])
    kb = np.isin(vb, [i for i, n in enumerate(nm) if n.startswith(HANDB)])
    ab = np.isin(vb, [i for i, n in enumerate(nm) if n.startswith(("upperarm", "lowerarm", "upperleg", "lowerleg"))])
    warm = (img[..., 2] - img[..., 0]) > 22                                # skin-like (R > B): bare arms / legs
    z = d["pos"][..., 2]
    tan = (img[..., 2] - img[..., 0]) > 8                                  # garments (white coat / tee, blue shirt) are never tan
    skin |= ok & ((hb & (z > 1.3) & tan) | (ab & warm))                           # (head/neck bones low on the chest = the collar: no)
    hand |= ok & kb
lum = img.mean(-1)
for m, k, lo, hi, g in ((skin, 1.0, 0.9, 1.1, 0.35), (hand, 0.96, 0.78, 1.18, 0.6)):   # head: flatter (the MakeHuman skin's
    if m.sum() < 10:                                                      # own lips / brows must not show beside the photo)
        continue
    r = np.clip(lum / max(float(np.median(lum[m])), 1.0), lo, hi) ** g    # the texture's shading, around the median
    out[m] = (cheek * k)[None, :] * r[m][:, None]
o8 = np.clip(out, 0, 255).astype(np.uint8)
cv2.imwrite(str(HD / "body.png"), o8)

mk = cv2.imread(str(HD / "faces" / "mask_v6.png"), cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255
h, w = mk.shape
ys, xs = np.nonzero(mk > 0.5); cy, cx = ys.mean(), xs.mean()
M = cv2.getRotationMatrix2D((cx, cy), 0, 1.0)                           # same size as v6 (a smaller oval showed the body skin's lips)
mk = cv2.warpAffine(mk, M, (w, h))
mk = cv2.GaussianBlur(mk, (0, 0), 0.018 * w) ** 1.3                      # softer edge (was mask^1.5 per video); tone match does the rest
cv2.imwrite(str(HD / "faces" / "mask.png"), np.clip(mk * 255, 0, 255).astype(np.uint8))
cmp_ = np.hstack([cv2.resize(x, (384, 384), interpolation=cv2.INTER_NEAREST) for x in (img.astype(np.uint8), o8)])
cv2.imwrite(str(HD / "photo" / "skin_match_cmp.jpg"), cmp_)
print(name, "skin texels", int(skin.sum()), "hand texels", int(hand.sum()), "cheek(BGR)", cheek, "->", HD / "body.png")
