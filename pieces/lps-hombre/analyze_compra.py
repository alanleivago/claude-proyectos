"""Read-only analysis + flat-light turnaround of a purchased .blend (never saves it).
Blender -b <file.blend> -P analyze_compra.py -- <out_prefix> [--render]"""
import bpy, sys, math, json
from mathutils import Vector
args = sys.argv[sys.argv.index("--") + 1:]
pref = args[0]
sc = bpy.context.scene
if "--frame" in args:
    sc.frame_set(int(args[args.index("--frame") + 1]))
if "--restpose" in args:
    for o in sc.objects:
        if o.type == "ARMATURE":
            o.data.pose_position = "REST"
bpy.context.view_layer.update()
info = {"file": bpy.data.filepath, "unit_scale": sc.unit_settings.scale_length, "objects": [], "materials": [], "images": [], "actions": []}
for ob in sc.objects:
    d = {"name": ob.name, "type": ob.type, "parent": ob.parent.name if ob.parent else None,
         "parent_type": ob.parent_type, "hidden": ob.hide_render, "mods": [m.type for m in ob.modifiers],
         "scale": [round(v, 3) for v in ob.scale]}
    if ob.type == "MESH":
        me = ob.data
        d["faces"] = len(me.polygons); d["tris"] = sum(len(p.vertices) - 2 for p in me.polygons); d["verts"] = len(me.vertices)
        d["uv_layers"] = [u.name for u in me.uv_layers]; d["mats"] = [m.name for m in me.materials if m]
        d["vgroups"] = len(ob.vertex_groups)
        d["shape_keys"] = [k.name for k in me.shape_keys.key_blocks] if me.shape_keys else []
    if ob.type == "ARMATURE":
        d["bones"] = [(b.name, b.parent.name if b.parent else None) for b in ob.data.bones]
        d["pose_lib"] = ob.animation_data.action.name if ob.animation_data and ob.animation_data.action else None
    info["objects"].append(d)
for m in bpy.data.materials:
    texs = []
    if m.use_nodes:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE" and n.image:
                texs.append((n.image.name, list(n.image.size), n.interpolation))
    info["materials"].append({"name": m.name, "users": m.users, "nodes": [n.type for n in m.node_tree.nodes] if m.use_nodes else [], "tex": texs})
for im in bpy.data.images:
    info["images"].append((im.name, list(im.size), im.filepath))
for a in bpy.data.actions:
    info["actions"].append((a.name, list(a.frame_range), a.users))
# bounds
mins, maxs = Vector((1e9,) * 3), Vector((-1e9,) * 3)
dg = bpy.context.evaluated_depsgraph_get()
for ob in sc.objects:
    if ob.type == "MESH" and not ob.hide_render:
        e = ob.evaluated_get(dg); me = e.to_mesh()
        for v in me.vertices:
            w = ob.matrix_world @ v.co
            mins = Vector(map(min, mins, w)); maxs = Vector(map(max, maxs, w))
        e.to_mesh_clear()
info["bounds_min"] = list(mins); info["bounds_max"] = list(maxs); info["size"] = list(maxs - mins)
open(pref + "_info.json", "w").write(json.dumps(info, indent=1, default=str))
print("INFO_WRITTEN")
if "--render" in args:
    for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try: sc.render.engine = eng; break
        except TypeError: pass
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1920 if "--wide" not in args else 1080
    if "--wide" in args: sc.render.resolution_x, sc.render.resolution_y = 1440, 1080
    sc.render.film_transparent = True
    sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
    for o in list(sc.objects):
        if o.type in ("LIGHT", "CAMERA"): o.hide_render = True
    w = bpy.data.worlds.new("Flat"); sc.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.40, 0.41, 0.45, 1)
    sun = bpy.data.lights.new("FlatSun", "SUN"); sun.energy = 1.5; sun.use_shadow = False
    so = bpy.data.objects.new("FlatSun", sun); so.rotation_euler = (math.radians(35), 0, math.radians(-30)); sc.collection.objects.link(so)
    # same 50% emission look as lps-hombre: insert Mix(Diffuse, Emission) from each base colour texture
    for m in bpy.data.materials:
        if not m.use_nodes: continue
        nt = m.node_tree
        out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"), None)
        tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
        if not out: continue
        dif = nt.nodes.new("ShaderNodeBsdfDiffuse"); emi = nt.nodes.new("ShaderNodeEmission"); mix = nt.nodes.new("ShaderNodeMixShader")
        mix.inputs[0].default_value = 0.5
        if tex:
            tex.interpolation = "Closest"
            nt.links.new(tex.outputs[0], dif.inputs["Color"]); nt.links.new(tex.outputs[0], emi.inputs["Color"])
        else:
            bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
            col = bsdf.inputs["Base Color"].default_value if bsdf else (0.8, 0.8, 0.8, 1)
            dif.inputs["Color"].default_value = col; emi.inputs["Color"].default_value = col
        nt.links.new(dif.outputs[0], mix.inputs[1]); nt.links.new(emi.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs[0])
    cam = bpy.data.objects.new("C", bpy.data.cameras.new("C")); sc.collection.objects.link(cam); sc.camera = cam
    ctr = (mins + maxs) / 2; size = maxs - mins
    H = max(size.z, 0.6 * max(size.x, size.y))
    for nm, az in (("front", 0), ("34", 45), ("side", 90), ("back", 180)):
        a = math.radians(az); dist = H * (2.9 if "--wide" in args else 1.9)
        # front = the model's -Y side (Blender convention)
        p = ctr + Vector((dist * math.sin(a), -dist * math.cos(a), size.z * 0.12))
        cam.location = p; cam.rotation_euler = (ctr - p).to_track_quat("-Z", "Y").to_euler(); cam.data.lens = 50
        sc.render.filepath = f"{pref}_{nm}.png"; bpy.ops.render.render(write_still=True)
    if "--closeback" in args:
        tgt = Vector((ctr.x, ctr.y, mins.z + size.z * 0.70))
        p = tgt + Vector((0, size.z * 0.42, size.z * 0.02))
        cam.location = p; cam.rotation_euler = (tgt - p).to_track_quat("-Z", "Y").to_euler(); cam.data.lens = 50
        sc.render.resolution_x, sc.render.resolution_y = 1080, 1080
        sc.render.filepath = f"{pref}_backclose.png"; bpy.ops.render.render(write_still=True)
