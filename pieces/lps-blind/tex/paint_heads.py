"""venv: repaint the researchers' head atlases in 3D so the face is no longer a pasted mask.
Every texel of the atlas (position from tex/head_map.npz) takes a blend of the atlas islands seen from the front,
the sides, the back, the top and below, each sampled where that view projects the point, weighted by the head's
(ellipsoid) normal: front photo on the face, profile photos on the temples/ears, hair photos behind, with no seams.
The scientist's side/back/top islands are the professor's recoloured: hair -> black, skin -> her skin tone.
Writes tex/prof_head_128.png and tex/sci_head_128.png (+ _1k).  python tex/paint_heads.py"""
import os
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree
from scipy.ndimage import distance_transform_edt

H = os.path.dirname(os.path.abspath(__file__)); S = 1024
M = np.load(os.path.join(H, "head_map.npz")); P, COV = M["p"], M["cov"]
yy, xx = np.mgrid[0:S, 0:S]
C, R = np.array([0, -0.015, 0.105]), np.array([0.089, 0.108, 0.165])
N = (P - C) / R ** 2; N /= np.linalg.norm(N, axis=-1, keepdims=True) + 1e-9

ISL = {"front": (xx < 560) & (yy < 700), "sideA": (xx >= 560) & (yy < 360), "sideB": (xx >= 560) & (yy >= 360) & (yy < 720),
       "back": (xx < 240) & (yy >= 700), "crown": (xx >= 240) & (xx < 560) & (yy >= 700), "under": (xx >= 560) & (yy >= 720)}
PROJ = {"front": (0, 2), "sideA": (1, 2), "sideB": (1, 2), "back": (0, 2), "crown": (0, 1), "under": (0, 1)}
trees = {}
for k, m in ISL.items():
    m = m & COV
    # keep only texels that face the island's own view (an island's rim holds stretched photo edges)
    trees[k] = (cKDTree(P[m][:, PROJ[k]]), np.stack([yy[m], xx[m]], 1))
side_sign = {k: np.sign(np.median(P[ISL[k] & COV][:, 0])) for k in ("sideA", "sideB")}


def weights():
    nx, ny, nz = N[..., 0], N[..., 1], N[..., 2]
    w = {"front": np.clip(-ny, 0, 1) ** 6, "back": np.clip(ny, 0, 1) ** 3, "crown": np.clip(nz, 0, 1) ** 3,
         "under": np.clip(-nz, 0, 1) ** 4}
    for k in ("sideA", "sideB"):
        w[k] = np.clip(nx * side_sign[k], 0, 1) ** 3
    tot = sum(w.values()) + 1e-6
    return {k: v / tot for k, v in w.items()}


W = weights()


def sample(src, k):
    """src seen through island k at every texel's projection, and how well k covers the point (0-1)."""
    tree, idx = trees[k]
    dist, j = tree.query(P[COV][:, PROJ[k]])
    out = np.zeros((S, S, 3), np.float32); cov = np.zeros((S, S), np.float32)
    out[COV] = src[idx[j, 0], idx[j, 1]]; cov[COV] = np.clip(1 - (dist - 0.002) / 0.004, 0, 1)
    return out, cov


def paint(src, fill, fill_skin, nape_hair=None):
    """Front photo on the face (to 42-62 deg), the profile photos only for the ears, painted skin/hair everywhere else."""
    a = np.abs(AZ)
    f, fc = sample(src, "front")
    wf = (1 - smooth(36, 70, a)) * fc
    out = f * wf[..., None] + fill * (1 - wf[..., None])
    ear = smooth(0.05, 0.065, np.abs(P[..., 0])) * smooth(-0.016, -0.008, P[..., 1]) * (1 - smooth(0.04, 0.05, P[..., 1])) \
        * smooth(0.07, 0.08, P[..., 2]) * (1 - smooth(0.158, 0.168, P[..., 2]))
    for k in ("sideA", "sideB"):
        e, ec = sample(src, k)
        we = (ear * ec * (np.sign(P[..., 0]) == side_sign[k]))[..., None]
        out = out * (1 - we) + e * we
    if nape_hair is not None:            # the nape cap is ~16 px at 128: a hairline across it turns into ticks -> all hair
        cap = (ISL["under"] & COV & (P[..., 1] > -0.02))[..., None]
        out = np.where(cap, nape_hair, out)
    res = out.copy()                                                     # gutters: nearest painted texel of the SAME island
    for m in ISL.values():                                               # (a neighbour island's hair bled into the nape at 128 px)
        _, (iy, ix) = distance_transform_edt(~(COV & m), return_indices=True)
        res[m & ~COV] = out[iy, ix][m & ~COV]
    return res


AZ = np.degrees(np.arctan2(P[..., 0], -(P[..., 1] - C[1])))
rng = np.random.default_rng(3)
NOISE = np.asarray(Image.fromarray((rng.random((64, 64)) * 255).astype(np.uint8)).resize((S, S), Image.BICUBIC)) / 255.0 - 0.5
STRAND = np.asarray(Image.fromarray((rng.random((256, 16)) * 255).astype(np.uint8)).resize((S, S), Image.BICUBIC)) / 255.0 - 0.5


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def row_colour(src):
    """Colour of the face photo at its own edge (|az| 34-42 deg), per height: the painted sides continue from it."""
    band = ISL["front"] & COV & (np.abs(AZ) > 34) & (np.abs(AZ) < 42)
    zb = np.linspace(-0.06, 0.28, 35); cols = []
    for z0, z1 in zip(zb[:-1], zb[1:]):
        m = band & (P[..., 2] >= z0) & (P[..., 2] < z1)
        cols.append(np.median(src[m], 0) if m.sum() > 20 else None)
    zc = (zb[:-1] + zb[1:]) / 2; ok = [c is not None for c in cols]
    tab = np.array([c for c in cols if c is not None]); zc = zc[ok]
    return np.stack([np.interp(P[..., 2], zc, tab[:, i]) for i in range(3)], -1)


def fill_map(skin, hair_col, z_front, z_side, edge=None, nape=0.09):
    """Painted skin with soft side shading, hair above a hairline that drops from the forehead to above the ears."""
    a = np.abs(AZ)
    zh = z_front - (z_front - z_side) * smooth(25, 95, a) - nape * smooth(110, 170, a)   # back: down to the nape
    hm = smooth(-0.006, 0.006, P[..., 2] - zh)[..., None]
    base = skin if edge is None else edge * (1 - smooth(45, 100, a))[..., None] + skin * smooth(45, 100, a)[..., None]
    sk = base * (1 - 0.05 * smooth(50, 110, a))[..., None] * (1 + 0.06 * NOISE[..., None])
    hr = hair_col * (1 + 0.5 * STRAND[..., None]) if np.ndim(hair_col) == 1 else hair_col
    return sk * (1 - hm) + hr * hm, sk


prof = np.asarray(Image.open(os.path.join(H, "../../lps-hombre/out/head_1k.png")).convert("RGB")).astype(np.float32)

# scientist source: her photo on the front island, the professor recoloured everywhere else
sci = np.asarray(Image.open(os.path.join(H, "sci_face_1k.png")).convert("RGB")).astype(np.float32)
mx, mn = prof.max(-1), prof.min(-1); sat = (mx - mn) / np.maximum(mx, 1)
hair = np.clip((0.30 - sat) / 0.08, 0, 1)[..., None]
face = ISL["front"] & COV
skin_her = np.median(sci[face & (np.abs(P[..., 0]) < 0.03) & (np.abs(P[..., 2] - 0.1) < 0.03)], 0)
skin_him = np.median(prof[face & (np.abs(P[..., 0]) < 0.03) & (np.abs(P[..., 2] - 0.1) < 0.03)], 0)
lum = prof.mean(-1, keepdims=True)
rec = (prof * (skin_her / skin_him)) * (1 - hair) + (lum * 0.15 + np.array([12, 8, 6])) * hair
smx, smn = sci.max(-1), sci.min(-1)
bg = ((smx - smn) / np.maximum(smx, 1) < 0.12) & (sci.mean(-1) > 140) & (P[..., 2] < 0.12)
sci = np.where(bg[..., None], skin_her * 0.93, sci)
src_sci = np.where(face[..., None], sci, rec)

def hair_photo(src, fallback):
    acc = np.zeros((S, S, 3), np.float32); ws = np.zeros((S, S), np.float32)
    for k in ("back", "crown", "sideA", "sideB"):
        c, cv = sample(src, k); w = W[k] * cv
        acc += c * w[..., None]; ws += w
    return (acc + fallback * np.clip(1 - ws, 0, 1)[..., None]) / np.maximum(ws, 1)[..., None]


sideh = (ISL["sideA"] | ISL["sideB"]) & COV & (hair[..., 0] > 0.8)
fills = {"prof": fill_map(skin_him, hair_photo(prof, np.median(prof[sideh], 0)), 0.235, 0.135, row_colour(prof)),
         "sci": fill_map(skin_her, np.array([26.0, 18, 14]), 0.205, 0.125, row_colour(src_sci), nape=0.16)}
for name, src in (("prof", prof), ("sci", src_sci)):
    a = Image.fromarray(np.clip(paint(src, *fills[name], nape_hair=np.array([22.0, 16, 13]) if name == 'sci' else None), 0, 255).astype(np.uint8))
    a.save(os.path.join(H, f"{name}_head_1k.png")); a.resize((128, 128), Image.BOX).save(os.path.join(H, f"{name}_head_128.png"))
print("ok")
