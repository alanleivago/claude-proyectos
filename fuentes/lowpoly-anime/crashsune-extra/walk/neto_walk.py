"""blender -b <COPIA de neto.blend> --python neto_walk.py -- <out.glb> [render_dir]
Walk cycle in-place (Crashsune: contact/down/passing/up cada 3 frames, 24 fps, 24 frames) sobre el Rigify de NETO512."""
import bpy, sys, os, math
from mathutils import Quaternion, Vector
from bpy_extras import anim_utils

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else None
RDIR = argv[1] if len(argv) > 1 else None

sc = bpy.context.scene
rig = bpy.data.objects["rig"]
sc.render.fps = 24                      # neto.blend viene a 12 fps: el exportador convierte frames con scene fps
sc.frame_start, sc.frame_end = 1, 24    # 25 == 1, no se reproduce dos veces

# ---- parametros (metros / grados); NETO mide 1.63 m, cadera a 0.93 m ----
S = 0.18          # medio paso: pie delantero +S, trasero -S (paso completo 0.36 m)
LEAN = 5          # inclinacion adelante constante del torso ("caer hacia delante")
HIP_YAW, HIP_ROLL = 8, 4
CHEST_YAW, CHEST_ROLL = 5, 2
ARM = 20          # swing del brazo
SPEED = 2 * S / 12 * sc.render.fps   # m/s que debe avanzar el personaje en three.js

for side in "LR":
    rig.pose.bones[f"upper_arm_parent.{side}"]["IK_FK"] = 1.0   # brazos en FK (1 = FK en Rigify)
    rig.pose.bones[f"thigh_parent.{side}"]["IK_FK"] = 0.0       # piernas en IK

act = bpy.data.actions.new("walk"); act.use_fake_user = True
rig.animation_data_create(); rig.animation_data.action = act


def q_arm(pitch=0, roll=0, yaw=0):
    """rotacion en ejes del ARMATURE (X lateral, -Y delante, Z arriba): pitch, luego roll, luego yaw"""
    r = math.radians
    return Quaternion((0, 0, 1), r(yaw)) @ Quaternion((0, 1, 0), r(roll)) @ Quaternion((1, 0, 0), r(pitch))


def key(bone, f, loc=None, **rot):
    pb = rig.pose.bones[bone]
    R = pb.bone.matrix_local.to_3x3()
    if loc is not None:
        pb.location = R.inverted() @ Vector(loc)
        pb.keyframe_insert("location", frame=f, group=bone)
    if rot:
        Rq = R.to_quaternion()
        ql = Rq.inverted() @ q_arm(**rot) @ Rq          # eje del armature -> eje local del hueso
        if pb.rotation_mode == "QUATERNION":
            pb.rotation_quaternion = ql; pb.keyframe_insert("rotation_quaternion", frame=f, group=bone)
        else:
            pb.rotation_euler = ql.to_euler(pb.rotation_mode); pb.keyframe_insert("rotation_euler", frame=f, group=bone)


# ---- pierna: tabla por FASE (0..23); la L usa fase=f-1, la R fase=f-1+12 ----
# (adelante, altura, pitch del pie [+ = punta abajo], roll de talon [foot_heel_ik])
LEG = {
    0:  (+S,        0.00, -20,  0),   # CONTACT delante: talon apoya, punta arriba
    3:  (+S - 0.09, 0.00,   0,  0),   # DOWN: pie plano, recibe el peso
    6:  (0.00,      0.00,   0,  0),   # PASSING: bajo la cadera
    9:  (-0.09,     0.00,   0, 15),   # UP: el talon empieza a subir
    12: (-S,        0.00,   0, 30),   # CONTACT detras: solo la punta toca (ella: 24.9 grados)
    15: (-S + 0.05, 0.07,  35,  0),   # DOWN (despegue): pie atras y arriba, punta colgando
    18: (0.00,      0.09,  20,  0),   # PASSING (swing): pie mas alto
    21: (+S - 0.06, 0.05,  -5,  0),   # UP: la pierna se estira hacia delante
}
POSE_F = [1, 4, 7, 10, 13, 16, 19, 22, 25]
for side, off in (("L", 0), ("R", 12)):
    for f in POSE_F:
        fwd, z, pitch, heel = LEG[(f - 1 + off) % 24]
        key(f"foot_ik.{side}", f, loc=(0, -fwd, z), pitch=pitch)
        key(f"foot_heel_ik.{side}", f, pitch=heel)

TZ = {1: -0.03, 4: -0.06, 7: -0.02, 10: 0.0}     # down = mas bajo, up = mas alto
for f in POSE_F:
    key("torso", f, loc=(0, 0, TZ[1 + (f - 1) % 12]), pitch=LEAN)

for f in POSE_F:
    s = 1 if (f - 1) % 24 < 12 else -1        # frames 1-12: pierna L delante en contact
    k = (f - 1) % 12                          # 0 contact, 3 down, 6 passing, 9 up
    yaw_h = {0: -HIP_YAW, 3: -HIP_YAW * .6, 6: 0, 9: HIP_YAW * .5}[k] * s
    roll_h = {0: 0, 3: -1, 6: -HIP_ROLL, 9: -1}[k] * s
    key("hips", f, yaw=yaw_h, roll=roll_h, pitch={3: 3}.get(k, 0))
    key("chest", f, yaw=-yaw_h * CHEST_YAW / HIP_YAW, roll=-roll_h * CHEST_ROLL / HIP_ROLL,
        pitch={0: -2, 3: 1, 6: 3, 9: 0}[k])
    for side, sg in (("L", 1), ("R", -1)):
        a = s * sg                                                # +1 = este brazo va hacia atras
        swing = {0: ARM, 3: ARM * 1.1, 6: ARM * .25, 9: -ARM * .6}[k] * a
        fore = {0: -6 if a > 0 else -25, 3: -4 if a > 0 else -18, 6: -12, 9: -15 if a > 0 else -6}[k]
        out = {6: -5}.get(k, 0) * sg                              # arco hacia fuera en passing
        key(f"upper_arm_fk.{side}", f, pitch=swing, roll=out)
        key(f"forearm_fk.{side}", f, pitch=fore)
        key(f"hand_fk.{side}", f, pitch=fore * 0.6)
        key(f"shoulder.{side}", f, yaw={0: 5, 3: 4, 6: 0, 9: -3}[k] * s, roll={0: -2, 3: 0, 6: 3, 9: 0}[k] * sg)
    key("head", f, pitch={0: 0, 3: 3, 6: 1, 9: -2}[k])

# ---- curvas: Blender 5.x -> channelbag; ciclo + tangentes + desfases ----
cb = anim_utils.action_get_channelbag_for_slot(act, rig.animation_data.action_slot)


def shift(prefix, n):
    for fc in cb.fcurves:
        if fc.data_path.startswith(f'pose.bones["{prefix}'):
            for kp in fc.keyframe_points:
                kp.co.x += n; kp.handle_left.x += n; kp.handle_right.x += n


shift("hand_fk", 2)      # la mano arrastra 2 frames detras del antebrazo
shift("forearm_fk", 1)   # antebrazo 1 frame detras del brazo
shift("head", 1)         # cabeza 1 frame tarde
for fc in cb.fcurves:
    for kp in fc.keyframe_points:
        kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"
    if not any(m.type == "CYCLES" for m in fc.modifiers):
        fc.modifiers.new("CYCLES")
    for side, planted in (("L", (1, 4, 7, 10)), ("R", (13, 16, 19, 22))):
        if fc.data_path == f'pose.bones["foot_ik.{side}"].location' and fc.array_index == 1:
            for kp in fc.keyframe_points:
                if kp.co.x in planted: kp.interpolation = "LINEAR"   # pie apoyado = velocidad constante
    fc.update()
act.use_frame_range = True; act.frame_start, act.frame_end = 1, 25; act.use_cyclic = True
print("FCURVES", len(cb.fcurves), "SPEED m/s", round(SPEED, 3), "layers", len(act.layers))

for f in range(1, 26):
    sc.frame_set(f)
    p = rig.matrix_world @ rig.pose.bones["DEF-foot.L"].head
    t = rig.matrix_world @ rig.pose.bones["DEF-toe.L"].tail
    print(f"F{f:02d} footL y={p.y:+.3f} z={p.z:.3f} toe z={t.z:.3f}")

if RDIR:
    os.makedirs(RDIR, exist_ok=True)
    cam = bpy.data.objects.new("walkcam", bpy.data.cameras.new("walkcam"))
    sc.collection.objects.link(cam); sc.camera = cam
    cam.data.type = "ORTHO"; cam.data.ortho_scale = 2.0
    cam.location = (4, 0, 0.85); cam.rotation_euler = (math.radians(90), 0, math.radians(90))
    sc.render.engine = "BLENDER_WORKBENCH"; sc.render.resolution_x = sc.render.resolution_y = 400
    sc.render.resolution_percentage = 100
    ims = sc.render.image_settings
    if hasattr(ims, "media_type"): ims.media_type = "IMAGE"   # 5.x: el .blend trae salida de video
    ims.file_format = "PNG"
    for f in (1, 4, 7, 10, 13, 16, 19, 22):
        sc.frame_set(f); sc.render.filepath = os.path.join(RDIR, f"side_{f:02d}.png")
        bpy.ops.render.render(write_still=True)
    cam.location = (0, -4, 0.85); cam.rotation_euler = (math.radians(90), 0, 0)
    for f in (1, 7, 13, 19):
        sc.frame_set(f); sc.render.filepath = os.path.join(RDIR, f"front_{f:02d}.png")
        bpy.ops.render.render(write_still=True)

if OUT:
    keep = {"rig"} | {o.name for o in bpy.data.objects if o.parent == rig and o.type == "MESH"}
    for o in bpy.data.objects: o.select_set(o.name in keep)
    bpy.context.view_layer.objects.active = rig
    tr = rig.animation_data.nla_tracks.new(); tr.name = "walk"          # una pista NLA = una animacion glTF con nombre
    st = tr.strips.new("walk", 1, act); st.action_frame_start, st.action_frame_end = 1, 25
    rig.animation_data.action = None
    bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_def_bones=True,
        export_animations=True, export_animation_mode="NLA_TRACKS", export_force_sampling=True,
        export_frame_step=1, export_anim_slide_to_zero=True, export_optimize_animation_size=False,
        export_reset_pose_bones=True, export_yup=True)
    print("EXPORTED", OUT, os.path.getsize(OUT))
