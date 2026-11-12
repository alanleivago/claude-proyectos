"""Kit v5 + Flow clothes (2026-11-12, user: "las ropas con imagenes de Flow, realmente low poly como el perro").
The garment areas painted by garments.paint() (its masks: necklines, sleeves, hems) are re-coloured with the Flow
outfit sheet itself (front | right profile | back, sheet_bleed.png + sheet.json from prep_human.py), projected on the
rest-pose low-poly body like the dog's photo bake: colour depends only on the 3D point + normal, so UV seams cannot show.
  - torso / legs: front view along -Y, back view along +Y, profile along X, cross-faded by the surface normal;
    horizontal scale fitted per region (chest width, leg spacing, torso depth) so the photo's seams sit on the mesh;
  - arms: mapped along the sheet's own arm line (A-pose angle may differ from the rig's): t (shoulder -> wrist) +
    the offset across the arm, front view for the front half, back view for the back half;
  - each region keeps the procedural garment's mean colour (the photo is matched to it, small lighting drift only)."""
import numpy as np


def _centre_run(runs, row, cx):
    rs = runs[int(np.clip(row, 0, len(runs) - 1))]
    if not rs:
        return None
    inside = [r for r in rs if r[0] <= cx <= r[1]]
    r = inside[0] if inside else min(rs, key=lambda r: min(abs(r[0] - cx), abs(r[1] - cx)))
    return r


class View:
    def __init__(self, v, H):
        self.v = v; self.y0, self.y1 = v["y0"], v["y1"]; self.runs = v["runs"]
        self.s = (self.y1 - self.y0) / H                                     # px per metre
        hp = self.y1 - self.y0; bx = (v["x0"] + v["x1"]) / 2
        cs = []
        for r in range(self.y0 + int(0.03 * hp), self.y0 + int(0.09 * hp)):
            rr = _centre_run(self.runs, r, bx)
            if rr:
                cs.append((rr[0] + rr[1]) / 2)
        self.cx = float(np.median(cs)) if cs else bx

    knots = None                                                          # [(z, row)] piecewise vertical fit
    r_neck = None

    def row(self, z):
        if self.knots:
            zs, rs = zip(*sorted(self.knots))
            zs, rs = np.array(zs), np.array(rs)
            zz = np.asarray(z, float)
            r = np.interp(zz, zs, rs)
            hi = zz > zs[-1]
            return np.where(hi, rs[-1] - (zz - zs[-1]) * self.s, r) if np.ndim(zz) else (rs[-1] - (zz - zs[-1]) * self.s if hi else r)
        return self.y1 - z * self.s

    def fit_rows(self, img, top_c, bot_c, z_neck, z_hem):
        """find the photo's neckline row (skin -> top colour) and hem row (top -> bottom colour) on the centre line,
        and pin them to the mesh's z_neck / z_hem (feet stay at y1 <-> z 0)."""
        hp = self.y1 - self.y0; w = max(2, int(0.03 * self.s))
        rows = np.arange(self.y0 + int(0.13 * hp), self.y0 + int(0.62 * hp))
        c = np.array([img[r, int(self.cx) - w:int(self.cx) + w].mean(0) for r in rows])
        dt = np.linalg.norm(c - top_c, axis=1); db = np.linalg.norm(c - bot_c, axis=1)
        is_top = (dt < 0.6 * db) & (dt < 45)
        k_ = max(3, int(0.02 * hp))                                       # a real stretch, not a beard / hair row
        is_top = np.convolve(is_top.astype(float), np.ones(k_), "same") >= k_ - 0.5
        if is_top.sum() < 10:
            return
        i0 = int(np.argmax(is_top))                                       # first top row = the neckline
        # the hem: the first real stretch of the BOTTOM colour below the neckline (a belt / dark band stays above it)
        is_bot = db < 0.6 * dt
        is_bot = np.convolve(is_bot.astype(float), np.ones(k_), "same") >= k_ - 0.5
        below = np.where(is_bot[i0:])[0]
        if not len(below):
            return
        r_neck, r_hem = float(rows[i0]), float(rows[i0 + below[0]] - k_ / 2)
        if r_hem - r_neck < 0.1 * hp:
            return
        self.knots = [(0.0, float(self.y1)), (z_hem, r_hem), (z_neck, r_neck)]; self.r_neck = r_neck

    def width(self, z):
        r = _centre_run(self.runs, self.row(z), self.cx)
        return (r[1] - r[0]) if r else None

    def arm_line(self, side_img, z0, z1):
        """centre of the arm run (the outermost separate run on image side side_img=+1 right / -1 left) for rows
        between z0 (shoulder) and z1 (wrist) -> least-squares col = a*row + b."""
        pts = []
        for r in range(int(self.row(z0)), int(self.row(z1)) + 1):
            rs = self.runs[int(np.clip(r, 0, len(self.runs) - 1))]
            if len(rs) < 2:
                continue
            rr = max(rs, key=lambda q: side_img * (q[0] + q[1]))
            c = (rr[0] + rr[1]) / 2
            if side_img * (c - self.cx) > 0.12 * self.s:                  # really away from the torso
                pts.append((r, c))
        if len(pts) < 6:
            return None
        P = np.array(pts, float)
        a, b = np.polyfit(P[:, 0], P[:, 1], 1)
        return a, b


def _sample(img, col, row):
    h, w, _ = img.shape
    c = np.clip(np.round(col).astype(int), 0, w - 1); r = np.clip(np.round(row).astype(int), 0, h - 1)
    return img[r, c]


def _clamp_in(V, col, row, inset=4, body=False):
    """move each sample inside the silhouette run nearest to it on its row (no magenta bleed, no hands next to the thigh)."""
    col = col.copy(); rr = np.clip(np.round(row).astype(int), 0, len(V.runs) - 1)
    for r in np.unique(rr):
        rs = V.runs[r]
        if not rs:
            continue
        m = rr == r; c = col[m]
        A = np.array(rs, float)
        if body and len(A) >= 3:                                          # drop the arms / hands beside the torso / thighs
            keep = np.ones(len(A), bool)
            for j in (0, len(A) - 1):
                if A[j, 1] - A[j, 0] < 0.10 * V.s:
                    keep[j] = False
            A = A[keep]
        mid = A.mean(1)
        inside = (c[:, None] >= A[None, :, 0]) & (c[:, None] <= A[None, :, 1])
        near = np.argmin(np.abs(c[:, None] - mid[None, :]) - 1e6 * inside, 1)
        lo, hi = A[near, 0] + inset, A[near, 1] - inset
        col[m] = np.where(hi > lo, np.clip(c, lo, hi), mid[near])
    return col


def project(tex, pos, nrm, cov, sheet, SJ, L, H, CO, REG):
    """tex (S,S,3) from garments.paint (its masks in garments.paint.masks), pos/nrm rest maps, sheet (h,w,3) 0..255
    (sheet_bleed.png), SJ = sheet.json, L = landmarks, H = height, CO/REG = rest vertices + regions."""
    import garments as GA
    M = GA.paint.masks; cloth = M["cloth"] & cov; t = M["t"]
    F, Sd, Bk = (View(SJ["views"][k], H) for k in ("front", "side", "back"))
    x, y, z = pos[..., 0], pos[..., 1], pos[..., 2]
    nx, ny = nrm[..., 0], nrm[..., 1]
    K = L["K"]; out = tex.copy()
    # mesh neckline / hem on the front centre line (from the procedural masks), pinned to the photo's
    cen = cov & M["torso"] & (np.abs(x) < 0.03 * K)
    tf, tb = cen & M["top"] & M["front"], cen & M["top"] & ~M["front"]
    if tf.sum() > 5:
        for V, tm in ((F, tf), (Bk, tb if tb.sum() > 5 else tf)):
            V.fit_rows(sheet, M["tc"], M["bc"], float(z[tm].max()), float(z[tm].min()))

    # ---- horizontal fits (mesh metres -> sheet px)
    tor = CO[REG == "torso"]; zc = L["sh"] - 0.22 * K
    sel = tor[np.abs(tor[:, 2] - zc) < 0.02]
    hw = np.abs(sel[:, 0]).max() if len(sel) else 0.16 * K
    dep = (sel[:, 1].max() - sel[:, 1].min()) if len(sel) else 0.22 * K
    kx = np.clip((F.width(zc) or 2 * hw * F.s) / (2 * hw * F.s), 0.7, 1.4)
    kxb = np.clip((Bk.width(zc) or 2 * hw * Bk.s) / (2 * hw * Bk.s), 0.7, 1.4)
    ky = np.clip((Sd.width(zc) or dep * Sd.s) / (dep * Sd.s), 0.7, 1.4)
    yc = L["yc"](z)

    body = cloth & ~M["arm"]
    # front / back only (the profile photo has the arm in front of the body); sideways texels blend both, sampled
    # just inside the silhouette (as the dog's bake)
    wF = 0.5 + 0.5 * np.clip(-ny / 0.35, -1, 1); wB = 1 - wF
    proj = np.zeros_like(tex)
    for V, colf, w_ in ((F, lambda: F.cx + x * F.s * kx, wF), (Bk, lambda: Bk.cx - x * Bk.s * kxb, wB)):
        m = body & (w_ > 0.001)
        if not m.any():
            continue
        cc, rw = colf()[m], V.row(z[m])
        if V.r_neck is not None:                                          # never sample the photo's neck skin above its collar
            rw = np.maximum(rw, V.r_neck + 0.035 * V.s)
        proj[m] += _sample(sheet, _clamp_in(V, cc, rw, 4, True), rw) * w_[m][:, None]

    # ---- arms along the sheet's arm line
    arm = cloth & M["arm"]
    for s, sx in (("L", 1), ("R", -1)):
        a0, a1 = np.array(L["arm"][s][0]), np.array(L["arm"][s][1])
        m = arm & ((x > 0) if s == "L" else (x < 0))
        if not m.any():
            continue
        for V, side_img, mirror, half in ((F, sx, sx, ny <= 0), (Bk, -sx, -sx, ny > 0)):
            ln = V.arm_line(side_img, a0[2], a1[2])
            mm = m & half
            if ln is None or not mm.any():
                continue
            aa, bb = ln
            r0, r1 = V.row(a0[2]), V.row(a1[2])
            p0 = np.array([aa * r0 + bb, r0]); p1 = np.array([aa * r1 + bb, r1])   # (col,row)
            d_img = p1 - p0; perp_img = np.array([d_img[1], -d_img[0]]) / (np.linalg.norm(d_img) + 1e-6)
            e = np.array([a1[0] - a0[0], a1[2] - a0[2]]); e /= np.linalg.norm(e)
            perp_m = np.array([e[1], -e[0]])
            tt = np.clip(t[mm], 0, 1)
            sl = float(M["sleeve"])
            if sl < 0.9:                                                  # pin the photo's sleeve end to the mesh's
                ts = np.linspace(0, 1, 60); Pl = p0[None, :] + ts[:, None] * d_img[None, :]
                cl = _sample(sheet, Pl[:, 0], Pl[:, 1])
                ist = np.linalg.norm(cl - M["tc"], axis=1) < 0.6 * np.linalg.norm(cl - np.median(cl[-15:], 0), axis=1)
                if ist[:4].any():
                    k0 = int(np.argmax(ist)); k1 = k0
                    while k1 + 1 < len(ts) and ist[k1 + 1]:
                        k1 += 1
                    sp = float(ts[k1])
                    if 0.15 < sp < 0.9:
                        tt = np.where(tt < sl, tt * sp / sl, sp + (tt - sl) * (1 - sp) / max(1 - sl, 1e-3))
            axp = a0[None, :] + np.clip(t[mm], 0, 1)[:, None] * (a1 - a0)[None, :]
            u = (x[mm] - axp[:, 0]) * perp_m[0] + (z[mm] - axp[:, 2]) * perp_m[1]
            # image: col = mirror * x, row = -z -> the mesh perpendicular seen in the image; orient the sheet's the same way
            pm_img = np.array([mirror * perp_m[0], -perp_m[1]])
            if pm_img @ perp_img < 0:
                perp_img = -perp_img
            P = p0[None, :] + tt[:, None] * d_img[None, :] + (u * V.s)[:, None] * perp_img[None, :]
            proj[mm] = _sample(sheet, _clamp_in(V, P[:, 0], P[:, 1], 2), P[:, 1])

    # ---- photo texels that are skin (the photo's neckline / sleeve ends differ from the mesh masks) or background keep
    # the procedural garment colour
    bare = cov & M["arm"] & ~cloth & (t < 0.95)
    refs = [np.median(tex[bare], 0)] if bare.sum() > 20 else []
    hp = F.y1 - F.y0                                                    # + the photo's own skin: the face on the sheet
    face = sheet[F.y0 + int(0.06 * hp):F.y0 + int(0.10 * hp), int(F.cx - 0.03 * F.s):int(F.cx + 0.03 * F.s)].reshape(-1, 3)
    if len(face):
        refs.append(np.median(face, 0))
    bad = (proj[..., 0] > proj[..., 1] + 50) & (proj[..., 2] > proj[..., 1] + 50)            # magenta
    for sr in refs:
        ds = np.linalg.norm(proj - sr, axis=-1)
        bad |= (ds < 60) & (ds < 0.8 * np.linalg.norm(proj - tex, axis=-1))
    use = cloth & ~bad
    out[use] = proj[use]
    return np.clip(out, 0, 255)
