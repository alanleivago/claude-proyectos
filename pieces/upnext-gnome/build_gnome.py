"""Pip the gnome, from the MML1 Servbot (assets/servbot, git-ignored, never commit the rip).

    blender -b out/servbot_base.blend --python build_gnome.py      # -> out/gnome.blend + tex/gnome_body.png

Inside Blender (headless):
1. bones renamed (Body, Head, Face, Arm.L/R, Leg.L/R); the head's duplicated front faces (under the face plate) and the
   Lego stud are deleted; the face plate is rebuilt as 4 quads (eyes zone z 13.9-18.85, mouth zone 10.7-13.9) that use
   the materials gnome_eyes / gnome_mouth (atlases from face/paint_face.py, 16 cells, three.js map.offset.x = cell/16).
2. new parts, all in code: cone hat (base = the head's hexagon at 1.06, closed underneath against the head, no gap),
   beard (front shell from the chin to the chest), round nose. Hat, beard, nose and plate are rigid on Head/Face.
3. texture v2 = the original ServBot.png recoloured (green shirt, blue pants, brown boots, skin) keeping its baked
   per-face shading; arms/legs keep the original UVs; new/repainted parts get islands painted with the same tone ramps.
4. scaled so the whole gnome (hat tip) is 6.6 units tall (0.5 x Mechayuki's 13.2) with the soles on z=0, faces -Y.
Degenerate original UVs (one-pixel swatches) are snapped to texel centres so Blender and three.js sample the same pixel."""
import os, math, bpy, bmesh
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
OUTD, TEXD = os.path.join(HERE, "out"), os.path.join(HERE, "tex")
TEX = 256
TARGET_H = 6.6
DCAP = 4.0                       # max texels per Servbot unit (PS1 chunky; the face plate is 5.25)
Z_TOP, Z_CUT, Z_BOT = 18.85, 13.9, 10.7
BRIM_Z = 18.15

ob = bpy.data.objects["Gnome"]; arm = bpy.data.objects["Armature"]; me = ob.data
REN = {"Bone000": "Body", "Bone001": "Head", "Bone006": "Face", "Bone002": "Arm.L", "Bone003": "Arm.R",
       "Bone004": "Leg.L", "Bone005": "Leg.R"}
if "Bone000" in arm.data.bones:
    for o, n in REN.items():
        arm.data.bones[o].name = n
        if o in ob.vertex_groups:                               # Blender usually renames the group with the bone
            ob.vertex_groups[o].name = n

PARTS = ["body", "head", "armL", "armR", "legL", "legR", "plate_eyes", "plate_mouth", "hat", "hat_under", "beard", "nose"]
P = {n: i for i, n in enumerate(PARTS)}
BONE_OF = {"body": "Body", "head": "Head", "armL": "Arm.L", "armR": "Arm.R", "legL": "Leg.L", "legR": "Leg.R",
           "plate_eyes": "Face", "plate_mouth": "Face", "hat": "Head", "hat_under": "Head", "beard": "Beard", "nose": "Head"}
G2P = {"Body": "body", "Head": "head", "Arm.L": "armL", "Arm.R": "armR", "Leg.L": "legL", "Leg.R": "legR", "Face": None}

bm = bmesh.new(); bm.from_mesh(me)
dl = bm.verts.layers.deform.verify()
pl = bm.faces.layers.int.get("part") or bm.faces.layers.int.new("part")
gname = {g.index: g.name for g in ob.vertex_groups}
kill = []
for f in bm.faces:
    g = gname[max(f.verts[0][dl].items(), key=lambda kv: kv[1])[0]]
    part = G2P[g]
    c = f.calc_center_median()
    if part is None:                                            # old face plate: rebuilt below
        kill.append(f); continue
    if part == "head" and (any(v.co.z > 20.6 for v in f.verts) or (f.normal.y < -0.8 and Z_BOT - 0.01 < c.z < Z_TOP + 0.01)):
        kill.append(f); continue                                # Lego stud + front faces duplicated by the plate
    f[pl] = P[part]
bmesh.ops.delete(bm, geom=kill, context="FACES")
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")


def add_faces(rings_or_faces, part, verts):
    out = []
    for idx in rings_or_faces:
        f = bm.faces.new([verts[i] for i in idx]); f[pl] = P[part]; out.append(f)
    return out


# ---- face plate: 2 zones x 2 halves
col = [(-7.9, -4.55), (0.0, -9.15), (7.9, -4.55)]
pv = {}
for zi, z in enumerate((Z_BOT, Z_CUT, Z_TOP)):
    for ci, (x, y) in enumerate(col):
        pv[(zi, ci)] = bm.verts.new((x, y, z))
for zi, part in ((0, "plate_mouth"), (1, "plate_eyes")):
    for ci in range(2):
        f = bm.faces.new([pv[(zi, ci)], pv[(zi, ci + 1)], pv[(zi + 1, ci + 1)], pv[(zi + 1, ci)]]); f[pl] = P[part]

# ---- hat: 12-point ring on the head hexagon, lofted to a bent cone
HEX = [(7.9, -4.55), (0.0, -9.15), (-7.9, -4.55), (-7.9, 4.55), (0.0, 9.15), (7.9, 4.55)]
HEX12 = []
for i in range(6):
    a, b = Vector(HEX[i]), Vector(HEX[(i + 1) % 6])
    HEX12 += [a, (a + b) / 2]
def ring_shape(round_t, scale):
    pts = []
    for i, h in enumerate(HEX12):                     # blend hexagon -> ellipse (8.6 x 9.4) for the upper rings
        ang = math.atan2(h.y, h.x)
        e = Vector((math.cos(ang) * 8.3, math.sin(ang) * 9.0))
        pts.append((h.lerp(e, round_t)) * scale)
    return pts
#        z      round  scale  back-shift(+Y)
HAT = [(BRIM_Z, 0.0, 1.07, 0.0),
       (19.05, 0.0, 1.07, 0.0),
       (19.45, 0.1, 1.02, 0.0),
       (24.0, 0.6, 0.80, 0.4),
       (29.5, 0.9, 0.52, 1.3),
       (34.0, 1.0, 0.27, 2.6)]
TIP = Vector((0.0, 4.4, 38.6))
rings = []
for z, rt, s, sh in HAT:
    rings.append([bm.verts.new((p.x, p.y + sh, z)) for p in ring_shape(rt, s)])
inner = [bm.verts.new((p.x, p.y, BRIM_Z)) for p in HEX12]          # on the head surface: closes the brim, no gap
tip = bm.verts.new(TIP)
n = 12
for r in range(len(rings) - 1):
    for i in range(n):
        f = bm.faces.new([rings[r][i], rings[r][(i + 1) % n], rings[r + 1][(i + 1) % n], rings[r + 1][i]]); f[pl] = P["hat"]
for i in range(n):
    f = bm.faces.new([rings[-1][i], rings[-1][(i + 1) % n], tip]); f[pl] = P["hat"]
    f = bm.faces.new([inner[i], inner[(i + 1) % n], rings[0][(i + 1) % n], rings[0][i]]); f[pl] = P["hat_under"]

# ---- beard: closed shell, rows of 5 front points + 3 back points, tip at the chest
def brow(z, xs, yf, yb):
    front = [(-xs[1], yf[1]), (-xs[0], yf[0]), (0.0, yf[2]), (xs[0], yf[0]), (xs[1], yf[1])]
    back = [(xs[1], yb), (0.0, yb), (-xs[1], yb)]
    return [bm.verts.new((x, y, z)) for x, y in front + back]
BR = [brow(11.05, (3.0, 6.0), (-7.75, -6.05, -9.55), -4.0),        # top edge on the face plate (x +-6.0 = painted beard edge)
      brow(8.0, (2.6, 4.9), (-8.75, -6.9, -10.15), -5.2),
      brow(5.0, (1.7, 3.0), (-8.5, -7.0, -9.65), -5.9)]
btip = bm.verts.new((0.0, -7.9, 2.6))
for r in range(len(BR) - 1):
    for i in range(8):
        f = bm.faces.new([BR[r][(i + 1) % 8], BR[r][i], BR[r + 1][i], BR[r + 1][(i + 1) % 8]]); f[pl] = P["beard"]
for i in range(8):
    f = bm.faces.new([BR[-1][(i + 1) % 8], BR[-1][i], btip]); f[pl] = P["beard"]

# ---- nose: short pointed cone like the reference gnome (6 sides), base buried in the face corner
NB, NM, NT = (-7.9, 14.35, 1.5, 1.35), (-10.2, 14.05, 0.85, 0.75), Vector((0.0, -11.7, 13.55))
nr = []
for y, z, rx, rz in (NB, NM):
    nr.append([bm.verts.new((rx * math.cos(math.radians(a6 * 60 + 30)), y, z + rz * math.sin(math.radians(a6 * 60 + 30))))
               for a6 in range(6)])
ntip = bm.verts.new(NT)
for i in range(6):
    f = bm.faces.new([nr[0][i], nr[0][(i + 1) % 6], nr[1][(i + 1) % 6], nr[1][i]]); f[pl] = P["nose"]
    f = bm.faces.new([nr[1][i], nr[1][(i + 1) % 6], ntip]); f[pl] = P["nose"]

bmesh.ops.recalc_face_normals(bm, faces=[f for f in bm.faces if f[pl] in (P["hat"], P["beard"], P["nose"])])

# ---- rig additions (Servbot skeleton kept): Beard (chin, child of Head) and a wrist joint Hand.L/R (child of Arm)
NEW_BONES = {"Beard": ((0.0, -7.6, 10.9), "Head"), "Hand.L": ((5.15, 0.0, 2.0), "Arm.L"), "Hand.R": ((-5.15, 0.0, 2.0), "Arm.R")}
for nm in NEW_BONES:
    if nm not in ob.vertex_groups:
        ob.vertex_groups.new(name=nm)
# rigid weights by part; the arm splits at the wrist ring z=2.0 (shared verts 50/50 so the joint bends without a gap)
gi = {g.name: g.index for g in ob.vertex_groups}
for v in bm.verts:
    v[dl].clear()
for f in bm.faces:
    b = BONE_OF[PARTS[f[pl]]]
    for v in f.verts:
        v[dl].clear()
        if b in ("Arm.L", "Arm.R") and v.co.z < 2.01:
            hb = "Hand" + b[3:]
            if v.co.z > 1.99:
                v[dl][gi[b]] = 0.5; v[dl][gi[hb]] = 0.5
            else:
                v[dl][gi[hb]] = 1.0
        else:
            v[dl][gi[b]] = 1.0

# ---- texture v2: the ORIGINAL Servbot texture, recoloured (its baked MML shading = per-face tones from 3-4 step ramps)
# Arms/hands keep the original UVs on the recoloured texture (map A). Legs/boots keep their original UVs too, shifted to a
# second recoloured copy of the strips + palette pixels (map B), because the original shares those swatches with the arms.
# Parts that are new or repainted (body with belt, head with hair/ears, hat, beard, nose) get planar islands painted in the
# same convention, one flat tone per face: top = light, front/back = mid, sides = dark, underside = darkest.
import numpy as np
SRC = os.path.normpath(os.path.join(HERE, "..", "..", "assets", "servbot", "ServBot.png"))
RAMP = {  # light, mid, dark, darkest
    "skin":  [(248, 204, 174), (237, 181, 150), (214, 150, 122), (168, 108, 86)],
    "green": [(108, 194, 90), (61, 155, 60), (46, 122, 46), (31, 86, 31)],
    "red":   [(238, 92, 64), (217, 58, 40), (170, 40, 28), (112, 28, 20)],
    "white": [(246, 245, 240), (217, 214, 207), (176, 171, 162), (128, 123, 116)],
    "hair":  [(164, 70, 44), (164, 70, 44), (124, 48, 32), (86, 34, 24)],
    "belt":  [(107, 68, 38), (107, 68, 38), (78, 50, 28), (52, 34, 20)],
    "gold":  [(232, 192, 56), (232, 192, 56), (176, 136, 48), (128, 96, 40)],
    "nose":  [(248, 204, 174), (232, 146, 124), (214, 150, 122), (168, 108, 86)],
}
SK_X = (110, 70, 54)
MAP_A = {(232, 192, 56): RAMP["skin"][1], (176, 136, 48): RAMP["skin"][2], (128, 96, 40): RAMP["skin"][3],
         (56, 56, 64): SK_X, (88, 56, 16): SK_X,
         (104, 168, 232): RAMP["green"][0], (72, 136, 200): RAMP["green"][0], (64, 64, 160): RAMP["green"][1],
         (48, 48, 128): RAMP["green"][2], (32, 32, 96): RAMP["green"][3], (88, 80, 88): (52, 138, 52),
         (112, 104, 112): RAMP["green"][1]}
PANTS = {(64, 64, 160): (52, 98, 152), (88, 80, 88): (60, 110, 168), (104, 168, 232): (110, 158, 214),
         (72, 136, 200): (110, 158, 214), (48, 48, 128): (46, 86, 136), (32, 32, 96): (32, 62, 100), (112, 104, 112): (60, 110, 168)}
BOOTS = {(64, 64, 160): (90, 58, 34), (48, 48, 128): (69, 41, 26), (32, 32, 96): (58, 36, 22),
         (104, 168, 232): (138, 94, 58), (72, 136, 200): (116, 73, 44)}
LEG_SRC, LEG_DST = (0, 96, 160, 130), (64, 2)              # top-left pixel coords
ISL_H = 124                                                  # islands live in the bottom 124 rows (top-left rows 132..255)
ISL_PARTS = {"body", "head", "hat", "hat_under", "beard", "nose"}


def tone(n):
    """Servbot convention: top light, front/back mid, sides dark, bottom darkest; slopes shift one step."""
    if n.z > 0.6: return 0
    if n.z < -0.6: return 3
    t = 2 if abs(n.x) > abs(n.y) else 1
    if n.z > 0.3: t -= 1
    if n.z < -0.3: t += 1
    return max(0, min(3, t))


def colour(part, p, n):
    t = tone(n)
    if part == "hat_under":
        return RAMP["red"][3]
    if part == "hat":
        if n.y < -0.25:                                            # leaf on the front
            a = math.radians(35); dx, dz = p.x + 1.4, p.z - 27.0
            u, v = dx * math.cos(a) + dz * math.sin(a), -dx * math.sin(a) + dz * math.cos(a)
            e = (u / 2.5) ** 2 + (v / 1.15) ** 2
            if e < 1.0:
                return RAMP["gold"][min(3, t + (1 if ((abs(v) < 0.22 and abs(u) < 2.2) or e > 0.72) else 0))]
            if -3.9 < u < -2.4 and abs(v) < 0.2:
                return RAMP["gold"][min(3, t + 1)]
        if p.z < 18.75:                                            # brim edge one step darker
            return RAMP["red"][min(3, t + 1)]
        if p.z > 30.5:                                             # tip catches more light (gradient, like the MML hats)
            return RAMP["red"][max(0, t - 1)]
        return RAMP["red"][t]
    if part == "head":
        if abs(n.x) > 0.9 and p.z < BRIM_Z - 0.3:                  # ear
            e = ((p.y + 1.6) / 1.5) ** 2 + ((p.z - 14.3) / 2.1) ** 2
            if e < 1.0:
                return RAMP["skin"][3] if (e < 0.4 or e > 0.8) else RAMP["skin"][t]
        if p.z < 10.75 and p.y < -5.0 and abs(p.x) < 5.6:          # chin bevel behind the beard
            return RAMP["white"][t]
        back = n.y > 0.3
        edge = BRIM_Z - 1.7 - (0.0 if not back else 4.5 + 1.2 * math.cos(p.x * 1.3))
        if p.z > edge and p.y > -4.0:                              # reddish hair under the hat
            return RAMP["hair"][min(3, t + (1 if p.z < edge + 0.45 else 0))]
        return RAMP["skin"][t]
    if part == "beard":
        return RAMP["white"][t]
    if part == "nose":
        return RAMP["nose"][t]
    if part == "body":
        if p.z < 1.75:
            if n.y < -0.5 and abs(p.x) < 1.35 and 0.25 < p.z < 1.5:
                return RAMP["belt"][2] if abs(p.x) < 0.55 and 0.6 < p.z < 1.15 else RAMP["gold"][t]
            return RAMP["belt"][min(3, t + (1 if (p.z < 0.3 or p.z > 1.45) else 0))]
        return RAMP["green"][t]
    return (255, 0, 255)


# base texture: original recoloured (map A), then the legs' copy (map B), then the island area cleared
src = bpy.data.images.load(SRC)
o = np.array(src.pixels[:], dtype=np.float32).reshape(TEX, TEX, 4)[::-1]       # -> top-left origin
bpy.data.images.remove(src)
orig = np.round(o[:, :, :3] * 255).astype(np.int32)
out = np.zeros((TEX, TEX, 3), dtype=np.int32); out[:] = (128, 128, 128)
for y in range(TEX):
    for x in range(TEX):
        c = tuple(int(v) for v in orig[y, x]); out[y, x] = MAP_A.get(c, c)
x0s, y0s, x1s, y1s = LEG_SRC
for y in range(y0s, y1s):
    for x in range(x0s, x1s):
        c = tuple(int(v) for v in orig[y, x]); m = PANTS if y < 118 else BOOTS
        out[LEG_DST[1] + y - y0s, LEG_DST[0] + x - x0s] = m.get(c, MAP_A.get(c, c))
out[TEX - ISL_H:, :] = (128, 128, 128)

# ---- UVs: arms + legs on the original layout (snapped to texel centres), everything else as islands
uvl = bm.loops.layers.uv.verify()
for f in bm.faces:
    part = PARTS[f[pl]]
    if part not in ("armL", "armR", "legL", "legR"):
        continue
    pts = [Vector((l[uvl].uv.x * TEX, (1 - l[uvl].uv.y) * TEX)) for l in f.loops]   # top-left pixel coords
    c = sum(pts, Vector((0, 0))) / len(pts)
    w = max(p.x for p in pts) - min(p.x for p in pts); h = max(p.y for p in pts) - min(p.y for p in pts)
    for l, p in zip(f.loops, pts):
        q = p.copy()
        q.x = math.floor(c.x) + 0.5 if w < 0.5 else q.x + max(-0.35, min(0.35, c.x - q.x))
        q.y = math.floor(c.y) + 0.5 if h < 0.5 else q.y + max(-0.35, min(0.35, c.y - q.y))
        if part in ("legL", "legR"):
            q += Vector((LEG_DST[0] - LEG_SRC[0], LEG_DST[1] - LEG_SRC[1]))
        l[uvl].uv = (q.x / TEX, 1 - q.y / TEX)
bm.faces.ensure_lookup_table()
seen, islands = set(), []
for f in bm.faces:
    if f.index in seen or PARTS[f[pl]] not in ISL_PARTS:
        continue
    grp, stack = [], [f]; seen.add(f.index)
    while stack:
        g = stack.pop(); grp.append(g)
        for e in g.edges:
            for h in e.link_faces:
                if h.index not in seen and h[pl] == f[pl] and h.normal.dot(f.normal) > 0.999:
                    seen.add(h.index); stack.append(h)
    islands.append(grp)
isl = []
for grp in islands:
    nrm = grp[0].normal.normalized()
    U = Vector((0, 0, 1)).cross(nrm) if abs(nrm.z) < 0.95 else Vector((1, 0, 0))
    U.normalize(); V = nrm.cross(U).normalized()
    o3 = grp[0].verts[0].co.copy()
    st = [((v.co - o3).dot(U), (v.co - o3).dot(V)) for g in grp for v in g.verts]
    s0, t0 = min(a for a, _ in st), min(b for _, b in st)
    s1, t1 = max(a for a, _ in st), max(b for _, b in st)
    isl.append(dict(faces=grp, n=nrm, U=U, V=V, o=o3, s0=s0, t0=t0, ws=s1 - s0, wt=t1 - t0, part=PARTS[grp[0][pl]]))
PAD = 1


def pack(D):
    order = sorted(range(len(isl)), key=lambda i: -isl[i]["wt"])
    x = y = rowh = 0; pos = {}
    for i in order:
        w = math.ceil(isl[i]["ws"] * D) + 2 * PAD; h = math.ceil(isl[i]["wt"] * D) + 2 * PAD
        if x + w > TEX:
            x, y, rowh = 0, y + rowh, 0
        if w > TEX or y + h > ISL_H:
            return None
        pos[i] = (x, y, w, h); x += w; rowh = max(rowh, h)
    return pos
D = DCAP
while (pos := pack(D)) is None:
    D -= 0.05
print(f"TEXEL DENSITY {D:.2f} px/unit, islands {len(isl)}")
for i, d in enumerate(isl):
    x0, y0, w, h = pos[i]                                  # Blender pixel coords (bottom-left origin)
    for f in d["faces"]:
        for l in f.loops:
            s, t = (l.vert.co - d["o"]).dot(d["U"]) - d["s0"], (l.vert.co - d["o"]).dot(d["V"]) - d["t0"]
            l[uvl].uv = ((x0 + PAD + s * D) / TEX, (y0 + PAD + t * D) / TEX)
    for yy in range(h):
        for xx in range(w):
            s = d["s0"] + (xx - PAD + 0.5) / D; t = d["t0"] + (yy - PAD + 0.5) / D
            out[TEX - 1 - (y0 + yy), x0 + xx] = colour(d["part"], d["o"] + d["U"] * s + d["V"] * t, d["n"])
px = np.concatenate([out[::-1].astype(np.float32) / 255.0, np.ones((TEX, TEX, 1), np.float32)], axis=2).ravel().tolist()
print("BODY PALETTE", len({tuple(c) for c in out.reshape(-1, 3)}))

# plate UVs: cell 0 of the atlases
for f in bm.faces:
    part = PARTS[f[pl]]
    if not part.startswith("plate"):
        continue
    zlo, zhi = (Z_CUT, Z_TOP) if part == "plate_eyes" else (Z_BOT, Z_CUT)
    for l in f.loops:
        x, y, z = l.vert.co
        u = 0.5 + (0.5 if x > 0 else -0.5) * min(1.0, abs(x) / 7.9)
        l[uvl].uv = (u / 16.0, (z - zlo) / (zhi - zlo))

# ---- materials
def make_mat(name, path):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True; nt = m.node_tree
    for nd in list(nt.nodes):
        if nd.type not in ("OUTPUT_MATERIAL", "BSDF_PRINCIPLED"):
            nt.nodes.remove(nd)
    bsdf = next(nd for nd in nt.nodes if nd.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Roughness"].default_value = 1.0
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.interpolation = "Closest"
    old = bpy.data.images.get(os.path.basename(path))
    if old: bpy.data.images.remove(old)
    img = bpy.data.images.load(path); img.pack(); tex.image = img
    nt.links.new(tex.outputs[0], bsdf.inputs[0])
    return m

img = bpy.data.images.get("gnome_body.png") or bpy.data.images.new("gnome_body.png", TEX, TEX, alpha=False)
img.pixels = px
img.filepath_raw = os.path.join(TEXD, "gnome_body.png"); img.file_format = "PNG"; img.save()
bpy.data.images.remove(img)
me.materials.clear()
for nm, fn in (("Gnome", "gnome_body.png"), ("gnome_eyes", "gnome_eyes.png"), ("gnome_mouth", "gnome_mouth.png")):
    me.materials.append(make_mat(nm, os.path.join(TEXD, fn)))
for f in bm.faces:
    part = PARTS[f[pl]]
    f.material_index = 1 if part == "plate_eyes" else (2 if part == "plate_mouth" else 0)
    f.smooth = False
for m in list(bpy.data.materials):
    if m.users == 0: bpy.data.materials.remove(m)

bm.to_mesh(me); bm.free()
me.update()

# ---- scale: soles z=0, hat tip = TARGET_H
zmin = min(v.co.z for v in me.vertices); zmax = max(v.co.z for v in me.vertices)
K = TARGET_H / (zmax - zmin)
M = Matrix.Scale(K, 4) @ Matrix.Translation((0, 0, -zmin))
me.transform(M)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode="EDIT")
for nm, (h, par) in NEW_BONES.items():
    b = arm.data.edit_bones.get(nm) or arm.data.edit_bones.new(nm)
    b.head = h; b.tail = Vector(h) + Vector((0, 0, 1.5)); b.roll = 0; b.parent = arm.data.edit_bones[par]
for b in arm.data.edit_bones:
    b.head = M @ b.head; b.tail = b.head + Vector((0, 0, 0.6))
bpy.ops.object.mode_set(mode="OBJECT")
arm["servbot_to_gnome_scale"] = K; arm["servbot_zmin"] = zmin
print(f"SCALE K={K:.5f} zmin={zmin:.2f} zmax={zmax:.2f} -> height {TARGET_H}; verts {len(me.vertices)} faces {len(me.polygons)}")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTD, "gnome.blend"))
print("GNOME DONE")
