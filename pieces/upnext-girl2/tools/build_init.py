"""Initial part meshes (generalised cylinders / star blob) ray-cast into the class-labelled visual hull.
-> ref/init.npz (V, F, C class per face, P part per face, names)"""
import sys, json, numpy as np; sys.path.insert(0, "tools")
from tubes import Hull, tube, blob, resample
from scipy import ndimage as nd
d = np.load("ref/labels.npz"); L = d["L"]
H = Hull()


def clsvol(*cl):
    h = Hull.__new__(Hull); h.shape, h.lo, h.st = H.shape, H.lo, H.st
    h.vol = nd.binary_fill_holes(np.isin(L, cl)); return h


def centers(cl, z0, z1, xsel, dz=0.01):
    """per-z centroid of class cl voxels with x in xsel (callable)"""
    out = []
    for z in np.arange(z0, z1 + 1e-9, dz):
        iz = int(round((z - H.lo[2]) / H.st)); s = L[:, :, iz] == cl
        xs, ys = np.nonzero(s); X = xs * H.st + H.lo[0]; Y = ys * H.st + H.lo[1]; m = xsel(X, Y)
        if m.sum() < 10: continue
        out.append([X[m].mean(), Y[m].mean(), z])
    out = np.array(out)
    if len(out) > 4:
        for k in (0, 1): out[:, k] = nd.gaussian_filter1d(out[:, k], 2, mode="nearest")
    return out


parts = []   # (name, V, F, cls)
# boots: vertical axis through per-z centroids
for nm, sel in (("bootR", lambda X, Y: X < 0.015), ("bootL", lambda X, Y: X >= 0.015)):
    ax = centers(6, 0.03, 0.42, sel); ax = np.vstack([[ax[0, 0], ax[0, 1], 0.012], ax])
    V, F, _, _ = tube(clsvol(6), ax, 20, 44, 0.16, caps=(True, True), smooth=0.7)
    V[:, 2] = np.maximum(V[:, 2], 0.0); parts.append((nm, V, F, 6))
# legs: knee region centroids, extended up under the skirt
for nm, sel in (("legR", lambda X, Y: Y < 0.0 + 0.6 * X), ("legL", lambda X, Y: Y >= 0.0 + 0.6 * X)):
    ax = centers(5, 0.40, 0.58, sel)
    top = ax[-1] + (ax[-1] - ax[-6]) / np.linalg.norm(ax[-1] - ax[-6]) * 0.28
    axis = np.vstack([ax[0] - [0, 0, 0.05], ax, top])
    V, F, A, R = tube(clsvol(5), axis, 14, 34, 0.075, caps=(True, True), smooth=0.8)
    parts.append((nm, V, F, 5))
# skirt
ax = centers(4, 0.79, 0.95, lambda X, Y: np.ones_like(X, bool)); ax = np.vstack([ax[0] - [0, 0, 0.06], ax, ax[-1] + [0, 0, 0.03]])
V, F, _, _ = tube(clsvol(4, 5), ax, 28, 26, 0.24, caps=(True, True), smooth=0.7); parts.append(("skirt", V, F, 4))
# torso (sweater incl. turtleneck)
ax = centers(3, 0.97, 1.30, lambda X, Y: np.abs(X) < 0.13); ax = np.vstack([ax[0] - [0, 0, 0.06], ax, ax[-1] + [0, 0.0, 0.05]])
V, F, _, _ = tube(clsvol(3, 4), ax, 24, 40, 0.2, caps=(True, True), smooth=0.8); parts.append(("torso", V, F, 3))
# neck (skin, mostly inside the turtleneck)
V, F, _, _ = tube(clsvol(1, 3), [[0.0, 0.035, 1.25], [0.002, 0.03, 1.33], [0.005, 0.01, 1.40]], 10, 10, 0.045, smooth=0.6, scale=0.95)
parts.append(("neck", V, F, 1))
# head + hair: star blob
hv = clsvol(1, 2); hv.vol = nd.binary_fill_holes(hv.vol & (np.arange(L.shape[2])[None, None, :] * H.st + H.lo[2] > 1.33))
V, F = blob(hv, [0.006, 0.035, 1.46], 30, 40, 0.22, smooth=0.6)
parts.append(("head", V, F, 2))
# arms: separate upper / lower tubes (rigid parts like his low poly), axes from the images + hull slices
ARMS = {
    "uarmR": [[-0.095, 0.01, 1.30], [-0.11, 0.012, 1.15], [-0.122, 0.012, 0.99]],
    "farmR": [[-0.13, 0.02, 0.985], [-0.08, -0.08, 1.06], [-0.035, -0.125, 1.095], [0.02, -0.15, 1.16], [0.045, -0.15, 1.19]],
    "uarmL": [[0.10, 0.04, 1.30], [0.115, 0.06, 1.13], [0.14, 0.075, 0.975]],
    "farmL": [[0.135, 0.08, 0.99], [0.20, 0.05, 0.935], [0.245, 0.025, 0.893], [0.30, -0.015, 0.84], [0.355, -0.03, 0.785]],
}
for nm, axis in ARMS.items():
    V, F, _, _ = tube(clsvol(1), axis, 12, 22 if nm.startswith("f") else 16, 0.065, smooth=0.8)
    parts.append((nm, V, F, 1))
names = [p[0] for p in parts]; Vs, Fs, Cs, Ps = [], [], [], []; off = 0
for i, (nm, V, F, c) in enumerate(parts):
    Vs.append(V); Fs.append(F + off); off += len(V)
    cc = np.full(len(F), c)
    if nm == "head":
        # per-face class from the labelled surface: nearest labelled voxel of class 1/2 at the face centroid
        cen = V[F].mean(1); idx = np.round((cen - H.lo) / H.st).astype(int)
        lab = np.argwhere(np.isin(L, (1, 2)) & ~nd.binary_erosion(np.isin(L, (1, 2))))
        from scipy.spatial import cKDTree
        t = cKDTree(lab); _, j = t.query(idx); cc = L[tuple(lab[j].T)].astype(int)
    Cs.append(cc); Ps.append(np.full(len(F), i))
    print(nm, len(V), "verts", len(F), "tris")
np.savez("ref/init.npz", V=np.vstack(Vs), F=np.vstack(Fs), C=np.concatenate(Cs), P=np.concatenate(Ps), names=np.array(names))
