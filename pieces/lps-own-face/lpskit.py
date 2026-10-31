"""LowPolyShorts / punkpolyshorts kit — Blender (EEVEE) helpers for the PS1 low-poly look.
Values from fuentes/lowpolyshorts-style/especificacion-tecnica-del-estilo.md: flat light (50% emission + diffuse, sun
without shadow), Standard view, Closest textures 64-256 px, no AO/bloom/DOF, 1080x1920 @ 30 fps.
Imported by a piece's build.py running inside Blender."""
import math
import os

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
KANEDA_BLEND = os.path.join(ROOT, "pieces/lps-hombre/punk/Kaneda_punk.blend")
FACES = os.path.join(ROOT, "pieces/lps-hombre/punk/faces")
HOMBRE_BLEND = os.path.join(ROOT, "pieces/lps-hombre/out/lps_hombre.blend")
FONT_LOGO = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_PUNK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts", "PunkPoly-Black.ttf")  # ours, drawn after the LPS title (fonts/make_font.py)
FONT_SM64 = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts", "LuckiestGuy-Regular.ttf")  # OFL; closest free match to the LPS/SM64 logo
KS = 0.3175                     # Kaneda model units -> metres (1.72 m)
KZ = 3.4945 * KS                # armature z so the feet touch z = 0
FPS = 30


# ---------------------------------------------------------------- scene

def reset(world_hex="#9AA0A8"):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x, sc.render.resolution_y, sc.render.fps = 1080, 1920, FPS
    sc.render.filter_size = 0.75
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (*srgb(world_hex), 1)
    sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 2.0; sun.use_shadow = False
    so = bpy.data.objects.new("Sun", sun); so.rotation_euler = (math.radians(35), 0, math.radians(-30))
    sc.collection.objects.link(so)
    return sc


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def flat_shader(nt, color_socket, out, alpha_socket=None):
    """50% emission + 50% diffuse from one colour socket (the LPS 'almost unlit' look)."""
    dif = nt.nodes.new("ShaderNodeBsdfDiffuse"); emi = nt.nodes.new("ShaderNodeEmission")
    mix = nt.nodes.new("ShaderNodeMixShader"); mix.inputs[0].default_value = 0.5
    nt.links.new(color_socket, dif.inputs["Color"]); nt.links.new(color_socket, emi.inputs["Color"])
    nt.links.new(dif.outputs[0], mix.inputs[1]); nt.links.new(emi.outputs[0], mix.inputs[2])
    if alpha_socket is not None:
        tr = nt.nodes.new("ShaderNodeBsdfTransparent"); m2 = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(alpha_socket, m2.inputs[0]); nt.links.new(tr.outputs[0], m2.inputs[1]); nt.links.new(mix.outputs[0], m2.inputs[2])
        nt.links.new(m2.outputs[0], out.inputs[0])
    else:
        nt.links.new(mix.outputs[0], out.inputs[0])


def mat_color(name, hexc, emit_only=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); rgb = nt.nodes.new("ShaderNodeRGB")
    rgb.outputs[0].default_value = (*srgb(hexc), 1)
    if emit_only:
        e = nt.nodes.new("ShaderNodeEmission"); nt.links.new(rgb.outputs[0], e.inputs[0]); nt.links.new(e.outputs[0], out.inputs[0])
    else:
        flat_shader(nt, rgb.outputs[0], out)
    return m


def image_from_array(name, arr):
    """arr: HxWx3/4 uint8 (top row first) -> packed bpy image."""
    h, w = arr.shape[:2]
    if arr.shape[2] == 3:
        arr = np.concatenate([arr, np.full((h, w, 1), 255, np.uint8)], 2)
    im = bpy.data.images.new(name, w, h, alpha=True)
    im.pixels.foreach_set((arr[::-1].astype(np.float32) / 255).ravel())
    im.pack()
    return im


def mat_image(name, img, emit_only=False, alpha=False, repeat=(1, 1)):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); t = nt.nodes.new("ShaderNodeTexImage")
    t.image = img; t.interpolation = "Closest"
    if repeat != (1, 1):
        tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (repeat[0], repeat[1], 1)
        nt.links.new(tc.outputs["UV"], mp.inputs[0]); nt.links.new(mp.outputs[0], t.inputs[0])
    if emit_only:
        e = nt.nodes.new("ShaderNodeEmission"); nt.links.new(t.outputs[0], e.inputs[0])
        if alpha:
            tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
            nt.links.new(t.outputs[1], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2])
            nt.links.new(mx.outputs[0], out.inputs[0])
        else:
            nt.links.new(e.outputs[0], out.inputs[0])
    else:
        flat_shader(nt, t.outputs[0], out, t.outputs[1] if alpha else None)
    if alpha:
        m.surface_render_method = "BLENDED"
    return m


# ---------------------------------------------------------------- geometry

def link(o, parent=None):
    bpy.context.scene.collection.objects.link(o)
    if parent:
        o.parent = parent
    return o


def box(name, size, loc, mat=None, uv_scale=1.0):
    """Axis-aligned box; UVs in metres * uv_scale (so tiled textures keep their texel size)."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    uvl = bm.loops.layers.uv.new()
    for f in bm.faces:
        n = f.normal
        for l in f.loops:
            p = l.vert.co
            if abs(n.z) > 0.5:
                l[uvl].uv = (p.x * uv_scale, p.y * uv_scale)
            elif abs(n.x) > 0.5:
                l[uvl].uv = (p.y * uv_scale, p.z * uv_scale)
            else:
                l[uvl].uv = (p.x * uv_scale, p.z * uv_scale)
    bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.location = loc
    if mat:
        me.materials.append(mat)
    return o


def plane(name, w, h, loc, rot=(math.pi / 2, 0, 0), mat=None):
    """Upright plane facing -Y by default; UV 0..1."""
    me = bpy.data.meshes.new(name)
    me.from_pydata([(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new()
    for i, c in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]):
        uv.data[i].uv = c
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    if mat:
        me.materials.append(mat)
    return o


def mesh_from(name, verts, faces, mat=None, loc=(0, 0, 0)):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces)
    o = link(bpy.data.objects.new(name, me)); o.location = loc
    if mat:
        me.materials.append(mat)
    return o


def extrude_poly(name, pts2d, depth, mat, loc=(0, 0, 0), rot=(math.pi / 2, 0, 0)):
    """Flat 2D outline (x,y) extruded along local z; default rot stands it upright facing -Y."""
    n = len(pts2d)
    v = [(x, y, 0) for x, y in pts2d] + [(x, y, depth) for x, y in pts2d]
    f = [tuple(range(n))[::-1], tuple(range(n, 2 * n))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    o = mesh_from(name, v, f, mat, loc); o.rotation_euler = rot
    return o


def text3d(name, body, size=0.3, extrude=0.06, front="#FFE21A", side="#C89A00", font=FONT_LOGO, loc=(0, 0, 0),
           rot=(math.pi / 2, 0, 0), spacing=1.0):
    """Extruded 3D text converted to mesh: front faces one colour, sides another (the LPS logo/label look)."""
    cu = bpy.data.curves.new(name, "FONT"); cu.body = body; cu.font = bpy.data.fonts.load(font, check_existing=True)
    cu.size = size; cu.extrude = extrude; cu.align_x = "CENTER"; cu.align_y = "CENTER"; cu.space_line = spacing
    tmp = link(bpy.data.objects.new(name + "_c", cu))
    bpy.context.view_layer.update()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(tmp)
    me.materials.append(mat_color(name + "_f", front, emit_only=True)); me.materials.append(mat_color(name + "_s", side, emit_only=True))
    for p in me.polygons:
        p.material_index = 0 if abs(p.normal.z) > 0.9 else 1
    o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    return o


def _font_mesh(body, font, size, extrude):
    cu = bpy.data.curves.new("_fm", "FONT"); cu.body = body; cu.font = bpy.data.fonts.load(font, check_existing=True)
    cu.size = size; cu.extrude = extrude; cu.align_x = "LEFT"; cu.align_y = "CENTER"
    tmp = link(bpy.data.objects.new("_fm", cu)); bpy.context.view_layer.update()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(tmp); bpy.data.curves.remove(cu)
    return me


class Letters3D:
    """SM64-style logo text (the LPS 'Low Poly Shorts' look): every letter its own extruded object with a fixed
    random tilt/scale, popping in one after another and wobbling while on screen. Root faces -Y like text3d."""

    def __init__(self, name, body, size=0.3, extrude=None, front="#FFE21A", side="#C89A00", font=FONT_SM64,
                 loc=(0, 0, 0), line_h=1.0, seed=3, jitter=1.0):
        extrude = size * 0.2 if extrude is None else extrude
        self.size = size
        self.root = link(bpy.data.objects.new(name, None)); self.root.location = loc
        self.root.rotation_euler = (math.pi / 2, 0, 0)
        mf, ms = mat_color(name + "_f", front, emit_only=True), mat_color(name + "_s", side, emit_only=True)
        rng = np.random.default_rng(seed); self.letters = []
        lines = body.split("\n")
        for li, text in enumerate(lines):
            full = _font_mesh(text, font, size, extrude)
            W = max(v.co.x for v in full.vertices)
            edges = []
            for i, ch in enumerate(text):
                if ch == " ":
                    edges.append(None); continue
                m = _font_mesh(text[:i + 1], font, size, extrude)
                edges.append(max(v.co.x for v in m.vertices)); bpy.data.meshes.remove(m)
            y = ((len(lines) - 1) / 2 - li) * size * line_h
            for i, ch in enumerate(text):
                if ch == " ":
                    continue
                lo = max([e for e in edges[:i] if e is not None], default=-1e9)
                bm = bmesh.new(); bm.from_mesh(full)
                bmesh.ops.delete(bm, geom=[f for f in bm.faces if not (lo < f.calc_center_median().x <= edges[i])], context="FACES")
                if not bm.faces:
                    bm.free(); continue
                c = sum((v.co for v in bm.verts), Vector()) / len(bm.verts); c.z = 0
                bmesh.ops.translate(bm, verts=bm.verts, vec=-c)
                me = bpy.data.meshes.new(f"{name}_{li}_{i}"); bm.to_mesh(me); bm.free()
                me.materials.append(mf); me.materials.append(ms)
                for p in me.polygons:
                    p.material_index = 0 if abs(p.normal.z) > 0.9 else 1
                o = link(bpy.data.objects.new(me.name, me)); o.parent = self.root
                base = Vector((c.x - W / 2, y + c.y + rng.uniform(-0.04, 0.04) * size * jitter, 0))
                rz = math.radians(rng.uniform(-7, 7) * jitter); sc_ = 1 + rng.uniform(-0.08, 0.12) * jitter
                self.letters.append((o, base, rz, sc_))
            bpy.data.meshes.remove(full)
        self.hide()

    def hide(self):
        self.root.scale = (0, 0, 0)

    def anim(self, t, t_in=0.0, t_out=None, stagger=0.045, wobble=1.0, scale=1.0):
        """Pop in letter by letter (overshoot 1.1), wobble, then spin out letter by letter at t_out."""
        self.root.scale = (scale, scale, scale)
        for i, (o, base, rz, sc_) in enumerate(self.letters):
            u = t - t_in - i * stagger
            s = 0.0 if u <= 0 else (1.1 * ease(u / 0.12) if u < 0.12 else 1.1 - 0.1 * ease((u - 0.12) / 0.18))
            spin = 0.0
            if t_out is not None:
                e = ease((t - t_out - i * stagger * 0.6) / 0.22); s *= 1 - e; spin = e * math.radians(160)
            ph = i * 1.1
            o.location = base + Vector((0, wobble * 0.035 * self.size * math.sin(3.1 * t + ph), 0))
            o.rotation_euler = (0, spin + wobble * math.radians(6) * math.sin(1.7 * t + ph * 0.8),
                                rz + wobble * math.radians(5) * math.sin(2.3 * t + ph))
            k = s * sc_; o.scale = (k, k, k)


def arrow(name, length, mat, loc, rot):
    L, w, hw, hl = length, length * 0.12, length * 0.26, length * 0.38
    pts = [(-L / 2, -w), (L / 2 - hl, -w), (L / 2 - hl, -hw), (L / 2, 0), (L / 2 - hl, hw), (L / 2 - hl, w), (-L / 2, w)]
    return extrude_poly(name, pts, length * 0.08, mat, loc, rot)


def check(name, s, mat, loc, rot=(math.pi / 2, 0, 0)):
    pts = [(-0.5, 0.05), (-0.32, 0.23), (-0.12, 0.03), (0.38, 0.53), (0.56, 0.35), (-0.12, -0.33)]
    return extrude_poly(name, [(x * s, y * s) for x, y in pts], s * 0.12, mat, loc, rot)


def brain(name, r, loc):
    """Low-poly brain: squashed icosphere with lumpy verts, pink pixel 'gyri' texture, two googly eyes."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=r)
    rng = np.random.default_rng(3)
    for v in bm.verts:
        v.co = Vector((v.co.x * 1.15, v.co.y * 1.0, v.co.z * 0.82)) * (1 + rng.uniform(-0.06, 0.06))
        if abs(v.co.x) < r * 0.08:
            v.co.z -= r * 0.08            # central fissure
    uvl = bm.loops.layers.uv.new()
    for f in bm.faces:
        for l in f.loops:
            p = l.vert.co
            l[uvl].uv = (0.5 + math.atan2(p.y, p.x) / (2 * math.pi), 0.5 + p.z / (2 * r))
    bm.to_mesh(me); bm.free()
    y, x = np.mgrid[:64, :64]
    g = (np.sin(x * 0.55 + np.sin(y * 0.35) * 2.2) + np.sin(y * 0.6 + np.cos(x * 0.3) * 2.0)) > 0.4
    tex = np.where(g[..., None], [214, 104, 120], [246, 160, 168]).astype(np.uint8)
    me.materials.append(mat_image(name + "_m", image_from_array(name + "_tex", tex)))
    for p in me.polygons:
        p.use_smooth = False
    o = link(bpy.data.objects.new(name, me)); o.location = loc
    wm, km = mat_color(name + "_w", "#FFFFFF"), mat_color(name + "_k", "#000000", emit_only=True)
    for sx in (-1, 1):
        e = uv_sphere(name + f"_eye{sx}", r * 0.34, (sx * r * 0.42, -r * 0.78, r * 0.05), wm, seg=8, rings=6)
        e.parent = o
        p_ = uv_sphere(name + f"_pupil{sx}", r * 0.13, (sx * r * 0.42, -r * 1.08, r * 0.02), km, seg=6, rings=4)
        p_.parent = o
    return o


def uv_sphere(name, r, loc, mat, seg=8, rings=6):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
    bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.location = loc
    me.materials.append(mat)
    return o


def water_bg(name, w, h, loc, colors=("#5A1E8C", "#8C2EC8", "#C85AF0", "#F08CFF"), px=96, speed=0.04):
    """Full-frame emissive 'mental' background: animated noise -> constant ramp, pixelated UVs (LPS recipe)."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); tc = nt.nodes.new("ShaderNodeTexCoord")
    mul = nt.nodes.new("ShaderNodeVectorMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = (px, px * h / w, 1)
    fl = nt.nodes.new("ShaderNodeVectorMath"); fl.operation = "FLOOR"
    div = nt.nodes.new("ShaderNodeVectorMath"); div.operation = "DIVIDE"; div.inputs[1].default_value = (px, px, 1)
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.noise_dimensions = "4D"; nz.inputs["Scale"].default_value = 3.0
    nz.inputs["Detail"].default_value = 3.0
    fc = nz.inputs["W"].driver_add("default_value"); fc.driver.expression = f"frame*{speed}"
    vo = nt.nodes.new("ShaderNodeTexVoronoi"); vo.voronoi_dimensions = "4D"; vo.inputs["Scale"].default_value = 5.0
    fc2 = vo.inputs["W"].driver_add("default_value"); fc2.driver.expression = f"frame*{speed * 0.7}"
    ad = nt.nodes.new("ShaderNodeMath"); ad.operation = "ADD"
    rp = nt.nodes.new("ShaderNodeValToRGB"); rp.color_ramp.interpolation = "CONSTANT"
    els = rp.color_ramp.elements
    while len(els) < len(colors):
        els.new(0.5)
    for i, c in enumerate(colors):
        els[i].position = (0.0, 0.62, 0.78, 0.9)[i]
        els[i].color = (*srgb(c), 1)
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(tc.outputs["UV"], mul.inputs[0]); nt.links.new(mul.outputs[0], fl.inputs[0]); nt.links.new(fl.outputs[0], div.inputs[0])
    nt.links.new(div.outputs[0], nz.inputs["Vector"]); nt.links.new(div.outputs[0], vo.inputs["Vector"])
    nt.links.new(nz.outputs[0], ad.inputs[0]); nt.links.new(vo.outputs["Distance"], ad.inputs[1])
    nt.links.new(ad.outputs[0], rp.inputs[0]); nt.links.new(rp.outputs[0], em.inputs[0]); nt.links.new(em.outputs[0], out.inputs[0])
    return plane(name, w, h, loc, mat=m)


# ---------------------------------------------------------------- pixel textures (numpy)

def tex_tiles(name, px=64, tiles=4, a="#F2F2EE", b="#C8CCD0", grout="#8A9094", seed=0):
    rng = np.random.default_rng(seed); t = px // tiles
    img = np.zeros((px, px, 3)); ca, cb, cg = (np.array(srgb_u8(c)) for c in (a, b, grout))
    for j in range(tiles):
        for i in range(tiles):
            c = ca if (i + j) % 2 == 0 or a == b else cb
            img[j * t:(j + 1) * t, i * t:(i + 1) * t] = c * rng.uniform(0.95, 1.03)
    img[::t, :] = cg; img[:, ::t] = cg
    img += rng.normal(0, 3, img.shape)
    return image_from_array(name, np.clip(img, 0, 255).astype(np.uint8))


def tex_planks(name, px=64, base="#9C6A3C", seed=1):
    rng = np.random.default_rng(seed); c = np.array(srgb_u8(base), float)
    img = np.zeros((px, px, 3))
    for r in range(0, px, 8):
        img[r:r + 8] = c * rng.uniform(0.85, 1.1)
        img[r] = c * 0.6
    img *= (1 + 0.06 * np.sin(np.arange(px) * 0.9 + rng.uniform(0, 6)))[None, :, None]
    img += rng.normal(0, 4, img.shape)
    return image_from_array(name, np.clip(img, 0, 255).astype(np.uint8))


def tex_wallpaper(name, px=64, base="#A49CD0", motif="#8E86C0", seed=2):
    """Lavender damask-ish wallpaper (LPS ref 1 living room)."""
    y, x = np.mgrid[:px, :px]
    m = ((np.abs((x % 16) - 8) + np.abs((y % 24) - 12) * 0.7) < 5) | ((x % 16 == 0) & (y % 4 < 2))
    img = np.where(m[..., None], srgb_u8(motif), srgb_u8(base)).astype(float)
    img += np.random.default_rng(seed).normal(0, 3, img.shape)
    return image_from_array(name, np.clip(img, 0, 255).astype(np.uint8))


def tex_facade(name, px=64, wall="#B45A3C", win="#2A3A52", lit="#F0D27A", seed=3):
    rng = np.random.default_rng(seed)
    img = np.zeros((px, px, 3)) + srgb_u8(wall)
    img += rng.normal(0, 6, img.shape)
    for j in range(4):
        for i in range(4):
            c = srgb_u8(lit) if rng.random() < 0.2 else srgb_u8(win)
            img[j * 16 + 4:j * 16 + 13, i * 16 + 4:i * 16 + 12] = c
            img[j * 16 + 13, i * 16 + 3:i * 16 + 13] = (200, 200, 190)
    return image_from_array(name, np.clip(img, 0, 255).astype(np.uint8))


def tex_noise(name, px=64, base="#5A5C60", amp=10, seed=4):
    rng = np.random.default_rng(seed)
    img = np.zeros((px, px, 3)) + srgb_u8(base) + rng.normal(0, amp, (px, px, 1))
    return image_from_array(name, np.clip(img, 0, 255).astype(np.uint8))


def tex_sky(name, w=32, h=64, top="#3C7CE0", bot="#BFE0FF", seed=5):
    t = np.linspace(0, 1, h)[:, None, None]
    img = np.array(srgb_u8(top)) * (1 - t) + np.array(srgb_u8(bot)) * t + np.zeros((h, w, 3))
    rng = np.random.default_rng(seed)
    for _ in range(5):
        cx, cy = rng.integers(0, w), rng.integers(4, h // 2)
        img[cy:cy + 2, max(0, cx - 4):cx + 4] = 250
        img[cy - 1:cy, max(0, cx - 2):cx + 2] = 250
    return image_from_array(name, np.clip(img, 0, 255).astype(np.uint8))


def srgb_u8(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


# ---------------------------------------------------------------- characters

class Kaneda:
    """One appended copy of Kaneda_punk (armature + 3 meshes, own material + atlas)."""
    _faces = {}

    def __init__(self, name, loc=(0, 0, 0), yaw=0.0, recolor=None, mirror=False):
        before = set(bpy.data.objects)
        with bpy.data.libraries.load(KANEDA_BLEND, link=False) as (src, dst):
            dst.objects = [n for n in src.objects if n in ("Kaneda", "Head", "Mirrored", "NonMirrored")]
        for o in dst.objects:
            bpy.context.scene.collection.objects.link(o)
        new = [o for o in bpy.data.objects if o not in before]
        self.arm = next(o for o in new if o.type == "ARMATURE"); self.arm.name = name
        self.meshes = [o for o in new if o.type == "MESH"]
        self.arm.animation_data_clear()
        for pb in self.arm.pose.bones:
            pb.rotation_mode = "QUATERNION"
        self.arm.scale = (-KS if mirror else KS, KS, KS)
        self.arm.location = (loc[0], loc[1], loc[2] + KZ); self.arm.rotation_euler = (0, 0, yaw)
        # own material + atlas per copy
        m0 = next(s.material for o in self.meshes for s in o.material_slots if s.material and s.material.name.startswith("Kaneda"))
        self.mat = m0.copy(); self.mat.name = name + "_mat"
        for o in self.meshes:
            for s in o.material_slots:
                if s.material == m0:
                    s.material = self.mat
        nt = self.mat.node_tree
        self.tex = next(n for n in nt.nodes if n.type == "TEX_IMAGE"); self.tex.interpolation = "Closest"
        out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
        flat_shader(nt, self.tex.outputs[0], out)
        self.recolor = recolor
        self.face("neutral")

    @classmethod
    def face_image(cls, expr, recolor=None):
        key = (expr, recolor)
        if key not in cls._faces:
            im = bpy.data.images.load(os.path.join(FACES, f"Kaneda_{expr}.png"), check_existing=False)
            if recolor:
                w, h = im.size
                a = np.array(im.pixels[:], np.float32).reshape(h, w, 4)
                r, g, b = a[..., 0].copy(), a[..., 1].copy(), a[..., 2].copy()
                blue = (b > r + 0.15) & (b > g + 0.08)
                perm = {"red": (b, g * 0.6, r), "green": (r, b * 0.9, g * 0.7), "purple": (b * 0.8, r, b), "orange": (b, g * 1.1, r * 0.4)}[recolor]
                for c in range(3):
                    a[..., c] = np.where(blue, perm[c], a[..., c])
                im.pixels.foreach_set(a.ravel())
            im.name = f"K_{expr}_{recolor}"; im.pack()
            cls._faces[key] = im
        return cls._faces[key]

    def face(self, expr):
        self.tex.image = Kaneda.face_image(expr, self.recolor)

    def hide(self, h=True):
        for o in [self.arm] + self.meshes:
            o.hide_render = h; o.hide_viewport = h

    def aim(self, bone, direction):
        """Point a bone's Y axis along a direction given in the armature's local (model) space."""
        pb = self.arm.pose.bones[bone]
        bpy.context.view_layer.update()
        m = pb.matrix.copy()
        q = m.col[1].xyz.normalized().rotation_difference(Vector(direction).normalized())
        pb.matrix = Matrix.Translation(m.translation) @ (q.to_matrix() @ m.to_3x3()).to_4x4()
        bpy.context.view_layer.update()

    def rest(self):
        for pb in self.arm.pose.bones:
            pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)
        bpy.context.view_layer.update()

    def turn_head(self, yaw=0.0, pitch=0.0):
        """Head bone: local Y = up the neck (yaw), local Z = model +X (pitch, + = look down)."""
        from mathutils import Quaternion
        self.arm.pose.bones["Head"].rotation_quaternion = Quaternion((0, 1, 0), yaw) @ Quaternion((0, 0, 1), pitch)

    def head_world(self):
        """World position of the face centre (eyes level, front surface)."""
        bpy.context.view_layer.update()
        pb = self.arm.pose.bones["Head"]
        return self.arm.matrix_world @ (pb.matrix @ Vector((-0.42, 0.42, 0)))


def hombre(name, loc=(0, 0, 0), yaw=0.0, tex=None):
    """Append the from-scratch lps-hombre (old man) as an extra; returns its root object."""
    before = set(bpy.data.objects)
    with bpy.data.libraries.load(HOMBRE_BLEND, link=False) as (src, dst):
        dst.objects = list(src.objects)
    for o in dst.objects:
        if o.type in ("CAMERA", "LIGHT"):
            continue
        bpy.context.scene.collection.objects.link(o)
    new = [o for o in bpy.data.objects if o not in before and o.users_collection]
    roots = [o for o in new if o.parent is None and o.type not in ("CAMERA", "LIGHT")]
    root = bpy.data.objects.new(name, None); link(root)
    for r in roots:
        r.parent = root
    root.location = loc; root.rotation_euler = (0, 0, yaw)
    for o in new:
        o.animation_data_clear(); o.rotation_euler = (0, 0, 0)     # the .blend keys rest/pointing/walk: start at rest
        for s in getattr(o, "material_slots", []):
            m = s.material
            if m and m.use_nodes:
                if tex:                                            # own textures (second character): copy the material
                    m = s.material = m.copy()
                for n in m.node_tree.nodes:
                    if n.type == "TEX_IMAGE":
                        n.interpolation = "Closest"
                        key = "head" if "head" in s.material.name else "body"
                        if tex and key in tex:
                            n.image = bpy.data.images.load(tex[key], check_existing=True)
    root["parts"] = {o.name.split(".")[0]: o.name for o in new}
    return root


def hpart(root, n):
    return bpy.data.objects[root["parts"][n]]


# ---------------------------------------------------------------- camera

def camera(name="Cam", lens=35):
    c = bpy.data.objects.new(name, bpy.data.cameras.new(name)); link(c)
    c.data.lens = lens; c.data.sensor_fit = "VERTICAL"; c.data.sensor_height = 36
    c.data.clip_start = 0.02; c.data.clip_end = 400
    bpy.context.scene.camera = c
    return c


def ps1_snap(cam, grid_h=640):
    """PS1 vertex wobble (same as the zombie engine's shader): every vertex is projected and snapped to a 360x640
    screen grid, then put back at its depth. One shared GN group as the last modifier of every mesh;
    call ps1_snap_update(cam) each frame (the grid scale follows the lens)."""
    ng = bpy.data.node_groups.new("PS1Snap", "GeometryNodeTree")
    ng.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    ng.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    N, L = ng.nodes, ng.links
    gi, go = N.new("NodeGroupInput"), N.new("NodeGroupOutput")
    k = N.new("ShaderNodeValue"); k.name = "K"
    oi = N.new("GeometryNodeObjectInfo"); oi.transform_space = "RELATIVE"; oi.inputs["Object"].default_value = cam
    inv = N.new("FunctionNodeInvertMatrix"); L.new(oi.outputs["Transform"], inv.inputs[0])
    to_cam = N.new("FunctionNodeTransformPoint"); L.new(N.new("GeometryNodeInputPosition").outputs[0], to_cam.inputs["Vector"])
    L.new(inv.outputs[0], to_cam.inputs["Transform"])
    sep = N.new("ShaderNodeSeparateXYZ"); L.new(to_cam.outputs[0], sep.inputs[0])

    def math(op, a, b=None):
        m = N.new("ShaderNodeMath"); m.operation = op
        for s, v in ((m.inputs[0], a), (m.inputs[1], b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                s.default_value = v
            else:
                L.new(v, s)
        return m.outputs[0]
    d = math("MAXIMUM", math("MULTIPLY", sep.outputs["Z"], -1.0), 0.02)        # depth in front of the camera
    s = math("DIVIDE", k.outputs[0], d)                                          # world units -> grid cells
    xy = [math("DIVIDE", math("ROUND", math("MULTIPLY", sep.outputs[c], s)), s) for c in ("X", "Y")]
    comb = N.new("ShaderNodeCombineXYZ")
    L.new(xy[0], comb.inputs["X"]); L.new(xy[1], comb.inputs["Y"]); L.new(sep.outputs["Z"], comb.inputs["Z"])
    back = N.new("FunctionNodeTransformPoint"); L.new(comb.outputs[0], back.inputs["Vector"]); L.new(oi.outputs["Transform"], back.inputs["Transform"])
    sp = N.new("GeometryNodeSetPosition"); L.new(gi.outputs[0], sp.inputs["Geometry"]); L.new(back.outputs[0], sp.inputs["Position"])
    L.new(sp.outputs[0], go.inputs[0])
    ng["grid_h"] = grid_h
    for o in bpy.data.objects:
        if o.type == "MESH":
            o.modifiers.new("ps1", "NODES").node_group = ng
    ps1_snap_update(cam)


def ps1_snap_update(cam):
    ng = bpy.data.node_groups.get("PS1Snap")
    if ng:
        ng.nodes["K"].outputs[0].default_value = cam.data.lens * ng["grid_h"] / cam.data.sensor_height


def look(cam, pos, target, roll=0.0):
    cam.location = pos
    q = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y")
    from mathutils import Quaternion
    cam.rotation_euler = (q @ Quaternion((0, 0, 1), roll)).to_euler()


def lerp(a, b, t):
    return tuple(x + (y - x) * t for x, y in zip(a, b))


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * t)
