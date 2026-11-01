"""zach3d kit — Blender (Cycles) helpers for the Zack D. Films "3D informational" look.

Imported by a piece's build.py running inside Blender:
    blender -b -P pieces/<name>/build.py -- [--frames 60,210] [--samples 64] [--out dir]
Values come from fuentes/zach3dfilms-style/especificacion-tecnica-del-estilo.md.
"""
import math
import sys

import bmesh
import bpy
from mathutils import Vector

FPS = 30
W, H = 1080, 1920


# ---------------------------------------------------------------- scene / render

def args():
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    out = {"frames": None, "samples": 64, "out": None, "scale": 100}
    for i, k in enumerate(a):
        if k == "--frames":
            out["frames"] = [int(x) for x in a[i + 1].split(",")]
        elif k in ("--samples", "--scale"):
            out[k[2:]] = int(a[i + 1])
        elif k == "--out":
            out["out"] = a[i + 1]
    return out


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    p = bpy.context.preferences.addons["cycles"].preferences
    p.compute_device_type = "METAL"
    p.get_devices()
    for d in p.devices:
        d.use = d.type != "CPU"
    s.cycles.device = "GPU"
    s.cycles.use_denoising = True
    s.cycles.max_bounces = 12
    s.cycles.transmission_bounces = 12
    s.cycles.transparent_max_bounces = 16
    s.cycles.caustics_reflective = s.cycles.caustics_refractive = False
    s.render.resolution_x, s.render.resolution_y = W, H
    s.render.fps = FPS
    s.render.film_transparent = False
    s.view_settings.view_transform = "Khronos PBR Neutral"  # keeps base colours true (refs are saturated)
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_depth = "16"
    return s


def world(color=(0.62, 0.85, 0.93), strength=0.55):
    """Cyan studio fill: the environment bounces into the shadows (preset A)."""
    w = bpy.data.worlds.new("studio")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*srgb(color), 1)
    bg.inputs["Strength"].default_value = strength
    return w


def srgb(c):
    """sRGB 0-1 (or '#hex') -> linear."""
    if isinstance(c, str):
        c = tuple(int(c.lstrip("#")[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def area(name, loc, look_at, size, energy, color="#FFF6EC", shape="RECTANGLE", size_y=None):
    d = bpy.data.lights.new(name, "AREA")
    d.energy, d.size, d.shape = energy, size, shape
    if size_y:
        d.size_y = size_y
    d.color = srgb(color)
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    aim(o, look_at)
    return o


def studio(target=(0, 0, 0.15), k=1.0):
    """Preset A: big soft key up-left-front, soft fill from the cyan world, thin rim behind."""
    t = Vector(target)
    area("key", t + Vector((-1.1, -1.3, 1.4)), t, 1.4, 260 * k)
    area("rim", t + Vector((0.9, 1.4, 0.9)), t, 0.6, 90 * k, "#E8F6FF")
    area("fill", t + Vector((1.4, -0.9, 0.3)), t, 1.2, 35 * k, "#DFF2FA")


def aim(o, target):
    d = Vector(target) - o.location
    o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


# ---------------------------------------------------------------- materials

def mat(name, color="#FFFFFF", rough=0.5, metal=0.0, coat=0.0, trans=0.0, ior=1.45, emit=None, emit_k=0.0,
        sss=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*srgb(color), 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Transmission Weight"].default_value = trans
    b.inputs["IOR"].default_value = ior
    b.inputs["Subsurface Weight"].default_value = sss
    b.inputs["Alpha"].default_value = alpha
    if emit:
        b.inputs["Emission Color"].default_value = (*srgb(emit), 1)
        b.inputs["Emission Strength"].default_value = emit_k
    return m


def glass(name="glass", tint="#E6F2F6", rough=0.02):
    return mat(name, tint, rough=rough, trans=1.0, ior=1.5)


def wood(name="wood", light="#86522F", dark="#3E2112", grain=14.0):
    """Plank wood, grain along X: fine warped grain lines (~3 mm apart) + streaks + a per-plank tone shift,
    matte satin (ref 3 table)."""
    m = mat(name, light, rough=0.5, coat=0.08)
    nt, b = m.node_tree, m.node_tree.nodes["Principled BSDF"]
    L = nt.links.new
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (grain * 0.06, grain, grain)
    warp = nt.nodes.new("ShaderNodeTexNoise")
    warp.inputs["Scale"].default_value = 0.8
    warp.inputs["Detail"].default_value = 4
    wv = nt.nodes.new("ShaderNodeTexWave")
    wv.bands_direction = "Y"
    wv.wave_profile = "SAW"
    wv.inputs["Scale"].default_value = 7.0
    wv.inputs["Distortion"].default_value = 9.0
    wv.inputs["Detail"].default_value = 2
    st = nt.nodes.new("ShaderNodeTexNoise")
    st.inputs["Scale"].default_value = 30
    st.inputs["Detail"].default_value = 6
    mp2 = nt.nodes.new("ShaderNodeMapping")
    mp2.inputs["Scale"].default_value = (grain * 0.3, grain * 12, grain * 12)
    oi = nt.nodes.new("ShaderNodeObjectInfo")
    mx = nt.nodes.new("ShaderNodeMix")
    mx.data_type = "FLOAT"
    mx.inputs["Factor"].default_value = 0.35
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*srgb(dark), 1)
    ramp.color_ramp.elements[1].color = (*srgb(light), 1)
    ramp.color_ramp.elements[0].position = 0.15
    ramp.color_ramp.elements[1].position = 0.65
    tone = nt.nodes.new("ShaderNodeHueSaturation")
    tone_k = nt.nodes.new("ShaderNodeMapRange")
    tone_k.inputs["To Min"].default_value, tone_k.inputs["To Max"].default_value = 0.8, 1.2
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.12
    bump.inputs["Distance"].default_value = 0.0004
    L(tc.outputs["Object"], mp.inputs["Vector"])
    L(tc.outputs["Object"], mp2.inputs["Vector"])
    L(mp.outputs["Vector"], warp.inputs["Vector"])
    L(mp.outputs["Vector"], wv.inputs["Vector"])
    wk = nt.nodes.new("ShaderNodeMath")
    wk.operation = "MULTIPLY"
    wk.inputs[1].default_value = 14.0  # phase offset is in radians
    L(warp.outputs["Fac"], wk.inputs[0])
    L(wk.outputs[0], wv.inputs["Phase Offset"])
    L(mp2.outputs["Vector"], st.inputs["Vector"])
    L(wv.outputs["Fac"], mx.inputs["A"])
    L(st.outputs["Fac"], mx.inputs["B"])
    L(mx.outputs["Result"], ramp.inputs["Fac"])
    L(oi.outputs["Random"], tone_k.inputs["Value"])
    L(ramp.outputs["Color"], tone.inputs["Color"])
    L(tone_k.outputs["Result"], tone.inputs["Value"])
    L(tone.outputs["Color"], b.inputs["Base Color"])
    L(mx.outputs["Result"], bump.inputs["Height"])
    L(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def galvanized(name="galv", color="#8C939A"):
    """Galvanized bucket steel: metal with patchy spangle roughness, long scratches and dark grime spots."""
    m = mat(name, color, rough=0.35, metal=1.0)
    nt, b = m.node_tree, m.node_tree.nodes["Principled BSDF"]
    L = nt.links.new
    vo = nt.nodes.new("ShaderNodeTexVoronoi")
    vo.inputs["Scale"].default_value = 30
    rr = nt.nodes.new("ShaderNodeMapRange")
    rr.inputs["To Min"].default_value, rr.inputs["To Max"].default_value = 0.28, 0.40
    sc = nt.nodes.new("ShaderNodeTexWave")
    sc.wave_type, sc.wave_profile = "BANDS", "SIN"
    sc.inputs["Scale"].default_value = 3
    sc.inputs["Distortion"].default_value = 40
    sc.inputs["Detail"].default_value = 6
    sc.inputs["Detail Scale"].default_value = 4
    thin = nt.nodes.new("ShaderNodeMapRange")       # keep only the thin crests: scratch lines
    thin.inputs["From Min"].default_value, thin.inputs["From Max"].default_value = 0.93, 1.0
    dirt = nt.nodes.new("ShaderNodeTexNoise")
    dirt.inputs["Scale"].default_value = 18
    dirt.inputs["Detail"].default_value = 8
    dk = nt.nodes.new("ShaderNodeMapRange")
    dk.inputs["From Min"].default_value, dk.inputs["From Max"].default_value = 0.62, 0.72
    col = nt.nodes.new("ShaderNodeMix")
    col.data_type = "RGBA"
    col.inputs["A"].default_value = (*srgb(color), 1)
    col.inputs["B"].default_value = (*srgb("#2E3236"), 1)
    lit = nt.nodes.new("ShaderNodeMix")
    lit.data_type = "RGBA"
    lit.inputs["B"].default_value = (*srgb("#D6DADE"), 1)
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.25
    bump.inputs["Distance"].default_value = 0.0002
    L(vo.outputs["Distance"], rr.inputs["Value"])
    L(rr.outputs["Result"], b.inputs["Roughness"])
    L(sc.outputs["Fac"], thin.inputs["Value"])
    L(dirt.outputs["Fac"], dk.inputs["Value"])
    L(dk.outputs["Result"], col.inputs["Factor"])
    L(col.outputs["Result"], lit.inputs["A"])
    L(thin.outputs["Result"], lit.inputs["Factor"])
    L(lit.outputs["Result"], b.inputs["Base Color"])
    L(thin.outputs["Result"], bump.inputs["Height"])
    L(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def mix_states(name, states, rough=0.8):
    """A material that blends through colour states with a keyframable 'state' (0..n-1) value.
    states: list of hex colours. Returns (material, value_node)."""
    m = mat(name, states[0], rough=rough)
    nt, b = m.node_tree, m.node_tree.nodes["Principled BSDF"]
    v = nt.nodes.new("ShaderNodeValue")
    v.name = "state"
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "LINEAR"
    els = ramp.color_ramp.elements
    while len(els) < len(states):
        els.new(0.5)
    for i, c in enumerate(states):
        els[i].position = i / (len(states) - 1)
        els[i].color = (*srgb(c), 1)
    div = nt.nodes.new("ShaderNodeMath")
    div.operation = "DIVIDE"
    div.inputs[1].default_value = len(states) - 1
    nt.links.new(v.outputs[0], div.inputs[0])
    nt.links.new(div.outputs[0], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    return m, v


def key(node_or_obj, path, frames_values, interp="BEZIER"):
    """Keyframe a property: [(frame, value), ...]. For a Value node pass the node and path='value'."""
    for f, val in frames_values:
        if path == "value":
            node_or_obj.outputs[0].default_value = val
            node_or_obj.outputs[0].keyframe_insert("default_value", frame=f)
        else:
            setattr(node_or_obj, path, val)
            node_or_obj.keyframe_insert(path, frame=f)
    ad = node_or_obj.id_data.animation_data if path == "value" else node_or_obj.animation_data
    if ad and ad.action:
        for fc in fcurves(ad.action):
            for kp in fc.keyframe_points:
                kp.interpolation = interp


def fcurves(action):
    """Blender 5 layered actions keep fcurves in channelbags."""
    if hasattr(action, "fcurves") and len(action.fcurves):
        return list(action.fcurves)
    out = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for cb in strip.channelbags:
                out.extend(cb.fcurves)
    return out


# ---------------------------------------------------------------- highlight (the channel's signature)

def highlight(obj, color="#5CFF4F", scale=1.012, strength=4.0):
    """Additive fresnel shell over obj (spec 8.1). Returns the 'amount' value node (0 = off, 1 = on)."""
    sh = obj.copy()
    sh.data = obj.data.copy()
    sh.name = obj.name + "_hl"
    bpy.context.collection.objects.link(sh)
    sh.parent = obj.parent
    sh.location, sh.rotation_euler = obj.location.copy(), obj.rotation_euler.copy()  # matrix_world is stale here
    sh.scale = tuple(s * scale for s in obj.scale)
    sh.modifiers.clear()
    for md in obj.modifiers:
        if md.type in ("SUBSURF", "BEVEL", "SOLIDIFY"):
            n = sh.modifiers.new(md.name, md.type)
            for p in ("levels", "render_levels", "width", "segments", "thickness", "offset"):
                if hasattr(md, p):
                    setattr(n, p, getattr(md, p))
    m = bpy.data.materials.new(obj.name + "_hlmat")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*srgb(color), 1)
    em.inputs["Strength"].default_value = strength
    fr = nt.nodes.new("ShaderNodeLayerWeight")
    fr.inputs["Blend"].default_value = 0.35
    base = nt.nodes.new("ShaderNodeMath")          # fill 0.5 + fresnel edge
    base.operation = "MULTIPLY_ADD"
    base.inputs[1].default_value = 0.6
    base.inputs[2].default_value = 0.4
    amt = nt.nodes.new("ShaderNodeValue")
    amt.name = "amount"
    amt.outputs[0].default_value = 0.0
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.use_clamp = True
    add = nt.nodes.new("ShaderNodeAddShader")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(fr.outputs["Facing"], base.inputs[0])
    nt.links.new(base.outputs[0], mul.inputs[0])
    nt.links.new(amt.outputs[0], mul.inputs[1])
    nt.links.new(tr.outputs[0], add.inputs[0])
    nt.links.new(em.outputs[0], add.inputs[1])
    nt.links.new(mul.outputs[0], mix.inputs["Fac"])
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(add.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    sh.data.materials.clear()
    sh.data.materials.append(m)
    sh.visible_shadow = False
    sh.visible_diffuse = False
    return amt


def pulse(amount_node, f_on, f_off, fade_in=6, fade_out=12):
    key(amount_node, "value", [(f_on - fade_in, 0), (f_on, 1), (f_off, 1), (f_off + fade_out, 0)])


# ---------------------------------------------------------------- geometry

def link(name, me):
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    return o


def lathe(name, profile, seg=96, close_top=False, close_bottom=True, rfun=None):
    """Revolve a (r, z) profile around Z, with UVs (u around, v along the profile).
    rfun(ring_index, theta) -> radius multiplier (crimps, flutes). Returns the object (smooth shaded)."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    rings = []
    for k, (r, z) in enumerate(profile):
        ring = []
        for i in range(seg):
            th = 2 * math.pi * i / seg
            rr = r * (rfun(k, th) if rfun else 1.0)
            ring.append(bm.verts.new((rr * math.cos(th), rr * math.sin(th), z)))
        rings.append(ring)
    n = len(profile) - 1
    for k, (a, b) in enumerate(zip(rings, rings[1:])):
        for i in range(seg):
            j = (i + 1) % seg
            f = bm.faces.new((a[i], a[j], b[j], b[i]))
            for lp, (u, v) in zip(f.loops, ((i, k), (i + 1, k), (i + 1, k + 1), (i, k + 1))):
                lp[uv].uv = (u / seg, v / max(n, 1))
    if close_bottom:
        bm.faces.new(list(reversed(rings[0])))
    if close_top:
        bm.faces.new(rings[-1])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return link(name, me)


def cord(name, R, z, material, loops=2, gap=0.0042, r=0.0017, strands=3, knot=0.0, tails=0.016):
    """Twisted cotton cord tied around a cylinder of radius R at height z: `loops` wraps of `strands`
    helically twisted strands, a knot at angle `knot` and two dangling tails (ref 3 [2.25])."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth, cu.bevel_resolution = r * 0.62, 3
    rr = R + r
    for L in range(loops):
        for s_ in range(strands):
            sp = cu.splines.new("POLY")
            N = 360
            sp.points.add(N - 1)
            for i in range(N):
                th = 2 * math.pi * i / (N - 1)
                ph = 2 * math.pi * s_ / strands + th * 60
                rad = rr + r * 0.45 * math.cos(ph)
                sp.points[i].co = (rad * math.cos(th + knot), rad * math.sin(th + knot),
                                   z + L * gap + r * 0.45 * math.sin(ph), 1)
    # knot: a short twisted lump; tails hang and splay
    kx, ky = (rr + r * 1.2) * math.cos(knot), (rr + r * 1.2) * math.sin(knot)
    out = Vector((math.cos(knot), math.sin(knot), 0))
    side = Vector((-math.sin(knot), math.cos(knot), 0))
    for t, spread in ((0, -1), (1, 1)):
        for s_ in range(strands):
            sp = cu.splines.new("POLY")
            N = 60
            sp.points.add(N - 1)
            for i in range(N):
                u = i / (N - 1)
                ph = 2 * math.pi * s_ / strands + u * 40
                c = (Vector((kx, ky, z + gap * 0.5)) + out * (0.004 * math.sin(u * 3)) +
                     side * spread * (0.002 + 0.006 * u) + Vector((0, 0, -tails * u * (0.8 + 0.2 * t))))
                c += Vector((r * 0.4 * math.cos(ph), r * 0.4 * math.sin(ph), 0)) * 1.0
                sp.points[i].co = (*c, 1)
    o = link(name, cu)
    cu.materials.append(material)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r * 2.0, location=(kx, ky, z + gap * 0.5))
    k = bpy.context.object
    k.name = name + "_knot"
    k.scale = (1.0, 1.4, 1.1)
    smooth(k)
    assign(k, material)
    k.parent = o
    return o


def crown_cap(name, r=0.0148, h=0.0075, material=None, flutes=21):
    """Crimped crown cap: a lathe with the skirt fluted."""
    prof = [(0.0001, h), (r * 0.80, h), (r * 0.96, h * 0.92), (r, h * 0.72), (r * 1.06, h * 0.25), (r * 1.08, 0.0)]
    o = lathe(name, prof, seg=168, close_bottom=False,
              rfun=lambda k, th: 1.0 + (0.055 * (0.5 + 0.5 * math.cos(flutes * th)) if k >= 3 else 0.0))
    if material:
        assign(o, material)
    return o


def image_mat(name, path, rough=0.55):
    m = mat(name, rough=rough)
    nt = m.node_tree
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path)
    nt.links.new(tex.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    return m


def rbox(name, size, bevel=0.03, segs=4, loc=(0, 0, 0)):
    """Rounded box (bevel on every edge, spec 4)."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    md = o.modifiers.new("bevel", "BEVEL")
    md.width, md.segments, md.limit_method = bevel, segs, "NONE"
    md.harden_normals = False
    smooth(o)
    return o


def smooth(o):
    for p in o.data.polygons:
        p.use_smooth = True


def cyl(name, r, h, loc=(0, 0, 0), verts=64, bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc)
    o = bpy.context.object
    o.name = name
    if bevel:
        md = o.modifiers.new("bevel", "BEVEL")
        md.width, md.segments, md.limit_method = bevel, 3, "ANGLE"
    smooth(o)
    return o


def torus(name, R, r, loc=(0, 0, 0), maj=128, mnr=16):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=maj, minor_segments=mnr,
                                     location=loc)
    o = bpy.context.object
    o.name = name
    smooth(o)
    return o


def to_mesh(o):
    """Curve -> mesh (so booleans can cut it)."""
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target="MESH")
    return bpy.context.object


def assign(o, m):
    o.data.materials.clear()
    o.data.materials.append(m)
    return o


# ---------------------------------------------------------------- camera / shots

def camera(name, fov_v=32, dof=None, fstop=2.0):
    c = bpy.data.cameras.new(name)
    c.sensor_fit = "VERTICAL"
    c.sensor_height = 24
    c.lens = 12 / math.tan(math.radians(fov_v) / 2)
    c.clip_start = 0.005
    if dof is not None:
        c.dof.use_dof = True
        c.dof.focus_distance = dof
        c.dof.aperture_fstop = fstop
    o = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(o)
    return o


def cam_move(o, f0, f1, p0, p1, t0, t1, roll0=0.0, roll1=0.0, ease="SINE"):
    """Keyframe a camera from (pos p0 looking at t0) to (p1, t1); easing in/out inside the shot (spec 6).
    The camera rides a rig empty that tracks the target, so the roll (camera's own Z) survives the constraint."""
    target = bpy.data.objects.new(o.name + "_tgt", None)
    rig = bpy.data.objects.new(o.name + "_rig", None)
    for e in (target, rig):
        bpy.context.collection.objects.link(e)
    cns = rig.constraints.new("TRACK_TO")
    cns.target = target
    cns.track_axis, cns.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"
    o.parent = rig
    o.location = (0, 0, 0)
    for f, p, t, r in ((f0, p0, t0, roll0), (f1, p1, t1, roll1)):
        rig.location = p
        rig.keyframe_insert("location", frame=f)
        target.location = t
        target.keyframe_insert("location", frame=f)
        o.rotation_euler = (0, 0, math.radians(r))
        o.keyframe_insert("rotation_euler", frame=f)
    for ob in (o, rig, target):
        for fc in fcurves(ob.animation_data.action):
            for kp in fc.keyframe_points:
                kp.interpolation = ease
                kp.easing = "EASE_IN_OUT"
    return target


def shots(cams):
    """cams: [(frame, camera_obj), ...] -> timeline markers that switch the active camera (hard cuts)."""
    s = bpy.context.scene
    for f, c in cams:
        m = s.timeline_markers.new(c.name, frame=f)
        m.camera = c
    s.camera = cams[0][1]


def backdrop(cam, inner="#A8D4E4", outer="#5AA6C6", dist=6.0, cy=0.06):
    """Gradient studio void glued to a camera: radial halo behind the subject (spec 5).
    Seen by the camera and through glass, never lights the scene."""
    fov = 2 * math.atan(12 / cam.data.lens)
    h = 2 * dist * math.tan(fov / 2) * 1.15
    bpy.ops.mesh.primitive_plane_add(size=1)
    p = bpy.context.object
    p.name = cam.name + "_bg"
    p.scale = (h * W / H, h, 1)
    p.parent = cam
    p.location = (0, 0, -dist)
    m = bpy.data.materials.new(p.name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    gr = nt.nodes.new("ShaderNodeTexGradient")
    gr.gradient_type = "SPHERICAL"
    mp = nt.nodes.new("ShaderNodeMapping")
    k = 1.35
    mp.inputs["Location"].default_value = (0, -cy * k, 0)
    mp.inputs["Scale"].default_value = (k * W / H, k, 1)
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*srgb(outer), 1)
    ramp.color_ramp.elements[1].color = (*srgb(inner), 1)
    ramp.color_ramp.interpolation = "EASE"
    ramp.color_ramp.elements[0].position = 0.30
    ramp.color_ramp.elements[1].position = 0.95
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], gr.inputs["Vector"])
    nt.links.new(gr.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    em.inputs["Strength"].default_value = 1.0
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    p.data.materials.append(m)
    p.visible_diffuse = p.visible_glossy = p.visible_shadow = p.visible_volume_scatter = False
    p.visible_glossy = True  # glass/chrome reflect the studio
    return p


# ---------------------------------------------------------------- hands (code-built, semi-realistic)

SKIN = "#D99B7D"

# finger: knuckle (x, y), segment lengths (proximal, middle, distal), base radius
# (right hand, metres; fingers +Y, palm faces -Z). Ratios from an adult hand: middle finger ~ palm length * 0.9,
# fingers ~1.7 cm thick at the base tapering to ~1.3 cm at the tip.
FINGERS = [((-0.0285, 0.090), (0.044, 0.026, 0.021), 0.0102),   # index
           ((-0.0095, 0.094), (0.048, 0.029, 0.022), 0.0105),   # middle
           ((0.0095, 0.091), (0.045, 0.027, 0.021), 0.0099),    # ring
           ((0.0270, 0.083), (0.035, 0.021, 0.019), 0.0088)]    # pinky
STEP = 0.0014
FLEX = (78, 98, 62)   # degrees of each joint at curl = 1


def _sample(a, b, ra, rb, pts, n=None):
    """n comes from the nominal length, never the measured one: every pose must have the same count."""
    n = n or max(2, int((b - a).length / STEP))
    for i in range(n):
        t = i / n
        pts.append((a.lerp(b, t), ra + (rb - ra) * t))


def _joints(c):
    """curl: a number (all joints scale together) or (mcp, pip, dip) in degrees."""
    if isinstance(c, (tuple, list)):
        return tuple(math.radians(v) for v in c)
    return tuple(math.radians(f * c) for f in FLEX)


def hand_points(curl=(0.2, 0.15, 0.15, 0.2, 0.25), spread=0.08, thumb_open=0.6, arm=0.16, thumb_dir=None,
                thumb_bend=None):
    """Skeleton of the hand as (position, radius) samples + nail frames, for a right hand.
    curl[0] = thumb, curl[1..4] = index..pinky, each a 0-1 number or (mcp, pip, dip) degrees.
    thumb_dir (local vector) overrides where the thumb points; thumb_bend = (mcp, ip) degrees.
    Fixed sample counts, so any two poses can be blended point by point."""
    from mathutils import Matrix
    pts, nails = [], []
    # palm: an elliptic slab, thicker at the thenar (thumb) and hypothenar (pinky-side heel) mounds
    for iy in range(22):
        for ix in range(17):
            x, y = -0.034 + ix * 0.00425, 0.004 + iy * 0.00425
            e = (x / 0.035) ** 2 + ((y - 0.048) / 0.050) ** 2
            if e > 1:
                pts.append((Vector((0, 0.048, 0)), 0.001))  # keep the count fixed
                continue
            thenar = max(0.0, 1 - ((x + 0.020) ** 2 + (y - 0.024) ** 2) / 0.00042)
            hypo = max(0.0, 1 - ((x - 0.022) ** 2 + (y - 0.026) ** 2) / 0.00030)
            z = -0.002 - 0.0045 * thenar - 0.002 * hypo
            pts.append((Vector((x, y, z)), 0.0094 * (1 - 0.42 * e) + 0.0042 * thenar + 0.0022 * hypo))
    # wrist + forearm: two rows so the section is an ellipse (wider than thick), tapering in at the wrist
    for sx in (-1, 0, 1):
        for i in range(110):
            y = 0.012 - (arm + 0.012) * i / 109
            u = min(1.0, (0.012 - y) / 0.20)          # forearm widens over its first 20 cm, whatever `arm` is
            pts.append((Vector((sx * (0.0085 + 0.0070 * u), y, 0.0015 + 0.002 * u + 0.002 * (sx == 0))),
                        0.0175 + 0.0090 * u))
    for i, ((x, y), lens, r) in enumerate(FINGERS):
        ang = _joints(curl[i + 1])
        sp = spread * (i - 1.3)
        d = Vector((math.sin(sp), math.cos(sp), 0))
        up = Vector((0, 0, 1))
        axis = Vector((math.cos(sp), -math.sin(sp), 0))
        p = Vector((x, y - 0.016, 0.0005))
        _sample(p, Vector((x, y, 0.0005)), r * 1.12, r * 1.08, pts, n=11)     # metacarpal ridge under the skin
        p = Vector((x, y, 0.0005))
        pts.append((p + up * r * 0.25, r * 1.0))                            # MCP knuckle bump (dorsal)
        for j, L in enumerate(lens):
            rot = Matrix.Rotation(-ang[j], 3, axis)
            d, up = rot @ d, rot @ up
            q = p + d * L
            r0 = r * (1.0, 0.90, 0.84)[j]
            r1 = r * (0.90, 0.85, 0.82)[j]
            _sample(p, q, r0, r1, pts, n=round(L / STEP))
            if j < 2:                                                         # PIP / DIP knuckles
                pts.append((q + up * r1 * 0.12, r1 * 1.04))
            p = q
        pts.append((p - d * r * 0.42 - up * r * 0.22, r * 0.80))             # fingertip pad
        pts.append((p - d * r * 0.10, r * 0.78))                              # rounded tip
        nails.append((p, d, r * 0.76, up.copy()))
    # thumb: leaves the heel of the palm on the index side; out (open) .. across the palm (closed)
    o, c = thumb_open, curl[0]
    base = Vector((-0.025, 0.012, -0.006))
    if thumb_dir is not None:
        d = Vector(thumb_dir).normalized()
    else:
        d = Vector((-0.70, 0.68, -0.22)).lerp(Vector((0.05, 0.62, -0.78)), 1 - o).normalized()
    up = Vector((-0.55, 0.0, 0.83))
    up = (up - d * up.dot(d)).normalized()
    axis = d.cross(up).normalized()
    bend = thumb_bend if thumb_bend is not None else ((30 * c + 8), (40 * c + 8))
    p = base
    for j, (L, r0, r1) in enumerate([(0.036, 0.0140, 0.0112), (0.030, 0.0108, 0.0098), (0.025, 0.0096, 0.0082)]):
        if j:
            rot = Matrix.Rotation(-math.radians(bend[j - 1]), 3, axis)
            d, up = rot @ d, rot @ up
        q = p + d * L
        _sample(p, q, r0, r1, pts, n=round(L / STEP))
        if j:
            pts.append((p + up * r0 * 0.2, r0 * 1.06))
        p = q
    pts.append((p - d * 0.0035 - up * 0.0022, 0.0070))
    pts.append((p - d * 0.0012, 0.0066))
    nails.insert(0, (p, d, 0.0084, up.copy()))
    return pts, nails


def wrap_matrix(m_obj, R, z, phi, side=1, contact_y=0.066, gap=0.0):
    """Hand root matrix for a hand wrapping a vertical cylinder (radius R, along +Z of m_obj) at height z:
    palm against the side at angle phi (degrees, around the object's Z), fingers going around it
    (right hand counter-clockwise, left clockwise), index finger on top, back of the hand facing out."""
    from mathutils import Matrix
    a = math.radians(phi)
    n = Vector((math.cos(a), math.sin(a), 0))
    xl = Vector((0, 0, -1 if side > 0 else 1))
    yl = n.cross(xl)
    rot = Matrix((xl, yl, n)).transposed()
    palm = Vector((0.0, contact_y, -0.0125))
    if side < 0:
        palm.x = -palm.x
    loc = n * (R + gap) + Vector((0, 0, z)) - rot @ palm
    return m_obj @ (Matrix.Translation(loc) @ rot.to_4x4())


class Hand:
    """Semi-realistic hand: skeleton samples -> Geometry Nodes Points to Volume -> Volume to Mesh (one fused,
    smooth skin) + glossy nails. Poses are shape keys on the skeleton, so the skin follows them.
        h = Hand("hand", poses={"open": dict(...), "grip": dict(...)}, side=1)
        h.key(frame, "grip")   # hold/blend to that pose at that frame
    side=-1 mirrors it into a left hand. Place and animate h.root. Fingers point +Y, palm faces -Z."""

    def __init__(self, name, poses, side=1, skin=SKIN, scale=1.0, voxel=0.00055):
        self.names = list(poses)
        self.side, self.k = side, scale
        self.root = bpy.data.objects.new(name, None)
        bpy.context.collection.objects.link(self.root)
        sets = [hand_points(**poses[n]) for n in self.names]
        X = lambda v: Vector((v[0] * side * scale, v[1] * scale, v[2] * scale))  # noqa: E731
        me = bpy.data.meshes.new(name + "_skel")
        me.from_pydata([X(p) for p, _ in sets[0][0]], [], [])
        at = me.attributes.new("radius_s", "FLOAT", "POINT")
        at.data.foreach_set("value", [r * scale * 1.07 for _, r in sets[0][0]])  # +7 %: the skin blur shrinks
        self.obj = link(name + "_skin", me)
        self.obj.parent = self.root
        self.obj.shape_key_add(name="Basis")
        self.keys = {}
        for n, (pts, _) in zip(self.names, sets):
            sk = self.obj.shape_key_add(name=n)
            for v, (p, _) in zip(sk.data, pts):
                v.co = X(p)
            sk.value = 0.0
            self.keys[n] = sk
        gn = self.obj.modifiers.new("skin", "NODES")
        m = mat(name + "_skinmat", skin, rough=0.56, sss=0.4)
        b = m.node_tree.nodes["Principled BSDF"]
        b.inputs["Subsurface Radius"].default_value = (1.0, 0.36, 0.18)   # red travels furthest: backlit fingers glow
        b.inputs["Subsurface Scale"].default_value = 0.0035 * scale
        b.inputs["Specular IOR Level"].default_value = 0.28
        b.inputs["Sheen Weight"].default_value = 0.25
        b.inputs["Sheen Roughness"].default_value = 0.45
        _skin_detail(m)
        gn.node_group = _skin_nodes(name, voxel * scale, m)
        nm = mat(name + "_nail", "#CF8E7B", rough=0.32, coat=0.15, sss=0.35)
        _nb = nm.node_tree.nodes["Principled BSDF"]
        _nb.inputs["Subsurface Radius"].default_value = (1.0, 0.4, 0.25)
        _nb.inputs["Subsurface Scale"].default_value = 0.002 * scale
        _nb.inputs["Specular IOR Level"].default_value = 0.3
        _nt = nm.node_tree      # skin-tinted nail bed, a slightly darker cuticle rim at the root (-Y) and sides
        _tc, _sp, _rp = (_nt.nodes.new(t) for t in ("ShaderNodeTexCoord", "ShaderNodeSeparateXYZ",
                                                    "ShaderNodeValToRGB"))
        _rp.color_ramp.elements[0].color = (*srgb("#BF7A6A"), 1)
        _rp.color_ramp.elements[0].position = 0.18
        _rp.color_ramp.elements[1].color = (*srgb("#D3927F"), 1)
        _rp.color_ramp.elements[1].position = 0.40
        _nt.links.new(_tc.outputs["Generated"], _sp.inputs[0])
        _nt.links.new(_sp.outputs["Y"], _rp.inputs["Fac"])
        _nt.links.new(_rp.outputs["Color"], _nb.inputs["Base Color"])
        self.nails, self.nail_sets = [], []
        for k in range(5):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=24, ring_count=12)
            n = bpy.context.object
            n.name = f"{name}_nail{k}"
            n.rotation_mode = "QUATERNION"
            smooth(n)
            assign(n, nm)
            n.parent = self.root
            self.nails.append(n)
        for _, nl in sets:
            self.nail_sets.append([self._nail_frame(*t, X) for t in nl])
        self._set_nails(0)

    def _nail_frame(self, p, d, r, up, X):
        """Nail on the dorsal side of the distal segment, half sunk into the skin, ending at the tip."""
        from mathutils import Matrix
        dw = X(d).normalized()
        u = X(up)
        u = (u - dw * u.dot(dw)).normalized()
        sa = dw.cross(u)
        if self.side < 0:
            sa = -sa
        loc = X(p) - dw * r * 1.0 * self.k + u * r * 0.66 * self.k   # sunk: top ~0.3 mm proud
        q = Matrix((sa, dw, u)).transposed().to_quaternion()
        return loc, q, (r * 0.56 * self.k, r * 0.80 * self.k, r * 0.15 * self.k)

    def _set_nails(self, i, frame=None):
        for n, (loc, q, sc) in zip(self.nails, self.nail_sets[i]):
            n.location, n.rotation_quaternion, n.scale = loc, q, sc
            if frame is not None:
                for p in ("location", "rotation_quaternion", "scale"):
                    n.keyframe_insert(p, frame=frame)

    def snap_nails(self, frame=None):
        """Seat every nail on the evaluated skin (the skin blur pulls fingertips in by a few mm): nearest surface
        point, oriented to its normal, sunk so only ~0.3 mm stands proud. Call after placing h.root."""
        from mathutils import Matrix
        from mathutils.bvhtree import BVHTree
        s = bpy.context.scene
        if frame is not None:
            s.frame_set(frame)
        dg = bpy.context.evaluated_depsgraph_get()
        ev = self.obj.evaluated_get(dg)
        bvh = BVHTree.FromObject(ev, dg)                     # in the skin's local space
        to_l = self.obj.matrix_world.inverted()
        for n in self.nails:
            mw = n.matrix_world
            y = (mw.to_3x3() @ Vector((0, 1, 0))).normalized()
            hit = bvh.find_nearest(to_l @ mw.translation)
            if hit[0] is None:
                continue
            loc_w = self.obj.matrix_world @ hit[0]
            nrm = (self.obj.matrix_world.to_3x3() @ hit[1]).normalized()
            y = (y - nrm * y.dot(nrm)).normalized()
            x = y.cross(nrm)
            q = Matrix((x, y, nrm)).transposed().to_quaternion()
            thick = n.scale.z
            w = Matrix.LocRotScale(loc_w - nrm * thick * 0.7, q, n.scale)
            n.matrix_parent_inverse = Matrix.Identity(4)
            lm = self.root.matrix_world.inverted() @ w
            n.location, n.rotation_quaternion = lm.to_translation(), lm.to_quaternion()
            if n.animation_data:
                n.animation_data_clear()
        return self

    def key(self, frame, pose):
        """Be fully in `pose` at `frame` (linear blend from the previous key)."""
        for n, sk in self.keys.items():
            sk.value = 1.0 if n == pose else 0.0
            sk.keyframe_insert("value", frame=frame)
        self._set_nails(self.names.index(pose), frame)
        return self


def _skin_nodes(name, voxel, material):
    g = bpy.data.node_groups.new(name + "_gn", "GeometryNodeTree")
    g.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    g.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    n = g.nodes
    gi, go = n.new("NodeGroupInput"), n.new("NodeGroupOutput")
    m2p = n.new("GeometryNodeMeshToPoints")
    rad = n.new("GeometryNodeInputNamedAttribute")
    rad.data_type = "FLOAT"
    rad.inputs["Name"].default_value = "radius_s"
    p2v = n.new("GeometryNodePointsToVolume")
    p2v.inputs["Density"].default_value = 1.0
    try:
        p2v.resolution_mode = "VOXEL_SIZE"
    except (AttributeError, TypeError):
        pass
    p2v.inputs["Voxel Size"].default_value = voxel
    v2m = n.new("GeometryNodeVolumeToMesh")
    v2m.inputs["Threshold"].default_value = 0.1
    sm = n.new("GeometryNodeSetShadeSmooth")
    mt = n.new("GeometryNodeSetMaterial")
    mt.inputs["Material"].default_value = material
    pos = n.new("GeometryNodeInputPosition")
    blur = n.new("GeometryNodeBlurAttribute")
    blur.data_type = "FLOAT_VECTOR"
    blur.inputs["Iterations"].default_value = 4
    sp = n.new("GeometryNodeSetPosition")
    L = g.links.new
    L(gi.outputs[0], m2p.inputs["Mesh"])
    L(rad.outputs[0], m2p.inputs["Radius"])
    L(m2p.outputs[0], p2v.inputs["Points"])
    L(rad.outputs[0], p2v.inputs["Radius"])
    L(p2v.outputs[0], v2m.inputs["Volume"])
    L(v2m.outputs[0], sp.inputs["Geometry"])
    L(pos.outputs[0], blur.inputs["Value"])
    L(blur.outputs[0], sp.inputs["Position"])
    L(sp.outputs[0], sm.inputs["Geometry"])
    L(sm.outputs[0], mt.inputs["Geometry"])
    L(mt.outputs[0], go.inputs[0])
    return g


def _skin_detail(m):
    """Skin at 1080 px: pores (Voronoi pits) + fine wrinkle noise, wrinkle lines across the dorsal knuckles,
    darker/redder creases (cavity), redder knuckles and fingertips (convexity), yellower palm side, blotchy tone."""
    nt, b = m.node_tree, m.node_tree.nodes["Principled BSDF"]
    N, L = nt.nodes.new, nt.links.new
    base = b.inputs["Base Color"].default_value[:]

    def mr(src, a, b_, lo=0.0, hi=1.0):
        n = N("ShaderNodeMapRange")
        n.inputs["From Min"].default_value, n.inputs["From Max"].default_value = a, b_
        n.inputs["To Min"].default_value, n.inputs["To Max"].default_value = lo, hi
        L(src, n.inputs["Value"])
        return n.outputs["Result"]

    def mix(a, col, fac):
        n = N("ShaderNodeMix")
        n.data_type = "RGBA"
        if isinstance(a, tuple):
            n.inputs["A"].default_value = a
        else:
            L(a, n.inputs["A"])
        n.inputs["B"].default_value = (*srgb(col), 1)
        L(fac, n.inputs["Factor"])
        return n.outputs["Result"]

    def math_(op, a, b_):
        n = N("ShaderNodeMath")
        n.operation = op
        for k, v in enumerate((a, b_)):
            if isinstance(v, (int, float)):
                n.inputs[k].default_value = v
            else:
                L(v, n.inputs[k])
        return n.outputs[0]

    tc, geo = N("ShaderNodeTexCoord"), N("ShaderNodeNewGeometry")
    # --- bump: pores + micro wrinkles + knuckle lines
    pores = N("ShaderNodeTexVoronoi")
    pores.inputs["Scale"].default_value = 1400.0
    L(tc.outputs["Object"], pores.inputs["Vector"])
    micro = N("ShaderNodeTexNoise")
    micro.inputs["Scale"].default_value = 450.0
    micro.inputs["Detail"].default_value = 6
    micro.inputs["Roughness"].default_value = 0.65
    L(tc.outputs["Object"], micro.inputs["Vector"])
    lines = N("ShaderNodeTexWave")                 # creases across the fingers (fingers run along local Y)
    lines.bands_direction, lines.wave_profile = "Y", "SIN"
    lines.inputs["Scale"].default_value = 520.0
    lines.inputs["Distortion"].default_value = 6.0
    lines.inputs["Detail Scale"].default_value = 2.0
    L(tc.outputs["Object"], lines.inputs["Vector"])
    sep = N("ShaderNodeSeparateXYZ")
    L(tc.outputs["Normal"], sep.inputs[0])
    dorsal = mr(sep.outputs["Z"], 0.2, 0.7)        # back of the hand / fingers
    convex = mr(geo.outputs["Pointiness"], 0.505, 0.545)
    knuckle_lines = math_("MULTIPLY", math_("MULTIPLY", mr(lines.outputs["Fac"], 0.7, 1.0), mr(geo.outputs["Pointiness"], 0.50, 0.53)), dorsal)
    h = math_("ADD", math_("MULTIPLY", pores.outputs["Distance"], 0.6), math_("MULTIPLY", micro.outputs["Fac"], 0.5))
    h = math_("SUBTRACT", h, math_("MULTIPLY", knuckle_lines, 1.2))
    bump = N("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.85
    bump.inputs["Distance"].default_value = 0.0004
    L(h, bump.inputs["Height"])
    L(bump.outputs["Normal"], b.inputs["Normal"])
    # --- colour
    blot = N("ShaderNodeTexNoise")
    blot.inputs["Scale"].default_value = 60.0
    blot.inputs["Detail"].default_value = 3
    L(tc.outputs["Object"], blot.inputs["Vector"])
    c = mix(base, "#D08C76", mr(blot.outputs["Fac"], 0.42, 0.68, 0.0, 0.8))           # blotchy tone
    c = mix(c, "#E9B993", mr(sep.outputs["Z"], -0.2, -0.7, 0.0, 0.55))                # yellower palm side
    c = mix(c, "#D47462", math_("MULTIPLY", convex, 0.8))                             # red knuckles / tips
    c = mix(c, "#B06656", mr(geo.outputs["Pointiness"], 0.455, 0.50, 0.85, 0.0))       # creases
    c = mix(c, "#B36B5A", math_("MULTIPLY", knuckle_lines, 0.9))                       # knuckle lines
    L(c, b.inputs["Base Color"])
    rough = N("ShaderNodeMapRange")                                                     # creases matte
    L(micro.outputs["Fac"], rough.inputs["Value"])
    rough.inputs["To Min"].default_value, rough.inputs["To Max"].default_value = 0.48, 0.64
    L(rough.outputs["Result"], b.inputs["Roughness"])
