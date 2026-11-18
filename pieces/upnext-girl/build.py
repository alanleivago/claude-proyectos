"""upnext-girl: MML2-style girl (recreation of MercurialForge's "Ashley", video DqntXa7dOO8), 100 % by script.

Run inside Blender (live MCP or GUI):  exec(open(r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/build.py").read())
(system python first: python pieces/upnext-girl/face_atlas.py -> tex/face_eyes.png, tex/face_mouth.png from his cells)

Method (as in the video): cubes/rings shaped into a person (~500 tris), one 256x256 body texture made of
colour blocks, lit from the front and above: every face that does not look forward gets the dark tone.
Face painted in a separate expression atlas (here our engine layout: face_eyes/face_mouth, 16 cells of 64 px).
Skeleton = the Zero-fem 23-bone rig (same names, rest directions and rolls) so all zero_anim actions retarget;
only the arm chain is translated to her narrower, higher shoulders.

Axes like zero_fem: faces -Y, Z up, +X = her left, sole z=-9, top of hair z=4.24.
Writes out/girl.blend, tex/body.png, out/uv_layout.json.
"""
import bpy, bmesh, math, os, json
import numpy as np
from mathutils import Vector

ROOT = r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl"
ZERO_BLEND = r"/Users/alanleiva/claude-proyectos/pieces/zero-fem/anim/zero_anim.blend"
TEX = os.path.join(ROOT, "tex")
TS = 256                     # body texture size
DENS = 13.0                  # texture pixels per unit
ARM_SHIFT = Vector((-0.29, 0.0, 0.22))
# his face cell measured on his frames (iris 2.0-2.2 px/texel at 12:39 / 12:24): 0.034 u per texel
FACE_K = 0.834               # front quad half width = 51 texels / 2 (0.0327 u per texel)
FZ0, FZ1 = 1.45, 3.25        # face cell bottom/top in z (55 texels)
FACE_SPLIT_Z = 2.09          # row 34: eyes above (face_eyes), mouth below (face_mouth)
HEAD_W = 1.04                # head ring half width; chamfer k = FACE_K / HEAD_W   # Zero shoulder (1.34,0,.33) -> hers (1.05,0,.55)

# ---------------------------------------------------------------- palette (sampled from the video, t=12:39)
def H(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
P = dict(
    skin=H("#fad1a0"), skin_u=H("#f6ae81"), skin_b=H("#f8b07f"), skin_dd=H("#d6875f"), heart=H("#f08a8a"),
    hair=H("#f7b865"), hair_band=H("#e3895e"), hair_ear=H("#e8956a"),
    top=H("#d36927"), top_d=H("#aa3f0b"), top_b=H("#a8400f"),
    skirt=H("#3c531a"), skirt_s=H("#324412"), skirt_p=H("#273714"),
    belt_g=H("#2e3516"), belt_y=H("#a9a17a"),
    boot=H("#51323e"), boot_s=H("#412736"), boot_b=H("#3c2836"), boot_l=H("#8f4e5a"), boot_f=H("#5e3a4c"),
    shawl=H("#533926"), shawl_l=H("#634936"), shawl_b=H("#4a3222"), str_y=H("#a9a17a"), str_g=H("#2e3516"),
    scarf=H("#d36927"), scarf_d=H("#b04e18"),
    inner=H("#2a2a1a"),
)


# ---------------------------------------------------------------- geometry helpers
def ring2d(w, d, n, k):
    if n == 8:
        return [(w * k, -d), (w, -d * k), (w, d * k), (w * k, d), (-w * k, d), (-w, d * k), (-w, -d * k), (-w * k, -d)]
    if n == 6:
        return [(w * k, -d), (w, 0), (w * k, d), (-w * k, d), (-w, 0), (-w * k, -d)]
    return [(w, -d), (w, d), (-w, d), (-w, -d)]


class Builder:
    def __init__(self):
        self.bm = bmesh.new()
        self.part = self.bm.faces.layers.int.new("part")
        self.names = []
        self.vgroup = {}      # vert index -> {bone: w}

    def pid(self, name):
        if name not in self.names: self.names.append(name)
        return self.names.index(name)

    def loft(self, part, rings, axis="z", n=8, k=0.6, cap0=False, cap1=False, skip=()):
        """rings: (pos, cx, cy, w, d); axis z: ring in XY at z=pos (w along X, d along Y);
        axis x: ring in YZ at x=pos (w along Z, d along Y, cx=y centre? no: cx=z centre, cy=y centre)."""
        bm = self.bm; vs = []
        for pos, ca, cb, w, d in rings:
            row = []
            for a, b in ring2d(w, d, n, k):
                co = (ca + a, cb + b, pos) if axis == "z" else (pos, cb + b, ca + a)
                row.append(bm.verts.new(co))
            vs.append(row)
        pi = self.pid(part); faces = []
        for i in range(len(vs) - 1):
            for j in range(n):
                if (i, j) in skip: continue
                f = bm.faces.new((vs[i][j], vs[i][(j + 1) % n], vs[i + 1][(j + 1) % n], vs[i + 1][j]))
                f[self.part] = pi; faces.append(f)
        for flag, row in ((cap0, vs[0]), (cap1, vs[-1])):
            if flag:
                f = bm.faces.new(row); f[self.part] = pi; faces.append(f)
        return vs, faces

    def slab(self, part, quad, t):
        """thin box from a 4-point quad (front side) extruded by vector t"""
        bm = self.bm; a = [bm.verts.new(p) for p in quad]; b = [bm.verts.new(Vector(p) + Vector(t)) for p in quad]
        pi = self.pid(part)
        for f in ([a[0], a[1], a[2], a[3]], [b[3], b[2], b[1], b[0]], [a[0], b[0], b[1], a[1]], [a[1], b[1], b[2], a[2]],
                  [a[2], b[2], b[3], a[3]], [a[3], b[3], b[0], a[0]]):
            bm.faces.new(f)[self.part] = pi
        return a + b


def build_mesh():
    B = Builder()
    # head, nose, ears and hair: hand-placed vertices traced from his frames (hand_mesh.py)
    exec(open(ROOT + "/hand_mesh.py").read(), globals())
    hand_pieces(B, FACE_K, FZ0, FZ1, FACE_SPLIT_Z)
    # torso (orange top): waist / bust / shoulders, closed at the top under the turtleneck
    B.loft("top", [(-1.05, 0, 0.02, 0.84, 0.58), (0.25, 0, -0.10, 1.06, 0.76), (0.86, 0, 0.0, 1.10, 0.58)],
           n=8, k=0.6, cap0=True, cap1=True)
    # skirt (his: waist ring, one loop, hem; 3 dark pleats on each face)
    B.loft("skirt", [(-0.92, 0, 0.02, 1.00, 0.68), (-1.95, 0, 0.05, 1.34, 1.00), (-3.28, 0, 0.08, 1.64, 1.22)], n=8, k=0.62)
    # orange turtleneck (his Neck)
    B.loft("scarf", [(0.78, 0, -0.04, 0.62, 0.56), (1.52, 0, 0.0, 0.44, 0.42)], n=6, k=0.55)
    # brown shawl (his Sleeves): collar cone over the shoulders + back flap + the two knotted ends on the chest
    B.loft("shawl", [(1.02, 0, 0.0, 0.70, 0.64), (0.44, 0, 0.02, 1.32, 0.88)], n=8, k=0.6)
    piece(B, "shawl", [(-0.98, 0.84, 0.50), (0.98, 0.84, 0.50), (0.88, 0.70, -0.86), (-0.88, 0.70, -0.86)], [(0, 1, 2, 3)])
    piece(B, "shawl", [(-0.10, -0.92, 0.60), (0.32, -0.94, 0.60), (0.80, -0.86, -0.36), (0.40, -0.84, -0.44)], [(0, 1, 2, 3)])
    piece(B, "shawl", [(0.20, -0.96, 0.40), (-0.18, -0.98, 0.40), (-0.62, -0.88, -0.30), (-0.30, -0.86, -0.36)], [(0, 1, 2, 3)])
    for s in (1, -1):
        X = lambda x: x * s
        side = "L" if s > 0 else "R"
        # thigh/shin box (his LegsUpper), 4 sides, knee ring
        B.loft("leg" + side, [(-2.30, X(0.62), 0.00, 0.60, 0.58), (-4.30, X(0.76), -0.02, 0.48, 0.48),
                              (-5.70, X(0.80), 0.04, 0.42, 0.44)], n=4)
        # boot shaft (his LegsLower): straight from the front (12:10), the leather hangs out at the back (12:16)
        B.loft("boot" + side, [(-5.50, X(0.82), 0.04, 0.54, 0.56), (-6.70, X(0.82), 0.22, 0.56, 0.80),
                               (-7.90, X(0.82), 0.20, 0.52, 0.72)], n=6, k=0.6)
        # foot: heel block (back), ball, toe
        bm = B.bm; rows = []
        for y, hw, zt in ((0.85, 0.40, -7.85), (-0.55, 0.44, -8.25), (-1.35, 0.32, -8.72)):
            rows.append([bm.verts.new((X(0.82) + a, y, z)) for a, z in ((hw, zt), (hw, -9.0), (-hw, -9.0), (-hw, zt))])
        pi = B.pid("foot" + side)
        for i in range(len(rows) - 1):
            for j in range(4):
                bm.faces.new((rows[i][j], rows[i][(j + 1) % 4], rows[i + 1][(j + 1) % 4], rows[i + 1][j]))[B.part] = pi
        bm.faces.new(rows[0])[B.part] = pi; bm.faces.new(rows[-1][::-1])[B.part] = pi
        # arm (T pose along X; rest pose arms-down is a rotation of the rig): upper arm, forearm, flat hand box
        B.loft("arm" + side, [(X(0.90), 0.60, 0.00, 0.34, 0.34), (X(2.50), 0.52, 0.02, 0.27, 0.28),
                              (X(4.20), 0.53, -0.02, 0.20, 0.22)], axis="x", n=4)
        B.loft("hand" + side, [(X(4.12), 0.52, -0.02, 0.26, 0.16), (X(5.05), 0.50, -0.04, 0.30, 0.16)],
               axis="x", n=4, cap0=True, cap1=True)
    bm = B.bm
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    # open shells (hair, skirt...) can come out inside-out: point every face away from its part's centre
    cen = {}
    for f in bm.faces:
        cen.setdefault(f[B.part], []).append(f.calc_center_median())
    cen = {k: sum(v, Vector()) / len(v) for k, v in cen.items()}
    for f in bm.faces:
        name = B.names[f[B.part]]
        c0 = cen[f[B.part]] if name != "hair" else Vector((0, 0.1, 2.9))
        if f.normal.dot(f.calc_center_median() - c0) < 0: f.normal_flip()
    return B


# ---------------------------------------------------------------- UV islands (per part x direction class)
def cls_of(n):
    if n.z > 0.72: return "T"
    if n.z < -0.72: return "U"
    if n.y < -0.28: return "F"
    if n.y > 0.28: return "B"
    return "S"


def proj(c, co, side_sign=1):
    if c in "FB": return co.x, co.z
    if c == "S": return co.y, co.z
    return co.x, co.y


def is_face(part, f):
    if part == "nose": return True
    if part != "head" or f.normal.y > -0.8: return False
    if f.calc_center_median().z > FZ1 + 0.01: return False
    return all(abs(v.co.x) <= FACE_K + 0.01 for v in f.verts)


def make_uvs(B, me):
    bm = B.bm; uvl = bm.loops.layers.uv.new("UVMap")
    groups = {}
    for f in bm.faces:
        part = B.names[f[B.part]]
        if is_face(part, f):
            groups.setdefault(("face", "F"), []).append(f); continue
        c = cls_of(f.normal)
        if c == "S" and part.startswith(("arm", "hand")) and abs(f.normal.x) > 0.7: c = "S"
        groups.setdefault((part, c), []).append(f)
    # face: planar front projection into cell 0 of the 16-cell strip (his 51x55 cell, square texels)
    for f in groups.pop(("face", "F")):
        for l in f.loops:
            u = (l.vert.co.x + FACE_K) / (2 * FACE_K); v = (l.vert.co.z - FZ0) / (FZ1 - FZ0)
            l[uvl].uv = (min(max(u, 0.0), 1.0) / 16.0, min(max(v, 0.0), 1.0))
    # body islands, shelf-packed
    isl = []
    for (part, c), fs in groups.items():
        pts = [proj(c, v.co) for f in fs for v in f.verts]
        a0, a1 = min(p[0] for p in pts), max(p[0] for p in pts); b0, b1 = min(p[1] for p in pts), max(p[1] for p in pts)
        w = max(2, int(math.ceil((a1 - a0) * DENS))); h = max(2, int(math.ceil((b1 - b0) * DENS)))
        isl.append(dict(part=part, cls=c, a0=a0, a1=a1, b0=b0, b1=b1, w=w, h=h, faces=fs))
    isl.sort(key=lambda d: -d["h"])
    x = y = 1; shelf = 0
    for d in isl:
        if x + d["w"] + 1 > TS: x = 1; y += shelf + 2; shelf = 0
        d["x"], d["y"] = x, y; x += d["w"] + 2; shelf = max(shelf, d["h"])
    assert y + shelf < TS, f"texture overflow: {y + shelf}"
    for d in isl:
        for f in d["faces"]:
            for l in f.loops:
                a, b = proj(d["cls"], l.vert.co)
                ua = d["x"] + (a - d["a0"]) / max(1e-6, d["a1"] - d["a0"]) * d["w"]
                if d["cls"] == "B": ua = d["x"] + (d["a1"] - a) / max(1e-6, d["a1"] - d["a0"]) * d["w"]
                vb = d["y"] + (d["b1"] - b) / max(1e-6, d["b1"] - d["b0"]) * d["h"]     # row from the top
                l[uvl].uv = (ua / TS, 1 - vb / TS)
        del d["faces"]
    return isl


# ---------------------------------------------------------------- painting by world position (numpy)
def stripes(a, period, width, off=0.0):
    return ((a - off) % period) < width


def paint_island(d):
    """his blocks: front (F) and top (T) faces light, back/bottom faces dark, sides as sampled at 12:16-12:17"""
    part, c = d["part"], d["cls"]
    w, h = d["w"] + 2, d["h"] + 2                     # 1 px bleed around
    ua = (np.arange(w) - 1 + 0.5) / d["w"]; vb = (np.arange(h) - 1 + 0.5) / d["h"]
    A = d["a0"] + ua * (d["a1"] - d["a0"])
    if c == "B": A = d["a1"] - ua * (d["a1"] - d["a0"])
    Bv = d["b1"] - vb * (d["b1"] - d["b0"])
    a, b = np.meshgrid(A, Bv)                         # a: x (or y for S), b: z (or y for T/U)
    lit, back = c in "FT", c in "BU"
    out = np.zeros((h, w, 3))
    def fill(col): out[:] = col
    def put(mask, col): out[mask] = col
    base = part.rstrip("LR") if part not in ("head", "hair", "top", "skirt", "scarf", "shawl", "ear", "nose") else part
    side = part[-1] if base != part else ""
    if base == "ear":                                # his ear: skin with the orange swirl line
        fill(P["skin"])
        ey, ez = a - 0.20, b - 2.55
        rr = (ey / 0.15) ** 2 + (ez / 0.28) ** 2
        put((rr < 1) & (rr > 0.5), P["skin_dd"])
    elif base in ("arm", "hand", "leg", "head"):
        fill(P["skin_b"] if back else P["skin"])
        if base == "leg" and c == "F":               # knee: shaded band with the little pink heart
            put((np.abs(b + 4.3) < 0.18), P["skin_b"])
            kx = a - (0.79 if side == "L" else -0.79); kz = b + 4.28
            heart = ((kx + 0.06) ** 2 + (kz - 0.04) ** 2 < 0.06 ** 2) | ((kx - 0.06) ** 2 + (kz - 0.04) ** 2 < 0.06 ** 2) | \
                    ((kz < 0.04) & (kz > -0.12) & (np.abs(kx) < (kz + 0.12) * 0.9))
            put(heart, P["heart"])
        if base == "hand" and c in "FT":             # knuckle lines of the fist
            put(stripes(a, 0.17, 0.05) & (np.abs(np.abs(a) - 4.85) < 0.3), P["skin_dd"])
        if base == "head":                           # around his face cell: his darker upper skin, light jaw + side cheeks
            if c == "F": put(b > 2.0, P["skin_u"])
            if c == "U": fill(P["skin_b"])
    elif base == "hair":
        fill(P["hair"])
        if c in "FBS": put(b < 2.05, P["hair_band"])  # lower tier, darker (his band)
        if c == "U": fill(P["hair_band"])
        if c == "S":                                 # ear peeking on the side of the bob
            ey, ez = a - 0.64, b - 2.52
            ring = (ey / 0.17) ** 2 + (ez / 0.30) ** 2
            put((ring < 1) & (ring > 0.45) & (ey > -0.08), P["hair_ear"])
    elif base == "top":
        fill(P["top_b"] if back else P["top"])
        if c == "F": put((b < -0.45) & (b > -0.85), P["top_d"])       # shadow band under the bust
        belt = b < -0.84
        put(belt, P["belt_g"]); put(belt & (np.abs(b + 0.93) < 0.04), P["belt_y"])
        if c == "U": fill(P["inner"])
    elif base == "skirt":
        fill(P["skirt_s"] if c == "S" else P["skirt"])
        put(stripes(a, 0.46, 0.13, 0.12) & (b < -1.95), P["skirt_p"])  # broad pleat bands, lower 2/3
        put(b < -3.18, P["skirt_p"])
    elif base == "scarf":
        fill(P["scarf_d"] if back else P["scarf"])
        if c == "F": put(b < 0.9, P["scarf_d"])
    elif base == "shawl":
        fill(P["shawl_b"] if c == "U" else P["shawl"])
        if c in "FB":                                # back flap: lighter lower band + 4 stripes at the belt line
            put((b < -0.25), P["shawl_l"])
            for k, z0 in enumerate((-0.62, -0.69, -0.76, -0.83)):
                put(np.abs(b - z0) < 0.03, P["str_y"] if k % 2 == 0 else P["str_g"])
        if c == "F":                                 # the hanging end: stripes at its tip
            put((b < 0.0) & (b > -0.06), P["str_y"]); put((b < -0.12) & (b > -0.18), P["str_y"])
    elif base in ("boot", "foot"):
        fill(P["boot_b"] if back else (P["boot_s"] if c == "S" else P["boot"]))
        if base == "boot":
            if c in "FS": put((b < -6.15) & (b > -6.55), P["boot_f"])     # the slouch fold
            if c == "F":                                                   # round button under the knee
                cx = 0.84 if side == "L" else -0.84
                put(((a - cx) ** 2 + (b + 5.62) ** 2) < 0.13 ** 2, P["boot_l"])
        if base == "foot":
            if c == "F": fill(P["boot"])
            if c == "S": put((b < -8.55) & (a > 0.25), P["boot_l"])       # heel block (back of the sole)
            if c == "B": put(b < -8.55, P["boot_l"])
            if c == "U": fill(P["boot_b"])
    return out


SHADED = ("leg", "skirt", "boot", "foot", "arm")
LIGHT = Vector((0.0, -0.78, 0.62)).normalized()      # front + above, symmetric so mirrored islands agree


def shade_factor(B):
    """his soft viewport shading (smooth normals, light from the front and above) baked as a per-texel factor on the
    front/side islands of legs, skirt, boots and arms: Gouraud-like gradients that survive our unlit engine"""
    bm = B.bm; bm.normal_update(); uvl = bm.loops.layers.uv.active
    fac = np.ones((TS, TS))
    for f in bm.faces:
        part = B.names[f[B.part]]
        if not part.startswith(SHADED) or cls_of(f.normal) not in "FS": continue
        P2 = [Vector((l[uvl].uv.x * TS, (1 - l[uvl].uv.y) * TS)) for l in f.loops]
        N = [l.vert.normal.copy() for l in f.loops]
        for k in range(1, len(P2) - 1):
            a, b, c = P2[0], P2[k], P2[k + 1]; na, nb, nc = N[0], N[k], N[k + 1]
            x0, x1 = int(max(0, min(a.x, b.x, c.x) - 1)), int(min(TS - 1, max(a.x, b.x, c.x) + 1))
            y0, y1 = int(max(0, min(a.y, b.y, c.y) - 1)), int(min(TS - 1, max(a.y, b.y, c.y) + 1))
            den = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y)
            if abs(den) < 1e-9: continue
            for py in range(y0, y1 + 1):
                for px in range(x0, x1 + 1):
                    qx, qy = px + 0.5, py + 0.5
                    w0 = ((b.y - c.y) * (qx - c.x) + (c.x - b.x) * (qy - c.y)) / den
                    w1 = ((c.y - a.y) * (qx - c.x) + (a.x - c.x) * (qy - c.y)) / den
                    w2 = 1 - w0 - w1
                    if min(w0, w1, w2) < -0.08: continue
                    n = (na * w0 + nb * w1 + nc * w2).normalized()
                    d = max(0.0, min(1.0, n.dot(LIGHT) / 0.78))
                    fac[py, px] = 1.0 - 0.24 * (1.0 - d)
    return fac


def paint_body(isl):
    img = np.zeros((TS, TS, 3)); img[:] = P["inner"]
    for d in isl:
        tile = paint_island(d)
        y0, x0 = d["y"] - 1, d["x"] - 1
        hh, ww = tile.shape[:2]
        img[max(0, y0):y0 + hh, max(0, x0):x0 + ww] = tile[max(0, -y0):, max(0, -x0):][:TS - max(0, y0), :TS - max(0, x0)]
    return img


def save_png(arr, name):
    h, w = arr.shape[:2]
    im = bpy.data.images.get(name) or bpy.data.images.new(name, w, h, alpha=True)
    if im.size[0] != w or im.size[1] != h: im.scale(w, h)
    rgba = np.ones((h, w, 4)); rgba[..., :3] = arr / 255.0
    im.pixels.foreach_set(rgba[::-1].ravel().astype(np.float32))
    im.filepath_raw = os.path.join(TEX, name); im.file_format = "PNG"; im.save()
    return im


def material(name, img_path, image=None):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); bs = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tx = nt.nodes.new("ShaderNodeTexImage"); tx.interpolation = "Closest"
    img = image or bpy.data.images.load(img_path, check_existing=True)
    if image is None: img.reload()
    tx.image = img
    bs.inputs["Roughness"].default_value = 1.0
    for nm in ("Specular IOR Level", "Specular"):
        if nm in bs.inputs: bs.inputs[nm].default_value = 0.0
    nt.links.new(tx.outputs["Color"], bs.inputs["Base Color"]); nt.links.new(bs.outputs[0], out.inputs[0])
    if name.startswith("face_"):            # expression picker for Blender renders (offset x = cell/16, 0 on export)
        tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
        nt.links.new(tc.outputs["UV"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], tx.inputs["Vector"])
    return m


# ---------------------------------------------------------------- rig: Zero's armature + actions, arm chain moved
def bring_rig():
    old = bpy.data.objects.get("Armature")
    if old: return old
    with bpy.data.libraries.load(ZERO_BLEND, link=False) as (src, dst):
        dst.objects = ["Armature"]
    arm = dst.objects[0]; bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    for o in bpy.context.selected_objects: o.select_set(False)
    arm.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    for s in ("L", "R"):
        sh = Vector((ARM_SHIFT.x * (1 if s == "L" else -1), ARM_SHIFT.y, ARM_SHIFT.z))
        for b in ("UpperArm", "Forearm", "Hand"):
            eb = arm.data.edit_bones[f"{b}.{s}"]; roll = eb.roll
            eb.head += sh; eb.tail += sh; eb.roll = roll
    bpy.ops.object.mode_set(mode="OBJECT")
    return arm


def bone_weights(co, part):
    """rigid MML-style weights; joint rings are split 50/50"""
    side = part[-1]
    if part in ("head", "hair", "ear", "nose"): return {"Head": 1}
    if part == "scarf": return {"Neck": 1} if co.z > 1.3 else {"Chest": 1}
    if part in ("top", "shawl"): return {"Chest": 1} if co.z > -0.6 else {"Chest": 0.5, "Pelvis": 0.5}
    if part == "skirt": return {"Pelvis": 1}
    if part.startswith("leg"):
        if co.z > -2.4: return {"Pelvis": 0.4, f"Thigh.{side}": 0.6}
        if abs(co.z + 4.3) < 0.05: return {f"Thigh.{side}": 0.5, f"Calf.{side}": 0.5}
        return {f"Thigh.{side}": 1} if co.z > -4.3 else {f"Calf.{side}": 1}
    if part.startswith("boot"): return {f"Calf.{side}": 1}
    if part.startswith("foot"): return {f"Foot.{side}": 1} if co.y < 0.2 or co.z < -8.3 else {f"Calf.{side}": 0.5, f"Foot.{side}": 0.5}
    if part.startswith("arm"):
        x = abs(co.x)
        if x < 1.0: return {"Chest": 0.4, f"UpperArm.{side}": 0.6}
        if abs(x - 2.5) < 0.05: return {f"UpperArm.{side}": 0.5, f"Forearm.{side}": 0.5}
        if x > 4.1: return {f"Forearm.{side}": 0.5, f"Hand.{side}": 0.5}
        return {f"UpperArm.{side}": 1} if x < 2.5 else {f"Forearm.{side}": 1}
    if part.startswith("hand"): return {f"Hand.{side}": 1}
    return {"Chest": 1}


def build():
    os.makedirs(TEX, exist_ok=True); os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    for n in ("Girl",):
        o = bpy.data.objects.get(n)
        if o: bpy.data.objects.remove(o)
    for n in ("Cube",):
        o = bpy.data.objects.get(n)
        if o: bpy.data.objects.remove(o)
    B = build_mesh()
    me = bpy.data.meshes.new("Girl")
    isl = make_uvs(B, me)
    # face material split (upper polys -> face_eyes, lower -> face_mouth), everything else -> Girl
    mat_idx = []
    for f in B.bm.faces:
        part = B.names[f[B.part]]
        if is_face(part, f):
            mat_idx.append(1 if f.calc_center_median().z >= FACE_SPLIT_Z else 2)
        else:
            mat_idx.append(0)
    parts = [B.names[f[B.part]] for f in B.bm.faces]
    vparts = {}
    for f in B.bm.faces:
        for v in f.verts: vparts[v.index] = B.names[f[B.part]]
    shade = shade_factor(B)
    B.bm.to_mesh(me); B.bm.free()
    for p, mi in zip(me.polygons, mat_idx): p.material_index = mi
    ob = bpy.data.objects.new("Girl", me); bpy.context.scene.collection.objects.link(ob)
    body_img = save_png(paint_body(isl) * shade[..., None], "body.png")
    me.materials.append(material("Girl", None, body_img))
    me.materials.append(material("face_eyes", os.path.join(TEX, "face_eyes.png")))
    me.materials.append(material("face_mouth", os.path.join(TEX, "face_mouth.png")))
    # rig
    arm = bring_rig()
    vg = {}
    for v in me.vertices:
        for bone, w in bone_weights(v.co, vparts[v.index]).items():
            g = vg.get(bone) or ob.vertex_groups.get(bone) or ob.vertex_groups.new(name=bone); vg[bone] = g
            g.add([v.index], w, "REPLACE")
    ob.parent = arm
    mod = ob.modifiers.new("Armature", "ARMATURE"); mod.object = arm
    tris = sum(len(p.vertices) - 2 for p in me.polygons)
    json.dump([{k: v for k, v in d.items()} for d in isl], open(os.path.join(ROOT, "out", "uv_layout.json"), "w"), indent=0)
    print("GIRL tris", tris, "verts", len(me.vertices), "parts", sorted(set(parts)))
    return ob, arm


if __name__ == "__main__" or True:
    GIRL, ARM = build()
