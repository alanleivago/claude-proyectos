"""Blender: render a front + 3/4 head close-up of Kaneda_punk for every atlas in punk/faces/ (texture swap).
blender -b punk/Kaneda_punk.blend -P punk/render_faces.py  -> out/punk_faces/<expr>_{front,34}.png (never saves the .blend)"""
import bpy, os, glob, math
from mathutils import Vector
here = os.path.dirname(os.path.abspath(__file__))
outd = os.path.join(here, "..", "out", "punk_faces"); os.makedirs(outd, exist_ok=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
sc.render.resolution_x = sc.render.resolution_y = 640
sc.render.film_transparent = True
sc.view_settings.view_transform = "Standard"
for o in list(sc.objects):
    if o.type in ("LIGHT", "CAMERA"): o.hide_render = True
w = bpy.data.worlds.new("Flat"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.40, 0.41, 0.45, 1)
sun = bpy.data.lights.new("S", "SUN"); sun.energy = 1.5; sun.use_shadow = False
so = bpy.data.objects.new("S", sun); so.rotation_euler = (math.radians(35), 0, math.radians(-30)); sc.collection.objects.link(so)
img = bpy.data.images["Kaneda_punk.png"]
for m in bpy.data.materials:
    if not m.use_nodes: continue
    nt = m.node_tree
    out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"), None)
    tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE" and n.image == img), None)
    if not (out and tex): continue
    tex.interpolation = "Closest"
    dif = nt.nodes.new("ShaderNodeBsdfDiffuse"); emi = nt.nodes.new("ShaderNodeEmission"); mix = nt.nodes.new("ShaderNodeMixShader")
    mix.inputs[0].default_value = 0.5
    nt.links.new(tex.outputs[0], dif.inputs["Color"]); nt.links.new(tex.outputs[0], emi.inputs["Color"])
    nt.links.new(dif.outputs[0], mix.inputs[1]); nt.links.new(emi.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs[0])
for o in sc.objects:
    if o.type == "ARMATURE": o.data.pose_position = "REST"
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
head = bpy.data.objects["Head"]; e = head.evaluated_get(dg); me = e.to_mesh()
pts = [head.matrix_world @ v.co for v in me.vertices]
mn = Vector([min(p[i] for p in pts) for i in range(3)]); mx = Vector([max(p[i] for p in pts) for i in range(3)])
ctr = (mn + mx) / 2; hh = (mx - mn).z
cam = bpy.data.objects.new("C", bpy.data.cameras.new("C")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 50
files = sorted(glob.glob(os.path.join(here, "faces", "Kaneda_*.png")))
for f in files:
    name = os.path.basename(f)[7:-4]
    img.filepath = f; img.reload()
    for vn, az in (("front", 0), ("34", 35)):
        a = math.radians(az); d = hh * 3.2
        p = ctr + Vector((d * math.sin(a), -d * math.cos(a), 0))
        cam.location = p; cam.rotation_euler = (ctr - p).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(outd, f"{name}_{vn}.png"); bpy.ops.render.render(write_still=True)
print("RENDERED", len(files))
