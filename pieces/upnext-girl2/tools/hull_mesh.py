"""Fine visual hull (voxel occupancy, 4 mm) with the calibrated camera + per-frame angles -> ref/hull.npz and
ref/hull.obj (marching cubes). Carving uses full-res masks sampled at voxel projections."""
import sys, json, numpy as np; sys.path.insert(0, "tools")
from cam import project, W0, H0
from skimage import measure
from scipy import ndimage as nd
cam = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "ref/cam1.json")); A = np.load("ref/alphas.npy")
d = np.load("ref/masks.npz"); MS = np.unpackbits(d["m"], axis=-1)[..., :W0].astype(bool)
ST = 0.004
lo = np.array([-0.25, -0.26, -0.04]); hi = np.array([0.42, 0.28, 1.66])
xs, ys, zs = [np.arange(a, b, ST) for a, b in zip(lo, hi)]
G = np.stack(np.meshgrid(xs, ys, zs, indexing="ij"), -1).reshape(-1, 3).astype(np.float32)
occ = np.ones(len(G), bool)
SL = 1  # slack px (mask dilation) to absorb antialias / calibration noise
MD = [nd.binary_dilation(m, iterations=SL) for m in MS] if SL else MS
for k in list(range(0, 250, 2)):
    idx = np.nonzero(occ)[0]
    x, y, _ = project(G[idx], cam, A[k]); xi, yi = np.round(x - 0.5).astype(int), np.round(y - 0.5).astype(int)
    ok = (xi >= 0) & (xi < W0) & (yi >= 0) & (yi < H0)
    ins = np.zeros(len(idx), bool); ins[ok] = MD[k][yi[ok], xi[ok]]
    occ[idx[~ins]] = False
vol = occ.reshape(len(xs), len(ys), len(zs))
np.savez_compressed("ref/hull.npz", vol=np.packbits(vol), shape=vol.shape, lo=lo, step=ST)
v, f, _, _ = measure.marching_cubes(np.pad(vol, 1).astype(np.float32), 0.5)
v = (v - 1) * ST + lo
with open("ref/hull.obj", "w") as fo:
    for a in v: fo.write(f"v {a[0]:.5f} {a[1]:.5f} {a[2]:.5f}\n")
    for t in f: fo.write(f"f {t[0]+1} {t[2]+1} {t[1]+1}\n")
print("hull voxels", vol.sum(), "verts", len(v), "bbox", v.min(0).round(3), v.max(0).round(3))
