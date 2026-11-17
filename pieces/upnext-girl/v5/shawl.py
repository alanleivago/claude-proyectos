"""His Sleeves (brown shawl: collar cape, back flap, knot, two striped tails) and Neck (orange scarf), vertex by vertex
from his frames 11:29 (front), 12:16 (side), 12:17 (back), 12:23 (3/4). Rest coordinates, she faces -Y, +X = her left."""
import json


def ring(z, w, d, cy=0.0, k=0.62, zs=None):
    pts = [(w * k, -d), (w, -d * k), (w, d * k), (w * k, d), (-w * k, d), (-w, d * k), (-w, -d * k), (-w * k, -d)]
    return [(x, y + cy, (zs[i] if zs else z)) for i, (x, y) in enumerate(pts)]


def tube(rings):
    V = [v for r in rings for v in r]; F = []
    for i in range(len(rings) - 1):
        for j in range(8):
            F.append([i * 8 + j, i * 8 + (j + 1) % 8, (i + 1) * 8 + (j + 1) % 8, (i + 1) * 8 + j])
    return V, F


def box(quad, t):
    """thin box: quad (4 front points, counter-clockwise seen from the front) pushed back by vector t"""
    a = [list(p) for p in quad]; b = [[p[0] + t[0], p[1] + t[1], p[2] + t[2]] for p in quad]
    V = a + b
    F = [[0, 1, 2, 3], [7, 6, 5, 4], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]]
    return V, F


def merge(parts):
    V, F = [], []
    for v, f in parts:
        o = len(V); V += [list(map(float, p)) for p in v]; F += [[i + o for i in q] for q in f]
    return V, F


# Neck = orange scarf: wide roll under the chin (front 11:29: half width 0.59 under the chin, 0.82 where it meets the shawl)
neck = tube([ring(0.82, 0.82, 0.72, -0.05, 0.7), ring(1.16, 0.70, 0.62, -0.04, 0.7), ring(1.52, 0.57, 0.50, 0.0, 0.7)])
# Sleeves = brown shawl
fz = [0.40, 0.56, 0.58, 0.60, 0.60, 0.58, 0.56, 0.40]           # front dips into the V of the knot
collar = tube([ring(1.00, 0.88, 0.76, -0.03, 0.66), ring(0.55, 1.34, 1.02, 0.0, 0.62, zs=fz)])
flap = box([(-1.00, 0.97, 0.62), (1.00, 0.97, 0.62), (0.90, 0.80, -0.86), (-0.90, 0.80, -0.86)][::-1], (0, -0.07, 0))
knot = box([(-0.17, -1.09, 0.32), (0.17, -1.09, 0.32), (0.19, -1.11, 0.62), (-0.19, -1.11, 0.62)], (0, 0.15, 0))
# the two tails leave the knot and part down-left / down-right, wide, striped tips on the dark band of the top (11:29)
tail_r = box([(-0.82, -0.93, -0.50), (-0.40, -0.96, -0.60), (0.04, -1.04, 0.36), (-0.36, -1.03, 0.42)], (0, 0.07, 0))
tail_l = box([(0.30, -0.96, -0.64), (0.72, -0.93, -0.54), (0.34, -1.03, 0.40), (-0.06, -1.04, 0.34)], (0, 0.07, 0))
P = json.load(open("pieces.json"))
P["Neck"] = dict(bone="Neck", verts=[list(v) for v in neck[0]], faces=neck[1])
V, F = merge([collar, flap, knot, tail_r, tail_l])
P["Sleeves"] = dict(bone="Chest", verts=V, faces=F)
# HairLock: her right side lock down to the jaw over the cheek (his 11:29 / 12:23) + the fringe tip at her right temple
lock = box([(-0.80, -1.09, 2.95), (-1.26, 0.20, 2.95), (-1.32, 0.20, 1.55), (-0.88, -0.99, 1.55)][::-1], (0.09, 0, 0))
tip = box([(-1.40, -0.96, 2.74), (-0.90, -1.13, 2.66), (-0.90, -1.13, 3.06)], (0, 0.12, 0)) if False else None
tipv = [(-1.42, -0.98, 2.76), (-0.92, -1.14, 2.66), (-0.92, -1.14, 3.08), (-1.36, -0.82, 2.80), (-0.92, -0.98, 2.70), (-0.92, -0.98, 3.04)]
tipf = [[0, 1, 2], [5, 4, 3], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]]
V2, F2 = merge([lock, (tipv, tipf)])
P["HairLock"] = dict(bone="Head", verts=V2, faces=F2)
json.dump(P, open("pieces.json", "w"), indent=0)
print("Neck", len(neck[0]), "Sleeves", len(V), len(F))
