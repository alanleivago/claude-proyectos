"""lps-hombre prep (venv python): measures the front/profile photo, builds the
low-poly head geometry (fitted to both silhouettes) and paints the textures.

    .venv/bin/python pieces/lps-hombre/prep.py

Writes out/head_geo.json (verts/faces/tags + UV regions), out/head_1k.png,
out/head_128.png, out/body_1k.png, out/body_256.png. build_char.py reads them.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(7)

img = np.asarray(Image.open(ROOT / "ref/hombre_frente_perfil.jpg").convert("RGB")).astype(np.float32)
H, W = img.shape[:2]
HALF = W // 2
FRONT, PROF = img[:, :HALF], img[:, HALF:]

# --- scale / landmarks (pixels of each half) -------------------------------
S = 0.0004          # m per px  (chin row 598 .. crown row 24 = 0.23 m)
ROW_CHIN = 598
CXF = 349           # facial midline in the front photo
EAR = 1110 - HALF   # ear centre column in the profile half -> Y = 0


def Z(row): return (ROW_CHIN - row) * S
def Xf(px): return px * S          # half-width px -> m
def Y(px): return (px - EAR) * S   # profile column -> m (front = -Y)
def Ya(px): return Y(px - HALF)   # absolute photo column -> m
def row_of(z): return ROW_CHIN - z / S


def mask(a):
    d = np.abs(a - 205).sum(2) > 36
    d = nd.binary_opening(d, iterations=2)
    lab, n = nd.label(d)
    sz = nd.sum(d, lab, range(1, n + 1))
    return nd.binary_fill_holes(lab == (np.argmax(sz) + 1))


MF, MP = mask(FRONT), mask(PROF)


def contour(m, rows):
    L, R = [], []
    for r in rows:
        xs = np.where(m[max(r, 28)])[0]
        L.append(xs.min()); R.append(xs.max())
    return np.array(L, float), np.array(R, float)


rows_all = np.arange(24, 600)
fL, fR = contour(MF, rows_all)
pF, pB = contour(MP, rows_all)
sm = lambda v: nd.uniform_filter1d(v, 9)
halfw = sm((fR - fL) / 2)
pF, pB = sm(pF), sm(pB)
# face plane under the nose: interpolate the profile front between nasion and upper lip
r0, r1 = 305 - 24, 440 - 24
pF_face = pF.copy()
pF_face[r0:r1] = np.linspace(pF[r0], pF[r1], r1 - r0)


def meas(row):
    i = int(row) - 24
    return halfw[i], pF_face[i], pB[i]


# --- head geometry ---------------------------------------------------------
# half-ring template: (fraction of half-width, fraction front->back)
TPL = [(0.0, 0.0), (0.74, 0.05), (1.0, 0.30), (1.0, 0.64), (0.76, 0.92), (0.0, 1.0)]   # coffin/prism section
RING_ROWS = [55, 140, 240, 320, 400, 470]
verts, faces, tags = [], [], []


def add_ring(halfpts):
    """halfpts: list of (x>=0, y, z) from front centre to back centre. Returns full ring idx (CCW from top)."""
    idx = []
    for x, y, z in halfpts:                      # +X side, front -> back
        verts.append((x, y, z)); idx.append(len(verts) - 1)
    for x, y, z in reversed(halfpts[1:-1]):      # -X side, back -> front
        verts.append((-x, y, z)); idx.append(len(verts) - 1)
    return idx


rings = []
for r in RING_ROWS:
    w, f, b = meas(r)
    rings.append(add_ring([(Xf(w * a), Y(f + t * (b - f)), Z(r)) for a, t in TPL]))
# jaw / chin ring (tilted: chin in front, nape at the back), hand-placed against the profile
chin = [(0, 828, 598), (55, 842, 590), (118, 935, 560), (145, 1045, 527), (105, 1180, 502), (0, 1225, 498)]
rings.append(add_ring([(Xf(x), Ya(y), Z(r)) for x, y, r in chin]))

for a, b in zip(rings[:-1], rings[1:]):
    n = len(a)
    for j in range(n):
        faces.append([a[j], b[j], b[(j + 1) % n], a[(j + 1) % n]]); tags.append("head")
# crown: fan to a top vertex
top_col = np.where(MP[30])[0]
verts.append((0.0, Y(top_col.mean()), Z(22))); T = len(verts) - 1
a = rings[0]
for j in range(len(a)):
    faces.append([T, a[j], a[(j + 1) % len(a)]]); tags.append("head")
faces.append(list(reversed(rings[-1]))); tags.append("skin")   # under-jaw cap (hidden by neck)

# nose wedge (separate piece, joined)
def v(x, y, r):
    verts.append((Xf(x), Ya(y), Z(r))); return len(verts) - 1
root = v(0, 806, 318); rwL = v(17, 830, 326); rwR = v(-17, 830, 326)
tip = v(0, 756, 412); base = v(0, 792, 440); wL = v(42, 818, 432); wR = v(-42, 818, 432)
for fc in ([root, tip, wL, rwL], [root, rwR, wR, tip], [tip, base, wL], [tip, wR, base]):
    faces.append(fc); tags.append("nose")

# neck: octagonal prism (extruded twice), centre slightly behind the ear line
NECK_Y, NR = Ya(1065), 0.056
neck_rings = []
for z, rx, ry, dy in ((0.045, NR, NR * 1.05, 0.0), (-0.035, NR * 1.02, NR * 1.08, 0.004), (-0.10, NR * 1.06, NR * 1.12, 0.01)):
    idx = []
    for k in range(8):
        ang = -np.pi / 2 + (k + 0.5) * np.pi / 4      # CCW from top, starting near front
        verts.append((rx * np.cos(ang), NECK_Y + dy + ry * np.sin(ang), z)); idx.append(len(verts) - 1)
    neck_rings.append(idx)
for a, b in zip(neck_rings[:-1], neck_rings[1:]):
    for j in range(8):
        faces.append([a[j], b[j], b[(j + 1) % 8], a[(j + 1) % 8]]); tags.append("neck")

# orient every face outward (head/nose vs an inner point, neck vs its axis)
V = np.array(verts)
P_IN = np.array([0.0, Ya(1050), Z(330)])
for i, (fc, tg) in enumerate(zip(faces, tags)):
    p = V[fc]; c = p.mean(0)
    n = np.cross(p[1] - p[0], p[2] - p[0])
    ref = np.array([0.0, NECK_Y, c[2]]) if tg == "neck" else P_IN
    if tg == "nose":
        ref = np.array([0.0, Ya(850), Z(400)])
    if np.dot(n, c - ref) < 0:
        faces[i] = list(reversed(fc))

# --- head texture atlas (1024): per-face UVs + baked blend of both photos -----
A = 1024
REG = {   # origin px (x,y), k px/m, axes, u0 (first-axis min), v0 (Z max / Y min)
    "front": dict(o=(0, 0), k=2900, axes="XZ", u0=-0.095, v0=0.235),
    "sideL": dict(o=(562, 0), k=1500, axes="YZ", u0=-0.152, v0=0.235),
    "sideR": dict(o=(562, 380), k=1500, axes="YZ", u0=-0.152, v0=0.235),
    "back":  dict(o=(0, 724), k=1250, axes="XZ", u0=-0.095, v0=0.235),
    "top":   dict(o=(250, 724), k=1250, axes="XY", u0=-0.095, v0=-0.152),
    "skin":  dict(o=(562, 770), size=(200, 200)),
}


def fill_bg(a, m):
    _, (iy, ix) = nd.distance_transform_edt(~m, return_indices=True)
    return a[iy, ix]


def clothes(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return nd.binary_dilation(((g - b) > 45) | (a.min(2) > 212), iterations=4)


rr, cc = np.mgrid[:H, :HALF]
mf2 = nd.binary_erosion(MF, iterations=4) & ~clothes(FRONT) & (rr < 612) & ~((rr > 556) & (np.abs(cc - CXF) > 72))
mp2 = nd.binary_erosion(MP, iterations=4) & ~clothes(PROF) & ~((rr > 488) & (cc > 1000 - HALF))
FRONT_F, PROF_F = fill_bg(FRONT, mf2), fill_bg(PROF, mp2)
skin = np.median(FRONT[380:420, 225:265].reshape(-1, 3), 0)
# match the profile photo's skin to the front photo (cheek patches seen by both)
gain = np.median(FRONT[390:450, 205:235].reshape(-1, 3), 0) / np.median(PROF[390:450, 940 - HALF:990 - HALF].reshape(-1, 3), 0)
gain = np.clip(gain, 0.8, 1.25)
PROF_F = np.clip(PROF_F * gain, 0, 255)


def samp(a, xs, ys):
    return np.stack([nd.map_coordinates(a[..., c], [ys, xs], order=1, mode="nearest") for c in range(3)], -1)


def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def head_colour(P, N):
    """P, N: (n,3) head-local points and smooth normals -> (n,3) colour.
    One continuous head: front photo on front-facing surface, profile photo only behind the cheek
    (never its eye/nose/mouth), hair photos on back and crown, feathered by the smooth normal."""
    X, Yh, Zh = P[:, 0], P[:, 1], P[:, 2]
    rows = row_of(Zh)
    pcol = EAR + Yh / S                                  # profile column (half image)
    front = samp(FRONT_F, CXF + X / S, rows)
    prof = samp(PROF_F, pcol, rows)
    brow = np.clip(rows, 110, 482)
    back = samp(PROF_F, np.interp(brow, np.arange(24, 600), pB) - 14 - np.abs(X) / S * 0.35, brow)
    tcols = np.clip(pcol, 0, HALF - 1).astype(int)
    topr = np.argmax(MP[:, tcols], axis=0)
    trow = 150 + np.clip(pcol - 330, 0, 400) * 0.3 + np.abs(X) / S * 0.2
    top = samp(PROF_F, np.interp(trow, np.arange(24, 600), pB) - 30 - np.abs(X) / S * 0.3, trow)   # crown = grey hair
    m = sstep(905 - HALF, 950 - HALF, pcol)              # profile allowed only behind the eye / cheekbone
    edge = np.abs(X) / (np.interp(np.clip(rows, 24, 599), np.arange(24, 600), halfw) * S)
    fkeep = 1 - sstep(0.70, 0.88, edge)                  # front photo's silhouette edge (side hair) not smeared forward
    side = sstep(0.25, 0.8, np.abs(N[:, 0]))
    wF = (sstep(0.05, 0.55, -N[:, 1]) + side * (1 - m)) * fkeep
    wS = side * m + (1 - fkeep) * m * sstep(0.0, 0.3, np.abs(N[:, 0]))
    wB = sstep(0.3, 0.8, N[:, 1])
    wT = sstep(0.55, 0.92, N[:, 2])
    W = np.stack([wF, wS, wB, wT], 1) + 1e-6
    W[:, 0] += 1e-3
    W /= W.sum(1, keepdims=True)
    return front * W[:, :1] + prof * W[:, 1:2] + back * W[:, 2:3] + top * W[:, 3:4]


# per-face region + UVs (computed here so the bake and Blender share them)
fn = []
for fc in faces:
    p = V[fc]
    n = np.cross(p[1] - p[0], p[2] - p[0]); n /= np.linalg.norm(n) + 1e-12
    fn.append(n)
fn = np.array(fn)
vn = np.zeros_like(V)
for fc, n, tg in zip(faces, fn, tags):
    if tg in ("head", "nose"):
        for k in fc:
            vn[k] += n
vn /= np.linalg.norm(vn, axis=1, keepdims=True) + 1e-12


def uv_px(reg, p):
    R = REG[reg]
    c = {"X": p[0], "Y": p[1], "Z": p[2]}
    a, b = R["axes"]
    px = R["o"][0] + R["k"] * (c[a] - R["u0"])
    py = R["o"][1] + (R["k"] * (R["v0"] - c[b]) if b == "Z" else R["k"] * (c[b] - R["v0"]))
    return px, py


face_reg, face_uv = [], []
for fc, n, tg in zip(faces, fn, tags):
    c = V[fc].mean(0)
    if tg == "nose":
        reg = "front"
    elif tg in ("neck", "skin"):
        reg = "skin"
    elif n[1] < -0.3:
        reg = "front"
    elif n[2] > 0.72:
        reg = "top"
    elif n[1] > 0.5:
        reg = "back"
    else:
        reg = "sideL" if c[0] > 0 else "sideR"
    if reg == "skin":
        uvs = [(REG["skin"]["o"][0] + 100 + 80 * V[k][0] / 0.07, REG["skin"]["o"][1] + 100 + 80 * (V[k][1] - NECK_Y) / 0.07) for k in fc]
    else:
        uvs = [uv_px(reg, V[k]) for k in fc]
    face_reg.append(reg); face_uv.append(uvs)

atlas = np.zeros((A, A, 3), np.float32)
filled = np.zeros((A, A), bool)
ox, oy = REG["skin"]["o"]
atlas[oy:oy + 200, ox:ox + 200] = skin * 0.97
filled[oy:oy + 200, ox:ox + 200] = True
order = sorted(range(len(faces)), key=lambda i: tags[i] == "nose")     # nose last (overlaps the face in UV)
for i in order:
    if face_reg[i] == "skin":
        continue
    fc, uvs = faces[i], np.array(face_uv[i])
    for t in range(1, len(fc) - 1):
        tri = [0, t, t + 1]
        q = uvs[tri]; P3 = V[[fc[j] for j in tri]]; N3 = vn[[fc[j] for j in tri]]
        x0, y0 = np.floor(q.min(0) - 1).astype(int); x1, y1 = np.ceil(q.max(0) + 1).astype(int)
        gy, gx = np.mgrid[max(y0, 0):min(y1, A), max(x0, 0):min(x1, A)]
        px, py = gx.ravel() + 0.5, gy.ravel() + 0.5
        (ax_, ay), (bx, by), (cx_, cy) = q
        den = (by - cy) * (ax_ - cx_) + (cx_ - bx) * (ay - cy)
        if abs(den) < 1e-9:
            continue
        l0 = ((by - cy) * (px - cx_) + (cx_ - bx) * (py - cy)) / den
        l1 = ((cy - ay) * (px - cx_) + (ax_ - cx_) * (py - cy)) / den
        l2 = 1 - l0 - l1
        inside = (l0 > -0.04) & (l1 > -0.04) & (l2 > -0.04)
        if not inside.any():
            continue
        L = np.stack([l0, l1, l2], 1)[inside]
        L = np.clip(L, 0, None); L /= L.sum(1, keepdims=True)
        P = L @ P3; N = L @ N3; N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-12
        col = head_colour(P, N)
        ix, iy = gx.ravel()[inside], gy.ravel()[inside]
        atlas[iy, ix] = col; filled[iy, ix] = True
atlas = fill_bg(atlas, filled)                       # pad islands so the 128 px downscale does not bleed
noise = nd.gaussian_filter(rng.normal(0, 1, (A, A)), 1.0)[..., None] * 3
atlas = np.clip(atlas + noise, 0, 255).astype(np.uint8)
Image.fromarray(atlas).save(OUT / "head_1k.png")
Image.fromarray(atlas).resize((128, 128), Image.BOX).save(OUT / "head_128.png")

geo = dict(verts=V.tolist(), faces=faces, tags=tags, atlas=A, neck_y=NECK_Y, skin=(skin / 255).tolist(),
           uvs=[[(u / A, 1 - v / A) for u, v in uv] for uv in face_uv], regions=face_reg)
(OUT / "head_geo.json").write_text(json.dumps(geo))

# --- body texture atlas: paint at 1024, ship 256 ----------------------------
B = 1024; F = B // 256        # 4 px of the 1K per final texel
body = np.zeros((B, B, 3), np.float32)
jacket = np.median(FRONT[690:760, 20:140].reshape(-1, 3), 0) * 0.55 + np.median(PROF[680:760, 1200 - HALF:1360 - HALF].reshape(-1, 3), 0) * 0.45


def tnoise(shape, sigma, amp):
    f = nd.gaussian_filter(rng.normal(0, 1, shape), sigma, mode="wrap")
    return f * amp / max(1e-6, f.std())


def cord(shape, base):
    """Mustard corduroy, photographic-ish at 256: irregular faint wales, creases and fold shading (tileable)."""
    h, w = shape
    per = 7.0 * (1 + 0.3 * nd.gaussian_filter1d(rng.normal(0, 1, w), 4, mode="wrap") / 0.2)
    phase = np.cumsum(1.0 / np.clip(per, 4, 11))
    phase *= np.round(phase[-1]) / phase[-1]
    wale = 0.5 + 0.5 * np.cos(2 * np.pi * phase)[None, :]
    wale_var = 0.6 + 0.4 * (tnoise((h, w), (30, 0.8), 1.0) > -0.3)
    wales = 1 - 0.07 * wale * wale_var
    f = tnoise((h, w), (60, 5), 1.0)
    crease = np.exp(-(f / 0.15) ** 2)                       # thin dark creases along noise zero-crossings
    shade = 1 + tnoise((h, w), (70, 14), 0.07) + tnoise((h, w), (90, 90), 0.04) - 0.06 * crease + 0.03 * np.clip(f, 0, 1)
    grain = 1 + tnoise((h, w), 0.7, 0.035)
    hue = np.stack([1 + tnoise((h, w), 50, 0.015), np.ones((h, w)), 1 - tnoise((h, w), 50, 0.03)], -1)
    return np.clip(base[None, None] * (wales * shade * grain)[..., None] * hue, 0, 255)


Z256 = {  # zone rects in final 256 texels: x, y, w, h
    "jacket": (0, 0, 128, 128), "torso_front": (128, 0, 128, 128), "trousers": (0, 128, 128, 128),
    "shoes": (128, 128, 64, 64), "skin": (192, 128, 64, 64), "shirt": (128, 192, 64, 64), "inner": (192, 192, 64, 64)}


def zone(name):
    x, y, w, h = Z256[name]
    return slice(y * F, (y + h) * F), slice(x * F, (x + w) * F), (h * F, w * F)


ys, xs, shp = zone("jacket"); body[ys, xs] = cord(shp, jacket)
ys, xs, shp = zone("inner"); body[ys, xs] = cord(shp, jacket * 0.80)       # lapel facing / panel edges
ys, xs, shp = zone("trousers")
tr = np.array([62, 62, 68.0])
body[ys, xs] = np.clip(tr * (1 + tnoise(shp, 2, 0.05) + tnoise(shp, (30, 12), 0.05))[..., None], 0, 255)
ys, xs, shp = zone("shoes")
sh = np.array([92, 56, 32.0]) * (1 + tnoise(shp, 3, 0.06))[..., None]
sh[-2 * F:] = [40, 28, 20]                      # sole: bottom 2 texels (v from Z=0)
sh[-3 * F:-2 * F] *= 0.75
body[ys, xs] = sh
ys, xs, shp = zone("skin")
body[ys, xs] = np.clip(skin * 0.97 * (1 + tnoise(shp, 3, 0.04))[..., None], 0, 255)
ys, xs, shp = zone("shirt")
body[ys, xs] = np.clip(np.array([236, 234, 228.0]) * (1 + tnoise(shp, 3, 0.03))[..., None], 0, 255)

# torso core front (seen between the open jacket panels): shirt, placket + buttons, belt, trouser waist
TF = dict(x0=-0.425, z1=1.57, k=128 / 0.85)
ys, xs, shp = zone("torso_front")
h, w = shp
gy, gx = np.mgrid[:h, :w] + 0.5
X = TF["x0"] + gx / (TF["k"] * F)
Zw = TF["z1"] - gy / (TF["k"] * F)
shirt = np.array([236, 234, 228.0])
tf = np.clip(shirt * (1 + tnoise(shp, 3, 0.025) + tnoise(shp, (60, 20), 0.03))[..., None], 0, 255)
tf[(np.abs(X - 0.004) < 0.009)] *= 0.93                              # placket
tf[(np.abs(np.abs(X - 0.004) - 0.009) < 0.0025)] *= 0.85
for bz in np.arange(1.40, 0.99, -0.085):
    tf[(X - 0.004) ** 2 + (Zw - bz) ** 2 < 0.0045 ** 2] = [200, 196, 186]
tf[Zw < 0.995] = [58, 40, 28]                                        # belt
tf[(Zw < 0.995) & (np.abs(Zw - 0.975) < 0.0035)] *= 0.8
buckle = (np.abs(X - 0.004) < 0.022) & (Zw < 0.99) & (Zw > 0.958)
tf[buckle] = [150, 138, 104]
tf[buckle & (np.abs(X - 0.004) < 0.013) & (Zw < 0.983) & (Zw > 0.965)] = [58, 40, 28]
tr_low = Zw < 0.955
tf[tr_low] = np.clip(tr * (1 + tnoise(shp, 2, 0.05))[..., None], 0, 255)[tr_low]
tf[tr_low & (np.abs(X - 0.004) < 0.004)] *= 0.75                       # fly
body[ys, xs] = tf

body = np.clip(body, 0, 255).astype(np.uint8)
Image.fromarray(body).save(OUT / "body_1k.png")
Image.fromarray(body).resize((256, 256), Image.BOX).save(OUT / "body_256.png")
(OUT / "body_zones.json").write_text(json.dumps(dict(zones=Z256, torso_front=TF)))

print("head faces:", len(faces), "verts:", len(V), "| tags:", {t: tags.count(t) for t in set(tags)})
print("jacket rgb", jacket.round(), "skin rgb", skin.round())
