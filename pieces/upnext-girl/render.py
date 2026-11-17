"""Unlit flat renders of the girl (Workbench FLAT + texture colour = the author's unlit look).
exec in Blender after build.py:  render_views(["front","side","back","3q"], "review/v1_{view}.png", pose_action=None, frame=1)
"""
import bpy, math, os
from mathutils import Vector

ROOT = r"F:/Claude Proyectos/pieces/upnext-girl"
VIEWS = {"front": (0, -1, 0.10), "side": (1, 0, 0.10), "back": (0, 1, 0.10), "3q": (0.62, -0.78, 0.18),
         "3q_l": (-0.62, -0.78, 0.18), "side_l": (-1, 0, 0.10)}


def unlit(on=True):
    """Emission swap (zero_fem convention): texture colour straight to the output, no Principled shine"""
    for m in bpy.data.materials:
        if not m.use_nodes: continue
        nt = m.node_tree
        out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"), None)
        tx = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
        bs = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if not (out and tx and bs): continue
        em = nt.nodes.get("UNLIT_EM") or nt.nodes.new("ShaderNodeEmission"); em.name = "UNLIT_EM"
        nt.links.new(tx.outputs["Color"], em.inputs["Color"])
        nt.links.new((em if on else bs).outputs[0], out.inputs[0])


def setup(res=(420, 640)):
    sc = bpy.context.scene
    for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try: sc.render.engine = eng; break
        except TypeError: pass
    unlit(True)
    if not sc.world: sc.world = bpy.data.worlds.new("World")
    sc.world.use_nodes = True
    bg = next(n for n in sc.world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (0.012, 0.016, 0.022, 1); bg.inputs["Strength"].default_value = 1
    sc.render.film_transparent = False
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"
    try: sc.view_settings.view_transform = "Standard"
    except TypeError: pass
    try: sc.render.filter_size = 0.0
    except Exception: pass
    cam = bpy.data.objects.get("SheetCam")
    if not cam:
        cam = bpy.data.objects.new("SheetCam", bpy.data.cameras.new("SheetCam")); sc.collection.objects.link(cam)
    cam.data.type = "ORTHO"; sc.camera = cam
    return sc, cam


def aim_cam(cam, d, center=Vector((0, 0, -2.3)), dist=40, scale=15.0):
    d = Vector(d).normalized(); cam.location = center + d * dist
    cam.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler(); cam.data.ortho_scale = scale
    cam.data.clip_end = 200


def render_views(views, pattern, action=None, frame=1, center=(0, 0, -2.3), scale=15.0, res=(420, 640)):
    sc, cam = setup(res)
    arm = bpy.data.objects.get("Armature")
    if arm and arm.animation_data:
        for t in arm.animation_data.nla_tracks: t.mute = True
        arm.animation_data.action = bpy.data.actions.get(action) if action else None
        if not action:
            for pb in arm.pose.bones: pb.matrix_basis.identity()
    sc.frame_set(frame)
    outs = []
    for v in views:
        aim_cam(cam, VIEWS[v] if isinstance(v, str) else v, Vector(center), scale=scale)
        sc.render.filepath = os.path.join(ROOT, pattern.format(view=v if isinstance(v, str) else "x"))
        bpy.ops.render.render(write_still=True); outs.append(sc.render.filepath)
    return outs
