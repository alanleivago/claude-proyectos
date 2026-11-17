"""Per-bone rigid ICP of our posed pieces against his visual hull -> target_<out>.json (armature-space pose matrices).
python icp.py <state_tag> <hull_obj> <out>"""
import sys, json, numpy as np
from scipy.spatial import cKDTree
st = json.load(open(f"state_{sys.argv[1]}.json")); hull_obj = sys.argv[2]; out = sys.argv[3]
H = np.array([[float(x) for x in l.split()[1:4]] for l in open(hull_obj) if l.startswith("v ")])
rng = np.random.default_rng(0); H = H[rng.choice(len(H), min(40000, len(H)), replace=False)]
B = {k: {"rest": np.array(v["rest"]), "pose": np.array(v["pose"]), "parent": v["parent"]} for k, v in st["bones"].items()}
ORDER = ["Pelvis", "Chest", "Neck", "Head", "UpperArm.L", "Forearm.L", "Hand.L", "UpperArm.R", "Forearm.R", "Hand.R",
         "Thigh.L", "Calf.L", "Foot.L", "Thigh.R", "Calf.R", "Foot.R"]
CHILD = {}
for k, v in B.items():
    if v["parent"]: CHILD.setdefault(v["parent"], []).append(k)
def desc(b):
    out = [b]
    for c in CHILD.get(b, []): out += desc(c)
    return out


def samples(p, n_per_area=60):
    V = np.array(p["verts"]); pts = []
    for f in p["faces"]:
        for i in range(1, len(f) - 1):
            a, b, c = V[f[0]], V[f[i]], V[f[i + 1]]
            ar = np.linalg.norm(np.cross(b - a, c - a)) / 2; n = max(3, int(ar * n_per_area))
            r = rng.random((n, 2)); m = r.sum(1) > 1; r[m] = 1 - r[m]
            pts.append(a + r[:, :1] * (b - a) + r[:, 1:] * (c - a))
    return np.concatenate(pts)


REST = {name: samples(p) for name, p in st["pieces"].items()}
PB = {name: p["bone"] for name, p in st["pieces"].items()}
def posed(name):
    b = B[PB[name]]; A = b["pose"] @ np.linalg.inv(b["rest"]); P = REST[name]
    return P @ A[:3, :3].T + A[:3, 3]


def assign():
    allp, lab = [], []
    for n in REST: q = posed(n); allp.append(q); lab += [n] * len(q)
    allp = np.concatenate(allp); lab = np.array(lab)
    d, i = cKDTree(allp).query(H)
    return {n: H[(lab[i] == n) & (d < 0.7)] for n in REST}


def kabsch_pivot(P, Q, pivot, trans=False):
    if trans:
        cp, cq = P.mean(0), Q.mean(0)
    else:
        cp = cq = pivot
    X, Y = P - cp, Q - cq
    U, S, Vt = np.linalg.svd(X.T @ Y); D = np.eye(3); D[2, 2] = np.sign(np.linalg.det(Vt.T @ U.T))
    R = Vt.T @ D @ U.T
    M = np.eye(4); M[:3, :3] = R; M[:3, 3] = cq - R @ cp
    return M


log = []
for it in range(3):
    seg = assign()
    for b in ORDER:
        names = [n for n in REST if PB[n] == b]
        if b == "Calf.L" or b == "Calf.R": names = [n for n in REST if PB[n] == b]
        if not names: continue
        hq = np.concatenate([seg[n] for n in names]) if names else np.zeros((0, 3))
        if len(hq) < 30: continue
        pivot = B[b]["pose"][:3, 3]
        Mtot = np.eye(4)
        for _ in range(12):
            P = np.concatenate([posed(n) for n in names])
            P = P @ Mtot[:3, :3].T + Mtot[:3, 3]
            d1, i1 = cKDTree(hq).query(P); d2, i2 = cKDTree(P).query(hq)
            src = np.concatenate([P, P[i2]]); dst = np.concatenate([hq[i1], hq])
            w = np.concatenate([d1 < 0.6, d2 < 0.6])
            M = kabsch_pivot(src[w], dst[w], pivot, trans=(b == "Pelvis"))
            Mtot = M @ Mtot
        ang = np.degrees(np.arccos(np.clip((np.trace(Mtot[:3, :3]) - 1) / 2, -1, 1)))
        for c in desc(b): B[c]["pose"] = Mtot @ B[c]["pose"]
        log.append((it, b, round(float(ang), 2), len(hq)))
print(log)
json.dump({k: v["pose"].tolist() for k, v in B.items()}, open(f"target_{out}.json", "w"))
for n, s in assign().items(): np.save(f"seg_{n}.npy", s)
