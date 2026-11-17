"""Clean hair: his rows kept as regular planes (v4 hand-placed rows), each row only scaled (sx, sy) and shifted in y
to his hull cross-section, mirror-symmetric. python hairfit.py <state_tag>"""
import sys, json, numpy as np
from scipy.spatial import cKDTree, ConvexHull
st = json.load(open(f"state_{sys.argv[1]}.json"))
H = np.array([[float(x) for x in l.split()[1:4]] for l in open("hull_hip.obj") if l.startswith("v ")])
P = json.load(open("pieces.json")); A0 = json.load(open("pieces_v4init.json"))
rng = np.random.default_rng(2)
def A_of(name):
    b = st["bones"][st["pieces"][name]["bone"]]; return np.array(b["pose"]) @ np.linalg.inv(np.array(b["rest"]))
allp, lab = [], []
for name, p in st["pieces"].items():
    V = np.array(p["verts"]); A = A_of(name)
    for f in p["faces"]:
        for i in range(1, len(f) - 1):
            a, b, c = V[f[0]], V[f[i]], V[f[i + 1]]; n = max(4, int(np.linalg.norm(np.cross(b - a, c - a)) * 80))
            r = rng.random((n, 2)); m = r.sum(1) > 1; r[m] = 1 - r[m]
            q = (a + r[:, :1] * (b - a) + r[:, 1:] * (c - a)) @ A[:3, :3].T + A[:3, 3]; allp.append(q); lab += [name] * len(q)
allp = np.concatenate(allp); lab = np.array(lab); d, i = cKDTree(allp).query(H)
seg = H[(lab[i] == "Hair") & (d < 0.8)]
Ai = np.linalg.inv(A_of("Hair")); segr = seg @ Ai[:3, :3].T + Ai[:3, 3]
V = np.array(A0["Hair"]["verts"]); order = np.argsort(-V[:, 2]); rows = [order[k:k + 8] for k in range(0, len(V), 8)]
out = V.copy(); log = []
for ri, r in enumerate(rows):
    z = V[r, 2].mean()
    if ri == 0: log.append('top kept'); continue
    sl = segr[np.abs(segr[:, 2] - z) < 0.12]
    if len(sl) < 20: log.append(None); continue
    q2 = sl[:, :2]; hv = q2[ConvexHull(q2).vertices]; c = q2.mean(0)
    tgt = []
    for vi in r:
        dv = V[vi, :2] - np.array([0, V[r, 1].mean()]); ang = np.arctan2(dv[1], dv[0]); dvec = np.array([np.cos(ang), np.sin(ang)])
        best = None
        for j in range(len(hv)):
            a, b = hv[j], hv[(j + 1) % len(hv)]; M = np.array([dvec, a - b]).T
            if abs(np.linalg.det(M)) < 1e-9: continue
            t, s = np.linalg.solve(M, a - c)
            if t > 0 and 0 <= s <= 1: best = t if best is None else max(best, t)
        tgt.append(c + dvec * best if best else V[vi, :2])
    tgt = np.array(tgt); x, y = V[r, 0], V[r, 1]
    sx = float((x * tgt[:, 0]).sum() / max(1e-9, (x * x).sum()))
    Ay = np.stack([y, np.ones_like(y)], 1); sy, cy = np.linalg.lstsq(Ay, tgt[:, 1], rcond=None)[0]
    sx = np.clip(sx, 0.85, 1.25); sy = np.clip(sy, 0.85, 1.25); cy = float(np.clip(cy, -0.25, 0.25))
    out[r, 0] = x * sx; out[r, 1] = y * sy + cy
    log.append((round(z, 2), round(sx, 3), round(float(sy), 3), round(float(cy), 3)))
P["Hair"] = dict(A0["Hair"]); P["Hair"]["verts"] = np.round(out, 4).tolist()
json.dump(P, open("pieces.json", "w"), indent=0); print(log)
