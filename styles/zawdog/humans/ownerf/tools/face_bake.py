"""ownerf head textures (round 2): the Flow portrait of each expression is BAKED onto the head through its own UV
("head", the proxy unwrap), so the face wraps the cheeks, jaw and temples and fades into the same skin tone around the
whole head: no projection seam at 3/4, ears and skull in skin. Per texel: surface point -> thin-plate-spline warp of
the front view (head landmarks -> portrait landmarks) -> photo colour, weighted by how much the surface faces forward
and by the portrait's face/neck mask; the rest is the portrait's own skin tone; a choker band all around the neck.
    .venv/bin/python styles/zawdog/humans/ownerf/tools/face_bake.py   -> faces/<expr>.png (256, Closest), work/head_lm.json"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import D  # noqa: E402

W = os.path.join(D, "work"); F = os.path.join(D, "faces")
M = np.load(os.path.join(W, "mesh.npz")); META = json.load(open(os.path.join(W, "mesh_meta.json")))
FLM = json.load(open(os.path.join(F, "face_lm.json")))
PARTS = META["parts"]; JN = META["joints"]
EXPR = ("neutral", "smile", "surprised", "crying", "laughing", "scared")
N = 512; OUT = 256

sel = M["part"] == PARTS.index("head")
UV = M["huv"][sel]; POS = M["pos"][sel]; NRM = M["n"][sel]
V = POS.reshape(-1, 3)

# ------------------------------------------------------------------ head landmarks (front view: x, z)
GL = json.load(open(os.path.join(W, "geo.json")))["levels"]
KX = GL.get("head_kx", 1.0)
eye_z = GL.get("eye_face", JN["eye.L"][0][2]); eye_x = abs(JN["eye.L"][0][0]) * KX   # round 3: the face sits lower (geo.py EYE_NEW)
front = V[:, 1] < np.median(V[:, 1])
mid = np.abs(V[:, 0]) < 0.008
nose = V[mid & (V[:, 2] > eye_z - 0.065) & (V[:, 2] < eye_z - 0.015)]
nose_tip = nose[np.argmin(nose[:, 1])]
chin_c = V[mid & (V[:, 1] < nose_tip[1] + 0.05) & (V[:, 2] < eye_z - 0.07)]
chin = chin_c[np.argmin(chin_c[:, 2])]
lips = V[mid & (V[:, 2] > chin[2] + 0.015) & (V[:, 2] < nose_tip[2] - 0.010) & (V[:, 1] < nose_tip[1] + 0.03)]
mouth_z = float(lips[np.argmax(lips[:, 1])][2]) if len(lips) else nose_tip[2] - 0.40 * (nose_tip[2] - chin[2])   # the slit


def sil_x(z, dz=0.008):
    """front-view half width of the face at height z (edges of the triangles crossing z, front half, no ears)."""
    best = 0.0
    for tri in POS:
        for a, b in ((0, 1), (1, 2), (2, 0)):
            pa, pb = tri[a], tri[b]
            if (pa[2] - z) * (pb[2] - z) <= 0 and pa[2] != pb[2]:
                t = (z - pa[2]) / (pb[2] - pa[2]); p = pa + (pb - pa) * t
                if p[1] < V[:, 1].min() + 0.075 and abs(p[0]) < 0.085:
                    best = max(best, abs(p[0]))
    return best


HL = dict(eye_l=(eye_x, eye_z), eye_r=(-eye_x, eye_z), nose=(0.0, float(nose_tip[2])), mouth=(0.0, mouth_z),
          mouth_l=(0.024 * KX, mouth_z), mouth_r=(-0.024 * KX, mouth_z), chin=(0.0, float(chin[2])),
          cheek_l=(sil_x(eye_z), eye_z), cheek_r=(-sil_x(eye_z), eye_z),
          jaw_l=(sil_x(mouth_z), mouth_z), jaw_r=(-sil_x(mouth_z), mouth_z),
          temple_l=(sil_x(eye_z + 0.04), eye_z + 0.04), temple_r=(-sil_x(eye_z + 0.04), eye_z + 0.04), brow=(0.0, eye_z + 0.075))
# portrait landmarks (512 px, faces/neutral.jpg): eyes, nose tip, mouth + corners, chin, cheek/jaw/temple edges, hairline
PL = dict(eye_l=(307, 223), eye_r=(203, 223), nose=(257, 293), mouth=(257, 335), mouth_l=(292, 335), mouth_r=(222, 335),
          chin=(257, 399), cheek_l=(363, 223), cheek_r=(157, 223), jaw_l=(341, 335), jaw_r=(173, 335), temple_l=(352, 170),
          temple_r=(162, 170), brow=(257, 140))
json.dump(dict(head=HL, photo=PL), open(os.path.join(W, "head_lm.json"), "w"), indent=1)
print("head landmarks", {k: (round(v[0], 3), round(v[1], 3)) for k, v in HL.items()})


def tps_fit(P, Q, lam=1e-7):
    P = np.asarray(P, float); Q = np.asarray(Q, float); n = len(P)
    d2 = ((P[:, None] - P[None]) ** 2).sum(2); K = np.where(d2 > 0, d2 * np.log(d2 + 1e-20), 0)
    Pm = np.hstack([np.ones((n, 1)), P]); L = np.zeros((n + 3, n + 3))
    L[:n, :n] = K + lam * np.eye(n); L[:n, n:] = Pm; L[n:, :n] = Pm.T
    return P, np.linalg.solve(L, np.vstack([Q, np.zeros((3, 2))]))


def tps(params, X):
    P, Wt = params; n = len(P)
    d2 = ((X[:, None] - P[None]) ** 2).sum(2); K = np.where(d2 > 0, d2 * np.log(d2 + 1e-20), 0)
    return K @ Wt[:n] + np.hstack([np.ones((len(X), 1)), X]) @ Wt[n:]


keys = list(PL)
TP = tps_fit([HL[k] for k in keys], [PL[k] for k in keys])

# ------------------------------------------------------------------ rasterize the head UV
tri_id = np.full((N, N), -1, np.int32); bary = np.zeros((N, N, 3), np.float32)
for t in range(len(UV)):
    p = np.stack([UV[t, :, 0] * N - 0.5, (1 - UV[t, :, 1]) * N - 0.5], 1)
    x0, y0 = np.maximum(np.floor(p.min(0)).astype(int), 0); x1, y1 = np.minimum(np.ceil(p.max(0)).astype(int), N - 1)
    if x1 < x0 or y1 < y0:
        continue
    X, Y = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
    a, b, c = p
    den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
    if abs(den) < 1e-9:
        continue
    l0 = ((b[1] - c[1]) * (X - c[0]) + (c[0] - b[0]) * (Y - c[1])) / den
    l1 = ((c[1] - a[1]) * (X - c[0]) + (a[0] - c[0]) * (Y - c[1])) / den
    l2 = 1 - l0 - l1
    eps = 0.6 / max(abs(den) ** 0.5, 1e-3)
    m = (l0 >= -eps) & (l1 >= -eps) & (l2 >= -eps) & ((tri_id[Y, X] < 0) | ((l0 >= 0) & (l1 >= 0) & (l2 >= 0)))
    tri_id[Y[m], X[m]] = t; bary[Y[m], X[m]] = np.stack([l0[m], l1[m], l2[m]], 1)
yy, xx = np.nonzero(tri_id >= 0)
T = tri_id[yy, xx]; Bc = np.clip(bary[yy, xx], 0, 1); Bc /= Bc.sum(1, keepdims=True)
P3 = (POS[T] * Bc[:, :, None]).sum(1); N3 = NRM[T]
cov = np.zeros((N, N), bool); cov[yy, xx] = True
ear = (UV[T][:, :, 0].mean(1) < 0.03) & (UV[T][:, :, 1].mean(1) < 0.09)
ear_rim = ear & (UV[T][:, :, 1].mean(1) > 0.026) & (UV[T][:, :, 1].mean(1) < 0.054)
ear_back = ear & (UV[T][:, :, 1].mean(1) >= 0.054)

# ------------------------------------------------------------------ colours
q = tps(TP, np.stack([P3[:, 0], P3[:, 2]], 1))                       # portrait px of every texel (front view)
mask = np.asarray(Image.open(os.path.join(F, "mask.png")).convert("L").resize((512, 512), Image.LANCZOS)
                  .filter(ImageFilter.GaussianBlur(6)), np.float32) / 255
def samp(img, x, y):
    H_, W_ = img.shape[:2]
    x = np.clip(x, 0, W_ - 1.001); y = np.clip(y, 0, H_ - 1.001); x0 = x.astype(int); y0 = y.astype(int)
    fx = (x - x0)[:, None] if img.ndim == 3 else (x - x0); fy = (y - y0)[:, None] if img.ndim == 3 else (y - y0)
    return img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy) + img[y0 + 1, x0] * (1 - fx) * fy + img[y0 + 1, x0 + 1] * fx * fy


facing = np.clip((-N3[:, 1] - 0.10) / 0.40, 0, 1)
inside = (q[:, 0] > 2) & (q[:, 0] < 509) & (q[:, 1] > 2) & (q[:, 1] < 509)
w = samp(mask, q[:, 0], q[:, 1]) * facing * inside
w = np.clip(w, 0, 1) ** 0.8
w *= np.clip((P3[:, 2] - (HL['chin'][1] - 0.016)) / 0.012, 0, 1)   # round 3: the portrait fades out under the chin (no 2nd choker)
chz = GL.get("choker", FLM["eye_z"] - (FLM["choker_y"] - FLM["eye_y"]) * FLM["m_per_px"])   # round 3: lower, his choker
choker = (np.abs(P3[:, 2] - chz) < 0.0135) & (P3[:, 2] < HL["chin"][1] - 0.006)
lumw = np.array([0.299, 0.587, 0.114])
for e in EXPR:
    ph = np.asarray(Image.open(os.path.join(F, f"src_{e}.png")).convert("RGB"), np.float32)
    skin = np.median(np.concatenate([ph[270:310, 175:205].reshape(-1, 3), ph[270:310, 310:340].reshape(-1, 3)]), 0) * 0.98   # lit cheeks
    col = samp(ph, q[:, 0], q[:, 1])
    ring = (w > 0.25) & (w < 0.6) & (P3[:, 2] > HL["mouth"][1]) & (P3[:, 2] < eye_z + 0.02)
    if ring.sum() > 50:
        skin = 0.6 * skin + 0.4 * np.median(col[ring], 0)                # lit cheek tone, nudged to the fade ring
    shade = 0.93 + 0.07 * np.clip(N3[:, 2] * 0.5 + 0.5, 0, 1)
    base = skin[None, :] * shade[:, None]
    base *= (1 - 0.13 * np.clip((HL['chin'][1] + 0.004 - P3[:, 2]) / 0.012, 0, 1))[:, None]   # neck in the jaw's shade (his)
    out = base * (1 - w[:, None]) + col * w[:, None]
    out[ear] = skin * 0.74                                              # concha: shaded inside (soft, like his flat ears)
    out[ear_rim] = skin * 1.04                                          # helix rim: lit
    out[ear_back] = skin * 0.88
    dark_back = (N3[:, 1] > 0.25) & (P3[:, 2] > HL["chin"][1])          # back of the skull / nape: in the hair's shade
    out[dark_back] *= 0.95
    out[choker] = np.array([40, 37, 42], np.float32)                     # his dark-grey velvet band
    img = np.zeros((N, N, 3), np.float32); img[yy, xx] = np.clip(out, 0, 255)
    _, (iy, ix) = ndimage.distance_transform_edt(~cov, return_indices=True)
    img = img[iy, ix]
    for (u0, v0), tone in (((0.012, 0.012), 0.74), ((0.012, 0.040), 1.04), ((0.012, 0.068), 0.88)):   # the ears' two flat tones (degenerate UVs)
        cx, cy_ = int(u0 * N), int((1 - v0) * N)
        img[max(cy_ - 5, 0):cy_ + 6, max(cx - 5, 0):cx + 6] = skin * tone
    Image.fromarray(img.astype(np.uint8)).resize((OUT, OUT), Image.LANCZOS).save(os.path.join(F, e + ".png"))
    if e == "neutral":
        Image.fromarray(img.astype(np.uint8)).save(os.path.join(W, "head_tex_neutral_512.png"))
print("head textures", OUT, "px:", ", ".join(EXPR))
