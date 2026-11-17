"""Re-vote per-face classes of chosen parts from his class maps (hard raster, visible pixels).
python tools/revote.py <in.npz> <out.npz> head[,neck,...]"""
import sys, json, numpy as np; sys.path.insert(0, "tools")
from raster import raster
D = dict(np.load(sys.argv[1], allow_pickle=True)); V, F, C, P = D["V"], D["F"], D["C"].copy(), D["P"]
names = list(D["names"]); parts = sys.argv[3].split(",")
cam = json.loads(str(D["cam"])) if "cam" in D else json.load(open("ref/cam1.json"))
A = D["alphas"] if "alphas" in D else np.load("ref/alphas.npy")
CL = np.load("ref/cls.npz")["c"]; S = 0.5; k = 2
votes = np.zeros((len(F), 7))
for f in range(0, 250, 3):
    fid, _, _ = raster(V, F, cam, A[f], S)
    his = CL[f][1::2, 1::2][:fid.shape[0], :fid.shape[1]]
    m = fid >= 0
    np.add.at(votes, (fid[m], his[m]), 1)
sel = np.isin(P, [names.index(p) for p in parts])
allowed = {"head": [1, 2], "neck": [1, 3]}
for p in parts:
    s = P == names.index(p); al = allowed.get(p, list(range(1, 7)))
    vv = votes[s][:, al]; has = vv.sum(1) > 2
    newc = np.array(al)[vv.argmax(1)]
    Cs = C[s]; Cs[has] = newc[has]; C[s] = Cs
    print(p, "faces", s.sum(), "voted", has.sum(), "class counts", np.bincount(C[s], minlength=7))
# report agreement per part
for i, n in enumerate(names):
    s = P == i; vv = votes[s]; tot = vv.sum()
    if tot: print(f"{n:6s} visible px {int(tot):7d}  own-class share {vv[np.arange(s.sum()), C[s]].sum() / tot:.3f}")
D["C"] = C; np.savez(sys.argv[2], **D)
