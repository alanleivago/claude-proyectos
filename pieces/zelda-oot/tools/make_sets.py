# Every set -> a clean plate (the set with its foreground elements inpainted away) + each foreground element as its own
# keyed layer (connected components of the Flow "keep only ..." edit; small bits are grouped), all in field coords
# (1920 x 824). Writes assets/s_*.jpg|webp and src/layers.js (LAYERS[set] = [[file, x, y, w, h], ...] in draw order).
# usage (from pieces/zelda-oot): ../../.venv/bin/python tools/make_sets.py
import json, numpy as np, cv2
from PIL import Image
from scipy import ndimage
G = 'gen/'
def field(src):
    return np.asarray(Image.open(src).convert('RGB').resize((1920, 1072), Image.LANCZOS), np.float32)[124:948]
def grade(a, sat=0.95, warm=(1.02, 1.0, 0.95)):
    L = a.mean(-1, keepdims=True); return (L + (a - L) * sat) * np.array(warm)
def keyed(s):
    mg = np.minimum(s[..., 0], s[..., 2]) - s[..., 1]; al = np.clip((60 - mg) / 40, 0, 1)
    lab, n = ndimage.label(al > 0.5); sz = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
    al = al * ndimage.binary_dilation(np.isin(lab, [i + 1 for i, v in enumerate(sz) if v > 150]), iterations=2)
    al = ndimage.minimum_filter(al, 3)
    fr = (al > 0) & (al < 0.999); solid = al > 0.999
    if solid.any():
        idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True); s = s.copy(); s[fr] = s[idx[0][fr], idx[1][fr]]
    return s, al
LAYERS = {}
def save_layer(rgb, A, dst):
    ys, xs = np.nonzero(A > 0.04); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    Image.fromarray(np.dstack([rgb, A * 255]).clip(0, 255).astype(np.uint8)[y0:y1, x0:x1]).save('assets/' + dst, quality=85)
    return [dst, int(x0), int(y0), int(x1 - x0), int(y1 - y0)]
def do_set(name, setf, fgf=None, plate=None, gain=1.0, group_px=9000):
    s = field(setf); out = []
    if fgf:
        f, al = keyed(field(fgf)); rgb = grade(f) * gain
        lab, n = ndimage.label(al > 0.3); sizes = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
        big = [i + 1 for i, v in enumerate(sizes) if v >= group_px]; small = np.isin(lab, [i + 1 for i, v in enumerate(sizes) if v < group_px])
        # each big component (dilated a bit to keep its soft edge) is one layer; the small bits share one layer
        comps = [ndimage.binary_dilation(lab == b, iterations=3) for b in big] + ([ndimage.binary_dilation(small, iterations=3)] if small.any() else [])
        for k, m in enumerate(sorted(comps, key=lambda m: -m.sum())):
            out.append(save_layer(rgb, al * m, f's_{name}_{k}.webp'))
        if plate is None:   # inpaint the set where the elements were (they sway and drift a little, so the plate must be clean there)
            mask = ndimage.binary_dilation(al > 0.1, iterations=10).astype(np.uint8) * 255
            s = cv2.inpaint(s.clip(0, 255).astype(np.uint8), mask, 9, cv2.INPAINT_TELEA).astype(np.float32)
    if plate is not None: s = field(plate)
    Image.fromarray(grade(s).clip(0, 255).astype(np.uint8)).save(f'assets/s_{name}.jpg', quality=86)
    LAYERS[name] = {'plate': f's_{name}.jpg', 'layers': out}; print(name, len(out))
SETS = [('kokiri', 'kokiri-village', 'kokiri'), ('glade', 'forest-glade', 'glade'), ('insidetree', 'inside-tree', 'insidetree'), ('bridge', 'forest-bridge', 'bridge'),
        ('garden', 'castle-garden', 'garden'), ('throne', 'throne-room', 'throne'), ('mountain', 'mountain-trail', 'mountain'), ('rockcity', 'rock-city', None),
        ('lavacave', 'lava-cave', 'lavacave'), ('grotto', 'waterfall-grotto', 'grotto'), ('belly', 'fish-belly', 'belly'), ('gate', 'castle-gate-night', 'gate'),
        ('hall', 'temple-hall', None), ('swordroom', 'sword-chamber', None), ('sages', 'sage-chamber', 'sages'), ('town', 'ruined-town', 'town'),
        ('ftemple', 'overgrown-temple', 'ftemple'), ('firetemple', 'fire-temple', 'firetemple'), ('frozen', 'frozen-grotto', 'frozen'), ('wtemple', 'water-temple', 'wtemple'),
        ('village', 'burning-village', 'village'), ('crypt', 'shadow-crypt', 'crypt'), ('colossus', 'desert-colossus', 'colossus'), ('organ', 'tower-organ', None),
        ('ruins', 'castle-ruins', 'ruins'), ('sky', 'above-the-clouds', 'clouds'),
        ('market', 'market-town', 'market'), ('kakariko', 'mountain-village', 'kakvillage'), ('lake', 'lake', 'lakeset'), ('waste', 'sandstorm-wasteland', 'waste'),
        ('realm', 'golden-realm', 'realm'), ('graveyard', 'graveyard', 'grave'), ('barrier', 'barrier-hall', 'barrier'), ('stairs', 'collapsing-stairs', 'stairs')]
for name, setn, fg in SETS: do_set(name, G + f'sets/{setn}.jpg', G + f'fg/{fg}.jpg' if fg else None)
# Hyrule: the clean plate (no clouds) + each cloud wisp; the volcano / ring / castle / trees from round 3
do_set('hyclouds', G + 'layers/hy_plate2.jpg', G + 'layers/hy_clouds.jpg', plate=G + 'layers/hy_plate2.jpg', group_px=400)
# prologue: the clean woven green, brought up to the approved field green
r = field(G + 'layers/ro_plate.jpg'); r = r * (np.array([118, 124, 58]) / r.reshape(-1, 3).mean(0)); r = ndimage.uniform_filter(r, (1, 1, 1))
Image.fromarray(grade(r, 1.0).clip(0, 255).astype(np.uint8)).save('assets/ro_plate.jpg', quality=88)
open('src/layers.js', 'w').write('// generated by tools/make_sets.py: each set\'s clean plate and its foreground layers [file, x, y, w, h] (field coords 1920x824)\nconst LAYERS = ' + json.dumps(LAYERS) + ';\n')
