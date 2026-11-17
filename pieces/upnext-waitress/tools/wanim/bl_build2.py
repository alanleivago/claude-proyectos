"""Blender headless: waitress mesh (v2) + rig + all retargeted clips -> GLB in Ashley's engine units (x S, floor -9).
blender -b --factory-startup --python tools/wanim/bl_build2.py -- ref/build2_B.json ref/anim_w.npz out/waitress_shorts.glb"""
import bpy, sys, os, json, numpy as np
from mathutils import Matrix
sys.path.insert(0, os.path.dirname(__file__))
import rig as RG

argv = sys.argv[sys.argv.index("--") + 1:]
R = RG.load(argv[0]); ANP = argv[1]; OUT = argv[2]
S = RG.S_ENGINE
U = lambda p: np.stack([p[..., 0] * S, p[..., 1] * S, p[..., 2] * S + RG.FLOOR], -1)
names, par, Rb = R["names"], R["par"], R["Rb"]; Hr, Tr = U(R["Hr"]), U(R["Tr"])
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
ad_ = bpy.data.armatures.new("waitress_rig"); arm = bpy.data.objects.new("waitress_rig", ad_); sc.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; arm.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
for i, n in enumerate(names):
    e = ad_.edit_bones.new(n); e.head = Hr[i].tolist(); e.tail = Tr[i].tolist()
for i, n in enumerate(names):
    e = ad_.edit_bones[n]
    if par[i] >= 0: e.parent = ad_.edit_bones[names[par[i]]]
    e.use_connect = False
    M = Matrix(Rb[i].tolist()).to_4x4(); M.translation = Hr[i].tolist(); e.matrix = M; e.length = float(np.linalg.norm(Tr[i] - Hr[i]))
bpy.ops.object.mode_set(mode="OBJECT")
err = max(float(np.abs(np.array(ad_.bones[n].matrix_local.to_3x3()) - Rb[i]).max()) for i, n in enumerate(names))
print("BUILD bone frame err", round(err, 6))
for b in arm.pose.bones: b.rotation_mode = "QUATERNION"
J = R["J"]
me = bpy.data.meshes.new("waitress"); me.from_pydata(U(R["Vr"]).tolist(), [], [f["v"] for f in J["faces"]]); me.update()
uvl = me.uv_layers.new(name="UVMap")
for poly, f in zip(me.polygons, J["faces"]):
    poly.material_index = f["mat"]; poly.use_smooth = False
    for k, li in enumerate(poly.loop_indices): uvl.data[li].uv = f["uv"][k]
parts = sorted({f["part"] for f in J["faces"]}); at = me.attributes.new("part", "INT", "FACE")
for i, f in enumerate(J["faces"]): at.data[i].value = parts.index(f["part"])
ob = bpy.data.objects.new("waitress", me); sc.collection.objects.link(ob); ob["parts"] = json.dumps(parts)
MATN = {"waitress_face_eyes": "face_eyes", "waitress_face_mouth": "face_mouth"}
for name, path, alpha in J["mats"]:
    m = bpy.data.materials.new(MATN.get(name, name)); m.use_nodes = True; nt = m.node_tree
    for nd_ in list(nt.nodes): nt.nodes.remove(nd_)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); bs = nt.nodes.new("ShaderNodeBsdfPrincipled"); tx = nt.nodes.new("ShaderNodeTexImage")
    tx.interpolation = "Closest"; tx.image = bpy.data.images.load(path)
    bs.inputs["Roughness"].default_value = 1.0
    for nm in ("Specular IOR Level", "Specular"):
        if nm in bs.inputs: bs.inputs[nm].default_value = 0.0
    nt.links.new(tx.outputs["Color"], bs.inputs["Base Color"]); nt.links.new(bs.outputs[0], out.inputs[0])
    if alpha:
        gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.5
        nt.links.new(tx.outputs["Alpha"], gt.inputs[0]); nt.links.new(gt.outputs[0], bs.inputs["Alpha"])
        try: m.surface_render_method = "DITHERED"
        except Exception: pass
    me.materials.append(m)
Wm = R["W"]
for i, n in enumerate(names):
    g = ob.vertex_groups.new(name=n)
    for k in np.nonzero(Wm[:, i] > 1e-4)[0]: g.add([int(k)], float(Wm[k, i]), "REPLACE")
ob.parent = arm; mod = ob.modifiers.new("Armature", "ARMATURE"); mod.object = arm
ad = arm.animation_data_create()
clips = []
if ANP != "-":
    AN = np.load(ANP, allow_pickle=True); clips = json.loads(str(AN["clips"]))
    for c in clips:
        q = AN["q_" + c]; loc = AN["l_" + c] * S; nf = len(q)
        act = bpy.data.actions.new(c); act.use_fake_user = True; ad.action = act
        slot = act.slots.new(id_type="OBJECT", name="waitress_rig") if len(act.slots) == 0 else act.slots[0]
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
sc.render.fps = 30; sc.frame_start = 1
if clips: sc.frame_end = int(max(bpy.data.actions[c].frame_range[1] for c in clips)) + 1
for o in bpy.data.objects: o.select_set(o in (ob, arm))
bpy.context.view_layer.objects.active = arm
if OUT.endswith(".glb"):
    bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_apply=True, export_animations=bool(clips), export_animation_mode="NLA_TRACKS",
                              export_force_sampling=True, export_frame_step=1, export_anim_slide_to_zero=True, export_optimize_animation_size=False,
                              export_reset_pose_bones=True, export_yup=True)
    print("BUILD exported", OUT, len(clips), "clips")
bpy.ops.wm.save_as_mainfile(filepath=os.path.splitext(OUT)[0] + ".blend")
print("BUILD saved blend", len(me.vertices), "verts", len(me.polygons), "tris")
