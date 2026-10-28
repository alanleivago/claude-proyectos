# Rig de la heroina con el MISMO esqueleto de 23 huesos que zero_fem (nombres, rolls, IK de piernas),
# para reutilizar pieces/zero-fem/anim/build_anim.py. Pasa la malla a unidades de Zero (suela z=-9, 1.70 m = 13.2 u).
# blender -b out/heroine_tex.blend --python rig.py   -> out/heroine_rig.blend
import bpy, os
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ZERO = os.path.join(HERE, '..', '..', 'zero-fem', 'out', 'zero_fem.blend')
K, FLOOR = 7.76, -9.0
def U(x, y, z): return Vector((x * K, y * K, z * K + FLOOR))

meshes = [bpy.data.objects[n] for n in ('Body', 'Head', 'Hair')]
for ob in meshes:
    me = ob.data
    for v in me.vertices: v.co = U(*v.co)
    me.update()

with bpy.data.libraries.load(ZERO, link=False) as (src, dst):
    dst.objects = ['Armature']
arm = dst.objects[0]
bpy.context.scene.collection.objects.link(arm)
arm.animation_data_clear()
for pb in arm.pose.bones:
    pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)

# articulaciones en metros (medidas sobre la hoja 3); +X = izquierda del personaje
J = {}
for s, m in (('L', 1), ('R', -1)):
    sh, el, wr, tip = (0.17 * m, -0.018, 1.29), (0.40 * m, -0.018, 1.29), (0.60 * m, -0.018, 1.29), (0.71 * m, -0.018, 1.29)
    hip, knee, ank, toe = (0.10 * m, 0.003, 0.84), (0.098 * m, -0.008, 0.56), (0.112 * m, 0.026, 0.12), (0.112 * m, -0.15, 0.03)
    J[f'UpperArm.{s}'] = (sh, el); J[f'Forearm.{s}'] = (el, wr); J[f'Hand.{s}'] = (wr, tip)
    J[f'Thigh.{s}'] = (hip, knee); J[f'Calf.{s}'] = (knee, ank); J[f'Foot.{s}'] = (ank, toe)
    J[f'FootControl.{s}'] = (ank, (ank[0], ank[1] + 0.17, ank[2]))
    J[f'FootRotation.{s}'] = ((ank[0], ank[1], ank[2] - 0.088), (toe[0], toe[1], toe[2] - 0.088))
    J[f'FootPoleTarget.{s}'] = ((knee[0], -0.65, knee[2]), (knee[0], -0.81, knee[2]))
J['Pelvis'] = ((0, 0, 0.80), (0, 0, 1.07))
J['Chest'] = ((0, 0, 1.07), (0, 0, 1.36))
J['Neck'] = ((0, 0, 1.36), (0, 0, 1.405))
J['Head'] = ((0, 0, 1.405), (0, 0, 1.69))
J['Hair'] = ((0, 0.08, 1.55), (0, 0.12, 1.13))

bpy.context.view_layer.objects.active = arm
for o in bpy.context.scene.objects: o.select_set(o == arm)
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones
for name, (h, t) in J.items():
    b = eb[name]; roll = b.roll
    b.use_connect = False
    b.head = U(*h); b.tail = U(*t); b.roll = roll
for name in ('Chest', 'Neck', 'Head', 'Forearm.L', 'Forearm.R', 'Hand.L', 'Hand.R', 'Calf.L', 'Calf.R', 'Foot.L', 'Foot.R'):
    pass  # sin use_connect: las cabezas ya coinciden con las colas
bpy.ops.object.mode_set(mode='OBJECT')

HELPERS = [b.name for b in arm.data.bones if b.name.startswith(('FootControl', 'FootRotation', 'FootPoleTarget'))]
for n in HELPERS + ['Hair']: arm.data.bones[n].use_deform = False

# cuerpo: pesos automaticos
body = bpy.data.objects['Body']
for o in bpy.context.scene.objects: o.select_set(o in (body, arm))
bpy.context.view_layer.objects.active = arm
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
empty = sum(1 for v in body.data.vertices if not v.groups)
print('BODY verts sin peso', empty, 'grupos', len(body.vertex_groups))

# cabeza: rigida a Head; pelo: Head arriba, Hair abajo (rampa)
def rigid(ob, fn):
    ob.vertex_groups.clear()
    groups = {}
    for v in ob.data.vertices:
        for g, w in fn(v.co).items():
            if w <= 0: continue
            if g not in groups: groups[g] = ob.vertex_groups.new(name=g)
            groups[g].add([v.index], w, 'REPLACE')
    mod = ob.modifiers.new('Armature', 'ARMATURE'); mod.object = arm
    ob.parent = arm; ob.matrix_parent_inverse = arm.matrix_world.inverted()
rigid(bpy.data.objects['Head'], lambda c: {'Head': 1.0})
z0, z1 = 1.42 * K + FLOOR, 1.13 * K + FLOOR
def hairw(c):
    t = min(1, max(0, (z0 - c.z) / (z0 - z1))) * (1 if c.y > -0.02 * K else 0.5)
    return {'Head': 1 - t, 'Hair': t}
rigid(bpy.data.objects['Hair'], hairw)
for n in ['Hair']: arm.data.bones[n].use_deform = True
for n in HELPERS: arm.data.bones[n].use_deform = True    # igual que zero_fem
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'out', 'heroine_rig.blend'))
print('SAVED')
