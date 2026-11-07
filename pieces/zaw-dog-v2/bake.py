"""venv: python bake.py -> tex/atlas_<expr>.png (256 px, one shared 256-colour palette, Closest in Blender).

Photo-real, but ONE coherent texture: the old dog's real photos (side_real.jpg for the body, head sides, legs and tail;
faces2/<expr>.jpg for the face) are first colour-matched to one target brown and one target white (taken from
faces2/neutral), then projected in 3D onto the rest-pose mesh and blended by surface direction:
- side projection along X for everything; surfaces that do not face sideways sample the photo a little inside the
  silhouette (no edge streaks) at low-pass, with real fur detail (high-pass of the photo's own coat) added on top;
- front projection for the head front, muzzle, nose and ears (the expression), cross-faded into the side one.
Colour depends only on the 3D point, so both sides of every UV seam match; only the face texels differ between the five
atlases, and they share one palette, so swapping expressions never changes the body."""
import json
import os

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

H = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(H, "tex")
REV = os.path.join(H, "review")
RES, SS = 256, 4
R = RES * SS
EXPRS = ["neutral", "happy", "sad", "judging", "shocked"]
MOUTH = np.array([88, 30, 34], float)
# faces2 photo replaced: the new sad face (Flow, same dog/framing; real sad-dog cues: raised inner brows, eyes up,
# closed lips, ears back, small believable tears)
FACE_OVERRIDE = {"sad": os.path.join(H, "ref", "sad", "sad_v2.jpg")}
TONGUE = np.array([214, 112, 120], float)


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- photo sources

def fg_mask(a, thr=238):
    """white studio background -> the dog's silhouette."""
    m = a.min(2) < thr
    m = ndimage.binary_opening(m, iterations=2)
    lab, n = ndimage.label(m)
    big = np.argmax(np.bincount(lab.ravel())[1:]) + 1
    return ndimage.binary_fill_holes(lab == big)


def classes(a, m):
    mx = a.max(2); mn = a.min(2)
    s = (mx - mn) / np.maximum(mx, 1)
    lum = a.mean(2)
    brown = m & (s > 0.38) & (mx > 70) & (mx < 225) & (a[..., 0] > a[..., 1]) & (a[..., 1] > a[..., 2])
    white = m & (s < 0.14) & (lum > 185)
    return brown, white, s, lum


def match(a, m, tgt):
    """per-pixel gain between the photo's own brown/white and the target brown/white (by how white the pixel is)."""
    brown, white, s, lum = classes(a, m)
    Bs, Ws = a[brown].mean(0), a[white].mean(0)
    Lb, Lw = Bs.mean(), Ws.mean()
    w = np.clip((lum - Lb) / (Lw - Lb), 0, 1) * np.clip((0.36 - s) / 0.2, 0, 1)
    g = (1 - w)[..., None] * (tgt[0] / Bs) + w[..., None] * (tgt[1] / Ws)
    return np.clip(a * g, 0, 255), Bs, Ws


def bleed(a, m, erode=4):
    """drop the outline ring, fill the background with the nearest coat colour."""
    m2 = ndimage.binary_erosion(m, iterations=erode)
    _, (iy, ix) = ndimage.distance_transform_edt(~m2, return_indices=True)
    return a[iy, ix], m2


def readable(a):
    """the face at PS1 size: thicker tears, a touch of local contrast (the old dog's prep.readable)."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    tear = (b > r + 12) & (b >= g) & (b > 120)
    tear = ndimage.binary_dilation(tear, iterations=1)
    a = a.copy(); a[tear] = a[tear] * 0.5 + np.array([120, 175, 225]) * 0.5     # subtle, still readable at PS1 size
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    from PIL import ImageFilter
    im = im.filter(ImageFilter.UnsharpMask(radius=6, percent=90, threshold=2))
    return np.asarray(im, float)


def sample(img, px, py):
    """bilinear sample (N) of an HxWx3 image."""
    h, w = img.shape[:2]
    px = np.clip(px, 0, w - 1.001); py = np.clip(py, 0, h - 1.001)
    x0 = np.floor(px).astype(int); y0 = np.floor(py).astype(int); fx = (px - x0)[:, None]; fy = (py - y0)[:, None]
    return (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy) + img[y0 + 1, x0] * (1 - fx) * fy
            + img[y0 + 1, x0 + 1] * fx * fy)


def load_sources(proj):
    face0 = np.asarray(Image.open(os.path.join(proj["face_ref"], "neutral.jpg")).convert("RGB"), float)
    fm0 = fg_mask(face0)
    b0, w0, _, _ = classes(face0, fm0)
    tgt = (face0[b0].mean(0), face0[w0].mean(0))                     # THE brown and THE white of the dog
    print("target brown", tgt[0].round(), "white", tgt[1].round())
    side = np.asarray(Image.open(proj["side_ref"]).convert("RGB"), float)
    sm = fg_mask(side)
    # the side photo's eye is painted out: the front photo owns the eye (it changes with the expression)
    hole = np.zeros(sm.shape, np.uint8); cv2.circle(hole, (282, 190), 19, 1, -1)
    side = cv2.inpaint(side.astype(np.uint8), hole, 9, cv2.INPAINT_TELEA).astype(float)
    side, Bs, Ws = match(side, sm, tgt)
    print("side brown", Bs.round(), "white", Ws.round(), "-> matched")
    side, sm2 = bleed(side, sm)
    src = dict(tgt=tgt, side=side, side_lo=ndimage.gaussian_filter(side, (8, 16, 0)))
    # fur detail: the photo coat's own high-pass luminance (body crop), mirrored so it tiles
    L = side[330:470, 600:850].mean(2)
    det = L / ndimage.gaussian_filter(L, 6) - 1
    det = np.concatenate([det, det[:, ::-1]], 1); det = np.concatenate([det, det[::-1]], 0)
    src["det"] = np.clip(det, -0.35, 0.35)
    for e in EXPRS:
        f = np.asarray(Image.open(FACE_OVERRIDE.get(e, os.path.join(proj["face_ref"], f"{e}.jpg"))).convert("RGB"), float)
        fm = fg_mask(f)
        f, Bf, Wf = match(f, fm, tgt)
        f = readable(f)
        f, _ = bleed(f, fm, 3)
        src[e] = f; src[e + "_lo"] = ndimage.gaussian_filter(f, (6, 6, 0))
    return src


def detail(src, P, N, S):
    """triplanar fur detail (scale: photo px)."""
    d = src["det"]; h, w = d.shape
    out = 0
    wts = np.abs(N) ** 4; wts /= wts.sum(1, keepdims=True)
    for ax, (u, v) in enumerate(((1, 2), (0, 2), (0, 1))):
        px = (P[:, u] / S * 1.0) % w; py = (-P[:, v] / S * 1.0) % h
        out = out + wts[:, ax] * d[py.astype(int) % h, px.astype(int) % w]
    return out


# ---------------------------------------------------------------- rasterise the UV layout

def rasterise(tris):
    P = np.zeros((R, R, 3)); N = np.zeros((R, R, 3)); PRM = np.zeros((R, R))
    PART = np.full((R, R), -1, int)
    parts = []
    for t in tris:
        if t["part"] not in parts:
            parts.append(t["part"])
        uv = np.array(t["uv"]) * R
        uv[:, 1] = R - uv[:, 1]
        x0, y0 = np.floor(uv.min(0)).astype(int); x1, y1 = np.ceil(uv.max(0)).astype(int)
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, R - 1), min(y1, R - 1)
        if x1 < x0 or y1 < y0:
            continue
        ys, xs = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        px = xs + 0.5; py = ys + 0.5
        (ax, ay), (bx, by), (cx, cy) = uv
        den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(den) < 1e-12:
            continue
        l0 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / den
        l1 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / den
        l2 = 1 - l0 - l1
        m = (l0 >= -1e-3) & (l1 >= -1e-3) & (l2 >= -1e-3)
        if not m.any():
            continue
        Lb = np.stack([l0[m], l1[m], l2[m]], -1)
        yy, xx = ys[m], xs[m]
        P[yy, xx] = Lb @ np.array(t["co"])
        n = Lb @ np.array(t["n"]); N[yy, xx] = n / np.linalg.norm(n, axis=-1, keepdims=True)
        PRM[yy, xx] = Lb @ np.array(t["prm"])
        PART[yy, xx] = parts.index(t["part"])
    return P, N, PRM, PART, parts


# ---------------------------------------------------------------- colour of every surface point

def side_colour(src, P, N, pj, prm=None, ear=None):
    S, X0, G = pj["side_s"], pj["side_x0"], pj["side_g"]
    nx = np.abs(N[:, 0])
    # pull grazing samples inside the silhouette: hardly for front/back faces (the white throat/chest sits on the
    # edge), more for top/bottom faces (the photo's dorsal edge has streaks that would band across the back)
    Q = P - np.stack([0 * nx, N[:, 1] * np.where(N[:, 1] > 0, 0.045, 0.012), N[:, 2] * 0.045], 1) * (1 - nx)[:, None]
    px = X0 + Q[:, 1] / S; py = G - Q[:, 2] / S
    if ear is not None:               # ears: the photo's ear from root to tip, whatever the mesh ear's length
        py = np.where(ear, np.interp(prm, [0, 0.2, 1], [128, 140, 252]), py)
        px = np.where(ear, 388 + np.clip(px - 388, -36, 36), px)          # stay inside the photo ear (its outline striped the edges)
    sharp = sample(src["side"], px, py); lo = sample(src["side_lo"], px, py)
    k = smooth(0.40, 0.85, nx)
    col = lo * (1 - k)[:, None] + sharp * k[:, None]
    det = detail(src, P, N, S)
    return col * (1 + det * (1 - k) * 0.9)[:, None]


def face_coords(P, pj):
    rows = np.array(pj["face_rows"])
    fx = pj["face_x0"] + P[:, 0] / pj["face_k"]
    fy = np.interp(-P[:, 2], -rows[:, 1], rows[:, 0])
    return fx, fy


def front_colour(src, e, P, N, pj, prm=None, ear=None):
    ny = np.abs(N[:, 1])
    pull = 0.02 * (1 - ny)
    Q = P - np.stack([N[:, 0], 0 * ny, N[:, 2]], 1) * pull[:, None]
    fx, fy = face_coords(Q, pj)
    if ear is not None:               # ears: the photo's ear from its root to its tip, whatever the mesh ear's length
        fy = np.where(ear, np.interp(prm, [0, 1], [165, 565]), fy)
        ecx = np.interp(prm, [0, 0.25, 0.5, 0.75, 1], [0.035, 0.080, 0.101, 0.103, 0.099])     # mesh ear centre |x|
        off = np.interp(prm, [0, 0.4, 1], [285, 395, 355]) + (np.abs(P[:, 0]) - ecx) / pj["face_k"] * 1.1
        fx = np.where(ear, pj["face_x0"] + np.sign(P[:, 0]) * off, fx)
    sharp = sample(src[e], fx, fy); lo = sample(src[e + "_lo"], fx, fy)
    k = smooth(0.35, 0.75, ny)
    return lo * (1 - k)[:, None] + sharp * k[:, None]


def front_weight(P, N, part):
    """how much of the front (expression) photo a point takes."""
    isp = lambda *ps: np.isin(part, ps)
    fw = -N[:, 1]
    w = isp("head", "muzzle", "jaw") * smooth(0.12, 0.50, fw) * smooth(-0.24, -0.30, P[:, 1])
    w = np.maximum(w, isp("nose") * smooth(-0.2, 0.3, fw))
    # ears: side photo only (the ear leather from root to tip); the front photo striped the ear edges
    return w


def main():
    M = json.load(open(os.path.join(TEX, "bake_mesh.json")))
    pj = M["proj"]
    src = load_sources(pj)
    P, N, PRM, PART, parts = rasterise(M["tris"])
    cov = PART >= 0
    idx = np.nonzero(cov)
    p, n, prm = P[idx], N[idx], PRM[idx]
    part = np.array(parts)[PART[idx]]
    base = side_colour(src, p, n, pj, prm, part == "ear")
    wf = front_weight(p, n, part)
    # mouth interior / tongue: constant colours (only seen when the jaw opens)
    x, y, z = p[:, 0], p[:, 1], p[:, 2]
    jaw_top = (part == "jaw") & (n[:, 2] > 0.55) & (y > -0.405) & (np.abs(x) < 0.025)
    roof = (part == "muzzle") & (n[:, 2] < -0.55) & (np.abs(x) < 0.025) & (y > -0.415)
    inside = (part == "mouth") | jaw_top | roof
    tongue = part == "tongue"
    light = 0.95 + 0.07 * n[:, 2]
    # ears: the photos' ears are a darker leather brown; keep them a little darker than the coat, not a different colour
    def brown_mean(c):
        mx = c.max(1); mn = c.min(1); return c[(mx - mn) / np.maximum(mx, 1) > 0.3].mean(0).mean()
    ear = part == "ear"
    fl = (part == "torso") & (np.abs(n[:, 0]) > 0.7)
    ear_k = min(1.4, 0.88 * brown_mean(base[fl]) / brown_mean(base[ear]))
    print("ear gain", round(ear_k, 2))
    outs = {}
    for e in EXPRS:
        col = base * (1 - wf[:, None]) + front_colour(src, e, p, n, pj, prm, ear) * wf[:, None]
        col = np.where(ear[:, None], col * ear_k, col)
        col = np.where(inside[:, None], MOUTH * (0.8 + 0.2 * n[:, 2:3].clip(0, 1)), col)
        col = np.where(tongue[:, None], TONGUE * (1 + 0.1 * n[:, 2:3]), col)
        col = col * light[:, None]
        img = np.zeros((R, R, 3)); img[idx] = col
        c4 = cov.reshape(RES, SS, RES, SS).sum((1, 3))
        s4 = img.reshape(RES, SS, RES, SS, 3).sum((1, 3))
        small = s4 / np.maximum(c4, 1)[..., None]
        _, (iy, ix) = ndimage.distance_transform_edt(c4 == 0, return_indices=True)   # padding: nearest texel
        small = small[iy, ix]
        outs[e] = small
    stack = Image.fromarray(np.concatenate([outs[e] for e in EXPRS], 0).clip(0, 255).astype(np.uint8))
    pal = stack.quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    for e in EXPRS:
        im = Image.fromarray(outs[e].clip(0, 255).astype(np.uint8)).quantize(palette=pal, dither=Image.Dither.NONE).convert("RGB")
        im.save(os.path.join(TEX, f"atlas_{e}.png"))
    Image.open(os.path.join(TEX, "atlas_neutral.png")).resize((1024, 1024), Image.NEAREST).save(os.path.join(REV, "atlas_neutral_x4.png"))
    # colour-consistency report: mean brown / white of the finished atlas per body region
    a = np.asarray(Image.open(os.path.join(TEX, "atlas_neutral.png")).convert("RGB"), float)
    small_idx = np.nonzero(cov.reshape(RES, SS, RES, SS).any((1, 3)))
    pp = P.reshape(RES, SS, RES, SS, 3)[:, 0, :, 0][small_idx]; nn = N.reshape(RES, SS, RES, SS, 3)[:, 0, :, 0][small_idx]
    prt = PART.reshape(RES, SS, RES, SS)[:, 0, :, 0][small_idx]
    cc = a[small_idx]
    rep = []
    for name, m in (("back (top)", (np.array(parts)[prt] == "torso") & (nn[:, 2] > 0.6)),
                    ("flanks", (np.array(parts)[prt] == "torso") & (np.abs(nn[:, 0]) > 0.7)),
                    ("rump", (np.array(parts)[prt] == "torso") & (nn[:, 1] > 0.6)),
                    ("head side", (np.array(parts)[prt] == "head") & (np.abs(nn[:, 0]) > 0.7)),
                    ("head top", (np.array(parts)[prt] == "head") & (nn[:, 2] > 0.7)),
                    ("ears", np.array(parts)[prt] == "ear"), ("neck", np.array(parts)[prt] == "neck")):
        c = cc[m & (prt >= 0)]
        mx = c.max(1); mn = c.min(1); sat = (mx - mn) / np.maximum(mx, 1)
        br = c[(sat > 0.3)]
        rep.append(f"{name:11s} brown {br.mean(0).round() if len(br) else '-'}  ({len(br)} texels)")
    open(os.path.join(REV, "colour_report.txt"), "w").write("\n".join(rep) + "\n")
    print("\n".join(rep))
    print("baked", len(EXPRS), "atlases; parts", parts)


if __name__ == "__main__":
    os.makedirs(REV, exist_ok=True)
    main()
