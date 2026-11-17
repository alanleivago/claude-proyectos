"""blender -b ref/waitress_X.blend --python bl_check.py
Per action frame: leg / arm vertices that poke out through (legs) or into (arms) the skirt or hip/thigh volume,
plus the bind-pose mesh checks (open edges of the new parts, zero-area faces)."""
import json, bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sc = bpy.context.scene
ob = bpy.data.objects["waitress"]; arm = bpy.data.objects["waitress_rig"]
parts = json.loads(ob["parts"])
for t in arm.animation_data.nla_tracks: t.mute = True
SKIRT = "skirt" in parts

# ---- static mesh checks (rest)
bm = bmesh.new(); bm.from_mesh(ob.data)
lay = bm.faces.layers.int.get("part")
new = {"leg", "legcap", "pelvis", "skirt", "skirt_in"}
open_e = [e for e in bm.edges if len(e.link_faces) == 1 and all(parts[f[lay]] in ("leg", "legcap", "pelvis") for f in e.link_faces)]
zero = [f for f in bm.faces if parts[f[lay]] in new and f.calc_area() < 1e-7]
# pants edges that touch the hip ring are glued to the torso band (shared verts) -> list only truly open ones
print("CHECK open edges on legs/pelvis:", len(open_e), " zero-area new faces:", len(zero))


def part_verts(names, me):
    s = set()
    for p in me.polygons:
        if parts[me.attributes["part"].data[p.index].value] in names: s.update(p.vertices)
    return s


def frame_check(act, frames):
    a = bpy.data.actions[act]
    arm.animation_data.action = a
    if hasattr(arm.animation_data, "action_slot") and len(a.slots): arm.animation_data.action_slot = a.slots[0]
    worst = []
    for f in frames:
        sc.frame_set(f)
        dg = bpy.context.evaluated_depsgraph_get()
        eo = ob.evaluated_get(dg); me = eo.to_mesh()
        mw = ob.matrix_world
        V = [mw @ v.co for v in me.vertices]
        hull = ["skirt"] if SKIRT else ["pelvis", "leg"]
        polys = [list(p.vertices) for p in me.polygons if parts[me.attributes["part"].data[p.index].value] in hull]
        bvh = BVHTree.FromPolygons(V, polys)
        pel = arm.pose.bones["Pelvis"]
        M = arm.matrix_world @ pel.matrix @ pel.bone.matrix_local.inverted()
        legs = part_verts({"leg"}, me); arms_ = part_verts({"forearm", "forearm_m", "uparm", "uparm_m"}, me)
        bad_leg = bad_arm = 0
        if SKIRT:
            for vi in legs:
                p = V[vi]; rest_z = (M.inverted() @ p).z
                if not (0.77 < rest_z < 0.97): continue
                c = M @ Vector((0, 0.012, rest_z)); d = p - c; d.z = 0
                if d.length < 1e-4: continue
                hit = bvh.ray_cast(c, d.normalized(), d.length)
                if hit[0] is not None: bad_leg += 1
        for vi in arms_:
            p = V[vi]; rest_z = (M.inverted() @ p).z
            if not (0.70 < rest_z < 1.0): continue
            c = M @ Vector((0, 0.012, rest_z)); d = p - c; d.z = 0
            if d.length < 1e-4: continue
            # arm vertex is inside the skirt / hip volume if a ray from the axis to it does NOT cross the hull
            hit = bvh.ray_cast(c, d.normalized(), d.length)
            far = bvh.ray_cast(c, d.normalized(), 2.0)
            if far[0] is not None and hit[0] is None: bad_arm += 1
        eo.to_mesh_clear()
        worst.append((f, bad_leg, bad_arm))
    print(f"CHECK {act}: frames {len(frames)}  leg-through-skirt verts max {max(w[1] for w in worst)}  arm-inside-hips verts max {max(w[2] for w in worst)}",
          [w for w in worst if w[1] or w[2]][:6])


frame_check("Apose", [1]); frame_check("Tpose", [1]); frame_check("idle", list(range(1, 49, 2))); frame_check("walk", list(range(1, 25)))
