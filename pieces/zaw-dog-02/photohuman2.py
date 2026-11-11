"""Low-poly PS1 humans built ENTIRELY from photos (VLVT guide method, fuentes/blender-lowpoly/vlvt-guide.md).
Input: one Flow sheet per person, the same person three times on flat magenta - front, right profile (facing right), back -
in an A-pose (arms straight, ~40 deg down, not touching the body).
1) venv:    python photohuman.py prep <name> <sheet.jpg> <height_m>   -> tex/people2/<name>.json + _body.png + _head.png
   reads the silhouettes row by row: width per height (front), depth per height (side), the crotch / armpit / neck rows,
   each arm's axis and thickness; makes the PS1 atlases (front | side | back, body 256 px tall, head 128 px, 48 colours).
2) Blender: PhotoPerson(name) -> lofted low-poly blocks (head+torso 8 sides, legs 6, arms 6 along their own axis), each
   face textured by projecting the view it faces (front / back / side; arms take the front view on their sides), Closest.
   Simple rig (hips, chest, neck, head, upperarm, forearm, hand, thigh, shin, foot); the A-pose arms are brought down in
   the rest pose, so poses written for arms-down people still work. Same API as people3d.Person."""
import json, math, os, sys
import numpy as np

H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "tex", "people3")


# ---------------------------------------------------------------------------------------------- venv: analyse the sheet
def _mask(a):
    r, g, b = (a[..., i].astype(int) for i in range(3))
    bg = (r > 150) & (b > 150) & (g < 130) & (np.abs(r - b) < 90)
    mx = np.maximum(np.maximum(r, b), g) + 1                      # zaw-dog-02: Flow's magenta floor gradient + soft shadows
    bg |= ((r - g) / mx > 0.42) & ((b - g) / mx > 0.30)            # (magenta hue at any brightness)
    return ~bg


def _runs(row):
    xs = np.flatnonzero(row)
    if not len(xs):
        return []
    cuts = np.flatnonzero(np.diff(xs) > 2)
    st = np.r_[xs[0], xs[cuts + 1]]; en = np.r_[xs[cuts], xs[-1]]
    return [(int(a), int(b)) for a, b in zip(st, en) if b - a >= 2]


def prep(name, sheet, height):
    from PIL import Image
    from scipy import ndimage as nd
    os.makedirs(OUT, exist_ok=True)
    im = Image.open(sheet).convert("RGB"); A = np.asarray(im)
    M = nd.binary_opening(_mask(A), iterations=2)
    lab, n = nd.label(M); sizes = nd.sum(M, lab, range(1, n + 1))
    big = [i + 1 for i in np.argsort(sizes)[::-1][:3]]
    views = sorted(big, key=lambda i: np.flatnonzero((lab == i).any(0)).mean())
    V = {}
    for key, li in zip(("front", "side", "back"), views):
        m = nd.binary_fill_holes(lab == li)
        ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        V[key] = dict(m=m, y0=int(y0), y1=int(y1), x0=int(x0), x1=int(x1), s=height / (y1 - y0))
    F, S, B = V["front"], V["side"], V["back"]
    Hp = F["y1"] - F["y0"]
    zf = lambda y, v: (v["y1"] - y) * v["s"]                       # image row -> metres above the floor
    yrow = lambda z, v: int(round(v["y1"] - z / v["s"]))
    mid = (F["y0"] + F["y1"]) // 2
    cx = np.mean([(a + b) / 2 for a, b in _runs(F["m"][int(F["y0"] + 0.45 * Hp)]) if a < (F["x0"] + F["x1"]) / 2 < b] or [(F["x0"] + F["x1"]) / 2])

    def central(y):
        rs = _runs(F["m"][y]); c = [r for r in rs if abs((r[0] + r[1]) / 2 - cx) < 0.13 * Hp or r[0] <= cx <= r[1]]
        return rs, c
    # crotch (or coat hem): bottom-up, where the two legs merge into one run
    crotch = None; seen2 = False
    for y in range(F["y1"] - 3, mid - int(0.2 * Hp), -1):
        rs, c = central(y)
        if len(c) >= 2:
            seen2 = True
        elif seen2 and len(c) == 1:
            crotch = y; break
    # armpit: top-down, the first row with an arm run on each side of the torso
    armpit = None
    for y in range(F["y0"] + int(0.12 * Hp), mid):
        rs = _runs(F["m"][y])
        if len(rs) >= 3 and rs[0][1] < cx < rs[-1][0]:
            armpit = y; break
    # neck: the narrowest central run between the head and the shoulders
    ws = {y: (lambda c: c[0][1] - c[0][0] if c else 1e9)(central(y)[1]) for y in range(F["y0"] + int(0.115 * Hp), min(armpit, F["y0"] + int(0.19 * Hp)))}
    neck = min(ws, key=ws.get)
    chin = neck - int(0.015 * Hp)
    torso_w_arm = np.median([(lambda c: c[0][1] - c[0][0])(central(y)[1]) for y in range(armpit + 2, armpit + 8)])

    def side_run(z):
        y = min(max(yrow(z, S), S["y0"]), S["y1"]); rs = _runs(S["m"][y])
        if not rs:
            return None
        sc = (S["x0"] + S["x1"]) / 2
        return min(rs, key=lambda r: 0 if r[0] <= sc <= r[1] else min(abs(r[0] - sc), abs(r[1] - sc)))
    scx = np.median([(lambda r: (r[0] + r[1]) / 2)(side_run(z)) for z in np.linspace(0.5, 0.9, 9) * height if side_run(z)])
    rings = []                                                     # (z, cx, cy, half width, half depth)
    ztop, zc = zf(F["y0"], F), zf(crotch, F)
    for z in list(np.linspace(zc, zf(armpit, F), 6)[:-1]) + list(np.linspace(zf(armpit, F), zf(neck, F), 5)[:-1]) + \
            list(np.linspace(zf(neck, F), ztop - 0.012, 7)) + [ztop]:
        y = yrow(z, F); rs, c = central(y)
        if not c:
            continue
        a, b = min(r[0] for r in c), max(r[1] for r in c)
        if y < armpit and z < zf(neck, F) - 0.03:                   # shoulders: not the arms
            hw_cap = torso_w_arm * 0.55
            a, b = max(a, cx - hw_cap), min(b, cx + hw_cap)
        hw = (b - a) / 2 * F["s"]; xc = ((a + b) / 2 - cx) * F["s"]
        sr = side_run(z)
        hd, yc = (hw * 0.6, 0.0) if sr is None else ((sr[1] - sr[0]) / 2 * S["s"], -((sr[0] + sr[1]) / 2 - scx) * S["s"])
        hd = min(max(hd, 0.45 * hw), (1.35 if z > zf(neck, F) else 0.95) * hw)
        if z >= ztop - 1e-6:
            hw, hd = hw * 0.35, hd * 0.35
        rings.append([float(z), float(xc), float(yc), float(max(hw, 0.012)), float(max(hd, 0.012))])
    legs = {"L": [], "R": []}
    for z in [0.0, 0.035, 0.075] + list(np.linspace(0.12, zc + 0.03, 8)):   # shoe rings + leg; top ring tucked into the torso
        y = min(yrow(z, F), F["y1"] - 1); rs, c = central(y)
        c = sorted(c)
        if len(c) < 2:
            c = [(c[0][0], int(cx)), (int(cx), c[0][1])] if c else []
        if not c:
            continue
        sr = side_run(z)
        hd, yc = (0.06, 0.0) if sr is None else ((sr[1] - sr[0]) / 2 * S["s"], -((sr[0] + sr[1]) / 2 - scx) * S["s"])
        for side, r in (("R", c[0]), ("L", c[-1])):               # image left = the person's right
            hw = (r[1] - r[0]) / 2 * F["s"]
            if z < 0.12:
                hw = max(hw, 0.05)                                      # shoes: a real block, not a flat tab
            legs[side].append([float(z), float(((r[0] + r[1]) / 2 - cx) * F["s"]), float(yc), float(hw), float(min(hd, 2.4 * hw if z < 0.12 else 1.1 * hw))])
    arms = {}
    for side in "RL":
        rows = {}
        for y in range(armpit, F["y1"]):
            rs, c = central(y)
            lo, hi = min(r[0] for r in c), max(r[1] for r in c)          # torso (or both legs) span
            o = [r for r in rs if (r[1] < lo if side == "R" else r[0] > hi)]
            if not o:
                if rows:
                    break                                                # past the fingertips
                continue
            rows[y] = o[-1] if side == "R" else o[0]                     # the run nearest the torso
        ys = sorted(rows)
        pts = np.array([[(rows[y][0] + rows[y][1]) / 2, y] for y in ys], float)
        p0 = pts[: max(3, len(pts) // 4)].mean(0); p1 = pts[-max(3, len(pts) // 6):].mean(0)
        d = (p1 - p0) / np.linalg.norm(p1 - p0)
        w0 = (rows[ys[2]][1] - rows[ys[2]][0]) * abs(d[1])            # thickness across the arm near the armpit
        sh = p0 - d * (np.dot(p0 - np.array([p0[0], armpit]), d) + 0.9 * w0)    # up the axis into the shoulder
        end = pts[-1] + d * 0.5 * (rows[ys[-1]][1] - rows[ys[-1]][0]) * abs(d[1])
        L = np.linalg.norm(end - sh); nrm = np.array([-d[1], d[0]])
        secs = []
        for t in np.linspace(0, 1, 8):
            p = sh + (end - sh) * t
            wpx = 0
            for sgn in (-1, 1):                                      # walk across the arm both ways
                k = 0
                while k < 0.06 * Hp:
                    q = p + nrm * sgn * k
                    if not (0 <= int(q[1]) < F["m"].shape[0] and 0 <= int(q[0]) < F["m"].shape[1]) or not F["m"][int(q[1]), int(q[0])]:
                        break
                    k += 1
                wpx += k
            if p[1] < armpit + 0.5 * w0:                                 # inside the shoulder the walk runs into the torso
                wpx = 0.95 * w0
            hw = wpx / 2 * F["s"]
            secs.append([float((p[0] - cx) * F["s"]), float(zf(p[1], F)), float(hw), float(hw * (0.45 if t > 0.82 else 0.85))])
        arms[side] = dict(axis=[float(d[0]), float(-d[1])], secs=secs)
    # ------------------------------------------------------------------ v2 (zaw-dog-02 revision): shoulders, wrap textures
    # shoulders: the torso rings between the armpit and the neck reach out over the top of the arms (deltoids), so the
    # arm's top ring sits INSIDE the torso and the shoulder reads as one body (v1 capped them: separate sleeve chunks)
    xs_sh = np.mean([abs(arms[s]["secs"][0][0]) + 0.55 * arms[s]["secs"][0][2] for s in "LR"])
    zn_, za_ = zf(neck, F), zf(armpit, F)
    rings0 = [list(r) for r in rings]                                   # silhouette widths (for the arm/torso pixel split)
    for r in rings:
        z = r[0]
        if za_ - 0.08 <= z <= zn_ - 0.02:
            k = 1.0 if z <= zn_ - 0.07 else (zn_ - 0.02 - z) / 0.05
            r[3] = float(max(r[3], r[3] + (xs_sh - r[3]) * k))
    J = dict(name=name, height=height, z_crotch=zc, z_armpit=za_, z_neck=zn_, z_chin=zf(chin, F),
             rings=rings, rings0=rings0, legs=legs, arms=arms, cx=float(cx), scx=float(scx))
    bv = V["back"]; yb_ = int(bv["y0"] + 0.45 * (bv["y1"] - bv["y0"])); rsb = _runs(bv["m"][yb_])
    cB = float(np.mean([(a + b) / 2 for a, b in rsb if a < (bv["x0"] + bv["x1"]) / 2 < b] or [(bv["x0"] + bv["x1"]) / 2]))
    J["views"] = {"front": dict(s=F["s"], y1=F["y1"], c=float(cx)), "side": dict(s=S["s"], y1=S["y1"], c=float(scx)),
                  "back": dict(s=bv["s"], y1=bv["y1"], c=cB)}
    J["shoe_top"] = float(shoe_top(F, S, zf, yrow, height))
    J["shoes"] = shoe_outline(S, J, zf)
    build_textures(A, V, J)
    json.dump(J, open(os.path.join(OUT, f"{name}.json"), "w"), indent=1)
    print(name, f"crotch {zc:.2f} armpit {za_:.2f} neck {zn_:.2f} shoe {J['shoe_top']:.3f} m; shoulders to {xs_sh:.3f} m")


def shoe_top(F, S, zf, yrow, height):
    """height of the shoe collar: from the floor up, the first row where the front-view foot run narrows to the ankle."""
    w = []
    for z in np.linspace(0.01, 0.2 * height / 1.75, 30):
        rs = _runs(F["m"][min(yrow(z, F), F["y1"] - 1)]); w.append((z, max((b - a) for a, b in rs) if rs else 0))
    w0 = np.median([x for z, x in w[:6]])
    for z, x in w[6:]:
        if x < 0.8 * w0:
            return z
    return 0.09 * height / 1.75


def shoe_outline(S, J, zf):
    """side-view foot silhouette below the shoe collar -> outline polygon in (y, z) metres (row-monotone)."""
    st = J["shoe_top"]; s = S["s"]; c = J["views"]["side"]["c"]; rows = []
    for py in range(int(S["y1"] - st / s), S["y1"] + 1):
        rs = _runs(S["m"][py])
        if not rs:
            continue
        a, b = min(r[0] for r in rs), max(r[1] for r in rs)
        rows.append((float(zf(py, S)), float((c - b) * s), float((c - a) * s)))        # z, y_front (-), y_back (+)
    rows = rows[::max(1, len(rows) // 7)] + [rows[-1]]
    return rows


# ---- shared geometry (venv prep AND Blender use the same rings, so UVs and textures line up)
NT, NL, NA = 10, 6, 6                  # sides: torso/head, legs, arms
ARM_T = [0.0, 0.08, 0.2, 0.33, 0.45, 0.58, 0.7, 0.78]       # arm rings along the arm (0 = shoulder, 0.78 = wrist)
DROP = 0.09                            # rest arms: this many rad out from straight down


def ring_pts(c, a, b, ra, rb, n, ph):
    out = []
    for k in range(n):
        th = 2 * math.pi * k / n + ph
        ca, sa = math.cos(th), math.sin(th)
        ca, sa = math.copysign(abs(ca) ** 0.8, ca), math.copysign(abs(sa) ** 0.8, sa)
        out.append(np.array(c, float) + np.array(a, float) * ca * ra + np.array(b, float) * sa * rb)
    return out


def arm_frame(J, s):
    """A-pose arm (photo) and the rest arm (hanging): per ring t -> photo centre (x, z), photo across dir, rest centre."""
    secs = np.array(J["arms"][s]["secs"]); ts = np.linspace(0, 1, len(secs))
    sh, en = secs[0, :2], secs[-1, :2]; L = np.linalg.norm(en - sh); dA = (en - sh) / L
    nA = np.array([-dA[1], dA[0]])
    sx = 1.0 if s == "L" else -1.0
    dR = np.array([sx * math.sin(DROP), -math.cos(DROP)]); nR = np.array([-dR[1], dR[0]])
    if nR[0] * sx < 0:
        nR = -nR
    if nA[0] * sx < 0:
        nA = -nA
    sec = lambda t, j: float(np.interp(t, ts, secs[:, j]))
    return dict(sh=sh, L=L, dA=dA, nA=nA, dR=dR, nR=nR, sec=sec)


def geometry(J):
    """-> parts: {name: dict(rings=[[xyz...]...], n, kind, bones=[{bone: w}], extra)} in the rest pose (arms hanging)."""
    X, Y = (1, 0, 0), (0, 1, 0)
    zn, zc, za = J["z_neck"], J["z_crotch"], J["z_armpit"]

    def torso_bone(z):
        if z > zn + 0.02:
            return {"head": 1.0}
        if z > zn - 0.04:
            return {"neck": 1.0}
        if z > za - 0.12:
            return {"chest": 1.0}
        if z > zc + 0.12:
            k = min(max((z - zc - 0.12) / (za - zc - 0.24 + 1e-6), 0), 1)
            return {"chest": k, "hips": 1 - k}
        return {"hips": 1.0}
    R = J["rings"]; kn = min(range(len(R)), key=lambda i: abs(R[i][0] - (zn - 0.035)))
    P = {}
    for nm, rr in (("body", R[:kn + 1]), ("head", R[kn:])):
        P[nm] = dict(kind=nm, n=NT, rings=[ring_pts((r[1], r[2], r[0]), X, Y, r[3], r[4], NT, math.pi / NT) for r in rr],
                     centers=[np.array((r[1], r[2], r[0])) for r in rr], bones=[torso_bone(r[0]) for r in rr])
    zk = zc * 0.52; st = J["shoe_top"]
    for s in "LR":
        Lg = [r for r in J["legs"][s] if r[0] >= 0.12] ; xl = np.mean([r[1] for r in Lg])
        Lg = [[st * 0.55, xl, Lg[0][2], Lg[0][3] * 0.9, Lg[0][4] * 0.9]] + Lg
        bw = [{f"foot.{s}": 1.0} if r[0] < 0.06 else {f"shin.{s}": 1.0} if r[0] < zk - 0.04 else
              {f"shin.{s}": 0.5, f"thigh.{s}": 0.5} if r[0] < zk + 0.04 else {f"thigh.{s}": 1.0} for r in Lg]
        P["leg" + s] = dict(kind="leg", n=NL, rings=[ring_pts((r[1], r[2], r[0]), X, Y, r[3], r[4], NL, math.pi / NL) for r in Lg],
                            centers=[np.array((r[1], r[2], r[0])) for r in Lg], bones=bw)
        A = arm_frame(J, s); rings, cents, bw = [], [], []
        for t in ARM_T:
            c = np.array([A["sh"][0] + A["dR"][0] * t * A["L"], 0.0, A["sh"][1] + A["dR"][1] * t * A["L"]])
            nR3 = (A["nR"][0], 0, A["nR"][1])
            hw, hd = A["sec"](t, 2), A["sec"](t, 3)
            if t < 0.05:
                hw, hd = hw * 0.85, hd * 0.85
            rings.append(ring_pts(c, nR3, Y, hw, hd, NA, math.pi / NA)); cents.append(c)
            bw.append({"chest": 0.6, f"upperarm.{s}": 0.4} if t < 0.05 else {"chest": 0.15, f"upperarm.{s}": 0.85} if t < 0.12 else
                      {f"upperarm.{s}": 1.0} if t < 0.4 else {f"upperarm.{s}": 0.5, f"forearm.{s}": 0.5} if t < 0.5 else {f"forearm.{s}": 1.0})
        P["arm" + s] = dict(kind="arm", side=s, n=NA, rings=rings, centers=cents, bones=bw, ts=ARM_T)
    return P


# ---- atlas layout (pixels): parts side by side, plus shoe + hand-skin crops
TEX = {"body": (120, 224), "head": (160, 128), "legL": (48, 128), "legR": (48, 128), "armL": (48, 96), "armR": (48, 96),
       "shoe_side": (96, 32), "shoe_front": (48, 24), "skin": (16, 16)}


def layout():
    W = sum(w for w, h in TEX.values()); W4 = (W + 3) // 4 * 4; H = max(h for w, h in TEX.values()); x = 0; R = {}
    for k, (w, h) in TEX.items():
        R[k] = dict(u0=(x + 0.5) / W4, u1=(x + w - 0.5) / W4, v0=1 - (h - 0.5) / H, v1=1 - 0.5 / H, px=x, w=w, h=h); x += w   # texel centres: Closest never reads the black outside a part
    return W4, H, R


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)


def build_textures(A, V, J):
    """wrap textures: each texel of each part is a point on the 3D surface; it samples the front / side / back photo
    (orthographic, the same scale as the mesh) with feathered weights from the surface direction, so the face wraps
    round the skull into the hair, ear and neck with no plate edges. Torso/legs never sample the side photo where the
    arms overlap it; arms sample their own (arm-only) photo pixels mapped from the A-pose to the hanging rest arm."""
    from PIL import Image
    from scipy import ndimage as nd
    G = geometry(J); W4, H, R = layout(); at = np.zeros((H, W4, 3), float); neck_zones = []
    vw = {}
    for key in ("front", "side", "back"):
        v = V[key]; m = nd.binary_erosion(v["m"], iterations=2)
        img = A.astype(float).copy(); ex = np.clip(np.minimum(img[..., 0], img[..., 2]) - img[..., 1], 0, None)
        img[..., 0] -= ex; img[..., 2] -= ex                                 # magenta despill
        s, c, y1 = J["views"][key]["s"], J["views"][key]["c"], J["views"][key]["y1"]
        armm = np.zeros_like(m)
        if key != "side":
            for py in range(m.shape[0]):
                z = (y1 - py) * s
                wmax = max([r[3] + abs(r[1]) for r in J["rings0"] if abs(r[0] - z) < 0.06] +
                           [r[3] + abs(r[1]) for sd in "LR" for r in J["legs"][sd] if abs(r[0] - z) < 0.06] + [0.05]) / s + 3
                for a, b in _runs(m[py]):
                    if b < c - wmax or a > c + wmax:
                        armm[py, a:b + 1] = True
        cen = m & ~nd.binary_dilation(armm, iterations=2)

        def bleed(mask):
            _, (iy, ix) = nd.distance_transform_edt(~mask, return_indices=True); return img[iy, ix]
        vw[key] = dict(cen=bleed(cen), full=bleed(m), s=s, c=c, y1=y1)

    def samp(key, layer, x, z):
        v = vw[key]; im = v[layer]; px = v["c"] + x / v["s"] if key == "front" else v["c"] - x / v["s"]
        py = v["y1"] - z / v["s"]
        px = np.clip(np.round(px).astype(int), 0, im.shape[1] - 1); py = np.clip(np.round(py).astype(int), 0, im.shape[0] - 1)
        return im[py, px]
    zn = J["z_neck"]
    for nm, part in G.items():
        r = R[nm]; w, h = r["w"], r["h"]; n = part["n"]; rings = np.array(part["rings"]); cents = np.array(part["centers"]); K = len(rings)
        uu, vv = np.meshgrid((np.arange(w) + 0.5) / w, (np.arange(h) + 0.5) / h)
        a = uu * n; i0 = np.floor(a).astype(int) % n; i1 = (i0 + 1) % n; fa = (a - np.floor(a))[..., None]
        b = (1 - vv) * (K - 1); k0 = np.clip(np.floor(b).astype(int), 0, K - 2); fb = (b - k0)[..., None]
        P = (rings[k0, i0] * (1 - fa) + rings[k0, i1] * fa) * (1 - fb) + (rings[k0 + 1, i0] * (1 - fa) + rings[k0 + 1, i1] * fa) * fb
        C = cents[k0] * (1 - fb) + cents[k0 + 1] * fb
        dvec = P - C; dvec[..., 2] = 0 if part["kind"] != "arm" else dvec[..., 2]
        dn = dvec / (np.linalg.norm(dvec, axis=-1, keepdims=True) + 1e-9)
        if part["kind"] == "arm":
            Af = arm_frame(J, part["side"]); ts = np.array(part["ts"]); t = ts[k0] * (1 - fb[..., 0]) + ts[k0 + 1] * fb[..., 0]
            nR3 = np.array([Af["nR"][0], 0, Af["nR"][1]]); across = (dvec * nR3).sum(-1)
            hw = np.array([Af["sec"](x, 2) for x in t.ravel()]).reshape(t.shape)
            across = np.clip(across, -0.82 * hw, 0.82 * hw)                    # sides: just inside the arm's photo edge
            xa = Af["sh"][0] + Af["dA"][0] * t * Af["L"] + Af["nA"][0] * across
            za = Af["sh"][1] + Af["dA"][1] * t * Af["L"] + Af["nA"][1] * across
            wF = smooth(-0.6, 0.35, -dn[..., 1]); wB = 1 - wF
            col = samp("front", "full", xa, za) * wF[..., None] + samp("back", "full", xa, za) * wB[..., None]
        else:
            x, y, z = P[..., 0], P[..., 1], P[..., 2]
            fy = -dn[..., 1]; sx_ = np.abs(dn[..., 0])
            if part["kind"] == "head":
                hk = smooth(zn + 0.02, zn + 0.07, z)                          # neck: feather the side photo in
                wF = smooth(0.25, 0.7, fy); wB = smooth(0.25, 0.7, -fy); wS = smooth(0.5, 0.85, sx_) * hk   # the side photo owns the ear/cheek (sharp, no stretched front)
                xF = x * (0.92 + 0.08 * fy)                                     # a touch of wrap at the cheeks
            else:
                low = (z < J["z_crotch"] * 0.5) & (part["kind"] == "leg")      # below the knee the side photo is clean
                wF = smooth(-0.25, 0.25, fy); wB = smooth(-0.25, 0.25, -fy); wS = smooth(0.6, 0.95, sx_) * low
                xF = x * 0.97
            res_ = np.clip(1 - wF - wB - wS, 0, 1)                             # no view owns it (neck sides): front + back share it
            wF = wF + 0.5 * res_; wB = wB + 0.5 * res_
            tot = wF + wB + wS + 1e-6
            col = (samp("front", "cen", xF, z) * wF[..., None] + samp("back", "cen", xF, z) * wB[..., None] +
                   samp("side", "cen", y, z) * wS[..., None]) / tot[..., None]
        at[:h, r["px"]:r["px"] + w] = col
        if part["kind"] == "arm":                                             # shoulder tops: a strand of hair over the shoulder
            neck_zones.append((r, (t < 0.16) & (-dn[..., 1] > -0.25)))
        if part["kind"] in ("head", "body"):                                 # neck zone: sides/back, for the stray-hair cleanup
            zz_ = P[..., 2]; fy_ = -dn[..., 1]
            nm_ = (((zz_ < zn + 0.035) | ((zz_ < zn + 0.07) & (np.abs(dn[..., 0]) > 0.4))) & (zz_ > zn - 0.06) & (fy_ > -0.25)) if part["kind"] == "head" else \
                  ((zz_ > zn - 0.14) & (fy_ > -0.25))                          # the nape / ponytail keep their hair
            neck_zones.append((r, nm_))
    # shoes: side photo crop (both feet) + front photo crop per foot
    st = J["shoe_top"]; ysh = [p for row in J["shoes"] for p in row[1:]]; y0s, y1s = min(ysh) - 0.01, max(ysh) + 0.01
    r = R["shoe_side"]; uu, vv = np.meshgrid((np.arange(r["w"]) + 0.5) / r["w"], (np.arange(r["h"]) + 0.5) / r["h"])
    at[:r["h"], r["px"]:r["px"] + r["w"]] = samp("side", "cen", y0s + uu * (y1s - y0s), st * (1 - vv) + 0.005)
    J["shoe_side_y"] = [float(y0s), float(y1s)]
    r = R["shoe_front"]; xs = [J["legs"][s][0][1] for s in "LR"]; hw = max(J["legs"][s][0][3] for s in "LR") * 1.3
    x0f, x1f = min(xs) - hw, max(xs) + hw
    uu, vv = np.meshgrid((np.arange(r["w"]) + 0.5) / r["w"], (np.arange(r["h"]) + 0.5) / r["h"])
    at[:r["h"], r["px"]:r["px"] + r["w"]] = samp("front", "cen", x0f + uu * (x1f - x0f), st * (1 - vv) + 0.005)
    J["shoe_front_x"] = [float(x0f), float(x1f)]
    # skin tone match: arms (and the hand skin) take the face's skin colour, measured on the photo
    def skin(px):
        r_, g_, b_ = px[..., 0], px[..., 1], px[..., 2]
        return (r_ > g_ + 8) & (g_ > b_ - 5) & (r_ - b_ > 25) & (r_ > 70)
    hr = R["head"]; head = at[:hr["h"], hr["px"]:hr["px"] + hr["w"]]
    face = head[int(0.35 * hr["h"]):int(0.75 * hr["h"]), int(0.3 * hr["w"]):int(0.7 * hr["w"])]
    fsk = face[skin(face)]
    if len(fsk) > 10:                                                       # the lit skin (no beard / shadow pixels)
        lum = fsk.mean(1); fsk = fsk[lum >= np.median(lum)]
    fm = fsk.mean(0) if len(fsk) > 10 else None
    tips = []
    for s in "LR":
        ar = R["arm" + s]; reg = at[:ar["h"], ar["px"]:ar["px"] + ar["w"]]
        chrom = lambda x: x / (x.sum(-1, keepdims=True) + 1e-6)
        mk = skin(reg) & (np.abs(chrom(reg) - (chrom(fm) if fm is not None else 0)).sum(-1) < 0.09)   # skin, not a mustard sleeve
        if fm is not None and mk.sum() > 10:
            g = np.clip(fm / reg[mk].mean(0), 0.75, 1.35); reg[mk] = np.clip(reg[mk] * g, 0, 255)
        tips.append(reg[:max(2, ar["h"] // 8)].reshape(-1, 3))                 # wrist end (top rows = last ring)
    hand = fm if fm is not None else np.concatenate(tips).mean(0)
    r = R["skin"]; rng = np.random.default_rng(1)
    at[:r["h"], r["px"]:r["px"] + r["w"]] = hand * (1 + (rng.random((r["h"], r["w"], 1)) - 0.5) * 0.08)
    J["skin_rgb"] = [float(x) for x in hand]
    # stray dark hair on the neck (a ponytail strand, the jaw shadow under the ear): neck-zone texels that are dark AND
    # hair-coloured (r >= b: brown/black, not a navy collar) take the neck skin
    if fm is not None:
        for r, nm_ in neck_zones:
            reg = at[:r["h"], r["px"]:r["px"] + r["w"]]; lum = reg.mean(-1)
            bad = nm_ & (lum < 18)          # the pure-black jaw-shadow notch under the ear (stranger_b's strand is retouched at the source)
            lab_, nl_ = nd.label(bad); sz_ = nd.sum(bad, lab_, range(1, nl_ + 1))
            bad = np.isin(lab_, [i + 1 for i, z_ in enumerate(sz_) if z_ < 40])                     # small notches only (not black hair)   # brown/black hair: r>=g>b (burgundy g~b, navy b>r)   # not a burgundy collar
            reg[bad] = fm * 0.92
    img = Image.fromarray(np.clip(at, 0, 255).astype(np.uint8)).quantize(96, method=Image.Quantize.MEDIANCUT,
                                                                          dither=Image.Dither.NONE).convert("RGB")
    img.save(os.path.join(OUT, f"{J['name']}_atlas.png"))



# ---------------------------------------------------------------------------------------------- venv: photo hands (VLVT)
# Flow sheets (ref/flow/hands, one per pose): ONE right hand twice on magenta, wrist at the bottom: LEFT = back of the
# hand (palm for "open") facing the lens, RIGHT = edge-on from the thumb side. Per pose: rings along the hand from
# the two silhouettes (width from the face view, thickness from the edge view) + a wrap texture from both photos.
HAND_SHEETS = {"relax": "01-30-15", "grip": "01-31-03", "point": "01-31-45", "open": "01-32-23"}
HAND_PDIR = {"relax": -1, "grip": 1, "point": -1, "open": -1}      # which way the palm faces in the edge-on photo (+ = image right)
HAND_RINGS, HAND_SIDES, WRIST_W = 13, 8, 0.058
HAND_LEN = {"relax": 0.19, "grip": 0.13, "point": 0.19, "open": 0.19}   # wrist -> tip (the photos include a forearm stub)


def hands_prep():
    from PIL import Image
    from scipy import ndimage as nd
    os.makedirs(OUT, exist_ok=True); D = os.path.join(H, "ref", "flow", "hands")
    for pose, key in HAND_SHEETS.items():
        f = next(os.path.join(D, x) for x in sorted(os.listdir(D)) if key in x)
        A = np.asarray(Image.open(f).convert("RGB")); M = nd.binary_opening(_mask(A), iterations=2)
        lab, n = nd.label(M); sizes = nd.sum(M, lab, range(1, n + 1))
        big = sorted([i + 1 for i in np.argsort(sizes)[::-1][:2]], key=lambda i: np.flatnonzero((lab == i).any(0)).mean())
        V = []
        for li in big:
            m = nd.binary_fill_holes(lab == li); ys, xs = np.nonzero(m)
            V.append(dict(m=m, y0=int(ys.min()), y1=int(ys.max()), x0=int(xs.min()), x1=int(xs.max())))
        Fv, Ev = V
        wr = [(lambda r: r[1] - r[0])((np.flatnonzero(Fv["m"][y]).min(), np.flatnonzero(Fv["m"][y]).max())) for y in range(Fv["y1"] - 12, Fv["y1"] - 2)]
        s = WRIST_W / np.median(wr)                                         # metres per pixel, from the wrist width
        cF = np.flatnonzero(Fv["m"][Fv["y1"] - 6]).mean(); cE = np.flatnonzero(Ev["m"][Ev["y1"] - 6]).mean()
        L = (Fv["y1"] - min(Fv["y0"], Ev["y0"] + (Fv["y1"] - Ev["y1"]))) * s
        rings = []; z0 = max(0.0, L - HAND_LEN[pose])
        for k in range(HAND_RINGS):
            z = z0 + (L - z0) * (k / (HAND_RINGS - 1)) * 0.985
            rf, re_ = int(round(Fv["y1"] - z / s)), int(round(Ev["y1"] - z / s))
            xf = np.flatnonzero(Fv["m"][rf]); xe = np.flatnonzero(Ev["m"][re_])
            if not len(xf) or not len(xe):
                continue
            rings.append([float(z - z0), float(((xf.min() + xf.max()) / 2 - cF) * s), float(max((xf.max() - xf.min()) / 2 * s, 0.004)),
                          float(((xe.min() + xe.max()) / 2 - cE) * s), float(max((xe.max() - xe.min()) / 2 * s, 0.004))])
        rings[-1][2] *= 0.5; rings[-1][4] *= 0.5                            # tip: a small cap, not a flat lid
        img = A.astype(float).copy(); ex = np.clip(np.minimum(img[..., 0], img[..., 2]) - img[..., 1], 0, None)
        img[..., 0] -= ex; img[..., 2] -= ex
        _, (iy, ix) = nd.distance_transform_edt(~nd.binary_erosion(M, iterations=2), return_indices=True); img = img[iy, ix]
        Wt, Ht = 64, 96; tex = np.zeros((Ht, Wt, 3))
        R_ = np.array(rings)
        for r in range(Ht):
            zz = (1 - (r + 0.5) / Ht) * R_[-1, 0]; zp = zz + z0                  # zp: height in the photo
            row = [np.interp(zz, R_[:, 0], R_[:, j]) for j in range(5)]
            for c in range(Wt):
                th = 2 * math.pi * (c + 0.5) / Wt + math.pi / HAND_SIDES
                ca, sa = math.cos(th), math.sin(th)
                ca, sa = math.copysign(abs(ca) ** 0.8, ca), math.copysign(abs(sa) ** 0.8, sa)
                u = row[1] + ca * row[2]; d = row[3] + sa * row[4]                # (width offset, depth offset) on the surface
                wF = smooth(0.3, 0.75, abs(sa)); wE = 1 - wF
                pf = img[int(np.clip(Fv["y1"] - zp / s, 0, A.shape[0] - 1)), int(np.clip(cF + u * 0.9 / s, 0, A.shape[1] - 1))]
                pe = img[int(np.clip(Ev["y1"] - zp / s, 0, A.shape[0] - 1)), int(np.clip(cE + d * 0.9 / s, 0, A.shape[1] - 1))]
                tex[r, c] = pf * wF + pe * wE
        Image.fromarray(np.clip(tex, 0, 255).astype(np.uint8)).save(os.path.join(OUT, f"hand_{pose}.png"))
        yb = int(Fv["y1"] - (z0 + 0.03) / s); sk = img[yb - 30:yb, int(cF - 10):int(cF + 10)].reshape(-1, 3).mean(0)
        json.dump(dict(pose=pose, rings=rings, pdir=HAND_PDIR[pose], skin=[float(x) for x in sk], L=float(L - z0)),
                  open(os.path.join(OUT, f"hand_{pose}.json"), "w"), indent=1)
        print("hand", pose, f"length {L:.3f} m, {len(rings)} rings")


def hands_tint(name):
    """the person's own skin on the photo hands: per-channel gain from the hand photo's skin to the face skin."""
    from PIL import Image
    J = json.load(open(os.path.join(OUT, f"{name}.json")))
    for pose in HAND_SHEETS:
        hj = json.load(open(os.path.join(OUT, f"hand_{pose}.json"))); im = np.asarray(Image.open(os.path.join(OUT, f"hand_{pose}.png"))).astype(float)
        g = np.clip(np.array(J["skin_rgb"]) / np.array(hj["skin"]), 0.3, 1.6)
        Image.fromarray(np.clip(im * g, 0, 255).astype(np.uint8)).quantize(32, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE) \
            .convert("RGB").save(os.path.join(OUT, f"{name}_hand_{pose}.png"))


# ---------------------------------------------------------------------------------------------- Blender: build + rig
class PhotoPerson:
    """same API as v1 (show, rest, rot, walk, hand_pos) + hands: hand(side, pose), grip_point(side, r), palm_point(side),
    twist(side, ang). Rest = arms hanging (no base rotation)."""
    HAND_POSES = ("relax", "grip", "point", "open")

    def __init__(self, name, scale=1.0):
        import bpy
        import lpskit as K
        from mathutils import Vector
        self.name = name; self.J = J = json.load(open(os.path.join(OUT, f"{name}.json"))); self.K = K
        G = geometry(J); W4, H, R = layout()
        im = bpy.data.images.load(os.path.join(OUT, f"{name}_atlas.png"), check_existing=True); im.pack()
        self.mat = K.mat_image(name + "_m", im)
        verts, faces, fuv, vbone = [], [], [], []
        for nm, part in G.items():
            r = R[nm]; n = part["n"]; K_ = len(part["rings"]); base = len(verts)
            for ring, bw in zip(part["rings"], part["bones"]):
                for p in ring:
                    verts.append(tuple(p)); vbone.append(bw)
            uv = lambda k, i: (r["u0"] + (i / n) * (r["u1"] - r["u0"]), r["v0"] + (k / (K_ - 1)) * (r["v1"] - r["v0"]))
            for k in range(K_ - 1):
                for i in range(n):
                    faces.append((base + k * n + i, base + k * n + (i + 1) % n, base + (k + 1) * n + (i + 1) % n, base + (k + 1) * n + i))
                    fuv.append([uv(k, i), uv(k, i + 1), uv(k + 1, i + 1), uv(k + 1, i)])
            capt = [nm == "head" or nm.startswith("arm"), nm == "head" or nm.startswith(("arm", "leg"))]
            if nm.startswith("arm") or nm.startswith("leg") or nm == "body":
                capt = [True, nm != "body"]
            if nm == "head":
                capt = [False, True]
            for ci, k in ((0, 0), (1, K_ - 1)):
                if capt[ci]:
                    idx = [base + k * n + i for i in range(n)]
                    faces.append(tuple(idx[::-1] if ci == 0 else idx)); fuv.append([uv(k, i + 0.5) for i in (range(n)[::-1] if ci == 0 else range(n))])
        # shoes: the side silhouette extruded across the foot width
        rS, rF = R["shoe_side"], R["shoe_front"]; y0s, y1s = J["shoe_side_y"]; x0f, x1f = J["shoe_front_x"]; st = J["shoe_top"]
        uvS = lambda y, z: (rS["u0"] + (y - y0s) / (y1s - y0s) * (rS["u1"] - rS["u0"]), rS["v0"] + min(z / st, 0.8) * (rS["v1"] - rS["v0"]))
        uvF = lambda x, z: (rF["u0"] + (x - x0f) / (x1f - x0f) * (rF["u1"] - rF["u0"]), rF["v0"] + min(z / st, 1) * (rF["v1"] - rF["v0"]))
        rows = J["shoes"]
        for s in "LR":
            l0 = J["legs"][s][0]; xc, hwf = l0[1], max(l0[3] * 1.05, 0.042)
            outline = [(r_[1], r_[0]) for r_ in rows] + [(r_[2], r_[0]) for r_ in rows[::-1]]   # (y, z) loop: front edge down, back edge up
            m = len(outline); base = len(verts)
            for xx in (xc - hwf, xc + hwf):
                for y, z in outline:
                    verts.append((xx, y, max(z, 0.0))); vbone.append({f"foot.{s}": 1.0} if z < st * 0.6 else {f"shin.{s}": 1.0})
            for sd in (0, 1):                                              # side caps: strips between the two edges
                for k in range(len(rows) - 1):
                    a_, b_ = k, k + 1; c_, d_ = m - 2 - k, m - 1 - k
                    q = [base + sd * m + j for j in (a_, b_, c_, d_)]
                    faces.append(tuple(q if sd else q[::-1]))
                    fuv.append([uvS(*outline[j]) for j in ((a_, b_, c_, d_) if sd else (d_, c_, b_, a_))])
            for j in range(m):                                             # perimeter
                j2 = (j + 1) % m; q = (base + j, base + j2, base + m + j2, base + m + j)
                faces.append(q)
                dy, dz = outline[j2][0] - outline[j][0], outline[j2][1] - outline[j][1]
                if abs(dz) > abs(dy) and outline[j][0] < (y0s + y1s) / 2:      # the toe end: the front photo of the shoe
                    fuv.append([uvF(xc - hwf, outline[j][1]), uvF(xc - hwf, outline[j2][1]), uvF(xc + hwf, outline[j2][1]), uvF(xc + hwf, outline[j][1])])
                else:                                                          # top / sole / heel: the shoe's side colours
                    fuv.append([uvS(*outline[j]), uvS(*outline[j2]), uvS(*outline[j2]), uvS(*outline[j])])
        me = bpy.data.meshes.new(name + "_body"); me.from_pydata(verts, [], faces); me.update()
        import bmesh
        bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
        uvl = me.uv_layers.new(name="UV"); me.materials.append(self.mat)
        for p in me.polygons:                                              # recalc may flip a face: match UVs to its vertex order
            src = faces[p.index]; uvs = dict(zip(src, fuv[p.index]))
            for li, vi in zip(p.loop_indices, p.vertices):
                uvl.data[li].uv = uvs[vi]
        if scale != 1.0:
            me.transform(__import__("mathutils").Matrix.Scale(scale, 4))
        self.body = K.link(bpy.data.objects.new(name + "_body", me))
        self.arm = self._rig(scale)
        for i, w in enumerate(vbone):
            for g, val in w.items():
                vg = self.body.vertex_groups.get(g) or self.body.vertex_groups.new(name=g)
                vg.add([i], val, "REPLACE")
        self.body.modifiers.new("arm", "ARMATURE").object = self.arm; self.body.parent = self.arm
        self.root = self.arm; self.parts = [self.body]
        self.hands = {s: self._hand(s) for s in "LR"}
        self.cur = {"L": "relax", "R": "relax"}
        self.rest()

    def _hand(self, s):
        """the photo hands (VLVT): one lofted mesh per pose, from the Flow hand sheets (hands_prep), in this person's skin
        (hands_tint). They hang on the hand bone; hand(s, pose) shows one. Bone axes: Y along the fingers, X = palm normal
        axis (palm side = X * ps), Z = thumb axis (thumb side = Z * ts)."""
        import bpy
        K = self.K; sc = self.J["height"] / 1.75; ps, ts = self.PALM[s], self.THUMB[s]
        root = K.link(bpy.data.objects.new(f"{self.name}_hand{s}", None))
        root.parent = self.arm; root.parent_type = "BONE"; root.parent_bone = f"hand.{s}"
        Lh = (self.arm.data.bones[f"hand.{s}"].tail_local - self.arm.data.bones[f"hand.{s}"].head_local).length
        root.location = (0, -Lh, 0)                                         # bone-parent origin = bone tail -> back to the wrist
        objs, geo = {}, {}
        for pose in self.HAND_POSES:
            hj = json.load(open(os.path.join(OUT, f"hand_{pose}.json"))); R_ = hj["rings"]; n = HAND_SIDES; pdir = hj["pdir"]
            verts, faces, fuv = [], [], []
            for z, u, w, d, t in R_:
                for k in range(n):
                    th = 2 * math.pi * k / n + math.pi / n
                    ca, sa = math.cos(th), math.sin(th)
                    ca, sa = math.copysign(abs(ca) ** 0.8, ca), math.copysign(abs(sa) ** 0.8, sa)
                    uu, dd = (u + ca * w) * sc, (d + sa * t) * sc
                    verts.append((ps * pdir * dd, z * sc, -ts * uu))         # thumb at image left -> +ts*Z; palm side -> ps*X
            K_ = len(R_)
            uvf = lambda k, i: (i / n, k / (K_ - 1))
            for k in range(K_ - 1):
                for i in range(n):
                    faces.append((k * n + i, k * n + (i + 1) % n, (k + 1) * n + (i + 1) % n, (k + 1) * n + i))
                    fuv.append([uvf(k, i), uvf(k, i + 1), uvf(k + 1, i + 1), uvf(k + 1, i)])
            faces.append(tuple((K_ - 1) * n + i for i in range(n))); fuv.append([uvf(K_ - 1, i + 0.5) for i in range(n)])
            me = bpy.data.meshes.new(f"{self.name}_hand{s}_{pose}"); me.from_pydata(verts, [], faces); me.update()
            import bmesh
            bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
            uvl = me.uv_layers.new(name="UV")
            for p in me.polygons:
                uvs = dict(zip(faces[p.index], fuv[p.index]))
                for li, vi in zip(p.loop_indices, p.vertices):
                    uvl.data[li].uv = uvs[vi]
            im = bpy.data.images.load(os.path.join(OUT, f"{self.name}_hand_{pose}.png"), check_existing=True); im.pack()
            me.materials.append(K.mat_image(f"{self.name}_hm_{pose}", im))
            o = K.link(bpy.data.objects.new(f"{self.name}_hand{s}_{pose}", me)); o.parent = root; self.parts.append(o)
            objs[pose] = o; geo[pose] = [[z * sc, u * sc, w * sc, d * sc, t * sc] for z, u, w, d, t in R_] + [pdir]
        return dict(root=root, palm=root, objs=objs, geo=geo, ps=ps, ts=ts, pt=0.0, pl=0.0)

    PALM = {"L": -1.0, "R": 1.0}       # local X sign of the palm side (relaxed: palm toward the thigh)
    THUMB = {"L": -1.0, "R": -1.0}    # local Z sign of the thumb edge (local Z = world +Y at rest: thumb forward = -1)

    def _hand_vis(self):
        for s, h in self.hands.items():
            vis = not self.body.hide_render
            for p_, o in h["objs"].items():
                o.hide_render = o.hide_viewport = not (vis and p_ == self.cur[s])

    def hand(self, s, pose="relax"):
        """show one photo hand pose: relax / grip (cup) / point / open."""
        self.cur[s] = {"cup": "grip"}.get(pose, pose); self._hand_vis()

    def grip_point(self, s, r=0.0):
        """world point r metres off the PALM surface, at the grip height of the current pose: a held prop's centre."""
        import bpy
        from mathutils import Vector
        bpy.context.view_layer.update(); h = self.hands[s]; g = h["geo"][self.cur[s]]; rings, pdir = g[:-1], g[-1]
        k = {"grip": 0.55, "point": 0.4, "open": 0.42, "relax": 0.45}[self.cur[s]]
        z = rings[-1][0] * k; row = [float(np.interp(z, [r_[0] for r_ in rings], [r_[j] for r_ in rings])) for j in range(5)]
        x = h["ps"] * pdir * row[3] + h["ps"] * (row[4] + r) * (1 if self.cur[s] != "grip" else 0.2)
        return h["root"].matrix_world @ Vector((x, z, -h["ts"] * row[1]))

    def twist(self, s, ang):
        """roll the hand about the forearm (palm up / down)."""
        from mathutils import Quaternion
        pb = self.arm.pose.bones[f"hand.{s}"]; pb.rotation_quaternion = pb.rotation_quaternion @ Quaternion((0, 1, 0), ang)

    def _rig(self, sc):
        import bpy
        from mathutils import Vector
        J = self.J; K = self.K
        a = bpy.data.armatures.new(self.name + "_rig"); arm = K.link(bpy.data.objects.new(self.name, a))
        bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT"); eb = a.edit_bones
        zc, za, zn, top = J["z_crotch"], J["z_armpit"], J["z_neck"], J["rings"][-1][0]
        yc = lambda z: min(J["rings"], key=lambda r: abs(r[0] - z))[2]
        V = lambda x, y, z: Vector((x, y, z)) * sc

        def bone(nm, h, t, par=None):
            b = eb.new(nm); b.head = h; b.tail = t; b.roll = 0.0
            if par:
                b.parent = eb[par]
            return b
        bone("hips", V(0, yc(zc), zc), V(0, yc(zc + 0.15), zc + 0.15))
        bone("chest", V(0, yc(zc + 0.15), zc + 0.15), V(0, yc(zn - 0.04), zn - 0.04), "hips")
        bone("neck", V(0, yc(zn - 0.04), zn - 0.04), V(0, yc(zn + 0.03), zn + 0.03), "chest")
        bone("head", V(0, yc(zn + 0.03), zn + 0.03), V(0, yc(top - 0.05), top), "neck")
        zk = zc * 0.52
        for s in "LR":
            Lg = J["legs"][s]; xl = np.mean([r[1] for r in Lg]); yl = np.mean([r[2] for r in Lg])
            bone(f"thigh.{s}", V(xl, yl, zc), V(xl, yl, zk), "hips")
            bone(f"shin.{s}", V(xl, yl, zk), V(xl, yl, 0.08), f"thigh.{s}")
            bone(f"foot.{s}", V(xl, yl, 0.08), V(xl, yl - 0.14, 0.03), f"shin.{s}")
            Af = arm_frame(J, s); p = lambda t: Af["sh"] + Af["dR"] * t * Af["L"]
            sh, el, wr, en = p(0.0), p(0.45), p(0.78), p(1.0)
            bone(f"upperarm.{s}", V(sh[0], 0, sh[1]), V(el[0], 0, el[1]), "chest")
            bone(f"forearm.{s}", V(el[0], 0, el[1]), V(wr[0], 0, wr[1]), f"upperarm.{s}")
            bone(f"hand.{s}", V(wr[0], 0, wr[1]), V(en[0], 0, en[1]), f"forearm.{s}")
        bpy.ops.object.mode_set(mode="OBJECT")
        for pb in arm.pose.bones:
            pb.rotation_mode = "QUATERNION"
        arm.hide_render = True
        self.base = {"L": 0.0, "R": 0.0}
        return arm

    def _q(self, bone, rots):
        from mathutils import Quaternion, Vector
        q = Quaternion()
        for ax, ang in rots:
            la = (self.arm.data.bones[bone].matrix_local.to_3x3().inverted() @ Vector(ax)).normalized()
            q = Quaternion(la, ang) @ q
        return q

    # ---- people3d.Person API
    def show(self, on=True, loc=None, yaw=0.0):
        for o in self.parts:
            o.hide_render = not on; o.hide_viewport = not on
        if hasattr(self, "cur"):
            self._hand_vis()
        if loc is not None:
            self.arm.location = loc; self.arm.rotation_euler = (0, 0, yaw)

    def rest(self):
        for pb in self.arm.pose.bones:
            pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)
        for s in "LR":
            self.hand(s, "relax")

    def rot(self, bone, rots):
        """rotations [(axis in the person's space, angle)] on top of the rest pose (arms down)."""
        self.arm.pose.bones[bone].rotation_quaternion = self._q(bone, rots)

    def walk(self, t, amp=1.0, hz=0.9):
        w = 2 * math.pi * hz * t; s_ = math.sin(w)
        for side, sg in (("L", 1), ("R", -1)):
            self.rot(f"thigh.{side}", [((1, 0, 0), -0.38 * amp * s_ * sg)])
            self.rot(f"shin.{side}", [((1, 0, 0), 0.45 * amp * max(0.0, s_ * sg))])
            self.rot(f"upperarm.{side}", [((1, 0, 0), 0.3 * amp * s_ * sg)])
            self.rot(f"forearm.{side}", [((1, 0, 0), -0.25 * amp)])

    def arms_down(self):
        for side in "LR":
            self.rot(f"upperarm.{side}", [])

    def aim_bone(self, bone, target):
        """rotate one pose bone about its head (armature space) so it points at target (world)."""
        import bpy
        from mathutils import Matrix, Vector
        bpy.context.view_layer.update()
        pb = self.arm.pose.bones[bone]; h, tl = pb.head.copy(), pb.tail.copy(); tg = self.arm.matrix_world.inverted() @ Vector(target)
        q = (tl - h).normalized().rotation_difference((tg - h).normalized())
        pb.matrix = Matrix.Translation(h) @ q.to_matrix().to_4x4() @ Matrix.Translation(-h) @ pb.matrix
        bpy.context.view_layer.update()

    def wpt(self, local):
        """a point in the person's own space (faces -Y, their left = +X, z up from the floor) -> world."""
        import bpy
        from mathutils import Vector
        bpy.context.view_layer.update()
        return self.arm.matrix_world @ Vector(local)

    def aim(self, side, target):
        """point a straight arm at target (world)."""
        for b_ in ("upperarm", "forearm", "hand"):
            self.rot(f"{b_}.{side}", [])
        for b_ in ("upperarm", "forearm", "hand"):
            self.aim_bone(f"{b_}.{side}", target)

    def pose_arm(self, side, elbow, hand, tip=None):
        """shoulder -> elbow -> wrist->knuckles, as points in the person's own space (x mirrored for R)."""
        sx = 1 if side == "L" else -1
        for b_ in ("upperarm", "forearm", "hand"):
            self.rot(f"{b_}.{side}", [])
        e = self.wpt((sx * elbow[0], elbow[1], elbow[2])); h_ = self.wpt((sx * hand[0], hand[1], hand[2]))
        t_ = self.wpt((sx * tip[0], tip[1], tip[2])) if tip else h_ + (h_ - e)
        self.aim_bone(f"upperarm.{side}", e); self.aim_bone(f"forearm.{side}", h_); self.aim_bone(f"hand.{side}", t_)

    def hand_pos(self, side):
        import bpy
        bpy.context.view_layer.update()
        return self.arm.matrix_world @ self.arm.pose.bones[f"hand.{side}"].tail


if __name__ == "__main__" and len(sys.argv) > 1 and sys.argv[1] == "prep":
    prep(sys.argv[2], sys.argv[3], float(sys.argv[4]))
if __name__ == "__main__" and len(sys.argv) > 1 and sys.argv[1] == "hands":
    hands_prep()
    for nm in sys.argv[2:]:
        hands_tint(nm)
