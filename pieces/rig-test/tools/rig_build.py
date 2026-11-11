# Mesh-puppet rig builder: ONE keyed character PNG + a small rig file (joints, bones, cut polygons) ->
#   assets/<name>_<layer>.png  (one texture per layer: occluded parts cut out, hidden areas filled, cut edges re-outlined)
#   src/rig_<name>.js           (const RIG_<NAME> = { layers: [{ tex, verts, uvs, tris, bones, weights }], bones, props })
#   review/<name>_cuts.png      (overlay of the cuts, joints and mesh to check by eye)
# usage: python tools/rig_build.py rigs/<name>.json
import sys, json, os, numpy as np, cv2
from PIL import Image, ImageDraw
from scipy import ndimage
from scipy.spatial import Delaunay

cfg = json.load(open(sys.argv[1])); NAME = cfg['name']
src = np.asarray(Image.open(cfg['image']).convert('RGBA'), np.float32)
H, W = src.shape[:2]; rgb0 = src[..., :3]; A0 = src[..., 3] / 255
J = {k: np.array(v, float) for k, v in cfg['joints'].items()}
RUST = np.array(cfg.get('outline', [178, 62, 34]), np.float32); CREAM = np.array([244, 228, 186], np.float32)
yy, xx = np.mgrid[0:H, 0:W]

def poly(pts):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([tuple(p) for p in pts], fill=255); return np.asarray(m) > 0

# weave of the background cloth (same as weave.py) to press into filled areas
bgL = np.asarray(Image.open(cfg['weave_bg']).convert('L'), np.float32)[300:800, 300:1500]
wv = bgL - ndimage.gaussian_filter(bgL, 6); wv = wv / (np.abs(wv).mean() * 4)
WV = np.tile(wv, (H // wv.shape[0] + 1, W // wv.shape[1] + 1))[:H, :W]
def sample(p, r=9):
    x, y = map(int, p); return np.median(rgb0[y - r:y + r, x - r:x + r].reshape(-1, 3), 0)

_, (iy, ix) = ndimage.distance_transform_edt(A0 < 0.9, return_indices=True)
NEAR = rgb0[iy, ix]                            # colour of the nearest solid pixel everywhere (no black from outside)
taken = np.zeros((H, W), bool); layers_px = {}
for L in cfg['layers']:                       # exclusive pixel ownership, in the order listed; 'rest' takes what is left
    if 'poly' in L:
        m = poly(L['poly'])
        if L.get('grow'): m = ndimage.binary_dilation(m, iterations=L['grow'])
        if 'below' in L: m &= yy > L['below']
        m &= (A0 > 0.02) & ~taken
    else:
        m = (A0 > 0.02) & ~taken
    taken |= m; layers_px[L['name']] = m

orig_edge = ndimage.binary_dilation(A0 < 0.3, iterations=6)   # near the original silhouette's own outline
os.makedirs('assets', exist_ok=True); os.makedirs('review', exist_ok=True)
out_layers = []; prev = np.zeros((H, W, 3), np.float32)
for L in cfg['layers']:
    m = layers_px[L['name']]
    a = np.where(m, A0, 0.0); col = rgb0.copy()
    for f in L.get('fill', []):               # hidden areas: under an arm that was cut away, a limb's root under the tunic
        fm = poly(f['poly'])
        if 'clip' in f: fm &= poly(f['clip'])
        if 'band' in f: fm &= (yy >= f['band'][0]) & (yy <= f['band'][1])
        if f.get('grow'): fm = ndimage.binary_dilation(fm, iterations=f['grow'])
        if 'clip' in f: fm &= poly(f['clip'])
        mode = f.get('mode', 'flat')
        if mode == 'clean':                   # keep the cloth that was there (same fabric), erase outline threads crossing it
            r_, g_, b_ = rgb0[..., 0], rgb0[..., 1], rgb0[..., 2]
            ref = sample(f['from']) if 'from' in f else None      # anything that is not this fabric's colour gets rewoven
            line = fm & ((r_ > g_ + 15) & (r_ > b_ + 15))
            if ref is not None: line |= fm & (np.abs(rgb0 - ref).sum(-1) > f.get('tol', 110))
            line = ndimage.binary_dilation(ndimage.binary_opening(line, iterations=1) | line, iterations=3) & fm
            line |= fm & (A0 < 0.9)
            img = NEAR.clip(0, 255).astype(np.uint8)
            inp = cv2.inpaint(img, line.astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA).astype(np.float32)
            inp = inp * (1 + 0.45 * WV[..., None])
            col[line] = inp[line]
        elif mode == 'tile':                  # weave the hidden area from a clean patch of the same cloth (mirrored tiles, no seams)
            x0, y0, x1, y1 = f['donor']; d0 = NEAR[y0:y1, x0:x1]
            d1 = np.concatenate([d0, d0[:, ::-1]], 1); d2 = np.concatenate([d1, d1[::-1]], 0)
            T = np.tile(d2, (H // d2.shape[0] + 1, W // d2.shape[1] + 1, 1))[:H, :W]
            soft = ndimage.gaussian_filter(fm.astype(np.float32), 2.5)[..., None]
            soft = np.where(fm[..., None], np.maximum(soft, 0.5) * 2 - 1, 0) ** 0.5
            col[:] = col * (1 - soft) + T * soft
        elif mode == 'copy':                  # copy a stretch of the same pattern from elsewhere (a belt, a stripe)
            dx, dy = f['offset']; sh = np.roll(np.roll(NEAR, dy, 0), dx, 1); col[fm] = sh[fm]
        else:
            c = sample(f['from']); tex = c[None, None, :] * (1 + 0.55 * WV[..., None]); col[fm] = tex[fm]
        a[fm] = 1.0
    if L.get('outline_cuts'):                 # new silhouette edges made by the cut get the thread outline back
        solid = a > 0.5
        edge_in = solid & ~ndimage.binary_erosion(solid, iterations=4)
        cut = edge_in & ~orig_edge
        cutz = ndimage.binary_dilation(cut, iterations=1) & solid
        col[cutz] = RUST * (1 + 0.35 * WV[cutz][:, None])
    col[a <= 0.004] = 0
    tex = np.dstack([col, a * 255]).clip(0, 255).astype(np.uint8)
    Image.fromarray(tex).save(f"assets/{NAME}_{L['name']}.png", optimize=True)

    # ---- mesh: grid + contour samples inside the (dilated) layer mask, Delaunay, drop triangles outside it
    solid = ndimage.binary_dilation(a > 0.1, iterations=3)
    S = cfg.get('mesh_step', 16)
    pts = [(x, y) for y in range(0, H, S) for x in range(0, W, S) if solid[y, x]]
    bd = solid & ~ndimage.binary_erosion(solid)
    by, bx = np.nonzero(bd); idx = np.arange(0, len(bx), max(1, len(bx) // max(1, int(bd.sum() / (S * 0.6)))))
    pts += [(bx[i], by[i]) for i in idx]
    P = np.array(pts, float)
    # thin contour points that sit too close to one another
    keep = []; grid = {}
    for i, p in enumerate(P):
        k = (int(p[0] // (S * 0.45)), int(p[1] // (S * 0.45)))
        if k in grid: continue
        grid[k] = 1; keep.append(i)
    P = P[keep]
    tri = Delaunay(P).simplices
    good = []
    for t in tri:
        c = P[t].mean(0); e = [(P[t[i]] + P[t[(i + 1) % 3]]) / 2 for i in range(3)]
        ok = all(solid[int(min(H - 1, q[1])), int(min(W - 1, q[0]))] for q in [c] + e)
        if ok: good.append(t)
    tri = np.array(good)
    used = np.unique(tri); remap = -np.ones(len(P), int); remap[used] = np.arange(len(used)); P = P[used]; tri = remap[tri]

    # ---- weights: inverse distance to each bone segment of this layer, softened across joints, top 3 kept
    bones = L['bones']; Bd = {b['name']: b for b in cfg['bones']}
    D = []
    for bn in bones:
        h, t = J[Bd[bn]['head']], J[Bd[bn]['tail']]; v = t - h; ll = max(1e-6, v @ v)
        u = np.clip(((P - h) @ v) / ll, 0, 1); q = h + u[:, None] * v; D.append(np.linalg.norm(P - q, axis=1))
    D = np.array(D).T
    r = L.get('blend', cfg.get('blend', 18.0))
    Wt = 1 / (D ** 2 + r ** 2) ** 2
    if Wt.shape[1] > 3:
        cut3 = np.sort(Wt, 1)[:, -3][:, None]; Wt = np.where(Wt >= cut3, Wt, 0)
    Wt /= Wt.sum(1, keepdims=True)
    Wt[Wt < 0.01] = 0; Wt /= Wt.sum(1, keepdims=True)
    # draw order inside a layer: triangles of later bones in the chain on top (forearm over upper arm at a fold)
    dom = Wt[tri].mean(1).argmax(1); order = np.argsort(dom, kind='stable'); tri = tri[order]
    out_layers.append({'name': L['name'], 'tex': f"{NAME}_{L['name']}.png", 'bones': bones,
                       'verts': np.round(P, 1).ravel().tolist(), 'tris': tri.ravel().tolist(),
                       'weights': np.round(Wt, 3).ravel().tolist()})
    print(f"{L['name']}: {len(P)} verts, {len(tri)} tris, bones {bones}")

rig = {'name': NAME, 'size': [W, H], 'joints': {k: v.tolist() for k, v in J.items()}, 'bones': cfg['bones'],
       'layers': out_layers, 'props': cfg.get('props', []), 'anchor': cfg.get('anchor'), 'draw': cfg.get('draw', [l['name'] for l in cfg['layers']])}
os.makedirs('src', exist_ok=True)
open(f"src/rig_{NAME}.js", 'w').write(f"// generated by tools/rig_build.py from {sys.argv[1]}\nconst RIG_{NAME.upper()} = {json.dumps(rig, separators=(',', ':'))};\n")

# ---- review overlay: layers tinted, cuts, joints, mesh
ov = Image.new('RGBA', (W * 2, H), (50, 50, 50, 255))
base = Image.fromarray(src.astype(np.uint8)); ov.alpha_composite(base, (0, 0))
tint = [(255, 60, 60), (60, 160, 255), (60, 255, 120), (255, 220, 40), (220, 80, 255), (40, 255, 255)]
d = ImageDraw.Draw(ov)
for i, L in enumerate(out_layers):
    im = Image.open('assets/' + L['tex']); ov.alpha_composite(im, (W, 0))
    P = np.array(L['verts']).reshape(-1, 2); T = np.array(L['tris']).reshape(-1, 3)
    for t in T:
        q = [(P[k][0], P[k][1]) for k in t]; d.polygon(q, outline=tint[i % 6] + (110,))
for b in cfg['bones']:
    h, t = J[b['head']], J[b['tail']]
    d.line([tuple(h), tuple(t)], fill=(255, 255, 255, 255), width=3)
    for p in (h, t): d.ellipse([p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6], outline=(0, 0, 0, 255), fill=(255, 255, 0, 255))
for i, L in enumerate(cfg['layers']):
    if 'poly' in L: d.line([tuple(p) for p in L['poly']] + [tuple(L['poly'][0])], fill=tint[i % 6] + (255,), width=2)
    for f in L.get('fill', []): d.line([tuple(p) for p in f['poly']] + [tuple(f['poly'][0])], fill=(255, 255, 255, 200), width=1)
ov.convert('RGB').save(f"review/{NAME}_cuts.png")
