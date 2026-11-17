"""Near-eye fix: the face mask's vertices slide along his f001 camera rays (so the frontal projection = the face UVs and
the frontal look stay exactly the same) into a smooth surface: least-squares Laplacian fairing with the mask border
pinned, so no facet under the eyes / cheeks is turned edge-on to the front (those were the faces whose front-projected
texels smeared into streaks at 3/4 views).
relax_face(V, F, FMAT, lab) -> V'"""
import sys, os, json, numpy as np
import scipy.sparse as sp
from scipy.sparse.linalg import lsqr
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from cam import basis, rotz


def face_cos(V, F, fids, Cm):
    n = np.cross(V[F[fids, 1]] - V[F[fids, 0]], V[F[fids, 2]] - V[F[fids, 0]]); n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-12
    c = V[F[fids]].mean(1); vd = Cm - c; vd /= np.linalg.norm(vd, axis=1, keepdims=True)
    return (n * vd).sum(1)


def relax_face(V, F, FMAT, lab, smooth=1.0, keep=0.04, zone=None, verbose=True):
    D = np.load("ref/final_tex.npz", allow_pickle=True); cam = json.loads(str(D["cam"])); A = D["alphas"]
    C, R, U, Fw = basis(cam); Cm = C @ rotz(A[0])
    comp = np.unique(lab[F[FMAT > 0][:, 0]]); fc = np.nonzero(np.isin(lab[F[:, 0]], comp))[0]
    vs = np.unique(F[fc]); idx = -np.ones(len(V), int); idx[vs] = np.arange(len(vs)); n = len(vs)
    E = np.sort(np.concatenate([F[fc][:, [0, 1]], F[fc][:, [1, 2]], F[fc][:, [2, 0]]]), 1)
    ue, cnt = np.unique(E, axis=0, return_counts=True)
    # the mask is a closed piece: only the textured front moves; its rim (shared with untextured faces) and the rest are pinned
    front = np.zeros(n, bool); front[idx[np.unique(F[FMAT > 0])]] = True
    other = np.zeros(n, bool); other[idx[np.unique(F[fc[FMAT[fc] == 0]])]] = True
    border = ~front
    if zone is not None:                                    # only the verts inside the f001 pixel rect zone move
        from cam import project
        px, py, _ = project(V[vs], cam, A[0]); x0, x1, y0, y1 = zone
        border |= ~((px > x0) & (px < x1) & (py > y0) & (py < y1))
    nb = [set() for _ in range(n)]
    for a, b in ue: nb[idx[a]].add(idx[b]); nb[idx[b]].add(idx[a])
    P = V[vs]; t0 = np.linalg.norm(P - Cm, axis=1); d = (P - Cm) / t0[:, None]
    rows, cols, vals, rhs = [], [], [], []; r = 0
    for i in range(n):                                      # Laplacian rows: 3 per vertex
        if border[i]: continue
        js = list(nb[i]); w = 1.0 / len(js)
        for k in range(3):
            rows.append(r); cols.append(i); vals.append(smooth * d[i, k])
            for j in js: rows.append(r); cols.append(j); vals.append(-smooth * w * d[j, k])
            rhs.append(0.0); r += 1
    for i in range(n):                                      # data: border pinned, interior kept loosely
        wgt = 100.0 if border[i] else keep
        rows.append(r); cols.append(i); vals.append(wgt); rhs.append(wgt * t0[i]); r += 1
    M = sp.csr_matrix((vals, (rows, cols)), shape=(r, n))
    t = lsqr(M, np.array(rhs), atol=1e-12, btol=1e-12, iter_lim=20000)[0]
    V2 = V.copy(); V2[vs] = Cm + t[:, None] * d
    if verbose:
        fe = np.nonzero(FMAT == 1)[0]; c0 = face_cos(V, F, fe, Cm); c1 = face_cos(V2, F, fe, Cm)
        print("FACE relax: verts", n, "border", int(border.sum()), "move mm max %.1f mean %.1f" % (np.abs(t - t0).max() * 1000, np.abs(t - t0).mean() * 1000),
              "| face-mat cos min %.2f -> %.2f, faces cos<0.5: %d -> %d" % (c0.min(), c1.min(), (c0 < 0.5).sum(), (c1 < 0.5).sum()))
    return V2


def planarize_eyes(V, F, FMAT, lab, regions=((545, 664, 378, 470, 22.0), (412, 532, 378, 470, -22.0)), feather=14.0, verbose=True):
    """each eye's area of the mask (rect in f001 pixels) slides along the f001 rays onto its best-fit plane (feathered
    at the rect edge): the eye + blush sit on one flat facet group that turns with the head instead of kinking"""
    from cam import project
    D = np.load("ref/final_tex.npz", allow_pickle=True); cam = json.loads(str(D["cam"])); A = D["alphas"]
    C, R, U, Fw = basis(cam); Cm = C @ rotz(A[0])
    vs = np.unique(F[FMAT > 0]); x, y, _ = project(V, cam, A[0])
    V2 = V.copy(); fe = np.nonzero(FMAT > 0)[0]; c0 = face_cos(V, F, fe, Cm)
    for (x0, x1, y0, y1, yaw) in regions:
        dist = np.minimum.reduce([x[vs] - x0, x1 - x[vs], y[vs] - y0, y1 - y[vs]])
        w = np.clip(dist / feather, 0, 1); sel = vs[w > 0]; ws = w[w > 0]
        if len(sel) < 4: continue
        P = V[sel]; cen = (P * ws[:, None]).sum(0) / ws.sum()
        tc = (Cm - cen) * [1, 1, 0]; tc /= np.linalg.norm(tc)
        nrm = rotz(yaw).T @ tc if False else np.array([[np.cos(np.radians(yaw)), -np.sin(np.radians(yaw)), 0], [np.sin(np.radians(yaw)), np.cos(np.radians(yaw)), 0], [0, 0, 1]]) @ tc
        for i, wi in zip(sel, ws):
            dr = V[i] - Cm; t = ((cen - Cm) @ nrm) / (dr @ nrm)          # ray param to the plane (t = 1 at the vertex)
            V2[i] = Cm + dr * (1 + wi * (t - 1))
        if verbose:
            ang = np.degrees(np.arccos(np.clip(nrm @ (Cm - cen) / np.linalg.norm(Cm - cen), -1, 1)))
            print("FACE eye plane: verts", len(sel), "plane vs front %.0f deg" % ang, "move mm max %.1f" % (np.abs(np.linalg.norm(V2[sel] - V[sel], axis=1)).max() * 1000))
    if verbose:
        c1 = face_cos(V2, F, fe, Cm); print("FACE cos<0.5: %d -> %d, min %.2f -> %.2f" % ((c0 < 0.5).sum(), (c1 < 0.5).sum(), c0.min(), c1.min()))
    return V2


def smooth_depth(V, F, FMAT, lab, center=(540.0, 452.0), radii=(100.0, 62.0), feather=0.35, deg=2, back=0.004, verbose=True):
    """front of the face mask: camera depth replaced by a smooth polynomial of the f001 pixel position (weights fall off
    towards the ellipse edge), vertices slide along the f001 rays -> frontal projection / UVs untouched"""
    from cam import project
    D = np.load("ref/final_tex.npz", allow_pickle=True); cam = json.loads(str(D["cam"])); A = D["alphas"]
    C, R, U, Fw = basis(cam); Cm = C @ rotz(A[0])
    comp = np.unique(lab[F[FMAT > 0][:, 0]]); vs = np.unique(F[np.isin(lab[F[:, 0]], comp)])
    px, py, pz = project(V[vs], cam, A[0])
    r = np.hypot((px - center[0]) / radii[0], (py - center[1]) / radii[1])
    w = np.clip((1 - r) / feather, 0, 1); w = w * w * (3 - 2 * w)
    # only the near (front) layer: verts whose depth is close to the front-most depth at their pixel
    front = np.zeros(len(vs), bool); fe = np.unique(F[FMAT > 0]); front[np.isin(vs, fe)] = True
    w = w * front
    # the mask rim (verts shared with untextured faces of the head piece) stays put, the next ring moves half:
    # keeps the seam with the hair / jaw closed (moving it opened a hole in the hair at 3/4 back views)
    cf = np.isin(lab[F[:, 0]], comp); rim = np.unique(F[cf & (FMAT == 0)]); rim = np.intersect1d(rim, fe)
    ring2 = np.setdiff1d(np.unique(F[(FMAT > 0)][np.isin(F[FMAT > 0], rim).any(1)]), rim)
    w[np.isin(vs, rim)] = 0.0; w[np.isin(vs, ring2)] *= 0.5
    u = (px - center[0]) / 100.0; v = (py - center[1]) / 100.0
    terms = [np.ones_like(u)] + [u ** i * v ** (k - i) for k in range(1, deg + 1) for i in range(k + 1)]
    Tm = np.stack(terms, 1); sel = w > 0.05
    for it in range(5):                                     # robust: the decimated mask has pits (verts cm behind the surface)
        coef = np.linalg.lstsq(Tm[sel] * w[sel, None], pz[sel] * w[sel], rcond=None)[0]; dev = pz - Tm @ coef
        s_ = np.median(np.abs(dev[sel])) * 1.48; sel = (w > 0.05) & (np.abs(dev) < 2.0 * s_ + 0.002)
    zf = Tm @ coef; dz = np.clip(zf - pz, -0.08, back)      # pits come forward; bulges only go back a little (the hair shell is right behind)
    znew = pz + w * dz
    V2 = V.copy(); dr = V[vs] - Cm
    V2[vs] = Cm + dr * (znew / pz)[:, None]                  # same ray, new depth (depth is linear along the ray)
    if verbose:
        f1 = np.nonzero(FMAT == 1)[0]; f2 = np.nonzero(FMAT == 2)[0]
        for nm, ff in (("eyes", f1), ("mouth", f2)):
            c0 = face_cos(V, F, ff, Cm); c1 = face_cos(V2, F, ff, Cm)
            print("FACE %s cos min %.2f -> %.2f, <0.5: %d -> %d, <0.7: %d -> %d" % (nm, c0.min(), c1.min(), (c0 < 0.5).sum(), (c1 < 0.5).sum(), (c0 < 0.7).sum(), (c1 < 0.7).sum()))
        mv = (znew - pz) * np.linalg.norm(dr, axis=1) / pz
        print("FACE depth move mm: max fwd %.1f back %.1f" % (-mv.min() * 1000, mv.max() * 1000))
    return V2


def eye_planes(V, F, FMAT, lab, eyes=((588.0, 424.0), (492.0, 426.0)), radii=(62.0, 40.0), feather=0.45, yaw=None, verbose=True):
    """each eye area of the mask goes onto ONE plane (the near eye then turns with the head as a flat facet group instead
    of wrapping over the nose-side wall); plane = best fit (yaw + pitch + offset) to the area, vertices slide along
    the f001 rays (UVs / frontal look unchanged), feathered to the original surface at the area edge"""
    from cam import project
    D = np.load("ref/final_tex.npz", allow_pickle=True); cam = json.loads(str(D["cam"])); A = D["alphas"]
    C, R, U, Fw = basis(cam); Cm = C @ rotz(A[0])
    vs = np.unique(F[FMAT > 0]); px, py, pz = project(V[vs], cam, A[0])
    V2 = V.copy(); dr = V[vs] - Cm; ln = np.linalg.norm(dr, axis=1); dn = dr / ln[:, None]
    Wt = np.zeros(len(vs)); Tn = np.zeros(len(vs))
    for (ex, ey) in eyes:
        r = np.hypot((px - ex) / radii[0], (py - ey) / radii[1]); w = np.clip((1 - r) / feather, 0, 1); w = w * w * (3 - 2 * w)
        sel = w > 0
        P = V[vs][sel]; ww = w[sel] + 0.05
        cen = (P * ww[:, None]).sum(0) / ww.sum()
        # plane z = a + b x + c y in a frame facing the camera (fit depth as a linear function -> robust, no flips)
        tc = Cm - cen; tc /= np.linalg.norm(tc); xa = np.cross([0, 0, 1.0], tc); xa /= np.linalg.norm(xa); ya = np.cross(tc, xa)
        Lc = np.stack([(P - cen) @ xa, (P - cen) @ ya, (P - cen) @ tc], 1)
        M_ = np.stack([np.ones(len(P)), Lc[:, 0], Lc[:, 1]], 1) * ww[:, None]
        a, b, c = np.linalg.lstsq(M_, Lc[:, 2] * ww, rcond=None)[0]
        if yaw is not None: b = np.tan(np.radians(yaw)) * (1 if (ex > 540) else -1) * -1
        nrm = tc - b * xa - c * ya; nrm /= np.linalg.norm(nrm); p0 = cen + a * tc
        t = ((p0 - Cm) @ nrm) / (dn[sel] @ nrm)               # ray length to the plane
        Tn[sel] += w[sel] * t; Wt[sel] += w[sel]
        if verbose:
            print("FACE eye plane at (%d,%d): verts %d, plane turned %.0f deg sideways, %.0f deg up/down" %
                  (ex, ey, sel.sum(), np.degrees(np.arctan(-b)), np.degrees(np.arctan(-c))))
    m = Wt > 0
    newlen = ln.copy(); wsum = np.clip(Wt, 0, 1)
    newlen[m] = ln[m] + wsum[m] * (Tn[m] / Wt[m] - ln[m])
    V2[vs] = Cm + dn * newlen[:, None]
    if verbose:
        f1 = np.nonzero(FMAT == 1)[0]; c0 = face_cos(V, F, f1, Cm); c1 = face_cos(V2, F, f1, Cm)
        print("FACE eyes cos min %.2f -> %.2f, <0.5: %d -> %d, <0.7: %d -> %d | move mm max %.1f" %
              (c0.min(), c1.min(), (c0 < 0.5).sum(), (c1 < 0.5).sum(), (c0 < 0.7).sum(), (c1 < 0.7).sum(), np.abs(newlen - ln).max() * 1000))
    return V2


def ellipsoid_face(V, F, FMAT, lab, center=(540.0, 450.0), radii=(118.0, 82.0), feather=0.3, clamp=0.02, verbose=True):
    """front of the face mask snapped (along the f001 rays) onto a smooth ellipsoid fitted to it: no facet is turned
    edge-on, normals vary smoothly -> the near eye / blush foreshorten instead of smearing; frontal look unchanged"""
    from cam import project
    D = np.load("ref/final_tex.npz", allow_pickle=True); cam = json.loads(str(D["cam"])); A = D["alphas"]
    C, R, U, Fw = basis(cam); Cm = C @ rotz(A[0])
    vs = np.unique(F[FMAT > 0]); P = V[vs]; px, py, pz = project(P, cam, A[0])
    r = np.hypot((px - center[0]) / radii[0], (py - center[1]) / radii[1])
    w = np.clip((1 - r) / feather, 0, 1); w = w * w * (3 - 2 * w)
    # axis-aligned ellipsoid fit (algebraic): a x^2 + b y^2 + c z^2 + d x + e y + f z = 1, weighted to the face core
    fw = np.clip(1.2 - r, 0.05, 1)
    Mx = np.stack([P[:, 0] ** 2, P[:, 1] ** 2, P[:, 2] ** 2, P[:, 0], P[:, 1], P[:, 2]], 1)
    k = np.linalg.lstsq(Mx * fw[:, None], fw, rcond=None)[0]
    dr = P - Cm; ln = np.linalg.norm(dr, axis=1); dn = dr / ln[:, None]
    # ray: X = Cm + t dn -> quadratic in t
    qa = k[0] * dn[:, 0] ** 2 + k[1] * dn[:, 1] ** 2 + k[2] * dn[:, 2] ** 2
    qb = 2 * (k[0] * Cm[0] * dn[:, 0] + k[1] * Cm[1] * dn[:, 1] + k[2] * Cm[2] * dn[:, 2]) + k[3] * dn[:, 0] + k[4] * dn[:, 1] + k[5] * dn[:, 2]
    qc = k[0] * Cm[0] ** 2 + k[1] * Cm[1] ** 2 + k[2] * Cm[2] ** 2 + k[3] * Cm[0] + k[4] * Cm[1] + k[5] * Cm[2] - 1
    disc = qb * qb - 4 * qa * qc; ok = disc > 0
    t = np.where(ok, (-qb - np.sqrt(np.clip(disc, 0, None))) / (2 * qa), ln)
    t = np.where(np.abs(t - ln) < 0.08, t, ln)                 # no hit / far hit -> keep
    d = np.clip(t - ln, -clamp, clamp)
    newlen = ln + w * d
    V2 = V.copy(); V2[vs] = Cm + dn * newlen[:, None]
    if verbose:
        semi = 1 / np.sqrt(np.abs(k[:3]))
        print("FACE ellipsoid fit: semi-axes (m)", semi.round(3), "| hits", int(ok.sum()), "/", len(ok))
        for nm, ff in (("eyes", np.nonzero(FMAT == 1)[0]), ("mouth", np.nonzero(FMAT == 2)[0])):
            c0 = face_cos(V, F, ff, Cm); c1 = face_cos(V2, F, ff, Cm)
            print("FACE %s cos min %.2f -> %.2f, <0.5: %d -> %d, <0.7: %d -> %d" % (nm, c0.min(), c1.min(), (c0 < 0.5).sum(), (c1 < 0.5).sum(), (c0 < 0.7).sum(), (c1 < 0.7).sum()))
        print("FACE move mm: max %.1f mean %.1f (clamp %d mm)" % (np.abs(newlen - ln).max() * 1000, np.abs(newlen - ln).mean() * 1000, clamp * 1000))
    return V2


def flatten_cheeks(V, F, FMAT, lab, spots=((600.0, 468.0), (480.0, 468.0)), radii=(46.0, 30.0), amt=0.7, verbose=True):
    """blush areas: depth blended toward a front-facing plane (const depth along the f001 view) so the cheek facets
    face the front: at 3/4 views the blush foreshortens instead of stretching into a band"""
    from cam import project
    D = np.load("ref/final_tex.npz", allow_pickle=True); cam = json.loads(str(D["cam"])); A = D["alphas"]
    C, R, U, Fw = basis(cam); Cm = C @ rotz(A[0])
    vs = np.unique(F[FMAT > 0]); px, py, pz = project(V[vs], cam, A[0])
    comp = np.unique(lab[F[FMAT > 0][:, 0]]); cf = np.isin(lab[F[:, 0]], comp)
    rim = np.intersect1d(np.unique(F[cf & (FMAT == 0)]), vs)
    V2 = V.copy(); dr = V[vs] - Cm; f0 = np.nonzero(FMAT == 1)[0]; c0 = face_cos(V, F, f0, Cm)
    for (ex, ey) in spots:
        r = np.hypot((px - ex) / radii[0], (py - ey) / radii[1]); w = np.clip(1 - r, 0, 1) ** 0.7 * amt
        w[np.isin(vs, rim)] = 0
        if not (w > 0).any(): continue
        zt = (pz[w > 0] * w[w > 0]).sum() / w[w > 0].sum() - 0.002          # flat, a hair forward of the mean depth
        znew = pz + w * (zt - pz)
        V2[vs] = Cm + (V2[vs] - Cm) * (znew / pz)[:, None]; pz = znew
    if verbose:
        c1 = face_cos(V2, F, f0, Cm); print("FACE cheeks flattened: eye-mat cos<0.7 %d -> %d" % ((c0 < 0.7).sum(), (c1 < 0.7).sum()))
    return V2
