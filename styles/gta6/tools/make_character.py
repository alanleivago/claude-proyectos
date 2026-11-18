"""Paint a GTA VI loading-screen character from a photoreal reference photo (redrawn, not filtered).

  python make_character.py styles/gta6/characters/barman.json [--debug]

What it does (the paint-over method of the Rockstar artists, in code; see STYLE.md "v4"):
  1. analyse   person mask, clothing + face parsing, depth (gta_parse.py, ONNX models)
  2. materials every pixel gets one material (skin, hair, shirt, tee, pants, prop...) -> its own palette
  3. shapes    per material: a texture-free form value (smoothed photo light + depth-normal light from the
               config's sun) cut into 2-4 cel tones; the tone masks are redrawn as clean shapes
               (smooth curves for skin/hair, angular polygons for cloth), islands removed
  4. paint     flat palette colour per tone + soft airbrush gradient inside each tone + a little local
               colour (red nose/cheeks) ; the photo's own pixels never reach the output (except eyes)
  5. print     cloth patterns are redrawn as flat vector leaves, then shaded with the cloth's tones
  6. lines     tapered XDoG lines on face/hands/folds, thin material borders, heavier silhouette
  7. rim       cream light rim on the sun side, thin cyan bounce on the shadow side
  8. grade     warm yellow-pink gradient-map pass; output = RGBA png at full frame size
"""
import json
import os
import sys
import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gta_parse as gp

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
DEBUG = '--debug' in sys.argv


def hexc(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def lab_of(rgb):     # rgb float 0..255 (...,3) -> Lab float (L 0..100)
    a = np.asarray(rgb, np.float32).reshape(-1, 1, 3) / 255
    return cv2.cvtColor(a, cv2.COLOR_RGB2LAB).reshape(np.shape(rgb))


def rgb_of(lab):
    return np.clip(cv2.cvtColor(lab.astype(np.float32), cv2.COLOR_LAB2RGB) * 255, 0, 255)


def blur(x, s):
    return cv2.GaussianBlur(x, (0, 0), s) if s > 0 else x


def clean_mask(m, smooth, min_area, angular=0.0):
    """binary mask -> redrawn shape: islands/holes removed, border smoothed (curves) or polygonised (angular)"""
    m = (blur(m.astype(np.float32), smooth) > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros(n, bool)
    keep[1:] = st[1:, cv2.CC_STAT_AREA] >= min_area
    m = keep[lab].astype(np.uint8)
    inv = 1 - m
    n, lab, st, _ = cv2.connectedComponentsWithStats(inv, 8)
    fill = np.zeros(n, bool)
    fill[1:] = st[1:, cv2.CC_STAT_AREA] < min_area
    m[fill[lab]] = 1
    if angular > 0:
        cs, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        out = np.zeros_like(m)
        if cs:
            polys = [cv2.approxPolyDP(c, angular, True) for c in cs]
            for i, p in enumerate(polys):
                hole = hier[0][i][3] >= 0
                cv2.fillPoly(out, [p], 0 if hole else 1, cv2.LINE_AA)
        m = out
    return m


def auto_palette(base, sat=1.15):
    """gta6 tones from one Lab colour: warm key, cream highlight, magenta-violet shadow, deep violet, pink rim"""
    L, a, b = [float(v) for v in base]
    a, b = a * sat, b * sat
    T = {'key': (min(92, L + 8), a * 1.05 + 4, b * 1.05 + 8),
         'hi': (min(97, L + 28), a * 0.5 + 4, b * 0.5 + 16),
         'shadow': (L * 0.64, a * 0.85 + 14, b * 0.8 - 14),
         'deep': (L * 0.36, a * 0.6 + 12, b * 0.6 - 16),
         'rim': (min(90, L * 0.75 + 14), a * 0.6 + 26, b * 0.6 - 10)}
    return {k: rgb_of(np.array([[v]], np.float32))[0, 0] for k, v in T.items()}


def xdog(L, sigma, k=1.6, tau=0.99, eps=0.0, phi=150):
    """extended difference of Gaussians -> line strength 0..1 (dark lines = 1)"""
    g1, g2 = blur(L, sigma), blur(L, sigma * k)
    d = (g1 - tau * g2)
    return np.clip(1 - np.where(d >= eps, 1.0, 1 + np.tanh(phi * (d - eps))), 0, 1)


def prune(lines, thr, min_area):
    b = (lines > thr).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(b, 8)
    keep = np.zeros(n, bool)
    keep[1:] = st[1:, cv2.CC_STAT_AREA] >= min_area
    return lines * keep[lab]


def frond(canvas, cx, cy, ang, size, col, rng, kind='palm'):
    """draw one flat palm frond (stem + leaflets) into canvas (H,W,4 float, premultiplied rgb + a)"""
    pts_all = []
    ca, sa = np.cos(ang), np.sin(ang)
    curve = rng.uniform(-0.25, 0.25)
    nleaf = rng.integers(7, 12) if kind == 'palm' else rng.integers(4, 7)
    for i in range(nleaf):
        t = (i + 0.5) / nleaf
        sx, sy = t * size, curve * size * t * t
        for side in (-1, 1):
            L = size * (0.55 if kind == 'palm' else 0.4) * np.sin(np.pi * (0.15 + 0.8 * t)) * rng.uniform(0.8, 1.1)
            wdt = size * (0.06 if kind == 'palm' else 0.14)
            la = side * (0.95 - 0.35 * t) + rng.uniform(-0.12, 0.12)
            dx, dy = np.cos(la), np.sin(la)
            px, py = -dy, dx
            leaf = []
            for u in np.linspace(0, 1, 9):
                w = wdt * np.sin(np.pi * u) ** 0.8
                leaf.append((sx + dx * L * u + px * w, sy + dy * L * u + py * w))
            for u in np.linspace(1, 0, 9):
                w = wdt * np.sin(np.pi * u) ** 0.8
                leaf.append((sx + dx * L * u - px * w, sy + dy * L * u - py * w))
            pts_all.append(leaf)
    m = np.zeros(canvas.shape[:2], np.uint8)
    for leaf in pts_all:
        p = np.array([(cx + x * ca - y * sa, cy + x * sa + y * ca) for x, y in leaf], np.float32)
        cv2.fillPoly(m, [np.round(p * 4).astype(np.int32)], 255, cv2.LINE_AA, shift=2)
    stem = np.array([(cx + (t * size) * ca - (curve * size * t * t) * sa, cy + (t * size) * sa + (curve * size * t * t) * ca)
                     for t in np.linspace(0, 1, 12)], np.float32)
    cv2.polylines(m, [np.round(stem * 4).astype(np.int32)], False, 255, max(1, int(size * 0.02)), cv2.LINE_AA, shift=2)
    a = m.astype(np.float32)[..., None] / 255
    canvas[..., :3] = canvas[..., :3] * (1 - a) + col * a
    canvas[..., 3:] = np.maximum(canvas[..., 3:], a)


def draw_print(H, W, mask, cfg, rng, warp):
    """flat vector cloth print clipped to mask -> (rgb, alpha)"""
    canvas = np.zeros((H, W, 4), np.float32)
    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return canvas
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    size = cfg.get('size', 0.16) * H
    cols = [hexc(c) for c in cfg['colors']]
    step = size * cfg.get('spacing', 0.75)
    yy = y0 - size
    row = 0
    while yy < y1 + size:
        xx = x0 - size + (row % 2) * step * 0.5
        while xx < x1 + size:
            frond(canvas, xx + rng.uniform(-0.3, 0.3) * step, yy + rng.uniform(-0.3, 0.3) * step,
                  rng.uniform(0, 2 * np.pi), size * rng.uniform(0.75, 1.15), cols[rng.integers(len(cols))], rng,
                  cfg.get('kind', 'palm'))
            xx += step
        yy += step * 0.8
        row += 1
    # bend the print with the cloth (displacement from the form value) so it follows folds a little
    if warp is not None:
        gy, gx = np.gradient(blur(warp, H * 0.01))
        k = cfg.get('warp', 0.0) * H
        mx, my = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
        canvas = cv2.remap(canvas, (mx + gx * k).astype(np.float32), (my + gy * k).astype(np.float32), cv2.INTER_LINEAR)
    canvas[..., 3] *= mask
    return canvas


def grabcut_box(img, box, base_mask):
    x0, y0, x1, y1 = box
    m = np.full(img.shape[:2], cv2.GC_BGD, np.uint8)
    m[y0:y1, x0:x1] = cv2.GC_PR_FGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, m, None, bgd, fgd, 5, cv2.GC_INIT_WITH_MASK)
    return ((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD)).astype(np.uint8)


def load_cfg(cfg_path):
    """config with optional "base": another JSON merged underneath (dicts merged one level deep)"""
    cfg = json.load(open(cfg_path))
    if 'base' in cfg:
        bp = cfg['base'] if os.path.isabs(cfg['base']) else os.path.join(ROOT, cfg['base'])
        base = load_cfg(bp)
        for k, v in cfg.items():
            if isinstance(v, dict) and isinstance(base.get(k), dict):
                merged = dict(base[k])
                for kk, vv in v.items():
                    merged[kk] = {**merged[kk], **vv} if isinstance(vv, dict) and isinstance(merged.get(kk), dict) else vv
                base[k] = merged
            else:
                base[k] = v
        cfg = base
    return cfg


def main(cfg_path):
    cfg = load_cfg(cfg_path)
    rel = lambda p: p if os.path.isabs(p) else os.path.join(ROOT, p)
    src = cv2.imread(rel(cfg['photo']))
    H0 = src.shape[0]
    Ht = cfg.get('height', 2048)
    sc = Ht / H0
    img = cv2.resize(src, None, fx=sc, fy=sc, interpolation=cv2.INTER_LANCZOS4)
    H, W = img.shape[:2]
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32)
    u = H / 2048.0                                  # size unit
    out_dir = os.path.dirname(rel(cfg['out']))
    os.makedirs(out_dir, exist_ok=True)
    stem = os.path.splitext(rel(cfg['out']))[0]
    an = gp.analyse(cv2.cvtColor(src, cv2.COLOR_BGR2RGB), stem + '_parse.npz')
    rs = lambda a, interp=cv2.INTER_NEAREST: cv2.resize(a, (W, H), interpolation=interp)
    clothes, face = rs(an['clothes']), rs(an['face'])
    person = rs(an['person'], cv2.INTER_LINEAR)
    depth = rs(an['depth'], cv2.INTER_CUBIC)

    # ---------- 2. materials
    names = ['none']
    mat = np.zeros((H, W), np.int32)

    def setm(mask, name):
        if name not in names:
            names.append(name)
        mat[mask.astype(bool)] = names.index(name)

    C = {n: i for i, n in enumerate(gp.CLOTHES)}
    F = {n: i for i, n in enumerate(gp.FACE)}
    pm = clean_mask(person > 0.5, 1.5 * u, int(400 * u * u))
    setm(pm & np.isin(clothes, [C['pants'], C['skirt']]), 'pants')
    setm(pm & np.isin(clothes, [C['lshoe'], C['rshoe']]), 'shoes')
    up = pm & np.isin(clothes, [C['upper'], C['dress'], C['scarf']])
    split = cfg.get('upper', ['shirt'])
    if len(split) == 2 and up.sum() > 100:     # two garments in "upper": k-means on colour, (darker/more chroma, lighter)
        lp = lab_of(blur(rgb, 3 * u))
        ub = up.astype(bool)
        feat = np.dstack([lp[..., 0] * cfg.get('split_L_weight', 0.35), lp[..., 1], lp[..., 2]])[ub].astype(np.float32)
        _, lbl, cen = cv2.kmeans(feat, 2, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5), 4,
                                 cv2.KMEANS_PP_CENTERS)
        chroma = np.hypot(cen[:, 1], cen[:, 2])
        li = int(np.argmin(chroma - cen[:, 0] * 0.3))   # light garment = low chroma, higher L
        lm = np.zeros((H, W), bool)
        lm[ub] = lbl.ravel() == li
        light = clean_mask(lm, 6 * u, int(4000 * u * u)) & up
        setm(up & (1 - light), split[0])
        setm(up & light, split[1])
    else:
        setm(up, split[0])
    setm(pm & np.isin(clothes, [C['face'], C['larm'], C['rarm'], C['lleg'], C['rleg']]), 'skin')
    setm(pm & np.isin(clothes, [C['hat']]), 'hat')
    setm(pm & np.isin(clothes, [C['sunglasses']]), 'glasses')
    setm(pm & np.isin(clothes, [C['bag']]), 'bag')
    fs = np.isin(face, [F['skin'], F['nose'], F['l_ear'], F['r_ear'], F['neck']])
    setm(pm & fs & ~np.isin(clothes, [C['upper']]) | (pm & np.isin(face, [F['skin'], F['nose']])), 'skin')
    # the face gets its own material (closer paint-over of the photo's value structure, crisp edges)
    head = cv2.dilate((clothes == C['face']).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=int(12 * u)) > 0
    setm(pm & head & (np.isin(face, [F['skin'], F['nose'], F['l_ear'], F['r_ear']]) | (clothes == C['face'])) & (mat == names.index('skin')), 'face')
    # bare skin the clothing model called "upper" (muscular arms next to a tank top): skin-coloured -> skin
    if cfg.get('skin_fix', 14) and 'face' in names:
        lb_ = lab_of(blur(rgb, 2 * u))
        sk = np.isin(mat, [names.index(n) for n in ('face', 'skin') if n in names])
        med = np.median(lb_[sk], 0)
        near = np.linalg.norm((lb_ - med) * np.array([0.15, 1, 1]), axis=2) < cfg.get('skin_fix', 14)
        cl = np.isin(mat, [names.index(n) for n in names if n not in ('none', 'face', 'skin', 'hair', 'lips')])
        setm(clean_mask(near & cl, 4 * u, int(3000 * u * u)) & cl, 'skin')
    setm(pm & np.isin(clothes, [C['hair']]) | (pm & (face == F['hair'])), 'hair')
    setm(np.isin(face, [F['u_lip'], F['l_lip'], F['mouth']]) & head, 'lips')
    eyes = (np.isin(face, [F['l_eye'], F['r_eye']]) & head).astype(np.uint8)
    brows = (np.isin(face, [F['l_brow'], F['r_brow']]) & head).astype(np.uint8)
    # props added by box (GrabCut), e.g. a glass in the hand, the counter, a car
    for p in cfg.get('add', []):
        if 'poly' in p:                           # exact outline in photo pixels (props: glass, phone, keys)
            m = np.zeros((H, W), np.uint8)
            cv2.fillPoly(m, [np.round(np.array(p['poly'], np.float32) * sc).astype(np.int32)], 1, cv2.LINE_AA)
        else:
            b = [int(v * sc) for v in p['box']]
            m = grabcut_box(img, b, pm) if p.get('grabcut', True) else None
            if m is None:
                m = np.zeros((H, W), np.uint8)
                m[b[1]:b[3], b[0]:b[2]] = 1
        if 'keep' in p:                           # materials that stay on top (fingers over the glass)
            m = m & ~np.isin(mat, [names.index(n) for n in p['keep'] if n in names])
        if p.get('under', False):                 # only where nothing else is (props next to the person)
            m = m & (mat == 0)
        if 'within' in p:                         # re-label part of a material (e.g. the tee inside "upper")
            m = m & np.isin(mat, [names.index(n) for n in p['within'] if n in names])
        setm(clean_mask(m, p.get('smooth', 2) * u, int(500 * u * u)), p['material'])
    fig = mat > 0
    alpha = blur(clean_mask(fig, 1.2 * u, int(2000 * u * u)).astype(np.float32), 0.7 * u)
    if DEBUG:
        rng = np.random.RandomState(5)
        pal = rng.randint(40, 255, (len(names) + 1, 3))
        pal[0] = 0
        cv2.imwrite(stem + '_dbg_materials.jpg', cv2.addWeighted(img, 0.35, pal[mat].astype(np.uint8), 0.65, 0))
        print('materials', names)

    # ---------- 3. form: texture-free key light (photo light + designed normals), dual split lighting
    lab = lab_of(rgb)
    Lph = lab[..., 0]
    bil = img.copy()
    for _ in range(5):                                # de-pored photo: keeps wrinkles and features, drops pores
        bil = cv2.bilateralFilter(bil, 9, 25, 5 * u)
    Lbil = lab_of(cv2.cvtColor(bil, cv2.COLOR_BGR2RGB).astype(np.float32))[..., 0]
    small = cv2.resize(Lph, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    small = cv2.medianBlur(small.astype(np.uint8), 5).astype(np.float32)
    for _ in range(3):
        small = cv2.bilateralFilter(small, 9, 12, 5)
    Lsm = cv2.resize(small, (W, H), interpolation=cv2.INTER_CUBIC)
    sx = -1.0 if cfg.get('sun', 'left') == 'left' else 1.0     # key (sun) side in image x
    mats = cfg['materials']
    # designed normals: inflate every material shape (rounded forms -> both edges catch light) + depth relief
    def dome(mask, R):                                # rounded profile: steep at the border, flat inside
        d = cv2.distanceTransform(mask.astype(np.uint8), cv2.DIST_L2, 5) / max(R, 1)
        d = np.clip(d, 0, 1)
        return np.sqrt(d * (2 - d)) * R
    hgt = 0.7 * dome(alpha > 0.5, cfg.get('inflate_body', 0.06) * H)
    for mi in range(1, len(names)):
        mm = clean_mask(mat == mi, 3 * u, int(200 * u * u))
        if mm.sum() > 50:
            hgt += 0.5 * dome(mm, (mats.get(names[mi], {}).get('inflate', cfg.get('inflate', 0.03))) * H)
    hgt = blur(hgt, 4 * u) + blur(depth, 5 * u) * cfg.get('depth_relief', 300.0)
    gy, gx = np.gradient(hgt)
    nrm = np.dstack([-gx, -gy, np.ones_like(gx)])
    nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)

    def lit(v):
        v = np.array(v, np.float32)
        v /= np.linalg.norm(v)
        return (nrm * v).sum(2)
    n_key = lit([sx * 0.8, -0.35, cfg.get('key_z', 0.35)])
    n_rim = lit([-sx * 0.95, -0.15, 0.15])

    fz = np.isin(face, [F['skin'], F['nose'], F['l_eye'], F['r_eye'], F['l_brow'], F['r_brow'], F['u_lip'], F['l_lip'], F['mouth']]) & head
    face_soft = blur(fz.astype(np.float32), 10 * u)
    feat_m = (np.isin(face, [F['l_eye'], F['r_eye'], F['nose'], F['u_lip'], F['l_lip'], F['mouth'], F['l_brow'], F['r_brow']]) & head).astype(np.uint8)
    ao_zone = cv2.dilate(feat_m, np.ones((3, 3), np.uint8), iterations=int(14 * u)) > 0
    glass_alpha = np.ones((H, W), np.float32)
    glass_rim = np.zeros((H, W), np.float32)
    outrgb = np.zeros((H, W, 3), np.float32)
    shadow_all = np.zeros((H, W), np.float32)
    rng = np.random.default_rng(cfg.get('seed', 7))
    for mi, name in enumerate(names):
        if mi == 0:
            continue
        m = (mat == mi)
        if m.sum() < 30:
            continue
        mc = mats.get(name) or mats.get({'face': 'skin'}.get(name, ''), None) or mats['default']
        if 'colors' in mc and not mc.get('auto'):
            cs = {k: hexc(v) for k, v in mc['colors'].items()}
        else:                                         # auto palette from the photo's own colour of this material
            cs = auto_palette(np.median(lab_of(cv2.cvtColor(bil, cv2.COLOR_BGR2RGB).astype(np.float32))[m], 0),
                              cfg.get('auto_sat', 1.15))
        mode = mc.get('mode', 'cel')
        ang = mc.get('angular', 0) * u
        ss = mc.get('shape_smooth', 4.0) * u
        ma = int(mc.get('min_area', 400) * u * u)
        Lm = blur(Lsm, mc.get('smooth', 3.0) * u)
        q = np.quantile(Lm[m], [0.02, 0.98])
        f_ph = np.clip((Lm - q[0]) / (q[1] - q[0] + 1e-6), 0, 1)
        pw = mc.get('photo_w', 0.6)
        form = pw * f_ph + (1 - pw) * (0.5 + 0.5 * n_key)
        # masks: key light, highlight, secondary rim, deep accents
        tk = np.quantile(form[m], 1 - mc.get('key', 0.5))
        Mk = clean_mask((form > tk) & m, ss, ma, ang)
        Mh = np.zeros_like(Mk)
        if 'hi' in cs and mc.get('hi_frac', 0) > 0:
            th = np.quantile(form[m], 1 - mc['hi_frac'])
            Mh = clean_mask((form > th) & m, ss * 0.8, ma // 2, ang) & Mk
        Mr = np.zeros_like(Mk)
        if 'rim' in cs and mc.get('rim', 0) > 0:
            # second light of the dual split (cool/pink, opposite the sun): the top `rim` share of the
            # material facing it, never where the key already lands -> a core shadow stays between them
            fr = 0.3 * f_ph + 0.7 * (0.5 + 0.5 * n_rim)
            tr = np.quantile(fr[m], 1 - mc['rim'])
            Mr = clean_mask((fr > tr) & m & (blur(Mk.astype(np.float32), 6 * u) < 0.05), ss * 0.7, ma // 2, ang)
        Md = np.zeros_like(Mk)
        if 'deep' in cs and mc.get('deep_frac', 0) > 0:
            Ld_ = blur(Lbil, mc.get('deep_sigma', 2.0) * u)
            td = np.quantile(Ld_[m], mc['deep_frac'])
            Md = (Ld_ < td) & m
            if mc.get('ao_only', False):              # ambient occlusion only around eyes, under nose and lip
                Md &= ao_zone
            Md = clean_mask(Md, mc.get('deep_smooth', 1.5) * u, max(20, ma // 4), ang * 0.5)
        e = mc.get('edge', 0.8) * u                    # edge control: crisp on the face (focus), softer elsewhere
        col = np.broadcast_to(cs['shadow'], (H, W, 3)).astype(np.float32).copy()
        for M, key in ((Mk, 'key'), (Mh, 'hi'), (Mr, 'rim'), (Md, 'deep')):
            if M.any() and key in cs:
                Mf = M.astype(np.float32)
                a_ = blur(Mf, e) * (1 - face_soft) + blur(Mf, 0.8 * u) * face_soft
                a_ = a_[..., None] * (mc.get('deep_alpha', 0.85) if key == 'deep' else 1)
                col = col * (1 - a_) + cs[key] * a_
        # soft-round pass: airbrush gradient + light falloff inside the key shape + a little local colour
        lb = lab_of(col)
        grad = blur(Lph, mc.get('grad_sigma', 18) * u) - np.mean(Lph[m])
        lb[..., 0] += mc.get('airbrush', 0.15) * grad + mc.get('falloff', 6) * blur(n_key, 8 * u)
        if mc.get('model', 0) > 0:                    # "two tones first, then subtle value transitions inside each"
            Lz = blur(Lbil, mc.get('model_sigma', 4.0) * u)
            for M in (Mk, 1 - Mk):                    # soft modelling relative to each zone's own mean
                zm = (M > 0) & m
                if zm.sum() > 50:
                    lb[..., 0] += np.where(zm, mc['model'] * (Lz - np.mean(Lz[zm])), 0)
        if mc.get('local_color', 0) > 0:
            a0, b0 = np.median(lab[..., 1][m]), np.median(lab[..., 2][m])
            lb[..., 1] += mc['local_color'] * (blur(lab[..., 1], 6 * u) - a0)
            lb[..., 2] += mc['local_color'] * 0.5 * (blur(lab[..., 2], 6 * u) - b0)
        if mc.get('detail', 0) > 0:                  # hand-painted strokes: band-pass of the de-pored photo
            D = blur(Lbil, 0.8 * u) - blur(Lbil, mc.get('detail_sigma', 3.0) * u)
            t0 = mc.get('detail_t', 2.0)
            dk = np.clip((-D - t0) / (2 * t0), 0, 1)
            ltn = np.clip((D - t0) / (2 * t0), 0, 1)
            k = mc['detail']
            lb[..., 0] += -k * 20 * dk + k * 9 * ltn
            lb[..., 1] += k * 7 * dk
        if mode == 'posterize':                       # props (glass, car...): redrawn as k flat colour shapes
            k = mc.get('k', 5)
            simp = cv2.bilateralFilter(cv2.bilateralFilter(img, 9, 40, 6), 9, 40, 6)
            sl = lab_of(cv2.cvtColor(simp, cv2.COLOR_BGR2RGB).astype(np.float32))
            feat = sl[m].astype(np.float32)
            _, lbl, cen = cv2.kmeans(feat, k, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5), 3,
                                     cv2.KMEANS_PP_CENTERS)
            lm = np.zeros((H, W), np.int32)
            lm[m] = lbl.ravel()
            acc = np.zeros((H, W, 3), np.float32)
            for ci in range(k):                       # each cluster = one clean shape, coloured towards the palette
                sh = clean_mask((lm == ci) & m, mc.get('shape_smooth', 2) * u, int(30 * u * u))
                cl = cen[ci].copy()
                cl[0] = np.clip(cl[0] * mc.get('contrast', 1.1) - 5, 0, 100)
                cl[1] = cl[1] * 0.6 + mc.get('tint', [8, -4])[0]
                cl[2] = cl[2] * 0.6 + mc.get('tint', [8, -4])[1]
                acc[sh > 0] = cl
            hole = (np.abs(acc).sum(2) == 0) & m
            acc[hole] = sl[hole]
            lb = acc
        if mode == 'photo':                           # props like glass: simplified photo, tinted
            sl = lab_of(cv2.cvtColor(cv2.bilateralFilter(img, 9, 40, 6), cv2.COLOR_BGR2RGB).astype(np.float32))
            lb = 0.5 * lb + 0.5 * sl
        col = rgb_of(lb)
        if 'print' in mc:                             # redrawn print, shaded by the same light shapes
            pr = draw_print(H, W, m.astype(np.float32), mc['print'], rng, form)
            pcs = mc['print']
            shade = np.where(Mk[..., None] > 0, 1.0, pcs.get('shadow_mult', 0.62))
            pa = pr[..., 3:] * pcs.get('opacity', 0.85)
            col = col * (1 - pa) + np.clip(pr[..., :3] * shade * (col / np.maximum(col.mean(2, keepdims=True), 1)) ** 0.3, 0, 255) * pa
        if mode == 'glass':                           # glass: amber liquid + cream glints, the body see-through
            hsv = cv2.cvtColor(bil, cv2.COLOR_BGR2HSV).astype(np.float32)
            liq = clean_mask(m & (hsv[..., 0] > 5) & (hsv[..., 0] < 25) & (hsv[..., 1] > 90) & (hsv[..., 2] > 60), 2 * u, int(80 * u * u))
            liq_hi = clean_mask((liq > 0) & (Lbil > np.quantile(Lbil[liq > 0], 0.6) if liq.any() else liq > 0), 2 * u, int(40 * u * u))
            glint = clean_mask(m & (Lbil > mc.get('glint_L', 80)), 1.2 * u, int(15 * u * u))
            col = np.broadcast_to(hexc(mc['colors'].get('body', '#E8E4F4')), (H, W, 3)).astype(np.float32).copy()
            for M, cc in ((liq, 'liquid'), (liq_hi, 'liquid_hi'), (glint, 'glint')):
                a_ = blur(M.astype(np.float32), 0.8 * u)[..., None]
                col = col * (1 - a_) + hexc(mc['colors'][cc]) * a_
            body = m & (liq == 0) & (glint == 0)
            glass_alpha[body] = mc.get('body_alpha', 0.35)
            glass_rim[m] = 1
        outrgb[m] = col[m]
        shadow_all[m] = (1 - Mk)[m]

    if eyes.any():                                    # eyes keep the photo's (simplified, graded) eye
        ee = blur(eyes.astype(np.float32), 1.0 * u)[..., None]
        ep = cv2.cvtColor(cv2.bilateralFilter(img, 7, 30, 4), cv2.COLOR_BGR2RGB).astype(np.float32)
        ep = ep * np.array([1.0, 0.95, 1.02]) + np.array([12, 4, 10])
        outrgb = outrgb * (1 - 0.8 * ee) + ep * 0.8 * ee

    # ---------- 6. lines: traced strokes (silhouette heavy, material borders medium), XDoG for faces
    lc = cfg.get('lines', {})
    ink = hexc(lc.get('color', '#211E26'))
    Lg = Lbil / 100
    lines = np.zeros((H, W), np.float32)
    zones = {'face': np.isin(face, [F['skin'], F['nose'], F['l_eye'], F['r_eye'], F['l_brow'], F['r_brow'], F['u_lip'], F['l_lip'], F['mouth'], F['l_ear'], F['r_ear']]) & head}
    zones['skin'] = (mat == names.index('skin')) & ~zones['face'] if 'skin' in names else np.zeros((H, W), bool)
    zones['hair'] = (mat == names.index('hair')) if 'hair' in names else np.zeros((H, W), bool)
    zones['cloth'] = fig & ~zones['face'] & ~zones['skin'] & ~zones['hair']
    for zn, z in zones.items():
        zc = lc.get(zn, {})
        if not z.any() or zc.get('strength', 0) <= 0:
            continue
        x = xdog(Lg, zc.get('sigma', 1.2) * u, tau=zc.get('tau', 0.99), phi=zc.get('phi', 150))
        x = prune(x, 0.4, int(zc.get('min_len', 80) * u * u))
        lines = np.maximum(lines, x * blur(z.astype(np.float32), 2 * u) * zc['strength'])
    if brows.any():
        lines = np.maximum(lines, blur(brows.astype(np.float32), 1.5 * u) * lc.get('brows', 0.5))
    # stroke width map: heavier on the side away from the sun (pen-tool "stroke path" look, tapered)
    side = np.clip(0.5 - 0.5 * sx * (np.arange(W, dtype=np.float32)[None, :] - W / 2) / (W / 2), 0, 1)
    def stroke(edge_px, w0, w1):
        dist = cv2.distanceTransform((1 - edge_px).astype(np.uint8), cv2.DIST_L2, 5)
        wmap = (w0 + (w1 - w0) * blur(np.broadcast_to(side, (H, W)).astype(np.float32), 40 * u)) * u
        return np.clip(wmap / 2 - dist + 0.5, 0, 1)
    mb = np.zeros((H, W), np.uint8)
    for mi in range(1, len(names)):
        mm = clean_mask(mat == mi, 2 * u, int(300 * u * u))
        cs_, _ = cv2.findContours(mm, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
        cs_ = [c for c in cs_ if cv2.arcLength(c, True) > 60 * u]
        cv2.drawContours(mb, cs_, -1, 1, 1)
    mb &= (cv2.erode((alpha > 0.5).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=int(3 * u)))
    bw = lc.get('border', [1.2, 2.0])
    lines = np.maximum(lines, stroke(mb, bw[0], bw[1]) * lc.get('border_alpha', 0.85))
    sil_px = ((alpha > 0.5).astype(np.uint8) - cv2.erode((alpha > 0.5).astype(np.uint8), np.ones((3, 3), np.uint8)))
    sw = lc.get('silhouette', [2.0, 4.5])
    sil = stroke(sil_px, sw[0] * 2, sw[1] * 2) * (alpha > 0.02)
    lines = np.clip(lines, 0, 1)
    out = outrgb * (1 - lines[..., None]) + ink * lines[..., None]

    # ---------- 7. rim: cream light on the sun-side edge, cyan bounce on the shadow-side edge
    rc = cfg.get('rim', {})
    gyA, gxA = np.gradient(blur(alpha, 3 * u))
    nA = np.sqrt(gxA ** 2 + gyA ** 2) + 1e-6
    sunward = np.clip(-gxA * sx / nA, 0, 1)        # outward edge normal facing the sun
    inner = np.clip(alpha - blur(cv2.erode(alpha, np.ones((3, 3), np.uint8), iterations=max(1, int(rc.get('width', 6) * u))), 2 * u), 0, 1)
    rim_s = blur(sunward, 4 * u) * inner * rc.get('sun', 0.6) * (1 - shadow_all * 0.7)
    out = out * (1 - rim_s[..., None]) + hexc(rc.get('sun_color', '#FFF1C4')) * rim_s[..., None]
    rim_c = blur(1 - sunward, 4 * u) * inner * rc.get('shadow', 0.45) * shadow_all
    out = out * (1 - rim_c[..., None]) + hexc(rc.get('shadow_color', '#7FE3E6')) * rim_c[..., None]
    out = out * (1 - sil[..., None]) + ink * sil[..., None]

    # ---------- 8. grade: warm yellow-pink gradient map
    g = cfg.get('grade', 0.15)
    stops = np.array([[0.00, 0x2E, 0x18, 0x3A], [0.30, 0x7A, 0x3E, 0x7E], [0.55, 0xC9, 0x7A, 0xA6],
                      [0.78, 0xF0, 0xC0, 0xA8], [1.00, 0xFB, 0xF4, 0xCC]], np.float32)
    Y = (0.299 * out[..., 0] + 0.587 * out[..., 1] + 0.114 * out[..., 2]) / 255
    gm = np.dstack([np.interp(Y, stops[:, 0], stops[:, c]) for c in (1, 2, 3)])
    out = (1 - g) * out + g * gm
    alpha = alpha * blur(glass_alpha, 1.0 * u)
    rgba = np.dstack([np.clip(out, 0, 255)[..., ::-1], alpha * 255]).astype(np.uint8)
    cv2.imwrite(rel(cfg['out']), rgba)
    # block-in on a flat key colour + the render-pass prompt (step 2 of the hybrid recipe, see STYLE.md v4)
    fb = hexc(cfg.get('flat_bg', '#D8B4E0'))[::-1]
    al = rgba[..., 3:] / 255.0
    cv2.imwrite(stem + '_flat.jpg', (rgba[..., :3] * al + fb * (1 - al)).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 95])
    fl = cfg.get('flow', {})
    sun = cfg.get('sun', 'left')
    other = 'left' if sun == 'right' else 'right'
    prompt = (f"Edit @{{blockin}}: keep this image exactly as it is designed: same composition, silhouette, pose, hands, "
              f"props, clothes, colours, the flat background colour, and above all the SAME light and shadow shapes: "
              f"warm sunlit {sun} side bleached to peach and pale cream, hard-edged magenta-pink and violet shadow shapes, "
              f"cooler pink light on the {other} edge, core shadow between. Only upgrade the rendering to a polished "
              f"hand-painted digital painting like @{{gtaref}} (painting technique only, never copy that person, outfit or "
              f"anything from it): smooth airbrushed value transitions and subtle form modelling inside each light and "
              f"shadow shape, clean shape edges, {fl.get('subject', 'the person')} must stay exactly the person in "
              f"@{{photo}} ({fl.get('face', 'same face shape, nose, eyes, wrinkles and expression, no beautifying')}), "
              f"fine painted lines only on eyes, nose, mouth and deep wrinkles, fine hair strands, realistic hands with "
              f"five fingers, a thick dark contour only on the outer silhouette{', ' + fl['extra'] if 'extra' in fl else ''}. "
              f"Do not relight, do not flatten the shadows, no cartoon, no comic hatching, no text, no logos.")
    open(stem + '_flow_prompt.txt', 'w').write(prompt + '\n')
    if DEBUG:
        cv2.imwrite(stem + '_dbg_shadow.jpg', (255 - shadow_all * 255).astype(np.uint8))
        cv2.imwrite(stem + '_dbg_lines.jpg', ((1 - np.maximum(lines, sil)) * 255).astype(np.uint8))
        cv2.imwrite(stem + '_dbg_nkey.jpg', (np.clip(0.5 + 0.5 * n_key, 0, 1) * 255 * (alpha > 0.5)).astype(np.uint8))
    print('wrote', cfg['out'], f'{W}x{H}')


if __name__ == '__main__':
    main([a for a in sys.argv[1:] if not a.startswith('--')][0])
