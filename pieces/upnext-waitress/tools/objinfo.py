"""Inspect the waitress OBJ: connected components, bboxes, material, uv bbox (px)."""
import sys
from collections import defaultdict

V, VT, F = [], [], []
mat = None
for line in open(sys.argv[1]):
    t = line.split()
    if not t:
        continue
    if t[0] == 'v':
        V.append(tuple(map(float, t[1:4])))
    elif t[0] == 'vt':
        VT.append(tuple(map(float, t[1:3])))
    elif t[0] == 'usemtl':
        mat = t[1][-2:]
    elif t[0] == 'f':
        vs = [int(x.split('/')[0]) - 1 for x in t[1:]]
        ts = [int(x.split('/')[1]) - 1 for x in t[1:]]
        F.append((vs, ts, mat))

par = list(range(len(V)))
def find(a):
    while par[a] != a:
        par[a] = par[par[a]]
        a = par[a]
    return a
for vs, _, _ in F:
    for v in vs[1:]:
        par[find(v)] = find(vs[0])
comp = defaultdict(list)
for i, (vs, ts, m) in enumerate(F):
    comp[find(vs[0])].append(i)
print('verts', len(V), 'faces', len(F), 'components', len(comp))
xs = [v[0] for v in V]; ys = [v[1] for v in V]; zs = [v[2] for v in V]
print('bbox x', min(xs), max(xs), 'y', min(ys), max(ys), 'z', min(zs), max(zs))
rows = []
for k, fl in comp.items():
    vids = sorted({v for i in fl for v in F[i][0]})
    P = [V[v] for v in vids]
    uv = [VT[t] for i in fl for t in F[i][1]]
    mats = sorted({F[i][2] for i in fl})
    bb = [(min(p[a] for p in P), max(p[a] for p in P)) for a in range(3)]
    ub = (min(u[0] for u in uv) * 256, max(u[0] for u in uv) * 256,
          (1 - max(u[1] for u in uv)) * 128, (1 - min(u[1] for u in uv)) * 128)
    rows.append((bb[1][1], k, len(fl), len(vids), mats, bb, ub))
for r in sorted(rows, reverse=True):
    _, k, nf, nv, mats, bb, ub = r
    print(f'comp f={nf:3d} v={nv:3d} mat={mats} x[{bb[0][0]:.3f},{bb[0][1]:.3f}] y[{bb[1][0]:.3f},{bb[1][1]:.3f}] z[{bb[2][0]:.3f},{bb[2][1]:.3f}] uvpx x{ub[0]:.0f}-{ub[1]:.0f} y{ub[2]:.0f}-{ub[3]:.0f}')
