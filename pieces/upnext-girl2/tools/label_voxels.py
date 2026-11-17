"""Label hull surface voxels with his class maps (visibility-tested votes over the turntable), propagate inside.
-> ref/labels.npz (int8 per voxel, -1 empty)"""
import sys, json, numpy as np; sys.path.insert(0, "tools")
from cam import project, W0, H0, basis, rotz
from scipy import ndimage as nd
cam = json.load(open("ref/cam1.json")); A = np.load("ref/alphas.npy")
h = np.load("ref/hull.npz"); shape = tuple(h["shape"]); vol = np.unpackbits(h["vol"])[:np.prod(shape)].reshape(shape).astype(bool)
lo, ST = h["lo"], float(h["step"])
CL = np.load("ref/cls.npz")["c"]
surf = vol & ~nd.binary_erosion(vol)
idx = np.argwhere(surf); P = (idx * ST + lo).astype(np.float64)
# outward normals from the smoothed occupancy gradient
sm = nd.gaussian_filter(vol.astype(np.float32), 1.5); gx, gy, gz = np.gradient(sm)
N = -np.stack([gx[surf], gy[surf], gz[surf]], 1); N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-9
votes = np.zeros((len(P), 7), np.float32)
SC = 0.25; w, hh = int(W0 * SC), int(H0 * SC)
for k in range(0, 250, 2):
    x, y, z = project(P, cam, A[k]); xs, ys = x * SC, y * SC
    zb = np.full((hh + 1, w + 1), np.inf)
    xi, yi = np.floor(xs).astype(int), np.floor(ys).astype(int)
    for dx in (0, 1):
        for dy in (0, 1):
            np.minimum.at(zb, (np.clip(yi + dy - 1, 0, hh), np.clip(xi + dx - 1, 0, w)), z)
    vis = z <= zb[np.clip(yi, 0, hh), np.clip(xi, 0, w)] + 1.8 * ST
    C, R, U, F = basis(cam); Rz = rotz(A[k])
    vdir = C - P @ Rz.T; vdir /= np.linalg.norm(vdir, axis=1, keepdims=True)
    ndv = ((N @ Rz.T) * vdir).sum(1)
    ok = vis & (ndv > 0.15)
    px, py = np.clip(np.round(x - 0.5).astype(int), 0, W0 - 1), np.clip(np.round(y - 0.5).astype(int), 0, H0 - 1)
    c = CL[k][py[ok], px[ok]]
    np.add.at(votes, (np.nonzero(ok)[0], c), ndv[ok])
lab = votes[:, 1:].argmax(1) + 1; lab[votes[:, 1:].sum(1) == 0] = 0
L = np.full(shape, -1, np.int8); L[tuple(idx.T)] = lab
# propagate to interior: nearest labelled surface voxel
known = L > 0
_, ind = nd.distance_transform_edt(~known, return_indices=True)
L2 = L[tuple(ind)]; L2[~vol] = -1
np.savez_compressed("ref/labels.npz", L=L2, lo=lo, step=ST)
print("surface", len(P), "class counts", np.bincount(lab, minlength=7), "unvoted", (lab == 0).sum())
conf = votes.max(1) / (votes.sum(1) + 1e-9); print("mean confidence", conf[lab > 0].mean())
