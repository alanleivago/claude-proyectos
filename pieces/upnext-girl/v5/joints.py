"""Knee and elbow: the two rigid pieces share one joint ring (same 4 vertices, averaged), weighted 50/50 at build time."""
import json, numpy as np
P = json.load(open("pieces.json"))
def snap(a, b, axis, a_end, b_end):
    A = np.array(P[a]["verts"]); B = np.array(P[b]["verts"])
    ia = np.argsort(A[:, axis] * a_end)[:4]; ib = np.argsort(B[:, axis] * b_end)[:4]
    ca, cb = A[ia].mean(0), B[ib].mean(0); c = (ca + cb) / 2
    oth = [i for i in range(3) if i != axis]
    ang = lambda Q, cc: np.arctan2(Q[:, oth[1]] - cc[oth[1]], Q[:, oth[0]] - cc[oth[0]])
    aa, ab = ang(A[ia], ca), ang(B[ib], cb)
    for k, i in enumerate(ia):
        j = ib[np.argmin(np.abs(np.angle(np.exp(1j * (ab - aa[k])))))]
        m = (A[i] - ca + B[j] - cb) / 2 + c
        A[i] = m; B[j] = m
    P[a]["verts"] = A.round(4).tolist(); P[b]["verts"] = B.round(4).tolist()
    return float(np.linalg.norm(ca - cb))
for s in "LR":
    sg = 1 if s == "L" else -1
    print(s, "knee", snap("LegUpper." + s, "LegLower." + s, 2, 1, -1),     # thigh bottom (lowest z) / shin top (highest z)
          "elbow", snap("UpperArm." + s, "Forearm." + s, 0, -sg, sg))       # upper arm far end / forearm near end
json.dump(P, open("pieces.json", "w"), indent=0)
