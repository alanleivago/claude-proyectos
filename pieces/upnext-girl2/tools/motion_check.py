"""Per-frame, per-band reprojection agreement of the fine hull (detects idle animation of the body)."""
import sys, json, numpy as np; sys.path.insert(0, "tools")
from cam import project, W0, H0
from scipy import ndimage as nd
cam = json.load(open("ref/cam1.json")); A = np.load("ref/alphas.npy")
h = np.load("ref/hull.npz"); shape = tuple(h["shape"]); vol = np.unpackbits(h["vol"])[:np.prod(shape)].reshape(shape).astype(bool)
lo, ST = h["lo"], float(h["step"])
surf = vol & ~nd.binary_erosion(vol); P = np.argwhere(surf) * ST + lo
d = np.load("ref/masks.npz"); MS = np.unpackbits(d["m"], axis=-1)[..., :W0].astype(bool)
SC = 0.5; w, hh = int(W0 * SC), int(H0 * SC)
bands = [("head", 1.32, 1.7), ("torso", 0.95, 1.32), ("skirt", 0.72, 0.95), ("legs", 0.0, 0.72)]
rows = []
for k in range(0, 250, 5):
    x, y, z = project(P, cam, A[k], SC)
    r = np.zeros((hh, w), bool); r[np.clip(y.astype(int), 0, hh - 1), np.clip(x.astype(int), 0, w - 1)] = True
    r = nd.binary_fill_holes(nd.binary_closing(nd.binary_dilation(r, iterations=1), iterations=2))
    m = MS[k][::2, ::2]
    out = []
    for name, z0, z1 in bands:
        # image rows of the band: project band limits on the axis
        _, ya, _ = project(np.array([[0, 0, z1]]), cam, A[k], SC); _, yb, _ = project(np.array([[0, 0, z0]]), cam, A[k], SC)
        sl = slice(int(ya[0]), int(yb[0]))
        a, b = r[sl], m[sl]; out.append((a & b).sum() / max(1, (a | b).sum()))
    rows.append([k] + out)
rows = np.array(rows)
print("bands", [b[0] for b in bands])
for r in rows: print(int(r[0]), " ".join(f"{v:.3f}" for v in r[1:]))
print("mean", rows[:, 1:].mean(0).round(4), "min", rows[:, 1:].min(0).round(4))
