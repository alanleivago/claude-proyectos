"""Assemble the decimated parts into the working npz (V, F, C, P, names, cam, alphas) + closed hair shell + the rig
joints measured on the dense fitted mesh (the low-poly parts have no ring structure any more).
python tools/lowpoly.py <dense_fixed.npz> <parts.npz> <out.npz>"""
import sys, json, numpy as np
from collections import defaultdict
sys.path.insert(0, "tools")
import joints as JT
D = dict(np.load(sys.argv[1], allow_pickle=True)); L = np.load(sys.argv[2], allow_pickle=True)
names = [str(n) for n in D["names"]]
J = JT.estimate(D)
for k_, v_ in json.loads(str(D["hips"])).items(): J[k_] = np.array(v_)
J["pelvis"] = 0.5 * (J["hipL"] + J["hipR"]) + [0, 0, -0.035]
CLS = {n: int(np.bincount(D["C"][D["P"] == i]).argmax()) for i, n in enumerate(names)}
Vs, Fs, Cs, Ps = [], [], [], []; off = 0
for i, n in enumerate(names):
    V, F = L[n + "_V"], L[n + "_F"]
    if n == "hair":                                   # closed shell: outer + 6 mm inward offset + rim
        fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
        vn = np.zeros_like(V); np.add.at(vn, F[:, 0], fn); np.add.at(vn, F[:, 1], fn); np.add.at(vn, F[:, 2], fn)
        vn /= np.linalg.norm(vn, axis=1, keepdims=True) + 1e-12
        n0 = len(V); Vi = V - vn * 0.006
        cnt = defaultdict(int); dirn = {}
        for f in F:
            for a, b in ((f[0], f[1]), (f[1], f[2]), (f[2], f[0])): k = (min(a, b), max(a, b)); cnt[k] += 1; dirn[k] = (a, b)
        rim = []
        for k, c in cnt.items():
            if c == 1: a, b = dirn[k]; rim += [[b, a, a + n0], [b, a + n0, b + n0]]
        F = np.vstack([F, F[:, ::-1] + n0, np.array(rim, int).reshape(-1, 3)]); V = np.vstack([V, Vi])
    Vs.append(V); Fs.append(F + off); off += len(V)
    Cs.append(np.full(len(F), CLS[n])); Ps.append(np.full(len(F), i))
D.update(V=np.vstack(Vs), F=np.vstack(Fs), C=np.concatenate(Cs), P=np.concatenate(Ps), names=np.array(names),
         joints=json.dumps({k: np.asarray(v).tolist() for k, v in J.items()}))
for k in ("FUV", "FMAT"): D.pop(k, None)
np.savez(sys.argv[3], **D)
print("low poly:", len(D["F"]), "tris,", len(D["V"]), "verts;", {n: int((D["P"] == i).sum()) for i, n in enumerate(names)})
