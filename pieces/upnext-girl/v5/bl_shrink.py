"""Blender: snap rest-pose piece vertices onto his visual hull (posed space) through each piece's rigid bone transform.
exec(open(r".../v5/bl_shrink.py").read()); load_hull("hip"); shrink("Hair", limit=0.5)"""
import bpy, numpy as np
from mathutils import Matrix, Vector
V5 = r"F:/Claude Proyectos/pieces/upnext-girl/v5/"
ARM = bpy.data.objects["Armature"]


def load_hull(tag):
    name = "HisHull_" + tag; old = bpy.data.objects.get(name)
    if old: bpy.data.objects.remove(old)
    bpy.ops.wm.obj_import(filepath=V5 + f"hull_{tag}.obj", forward_axis="Y", up_axis="Z")
    o = bpy.context.selected_objects[0]; o.name = name; o.hide_render = True; o.display_type = "WIRE"
    return o


def bone_of(o): return o.vertex_groups[0].name


def rigid(o):
    """rest -> posed world matrix of a rigid piece"""
    bpy.context.view_layer.update()
    pb = ARM.pose.bones[bone_of(o)]
    return ARM.matrix_world @ pb.matrix @ pb.bone.matrix_local.inverted()


def shrink(name, limit=0.4, sel=None, tag="hip", mode="PROJECT", target=None, inflate=0.0):
    """sel(co, normal) -> bool picks the vertices that may move (None = all)"""
    o = bpy.data.objects[name]; hull = bpy.data.objects[target or ("HisHull_" + tag)]
    A = rigid(o)
    tmpm = o.data.copy(); tmp = bpy.data.objects.new("_shr", tmpm); bpy.context.scene.collection.objects.link(tmp)
    tmp.matrix_world = Matrix.Identity(4)
    hm = hull.matrix_world.copy(); hull.matrix_world = A.inverted() @ hm
    vg = tmp.vertex_groups.new(name="_m"); tmpm.update()
    ids = [v.index for v in tmpm.vertices if (sel is None or sel(v.co, v.normal))]
    vg.add(ids, 1.0, "REPLACE")
    for m in list(tmp.modifiers): tmp.modifiers.remove(m)
    sw = tmp.modifiers.new("sw", "SHRINKWRAP"); sw.target = hull; sw.vertex_group = "_m"
    sw.wrap_method = mode
    if mode == "PROJECT":
        sw.use_negative_direction = True; sw.use_positive_direction = True; sw.project_limit = limit
        sw.use_project_x = sw.use_project_y = sw.use_project_z = False
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get()
    em = tmp.evaluated_get(dg).data
    new = [v.co.copy() for v in em.vertices]
    moved = 0
    for v, c in zip(o.data.vertices, new):
        if (v.co - c).length > 1e-5: moved += 1
        if mode != "PROJECT" and (v.co - c).length > limit: c = v.co + (c - v.co).normalized() * limit
        v.co = c
    o.data.update()
    if inflate:
        for v in o.data.vertices: v.co += v.normal * inflate
        o.data.update()
    hull.matrix_world = hm
    bpy.data.objects.remove(tmp); bpy.data.meshes.remove(tmpm)
    return moved, len(ids)


def load_seg(name):
    on = "Seg_" + name; old = bpy.data.objects.get(on)
    if old: bpy.data.objects.remove(old)
    p = V5 + f"hullseg/{name}.obj"
    import os
    if not os.path.exists(p): return None
    bpy.ops.wm.obj_import(filepath=p, forward_axis="Y", up_axis="Z")
    o = bpy.context.selected_objects[0]; o.name = on; o.hide_render = True; o.hide_set(True)
    return o
