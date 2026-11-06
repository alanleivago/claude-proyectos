"""venv: the supporting cast as distinct people (user, 2026-10-30: never Kaneda recolours).
Each person = a Flow passport photo (tex/flow/face_<name>.jpg, eyes from eyes.json) pasted on hombre's head and painted
round the head in 3D by paint_heads.py's machinery, plus their own outfit painted on hombre's body atlas.
Body: every texel of the 1k atlas is located on the body in 3D (tex/people/body_uv.json = hombre's rest-pose polygons
with their UVs, dumped from lps_hombre.blend), each outfit is a function of (part, position, normal), then BOX -> 256.
Hombre's body UVs are planar projections wrapped per zone, so the "jacket" zone is shared by the torso back/sides,
the lapels, skirts and both arms (front and back faces at the same x land on the same texel): where users disagree
the higher-priority part wins (PRI). Front details live in the "torso_front" zone, which only the torso front uses.
Writes tex/people/<name>_head_128.png and <name>_body_256.png.  python tex/people.py [--body] [names...]"""
import json, os, sys
import numpy as np
from PIL import Image

H = os.path.dirname(os.path.abspath(__file__)); HB = os.path.join(H, "../../lps-hombre/out")
OUT = os.path.join(H, "people"); os.makedirs(OUT, exist_ok=True)
BODY_ONLY = "--body" in sys.argv
ONLY = [a for a in sys.argv[1:] if not a.startswith("-")]
HAIR = {"archbishop_scared": (140, 140, 136), "landgrave_angry": (52, 34, 24), "crowd1": (88, 56, 32), "crowd2": (20, 18, 16),
        "crowd3": (150, 148, 144), "crowd4": (150, 64, 30), "citizen1": (236, 232, 222), "citizen2": (190, 190, 186),
        "archbishop": (140, 140, 136), "landgrave": (52, 34, 24), "barbarossa": (156, 62, 30), "peasant": (196, 160, 92),
        "noble1": (178, 128, 104), "noble2": (204, 164, 84), "noble3": (24, 19, 16), "noble4": (214, 212, 206), "noble5": (178, 86, 38),
        "friend": (34, 22, 16), "akatsu": (22, 16, 13), "shimada": (22, 16, 13), "kozuka": (22, 16, 13), "suzuki": (20, 15, 12),
        "woman": (60, 36, 24), "sailor": (168, 84, 36), "oldman": (170, 170, 168), "worker": (20, 16, 14)}
SKIN_JSON = os.path.join(OUT, "skin.json")


# ------------------------------------------------------------------ heads
def face_oval(warp, skin, face, P, inset=14, feather=24):
    """Soft mask (1 inside) of the photo's skin oval in the front island, and the skin colour at its edge per height
    (the painted sides continue from it, like paint_heads.row_colour but read inside the oval, not on the photo's hair)."""
    from scipy import ndimage as nd
    b = nd.gaussian_filter(warp, (2, 2, 0)); lum, slum = b.mean(-1), skin.mean()
    chrom = b / np.maximum(b.sum(-1, keepdims=True), 1) - skin / skin.sum()
    sk = face & (np.linalg.norm(chrom, axis=-1) < 0.045) & (lum > 0.45 * slum) & (lum < 1.7 * slum + 60)
    sk = nd.binary_fill_holes(nd.binary_closing(nd.binary_opening(sk, iterations=2), iterations=12))
    lab, _ = nd.label(sk); c = lab[330:480, 180:370]; c = c[c > 0]
    sk = lab == np.bincount(c).argmax()                                    # the component holding the cheeks/nose
    rows = np.where(sk.any(1))[0]
    xl = np.full(1024, np.nan); xr = np.full(1024, np.nan)
    for y in rows:
        xs = np.where(sk[y])[0]; xl[y], xr[y] = xs[0], xs[-1]
    ys = np.arange(1024)
    sm = lambda v: nd.gaussian_filter1d(nd.median_filter(np.interp(ys, rows, v[rows]), 61), 12)   # no steps at brows/moustache
    hw = sm(np.fmax(274 - xl, xr - 274))           # eyes are centred on x=274: symmetric oval, the wider (better lit) side
    inside = hw[:, None] - np.abs(np.arange(1024)[None, :] - 274)           # px from the side edge (>0 inside)
    m = np.clip((inside - inset) / feather, 0, 1); m = m * m * (3 - 2 * m)
    top = np.clip((rows[0] + 40 - ys) / 40.0, 0, 1)[:, None]               # above the forehead: the photo's own hair stays
    m = np.maximum(m, top * top * (3 - 2 * top))
    band = face & sk & (inside > inset + 12) & (inside < inset + 36)
    zb = np.linspace(-0.06, 0.28, 35); zc, cols = [], []
    for z0, z1 in zip(zb[:-1], zb[1:]):
        mm = band & (P[..., 2] >= z0) & (P[..., 2] < z1)
        if mm.sum() > 20: zc.append((z0 + z1) / 2); cols.append(np.median(warp[mm], 0))
    tab = np.array(cols)
    edge = np.stack([np.interp(P[..., 2], zc, tab[:, i]) for i in range(3)], -1)
    return m.astype(np.float32), edge


def make_heads(names):
    g = {"__file__": os.path.join(H, "paint_heads.py")}
    src = open(os.path.join(H, "paint_heads.py")).read()
    exec(src[:src.index("prof = np.asarray")], g)                       # ISL, P, COV, paint(), fill_map(), row_colour() ...
    ISL, P, COV, paint, fill_map, row_colour = (g[k] for k in ("ISL", "P", "COV", "paint", "fill_map", "row_colour"))
    EYES = json.load(open(os.path.join(H, "flow", "eyes.json")))
    prof = np.asarray(Image.open(os.path.join(HB, "head_1k.png")).convert("RGB")).astype(np.float32)
    mx, mn = prof.max(-1), prof.min(-1); hair = np.clip((0.30 - (mx - mn) / np.maximum(mx, 1)) / 0.08, 0, 1)[..., None]
    face = ISL["front"] & COV
    skins = json.load(open(SKIN_JSON)) if os.path.exists(SKIN_JSON) else {}
    for name in names:
        hair_col = HAIR[name]
        e = EYES[f"face_{name}"]; photo = Image.open(os.path.join(H, "flow", f"face_{name}.jpg")).convert("RGB")
        (lx, ly), (rx, ry) = e["l"], e["r"]
        ph = np.asarray(photo).astype(np.float32)
        fc = ph[int(ly):int(ly) + 90, int(lx):int(rx)]                         # cheeks + nose
        if ((fc.max(-1) - fc.min(-1)) / np.maximum(fc.max(-1), 1)).mean() < 0.16:     # Flow made a vintage B&W photo: colourise
            l = ph.mean(-1, keepdims=True) / 255
            ph = np.clip(l * np.array([238.0, 182, 140]) * (0.85 + 0.45 * l), 0, 255)
            photo = Image.fromarray(ph.astype(np.uint8))
        s = (368 - 180) / (rx - lx); cxp, cyp, cxa, cya = (lx + rx) / 2, (ly + ry) / 2, 274, 352.5      # eyes -> atlas eyes
        warp = np.asarray(photo.transform((1024, 1024), Image.AFFINE, (1 / s, 0, cxp - cxa / s, 0, 1 / s, cyp - cya / s), Image.BICUBIC)).astype(np.float32)
        cheek = face & (np.abs(P[..., 0]) < 0.03) & (np.abs(P[..., 2] - 0.1) < 0.03)
        skin = np.median(warp[cheek], 0)
        skin_him = np.median(prof[cheek], 0)
        lum = prof.mean(-1, keepdims=True)
        rec = (prof * (skin / skin_him)) * (1 - hair) + (lum / 160 * np.array(hair_col)) * hair
        wmx, wmn = warp.max(-1), warp.min(-1)
        bg = ((wmx - wmn) / np.maximum(wmx, 1) < 0.10) & (warp.mean(-1) > 150) & (P[..., 2] < 0.12)       # grey studio bg above the hair
        warp = np.where(bg[..., None], skin * 0.93, warp)
        # The photo is kept only inside its own face oval: past the cheeks it holds the photo's side hair/ears/background,
        # which paint() wraps round to ~70 deg and reads as a second jawline beside the face in 3/4 (a doubled face).
        m, edge = face_oval(warp, skin, face, P)
        fill = fill_map(skin, np.array(hair_col, float), 0.215, 0.13, edge, nape=0.12)
        srcm = np.where(face[..., None], warp * m[..., None] + fill[0] * (1 - m[..., None]), rec)
        a = np.clip(paint(srcm, *fill, nape_hair=np.array(hair_col, float)), 0, 255).astype(np.uint8)
        Image.fromarray(a).resize((128, 128), Image.BOX).save(os.path.join(OUT, f"{name}_head_128.png"))
        Image.fromarray(a).save(os.path.join(OUT, f"{name}_head_1k.png"))
        skins[name] = [float(c) for c in skin]
        print(name, "skin", skin.round())
    json.dump(skins, open(SKIN_JSON, "w"), indent=1)
    return skins


# ------------------------------------------------------------------ body atlas -> 3D
S = 1024
PARTS = ["torso", "collar", "lapel", "skirt", "upperarm", "forearm", "hand", "fingers", "index", "hips", "thigh", "calf", "shoe"]
# who wins a texel shared by several parts (front faces beat back faces of the same part)
PRI = {"collar": 9, "hand": 9, "fingers": 9, "index": 9, "shoe": 9, "torso": 7, "lapel": 6, "forearm": 6, "upperarm": 5,
       "skirt": 8, "calf": 5, "thigh": 4, "hips": 6}


def locate():
    """Rasterise hombre's body polygons into the 1k atlas: per (texel, user) the 3D point, normal, part, side."""
    pix, pos, nrm, prt, side = [], [], [], [], []
    for name, n, uv, vs in json.load(open(os.path.join(OUT, "body_uv.json"))):
        uv = np.array(uv) * [S, -S] + [0, S]; vs = np.array(vs)
        for i in range(1, len(uv) - 1):
            t = uv[[0, i, i + 1]]; tv = vs[[0, i, i + 1]]
            x0, y0 = np.floor(t.min(0)).astype(int); x1, y1 = np.ceil(t.max(0)).astype(int)
            gx, gy = np.meshgrid(np.arange(max(x0, 0), min(x1 + 1, S)), np.arange(max(y0, 0), min(y1 + 1, S)))
            px = np.stack([gx.ravel() + 0.5, gy.ravel() + 0.5], 1)
            T = np.array([t[1] - t[0], t[2] - t[0]]).T
            if abs(np.linalg.det(T)) < 1e-9:
                continue
            ab = np.linalg.solve(T, (px - t[0]).T).T
            w = np.column_stack([1 - ab.sum(1), ab])
            ok = (w > -0.02).all(1)
            if not ok.any():
                continue
            w = w[ok]
            pix.append(gy.ravel()[ok] * S + gx.ravel()[ok]); pos.append(w @ tv)
            nrm.append(np.repeat([n], ok.sum(), 0)); prt.append(np.full(ok.sum(), PARTS.index(name.split("_")[0])))
            side.append(np.full(ok.sum(), 1 if name.endswith("_L") else -1 if name.endswith("_R") else 0))
    return (np.concatenate(pix), np.concatenate(pos), np.concatenate(nrm), np.concatenate(prt), np.concatenate(side))


def noise(seed, cell, aniso=1.0):
    """Smooth value noise over the atlas (cell px, aniso > 1 = streaks along v)."""
    r = np.random.default_rng(seed)
    w, h = max(2, int(S / cell)), max(2, int(S / (cell * aniso)))
    a = Image.fromarray((r.random((h, w)) * 255).astype(np.uint8)).resize((S, S), Image.BICUBIC)
    return np.asarray(a).astype(np.float32).ravel() / 255 - 0.5


class Ctx:
    """Users of the atlas: point P (x left+, y back+, z up), normal N, part name, side L/R."""
    def __init__(s, loc, seed):
        s.pix, s.P, s.N, s.part, s.side = loc
        s.x, s.y, s.z = s.P.T
        s.front, s.back = s.N[:, 1] < -0.5, s.N[:, 1] > 0.5
        s.U, s.V = (s.pix % S).astype(np.float32), (s.pix // S).astype(np.float32)
        s.tf = (s.U >= 512) & (s.V < 512)                          # the torso_front zone
        s.rng = np.random.default_rng(seed); s.seed = seed
        s.n = {k: noise(seed + i, c, a)[s.pix] for i, (k, c, a) in enumerate(
            (("grain", 2, 1), ("fine", 6, 1), ("mid", 24, 1), ("blot", 70, 1), ("drape", 18, 7), ("big", 160, 1)))}
        s.grain = s.n["grain"]

    def p(s, *names):
        m = np.zeros(len(s.pix), bool)
        for n in names:
            m |= s.part == PARTS.index(n)
        return m


def fabric(c, col, weave=0.10, drape=0.10, dirt=0.0, dirt_col=(70, 60, 40)):
    """Cloth colour with weave grain, vertical drape folds and blotchy dirt/sweat."""
    k = 1 + weave * (c.n["grain"] * 1.4 + c.n["fine"] * 0.8) + drape * c.n["drape"] * 2 + 0.06 * c.n["mid"]
    out = np.array(col, np.float32)[None] * k[:, None]
    if dirt:
        d = np.clip((c.n["blot"] + 0.35 * c.n["mid"] + 0.12) * 3.2, 0, 1)[:, None] * dirt
        out = out * (1 - d) + np.array(dirt_col, np.float32) * d
    return out


def folds(c, rgb, z0, width, period, amp, m=None):
    """Horizontal wrinkle bands round height z0 (elbows, knees, waist bunching)."""
    w = np.exp(-((c.z - z0) / width) ** 2) * np.sin((c.z - z0) / period * 6.283 + c.n["mid"] * 4 + c.x * 30)
    if m is not None:
        w = w * m
    return rgb * (1 + amp * w)[:, None]


def shade(c, rgb, m, k):
    rgb[m] *= k
    return rgb


def box(c, x0, x1, z0, z1):
    return (c.x >= x0) & (c.x <= x1) & (c.z >= z0) & (c.z <= z1)


def outline(c, x0, x1, z0, z1, w=0.005):
    return box(c, x0, x1, z0, z1) & ~box(c, x0 + w, x1 - w, z0 + w, z1 - w)


def disc(c, cx, cz, r):
    return (c.x - cx) ** 2 + (c.z - cz) ** 2 <= r * r


def buttons(c, rgb, m, xs, zs, r, col, rim=0.6):
    for x in xs:
        for z in zs:
            d = m & disc(c, x, z, r)
            rgb[d] = np.array(col, np.float32) * (1 + 0.25 * np.clip((c.x[d] - x + z - c.z[d]) / r, -1, 1)[:, None])
            sh = m & disc(c, x + 0.002, z - 0.003, r * 1.25) & ~d
            rgb[sh] *= rim


def skin_parts(c, rgb, skin):
    m = c.p("hand", "fingers", "index")
    sk = np.array(skin, np.float32)
    rgb[m] = sk * (1 + 0.06 * c.n["fine"][m] + 0.04 * c.grain[m])[:, None]
    knuck = m & c.p("fingers", "index") & (np.abs(np.sin(c.V * 0.55)) > 0.92)
    rgb[knuck] *= 0.88
    return rgb


def bare(c, rgb, m, skin, hair=0.0):
    """Exposed skin on a clothing part (rolled sleeves, tank-top arms, stockings)."""
    sk = np.array(skin, np.float32)
    rgb[m] = sk * (1 + 0.05 * c.n["fine"][m] + 0.05 * c.n["mid"][m] - hair * np.clip(c.grain[m] - 0.3, 0, 1))[:, None]


def shoe(c, rgb, upper, sole=(28, 24, 22), laces=None, shine=0.0, toecap=None, boot=False, heel=False):
    m = c.p("shoe")
    rgb[m] = fabric(c, upper, weave=0.04, drape=0.0)[m] * (1 + 0.12 * c.n["mid"][m])[:, None]
    if shine:
        hl = m & (c.n["mid"] > 0.18)
        rgb[hl] = rgb[hl] * (1 - shine) + 200 * shine
    s = m & (c.z < 0.022)
    rgb[s] = sole
    if heel:                                                     # stiletto read: dark heel block at the back
        rgb[m & (c.y > 0.035) & (c.z < 0.06)] = np.array(sole, np.float32)
    if toecap is not None:
        rgb[m & (c.y < -0.11) & (c.z > 0.02)] *= toecap
    if laces is not None:
        top = m & (c.N[:, 2] > 0.5) & (np.abs(c.x - c.side * 0.115) < 0.016) & (c.y > -0.10) & (c.y < -0.01)
        rgb[top & (np.sin(c.y * 420) > 0.2)] = laces
    if boot:                                                     # hiking boot collar padding
        rgb[m & (c.z > 0.085)] *= 0.75
    return rgb


def calf_wrap(c, rgb, col, z0=0.09, z1=0.42, pitch=0.035):
    """Puttees: a cloth strip spiralled round the calf, overlapping diagonal turns."""
    m = c.p("calf") & (c.z > z0) & (c.z < z1)
    h = (c.x * 0.6 + c.y * 0.6) * c.side
    t = ((c.z + h * 0.25) / pitch) % 1.0
    base = fabric(c, col, weave=0.14, drape=0.02)[m]
    edge = (t[m] < 0.16)[:, None]
    base = base * (0.92 + 0.12 * t[m])[:, None] * np.where(edge, 0.62, 1.0)
    rgb[m] = base
    top = c.p("calf") & (np.abs(c.z - z1) < 0.008)
    rgb[top] *= 0.6
    return rgb


def spread(c, m, users):
    """A feature some users of a texel want, given to every texel user in `users` (shared-UV back details)."""
    img = np.zeros(S * S, bool); img[c.pix[m]] = True
    return img[c.pix] & users


def seam(c, rgb, m, k=0.72):
    rgb[m] *= k
    return rgb


def stitches(c, rgb, m, col, period=6):
    rgb[m & ((c.U + c.V) % period < period / 2)] = col


# ------------------------------------------------------------------ outfits
def common_wear(c, rgb):
    """Baked shading every outfit shares: armpit shadow, crotch, elbow and knee wrinkles, collar shadow."""
    arm = c.p("upperarm", "forearm")
    rgb = folds(c, rgb, 1.09, 0.04, 0.018, 0.22, arm)
    leg = c.p("thigh", "calf")
    rgb = folds(c, rgb, 0.50, 0.05, 0.02, 0.20, leg)
    rgb = folds(c, rgb, 0.10, 0.04, 0.02, 0.12, c.p("calf"))
    tor = c.p("torso", "lapel")
    rgb[tor & (np.abs(c.x) > 0.15) & (c.z > 1.15) & (c.z < 1.37) & ~c.front] *= 0.82
    rgb[c.p("upperarm") & (c.z > 1.38)] *= 1.06
    rgb[c.p("torso") & c.front & (c.z > 1.44)] *= 0.78                      # under the collar
    return rgb


def ija(c, skin, tone, variant):
    """Imperial Japanese Army tropical uniform, worn for decades in the jungle."""
    khaki = np.array(tone, np.float32)
    rgb = fabric(c, khaki, weave=0.12, drape=0.12, dirt=0.35, dirt_col=khaki * 0.55)
    sweat = np.clip(c.n["blot"] * 3.5 + 0.2, 0, 1) * (c.p("torso", "lapel", "upperarm") & (c.z > 1.05))
    rgb *= (1 - 0.22 * sweat)[:, None]
    trous = c.p("thigh", "calf", "hips")
    rgb[trous] = fabric(c, khaki * 0.92, weave=0.12, drape=0.16, dirt=0.5, dirt_col=(70, 58, 38))[trous]
    rgb[trous & (c.z < 0.55)] *= 0.86                                        # mud up the legs
    tf = c.tf
    if variant == "tunic":                                                   # akatsu: buttoned 4-pocket tunic, belt, pouches
        col = c.p("collar")
        rgb[col] = fabric(c, khaki * 0.95, weave=0.12)[col]
        rgb[tf & (np.abs(c.x) < 0.006)] *= 0.72                               # placket edge
        rgb[tf & (np.abs(c.x - 0.012) < 0.003)] *= 0.85
        buttons(c, rgb, tf, [0.0], [1.40, 1.30, 1.20, 1.10, 1.03], 0.008, (120, 100, 52))
        for sx in (-1, 1):                                                   # pleated chest pockets with scalloped flaps
            x0, x1 = (0.03, 0.105) if sx > 0 else (-0.105, -0.03)
            rgb[tf & box(c, x0, x1, 1.20, 1.34)] *= 0.97
            rgb[tf & outline(c, x0, x1, 1.20, 1.34, 0.004)] *= 0.62
            rgb[tf & (np.abs(c.x - (x0 + x1) / 2) < 0.004) & (c.z > 1.20) & (c.z < 1.30)] *= 0.8   # box pleat
            fl = tf & box(c, x0 - 0.004, x1 + 0.004, 1.30, 1.35) & (c.z - 1.30 < 0.05 - np.abs(c.x - (x0 + x1) / 2) * 0.25)
            rgb[fl] = rgb[fl] * 1.04
            rgb[tf & box(c, x0 - 0.004, x1 + 0.004, 1.292, 1.30)] *= 0.55
            buttons(c, rgb, tf, [(x0 + x1) / 2], [1.315], 0.006, (120, 100, 52))
            lx0, lx1 = (0.03, 0.09) if sx > 0 else (-0.09, -0.03)              # lower pockets
            rgb[tf & outline(c, lx0, lx1, 1.04, 1.13, 0.004)] *= 0.62
            rgb[tf & box(c, lx0, lx1, 1.125, 1.135)] *= 0.62
        patch = tf & box(c, -0.07, -0.035, 1.15, 1.185)                      # a sewn patch
        rgb[patch] = fabric(c, khaki * 0.8 + [6, 6, 0], weave=0.2)[patch]
        rgb[tf & outline(c, -0.07, -0.035, 1.15, 1.185, 0.003) & (np.sin(c.U * 1.3) > 0)] *= 0.5
        belt(c, rgb, (82, 54, 30), (150, 128, 70), pouches=True)
        calf_wrap(c, rgb, khaki * 0.85)
        rgb = shoe(c, rgb, (64, 46, 30), laces=(40, 30, 20))
    elif variant == "shirt":                                                 # shimada: open-collar shirt, sleeves rolled
        col = c.p("collar")
        rgb[col] = fabric(c, khaki * 1.05, weave=0.12)[col]
        v = tf & (c.z > 1.36) & (np.abs(c.x) < (c.z - 1.36) * 0.75)             # open neck: V of skin
        bare(c, rgb, v, np.array(skin) * 0.95, hair=0.1)
        vedge = tf & (c.z > 1.33) & (np.abs(np.abs(c.x) - (c.z - 1.36) * 0.75) < 0.012) & ~v
        rgb[vedge] *= 0.7                                                  # collar points laid open
        rgb[tf & (c.z > 1.33) & (np.abs(np.abs(c.x) - (c.z - 1.36) * 0.75 - 0.03) < 0.02) & ~v] *= 1.08
        rgb[tf & (np.abs(c.x + 0.012) < 0.004) & (c.z < 1.36)] *= 0.72
        buttons(c, rgb, tf, [-0.002], [1.28, 1.19, 1.10, 1.01], 0.006, (225, 215, 190))
        for x0, x1 in ((0.035, 0.105), (-0.105, -0.035)):                     # two plain chest pockets
            rgb[tf & outline(c, x0, x1, 1.17, 1.28, 0.004)] *= 0.66
            rgb[tf & box(c, x0, x1, 1.262, 1.27)] *= 0.7
        fa = c.p("forearm")                                                 # rolled sleeves: bare forearms + cuff roll
        bare(c, rgb, fa & (c.z < 1.03), skin, hair=0.3)
        roll = fa & (c.z >= 1.03) & (c.z < 1.085)
        rgb[roll] = fabric(c, khaki * 1.1, weave=0.18)[roll] * (1 + 0.25 * np.sin((c.z[roll] - 1.03) * 170))[:, None]
        rgb[fa & (np.abs(c.z - 1.03) < 0.006)] *= 0.55
        belt(c, rgb, (120, 108, 70), (140, 140, 130), pouches=False, w=0.03)  # canvas web belt
        calf_wrap(c, rgb, khaki * 0.78 + [0, 4, 0], pitch=0.045)
        rgb = shoe(c, rgb, (90, 70, 44), laces=(50, 40, 28))
    else:                                                                   # kozuka: open tunic, vest undershirt, towel
        vest = tf & (np.abs(c.x) < 0.14)
        rgb[vest] = fabric(c, (206, 198, 172), weave=0.16, drape=0.08, dirt=0.4, dirt_col=(150, 130, 90))[vest]
        rib = vest & (np.sin(c.U * 1.6) > 0.4)
        rgb[rib] *= 0.93
        neck = tf & (c.z > 1.35) & ((c.x / 0.07) ** 2 + ((c.z - 1.50) / 0.13) ** 2 < 1)   # scoop neck
        bare(c, rgb, neck, skin, hair=0.05)
        rgb[tf & (c.z > 1.33) & (np.abs((c.x / 0.075) ** 2 + ((c.z - 1.50) / 0.14) ** 2 - 1) < 0.18) & ~neck] *= 0.82
        for sx in (-1, 1):                                                  # towel ends hanging from the neck
            t = tf & (sx * c.x > 0.035) & (sx * c.x < 0.085) & (c.z > 1.12)
            rgb[t] = fabric(c, (232, 228, 214), weave=0.3, drape=0.05)[t] * (1 + 0.08 * np.sin(c.V[t] * 1.2))[:, None]
            rgb[t & (c.z < 1.135)] *= 0.75
            rgb[t & (np.abs(c.z - 1.16) < 0.006)] = (150, 60, 50)              # a red stripe near the end
            rgb[tf & (sx * c.x > 0.085) & (sx * c.x < 0.093) & (c.z > 1.12)] *= 0.6
        towel_back = c.p("torso", "lapel") & ~c.tf & (c.z > 1.42) & (np.abs(c.x) < 0.12)
        towel_back = spread(c, towel_back & c.back, c.p("torso", "lapel") & ~c.tf)
        rgb[towel_back] = fabric(c, (232, 228, 214), weave=0.3)[towel_back]
        col = c.p("collar")
        rgb[col] = fabric(c, (232, 228, 214), weave=0.3)[col]
        inner = c.p("lapel") & (np.abs(c.N[:, 0]) < 0.6) & (np.abs(c.x) < 0.10) & c.front
        rgb[inner] *= 0.82
        belt(c, rgb, (54, 40, 26), (110, 100, 70), pouches=False, w=0.035, only_front=True)
        tr = c.p("thigh") & box(c, 0.03, 0.14, 0.50, 0.60)                    # knee patches
        rgb[tr] = fabric(c, khaki * 0.7 + [10, 6, 0], weave=0.25)[tr]
        rgb[c.p("thigh") & outline(c, 0.03, 0.14, 0.50, 0.60, 0.004) & (np.sin(c.V * 1.3) > 0)] *= 0.5
        calf_wrap(c, rgb, khaki * 0.95, pitch=0.03)
        rgb = shoe(c, rgb, (46, 38, 30), laces=None, toecap=0.8)
    return rgb


def belt(c, rgb, col, buckle, pouches, w=0.04, z=0.975, only_front=False):
    m = (np.abs(c.z - z) < w / 2) & c.p("torso", "skirt", "lapel")
    if only_front:
        m &= c.tf
    b = fabric(c, col, weave=0.08, drape=0.0)
    rgb[m] = b[m]
    rgb[m & (np.abs(np.abs(c.z - z) - w / 2) < 0.004)] *= 0.6
    bk = c.tf & (np.abs(c.x) < 0.028) & (np.abs(c.z - z) < w / 2 + 0.006)
    rgb[bk] = buckle
    rgb[bk & (np.abs(c.x) < 0.017) & (np.abs(c.z - z) < w / 2 - 0.004)] = np.array(col, np.float32) * 0.7
    if pouches:                                                             # Type 30 cartridge boxes left and right
        for sx in (-1, 1):
            p = c.tf & box(c, *sorted((sx * 0.045, sx * 0.115)), z - 0.045, z + 0.035)
            rgb[p] = fabric(c, (96, 64, 36), weave=0.1)[p] * (1 + 0.1 * c.n["mid"][p])[:, None]
            rgb[c.tf & box(c, *sorted((sx * 0.045, sx * 0.115)), z + 0.012, z + 0.035)] *= 1.1     # lid
            rgb[c.tf & box(c, *sorted((sx * 0.045, sx * 0.115)), z + 0.008, z + 0.013)] *= 0.55
            rgb[c.tf & outline(c, *sorted((sx * 0.045, sx * 0.115)), z - 0.045, z + 0.035, 0.004)] *= 0.55
            buttons(c, rgb, c.tf, [sx * 0.08], [z + 0.002], 0.005, (160, 140, 80))


def suzuki(c, skin):
    """1974 backpacker: rust-and-mustard 70s print shirt with a big collar, flared jeans, hiking boots."""
    a, b, d = np.array([176, 78, 34.]), np.array([218, 160, 52.]), np.array([96, 46, 26.])
    # print: wavy vertical bands + flower discs (atlas space so it repeats round the body)
    wave = np.sin((c.U + 22 * np.sin(c.V * 0.045)) * 0.098)
    rgb = np.where((wave > 0.35)[:, None], b, np.where((wave < -0.55)[:, None], d, a))
    fx, fy = (c.U % 64) - 32, ((c.V + 32 * ((c.U // 64) % 2)) % 64) - 32
    r = np.hypot(fx, fy); ang = np.arctan2(fy, fx)
    petal = r < 13 + 5 * np.cos(ang * 5)
    rgb = np.where(petal[:, None], np.array([238, 224, 180.]), rgb)
    rgb = np.where((r < 5)[:, None], d, rgb)
    rgb = rgb * (1 + 0.08 * c.grain + 0.18 * c.n["drape"] + 0.05 * c.n["mid"])[:, None]
    tf = c.tf
    v = tf & (c.z > 1.30) & (np.abs(c.x) < (c.z - 1.30) * 0.6)                 # unbuttoned to the chest
    bare(c, rgb, v, np.array(skin) * 0.96)
    for sx in (-1, 1):                                                       # huge pointed 70s collar laid flat
        cl = tf & (sx * c.x > 0) & (c.z > 1.30) & (np.abs(c.x) >= (c.z - 1.30) * 0.6) & (np.abs(c.x) < (c.z - 1.30) * 0.6 + 0.05 + (c.z - 1.30) * 0.3)
        rgb[cl] = rgb[cl] * 0.92
        rgb[tf & (sx * c.x > 0) & (c.z > 1.29) & (np.abs(np.abs(c.x) - ((c.z - 1.30) * 0.9 + 0.05)) < 0.004)] *= 0.5
    rgb[tf & (np.abs(c.x) < 0.005) & (c.z < 1.30)] *= 0.7
    buttons(c, rgb, tf, [0.0], [1.22, 1.12, 1.02, 0.94], 0.006, (240, 232, 210))
    col = c.p("collar")
    rgb[col] *= 0.92
    fa = c.p("forearm")                                                       # cuffs
    rgb[fa & (c.z < 0.86)] *= 0.85
    rgb[fa & (np.abs(c.z - 0.86) < 0.005)] *= 0.6
    # flared jeans
    leg = c.p("thigh", "calf", "hips")
    den = fabric(c, (58, 84, 128), weave=0.22, drape=0.18)
    diag = (np.sin((c.U + c.V) * 1.1) > 0.3)
    den = den * np.where(diag, 1.06, 0.95)[:, None]
    fade = np.clip((0.30 - np.abs(c.x - c.side * 0.095)) / 0.30, 0, 1) * c.front * (c.p("thigh"))     # faded thigh fronts
    den = den + (fade * 50 * (0.6 + c.n["mid"]))[:, None] * np.array([0.8, 0.95, 1.0])
    rgb[leg] = den[leg]
    rgb = folds(c, rgb, 0.70, 0.04, 0.015, 0.15, c.p("thigh") & c.front)       # whiskers
    side_seam = leg & (np.abs(c.N[:, 0]) > 0.5) & (np.abs(c.y) < 0.01)
    rgb[side_seam] *= 0.72
    stitches(c, rgb, leg & (np.abs(c.N[:, 0]) > 0.5) & (np.abs(np.abs(c.y) - 0.012) < 0.0025), (210, 150, 60))
    hem = c.p("calf") & (c.z < 0.11)
    rgb[hem] = rgb[hem] * 0.82
    stitches(c, rgb, c.p("calf") & (np.abs(c.z - 0.10) < 0.003), (210, 150, 60))
    rgb[c.p("calf") & (c.z < 0.085)] *= 0.7
    knee = c.p("thigh") & box(c, -0.15, -0.04, 0.50, 0.57)                 # worn-through knee: pale threads
    rgb[knee] = rgb[knee] * 0.4 + np.array([200, 205, 210.]) * 0.6 * (1 + 0.2 * (np.sin(c.V[knee] * 2.2) > 0))[:, None]
    rgb = shoe(c, rgb, (128, 92, 56), sole=(40, 30, 24), laces=(190, 40, 30), boot=True)
    return rgb


def woman(c, skin):
    """1945: red polka-dot dress, white collar, belt, stockings with a back seam, heels."""
    red = np.array([178, 34, 42.])
    rgb = fabric(c, red, weave=0.06, drape=0.2)
    dx, dy = (c.U % 28) - 14, ((c.V + 14 * ((c.U // 28) % 2)) % 28) - 14
    dot = np.hypot(dx, dy) < 5.2
    rgb[dot] = np.array([242, 236, 226.]) * (1 + 0.05 * c.grain[dot])[:, None]
    tf = c.tf
    col = c.p("collar")
    rgb[col] = fabric(c, (240, 238, 230), weave=0.05)[col]
    for sx in (-1, 1):                                                       # peter-pan collar flaps
        pc = tf & (np.hypot(c.x - sx * 0.04, c.z - 1.44) < 0.045) & (c.z < 1.47)
        rgb[pc] = fabric(c, (240, 238, 230), weave=0.05)[pc]
        rgb[tf & (np.abs(np.hypot(c.x - sx * 0.04, c.z - 1.44) - 0.045) < 0.004) & (c.z < 1.46)] *= 0.6
    neck = tf & (c.z > 1.43) & (np.abs(c.x) < 0.012 + (c.z - 1.43) * 0.6)
    bare(c, rgb, neck, skin)
    buttons(c, rgb, tf, [0.0], [1.35, 1.27, 1.19, 1.11], 0.007, (245, 240, 230))
    rgb[tf & (c.z > 1.03) & (c.z < 1.40) & (np.abs(c.x) < 0.15)] *= (1 + 0.15 * np.sin(c.x * 140))[tf & (c.z > 1.03) & (c.z < 1.40) & (np.abs(c.x) < 0.15)][:, None]   # bodice gathers
    belt(c, rgb, (236, 232, 222), (200, 170, 70), pouches=False, w=0.035, z=1.0)
    sk = c.p("skirt")                                                       # skirt pleats + hem
    rgb[sk] *= (1 + 0.16 * np.sin(c.U[sk] * 0.4) + 0.05 * c.n["mid"][sk])[:, None]
    rgb[sk & (c.z < 0.80)] *= 0.75
    fa = c.p("forearm")                                                     # short puff sleeves: bare forearms
    bare(c, rgb, fa & (c.z < 1.12), skin)
    rgb[fa & (c.z >= 1.12) & (c.z < 1.15)] = (240, 238, 230)                # white sleeve band at the elbow
    leg = c.p("thigh", "calf")                                              # nylons: skin, a touch darker, seam up the back
    stock = np.array(skin, np.float32) * np.array([0.97, 0.93, 0.90])
    rgb[leg] = stock * (1 + 0.05 * c.n["mid"][leg] + 0.04 * c.grain[leg])[:, None]
    rgb[leg & c.back & (np.abs(c.x - c.side * 0.095) < 0.004)] *= 0.55
    rgb[c.p("hips")] = stock
    rgb = shoe(c, rgb, (110, 18, 22), sole=(30, 10, 12), shine=0.25, heel=True)
    return rgb


def sailor(c, skin):
    """US Navy dress whites: jumper with the navy square collar (3 white stripes), black neckerchief, bell-bottoms."""
    white = np.array([232, 234, 236.])
    rgb = fabric(c, white, weave=0.06, drape=0.14, dirt=0.08, dirt_col=(190, 190, 180))
    navy = np.array([30, 38, 78.])
    tf = c.tf

    def stripes(m, dist):
        rgb[m] = navy * (1 + 0.06 * c.grain[m])[:, None]
        for d in (0.010, 0.018, 0.026):
            rgb[m & (np.abs(dist - d) < 0.0028)] = white * 0.95

    # front V: the collar comes down to a point at the neckerchief knot
    vz = 1.22
    half = (c.z - vz) * 0.55
    vin = tf & (c.z > vz) & (np.abs(c.x) < half)
    bare_v = vin & (np.abs(c.x) < half - 0.045)
    band = vin & ~bare_v
    stripes(band, half - np.abs(c.x))
    under = bare_v & (c.z > 1.27)                                          # white undershirt in the V
    rgb[bare_v] = white
    bare(c, rgb, bare_v & (c.z > 1.42) & (np.abs(c.x) < 0.04), skin)
    # neckerchief: knot at the V, two tails
    knot = tf & (np.hypot(c.x, (c.z - vz - 0.01) * 1.3) < 0.022)
    tails = tf & (c.z < vz) & (c.z > vz - 0.13) & (np.abs(c.x) < 0.012 + (vz - c.z) * 0.18) & (np.abs(c.x) > (vz - c.z) * 0.06)
    for m, k in ((tails, 1.0), (knot, 1.25)):
        rgb[m] = np.array([20, 20, 24.]) * k * (1 + 0.1 * c.n["fine"][m])[:, None]
    rgb[tf & (c.z < vz - 0.128) & (c.z > vz - 0.14) & (np.abs(c.x) < 0.04)] *= 0.97
    # back: square collar flap over the shoulders (also the collar strap round the neck)
    flap = c.p("torso", "lapel") & (c.z > 1.23) & (np.abs(c.x) < 0.17) & ~c.tf
    flap = spread(c, flap & ~c.front, (c.p("torso", "lapel") & ~c.tf) | (c.p("upperarm") & (np.abs(c.N[:, 0]) > 0.5))) | flap
    stripes(flap, np.where(c.z > 1.23, c.z - 1.23, 0.2))
    rgb[c.p("collar")] = navy
    rgb[c.p("upperarm", "forearm") & (c.z > 1.42)] = navy
    fa = c.p("forearm")                                                     # navy cuffs with stripes
    cuff = fa & (c.z < 0.88)
    rgb[cuff] = navy
    rgb[cuff & (np.abs(c.z - 0.86) < 0.003)] = white
    rgb[cuff & (np.abs(c.z - 0.87) < 0.003)] = white
    # waist: jumper hem over the trousers + bell-bottoms
    rgb[c.p("skirt") & (c.z < 0.9)] *= 0.9
    leg = c.p("thigh", "calf")
    rgb[leg] = fabric(c, white * 0.98, weave=0.06, drape=0.2)[leg]
    rgb[leg & c.front & (np.abs(c.x - c.side * 0.095) < 0.004)] *= 0.86        # crease
    rgb[c.p("calf") & (c.z < 0.1)] *= 0.85
    rgb = shoe(c, rgb, (22, 22, 24), sole=(10, 10, 10), shine=0.35, laces=(10, 10, 10))
    return rgb


def oldman(c, skin):
    """Three-piece grey pinstripe: open jacket, buttoned waistcoat, white shirt, maroon tie, pocket square."""
    grey = np.array([96, 98, 104.])
    rgb = fabric(c, grey, weave=0.10, drape=0.12)
    pin = (c.U % 14) < 1.6
    rgb[pin] = rgb[pin] * 0.55 + 200 * 0.45
    tf = c.tf
    vest = tf & (c.z < 1.36)
    vest_rgb = fabric(c, grey * 0.92, weave=0.08, drape=0.05)
    vest_rgb[pin] = vest_rgb[pin] * 0.55 + 190 * 0.45
    rgb[vest] = vest_rgb[vest]
    vneck = tf & (c.z > 1.12) & (np.abs(c.x) < (c.z - 1.12) * 0.42)
    rgb[vneck] = fabric(c, (236, 236, 232), weave=0.05)[vneck]
    rgb[tf & (c.z > 1.12) & (np.abs(np.abs(c.x) - (c.z - 1.12) * 0.42) < 0.004)] *= 0.55
    tie = tf & (np.abs(c.x) < 0.016 + (1.44 - c.z) * 0.04) & (c.z > 1.12)
    rgb[tie] = np.array([120, 26, 36.]) * (1 + 0.08 * c.grain[tie] + 0.3 * ((c.V[tie] + c.U[tie]) % 10 < 2))[:, None]
    knot = tf & (np.abs(c.x) < 0.02) & (c.z > 1.425)
    rgb[knot] = np.array([100, 20, 30.])
    rgb[tf & (np.abs(c.x) < 0.005) & (c.z < 1.12)] *= 0.6
    buttons(c, rgb, tf, [0.0], [1.08, 1.03, 0.98, 0.93], 0.006, (40, 34, 30))
    for sx in (-1, 1):
        rgb[tf & box(c, *sorted((sx * 0.035, sx * 0.075)), 1.0, 1.007)] *= 0.55          # welt pockets
        chain = tf & (np.abs(c.z - (1.00 - 0.12 * ((c.x - sx * 0.005) * sx) + 1.5 * (c.x * sx - 0.04) ** 2)) < 0.003) & (sx * c.x > 0.005) & (sx * c.x < 0.07)
        if sx > 0:
            rgb[chain] = (210, 180, 90)
    sq = tf & (c.x > 0.09) & (c.x < 0.118) & (c.z > 1.25) & (c.z < 1.29) & (c.z < 1.27 + (c.x - 0.09) * 1.2)     # pocket square
    rgb[sq] = (238, 236, 228)
    col = c.p("collar")
    rgb[col] = fabric(c, (236, 236, 232), weave=0.05)[col]
    fa = c.p("forearm")
    rgb[fa & (c.z < 0.845)] = fabric(c, (236, 236, 232), weave=0.05)[fa & (c.z < 0.845)]          # shirt cuffs
    leg = c.p("thigh", "calf", "hips")
    rgb[leg & c.front & (np.abs(c.x - c.side * 0.095) < 0.004)] *= 1.18         # pressed crease
    rgb[c.p("calf") & (c.z < 0.1)] *= 0.85
    rgb = shoe(c, rgb, (28, 22, 20), sole=(12, 10, 10), shine=0.4, toecap=0.8, laces=(14, 12, 12))
    return rgb


def worker(c, skin):
    """Denim bib overalls with straps over a red check work shirt, sleeves rolled, work boots."""
    red, dk = np.array([168, 46, 40.]), np.array([70, 20, 22.])
    cu, cv = (c.U % 24) < 8, (c.V % 24) < 8
    shirt = np.where((cu & cv)[:, None], dk, np.where((cu | cv)[:, None], red * 0.8, red))
    shirt = shirt * (1 + 0.1 * c.grain + 0.12 * c.n["drape"])[:, None]
    shirt[(c.U % 24 == 3) | (c.V % 24 == 3)] = [196, 170, 120]
    rgb = shirt.copy()
    den = fabric(c, (54, 82, 128), weave=0.22, drape=0.15, dirt=0.25, dirt_col=(80, 80, 72))
    den = den * np.where(np.sin((c.U + c.V) * 1.1) > 0.3, 1.06, 0.95)[:, None]
    tf = c.tf
    bib = tf & (np.abs(c.x) < 0.11) & (c.z < 1.30)
    low = c.p("torso", "lapel", "skirt") & (c.z < 1.05) & ~c.tf               # overalls round the waist and hips
    legs = c.p("thigh", "calf", "hips")
    for m in (bib, low, legs):
        rgb[m] = den[m]
    rgb[tf & (np.abs(c.x) < 0.11) & (c.z < 1.30) & (np.abs(np.abs(c.x) - 0.106) < 0.004)] *= 0.6
    stitches(c, rgb, bib & (np.abs(np.abs(c.x) - 0.098) < 0.0025), (214, 150, 60))
    rgb[tf & (np.abs(c.x) < 0.11) & (np.abs(c.z - 1.30) < 0.005)] *= 0.6
    pk = tf & box(c, -0.055, 0.055, 1.13, 1.23)                                  # bib pocket
    rgb[tf & outline(c, -0.055, 0.055, 1.13, 1.23, 0.004)] *= 0.6
    stitches(c, rgb, tf & outline(c, -0.048, 0.048, 1.137, 1.223, 0.0025), (214, 150, 60))
    rgb[tf & (np.abs(c.x - 0.01) < 0.004) & box(c, -0.06, 0.06, 1.15, 1.23)] *= 0.7   # pencil slot
    for sx in (-1, 1):
        st = tf & (np.abs(c.x - sx * 0.075) < 0.018) & (c.z >= 1.28)              # straps up to the shoulders
        rgb[st] = den[st] * 0.95
        rgb[tf & (np.abs(np.abs(c.x - sx * 0.075) - 0.018) < 0.003) & (c.z >= 1.28)] *= 0.6
        buttons(c, rgb, tf, [sx * 0.075], [1.285], 0.012, (196, 160, 80), rim=0.5)
        rgb[tf & box(c, *sorted((sx * 0.095, sx * 0.12)), 0.98, 1.02)] = (196, 160, 80)     # side button
    # (no straps drawn on the back: hombre shares those texels with the lapels and arms)
    col = c.p("collar")
    rgb[col] = shirt[col]
    fa = c.p("forearm")                                                     # rolled sleeves
    bare(c, rgb, fa & (c.z < 1.02), skin, hair=0.35)
    roll = fa & (c.z >= 1.02) & (c.z < 1.08)
    rgb[roll] = shirt[roll] * (1 + 0.25 * np.sin((c.z[roll] - 1.02) * 170))[:, None]
    rgb[fa & (np.abs(c.z - 1.02) < 0.006)] *= 0.55
    rgb[c.p("calf") & (c.z < 0.16)] *= 0.8                                    # turned-up hems
    rgb[c.p("calf") & (np.abs(c.z - 0.16) < 0.004)] *= 0.6
    rgb = shoe(c, rgb, (98, 62, 34), sole=(30, 24, 20), laces=(60, 40, 24), toecap=0.75, boot=True)
    return rgb


def friend(c, skin):
    """Kaneda's friend (lps-blind): mustard hoodie with kangaroo pocket and drawstrings, black jeans, white sneakers."""
    must = np.array([200, 152, 52.])
    rgb = fabric(c, must, weave=0.08, drape=0.16)
    tf = c.tf
    pk = tf & box(c, -0.11, 0.11, 0.98, 1.10)                                 # kangaroo pocket
    rgb[pk] *= 0.93
    rgb[tf & outline(c, -0.11, 0.11, 0.98, 1.10, 0.004)] *= 0.62
    for sx in (-1, 1):                                                       # drawstrings
        rgb[tf & (np.abs(c.x - sx * 0.03) < 0.005) & (c.z > 1.24) & (c.z < 1.42)] = (238, 234, 220)
    rgb[tf & (c.z > 1.42) & (np.abs(c.x) < 0.05)] *= 0.8                     # hood opening shadow
    col = c.p("collar"); rgb[col] = rgb[col] * 0.85                         # the hood bunched round the neck
    fa = c.p("forearm")
    rgb[fa & (c.z < 0.86)] *= 0.86                                            # ribbed cuffs
    rgb[c.p("skirt") & (c.z < 0.93)] *= 0.86                                  # ribbed hem
    leg = c.p("thigh", "calf", "hips")
    rgb[leg] = fabric(c, (34, 34, 40), weave=0.2, drape=0.18)[leg]
    rgb = shoe(c, rgb, (236, 236, 232), sole=(250, 250, 250), laces=(240, 240, 240))
    return rgb


OUTFITS = {"akatsu": lambda c, s: ija(c, s, (150, 134, 84), "tunic"),
           "shimada": lambda c, s: ija(c, s, (176, 160, 116), "shirt"),
           "kozuka": lambda c, s: ija(c, s, (92, 98, 58), "open"),
           "suzuki": suzuki, "woman": woman, "sailor": sailor, "oldman": oldman, "worker": worker, "friend": friend}


# ------------------------------------------------------------------ medieval cast (lps-erfurt, 1184)
def mail(c, base=(150, 152, 156)):
    """Chainmail: rows of tiny rings (atlas space), dark gaps, a few rust blots."""
    rgb = fabric(c, base, weave=0.0, drape=0.05, dirt=0.25, dirt_col=(110, 80, 50))
    ring = ((c.U + 2 * (c.V // 3 % 2)) % 4 < 1) | (c.V % 3 < 1)
    rgb[ring] *= 0.55
    return rgb


def hose(c, rgb, col, boots=(70, 46, 30), shoe_col=None):
    leg = c.p("thigh", "calf", "hips")
    rgb[leg] = fabric(c, col, weave=0.12, drape=0.1)[leg]
    return shoe(c, rgb, shoe_col or boots, sole=(30, 22, 16), toecap=0.85)


def trim(c, rgb, m, col=(214, 170, 60)):
    rgb[m] = np.array(col, np.float32) * (1 + 0.18 * np.sin(c.U[m] * 1.4) * np.sin(c.V[m] * 1.4) + 0.06 * c.grain[m])[:, None]


def fur(c, m, col=(98, 70, 44)):
    f = np.array(col, np.float32) * (1 + 0.35 * c.n["grain"] + 0.25 * c.n["fine"] + 0.15 * np.sin(c.V * 2.1 + c.n["mid"] * 9))[:, None]
    return f


def archbishop(c, skin):
    """White alb to the ankles, red chasuble with gold orphreys, white pallium with black crosses, red slippers."""
    rgb = fabric(c, (232, 228, 214), weave=0.06, drape=0.2)
    ch = c.p("torso", "lapel", "skirt") & (c.z > 0.62)
    rgb[ch] = fabric(c, (150, 26, 34), weave=0.05, drape=0.12)[ch]
    rgb[c.p("upperarm") & (c.z > 1.18)] = fabric(c, (150, 26, 34), weave=0.05, drape=0.12)[c.p("upperarm") & (c.z > 1.18)]
    trim(c, rgb, ch & (np.abs(c.x) < 0.03))                                           # vertical orphrey
    trim(c, rgb, ch & (np.abs(c.z - 0.64) < 0.02))                                    # hem
    tf = c.tf
    yb = tf & (c.z > 1.18) & (np.abs(np.abs(c.x) - (c.z - 1.18) * 0.62) < 0.03)        # gold Y on the front
    trim(c, rgb, yb)
    pal = tf & (c.z > 1.20) & (np.abs(np.abs(c.x) - (c.z - 1.20) * 0.95) < 0.022)      # pallium V
    pal |= tf & (np.abs(c.x) < 0.022) & (c.z < 1.21) & (c.z > 0.9)
    rgb[pal] = (238, 236, 228)
    for z in (1.0, 1.12):
        rgb[tf & (np.abs(c.x) < 0.016) & (np.abs(c.z - z) < 0.005)] = (20, 20, 20)
        rgb[tf & (np.abs(c.x) < 0.005) & (np.abs(c.z - z) < 0.016)] = (20, 20, 20)
    rgb[c.p("collar")] = (238, 236, 228)
    rgb = shoe(c, rgb, (160, 24, 30), sole=(40, 12, 12), shine=0.2)
    return rgb


def landgrave(c, skin):
    """Landgrave Louis III of Thuringia: blue tunic with the Thuringian striped lion (red/white on blue) on the chest,
    a red mantle with a broad white-and-brown fur trim over the shoulders and down the back, gold belt, red hose, boots."""
    rgb = fabric(c, (34, 62, 150), weave=0.08, drape=0.16)
    sh = np.asarray(Image.open(os.path.join(H, "..", "ref", "shield_thuringia_cut.png")).convert("RGBA")).astype(np.float32)
    hh, ww = sh.shape[:2]
    m = c.tf & (np.abs(c.x) < 0.125) & (c.z > 0.98) & (c.z < 1.40)              # the arms painted on the tunic front
    u = ((c.x[m] + 0.125) / 0.25 * (ww - 1)).astype(int); v = ((1.40 - c.z[m]) / 0.42 * (hh - 1)).astype(int)
    px = sh[v, u]; on = px[:, 3] > 128
    idx = np.flatnonzero(m)[on]
    rgb[idx] = px[on, :3] * (1 + 0.05 * c.grain[idx])[:, None]
    mant = (c.p("torso", "lapel", "collar", "skirt") & ~c.tf) | (c.p("upperarm") & (c.z > 1.15))
    rgb[mant] = fabric(c, (150, 24, 30), weave=0.05, drape=0.2)[mant]
    trimz = (c.p("torso", "lapel", "collar", "upperarm") & (c.z > 1.36)) | (mant & (c.z < 0.80))
    rgb[trimz] = fur(c, trimz, (226, 222, 210))[trimz]
    spot = trimz & ((c.U % 16 < 3) & (c.V % 20 < 5)); rgb[spot] = (24, 22, 20)
    belt(c, rgb, (196, 160, 52), (240, 210, 90), pouches=False, w=0.03)
    rgb = hose(c, rgb, (150, 30, 34), boots=(60, 40, 26))
    rgb[c.p("calf") & (c.z < 0.3)] = fabric(c, (70, 46, 28), weave=0.05)[c.p("calf") & (c.z < 0.3)]
    return rgb


def barbarossa(c, skin):
    """Emperor: crimson robe to the ankles, gold bands at hem and cuffs, ermine collar, gold belt."""
    rgb = fabric(c, (168, 22, 30), weave=0.05, drape=0.2)
    trim(c, rgb, c.p("skirt", "thigh", "calf") & (np.abs(c.z - 0.2) < 0.03))
    trim(c, rgb, c.p("forearm") & (np.abs(c.z - 0.86) < 0.025))
    trim(c, rgb, c.tf & (np.abs(c.x) < 0.025))
    erm = c.p("collar") | (c.p("torso", "lapel", "upperarm") & (c.z > 1.32))
    rgb[erm] = fur(c, erm, (236, 234, 226))[erm]
    spot = erm & ((c.U % 18 < 3) & (c.V % 22 < 6))
    rgb[spot] = (20, 20, 22)
    belt(c, rgb, (200, 160, 50), (240, 210, 90), pouches=False, w=0.03)
    rgb = shoe(c, rgb, (30, 24, 22), sole=(12, 10, 10), shine=0.3)
    return rgb


def peasant(c, skin):
    """Undyed patched wool tunic, rope belt, bare forearms, leg wraps, leather turnshoes."""
    rgb = fabric(c, (132, 112, 84), weave=0.2, drape=0.12, dirt=0.45, dirt_col=(84, 70, 50))
    for k, (x0, z0) in enumerate(((0.05, 1.1), (-0.09, 0.85), (0.02, 1.3))):
        p = box(c, x0, x0 + 0.06, z0, z0 + 0.05) & c.p("torso", "skirt")
        rgb[p] = fabric(c, (96, 82, 60), weave=0.3)[p]
        rgb[c.p("torso", "skirt") & outline(c, x0, x0 + 0.06, z0, z0 + 0.05, 0.004)] *= 0.55
    bare(c, rgb, c.p("forearm") & (c.z < 1.06), skin, hair=0.3)
    rope = (np.abs(c.z - 0.98) < 0.012) & c.p("torso", "skirt", "lapel")
    rgb[rope] = np.array([180, 150, 100.]) * (1 + 0.3 * (np.sin((c.U + c.V)[rope] * 1.5) > 0))[:, None]
    leg = c.p("thigh", "calf", "hips")
    rgb[leg] = fabric(c, (100, 86, 66), weave=0.15, drape=0.1, dirt=0.4)[leg]
    calf_wrap(c, rgb, (150, 136, 110), pitch=0.04)
    rgb = shoe(c, rgb, (88, 60, 38), sole=(40, 28, 20))
    return rgb


def noble1(c, skin):
    """Parti-coloured mi-parti: blue/yellow tunic split down the middle, hose the other way round."""
    blue, yel = np.array([40, 64, 150.]), np.array([214, 176, 46.])
    rgb = np.where((c.x > 0)[:, None], fabric(c, blue, weave=0.08, drape=0.15), fabric(c, yel, weave=0.08, drape=0.15))
    belt(c, rgb, (60, 36, 20), (220, 190, 90), pouches=False, w=0.04)
    leg = c.p("thigh", "calf", "hips")
    hl = np.where((c.x > 0)[:, None], fabric(c, yel, weave=0.1), fabric(c, blue, weave=0.1))
    rgb[leg] = hl[leg]
    rgb = shoe(c, rgb, (40, 30, 26), sole=(14, 12, 10))
    return rgb


def noble2(c, skin):
    """Young knight: mail hauberk (arms, legs) under a white surcoat with a red cross."""
    rgb = mail(c)
    sc = c.p("torso", "lapel", "skirt") & ~(c.p("torso") & (c.z > 1.42))
    rgb[sc] = fabric(c, (236, 232, 220), weave=0.06, drape=0.18, dirt=0.15)[sc]
    cr = c.tf & (((np.abs(c.x) < 0.025) & (c.z > 0.95) & (c.z < 1.38)) | ((np.abs(c.z - 1.22) < 0.025) & (np.abs(c.x) < 0.1)))
    rgb[cr] = (178, 26, 30)
    belt(c, rgb, (50, 34, 22), (180, 180, 186), pouches=False, w=0.03)
    rgb = shoe(c, rgb, (120, 122, 128), sole=(40, 40, 42), shine=0.3)
    return rgb


def noble3(c, skin):
    """Scarred knight: black-and-gold chevron tabard, mail sleeves, dark hose."""
    rgb = mail(c, (120, 122, 126))
    tb = c.p("torso", "lapel", "skirt", "collar")
    chev = ((np.abs(c.x) * 1.2 + c.z) * 14 % 2) < 1
    tab = np.where(chev[:, None], fabric(c, (20, 20, 24), weave=0.06), fabric(c, (210, 168, 50), weave=0.06))
    rgb[tb] = tab[tb]
    rgb = hose(c, rgb, (40, 36, 44))
    return rgb


def noble4(c, skin):
    """Old count: long purple houppelande to the ankles, dark fur at the hem and cuffs, gold chain."""
    rgb = fabric(c, (92, 40, 110), weave=0.05, drape=0.25)
    hm = (c.p("skirt", "thigh", "calf") & (c.z < 0.25)) | (c.p("forearm") & (c.z < 0.9)) | c.p("collar")
    rgb[hm] = fur(c, hm, (60, 44, 34))[hm]
    ch = c.tf & (np.abs(c.z - (1.20 + 7.0 * c.x ** 2)) < 0.008) & (np.abs(c.x) < 0.13)
    rgb[ch] = (226, 190, 80)
    rgb = shoe(c, rgb, (40, 30, 26), sole=(14, 12, 10))
    return rgb


def noble5(c, skin):
    """Green and white striped tunic, red hose, belt with a purse."""
    st = ((c.U // 10) % 2 == 0)
    rgb = np.where(st[:, None], fabric(c, (40, 120, 60), weave=0.08, drape=0.14), fabric(c, (230, 226, 210), weave=0.08, drape=0.14))
    belt(c, rgb, (90, 56, 30), (200, 170, 80), pouches=False, w=0.035)
    pu = c.tf & box(c, 0.05, 0.10, 0.88, 0.96)
    rgb[pu] = fabric(c, (110, 70, 40), weave=0.1)[pu]
    rgb = hose(c, rgb, (170, 32, 30), boots=(60, 40, 26))
    return rgb


OUTFITS.update({"archbishop": archbishop, "landgrave": landgrave, "barbarossa": barbarossa, "peasant": peasant,
                "noble1": noble1, "noble2": noble2, "noble3": noble3, "noble4": noble4, "noble5": noble5})


def gown(c, col, fur_col=(60, 44, 34), chain=True):
    """Long gown to the ankles with fur at hem and cuffs (old counts, townswomen)."""
    rgb = fabric(c, col, weave=0.05, drape=0.25)
    hm = (c.p("skirt", "thigh", "calf") & (c.z < 0.25)) | (c.p("forearm") & (c.z < 0.9)) | c.p("collar")
    if fur_col is not None:
        rgb[hm] = fur(c, hm, fur_col)[hm]
    if chain:
        ch = c.tf & (np.abs(c.z - (1.20 + 7.0 * c.x ** 2)) < 0.008) & (np.abs(c.x) < 0.13)
        rgb[ch] = (226, 190, 80)
    return shoe(c, rgb, (40, 30, 26), sole=(14, 12, 10))


def crowd2(c, skin):
    rgb = fabric(c, (110, 84, 52), weave=0.14, drape=0.12)
    belt(c, rgb, (60, 40, 22), (170, 150, 90), pouches=False, w=0.03)
    return hose(c, rgb, (52, 96, 52))


def crowd3(c, skin):
    a, b = np.array([176, 30, 34.]), np.array([232, 228, 214.])
    rgb = np.where((c.x > 0)[:, None], fabric(c, a, weave=0.08, drape=0.15), fabric(c, b, weave=0.08, drape=0.15))
    belt(c, rgb, (40, 28, 20), (220, 190, 90), pouches=False, w=0.04)
    leg = c.p("thigh", "calf", "hips")
    rgb[leg] = np.where((c.x > 0)[:, None], fabric(c, b, weave=0.1), fabric(c, a, weave=0.1))[leg]
    return shoe(c, rgb, (40, 30, 26), sole=(14, 12, 10))


def crowd4(c, skin):
    rgb = mail(c)
    sc = c.p("torso", "lapel", "skirt") & ~(c.p("torso") & (c.z > 1.42))
    rgb[sc] = fabric(c, (36, 64, 150), weave=0.06, drape=0.18, dirt=0.15)[sc]
    cr = c.tf & (np.hypot(c.x, c.z - 1.2) < 0.06)
    rgb[cr] = (220, 190, 60)
    belt(c, rgb, (50, 34, 22), (180, 180, 186), pouches=False, w=0.03)
    return shoe(c, rgb, (120, 122, 128), sole=(40, 40, 42), shine=0.3)


def citizen1(c, skin):
    rgb = gown(c, (64, 92, 70), fur_col=None, chain=False)
    ap = c.tf & (np.abs(c.x) < 0.12) & (c.z < 1.05) | (c.p("skirt") & (c.N[:, 1] < -0.5) & (np.abs(c.x) < 0.14))
    rgb[ap] = fabric(c, (226, 220, 200), weave=0.1)[ap]
    return rgb


def citizen2(c, skin):
    rgb = fabric(c, (104, 104, 98), weave=0.18, drape=0.12, dirt=0.3)
    cl = (c.p("torso", "lapel", "collar", "upperarm") & ~c.tf) | (c.p("torso", "lapel", "collar") & (c.z > 1.32))
    rgb[cl] = fabric(c, (92, 62, 36), weave=0.2, drape=0.2)[cl]
    belt(c, rgb, (60, 40, 22), (150, 140, 120), pouches=True, w=0.035)
    return hose(c, rgb, (70, 60, 46))


OUTFITS.update({"archbishop_scared": archbishop, "landgrave_angry": landgrave, "crowd1": lambda c, s: gown(c, (40, 104, 60)),
                "crowd2": crowd2, "crowd3": crowd3, "crowd4": crowd4, "citizen1": citizen1, "citizen2": citizen2})


def make_body(name, skin, loc):
    c = Ctx(loc, seed=sum(map(ord, name)) * 7)
    rgb = OUTFITS[name](c, skin)
    rgb = skin_parts(c, rgb, skin)
    rgb = common_wear(c, rgb)
    rgb = rgb * (1 + 0.07 * c.grain)[:, None]                                 # crunchy PS1 grain
    pri = np.array([PRI[p] for p in PARTS])[c.part] * 2 + c.front
    pri[c.p("torso") & ~c.front] = PRI["upperarm"] * 2 - 1                     # arms and lapels beat the torso back
    order = np.lexsort((pri, c.pix))                                          # per texel: highest priority last
    pix, rgb = c.pix[order], rgb[order]
    last = np.r_[pix[1:] != pix[:-1], True]
    img = np.zeros((S * S, 3), np.float32); cov = np.zeros(S * S, bool)
    img[pix[last]] = rgb[last]; cov[pix[last]] = True
    img = img.reshape(S, S, 3); cov = cov.reshape(S, S)
    from scipy.ndimage import distance_transform_edt
    _, (iy, ix) = distance_transform_edt(~cov, return_indices=True)            # bleed into unused texels
    img = img[iy, ix]
    a = np.clip(img, 0, 255).astype(np.uint8)
    Image.fromarray(a).save(os.path.join(OUT, "test", f"{name}_body_1k.png"))
    Image.fromarray(a).resize((256, 256), Image.BOX).save(os.path.join(OUT, f"{name}_body_256.png"))
    if name == "landgrave":                                                  # covered in sewage muck (shot 10)
        muck = np.clip((c.n["blot"] + 0.6 * c.n["mid"] + 0.1 + 0.35 * (c.z < 1.0)) * 3, 0, 1)[order]
        mk = rgb * (1 - 0.8 * muck[:, None]) + np.array([74, 56, 24.]) * 0.8 * muck[:, None]
        im2 = np.zeros((S * S, 3), np.float32); im2[pix[last]] = mk[last]; im2 = im2.reshape(S, S, 3)[iy, ix]
        Image.fromarray(np.clip(im2, 0, 255).astype(np.uint8)).resize((256, 256), Image.BOX).save(os.path.join(OUT, f"{name}_muck_body_256.png"))


if __name__ == "__main__":
    names = ONLY or list(HAIR)
    skins = json.load(open(SKIN_JSON)) if (BODY_ONLY and os.path.exists(SKIN_JSON)) else make_heads(names)
    os.makedirs(os.path.join(OUT, "test"), exist_ok=True)
    loc = locate()
    for n in names:
        make_body(n, skins[n], loc)
        print(n, "body")
