"""Import a room GLB in Blender, check it, render an eye-level still (sharp + DOF).
Usage: Blender -b -P check_render_room.py -- <room.glb> <out_prefix> [cx cy cz yaw_deg]
Prints a CHECK line: size, tris, images, floor normal ratio. cam override in glTF metres (x, y-up, z) + yaw."""
import bpy, sys, os, math, json
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]
GLB, OUT = argv[:2]
override = argv[2:6] if len(argv) >= 6 else None  # cy = 'f' -> 1.6 m above the floor at (cx, cz)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
sc = bpy.context.scene
objs = [o for o in sc.objects if o.type == 'MESH']
room = max(objs, key=lambda o: len(o.data.polygons))
dg = bpy.context.evaluated_depsgraph_get()
pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
lo = Vector([min(p[i] for p in pts) for i in range(3)]); hi = Vector([max(p[i] for p in pts) for i in range(3)])
tris = sum(len(o.data.polygons) for o in objs)
imgs = [i for i in bpy.data.images if i.size[0] > 0]
missing_tex = sum(1 for m in bpy.data.materials if m.use_nodes and not any(n.type == 'TEX_IMAGE' and n.image for n in m.node_tree.nodes))

# normals: vertical scan lines -> lowest hit should face up (floor), hits above floors should face down (ceilings)
up = down = 0
def hits(x, y):
    out, z = [], hi.z + 1
    while True:
        ok, loc, nor, *_ = sc.ray_cast(dg, Vector((x, y, z)), Vector((0, 0, -1)))
        if not ok: return out
        out.append((loc.z, nor.z)); z = loc.z - 0.002
spots = []
N = 28
for i in range(N):
    for j in range(N):
        x = lo.x + (hi.x - lo.x) * (i + .5) / N; y = lo.y + (hi.y - lo.y) * (j + .5) / N
        h = hits(x, y)
        if h:
            if h[-1][1] > 0.5: up += 1
            elif h[-1][1] < -0.5: down += 1
        # interior spaces: a floor (normal up) whose next hit above is a ceiling (normal down) >= 2.4 m higher
        for k in range(len(h) - 1, 0, -1):
            fz, fn = h[k]; cz, cn = h[k - 1]
            if fn > 0.7 and cn < -0.3 and cz - fz >= 2.4:
                spots.append(Vector((x, y, fz + 1.6)))
floor_ok = up / max(1, up + down)
ground = [p for p in spots if abs(p.z - 1.6) < 0.6]
if ground: spots = ground  # prefer the main floor (y ~ 0)

def free(p, d):
    ok, loc, *_ = sc.ray_cast(dg, p, d)
    return (loc - p).length if ok else 0.0

best = None
if override:
    cx, cz, yaw = float(override[0]), float(override[2]), float(override[3])
    if override[1] == 'f':
        h = hits(cx, -cz)
        fl = [h[k][0] for k in range(len(h) - 1, 0, -1) if h[k][1] > 0.7 and h[k - 1][1] < -0.3 and h[k - 1][0] - h[k][0] >= 2.4]
        cy = (fl[0] if fl else 0) + 1.6  # lowest storey
    else: cy = float(override[1])
    cam_p = Vector((cx, -cz, cy)); a = math.radians(yaw)
    cam_d = Vector((math.sin(a), -math.cos(a), 0))
else:
    for p in spots:
        side = min(free(p, Vector((math.cos(t), math.sin(t), 0))) or 99 for t in [k * math.pi / 4 for k in range(8)])
        if side < 0.8: continue  # too close to a wall
        for k in range(16):
            t = k * math.pi / 8; d = Vector((math.cos(t), math.sin(t), 0))
            dist = free(p, d)
            if dist == 0: continue  # looking out of a doorway into the void
            # want 6-14 m of depth; and the view cone edges must hit geometry too
            l = free(p, Vector((math.cos(t + .35), math.sin(t + .35), 0))); r = free(p, Vector((math.cos(t - .35), math.sin(t - .35), 0)))
            if l == 0 or r == 0: continue
            s = min(dist, 14) - max(0, dist - 18) * 0.3 + 0.3 * min(l, r, 8) - 0.05 * p.xy.length
            if best is None or s > best[0]: best = (s, p.copy(), d)
    if best is None:
        cam_p = (lo + hi) / 2; cam_p.z = lo.z + 1.6; cam_d = Vector((0, 1, 0))
    else:
        _, cam_p, cam_d = best

for m in bpy.data.materials: m.use_backface_culling = True  # what three.js FrontSide shows: inverted faces would vanish
# unlit CB look, done in sRGB like Blitz3D: c = diffuse * (lightmap + ambient) * 2, ambient ~0.2 (options.ini brightness 50)
# props have no lightmap: flat grey instead
def raw(sock):
    n = sock.node
    if n.type == 'TEX_IMAGE' and n.image: n.image.colorspace_settings.name = 'Non-Color'
    return sock
for m in bpy.data.materials:
    if not m.use_nodes: continue
    nt = m.node_tree; b = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if not b: continue
    base = raw(b.inputs['Base Color'].links[0].from_socket) if b.inputs['Base Color'].links else None
    emi = raw(b.inputs['Emission Color'].links[0].from_socket) if b.inputs['Emission Color'].links else None
    add = nt.nodes.new('ShaderNodeMix'); add.data_type = 'RGBA'; add.blend_type = 'ADD'; add.inputs['Factor'].default_value = 1
    if emi: nt.links.new(emi, add.inputs[6])
    else: add.inputs[6].default_value = (0.5, 0.5, 0.5, 1)
    add.inputs[7].default_value = (0.2, 0.2, 0.2, 1)
    mul = nt.nodes.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 1; mul.clamp_result = True
    if base: nt.links.new(base, mul.inputs[6])
    else: mul.inputs[6].default_value = (0.8, 0.8, 0.8, 1)
    add.clamp_result = True
    nt.links.new(add.outputs[2], mul.inputs[7])
    x2 = nt.nodes.new('ShaderNodeMix'); x2.data_type = 'RGBA'; x2.blend_type = 'MULTIPLY'; x2.inputs['Factor'].default_value = 1; x2.clamp_result = True
    nt.links.new(mul.outputs[2], x2.inputs[6]); x2.inputs[7].default_value = (2, 2, 2, 1)
    gm = nt.nodes.new('ShaderNodeGamma'); gm.inputs['Gamma'].default_value = 2.2
    nt.links.new(x2.outputs[2], gm.inputs['Color'])
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1.0
    nt.links.new(gm.outputs[0], em.inputs['Color'])
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL')
    if b.inputs['Alpha'].links:
        tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mx = nt.nodes.new('ShaderNodeMixShader')
        nt.links.new(b.inputs['Alpha'].links[0].from_socket, mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2])
        nt.links.new(mx.outputs[0], out.inputs['Surface'])
    else:
        nt.links.new(em.outputs[0], out.inputs['Surface'])

w = bpy.data.worlds.new('w'); w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0, 0, 0, 1); sc.world = w
cd = bpy.data.cameras.new('cam'); cd.lens = 24; cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 24; cd.clip_start = 0.05
cam = bpy.data.objects.new('cam', cd); sc.collection.objects.link(cam); sc.camera = cam
cam.location = cam_p
look = cam_d.copy(); look.z = -0.08
cam.rotation_euler = look.to_track_quat('-Z', 'Y').to_euler()
sc.render.engine = 'BLENDER_EEVEE'
sc.render.resolution_x, sc.render.resolution_y = 360, 640
sc.eevee.taa_render_samples = 32
sc.view_settings.view_transform = 'Standard'
sc.render.image_settings.file_format = 'PNG'
sc.render.filepath = OUT + '_sharp.png'; bpy.ops.render.render(write_still=True)
cd.dof.use_dof = True; cd.dof.focus_distance = 1.3; cd.dof.aperture_fstop = 1.2
sc.render.filepath = OUT + '_dof.png'; bpy.ops.render.render(write_still=True)

gl = lambda v: [round(v.x, 2), round(v.z, 2), round(-v.y, 2)]
print('CHECK', json.dumps({'glb': os.path.basename(GLB), 'size_m': gl(hi - lo), 'min': gl(lo), 'tris': tris, 'images': len(imgs),
      'untextured_mats': missing_tex, 'floor_up_ratio': round(floor_ok, 3), 'interior_spots': len(spots),
      'cam_gltf': gl(cam_p), 'cam_yaw': round(math.degrees(math.atan2(cam_d.x, -cam_d.y)), 1)}))
