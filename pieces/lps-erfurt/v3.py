# v3 (user rejected the flat final, 2026-11-04): every shot is a concrete, readable PLACE with depth — floor, walls,
# background, sky with chunky low-poly clouds, directional light, dressing; nobody floats; no black voids.
# exec'd by build.py after the v2 sets/helpers (shares its globals); redefines the shots, CAST and apply().
import bmesh

# ---------------------------------------------------------------- photo textures (Flow, 128 px PS1) + light
TEX = os.path.join(REF, "tex")
M = {k: K.mat_image(f"T_{k}", img(os.path.join(TEX, f"{k}_128.png"))) for k in ("stone", "planks", "timber", "roof", "cobble", "grass", "muck", "cellar")}
for mt, k in ((stone, "stone"), (wood, "planks")):                     # every v2 stone / plank surface gets the photo texture
    next(n for n in mt.node_tree.nodes if n.type == "TEX_IMAGE").image = img(os.path.join(TEX, f"{k}_128.png"))
SUN = bpy.data.objects["Sun"]; SUN.data.use_shadow = True; SUN.data.energy = 2.6; SUN.data.angle = math.radians(3)
SUN.rotation_euler = (math.radians(50), 0, math.radians(-35))
NIGHT_T = (0.38, 0.45, 0.8)
TM = {k: tinted(f"TN_{k}", img(os.path.join(TEX, f"{k}_128.png")), NIGHT_T) for k in ("stone", "timber", "roof", "cobble", "planks")}


def wipe(x0, x1, keep=()):
    """Delete the v2 objects of a set that v3 rebuilds (anything whose world x is inside [x0, x1])."""
    bpy.context.view_layer.update()
    for o in list(bpy.data.objects):
        if o in keep or o.type in ("CAMERA", "LIGHT", "ARMATURE"):
            continue
        if x0 <= o.matrix_world.translation.x <= x1:
            bpy.data.objects.remove(o, do_unlink=True)


def point(loc, energy=120.0, color=(1.0, 0.72, 0.42), r=0.15):
    li = bpy.data.lights.new("pt", "POINT"); li.energy = energy; li.color = color; li.shadow_soft_size = r
    o = bpy.data.objects.new("pt", li); o.location = loc; bpy.context.scene.collection.objects.link(o)
    return o


def tbox(name, size, loc, mat, uv=0.5):
    return K.box(name, size, loc, mat, uv_scale=uv)


def wall_x(name, x0, x1, y, z0, z1, th, mat, windows=(), uv=0.5):
    """Wall along X at y with window openings [(cx, z_bottom, w, h)] -> boxes around the holes + stone sills/lintels."""
    xs = sorted([x0, x1] + [v for cx, zb, w, h in windows for v in (cx - w / 2, cx + w / 2)])
    for a, b in zip(xs[:-1], xs[1:]):
        if b - a < 1e-3:
            continue
        mid = (a + b) / 2; win = next((wd for wd in windows if abs(wd[0] - mid) < wd[2] / 2), None)
        if win is None:
            tbox(f"{name}_{a:.1f}", (b - a, th, z1 - z0), ((a + b) / 2, y, (z0 + z1) / 2), mat, uv)
        else:
            cx, zb, w, h = win
            tbox(f"{name}_lo{a:.1f}", (b - a, th, zb - z0), (mid, y, (z0 + zb) / 2), mat, uv)
            tbox(f"{name}_hi{a:.1f}", (b - a, th, z1 - zb - h), (mid, y, (zb + h + z1) / 2), mat, uv)
            tbox(f"{name}_sill{a:.1f}", (b - a + 0.16, th + 0.12, 0.1), (mid, y, zb - 0.05), stone, 1.0)


def wall_y(name, y0, y1, x, z0, z1, th, mat, windows=(), uv=0.5):
    ys = sorted([y0, y1] + [v for cy, zb, w, h in windows for v in (cy - w / 2, cy + w / 2)])
    for a, b in zip(ys[:-1], ys[1:]):
        if b - a < 1e-3:
            continue
        mid = (a + b) / 2; win = next((wd for wd in windows if abs(wd[0] - mid) < wd[2] / 2), None)
        if win is None:
            tbox(f"{name}_{a:.1f}", (th, b - a, z1 - z0), (x, (a + b) / 2, (z0 + z1) / 2), mat, uv)
        else:
            cy, zb, w, h = win
            tbox(f"{name}_lo{a:.1f}", (th, b - a, zb - z0), (x, mid, (z0 + zb) / 2), mat, uv)
            tbox(f"{name}_hi{a:.1f}", (th, b - a, z1 - zb - h), (x, mid, (zb + h + z1) / 2), mat, uv)
            tbox(f"{name}_sill{a:.1f}", (th + 0.12, b - a + 0.16, 0.1), (x, mid, zb - 0.05), stone, 1.0)


def prism_roof(name, cx, cy, w, d, z, h, mat, axis="X"):
    """Gable roof: ridge along `axis`, eaves overhang 0.4."""
    hw, hd = w / 2 + 0.4, d / 2 + 0.4
    if axis == "X":
        v = [(-hw, -hd, 0), (hw, -hd, 0), (hw, hd, 0), (-hw, hd, 0), (-hw, 0, h), (hw, 0, h)]
        f = [(0, 1, 5, 4), (2, 3, 4, 5), (0, 4, 3), (1, 2, 5), (0, 3, 2, 1)]
    else:
        v = [(-hw, -hd, 0), (hw, -hd, 0), (hw, hd, 0), (-hw, hd, 0), (0, -hd, h), (0, hd, h)]
        f = [(0, 4, 5, 3), (1, 2, 5, 4), (0, 1, 4), (3, 5, 2), (0, 3, 2, 1)]
    o = K.mesh_from(name, v, f, mat, (cx, cy, z))
    uvl = o.data.uv_layers.new()
    for p in o.data.polygons:
        for li, vi in zip(p.loop_indices, p.vertices):
            c_ = o.data.vertices[vi].co
            uvl.data[li].uv = ((c_.x if axis == "X" else c_.y) * 0.5, (c_.z + abs(c_.y if axis == "X" else c_.x)) * 0.5)
    return o


def house(name, cx, cy, w, d, h, yaw_roof="X", night=False, lit=0.3, seed=0):
    """Neighbouring house: stone ground floor, half-timbered upper floor, slate gable roof, little windows."""
    mm = TM if night else M
    rr = np.random.default_rng(seed)
    tbox(name + "_lo", (w, d, h * 0.45), (cx, cy, h * 0.225), mm["stone"])
    tbox(name + "_up", (w + 0.3, d + 0.3, h * 0.55), (cx, cy, h * 0.45 + h * 0.275), mm["timber"])
    prism_roof(name + "_roof", cx, cy, w + 0.3, d + 0.3, h, h * 0.45, mm["roof"], yaw_roof)
    for k in range(int(w // 1.6)):
        x = cx - w / 2 + 0.9 + k * 1.6
        on = rr.random() < lit
        K.box(f"{name}_win{k}", (0.5, 0.05, 0.7), (x, cy - d / 2 - 0.17, h * 0.72), col("#F0B050" if (night and on) else "#2A2A34", night and on))


# ---------------------------------------------------------------- sky + chunky low-poly cloud kit (LPS look)
def sky_dome(name, center, r, photo, vk=1.6):
    """Sky = a real PHOTO of the sky (Flow, pixelated, mirrored-tiled for 360 deg) on an emissive dome, like the LPS
    backdrops. u = azimuth, v = height above the horizon."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, radius=r)
    uvl = bm.loops.layers.uv.new()
    for f in bm.faces:
        cx = sum((l.vert.co for l in f.loops), Vector()) / len(f.loops)
        a0 = math.atan2(cx.y, cx.x)
        for l in f.loops:
            a = math.atan2(l.vert.co.y, l.vert.co.x)
            if a - a0 > math.pi:
                a -= 2 * math.pi
            elif a0 - a > math.pi:
                a += 2 * math.pi
            l[uvl].uv = (a / (2 * math.pi) + 0.5, min(max(l.vert.co.z / r * vk, 0.0), 1.0) * 0.98 + 0.01)
    bm.to_mesh(me); bm.free()
    m = K.mat_image(name + "_m", img(os.path.join(TEX, photo)), emit_only=True)
    me.materials.append(m)
    o = K.link(bpy.data.objects.new(name, me)); o.location = center
    return o


_CLOUD_M = {}
CLOUDS = []


def _cloud_mat(night):
    """Small pixel-art cloud texture (8x16, Closest): cream-white tops, soft white middle, blue-grey belly, a dithered
    step between bands -- painted like the characters' atlases, lit flat the LPS way (50% emission + diffuse)."""
    if night not in _CLOUD_M:
        rows = (["#5E6C96"] * 4 + ["#4C5880"] * 6 + ["#3A4466"] * 6) if night else \
               (["#FFFDF4"] * 4 + ["#F4F4F2"] * 3 + ["#E2E8F0"] * 3 + ["#C4D0E0"] * 3 + ["#A2B2CA"] * 3)
        a = np.array([K.srgb_u8(c) for c in rows], np.uint8)[:, None, :].repeat(8, 1)
        for y in (3, 6, 9, 12):                                      # dithered band edges (pixel-art, no gradients)
            a[y, ::2] = a[y + 1, ::2]
        m = K.mat_image(f"cloudpx{int(night)}", K.image_from_array(f"cloudpx{int(night)}", a))
        _CLOUD_M[night] = m
    return _CLOUD_M[night]


def cloud(name, loc, s, seed, night=False):
    return None
    """(v3c: disabled -- the user wants the LPS photo sky only) A real low-poly MESH cumulus (like the characters): 3-5 faceted lumpy blobs (7x4 UV spheres, jittered verts)
    merged into one mesh of ~100 faces, flattened base, UV = height into the pixel texture. Drifts in apply()."""
    rr = np.random.default_rng(seed)
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    n = int(rr.integers(3, 6))
    for i in range(n):
        rad = s * rr.uniform(0.55, 0.95) * (1.15 if i == n // 2 else 1.0)
        off = Vector((s * (i - (n - 1) / 2) * 0.75 + rr.uniform(-0.15, 0.15) * s, rr.uniform(-0.3, 0.3) * s, (0.25 if i == n // 2 else 0) * s))
        g = bmesh.ops.create_uvsphere(bm, u_segments=7, v_segments=4, radius=rad)
        for v in g["verts"]:
            v.co = Vector((v.co.x * rr.uniform(0.9, 1.1), v.co.y * rr.uniform(0.85, 1.05), v.co.z * rr.uniform(0.85, 1.1))) + off
            v.co.z = max(v.co.z, -0.3 * s)                          # flat-bottomed cumulus
    uvl = bm.loops.layers.uv.new()
    zs = [v.co.z for v in bm.verts]; z0, z1 = min(zs), max(zs)
    for f in bm.faces:
        f.smooth = False
        for l in f.loops:
            l[uvl].uv = (0.5, 0.02 + 0.96 * (l.vert.co.z - z0) / max(z1 - z0, 1e-6))
    bm.to_mesh(me); bm.free()
    me.materials.append(_cloud_mat(night))
    o = K.link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = (0, 0, rr.uniform(-0.4, 0.4))
    CLOUDS.append((o, Vector(loc), 0.12 + 0.12 * rr.random()))
    return o


def clouds_around(tag, cx, cy, n, rmin, rmax, zmin, zmax, smin, smax, night=False, arc=(0, 2 * math.pi), seed=0):
    rr = np.random.default_rng(seed)
    for i in range(n):
        a = rr.uniform(*arc); r = rr.uniform(rmin, rmax)
        cloud(f"cloud_{tag}{i}", (cx + r * math.cos(a), cy + r * math.sin(a), rr.uniform(zmin, zmax)), rr.uniform(smin, smax), seed * 100 + i, night)


def hills_around(tag, cx, cy, n, rmin, rmax, mat, seed=0, arc=(0, 2 * math.pi)):
    rr = np.random.default_rng(seed)
    for i in range(n):
        a = rr.uniform(*arc); r = rr.uniform(rmin, rmax)
        h = cone(f"hill_{tag}{i}", rr.uniform(12, 25), rr.uniform(2, 6), rr.uniform(4, 10), (cx + r * math.cos(a), cy + r * math.sin(a), -0.5), mat, seg=7)


def tree(name, loc, s=1.0, night=False):
    K.box(name + "_tr", (0.25 * s, 0.25 * s, 1.2 * s), (loc[0], loc[1], loc[2] + 0.6 * s), col("#4A3220" if not night else "#2A2030"))
    for k, (r0, z) in enumerate(((1.1, 1.0), (0.85, 1.8), (0.55, 2.5))):
        cone(f"{name}_c{k}", r0 * s, 0.05, 1.1 * s, (loc[0], loc[1], loc[2] + z * s), col("#2E6A2E" if not night else "#1A2A3A"), seg=6)


# The world sky: one big gradient dome round every set (interiors see it through their windows)
cam.data.clip_end = 2500                                              # the sky dome is 900 m away
SKY = sky_dome("sky", (190, 0, -3), 900, "sky_day_px.png", vk=1.25)   # the photo spans the first ~18 deg above the horizon, where the cameras look
sc.world.node_tree.nodes["Background"].inputs[0].default_value = (*K.srgb("#9CC4EC"), 1)

# ---------------------------------------------------------------- A/E. THE HALL: photo-textured, windows, garderobe, light
for o in bpy.data.objects:                                            # retexture the hall's walls / floor / ceiling
    if o.name.startswith("E_w") and o.data and o.data.materials:
        o.data.materials[0] = M["stone"] if ("_wb" in o.name) else M["timber"]
E_FLOOR.data.materials[0] = M["planks"]
bpy.data.objects["E_ceil"].data.materials[0] = M["planks"]
E_SKY.location.z = -500
# side-wall windows (cut in the timber walls): replace the solid side walls by walls with two windows each
for nm in ("E_wl", "E_wr"):
    bpy.data.objects.remove(bpy.data.objects[nm], do_unlink=True)
wall_y("E_wl2", -3.3, 3.0, EX - 4.5, 0, 4, 0.2, M["timber"], windows=[(-1.4, 1.4, 1.0, 1.4), (1.4, 1.4, 1.0, 1.4)], uv=0.6)
wall_y("E_wr2", -3.3, 3.0, EX + 4.5, 0, 4, 0.2, M["timber"], windows=[(-1.4, 1.4, 1.0, 1.4), (1.4, 1.4, 1.0, 1.4)], uv=0.6)
for sx in (-1, 1):
    for wy in (-1.4, 1.4):
        for k in range(3):
            K.box(f"E_mull{sx}{wy}{k}", (0.24, 0.03, 1.4), (EX + sx * 4.5, wy - 0.33 + 0.33 * k, 2.1), col("#3A2A1C")).rotation_euler = (0, 0, 0)
point((EX - 2.5, -1.5, 3.2), 260); point((EX + 2.5, 0.8, 3.2), 260); point((EX, NY - 0.6, 2.4), 120)
clouds_around("E", EX, 0, 14, 40, 90, 12, 40, 4, 8, seed=3)
hills_around("E", EX, 0, 10, 120, 220, K.mat_image("hillg", img(os.path.join(TEX, "grass_128.png"))), seed=4)
tbox("E_outside", (220, 220, 0.2), (EX, 0, -8.0), M["grass"], 0.05)
# QA (s11): below the vanished floor there must be a visible DROP: a closed stone shaft down to the cesspit
for nm, s_, l_ in (("E_shaft_b", (9.4, 0.4, 7.0), (EX, NY + 0.2, -3.5)), ("E_shaft_f", (9.4, 0.4, 7.0), (EX, -3.5, -3.5)),
                   ("E_shaft_l", (0.4, 7.0, 7.0), (EX - 4.7, -0.25, -3.5)), ("E_shaft_r", (0.4, 7.0, 7.0), (EX + 4.7, -0.25, -3.5))):
    tbox(nm, s_, l_, M["cellar"], 0.5)
tbox("E_shaft_muck", (9.0, 6.6, 0.1), (EX, -0.25, -4.6), M["muck"], 0.4)
for k in range(10):                                                      # broken joists sticking out of the walls
    b_ = beam(f"E_stub{k}", 1.2, 0.22, (EX - 4.0 + 0.9 * k, (-2.9 if k % 2 else 2.6), -0.15))
    b_.rotation_euler = (0, 0, math.pi / 2); b_.scale = (1, 1, 1)
# the garderobe (privy) in the front-right corner: a wooden booth, a recognisable seat with a round hole and a lid


def privy_seat(name, loc, w=0.9, d=0.55, h=0.5, yaw=0.0):
    """Medieval wooden privy seat: plank box, top board with an octagonal hole (real hole geometry), hinged lid
    leaning back against the wall, a darker rim round the hole."""
    root = K.link(bpy.data.objects.new(name, None))
    pw = M["planks"]
    K.box(name + "_front", (w, 0.05, h - 0.05), (0, -d / 2 + 0.025, (h - 0.05) / 2), pw, 1.5).parent = root
    for sx in (-1, 1):
        K.box(name + f"_side{sx}", (0.05, d, h - 0.05), (sx * (w / 2 - 0.025), 0, (h - 0.05) / 2), pw, 1.5).parent = root
    n = 10; rh = 0.15; outer = [(-w / 2, -d / 2), (w / 2, -d / 2), (w / 2, d / 2), (-w / 2, d / 2)]
    hole = [(rh * 1.15 * math.cos(2 * math.pi * i / n), 0.02 + rh * math.sin(2 * math.pi * i / n)) for i in range(n)]
    v = [(x, y, h) for x, y in outer] + [(x, y, h) for x, y in hole] + [(x, y, h - 0.06) for x, y in outer] + [(x, y, h - 0.06) for x, y in hole]
    f = []
    q = [0] * n                                                         # each hole vertex -> nearest outer corner, fan quads
    for i in range(n):
        a = math.atan2(hole[i][1], hole[i][0]); q[i] = int(((a + math.pi * 1.25) % (2 * math.pi)) // (math.pi / 2))
    corner_order = [0, 1, 2, 3]
    for i in range(n):
        j = (i + 1) % n
        if q[i] == q[j]:
            f.append((4 + i, 4 + j, corner_order[q[i]]))
        else:
            f.append((4 + i, 4 + j, corner_order[q[j]], corner_order[q[i]]))
    o_ = 4 + n
    f += [tuple(o_ + x for x in fa[::-1]) for fa in f]
    f += [(4 + i, o_ + 4 + i, o_ + 4 + (i + 1) % n, 4 + (i + 1) % n) for i in range(n)]       # hole wall
    top = K.mesh_from(name + "_top", v, f, M["planks"]); top.parent = root
    uvl = top.data.uv_layers.new()
    for p in top.data.polygons:
        for li, vi in zip(p.loop_indices, p.vertices):
            c_ = top.data.vertices[vi].co; uvl.data[li].uv = (c_.x * 1.2 + 0.5, c_.y * 1.2 + 0.5)
    cone(name + "_dark", rh * 1.1, rh * 1.0, 0.01, (0, 0.02, h - 0.4), col("#100804", True), seg=n).parent = root
    lid = K.box(name + "_lid", (0.42, 0.04, 0.5), (0, d / 2 + 0.02, h + 0.25), pw, 2.0); lid.rotation_euler = (math.radians(-8), 0, 0); lid.parent = root
    K.box(name + "_hinge", (0.4, 0.05, 0.03), (0, d / 2 - 0.02, h + 0.01), col("#2A2A2E")).parent = root
    root.location = loc; root.rotation_euler = (0, 0, yaw)
    return root


PRX, PRY = EX + 3.55, -2.45
PRIVY = privy_seat("privy", (PRX, PRY + 0.15, 0), yaw=-math.pi / 2)
for nm, s_, l_ in (("privy_wl", (1.4, 0.06, 2.3), (PRX, PRY - 0.75, 1.15)), ("privy_wr", (1.4, 0.06, 2.3), (PRX, PRY + 0.95, 1.15))):
    K.box(nm, s_, l_, M["planks"], uv_scale=1.5)
K.box("privy_door", (0.06, 0.8, 2.0), (PRX - 1.12, PRY + 0.95 + 0.03, 1.0), M["planks"], uv_scale=1.5).rotation_euler = (0, 0, math.radians(90))   # swung open flat against the partition
K.box("privy_paper", (0.25, 0.04, 0.2), (PRX + 0.5, PRY + 0.15, 1.1), col("#D8C890"))       # a hay bundle on a peg
candle((PRX + 0.35, PRY + 0.55, 0.5), 0.16)
point((PRX, PRY + 0.1, 1.9), 60)

# ---------------------------------------------------------------- crowd: clones of the distinct people (shared meshes)


def clone_person(src, name):
    objs = [src] + list(src.children_recursive)
    mp = {}
    for o in objs:
        c = o.copy(); mp[o] = c; bpy.context.scene.collection.objects.link(c)
    for o, c in mp.items():
        if o.parent in mp:
            c.parent = mp[o.parent]
    root = mp[src]; root.name = name
    root["parts"] = {k: mp[bpy.data.objects[v]].name for k, v in src["parts"].items() if v in bpy.data.objects and bpy.data.objects[v] in mp}
    return root


CROWD_SRC = NOBLES + CROWDP
CLONES = []
for k in range(3):
    for i, r in enumerate(CROWD_SRC):
        c = clone_person(r, f"cl_{k}_{i}")
        sc_ = r.scale.copy(); c.scale = (sc_.x * (1 + 0.05 * ((k + i) % 3 - 1)), sc_.y * (1 + 0.05 * ((k + i) % 3 - 1)), sc_.z * (1 + 0.03 * (k - 1)))
        CLONES.append(c)
FOLK = CROWD_SRC + CLONES                                              # 36 distinct-looking bodies (9 faces x outfits)
rf = np.random.default_rng(17)
HALL_POS = []
for j in range(6):                                                      # crammed: ~0.6 m apart, jittered, facing all ways
    for i in range(6):
        HALL_POS.append((EX - 3.3 + i * 1.12 + rf.uniform(-0.2, 0.2), -2.7 + j * 0.85 + rf.uniform(-0.15, 0.15), rf.uniform(-math.pi, math.pi)))


def place_folk(spots, t=0.0, talk=True):
    for i, r in enumerate(FOLK):
        if i < len(spots):
            x, y, yw = spots[i][:3]; z = spots[i][3] if len(spots[i]) > 3 else 0.0
            show(r, True); pput(r, (x, y, z), yw + (0.06 * math.sin(t * 1.7 + i) if talk else 0))
            if talk:
                hpose(r, "head", (6 * math.sin(t * 2.3 + i * 1.3), 0, 10 * math.sin(t * 1.1 + i)))
                if i % 4 == 0:                                          # some raise a goblet arm / gesture
                    hpose(r, "upperarm_R", (-40 - 20 * math.sin(t * 3 + i), 0, 0)); hpose(r, "forearm_R", (-60, 0, 0))
        else:
            show(r, False)


def hide_folk():
    for r in FOLK:
        show(r, False)


# ---------------------------------------------------------------- B. WAR ROOM round the map
for nm, s_, l_ in (("B_wb", (8, 0.3, 5.1), (BX, 4.0, 1.7)), ("B_wf", (8, 0.3, 5.1), (BX, -4.0, 1.7))):
    pass
wall_x("B_wb", BX - 4, BX + 4, 4.0, -0.85, 4.25, 0.3, M["stone"], windows=[(BX - 1.5, 0.7, 1.0, 1.6), (BX + 1.5, 0.7, 1.0, 1.6)])
wall_x("B_wf", BX - 4, BX + 4, -4.0, -0.85, 4.25, 0.3, M["stone"], windows=[(BX, 0.7, 1.2, 1.6)])
wall_y("B_wl", -4, 4, BX - 4, -0.85, 4.25, 0.3, M["stone"])
wall_y("B_wr", -4, 4, BX + 4, -0.85, 4.25, 0.3, M["stone"])
tbox("B_floor", (8, 8, 0.1), (BX, 0, -0.9), M["planks"], 0.6)
tbox("B_ceil", (8, 8, 0.1), (BX, 0, 4.3), M["planks"], 0.6)
for i in range(3):
    beam(f"B_beam{i}", 8, 0.3, (BX, -2.5 + 2.5 * i, 4.1))
for x in (-1.2, 1.2):                                                    # chairs
    K.box(f"B_chair{x}", (0.5, 0.5, 0.06), (BX + x, -2.6, -0.4), M["planks"], 2); K.box(f"B_chairb{x}", (0.5, 0.06, 0.7), (BX + x, -2.85, -0.05), M["planks"], 2)
tapestry((BX + 3.83, 0.5, 2.0), -math.pi / 2, 1.6); torch((BX - 3.83, 1.5, 2.2), math.pi / 2); shield("thuringia", (BX - 3.83, -1.2, 2.4), math.pi / 2, 0.6)
point((BX, 0, 3.4), 220); point((BX - 3.5, 1.5, 2.6), 90)
clouds_around("B", BX, 0, 10, 30, 70, 8, 30, 3, 6, seed=5)

# ---------------------------------------------------------------- C. COUNCIL CHAMBER: the feud across a table
wipe(65, 96, keep=set(ROPES) | {CROZIER})
CX3 = 80.0
tbox("C_floor", (9, 8, 0.1), (CX3, 0, -0.05), M["planks"], 0.6)
tbox("C_ceil", (9, 8, 0.1), (CX3, 0, 4.2), M["planks"], 0.6)
wall_x("C_wb", CX3 - 4.5, CX3 + 4.5, 3.6, 0, 4.2, 0.3, M["stone"], windows=[(CX3 - 2.2, 1.1, 1.1, 1.8), (CX3 + 2.2, 1.1, 1.1, 1.8)])
wall_x("C_wf", CX3 - 4.5, CX3 + 4.5, -4.0, 0, 4.2, 0.3, M["stone"], windows=[(CX3 + 1.5, 1.1, 1.1, 1.8)])
wall_y("C_wl", -4, 3.6, CX3 - 4.5, 0, 4.2, 0.3, M["stone"], windows=[(-0.5, 1.1, 1.1, 1.8)])
wall_y("C_wr", -4, 3.6, CX3 + 4.5, 0, 4.2, 0.3, M["stone"], windows=[(-0.5, 1.1, 1.1, 1.8)])
for i in range(4):
    beam(f"C_beam{i}", 9, 0.3, (CX3, -3 + 2 * i, 4.0))
tbox("C_carpet", (2.0, 4.6, 0.02), (CX3, 0.2, 0.01), col("#7A1820"), 1)
C_TABLE_Z = 0.8
tbox("C_tabletop", (2.4, 1.1, 0.08), (CX3, 0.4, C_TABLE_Z - 0.04), M["planks"], 1.2)
for sx in (-1, 1):
    for sy in (-1, 1):
        tbox(f"C_tleg{sx}{sy}", (0.1, 0.1, C_TABLE_Z - 0.08), (CX3 + sx * 1.05, 0.4 + sy * 0.42, (C_TABLE_Z - 0.08) / 2), col("#3A2414"))
for x, y in ((-0.85, 0.75), (0.85, 0.75)):
    candle((CX3 + x, y, C_TABLE_Z), 0.22)
PP.loft(os.path.join(REF, "goblet.jpg"), "C_gob1", height=0.2, sides=8, loc=(CX3 - 0.6, 0.05, C_TABLE_Z))
PP.loft(os.path.join(REF, "jug_body.jpg"), "C_jug", height=0.32, sides=8, loc=(CX3 + 0.55, 0.85, C_TABLE_Z))
DEED_IMG = img(os.path.join(REF, "map.jpg"))
DEED = K.plane("deed", 1.0, 0.62, (0, 0, -50), rot=(0, 0, 0), mat=K.mat_image("deed_m", DEED_IMG))
shield("mainz", (CX3 - 2.4, 3.43, 2.8), 0.0, 0.8); shield("thuringia", (CX3 + 2.4, 3.43, 2.8), 0.0, 0.8)
for i, (x, c_) in enumerate(((-3.6, "#B01C20"), (3.6, "#1C3A90"))):
    tbox(f"C_ban{i}", (0.8, 0.04, 2.2), (CX3 + x, 3.42, 2.6), col(c_)); tbox(f"C_bans{i}", (0.2, 0.05, 2.2), (CX3 + x, 3.4, 2.6), col("#E0B030"))
tapestry((CX3, 3.43, 2.6), 0.0, 1.5)
torch((CX3 - 4.33, 1.6, 2.2), math.pi / 2); torch((CX3 + 4.33, 1.6, 2.2), -math.pi / 2)
PP.loft(os.path.join(REF, "barrel.jpg"), "C_barrel", height=0.9, sides=10, loc=(CX3 + 3.7, -3.2, 0))
straw_floor(CX3, -1.5, 7, 3, 30)
cross_cut(os.path.join(REF, "stool_cut.png"), "C_stool", 0.48, (CX3 - 3.6, -2.8, 0))
point((CX3 - 1.5, 0.4, 3.3), 220); point((CX3 + 1.5, 0.4, 3.3), 220)
clouds_around("C", CX3, 0, 12, 30, 80, 8, 32, 3, 6, seed=6)

# ---------------------------------------------------------------- D. THRONE ROOM closed: front wall with windows, ceiling
wall_x("D_wf", DX - 3.5, DX + 3.5, -4.6, 0, 6, 0.3, M["stone"], windows=[(DX - 1.7, 1.6, 1.1, 2.2), (DX + 1.7, 1.6, 1.1, 2.2)])
tbox("D_ceil", (7.4, 10, 0.1), (DX, -1.0, 6.0), M["planks"], 0.6)
for i in range(4):
    beam(f"D_beam{i}", 7.2, 0.32, (DX, -3.6 + 2 * i, 5.8))
for o in bpy.data.objects:
    if o.name in ("D_left", "D_right", "D_back"):
        o.data.materials[0] = M["stone"]
torch((DX - 1.7 + 0.9, -4.43, 2.4), math.pi); torch((DX + 1.7 - 0.9, -4.43, 2.4), math.pi)
point((DX, 0.5, 4.2), 300); point((DX - 3.0, 0.6, 2.4), 80); point((DX + 3.0, 0.6, 2.4), 80)
clouds_around("D", DX, 0, 10, 30, 70, 8, 30, 3, 6, seed=7)
# horse field: grass, road, hills, trees, a distant castle, chunky clouds
bpy.data.objects["F_ground"].data.materials[0] = M["grass"]
bpy.data.objects["F_sky"].hide_render = True
tbox("F_road", (40, 2.2, 0.02), (FX, 0.9, 0.005), M["cobble"], 0.4)
hills_around("F", FX, 0, 14, 60, 140, M["grass"], seed=8)
for k, (x, y) in enumerate(((-6, 6), (-3, 9), (4, 7), (8, 12), (-10, 14), (12, 5))):
    tree(f"F_tree{k}", (FX + x, y, 0), 1.3)
tbox("F_castle", (5, 4, 6), (FX + 18, 40, 3), M["stone"]); tbox("F_keep", (2.5, 2.5, 10), (FX + 18, 40, 5), M["stone"])
prism_roof("F_croof", FX + 18, 40, 2.5, 2.5, 10, 2.2, M["roof"])
clouds_around("F", FX, 0, 16, 25, 80, 10, 30, 3, 7, arc=(0.15, math.pi - 0.15), seed=9)

# ---------------------------------------------------------------- R. GROUND FLOOR under the hall: the rotten beams (s06)
RX = 216.0
tbox("R_floor", (9, 7, 0.1), (RX, 0, -0.05), M["cobble"], 0.6)
wall_x("R_wb", RX - 4.5, RX + 4.5, 3.5, 0, 3.4, 0.3, M["stone"], windows=[(RX + 2.0, 1.4, 0.8, 1.0)])
wall_x("R_wf", RX - 4.5, RX + 4.5, -3.5, 0, 3.4, 0.3, M["stone"])
wall_y("R_wl", -3.5, 3.5, RX - 4.5, 0, 3.4, 0.3, M["stone"])
wall_y("R_wr", -3.5, 3.5, RX + 4.5, 0, 3.4, 0.3, M["stone"])
R_BOARDS = tbox("R_boards", (9, 7, 0.08), (RX, 0, 3.45), M["planks"], 0.6)
R_BEAMS = []
for i in range(5):
    b = beam(f"R_beam{i}", 7.0, 0.32, (RX - 3.2 + 1.6 * i, 0, 3.24), axis="Y"); R_BEAMS.append(b)
R_CRACK_BEAM = R_BEAMS[2]
rr2 = np.random.default_rng(33)
for i in range(30):                                                      # rot: fungus brackets, dark patches, bore holes, cobwebs
    b = R_BEAMS[i % 5]; y = rr2.uniform(-3.0, 3.0); x = b.location.x
    if i % 3 == 0:
        f_ = K.uv_sphere(f"R_fung{i}", 0.07 + 0.05 * rr2.random(), (x + 0.17 * (1 if i % 2 else -1), y, 3.12), col(("#E8E0C0", "#C8B890", "#B0A070")[i % 3]), seg=7, rings=4); f_.scale = (0.6, 1.3, 0.35)
    elif i % 3 == 1:
        K.box(f"R_rot{i}", (0.33, rr2.uniform(0.3, 0.9), 0.01), (x, y, 3.075), col("#2A1C0C"))
    else:
        cone(f"R_hole{i}", 0.025, 0.025, 0.004, (x + rr2.uniform(-0.1, 0.1), y, 3.076), col("#0A0602", True), seg=6).rotation_euler = (math.pi, 0, 0)
for i in range(0):                                               # QA: the translucent cobweb planes read as artefacts -> none
    K.plane(f"R_web{i}", 0.6, 0.5, (RX - 3.6 + 1.5 * i, rr2.uniform(-3, 3), 2.9), rot=(math.pi / 2, 0, rr2.uniform(0, 3)), mat=mat_glow("webm", "#E8E8F0", 0.25))
for k, (x, y) in enumerate(((-3.5, 2.6), (-2.8, 2.8), (3.6, -2.6))):
    PP.loft(os.path.join(REF, "barrel.jpg"), f"R_barrel{k}", height=0.9, sides=10, loc=(RX + x, y, 0))
straw_bale((RX + 3.4, 2.5, 0), 0.2); straw_floor(RX, 0, 8, 6, 60)
torch((RX - 4.33, -1.0, 1.8), math.pi / 2); torch((RX + 4.33, 1.0, 1.8), -math.pi / 2)
point((RX - 3.9, -1.0, 2.2), 140); point((RX + 3.9, 1.0, 2.2), 140); point((RX, 0.2, 2.4), 160, (1.0, 0.85, 0.65), 0.4); point((RX + 2.0, 3.2, 2.0), 60, (0.8, 0.9, 1.0))
ROTTEN = K.Letters3D("rotten", "ROTTEN", size=0.3, front="#B8C860", side="#4A5020", seed=21, jitter=0.6)
DUST = [K.box(f"R_dust{i}", (0.02, 0.02, 0.02), (0, 0, -50), col("#C8B890", True)) for i in range(24)]
SPLINTERS = [K.box(f"R_spl{i}", (0.03, 0.18, 0.02), (0, 0, -50), col("#A07848")) for i in range(6)]
clouds_around("R", RX, 0, 6, 30, 60, 5, 20, 3, 5, seed=10)

# ---------------------------------------------------------------- G. CUTAWAY: the whole building cut open, outside visible
wipe(224, 258, keep={cam})
GX = 240.0
GZ_UP = 3.4
tbox("G_grass", (64, 60, 0.1), (GX, 32, -0.05), M["grass"], 0.15)
tbox("G_street", (64, 4, 0.06), (GX, 7.5, -0.01), M["cobble"], 0.4)
EARTH = col("#6A5236")
tbox("G_earthL", (40, 6, 4), (GX - 22.5, 3, -2.05), M["cellar"], 0.4); tbox("G_earthR", (40, 6, 4), (GX + 22.5, 3, -2.05), M["cellar"], 0.4)
tbox("G_earthB", (5, 6, 1.0), (GX, 3, -3.55), M["cellar"], 0.4); tbox("G_earthBack", (5, 1.0, 3.0), (GX, 5.5, -1.55), M["cellar"], 0.4)
tbox("G_earthE", (64, 60, 4), (GX, 36, -2.1), EARTH, 0.2)
for sx in (-1, 1):
    tbox(f"G_pitw{sx}", (0.5, 5, 3.0), (GX + sx * 2.75, 3.0, -1.5), M["cellar"], 0.6)
G_MUCK = tbox("G_muck", (5.0, 5.0, 0.1), (GX, 3.0, -2.2), M["muck"], 0.6)
for sx in (-1, 1):
    wall_y(f"G_ws{sx}", 0, 6, GX + sx * 4.25, 0, 6.8, 0.5, M["stone"], windows=[(3.0, 4.2, 0.9, 1.3)])
wall_x("G_wb", GX - 4.5, GX + 4.5, 6.0, 0, 6.8, 0.5, M["stone"], windows=[(GX - 2.0, 4.2, 0.9, 1.3), (GX + 2.0, 4.2, 0.9, 1.3)])
prism_roof("G_roof", GX, 3.0, 9.0, 6.0, 6.8, 3.0, M["roof"])
tbox("G_ceil", (8.0, 6, 0.1), (GX, 3.0, 6.75), M["planks"], 0.6)
SLABS = {}
G_FIGS = []
for lvl, z in (("up", GZ_UP), ("gr", 0.0)):
    for side in (-1, 1):
        piv = K.link(bpy.data.objects.new(f"G3_{lvl}{side}", None)); piv.location = (GX + side * 4.0, 3.0, z)
        s_ = K.box(f"G3_slab_{lvl}{side}", (4.0, 5.9, 0.18), (-side * 2.0, 0, -0.09), M["planks"], 0.6); s_.parent = piv
        if lvl == "up":
            for k in range(2):
                bm_ = beam(f"G3_bm{side}{k}", 4.0, 0.25, (-side * 2.0, -1.5 + 3 * k, -0.3)); bm_.parent = piv
        SLABS[(lvl, side)] = piv
for k_, (x, y, z) in enumerate(((-3.2, 5.4, GZ_UP), (3.2, 5.4, GZ_UP), (-3.2, 5.4, 0), (3.0, 5.2, 0))):
    PP.loft(os.path.join(REF, "barrel.jpg"), f"G_barrel{k_}", height=0.8, sides=10, loc=(GX + x, y, z)) if z == 0 else candle((GX + x, y, z), 0.25)
for side in (-1, 1):
    tbox(f"G_ban{side}", (0.7, 0.04, 1.6), (GX + side * 1.0, 5.73, GZ_UP + 2.0), col("#B01C20" if side < 0 else "#1C3A90"))
    torch((GX + side * 3.0, 5.73, GZ_UP + 1.8), 0.0)
point((GX, 2.0, GZ_UP + 2.6), 300); point((GX, 2.0, 2.2), 200)
for k, (x, y, w, d, h) in enumerate(((-12, 9, 7, 5, 8), (12, 10, 6, 5, 9), (-4, 16, 8, 6, 10), (7, 18, 7, 6, 8), (-15, 20, 6, 5, 7))):
    house(f"G_house{k}", GX + x, y + 3, w, d, h, seed=k)
for k, (x, y) in enumerate(((-8, 8), (9, 7.5), (-18, 12), (17, 14))):
    tree(f"G_tree{k}", (GX + x, y, 0), 1.2)
hills_around("G", GX, 30, 12, 70, 160, M["grass"], seed=11, arc=(0.1, math.pi - 0.1))
clouds_around("G", GX, 10, 16, 30, 90, 14, 34, 3, 7, arc=(0.2, math.pi - 0.2), seed=12)
CESS3 = K.text3d("cesspit3", "CESSPIT", size=0.75, extrude=0.05, front="#F4E8C8", side="#3A2A10", font=K.FONT_BOLD, loc=(GX, -0.05, -1.4))
G_UP_FOLK, G_GR_FOLK = 12, 6

# ---------------------------------------------------------------- H. THE PIT: a stone cellar, broken floors above, people in the muck
wipe(266, 294, keep={FLY, TALLY} | set(DRIPS))
HX = 280.0
PIT = 4.0
SLUDGE = sludge_mesh() if False else None
me_ = None
n_ = 20; v_ = []; f_ = []; uvs_ = []
rr3 = np.random.default_rng(12)
hg = rr3.random((n_ + 1, n_ + 1))
for _ in range(2):
    hg = (hg + np.roll(hg, 1, 0) + np.roll(hg, -1, 0) + np.roll(hg, 1, 1) + np.roll(hg, -1, 1)) / 5
hg = (hg - hg.mean()) / hg.std() * 0.07
for j in range(n_ + 1):
    for i in range(n_ + 1):
        v_.append(((i / n_ - 0.5) * 2 * PIT, (j / n_ - 0.5) * 2 * PIT, hg[j, i])); uvs_.append((i / n_ * 3, j / n_ * 3))
for j in range(n_):
    for i in range(n_):
        a = j * (n_ + 1) + i; f_.append((a, a + 1, a + n_ + 2, a + n_ + 1))
SLUDGE = K.mesh_from("muck3", v_, f_, M["muck"], (HX, 0, 0))
uvl = SLUDGE.data.uv_layers.new()
for p in SLUDGE.data.polygons:
    for li, vi in zip(p.loop_indices, p.vertices):
        uvl.data[li].uv = uvs_[vi]
for sx in (-1, 1):
    tbox(f"H_wx{sx}", (0.6, 2 * PIT + 1.2, 6.0), (HX + sx * (PIT + 0.3), 0, 2.4), M["cellar"], 0.5)
    tbox(f"H_wy{sx}", (2 * PIT + 1.2, 0.6, 6.0), (HX, sx * (PIT + 0.3), 2.4), M["cellar"], 0.5)
H_STEPS = []
for k in range(6):                                                   # stone steps up the south wall (the landgrave's way out)
    H_STEPS.append(tbox(f"H_step{k}", (1.6, 0.45, 0.3), (HX + 1.5, -PIT + 0.22 + 0.0, -0.1 + 0.3 * k), stone, 1.0))
    H_STEPS[-1].location.y = -PIT + 0.2 + 0.0
    H_STEPS[-1].location.x = HX + 1.5 - 0.0
for k in range(6):
    H_STEPS[k].location = (HX + 0.3 + 0.45 * k, -PIT + 0.3, -0.05 + 0.3 * k)
    H_STEPS[k].scale = (0.3, 1.3, 1.0)
H_LEDGE = K.box("H_ledge_dummy", (0.01, 0.01, 0.01), (0, 0, -60))
rb = np.random.default_rng(41)
for lvl, z in (("g", 5.4), ("u", 8.8)):                              # broken floor edges framing the hole above
    for k in range(26):
        side = k % 4; L = rb.uniform(0.6, 2.4); w = 0.25
        a = rb.uniform(-PIT, PIT)
        if side == 0:
            o = K.box(f"H_br{lvl}{k}", (w, L, 0.08), (HX + a, -PIT - 0.4 + L / 2, z), M["planks"], 2)
        elif side == 1:
            o = K.box(f"H_br{lvl}{k}", (w, L, 0.08), (HX + a, PIT + 0.4 - L / 2, z), M["planks"], 2)
        elif side == 2:
            o = K.box(f"H_br{lvl}{k}", (L, w, 0.08), (HX - PIT - 0.4 + L / 2, a, z), M["planks"], 2)
        else:
            o = K.box(f"H_br{lvl}{k}", (L, w, 0.08), (HX + PIT + 0.4 - L / 2, a, z), M["planks"], 2)
        o.rotation_euler = (rb.uniform(-0.25, 0.25), rb.uniform(-0.25, 0.25), rb.uniform(-0.1, 0.1))
    for k in range(4):
        b_ = beam(f"H_beam{lvl}{k}", rb.uniform(2, 3.5), 0.3, (HX - PIT + 1.2 if k % 2 else HX + PIT - 1.2, rb.uniform(-3, 3), z - 0.2))
        b_.rotation_euler = (0, rb.uniform(-0.5, 0.5), rb.uniform(-0.3, 0.3))
    tbox(f"H_ring{lvl}", (2 * PIT + 8, 2 * PIT + 8, 0.2), (HX, 0, z + 0.15), M["planks"], 0.5).scale = (1, 1, 1)
for sx in (-1, 1):                                                   # the walls go on up past both broken floors
    tbox(f"H_uwx{sx}", (0.6, 2 * PIT + 4, 8.0), (HX + sx * (PIT + 2.3), 0, 9.0), M["timber"], 0.5)
    tbox(f"H_uwy{sx}", (2 * PIT + 4, 0.6, 8.0), (HX, sx * (PIT + 2.3), 9.0), M["timber"], 0.5)
bpy.data.objects.remove(bpy.data.objects["H_ringg"], do_unlink=True); bpy.data.objects.remove(bpy.data.objects["H_ringu"], do_unlink=True)
for lvl, z in (("g", 5.5), ("u", 8.9)):                              # the floor that is left round the hole (a frame)
    for sx in (-1, 1):
        tbox(f"H_fx{lvl}{sx}", (2.0, 2 * PIT + 4.6, 0.2), (HX + sx * (PIT + 1.3), 0, z), M["planks"], 0.5)
        tbox(f"H_fy{lvl}{sx}", (2 * PIT + 4.6, 2.0, 0.2), (HX, sx * (PIT + 1.3), z), M["planks"], 0.5)
tbox("H_roof", (2 * PIT + 6, 2 * PIT + 6, 0.2), (HX, 0, 13.0), M["planks"], 0.5)
SHAFTS = [] and [cone(f"H_shaft{k}", 0.9, 0.6, 9.0, (HX + x, y, 0.0), mat_glow(f"shaftm{k}", "#FFF0C0", 0.03), seg=8) for k, (x, y) in enumerate(((-1.5, 1.0), (1.8, -0.8)))]
point((HX, 0, 7.5), 900, (1.0, 0.9, 0.75), 1.0); point((HX + 2, -2, 3.0), 150)
FLOATS = []
for i in range(12):                                               # v3b: fewer, bigger, readable pieces of debris
    x, y = rb.uniform(-3.5, 3.5), rb.uniform(-3.5, 3.5); k_ = (0, 1, 3, 4)[i % 4]
    if k_ == 0:
        o = K.uv_sphere(f"helm3{i}", 0.17, (HX + x, y, 0.02), col("#9A9CA4"), seg=8, rings=4); o.scale = (1, 1, 0.6)
    elif k_ == 1:
        o = K.box(f"board3{i}", (1.4, 0.24, 0.08), (HX + x, y, 0.05), M["planks"], 2); o.rotation_euler = (0.05, 0, rb.uniform(0, 3))
    elif k_ == 2:
        o = K.box(f"cape3{i}", (0.9, 0.7, 0.03), (HX + x, y, 0.04), col(("#B01C20", "#1C3A90", "#2E7A3A")[i % 3])); o.rotation_euler = (0.05, 0.05, rb.uniform(0, 3))
    elif k_ == 3:
        o = cone(f"hat3{i}", 0.22, 0.2, 0.03, (HX + x, y, 0.03), col(("#5A1E6A", "#1C3A90", "#5A3E26")[i % 3]), seg=8)
        cone(f"hat3c{i}", 0.12, 0.09, 0.12, (0, 0, 0.03), col(("#5A1E6A", "#1C3A90", "#5A3E26")[i % 3]), seg=8).parent = o
    elif k_ == 4:
        o, _ = cutout(os.path.join(REF, "boot_cut.png"), f"boot3{i}", 0.4, (HX + x, y, 0.05), rot=(0, 0, rb.uniform(0, 3)))
    else:
        o = K.box(f"straw3{i}", (0.5, 0.04, 0.03), (HX + x, y, 0.04), col("#D8B850")); o.rotation_euler = (0, 0, rb.uniform(0, 3))
    FLOATS.append((o, Vector(o.location)))
BUBBLES = [K.uv_sphere(f"bub3{i}", 0.1, (HX + rb.uniform(-3.5, 3.5), rb.uniform(-3.5, 3.5), 0.0), col("#8A7A40"), seg=7, rings=4) for i in range(7)]
RINGS = [cone(f"ring3{i}", 0.3, 0.3, 0.005, (0, 0, -50), col("#B8A060"), seg=10) for i in range(6)]
PIT_POS = [(-2.2, 1.2), (1.5, 2.0), (-0.5, -0.8), (2.4, -1.6), (-2.6, -2.2), (0.6, 0.9), (-1.2, 2.8), (2.8, 0.4)]

# ---------------------------------------------------------------- I. NIGHT STREET: a real 3D hall, two men on the window sill
wipe(300, 346, keep={LADDER, TORCH, cam})
IX = 320.0
sky_dome("sky_night", (IX, 0, -2), 56, "sky_night_px.png", vk=1.3)
rs = np.random.default_rng(51)
for k in range(60):
    a = rs.uniform(0.3, math.pi - 0.3); e = rs.uniform(0.15, 1.2)
    continue
    K.uv_sphere(f"star{k}", rs.uniform(0.08, 0.18), (IX + 52 * math.cos(a) * math.cos(e), 52 * math.sin(a) * math.cos(e), 52 * math.sin(e) - 10), col("#F0F0FF", True), seg=4, rings=3)
clouds_around("I", IX, 0, 10, 28, 44, 16, 30, 2.5, 5, night=True, arc=(0.2, math.pi - 0.2), seed=13)
tbox("I_street", (44, 24, 0.1), (IX, -6, -0.05), TM["cobble"], 0.4)
tbox("I_ground", (56, 80, 0.1), (IX, 0, -0.12), TM["cobble"], 0.1)
BW, BD, BH1, BH2 = 9.0, 7.0, 4.4, 4.2
I_WIN = (IX, 5.0, 1.6, 1.7)                                            # the window niche: centre x, sill z, w, h
tbox("I_lower", (BW, BD, BH1), (IX, BD / 2, BH1 / 2), TM["stone"], 0.45)
wall_x("I_upf", IX - BW / 2 - 0.2, IX + BW / 2 + 0.2, -0.35, BH1, BH1 + BH2, 0.3, TM["timber"], windows=[(IX, 5.0, 1.6, 1.7), (IX - 3.0, 5.2, 0.8, 1.1), (IX + 3.0, 5.2, 0.8, 1.1)], uv=0.5)
tbox("I_upper", (BW + 0.4, BD, BH2), (IX, BD / 2 + 0.2, BH1 + BH2 / 2), TM["timber"], 0.5)
prism_roof("I_roof", IX, BD / 2, BW + 0.4, BD + 0.4, BH1 + BH2, 3.6, TM["roof"])
tbox("I_niche", (1.6, 0.6, 1.7), (IX, -0.05, 5.0 + 0.85), col("#120E0C", True))      # dark room behind the window
for k, (x, zb, w, h) in enumerate(((IX - 3.0, 5.2, 0.8, 1.1), (IX + 3.0, 5.2, 0.8, 1.1))):
    tbox(f"I_win{k}", (w, 0.1, h), (x, -0.25, zb + h / 2), col("#D89040" if k else "#141018", True))
SILL_Z = 5.0
SILL = tbox("I_sill3", (2.0, 0.55, 0.14), (IX, -0.42, SILL_Z - 0.07), TM["stone"], 1.0)
JAMBS = [tbox(f"I_jamb{sx}", (0.16, 0.2, 1.75), (IX + sx * 0.82, -0.42, SILL_Z + 0.87), col("#2A1E16")) for sx in (-1, 1)]
tbox("I_lintel", (2.0, 0.24, 0.2), (IX, -0.42, SILL_Z + 1.8), col("#2A1E16"))
tbox("I_door", (1.3, 0.12, 2.4), (IX + 2.6, -0.05, 1.2), TM["planks"], 1.5)
for k, (x, z) in enumerate(((IX - 2.0, 2.6), (IX + 1.6, 2.6))):
    torch((x, -0.05, z), 0.0, 0.8); point((x, -0.6, z + 0.3), 240, (1.0, 0.6, 0.3), 0.3)
point((IX, -3.0, 3.0), 80, (0.6, 0.7, 1.0), 1.0)
for k, (x, y, w, d, h) in enumerate(((-9.5, 2.5, 8, 6, 8), (9.5, 2.5, 8, 6, 9), (-18, 4, 7, 6, 7), (18, 4, 8, 6, 8))):
    house(f"I_house{k}", IX + x, y, w, d, h, night=True, lit=0.6, seed=20 + k)
for k_, x in enumerate((-3.2, -3.9)):
    straw_bale((IX + x, -1.2 - 0.2 * k_, 0), 0.3 * k_)
PP.loft(os.path.join(REF, "barrel.jpg"), "I3_barrel1", height=0.9, sides=10, loc=(IX + 3.6, -0.8, 0))
PP.loft(os.path.join(REF, "barrel.jpg"), "I3_barrel2", height=0.9, sides=10, loc=(IX + 4.2, -0.6, 0))
CIT_TORCH, _ = cutout(os.path.join(REF, "torch_cut.png"), "cit_torch", 0.7, (0, 0, -50), tint=(0.9, 0.9, 1.0))
CIT_FLAME = flame((0, 0, -50), s=2.6)
CIT_LIGHT = point((0, 0, -50), 200, (1.0, 0.6, 0.3), 0.3)

# ---------------------------------------------------------------- J. BATHROOM that reads: no mirror+picture combo, 3D toilet
for nm in ("J_mirror", "J_mirf", "egg_goose", "eggf_goose", "wc", "wc_body", "wc_seat", "J_tap"):
    if nm in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects[nm], do_unlink=True)
WHITE = col("#F4F4F2"); WHITE2 = col("#E2E4E6")
WCX, WCY = JX, 0.95
cone("wc_bowl", 0.17, 0.22, 0.38, (WCX, WCY - 0.05, 0.0), WHITE, seg=12).scale = (1.0, 1.25, 1.0)
cone("wc_bowl2", 0.2, 0.2, 0.03, (WCX, WCY - 0.05, 0.38), WHITE2, seg=12).scale = (1.0, 1.25, 1.0)
cone("wc_hole", 0.13, 0.13, 0.005, (WCX, WCY - 0.07, 0.41), col("#9AB8C8", True), seg=12).scale = (1.0, 1.3, 1.0)
cone("wc_seatring", 0.215, 0.215, 0.03, (WCX, WCY - 0.06, 0.41), WHITE, seg=12).scale = (1.0, 1.28, 1.0)
tbox("wc_tank", (0.44, 0.2, 0.42), (WCX, WCY + 0.28, 0.62), WHITE, 1)
tbox("wc_tanklid", (0.47, 0.22, 0.04), (WCX, WCY + 0.28, 0.85), WHITE2, 1)
tbox("wc_flush", (0.06, 0.02, 0.03), (WCX - 0.15, WCY + 0.17, 0.78), col("#C0C4C8"))
lidj = tbox("wc_lid", (0.42, 0.03, 0.5), (WCX, WCY + 0.16, 0.66), WHITE, 1); lidj.rotation_euler = (math.radians(-12), 0, 0)
K.box("J_faucet", (0.04, 0.16, 0.04), (JX + 1.1, 1.22, 1.0), col("#C0C4C8")); K.box("J_faucet2", (0.04, 0.04, 0.12), (JX + 1.1, 1.3, 0.95), col("#C0C4C8"))
K.box("J_cabinet2", (0.6, 0.18, 0.5), (JX + 1.1, 1.24, 1.75), col("#E8E0D0")); K.box("J_cabd2", (0.27, 0.02, 0.46), (JX + 0.96, 1.15, 1.75), col("#D8D0C0"))
K.box("J_window", (0.7, 0.04, 0.6), (JX - 0.5, 1.33, 2.1), col("#BFE0FF", True)); K.box("J_winf", (0.78, 0.03, 0.68), (JX - 0.5, 1.345, 2.1), WHITE)
point((JX, -0.6, 2.6), 200, (1.0, 0.97, 0.92), 0.4)
bpy.data.objects["egg_pikachu"].location = (JX + 1.74, -0.6, 1.7); bpy.data.objects["egg_pikachu"].rotation_euler = (math.pi / 2, 0, -math.pi / 2)
bpy.data.objects["eggf_pikachu"].location = (JX + 1.76, -0.6, 1.7); bpy.data.objects["eggf_pikachu"].rotation_euler = (0, 0, -math.pi / 2)

def _is_alive(o):
    try:
        o.name
        return True
    except ReferenceError:
        return False


# ---------------------------------------------------------------- Kaneda's hands (v3b): the purchased glove blocks are masked
# out and replaced by low-poly hands with fingers (palm, 4 two-segment curled fingers, thumb), riding the Hand bones
SKIN_K = K.mat_color("kaneda_skin", "#EBB48C")
SKIN_K2 = K.mat_color("kaneda_skin2", "#C88A66")


def hand_mesh(name, side):
    """Bone space of Hand.L/R (model units, +Y = along the bone to the fingertips)."""
    bm = bmesh.new()

    def bx(c, s_, rx=0.0, mat=0):
        g = bmesh.ops.create_cube(bm, size=1.0)
        for v in g["verts"]:
            p = Vector((v.co.x * s_[0], v.co.y * s_[1], v.co.z * s_[2]))
            p = Matrix.Rotation(rx, 3, "X") @ p
            v.co = p + Vector(c)
        for f in {f for v in g["verts"] for f in v.link_faces}:
            f.material_index = mat
    bx((0, 0.11, 0), (0.2, 0.22, 0.09))                                         # palm
    for k, x in enumerate((-0.075, -0.025, 0.025, 0.075)):                      # fingers, curled toward the palm
        L1, L2 = (0.11, 0.09) if k in (1, 2) else (0.095, 0.08)
        bx((x, 0.22 + L1 / 2 * 0.95, -0.012), (0.042, L1, 0.042), rx=math.radians(-18))
        bx((x, 0.22 + L1 * 0.9 + L2 / 2 * 0.8, -0.05), (0.038, L2, 0.038), rx=math.radians(-48), mat=1 if k % 2 else 0)
    bx((side * 0.115, 0.1, -0.02), (0.045, 0.13, 0.045), rx=math.radians(-25))   # thumb
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.materials.append(SKIN_K); me.materials.append(SKIN_K2)
    return K.link(bpy.data.objects.new(name, me))


_alive = set(o.as_pointer() for o in bpy.data.objects)
CLOUDS[:] = [c for c in CLOUDS if c[0].as_pointer() in _alive] if False else [c for c in CLOUDS if _is_alive(c[0])]
K_HANDS = {}                                                          # v4 (user): back to the original glove blocks


def hands_follow():
    return
    bpy.context.view_layer.update()
    for s_, o in K_HANDS.items():
        o.matrix_world = HERO.arm.matrix_world @ HERO.arm.pose.bones["Hand." + s_].matrix
        o.hide_render = HERO.arm.hide_render


# ---------------------------------------------------------------- pose helpers


def sit_hombre(r, loc, yaw, seat_z):
    """Hombre seated: thighs level, shins down; root lowered so the thighs rest ON the seat (contact)."""
    for sd in "LR":
        hpose(r, "thigh_" + sd, (-90, 0, 0)); hpose(r, "calf_" + sd, (90, 0, 0))
    pput(r, (loc[0], loc[1], 0), yaw)
    bpy.context.view_layer.update()
    lo = min((K.hpart(r, "thigh_" + sd).matrix_world @ v.co).z for sd in "LR" for v in K.hpart(r, "thigh_" + sd).data.vertices)
    r.location.z += seat_z - lo


def hand_low(r, s):
    bpy.context.view_layer.update()
    h = K.hpart(r, "hand_" + s); return min((o.matrix_world @ v.co).z for o in [h] + list(h.children) for v in o.data.vertices)


def hands_on(r, z_top, sides="LR", fwd=-20):
    """Lift each arm (sideways, forward bias) until the lowest hand vertex rests on z_top: palms ON the surface."""
    for s in sides:
        sg = 1 if s == "L" else -1
        for a in range(0, 80, 2):
            hpose(r, "upperarm_" + s, (fwd, 0, sg * a)); hpose(r, "forearm_" + s, (-10, 0, 0))
            if hand_low(r, s) >= z_top - 0.005:
                break


def kaneda_hand_to(k, s, target, steps=4):
    """Aim Kaneda's upper arm + forearm at a world point, then slide the whole body so the fingertip touches it."""
    for _ in range(steps):
        bpy.context.view_layer.update()
        mw = k.arm.matrix_world; inv = mw.inverted()
        sh = mw @ k.arm.pose.bones["Upperarm." + s].head
        d = (inv.to_3x3() @ (Vector(target) - sh)).normalized()
        k.aim("Upperarm." + s, d); k.aim("Forearm." + s, d); k.aim("Hand." + s, d)
    h = hand_world(k, s)
    return Vector(target) - h


def pit_anim3(t):
    for i, (o, p) in enumerate(FLOATS):
        o.location = p + Vector((0.08 * math.sin(t * 0.7 + i), 0.08 * math.cos(t * 0.6 + i), 0.015 * math.sin(t * 2 + i)))
    for i, b in enumerate(BUBBLES):
        ph = (t * 0.9 + i * 0.37) % 1.0
        s_ = 0.3 + 1.1 * ph if ph < 0.85 else 0.0
        b.scale = (s_, s_, s_ * 0.6)
    for i, rg in enumerate(RINGS[:len(BUBBLES)]):
        ph = (t * 0.6 + i * 0.29) % 1.0; b = BUBBLES[i]
        rg.location = (b.location.x, b.location.y, 0.03); rg.scale = (0.3 + 2.5 * ph, 0.3 + 2.5 * ph, 1)
    a = t * 4.0
    FLY.location = (HX + 1.2 * math.cos(a), 0.8 * math.sin(a), 1.2 + 0.2 * math.sin(a * 2.3)); FLY.scale = (1.4, 1.4, 1.4)


def pit_people(t, n=8, skip=()):
    """Nobles struggling in the muck: chest-deep, arms flailing, every face different."""
    spots = []
    for i in range(n):
        x, y = PIT_POS[i]
        spots.append((HX + x, y, math.radians(40 * i + 15 * math.sin(t + i)), -0.95 + 0.06 * math.sin(t * 3 + i)))
    place_folk(spots, t, talk=False)
    for i in range(n):
        r = FOLK[i]
        for s, sg in (("R", -1), ("L", 1)):
            hpose(r, "upperarm_" + s, (-150 + 40 * math.sin(t * 5 + i + (0 if s == "R" else 1.5)), 0, sg * (15 + 10 * math.sin(t * 4 + i))))
            hpose(r, "forearm_" + s, (-30, 0, 0))
        hpose(r, "head", (-15, 0, 10 * math.sin(t * 3 + i)))


# ---------------------------------------------------------------- shots v3


def s01(t, d):   # "Sixty nobles died in one afternoon because of a toilet." — the privy in the crammed hall, "60" drops in
    place_folk(HALL_POS[:30], t)
    u = K.ease(t / d)
    tt = wt(0, "toilet") - 0.1
    if t < tt:                                                          # high over the packed hall, the privy in the corner
        cam.data.lens = 18
        lk((EX - 2.6 + 0.8 * u, 1.9 - 0.3 * u, 3.3 - 0.2 * u), (EX + 2.4, -1.8, 0.7), t, math.radians(-6 + 5 * u), a=0.8)
        letters_on_screen(T60, t, 0.05, t_out=wt(0, "because") - 0.1, y=0.52, width=0.55, drop=0.6)
    else:                                                               # whip back onto the seat: THE toilet
        v = K.ease((t - tt) / 0.35); cam.data.lens = 24 + 8 * v
        lk((PRX - 1.5, PRY + 0.05, 1.35), (PRX, PRY + 0.15, 0.5), t, math.radians(-8), a=0.6)


def s03(t, d):   # "The Archbishop of Mainz and the Landgrave of Thuringia were feuding over land." — the feud across a table
    head_swap(LAND, "landgrave_angry")
    pput(ARCH, (CX3 - 1.42, 0.4, 0), math.radians(90 + 4 * math.sin(t * 2)), math.radians(6))
    pput(LAND, (CX3 + 1.42, 0.4, 0), math.radians(-90 + 4 * math.sin(t * 2.3)), math.radians(8))
    tf = wt(2, "feuding") - 0.1
    if t < tf:                                                          # arguing: one hand flat on the table, one pointing / fist
        hands_on(ARCH, C_TABLE_Z, "L", fwd=-38); hands_on(LAND, C_TABLE_Z, "R", fwd=-38)
        hpose(ARCH, "upperarm_R", (-80 - 8 * math.sin(t * 6), 0, -12)); hpose(ARCH, "forearm_R", (-10, 0, 0))       # jabbing finger
        hpose(LAND, "upperarm_L", (-120 + 25 * abs(math.sin(t * 5)), 0, 10)); hpose(LAND, "forearm_L", (-70, 0, 0))   # fist up
        DEED.location = (CX3, 0.35, C_TABLE_Z + 0.006); DEED.rotation_euler = (0, 0, 0.05); DEED.scale = (1, 1, 1)
    else:                                                               # both grab the land deed and pull
        for r, sides in ((ARCH, "LR"), (LAND, "LR")):
            for s in sides:
                hpose(r, "upperarm_" + s, (-62, 0, 0)); hpose(r, "forearm_" + s, (-18, 0, 0))
        bpy.context.view_layer.update()
        ha = (hhand(ARCH, "R") + hhand(ARCH, "L")) / 2; hl = (hhand(LAND, "R") + hhand(LAND, "L")) / 2
        mid = (ha + hl) / 2; span = (hl - ha).length
        DEED.location = mid + Vector((0.02 * math.sin(t * 9), 0, -0.03)); DEED.scale = (span / 1.0, 0.7, 1)
        DEED.rotation_euler = (0, 0, math.atan2(hl.y - ha.y, hl.x - ha.x))
    u = K.ease(t / d)
    tl = wt(2, "landgrave") - 0.1
    if t < tl:                                                          # over the landgrave's shoulder onto the archbishop
        cam.data.lens = 26
        lk((CX3 + 2.4, 1.3, 1.75), (CX3 - 1.62, 0.4, 1.45), t, math.radians(-5), a=0.7)
    elif t < tf:                                                        # reverse: over the archbishop onto the furious landgrave
        cam.data.lens = 26
        lk((CX3 - 2.4, -0.4, 1.75), (CX3 + 1.62, 0.4, 1.5), t, math.radians(5), a=0.7)
    else:                                                               # wide: the tug-of-war over the deed, the whole chamber
        cam.data.lens = 18
        lk((CX3 + 0.6 * math.sin(t), -3.4 + 0.4 * u, 2.0), (CX3, 0.6, 1.1), t, math.radians(-4 + 6 * u), a=0.8)


_HEADS = {}


def head_swap(r, name):
    """Expression change = another Flow photo of the same person (archbishop scared, landgrave furious)."""
    nodes = _HEADS.setdefault(r.name, [n for o in r.children_recursive for sl in getattr(o, "material_slots", [])
                                       for n in (sl.material.node_tree.nodes if sl.material and sl.material.use_nodes else [])
                                       if n.type == "TEX_IMAGE" and n.image and "head" in n.image.name])
    for n in nodes:
        n.image = img(os.path.join(PEOPLE, f"{name}_head_128.png"))


def s04(t, d):   # "So the emperor sent his son Henry, eighteen, to make them shake hands." — throne room (closed), crown, horse
    v2_s04(t, d)
    if t >= wt(3, "make") - 0.1:                                       # horse: sky + clouds + hills now behind him
        tm = wt(3, "make") - 0.1
        u = K.ease((t - tm) / max(d - tm, 0.1)); cam.data.lens = 26
        lk((FX - 1.4 + 1.0 * u, -3.4 + 1.2 * u, 1.5), (FX + 0.1, 0, 1.5), t, math.radians(4 - 6 * u), a=1.6)


def s05(t, d):   # "Dozens of counts and knights crammed into one room upstairs." — the crammed hall, Henry in his niche
    place_folk(HALL_POS[:34], t)
    sit(HERO, (EX, NY + 0.36, 0), 0.0); arms(HERO, up=(0.25, -0.45, -1), fore=(0.05, -1, -0.15))
    HERO.face("stern")
    u = K.ease(t / d); cam.data.lens = 18
    tr = wt(4, "room") - 0.1
    if t < tr:                                                          # over the heads, pushing through the crowd
        lk((EX + 1.6 - 1.2 * u, -3.0 + 0.6 * u, 2.35 - 0.2 * u), (EX - 0.2, 1.0, 1.3), t, math.radians(-6 + 5 * u), a=1.2)
    else:
        face_cam(HERO, 1.25 - 0.2 * K.ease((t - tr) / 0.8), 26, dz=0.08, orbit=0.35, roll=math.radians(4), t=t)


def s06(t, d):   # "Nobody checked the beams. They were rotten." — the ground floor: look up at the rotten, sagging beams
    tr = wt(5, "rotten") - 0.15
    sag = 0.04 + 0.03 * math.sin(t * 7) * 0.3
    for i, b in enumerate(R_BEAMS):                                    # the floor above sags (people stamping above)
        b.location.z = 3.24 - sag * (1 if i in (1, 2, 3) else 0.4); b.rotation_euler = (0.01 * math.sin(t * 5 + i), 0, 0)
    R_BOARDS.location.z = 3.45 - sag * 0.8
    for i, ds in enumerate(DUST):                                      # dust trickling from the gaps
        ph = (t * 0.7 + i * 0.137) % 1.0
        ds.location = (RX - 3.2 + 1.6 * (i % 5) + 0.15 * math.sin(i), -2.5 + 0.22 * i, 3.05 - 3.0 * ph)
    for i, w in enumerate(WORM):                                       # a woodworm out of a bore hole on the cracking beam
        w.location = (R_CRACK_BEAM.location.x + 0.16, 0.6 - 0.025 * i - 0.04 * min(t, 1.5), 3.07 - 0.02 * max(0, math.sin(t * 9 - i)))
        w.scale = (0.4, 0.4, 0.4)
    WORM_HEAD.location = (R_CRACK_BEAM.location.x + 0.16, 0.62 - 0.04 * min(t, 1.5), 3.06); WORM_HEAD.scale = (0.4, 0.4, 0.4)
    WORM_HEAD.rotation_euler = (math.pi, 0, 0)
    u = K.ease(t / d)
    if t < tr:                                                          # tilt up from the barrels to the ceiling
        cam.data.lens = 18
        lk((RX - 1.2 + 0.5 * u, -2.6 + 0.6 * u, 1.3 + 0.3 * u), (RX + 0.3, 0.6, 3.1 - 0.8 * (1 - u)), t, math.radians(-5 + 4 * u), a=0.8)
    else:                                                               # CRACK: punch on the middle beam, splinters, it drops
        k = K.ease((t - tr) / 0.25)
        R_CRACK_BEAM.rotation_euler = (math.radians(-6 * k), 0, 0); R_CRACK_BEAM.location.z -= 0.08 * k
        CRACK.location = (R_CRACK_BEAM.location.x, 0.2, 3.075); CRACK.scale = (1.5, max(k, 0.01) * 1.6, 1); CRACK.rotation_euler = (0, 0, 0.1)
        for i, sp in enumerate(SPLINTERS):
            ph = max(0.0, t - tr)
            sp.location = (R_CRACK_BEAM.location.x + 0.12 * math.cos(i * 1.1), 0.2 + 0.1 * math.sin(i * 1.7), 3.0 - 2.5 * ph * ph - 0.2 * ph)
            sp.rotation_euler = (ph * (3 + i), ph * 2, i)
        letters_on_screen(ROTTEN, t, tr - 0.1, y=0.5, width=0.8, tilt=math.radians(-10))
        cam.data.lens = 24 + 8 * K.ease((t - tr) / 0.3)
        lk((R_CRACK_BEAM.location.x - 1.0, -0.7, 2.15), (R_CRACK_BEAM.location.x, 0.35, 3.05), t, math.radians(-8), a=1.4)


def g_folk(t, tg, tb):
    """People on the cut-open floors; they tumble and fall into the cesspit when their floor goes."""
    spots = []
    for i in range(G_UP_FOLK + G_GR_FOLK):
        up = i < G_UP_FOLK
        j = i if up else i - G_UP_FOLK
        n = G_UP_FOLK if up else G_GR_FOLK
        x = GX - 3.3 + 6.6 * (j + 0.5) / n; y = 2.2 + 1.6 * ((j * 7) % 3) / 2
        z0 = GZ_UP if up else 0.0
        t0 = (tg if up else tb) + 0.04 * (j % 5)
        dt = max(0.0, t - t0)
        floor_z = (0.0 if t < tb + 0.1 else -2.6) if up else -2.6
        z = max(z0 - 5.0 * dt * dt, floor_z + (0.05 * (j % 3)))
        if floor_z < -2 and z <= -2.55:
            z = -2.55 + 0.05 * (j % 3)
        spots.append((x + (0.2 * dt if x > GX else -0.2 * dt) * (1 if dt < 0.5 else 0.5), y, math.radians(30 * j), z))
    place_folk(spots, t, talk=t < tg)
    for i in range(G_UP_FOLK + G_GR_FOLK):
        r = FOLK[i]; up = i < G_UP_FOLK; t0 = (tg if up else tb) + 0.04 * (i % 5)
        dt = max(0.0, t - t0)
        if dt > 0:
            r.rotation_euler = (min(dt * 4, 1.4) * (1 if i % 2 else -1), min(dt * 3, 0.8) * (-1 if i % 3 else 1), r.rotation_euler.z)
            for s in "RL":
                hpose(r, "upperarm_" + s, (-160, 0, 20 if s == "L" else -20))


def s07(t, d):   # "The floor gave way, then the floor below it." — the whole building cut open, both floors fold, Henry shocked
    tg = wt(6, "gave") - 0.1; tb = wt(6, "below") - 0.15
    for (lvl, side), piv in SLABS.items():
        t0 = tg if lvl == "up" else tb
        piv.rotation_euler = (0, side * math.radians(75) * K.ease((t - t0) / 0.35), 0)
    g_folk(t, tg, tb)
    ts = wt(6, "it") + 0.05
    if t < ts:
        u = K.ease(t / ts); cam.data.lens = 22
        cam.data.lens = 20
        lk((GX + 2.5 - 2.0 * u, -8.6 + 1.0 * u, 3.0 - 0.4 * u), (GX, 3.0, 1.3 - 0.4 * u), t, math.radians(-3 + 3 * u), a=0.7)
    else:                                                               # cut: Henry, shocked, in his niche
        hide_folk()
        E_FLOOR.hide_render = True
        sit(HERO, (EX, NY + 0.36, 0), 0.0); arms(HERO, up=(0.6, -0.2, -0.4), fore=(0.3, -1, 0.3))
        HERO.face("shocked")
        face_cam(HERO, 0.85 * punch(t, ts, 1.3, 0.25), 30, dz=0.0, orbit=-0.35, roll=math.radians(-8), t=t)


def s08(t, d):   # "Under all that was the latrine pit." — down through both broken floors into the cellar pit
    pit_anim3(t); pit_people(t, 6)
    u = K.ease(t / d); cam.data.lens = 22
    lk((HX + 0.6 - 0.4 * u, -1.2 + 0.6 * u, 12.0 - 7.5 * u), (HX + 0.1, 0.3, 0), t, math.radians(25 * u), a=0.5)


def s09(t, d):   # "About sixty men died down there, crushed or choking in the sewage." — across the pit, people in the muck, tally
    pit_anim3(t + 2.0); pit_people(t + 2.0, 8)
    u = K.ease(t / d); cam.data.lens = 20
    lk((HX - 2.6 + 0.8 * u, -3.0 + 0.4 * u, 1.6 + 1.6 * u), (HX + 0.2, 0.8, 0.3), t, math.radians(-8 + 6 * u), a=0.7)
    t0 = wt(8, "about") - 0.05; t1 = wt(8, "men")
    n = int(min(max((t - t0) / max(t1 - t0 + 0.6, 0.1), 0), 1) * 20) * 3
    key = "final" if t > t1 + 0.7 else n
    TALLY.data.materials[0].node_tree.nodes["Image Texture"].image = TALLY_IMGS[key]
    bpy.context.view_layer.update()
    hw, hh = cam_frame(1.0)
    m = cam.matrix_world.normalized().to_3x3().to_4x4(); m.translation = cam.matrix_world @ Vector((0.55 * hw, -0.62 * hh, -1.0))
    TALLY.matrix_world = m @ Matrix.Rotation(math.radians(-6), 4, "Z") @ Matrix.Diagonal((0.55, 0.55, 1, 1))


def s10(t, d):   # "The landgrave fell in too. He lived." — the Landgrave hauls himself onto the cellar steps, alive
    pit_anim3(t + 4.0); pit_people(t + 4.0, 5)
    land_muck(True); FLY.location = (0, 0, -50)
    k = K.ease((t - 0.1) / 0.6)
    LAND.location = (HX - 0.45, -PIT + 0.42, -1.05 + 0.55 * k); LAND.rotation_euler = (math.radians(14 * k), 0, math.radians(90))
    for sd, sg in (("R", 1), ("L", -1)):
        hpose(LAND, "upperarm_" + sd, (-72, 0, -sg * 6)); hpose(LAND, "forearm_" + sd, (-12, 0, 0))
    hpose(LAND, "head", (-6, 0, 0))
    bpy.context.view_layer.update()
    hz = min(hand_low(LAND, s) for s in "RL")
    LAND.location.z += (H_STEPS[1].location.z + 0.15) - hz                     # palms flat on the step in front of him
    sh = K.hpart(LAND, "torso").matrix_world.translation
    for i, dr in enumerate(DRIPS):
        ph = ((t * 1.6 + i * 0.29) % 1.0)
        dr.location = sh + Vector((0.2 * math.cos(i * 1.7), -0.05 + 0.1 * math.sin(i * 1.3), 0.3 - 0.7 * ph)); dr.scale = (1.6, 1.6, 1.6)
    c = sh + Vector((0, 0, 0.5))
    cam.data.lens = 26
    if t < wt(9, "lived") - 0.15:
        lk(c + Vector((2.0, 1.4, 0.7)), c + Vector((0, 0, -0.1)), t, math.radians(-6), a=0.8)
    else:
        lk(c + Vector((1.1, 0.5, 0.3)), c + Vector((0, 0, 0.05)), t, math.radians(5), a=0.5)
    letters_on_screen(NAME, t, 0.35, y=0.58, width=1.5, depth=1.0, tilt=math.radians(-6))


def s11(t, d):   # "Henry was sitting in a stone window niche, so he just hung on." — ONE readable take: he clings in the niche
    E_FLOOR.hide_render = True; hide_folk()
    for r in (ARCH, LAND):
        show(r, False)
    # sideways on the stone bench, back to the niche wall, legs along the bench; left hand locked round a window bar,
    # right hand gripping the bench edge over the drop
    place(HERO, (EX - 0.5, NY + 0.27, 0), math.pi / 2, drop=0.27)
    legs(HERO, 0.05, -2.05, 2.25)
    S = HERO.arm.matrix_world @ HERO.arm.pose.bones["Upperarm.L"].head
    L = 0.55; dy = NY + 0.70 - S.y; dz = 0.12; dx = math.sqrt(max(L * L - dy * dy - dz * dz, 0.01))
    kaneda_hand_to(HERO, "L", S + Vector((dx, dy, dz)))
    bar = bpy.data.objects["bar1"]; h = hand_world(HERO, "L"); bar.location.x = h.x       # the bar he grips sits in his fist
    SR = HERO.arm.matrix_world @ HERO.arm.pose.bones["Upperarm.R"].head
    kaneda_hand_to(HERO, "R", SR + Vector((0.18, -0.08, -0.6)))
    HERO.face("nervous" if t < wt(10, "hung") else "scream")
    HERO.turn_head(math.radians(-25 * K.ease((t - 1.0) / 0.6)), math.radians(25 * K.ease((t - 1.0) / 0.6)))     # looks down at the drop
    u = K.ease(t / d); cam.data.lens = 22
    ang = -0.9 + 1.3 * u
    c = Vector((EX - 0.2, NY + 0.3, 0.9))
    lk(c + Vector((2.6 * math.sin(ang), -2.6 * math.cos(ang), 0.5 - 0.6 * u)), c + Vector((0, 0, -0.2)), t, math.radians(-6 + 8 * u), a=0.8)


def s12(t, d):   # "The archbishop hung on next to him, until someone found a ladder." — night street, both on the sill, the ladder
    night(True)
    head_swap(ARCH, "archbishop_scared")
    # Henry on the sill (right), legs dangling outside, left hand on the jamb, right hand on the sill
    sit(HERO, (IX + 0.35, -0.55, SILL_Z - 0.5), 0.0)
    S = HERO.arm.matrix_world @ HERO.arm.pose.bones["Upperarm.L"].head
    dx = IX + 0.72 - S.x; dz = math.sqrt(max(0.55 ** 2 - dx * dx - 0.01, 0.01))
    kaneda_hand_to(HERO, "L", S + Vector((dx, 0.1, dz)))                    # left hand up round the window jamb
    SR = HERO.arm.matrix_world @ HERO.arm.pose.bones["Upperarm.R"].head
    kaneda_hand_to(HERO, "R", SR + Vector((-0.1, 0.05, -0.6)))             # right hand down on the sill
    HERO.face("skeptic" if t > wt(11, "until") else "nervous")
    show(ARCH, True)
    sit_hombre(ARCH, (IX - 0.38, -0.5), 0.0, SILL_Z)
    hands_on(ARCH, SILL_Z, "LR", fwd=-10)
    hpose(ARCH, "head", (12, 0, 10 * math.sin(t * 6)))
    tl = wt(11, "someone") - 0.2
    show(PEAS, t > tl - 0.3)
    run = K.ease((t - tl) / 1.4)
    px = IX + 7.5 - 5.5 * run
    pput(PEAS, (px, -3.0, 0.03 * abs(math.sin(t * 12))), math.radians(90))
    hpose(PEAS, "upperarm_R", (-165, 0, 0)); hpose(PEAS, "forearm_R", (-10, 0, 0))
    for sd, sg in (("L", 1), ("R", -1)):
        hpose(PEAS, "thigh_" + sd, (-28 * sg * math.sin(t * 12), 0, 0)); hpose(PEAS, "calf_" + sd, (20 + 20 * sg * math.sin(t * 12), 0, 0))
    bpy.context.view_layer.update()
    hp = K.hpart(PEAS, "hand_R"); hv = [o.matrix_world @ v.co for o in [hp] + list(hp.children) for v in o.data.vertices]
    h = Vector((sum(p.x for p in hv) / len(hv), sum(p.y for p in hv) / len(hv), max(p.z for p in hv)))
    LADDER.rotation_euler = (math.pi / 2, math.pi / 2 - 0.06, 0)
    LADDER.location = h + Vector((1.8, 0.0, LAD_W / 2 + 0.005))
    for i, (r, x, y, yw) in enumerate(((CITIZ[0], IX - 2.3, -3.2, 160), (CITIZ[1], IX - 1.2, -3.8, 175))):
        show(r, True); pput(r, (x, y, 0), math.radians(yw))
        hpose(r, "head", (-28, 0, 0))                                          # looking up at the window
    hpose(CITIZ[1], "upperarm_R", (-150, 0, -10))                             # the old watchman points up
    bpy.context.view_layer.update()
    hpose(CITIZ[0], "upperarm_R", (-40, 0, 0)); hpose(CITIZ[0], "forearm_R", (-60, 0, 0))
    ht = hhand(CITIZ[0], "R")
    CIT_TORCH.location = ht + Vector((0, -0.02, 0.12)); CIT_TORCH.rotation_euler = (math.pi / 2, 0, 0)
    CIT_FLAME.location = ht + Vector((0, -0.05, 0.42)); CIT_LIGHT.location = ht + Vector((0, -0.3, 0.6))
    TORCH.location = (0, 0, -50)
    u = K.ease(t / d)
    if t < wt(11, "until") + 0.1:                                             # up at the two of them on the sill
        cam.data.lens = 30 * (1 + 0.2 * u)
        lk((IX + 0.9 * math.sin(-0.5 + 0.9 * u), -4.2 + 0.6 * u, 2.2 + 0.4 * u), (IX, -0.45, SILL_Z + 0.2), t, math.radians(-6 + 8 * u), a=1.2)
    elif t < tl + 0.2:                                                        # Henry's skeptic look
        face_cam(HERO, 0.95, 32, dz=0.0, orbit=0.3, roll=math.radians(6), t=t)
    else:                                                                     # the street: the peasant arrives with a ladder far too long
        cam.data.lens = 22                                                     # close on the peasant: the ladder runs out of frame
        v = K.ease((t - tl - 0.2) / max(d - tl - 0.2, 0.1))
        lk((px - 1.2 - 0.4 * v, -6.2 + 0.4 * v, 1.3), (px + 0.6, -3.0, 2.0), t, math.radians(-6 + 4 * v), a=1.0)


def s13(t, d):   # "So if your bathroom floor ever creaks, remember:" — the bathroom reads: toilet, sink, tiles, towel; a tile creaks
    HERO.faces_dir = FACES; CROWN.hide_render = True
    sit(HERO, (WCX, WCY - 0.12, 0.0), 0.0)
    arms(HERO, up=(0.25, -0.45, -1), fore=(0.05, -1, -0.15))
    tc = wt(12, "creaks") - 0.2
    k = K.ease((t - tc) / 0.15) * (1 - K.ease((t - tc - 0.25) / 0.3))
    CREAK_TILE.location.z = -0.03 + 0.012 * k; CREAK_TILE.rotation_euler = (math.radians(2.5 * k), 0, 0)
    if t > tc:
        CREAK_CRACK.location = (JX + 0.25, -1.35, 0.002); CREAK_CRACK.rotation_euler = (0, 0, 0.6)
    down = K.ease((t - tc - 0.1) / 1.2)
    HERO.turn_head(0, math.radians(32 * down))
    HERO.face("nervous" if t > tc + 0.4 else "blank")
    u = K.ease(t / d)
    if t < tc + 0.3:                                                         # wide, drifting + dutch: the whole bathroom
        cam.data.lens = 19
        lk((JX + 0.9 - 1.1 * u, -2.3 + 0.5 * u, 1.55 - 0.15 * u), (JX + 0.1, 0.7, 0.85), t, math.radians(-7 + 9 * u), a=1.1)
    else:
        face_cam(HERO, 0.95 - 0.15 * K.ease((t - tc - 0.3) / 1.2), 30, dz=0.1, orbit=0.25, roll=math.radians(-6), t=t)


v2_s04 = SHOTS[3]
SHOTS = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13]
CAST = {s03: [ARCH, LAND], s04: [BARB], s10: [LAND], s12: [ARCH, PEAS] + CITIZ}
HERO_IN = {s04, s05, s07, s11, s12, s13}
_v2_apply = apply


def apply(frame):
    for r in FOLK:
        show(r, False)
    for r in CLONES:
        pose_reset(r); r.rotation_euler = (0, 0, 0)
    for o in [CIT_TORCH, CIT_FLAME, CIT_LIGHT, DEED] + DUST + SPLINTERS + RINGS:
        park(o)
    ROTTEN.hide()
    DEED.scale = (1, 1, 1)
    for o in WORM + [WORM_HEAD]:
        o.scale = (1, 1, 1)
    for i, b in enumerate(R_BEAMS):
        b.location.z = 3.24; b.rotation_euler = (0, 0, 0)
    head_swap(ARCH, "archbishop"); head_swap(LAND, "landgrave")
    bpy.data.objects["bar1"].location.x = EX - 0.6 + 0.3
    for o, base, sp in CLOUDS:                                           # clouds drift slowly
        o.location = base + Vector((sp * frame / FPS, 0, 0))
    _v2_apply(frame)
    hands_follow()
    K.ps1_snap_update(cam)
