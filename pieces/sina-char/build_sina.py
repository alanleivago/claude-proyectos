"""blender -b neto.blend --python build_sina.py -- <out.glb> <texture.png> [out.blend]
NETO512 (evanciao) -> sinaboto-style worker girl. Runs on the asset in background and never saves over it.
1. hair spikes flattened to fit under the hard hat   2. hard hat modeled low poly, parented to the head bone
3. body texture swapped, materials -> Principled + alpha clip (glTF)   4. DEF hierarchy repaired, <=4 influences
5. pre-export checks (Crashsune checklist)   6. GLB export (deform bones only, no animations yet)"""
import bpy, bmesh, sys, os, math
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1:]
OUT, TEX = argv[0], argv[1]
SAVE = argv[2] if len(argv) > 2 else None
rig = bpy.data.objects["rig"]
rig.data.pose_position = "REST"
problems = []

# ---------- 1. hair under the hat ----------
HAT_C, HAT_R, HAT_H = Vector((0, 0.01, 1.485)), 0.123, 0.16
for name in ("hair-general", "hair-front"):
    me = bpy.data.objects[name].data
    for v in me.vertices:                       # mesh is in rig space (objects sit at the origin)
        if v.co.z > 1.5:
            v.co.z = 1.5 + (v.co.z - 1.5) * 0.15

# ---------- 1a. new face sprites (face/), nudged forward so the head doesn't poke through ----------
FACE = os.path.join(os.path.dirname(TEX), "..", "face")
SPRITE = {"eye": "eyes/eye_open.png", "pupil": "pupils/pupil.png", "eyebrows": "brows/brow.png", "mouth": "mouths/mouth_neutral.png"}
for o, dy in (("eyes", -0.0015), ("pupils", -0.0055)):
    for v in bpy.data.objects[o].data.vertices:
        v.co.y += dy

# ---------- 1b. fitted sleeves and straight cargo legs (NETO has bell sleeves and flares) ----------
CAPS = {"upper-body": {"DEF-forearm.L": 0.042, "DEF-forearm.L.001": 0.04, "DEF-hand.L": 0.04,
                       "DEF-upper_arm.L.001": 0.042},
        "lower-body": {"DEF-shin.L": 0.062, "DEF-shin.L.001": 0.06, "DEF-shin.R": 0.062, "DEF-shin.R.001": 0.06}}
for oname, caps in CAPS.items():
    o = bpy.data.objects[oname]; vgn = {g.index: g.name for g in o.vertex_groups}
    for v in o.data.vertices:
        ws = [(g.weight, vgn[g.group]) for g in v.groups if vgn[g.group].startswith("DEF-")]
        if not ws:
            continue
        w, bname = max(ws)
        if bname not in caps or w < 0.5:
            continue
        b = rig.data.bones[bname]; h = b.head_local; seg = b.tail_local - h
        p = h + seg * ((v.co - h).dot(seg) / seg.length_squared)       # radial only: unclamped projection
        d = v.co - p
        if d.length > caps[bname]:
            v.co = p + d * (caps[bname] / d.length)


def flat_mat(name, rgb):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    p.inputs["Base Color"].default_value = (*rgb, 1); p.inputs["Roughness"].default_value = 1.0
    return m


def rigid(obj, bone):
    vg = obj.vertex_groups.new(name=bone); vg.add(range(len(obj.data.vertices)), 1.0, "REPLACE")
    obj.parent = rig; obj.modifiers.new("Armature", "ARMATURE").object = rig


# ---------- 1c. gloves (mitten + thumb, orange cuff), rigid on the hand bones ----------
glove_m, cuff_m = flat_mat("glove", (0.62, 0.45, 0.26)), flat_mat("cuff", (1.0, 0.36, 0.05))
for side in ("L", "R"):
    b = rig.data.bones[f"DEF-hand.{side}"]
    bm = bmesh.new()
    def box(cx, cy, cz, sx, sy, sz, mi):
        r = bmesh.ops.create_cube(bm, size=1)
        bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=r["verts"]); bmesh.ops.translate(bm, vec=(cx, cy, cz), verts=r["verts"])
        for f in {f for v in r["verts"] for f in v.link_faces}:
            f.material_index = mi
    box(0, 0.055, 0, 0.078, 0.105, 0.04, 0)                     # palm + fingers (bone +Y runs along the hand)
    box(0.043 if side == "L" else -0.043, 0.035, 0.008, 0.026, 0.05, 0.028, 0)   # thumb
    box(0, 0.0, 0, 0.088, 0.03, 0.062, 1)                        # cuff ring at the wrist
    me = bpy.data.meshes.new(f"glove.{side}"); bm.to_mesh(me); bm.free()
    me.transform(b.matrix_local)                                 # bone space -> armature (rest) space
    g = bpy.data.objects.new(f"glove.{side}", me); bpy.context.scene.collection.objects.link(g)
    me.materials.append(glove_m); me.materials.append(cuff_m)
    rigid(g, f"DEF-hand.{side}")

# ---------- 2. hard hat ----------
def hat_mesh():
    bm = bmesh.new()
    seg = 10
    rings = [(1.0, 0.0), (1.0, 0.35), (0.9, 0.7), (0.62, 0.92), (0.0, 1.0)]   # (radius, height) profile: straight sides, round top
    verts = []
    for r, h in rings[:-1]:
        verts.append([bm.verts.new((math.cos(2 * math.pi * i / seg) * r * HAT_R,
                                    math.sin(2 * math.pi * i / seg) * r * HAT_R * 1.1, h * HAT_H)) for i in range(seg)])
    top = bm.verts.new((0, 0, HAT_H))
    for a, b in zip(verts, verts[1:]):
        for i in range(seg):
            bm.faces.new((a[i], a[(i + 1) % seg], b[(i + 1) % seg], b[i]))
    for i in range(seg):
        bm.faces.new((verts[-1][i], verts[-1][(i + 1) % seg], top))
    # crest along the top (front to back)
    crest = bmesh.ops.create_cube(bm, size=1)["verts"]
    bmesh.ops.scale(bm, vec=(0.034, HAT_R * 1.35, 0.014), verts=crest)
    bmesh.ops.translate(bm, vec=(0, 0, HAT_H * 0.96), verts=crest)
    # brim all the way round, angled down, longest at the front (-Y)
    inner = verts[0]
    outer = [bm.verts.new((v.co.x * 1.2, v.co.y * (1.42 if v.co.y < 0 else 1.18), -0.018)) for v in inner]
    for i in range(seg):
        bm.faces.new((inner[i], outer[i], outer[(i + 1) % seg], inner[(i + 1) % seg]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new("hardhat"); bm.to_mesh(me); bm.free()
    return me

hat = bpy.data.objects.new("hardhat", hat_mesh())
bpy.context.scene.collection.objects.link(hat)
mat = bpy.data.materials.new("hardhat"); mat.use_nodes = True
pb = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
pb.inputs["Base Color"].default_value = (1.0, 0.33, 0.04, 1); pb.inputs["Roughness"].default_value = 1.0
hat.data.materials.append(mat)
# rigid skin: one vertex group fully weighted to the head bone (exports as part of the skinned character)
vg = hat.vertex_groups.new(name="DEF-spine.006"); vg.add(range(len(hat.data.vertices)), 1.0, "REPLACE")
hat.location = HAT_C
hat.rotation_euler = (0, 0, 0)
bpy.context.view_layer.update()
hat.data.transform(hat.matrix_world); hat.matrix_world = Matrix.Identity(4)
hat.parent = rig
hat.modifiers.new("Armature", "ARMATURE").object = rig

# ---------- 3. materials ----------
body_img = bpy.data.images.load(TEX, check_existing=True)
for m in bpy.data.materials:
    if not m.use_nodes or m.name in ("uvs", "hardhat", "glove", "cuff"):
        continue
    nt = m.node_tree
    tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE" and n.image), None)
    if not tex:
        continue
    img = body_img if m.name == "base" else tex.image
    if m.name in SPRITE:
        img = bpy.data.images.load(os.path.abspath(os.path.join(FACE, SPRITE[m.name])), check_existing=True)
        img.pack()
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = img; t.interpolation = "Closest"
    b = nt.nodes.new("ShaderNodeBsdfPrincipled"); o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"]); nt.links.new(t.outputs["Alpha"], b.inputs["Alpha"])
    b.inputs["Roughness"].default_value = 1.0
    nt.links.new(b.outputs["BSDF"], o.inputs["Surface"])

# ---------- 4. DEF hierarchy + weights ----------
NEWPAR = {"DEF-pelvis.L": "DEF-spine", "DEF-pelvis.R": "DEF-spine", "DEF-thigh.L": "DEF-spine", "DEF-thigh.R": "DEF-spine",
          "DEF-shoulder.L": "DEF-spine.003", "DEF-shoulder.R": "DEF-spine.003",
          "DEF-upper_arm.L": "DEF-shoulder.L", "DEF-upper_arm.R": "DEF-shoulder.R",
          "DEF-eye.l": "DEF-spine.006", "DEF-eye.r": "DEF-spine.006"}
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode="EDIT")
for c, p in NEWPAR.items():
    e = rig.data.edit_bones[c]; e.use_connect = False; e.parent = rig.data.edit_bones[p]
bpy.ops.object.mode_set(mode="OBJECT")
for c in NEWPAR:
    pbn = rig.pose.bones[c]
    if not pbn.constraints:
        k = pbn.constraints.new("COPY_TRANSFORMS"); k.target = rig; k.subtarget = c.replace("DEF-", "ORG-")

meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.parent == rig]
deform = {b.name for b in rig.data.bones if b.use_deform}
for o in meshes:
    me = o.data
    for v in me.vertices:          # keep the 4 strongest deform weights, renormalise
        gs = sorted(((g.weight, g.group) for g in v.groups if o.vertex_groups[g.group].name in deform), reverse=True)
        keep, drop = gs[:4], gs[4:]
        for _, gi in drop:
            o.vertex_groups[gi].remove([v.index])
        s = sum(w for w, _ in keep)
        if s > 0:
            for w, gi in keep:
                o.vertex_groups[gi].add([v.index], w / s, "REPLACE")
    # drop empty armature modifiers
    for md in list(o.modifiers):
        if md.type == "ARMATURE" and md.object is None:
            o.modifiers.remove(md)

# ---------- 5. checks ----------
tris = 0
for o in meshes:
    me = o.data
    if any(abs(s - 1) > 1e-4 for s in o.scale):
        problems.append(f"{o.name}: unapplied scale {tuple(o.scale)}")
    ngons = sum(1 for p in me.polygons if len(p.vertices) > 4)
    if ngons:
        problems.append(f"{o.name}: {ngons} n-gons")
    bm = bmesh.new(); bm.from_mesh(me)
    dup = len(bm.verts) - len(bmesh.ops.find_doubles(bm, verts=bm.verts, dist=1e-5)["targetmap"]) - len(bm.verts)
    if dup:
        problems.append(f"{o.name}: {-dup} duplicate verts")
    bm.free()
    unweighted = sum(1 for v in me.vertices if not any(o.vertex_groups[g.group].name in deform for g in v.groups))
    if unweighted:
        problems.append(f"{o.name}: {unweighted} verts with no deform weight")
    mult = 2 if any(md.type == "MIRROR" for md in o.modifiers) else 1
    tris += mult * sum(len(p.vertices) - 2 for p in me.polygons)
print("TRIS", tris)
print("CHECKS", "ok" if not problems else problems)

# ---------- 6. export ----------
keep = {"rig"} | {o.name for o in meshes}
for o in bpy.data.objects:
    o.select_set(o.name in keep)
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_apply=True, export_def_bones=True,
                          export_animations=False, export_yup=True, export_image_format="AUTO")
print("EXPORTED", OUT, os.path.getsize(OUT))
if SAVE:
    bpy.ops.wm.save_as_mainfile(filepath=SAVE, copy=True)
