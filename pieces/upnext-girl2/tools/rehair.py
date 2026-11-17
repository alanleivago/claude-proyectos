"""Rebuild the hair shell's inner surface as a 6 mm inward offset of its (fitted) outer surface. in-place npz."""
import sys, numpy as np
D = dict(np.load(sys.argv[1], allow_pickle=True)); V = D["V"].copy(); F = D["F"]; P = D["P"]; names = list(D["names"])
hp = names.index("hair"); fs = F[P == hp]; lo, hi = fs.min(), fs.max() + 1; n0 = (hi - lo) // 2
outer = fs[(fs < lo + n0).all(1)]
fn = np.cross(V[outer[:, 1]] - V[outer[:, 0]], V[outer[:, 2]] - V[outer[:, 0]])
vn = np.zeros_like(V); np.add.at(vn, outer[:, 0], fn); np.add.at(vn, outer[:, 1], fn); np.add.at(vn, outer[:, 2], fn)
vn /= np.linalg.norm(vn, axis=1, keepdims=True) + 1e-12
V[lo + n0:hi] = V[lo:lo + n0] - vn[lo:lo + n0] * 0.006
D["V"] = V; np.savez(sys.argv[2] if len(sys.argv) > 2 else sys.argv[1], **D); print("hair inner rebuilt", n0)
