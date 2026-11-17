"""split his hull mesh into per-piece segments (nearest posed piece) -> hullseg/<piece>.obj (posed world)"""
import sys, os, json, numpy as np
from scipy.spatial import cKDTree
st = json.load(open(f"state_{sys.argv[1]}.json")); hull_obj = sys.argv[2]
os.makedirs("hullseg", exist_ok=True)
V, F = [], []
for l in open(hull_obj):
    if l.startswith("v "): V.append([float(x) for x in l.split()[1:4]])
    elif l.startswith("f "): F.append([int(x) - 1 for x in l.split()[1:4]])
V = np.array(V); F = np.array(F); C = V[F].mean(1)
rng = np.random.default_rng(0)
allp, lab = [], []
for name, p in st["pieces"].items():
    b = st["bones"][p["bone"]]; A = np.array(b["pose"]) @ np.linalg.inv(np.array(b["rest"]))
    P = np.array(p["verts"]); pts = []
    for f in p["faces"]:
        for i in range(1, len(f) - 1):
            a, bb, c = P[f[0]], P[f[i]], P[f[i + 1]]
            n = max(4, int(np.linalg.norm(np.cross(bb - a, c - a)) * 80))
            r = rng.random((n, 2)); m = r.sum(1) > 1; r[m] = 1 - r[m]
            pts.append(a + r[:, :1] * (bb - a) + r[:, 1:] * (c - a))
    q = np.concatenate(pts) @ A[:3, :3].T + A[:3, 3]; allp.append(q); lab += [name] * len(q)
allp = np.concatenate(allp); lab = np.array(lab)
d, i = cKDTree(allp).query(C); L = lab[i]
for name in st["pieces"]:
    m = (L == name) & (d < 0.8)
    if m.sum() < 4: continue
    fs = F[m]; used = np.unique(fs); remap = {v: k for k, v in enumerate(used)}
    with open(f"hullseg/{name}.obj", "w") as fo:
        for v in V[used]: fo.write("v %.4f %.4f %.4f\n" % tuple(v))
        for t in fs: fo.write("f %d %d %d\n" % tuple(remap[x] + 1 for x in t))
    print(name, m.sum())
