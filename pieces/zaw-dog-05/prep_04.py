"""venv: zaw-dog #4 textures from this piece's Flow images (ref/flow/gen, one image per call).
- dog park 3x3 sheet  -> tex/fence, bench_front, bench_side, dispenser_box, dispenser_bin, dp_sign, dp_post, tree_park,
                         bush_park, bin_park (src loft), fountain (src loft)        (the new DOG PARK hook set, joins the kit)
- props 3x3 sheet     -> tex/pail (src loft, body only), popup_book, divider_1..3, fleece_sw, leash_sw, collar_sw
- plush sheet         -> tex/plush_side.png (RGBA, the heightfield-inflated fake dog), plush_front, plush_back
- the v2 dog atlases  -> tex/rival_atlas_<expr>.png (white fluffy coat; eyes / nose / mouth stay dark)
- tag_doggo.png is reused from zaw-dog-03 ("DOGGO POLY SHORTS")
python prep_04.py"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

H = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(H, "tex"); G = os.path.join(H, "ref", "flow", "gen")
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
import photoprop as PP  # noqa: E402
gen = sorted(os.listdir(G)); pick = lambda key: os.path.join(G, next(f for f in gen if key in f))
SRC = os.path.join(T, "src")


def ps1(im, size, colors=48):
    return im.convert("RGB").resize(size, Image.BOX).quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


def bgmask(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; mx = np.maximum(np.maximum(r, g), b) + 1
    return ((r > 150) & (b > 150) & (g < 130) & (np.abs(r - b) < 90)) | (((r - g) / mx > 0.42) & ((b - g) / mx > 0.30))


def key(cell, min_frac=0.05):
    """-> (despilled rgb bled under the mask, mask) cropped to the object."""
    a = np.asarray(cell.convert("RGB")).astype(int)
    m = nd.binary_opening(~bgmask(a), iterations=2)
    lab, n = nd.label(m); sizes = nd.sum(m, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > min_frac * sizes.max()])
    keep = nd.binary_erosion(nd.binary_fill_holes(keep), iterations=1)
    ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1], 0, None); a[..., 0] -= ex; a[..., 2] -= ex
    ys, xs = np.nonzero(keep); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgb = np.clip(a[y0:y1, x0:x1], 0, 255).astype(np.uint8); al = keep[y0:y1, x0:x1]
    _, (iy, ix) = nd.distance_transform_edt(~al, return_indices=True)
    return rgb[iy, ix], al


def save_cut(rgb, al, name, tex_h=128, colors=48):
    tw = max(16, round(tex_h * rgb.shape[1] / rgb.shape[0] / 4) * 4)
    c = ps1(Image.fromarray(rgb), (tw, tex_h), colors)
    c.putalpha(Image.fromarray((al * 255).astype(np.uint8)).resize((tw, tex_h), Image.BOX).point(lambda v: 255 if v > 127 else 0))
    c.save(os.path.join(T, f"{name}.png")); print(name, c.size)


def save_src(rgb, al, name):
    """a loft source: the object on flat magenta (photoprop keys against the border colour)."""
    out = rgb.copy(); out[~al] = (255, 0, 255)
    pad = np.full((out.shape[0] + 40, out.shape[1] + 40, 3), (255, 0, 255), np.uint8); pad[20:-20, 20:-20] = out
    p = os.path.join(SRC, f"{name}.png"); Image.fromarray(pad).save(p); PP.prepare(p, tex_h=128, colors=32)
    tp = os.path.join(SRC, f"{name}_tex.png"); t_ = np.asarray(Image.open(tp).convert("RGB")).copy()
    mg = (t_[..., 0].astype(int) - t_[..., 1] > 80) & (t_[..., 2].astype(int) - t_[..., 1] > 80)   # magenta seen inside the rim
    t_[mg] = (28, 28, 28); Image.fromarray(t_).save(tp)


def cells(path, m=12):
    im = Image.open(path).convert("RGB"); w, h = im.size
    return [im.crop((cx * w // 3 + m, cy * h // 3 + m, (cx + 1) * w // 3 - m, (cy + 1) * h // 3 - m)) for cy in range(3) for cx in range(3)]


def rows_split(al, frac):
    """the row where the object's width first drops below frac x its max width, scanning down from the top run."""
    w = al.sum(1); big = w > frac * w.max(); ys = np.flatnonzero(big)
    return ys[0], ys[0] + np.flatnonzero(~big[ys[0]:])[0] if (~big[ys[0]:]).any() else len(w)


# ----- dog park
park, props = sorted(f for f in gen if "3x3-grid-product" in f)[:2]
C = cells(os.path.join(G, park))
for i, (n, th) in enumerate([("fence", 128), ("bench_front", 128), ("bench_side", 128)]):
    rgb, al = key(C[i]); save_cut(rgb, al, n, th)
rgb, al = key(C[3])                                                      # dispenser: the box (top) and the bin (bottom)
w = al.sum(1); top0 = np.flatnonzero(w > 0)[0]; box1 = top0 + np.flatnonzero(w[top0:] < 0.4 * w.max())[0]
bin0 = box1 + np.flatnonzero(w[box1:] > 0.6 * w.max())[0]
save_cut(rgb[top0:box1], al[top0:box1], "dispenser_box", 64); save_cut(rgb[bin0:], al[bin0:], "dispenser_bin", 96)
rgb, al = key(C[4])                                                      # sign: the board + the post wood
w = al.sum(1); b0 = np.flatnonzero(w > 0.7 * w.max())[0]; b1 = b0 + np.flatnonzero(w[b0:] < 0.7 * w.max())[0]
save_cut(rgb[b0:b1], al[b0:b1], "dp_sign", 64)
xs = np.flatnonzero(al[-5]); Image.fromarray(rgb[b1 + 5:, xs.min():xs.min() + 18]).resize((8, 64), Image.BOX).save(os.path.join(T, "dp_post.png"))
for i, n, th in ((5, "tree_park", 160), (6, "bush_park", 96)):
    rgb, al = key(C[i]); save_cut(rgb, al, n, th)
for i, n in ((7, "bin_park"), (8, "fountain")):
    rgb, al = key(C[i]); save_src(rgb, al, n)

# ----- props
C = cells(os.path.join(G, props))
rgb, al = key(C[0])                                                      # pail: the body below the handle
w = al.sum(1); r0 = np.flatnonzero(w > 0.75 * w.max())[0]
save_src(rgb[r0:], al[r0:], "pail")
rgb, al = key(C[2]); save_cut(rgb, al, "popup_book", 96)
rgb, al = key(C[3]); W_ = rgb.shape[1]
for k in range(3):                                                       # the divider's three panels
    sl = slice(k * W_ // 3, (k + 1) * W_ // 3); save_cut(rgb[:, sl], al[:, sl], f"divider_{k + 1}", 128)
ps1(C[8].crop((60, 60, C[8].width - 60, C[8].height - 60)), (64, 64)).save(os.path.join(T, "fleece_sw.png"))
sw = np.asarray(ps1(C[8].crop((60, 60, C[8].width - 60, C[8].height - 60)), (64, 128))).astype(float)   # the fleece swatch (Flow)
u = (np.arange(64) + 0.5) / 64                                                      # wrapped round the tube: lit top, darker underside
shade = 0.72 + 0.36 * np.clip(np.cos(2 * np.pi * (u - 0.25)), -0.4, 1.0)
Image.fromarray(np.clip(sw * shade[None, :, None], 0, 255).astype(np.uint8)).save(os.path.join(T, "fleece_tube.png"))
for k in range(3):                                                                # divider panels: opaque (no black alpha corners)
    pth = os.path.join(T, f"divider_{k + 1}.png"); Image.open(pth).convert("RGB").save(pth)
rgb, al = key(C[5]); red = rgb[al & (rgb[..., 0] > 120) & (rgb[..., 1] < 80)]
Image.fromarray(np.tile(red[:256].reshape(16, 16, 3) if len(red) >= 256 else np.full((16, 16, 3), (190, 30, 40), np.uint8), (1, 1, 1))).save(os.path.join(T, "leash_sw.png"))

# ----- plush fake dog (side | front | back on one sheet)
a = np.asarray(Image.open(pick("photographic-product-reference-sheet-of-")).convert("RGB")).astype(int)
m = nd.binary_opening(~bgmask(a), iterations=3); lab, n = nd.label(m); sizes = nd.sum(m, lab, range(1, n + 1))
big = sorted([i + 1 for i in np.argsort(sizes)[::-1][:3]], key=lambda i: np.flatnonzero((lab == i).any(0)).mean())
ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1], 0, None); a[..., 0] -= ex; a[..., 2] -= ex
for li, nm, th in zip(big, ("plush_side", "plush_front", "plush_back"), (192, 160, 160)):
    k_ = nd.binary_fill_holes(lab == li); ys, xs = np.nonzero(k_)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgb = np.clip(a[y0:y1, x0:x1], 0, 255).astype(np.uint8); al = k_[y0:y1, x0:x1]
    _, (iy, ix) = nd.distance_transform_edt(~al, return_indices=True)
    save_cut(rgb[iy, ix], al, nm, th, 40)
    print(nm, "px", x1 - x0, y1 - y0)

# ----- rival dog: the v2 atlases in a white fluffy coat (luminance kept as fur shading; dark features stay dark)
V2 = os.path.join(H, "..", "zaw-dog-v2", "tex")
rng = np.random.default_rng(4)
for e in ("neutral", "happy", "sad", "judging", "shocked"):
    im = np.asarray(Image.open(os.path.join(V2, f"atlas_{e}.png")).convert("RGB")).astype(float)
    L = im @ np.array([0.3, 0.59, 0.11]); r, g, b = im[..., 0], im[..., 1], im[..., 2]
    sat = (im.max(-1) - im.min(-1)) / (im.max(-1) + 1)
    blk = (L < 60) & (r - b < 12)                                                   # neutral blacks: pupils, nose, lip line
    keep = nd.binary_dilation(blk, iterations=5)                                    # (their brown irises / rims stay)
    coat = (((r > g) & (g > b) & (g - b > 10) & (sat > 0.18)) | ((r > g) & (g - b > 4) & (r - b > 12) & ~keep)).astype(float)   # brown coat, dark shading too
    coat = np.clip(nd.uniform_filter(coat, 3) * 1.6, 0, 1)[..., None]               # black nose / eyes / maroon mouth / pink tongue
    shade = np.clip((L - 25) / 130, 0, 1) ** 0.45                                   # the coat's own shading, lifted to white
    white = np.array([247, 244, 238]) * (0.8 + 0.2 * shade[..., None])
    white *= 1 + (rng.random(L.shape)[..., None] - 0.5) * 0.05                      # a little fur grain
    grey = im.mean(-1, keepdims=True) * np.array([1.02, 1.0, 0.97])                 # the white / grey bits warm to the same cream
    out = im * (1 - coat) + white * coat
    light = (sat < 0.2) & (L > 70)                                                  # the grey fill / white bits -> the same cream
    out[light] = (np.array([247, 244, 238]) * (0.8 + 0.2 * shade[..., None]))[light]
    dk = out.mean(-1) < 110; lab, n = nd.label(dk); sz = nd.sum(dk, lab, range(1, n + 1))   # stray dark specks on the coat
    spk = np.isin(lab, [i + 1 for i, z in enumerate(sz) if z < 40])                          # (eyes, nose, mouth are big)
    out[spk] = np.array([236, 232, 224])
    if os.path.exists(os.path.join(T, "rival_spots.json")):                          # user: a few crisp black spots + one black
        from PIL import ImageDraw                                                    # ear (tools/rival_spots_uv.py: UV polygons)
        SP = json.load(open(os.path.join(T, "rival_spots.json"))); Hh_, Wd_ = L.shape
        sm = Image.new("L", (Wd_, Hh_), 0); dr = ImageDraw.Draw(sm)
        for poly in SP["ear"]:
            dr.polygon([(u * Wd_, (1 - v) * Hh_) for u, v in poly], fill=255)
        smk = np.asarray(sm) > 0; C = np.array(SP["centres"])
        for tri in SP["tris"]:                                                       # ROUND spots in 3D: each texel's surface
            P = np.array(tri); px = P[:, 0] * Wd_; py = (1 - P[:, 1]) * Hh_          # point (barycentric) vs the spot centres
            x0, x1 = int(max(0, px.min())), int(min(Wd_ - 1, px.max() + 1)); y0, y1 = int(max(0, py.min())), int(min(Hh_ - 1, py.max() + 1))
            yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1] + 0.5
            d_ = (py[1] - py[2]) * (px[0] - px[2]) + (px[2] - px[1]) * (py[0] - py[2])
            if abs(d_) < 1e-9:
                continue
            l1 = ((py[1] - py[2]) * (xx - px[2]) + (px[2] - px[1]) * (yy - py[2])) / d_
            l2 = ((py[2] - py[0]) * (xx - px[2]) + (px[0] - px[2]) * (yy - py[2])) / d_; l3 = 1 - l1 - l2
            ins = (l1 >= -0.02) & (l2 >= -0.02) & (l3 >= -0.02)
            X = l1[..., None] * P[0, 2:] + l2[..., None] * P[1, 2:] + l3[..., None] * P[2, 2:]
            dist = np.min(np.linalg.norm(X[..., None, :] - C[None, None, :, :3], axis=-1) / C[None, None, :, 3], axis=-1)
            smk[y0:y1 + 1, x0:x1 + 1] |= ins & (dist < 1.0)
        sm = Image.fromarray((smk * 255).astype(np.uint8))
        spot = np.asarray(sm) > 0
        out[spot] = np.array([26, 24, 22]) * (0.85 + 0.3 * shade[spot][:, None])
    # fur (user): short strands in the white coat - dark and light 1-px strokes, 3-5 px long, mostly along the atlas'
    # v axis, so the coat reads as hair, not smooth plastic. Spots, eyes, nose, mouth untouched.
    frng = np.random.default_rng(11); Hh_, Wd_ = L.shape
    furok = (out.mean(-1) > 170) & ~(spot if 'spot' in dir() else np.zeros(L.shape, bool))
    for _ in range(2600):
        y0_, x0_ = frng.integers(0, Hh_), frng.integers(0, Wd_)
        if not furok[y0_, x0_]:
            continue
        ang = frng.normal(np.pi / 2, 0.45); ln = frng.integers(3, 6); dv = frng.choice([-34, -22, 14])
        for k_ in range(ln):
            yy_, xx_ = int(round(y0_ + k_ * np.sin(ang))), int(round(x0_ + k_ * np.cos(ang)))
            if 0 <= yy_ < Hh_ and 0 <= xx_ < Wd_ and furok[yy_, xx_]:
                out[yy_, xx_] = np.clip(out[yy_, xx_] + dv * (1 - 0.15 * k_), 0, 255)
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(T, f"rival_atlas_{e}.png"))
print("prep_04 done")
