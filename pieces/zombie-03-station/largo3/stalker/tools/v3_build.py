# blender -b -P tools/v3_build.py -- <stalker_dir>  -> v3/mesh.blend (objetos Coat, Arms, Head, Feet, Box)
# v3: metodo de Ava (pieces/zombie-girl/model/build.py): anillos lofteados sobre los perfiles medidos de la hoja turnaround.
# Ejes: Z arriba, mira a -Y, L = +X (en la vista frontal la izquierda de la imagen es la derecha del personaje = -X).
import bpy, bmesh, json, math, sys
from mathutils import Vector
D = sys.argv[sys.argv.index("--") + 1:][0]
P = json.load(open(f"{D}/v3/profiles.json")); R = {int(k): v for k, v in P["rows"].items()}
S, CF, CS, SOLE = P["S"], P["CF"], P["CS"], P["SOLE"]
def z(y): return (SOLE - y) * S
def fx(px): return (px - CF) * S
def sy(px): return (px - CS) * S
def row(y):
    for d in range(0, 6):
        for yy in (y + d, y - d):
            if yy in R: return R[yy]
    raise KeyError(y)
def sgnpow(v, p): return math.copysign(abs(v) ** p, v)
def ring_pt(phi, xc, hw, yf, yb, zz, p=0.8):
    """phi grados: 0 = frente (-Y), 90 = derecha del personaje (-X), 180 = atras (igual que Ava)"""
    s, c = math.sin(math.radians(phi)), math.cos(math.radians(phi)); ym = (yf + yb) / 2
    x = xc - hw * sgnpow(s, p)
    y = ym - (ym - yf) * abs(c) ** p if c >= 0 else ym + (yb - ym) * abs(c) ** p
    return Vector((x, y, zz))
OBJ = {}
def new(name): OBJ[name] = ([], []); return OBJ[name]
def add(o, v): o[0].append(Vector(v)); return len(o[0]) - 1
def bridge(o, a, b):
    n = len(a)
    for i in range(n): o[1].append((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
def cap(o, r, c=None):
    if c is None: o[1].append(tuple(r)); return
    ci = add(o, c)
    for i in range(len(r)): o[1].append((r[i], r[(i + 1) % len(r)], ci))

# bordes internos de los brazos sobre el hombro (donde se funden con el torso): se extrapolan hacia arriba
def arm_inner(y, side):
    rows = [yy for yy in range(276, 340, 4) if row(yy)["arm" + side]]
    if y >= 276 and row(y)["arm" + side]:
        return row(y)["arm" + side][1] if side == "R" else row(y)["arm" + side][0]
    ys = [yy for yy in rows]; xs = [row(yy)["arm" + side][1] if side == "R" else row(yy)["arm" + side][0] for yy in ys]
    n = len(ys); my, mx = sum(ys) / n, sum(xs) / n
    k = sum((a - my) * (b - mx) for a, b in zip(ys, xs)) / sum((a - my) ** 2 for a in ys)
    return mx + k * (y - my)

# ---------------- abrigo (torso + faldon plisado), 32 lados ----------------
NT = 40
TR = [146, 150, 155, 160, 166, 172, 178, 186, 194, 202, 212, 222, 232, 244, 256, 266, 274, 282, 290, 298, 306, 314, 323, 332, 342, 352, 362, 372, 382, 392, 404, 418, 432, 448, 464, 482, 500, 520, 540, 562, 584, 606, 628, 648, 666, 680, 686]
SPLIT = 382   # torso | faldon: dos objetos, cada uno con su textura de 128 px
rings = []
for y in TR:
    r = row(y)
    if y < 276: xr, xl = arm_inner(y, "R"), arm_inner(y, "L")
    else: xr, xl = r["body"]
    xr, xl = fx(xr), fx(xl); yf, yb = sy(r["side"][0]), sy(r["side"][1])
    if y < 160: yf = max(yf, sy(640))          # el perfil arriba incluye los tubos: el pecho empieza mas atras
    skirt = max(0.0, min(1.0, (y - 380) / 300))
    rg = []
    for i in range(NT):
        ph = i * 360 / NT; v = ring_pt(ph, (xl + xr) / 2, (xl - xr) / 2, yf, yb, z(y), 0.8 + 0.12 * skirt)
        if skirt > 0:   # pliegues verticales del faldon: crecen hacia el bajo
            c = Vector(((xl + xr) / 2, (yf + yb) / 2, v.z)); d = v - c
            v = c + d * (1 + (0.012 + 0.05 * skirt) * math.cos(math.radians(ph) * 16))
        rg.append(v)
    rings.append((y, rg))
def loft(name, rr, top_c=None, bot_c=None):
    o = new(name); ids = [[add(o, v) for v in rg] for _, rg in rr]
    for a, b in zip(ids, ids[1:]): bridge(o, a, b)
    if top_c is not None: cap(o, ids[0], top_c)
    if bot_c is not None: cap(o, ids[-1], bot_c)
loft("Torso", [q for q in rings if q[0] <= SPLIT], top_c=Vector((fx(CF), sy(700), z(TR[0]))))
loft("Skirt", [q for q in rings if q[0] >= SPLIT], bot_c=Vector((0, (sy(row(686)["side"][0]) + sy(row(686)["side"][1])) / 2, z(686))))


# ---------------- brazos + manos (12 lados), hasta la punta de los dedos ----------------
o = new("Arms"); NA = 14
AR = [152, 156, 161, 166, 172, 180, 190, 200, 212, 224, 236, 248, 260, 270, 280, 292, 304, 316, 328, 340, 352, 364, 376, 388, 398, 406, 414, 422, 430, 438, 446, 454, 462, 470, 477, 483, 488, 492, 495]
JOINTS = {}
for side in ("R", "L"):
    rings = []; cen = []
    for y in AR:
        r = row(y)
        if y < 276:
            xo = r["full"][0] if side == "R" else r["full"][1]; xi = arm_inner(y, side)
        else:
            a = r["arm" + side]
            if not a: continue
            xo, xi = (a[0], a[1]) if side == "R" else (a[1], a[0])
        xc, hw = fx((xo + xi) / 2), abs(xo - xi) / 2 * S
        # en el perfil el brazo cuelga en la mitad de atras: hombro ~px 742, codo ~732, mano ~700
        ym = sy(742 - 10 * max(0, min(1, (y - 200) / 160)) - 32 * max(0, min(1, (y - 360) / 80)))
        hand = y >= 404
        dep = max(0.15, hw * 1.25) if hand else hw * 1.3
        if y == AR[0]: hw *= 0.6; dep *= 0.6
        rings.append([add(o, ring_pt(i * 360 / NA, xc, hw, ym - dep / 2, ym + dep / 2, z(y), 0.85)) for i in range(NA)])
        cen.append((y, Vector((xc, ym, z(y)))))
    for a, b in zip(rings, rings[1:]): bridge(o, a, b)
    cap(o, rings[0], cen[0][1] + Vector((0, 0, 0.03))); cap(o, rings[-1], cen[-1][1] - Vector((0, 0, 0.02)))
    JOINTS[side] = cen

# ---------------- cabeza + cuello (16 lados): el frente del anillo sigue el perfil de la cara ----------------
o = new("Head"); NH = 20
HR = [150, 140, 132, 127, 123, 119, 115, 111, 107, 103, 99, 95, 91, 87, 83, 79, 75, 71, 67, 63, 59, 55, 51, 48]
rings = []
for y in HR:
    r = row(y)
    if y >= 126:   # cuello grueso (la fila frontal incluye los hombros)
        hw, xc, yf, yb = 0.15 if y >= 140 else 0.13, 0.0, sy(646), sy(716)
    else:
        b = r["body"]; hw, xc = (b[1] - b[0]) / 2 * S, fx((b[0] + b[1]) / 2)
        if y >= 112: hw, xc = min(hw, 0.14), max(-0.02, min(0.02, xc))   # la fila toca los tubos del hombro: sin pico
        yf, yb = sy(r["side"][0]), min(sy(r["side"][1]), sy(718))
    rings.append([add(o, ring_pt(i * 360 / NH, xc, hw, yf, yb, z(y), 0.78)) for i in range(NH)])
for a, b in zip(rings, rings[1:]): bridge(o, a, b)
cap(o, rings[-1], Vector((0, sy(668), z(45)))); cap(o, rings[0])

# ---------------- pies descalzos (12 lados) ----------------
o = new("Feet"); NF = 12
FR = [676, 686, 696, 704, 712, 719, 724, 728, 730]
ref = row(704)
for side in ("R", "L"):
    rings = []
    for y in FR:
        r = row(max(y, 698)); rs = [q for q in r["runs"] if ((q[1] < CF) if side == "R" else (q[0] > CF))]
        if not rs: rs = [q for q in ref["runs"] if ((q[1] < CF) if side == "R" else (q[0] > CF))]
        x0, x1 = min(q[0] for q in rs), max(q[1] for q in rs)
        sd = row(max(y, 696))["side"]; yf, yb = sy(sd[0]), sy(sd[1])
        if y < 696: yf, yb = sy(660), sy(750); x0, x1 = (x0 + 10, x1 - 10)
        rings.append([add(o, ring_pt(i * 360 / NF, fx((x0 + x1) / 2), (x1 - x0) / 2 * S, yf, yb, max(0.0, z(y)), 0.7)) for i in range(NF)])
    for a, b in zip(rings, rings[1:]): bridge(o, a, b)
    cap(o, rings[0]); cap(o, rings[-1])

# ---------------- caja hexagonal del pecho (geometria; la textura sale de la hoja) ----------------
o = new("Box"); bc = Vector((fx(307), sy(row(217)["side"][0]) + 0.05, z(217)))
back = [add(o, bc + Vector((0.10 * math.cos(math.radians(30 + 60 * k)), 0.0, 0.13 * math.sin(math.radians(30 + 60 * k))))) for k in range(6)]
front = [add(o, bc + Vector((0.09 * math.cos(math.radians(30 + 60 * k)), -0.09, 0.12 * math.sin(math.radians(30 + 60 * k))))) for k in range(6)]
bridge(o, back, front); cap(o, list(reversed(front))); cap(o, back)

# ---------------- objetos ----------------
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob)
tot = 0
for name, (vs, fs) in OBJ.items():
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in vs], [], fs); me.update()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = name != "Box"
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    t = sum(len(p.vertices) - 2 for p in me.polygons); tot += t; print("OBJ", name, t, "tris")
print("TOTAL TRIS", tot)
import json as _j
_j.dump({s: [(y, list(v)) for y, v in c] for s, c in JOINTS.items()}, open(f"{D}/v3/joints.json", "w"))
bpy.ops.wm.save_as_mainfile(filepath=f"{D}/v3/mesh.blend")
