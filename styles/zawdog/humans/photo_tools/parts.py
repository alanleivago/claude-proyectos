"""Garment photo parts (venv): reads a 2-view garment sheet (FRONT left half, BACK right half, magenta background) and
finds, in each view, the same landmarks the bake needs, so a Flow ghost-mannequin photo can be mapped onto the body
whatever its pose / framing (Flow never keeps an exact silhouette):
  top (collar / neck-base row), armpit row, split row (where the legs separate: the crotch, or a coat hem), bottom row,
  the torso edges per row, the two leg runs per row, and per side the sleeve frame (axis, root, length, centre offset
  and half-width along the axis).
The same analysis runs on the body's own guide (guide.py grey silhouette) -> both sides of the map use identical rules.
    .venv/bin/python styles/zawdog/humans/photo_tools/parts.py <name> <flow.jpg>
-> humans/<name>/photo/map.npz (guide + flow parts, the flow image bled into the background, the garment mask)
   + photo/map_debug.jpg (landmarks drawn on both) + photo/warp_preview.jpg (the flow photo mapped into the guide layout)."""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from photo_map import NB, vmap, rowval, map_torso, map_leg, map_sleeve, unpack  # noqa: E402

H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def bg_mask(a):
    """magenta background (Flow's is rarely pure #FF00FF)."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mn = np.minimum(r, b)
    return (mn - g > 0.45 * mn) & (mn > 50) & (np.abs(r - b) < 0.5 * np.maximum(r, b))   # also the dark purple fringe


def runs(row):
    d = np.diff(np.concatenate([[0], row.astype(np.int8), [0]]))
    return list(zip(np.where(d == 1)[0], np.where(d == -1)[0] - 1))


def analyse(m, x0, side_of_left, dark=None):
    """m: garment mask of one view (H, Wv); x0: its column offset in the sheet; side_of_left: which arm / leg of the
    PERSON appears on the image left ('R' in a front view, 'L' in a back view)."""
    lab, n = nd.label(m)
    if n == 0:
        raise SystemExit("empty view")
    sizes = nd.sum(m, lab, range(1, n + 1))
    keep = np.isin(lab, 1 + np.where(sizes > 0.01 * sizes.max())[0])
    m = nd.binary_closing(keep, iterations=2) & keep | keep
    rows = np.where(m.any(1))[0]; top, bottom = int(rows.min()), int(rows.max())
    hgt = bottom - top
    band = m[int(top + 0.25 * hgt):int(top + 0.45 * hgt)]
    cx = float(np.median(np.where(band)[1]))
    ci = int(round(cx))
    # split row: from the bottom up, the centre column is background between the legs; where it turns garment
    r = bottom - 2
    while r > top and m[r, ci]:
        r -= 1                                             # (feet / hems touching at the very bottom)
    while r > top and not m[r, ci]:
        r -= 1
    split = r + 1
    # neck top at the centre: first garment row in the central columns (collar / neck band)
    cw = max(3, int(0.07 * hgt))                         # wide enough for lapel / collar tips
    ctop = int(np.where(m[:, ci - cw:ci + cw].any(1))[0].min())
    # central run per row, outer runs -> sleeve gap rows
    cl = np.zeros(m.shape[0]); cr = np.zeros(m.shape[0]); gapL = np.zeros(m.shape[0], bool); gapR = np.zeros(m.shape[0], bool)
    for y in range(ctop, split + 1):
        rr = runs(m[y])
        c = [q for q in rr if q[0] <= ci <= q[1]]
        if not c:
            c = [min(rr, key=lambda q: min(abs(q[0] - ci), abs(q[1] - ci)))] if rr else [(ci, ci)]
        c = c[0]; cl[y], cr[y] = c
        gapL[y] = any(q[1] < c[0] - 1 for q in rr); gapR[y] = any(q[0] > c[1] + 1 for q in rr)
    # armpit: the first row from which the central run stays as narrow as the torso (above it the sleeves join it)
    wdt = cr - cl
    y0b, y1b = int(split - 0.12 * (split - ctop)), int(split - 0.03 * (split - ctop))   # hips: never any arm there
    both = np.where(gapL & gapR)[0]
    wt = float(np.median(wdt[both])) if len(both) >= 5 else float(np.median(wdt[y0b:y1b]))   # the isolated torso width
    narrow = (wdt <= 1.3 * wt) | (gapL & gapR)                    # a separated sleeve on both sides: torso only
    start = int(np.median(both)) if len(both) >= 5 else y0b
    armpit = start
    for y in range(start, int(ctop + 0.05 * (split - ctop)), -1):   # up from the hips while the run stays torso-wide
        if not narrow[y]:
            break
        armpit = y
    arm = {"left": armpit, "right": armpit}
    # torso edges: the central run below the armpit (smoothed), held constant above it
    ys = np.arange(armpit + 2, max(split - 1, armpit + 3))
    eL = nd.median_filter(cl[ys], 9) if len(ys) > 9 else cl[ys]; eR = nd.median_filter(cr[ys], 9) if len(ys) > 9 else cr[ys]
    EL = np.interp(np.arange(m.shape[0]), ys, eL); ER = np.interp(np.arange(m.shape[0]), ys, eR)
    k = max(3, int(0.03 * hgt))
    EL[:armpit + 2] = np.median(eL[:k]); ER[:armpit + 2] = np.median(eR[:k])
    # legs below the split: the two runs nearest the centre
    LG = np.zeros((m.shape[0], 4)) - 1
    for y in range(split, bottom + 1):
        rr = runs(m[y])
        lft = [q for q in rr if q[1] < ci]; rgt = [q for q in rr if q[0] > ci]
        if lft and rgt:
            LG[y] = (lft[-1][0], lft[-1][1], rgt[0][0], rgt[0][1])
    # fill rows with a missing run (cuff gaps) by interpolation
    good = LG[:, 0] >= 0
    if good.sum() > 2:
        for j in range(4):
            LG[split:bottom + 1, j] = np.interp(np.arange(split, bottom + 1), np.where(good)[0], LG[good, j])
    # sleeves: garment pixels outside the torso edges, above the lowest gap row of that side
    sl = {}
    YY, XX = np.mgrid[:m.shape[0], :m.shape[1]]
    for s_img in ("left", "right"):
        if arm[s_img] is None:
            sl[s_img] = None; continue
        out = (XX < EL[:, None] - 1) if s_img == "left" else (XX > ER[:, None] + 1)
        sm = m & out & (YY < split) & (YY >= ctop)
        if dark is not None:
            sm &= ~dark                                    # Flow's stray black mannequin arms under short sleeves
        lab2, n2 = nd.label(sm)
        if n2 == 0:
            sl[s_img] = None; continue
        sz = nd.sum(sm, lab2, range(1, n2 + 1)); sm = lab2 == (1 + int(np.argmax(sz)))
        py, px = np.where(sm); P = np.stack([px, py], 1).astype(np.float64)
        ex = EL[armpit] if s_img == "left" else ER[armpit]
        col = int(round(ex)); tcol = np.where(m[:, max(col, 0)])[0]
        # root = the shoulder joint (between the shoulder top at the torso edge and the armpit); axis = root -> the
        # centroid of the sleeve pixels (robust for short, wide sleeves as well as long arms)
        root = np.array([ex, (float(tcol.min() if len(tcol) else ctop) + armpit) / 2])
        cen_ = P.mean(0); ax = (cen_ - root) / np.linalg.norm(cen_ - root)
        pp = np.array([-ax[1], ax[0]])
        if pp[1] > 0:
            pp = -pp                                       # the across axis points up (toward the head)
        t = (P - root) @ ax; a = (P - root) @ pp; L = float(t.max())
        cen = np.zeros(NB); hw = np.zeros(NB)
        bins = np.clip((t / max(L, 1) * NB).astype(int), 0, NB - 1)
        for b in range(NB):
            q = a[bins == b]
            if len(q) > 2:
                cen[b] = (q.max() + q.min()) / 2; hw[b] = max((q.max() - q.min()) / 2, 1)
        okb = hw > 0
        cen = np.interp(np.arange(NB), np.where(okb)[0], cen[okb]); hw = np.interp(np.arange(NB), np.where(okb)[0], hw[okb])
        sl[s_img] = dict(root=root + [x0, 0], ax=ax, pp=pp, L=L, cen=nd.uniform_filter1d(cen, 5), hw=nd.uniform_filter1d(hw, 5))
    pers = {"left": side_of_left, "right": "L" if side_of_left == "R" else "R"}
    return dict(top=ctop, armpit=armpit, split=split, bottom=bottom, cx=cx + x0, EL=EL + x0, ER=ER + x0,
                LG=np.where(LG >= 0, LG + x0, -1), sleeve={pers[k]: v for k, v in sl.items()},
                legleft=side_of_left, mask=m)


def analyse_sheet(a, drop_dark=False):
    m = ~bg_mask(a)
    m = nd.binary_opening(m, iterations=1)
    W = a.shape[1]; h = W // 2
    dk = (a.max(-1) < 45) if drop_dark else None
    if drop_dark:                                          # remove dark blobs away from the centre line (keep the belt)
        lab, n = nd.label(nd.binary_opening(dk, iterations=2))
        for i, (sy, sx) in enumerate(nd.find_objects(lab), 1):
            cxb = (sx.start + sx.stop) / 2 % h
            if abs(cxb - h / 2) > 0.16 * a.shape[0]:
                m &= ~nd.binary_dilation(lab == i, iterations=2)
    return [analyse(m[:, :h], 0, "R", None if dk is None else dk[:, :h]), analyse(m[:, h:], h, "L", None if dk is None else dk[:, h:])], m


def bleed(a, m):
    idx = nd.distance_transform_edt(~m, return_distances=False, return_indices=True)
    return a[idx[0], idx[1]]


def pack(prefix, views):
    d = {}
    for vi, v in enumerate(views):
        p = f"{prefix}{vi}_"
        for k in ("top", "armpit", "split", "bottom", "cx", "EL", "ER", "LG"):
            d[p + k] = np.asarray(v[k], np.float64)
        for s in "LR":
            sv = v["sleeve"].get(s)
            d[p + "has_" + s] = np.array(sv is not None)
            if sv is not None:
                for k in ("root", "ax", "pp", "L", "cen", "hw"):
                    d[p + s + "_" + k] = np.asarray(sv[k], np.float64)
    return d


def main(name, flow_path):
    D = os.path.join(H, name, "photo")
    ga = np.asarray(Image.open(os.path.join(D, "guide_grey.png")).convert("RGB"), np.float32)
    fa = np.asarray(Image.open(flow_path).convert("RGB").resize((ga.shape[1], ga.shape[0]), Image.LANCZOS), np.float32)
    gv, gm = analyse_sheet(ga); fv, fm = analyse_sheet(fa, "--drop-dark" in sys.argv)
    sp = np.clip(np.minimum(fa[..., 0], fa[..., 2]) - fa[..., 1], 0, None)         # magenta spill: r and b both over g
    fa = fa.copy(); fa[..., 0] -= sp; fa[..., 2] -= sp
    fb = bleed(fa, nd.binary_erosion(fm, iterations=4))            # no magenta fringe: edge pixels come from inside
    # the neck opening: background enclosed left and right by garment, in the rows between the collar and the armpit
    hole = np.zeros_like(fm)
    for v in fv:
        for y in range(int(v["top"]), int(v["armpit"]) + 1):
            xl, xr = int(v["EL"][y]), int(v["ER"][y]) + 1
            row = fm[y, xl:xr]; g_ = np.where(row)[0]
            if len(g_) > 1:
                seg = ~row[g_[0]:g_[-1] + 1]; hole[y, xl + g_[0]:xl + g_[-1] + 1] = seg
    hole = nd.binary_opening(hole, iterations=1)
    # front view: the back collar band seen above the neck opening sits behind the neck -> part of the opening too
    h0 = hole[:, :hole.shape[1] // 2]
    for x in np.where(h0.any(0))[0]:
        h0[:np.where(h0[:, x])[0].min(), x] = True
    fb = nd.gaussian_filter(fb, (0.8, 0.8, 0))
    out = dict(**pack("g", gv), **pack("f", fv), flow=fb.astype(np.uint8), fmask=fm, hole=hole)
    np.savez_compressed(os.path.join(D, "map.npz"), **out)
    # debug overlay
    im = Image.fromarray(np.concatenate([ga, fa], 0).astype(np.uint8)); dr = ImageDraw.Draw(im)
    for off, vs in ((0, gv), (ga.shape[0], fv)):
        for v in vs:
            for k, c in (("top", "yellow"), ("armpit", "cyan"), ("split", "lime"), ("bottom", "orange")):
                y = v[k] + off; x0 = v["cx"] - 200; dr.line([(x0, y), (x0 + 400, y)], fill=c, width=2)
            for y in range(int(v["top"]), int(v["split"]), 4):
                dr.point([(v["EL"][y], y + off), (v["ER"][y], y + off)], fill="red")
            for s, sv in v["sleeve"].items():
                if sv is None:
                    continue
                r = sv["root"]; e = r + sv["ax"] * sv["L"]
                dr.line([(r[0], r[1] + off), (e[0], e[1] + off)], fill="blue", width=3)
                dr.text((e[0], e[1] + off), s, fill="black")
    im.save(os.path.join(D, "map_debug.jpg"), quality=88)
    # preview: every guide garment pixel takes its flow colour
    prev = ga.copy()
    ratio = (fv[0]["split"] - fv[0]["top"]) / max(gv[0]["split"] - gv[0]["top"], 1)
    for vi in (0, 1):
        g, f = gv[vi], fv[vi]
        ys, xs = np.where(g["mask"]); xs = xs + (0 if vi == 0 else ga.shape[1] // 2)
        X, Y = xs.astype(float), ys.astype(float)
        fx, fy, _ = map_torso(X, Y, g, f)
        for s in "LR":
            j = 0 if s == g["legleft"] else 2
            inleg = (Y >= g["split"]) & (np.abs(X - (rowval(g["LG"][:, j], Y) + rowval(g["LG"][:, j + 1], Y)) / 2) <
                                         np.abs(X - (rowval(g["LG"][:, 2 - j], Y) + rowval(g["LG"][:, 3 - j], Y)) / 2))
            lx, ly = map_leg(X, Y, s, g, f); fx = np.where(inleg, lx, fx); fy = np.where(inleg, ly, fy)
            if g["sleeve"][s] is not None and f["sleeve"][s] is not None:
                left_img = (s == g["legleft"])
                outside = (X < rowval(g["EL"], Y) - 1) if left_img else (X > rowval(g["ER"], Y) + 1)
                sx, sy, cov = map_sleeve(X, Y, s, g, f, ratio)
                sel = outside & (Y < g["split"])
                fx = np.where(sel, sx, fx); fy = np.where(sel, sy, fy)
        fxi = np.clip(np.round(fx).astype(int), 0, fa.shape[1] - 1); fyi = np.clip(np.round(fy).astype(int), 0, fa.shape[0] - 1)
        prev[ys, xs] = fb[fyi, fxi]
    Image.fromarray(np.concatenate([prev, fa], 1).astype(np.uint8)).resize((ga.shape[1], ga.shape[0] // 2)).save(os.path.join(D, "warp_preview.jpg"), quality=88)
    print(name, "parts", {k: [round(v[k]) for v in gv] for k in ("top", "armpit", "split", "bottom")},
          {k: [round(v[k]) for v in fv] for k in ("top", "armpit", "split", "bottom")}, "ratio", round(ratio, 3))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
