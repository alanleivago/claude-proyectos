"""Replace the star-shaped 'head' part by a closed hair shell (hair faces of the head + inward offset + rim) and a separate
face/skull mesh (lat-long, its front ray-cast onto the skin faces of the old head, the rest tucked inside the hair).
python tools/split_head.py <in.npz> <out.npz>"""
import sys, json, numpy as np
sys.path.insert(0, "tools")
D = dict(np.load(sys.argv[1], allow_pickle=True)); V, F, C, P = D["V"], D["F"], D["C"].copy(), D["P"]
names = list(D["names"]); hi = names.index("head")
hf = np.nonzero(P == hi)[0]; OHF = F[hf]; OHC = C[hf].copy()
# 1) resample the fitted head as a fine star-shaped blob (ray cast onto the old head triangles)
c0 = V[np.unique(OHF)].mean(0)
NLAT, NLON = 64, 96
th0 = np.linspace(0, np.pi, NLAT)[1:-1]; ph0 = np.linspace(0, 2 * np.pi, NLON, endpoint=False)
Db = np.stack([np.sin(th0)[:, None] * np.cos(ph0)[None], np.sin(th0)[:, None] * np.sin(ph0)[None], np.cos(th0)[:, None] * np.ones_like(ph0)[None]], -1).reshape(-1, 3)
OA = V[OHF[:, 0]]; oe1, oe2 = V[OHF[:, 1]] - OA, V[OHF[:, 2]] - OA


def cast_from(o, d, A0, e1, e2, far=False):
    pv = np.cross(d, e2); det = (e1 * pv).sum(1); ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    tv = o - A0; u = (tv * pv).sum(1) * inv; qv = np.cross(tv, e1); v = (d * qv).sum(1) * inv; t = (e2 * qv).sum(1) * inv
    hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    if not hit.any(): return None
    return t[hit].max() if far else t[hit].min()


Rb = np.array([cast_from(c0, d, OA, oe1, oe2, True) or 0.1 for d in Db])
BV = c0 + Db * Rb[:, None]
BV = np.vstack([BV, c0 + [0, 0, cast_from(c0, np.array([0, 0, 1.0]), OA, oe1, oe2, True) or 0.15],
                c0 - [0, 0, cast_from(c0, np.array([0, 0, -1.0]), OA, oe1, oe2, True) or 0.1]])
it_, ib_ = len(BV) - 2, len(BV) - 1; BF = []
for i in range(len(th0) - 1):
    for j in range(NLON):
        q0, q1, q2, q3 = i * NLON + j, i * NLON + (j + 1) % NLON, (i + 1) * NLON + (j + 1) % NLON, (i + 1) * NLON + j
        BF += [[q0, q2, q1], [q0, q3, q2]]
BF += [[it_, j, (j + 1) % NLON] for j in range(NLON)]
o_ = (len(th0) - 1) * NLON; BF += [[ib_, o_ + (j + 1) % NLON, o_ + j] for j in range(NLON)]
BF = np.array(BF)
from scipy.spatial import cKDTree
HC = OHC[cKDTree(V[OHF].mean(1)).query(BV[BF].mean(1))[1]]
# 2) frontal faces: class straight from his near-front frames
from raster import raster
cam = json.loads(str(D["cam"])); A = D["alphas"]; CL = np.load("ref/cls.npz")["c"]
fv = np.zeros((len(BF), 3))
for k in (0, 6, 243, 249):
    fid, _, _ = raster(BV, BF, cam, A[k], 1.0); m = fid >= 0
    np.add.at(fv, (fid[m], np.where(CL[k][m] == 2, 1, np.where(CL[k][m] == 1, 0, 2))), 1)
front = fv[:, :2].sum(1) > 3
HC[front] = np.where(fv[front, 0] >= fv[front, 1], 1, 2)
print("fine head", len(BF), "faces; frontal", front.sum(), "skin", (HC == 1).sum())
HF = BF + len(V); V = np.vstack([V, BV])
# smooth face classes on the head (majority of edge neighbours, 3 passes)
from collections import defaultdict
emap = defaultdict(list)
for i, f in enumerate(HF):
    for a, b in ((f[0], f[1]), (f[1], f[2]), (f[2], f[0])): emap[(min(a, b), max(a, b))].append(i)
nbr = [[] for _ in HF]
for fl in emap.values():
    if len(fl) == 2: nbr[fl[0]].append(fl[1]); nbr[fl[1]].append(fl[0])
for _ in range(3):
    new = HC.copy()
    for i, nb in enumerate(nbr):
        v = [HC[j] for j in nb] + [HC[i]]
        new[i] = max(set(v), key=v.count)
    HC = new
hair_f = HF[HC == 2]; skin_f = HF[HC == 1]
# ---- hair shell
vid = np.unique(hair_f); remap = -np.ones(len(V), int); remap[vid] = np.arange(len(vid))
Vo = V[vid].copy(); Fo = remap[hair_f]
vn = np.zeros_like(Vo)
for f in Fo:
    n = np.cross(Vo[f[1]] - Vo[f[0]], Vo[f[2]] - Vo[f[0]]); vn[f] += n
vn /= np.linalg.norm(vn, axis=1, keepdims=True) + 1e-12
TH = 0.008
Vi = Vo - vn * TH; n0 = len(Vo)
Fs = [Fo, Fo[:, ::-1] + n0]
be = defaultdict(int); bdir = {}
for f in Fo:
    for a, b in ((f[0], f[1]), (f[1], f[2]), (f[2], f[0])):
        k = (min(a, b), max(a, b)); be[k] += 1; bdir[k] = (a, b)
rim = []
for k, c in be.items():
    if c == 1:
        a, b = bdir[k]; rim += [[b, a, a + n0], [b, a + n0, b + n0]]
Fs.append(np.array(rim, int).reshape(-1, 3))
HV = np.vstack([Vo, Vi]); HFs = np.vstack(Fs)
print("hair shell", len(HV), "verts", len(HFs), "tris", "rim edges", len(rim) // 2)
# ---- face / skull
cen = np.array([0.004, 0.012, 1.445]); rad = np.array([0.068, 0.072, 0.10])
nlat, nlon = 28, 36
th = np.linspace(0, np.pi, nlat)[1:-1]; ph = np.linspace(0, 2 * np.pi, nlon, endpoint=False)
Dd = np.stack([np.sin(th)[:, None] * np.cos(ph)[None], np.sin(th)[:, None] * np.sin(ph)[None], np.cos(th)[:, None] * np.ones_like(ph)[None]], -1).reshape(-1, 3)
r_ell = 1 / np.sqrt(((Dd / rad) ** 2).sum(1))
# ray-cast onto the skin faces of the old head (Moller-Trumbore, vectorised over faces per ray)
A0, B0, C0 = V[skin_f[:, 0]], V[skin_f[:, 1]], V[skin_f[:, 2]]
e1, e2 = B0 - A0, C0 - A0
def cast(d, A0, e1, e2):
    pv = np.cross(d, e2); det = (e1 * pv).sum(1); ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    tv = cen - A0; u = (tv * pv).sum(1) * inv; qv = np.cross(tv, e1); v = (d * qv).sum(1) * inv; t = (e2 * qv).sum(1) * inv
    hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    return t[hit].min() if hit.any() else None


HA = HV[HFs[:, 0]]; he1, he2 = HV[HFs[:, 1]] - HA, HV[HFs[:, 2]] - HA
R = r_ell * 0.9
for i, d in enumerate(Dd):
    t = cast(d, A0, e1, e2)
    if t is not None: R[i] = t; continue
    th_ = cast(d, HA, he1, he2)             # tuck the skull just inside the hair shell
    if th_ is not None: R[i] = max(0.03, th_ - 0.006)
R = R.reshape(len(th), nlon)
from scipy import ndimage as nd
Rp = np.concatenate([R[:, -1:], R, R[:, :1]], 1); R = nd.median_filter(Rp, size=3)[:, 1:-1]
FV = (cen + Dd.reshape(len(th), nlon, 3) * R[..., None]).reshape(-1, 3)
top = cen + [0, 0, rad[2] * 0.9]; bot = cen - [0, 0, rad[2] * 0.9]
FV = np.vstack([FV, top, bot]); it, ib = len(FV) - 2, len(FV) - 1
FF = []
for i in range(len(th) - 1):
    for j in range(nlon):
        a, b, c, d = i * nlon + j, i * nlon + (j + 1) % nlon, (i + 1) * nlon + (j + 1) % nlon, (i + 1) * nlon + j
        FF += [[a, c, b], [a, d, c]]
FF += [[it, j, (j + 1) % nlon] for j in range(nlon)]
o = (len(th) - 1) * nlon; FF += [[ib, o + (j + 1) % nlon, o + j] for j in range(nlon)]
FF = np.array(FF)
print("face mesh", len(FV), "verts; hits", int((R.ravel() != (r_ell * 0.9)).sum()))
# ---- rebuild arrays: drop old head, append hair + face
keepf = P != hi
used = np.unique(F[keepf]); rm = -np.ones(len(V), int); rm[used] = np.arange(len(used))
V2 = [V[used]]; F2 = [rm[F[keepf]]]; C2 = [C[keepf]]
pmap = {old: (old if old < hi else old - 1) for old in range(len(names)) if old != hi}
P2 = [np.array([pmap[p] for p in P[keepf]])]
names2 = [n for n in names if n != "head"] + ["hair", "face"]
off = len(V2[0])
V2.append(HV); F2.append(HFs + off); C2.append(np.full(len(HFs), 2)); P2.append(np.full(len(HFs), len(names2) - 2)); off += len(HV)
V2.append(FV); F2.append(FF + off); C2.append(np.full(len(FF), 1)); P2.append(np.full(len(FF), len(names2) - 1))
D.update(V=np.vstack(V2), F=np.vstack(F2), C=np.concatenate(C2), P=np.concatenate(P2), names=np.array(names2))
for k in ("FUV", "FMAT"): D.pop(k, None)
np.savez(sys.argv[2], **D); print("saved", sys.argv[2], names2)
