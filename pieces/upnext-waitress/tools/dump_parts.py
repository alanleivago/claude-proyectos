"""blender -b orig.blend --python dump_parts.py -- <out.json>   dump each loose part: verts, faces(+uv, mat)."""
import sys, json, bpy, bmesh

out = sys.argv[sys.argv.index("--") + 1]
ob = bpy.data.objects["waitress_orig"]
me = ob.data
bm = bmesh.new(); bm.from_mesh(me)
uvl = bm.loops.layers.uv.active
bm.verts.ensure_lookup_table()
# components
par = list(range(len(bm.verts)))
def f(a):
    while par[a] != a:
        par[a] = par[par[a]]; a = par[a]
    return a
for e in bm.edges:
    par[f(e.verts[0].index)] = f(e.verts[1].index)
D = {"verts": [list(v.co) for v in bm.verts], "faces": []}
for fc in bm.faces:
    D["faces"].append({"v": [v.index for v in fc.verts], "uv": [list(l[uvl].uv) for l in fc.loops],
                       "mat": fc.material_index, "comp": f(fc.verts[0].index)})
D["mats"] = [m.name for m in me.materials]
json.dump(D, open(out, "w"))
print("DUMP ok", len(D["faces"]))
