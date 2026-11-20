"""ownerf atlas baker (numpy): every atlas texel knows its surface point (work/mesh.npz from uv.py) and takes its colour
from the Flow photos (kit v6 rule: garments from Flow images, never code-painted):
  jacket / sleeves / cuffs  <- photo/jacket.jpg  front|back, thin-plate-spline warp model landmarks -> photo landmarks
  jeans / belt / rolled cuff <- photo/jeans.jpg  front|back, same
  crop top / chest / midriff <- photo/torso.jpg  (front patch between the lapels)
  boots, gloves               <- photo/boots_gloves.jpg (side|front boot, back|palm glove, in the part's own frame)
  hair                        <- photo/hair.jpg tiled along the strands (loft UV)
  collar                      <- the lilac collar patch of jacket.jpg
flat fills only where the reference texture is flat: skin (face-photo cheek tone), choker band, jacket lining, soles.
Front/back photos cross-fade by the texel normal. Baked at 1024, reduced to the 512 PS1 atlas (Closest).
    .venv/bin/python styles/zawdog/humans/ownerf/tools/tex.py  -> ownerf/atlas.png (+ work/atlas_1024.png)"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import D  # noqa: E402

W = os.path.join(D, "work"); PH = os.path.join(D, "photo"); F = os.path.join(D, "faces")
M = np.load(os.path.join(W, "mesh.npz")); META = json.load(open(os.path.join(W, "mesh_meta.json")))
SRC = META["src"]; PARTS = META["parts"]; JN = META["joints"]
PLM = json.load(open(os.path.join(W, "photo_lm.json"))); MLM = json.load(open(os.path.join(W, "model_lm.json")))
FLM = json.load(open(os.path.join(F, "face_lm.json")))
N = 1024; OUT = 512
LV = json.load(open(os.path.join(W, "geo.json")))["levels"]; LMk = json.load(open(os.path.join(W, "geo.json")))["landmarks"]
rng = np.random.default_rng(7)


def J(n, tail=False):
    return np.array(JN[n][1 if tail else 0])


# ------------------------------------------------------------------ rasterize the atlas
UV = M["uv"]; POS = M["pos"]; NRM = M["n"]; TS = M["src"]; TP = M["part"]; LOC = M["loc"]
tri_id = np.full((N, N), -1, np.int32); bary = np.zeros((N, N, 3), np.float32)
for t in range(len(UV)):
    p = np.stack([UV[t, :, 0] * N - 0.5, (1 - UV[t, :, 1]) * N - 0.5], 1)
    x0, y0 = np.floor(p.min(0)).astype(int); x1, y1 = np.ceil(p.max(0)).astype(int)
    x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, N - 1), min(y1, N - 1)
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
    eps = 0.6 / max(np.abs(den) ** 0.5, 1e-3)
    ins = (l0 >= -eps) & (l1 >= -eps) & (l2 >= -eps)
    free = tri_id[Y, X] < 0
    m = ins & (free | ((l0 >= 0) & (l1 >= 0) & (l2 >= 0)))
    tri_id[Y[m], X[m]] = t
    bary[Y[m], X[m]] = np.stack([l0[m], l1[m], l2[m]], 1)
yy, xx = np.nonzero(tri_id >= 0)
T = tri_id[yy, xx]; Bc = np.clip(bary[yy, xx], 0, 1); Bc /= Bc.sum(1, keepdims=True)
P3 = (POS[T] * Bc[:, :, None]).sum(1)
L2 = (LOC[T] * Bc[:, :, None]).sum(1)
N3 = NRM[T]
S_ = np.array(SRC)[TS[T]]
PT = np.array(PARTS)[TP[T]]
col = np.zeros((len(T), 3), np.float32)
print("texels", len(T), "of", N * N)


# ------------------------------------------------------------------ helpers
def load(name):
    return np.asarray(Image.open(os.path.join(PH, name)).convert("RGB")).astype(np.float32)


def keyed(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (r > 150) & (b > 150) & (g < 120) & (np.abs(r - b) < 90)


def keyed_wide(a, grow=3):
    """key colour + its anti-aliased fringe (pinkish pixels next to the key)."""
    k = keyed(a)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    pink = (r > g + 35) & (b > g + 35) & (np.abs(r - b) < 70)
    k = k | (ndimage.binary_dilation(k, iterations=grow) & pink)
    return ndimage.binary_dilation(k, iterations=1)


def bleed(a, bad):
    """replace key-colour pixels by the nearest garment pixel (no magenta can ever be sampled)."""
    _, (iy, ix) = ndimage.distance_transform_edt(bad, return_indices=True)
    return a[iy, ix]


def sample(img, x, y):
    H, Wd = img.shape[:2]
    x = np.clip(x, 0, Wd - 1.001); y = np.clip(y, 0, H - 1.001)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); fx = (x - x0)[:, None]; fy = (y - y0)[:, None]
    return (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy) + img[y0 + 1, x0] * (1 - fx) * fy
            + img[y0 + 1, x0 + 1] * fx * fy)


def tps_fit(P, Q, lam=1e-7):
    P = np.asarray(P, float); Q = np.asarray(Q, float); n = len(P)
    d2 = ((P[:, None] - P[None]) ** 2).sum(2); K = np.where(d2 > 0, d2 * np.log(d2 + 1e-20), 0)
    Pm = np.hstack([np.ones((n, 1)), P])
    L = np.zeros((n + 3, n + 3)); L[:n, :n] = K + lam * np.eye(n); L[:n, n:] = Pm; L[n:, :n] = Pm.T
    Y = np.vstack([Q, np.zeros((3, 2))])
    return P, np.linalg.solve(L, Y)


def tps(params, X):
    P, Wt = params; n = len(P)
    d2 = ((X[:, None] - P[None]) ** 2).sum(2); K = np.where(d2 > 0, d2 * np.log(d2 + 1e-20), 0)
    return K @ Wt[:n] + np.hstack([np.ones((len(X), 1)), X]) @ Wt[n:]


def pairs(model, photo, back=False, extra=()):
    P, Q = [], []
    for k, q in photo.items():
        mk = k
        if back:                                    # back view: image-left is the garment's LEFT side
            mk = k.replace("_r", "_X").replace("_l", "_r").replace("_X", "_l")
        if mk in model:
            u, v = model[mk]
            P.append((-u if back else u, v)); Q.append(q)
    for p_, q_ in extra:
        P.append(p_); Q.append(q_)
    return P, Q


def front_back(sel, img, pf, pb):
    """cross-fade the front and back photo by the normal (y < 0 = front)."""
    X = np.stack([P3[sel, 0], P3[sel, 2]], 1)
    cf = sample(img, *tps(pf, X).T); cb = sample(img, *tps(pb, np.stack([-X[:, 0], X[:, 1]], 1)).T)
    wf = (0.5 - 0.5 * np.clip(N3[sel, 1] / 0.35, -1, 1))[:, None]
    return cf * wf + cb * (1 - wf)


# ------------------------------------------------------------------ jacket (+ sleeves, cuffs)
ja = load("jacket.jpg"); jkey = keyed_wide(ja); jab = bleed(ja, jkey)
JF, JB = PLM["jacket_front"], PLM["jacket_back"]
# photo cuffs: use a row ~14 px above the rounded cuff bottom (wider, the real cuff corners)
pf = tps_fit(*pairs(MLM["jacket"], JF))
pb = tps_fit(*pairs(MLM["jacket"], JB, back=True))
sel = np.isin(S_, ["jacket", "sleeve", "cuffband"])
col[sel] = front_back(sel, jab, pf, pb)
sel = S_ == "cuffband"                              # rolled cuff: a dark band like the reference's
col[sel] = col[sel] * 0.42
sel = S_ == "hem"
col[sel] = np.median(jab[~jkey].reshape(-1, 3), 0) * 0.55
# collar: the lilac patch of the front photo, by the collar's own loft UV
cxc, cyc = JF["collar_top"]
sub = ja[cyc - 4:cyc + 130, cxc - 115:cxc + 115]
lil = (sub[..., 2] > 125) & (sub[..., 0] > 85) & ((sub[..., 2] - sub[..., 1]) > 30) & ~keyed(sub) & (sub.sum(2) > 320)
ys, xs = np.nonzero(lil)
cb_ = (xs.min(), ys.min(), xs.max(), ys.max())
patch = bleed(sub, ~lil)[cb_[1]:cb_[3] + 1, cb_[0]:cb_[2] + 1]
sel = S_ == "collar"
if sel.any():                                       # flat lilac like the reference collar (colour from the Flow photo)
    lil_c = np.median(patch[lil[cb_[1]:cb_[3] + 1, cb_[0]:cb_[2] + 1]], 0)
    col[sel] = lil_c[None, :] * (0.93 + 0.07 * np.clip(N3[sel, 2], 0, 1))[:, None]
print("collar patch", cb_, "lilac mean", patch.reshape(-1, 3).mean(0).round())

# ------------------------------------------------------------------ jeans (+ belt, rolled cuffs)
jn = load("jeans.jpg"); nkey = keyed_wide(jn); jnb = bleed(jn, nkey)
NF, NB = dict(PLM["jeans_front"]), dict(PLM["jeans_back"])
for L_ in (NF, NB):
    for s in ("r", "l"):
        for io in ("in", "out"):
            x, y = L_["hem_%s_%s" % (s, io)]
            L_["cufftop_%s_%s" % (s, io)] = (x, y - 24)
pf = tps_fit(*pairs(MLM["jeans"], NF)); pb = tps_fit(*pairs(MLM["jeans"], NB, back=True))
sel = np.isin(S_, ["jeans", "jcuff"])
col[sel] = front_back(sel, jnb, pf, pb)
_jsel = np.nonzero(np.isin(S_, ["jeans"]))[0]
_jm = np.median(col[_jsel], 0)
col[_jsel] = _jm + (col[_jsel] - _jm) * 0.55                # less stone-wash: the reference denim is flat
_bz = (P3[_jsel, 2] > LV["belt_b"] - 0.004) & (P3[_jsel, 2] < LV["belt_t"] + 0.004)
_b = col[_jsel[_bz]]; _bl = _b.mean(1, keepdims=True)
_shiny = _bl[:, 0] > 120
_b = np.where(_shiny[:, None], np.clip(_bl * 1.15, 0, 235) * np.array([[1.0, 1.0, 1.03]]), np.clip(_bl * 0.45, 8, 50) * np.array([[1.0, 0.95, 0.95]]))
col[_jsel[_bz]] = _b
sel = S_ == "jcuff"
if sel.any():
    leg_med = np.median(col[S_ == "jeans"], 0); cf_med = np.median(col[sel], 0)
    col[sel] = col[sel] * (leg_med / np.maximum(cf_med, 1)) * 0.92

# ------------------------------------------------------------------ crop top / chest / midriff (front patch)
to = load("torso.jpg"); tkey = keyed_wide(to); tob = bleed(to, tkey)
TP_PAIRS = [((0, 1.405), (192, 60)), ((-0.150, 1.36), (44, 92)), ((0.150, 1.36), (340, 92)), ((0, 1.295), (190, 163)),
            ((-0.095, 1.305), (98, 150)), ((0.095, 1.305), (286, 150)), ((-0.125, LV["crop"]), (88, 354)),
            ((0.125, LV["crop"]), (298, 354)), ((0, LV["crop"]), (192, 358)), ((0, LMk["navel"]), (190, 392)),
            ((-0.140, LV["belt_t"]), (70, 400)), ((0.140, LV["belt_t"]), (314, 400)), ((0, LV["belt_t"]), (192, 404))]
TP_PAIRS = [((x, (1.31 if abs(z - 1.295) < 1e-6 else 1.32 if abs(z - 1.305) < 1e-6 else z - 0.012 if abs(z - LV["crop"]) < 1e-6 else z)), q)
            for (x, z), q in TP_PAIRS]
pt = tps_fit([p for p, q in TP_PAIRS], [q for p, q in TP_PAIRS])
sel = S_ == "torso"
X = np.stack([P3[sel, 0], P3[sel, 2]], 1)
col[sel] = sample(tob, *tps(pt, X).T)
# the torso photo's skin -> the face photo's skin tone (whites of the crop top barely move)
c_ = col[sel]; mx_ = c_.max(1); mn_ = c_.min(1); sat_ = (mx_ - mn_) / np.maximum(mx_, 1)
skinish = (sat_ > 0.12) & (mx_ > 90) & (c_[:, 0] > c_[:, 2])
_SK = None

# ------------------------------------------------------------------ skin, neck choker, ears, forearms, fingertips
_fp = np.asarray(Image.open(os.path.join(F, "neutral.jpg")).convert("RGB").resize((512, 512))).astype(np.float32)
_mk = np.asarray(Image.open(os.path.join(F, "mask.png")).resize((512, 512))).astype(np.float32) / 255
_band = (_mk > 0.25) & (_mk < 0.75)
_band[:240] = False                                 # cheeks / jaw / neck sides only (no hair, no eyes)
SKIN = np.median(_fp[_band], 0)
_lum = float((SKIN * np.array([0.299, 0.587, 0.114])).sum()); SKIN = np.clip((_lum + (SKIN - _lum) * 0.78) * 1.03, 0, 255)   # = face_prep.skin_grade
print("skin from mask band", SKIN.round())
_tsel = np.nonzero(S_ == "torso")[0]
_c = col[_tsel]; _mx = _c.max(1); _mn = _c.min(1); _sat = (_mx - _mn) / np.maximum(_mx, 1)
_sk = (_sat > 0.12) & (_mx > 90) & (_c[:, 0] > _c[:, 2])
if _sk.any():
    gain = SKIN / np.maximum(np.median(_c[_sk], 0), 1)
    wsk = np.clip((_sat - 0.06) / 0.10, 0, 1)[:, None]
    col[_tsel] = _c * (1 + (gain[None, :] - 1) * wsk)
    print("torso skin gain", gain.round(3))
sel = np.isin(S_, ["head", "ear", "forearm", "finger"])
shade = 0.94 + 0.06 * np.clip(N3[sel, 2] * 0.5 + 0.5, 0, 1)
col[sel] = SKIN * shade[:, None]
chz = FLM["eye_z"] - (FLM["choker_y"] - FLM["eye_y"]) * FLM["m_per_px"]
hw = 26 * FLM["m_per_px"]
sel = (S_ == "head") & (np.abs(P3[:, 2] - chz) < hw)
col[sel] = np.array([24, 21, 24], np.float32)
sel = S_ == "ear"
col[sel] *= 0.92
# skin under the hair (temples, cheek sides, nape) in the hair's shadow, so it reads as shadowed skin, not a flat wedge
sel = (S_ == "head") & (P3[:, 2] > FLM["eye_z"] - 0.075) & (np.abs(N3[:, 0]) > 0.45)
col[sel] *= 0.82
sel = (S_ == "head") & (N3[:, 1] > 0.3) & (P3[:, 2] > FLM["eye_z"] - 0.14)
col[sel] *= 0.80

# ------------------------------------------------------------------ boots (side photo for side-facing texels, front photo otherwise)
bg = load("boots_gloves.jpg"); bkey = keyed_wide(bg, 4); bgb = bleed(bg, bkey)
bf, bs = PLM["boot_front"], PLM["boot_side"]
for sg in (1, -1):
    sel = np.isin(S_, ["boot", "sole"]) & (np.sign(P3[:, 0]) == sg)
    if not sel.any():
        continue
    P_ = P3[sel]; n_ = N3[sel]
    ymin, ymax = P_[:, 1].min(), P_[:, 1].max(); ztop = P_[:, 2].max(); xc = P_[:, 0].mean(); xw = np.ptp(P_[:, 0])
    sx = bs[2] - (P_[:, 1] - ymin) / (ymax - ymin) * (bs[2] - bs[0]); sy = bs[3] - P_[:, 2] / ztop * (bs[3] - bs[1])
    cs = sample(bgb, sx, sy)
    fx = (bf[0] + bf[2]) / 2 + (P_[:, 0] - xc) * sg / xw * (bf[2] - bf[0]); fy = bf[3] - P_[:, 2] / ztop * (bf[3] - bf[1])
    cf = sample(bgb, fx, fy)
    ws = np.clip((np.abs(n_[:, 0]) - np.abs(n_[:, 1]) * 0.6) * 1.5 + 0.5, 0, 1)[:, None]
    col[sel] = cs * ws + cf * (1 - ws)
sel = np.isin(S_, ["boot"])
_l = col[sel].mean(1, keepdims=True)
_lb = np.asarray(Image.fromarray(np.zeros((1, 1, 3), np.uint8)))  # noqa: F841
col[sel] = (20 + 0.35 * (_l - 20)) * np.array([[1.0, 0.98, 0.96]])      # plain black leather, the photo only as soft shading
sel = S_ == "sole"
col[sel] = np.array([30, 28, 27], np.float32)

# ------------------------------------------------------------------ gloves (back / palm photo in the hand frame)
gb, gp = PLM["glove_back"], PLM["glove_palm"]
for sg, s in ((1, "L"), (-1, "R")):
    sel = (S_ == "glove") & (np.sign(P3[:, 0]) == sg)
    wr = J(f"wrist.{s}"); k2, k5 = J(f"finger2-1.{s}"), J(f"finger5-1.{s}")
    kn = (J(f"finger2-1.{s}") + J(f"finger3-1.{s}") + J(f"finger4-1.{s}") + k5) / 4
    ax = kn - wr; ax /= np.linalg.norm(ax); ac = k2 - k5; ac -= ax * (ac @ ax); ac /= np.linalg.norm(ac)
    dors = np.cross(ax, ac)
    th = J(f"finger1-3.{s}", True) - (wr + kn) / 2
    if dors @ th > 0:
        dors = -dors
    tip = J(f"finger3-3.{s}", True); Lt = (tip - wr) @ ax
    rel = P3[sel] - wr; a = rel @ ax; b = rel @ ac
    back = (N3[sel] @ dors) > 0
    out = np.zeros((sel.sum(), 3), np.float32)
    for box, msk, flip in ((gb, back, 1), (gp, ~back, -1)):
        if not msk.any():
            continue
        py = box[3] - (a[msk] + 0.035) / (Lt + 0.035) * (box[3] - box[1])
        px = (box[0] + box[2]) / 2 + flip * b[msk] / 0.095 * (box[2] - box[0])
        out[msk] = sample(bgb, px, py)
    lum = out.mean(1, keepdims=True)
    col[sel] = np.clip(lum * 0.55, 6, 60) * np.array([[1.0, 0.97, 1.0]])

# ------------------------------------------------------------------ hair (tiled along the strands)
hp = load("hair.jpg")
hp = np.asarray(Image.fromarray(hp.astype(np.uint8)).resize((96, 256), Image.LANCZOS).resize((512, 512), Image.BICUBIC)).astype(np.float32)
sel = S_ == "hair"
TILE = 0.22                                          # broad painted-looking strands (the reference hair is smooth, few strands)
# strands run down from the crown: u = angle around the head axis, v = drop below the crown (no seam band at the top)
_hp3 = P3[sel]; _yc = np.median(_hp3[:, 1]); _zt = _hp3[:, 2].max()
_ang = np.arctan2(_hp3[:, 0], -(_hp3[:, 1] - _yc))
hx = ((_ang * 0.10) / TILE % 1.0) * (hp.shape[1] - 1); hy = (((_zt - _hp3[:, 2]) * 1.6) / TILE % 1.0) * (hp.shape[0] - 1)
col[sel] = sample(hp, hx, hy)
_hm = np.median(col[sel], 0); col[sel] = _hm + (col[sel] - _hm) * 0.6       # smoother, painted-looking strands
# darker roots at the crown, lighter magenta tips (reference)
zz_ = P3[sel, 2]; ztop = P3[sel, 2].max(); g_ = np.clip((ztop - zz_) / 0.17, 0, 1)
col[sel] *= (0.78 + 0.42 * g_)[:, None]

# ------------------------------------------------------------------ grade garments to the reference palette (viewport colours)
TARGET = {("jacket", "sleeve", "cuffband"): (62, 50, 90), ("jeans", "jcuff"): (42, 35, 62), ("hair",): (86, 44, 124),
          ("collar",): (140, 120, 196)}
for ks, tgt in TARGET.items():
    sel = np.isin(S_, list(ks))
    if not sel.any():
        continue
    base = col[np.isin(S_, [ks[0]])]
    med = np.median(base, 0)
    col[sel] *= (np.array(tgt) / np.maximum(med, 1))[None, :]
    print("grade", ks, "median", med.round(), "->", tgt)

# ------------------------------------------------------------------ the reference's mottled fabric (his material multiplies a noise):
# soft blotches on the jacket and jeans, +-7 %, in object space so they do not follow the UV seams
def blotch(p, scale):
    q = p / scale
    v = (np.sin(q[:, 0] * 1.7 + np.sin(q[:, 2] * 1.3)) + np.sin(q[:, 1] * 2.1 + q[:, 2] * 0.7) + np.sin(q[:, 2] * 1.9 + q[:, 0] * 0.9 + 1.3))
    return v / 3.0


sel = np.isin(S_, ["jacket", "sleeve", "jeans", "jcuff"])
col[sel] *= (1.0 + 0.11 * blotch(P3[sel], 0.026))[:, None]

# ------------------------------------------------------------------ write: 1024 bake, 512 atlas (box), islands bled
img = np.zeros((N, N, 3), np.float32); img[yy, xx] = np.clip(col, 0, 255)
cov = np.zeros((N, N), bool); cov[yy, xx] = True
img = bleed(img, ~cov)
Image.fromarray(img.astype(np.uint8)).save(os.path.join(W, "atlas_1024.png"))
small = Image.fromarray(img.astype(np.uint8)).reduce(2)
small.save(os.path.join(D, "atlas.png"))
print("atlas written", small.size)
