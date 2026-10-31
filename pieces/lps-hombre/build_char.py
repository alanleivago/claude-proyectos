"""lps-hombre: PS1 / LowPolyShorts-style man built from scratch in Blender (bpy).

Run order:
    .venv/bin/python pieces/lps-hombre/prep.py            # measures photo, head geometry, textures
    /Applications/Blender.app/Contents/MacOS/Blender -b -P pieces/lps-hombre/build_char.py -- [--render]
    .venv/bin/python pieces/lps-hombre/sheets.py          # turnaround / poses / compare sheets

Rigid low-poly pieces parented in a chain with pivots at the joints:
hips -> torso -> head / collar / upperarm -> forearm -> hand ; hips -> thigh -> calf -> shoe.
pose(name_dict, frame) keyframes joint rotations (degrees, XYZ, parent space). POSES has rest/pointing/walk.
"""
import bpy, bmesh, json, math, os, sys
from pathlib import Path
from mathutils import Vector, Euler, Matrix

ROOT = Path(os.path.abspath(__file__)).parent
OUT = ROOT / "out"
REN = OUT / "renders"
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []

GEO = json.loads((OUT / "head_geo.json").read_text())
BZ = json.loads((OUT / "body_zones.json").read_text())
K = 150.0             # body texels (of the 256 atlas) per metre -> uniform pixel density


# ------------------------------------------------------------------ scene
def setup_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            sc.render.engine = eng
            break
        except TypeError:
            pass
    sc.render.resolution_x, sc.render.resolution_y, sc.render.fps = 1080, 1920, 30
    sc.render.filter_size = 0.75
    sc.render.film_transparent = True
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    for attr, val in (("use_gtao", False), ("use_bloom", False), ("use_ssr", False), ("use_shadows", False),
                      ("use_raytracing", False), ("taa_render_samples", 16)):
        try:
            setattr(sc.eevee, attr, val)
        except Exception:
            pass
    w = bpy.data.worlds.new("World")
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.40, 0.41, 0.45, 1)      # ~#B0B0B8 in linear
    bg.inputs[1].default_value = 1.0
    sun = bpy.data.lights.new("Sun", "SUN")
    sun.energy = 1.5
    sun.color = (1.0, 0.97, 0.91)
    sun.use_shadow = False
    so = bpy.data.objects.new("Sun", sun)
    so.rotation_euler = Euler((math.radians(35), 0, math.radians(-30)))
    sc.collection.objects.link(so)
    cam = bpy.data.cameras.new("Cam")
    co = bpy.data.objects.new("Cam", cam)
    sc.collection.objects.link(co)
    sc.camera = co
    return sc


def make_mat(name, img_path):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    img = bpy.data.images.load(str(img_path))
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img; tex.interpolation = "Closest"
    dif = nt.nodes.new("ShaderNodeBsdfDiffuse"); dif.inputs["Roughness"].default_value = 1.0
    emi = nt.nodes.new("ShaderNodeEmission"); emi.inputs["Strength"].default_value = 1.0
    mix = nt.nodes.new("ShaderNodeMixShader"); mix.inputs[0].default_value = 0.5   # 50% emission: near-flat light
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(tex.outputs[0], dif.inputs["Color"])
    nt.links.new(tex.outputs[0], emi.inputs["Color"])
    nt.links.new(dif.outputs[0], mix.inputs[1])
    nt.links.new(emi.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    return m


# ------------------------------------------------------------------ geometry helpers
def ring_pts(rx, ry, ox, oy, z, sides):
    s = 1.0 / math.cos(math.pi / sides)          # polygon flats touch rx / ry
    pts = []
    for k in range(sides):
        a = -math.pi / 2 + math.pi / sides + 2 * math.pi * k / sides    # CCW from top, flat face toward -Y
        pts.append(Vector((ox + rx * s * math.cos(a), oy + ry * s * math.sin(a), z)))
    return pts


def loft(rings, sides=8, caps=(True, True)):
    """rings: (d, rx, ry[, ox, oy]) along local -Z from the pivot. Returns verts, faces, ring centres."""
    verts, faces, idx, centres = [], [], [], []
    for r in rings:
        d, rx, ry = r[:3]
        ox, oy = (r[3], r[4]) if len(r) > 3 else (0.0, 0.0)
        p = ring_pts(rx, ry, ox, oy, -d, sides)
        idx.append(list(range(len(verts), len(verts) + sides)))
        verts += p
        centres.append(Vector((ox, oy, -d)))
    refs = []
    for i in range(len(idx) - 1):
        a, b = idx[i], idx[i + 1]
        for j in range(sides):
            faces.append([a[j], b[j], b[(j + 1) % sides], a[(j + 1) % sides]])
            refs.append((centres[i] + centres[i + 1]) / 2)
    if caps[0]:
        faces.append(list(reversed(idx[0]))); refs.append(centres[1])
    if caps[1]:
        faces.append(list(idx[-1])); refs.append(centres[-2])
    # make every face point away from the axis
    for i, f in enumerate(faces):
        p = [verts[k] for k in f]
        n = (p[1] - p[0]).cross(p[2] - p[0])
        c = sum(p, Vector()) / len(p)
        if n.dot(c - refs[i]) < 0:
            faces[i] = list(reversed(f))
    return verts, faces


PIECES = {}     # name -> dict(obj, pivot_world)


def add_piece(name, parent, pivot, parts, rest_rot=(0, 0, 0), zone="jacket", mat=None, R=None):
    """parts: list of (verts, faces[, per-face zones]) in piece-local (pivot at origin, before rest rotation)."""
    if R is None:
        R = Euler([math.radians(a) for a in rest_rot]).to_matrix()
    verts, faces, fz = [], [], []
    for part in parts:
        v, f = part[0], part[1]
        off = len(verts)
        verts += [R @ p for p in v]
        faces += [[k + off for k in fc] for fc in f]
        fz += list(part[2]) if len(part) > 2 else [None] * len(f)
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(p) for p in verts], [], faces)
    me.validate()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    pivot = Vector(pivot)
    if parent:
        ob.parent = PIECES[parent]["obj"]
        ob.location = pivot - PIECES[parent]["pivot"]
    else:
        ob.location = pivot
    ob.rotation_mode = "XYZ"
    ob.data.materials.append(mat)
    PIECES[name] = dict(obj=ob, pivot=pivot, R=R)
    body_uv(ob, pivot, zone, fz)
    return ob


def body_uv(ob, pivot, zone, fz):
    me = ob.data
    uvl = me.uv_layers.new(name="UV")
    zones = BZ["zones"]
    tf = BZ["torso_front"]
    for poly in me.polygons:
        n = poly.normal
        pts = [Vector(me.vertices[i].co) + pivot for i in poly.vertices]       # world rest coords
        z = fz[poly.index] or zone
        if z == "torso":
            z = "torso_front" if n.y < -0.5 else ("inner" if len(poly.vertices) > 4 else "jacket")
        zx, zy, zw, zh = zones[z]
        if z == "torso_front":
            uvs = [((zx + tf["k"] * (p.x - tf["x0"])) / 256, 1 - (zy + tf["k"] * (tf["z1"] - p.z)) / 256) for p in pts]
        else:
            ax = max(range(3), key=lambda i: abs(n[i]))
            a, b = {0: (1, 2), 1: (0, 2), 2: (0, 1)}[ax]
            pa = [K * p[a] for p in pts]
            pb = [K * p[b] for p in pts]

            def shift(vals, size):
                lo, hi = min(vals), max(vals)
                s = math.floor(lo / size) * size
                if hi - s > size:
                    s = lo
                sc = min(1.0, (size - 0.5) / max(hi - lo, 1e-6))
                return [(v - s) * sc if sc < 1 else v - s for v in vals]
            pa, pb = shift(pa, zw), shift(pb, zh)
            uvs = [((zx + u) / 256, (256 - (zy + zh) + v) / 256) for u, v in zip(pa, pb)]
        for li, uv in zip(poly.loop_indices, uvs):
            uvl.data[li].uv = uv


# ------------------------------------------------------------------ head (geometry from prep.py)
HEAD_CHIN_Z = 1.49
HEAD_PIVOT = Vector((0.0, -0.005, 1.45))


def build_head(mat):
    V = [Vector(v) for v in GEO["verts"]]
    hy = HEAD_PIVOT.y - GEO["neck_y"]
    off = Vector((0.0, hy, HEAD_CHIN_Z))
    me = bpy.data.meshes.new("head")
    me.from_pydata([tuple(v + off - HEAD_PIVOT) for v in V], [], GEO["faces"])
    me.validate()
    ob = bpy.data.objects.new("head", me)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = PIECES["torso"]["obj"]
    ob.location = HEAD_PIVOT - PIECES["torso"]["pivot"]
    ob.rotation_mode = "XYZ"
    ob.data.materials.append(mat)
    PIECES["head"] = dict(obj=ob, pivot=HEAD_PIVOT)
    # UVs and the blended bake come from prep.py (front photo / profile behind the cheek / hair, feathered)
    uvl = me.uv_layers.new(name="UV")
    for poly, uvs in zip(me.polygons, GEO["uvs"]):
        for li, uv in zip(poly.loop_indices, uvs):
            uvl.data[li].uv = uv
    return ob


# ------------------------------------------------------------------ body
SH_X, SH_Z = 0.185, 1.395
UA_L, FA_L = 0.31, 0.26
HIP_X, HIP_Z = 0.092, 0.905
TH_L, CA_L = 0.415, 0.405
# jacket cross-sections (z, rx, ry, oy): octagon flats touch rx / ry
JACKET = [(1.497, 0.072, 0.068, 0.012), (1.458, 0.165, 0.104, 0.006), (1.415, 0.226, 0.116, 0.0), (1.32, 0.207, 0.13, -0.006),
          (1.16, 0.186, 0.126, -0.006), (1.02, 0.172, 0.118, 0.0), (0.93, 0.178, 0.12, 0.0), (0.88, 0.186, 0.123, 0.0),
          (0.785, 0.193, 0.127, 0.0)]


def section(z):
    for (z0, *a), (z1, *b) in zip(JACKET[:-1], JACKET[1:]):
        if z1 <= z <= z0:
            t = (z0 - z) / (z0 - z1)
            return [p + (q - p) * t for p, q in zip(a, b)]
    return list(JACKET[-1][1:]) if z < JACKET[-1][0] else list(JACKET[0][1:])


def jacket_path(z, x_in, t, to_back):
    """Path along the jacket section (+X side) from the opening edge x_in round to the side (or the back)."""
    rx, ry, oy = section(z)
    rx, ry = rx + t, ry + t
    V0, V1, V2, V3 = (0.414 * rx, oy - ry), (rx, oy - 0.414 * ry), (rx, oy + 0.414 * ry), (0.414 * rx, oy + ry)
    if x_in < V0[0] - 0.006:
        pts = [(x_in, oy - ry), V0, V1]
    else:
        s = min(0.9, (x_in - V0[0]) / (V1[0] - V0[0]))
        P = (V0[0] + (V1[0] - V0[0]) * s, V0[1] + (V1[1] - V0[1]) * s)
        pts = [P, ((P[0] + V1[0]) / 2, (P[1] + V1[1]) / 2), V1]
    pts += [V2, V3, (-0.03, oy + ry)] if to_back else [(rx, oy)]
    return [Vector((x, y, z)) for x, y in pts]


def jacket_shell(rows, sx, to_back, lapel_rows=0, t_out=0.018, t_in=0.006):
    """Thick open-jacket panel: rows = [(z, x_in)], top to bottom. Returns verts, faces, zones (world coords)."""
    verts, faces, zones = [], [], []
    O, I = [], []
    for z, x_in in rows:
        for lst, t in ((O, t_out), (I, t_in)):
            ids = []
            for p in jacket_path(z, x_in, t, to_back):
                verts.append(Vector((p.x * sx, p.y, p.z))); ids.append(len(verts) - 1)
            lst.append(ids)
    nr, nc = len(rows), len(O[0])
    for i in range(nr - 1):
        for j in range(nc - 1):
            faces.append([O[i][j], O[i + 1][j], O[i + 1][j + 1], O[i][j + 1]])
            zones.append("inner" if (j == 0 and i < lapel_rows) else "jacket")
            faces.append([I[i][j], I[i][j + 1], I[i + 1][j + 1], I[i + 1][j]]); zones.append("inner")
        faces.append([O[i][0], I[i][0], I[i + 1][0], O[i + 1][0]]); zones.append("inner")          # front edge thickness
        faces.append([O[i][-1], O[i + 1][-1], I[i + 1][-1], I[i][-1]]); zones.append("inner")
    for j in range(nc - 1):
        faces.append([O[-1][j], O[-1][j + 1], I[-1][j + 1], I[-1][j]]); zones.append("inner")     # hem thickness
        faces.append([O[0][j], I[0][j], I[0][j + 1], O[0][j + 1]]); zones.append("inner")
    # outer faces away from the body axis, inner faces toward it (edges: either way, shaded two-sided)
    for k, f in enumerate(faces):
        p = [verts[q] for q in f]
        n = (p[1] - p[0]).cross(p[2] - p[0])
        c = sum(p, Vector()) / len(p)
        axis = Vector((0, section(c.z)[2], c.z))
        if (n.dot(c - axis) < 0) == (all(q in sum(O, []) for q in f)):
            faces[k] = list(reversed(f))
    return verts, faces, zones


def build_body(mat):
    add_piece("hips", None, (0, 0, 0.95), [loft([(-0.05, 0.152, 0.104), (0.09, 0.168, 0.112), (0.17, 0.13, 0.09), (0.21, 0.06, 0.06)])],
              zone="trousers", mat=mat)
    tp = 1.0
    core = [(z, rx, ry, 0.0, oy) for z, rx, ry, oy in JACKET[:7]]
    core[-1] = (0.93, 0.158, 0.108, 0.0, 0.0)
    add_piece("torso", "hips", (0, 0, tp), [loft([(tp - z, rx, ry, ox, oy) for z, rx, ry, ox, oy in core])], zone="torso", mat=mat)
    add_piece("collar", "torso", (0, -0.006, 1.47), [loft([(-0.05, 0.060, 0.062), (-0.035, 0.066, 0.067), (0.01, 0.078, 0.075)],
                                                           caps=(False, False))], zone="shirt", mat=mat)
    for side, sx in (("L", 1), ("R", -1)):
        # open jacket: upper front panel (lapel) rigid with the torso, lower skirt follows the thigh
        up = jacket_shell([(1.462, 0.060), (1.40, 0.085), (1.335, 0.118), (1.29, 0.088), (1.16, 0.080), (1.02, 0.082)], sx, False, lapel_rows=3)
        add_piece(f"lapel_{side}", "torso", (0, 0, tp), [([v - Vector((0, 0, tp)) for v in up[0]], up[1], up[2])],
                  zone="jacket", mat=mat)
        sk_piv = Vector((sx * 0.092, 0.0, 0.985))
        sk = jacket_shell([(1.035, 0.082), (0.93, 0.090), (0.86, 0.100), (0.785, 0.118)], sx, True)
        add_piece(f"skirt_{side}", "torso", sk_piv, [([v - sk_piv for v in sk[0]], sk[1], sk[2])], zone="jacket", mat=mat)

        ab = -9 * sx                      # arms hang slightly away from the body
        sh = Vector((sx * SH_X, 0.0, SH_Z))
        ua_rot = (0, ab, 0)
        add_piece(f"upperarm_{side}", "torso", sh, [loft([(-0.045, 0.028, 0.03), (-0.015, 0.052, 0.056), (0.04, 0.058, 0.058),
                                                          (0.17, 0.05, 0.052), (0.29, 0.046, 0.047), (0.335, 0.03, 0.03)])],
                  rest_rot=ua_rot, zone="jacket", mat=mat)
        el = sh + Euler([math.radians(a) for a in ua_rot]).to_matrix() @ Vector((0, 0, -UA_L))
        fa_rot = (-12, ab, 0)
        Rfa = Euler([math.radians(a) for a in fa_rot]).to_matrix()
        add_piece(f"forearm_{side}", f"upperarm_{side}", el, [loft([(-0.04, 0.03, 0.03), (-0.01, 0.046, 0.047), (0.12, 0.044, 0.045),
                                                                     (0.235, 0.04, 0.041), (0.262, 0.036, 0.037)])],
                  rest_rot=fa_rot, zone="jacket", mat=mat)
        wr = el + Rfa @ Vector((0, 0, -FA_L))
        # PS1 hand: palm block + thumb (one piece), mitten of 3 fingers + separate index (both curl at the knuckles)
        c = -sx                                   # palm faces the body
        palm = loft([(-0.012, 0.012, 0.026), (0.0, 0.016, 0.037), (0.05, 0.018, 0.043), (0.095, 0.015, 0.042)], sides=4)
        tv, tfc = loft([(0.0, 0.011, 0.012), (0.035, 0.010, 0.010), (0.058, 0.007, 0.007)], sides=4)
        tm = Matrix.Translation((c * 0.008, -0.036, -0.028)) @ (Euler((math.radians(-35), math.radians(22 * sx), 0)).to_matrix().to_4x4())
        add_piece(f"hand_{side}", f"forearm_{side}", wr, [palm, ([tm @ p for p in tv], tfc)], rest_rot=fa_rot, zone="skin", mat=mat)
        for fname, yoff, rings, curl in (
                ("fingers", 0.011, [(-0.008, 0.012, 0.027), (0.0, 0.013, 0.029), (0.05, 0.011, 0.027), (0.082, 0.008, 0.021)], 25),
                ("index", -0.030, [(-0.008, 0.011, 0.009), (0.0, 0.0115, 0.0095), (0.045, 0.010, 0.0085), (0.076, 0.008, 0.007)], 18)):
            kn = wr + Rfa @ Vector((0, yoff, -0.095))
            Rf = Rfa @ Euler((0, math.radians(curl * sx), 0)).to_matrix()
            add_piece(f"{fname}_{side}", f"hand_{side}", kn, [loft(rings, sides=4)], R=Rf, zone="skin", mat=mat)

        hp = Vector((sx * HIP_X, 0.0, HIP_Z))
        lr = (0, -1.5 * sx, 0)
        add_piece(f"thigh_{side}", "hips", hp, [loft([(-0.07, 0.05, 0.05), (-0.02, 0.072, 0.08), (0.06, 0.08, 0.088),
                                                      (0.22, 0.078, 0.08), (0.38, 0.064, 0.066), (0.43, 0.048, 0.048)])],
                  rest_rot=lr, zone="trousers", mat=mat)
        kn = hp + Euler([math.radians(a) for a in lr]).to_matrix() @ Vector((0, 0, -TH_L))
        add_piece(f"calf_{side}", f"thigh_{side}", kn, [loft([(-0.045, 0.044, 0.044), (0.0, 0.062, 0.064), (0.14, 0.062, 0.066),
                                                              (0.30, 0.055, 0.057), (0.395, 0.058, 0.06)])],
                  rest_rot=lr, zone="trousers", mat=mat)
        an = kn + Euler([math.radians(a) for a in lr]).to_matrix() @ Vector((0, 0, -CA_L))
        piv_z = an.z
        srings = []
        for d, rx, hc in ((-0.068, 0.038, 0.05), (-0.045, 0.047, 0.06), (0.02, 0.05, 0.062), (0.10, 0.052, 0.04),
                          (0.17, 0.048, 0.03), (0.198, 0.034, 0.02)):
            srings.append((d, rx, hc, 0.0, piv_z - hc))
        sv, sf = loft(srings)
        add_piece(f"shoe_{side}", f"calf_{side}", an, [(sv, sf)], rest_rot=(-90, 0, 6 * sx), zone="shoes", mat=mat)


JOINTS = ["hips", "torso", "head", "upperarm_L", "forearm_L", "hand_L", "fingers_L", "index_L",
          "upperarm_R", "forearm_R", "hand_R", "fingers_R", "index_R",
          "thigh_L", "calf_L", "shoe_L", "thigh_R", "calf_R", "shoe_R", "skirt_L", "skirt_R"]

POSES = {
    "rest": {},
    "pointing": {"torso": (0, 0, -6), "head": (-2, 0, -14),
                 "upperarm_R": (-84, 0, -14), "forearm_R": (10, 0, 0), "hand_R": (0, 0, 90),
                 "index_R": (0, 18, 0), "fingers_R": (0, -75, 0),       # index straight, other fingers closed
                 "upperarm_L": (4, 0, 0), "forearm_L": (-6, 0, 0)},
    "walk": {"root_z": -0.05, "torso": (4, 0, 5), "head": (-4, 0, -4),
             "thigh_L": (-24, 0, 0), "calf_L": (8, 0, 0), "shoe_L": (0, 0, 0),
             "thigh_R": (18, 0, 0), "calf_R": (35, 0, 0), "shoe_R": (-25, 0, 0),
             "upperarm_L": (20, 0, 0), "forearm_L": (-8, 0, 0),
             "upperarm_R": (-24, 0, 0), "forearm_R": (-28, 0, 0)},
}
SKIRT_FOLLOW = 0.75     # jacket skirts swing with the thighs so the leg never cuts through the hem


def pose(name_dict, frame):
    """Keyframe a pose: {joint: (rx, ry, rz) degrees in parent space}; unlisted joints go back to rest.
    'root_z' moves the hips (metres). Jacket skirts follow the thighs unless given explicitly."""
    for j in JOINTS:
        ob = PIECES[j]["obj"]
        rot = name_dict.get(j)
        if rot is None and j.startswith("skirt_"):
            th = name_dict.get("thigh_" + j[-1], (0, 0, 0))
            tor = name_dict.get("torso", (0, 0, 0))
            rot = (SKIRT_FOLLOW * th[0] - tor[0], 0, 0)
        ob.rotation_euler = [math.radians(a) for a in (rot or (0, 0, 0))]
        ob.keyframe_insert("rotation_euler", frame=frame)
    hips = PIECES["hips"]["obj"]
    hips.location = PIECES["hips"]["pivot"] + Vector((0, 0, name_dict.get("root_z", 0.0)))
    hips.keyframe_insert("location", frame=frame)


# ------------------------------------------------------------------ rendering
def shoot(sc, pos, target, lens, path):
    cam = sc.camera
    cam.data.lens = lens
    cam.location = Vector(pos)
    cam.rotation_euler = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


def orbit(az_deg, dist, h, tz):
    a = math.radians(az_deg)          # 0 = front (-Y), 90 = his left side (+X)
    return (dist * math.sin(a), -dist * math.cos(a), h), (0, 0, tz)


def main():
    sc = setup_scene()
    mb = make_mat("body", OUT / "body_256.png")
    mh = make_mat("head", OUT / "head_128.png")
    build_body(mb)
    build_head(mh)
    for i, name in enumerate(POSES):
        pose(POSES[name], i + 1)
    sc.frame_start, sc.frame_end = 1, len(POSES)
    counts = {n: len(p["obj"].data.polygons) for n, p in PIECES.items()}
    print("FACES", counts, "TOTAL", sum(counts.values()),
          "TRIS", sum(sum(len(pl.vertices) - 2 for pl in p["obj"].data.polygons) for p in PIECES.values()))
    sc.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "lps_hombre.blend"))
    if "--render" in ARGS:
        REN.mkdir(exist_ok=True)
        sc.frame_set(1)
        for nm, az in (("turn_front", 0), ("turn_34", 45), ("turn_side", 90), ("turn_back", 180)):
            p, t = orbit(az, 3.3, 1.0, 0.87)
            shoot(sc, p, t, 50, REN / f"{nm}.png")
        for nm, az in (("head_front", 0), ("head_34", 40), ("head_side", 90), ("head_back", 180)):
            p, t = orbit(az, 0.95, 1.62, 1.6)
            shoot(sc, p, t, 50, REN / f"{nm}.png")
        for i, nm in enumerate(POSES):
            sc.frame_set(i + 1)
            p, t = orbit({"rest": 35, "pointing": -62, "walk": 60}[nm], 3.4, 1.05, 0.87)
            shoot(sc, p, t, 50, REN / f"pose_{nm}.png")
        for fr, piece, off, nm in ((2, "index_R", (-0.25, -0.30, 0.12), "hand_point"), (1, "hand_L", (0.32, -0.28, 0.05), "hand_rest")):
            sc.frame_set(fr)
            bpy.context.view_layer.update()
            hpos = PIECES[piece]["obj"].matrix_world.translation
            shoot(sc, hpos + Vector(off), hpos, 50, REN / f"{nm}.png")
        sc.frame_set(3)
        shoot(sc, (0.55, 1.75, 1.85), (0, 0, 0.95), 35, REN / "cmp_walk.png")
        sc.frame_set(1)
        shoot(sc, (0.0, -0.62, 1.57), (0, 0, 1.585), 50, REN / "cmp_face.png")


main()
