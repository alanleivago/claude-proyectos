"""blender -b out/zero_fem.blend --python v2/feminize_v2.py
v2 body (more feminine, the armour design untouched, only shapes) on top of v1 (out/zero_fem.blend is read, never saved):
  1. chest: the front plates are subdivided into a grid and pushed out into two rounded volumes with a valley at the
     centre seam; the green orb's patch is moved as one rigid piece (no deformation); collar a bit narrower.
  2. waist narrower (dark band + bottom of the ribcage), hips wider, the red pelvis piece cut higher at the sides like
     a short leotard (bottom narrower).
  3. thighs much fuller: a new edge loop at mid-thigh, wide at the hip tapering to the knee; boots slightly tapered.
  Arms and hands untouched. Textures: v2/tex (thicker lashes) + v2/face atlases.
Writes v2/out/zero_fem_v2.blend + .glb and unlit before/after renders (v2/out/{before,after}_{front,3q,side}.png).
Never commit the outputs (derivatives of the purchased model)."""
import bpy, bmesh, os, math
from mathutils import Vector, Quaternion

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)
CHEST_D, CX, CZ, RX, RZ_UP, RZ_DN = 1.0, 0.36, -0.1, 0.4, 0.6, 0.85      # bust volume: depth, centre, radii
ORB_UV, ORB_R = (64.0, 17.0), 9.0                                            # orb centre in texture px (192), rigid radius
WAIST, HIPS, LEO, THIGH_OUT, THIGH_Y, THIGH_MID, KNEE = 0.72, 1.24, 0.75, 1.65, 1.3, 1.32, 0.9
sc = bpy.context.scene
arm = bpy.data.objects["Armature"]


def smooth(t):
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- unlit preview renders
def unlit(on):
    for m in bpy.data.materials:
        if not m.node_tree: continue
        nt = m.node_tree; out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
        tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
        if on and tex:
            em = nt.nodes.new("ShaderNodeEmission"); em.name = "UNLIT"; nt.links.new(tex.outputs["Color"], em.inputs["Color"]); nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
        elif not on:
            em = nt.nodes.get("UNLIT")
            if em:
                bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"); nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"]); nt.nodes.remove(em)


def arms_down(on, back=0):
    for side, s in (("L", 1), ("R", -1)):
        pb = arm.pose.bones[f"UpperArm.{side}"]; pb.rotation_mode = "QUATERNION"
        rest = arm.data.bones[f"UpperArm.{side}"].matrix_local.to_quaternion()
        q = Quaternion((1, 0, 0), math.radians(-back)) @ Quaternion((0, 1, 0), s * math.radians(66))
        pb.rotation_quaternion = rest.inverted() @ q @ rest if on else (1, 0, 0, 0)
    bpy.context.view_layer.update()


def render(tag):
    sc.render.resolution_x, sc.render.resolution_y = 480, 720
    sc.render.film_transparent = False; sc.view_settings.view_transform = "Standard"
    sc.world.use_nodes = True
    next(n for n in sc.world.node_tree.nodes if n.type == "BACKGROUND").inputs["Color"].default_value = (0, 0, 0, 1)
    cam = sc.camera
    sc.render.resolution_x, sc.render.resolution_y = 520, 1000
    for view, a in (("front", 0), ("3q", 35), ("side", 90)):
        arms_down(True, back=-50 if view == "side" else 0)
        r = math.radians(a)
        cam.location = (31 * math.sin(r), -31 * math.cos(r), -2.4); cam.rotation_euler = (math.radians(90), 0, r); cam.data.lens = 50
        sc.render.filepath = os.path.join(OUT, f"{tag}_{view}.png"); bpy.ops.render.render(write_still=True)


for pb in arm.pose.bones:
    pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)
if arm.animation_data: arm.animation_data.action = None
unlit(True); arms_down(True); render("before"); arms_down(False); unlit(False)

# ---------------------------------------------------------------- textures (v2 lashes + v2 face atlases)
def swap(matname, path):
    m = bpy.data.materials[matname]; tex = next(n for n in m.node_tree.nodes if n.type == "TEX_IMAGE")
    old = tex.image; img = bpy.data.images.load(path, check_existing=False); img.pack(); tex.image = img; tex.interpolation = "Closest"
    if old and old.users == 0: bpy.data.images.remove(old)
swap("Zero", os.path.join(HERE, "tex", "ZeroVolnuttTexture.png"))
swap("face_eyes", os.path.join(HERE, "face", "face_eyes.png"))
swap("face_mouth", os.path.join(HERE, "face", "face_mouth.png"))

# ---------------------------------------------------------------- 1. chest: two rounded volumes, rigid orb, valley
body = bpy.data.objects["Body"]; me = body.data
bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table(); bm.verts.ensure_lookup_table()
uvl = bm.loops.layers.uv.active
FRONT = [16, 57, 15, 58]                                   # lower + upper front plates, both sides (v1 indices)
fr_faces = [bm.faces[i] for i in FRONT]
edges = list({e for f in fr_faces for e in f.edges})
bmesh.ops.subdivide_edges(bm, edges=edges, cuts=4, use_grid_fill=True)
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()


def bust(x, z):
    dx = (abs(x) - CX) / RX; dz = (z - CZ) / (RZ_UP if z > CZ else RZ_DN)
    return max(0.0, 1 - dx * dx - dz * dz) ** 0.65


# front-facing verts of the chest plate (y < -0.6, between the bottom ring and the collar)
front = [v for v in bm.verts if v.co.y < -0.6 and -0.99 < v.co.z < 0.8 and abs(v.co.x) < 0.8]
uvpos = {}
for v in front:   # mean UV of each vertex (texture px)
    us = [l[uvl].uv for l in v.link_loops if l.face.normal.y < -0.2]
    if us: uvpos[v] = (sum(u.x for u in us) / len(us) * 192, (1 - sum(u.y for u in us) / len(us)) * 192)
orb_vs = [v for v in front if v in uvpos and math.hypot(uvpos[v][0] - ORB_UV[0], uvpos[v][1] - ORB_UV[1]) < ORB_R]
orb_d = sum(bust(v.co.x, v.co.z) for v in orb_vs) / max(1, len(orb_vs))
print("orb patch verts", len(orb_vs), "bulge", round(orb_d, 3))
for v in front:
    b = bust(v.co.x, v.co.z)
    if v in uvpos:
        d = math.hypot(uvpos[v][0] - ORB_UV[0], uvpos[v][1] - ORB_UV[1])
        if d < ORB_R * 1.9:                                # rigid core, then blend back into the bust field
            k = smooth((d - ORB_R) / (ORB_R * 0.9)); b = orb_d * (1 - k) + b * k
    v.co.y -= CHEST_D * b
    v.co.z -= 0.06 * b * smooth((CZ - v.co.z) / 0.5)        # a little weight at the underside
for v in bm.verts:                                        # collar: narrower at the front top
    if v.co.z > 1.15 and abs(v.co.x) < 0.4 and v.co.y < -0.5:
        v.co.x *= 0.82
# ---------------------------------------------------------------- 2. waist, hips, leotard
for v in bm.verts:
    x, y, z = v.co
    if -0.7 < z < -0.5: v.co.x *= WAIST; v.co.y *= 0.92                # top of the dark band
    elif -1.0 < z < -0.95: v.co.x *= 0.9                               # bottom ring of the ribcage
    elif -1.82 < z < -1.75: v.co.x *= 1.08                             # bottom of the band follows the hips
    elif -1.9 < z < -1.8: v.co.x *= HIPS                               # hip line of the pelvis
    elif -1.5 < z < -1.4: v.co.x *= 1.06
    elif z < -2.6: v.co.x *= LEO                                       # crotch: narrower = higher leg cut
bm.to_mesh(me); bm.free(); me.update()

# ---------------------------------------------------------------- 3. thighs (Arms object, +X half, mirror modifier)
legs = bpy.data.objects["Arms"]; lm = legs.data; vgn = {g.index: g.name for g in legs.vertex_groups}
bm = bmesh.new(); bm.from_mesh(lm); dl = bm.verts.layers.deform.active; bm.verts.ensure_lookup_table()
thigh_i = next(i for i, n in vgn.items() if n == "Thigh.L"); calf_i = next(i for i, n in vgn.items() if n == "Calf.L")
is_thigh = lambda v: v[dl].get(thigh_i, 0) > 0.5
vert_edges = [e for e in bm.edges if all(is_thigh(v) for v in e.verts) and abs(e.verts[0].co.z - e.verts[1].co.z) > 1.0]
res = bmesh.ops.subdivide_edges(bm, edges=vert_edges, cuts=1)
mid = [v for v in res["geom_inner"] if isinstance(v, bmesh.types.BMVert)]
for v in mid: v[dl][thigh_i] = 1.0
CXL, CYL = 0.75, 0.08                                     # thigh axis
for v in bm.verts:
    if not is_thigh(v): continue
    x, y, z = v.co
    if z > -2.4:   # top ring (hip): very wide, outer side most
        sx = THIGH_OUT if x > CXL else 1.08
        v.co.x = CXL + (x - CXL) * sx; v.co.y = CYL + (y - CYL) * THIGH_Y
    elif v in mid:   # mid-thigh: full and round
        sx = 1.26 if x > CXL else 1.1
        v.co.x = CXL + (x - CXL) * sx; v.co.y = CYL + (y - CYL) * THIGH_MID
    elif z < -4.0:   # knee: slimmer
        v.co.x = CXL + (x - CXL) * KNEE; v.co.y = CYL + (y - CYL) * KNEE
    if v.co.x < 0.02: v.co.x = 0.02                        # never cross the mirror plane
for v in bm.verts:   # boots: slimmer at the top, slight flare at the ankle (stylised)
    if v[dl].get(calf_i, 0) > 0.5:
        x, y, z = v.co; k = smooth((z + 7.5) / 3.2)        # 0 at the ankle, 1 at the knee
        s = 1.04 - 0.1 * k
        v.co.x = 0.88 + (x - 0.88) * s; v.co.y = 0.0 + (y - 0.0) * s
bm.to_mesh(lm); bm.free(); lm.update()

unlit(True); arms_down(True); render("after"); arms_down(False); unlit(False)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "zero_fem_v2.blend"), copy=True)
for o in bpy.data.objects: o.select_set(o.type in ("MESH", "ARMATURE"))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "zero_fem_v2.glb"), use_selection=True, export_apply=True, export_animations=False, export_yup=True)
print("V2 DONE", len(body.data.polygons), "body polys")
