"""Kit v4 look prep (venv, after prep_human.py): the real skin texture, the face blend mask and the outfit colours.
    .venv/bin/python styles/zawdog/humans/prep_look.py <name> <mh_skin> [top=r,g,b] [bottom=r,g,b] [inner=r,g,b] [hair=r,g,b]
<mh_skin> = a MakeHuman CC0 skin folder in the MPFB user data (young|middleage|old _ caucasian|african|asian _ male|female).
Output in humans/<name>/:
  skin.png        512 px MakeHuman-UV skin, colour-matched to the neutral portrait's cheeks (body, neck, ears, scalp)
  faces/mask.png  feathered face oval in portrait space: the photo shows only inside it (forehead to chin, cheek to cheek),
                  the skin texture everywhere else -> no photo on the neck, no mask edge
  look.json       top / bottom / inner / hair colours sampled from the Flow sheet + portrait (overridable by args)"""
import glob
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

H = os.path.dirname(os.path.abspath(__file__))
UD = (os.path.join(os.environ["APPDATA"], "Blender Foundation/Blender/5.2/mpfb/data") if os.name == "nt"
      else os.path.expanduser("~/Library/Application Support/Blender/5.2/mpfb/data"))
name, skin_name = sys.argv[1], sys.argv[2]
OV = dict(a.split("=", 1) for a in sys.argv[3:])
D = os.path.join(H, name)
FJ = json.load(open(os.path.join(D, "face.json")))
N = 512

# ---- the face oval mask (portrait space, 512 px, white = photo)
ref = np.asarray(Image.open(os.path.join(D, "faces", "neutral.jpg")).convert("RGB").resize((N, N), Image.LANCZOS)).astype(np.float32)
eye, chin, cx, ehw = FJ["eye"] * N, FJ["chin"] * N, FJ["cx"] * N, FJ["ear_hw"] * N
ftop = eye - 0.85 * (chin - eye)                                                    # the hairline (about)
cy = (ftop + chin) / 2; b = (chin - ftop) / 2 + 0.01 * N; a = ehw * 0.80
yy, xx = np.mgrid[:N, :N].astype(np.float32)
m = (((xx - cx) / a) ** 2 + ((yy - cy) / b) ** 2 <= 1.0).astype(np.float32)
m = nd.gaussian_filter(m, 0.035 * N)
m = np.clip((m - 0.25) / 0.5, 0, 1)                                                   # soft but fully opaque inside
m[int(chin + 0.015 * N):] = 0
Image.fromarray((m * 255).astype(np.uint8)).save(os.path.join(D, "faces", "mask.png"))

# ---- open-mouth faces: the dropped jaw is squashed back toward the neutral chin (no stretched mouth on the mesh chin)
if "mouth" in FJ:
    m0, c0 = FJ["mouth"] * N - 0.03 * N, FJ["chin"] * N
    for e, k_ in (("surprised", 0.78), ("laughing", 0.82), ("scared", 0.85)):
        pth = os.path.join(D, "faces", e + ".png")
        if not os.path.exists(pth):
            continue
        A_ = np.asarray(Image.open(pth).convert("RGB")).astype(np.float32); out = A_.copy()
        span = (c0 + 0.12 * N) - m0
        for yo in range(int(m0), N):                                   # output row -> source row (stretch the source down)
            ys = m0 + (yo - m0) / k_ if yo < m0 + span * k_ else yo + span * (1 - k_)
            ys = min(ys, N - 1); y0 = int(ys); f_ = ys - y0
            out[yo] = A_[y0] * (1 - f_) + A_[min(y0 + 1, N - 1)] * f_
        Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(pth)

# ---- cheek colour (as prep_human.py) and the matched skin texture
cheek = (yy > eye + 0.10 * N) & (yy < chin - 0.06 * N) & (np.abs(xx - cx) < 0.10 * N)
CHEEK = np.median(ref[cheek], 0)
sk = sorted(glob.glob(os.path.join(UD, "skins", skin_name, "*diffuse*.png")))[0]
S = np.asarray(Image.open(sk).convert("RGB").resize((N, N), Image.LANCZOS)).astype(np.float32)
body = S.mean(-1) > 40
gain = np.clip(CHEEK / np.median(S[body], 0), 0.35, 2.5)
Image.fromarray(np.clip(S * gain, 0, 255).astype(np.uint8)).save(os.path.join(D, "skin.png"))

# ---- outfit colours from the sheet's front view (runs from prep_human.py's sheet.json)
SJ = json.load(open(os.path.join(D, "sheet.json"))); v = SJ["views"]["front"]
SH = np.asarray(Image.open(os.path.join(D, "src", "sheet.jpg")).convert("RGB")).astype(np.float32)
h = v["y1"] - v["y0"]
xs_ = [((r0[0] + r0[1]) / 2) for y in range(v["y0"] + int(0.03 * h), v["y0"] + int(0.08 * h)) for r0 in v["runs"][y][:1]]
hx = float(np.median(xs_)) if xs_ else (v["x0"] + v["x1"]) / 2                     # the head's column = the body centre


def sample(y0f, y1f, half):
    px = []
    for y in range(v["y0"] + int(y0f * h), v["y0"] + int(y1f * h)):
        for a_, b_ in v["runs"][y]:
            lo, hi = max(a_, int(hx - half * h)), min(b_, int(hx + half * h))
            if hi > lo:
                px.append(SH[y, lo:hi])
    return np.median(np.concatenate(px), 0) if px else np.array([128, 128, 128.0])


def side_sample(y0f, y1f):                                                             # torso sides (a jacket over a shirt)
    px = []
    for y in range(v["y0"] + int(y0f * h), v["y0"] + int(y1f * h)):
        for a_, b_ in v["runs"][y]:
            if a_ < hx < b_:
                w_ = b_ - a_
                px += [SH[y, a_ + int(0.08 * w_):a_ + int(0.25 * w_)], SH[y, b_ - int(0.25 * w_):b_ - int(0.08 * w_)]]
    return np.median(np.concatenate(px), 0) if px else np.array([128, 128, 128.0])


look = dict(top=side_sample(0.24, 0.36).tolist(), inner=sample(0.20, 0.26, 0.015).tolist(), bottom=sample(0.66, 0.78, 0.07).tolist())
hr = ref[int(FJ["top"] * N) + 4:int(FJ["top"] * N) + int(0.07 * N), int(cx - 0.12 * N):int(cx + 0.12 * N)].reshape(-1, 3)
look["hair"] = np.median(hr, 0).tolist()
for k in ("top", "bottom", "inner", "hair"):
    if k in OV:
        look[k] = [float(x) for x in OV[k].split(",")]
look["skin_src"] = os.path.basename(sk); look["cheek"] = CHEEK.tolist()
json.dump(look, open(os.path.join(D, "look.json"), "w"), indent=1)
print(name, {k: [round(x) for x in v_] if isinstance(v_, list) else v_ for k, v_ in look.items()})
