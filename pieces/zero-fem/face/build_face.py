"""Face expressions for zero_fem: paints the atlases and splits the Head mesh into face materials.

    python face/build_face.py            # run AFTER feminize.py; edits out/zero_fem.blend + re-exports out/zero_fem.glb

1. (system python + PIL) paint_face.build() writes face/face_eyes.png and face/face_mouth.png
2. (Blender, background) the eye/brow/forehead polygons of Head get material "face_eyes" and the
   mouth/cheek/chin polygons get "face_mouth" (copies of "Zero" with their own atlas, Closest).
   Their UVs are remapped into cell 0 of the atlas: u' = u*192/1024, v' maps texture rows 112-176 to 0-1.
   Vertex positions and every other polygon are untouched, so the neutral face is pixel-identical.
   In three.js, material.map.offset.x = cell/16 picks an expression (see README.md).
Idempotent: if the split is already there, only the atlas images are refreshed (and u is rescaled if the
cell count changed; mesh['face_split'] stores the cell count, legacy value 1 = 8 cells)."""
import os, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "out")
BLENDER = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
TEX, CELL, N, RY = 192, 64, 16, 112           # texture size, cell size, cells per atlas, top row of the face block
EYE_POLYS = [14, 28, 47, 62]                  # forehead (brows) + eye quads, both sides
MOUTH_POLYS = [4, 9, 12, 13, 20, 37, 42, 45, 46, 54]   # cheeks under the eyes, mouth, chin (nose sides excluded)

try:
    import bpy
except ImportError:
    bpy = None


def split():
    head = bpy.data.objects["Head"]; me = head.data
    assert len(me.polygons) == 111, "Head mesh changed: polygon indices in build_face.py no longer valid"
    zero = bpy.data.materials["Zero"]
    done = me.get("face_split", 0)
    done = 8 if done == 1 else done
    uv = me.uv_layers.active.data
    for name, polys in (("face_eyes", EYE_POLYS), ("face_mouth", MOUTH_POLYS)):
        mat = bpy.data.materials.get(name) or zero.copy()
        mat.name = name
        tex = next(n for n in mat.node_tree.nodes if n.type == "TEX_IMAGE")
        old = tex.image if tex.image and tex.image.name.startswith(name) else None
        img = bpy.data.images.load(os.path.join(HERE, name + ".png"), check_existing=False)
        img.pack(); tex.image = img; tex.interpolation = "Closest"
        if old:
            bpy.data.images.remove(old)
        img.name = name + ".png"
        if me.materials.find(name) < 0:
            me.materials.append(mat)
        mi = me.materials.find(name)
        if done:
            if done != N:                                   # atlas grew/shrank: rescale u of the face polygons
                for pi in polys:
                    for li in me.polygons[pi].loop_indices:
                        uv[li].uv.x *= done / N
            continue
        for pi in polys:
            p = me.polygons[pi]
            p.material_index = mi
            for li in p.loop_indices:
                u, v = uv[li].uv
                uv[li].uv = (u * TEX / (CELL * N), 1 - ((1 - v) * TEX - RY) / CELL)
    me["face_split"] = N


if __name__ == "__main__":
    if bpy is None:                                   # step 1 + launch step 2
        sys.path.insert(0, HERE)
        import paint_face
        paint_face.build()
        r = subprocess.run([BLENDER, "-b", os.path.join(OUT, "zero_fem.blend"), "--python", os.path.abspath(__file__)], timeout=600)
        sys.exit(r.returncode)
    split()                                           # inside Blender
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "zero_fem.blend"))
    for o in bpy.data.objects:
        o.select_set(o.type in ("MESH", "ARMATURE"))
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "zero_fem.glb"), use_selection=True, export_apply=True,
                              export_animations=False, export_yup=True)
    print("FACE DONE")
