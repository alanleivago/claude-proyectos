"""Blender headless: rig2 armature + rest mesh + all clips from ref/anim2.npz -> GLB.
blender -b --factory-startup --python tools/anim/bl_build2.py -- ref/rig2.npz ref/anim2.npz bare|tights out/girl2_curvy_bare.glb"""
import bpy, sys, json, os, numpy as np
from mathutils import Matrix
argv = sys.argv[sys.argv.index("--") + 1:]
G = np.load(argv[0], allow_pickle=True); AN = np.load(argv[1], allow_pickle=True); VAR = argv[2]; OUT = argv[3]
S = float(G["S"]); zmin = float(G["zmin"])
U = lambda p: np.stack([p[..., 0] * S, p[..., 1] * S, (p[..., 2] - zmin) * S - 9.0], -1)
names = [str(n) for n in G["names"]]; par = G["par"]; Hr = U(G["Hr"]); Tr = U(G["Tr"]); Rb = G["Rb"]
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
ad_ = bpy.data.armatures.new("Armature"); arm = bpy.data.objects.new("Armature", ad_); bpy.context.scene.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; arm.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
for i, n in enumerate(names):
    e = ad_.edit_bones.new(n); e.head = Hr[i].tolist(); e.tail = Tr[i].tolist()
for i, n in enumerate(names):
    e = ad_.edit_bones[n]
    if par[i] >= 0: e.parent = ad_.edit_bones[names[par[i]]]
    e.use_connect = False
    M = Matrix(Rb[i].tolist()).to_4x4(); M.translation = Hr[i].tolist(); L = (Tr[i] - Hr[i]); e.matrix = M; e.length = float(np.linalg.norm(L))
bpy.ops.object.mode_set(mode="OBJECT")
err = max(float(np.abs(np.array(ad_.bones[n].matrix_local.to_3x3()) - Rb[i]).max()) for i, n in enumerate(names))
print("BUILD bone frame err", err)
for b in arm.pose.bones: b.rotation_mode = "QUATERNION"
# mesh
Vr = U(G["Vr"]); F = G["F"]; FUV = G["FUV"]; FMAT = G["FMAT"]; Wm = G["W"]
me = bpy.data.meshes.new("Girl2"); me.from_pydata(Vr.tolist(), [], F.tolist()); me.update()
uvl = me.uv_layers.new(name="UVMap"); uv = np.zeros((len(me.loops), 2))
# face atlas cell count (default 16); face UVs span one cell
try: _FM = json.load(open("out/face_tracks.json")).get("_meta", {})
except Exception: _FM = {}
CELLS = int(_FM.get("cols", _FM.get("cells", 16))); ROWS = int(_FM.get("rows", 1))   # atlas grid: cols x rows cells
FUV = FUV.copy().astype(float)
for fi in np.nonzero(FMAT > 0)[0]:
    FUV[fi, :, 0] *= 16.0 / CELLS                                  # one column of the grid
    FUV[fi, :, 1] = 1.0 - (1.0 - FUV[fi, :, 1]) / ROWS             # top row (Blender v up); engines offset by row/rows
print("BUILD face atlas grid", CELLS, "x", ROWS)
for p in me.polygons: uv[p.loop_start:p.loop_start + 3] = FUV[p.index]
uvl.data.foreach_set("uv", uv.ravel())
for p, mi in zip(me.polygons, FMAT): p.material_index = int(mi)
ob = bpy.data.objects.new("Girl2", me); bpy.context.scene.collection.objects.link(ob)
TEX = json.loads(str(G["tex"]))[VAR]
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
for i, n in enumerate(names):
    g = ob.vertex_groups.new(name=n); idx = np.nonzero(Wm[:, i] > 1e-4)[0]
    for k in idx: g.add([int(k)], float(Wm[k, i]), "REPLACE")
ob.parent = arm; mod = ob.modifiers.new("Armature", "ARMATURE"); mod.object = arm
# actions
ad = arm.animation_data_create()
clips = json.loads(str(AN["clips"]))
for c in clips:
    q = AN["q_" + c]; loc = AN["l_" + c] * S          # (nf, NB, 4), (nf, 3)
    nf = len(q)
    act = bpy.data.actions.new(c); act.use_fake_user = True; ad.action = act
    if len(act.slots) == 0:
        slot = act.slots.new(id_type="OBJECT", name="Armature")
    else:
        slot = act.slots[0]
    ad.action_slot = slot
    frames = np.arange(1, nf + 1, dtype=float)
    for i, n in enumerate(names):
        qq = q[:, i].copy()
        for k in range(1, nf):
            if qq[k] @ qq[k - 1] < 0: qq[k] = -qq[k]
        chans = [(f'pose.bones["{n}"].rotation_quaternion', j, qq[:, j]) for j in range(4)]
        if n == "Pelvis": chans += [(f'pose.bones["{n}"].location', j, loc[:, j]) for j in range(3)]
        for path, j, vals in chans:
            fc = act.fcurve_ensure_for_datablock(arm, path, index=j)
            fc.keyframe_points.add(nf)
            fc.keyframe_points.foreach_set("co", np.stack([frames, vals], 1).ravel().tolist())
            for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
            fc.update()
    ad.action = None
for p in arm.pose.bones: p.matrix_basis.identity()
for c in sorted(clips):
    a = bpy.data.actions[c]; tr = ad.nla_tracks.new(); tr.name = c
    st = tr.strips.new(c, 1, a)
    if getattr(st, "action_slot", None) is None and len(a.slots): st.action_slot = a.slots[0]
    st.action_frame_start, st.action_frame_end = a.frame_range
ad.action = None
sc = bpy.context.scene; sc.render.fps = 30; sc.frame_start = 1
sc.frame_end = int(max(bpy.data.actions[c].frame_range[1] for c in clips)) + 1
for o in bpy.data.objects: o.select_set(o in (ob, arm))
bpy.context.view_layer.objects.active = arm
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_apply=True, export_animations=True, export_animation_mode="NLA_TRACKS",
                          export_force_sampling=True, export_frame_step=1, export_anim_slide_to_zero=True, export_optimize_animation_size=False,
                          export_reset_pose_bones=True, export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.splitext(OUT)[0] + ".blend", copy=True)
print("BUILD exported", OUT, len(clips), "clips")
np.save(os.path.splitext(OUT)[0] + "_rest.npy", Vr)
