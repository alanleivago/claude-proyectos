"""Export out/girl_anim.glb (mesh + Zero-fem rig + every zero_anim action + the author's 3 poses) and
out/face_tracks.json / out/actions.json in the format of pieces/zero-fem/anim (what engine/shots.js loads).
exec in Blender after build.py + poses.py make_all():  exec(open(r".../export.py").read())
"""
import bpy, json, os

ROOT = r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl"
ZANIM = r"/Users/alanleiva/claude-proyectos/pieces/zero-fem/anim"
NEW = {"tut_idle": (41, True, "smile"), "tut_hip": (48, True, "talkO"), "tut_run": (17, True, None)}

for f in ("render.py", "poses.py"):
    exec(open(os.path.join(ROOT, f)).read())
unlit(False); set_face("open", "neutral")

faces = json.load(open(os.path.join(ZANIM, "face_tracks.json")))
lib = json.load(open(os.path.join(ZANIM, "actions.json")))
for n, (fr, loop, mouth) in NEW.items():
    if mouth:   # blink once per loop, like zero_fem's idle
        faces[n] = [[1, "open", mouth], [fr - 12, "half", mouth], [fr - 11, "blink", mouth], [fr - 9, "half", mouth], [fr - 8, "open", mouth]]
    else:
        faces[n] = [[1, "angry", "talkA"]]
    lib[n] = {"frames": fr - 1, "loop": loop, "source": "MercurialForge video DqntXa7dOO8, 12:14-12:50"}

arm = bpy.data.objects["Armature"]; ad = arm.animation_data
names = [n for n in faces if bpy.data.actions.get(n)]
missing = [n for n in faces if not bpy.data.actions.get(n)]
for t in list(ad.nla_tracks): ad.nla_tracks.remove(t)
for n in names:
    act = bpy.data.actions[n]; tr = ad.nla_tracks.new(); tr.name = n
    st = tr.strips.new(n, 1, act); st.action_frame_start, st.action_frame_end = act.frame_range
ad.action = None
for pb in arm.pose.bones: pb.matrix_basis.identity()
sc = bpy.context.scene; sc.render.fps = 30; sc.render.fps_base = 1.0
sc.frame_start, sc.frame_end = 1, int(max(bpy.data.actions[n].frame_range[1] for n in names)) + 1
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
for o in bpy.data.objects:
    o.select_set(o.name in ("Girl", "Armature"))
bpy.context.view_layer.objects.active = arm
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, "out", "girl_anim.glb"), use_selection=True, export_apply=True,
    export_animations=True, export_animation_mode="NLA_TRACKS", export_force_sampling=True, export_frame_step=1,
    export_anim_slide_to_zero=True, export_optimize_animation_size=False, export_reset_pose_bones=True, export_yup=True)
json.dump({n: faces[n] for n in names}, open(os.path.join(ROOT, "out", "face_tracks.json"), "w"), indent=1)
json.dump({n: lib[n] for n in names if n in lib}, open(os.path.join(ROOT, "out", "actions.json"), "w"), indent=1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "out", "girl.blend"), copy=True)
print("EXPORT", len(names), "actions; missing:", missing)
