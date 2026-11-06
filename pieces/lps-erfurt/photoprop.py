"""Low-poly prop from ONE straight-on photo (VLVT Blender guide, fuentes/blender-lowpoly):
read the silhouette (width at each height) -> loft an N-sided mesh from that profile -> project the photo on it
(front orthographic projection, the back mirrors the front) -> PS1 texture (64-512 px, small palette, Closest).
Also ps1_post(): render-size frame -> 1/4 size, 15-bit colour with a 4x4 Bayer dither, nearest x4 back up.
Photo must be on a flat background (magenta/green), upright, no hands.
Step 1 (venv, PIL):  python photoprop.py ref/bottle.jpg [--tex 128 --colors 32]  -> ref/bottle.prop.json + ref/bottle_tex.png
Step 2 (Blender):    photoprop.loft("ref/bottle.jpg", ...) reads those two files."""
import json, math, os, sys
import numpy as np


def silhouette(path, thr=48):
    from PIL import Image
    """Per-row (x0, x1) of the object, keyed against the background colour sampled at the left/right borders."""
    a = np.asarray(Image.open(path).convert("RGB"), float)
    h, w, _ = a.shape
    bg = (a[:, :8].mean(1) + a[:, -8:].mean(1)) / 2                     # per-row bg (handles the floor gradient)
    mask = np.linalg.norm(a - bg[:, None], axis=2) > thr
    mask[:, :8] = mask[:, -8:] = False
    rows = {}
    for y in range(h):
        xs = np.flatnonzero(mask[y])
        if len(xs) > 0.02 * w:
            rows[y] = (xs.min(), xs.max())
    ys = sorted(rows)
    # drop the soft floor shadow: keep the longest run of consecutive rows
    runs, cur = [], [ys[0]]
    for y in ys[1:]:
        if y == cur[-1] + 1:
            cur.append(y)
        else:
            runs.append(cur); cur = [y]
    runs.append(cur)
    keep = max(runs, key=len)
    wd = lambda y: rows[y][1] - rows[y][0]
    n = len(keep)
    body = max(wd(y) for y in keep[n // 2:int(n * 0.85)])               # widest row of the lower body
    flare = [i for i in range(int(n * 0.85), n) if wd(keep[i]) > 1.04 * body]
    if flare:
        keep = keep[:flare[0]]                                           # contact shadow: cut from where the base flares out
    return a.astype(np.uint8), mask, {y: rows[y] for y in keep}


def _rdp(pts, eps):
    """Douglas-Peucker on the (height, radius) profile -> the rows where the outline actually bends."""
    if len(pts) < 3:
        return pts
    p0, p1 = np.array(pts[0], float), np.array(pts[-1], float)
    d = p1 - p0; n = np.hypot(*d) or 1
    dist = [abs(d[0] * (p0[1] - q[1]) - d[1] * (p0[0] - q[0])) / n for q in pts]
    i = int(np.argmax(dist))
    if dist[i] > eps:
        return _rdp(pts[:i + 1], eps)[:-1] + _rdp(pts[i:], eps)
    return [pts[0], pts[-1]]


def ps1_texture(rgb, mask, rows, tex_h=128, colors=32):
    from PIL import Image
    """Crop to the object, bleed edge colours into the background (no magenta fringe), shrink, cut the palette."""
    y0, y1 = min(rows), max(rows)
    x0 = min(r[0] for r in rows.values()); x1 = max(r[1] for r in rows.values())
    crop = rgb[y0:y1 + 1, x0:x1 + 1].copy(); m = mask[y0:y1 + 1, x0:x1 + 1]
    for y in range(crop.shape[0]):                                       # row-wise edge bleed
        xs = np.flatnonzero(m[y])
        if len(xs):
            crop[y, :xs[0]] = crop[y, xs[0]]; crop[y, xs[-1] + 1:] = crop[y, xs[-1]]
    tw = max(16, round(tex_h * crop.shape[1] / crop.shape[0] / 4) * 4)
    im = Image.fromarray(crop).resize((tw, tex_h), Image.BOX)
    im = im.quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    return np.asarray(im), (x0, x1, y0, y1)


def prepare(path, tex_h=128, colors=32, eps_px=6, max_rings=12):
    """venv side: silhouette -> simplified profile rings + the PS1 texture, saved next to the photo."""
    from PIL import Image
    rgb, mask, rows = silhouette(path)
    tex, (x0, x1, y0, y1) = ps1_texture(rgb, mask, rows, tex_h, colors)
    cx = float(np.median([(a + b) / 2 for a, b in rows.values()]))       # object axis in image px
    prof = [(y, (rows[y][1] - rows[y][0]) / 2) for y in sorted(rows)]
    eps = eps_px
    ring = _rdp(prof, eps)
    while len(ring) > max_rings:
        eps *= 1.4; ring = _rdp(prof, eps)
    base = os.path.splitext(path)[0]
    Image.fromarray(tex).save(base + "_tex.png")
    json.dump(dict(cx=cx, box=[int(x0), int(x1), int(y0), int(y1)], rings=[[int(y), float(r)] for y, r in ring]),
              open(base + ".prop.json", "w"))
    print(f"{path}: {len(ring)} rings, tex {tex.shape[1]}x{tex.shape[0]}, {colors} colours")


def loft(path, name, height=0.3, sides=8, loc=(0, 0, 0)):
    """Blender side: build the prop from prepare()'s files. sides 6-12 (more reads modern). Returns the object."""
    import bpy
    import lpskit as K
    base = os.path.splitext(path)[0]
    P = json.load(open(base + ".prop.json")); cx = P["cx"]; x0, x1, y0, y1 = P["box"]; ring = P["rings"]
    s = height / (y1 - y0)                                                # px -> metres
    verts, uvs = [], []
    for y, r in ring:
        for i in range(sides):
            th = 2 * math.pi * (i + 0.5) / sides                          # half-step: a flat face looks at the camera
            px = cx + r * math.sin(th)
            verts.append(((px - cx) * s, -r * math.cos(th) * s, (y1 - y) * s))
            uvs.append(((px - x0) / (x1 - x0), (y1 - y) / (y1 - y0)))
    faces = [(k * sides + i, k * sides + (i + 1) % sides, (k + 1) * sides + (i + 1) % sides, (k + 1) * sides + i)
             for k in range(len(ring) - 1) for i in range(sides)]
    caps = [list(range(sides))[::-1], [(len(ring) - 1) * sides + i for i in range(sides)]]
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces + caps); me.update()
    uvl = me.uv_layers.new(name="UV")
    for p in me.polygons:                                                 # caps take the top/bottom middle texel
        for li, vi in zip(p.loop_indices, p.vertices):
            uvl.data[li].uv = uvs[vi] if p.index < len(faces) else (0.5, uvs[vi][1])
    img = bpy.data.images.load(base + "_tex.png")
    me.materials.append(K.mat_image(name + "_mat", img))
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); o.location = loc
    print(f"{name}: {len(ring)} rings x {sides} sides = {len(me.polygons)} faces")
    return o


BAYER4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], float) / 16 - 0.5


def ps1_post(img, scale=4, bits=5):
    from PIL import Image
    """1080x1920 -> 270x480, 4x4 ordered dither down to `bits` per channel (PS1 = 15-bit), nearest x4 back up."""
    im = img.convert("RGB")
    W, H = im.size
    a = np.asarray(im.resize((W // scale, H // scale), Image.BOX), float)
    h, w, _ = a.shape
    step = 255 / (2 ** bits - 1)
    d = np.tile(BAYER4, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
    a = np.clip(np.round(a / step + d) * step, 0, 255).astype(np.uint8)
    return Image.fromarray(a).resize((W, H), Image.NEAREST)


if __name__ == "__main__":
    a = sys.argv[1:]
    opt = lambda k, d: int(a[a.index(k) + 1]) if k in a else d
    for f in [x for x in a if x.lower().endswith((".jpg", ".png")) and not x.startswith("--")]:
        prepare(f, tex_h=opt("--tex", 128), colors=opt("--colors", 32))
