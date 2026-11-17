"""blender -b --factory-startup --python look_orig.py -- <obj> <outdir>
Import the rip, save orig.blend, render flat views + per-component colour views."""
import sys, os, bpy
sys.path.insert(0, os.path.dirname(__file__))
import render_lib as R

obj, outd = sys.argv[sys.argv.index("--") + 1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.obj_import(filepath=obj)
ob = [o for o in bpy.context.scene.objects if o.type == "MESH"][0]
ob.name = "waitress_orig"
print("LOOK verts", len(ob.data.vertices), "faces", len(ob.data.polygons))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(outd, "orig.blend"))
R.setup(512)
mn, mx = R.bounds([ob])
ctr = (mn + mx) / 2
ext = (mx.z - mn.z) * 1.08
for v in ["front", "3q", "side", "back", "side2"]:
    R.shoot(os.path.join(outd, f"orig_{v}.png"), ctr, ext, v)
# component colours
bpy.context.view_layer.objects.active = ob
ob.select_set(True)
bpy.ops.mesh.separate(type="LOOSE")
sh = bpy.context.scene.display.shading
sh.color_type = "RANDOM"
for v in ["front", "side"]:
    R.shoot(os.path.join(outd, f"orig_parts_{v}.png"), ctr, ext, v)
for o in bpy.context.scene.objects:
    if o.type == "MESH":
        a, b = R.bounds([o])
        print("LOOK part", o.name, len(o.data.polygons), tuple(round(x, 3) for x in a), tuple(round(x, 3) for x in b))
