"""Flow portraits -> aligned sources for the head-texture bake: each expression aligned to the neutral (ECC on the
eye/brow band), skin-graded, saved as faces/src_<expr>.png (512) + the feathered face/neck mask + face_lm.json.
    .venv/bin/python styles/zawdog/humans/ownerf/tools/face_prep.py [eye_z]"""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import D  # noqa: E402

F = os.path.join(D, "faces")
EXPR = ("neutral", "smile", "surprised", "crying", "laughing", "scared")
OUT = 256
eye_z = float(sys.argv[1]) if len(sys.argv) > 1 else 1.564
# landmarks measured on faces/neutral.jpg (512 px): eyes (203,223)/(307,223), mouth (257,335), chin (257,399),
# cheeks 157..363 at the eye line, choker band 407..460 (centre 433)
LM = dict(size=512, cx=257.0, eye_y=223.0, eye_z=eye_z, m_per_px=0.061 / 104.0, mouth_y=335, chin_y=399, choker_y=433)
json.dump(LM, open(os.path.join(F, "face_lm.json"), "w"), indent=1)

def skin_grade(a, desat=0.22, lift=1.03):
    """paler, less orange skin like the reference (applied to the portraits AND the atlas skin, so they stay matched)."""
    a = np.asarray(a, np.float32)
    lum = (a * np.array([0.299, 0.587, 0.114])).sum(-1, keepdims=True)
    return np.clip((lum + (a - lum) * (1 - desat)) * lift, 0, 255)


ref = np.asarray(Image.open(os.path.join(F, "neutral.jpg")).convert("RGB")).astype(np.float32)
g0 = cv2.cvtColor(ref.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
band = np.zeros_like(g0, np.uint8); band[150:300, 130:390] = 1          # eyes + brows + upper nose: stable across expressions
for e in EXPR:
    im = np.asarray(Image.open(os.path.join(F, e + ".jpg")).convert("RGB").resize((512, 512), Image.LANCZOS)).astype(np.float32)
    if e != "neutral":
        g1 = cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
        warp = np.eye(2, 3, dtype=np.float32)
        try:
            _, warp = cv2.findTransformECC(g0, g1, warp, cv2.MOTION_EUCLIDEAN,
                                           (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), band, 5)
            im = cv2.warpAffine(im, warp, (512, 512), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
            print(e, "aligned dx=%.1f dy=%.1f rot=%.2f deg" % (warp[0, 2], warp[1, 2], np.degrees(np.arctan2(warp[1, 0], warp[0, 0]))))
        except cv2.error as ex:
            print(e, "ECC failed", ex)
    im = skin_grade(im)
    # round 2: the aligned, graded 512 portrait is the SOURCE of the baked head texture (face_bake.py writes <expr>.png)
    Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(os.path.join(F, "src_" + e + ".png"))

# mask: face oval (hairline -> chin, cheek to cheek) + the neck with the choker; feathered
m = Image.new("L", (512, 512), 0); d = ImageDraw.Draw(m)
d.ellipse((159, 118, 355, 412), fill=255)
d.polygon([(196, 370), (318, 370), (330, 466), (184, 466)], fill=255)
m = m.filter(ImageFilter.GaussianBlur(9))
m.resize((OUT, OUT), Image.LANCZOS).save(os.path.join(F, "mask.png"))
# skin tone (cheeks) for the atlas
ch = np.concatenate([ref[282:298, 182:198].reshape(-1, 3), ref[282:298, 316:332].reshape(-1, 3)])
LM["cheek"] = [float(x) for x in np.median(ch, 0)]
nk = ref[372:396, 230:284].reshape(-1, 3); LM["neck"] = [float(x) for x in np.median(nk, 0)]
json.dump(LM, open(os.path.join(F, "face_lm.json"), "w"), indent=1)
print("cheek", LM["cheek"], "neck", LM["neck"])
