"""Blender: open the purchased Kaneda.blend, point its atlas at punk/Kaneda_punk.png and SAVE AS a new file
(punk/Kaneda_punk.blend). The purchased file is never written."""
import bpy, os
here = os.path.dirname(os.path.abspath(__file__))
src = bpy.data.filepath
img = bpy.data.images["Kaneda.png"]
img.filepath = os.path.join(here, "Kaneda_punk.png")
img.name = "Kaneda_punk.png"
img.reload()
dst = os.path.join(here, "Kaneda_punk.blend")
assert os.path.abspath(dst) != os.path.abspath(src)
bpy.ops.wm.save_as_mainfile(filepath=dst, relative_remap=True, copy=True)
print("SAVED", dst, img.size[:])
