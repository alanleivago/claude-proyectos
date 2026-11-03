"""PS1 tropical jungle set (Lubang Island) for the LowPolyShorts kit — Blender 5.2 EEVEE, headless.
    import lpskit as K; import jungle as J
    K.reset(); set = J.jungle((0, 0, 0), size=(14, 14), seed=0); ...; K.ps1_snap(cam, grid_h=180)
Technique (fuentes/blender-bosques/ultimate-free-ps1-style-forest-level-assets.md): Closest on colour and alpha,
foliage as alpha-CLIP cards (alpha > 0.5 -> hard cutout, DITHERED render method), 3 subdivided ground planes with relief
and different seamless textures poking through each other, duplicates varied in scale / rotation / tint.
All textures are pixel art drawn here with numpy (64-128 px). Depth haze = a cheap per-material distance fog (the PS1
vertex-fog look) shared by every jungle material through one node group; tune it with J.fog(...)."""
import math

import bmesh
import bpy
import numpy as np

import lpskit as K

TAU = math.pi * 2


# ---------------------------------------------------------------- pixel-art helpers (numpy)

def _c(h):
    return np.array(K.srgb_u8(h), float)


def _pal(v, cols):
    """v in 0..1 -> palette colours (posterised, the pixel-art look)."""
    cols = np.array([K.srgb_u8(c) for c in cols], float)
    return cols[np.clip((v * len(cols)).astype(int), 0, len(cols) - 1)]


def _pnoise(rng, h, w, cells):
    """Seamless (periodic) value noise, h x w, 0..1."""
    cy, cx = cells if isinstance(cells, tuple) else (cells, cells)
    g = rng.random((cy, cx))
    y = np.arange(h) * cy / h; x = np.arange(w) * cx / w
    y0 = np.floor(y).astype(int); x0 = np.floor(x).astype(int)
    fy = y - y0; fx = x - x0
    fy = fy * fy * (3 - 2 * fy); fx = fx * fx * (3 - 2 * fx)
    y1 = (y0 + 1) % cy; x1 = (x0 + 1) % cx
    a = g[y0][:, x0]; b = g[y0][:, x1]; c = g[y1][:, x0]; d = g[y1][:, x1]
    fx = fx[None, :]; fy = fy[:, None]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def _fbm(rng, h, w, base=4, oct=3):
    v = sum(_pnoise(rng, h, w, base * 2 ** i) * 0.5 ** i for i in range(oct))
    v = (v - v.min()) / (np.ptp(v) + 1e-9)
    return v


def _rgba(rgb, mask):
    a = np.where(mask, 255, 0)[..., None]
    return np.concatenate([np.clip(rgb, 0, 255), a], 2).astype(np.uint8)


def _outline(mask):
    """Pixels of mask that touch empty space (dark pixel-art outline)."""
    e = np.zeros_like(mask)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        e |= ~np.roll(np.roll(mask, dy, 0), dx, 1)
    return mask & e


def _card_uv(h, w):
    U = ((np.arange(w) + 0.5) / w)[None, :]                 # along the leaf (columns)
    V = ((np.arange(h) + 0.5) / h * 2 - 1)[:, None]         # across, -1..1 (rows)
    return U + 0 * V, V + 0 * U


def tex_mud(rng, px=64):
    v = _fbm(rng, px, px, 4)
    pud = _fbm(rng, px, px, 3) > 0.72
    col = _pal(v * 0.95, ["#23170E", "#30211A", "#3F2C1D", "#523A25", "#634829"])
    col[pud] = _c("#1A130D") + 6 * _pnoise(rng, px, px, 16)[pud][:, None]
    sp = rng.random((px, px)) > 0.975
    col[sp] = _c("#6E5638")
    return col


def tex_litter(rng, px=64):
    col = _pal(_fbm(rng, px, px, 4) * 0.6, ["#22170E", "#2E1F12", "#3A2814"])
    Y, X = np.mgrid[:px, :px].astype(float)
    leaf_cols = ["#5A3A1E", "#7A4E22", "#946A2A", "#6B5A24", "#43301A", "#A2782E", "#4C5A22"]
    for i in range(80):
        cx, cy = rng.uniform(0, px, 2); a = rng.uniform(2.5, 5); b = a * rng.uniform(0.35, 0.55); t = rng.uniform(0, math.pi)
        dx = (X - cx + px / 2) % px - px / 2; dy = (Y - cy + px / 2) % px - px / 2
        u = dx * math.cos(t) + dy * math.sin(t); w = -dx * math.sin(t) + dy * math.cos(t)
        m = (u / a) ** 2 + (w / b) ** 2 < 1
        c = _c(leaf_cols[rng.integers(len(leaf_cols))]) * rng.uniform(0.85, 1.1)
        col[m] = c
        col[m & (np.abs(w) < 0.5)] = c * 0.7                 # midrib
    return col


def tex_moss(rng, px=64):
    v = _fbm(rng, px, px, 4, 4)
    col = _pal(v, ["#143A1A", "#1E501E", "#2A6622", "#3B7C27", "#56942D"])
    sp = rng.random((px, px)) > 0.96
    col[sp] = _c("#7FB23A")
    return col


def tex_trunk(rng, px=32):
    """Palm trunk tile: rows = height. Leaf-scar rings every 8 px."""
    v = _pnoise(rng, px, px, (4, 16)) * 0.6 + rng.random((px, px)) * 0.4
    col = _pal(v, ["#3E2C1A", "#4E3822", "#5F452A", "#725433"])
    y = np.arange(px)[:, None] + np.zeros((1, px), int)
    sh = (np.sin(np.arange(px) / px * TAU * 2) > 0.3).astype(int)[None, :]
    r = (y + sh) % 8
    col[r == 0] = _c("#24180D"); col[r == 1] = _c("#2F2214")
    col[r == 7] = _c("#8A6C46")
    return col


def tex_bark(rng, h=32, w=64):
    """Fallen log bark: columns along the log, cracks along it, moss on top."""
    v = _pnoise(rng, h, w, (8, 4)) * 0.5 + rng.random((h, w)) * 0.3
    col = _pal(v / 0.8, ["#2A1C10", "#3D2A18", "#523920", "#694B2C"])
    cr = (_pnoise(rng, h, w, (16, 3)) > 0.62)
    col[cr] = _c("#1B120A")
    moss = _fbm(rng, h, w, 4) > 0.6
    col[moss] = _pal(_fbm(rng, h, w, 8)[moss], ["#1F4A1C", "#2E6424", "#4A822C"])
    return col


def tex_rock(rng, px=32):
    col = _pal(_fbm(rng, px, px, 4, 3), ["#33362F", "#474B41", "#5E6355", "#757A69"])
    moss = _fbm(rng, px, px, 3) > 0.58
    col[moss] = _pal(_fbm(rng, px, px, 8)[moss], ["#1F4A1C", "#2F6626", "#4C852E"])
    return col


def tex_frond(rng, h=64, w=128):
    U, V = _card_uv(h, w); A = np.abs(V)
    env = np.where(U > 0.1, 0.98 * np.sin(math.pi * np.clip((U - 0.06) / 0.94, 0, 1)) ** 0.5, 0)
    s = U * 17 - A * 1.6
    fr = s % 1; lid = np.floor(s).astype(int)
    rel = A / (env + 1e-6)
    leaf = (fr < 0.66 * (1 - 0.55 * rel)) & (rel < 1) & (A > 0.03)
    rach = (A < 0.07) & (U < 0.97)
    k = 0.30 + 0.45 * rel + 0.18 * ((lid * 7 + (V > 0)) % 3 == 0) - 0.12 * (fr > 0.45)
    col = _pal(np.clip(k, 0, 0.99), ["#0C381D", "#18592A", "#2B7E32", "#56A336", "#93C53D"])
    col[_outline(leaf) & ~rach] *= 0.65
    col[rach] = _pal(U[rach] * 0.99, ["#4E5A1E", "#66762A", "#7E8E34"])
    return _rgba(col, leaf | rach)


def tex_fern(rng, h=64, w=128):
    U, V = _card_uv(h, w); A = np.abs(V)
    env = 0.95 * (1 - U) ** 0.6 * np.clip(U * 6, 0, 1)
    s = U * 26 - A * 1.0
    fr = s % 1
    rel = A / (env + 1e-6)
    serr = ((A * 24).astype(int) % 2) * 0.1
    leaf = (fr + serr < 0.78 - 0.45 * rel) & (rel < 1)
    rach = (A < 0.06) & (U < 0.95)
    k = 0.25 + 0.5 * rel + 0.15 * (fr < 0.2) + 0.1 * (V > 0)
    col = _pal(np.clip(k, 0, 0.99), ["#0E4424", "#1C6A2E", "#33903A", "#64B744"])
    col[_outline(leaf) & ~rach] *= 0.7
    col[rach] = _c("#2D5420")
    return _rgba(col, leaf | rach)


def tex_banana(rng, h=64, w=128):
    U, V = _card_uv(h, w); A = np.abs(V)
    u0 = 0.2
    env = np.where(U > u0, 0.93 * np.sqrt(np.clip(1 - ((U - 0.6) / 0.4) ** 2, 0, 1)) * np.clip((1 - U) * 5, 0, 1) ** 0.5, 0)
    rel = A / (env + 1e-6)
    blade = (rel < 1) & (U > u0)
    s = U * 20 - A * 1.4; fr = s % 1; lid = np.floor(s).astype(int)
    for j in rng.choice(np.arange(5, 19), 5, replace=False):    # wind tears between veins
        side = rng.choice([-1, 1])
        blade &= ~((lid == j) & (fr < 0.14) & (A > rng.uniform(0.15, 0.45)) & (np.sign(V) == side))
    mid = (A < 0.06) & (U < 0.985)
    k = 0.42 + 0.3 * rel - 0.22 * (fr < 0.12) + 0.12 * (V > 0) - 0.1 * (U > 0.85)
    col = _pal(np.clip(k, 0, 0.99), ["#145A28", "#227C36", "#3A9C3E", "#6DBC46", "#A8D656"])
    col[_outline(blade) & ~mid] = _c("#0E4420")
    col[mid] = _pal(np.clip(U[mid] * 1.2, 0, 0.99), ["#7A9A36", "#B6CE62", "#CFE07A"])
    return _rgba(col, blade | mid)


def tex_monstera(rng, h=64, w=128):
    U, V = _card_uv(h, w); A = np.abs(V)
    u0 = 0.22
    env = np.where(U > u0, 0.97 * np.sqrt(np.clip(1 - ((U - 0.6) / 0.38) ** 2, 0, 1)) ** 0.7, 0)
    rel = A / (env + 1e-6)
    blade = (rel < 1) & (U > u0)
    s = U * 9 - A * 0.9; fr = s % 1
    blade &= ~((fr < 0.11) & (rel > 0.62))                     # slits from the edge
    blade &= ~((np.abs(fr - 0.55) < 0.07) & (A > 0.22) & (A < 0.42))   # holes
    mid = (A < 0.05) & (U < 0.95)
    k = 0.35 + 0.35 * rel + 0.15 * (V > 0) - 0.15 * (fr > 0.85)
    col = _pal(np.clip(k, 0, 0.99), ["#0A361C", "#125026", "#1C6A30", "#2E863A", "#4FA244"])
    col[_outline(blade) & ~mid] = _c("#06281A")
    col[mid] = _c("#5E8A34")
    return _rgba(col, blade | mid)


def tex_vine(rng, h=32, w=128):
    """Liana: columns = length (top -> bottom), wavy stem + alternate heart leaves."""
    U, V = _card_uv(h, w)
    ph = rng.uniform(0, TAU)
    yc = 0.18 * np.sin(U * TAU * 3 + ph)
    stem = np.abs(V - yc) < 0.1
    leaf = np.zeros_like(stem)
    Y, X = np.mgrid[:h, :w].astype(float)
    side = 1
    for x0 in range(6, w - 4, 9):
        side = -side
        yy = (0.18 * math.sin((x0 + 0.5) / w * TAU * 3 + ph) + 1) / 2 * h
        cx, cy = x0 + 2.5, yy + side * rng.uniform(6, 9)
        a, b = rng.uniform(2.6, 3.6), rng.uniform(4.5, 6.5)
        leaf |= ((X - cx) / a) ** 2 + ((Y - cy) / b) ** 2 < 1
    col = _pal(np.clip(_pnoise(rng, h, w, 8) * 0.6 + 0.3 * (V * side > 0), 0, .99), ["#17522A", "#2A7834", "#4E9E3A"])
    col[_outline(leaf)] = _c("#0E3A1E")
    col[stem] = _pal(_pnoise(rng, h, w, 16)[stem], ["#3E3A1A", "#57522A"])
    return _rgba(col, stem | leaf)


def tex_grass(rng, h=64, w=64):
    """Tall grass tuft: columns = height (root at u=0)."""
    U, V = _card_uv(h, w)
    m = np.zeros(U.shape, bool); kk = np.zeros(U.shape)
    for i in range(16):
        v0 = rng.uniform(-0.75, 0.75); ln = rng.uniform(-0.6, 0.6); ht = rng.uniform(0.45, 1.0); wd = rng.uniform(0.05, 0.09)
        b = (np.abs(V - (v0 + ln * U ** 2)) < wd * (1 - U / ht)) & (U < ht)
        kk[b] = (U / ht)[b] * 0.85 + rng.uniform(0, 0.15)
        m |= b
    col = _pal(np.clip(kk, 0, .99), ["#173F1E", "#2A6A2A", "#4F9432", "#8EC040", "#B8D65A"])
    return _rgba(col, m)


def tex_wall(rng, px=128, palette=("#123620", "#1A4A26", "#256030", "#357636", "#4E903C")):
    """Background jungle wall (rows top-first): solid undergrowth, layered leaves, palm crowns on top."""
    Y, X = np.mgrid[:px, :px].astype(float); Yn = 1 - Y / px; Xn = X / px
    edge = np.minimum(Xn, 1 - Xn)
    top = 0.42 + 0.12 * _pnoise(rng, 1, px, (1, 8))[0][None, :] - 0.5 * np.clip(0.18 - edge, 0, None) * 4
    m = Yn < top
    k = np.where(m, _pnoise(rng, px, px, 16) * 0.35, 0.0)
    def stamp(cx, cy, a, b, t, val):
        nonlocal m
        u = (X - cx) * math.cos(t) + (Y - cy) * math.sin(t); w = -(X - cx) * math.sin(t) + (Y - cy) * math.cos(t)
        s = (u / a) ** 2 + (w / b) ** 2 < 1
        k[s] = val + 0.12 * (w[s] > 0)
        m = m | s
    for i in range(70):                                      # broad leaves, back to front
        cy = px * (1 - rng.uniform(0.25, 0.7)); cx = rng.uniform(0.1, 0.9) * px
        stamp(cx, cy, rng.uniform(5, 14), rng.uniform(2, 5), rng.uniform(-1.2, 1.2) + math.pi / 2 * rng.choice([0, 1]),
              rng.uniform(0.15, 0.75))
    for i in range(rng.integers(2, 4)):                      # palm crowns
        cx = rng.uniform(0.2, 0.8) * px; cy = px * (1 - rng.uniform(0.72, 0.88))
        tr = np.abs(X - (cx + (Y - cy) * 0.08)) < 1.6
        tr &= (Y > cy)
        k[tr & ~m] = 0.05; m |= tr
        for f in range(9):
            ang = f / 9 * TAU + rng.uniform(-0.2, 0.2)
            L = rng.uniform(16, 26)
            for t in np.linspace(0.1, 1, 12):
                x = cx + math.cos(ang) * L * t; y = cy - math.sin(ang) * L * t * 0.5 + 18 * t * t
                stamp(x, y, 3.2 * (1 - t * 0.5), 1.3, ang + math.pi / 2, 0.3 + 0.5 * t)
    col = _pal(np.clip(k, 0, .99), list(palette))
    col[_outline(m)] *= 0.8
    m[-2:] = True; col[-2:] = _c(palette[0])                # bottom rows solid
    return _rgba(col, m)


# ---------------------------------------------------------------- materials

def _look_group():
    ng = bpy.data.node_groups.get("JungleLook")
    if ng:
        return ng
    ng = bpy.data.node_groups.new("JungleLook", "ShaderNodeTree")
    ng.interface.new_socket("Color", in_out="INPUT", socket_type="NodeSocketColor")
    ng.interface.new_socket("Color", in_out="OUTPUT", socket_type="NodeSocketColor")
    N, L = ng.nodes, ng.links
    gi, go = N.new("NodeGroupInput"), N.new("NodeGroupOutput")
    oi = N.new("ShaderNodeObjectInfo")
    def mix(blend, fac, a, b):
        m = N.new("ShaderNodeMix"); m.data_type = "RGBA"; m.blend_type = blend; m.clamp_result = True
        if isinstance(fac, float):
            m.inputs[0].default_value = fac
        else:
            L.new(fac, m.inputs[0])
        L.new(a, m.inputs[6]); L.new(b, m.inputs[7])
        return m.outputs[2]
    tint = N.new("ShaderNodeRGB"); tint.name = "tint"
    fogc = N.new("ShaderNodeRGB"); fogc.name = "fogc"
    c1 = mix("MULTIPLY", 1.0, gi.outputs[0], oi.outputs["Color"])
    c2 = mix("MULTIPLY", 1.0, c1, tint.outputs[0])
    cd = N.new("ShaderNodeCameraData")
    mr = N.new("ShaderNodeMapRange"); mr.name = "fog"; mr.clamp = True
    L.new(cd.outputs["View Distance"], mr.inputs["Value"])
    L.new(mix("MIX", mr.outputs[0], c2, fogc.outputs[0]), go.inputs[0])
    return ng


def fog(near=5.0, far=26.0, amount=0.55, color="#7FA48A", tint=(1, 1, 1)):
    """Depth haze shared by every jungle material: colour -> fog colour from `near` to `far` metres (max `amount`)."""
    ng = _look_group(); N = ng.nodes
    mr = N["fog"]; mr.inputs["From Min"].default_value = near; mr.inputs["From Max"].default_value = far
    mr.inputs["To Min"].default_value = 0.0; mr.inputs["To Max"].default_value = amount
    N["fogc"].outputs[0].default_value = (*K.srgb(color), 1)
    N["tint"].outputs[0].default_value = (*tint, 1)


def _mat(name, img=None, hexc=None, cutout=False, extension="REPEAT"):
    """Flat LPS material (50% emission + diffuse) through the JungleLook group; cutout = hard alpha clip."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    g = nt.nodes.new("ShaderNodeGroup"); g.node_tree = _look_group()
    alpha = None
    if img is not None:
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = img; t.interpolation = "Closest"; t.extension = extension
        nt.links.new(t.outputs[0], g.inputs[0])
        if cutout:                                            # alpha clip: Closest alpha > 0.5 -> 0/1
            gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.5
            nt.links.new(t.outputs[1], gt.inputs[0]); alpha = gt.outputs[0]
    else:
        rgb = nt.nodes.new("ShaderNodeRGB"); rgb.outputs[0].default_value = (*K.srgb(hexc), 1)
        nt.links.new(rgb.outputs[0], g.inputs[0])
    K.flat_shader(nt, g.outputs[0], out, alpha)
    m.use_backface_culling = False
    if cutout:
        m.surface_render_method = "DITHERED"                  # EEVEE Next: binary alpha + dithered = hard cutout, depth-correct
        m.use_transparency_overlap = True
    return m


# ---------------------------------------------------------------- geometry

class _MB:
    """Mesh builder: verts + quads + per-vertex UVs, built as one object."""
    def __init__(self):
        self.v, self.f, self.uv = [], [], []

    def add(self, verts, faces, uvs):
        o = len(self.v); self.v += verts; self.uv += uvs
        self.f += [tuple(i + o for i in fc) for fc in faces]

    def card(self, base, yaw, a0, bend, L, W, nseg=3, fold=0.0, roll=0.0):
        """Arched leaf card: starts at base heading `yaw` with elevation a0 (rad), curving down by `bend` in total.
        UV u along the card, v across. fold>0 lowers both edges (a V cross-section, needs the centre row)."""
        dh = np.array([math.cos(yaw), math.sin(yaw), 0.0]); sd = np.array([-math.sin(yaw), math.cos(yaw), 0.0])
        z = np.array([0, 0, 1.0]); p = np.array(base, float); ang = a0; ds = L / nseg
        cols = 3 if fold else 2
        verts, uvs = [], []
        for i in range(nseg + 1):
            t = i / nseg
            n = -math.sin(ang) * dh + math.cos(ang) * z
            s = sd * math.cos(roll) + n * math.sin(roll)
            w = W / 2
            if fold:
                row = [p - s * w - n * fold * w, p, p + s * w - n * fold * w]
            else:
                row = [p - s * w, p + s * w]
            verts += [tuple(q) for q in row]; uvs += [(t, j / (cols - 1)) for j in range(cols)]
            ang_mid = ang - bend / nseg / 2
            p = p + ds * (math.cos(ang_mid) * dh + math.sin(ang_mid) * z)
            ang -= bend / nseg
        faces = []
        for i in range(nseg):
            for j in range(cols - 1):
                a = i * cols + j
                faces.append((a, a + 1, a + 1 + cols, a + cols))
        self.add(verts, faces, uvs)
        return p

    def tube(self, pts, radii, sides, vrep, urep=1.0):
        verts, uvs, faces = [], [], []
        acc = 0.0
        for i, (p, r) in enumerate(zip(pts, radii)):
            p = np.array(p, float)
            d = np.array(pts[min(i + 1, len(pts) - 1)], float) - np.array(pts[max(i - 1, 0)], float); d /= np.linalg.norm(d)
            a = np.cross(d, [0, 0, 1.0] if abs(d[2]) < 0.9 else [1.0, 0, 0]); a /= np.linalg.norm(a); b = np.cross(d, a)
            if i:
                acc += np.linalg.norm(p - np.array(pts[i - 1], float))
            for j in range(sides + 1):
                th = j / sides * TAU
                verts.append(tuple(p + r * (math.cos(th) * a + math.sin(th) * b))); uvs.append((j / sides * urep, acc / vrep))
        for i in range(len(pts) - 1):
            for j in range(sides):
                a = i * (sides + 1) + j
                faces.append((a, a + sides + 1, a + sides + 2, a + 1))
        self.add(verts, faces, uvs)

    def build(self, name, mat, color=None):
        me = bpy.data.meshes.new(name); me.from_pydata(self.v, [], self.f)
        uv = me.uv_layers.new()
        for poly in me.polygons:
            for li in poly.loop_indices:
                uv.data[li].uv = self.uv[me.loops[li].vertex_index]
        me.materials.append(mat)
        o = K.link(bpy.data.objects.new(name, me))
        if color is not None:
            o.color = (*color, 1)
        return o


def _tint(rng, base=(1, 1, 1), j=0.12):
    s = rng.uniform(1 - j, 1 + j)
    return (base[0] * s * rng.uniform(0.85, 1.2), base[1] * s * rng.uniform(0.92, 1.08), base[2] * s * rng.uniform(0.8, 1.1))


# ---------------------------------------------------------------- set

_M = {}


def _materials(seed, night):
    rng = np.random.default_rng(seed + 991)
    I = K.image_from_array
    rgb = lambda a: np.concatenate([np.clip(a, 0, 255), np.full(a.shape[:2] + (1,), 255.0)], 2).astype(np.uint8)
    M = {
        "mud": _mat("jg_mud", I("jg_mud", rgb(tex_mud(rng)))),
        "litter": _mat("jg_litter", I("jg_litter", rgb(tex_litter(rng)))),
        "moss": _mat("jg_moss", I("jg_moss", rgb(tex_moss(rng)))),
        "trunk": _mat("jg_trunk", I("jg_trunk", rgb(tex_trunk(rng)))),
        "bark": _mat("jg_bark", I("jg_bark", rgb(tex_bark(rng)))),
        "logend": _mat("jg_logend", hexc="#6A4A2A"),
        "rock": _mat("jg_rock", I("jg_rock", rgb(tex_rock(rng)))),
    }
    for k, f in (("frond", tex_frond), ("fern", tex_fern), ("banana", tex_banana), ("monstera", tex_monstera),
                 ("vine", tex_vine), ("grass", tex_grass)):
        M[k] = _mat("jg_" + k, I("jg_" + k, f(rng)), cutout=True, extension="EXTEND")
    for i, pal in enumerate((("#123620", "#1A4A26", "#256030", "#357636", "#4E903C"),
                             ("#0F301E", "#173F24", "#1F5229", "#2E6A31", "#457F36"))):
        M[f"wall{i}"] = _mat(f"jg_wall{i}", I(f"jg_wall{i}", tex_wall(rng, palette=pal)), cutout=True, extension="EXTEND")
    _M.clear(); _M.update(M)
    return M


def palm(loc, rng, height=None, name="palm", fronds=None, vines=0):
    """One coconut palm on the ground point loc: curved ringed trunk + crown of drooping fronds (+ hanging lianas).
    Returns (trunk, crown, [vines])."""
    H = height or rng.uniform(4.0, 7.0)
    lean = rng.uniform(0.3, 1.4) * H / 6; ly = rng.uniform(0, TAU)
    ld = np.array([math.cos(ly), math.sin(ly), 0])
    base = np.array(loc, float) - [0, 0, 0.15]
    pts, radii = [], []
    for i in range(5):
        t = i / 4
        pts.append(base + ld * lean * t * t + [0, 0, (H + 0.15) * t]); radii.append(0.2 * (1 - 0.4 * t) + (0.07 if i == 0 else 0))
    mb = _MB(); mb.tube(pts, radii, 5, 0.5)
    tr = mb.build(name + "_trunk", _M["trunk"], _tint(rng, j=0.1))
    top = pts[-1]
    mb = _MB(); n = fronds or int(rng.integers(6, 9)); y0 = rng.uniform(0, TAU)
    for i in range(n):
        yaw = y0 + i / n * TAU + rng.uniform(-0.25, 0.25)
        L = rng.uniform(2.3, 3.1) * H / 6 + 0.6
        mb.card(top + [0, 0, 0.05], yaw, rng.uniform(0.15, 0.6), rng.uniform(1.4, 2.1), L, rng.uniform(1.0, 1.25),
                nseg=3, fold=0.35, roll=rng.uniform(-0.2, 0.2))
    for i in range(2):                                        # young upright fronds
        mb.card(top, rng.uniform(0, TAU), 1.15, 0.7, 1.4, 0.7, nseg=2, fold=0.3)
    cr = mb.build(name + "_crown", _M["frond"], _tint(rng))
    vs = []
    for i in range(vines):
        a = rng.uniform(0, TAU); r = rng.uniform(0.6, 1.4)
        p = top + [math.cos(a) * r, math.sin(a) * r, -0.25 - 0.15 * r]
        L = (p[2] - loc[2]) * rng.uniform(0.45, 0.85)
        mb = _MB(); yaw = rng.uniform(0, math.pi)
        for k in range(2):
            mb.card(p, yaw + k * math.pi / 2, -math.pi / 2, 0.0, L, rng.uniform(0.35, 0.5), nseg=2)
        vs.append(mb.build(f"{name}_vine{i}", _M["vine"], _tint(rng)))
    return tr, cr, vs


def fern(loc, rng, name="fern", scale=None):
    s = scale or rng.uniform(0.7, 1.3)
    mb = _MB(); n = int(rng.integers(6, 8)); y0 = rng.uniform(0, TAU)
    for i in range(n):
        mb.card(np.array(loc) - [0, 0, 0.05], y0 + i / n * TAU + rng.uniform(-0.3, 0.3), rng.uniform(0.75, 1.2),
                rng.uniform(1.3, 1.9), rng.uniform(0.9, 1.3) * s, 0.42 * s, nseg=2)
    return mb.build(name, _M["fern"], _tint(rng))


def leaf_clump(loc, rng, kind="banana", name="clump", scale=None):
    """Banana / monstera clump: radial broad leaf cards with a centre fold, on petioles."""
    s = scale or rng.uniform(0.8, 1.35)
    mb = _MB(); n = int(rng.integers(4, 7)); y0 = rng.uniform(0, TAU)
    big = kind == "banana"
    for i in range(n):
        L = (rng.uniform(1.6, 2.3) if big else rng.uniform(1.0, 1.4)) * s
        mb.card(np.array(loc) - [0, 0, 0.05], y0 + i / n * TAU + rng.uniform(-0.3, 0.3), rng.uniform(0.9, 1.3),
                rng.uniform(1.4, 2.0), L, (0.62 if big else 0.75) * s, nseg=2, fold=0.25, roll=rng.uniform(-0.3, 0.3))
    return mb.build(name, _M[kind], _tint(rng))


def grass(loc, rng, name="grass", scale=None):
    s = scale or rng.uniform(0.6, 1.2)
    mb = _MB(); y0 = rng.uniform(0, math.pi)
    for k in range(3):
        mb.card(np.array(loc) - [0, 0, 0.04], y0 + k * math.pi / 3, math.pi / 2, 0.15, 0.9 * s, 0.9 * s, nseg=1)
    return mb.build(name, _M["grass"], _tint(rng))


def rock(loc, rng, name="rock", r=None):
    r = r or rng.uniform(0.25, 0.7)
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0, calc_uvs=True)
    sx, sy, sz = rng.uniform(0.9, 1.4), rng.uniform(0.8, 1.2), rng.uniform(0.5, 0.8)
    for v in bm.verts:
        j = rng.uniform(0.82, 1.12)
        v.co.x *= r * sx * j; v.co.y *= r * sy * j; v.co.z = v.co.z * r * sz * j
    uvl = bm.loops.layers.uv.active or bm.loops.layers.uv.new()
    for f in bm.faces:
        for l in f.loops:
            l[uvl].uv = (l.vert.co.x / 0.6 + l.vert.co.y / 0.9, l.vert.co.z / 0.6)
    bm.to_mesh(me); bm.free()
    me.materials.append(_M["rock"])
    o = K.link(bpy.data.objects.new(name, me)); o.location = (loc[0], loc[1], loc[2] - r * sz * 0.25)
    o.rotation_euler = (0, 0, rng.uniform(0, TAU)); o.color = (*_tint(rng, j=0.08), 1)
    return o


def fallen_log(loc, yaw, rng, name="log", length=None, r=0.24):
    L = length or rng.uniform(2.4, 3.4)
    d = np.array([math.cos(yaw), math.sin(yaw), 0]); c = np.array(loc, float) + [0, 0, r * 0.75]
    pts = [c - d * L / 2, c - d * L / 6 + [0, 0, 0.02], c + d * L / 6 + [0, 0, 0.03], c + d * L / 2 + [0, 0, -0.02]]
    mb = _MB(); mb.tube(pts, [r, r * 1.02, r * 0.97, r * 0.9], 6, 1.4, urep=1.0)
    o = mb.build(name, _M["bark"], _tint(rng, j=0.08))
    caps = []
    for end, rr in ((pts[0], r), (pts[-1], r * 0.9)):
        mb = _MB(); a = np.cross(d, [0, 0, 1.0]); b = np.array([0, 0, 1.0])
        mb.add([tuple(end + rr * (math.cos(j / 6 * TAU) * a + math.sin(j / 6 * TAU) * b)) for j in range(6)], [tuple(range(6))],
               [(0, 0)] * 6)
        caps.append(mb.build(name + "_cap", _M["logend"]))
    return [o] + caps


def jungle(origin=(0, 0, 0), size=(14, 14), seed=0, density=1.0, night=False, clearing_r=1.6):
    """Dense Lubang-island jungle centred on origin, flat walkable clearing of radius clearing_r at the centre (z = origin z).
    Returns dict: ground [mud, litter, moss], palms [(trunk, crown)], vines, ferns, clumps, grass, rocks, log, walls,
    plants (every plant object), materials, ground_z(x, y) (world height of the visible ground), polys."""
    rng = np.random.default_rng(seed)
    ox, oy, oz = origin; SX, SY = size; cr = clearing_r
    M = _materials(seed, night)
    if night:
        fog(near=2.5, far=15, amount=0.85, color="#0B2026", tint=(0.36, 0.52, 0.62)); sky = "#0A1A20"
    else:
        fog(near=5, far=24, amount=0.55, color="#86AE90", tint=(1, 1, 1)); sky = "#B4D2BC"
    w = bpy.context.scene.world
    if w and w.use_nodes:
        w.node_tree.nodes["Background"].inputs[0].default_value = (*K.srgb(sky), 1)

    # ---- ground: 3 relief planes (mud lowest; litter and moss poke through in patches)
    EX, EY = SX / 2 + 6, SY / 2 + 6; NX = NY = 14
    gx = np.linspace(-EX, EX, NX + 1); gy = np.linspace(-EY, EY, NY + 1)
    GX, GY = np.meshgrid(gx, gy)                                       # [iy, ix]
    R = np.hypot(GX, GY)
    def sstep(a, b, x):
        t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
    def waves(k, amp):
        out = 0
        for i in range(4):
            f = rng.uniform(0.25, 0.7); a = rng.uniform(0, TAU); ph = rng.uniform(0, TAU)
            out = out + np.sin(f * (GX * math.cos(a) + GY * math.sin(a)) + ph)
        return out / 4 * amp
    flat = sstep(cr * 0.9, cr * 2.4, R)
    edge = np.maximum(np.abs(GX) / (SX / 2), np.abs(GY) / (SY / 2))
    hmud = waves(0, 0.45) * flat + 0.9 * sstep(0.95, 1.6, edge)       # berm outside the set hides the edge
    off_l = waves(1, 0.22) + 0.02 - 0.25 * (1 - sstep(cr * 0.6, cr * 1.5, R))
    off_m = waves(2, 0.25) - 0.04 - 0.3 * (1 - sstep(cr * 0.9, cr * 2.0, R))
    heights = [hmud, hmud + off_l, hmud + off_m]
    ground = []
    for nm, H in zip(("mud", "litter", "moss"), heights):
        mb = _MB()
        verts = [(ox + GX[j, i], oy + GY[j, i], oz + H[j, i]) for j in range(NY + 1) for i in range(NX + 1)]
        uvs = [((GX[j, i] + (3.7 if nm == "moss" else 0)) / 2.2, GY[j, i] / 2.2) for j in range(NY + 1) for i in range(NX + 1)]
        faces = [(j * (NX + 1) + i, j * (NX + 1) + i + 1, (j + 1) * (NX + 1) + i + 1, (j + 1) * (NX + 1) + i)
                 for j in range(NY) for i in range(NX)]
        mb.add(verts, faces, uvs)
        ground.append(mb.build("jg_ground_" + nm, M[nm], _tint(rng, j=0.04)))
    HT = np.maximum.reduce(heights)

    def gz(x, y):
        """Visible ground height (local), bilinear on the grid."""
        fx = (x + EX) / (2 * EX) * NX; fy = (y + EY) / (2 * EY) * NY
        i = int(np.clip(math.floor(fx), 0, NX - 1)); j = int(np.clip(math.floor(fy), 0, NY - 1)); u = fx - i; v = fy - j
        return (HT[j, i] * (1 - u) * (1 - v) + HT[j, i + 1] * u * (1 - v) + HT[j + 1, i] * (1 - u) * v + HT[j + 1, i + 1] * u * v)

    # ---- scatter
    pts_all = []
    def scatter(n, rmin, mind, margin=0.3, tries=60):
        out = []
        for _ in range(n):
            for _ in range(tries):
                x = rng.uniform(-SX / 2 + margin, SX / 2 - margin); y = rng.uniform(-SY / 2 + margin, SY / 2 - margin)
                if math.hypot(x, y) < rmin:
                    continue
                if all((x - a) ** 2 + (y - b) ** 2 > (max(mind, md)) ** 2 for a, b, md in pts_all):
                    out.append((x, y)); pts_all.append((x, y, mind * 0.6)); break
        return out
    A = SX * SY * density
    P = lambda x, y: (ox + x, oy + y, oz + gz(x, y))
    palms, vines, ferns, clumps, grasses, rocks, plants = [], [], [], [], [], [], []
    for i, (x, y) in enumerate(scatter(round(A / 15), cr + 1.0, 1.9)):
        tr, crn, vs = palm(P(x, y), rng, name=f"jg_palm{i}", vines=int(rng.integers(0, 3)))
        palms.append((tr, crn)); vines += vs; plants += [tr, crn] + vs
    lg = None
    a = rng.uniform(0, TAU); lx, ly = math.cos(a) * (cr + 0.8), math.sin(a) * (cr + 0.8)
    lg = fallen_log(P(lx, ly), a + math.pi / 2 + rng.uniform(-0.3, 0.3), rng, name="jg_log"); pts_all.append((lx, ly, 1.2))
    for i, (x, y) in enumerate(scatter(round(A / 9), cr + 0.6, 1.2)):
        kind = "banana" if rng.random() < 0.55 else "monstera"
        clumps.append(leaf_clump(P(x, y), rng, kind, name=f"jg_{kind}{i}"))
    for i, (x, y) in enumerate(scatter(round(A / 5), cr + 0.15, 0.75)):
        ferns.append(fern(P(x, y), rng, name=f"jg_fern{i}"))
    for i, (x, y) in enumerate(scatter(round(A / 7), cr * 0.75, 0.5)):
        grasses.append(grass(P(x, y), rng, name=f"jg_grass{i}"))
    for i, (x, y) in enumerate(scatter(5, cr + 0.3, 0.8)):
        rocks.append(rock(P(x, y), rng, name=f"jg_rock{i}"))
    plants += clumps + ferns + grasses

    # ---- background walls: 2 rings of big foliage cards facing the centre (fog makes the outer one hazier)
    walls = []
    for ring, (pad, hgt, mat) in enumerate(((0.2, 5.5, "wall0"), (2.2, 8.0, "wall1"))):
        hx, hy = SX / 2 + pad, SY / 2 + pad
        for side in range(4):
            Lside = 2 * (hx if side % 2 == 0 else hy); n = max(2, math.ceil(Lside / 3.4))
            for k in range(n + 1):
                t = -Lside / 2 + Lside * k / n + rng.uniform(-0.4, 0.4)
                if side == 0: x, y, yaw = t, hy, 0.0                      # +Y wall, faces -Y
                elif side == 1: x, y, yaw = hx, t, math.pi / 2
                elif side == 2: x, y, yaw = t, -hy, math.pi
                else: x, y, yaw = -hx, t, -math.pi / 2
                wd = rng.uniform(4.2, 5.4); h = hgt * rng.uniform(0.85, 1.15)
                z0 = min(gz(x - math.cos(yaw) * wd / 2, y - math.sin(yaw) * wd / 2), gz(x, y), gz(x + math.cos(yaw) * wd / 2, y + math.sin(yaw) * wd / 2)) - 0.3
                mb = _MB(); c, s = math.cos(yaw), math.sin(yaw)
                xs = [(-wd / 2, 0), (wd / 2, 1)]
                verts = [(ox + x + c * dx, oy + y + s * dx, oz + z0 + zz) for zz in (0, h) for dx, _ in xs]
                mb.add(verts, [(0, 1, 3, 2)], [(0, 0), (1, 0), (0, 1), (1, 1)])
                walls.append(mb.build(f"jg_wall{ring}_{side}_{k}", M[mat], _tint(rng, j=0.06)))
    allobj = ground + plants + rocks + lg + walls
    polys = sum(len(o.data.polygons) for o in allobj)
    return dict(ground=ground, palms=palms, vines=vines, ferns=ferns, clumps=clumps, grass=grasses, rocks=rocks, log=lg,
                walls=walls, plants=plants, materials=M, polys=polys,
                ground_z=lambda x, y: oz + gz(x - ox, y - oy))
