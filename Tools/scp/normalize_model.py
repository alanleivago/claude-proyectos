"""Normalise an SCP:CB character GLB to metres, feet on y=0, standing upright; optional named clips.
Usage: Blender -b -P normalize_model.py -- in.glb out.glb <height_m> [rotx_deg|auto] [clips: name:start:end,...]
Height is measured in the rest pose (0.2-99.8 percentile, CB meshes carry a few stray verts).
Transform goes on a new root node 'SCP_Root' (skinning/animation untouched). Clips are NLA tracks
cut from CB's single long action (frame ranges from AnimateNPC() in NPCs.bb)."""
import bpy, sys, math
import numpy as np
from mathutils import Matrix, Vector
argv = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT, H = argv[0], argv[1], float(argv[2])
ROT = argv[3] if len(argv) > 3 else '0'
CLIPS = argv[4] if len(argv) > 4 else ''

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
sc = bpy.context.scene
tops = [o for o in sc.objects if o.parent is None]
root = bpy.data.objects.new('SCP_Root', None); sc.collection.objects.link(root)
for o in tops:
    mw = o.matrix_world.copy(); o.parent = root; o.matrix_world = mw
for a in bpy.data.armatures: a.pose_position = 'REST'

def verts():
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get()
    return np.array([tuple(o.matrix_world @ v.co) for o in sc.objects if o.type == 'MESH' for v in o.evaluated_get(dg).to_mesh().vertices])

def head_z():
    for o in sc.objects:
        if o.type == 'ARMATURE':
            for b in o.data.bones:
                if 'head' in b.name.lower(): return (o.matrix_world @ b.head_local).z
    return None

if ROT == 'auto':  # lying model: pick the +-90 deg X rotation that puts the head bone on top
    best = None
    for r in (90, -90):
        root.matrix_world = Matrix.Rotation(math.radians(r), 4, 'X'); bpy.context.view_layer.update()
        P = verts(); hz = head_z(); s = hz - np.median(P[:, 2]) if hz is not None else 0
        if best is None or s > best[0]: best = (s, r)
    ROT = best[1]
R = Matrix.Rotation(math.radians(float(ROT)), 4, 'X')
root.matrix_world = R
P = verts()
lo, hi = np.percentile(P, 0.2, 0), np.percentile(P, 99.8, 0)
s = H / (hi[2] - lo[2])
root.matrix_world = Matrix.Diagonal((s, s, s, 1)) @ R
P = verts(); lo, hi = np.percentile(P, 0.2, 0), np.percentile(P, 99.8, 0)
root.matrix_world = Matrix.Translation(Vector((-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -lo[2]))) @ root.matrix_world
P = verts(); lo, hi = np.percentile(P, 0.2, 0), np.percentile(P, 99.8, 0)
print('NORM rot %s scale %.5f -> size %.2f x %.2f x %.2f m, feet z %.3f' % (ROT, s, *(hi - lo), lo[2]))
for a in bpy.data.armatures: a.pose_position = 'POSE'

mode = 'ACTIONS'
if CLIPS:
    arm = next(o for o in sc.objects if o.type == 'ARMATURE')
    act = arm.animation_data.action if arm.animation_data else None
    if act is None and bpy.data.actions: act = bpy.data.actions[0]
    ad = arm.animation_data or arm.animation_data_create()
    for c in CLIPS.split(','):  # the original long action is still exported as 'anim'
        n, a0, a1 = c.split(':')
        tr = ad.nla_tracks.new(); tr.name = n
        st = tr.strips.new(n, 0, act); st.action_frame_start = int(a0); st.action_frame_end = int(a1)  # clip starts at t=0
        if hasattr(st, 'action_slot') and act.slots: st.action_slot = act.slots[0]
    ad.action = None
    mode = 'NLA_TRACKS'
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_animations=True, export_animation_mode=mode,
                          export_image_format='AUTO', export_yup=True)
print('WROTE', OUT)
