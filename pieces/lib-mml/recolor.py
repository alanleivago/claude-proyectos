"""lib-mml / recolor.py
Genera las variantes de color (textures/<tex>_<variante>.png) a partir de textures/<tex>_orig.png.

Mascaras:
  - cobertura UV: solo se tocan los pixeles que el modelo usa de verdad (data/uv_<id>.json).
  - vehiculos / papelera: pixeles del tono dominante de la carroceria (tono +-DH, saturacion minima);
    ventanas, ruedas, cromados y luces (otro tono o poca saturacion) quedan igual.
  - NPCs: caras de los huesos del cuerpo (no la cabeza), menos los pixeles con tono de piel.
Recoloreo por pixel en HSV relativo a la mediana de la mascara: se conserva el sombreado y el dither.
  python recolor.py
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw

OUT = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(OUT, "textures")
DATA = os.path.join(OUT, "data")

# variante: h = tono destino (grados) | dh = giro de tono; s = saturacion destino (relativa a la mediana);
#           v = brillo destino (relativo a la mediana); ns = (h, s) tinte para ropa neutra (gris/blanca/negra)
WHITE = dict(h=40, s=0.05, v=0.90)
GREY = dict(h=210, s=0.05, v=0.55)
DKGREEN = dict(h=150, s=0.55, v=0.40)
SKY = dict(h=200, s=0.45, v=0.85)
VEH = {"white": WHITE, "skyblue": SKY, "darkgreen": DKGREEN, "grey": GREY}
JOBS = {
    # tex: (modelos que la usan, tipo, variantes)
    "red_car": (["red_car"], "body", VEH),
    "mini_red_car": (["mini_red_car"], "body", VEH),
    "yellow_pickup": (["yellow_pickup"], "body", VEH),
    "blue_pickup": (["blue_pickup"], "body",
                    {"white": WHITE, "mustard": dict(h=45, s=0.70, v=0.80), "darkgreen": DKGREEN, "grey": GREY}),
    "trashcan": (["trashcan", "trashcan_open", "trashcan_lid"], "body",
                 {"green": dict(h=110, s=None, v=None), "grey": dict(h=210, s=0.06, v=0.60)}),
    "bank_teller": (["bank_teller"], "npc",
                    {"navy": dict(h=225, s=0.55, v=0.50, ns=(205, 0.22)),
                     "olive": dict(h=80, s=0.50, v=0.50, ns=(45, 0.15)),
                     "grey": dict(h=0, s=0.04, v=0.42, ns=(330, 0.18))}),
    "art_student": (["art_student"], "npc",
                    {"teal": dict(h=175, s=None, v=None, ns=(215, 0.35)),
                     "rose": dict(h=340, s=0.75, v=None, ns=(150, 0.30)),
                     "violet": dict(h=270, s=0.65, v=None, ns=(25, 0.30))}),
    "homework_girl": (["homework_girl"], "npc",
                      {"blue": dict(h=210, s=None, v=None, ns=(0, 0.0)),
                       "green": dict(h=120, s=0.75, v=None, ns=(0, 0.0)),
                       "red": dict(h=355, s=None, v=0.9, ns=(0, 0.0))}),
    "old_woman_sitting": (["old_woman_sitting"], "npc",
                          {"green": dict(dh=150, s=None, v=None),
                           "blue": dict(dh=-120, s=None, v=None),
                           "brown": dict(dh=50, s=None, v=None)}),
}


# zonas a proteger en NPCs: (hueso, tono_min, tono_max). La silla de la anciana va en Bone006 (madera marron).
PROTECT = {"old_woman_sitting": [("Bone006", 0, 40)]}


def rgb_to_hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-6
    rr = m & (mx == r)
    gg = m & (mx == g) & ~rr
    bb = m & ~rr & ~gg
    h[rr] = ((g - b)[rr] / d[rr]) % 6
    h[gg] = (b - r)[gg] / d[gg] + 2
    h[bb] = (r - g)[bb] / d[bb] + 4
    h = h * 60.0
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    return h, s, mx


def hsv_to_rgb(h, s, v):
    h = (h % 360) / 60.0
    i = np.floor(h).astype(int) % 6
    f = h - np.floor(h)
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    out = np.zeros(h.shape + (3,))
    for k, (R, G, B) in enumerate([(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]):
        sel = i == k
        out[sel] = np.stack([R[sel], G[sel], B[sel]], -1)
    return out


def coverage(ids, size, bone_filter=None):
    W, H = size
    im = Image.new("L", (W, H), 0)
    dr = ImageDraw.Draw(im)
    for mid in ids:
        d = json.load(open(os.path.join(DATA, "uv_%s.json" % mid)))
        for t in d["tris"]:
            if bone_filter and not bone_filter(t["bone"]):
                continue
            pts = [(u * W - 0.5, (1 - v) * H - 0.5) for u, v in t["uv"]]
            dr.polygon(pts, fill=255, outline=255)
    return np.array(im) > 0


def head_bone(mid):
    d = json.load(open(os.path.join(DATA, "uv_%s.json" % mid)))
    zs = {}
    for t in d["tris"]:
        zs.setdefault(t["bone"], []).append(t["z"])
    return max(zs, key=lambda b: np.mean(zs[b]))


def hue_dist(a, b):
    return np.abs((a - b + 180) % 360 - 180)


def dominant_hue(h, s, v, m):
    sel = m & (s > 0.3) & (v > 0.25)
    hist, _ = np.histogram(h[sel], bins=36, range=(0, 360))
    hist = hist + np.roll(hist, 1) + np.roll(hist, -1)
    return (np.argmax(hist) + 0.5) * 10


def apply(h, s, v, mask, spec, href):
    H, S, V = h.copy(), s.copy(), v.copy()
    sref = np.median(s[mask]) if mask.any() else 1
    vref = np.median(v[mask]) if mask.any() else 1
    if "dh" in spec:
        H[mask] = h[mask] + spec["dh"]
    else:
        H[mask] = spec["h"] + (h[mask] - href + 180) % 360 - 180
    if spec.get("s") is not None:
        S[mask] = np.clip(spec["s"] * s[mask] / max(sref, 1e-3), 0, 1)
    if spec.get("v") is not None:
        V[mask] = np.clip(spec["v"] * v[mask] / max(vref, 1e-3), 0, 1)
    return H, S, V


variants = {}
report = {}
for tex, (ids, kind, specs) in JOBS.items():
    src = Image.open(os.path.join(TEX, tex + "_orig.png")).convert("RGBA")
    a = np.asarray(src).astype(np.float64) / 255.0
    rgb, alpha = a[..., :3], a[..., 3]
    h, s, v = rgb_to_hsv(rgb)
    opaque = alpha > 0.5
    if kind == "body":
        cov = coverage(ids, src.size) & opaque
        href = dominant_hue(h, s, v, cov)
        mask = cov & (hue_dist(h, href) < 25) & (s > 0.22) & (v > 0.15)
        nmask = np.zeros_like(mask)
    else:
        hb = head_bone(ids[0])
        body = coverage(ids, src.size, lambda b: b != hb)
        head = coverage(ids, src.size, lambda b: b == hb)
        skin = (h > 5) & (h < 38) & (s > 0.12) & (s < 0.62) & (v > 0.55)
        cloth = body & ~head & opaque & ~skin
        for bone, h0, h1 in PROTECT.get(tex, []):
            cloth &= ~(coverage(ids, src.size, lambda b: b == bone) & (h >= h0) & (h <= h1))
        mask = cloth & (s > 0.18)
        nmask = cloth & (s <= 0.18) & (v > 0.12)
        href = dominant_hue(h, s, v, mask)
    report[tex] = dict(dominant_hue=float(href), recolored_px=int(mask.sum()), neutral_px=int(nmask.sum()))
    Image.fromarray((mask * 255).astype(np.uint8)).save(os.path.join(DATA, "mask_%s.png" % tex))
    variants[tex] = []
    for name, spec in specs.items():
        H, S, V = apply(h, s, v, mask, spec, href)
        if spec.get("ns") and spec["ns"][1] > 0 and nmask.any():
            H[nmask] = spec["ns"][0]
            S[nmask] = spec["ns"][1]
        out = hsv_to_rgb(H, S, V)
        res = np.dstack([out, alpha])
        Image.fromarray(np.round(res * 255).astype(np.uint8), "RGBA").save(
            os.path.join(TEX, "%s_%s.png" % (tex, name)))
        variants[tex].append(name)
json.dump(variants, open(os.path.join(OUT, "variants.json"), "w"), indent=1)
print(json.dumps(report, indent=1))
