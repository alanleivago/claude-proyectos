"""Blender headless: Zero's rig (from zero_anim.glb, 65 FK-sampled actions) re-proportioned to her joints, her mesh
skinned in HIS idle pose (exact: rest mesh = inverse LBS of the posed mesh), action his_idle, GLB export.
blender -b --factory-startup --python tools/bl_rig.py -- ref/rig_in.npz out/girl2_anim.glb"""
import bpy, sys, json, math, os, numpy as np
from mathutils import Vector, Matrix, Quaternion
argv = sys.argv[sys.argv.index("--") + 1:]
ZERO = r"F:/Claude Proyectos/pieces/zero-fem/anim/zero_anim.glb"
D = np.load(argv[0], allow_pickle=True)
OUT = argv[1]
J = json.loads(str(D["joints"])); W = json.loads(str(D["weights"]))
Vp = D["V"].astype(float); F = D["F"]; FUV = D["FUV"]; FMAT = D["FMAT"]; TEX = [str(t) for t in D["tex"]]
zmin, zmax = Vp[:, 2].min(), Vp[:, 2].max(); S = 13.24 / (zmax - zmin)


def U(p): return Vector((p[0] * S, p[1] * S, (p[2] - zmin) * S - 9.0))


Vu = np.stack([Vp[:, 0] * S, Vp[:, 1] * S, (Vp[:, 2] - zmin) * S - 9.0], 1)
JU = {k: U(v) for k, v in J.items()}

for o in list(bpy.data.objects): bpy.data.objects.remove(o)
bpy.ops.import_scene.gltf(filepath=ZERO)
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE"); arm.name = "Armature"
for o in list(bpy.data.objects):
    if o is not arm: bpy.data.objects.remove(o)
for a in bpy.data.actions: a.use_fake_user = True
for m in list(bpy.data.materials): bpy.data.materials.remove(m)       # Zero's face_eyes/face_mouth would push ours to .001
for im in list(bpy.data.images): bpy.data.images.remove(im)
ad = arm.animation_data_create(); ad.action = None
for t in list(ad.nla_tracks): ad.nla_tracks.remove(t)
bpy.context.view_layer.objects.active = arm; arm.select_set(True)

BONES = {"Pelvis": ("pelvis", "spine"), "Chest": ("spine", "neck"), "Neck": ("neck", "headbase"), "Head": ("headbase", "headtop")}
for s in "LR":
    BONES.update({f"UpperArm.{s}": ("shoulder" + s, "elbow" + s), f"Forearm.{s}": ("elbow" + s, "wrist" + s), f"Hand.{s}": ("wrist" + s, "handtip" + s),
                  f"Thigh.{s}": ("hip" + s, "knee" + s), f"Calf.{s}": ("knee" + s, "ankle" + s), f"Foot.{s}": ("ankle" + s, "toe" + s)})
ORDER = [b.name for b in arm.data.bones]          # parents before children
R0 = {b.name: b.matrix_local.to_3x3().normalized() for b in arm.data.bones}
H0 = {b.name: b.head_local.copy() for b in arm.data.bones}
L0 = {b.name: b.length for b in arm.data.bones}
PAR = {b.name: (b.parent.name if b.parent else None) for b in arm.data.bones}
CTRL = {"FootControl.L": ("ankleL", "Foot.L"), "FootControl.R": ("ankleR", "Foot.R"),
        "FootPoleTarget.L": ("kneeL", "Calf.L"), "FootPoleTarget.R": ("kneeR", "Calf.R")}
Rp, RH, LEN, PH = {}, {}, {}, {}
for n in ORDER:
    p = PAR[n]
    if n in BONES:
        h, t = JU[BONES[n][0]], JU[BONES[n][1]]
        y0 = R0[n] @ Vector((0, 1, 0)); dirp = (t - h).normalized()
        Rp[n] = y0.rotation_difference(dirp).to_matrix() @ R0[n]; LEN[n] = (t - h).length; PH[n] = h.copy()
        if p is None: RH[n] = h.copy()
        else: RH[n] = RH[p] + R0[p] @ (Rp[p].transposed() @ (h - PH[p]))
    elif p is None or p not in RH:
        Rp[n] = R0[n]; LEN[n] = L0[n]
        if n in CTRL: RH[n] = H0[n] + (JU[CTRL[n][0]] - H0[CTRL[n][1]])
        else: RH[n] = H0[n].copy()
        PH[n] = RH[n].copy()
    else:                                         # Hair etc: Zero's offset in the parent frame, scaled with the parent
        k = LEN[p] / L0[p]; off0 = R0[p].transposed() @ (H0[n] - H0[p])
        RH[n] = RH[p] + R0[p] @ (off0 * k); LEN[n] = L0[n] * k
        Rp[n] = Rp[p] @ R0[p].transposed() @ R0[n]; PH[n] = PH[p] + Rp[p] @ (off0 * k)
bpy.ops.object.mode_set(mode="EDIT")
eb = arm.data.edit_bones
for n in ORDER: eb[n].use_connect = False
for n in ORDER:
    e = eb[n]; M = R0[n].to_4x4(); M.translation = RH[n]; e.matrix = M; e.length = LEN[n]
bpy.ops.object.mode_set(mode="POSE")
for pb in arm.pose.bones: pb.matrix_basis.identity()
bpy.context.view_layer.update()
for n in ORDER:
    if n not in BONES: continue
    pb = arm.pose.bones[n]; M = Rp[n].to_4x4(); M.translation = PH[n]; pb.matrix = M
    bpy.context.view_layer.update()
bpy.ops.object.mode_set(mode="OBJECT")
POSE = {n: (arm.pose.bones[n].matrix @ arm.data.bones[n].matrix_local.inverted()) for n in ORDER}
print("RIG pose head err", max((arm.pose.bones[n].head - PH[n]).length for n in BONES))
Mi = {n: np.array(POSE[n]) for n in ORDER}
Vr = np.zeros_like(Vu)
for i, w in enumerate(W):
    M = sum(x * Mi[b] for b, x in w.items()) / sum(w.values())
    Vr[i] = (np.linalg.inv(M) @ np.r_[Vu[i], 1.0])[:3]
me = bpy.data.meshes.new("Girl2"); me.from_pydata(Vr.tolist(), [], F.tolist()); me.update()
uvl = me.uv_layers.new(name="UVMap"); uv = np.zeros((len(me.loops), 2))
for p in me.polygons: uv[p.loop_start:p.loop_start + 3] = FUV[p.index]
uvl.data.foreach_set("uv", uv.ravel())
for p, mi in zip(me.polygons, FMAT): p.material_index = int(mi)
ob = bpy.data.objects.new("Girl2", me); bpy.context.scene.collection.objects.link(ob)
for name, path in zip(["Girl2", "face_eyes", "face_mouth"], TEX):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for nd_ in list(nt.nodes): nt.nodes.remove(nd_)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); bs = nt.nodes.new("ShaderNodeBsdfPrincipled"); tx = nt.nodes.new("ShaderNodeTexImage")
    tx.interpolation = "Closest"; tx.image = bpy.data.images.load(path)
    bs.inputs["Roughness"].default_value = 1.0
    for nm in ("Specular IOR Level", "Specular"):
        if nm in bs.inputs: bs.inputs[nm].default_value = 0.0
    nt.links.new(tx.outputs["Color"], bs.inputs["Base Color"]); nt.links.new(bs.outputs[0], out.inputs[0])
    me.materials.append(m)
for i, w in enumerate(W):
    for b, x in w.items():
        g = ob.vertex_groups.get(b) or ob.vertex_groups.new(name=b); g.add([i], x, "REPLACE")
ob.parent = arm; mod = ob.modifiers.new("Armature", "ARMATURE"); mod.object = arm
# his_idle: the fitted pose, held frames 1..100
act = bpy.data.actions.new("his_idle"); act.use_fake_user = True; ad.action = act
for pb in arm.pose.bones:
    for f in (1, 100):
        pb.keyframe_insert("location", frame=f)
        pb.keyframe_insert("rotation_quaternion" if pb.rotation_mode == "QUATERNION" else "rotation_euler", frame=f)
        pb.keyframe_insert("scale", frame=f)
bpy.context.scene.frame_set(1); bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg)
Ve = np.array([v.co[:] for v in ev.data.vertices]); print("RIG his_idle mesh err (units)", float(np.abs(Ve - Vu).max()))
np.save(os.path.splitext(OUT)[0] + "_rest.npy", Vr)
ad.action = None
kleg = ((JU["hipL"] - JU["kneeL"]).length + (JU["kneeL"] - JU["ankleL"]).length) / (L0["Thigh.L"] + L0["Calf.L"])
print("RIG leg ratio", kleg)
for a in bpy.data.actions:
    if a.name == "his_idle": continue
    for lay in a.layers:
        for st in lay.strips:
            for cb in st.channelbags:
                for fc in cb.fcurves:
                    if fc.data_path == 'pose.bones["Pelvis"].location':
                        for kp in fc.keyframe_points:
                            kp.co[1] *= kleg; kp.handle_left[1] *= kleg; kp.handle_right[1] *= kleg
for p in arm.pose.bones: p.matrix_basis.identity()
names = sorted(a.name for a in bpy.data.actions)
for n in names:
    a = bpy.data.actions[n]; tr = ad.nla_tracks.new(); tr.name = n
    st = tr.strips.new(n, 1, a)
    if getattr(st, "action_slot", None) is None and len(a.slots): st.action_slot = a.slots[0]
    st.action_frame_start, st.action_frame_end = a.frame_range
ad.action = None
sc = bpy.context.scene; sc.render.fps = 30; sc.frame_start = 1
sc.frame_end = int(max(bpy.data.actions[n].frame_range[1] for n in names)) + 1
for o in bpy.data.objects: o.select_set(o in (ob, arm))
bpy.context.view_layer.objects.active = arm
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_apply=True, export_animations=True, export_animation_mode="NLA_TRACKS",
                          export_force_sampling=True, export_frame_step=1, export_anim_slide_to_zero=True, export_optimize_animation_size=False,
                          export_reset_pose_bones=True, export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.splitext(OUT)[0] + ".blend", copy=True)
print("RIG exported", OUT, len(names), "actions; scale", S, "kleg", kleg)
