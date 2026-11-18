"""Cutout QA for RGBA layers: find leftover key colour, halos and holes, fix them, and make a check sheet.

  python qa_cutout.py layer.png [more.png ...] [--fix] [--sheet out.jpg] [--keys "#D8B4E0,#FF00FF,#00FF00"]

Per layer:
  residual  flat patches (+ with <name>_painted.jpg next to <name>_final.png: every pixel that was the flat key there) of a key colour (lavender block-in key, magenta, green) that survived the keying,
            also enclosed ones (between an arm and the body, inside boat railings): Lab distance to a key
            colour < --tol AND locally flat (key fills have no texture), components > 120 px
  halo      key-hued / saturated magenta pixels in the outer 4 px of the silhouette (fringe)
  holes     small transparent pockets fully inside the figure (reported, not filled)
  islands   tiny separate alpha specks (removed on --fix)
--fix: residual -> transparent, halo -> despilled (colour taken from the inner neighbours) + 1 px choke,
       islands removed; the layer is rewritten in place (a .bak.png copy is kept the first time).
The sheet shows each layer over black, white and green, plus a red overlay of what was found (before fix)
and the after-fix result. Exit code 1 if any layer still fails after the run.
"""
import argparse
import os
import shutil
import sys
import cv2
import numpy as np


FRINGE_SIDE = None
USE_BAND = True


def hexc(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def lab(bgr):
    return cv2.cvtColor(bgr.astype(np.float32) / 255, cv2.COLOR_BGR2LAB)


def source_key_mask(layer_path, shape, tol=9):
    """if <name>_painted.jpg sits next to <name>_final.png: pixels that were the flat key in the Flow image"""
    sp = layer_path.replace('_final.png', '_painted.jpg')
    if sp == layer_path or not os.path.exists(sp):
        return None
    im = cv2.resize(cv2.imread(sp), (shape[1], shape[0]))
    L = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
    k = np.median(np.concatenate([L[:20, :20].reshape(-1, 3), L[:20, -20:].reshape(-1, 3)]), 0)
    return np.linalg.norm(L - k, axis=2) < tol


def analyse(a, keys, tol, src_key=None):
    H, W = a.shape[:2]
    u = max(H, W) / 1920
    al = a[..., 3].astype(np.float32) / 255
    L = lab(a[..., :3])
    solid = al > 0.5
    # flatness: local std of L
    m1 = cv2.blur(L[..., 0], (7, 7)); m2 = cv2.blur(L[..., 0] ** 2, (7, 7))
    flat = np.sqrt(np.clip(m2 - m1 ** 2, 0, None)) < 2.2
    dk = np.min([np.linalg.norm(L - lab(k[::-1].reshape(1, 1, 3))[0, 0], axis=2) for k in keys], 0)
    res = (dk < tol) & flat & solid
    # graded block-in key: after finish (relight, saturation, gradient map) the lavender key drifts, so also
    # take flat lavender-band patches that touch transparency (leftover background, never a garment fill)
    Lr, Ar, Br = L[..., 0], L[..., 1], L[..., 2]
    band = (Lr > 62) & (Lr < 95) & (Ar > 3) & (Ar < 32) & (Br > -48) & (Br < -6) & flat & solid
    n0, lb0, st0, _ = cv2.connectedComponentsWithStats(band.astype(np.uint8), 8)
    near_t = cv2.dilate((~solid).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=max(1, int(3 * u))) > 0
    touch = np.zeros(n0, bool)
    touch[np.unique(lb0[near_t & band])] = True
    touch[0] = False
    if USE_BAND:
        res |= touch[lb0]
    if src_key is not None:                           # enclosed pockets that were key in the Flow source
        res |= src_key & solid
    n, lb, st, _ = cv2.connectedComponentsWithStats(res.astype(np.uint8), 8)
    keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] > 120 * u * u
    res = keep[lb]
    # halo: outer ring, key-hued or strongly saturated magenta, not part of the residual
    dist = cv2.distanceTransform(solid.astype(np.uint8), cv2.DIST_L2, 3)
    ring = solid & (dist <= 4 * u)
    mag = (L[..., 1] > 28) & (L[..., 2] < 5) & (np.hypot(L[..., 1], L[..., 2]) > 34)
    # a real fringe differs from the colour just inside it; a red shirt's own edge does not
    inner_m = (dist > 7 * u).astype(np.float32)
    k = int(15 * u) | 1
    wsum = cv2.blur(inner_m, (k, k)) + 1e-6
    inner = np.dstack([cv2.blur(L[..., c] * inner_m, (k, k)) / wsum for c in range(3)])
    differs = np.linalg.norm(L - inner, axis=2) > 18
    # keying fringe = bright background blended into the edge: key-near, or magenta AND lighter than inside
    # (dark magenta edges are the style's painted shadow side, not a fringe)
    lighter = L[..., 0] - inner[..., 0] > 8
    halo = ring & ((dk < tol * 1.3) | (mag & lighter)) & differs & ~res
    # holes: transparent pockets enclosed by the figure
    inv = (~solid).astype(np.uint8)
    n2, lb2, st2, _ = cv2.connectedComponentsWithStats(inv, 4)
    holes = np.zeros((H, W), bool)
    for i in range(1, n2):
        x, y, w, h, ar = st2[i]
        if not (x == 0 or y == 0 or x + w == W or y + h == H) and ar < 0.01 * H * W:
            holes |= lb2 == i
    # islands: tiny solid specks
    n3, lb3, st3, _ = cv2.connectedComponentsWithStats(solid.astype(np.uint8), 8)
    isl = np.zeros(n3, bool); isl[1:] = st3[1:, cv2.CC_STAT_AREA] < 400 * u * u
    islands = isl[lb3]
    tot = max(1, solid.sum())
    return dict(res=res, halo=halo, holes=holes, islands=islands,
                stats=dict(residual_pct=100 * res.sum() / tot, halo_px=int(halo.sum()), halo_pct=100 * halo.sum() / max(1, ring.sum()), holes=int(n2 - 1 - (lb2[0, 0] > 0)),
                           hole_px=int(holes.sum()), islands_px=int(islands.sum())))


def fix(a, r, u):
    a = a.copy()
    al = a[..., 3].astype(np.float32)
    kill = cv2.dilate(r['res'].astype(np.uint8), np.ones((3, 3), np.uint8), iterations=max(1, int(1.5 * u))) > 0
    al[kill | r['islands']] = 0
    # despill halo: inpaint its colour from the surrounding interior, then choke 1 px
    hm = cv2.dilate(r['halo'].astype(np.uint8), np.ones((3, 3), np.uint8))
    if hm.any():                                      # colour comes only from solid interior pixels
        clear = (al < 128).astype(np.uint8)
        a[..., :3] = cv2.inpaint(a[..., :3], (hm | clear).astype(np.uint8), 4, cv2.INPAINT_TELEA)
    # despill: in the outer 8 px, magenta/key-hued pixels take the hue (a*, b*) of the colour just inside
    solid = (al > 127).astype(np.uint8)
    L = lab(a[..., :3])
    dist = cv2.distanceTransform(solid, cv2.DIST_L2, 3)
    ring = (solid > 0) & (dist <= 8 * u)
    inner_m = (dist > 10 * u).astype(np.float32)
    k = int(21 * u) | 1
    wsum = cv2.blur(inner_m, (k, k)) + 1e-6
    inner = np.dstack([cv2.blur(L[..., c] * inner_m, (k, k)) / wsum for c in range(3)])
    spill = ring & (L[..., 1] > 20) & (L[..., 2] < 8) & (L[..., 1] - inner[..., 1] > 10) & (L[..., 0] - inner[..., 0] > 6) & (wsum > 0.05)
    w = cv2.GaussianBlur(spill.astype(np.float32), (0, 0), 1.0)[..., None]
    L2 = L.copy()
    L2[..., 1:] = L[..., 1:] * (1 - w) + inner[..., 1:] * w
    if FRINGE_SIDE:                                   # pale glow on the edge facing away from the sun = fringe
        gy, gx = np.gradient(cv2.GaussianBlur(solid.astype(np.float32), (0, 0), 3 * u))
        nx = -gx / (np.hypot(gx, gy) + 1e-6)          # outward normal x
        away = nx < -0.2 if FRINGE_SIDE == 'left' else nx > 0.2
        ring2 = (solid > 0) & (dist <= 16 * u)
        im2 = (dist > 20 * u).astype(np.float32)
        k2 = int(41 * u) | 1
        ws2 = cv2.blur(im2, (k2, k2)) + 1e-6
        inner2 = np.dstack([cv2.blur(L[..., c] * im2, (k2, k2)) / ws2 for c in range(3)])
        pale = ring2 & away & (L[..., 0] - inner2[..., 0] > 12) & (ws2 > 0.05)
        wp = cv2.GaussianBlur(pale.astype(np.float32), (0, 0), 1.5)[..., None]
        tgt = inner2.copy(); tgt[..., 0] = np.minimum(L[..., 0], inner2[..., 0] + 4)
        L2 = L2 * (1 - wp) + tgt * wp
    a[..., :3] = np.clip(cv2.cvtColor(L2, cv2.COLOR_LAB2BGR) * 255, 0, 255).astype(np.uint8)
    solid = cv2.erode(solid, np.ones((3, 3), np.uint8), iterations=1)
    al = cv2.GaussianBlur(solid.astype(np.float32) * 255, (0, 0), 0.8 * u) * (al > 0)
    a[..., 3] = np.clip(al, 0, 255).astype(np.uint8)
    return a


def over(a, c):
    al = a[..., 3:].astype(np.float32) / 255
    bg = np.zeros_like(a[..., :3], np.float32); bg[:] = c
    return (a[..., :3] * al + bg * (1 - al)).astype(np.uint8)


def ok(s):
    return s['residual_pct'] < 0.05 and s['halo_pct'] < 3.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('layers', nargs='+')
    ap.add_argument('--fix', action='store_true')
    ap.add_argument('--sheet')
    ap.add_argument('--keys', default='#D8B4E0,#D3B0E2,#C9BCE8,#FF00FF,#00FF00')
    ap.add_argument('--tol', type=float, default=7.0)
    ap.add_argument('--no-band', action='store_true', help='layer wears lavender/lilac: skip the graded-lavender rule')
    ap.add_argument('--fringe-side', choices=['left', 'right'], help='also clean pale glow on this (shadow) side')
    a = ap.parse_args()
    global FRINGE_SIDE, USE_BAND
    FRINGE_SIDE = a.fringe_side
    USE_BAND = not a.no_band
    keys = [hexc(k) for k in a.keys.split(',')]
    rows, bad = [], 0
    for p in a.layers:
        img = cv2.imread(p, cv2.IMREAD_UNCHANGED)
        if img is None or img.shape[2] != 4:
            print('skip (no alpha)', p); continue
        u = max(img.shape[:2]) / 1920
        sk = source_key_mask(p, img.shape)
        r = analyse(img, keys, a.tol, sk)
        s0 = r['stats']
        out = img
        if a.fix and (not ok(s0) or s0['islands_px'] > 0 or FRINGE_SIDE):
            bak = p[:-4] + '.bak.png'
            if not os.path.exists(bak):
                shutil.copy(p, bak)
            out = fix(img, r, u)
            cv2.imwrite(p, out)
        s1 = analyse(out, keys, a.tol, sk)['stats']
        good = ok(s1)
        bad += not good
        print(f"{'PASS' if good else 'FAIL'} {os.path.basename(p):28s} before: residual {s0['residual_pct']:.2f}% halo {s0['halo_pct']:.1f}% holes {s0['holes']} islands {s0['islands_px']}"
              f"  ->  after: residual {s1['residual_pct']:.2f}% halo {s1['halo_pct']:.1f}%")
        if a.sheet:
            t = 300
            sc = t / img.shape[0]
            mark = over(img, (40, 40, 40)).copy()
            for msk, col in ((r['res'], (0, 0, 255)), (r['halo'], (0, 200, 255)), (r['holes'], (255, 0, 255)), (r['islands'], (255, 255, 0))):
                mark[msk] = col
            tiles = [over(out, (0, 0, 0)), over(out, (255, 255, 255)), over(out, (0, 200, 0)), mark]
            tiles = [cv2.resize(x, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA) for x in tiles]
            row = np.hstack(tiles)
            cv2.rectangle(row, (0, 0), (row.shape[1], 22), (20, 10, 24), -1)
            cv2.putText(row, f"{os.path.basename(p)}  {'PASS' if good else 'FAIL'}  before: key residual {s0['residual_pct']:.2f}%, halo {s0['halo_pct']:.1f}% of edge, holes {s0['holes']}  | after fix: {s1['residual_pct']:.2f}%, halo {s1['halo_pct']:.1f}%   [black | white | green | red=residual orange=halo pink=holes]",
                        (6, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (180, 240, 255), 1, cv2.LINE_AA)
            rows.append(row)
    if a.sheet and rows:
        w = max(r.shape[1] for r in rows)
        rows = [cv2.copyMakeBorder(r, 0, 4, 0, w - r.shape[1], cv2.BORDER_CONSTANT) for r in rows]
        cv2.imwrite(a.sheet, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88])
        print('sheet', a.sheet)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
