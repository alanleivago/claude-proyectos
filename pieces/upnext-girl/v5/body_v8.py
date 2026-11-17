"""v8 body pieces in his breakdown: Neck = 6-sided collar (his Cube.006: 2 rings + top, 16-18 tris), Waist = the
band between top and skirt (his 'Waist'), the torso stops above it. python body_v8.py"""
import json, numpy as np
P = json.load(open("pieces.json"))


def ring(z, w, d, cy, n, k=0.6):
    if n == 6: pts = [(w * k, -d), (w, 0), (w * k, d), (-w * k, d), (-w, 0), (-w * k, -d)]
    else: pts = [(w * k, -d), (w, -d * k), (w, d * k), (w * k, d), (-w * k, d), (-w, d * k), (-w, -d * k), (-w * k, -d)]
    return [[round(x, 4), round(y + cy, 4), z] for x, y in pts]


def tube(rings, cap_top=False):
    n = len(rings[0]); V = [p for r in rings for p in r]; F = []
    for i in range(len(rings) - 1):
        for j in range(n): F.append([i * n + j, i * n + (j + 1) % n, (i + 1) * n + (j + 1) % n, (i + 1) * n + j])
    if cap_top: F.append([len(rings) * n - n + j for j in range(n)][::-1])
    return V, F


# Neck: his orange collar, wide at the shawl, a bit narrower under the chin
V, F = tube([ring(0.86, 0.78, 0.66, -0.04, 6), ring(1.52, 0.64, 0.56, -0.02, 6)], cap_top=True)
P["Neck"] = dict(bone="Neck", verts=V, faces=F)
# Waist band: between the torso (bottom z -0.72) and the skirt top (-1.00)
V, F = tube([ring(-0.70, 0.86, 0.60, 0.0, 8, 0.62), ring(-1.06, 0.82, 0.58, 0.0, 8, 0.62)])
P["Waist"] = dict(bone="Pelvis", verts=V, faces=F)
# Torso: bottom ring lifted to the waist top
T = np.array(P["Torso"]["verts"])
low = T[:, 2] < -0.9
T[low, 2] = -0.72; T[low, 0] *= 1.0
P["Torso"]["verts"] = T.round(4).tolist()
json.dump(P, open("pieces.json", "w"), indent=0)
tot = sum(sum(len(f) - 2 for f in d["faces"]) for d in P.values()); print("total tris", tot)
