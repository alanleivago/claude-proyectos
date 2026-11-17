"""Servbot (MML1 NPC) DAE -> Blender, no Collada add-on needed (removed in Blender 5).

    blender -b --python import_servbot.py -- <ServBot.dae> <out.blend>

Builds mesh (positions, UVs, faces), the 7-joint armature and rigid vertex groups straight from the XML.
DAE is Y-up/front +Z; Blender gets (x, -z, y) so the face looks at -Y (glTF export -> +Z in three.js).
The ripped asset stays in assets/servbot (git-ignored); only this script lives in the repo."""
import sys, os, xml.etree.ElementTree as ET
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
DAE, OUT = argv[0], argv[1]
root = ET.parse(DAE).getroot()
ns = {"c": root.tag[1:root.tag.index("}")]}
fa = lambda id_: [float(x) for x in root.find(f".//c:float_array[@id='{id_}']", ns).text.split()]
P = fa("ID18"); UV = fa("ID22")
pl = root.find(".//c:polylist", ns)
idx = [int(x) for x in pl.find("c:p", ns).text.split()]
vc = [int(x) for x in pl.find("c:vcount", ns).text.split()]
conv = lambda x, y, z: (x, -z, y)
verts = [conv(*P[i:i + 3]) for i in range(0, len(P), 3)]
faces, fuv, k = [], [], 0
for n in vc:
    tri = [idx[(k + j) * 3:(k + j) * 3 + 3] for j in range(n)]
    faces.append([t[0] for t in tri]); fuv.append([t[2] for t in tri]); k += n

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
me = bpy.data.meshes.new("Servbot")
me.from_pydata(verts, [], faces)
uvl = me.uv_layers.new(name="UVMap")
li = 0
for f, uvs in zip(me.polygons, fuv):
    for l, t in zip(f.loop_indices, uvs):
        uvl.data[l].uv = (UV[t * 2], UV[t * 2 + 1])
me.validate(); me.update()
ob = bpy.data.objects.new("Gnome", me)
bpy.context.scene.collection.objects.link(ob)

# skeleton: joint sids -> bone names + world heads (all rotations are identity in the file)
names = root.find(".//c:Name_array", ns).text.split()
heads = {}
def walk(node, base):
    t = [float(x) for x in node.find("c:translate", ns).text.split()]
    h = (base[0] + t[0], base[1] + t[1], base[2] + t[2])
    heads[node.get("sid")] = (node.get("name"), h, None)
    for ch in node.findall("c:node", ns):
        parents[ch.get("sid")] = node.get("sid"); walk(ch, h)
parents = {}
walk(root.find(".//c:node[@type='JOINT']", ns), (0, 0, 0))
print("JOINTS", {s: (v[0], v[1]) for s, v in heads.items()}, parents)

vw = root.find(".//c:vertex_weights", ns)
v = [int(x) for x in vw.find("c:v", ns).text.split()]
W = fa("ID27")
groups = {}
for vi in range(len(verts)):
    j, w = v[vi * 2], v[vi * 2 + 1]
    groups.setdefault(names[j], []).append((vi, W[w]))
for s, lst in groups.items():
    g = ob.vertex_groups.new(name=heads[s][0])
    for vi, w in lst:
        g.add([vi], w, "REPLACE")
print("GROUPS", {heads[s][0]: len(l) for s, l in groups.items()})

# bbox per group (Blender coords) for later fitting
for g in ob.vertex_groups:
    ps = [Vector(verts[vi]) for vi, _ in groups[[s for s in heads if heads[s][0] == g.name][0]]]
    mn = Vector([min(p[i] for p in ps) for i in range(3)]); mx = Vector([max(p[i] for p in ps) for i in range(3)])
    print("BBOX", g.name, tuple(round(x, 2) for x in mn), tuple(round(x, 2) for x in mx))

arm = bpy.data.armatures.new("Armature")
ao = bpy.data.objects.new("Armature", arm)
bpy.context.scene.collection.objects.link(ao)
bpy.context.view_layer.objects.active = ao
bpy.ops.object.mode_set(mode="EDIT")
for s, (name, h, _) in heads.items():
    b = arm.edit_bones.new(name)
    b.head = conv(*h); b.tail = Vector(conv(*h)) + Vector((0, 0, 1.5))
for s, p in parents.items():
    arm.edit_bones[heads[s][0]].parent = arm.edit_bones[heads[p][0]]
bpy.ops.object.mode_set(mode="OBJECT")
ob.parent = ao
mod = ob.modifiers.new("Armature", "ARMATURE"); mod.object = ao

mat = bpy.data.materials.new("Gnome"); mat.use_nodes = True
nt = mat.node_tree
tex = nt.nodes.new("ShaderNodeTexImage")
tex.image = bpy.data.images.load(os.path.join(os.path.dirname(DAE), "ServBot.png")); tex.interpolation = "Closest"
bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
nt.links.new(tex.outputs[0], bsdf.inputs[0]); nt.links.new(tex.outputs[1], bsdf.inputs["Alpha"])
me.materials.append(mat)
bpy.ops.wm.save_as_mainfile(filepath=OUT)
print("IMPORT DONE", len(verts), len(faces))
