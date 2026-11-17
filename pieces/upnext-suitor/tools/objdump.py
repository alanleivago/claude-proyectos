"""python -I tools/objdump.py <obj> <out.json>  -> verts, faces (v, uv), comp ids (pure python reader)"""
import sys, json
V, VT, F = [], [], []
for line in open(sys.argv[1]):
    t = line.split()
    if not t: continue
    if t[0] == 'v': V.append([float(x) for x in t[1:4]])
    elif t[0] == 'vt': VT.append([float(x) for x in t[1:3]])
    elif t[0] == 'f':
        F.append(([int(x.split('/')[0]) - 1 for x in t[1:]], [int(x.split('/')[1]) - 1 for x in t[1:]]))
par = list(range(len(V)))
def find(a):
    while par[a] != a: par[a] = par[par[a]]; a = par[a]
    return a
for vs, _ in F:
    for v in vs[1:]: par[find(v)] = find(vs[0])
json.dump({"verts": V, "faces": [{"v": vs, "uv": [VT[t] for t in ts], "comp": find(vs[0])} for vs, ts in F]}, open(sys.argv[2], "w"))
print("faces", len(F), "quads", sum(len(f[0]) == 4 for f in F))
