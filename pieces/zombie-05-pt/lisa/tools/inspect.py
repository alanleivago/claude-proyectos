# blender -b -P inspect.py -- <gltf> <outdir> : importa, informa y renderiza frente/lado (workbench con textura)
import bpy, sys, math, mathutils
a = sys.argv[sys.argv.index("--") + 1:]; src, out = a[0], a[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
obs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
for o in bpy.context.scene.objects:
    if o.type == "EMPTY" and o.name.startswith("Icosphere"): o.hide_render = True
lo = mathutils.Vector((1e9,)*3); hi = -lo
for o in obs:
    oe = o.evaluated_get(bpy.context.evaluated_depsgraph_get())
    for v in oe.data.vertices:
        w = o.matrix_world @ v.co; lo = mathutils.Vector(map(min, lo, w)); hi = mathutils.Vector(map(max, hi, w))
    print("OBJ", o.name, "tris", sum(len(p.vertices) - 2 for p in o.data.polygons), "mats", [m.name for m in o.data.materials])
if len(a) > 2: lo, hi = mathutils.Vector((-0.4, -0.25, 0)), mathutils.Vector((0.4, 0.25, 1.78))   # fijo (el GLB con esqueleto da una caja falsa)
print("BBOX", tuple(round(v, 3) for v in lo), tuple(round(v, 3) for v in hi))
for o in bpy.context.scene.objects: print("NODE", o.name, o.type, tuple(round(v,3) for v in o.location), tuple(round(v,3) for v in o.rotation_euler), tuple(round(v,3) for v in o.scale), o.parent.name if o.parent else None, bool(o.animation_data and o.animation_data.action))
sc = bpy.context.scene; sc.render.engine = "BLENDER_WORKBENCH"; sc.display.shading.color_type = "TEXTURE"; sc.display.shading.light = "FLAT"
sc.render.resolution_x, sc.render.resolution_y = 400, 700; sc.display.shading.show_backface_culling = False; sc.frame_set(0)
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
c = (lo + hi) / 2; h = hi.z - lo.z; cam.data.type = "ORTHO"; cam.data.ortho_scale = max(hi - lo) * 1.1
for name, d in (("front", (0, -1, 0)), ("side", (1, 0, 0)), ("back", (0, 1, 0)), ("q", (0.7, -0.7, 0.15))):
    v = mathutils.Vector(d); cam.location = c + v * 10; cam.rotation_euler = (-v).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = f"{out}/{name}.png"; bpy.ops.render.render(write_still=True)
