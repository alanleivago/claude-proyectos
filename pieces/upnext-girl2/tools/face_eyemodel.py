"""Her eye, split into layers from her own f001 pixels (cell space of face_eyes, 256x128), so new expressions are made by
moving HER pixels (integer shifts, no resampling) instead of drawing a generic anime eye.
  eye_layers(E0) -> list of 2 dicts (screen-left eye, screen-right eye):
     box, cols (opening columns), U/L (opening top / bottom row per column), iris (cx, cy, r, sprite rgb + mask),
     up/lo (upper / lower outline: rgb + mask, full cell size), skin colour
  brow_layers(E0) -> 2 dicts: mask, rgb, hair fill
"""
import numpy as np
from scipy import ndimage as nd

LUM = np.array([0.3, 0.59, 0.11])


def lum(a): return a @ LUM


def _skin(E0):
    reg = E0[60:75, 60:200].reshape(-1, 3); return np.median(reg, 0)


def eye_boxes(E0):
    L = lum(E0); ink = (L < 75) & ((E0[..., 0] - E0[..., 2]) < 30)
    ink[:28] = False; ink[66:] = False
    lab, n = nd.label(nd.binary_dilation(ink, iterations=3)); sl = nd.find_objects(lab)
    big = sorted([s for s in sl if (s[1].stop - s[1].start) > 25], key=lambda s: -(s[0].stop - s[0].start) * (s[1].stop - s[1].start))[:2]
    big = sorted(big, key=lambda s: s[1].start)
    return [(s[1].start + 2, s[0].start + 2, s[1].stop - 2, s[0].stop - 2) for s in big]   # x0 y0 x1 y1 of the ink


def eye_layers(E0):
    SK = _skin(E0); L = lum(E0); sat = E0.max(-1) - E0.min(-1)
    ink = (L < 100) & (((E0[..., 0] - E0[..., 2]) < 45) | (L < 30))
    scl = (L > 150) & (sat < 32)
    teal = (E0[..., 1] > E0[..., 0] + 4) & (L > 70) & (L < 225)
    out = []
    for (x0, y0, x1, y1) in eye_boxes(E0):
        d = dict(box=(x0, y0, x1, y1))
        # ---- iris: teal blob -> its black ring; circle from the ring's outer edge on the left / right / bottom
        tm = teal.copy(); tm[:, :x0] = False; tm[:, x1:] = False; tm[:y0] = False; tm[y1:] = False
        lab, n = nd.label(tm); sizes = nd.sum(tm, lab, range(1, n + 1)); tm = lab == (1 + int(np.argmax(sizes)))
        ty, tx = np.nonzero(tm)
        pts = []
        for y in range(ty.min(), ty.max() + 1):
            xs = tx[ty == y]
            if not len(xs): continue
            xl = xs.min() - 1
            while xl > x0 and ink[y, xl]: xl -= 1
            xr = xs.max() + 1
            while xr < x1 and ink[y, xr]: xr += 1
            pts += [(xl + 0.5, y), (xr - 0.5, y)]
        for x in range(tx.min(), tx.max() + 1):
            ys = ty[tx == x]
            yb = ys.max() + 1
            while yb < y1 and ink[yb, x]: yb += 1
            pts.append((x, yb - 0.5))
        P = np.array(pts, float)
        A = np.c_[2 * P[:, 0], 2 * P[:, 1], np.ones(len(P))]; b = (P ** 2).sum(1)
        cx, cy, c = np.linalg.lstsq(A, b, rcond=None)[0]; r = float(np.sqrt(c + cx * cx + cy * cy))
        yy, xx = np.mgrid[0:E0.shape[0], 0:E0.shape[1]]
        disc = (xx + 0.5 - (cx + 0.5)) ** 2 + (yy + 0.5 - (cy + 0.5)) ** 2 <= (r + 0.15) ** 2
        # ---- opening = the sclera blobs (4-connected, walled by her ink) + the iris disc under a smooth lid curve
        sc = scl & ~ink; sc[:y0] = False; sc[y1:] = False; sc[:, :x0] = False; sc[:, x1:] = False
        lab, n = nd.label(sc)
        keep = [k for k in range(1, n + 1) if ((lab == k) & (L > 238)).sum() >= 4]
        Or = np.isin(lab, keep)
        U = {}; Lo = {}
        for x in range(x0, x1):
            ys = np.nonzero(Or[:, x])[0]
            if not len(ys): continue
            Lo[x] = int(ys.max()); top = int(ys.min())
            dcol = np.nonzero(disc[:, x])[0]
            if not len(dcol) or top < dcol.min(): U[x] = top
        ix0, ix1 = int(np.floor(cx - r)), int(np.ceil(cx + r))
        for x in range(ix0, ix1 + 1):
            if x0 <= x < x1 and x not in Lo:
                dcol = np.nonzero(disc[:, x])[0]
                if len(dcol): Lo[x] = int(dcol.max())
        xs = np.array(sorted(Lo)); ux = np.array(sorted(U))
        cu = np.polyfit(ux, [U[x] for x in ux], 2)
        cl = np.polyfit(xs, [Lo[x] for x in xs], 2)
        Ux = {x: (U[x] if x in U else int(round(np.polyval(cu, x)))) for x in xs}
        d.update(cols=xs, U=Ux, L=Lo, ucoef=cu, lcoef=cl)
        # ---- opening mask, outline = everything else that is not skin in the eye box
        O = np.zeros(L.shape, bool)
        for x in xs: O[Ux[x]:Lo[x] + 1, x] = True
        nonskin = np.abs(E0 - SK).sum(-1) > 40
        HAIR = np.median(E0[30:60, 48:52].reshape(-1, 3), 0)
        hairish = (np.abs(E0 - HAIR).sum(-1) < 45) & ~ink
        bx = np.zeros(L.shape, bool); bx[y0 - 3:y1 + 3, x0 - 1:x1 + 2] = True
        aa = nd.binary_dilation(ink & bx, iterations=1) & (np.abs(E0 - SK).sum(-1) > 18) & ~hairish
        eye = ((ink | aa) & bx) | O
        outl = eye & ~O
        mid = {x: (Ux[x] + Lo[x]) / 2 for x in xs}
        M = np.full(L.shape[1], np.nan)
        for x in range(L.shape[1]): M[x] = mid[x] if x in mid else mid[xs[0]] if x < xs[0] else mid[xs[-1]]
        disc07 = (xx - cx) ** 2 + (yy - cy) ** 2 <= (r + 0.7) ** 2
        stray = O & ink & ~disc07                              # ink inside the opening, outside the fitted iris circle:
        iris_x = stray & ((xx - cx) ** 2 + (yy - cy) ** 2 <= (r + 3.5) ** 2) & (yy <= cy)   # the iris' black top (moves with it)
        outl = outl | (stray & ~iris_x)                        # lash pixels reaching into the opening
        up = outl & (yy < M[None, :]); lo = outl & ~up
        d.update(O=O, eye=eye, up=up, lo=lo, M=M)
        d["iris"] = dict(cx=float(cx), cy=float(cy), r=r, disc=disc, extra=iris_x)
        out.append(d)
    return out, SK


def brow_layers(E0):
    L = lum(E0); br = (L < 125) & ((E0[..., 0] - E0[..., 2]) > 35); br[:12] = False; br[27:] = False
    out = []
    for (x0, y0, x1, y1) in eye_boxes(E0):
        m = br.copy(); m[:, :x0 - 4] = False; m[:, x1 + 4:] = False
        lab, n = nd.label(m); sizes = nd.sum(m, lab, range(1, n + 1)); m = np.isin(lab, 1 + np.nonzero(sizes > 6)[0])
        out.append(dict(mask=m))
    return out


# ----------------------------------------------------------------------------------------------- rendering
INK = np.array([12., 1., 0.])            # her blink / closed-lid stroke colour (f030)
SS = 4


def _shift_cols(img, mask, dcol, canvas, cmask=None):
    """paste img[mask] into canvas moved down by dcol[x] (int per column, + = down)"""
    ys, xs = np.nonzero(mask)
    ny = ys + dcol[xs]
    ok = (ny >= 0) & (ny < canvas.shape[0])
    canvas[ny[ok], xs[ok]] = img[ys[ok], xs[ok]]
    if cmask is not None: cmask[ny[ok], xs[ok]] = True


def cover(draw_fn, shape, ss=SS):
    """coverage (0..1) of shapes drawn by draw_fn(ImageDraw, ss) on a ss-times canvas, box-filtered back"""
    from PIL import Image, ImageDraw
    H, W = shape
    im = Image.new("L", (W * ss, H * ss), 0); draw_fn(ImageDraw.Draw(im), ss)
    return np.asarray(im.resize((W, H), Image.BOX)).astype(np.float32) / 255.0


def ink_paint(canvas, cov, col, hard=0.5, soft=0.22):
    """her line style: solid where coverage >= hard, one soft step (50 % mix) between soft and hard (like her AA)"""
    full = cov >= hard; half = (cov >= soft) & ~full
    canvas[full] = col
    canvas[half] = canvas[half] * 0.5 + np.asarray(col, float) * 0.5
    return full | half


def skin_field(E0, exclude, SK, sigma=2.5):
    """smooth skin colour everywhere: normalized Gaussian of the skin pixels outside `exclude`, coarser scales where
    the fine one has no support (inside the erased eyes)"""
    from scipy import ndimage as nd
    ok = (~nd.binary_dilation(exclude, iterations=2)) & (np.abs(E0 - SK).sum(-1) < 30)
    out = np.tile(np.asarray(SK, np.float32), E0.shape[:2] + (1,)); done = np.zeros(E0.shape[:2], bool)
    for sg in (sigma, 5.0, 10.0, 20.0):
        w = nd.gaussian_filter(ok.astype(np.float32), sg)
        val = np.stack([nd.gaussian_filter(E0[..., c] * ok, sg) for c in range(3)], -1) / (w[..., None] + 1e-6)
        m = (~done) & (w > 0.12); out[m] = val[m]; done |= m
    return out


class Eye:
    def __init__(self, E0, d, SK, skf, blink_img=None):
        self.E0 = E0; self.d = d; self.SK = SK; self.SKF = skf; self.blink = blink_img
        x0, y0, x1, y1 = d["box"]
        self.xs = d["cols"]; self.U = np.array([d["U"][x] for x in self.xs]); self.L = np.array([d["L"][x] for x in self.xs])
        self.inner_right = d["box"][0] < E0.shape[1] / 2            # screen-left eye: inner corner on its right
        # sclera image with the iris removed (row-wise fill from the sclera pixels left / right of the iris)
        I = d["iris"]; S = E0.copy()
        yy, xx = np.mgrid[0:E0.shape[0], 0:E0.shape[1]]
        big = (xx - I["cx"]) ** 2 + (yy - I["cy"]) ** 2 <= (I["r"] + 1.3) ** 2
        Lm = lum(E0); sclc = (Lm > 185) & ((E0.max(-1) - E0.min(-1)) < 25)
        from scipy import ndimage as nd
        near_ink = nd.binary_dilation(lum(E0) < 100, iterations=1)
        scl_ok = d["O"] & ~big & sclc & ~near_ink
        for y in range(y0 - 2, y1 + 3):                     # her sclera is split in horizontal tones: row median
            row = np.nonzero(scl_ok[y])[0]
            todo = np.nonzero(d["O"][y] & (big[y] | ~sclc[y] | near_ink[y]) & ~(d["O"][y] & ~big[y] & sclc[y] & ~near_ink[y]))[0]
            if not len(todo): continue
            if len(row) >= 4: col = np.median(E0[y, row], 0)
            else:
                ys_ = [yy_ for yy_ in range(y - 4, y + 5) if scl_ok[yy_].sum() >= 4]
                if not ys_: continue
                yb = min(ys_, key=lambda v: abs(v - y)); col = np.median(E0[yb, np.nonzero(scl_ok[yb])[0]], 0)
            S[y, todo] = col
        self.SCL = S
        # iris sprite (disc), hidden top (above the lid) = her black ring / pupil shadow
        sp = E0.copy(); Ufull = np.full(E0.shape[1], 999)
        for x, u in zip(self.xs, self.U): Ufull[x] = u
        yy, xx = np.mgrid[0:E0.shape[0], 0:E0.shape[1]]
        hidden = I["disc"] & (yy < Ufull[None, :])
        sp[hidden] = np.array([2., 1., 1.])
        self.IRIS = sp
        self.disc = (((xx - I["cx"]) ** 2 + (yy - I["cy"]) ** 2 <= (I["r"] + 0.7) ** 2) & ~(sclc & ~I["disc"])) | I["extra"]
        # erase mask: eye + leftover AA ring
        from scipy import ndimage as nd
        ring = nd.binary_dilation(d["eye"], iterations=2) & (np.abs(E0 - skf).sum(-1) > 8) & (lum(E0) > 120)
        self.erase = d["eye"] | ring

    def s_of(self, x):
        """0 at the inner corner, 1 at the outer corner"""
        a, b = self.xs[0], self.xs[-1]; t = (x - a) / max(1, b - a)
        return 1 - t if self.inner_right else t

    def render(self, canvas, lid=(0.0, 0.0), raise_px=0.0, low=0.0, gaze=(0, 0), iris_fn=None, closed=None, lash_flick=False):
        """lid=(t_inner, t_outer): lower the upper lid by that fraction of the opening height at the inner / outer end
        raise_px: lift the upper lid (arched) by up to that many px; low: push the lower lid up (fraction, arched)
        gaze: iris offset px; iris_fn(canvas, cx, cy, r, clip): custom iris; closed: None | 'blink' | 'happy' | 'relaxed'"""
        E0, d = self.E0, self.d; H, W = E0.shape[:2]
        canvas[self.erase] = self.SKF[self.erase]
        x0, y0, x1, y1 = d["box"]
        if closed:
            return self._closed(canvas, closed, lash_flick)
        s = np.array([self.s_of(x) for x in self.xs]); h = (self.L - self.U).astype(float)
        dl = (lid[0] * (1 - s) + lid[1] * s) * h
        arch = 4 * s * (1 - s)
        dl = dl - raise_px * arch
        de = low * h * np.clip(arch * 1.3, 0, 1)
        dU = np.round(dl).astype(int); dL = np.round(de).astype(int)
        Un = self.U + dU; Ln = np.maximum(self.L - dL, Un)
        dcol_u = np.zeros(W, int); dcol_l = np.zeros(W, int)
        for x, a, b in zip(self.xs, dU, dL): dcol_u[x] = a; dcol_l[x] = -b
        dcol_u[:self.xs[0]] = dU[0]; dcol_u[self.xs[-1] + 1:] = dU[-1]; dcol_l[:self.xs[0]] = -dL[0]; dcol_l[self.xs[-1] + 1:] = -dL[-1]
        # opening: sclera (shadow band follows the lid), then iris clipped to it
        On = np.zeros((H, W), bool)
        for i, x in enumerate(self.xs):
            if Ln[i] <= Un[i]: continue
            for y in range(Un[i], Ln[i] + 1):
                sy = int(np.clip(y - dU[i], self.U[i], self.L[i])); canvas[y, x] = self.SCL[sy, x]; On[y, x] = True
        I = d["iris"]; gx, gy = int(gaze[0]), int(gaze[1])
        if iris_fn is None:
            self._paste_iris(canvas, gx, gy, On)
        else:
            iris_fn(canvas, I["cx"] + gx, I["cy"] + gy, I["r"], On)
        # her outlines on top, moved with the lids
        _shift_cols(E0, d["lo"], dcol_l, canvas)
        _shift_cols(E0, d["up"], dcol_u, canvas)
        return On

    def _paste_iris(self, canvas, gx, gy, On):
        H, W = canvas.shape[:2]
        ys, xs_ = np.nonzero(self.disc); ny, nx = ys + gy, xs_ + gx
        ok = (ny >= 0) & (ny < H) & (nx >= 0) & (nx < W)
        ys, xs_, ny, nx = ys[ok], xs_[ok], ny[ok], nx[ok]
        m = On[ny, nx]; canvas[ny[m], nx[m]] = self.IRIS[ys[m], xs_[m]]

    def _closed(self, canvas, kind, flick):
        d = self.d; x0, y0, x1, y1 = d["box"]; H, W = canvas.shape[:2]
        if kind == "blink" and self.blink is not None:
            m = self.blink_mask; canvas[m] = self.blink[m]; return None
        xa, xb = self.xs[0] - 2, self.xs[-1] + 1
        base = float(np.median(self.L)) - 2.5
        inner = xb if self.inner_right else xa; outer = xa if self.inner_right else xb

        def path(t):                                # t 0 = outer corner .. 1 = inner corner
            x = outer + (inner - outer) * t
            if kind == "happy": y = base - 1.0 - 6.0 * np.sin(np.pi * (0.08 + 0.84 * t))
            else: y = base - 0.3 + 2.6 * np.sin(np.pi * t)        # relaxed: gentle downward curve
            return x, y

        def draw(dr, ss):
            pts = [path(t) for t in np.linspace(0, 1, 40)]
            for i in range(len(pts) - 1):
                t = i / (len(pts) - 1); w = 3.0 + 1.6 * t          # thicker toward the inner corner (her blink line)
                (xa_, ya_), (xb_, yb_) = pts[i], pts[i + 1]
                dr.line([(xa_ * ss, ya_ * ss), (xb_ * ss, yb_ * ss)], fill=255, width=int(w * ss))
                r = w * ss / 2; dr.ellipse([xb_ * ss - r, yb_ * ss - r, xb_ * ss + r, yb_ * ss + r], fill=255)
            if flick:                                   # one short lash flick off the outer end, like her open-eye flick
                xo, yo = pts[0]; sgn = -1 if self.inner_right else 1
                v = -1 if kind == "happy" else 1           # happy: lashes up-out; relaxed (lid down): lashes down-out
                dr.line([(xo * ss, yo * ss), ((xo + sgn * 3.5) * ss, (yo + v * 3.0) * ss)], fill=255, width=int(2.2 * ss))
                xo2, yo2 = pts[4]
                dr.line([(xo2 * ss, (yo2 + v * 0.5) * ss), ((xo2 + sgn * 2.0) * ss, (yo2 + v * 4.0) * ss)], fill=255, width=int(1.8 * ss))
        cov = cover(draw, (H, W)); ink_paint(canvas, cov, INK)
        return None


class Brow:
    """her brow stroke (dark brown over the bangs' bottom edge); erase = hair colour from just above, redraw shifted"""
    def __init__(self, E0, m, inner_right):
        self.E0 = E0; self.m = m; self.inner_right = inner_right
        ys, xs = np.nonzero(m); self.xa, self.xb = xs.min(), xs.max()
        from scipy import ndimage as nd
        self.er = nd.binary_dilation(m, iterations=1) & (lum(E0) < 150)
        fill = E0.copy()
        for x in range(self.xa - 2, self.xb + 3):
            col = np.nonzero(self.er[:, x])[0]
            if not len(col): continue
            y = col.min() - 1
            while y > 0 and self.er[y, x]: y -= 1
            src = E0[max(y - 1, 0):y + 1, x].mean(0)
            fill[col, x] = src
        self.fill = fill

    def render(self, canvas, dy_in=0.0, dy_out=0.0, arch=0.0, dx=0):
        canvas[self.er] = self.fill[self.er]
        ys, xs = np.nonzero(self.er)
        t = (xs - self.xa) / max(1, self.xb - self.xa); t = 1 - t if self.inner_right else t   # 0 inner .. 1 outer
        dy = np.round(dy_in + (dy_out - dy_in) * t - arch * 4 * t * (1 - t)).astype(int)
        ny = ys + dy; nx = xs + dx
        ok = (ny >= 0) & (ny < canvas.shape[0])
        src = self.E0[ys[ok], xs[ok]]
        keep = lum(src) < 140                                  # only the brow ink, not the hair around it
        canvas[ny[ok][keep], nx[ok][keep]] = src[keep]
