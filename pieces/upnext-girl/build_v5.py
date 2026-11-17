"""upnext-girl v5: his piece-by-piece model (v5/pieces.json, one rigid piece per bone, his outliner breakdown) ->
textured, rigged 'Girl' mesh. Vertices of every piece were placed against his turntable (12:14-12:24, calibrated
camera, visual hull) and his rest frame (11:29); see v5/*.py. Texture, face atlas and rig as in build.py.
exec in Blender:  exec(open(r"F:/Claude Proyectos/pieces/upnext-girl/build_v5.py").read())"""
import bpy, bmesh, json, os, math
import numpy as np
from mathutils import Vector
_src = open(r"F:/Claude Proyectos/pieces/upnext-girl/build.py").read().split('if __name__ == "__main__" or True:')[0]
exec(_src, globals())
PJ = os.path.join(ROOT, "v5", "pieces.json")
# his face measured at 12:23 (same camera): eye span +18 %, iris height -15 % -> face cell 1.18x wider (face plane widened
# with it) and 0.85x shorter around the eye row (z 2.55), so eyes, mouth and face area match his within 5 %
FACE_K = 0.834 * 1.18
FZ0, FZ1 = 2.485 + (1.45 - 2.55) * 0.85, 2.485 + (3.25 - 2.55) * 0.85
PMAP = {"Head": "head", "Hair": "hair", "HairLock": "hair", "Cone": "nose", "Nose": "nose", "Ears": "ear", "Torso": "top", "Skirt": "skirt", "Neck": "scarf",
        "Sleeves": "shawl", "LegUpper": "leg", "LegLower": "leg", "Boot": "boot", "Foot": "foot", "UpperArm": "arm",
        "Forearm": "arm", "Hand": "hand", "Waist": "top"}


_paint_island_v4 = paint_island


def paint_island(d):
    """v4 painting + his scarf: lower roll in the darker orange (11:29), shawl tails with stripes at their tips"""
    out = _paint_island_v4(d)
    if d["part"] in ("head", "ear") and d["cls"] in "SBU": out[:] = P["skin_b"]      # every face not looking forward: dark tone
    if d["part"] == "scarf" and d["cls"] in "FS":
        h = d["h"] + 2; vb = (np.arange(h) - 1 + 0.5) / d["h"]; Bv = d["b1"] - vb * (d["b1"] - d["b0"])
        out[Bv < 1.02] = P["scarf_d"]; out[Bv >= 1.02] = P["scarf"]
    if d["part"] == "shawl" and d["cls"] == "F":       # tails: plain brown, three yellow/green stripes at the tips
        h = d["h"] + 2; vb = (np.arange(h) - 1 + 0.5) / d["h"]; Bv = d["b1"] - vb * (d["b1"] - d["b0"])
        for r, z in enumerate(Bv):
            if z > -0.22: out[r] = P["shawl"]
            else:
                k = int((-0.22 - z) / 0.075) % 3
                out[r] = (P["str_y"], P["str_g"], P["str_y"])[k] if (-0.22 - z) % 0.075 < 0.05 else P["shawl"]
    return out


def is_face(part, f):
    if part == "nose": return True
    if part != "head" or f.normal.y > -0.6: return False
    c = f.calc_center_median()
    return FZ0 - 0.25 < c.z < FZ1 + 0.05 and abs(c.x) < FACE_K + 0.1


def build_mesh_v5():
    P = json.load(open(PJ)); B = Builder(); vb = {}
    for name, d in P.items():
        s = name.split("."); part = PMAP[s[0]] + (s[1] if len(s) > 1 else "")
        vs = [B.bm.verts.new(v) for v in d["verts"]]
        for v in vs: vb[v] = {d["bone"]: 1.0}
        # knee: the shared joint ring is weighted 50/50 (his MML2 bridge), so bent joints stay closed
        # elbows stay rigid and overlap (upper arm runs 0.18 past the joint, forearm tucks 0.18 inside it)
        J = {"LegUpper": (2, 1, "Calf"), "LegLower": (2, -1, "Thigh")}
        if s[0] in J:
            ax, e, other = J[s[0]]; sg = 1 if s[1] == "L" else -1
            e = e * (sg if ax == 0 else 1)
            for i in sorted(range(len(vs)), key=lambda i: d["verts"][i][ax] * e)[:4]:
                vb[vs[i]] = {d["bone"]: 0.5, other + "." + s[1]: 0.5}
        for fi, f in enumerate(d["faces"]):
            fp = d["fparts"][fi] if "fparts" in d else part
            try: B.bm.faces.new([vs[i] for i in f])[B.part] = B.pid(fp)
            except ValueError: pass
    bm = B.bm
    for v in [v for v in bm.verts if not v.link_faces]: vb.pop(v, None); bm.verts.remove(v)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    cen = {}
    for f in bm.faces: cen.setdefault(f[B.part], []).append(f.calc_center_median())
    cen = {k: sum(v, Vector()) / len(v) for k, v in cen.items()}
    for f in bm.faces:
        name = B.names[f[B.part]]
        c0 = cen[f[B.part]] if name not in ("hair", "head", "nose", "ear") else Vector((0, 0.1, 2.7))
        if f.normal.dot(f.calc_center_median() - c0) < 0: f.normal_flip()
    bm.verts.index_update()
    return B, [vb[v] for v in bm.verts]


def build_v5():
    os.makedirs(TEX, exist_ok=True)
    o = bpy.data.objects.get("Girl")
    if o: bpy.data.objects.remove(o)
    B, vbones = build_mesh_v5()
    me = bpy.data.meshes.new("Girl")
    isl = make_uvs(B, me)
    mat_idx = []
    for f in B.bm.faces:
        part = B.names[f[B.part]]
        mat_idx.append((1 if f.calc_center_median().z >= FACE_SPLIT_Z else 2) if is_face(part, f) else 0)
    shade = shade_factor(B)
    B.bm.to_mesh(me); B.bm.free()
    for p, mi in zip(me.polygons, mat_idx): p.material_index = mi
    ob = bpy.data.objects.new("Girl", me); bpy.context.scene.collection.objects.link(ob)
    body_img = save_png(paint_body(isl) * shade[..., None], "body.png")
    me.materials.append(material("Girl", None, body_img))
    me.materials.append(material("face_eyes", os.path.join(TEX, "face_eyes.png")))
    me.materials.append(material("face_mouth", os.path.join(TEX, "face_mouth.png")))
    arm = bpy.data.objects["Armature"]
    for i, wd in enumerate(vbones):
        for b, w in wd.items():
            (ob.vertex_groups.get(b) or ob.vertex_groups.new(name=b)).add([i], w, "REPLACE")
    ob.parent = arm; mod = ob.modifiers.new("Armature", "ARMATURE"); mod.object = arm
    col = bpy.data.collections.get("GirlV5")
    if col:
        for p in col.objects: p.hide_render = True; p.hide_set(True)
    json.dump(isl, open(os.path.join(ROOT, "out", "uv_layout.json"), "w"), indent=0)
    tris = sum(len(p.vertices) - 2 for p in me.polygons)
    print("GIRL v5 tris", tris, "verts", len(me.vertices))
    return ob


GIRL = build_v5()
