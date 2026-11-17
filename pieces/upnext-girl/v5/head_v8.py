"""v8 head as he builds it (video 7:31-7:52 + wireframe at 11:29): one 'Head' object = hair helmet + faceted face
(face split on the centre line, fan of triangles around the nose base, cheek planes, V chin, salmon side panels hanging
below the jaw, fringe tip sticking out on her right), 'Cone' = the nose (a 3-sided cone, 3 tris, as at 7:52), and
'Ears' = two thick flaps. Rest coordinates, she faces -Y, +X = her left. Replaces Head/Nose/Ears/Hair/HairLock in
pieces.json. python head_v8.py"""
import json

V = {}
def v(name, p): V[name] = p
# centre line
v("T", (0, 0.20, 4.26)); v("FC", (0, -1.00, 3.92)); v("FH", (0, -1.14, 3.04)); v("N", (0, -1.17, 2.30))
v("CH", (0, -0.80, 1.45)); v("BC", (0, 1.15, 3.90)); v("BM", (0, 1.46, 2.95)); v("BL", (0, 1.42, 2.00)); v("BB", (0, 1.12, 1.55))
v("NK", (0, 0.10, 1.62))
SIDE = dict(tc=(0.95, -0.55, 3.82), tb=(0.95, 0.70, 3.85), fs=(0.86, -1.03, 3.02), s=(1.28, -0.15, 3.00),
            sb=(1.18, 1.05, 2.95), lf=(1.24, -0.62, 2.00), l=(1.28, 0.35, 2.00), lb=(1.10, 1.20, 2.00),
            bb=(0.92, 0.95, 1.55), pt=(0.94, -0.66, 1.18), pi=(0.66, -0.82, 1.62),
            e=(0.72, -1.03, 2.62), c=(0.80, -0.90, 2.07), j=(0.46, -0.85, 1.68), nk=(0.55, 0.0, 1.62))
for k, (x, y, z) in SIDE.items():
    v(k + "R", (-x, y, z)); v(k + "L", (x, y, z))
v("FT", (-1.58, -0.95, 2.93))                 # fringe tip, her right only

F = []
def half(s):
    """faces of one half (s = 'L' or 'R'); written for L (x>0) with outward winding, mirrored for R"""
    X = lambda n: n + s if n not in ("T", "FC", "FH", "N", "CH", "BC", "BM", "BL", "BB", "NK") else n
    q = [
        ("T", "FC", "tc"), ("T", "tc", "tb"), ("T", "tb", "BC"),
        ("FC", "FH", "fs", "tc"),
        ("tc", "fs", "s"), ("tc", "s", "tb"), ("tb", "s", "sb"), ("tb", "sb", "BM", "BC"),
        ("s", "lf", "l"), ("s", "l", "lb", "sb"), ("sb", "lb", "BL", "BM"),
        ("fs", "e", "c", "lf", "s"),
        ("lf", "c", "pi", "pt"),
        ("lf", "pt", "bb", "l"), ("l", "bb", "lb"), ("lb", "bb", "BB", "BL"),
        ("FH", "N", "e", "fs"), ("e", "N", "c"), ("c", "N", "j"), ("j", "N", "CH"),
        ("c", "j", "pi"), ("pi", "j", "CH", "nk"), ("pt", "pi", "nk", "bb"), ("bb", "nk", "NK", "BB"),
    ]
    for f in q:
        f = [X(n) for n in f]
        F.append(f if s == "L" else f[::-1])
half("L"); half("R")
# the faces above were written looking from outside for x>0 with the wrong handedness for some; fixed in Blender by
# recalculating normals outward (build_v5 does it per part)
F.append(["fsR", "FT", "sR"])                 # fringe tip (two-sided by the engine material)

names = list(V)
SKIN = {"N", "CH"}
fparts = ["head" if (set(f) & SKIN) or set(f) <= {"cL", "jL", "piL", "cR", "jR", "piR"} else "hair" for f in F]
head = dict(bone="Head", verts=[list(V[n]) for n in names], faces=[[names.index(n) for n in f] for f in F], fparts=fparts)
cone = dict(bone="Head", verts=[[0, -1.32, 2.31], [0, -1.13, 2.48], [0.11, -1.13, 2.22], [-0.11, -1.13, 2.22]],
            faces=[[0, 2, 1], [0, 3, 2], [0, 1, 3]])
ear = []
def box8(c, sx):
    (x0, x1), (y0, y1), (z0, z1) = c
    return [(x0, y0, z0), (x1, y0 + 0.05, z0 + 0.05), (x1, y1, z0 + 0.05), (x0, y1, z0), (x0, y0, z1), (x1, y0 + 0.05, z1 - 0.05),
            (x1, y1, z1 - 0.05), (x0, y1, z1)]
ev, ef = [], []
for sx in (1, -1):
    b = box8(((1.18 * sx, 1.52 * sx), (-0.05, 0.42), (2.20, 2.92)), sx); o = len(ev)
    ev += [list(p) for p in b]
    for f in ([0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]):
        ef.append([i + o for i in (f if sx > 0 else f[::-1])])
ears = dict(bone="Head", verts=ev, faces=ef)
P = json.load(open("pieces.json"))
for k in ("Head", "Nose", "Ears", "Hair", "HairLock"): P.pop(k, None)
P["Head"] = head; P["Cone"] = cone; P["Ears"] = ears
json.dump(P, open("pieces.json", "w"), indent=0)
tri = lambda d: sum(len(f) - 2 for f in d["faces"])
print("Head", len(head["verts"]), "v", tri(head), "tris | Cone", tri(cone), "| Ears", tri(ears))
