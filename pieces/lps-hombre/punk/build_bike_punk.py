"""Blender: open the purchased Bike.blend, point its atlas at punk/bike/Bike_punk.png and SAVE AS a new file
(punk/bike/Bike_punk.blend). The purchased file is never written."""
import bpy, os
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bike")
src = bpy.data.filepath
img = bpy.data.images["BikeTexture.png"]
img.filepath = os.path.join(here, "Bike_punk.png")
img.name = "Bike_punk.png"
img.reload()
dst = os.path.join(here, "Bike_punk.blend")
assert os.path.abspath(dst) != os.path.abspath(src)
bpy.ops.wm.save_as_mainfile(filepath=dst, relative_remap=True, copy=True)
print("SAVED", dst, img.size[:])
