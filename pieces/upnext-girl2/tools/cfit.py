"""Contour fit (silhouette ICP): move the occluding-contour vertices of each part, view by view, onto his class-map
boundaries (signed distance fields), average the 3D displacements over many views, diffuse them over the mesh, repeat.
Unbiased (hard z-buffer), handles occlusion and internal class boundaries (arm over sweater, skirt over legs, ...).
python tools/cfit.py <in.npz> <out.npz> [--iters N] [--scale S] [--views K] [--step a] [--maxpx m] [--parts a,b]"""
import sys, json, argparse, time, numpy as np
sys.path.insert(0, "tools")
from cam import project, basis, rotz, fpx, W0, H0
from raster import raster
from scipy import ndimage as nd

ap = argparse.ArgumentParser(); ap.add_argument("inp"); ap.add_argument("out")
ap.add_argument("--iters", type=int, default=20); ap.add_argument("--scale", type=float, default=0.5)
ap.add_argument("--views", type=int, default=50); ap.add_argument("--step", type=float, default=0.7)
ap.add_argument("--maxpx", type=float, default=4.0); ap.add_argument("--parts", default="")
ap.add_argument("--lam", type=float, default=2.0); ap.add_argument("--dz", type=float, default=0.003); ap.add_argument("--smooth", type=float, default=0.05)
a = ap.parse_args()
D = dict(np.load(a.inp, allow_pickle=True)); V = D["V"].astype(np.float64).copy(); F = D["F"]; C = D["C"]; P = D["P"]
names = list(D["names"])
cam = json.loads(str(D["cam"])) if "cam" in D else json.load(open("ref/cam1.json"))
A = D["alphas"] if "alphas" in D else np.load("ref/alphas.npy")
CL = np.load("ref/cls.npz")["c"]
S = a.scale; k = int(round(1 / S)); w, h = int(W0 * S), int(H0 * S)
nV = len(V)
movable = np.ones(nV, bool)
if a.parts:
    on = [names.index(p) for p in a.parts.split(",")]; movable[:] = False
    for fi in np.nonzero(np.isin(P, on))[0]: movable[F[fi]] = True
# edges -> two faces
E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]); O = np.concatenate([F[:, 2], F[:, 0], F[:, 1]])
fi3 = np.tile(np.arange(len(F)), 3); Es = np.sort(E, 1); key = Es[:, 0] * nV + Es[:, 1]
o = np.argsort(key, kind="stable"); key, Es, O, fi3 = key[o], Es[o], O[o], fi3[o]
same = np.r_[key[1:] == key[:-1], False]
i1 = np.nonzero(same)[0]; i2 = i1 + 1
ok2 = np.ones(len(i1), bool); ok2[1:] &= key[i1[1:]] != key[i1[:-1]]   # drop non-manifold triples
i1, i2 = i1[ok2], i2[ok2]
EDG = Es[i1]; FA, FB = fi3[i1], fi3[i2]; OA, OB = O[i1], O[i2]
# vertex neighbours for the diffusion
nb = [[] for _ in range(nV)]
for u, v in EDG: nb[u].append(v); nb[v].append(u)
NBi = np.concatenate([np.full(len(n), i) for i, n in enumerate(nb)]); NBj = np.concatenate([np.array(n, int) for n in nb])
deg = np.bincount(NBi, minlength=nV).astype(float)
# vertex class/part (majority of faces)
vpart = np.zeros(nV, int); vpart[F[:, 0]] = P; vpart[F[:, 1]] = P; vpart[F[:, 2]] = P


def sdf(m):
    m = m.astype(bool)
    return nd.distance_transform_edt(m) - nd.distance_transform_edt(~m)


def bil(img, x, y):
    x = np.clip(x - 0.5, 0, img.shape[1] - 1.001); y = np.clip(y - 0.5, 0, img.shape[0] - 1.001)
    x0, y0 = x.astype(int), y.astype(int); ax, ay = x - x0, y - y0
    return img[y0, x0] * (1 - ax) * (1 - ay) + img[y0, x0 + 1] * ax * (1 - ay) + img[y0 + 1, x0] * (1 - ax) * ay + img[y0 + 1, x0 + 1] * ax * ay


def his_cls(kf):
    return CL[kf][k // 2::k, k // 2::k][:h, :w]


def view_disp(V, kf):
    C0, R, U, Fw = basis(cam); Rz = rotz(A[kf]); kp = fpx(cam) * S
    x, y, z = project(V, cam, A[kf], S)
    n = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    cen = V[F].mean(1)
    facing = ((n @ Rz.T) * (C0 - cen @ Rz.T)).sum(1) > 0
    ce = facing[FA] != facing[FB]
    e = EDG[ce]; fo = np.where(facing[FA[ce]], OA[ce], OB[ce]); ff = np.where(facing[FA[ce]], FA[ce], FB[ce])
    ex, ey = x[e[:, 1]] - x[e[:, 0]], y[e[:, 1]] - y[e[:, 0]]
    nx, ny = ey, -ex; L = np.hypot(nx, ny) + 1e-12; nx, ny = nx / L, ny / L
    flip = (nx * (x[fo] - x[e[:, 0]]) + ny * (y[fo] - y[e[:, 0]])) > 0       # point away from the inside vertex
    nx[flip] *= -1; ny[flip] *= -1
    vn = np.zeros((nV, 2)); np.add.at(vn, e[:, 0], np.stack([nx, ny], 1)); np.add.at(vn, e[:, 1], np.stack([nx, ny], 1))
    vcl = np.zeros(nV, int); vcl[e[:, 0]] = C[ff]; vcl[e[:, 1]] = C[ff]
    cv = np.unique(e.ravel()); cv = cv[movable[cv]]
    vnn = vn[cv] / (np.linalg.norm(vn[cv], axis=1, keepdims=True) + 1e-12)
    fid, dep, _ = raster(V, F, cam, A[kf], S, wh=(w, h))
    pid = np.where(fid >= 0, P[np.clip(fid, 0, None)], -1); cls = np.where(fid >= 0, C[np.clip(fid, 0, None)], 0)
    def samp(img, xx, yy): return img[np.clip(yy.astype(int), 0, h - 1), np.clip(xx.astype(int), 0, w - 1)]
    xin, yin = x[cv] - 1.0 * vnn[:, 0], y[cv] - 1.0 * vnn[:, 1]
    xo, yo = x[cv] + 1.5 * vnn[:, 0], y[cv] + 1.5 * vnn[:, 1]
    own = samp(pid, xin, yin) == vpart[cv]
    po = samp(pid, xo, yo); do = samp(dep, xo, yo); co = samp(cls, xo, yo)
    bgout = po < 0
    behind = (po >= 0) & (do > z[cv] + a.dz) & (co != vcl[cv])
    valid = own & (bgout | behind)
    hc = his_cls(kf); s = np.zeros(len(cv))
    if bgout.any():
        sf = sdf(hc > 0); m = valid & bgout; s[m] = bil(sf, x[cv][m], y[cv][m])
    for c in np.unique(vcl[cv][valid & behind]):
        m = valid & behind & (vcl[cv] == c); sc = sdf(hc == c); s[m] = bil(sc, x[cv][m], y[cv][m])
    s = np.clip(s, -a.maxpx, a.maxpx)
    cv, s, vnn, zz = cv[valid], s[valid], vnn[valid], z[cv][valid]
    d3w = (s * zz / kp)[:, None] * (vnn[:, :1] * R[None] - vnn[:, 1:] * U[None])
    return cv, d3w @ Rz, s


rng = np.random.default_rng(1); t0 = time.time()
for it in range(a.iters):
    acc = np.zeros((nV, 3)); cnt = np.zeros(nV); res = []
    for kf in rng.choice(250, a.views, replace=False):
        cv, d3, s = view_disp(V, kf)
        np.add.at(acc, cv, d3); np.add.at(cnt, cv, 1); res.append(np.abs(s).mean() if len(s) else 0)
    obs = cnt > 0; dobs = np.zeros((nV, 3)); dobs[obs] = acc[obs] / cnt[obs, None]
    wobs = np.minimum(cnt, 5.0)
    dv = dobs.copy()
    for _ in range(30):
        ns = np.zeros((nV, 3)); np.add.at(ns, NBi, dv[NBj])
        dv = (wobs[:, None] * dobs + a.lam * ns) / (wobs[:, None] + a.lam * deg[:, None] + 1e-9)
    dv[~movable] = 0
    V += a.step * dv
    if a.smooth > 0:            # light Taubin smoothing (no shrink) for mesh quality
        for lam_ in (a.smooth, -a.smooth * 1.04):
            ns = np.zeros((nV, 3)); np.add.at(ns, NBi, V[NBj]); Lp = ns / np.maximum(deg, 1)[:, None] - V
            Lp[~movable] = 0; V += lam_ * Lp
    print(f"it {it} mean |sdf| px {np.mean(res):.3f} observed {obs.sum()} max move mm {np.abs(a.step * dv).max() * 1000:.1f} {time.time() - t0:.0f}s", flush=True)
D["V"] = V; D["cam"] = json.dumps(cam); D["alphas"] = A
np.savez(a.out, **D); print("saved", a.out)
