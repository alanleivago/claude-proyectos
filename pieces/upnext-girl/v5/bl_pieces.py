"""Blender: pieces.json <-> objects in collection GirlV5 (rigid, one bone per piece, parented to Armature).
exec(open(r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/bl_pieces.py").read()); materialize()"""
import bpy, json, bmesh
from mathutils import Vector
PJ = r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/pieces.json"
FLAT = {"Cone": (250, 209, 160), "Hair": (247, 184, 101), "HairLock": (247, 184, 101), "Head": (250, 209, 160), "Nose": (250, 209, 160), "Ears": (250, 209, 160),
        "Neck": (211, 105, 39), "Torso": (211, 105, 39), "Sleeves": (83, 57, 34), "Waist": (46, 53, 22), "Skirt": (60, 84, 24),
        "LegUpper": (250, 209, 160), "LegLower": (250, 209, 160), "Boot": (81, 50, 62), "Foot": (81, 50, 62),
        "UpperArm": (250, 209, 160), "Forearm": (250, 209, 160), "Hand": (250, 209, 160)}


def materialize(names=None):
    P = json.load(open(PJ))
    col = bpy.data.collections.get("GirlV5") or bpy.data.collections.new("GirlV5")
    if col.name not in bpy.context.scene.collection.children: bpy.context.scene.collection.children.link(col)
    arm = bpy.data.objects["Armature"]
    for name, d in P.items():
        if names and name not in names: continue
        me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in d["verts"]], [], [tuple(f) for f in d["faces"]])
        me.validate(); me.update()
        o = bpy.data.objects.get(name)
        if o: old = o.data; o.data = me; bpy.data.meshes.remove(old)
        else: o = bpy.data.objects.new(name, me); col.objects.link(o)
        o.parent = arm; o.matrix_parent_inverse.identity(); o.matrix_world.identity()
        o["col"] = FLAT[name.split(".")[0]]
        if "fparts" in d:
            PC = {"hair": (247, 184, 101), "head": (250, 209, 160)}
            o["fcol"] = [c for fp in d["fparts"] for c in PC.get(fp, o["col"])]
        elif "fcol" in o.keys(): del o["fcol"]
        o.vertex_groups.clear(); g = o.vertex_groups.new(name=d["bone"]); g.add(list(range(len(d["verts"]))), 1.0, "REPLACE")
        m = o.modifiers.get("Armature") or o.modifiers.new("Armature", "ARMATURE"); m.object = arm
        mat = bpy.data.materials.get("flat_" + name.split(".")[0]) or bpy.data.materials.new("flat_" + name.split(".")[0])
        c = FLAT[name.split(".")[0]]; mat.diffuse_color = (*(pow(x / 255, 2.2) for x in c), 1)
        me.materials.append(mat); o.color = mat.diffuse_color
    return len(P)


def read_back(names=None):
    """objects (rest coordinates) -> pieces.json"""
    P = json.load(open(PJ))
    for name in P:
        if names and name not in names: continue
        o = bpy.data.objects.get(name)
        if not o: continue
        P[name]["verts"] = [[round(x, 4) for x in v.co] for v in o.data.vertices]
        if len(o.data.polygons) != len(P[name]["faces"]): P[name].pop("fparts", None)
        P[name]["faces"] = [list(p.vertices) for p in o.data.polygons]
    json.dump(P, open(PJ, "w"), indent=0)
