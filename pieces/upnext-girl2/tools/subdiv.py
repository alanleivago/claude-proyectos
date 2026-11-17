"""Midpoint-subdivide (1 -> 4 triangles) the faces of chosen parts. python tools/subdiv.py <in.npz> <out.npz> face[,uarmR...]"""
import sys, numpy as np
D = dict(np.load(sys.argv[1], allow_pickle=True)); V, F, C, P = D["V"], D["F"], D["C"], D["P"]; names = list(D["names"])
sel = np.isin(P, [names.index(p) for p in sys.argv[3].split(",")])
Vl = list(V); mid = {}


def m(a, b):
    k = (min(a, b), max(a, b))
    if k not in mid: mid[k] = len(Vl); Vl.append(0.5 * (V[a] + V[b]))
    return mid[k]


NF, NC, NP = [], [], []
for f, c, p, s in zip(F, C, P, sel):
    if not s: NF.append(f); NC.append(c); NP.append(p); continue
    a, b, cc = f; ab, bc, ca = m(a, b), m(b, cc), m(cc, a)
    for t in ([a, ab, ca], [ab, b, bc], [ca, bc, cc], [ab, bc, ca]): NF.append(t); NC.append(c); NP.append(p)
# keep each part's vertices contiguous: reorder vertices by part (rings of tubes stay first within their part)
NF = np.array(NF); NP = np.array(NP); Vn = np.array(Vl)
vpart = np.full(len(Vn), 10 ** 6);
for f, p in zip(NF, NP): vpart[f] = np.minimum(vpart[f], p)
order = np.argsort(vpart, kind="stable"); inv = np.empty_like(order); inv[order] = np.arange(len(order))
D.update(V=Vn[order], F=inv[NF], C=np.array(NC), P=NP)
for k in ("FUV", "FMAT"): D.pop(k, None)
np.savez(sys.argv[2], **D); print("subdivided", sel.sum(), "faces ->", len(NF), "total;", len(Vn), "verts")
