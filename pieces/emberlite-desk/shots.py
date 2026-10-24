"""Cameras, cuts and screen changes for the 4 shots (~3.3 s each at 30 fps). Run after build.py."""
import bpy, math, os
from mathutils import Vector

sc = bpy.context.scene
col = bpy.data.collections["Desk"]
TEX = r"F:\Claude Proyectos\pieces\emberlite-desk\tex"

# (name, first, last, lens, start pos, end pos, start target, end target)
SHOTS = [
    ("Cam1", 1, 100, 22, (-0.6, -0.62, 1.14), (-0.54, -0.54, 1.13), (0.28, 0.33, 0.97), (0.28, 0.33, 0.96)),
    ("Cam2", 101, 200, 26, (0.14, -0.22, 1.26), (0.19, -0.17, 1.23), (0.48, 0.24, 0.9), (0.49, 0.24, 0.9)),
    ("Cam3", 201, 300, 30, (-0.26, -0.38, 1.06), (-0.24, -0.35, 1.02), (-0.22, -0.14, 0.76), (-0.21, -0.14, 0.76)),
    ("Cam4", 301, 400, 22, (0.02, -0.98, 1.4), (0.0, -0.88, 1.36), (-0.1, 0.2, 0.86), (-0.1, 0.2, 0.86)),
]

prefs = bpy.context.preferences.edit
old_interp = prefs.keyframe_new_interpolation_type
prefs.keyframe_new_interpolation_type = "LINEAR"
sc.timeline_markers.clear()
for name, f0, f1, lens, p0, p1, t0, t1 in SHOTS:
    cam = bpy.data.objects.get(name)
    if not cam:
        cam = bpy.data.objects.new(name, bpy.data.cameras.new(name)); col.objects.link(cam)
    cam.data.lens = lens
    cam.data.clip_start = 0.01
    cam.animation_data_clear()
    for f, p, t in ((f0, p0, t0), (f1, p1, t1)):
        cam.location = p
        cam.rotation_euler = (Vector(t) - Vector(p)).to_track_quat('-Z', 'Y').to_euler()
        cam.keyframe_insert("location", frame=f); cam.keyframe_insert("rotation_euler", frame=f)
    m =sc.timeline_markers.new(name, frame=f0); m.camera = cam
sc.camera = bpy.data.objects["Cam1"]

# screen: desktop -> browser (shot 4) -> boot screen
mat = bpy.data.materials["Screen"]; nt = mat.node_tree
for n in [n for n in nt.nodes if n.label in ("browser", "boot", "mixA", "mixB")]:
    nt.nodes.remove(n)
b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
base = next(n for n in nt.nodes if n.type == "TEX_IMAGE")
out = base.outputs["Color"]
for lbl, file, f_on in (("browser", "flow/browser.jpg", 301), ("boot", "boot.png", 352)):
    t = nt.nodes.new("ShaderNodeTexImage"); t.label = lbl
    t.image = bpy.data.images.load(os.path.join(TEX, file), check_existing=True)
    mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.label = "mixA" if lbl == "browser" else "mixB"
    nt.links.new(out, mx.inputs["A"]); nt.links.new(t.outputs["Color"], mx.inputs["B"])
    fac = mx.inputs["Factor"]
    fac.default_value = 0.0; fac.keyframe_insert("default_value", frame=f_on - 1)
    fac.default_value = 1.0; fac.keyframe_insert("default_value", frame=f_on)
    out = mx.outputs["Result"]
nt.links.new(out, b.inputs["Base Color"]); nt.links.new(out, b.inputs["Emission Color"])
prefs.keyframe_new_interpolation_type = old_interp
print("shots ok", [m.name for m in sc.timeline_markers])
