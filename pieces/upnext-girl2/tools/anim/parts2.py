"""v3 part rebuilds for girl2 (called from rig2.py, posed his_idle space):
- arms: shoulder -> elbow -> wrist as ONE continuous loft per arm (no gaps at the elbow; the top rings sit inside the
  shoulder and are weighted to chest / clavicle so raised arms stay attached), two low-poly bracelets per wrist, the
  original hand kept and bridged at the wrist (loft runs into the hand, hand rim blended with the forearm)
- boots: shaft = loft fitted to the original boot (cuff stripes painted), foot = new low-poly boot foot (rounded
  toe box, taper, sole band, heel block, arch)
Every rebuilt part gets its own painted UV strip in a free area of the body atlas."""
import numpy as np

nrm = lambda v: v / (np.linalg.norm(v) + 1e-12)


def ray_far(o, d, T):
    A0 = T[:, 0]; e1 = T[:, 1] - A0; e2 = T[:, 2] - A0
    pv = np.cross(d, e2); det = (e1 * pv).sum(1); ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    tv = o - A0; u = (tv * pv).sum(1) * inv; qv = np.cross(tv, e1); v = (qv * d).sum(1) * inv; t = (e2 * qv).sum(1) * inv
    hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    return t[hit].max() if hit.any() else np.nan


def fit_ring(c, f, o, T, NS, lo, hi, iters=3, maxshift=0.015):
    """radii of an NS-gon around centre c (frame f = theta 0, o = theta 90) ray-cast to the far side of T"""
    th = np.pi + 2 * np.pi * np.arange(NS) / NS
    dirs = np.cos(th)[:, None] * f + np.sin(th)[:, None] * o
    for it in range(iters):
        r = np.array([ray_far(c, d, T) for d in dirs]); r = np.where(np.isfinite(r), np.clip(r, lo, hi), np.nan)
        if it < iters - 1 and np.isfinite(r).sum() >= NS - 2:
            rr = np.where(np.isfinite(r), r, np.nanmean(r)); sh = (rr[:, None] * dirs).mean(0)
            if np.linalg.norm(sh) > maxshift: sh = sh / np.linalg.norm(sh) * maxshift
            c = c + sh
    r = np.where(np.isfinite(r), r, np.nanmean(r) if np.isfinite(r).any() else lo)
    return c, r


def smooth_rad(rad, rows):
    sm = rad.copy()
    for i in range(len(rad)): sm[i] = 0.25 * np.roll(rad[i], 1) + 0.5 * rad[i] + 0.25 * np.roll(rad[i], -1)
    out = sm.copy()
    for i in rows: out[i] = 0.25 * sm[i - 1] + 0.5 * sm[i] + 0.25 * sm[i + 1]
    return out


def loft(cen, frames, rad, NS, rect, TSZ=4096, caps=(True, True), vw=None, vfr_fix=None):
    """rings x (NS+1) verts (seam duplicated), quads, UV strip in rect (x0,y0,x1,y1) px; returns V, F (local), UV, col, row
    vw: optional per-interval UV height multipliers (small details like bracelets get more texels)"""
    nr = len(cen); V = []; F = []; UV = []
    seg = np.array([np.linalg.norm(cen[i + 1] - cen[i]) for i in range(nr - 1)])
    if vw is not None: seg = seg * np.asarray(vw)
    vlen = np.r_[0, np.cumsum(seg)]; vfr = vlen / max(vlen[-1], 1e-9)
    if vfr_fix is not None: vfr = np.asarray(vfr_fix)          # share UV rows with another loft (painted bands line up)
    x0, y0, x1, y1 = rect
    uvx = lambda k: (x0 + (x1 - x0) * k / NS) / TSZ
    uvy = lambda i: 1 - (y0 + (y1 - y0) * vfr[i]) / TSZ
    for i in range(nr):
        f, o = frames[i]
        for k in range(NS + 1):
            th = np.pi + 2 * np.pi * k / NS
            V.append(cen[i] + rad[i][k % NS] * (np.cos(th) * f + np.sin(th) * o))
    vid = lambda i, k: i * (NS + 1) + k
    rowcol = []
    for i in range(nr - 1):
        for k in range(NS):
            a, b, c, d = vid(i, k), vid(i, k + 1), vid(i + 1, k + 1), vid(i + 1, k)
            F += [(a, b, c), (a, c, d)]
            UV += [((uvx(k), uvy(i)), (uvx(k + 1), uvy(i)), (uvx(k + 1), uvy(i + 1))), ((uvx(k), uvy(i)), (uvx(k + 1), uvy(i + 1)), (uvx(k), uvy(i + 1)))]
            rowcol += [(i, k), (i, k)]
    cu = ((x0 + 0.5 * (x1 - x0) / NS) / TSZ, 1 - (y0 + 3) / TSZ)
    for end, on in ((0, caps[0]), (nr - 1, caps[1])):
        if not on: continue
        ax = nrm(cen[min(end + 1, nr - 1)] - cen[max(end - 1, 0)]) * (-1 if end == 0 else 1)
        ci = len(V); V.append(cen[end] + ax * 0.004)
        for k in range(NS):
            F.append((ci, vid(end, k), vid(end, k + 1)) if end == 0 else (ci, vid(end, k + 1), vid(end, k)))
            UV.append((cu, cu, cu)); rowcol.append((-1, -1))
    return np.array(V), np.array(F), np.array(UV), vfr, rowcol


def orient_out(Vl, Fl, axis_pts):
    """flip faces whose normal points towards the axis polyline (local arrays)"""
    P = np.asarray(axis_pts)
    for fi in range(len(Fl)):
        a, b, c = Vl[Fl[fi]]; n = np.cross(b - a, c - a); m = (a + b + c) / 3
        best, q = 1e9, P[0]
        for j in range(len(P) - 1):
            d = P[j + 1] - P[j]; t = np.clip((m - P[j]) @ d / (d @ d + 1e-12), 0, 1); x = P[j] + t * d
            if np.linalg.norm(m - x) < best: best, q = np.linalg.norm(m - x), x
        if n @ (m - q) < 0: Fl[fi] = Fl[fi][[0, 2, 1]]
    return Fl


# ================================================================================================ ARMS
ARM_RECT = (1000, 1128, 1336, 1816)
CAP_IN, CAP_DOWN = 0.03, 0.012
ARM_TH_U, ARM_TH_F = 0.88, 0.92
ARM_NS = 8


def build_arms(V, F, W0, lab, comp_dom, J):
    """returns (newV, newF, newUV, newW, newLab, keep_mask_verts, info) -- caller drops old arm verts except the hands"""
    comps = {d: c for c, d in comp_dom.items() if d.startswith(("UpperArm", "Forearm"))}
    out = dict(V=[], F=[], UV=[], W=[], lab=[], rows=[])
    keepv = np.ones(len(V), bool)
    for s, sg in (("L", 1), ("R", -1)):
        S, E, Wr = J["shoulder" + s], J["elbow" + s], J["wrist" + s]
        uu, uf = nrm(E - S), nrm(Wr - E); Lu, Lf = np.linalg.norm(E - S), np.linalg.norm(Wr - E)
        cu, cf = comps["UpperArm." + s], comps["Forearm." + s]
        hand = np.array([W0[i].get("Hand." + s, 0) >= 0.5 for i in range(len(V))]) & (lab == cf)
        fface = np.isin(lab[F[:, 0]], [cf]); hface = hand[F].all(1)
        Tu = V[F[np.isin(lab[F[:, 0]], [cu])]]; Tf = V[F[fface & ~hface]]
        keepv &= ~(np.isin(lab, [cu, cf]) & ~hand)
        U, Fo, H, C, Cl = f"UpperArm.{s}", f"Forearm.{s}", f"Hand.{s}", "Chest", f"Clavicle.{s}"
        BR = 0.0032                                            # bracelet relief (m)
        bo = 0.022 if s == "R" else 0.0                        # her right fist wraps back over the wrist: bracelets sit higher
        # v5: the arm top no longer rises above the shoulder joint (that raised the shoulders): a cap ring tucks in
        # towards the neck, slightly lower, and the first full ring sits just below the joint
        spec = [("cap", 0.0, {C: 0.5, Cl: 0.35, U: 0.15}, 0.55), ("u", 0.015, {Cl: 0.25, U: 0.75}, 1.0), ("u", 0.05, {U: 1}, 1.0),
                ("u", 0.13, {U: 1}, 1.0), ("u", Lu - 0.05, {U: 0.92, Fo: 0.08}, 1.0), ("e", 0.0, {U: 0.55, Fo: 0.45}, 1.0),
                ("f", 0.045, {U: 0.08, Fo: 0.92}, 1.0), ("f", 0.10, {Fo: 1}, 1.0),
                ("f", Lf - 0.060 - bo, {Fo: 1}, 1.0), ("f", Lf - 0.057 - bo, {Fo: 1}, "b"), ("f", Lf - 0.049 - bo, {Fo: 1}, "b"), ("f", Lf - 0.046 - bo, {Fo: 1}, 1.0),
                ("f", Lf - 0.040 - bo, {Fo: 1}, 1.0), ("f", Lf - 0.037 - bo, {Fo: 1}, "b"), ("f", Lf - 0.030 - bo, {Fo: 1}, "b"), ("f", Lf - 0.027 - bo, {Fo: 1}, 1.0),
                ("f", Lf - 0.006, {Fo: 0.55, H: 0.45}, 1.0), ("f", Lf + 0.022, {H: 1}, 0.82)]
        bend_back = nrm((E - 0.5 * (S + Wr)) - ((E - 0.5 * (S + Wr)) @ nrm(Wr - S)) * nrm(Wr - S))
        cen, frames, rad = [], [], []
        for kind, x, w, rs in spec:
            if kind == "cap":
                med = (J["neck"] - S) * [1, 1, 0]; med = nrm(med)
                c, ax, T = S + med * CAP_IN - np.array([0, 0, CAP_DOWN]), uu, Tu
            elif kind == "u": c, ax, T = S + uu * x, uu, Tu
            elif kind == "e": c, ax, T = E.copy(), nrm(uu + uf), Tu
            else: c, ax, T = E + uf * x, uf, Tf
            f = nrm(-bend_back - (-bend_back @ ax) * ax); o = nrm(np.cross(ax, f)) * sg
            # centres follow the fitted surface, not the bone line (his forearm sits in front of its bone)
            if kind == "cap": c2, r = fit_ring(S + uu * 0.0, f, o, Tu, ARM_NS, 0.022, 0.07, 5, 0.04); c = c2 + (c - S)
            elif kind == "f" and x > Lf - 0.03: c, r = fit_ring(E + uf * min(x, Lf - 0.012), f, o, Tf, ARM_NS, 0.016, 0.045, 5, 0.04); c = c + uf * (x - min(x, Lf - 0.012))
            else: c, r = fit_ring(c, f, o, T, ARM_NS, 0.018, 0.07, 5, 0.04)
            cen.append(c); frames.append((f, o)); rad.append(r)
        rad = np.array(rad)
        plain = [i for i, sp_ in enumerate(spec) if sp_[3] != "b"]
        for i in range(len(spec)):                             # fill bracelet rings from their neighbours, smooth the rest
            if spec[i][3] == "b": rad[i] = 0.5 * (rad[i - 1] + rad[min(i + 1, len(spec) - 1)])
        rad = smooth_rad(rad, [i for i in range(1, len(spec) - 1) if spec[i][3] != "b" and spec[i - 1][3] != "b" and spec[i + 1][3] != "b"])
        for i, sp_ in enumerate(spec):                         # v5: slimmer arms, matched to his frames
            rad[i] = rad[i] * (ARM_TH_U if sp_[0] in ("u", "e", "cap") else (ARM_TH_F if spec[i][1] < Lf - 0.012 else 1.0))
        for i, sp_ in enumerate(spec):
            if sp_[3] == "b": rad[i] = rad[i] + BR
            elif isinstance(sp_[3], float): rad[i] = rad[i] * sp_[3]
        kinds = [sp_[3] for sp_ in spec]
        vw = [8.0 if (kinds[i] == "b" or kinds[i + 1] == "b") else 1.0 for i in range(len(spec) - 1)]
        Vl, Fl, UVl, vfr, rc = loft(cen, frames, rad, ARM_NS, ARM_RECT, caps=(True, True), vw=vw, vfr_fix=out.get("vfr"))
        Fl = orient_out(Vl, Fl, [S - uu * 0.05, E, Wr + uf * 0.03])
        b0 = len(out["V"])
        for i in range(len(spec)):
            for k in range(ARM_NS + 1): out["W"].append(dict(spec[i][2])); out["lab"].append(cu if spec[i][0] == "u" else cf)
        out["W"] += [dict(spec[0][2]), dict(spec[-1][2])]; out["lab"] += [cu, cf]
        out["V"] += list(Vl); out["F"] += list(Fl + b0); out["UV"] += list(UVl); out["rows"] += [(s, r_, k_) for r_, k_ in rc]
        if s == "L": out["vfr"] = vfr; out["spec"] = [sp_[3] for sp_ in spec]
        # hand rim: verts of hand faces that touch removed forearm faces -> blended like the loft's wrist ring
        rim = np.unique(F[fface & ~hface][np.isin(F[fface & ~hface], np.nonzero(hand)[0])])
        out.setdefault("hand_rim", {})[s] = rim
    return out, keepv


def paint_arms(im, info, pal):
    """pal: skin, shade, bracelet, bracelet_dark"""
    from PIL import ImageDraw
    dr = ImageDraw.Draw(im); x0, y0, x1, y1 = ARM_RECT; NS = ARM_NS; W_ = (x1 - x0) / NS
    dr.rectangle([x0 - 8, y0 - 8, x1 + 8, y1 + 8], fill=pal[0])
    vfr = info["vfr"]; ys = [y0 + (y1 - y0) * f for f in vfr]; spec = info["spec"]
    for k in range(NS):
        th = np.degrees(np.pi + 2 * np.pi * (k + 0.5) / NS); th = (th + 180) % 360 - 180      # 0 = front (away from the elbow point)
        if abs(th) > 120: dr.rectangle([x0 + k * W_, y0 - 8, x0 + (k + 1) * W_, y1 + 8], fill=pal[1])
    for i in range(len(spec) - 1):
        if spec[i] == "b" and spec[i + 1] == "b":              # bracelet: dark sides, warm brown top
            dr.rectangle([x0 - 8, ys[i - 1] + 2, x1 + 8, ys[i + 2] - 2], fill=pal[3]); dr.rectangle([x0 - 8, ys[i] + 1, x1 + 8, ys[i + 1] - 1], fill=pal[2])
    return im


# ================================================================================================ BOOTS
SHAFT_RECT = (2888, 584, 3448, 952)
FOOT_RECT = (1448, 744, 1944, 1112)
SHAFT_NS = 10
FOOT_PROFILE = [  # u (m, along the foot from the ankle), half width, upper height, sole thickness, bottom lift
    (-0.068, 0.028, 0.120, 0.030, 0.000), (-0.050, 0.034, 0.132, 0.030, 0.000), (-0.022, 0.038, 0.135, 0.030, 0.000),
    (-0.012, 0.039, 0.134, 0.030, 0.000), (-0.004, 0.039, 0.130, 0.014, 0.017), (0.025, 0.040, 0.112, 0.012, 0.010),
    (0.060, 0.042, 0.086, 0.011, 0.000), (0.092, 0.041, 0.068, 0.010, 0.000), (0.118, 0.034, 0.054, 0.010, 0.002),
    (0.138, 0.024, 0.044, 0.009, 0.005), (0.150, 0.012, 0.036, 0.008, 0.008)]
SEC = [(-0.62, "s0"), (0.62, "s0"), (1.0, "s"), (1.0, 0.42), (0.86, 0.80), (0.38, 1.0), (-0.38, 1.0), (-0.86, 0.80), (-1.0, 0.42), (-1.0, "s")]


def build_boots(V, F, lab, comp_dom, J, footdir):
    comps = {d: c for c, d in comp_dom.items() if d.startswith("Calf")}
    out = dict(V=[], F=[], UV=[], W=[], lab=[], kind=[])
    for s, sg in (("L", 1), ("R", -1)):
        cb = comps["Calf." + s]; K, A = J["knee" + s], J["ankle" + s]; fd = nrm(np.array([footdir[s][0], footdir[s][1], 0.0]))
        lat = nrm(np.cross(fd, [0, 0, 1.0]))                    # to the foot's right
        Tb = V[F[np.isin(lab[F[:, 0]], [cb])]]; P = V[lab == cb]
        ztop = float(np.percentile(P[:, 2], 99)); uc = nrm(A - K)
        # ---------------- shaft loft
        zs = [ztop + 0.002, ztop - 0.012, ztop - 0.040, 0.36, 0.30, 0.24, 0.185, 0.145, 0.118]
        cen, frames, rad = [], [], []
        for zi, z in enumerate(zs):
            t = (K[2] - z) / (K[2] - A[2]); c = K + t * (A - K)
            f = nrm(np.array([0, -1.0, 0]) - (np.array([0, -1.0, 0]) @ uc) * uc); o = nrm(np.cross(uc, f)) * sg
            # sector maxima of the original boot's vertices in a height band (the cuff top is ragged: one band for the top rings)
            lo_, hi_ = (ztop - 0.045, ztop + 0.01) if zi < 2 else (z - 0.025, z + 0.025)
            m = (P[:, 2] > lo_) & (P[:, 2] < hi_); d = P[m] - c; d -= (d @ uc)[:, None] * uc
            ang = np.arctan2(d @ o, d @ f); rr = np.linalg.norm(d, axis=1)
            th = np.pi + 2 * np.pi * np.arange(SHAFT_NS) / SHAFT_NS; r = np.full(SHAFT_NS, np.nan)
            for k in range(SHAFT_NS):
                dth = np.abs((ang - th[k] + np.pi) % (2 * np.pi) - np.pi); sel = dth < 1.3 * np.pi / SHAFT_NS
                if sel.any(): r[k] = rr[sel].max()
            if np.isnan(r).sum() > 3: _, r2 = fit_ring(c, f, o, Tb, SHAFT_NS, 0.034, 0.11); r = np.where(np.isnan(r), r2, r)
            r = np.where(np.isnan(r), np.nanmean(r), r)
            cen.append(c); frames.append((f, o)); rad.append(np.clip(r, 0.036, 0.11))
        rad = np.array(rad); rad = smooth_rad(rad, range(2, len(zs) - 1))
        rad[0] = np.maximum(rad[0], rad[1]) * 1.03; rad[-1] = np.minimum(rad[-1], 0.040); rad[-2] = np.minimum(rad[-2], 0.044)
        rad[:3] = np.minimum(rad[:3], 0.080); rad[3] = np.minimum(rad[3], 0.070)       # v4: slimmer cuff, the leg taper continues
        Vl, Fl, UVl, vfr, rc = loft(cen, frames, rad, SHAFT_NS, SHAFT_RECT, caps=(False, True))
        Fl = orient_out(Vl, Fl, [cen[0] + uc * -0.05, cen[-1] + uc * 0.05])
        # v5: the cuff top dips at the front (under the knee cap) so a bent knee rolls over it instead of through it
        for k in range(SHAFT_NS + 1):
            th_ = np.pi + 2 * np.pi * k / SHAFT_NS; fr_ = max(0.0, np.cos(th_ - np.pi) * -1)      # 1 at the front
            for rr_, dz_ in ((0, 0.022), (1, 0.014)):
                Vl[rr_ * (SHAFT_NS + 1) + k] += uc * dz_ * fr_ ** 1.5
        # cuff opening: inner lip hugging the leg (top rim -> inner ring a bit lower)
        nl = len(Vl); inner = []
        for k in range(SHAFT_NS + 1):
            th = np.pi + 2 * np.pi * k / SHAFT_NS; f, o = frames[1]
            inner.append(cen[1] + 0.05 * (np.cos(th) * f + np.sin(th) * o) - uc * -0.006)
        Vl = np.r_[Vl, np.array(inner)]; cu = ((SHAFT_RECT[0] + 6) / 4096, 1 - (SHAFT_RECT[1] + 3) / 4096)
        lip = []
        for k in range(SHAFT_NS):
            a, b, c, d = k, k + 1, nl + k + 1, nl + k
            lip += [(a, c, b), (a, d, c)]
        Fl = np.r_[Fl, np.array(lip)]; UVl = np.r_[UVl, np.array([(cu, cu, cu)] * len(lip))]; rc = rc + [(-2, -2)] * len(lip)
        b0 = len(out["V"])
        out["V"] += list(Vl); out["F"] += list(Fl + b0); out["UV"] += list(UVl); out["kind"] += [("shaft", r_, k_) for r_, k_ in rc]
        out["lab"] += [cb] * len(Vl); out["W"] += [None] * len(Vl)
        if s == "L": out["shaft_vfr"] = vfr
        # ---------------- foot: sections along the foot
        base = np.array([A[0], A[1], 0.0]); NSF = len(SEC)
        cenf, fr2, secs = [], [], []
        Vf = []
        for (u, w, h, sth, lift) in FOOT_PROFILE:
            ring = []
            for (a, b) in SEC:
                z = lift if b == "s0" else (lift + sth if b == "s" else max(lift + sth + 0.004, h * b))
                ring.append(base + fd * u + lat * (a * w) * 1.0 + np.array([0, 0, z]))
            Vf.append(ring)
        Vf = np.array(Vf)                                       # (nsec, NSF, 3)
        nsec = len(FOOT_PROFILE); Vfl = list(Vf.reshape(-1, 3)); Ffl = []; UVf = []; kinds = []
        x0, y0, x1, y1 = FOOT_RECT
        us = np.array([p[0] for p in FOOT_PROFILE]); ufr = (us - us[0]) / (us[-1] - us[0])
        uvx = lambda k: (x0 + (x1 - x0) * k / NSF) / 4096
        uvy = lambda i: 1 - (y0 + (y1 - y0) * ufr[i]) / 4096
        vid = lambda i, k: i * NSF + (k % NSF)
        for i in range(nsec - 1):
            for k in range(NSF):
                a, b, c, d = vid(i, k), vid(i, k + 1), vid(i + 1, k + 1), vid(i + 1, k)
                Ffl += [(a, b, c), (a, c, d)]
                UVf += [((uvx(k), uvy(i)), (uvx(k + 1), uvy(i)), (uvx(k + 1), uvy(i + 1))), ((uvx(k), uvy(i)), (uvx(k + 1), uvy(i + 1)), (uvx(k), uvy(i + 1)))]
                kinds += [("foot", i, k)] * 2
        for end in (0, nsec - 1):                                # heel back / toe tip caps
            ci = len(Vfl); Vfl.append(Vf[end].mean(0) + fd * (-0.006 if end == 0 else 0.008))
            for k in range(NSF):
                Ffl.append((ci, vid(end, k + 1), vid(end, k)) if end == 0 else (ci, vid(end, k), vid(end, k + 1)))
                cuv = (uvx(k + 0.5), uvy(end)); UVf.append((cuv, cuv, cuv)); kinds.append(("foot", end, k))
        Vfl = np.array(Vfl); Ffl = np.array(Ffl)
        axis = [base + fd * us[0] + np.array([0, 0, 0.05]), base + fd * us[-1] + np.array([0, 0, 0.02])]
        Ffl = orient_out(Vfl, Ffl, axis)
        b0 = len(out["V"])
        out["V"] += list(Vfl); out["F"] += list(Ffl + b0); out["UV"] += list(UVf); out["kind"] += kinds
        out["lab"] += [cb] * len(Vfl); out["W"] += [None] * len(Vfl)
    return out


def paint_boots(im, info, pal):
    """pal: leather, leather_shade, cuff_stripe, sole, heel, lip"""
    from PIL import ImageDraw
    dr = ImageDraw.Draw(im)
    x0, y0, x1, y1 = SHAFT_RECT; NS = SHAFT_NS; W_ = (x1 - x0) / NS; vfr = info["shaft_vfr"]; ys = [y0 + (y1 - y0) * f for f in vfr]
    dr.rectangle([x0 - 8, y0 - 8, x1 + 8, y1 + 8], fill=pal[0])
    for k in range(NS):
        th = np.degrees(np.pi + 2 * np.pi * (k + 0.5) / NS); th = (th + 180) % 360 - 180
        if th < -55 and th > -125: dr.rectangle([x0 + k * W_, y0 - 8, x0 + (k + 1) * W_, y1 + 8], fill=pal[1])
    # two cuff stripes inside the second band (ring 1 -> ring 2), like her boots
    a, b = ys[1], ys[2]; h = b - a
    for t0, t1 in ((0.22, 0.36), (0.58, 0.72)): dr.rectangle([x0 - 8, a + t0 * h, x1 + 8, a + t1 * h], fill=pal[2])
    dr.rectangle([x0 - 8, y0 - 8, x1 + 8, ys[1]], fill=pal[0])
    dr.rectangle([x0 - 2, y0 - 6, x0 + 10, y0 + 6], fill=pal[5])
    x0, y0, x1, y1 = FOOT_RECT; NSF = len(SEC); W_ = (x1 - x0) / NSF
    dr.rectangle([x0 - 8, y0 - 8, x1 + 8, y1 + 8], fill=pal[0])
    us = np.array([p[0] for p in FOOT_PROFILE]); ufr = (us - us[0]) / (us[-1] - us[0]); yh = y0 + (y1 - y0) * ufr[4]
    for k in (0, 1, NSF - 1):                                   # sole band (bottom + sole sides)
        dr.rectangle([x0 + k * W_, y0 - 8, x0 + (k + 1) * W_, y1 + 8], fill=pal[3])
    for k in (0, 1, NSF - 1):                                   # heel block a touch lighter
        dr.rectangle([x0 + k * W_, y0 - 8, x0 + (k + 1) * W_, yh], fill=pal[4])
    for k in (NSF - 2, 2):                                      # thin lighter welt line above the sole
        dr.rectangle([x0 + k * W_, y0 - 8, x0 + k * W_ + 0.18 * W_, y1 + 8] if k == 2 else [x0 + (k + 1) * W_ - 0.18 * W_, y0 - 8, x0 + (k + 1) * W_, y1 + 8], fill=pal[1])
    return im


# ================================================================================================ NECK + TURTLENECK
NECK_RECT = (3820, 1530, 4084, 1810)
TNECK_RECT = (3820, 1132, 4084, 1500)
NECK_NS = 10


def build_neck(V, F, lab, comp_dom, J):
    """neck: one loft from inside the turtleneck up into the head (Chest -> Neck -> Head blend: no seam at the jaw)
    turtleneck: a complete tube around the neck over the old collar (Chest -> Neck blend), folded top + inner lip"""
    tc = [c for c, d in comp_dom.items() if d == "Chest"][0]; nc = [c for c, d in comp_dom.items() if d == "Neck"][0]
    T = V[lab == tc]; N0, Hb = J["neck"], J["headbase"]; ax = nrm(Hb - N0)
    f0 = nrm(np.array([0, -1.0, 0]) - (np.array([0, -1.0, 0]) @ ax) * ax); o0 = nrm(np.cross(ax, f0))     # o0: her left
    th = np.pi + 2 * np.pi * np.arange(NECK_NS) / NECK_NS
    out = dict(V=[], F=[], UV=[], W=[], lab=[])
    # ---------------- turtleneck: radii = old collar sector maxima + margin
    def collar_r(z, margin, lo, hi):
        c = N0 + ax * ((z - N0[2]) / ax[2]); m = np.abs(T[:, 2] - z) < 0.016; d = T[m] - c; d -= (d @ ax)[:, None] * ax
        ang = np.arctan2(d @ o0, d @ f0); rr = np.linalg.norm(d, axis=1); r = np.full(NECK_NS, np.nan)
        for k in range(NECK_NS):
            dth = np.abs((ang - th[k] + np.pi) % (2 * np.pi) - np.pi); s = (dth < 1.4 * np.pi / NECK_NS) & (rr < hi)
            if s.any(): r[k] = rr[s].max()
        r = np.where(np.isnan(r), np.nanmedian(r) if np.isfinite(r).any() else lo, r)
        return c, np.clip(r + margin, lo, hi)
    # v5: sized from his frames (narrower and a little lower than v4): neck radius + knit thickness, flared at the base
    zs = [1.232, 1.255, 1.280, 1.305, 1.314]
    cen, frames, rad = [], [], []
    for i, z in enumerate(zs):
        c = N0 + ax * ((z - N0[2]) / ax[2]); cen.append(c); frames.append((f0, o0))
    side = np.array([1 + 0.12 * abs(np.sin(t)) for t in th])                 # a bit wider side to side, like the neck
    rad = np.array([0.060 * side, 0.052 * side, 0.049 * side, 0.050 * side, 0.040 * side])
    Vl, Fl, UVl, vfr, rc = loft(cen, frames, rad, NECK_NS, TNECK_RECT, caps=(False, False))
    Fl = orient_out(Vl, Fl, [cen[0] - ax * 0.05, cen[-1] + ax * 0.05])
    wts = [{"Chest": 1.0}, {"Chest": 0.9, "Neck": 0.1}, {"Chest": 0.7, "Neck": 0.3}, {"Chest": 0.55, "Neck": 0.45}, {"Chest": 0.55, "Neck": 0.45}]
    b0 = len(out["V"])
    for i in range(len(zs)):
        for k in range(NECK_NS + 1): out["W"].append(dict(wts[i])); out["lab"].append(tc)
    out["V"] += list(Vl); out["F"] += list(Fl + b0); out["UV"] += list(UVl); out["tn_vfr"] = vfr
    # ---------------- neck loft
    P = V[lab == nc]
    zn = [1.255, 1.285, 1.315, 1.345, 1.375, 1.405]
    cen, frames, rad = [], [], []
    for z in zn:
        c = N0 + ax * ((z - N0[2]) / ax[2]); c = c + np.array([0, 0.004, 0])
        r = np.array([0.036 + 0.006 * abs(np.sin(t)) for t in th])              # a little wider side to side
        cen.append(c); frames.append((f0, o0)); rad.append(r)
    rad = np.array(rad); rad[-1] *= 1.12; rad[-2] *= 1.04
    Vl, Fl, UVl, nvfr, rc = loft(cen, frames, rad, NECK_NS, NECK_RECT, caps=(True, True))
    Fl = orient_out(Vl, Fl, [cen[0] - ax * 0.05, cen[-1] + ax * 0.05])
    wts = [{"Chest": 0.6, "Neck": 0.4}, {"Chest": 0.25, "Neck": 0.75}, {"Neck": 1.0}, {"Neck": 0.7, "Head": 0.3}, {"Neck": 0.3, "Head": 0.7}, {"Head": 1.0}]
    b0 = len(out["V"])
    for i in range(len(zn)):
        for k in range(NECK_NS + 1): out["W"].append(dict(wts[i])); out["lab"].append(nc)
    out["W"] += [dict(wts[0]), dict(wts[-1])]; out["lab"] += [nc, nc]
    out["V"] += list(Vl); out["F"] += list(Fl + b0); out["UV"] += list(UVl); out["nk_vfr"] = nvfr
    return out


def paint_neck(im, info, skin, sweater):
    """skin: (base, back shade); sweater: (base, rib line, fold shade)"""
    from PIL import ImageDraw
    dr = ImageDraw.Draw(im)
    x0, y0, x1, y1 = NECK_RECT; W_ = (x1 - x0) / NECK_NS
    dr.rectangle([x0 - 6, y0 - 6, x1 + 6, y1 + 6], fill=skin[0])
    for k in range(NECK_NS):
        t = np.degrees(np.pi + 2 * np.pi * (k + 0.5) / NECK_NS); t = (t + 180) % 360 - 180      # 0 = front
        if abs(t) > 110: dr.rectangle([x0 + k * W_, y0 - 6, x0 + (k + 1) * W_, y1 + 6], fill=skin[1])
    x0, y0, x1, y1 = TNECK_RECT; W_ = (x1 - x0) / NECK_NS; ys = [y0 + (y1 - y0) * f for f in info["tn_vfr"]]
    dr.rectangle([x0 - 6, y0 - 6, x1 + 6, y1 + 6], fill=sweater[0])
    for k in range(NECK_NS):
        for q in (0.25, 0.75):
            xx = x0 + (k + q) * W_; dr.rectangle([xx - 2, y0 - 6, xx + 2, ys[3]], fill=sweater[1])
    dr.rectangle([x0 - 6, ys[3] - 3, x1 + 6, y1 + 6], fill=sweater[2])                    # fold edge + lip
    return im
