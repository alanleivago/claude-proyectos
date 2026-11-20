"""SCP:CB .rmesh room -> GLB (Blender headless).
Usage: Blender -b -P build_room.py -- <map_dir> <props_glb_dir> <rmesh> <out.glb>

Coordinates: rmesh units * (1/144) = metres (CB eye height 0.9 game units = 1.6 m, 1 game unit = 256 rmesh units).
Blitz3D is left-handed (x right, y up, z fwd); mirrored to Blender as (x, z, y) -> glTF (x, y, -z).
Materials: baseColor = diffuse (UV0); emissiveTexture = baked lightmap (UV1, 'LM').
In three.js use the emissive map as MeshBasicMaterial.lightMap (lightMapIntensity ~2) for CB's look.
"""
import bpy, sys, os, math
from mathutils import Matrix, Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rmesh import read_rmesh

argv = sys.argv[sys.argv.index('--') + 1:]
MAP, PROPS, SRC, OUT = argv[:4]
DOORS = argv[4] if len(argv) > 4 else None  # doors.json + room key, e.g. doors.json:checkpoint1

S = 1.0 / 144.0

bpy.ops.wm.read_factory_settings(use_empty=True)

files = {}
for root, _, fs in os.walk(MAP):
    for f in fs:
        files.setdefault(f.lower(), os.path.join(root, f))

def img(name):
    p = files.get(os.path.basename(name.replace('\\', '/')).lower())
    if not p:
        print('MISSING TEXTURE', name); return None
    return bpy.data.images.load(p, check_existing=True)

mats = {}
def material(diff, lm):
    key = (diff, lm)
    if key in mats: return mats[key]
    (dflag, dname), (lflag, lname) = diff, lm
    m = bpy.data.materials.new((os.path.splitext(dname)[0] or 'blank') + ('+' + os.path.splitext(lname)[0] if lname else ''))
    m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes['Principled BSDF']
    bsdf.inputs['Roughness'].default_value = 1.0
    alpha = dflag == 3 or lflag == 3
    if dname:
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = img(dname); t.interpolation = 'Closest'
        uv = nt.nodes.new('ShaderNodeUVMap'); uv.uv_map = 'UVMap'
        nt.links.new(uv.outputs[0], t.inputs[0]); nt.links.new(t.outputs['Color'], bsdf.inputs['Base Color'])
        if alpha and t.image:
            nt.links.new(t.outputs['Alpha'], bsdf.inputs['Alpha'])
    if lname:
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = img(lname)
        uv = nt.nodes.new('ShaderNodeUVMap'); uv.uv_map = 'LM'
        nt.links.new(uv.outputs[0], t.inputs[0]); nt.links.new(t.outputs['Color'], bsdf.inputs['Emission Color'])
        bsdf.inputs['Emission Strength'].default_value = 1.0
    if alpha:
        m.surface_render_method = 'BLENDED'
    mats[key] = m
    return m

data = read_rmesh(SRC)
name = os.path.splitext(os.path.basename(OUT))[0]
verts, faces, uv0, uv1, fmat, slots = [], [], [], [], [], []
for s in data['surfaces']:
    if not s['tris']: continue
    if s['diff'][1] == '' and s['lm'][1] == '': continue  # untextured helper surface
    m = material(s['diff'], s['lm'])
    if m not in slots: slots.append(m)
    mi = slots.index(m); base = len(verts)
    for x, y, z, u0, v0, u1, v1, c in s['verts']:
        verts.append((x * S, z * S, y * S))
    for a, b, c in s['tris']:
        if a == b or b == c or a == c: continue
        faces.append((base + a, base + c, base + b)); fmat.append(mi)  # mirror flips handedness -> reverse winding
        for k in (a, b, c):
            v = s['verts'][k]; uv0.append((v[3], 1 - v[4])); uv1.append((v[5], 1 - v[6]))

me = bpy.data.meshes.new(name)
me.from_pydata(verts, [], faces)
for m in slots: me.materials.append(m)
l0 = me.uv_layers.new(name='UVMap'); l1 = me.uv_layers.new(name='LM')
for i, l in enumerate(me.loops):
    l0.data[i].uv = uv0[i]; l1.data[i].uv = uv1[i]
print('faces', len(me.polygons), len(fmat))
ma = me.attributes.get('material_index') or me.attributes.new('material_index', 'INT', 'FACE')
ma.data.foreach_set('value', fmat)
me.validate(); me.update()
print('material slots used', len(set(p.material_index for p in me.polygons)), 'of', len(slots))
room = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(room)
bpy.context.view_layer.objects.active = room; room.select_set(True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.0001); bpy.ops.object.mode_set(mode='OBJECT')

# props placed by the rmesh "model" entities (GFX/map/Props/*.x, converted with assimp)
SW = Matrix(((1, 0, 0, 0), (0, 0, 1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))  # Blitz <-> Blender mirror
def blitz_rot(p, y, r):
    p, y, r = map(math.radians, (p, y, r))
    ry = Matrix(((math.cos(y), 0, -math.sin(y)), (0, 1, 0), (math.sin(y), 0, math.cos(y))))
    rx = Matrix(((1, 0, 0), (0, math.cos(p), -math.sin(p)), (0, math.sin(p), math.cos(p))))
    rz = Matrix(((math.cos(r), -math.sin(r), 0), (math.sin(r), math.cos(r), 0), (0, 0, 1)))
    return (ry @ rx @ rz).to_4x4()

cache = {}
def prop(fname):
    key = os.path.splitext(fname.lower())[0]
    if key in cache: return cache[key]
    p = os.path.join(PROPS, key + '.glb')
    if not os.path.exists(p): print('MISSING PROP', fname); cache[key] = None; return None
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=p)
    new = [o for o in bpy.data.objects if o not in before and o.type == 'MESH']
    for o in new:
        o.select_set(True)
    # bake glTF->Blender import transforms, join into one mesh, unlink from the scene
    bpy.context.view_layer.objects.active = new[0]
    bpy.ops.object.select_all(action='DESELECT')
    for o in new: o.select_set(True)
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if len(new) > 1: bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active
    for x in [x for x in bpy.data.objects if x not in before and x != o]: bpy.data.objects.remove(x)
    for mat in o.data.materials:
        if not mat or not mat.use_nodes: continue
        for n in mat.node_tree.nodes:
            if n.type == 'TEX_IMAGE':
                if n.image is None or not os.path.exists(bpy.path.abspath(n.image.filepath)):
                    src = n.image.name if n.image else mat.name
                    n.image = img(os.path.basename(n.image.filepath if n.image else src))
                n.interpolation = 'Closest'
        b = mat.node_tree.nodes.get('Principled BSDF')
        if b:  # props get no lightmap in CB (dynamic light); flat emissive keeps them visible unlit
            b.inputs['Emission Color'].default_value = (0.55, 0.55, 0.55, 1); b.inputs['Emission Strength'].default_value = 1.0
    for col in list(o.users_collection): col.objects.unlink(o)
    cache[key] = o.data
    return o.data

n = 0
for e in data['entities']:
    if e['type'] != 'model' or not e.get('file'): continue
    md = prop(e['file'])
    if md is None: continue
    o = bpy.data.objects.new('prop_' + e['file'], md); bpy.context.scene.collection.objects.link(o)
    mb = Matrix.Translation(Vector(e['pos']) * S) @ blitz_rot(*e['rot']) @ Matrix.Diagonal((*[v * S for v in e['scale']], 1))
    o.matrix_world = SW @ mb @ SW  # prop mesh is already in mirrored (Blender) space
    o.parent = room; o.matrix_parent_inverse = room.matrix_world.inverted(); n += 1
print('props placed', n)

# doors: CB spawns them from code (FillRoom + CreateMap), not from the rmesh. Closed doors, CB models.
def place(md, pos, yaw, scale):
    o = bpy.data.objects.new('door_' + md.name, md); bpy.context.scene.collection.objects.link(o)
    o.matrix_world = SW @ (Matrix.Translation(Vector(pos) * S) @ blitz_rot(0, yaw, 0) @ Matrix.Diagonal((*[v * S for v in scale], 1))) @ SW
    o.parent = room; o.matrix_parent_inverse = room.matrix_world.inverted()
def door(pos, ang, big):
    if big == 1:
        for k in ('contdoorleft', 'contdoorright'):
            md = prop(k + '.x'); md and place(md, pos, ang, (55, 55, 55))
        return
    frame = prop('doorframe.x'); frame and place(frame, pos, ang, (1, 1, 1))
    if big == 0:
        md = prop('door01.x')
        if md:
            xs = [v.co.x for v in md.vertices]; ys = [v.co.y for v in md.vertices]; zs = [v.co.z for v in md.vertices]
            sc = (204 / (max(xs) - min(xs)), 312 / (max(zs) - min(zs)), 16 / (max(ys) - min(ys)))  # Blender y = Blitz z
            place(md, pos, ang, sc); place(md, pos, ang + 180, sc)
    else:
        names = ('heavydoor1', 'heavydoor2') if big == 2 else ('elevatordoor', 'elevatordoor')
        for k, a in zip(names, (ang, ang + 180)):
            md = prop(k + ('.b3d' if k == 'elevatordoor' else '.x')); md and place(md, pos, a, (1, 1, 1))
if DOORS:
    import json
    from mathutils.bvhtree import BVHTree
    jf, key = DOORS.rsplit(':', 1)
    dl = json.load(open(jf)).get(key, [])
    bvh = BVHTree.FromObject(room, bpy.context.evaluated_depsgraph_get())
    bl = lambda x, y, z: Vector((x * S, z * S, y * S))
    for bx, bz, ang, dx, dz in ((0, 1024, 0, 0, 1), (0, -1024, 0, 0, -1), (1024, 0, 90, 1, 0), (-1024, 0, 90, -1, 0)):
        if any(abs(d['pos'][0] - bx) < 200 and abs(d['pos'][2] - bz) < 200 for d in dl): continue
        start = bl(bx - dx * 80, 150, bz - dz * 80)
        wall = bvh.ray_cast(start, bl(dx, 0, dz).normalized(), 200 * S)[0]
        floor = bvh.ray_cast(start, Vector((0, 0, -1)), 400 * S)[0]
        if wall is None and floor is not None: dl.append({'pos': [bx, 0, bz], 'angle': ang, 'big': 0})
    for d in dl: door(d['pos'], d['angle'], d['big'])
    print('doors placed', len(dl))

for m in bpy.data.materials: m.use_backface_culling = True  # glTF doubleSided=false: camera can sit outside a wall for cutaway shots
os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_image_format='AUTO', export_apply=True,
                          export_texcoords=True, export_normals=True, export_materials='EXPORT', use_selection=False)
print('WROTE', OUT, len(me.polygons), 'tris', len(slots), 'materials')
