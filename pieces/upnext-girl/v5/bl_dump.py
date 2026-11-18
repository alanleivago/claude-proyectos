"""Blender side: dump the evaluated (posed) triangles of the girl pieces to an npz for v5/fit.py.
exec(open(r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/bl_dump.py").read()); dump("rest", None)"""
import bpy, numpy as np
from mathutils import Vector
V5 = r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/"


def pose_to(action=None, frame=1):
    arm = bpy.data.objects.get("Armature")
    if arm:
        ad = arm.animation_data_create()
        for t in ad.nla_tracks: t.mute = True
        ad.action = bpy.data.actions.get(action) if action else None
        if not action:
            for pb in arm.pose.bones: pb.matrix_basis.identity()
    bpy.context.scene.frame_set(frame); bpy.context.view_layer.update()


def girl_objects():
    col = bpy.data.collections.get("GirlV5")
    if col: return [o for o in col.all_objects if o.type == "MESH" and not o.hide_render]
    return [bpy.data.objects["Girl"]]


_PIX = {}


def _pix(img):
    if img.name not in _PIX:
        w, h = img.size; a = np.empty(w * h * 4, np.float32); img.pixels.foreach_get(a)
        _PIX[img.name] = a.reshape(h, w, 4)[..., :3]
    return _PIX[img.name]


def tri_colors(o, me):
    """per-triangle colour 0-255: object prop 'col' (flat blocking colour) or the texture texel at the UV centroid"""
    n = len(me.loop_triangles)
    if "col" in o.keys(): return np.tile(np.array(o["col"], float), (n, 1))
    out = np.zeros((n, 3)); uvl = me.uv_layers.active
    for i, lt in enumerate(me.loop_triangles):
        mat = o.material_slots[lt.material_index].material if o.material_slots else None
        tx = next((nd for nd in mat.node_tree.nodes if nd.type == "TEX_IMAGE"), None) if mat and mat.use_nodes else None
        if mat and mat.name.startswith("face_"): out[i] = (250, 209, 160); continue
        if not tx or not uvl: out[i] = (128, 128, 128); continue
        a = _pix(tx.image); h, w = a.shape[:2]
        uv = sum((uvl.data[l].uv for l in lt.loops), Vector((0, 0))) / 3
        out[i] = a[min(h - 1, max(0, int(uv.y * h))), min(w - 1, max(0, int(uv.x * w)))] * 255
    return out


def dump(tag, action=None, frame=1):
    pose_to(action, frame)
    dg = bpy.context.evaluated_depsgraph_get()
    tris, pid, names, cols = [], [], [], []
    for o in girl_objects():
        oe = o.evaluated_get(dg); me = oe.to_mesh(); me.calc_loop_triangles()
        M = o.matrix_world
        co = np.array([(M @ v.co)[:] for v in me.vertices])
        t = np.array([lt.vertices[:] for lt in me.loop_triangles])
        if len(t):
            tris.append(co[t]); names.append(o.name); pid += [len(names) - 1] * len(t)
            cols.append(tri_colors(o, me))
        oe.to_mesh_clear()
    np.savez(V5 + f"tris_{tag}.npz", tris=np.concatenate(tris), pid=np.array(pid), names=np.array(names), col=np.concatenate(cols))
    return sum(len(x) for x in tris)
