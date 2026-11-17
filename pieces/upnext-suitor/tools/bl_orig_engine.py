"""blender -b --factory-startup --python bl_orig_engine.py -- <obj> <out.blend> <scale> <floor>: the rip in engine units, facing -Y"""
import sys, math, bpy
obj, out, sc, fl = sys.argv[sys.argv.index("--") + 1:][:4]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.obj_import(filepath=obj)
ob = [o for o in bpy.context.scene.objects if o.type == "MESH"][0]
ob.rotation_euler.z += math.pi; s = float(sc); ob.scale = (s, s, s)
bpy.context.view_layer.update()
mz = min((ob.matrix_world @ v.co).z for v in ob.data.vertices); ob.location.z += float(fl) - mz
bpy.ops.wm.save_as_mainfile(filepath=out)
