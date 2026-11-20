"""ownerf geometry (Blender, headless): MakeHuman female rig ("default" skeleton, kit bone names) + a box-modelled
PS1 low-poly body built as ring lofts. Ring shapes are ray-cast cross-sections of the MakeHuman CC0 body, then fitted
to the Flow turnaround (src/turnaround.jpg): bigger butt, fuller thighs, round ears; jacket/jeans as offset shells.
    Blender -b -P styles/zawdog/humans/ownerf/tools/geo.py
-> work/geo.blend (ownerf_rig + one object per part, UVMap in metres, face attribute "src") + work/geo.json (levels)."""
import importlib
import json
import math
import os
import sys

import addon_utils
import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import D, NAME, Slicer, fill_nan_circular, frame, ring_points, unit  # noqa: E402

W = os.path.join(D, "work"); os.makedirs(W, exist_ok=True)
A = dict(a.split("=", 1) for a in sys.argv[sys.argv.index("--") + 1:]) if "--" in sys.argv else {}
H = 1.68

# ---------------------------------------------------------------- MakeHuman female body + kit rig
_M = next(m.__name__ for m in addon_utils.modules() if m.__name__.endswith(".mpfb"))
bpy.ops.preferences.addon_enable(module=_M)
HS = importlib.import_module(_M + ".services.humanservice").HumanService
TS = importlib.import_module(_M + ".services.targetservice").TargetService
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
md = TS.get_default_macro_info_dict()
md.update(gender=0.0, muscle=0.5, weight=0.55, age=0.42, proportions=0.6, cupsize=0.55)
mh = HS.create_human(macro_detail_dict=md, scale=0.1)
bpy.context.view_layer.objects.active = mh; mh.select_set(True)
bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
zmax = max(v.co.z for v in mh.data.vertices); zmin = min(v.co.z for v in mh.data.vertices)
mh.data.transform(Matrix.Scale(H / (zmax - zmin), 4))
mh.data.transform(Matrix.Translation((0, 0, -min(v.co.z for v in mh.data.vertices))))
rig = HS.add_builtin_rig(mh, "default")
rig.name = rig.data.name = NAME + "_rig"
B = {b.name: b for b in rig.data.bones}
J = lambda n, tail=False: np.array(B[n].tail_local if tail else B[n].head_local)  # noqa: E731

gi = {g.name: g.index for g in mh.vertex_groups}
isb = np.zeros(len(mh.data.vertices), bool)
for v in mh.data.vertices:
    isb[v.index] = any(g.group == gi["body"] and g.weight > 0.5 for g in v.groups)
MV = np.array([v.co[:] for v in mh.data.vertices])
tris = []
for p in mh.data.polygons:
    vs = list(p.vertices)
    if all(isb[i] for i in vs):
        for k in range(1, len(vs) - 1):
            tris.append((vs[0], vs[k], vs[k + 1]))
SL = Slicer(MV, np.array(tris))
BV = MV[isb]


def zprof(z, x0=-0.03, x1=0.03):
    """front (min y) / back (max y) of the MakeHuman body near the mid-plane at height z."""
    m = (np.abs(BV[:, 2] - z) < 0.006) & (BV[:, 0] > x0) & (BV[:, 0] < x1)
    return (BV[m, 1].min(), BV[m, 1].max()) if m.any() else (None, None)


# landmarks measured on the MakeHuman body
Z_HJ = J("upperleg01.L")[2]
_mid = BV[(np.abs(BV[:, 0]) < 0.012) & (BV[:, 2] > 0.6)]
crotch_z = float(_mid[:, 2].min())
_navz = [(z, zprof(z)[0]) for z in np.arange(0.95, 1.10, 0.004)]
Z_NAV = 1.095   # design navel: the reference has a short upper torso / high waist (MakeHuman's own navel is at 1.035)
Z_CHIN = J("jaw", True)[2]
LM = dict(crotch=float(crotch_z), hipjoint=float(Z_HJ), navel=Z_NAV, chin=float(Z_CHIN),
          knee=float(J("lowerleg01.L")[2]), ankle=float(J("foot.L")[2]), neck=float(J("neck01")[2]),
          shoulder=float(J("upperarm01.L")[2]), headtop=float(BV[:, 2].max()))
print("landmarks", {k: round(v, 3) for k, v in LM.items()})


def sag(z):
    """mid-sagittal front/back (y) and torso half-width at the centre line, from the exact cross-section."""
    S = SL.segments(np.array([0, 0, z]), np.array([0, 0, 1.0]))
    if not len(S):
        return None
    P0, P1 = S[:, 0], S[:, 1]
    ys = []
    m = (P0[:, 0] * P1[:, 0]) <= 0
    for a, b in zip(P0[m], P1[m]):
        t = a[0] / (a[0] - b[0]) if a[0] != b[0] else 0.5
        ys.append(a[1] + (b[1] - a[1]) * t)
    if len(ys) < 2:
        return None
    yf, yb = min(ys), max(ys); yc = (yf + yb) / 2
    r, _ = SL.radii(np.array([0, yc, z]), np.array([0, 0, 1.0]), np.array([0, -1.0, 0]), [90, 270])
    return yf, yb, r


if A.get("analyze"):
    for z in np.arange(0.76, 1.47, 0.01):
        s_ = sag(z)
        if s_:
            print(f"z={z:.2f} front={s_[0]:+.3f} back={s_[1]:+.3f} depth={s_[1]-s_[0]:.3f} halfw={s_[2][0]:.3f}/{s_[2][1]:.3f}")
    sys.exit(0)

# clothing levels (relative to the body, measured on the reference: navel 1.150, belt top 1.044, jacket hem 1.071,
# crop-top bottom 1.247, crotch 0.885 on a 1.68 figure)
Z_BELT_T = Z_NAV - 0.085
Z_BELT_B = Z_BELT_T - 0.034
Z_HEM = Z_BELT_T - 0.006
Z_CROP = Z_NAV + 0.095


# ---------------------------------------------------------------- mesh accumulation
class Part:
    def __init__(self, name):
        self.name = name; self.V = []; self.F = []; self.UV = []; self.SRC = []

    def add_v(self, pts):
        i0 = len(self.V); self.V.extend([tuple(map(float, p)) for p in pts]); return list(range(i0, i0 + len(pts)))

    def face(self, idx, uvs, src):
        self.F.append(tuple(idx)); self.UV.append([tuple(map(float, u)) for u in uvs]); self.SRC.append(src)


def arclen(P, closed):
    d = np.linalg.norm(np.diff(np.vstack([P, P[:1]]) if closed else P, axis=0), axis=1)
    return np.concatenate([[0], np.cumsum(d)])


def loft(part, rings, src, closed=True, cap0=False, cap1=False, v_off=0.0, flip=False, srcs=None):
    """quads between consecutive rings (same vertex count). UV: u = arc length around (mean over the two rings),
    v = distance along the loft; a closed ring gets a seam column. Returns the vertex index rings."""
    R = [np.asarray(r, float) for r in rings]
    idx = [part.add_v(r) for r in R]
    K = len(R[0])
    U = [arclen(r, closed) for r in R]
    vpos = [v_off]
    for a, b in zip(R[:-1], R[1:]):
        vpos.append(vpos[-1] + float(np.linalg.norm(a - b, axis=1).mean()))
    for i in range(len(R) - 1):
        uu = (U[i] + U[i + 1]) / 2
        for k in range(K if closed else K - 1):
            k2 = (k + 1) % K
            u0, u1 = uu[k], (uu[k + 1] if k + 1 < len(uu) else uu[-1])
            q = (idx[i][k], idx[i][k2], idx[i + 1][k2], idx[i + 1][k])
            quv = ((u0, vpos[i]), (u1, vpos[i]), (u1, vpos[i + 1]), (u0, vpos[i + 1]))
            if flip:
                q = q[::-1]; quv = quv[::-1]
            part.face(q, quv, srcs[i] if srcs else src)
    for cap, ii, rev in ((cap0, 0, True), (cap1, len(R) - 1, False)):
        if cap:
            P = R[ii]; c = P.mean(0)
            n_, f_, s_ = frame(np.cross(P[1] - P[0], P[2] - P[0]), P[0] - c)
            uv = [((p - c) @ s_ + 1.0, (p - c) @ f_ + 1.0) for p in P]
            ids = idx[ii][::-1] if (rev ^ flip) else idx[ii]
            uvs = uv[::-1] if (rev ^ flip) else uv
            part.face(ids, uvs, src if isinstance(cap, bool) else cap)
    return idx


def section(c, axis, front, angles, rmax=0.4, fill=True):
    r, basis = SL.radii(c, axis, front, angles, rmax=rmax)
    if fill:
        r = fill_nan_circular(r)
    return r, basis


def fit(r, angles, w=None, d_front=None, d_back=None):
    """scale radii so the ring's half-width (side) / front / back extents hit targets."""
    a = np.radians(angles); x = r * np.sin(a); y = r * np.cos(a)
    out = r.copy()
    sx = (w / 2) / np.abs(x).max() if w else 1.0
    sf = d_front / max(y.max(), 1e-6) if d_front else 1.0
    sb = d_back / max(-y.min(), 1e-6) if d_back else 1.0
    X = x * sx; Y = np.where(y > 0, y * sf, y * sb)
    return np.hypot(X, Y)


# ================================================================= HEAD (round 2): real low-poly head, see headmesh.py
# (spliced into geo.py; uses its globals: HS, mh, LM, Z_CHIN, Part, Slicer, fill_nan_circular, sag, J ...)
import headmesh  # noqa: E402

FRONT = np.array([0, -1.0, 0])
UP = np.array([0, 0, 1.0])


def head_c_y(z):
    s_ = sag(z)
    return (s_[0] + s_[1]) / 2 if s_ else -0.03


UD_MH = (os.path.join(os.environ["APPDATA"], "Blender Foundation/Blender/5.2/mpfb/data") if os.name == "nt"
         else os.path.expanduser("~/Library/Application Support/Blender/5.2/mpfb/data"))
Z_NECK_CUT = 1.392
Z_EYE = float(J("eye.L")[2])


def head_reshape(p):
    """toward TomGrave3D's head: a slightly longer, narrower face with a firmer chin and a deeper brow / nose line."""
    x, y, z = p
    q = np.array(p, float)
    face = 1.0 if y < -0.035 else max(0.0, 1 - (y + 0.035) / 0.05)          # front of the head only
    if z < Z_EYE:                                                           # lower face: a touch longer + narrower
        k = (Z_EYE - z) / max(Z_EYE - Z_CHIN, 1e-3)
        q[2] = z - 0.012 * min(k, 1.3) * face
        q[0] = x * (1 - 0.08 * min(k, 1.0) * face)
    if abs(z - (Z_CHIN + 0.004)) < 0.022 and abs(x) < 0.025:               # chin a little forward
        q[1] -= 0.002 * face * (1 - abs(x) / 0.025)
    if z < Z_CHIN + 0.03 and abs(x) < 0.04:                                # pointier chin (his long V jaw)
        q[0] *= 1 - 0.12 * face * max(0.0, (Z_CHIN + 0.03 - z) / 0.04)
    if abs(z - (Z_EYE + 0.018)) < 0.012 and abs(x) < 0.05:                  # brow ridge
        q[1] -= 0.003 * face
    if abs(x) < 0.016 and Z_EYE - 0.050 < z < Z_EYE - 0.004 and y < -0.09:  # nose: out ~12 %
        q[1] -= 0.009 * (1 - abs(x) / 0.016) * (1 - abs(z - (Z_EYE - 0.034)) / 0.03 if abs(z - (Z_EYE - 0.034)) < 0.03 else 0.2)
    if Z_CHIN - 0.004 < z < Z_CHIN + 0.020 and abs(x) < 0.03 and y < -0.07:   # defined chin
        q[1] -= 0.003
    if Z_EYE + 0.010 < z < Z_EYE + 0.030 and abs(x) < 0.055 and y < -0.07:   # brow ridge
        q[1] -= 0.003
    if y > 0.005 and z > Z_EYE - 0.04:                                      # more skull behind the ears
        q[1] += 0.010 * min(1.0, (y - 0.005) / 0.05) * min(1.0, (z - (Z_EYE - 0.04)) / 0.04)
    if z < 1.445:                                                           # neck: a tube inside the collar (no shoulder flare)
        cyn = -0.012; dx, dy = q[0], q[1] - cyn; rr = math.hypot(dx, dy); lim = 0.050 + 0.002 * (z - 1.392) / 0.05
        if rr > lim:
            q[0] = dx * lim / rr; q[1] = cyn + dy * lim / rr
    return q


HV, HF, HUV, HINFO = headmesh.build_head(HS, mh, UD_MH, Matrix.Identity(4), Z_NECK_CUT, ratio=float(A.get("head_ratio", 0.55)),
                                         reshape=head_reshape)
print("head", HINFO)
head = Part("head")
head.add_v(HV)
for k, f in enumerate(HF):
    head.face(f, HUV[k] if HUV else [(0.0, 0.0)] * len(f), "head")
top_z = max(v[2] for v in HV)
_ht = []
for f in HF:
    for k in range(1, len(f) - 1):
        _ht.append((f[0], f[k], f[k + 1]))
HSL = Slicer(np.array(HV), np.array(_ht))
A_HEAD = list(range(0, 360, 15))
HEADR = {}
for z in np.arange(Z_NECK_CUT + 0.01, top_z - 0.003, 0.01):
    S_ = HSL.segments(np.array([0, 0, z]), UP)
    if not len(S_):
        continue
    ys = []
    for a, b in zip(S_[:, 0], S_[:, 1]):
        if a[0] * b[0] <= 0 and a[0] != b[0]:
            t = a[0] / (a[0] - b[0]); ys.append(a[1] + (b[1] - a[1]) * t)
    cy = (min(ys) + max(ys)) / 2 if len(ys) >= 2 else head_c_y(z)
    r, _ = HSL.radii(np.array([0, cy, z]), UP, FRONT, A_HEAD, rmax=0.2)
    HEADR[round(float(z), 4)] = ([0.0, float(cy), float(z)], list(fill_nan_circular(r)))
# round human ears (the proxy's are flat bumps): an oval rim on the skull side, tilted back, a cupped centre, a band back
# into the skull; part of the head mesh, so they take the head texture (skin)
EAR_ZC = Z_EYE - 0.020; EAR_AC = 104.0; EAR_H = 0.070; EAR_W = 0.043
EAR_A = []
for sg in (1, -1):
    keys = sorted(HEADR); zk = min(keys, key=lambda q: abs(q - EAR_ZC)); c_, r_ = HEADR[zk]
    rs = float(np.interp(EAR_AC, A_HEAD, r_)); aa = math.radians(EAR_AC)
    base = np.array([sg * math.sin(aa) * (rs - 0.004), c_[1] - math.cos(aa) * (rs - 0.004), EAR_ZC])
    wv = np.array([sg * math.sin(aa), -math.cos(aa), 0.0])                  # out of the skull
    uv_ = -np.array([sg * math.cos(aa), math.sin(aa), 0.0])                 # toward the face
    back = math.radians(16)
    w2 = wv * math.cos(back) - uv_ * math.sin(back) * 0.0
    up = np.array([0, 0, 1.0])
    RIM = [(0.006, 0.50), (-0.20, 0.47), (-0.42, 0.34), (-0.50, 0.08), (-0.44, -0.18), (-0.28, -0.40), (-0.06, -0.50),
           (0.10, -0.30)]
    rim = []; bandp = []
    for u, v in RIM:
        outw = 0.004 + 0.020 * max(0.0, -u) / 0.5                            # the back rim stands off the skull
        p = base + uv_ * (u * EAR_W) + up * (v * EAR_H) + wv * outw - uv_ * outw * math.tan(back)
        rim.append(p); bandp.append(base + uv_ * (u * EAR_W * 0.8) + up * (v * EAR_H * 0.85) - wv * 0.004)
    cen = base + uv_ * (-0.12 * EAR_W) + wv * 0.002
    inner = [cen + (p - cen) * 0.55 - wv * 0.002 for p in rim]               # helix ring -> recessed concha
    ri = head.add_v(rim); bi = head.add_v(bandp); ci = head.add_v([cen])[0]; ii = head.add_v(inner)
    n = len(RIM)
    for k in range(n):
        k2 = (k + 1) % n
        fh = (ri[k], ri[k2], ii[k2], ii[k]) if sg > 0 else (ri[k2], ri[k], ii[k], ii[k2])
        fc = (ii[k], ii[k2], ci) if sg > 0 else (ii[k2], ii[k], ci)
        fb = (ri[k2], ri[k], bi[k], bi[k2]) if sg > 0 else (ri[k], ri[k2], bi[k2], bi[k])
        # three tones: lit helix rim, dark concha, mid back band
        head.face(fh, ((0.9, 0.93),) * 4, "head"); head.face(fc, ((0.9, 0.9),) * 3, "head"); head.face(fb, ((0.9, 0.96),) * 4, "head")
    for p in rim:
        EAR_A.append(float(np.degrees(np.arctan2(abs(p[0]), -(p[1] - c_[1])))))
EAR_Z0, EAR_Z1 = EAR_ZC - EAR_H / 2, EAR_ZC + EAR_H / 2
print("ears z %.3f..%.3f angle %.0f..%.0f" % (EAR_Z0, EAR_Z1, min(EAR_A), max(EAR_A)))
ears = Part("ears")                                          # (the head mesh carries its own round ears now)

# ================================================================= HAIR (round 2): TomGrave3D's bob, rebuilt
# shell (crown volume, Motoko V bangs, cap edge ABOVE the ears so the round ears show) + a nape duck-tail flick with
# spikes + two separate side-lock wedges hanging in front of the ears to the jaw + an underside fold (thickness).
hair = Part("hair")
_HF = [0, 7, 14, 22, 30, 40, 50, 60, 75, 90, 105, 120, 135, 150, 165]
A_HAIR = _HF + [180] + [360 - a for a in reversed(_HF[1:])]       # denser at the front: the V bangs


def head_r(z, ang):
    keys = sorted(HEADR)
    if z > keys[-1]:
        c, r = HEADR[keys[-1]]
        k_ = max(0.0, 1 - ((z - keys[-1]) / max(top_z - keys[-1], 1e-3)) ** 2)
        return float(np.interp(ang % 360, A_HEAD + [360], r + [r[0]])) * math.sqrt(k_), c[1]
    zz = max(z, keys[0])
    zi = np.interp(zz, keys, range(len(keys)))
    i0 = int(math.floor(zi)); i1 = min(i0 + 1, len(keys) - 1); t = zi - i0

    def rr(i):
        c, r = HEADR[keys[i]]
        return np.interp(ang % 360, A_HEAD + [360], r + [r[0]]), c[1]
    r0, y0 = rr(i0); r1, y1 = rr(i1)
    return r0 * (1 - t) + r1 * t, y0 * (1 - t) + y1 * t


def hang_r(z, a, k=0.7):
    """behind and beside the head the bob hangs from the widest skull level (it never wraps the neck)."""
    r, cy = head_r(z, a)
    ca = math.cos(math.radians(a))
    if ca < 0.35:
        rmax = max(head_r(zz, a)[0] for zz in np.linspace(z, top_z - 0.05, 8))
        r = r + (rmax - r) * float(np.clip((0.35 - ca) / 0.45, 0, 1)) * k
    return r, cy


def pol(a, r, cy, z):
    aa = math.radians(a)
    return [math.sin(aa) * r, cy - math.cos(aa) * r, z]


# cap edge height per angle (0 = front): V bangs, temples, above the ears, behind the ears, nape flick spikes
ZE = Z_EYE
# cap edge height by angle (0 = front): long narrow centre spike to the nose bridge, open gaps, a sharp side spike,
# temple spike, side locks' root, above the round ears, behind them, nape tufts (alternating long / short)
ZH_A = [0, 7, 14, 22, 30, 40, 50, 60, 75, 90, 105, 120, 135, 150, 165, 180]
ZH_Z = [ZE - 0.026, ZE + 0.030, ZE + 0.072, ZE - 0.002, ZE + 0.046, ZE + 0.012, ZE + 0.030, ZE + 0.010, EAR_Z1 + 0.018,
        EAR_Z1 + 0.014, EAR_Z1 + 0.012, EAR_Z1 - 0.020, EAR_Z0 + 0.004, EAR_Z0 - 0.022, EAR_Z0 + 0.012, EAR_Z0 - 0.004]
zh = lambda a: float(np.interp(min(a % 360, 360 - a % 360), ZH_A, ZH_Z))  # noqa: E731


def th_of(a, z):
    aa = math.radians(a); back = 0.5 - 0.5 * math.cos(aa); side = abs(math.sin(aa))
    crown = max(0.0, (z - (top_z - 0.07)) / 0.07)
    return 0.009 + 0.012 * back + 0.006 * side + 0.012 * crown


hrings = []
# crown: a real dome (no flat top / fez step): rings on a circle profile, radius following the skull + hair volume
R0 = 0.100; Z0 = top_z + 0.030 - R0
for phi in (20, 40, 60, 80):
    f = math.sin(math.radians(phi)); zc = Z0 + R0 * math.cos(math.radians(phi))
    pts = []
    for a in A_HAIR:
        rb, cy = head_r(min(zc, top_z - 0.055), a)
        rb = max(rb, head_r(top_z - 0.055, a)[0])
        pts.append(pol(a, f * (rb + th_of(a, zc) + 0.006), cy + 0.004, zc))
    hrings.append(np.array(pts))
Z3 = Z0 + R0 * math.cos(math.radians(80))
# mid + edge rings: each angle runs down to its own cap edge; the back edge flares out into the duck-tail flick
for frac in (0.55, 1.0):
    pts = []
    for a in A_HAIR:
        z = Z3 + (zh(a) - Z3) * frac
        r, cy = hang_r(z, a)
        back = max(0.0, -math.cos(math.radians(a)))
        am = min(a % 360, 360 - a % 360)
        spike = 1.25 if am == 150 else (0.75 if am in (180, 135) else 0.5)   # two bold flicks out past the neck
        t_ = th_of(a, z) + (0.040 * spike * back ** 1.5 if frac > 0.9 else -0.002 * back)
        if am <= 50:
            t_ = 0.010 if frac > 0.9 else t_ + 0.008                          # thick bangs overhang, tips just off the forehead
        if 100 <= am <= 130 and frac > 0.9:
            t_ = min(t_, th_of(a, z) + 0.004)                                 # behind the ears: tucked in (no dark flaps)
        zz = z + (0.008 * back if frac > 0.9 else 0.0)                      # the duck-tail flick lifts a little
        pts.append(pol(a, r + t_, cy + 0.004, zz))
    hrings.append(np.array(pts))
loft(hair, hrings, "hair")
# underside fold: the edge turns back in to the skull, so the shell has thickness and nothing is seen through it
EDGE = len(hair.V) - len(A_HAIR)
inner = []
for a in A_HAIR:
    zi = zh(a) + 0.016
    r, cy = head_r(zi, a)
    inner.append(pol(a, r - 0.003, cy, zi))
ii = hair.add_v(inner)
for k in range(len(A_HAIR)):
    k2 = (k + 1) % len(A_HAIR)
    hair.face((EDGE + k, EDGE + k2, ii[k2], ii[k]), ((k, 1.0), (k + 1, 1.0), (k + 1, 1.04), (k, 1.04)), "hairin")
cz = hair.add_v([np.array([0, head_r(top_z, 180)[1] + 0.006, top_z + 0.021])])[0]
for k in range(len(A_HAIR)):
    k2 = (k + 1) % len(A_HAIR)
    hair.face((k2, k, cz), ((k + 1, 0), (k, 0), (k + 0.5, -1)), "hair")

# side locks: tapered wedges from under the cap at the temple down to the jaw, in front of the ears, tips flared out
LOCK_A0 = max(55.0, min(EAR_A) - 21.0)                       # in front of the ear, the ear stays visible
for sg in (1, -1):
    rings_ = []
    zt0, zt1 = ZE + 0.042, Z_CHIN + 0.026
    for t in (0.0, 0.30, 0.62, 0.86):
        z = zt0 + (zt1 - zt0) * t
        a = LOCK_A0 - 11.0 * t ** 1.5
        r, cy = head_r(z, a)
        w = 0.052 * (1 - 0.30 * t); th = 0.018 * (1 - 0.30 * t)
        rc = r + 0.003 + th / 2 + 0.014 * t ** 2
        aa = math.radians(a); out = np.array([sg * math.sin(aa), -math.cos(aa), 0.0]); tan = np.array([sg * math.cos(aa), math.sin(aa), 0.0])
        c = np.array([sg * math.sin(aa) * rc, cy - math.cos(aa) * rc, z])
        rings_.append(np.array([c + out * th / 2, c - tan * w / 2, c - out * th / 2, c + tan * w / 2]))
    tip_a = LOCK_A0 - 16.0
    rt, cyt = head_r(zt1 - 0.012, tip_a)
    tip = np.array(pol(tip_a, rt + 0.024, cyt, zt1 - 0.010)); tip[0] *= sg
    ids = loft(hair, rings_, "hair", cap0=True, flip=(sg < 0))
    ti = hair.add_v([tip])[0]
    last = ids[-1]
    for k in range(4):
        k2 = (k + 1) % 4
        f = (last[k], last[k2], ti) if sg > 0 else (last[k2], last[k], ti)
        hair.face(f, ((k, 1.0), (k + 1, 1.0), (k + 0.5, 1.2)), "hair")


# ================================================================= TORSO body + PELVIS + LEGS (one skin/jeans mesh)
A12 = list(range(0, 360, 30))
body = Part("body")


def tcen(z):
    s_ = sag(z)
    return (s_[0] + s_[1]) / 2 if s_ else 0.0


WLIM = ([1.25, 1.265, 1.31, 1.355, 1.385, 1.405], [0.16, 0.150, 0.152, 0.148, 0.12, 0.075])


def bust_k(z, ang):
    """round 2: a fuller bust (both cups forward/out, the cleavage between them kept)."""
    a = np.abs(((np.asarray(ang, float) + 180) % 360) - 180)
    kz = math.exp(-((z - 1.236) / 0.040) ** 2)
    return 1 + 0.115 * kz * np.exp(-((a - 38) / 22) ** 2) + 0.03 * kz * np.exp(-(a / 14) ** 2)


def tsec(z, ang=A12, rmax=0.30, clamp=True):
    c = np.array([0, tcen(z), z])
    r, bs = section(c, UP, FRONT, ang, rmax=rmax)
    r = r * bust_k(z, ang)
    if clamp and z >= 1.25:
        a = np.radians(ang); w = float(np.interp(z, *WLIM))
        x = np.clip(r * np.sin(a), -w, w); y = r * np.cos(a)
        r = np.hypot(x, y)
    return c, r, bs


TORSO_Z = [Z_BELT_T, Z_NAV - 0.05, Z_NAV, Z_NAV + 0.048, Z_CROP, 1.236, 1.27, 1.31, 1.355, 1.40]
PELV_Z = [Z_BELT_B, 0.855, LM['crotch'] + 0.022]   # belt bottom, butt, crotch top (H ring)
TORSOR = {}
torso_rings = []
for z in TORSO_Z:
    c, r, bs = tsec(z)
    torso_rings.append(ring_points(c, bs, A12, r)); TORSOR[round(z, 4)] = (c, r)
pelv_rings = []
BUTT = np.array([1.0, 1.0, 1.03, 1.07, 1.16, 1.28, 1.33, 1.28, 1.16, 1.07, 1.03, 1.0])   # per angle (0 = front)
for i, z in enumerate(PELV_Z):
    c, r, bs = tsec(z, rmax=0.26)
    k = [0.45, 1.0, 0.8][i]
    r = r * (1 + (BUTT - 1) * k)
    r = r * np.array([1, 1, 1.02, 1.05, 1.04, 1.0, 1.0, 1.0, 1.04, 1.05, 1.02, 1]) ** (1 if i else 0.5)
    pelv_rings.append(ring_points(c, bs, A12, r)); TORSOR[round(z, 4)] = (c, r)
# loft from the crotch-top ring up to the neck: pelvis + torso share ring vertex order (A12)
trunk = [pelv_rings[2], pelv_rings[1], pelv_rings[0]] + torso_rings
srcs = ["jeans", "jeans", "jeans"] + ["torso"] * (len(torso_rings) - 1)
trunk_idx = loft(body, trunk, "torso", srcs=srcs)
H_IDX = trunk_idx[0]
crotch_c = (pelv_rings[2][0] + pelv_rings[2][6]) / 2
crotch_c[2] = LM["crotch"] - 0.004
C_IDX = body.add_v([crotch_c])[0]


def leg_rings(sg):
    s = "L" if sg > 0 else "R"
    hj, kn, an = J(f"upperleg01.{s}"), J(f"lowerleg01.{s}"), J(f"foot.{s}")
    out = []; info = []
    # thigh: t from hip joint to knee; calf: knee to ankle
    # fuller thighs: wider, and deeper at the BACK (hamstring/butt) rather than pushing the front out
    THIGH = [(0.22, 1.13, 1.02, 1.18), (0.48, 1.12, 1.00, 1.15), (0.78, 1.04, 1.00, 1.06), (1.0, 1.0, 1.0, 1.0)]
    for t, kw, kdf, kdb in THIGH:
        c = hj + (kn - hj) * t
        ax = (kn - hj) if t < 1 else (an - hj)
        angs = [((a if sg > 0 else -a)) % 360 for a in range(0, 360, 45)]
        r, bs = section(c, ax, FRONT, angs, rmax=0.16)
        a = np.radians(angs); x = r * np.sin(a); y = r * np.cos(a)
        x *= kw; y = np.where(y > 0, y * kdf, y * kdb)
        r2 = np.hypot(x, y) + 0.007                        # jeans: regular fit over the leg
        out.append(ring_points(c, bs, angs, r2)); info.append(("thigh", t))
    CALF = [(0.22, 0.0), (0.50, 0.0), (0.665, 0.0), (0.68, 0.009), (0.84, 0.009), (0.845, -0.002)]
    for t, extra in CALF:
        c = kn + (an - kn) * t
        angs = [((a if sg > 0 else -a)) % 360 for a in range(0, 360, 45)]
        r, bs = section(c, an - kn, FRONT, angs, rmax=0.12)
        if t > 0.60:
            r = np.full_like(r, max(np.mean(r) * 0.92 + 0.004, 0.044))     # straight hem, rolled cuff
        if t < 0.55:
            r = r * 0.93                                   # slimmer lower leg (reference jeans taper)
        r2 = r + 0.007 + extra
        if t >= 0.845:
            r2 = np.full_like(r, 0.050)                       # return inside the cuff, around the boot shaft
        out.append(ring_points(c, bs, angs, r2)); info.append(("calf", t))
    # straight leg in profile (his): the front line runs straight from the thigh top to the cuff, no forward kink at
    # the knee / shin (MakeHuman's knee sits 3 cm ahead of hip and ankle); whole rings slide along Y, shapes kept
    zc = [float(np.mean(r_[:, 2])) for r_ in out]; fy = [float(r_[:, 1].min()) for r_ in out]
    ic = next(i for i, (k, t) in enumerate(info) if k == "calf" and t >= 0.665)
    for i in range(1, ic):
        u = (zc[0] - zc[i]) / max(zc[0] - zc[ic], 1e-6)
        target = fy[0] + (fy[ic] - fy[0]) * u - (0.003 if info[i] == ("thigh", 1.0) else 0.0)
        dy = float(np.clip(target - fy[i], -0.006, 0.025))
        out[i] = out[i] + np.array([0.0, dy, 0.0])
    return out, info


LEGS = {}
for sg in (1, -1):
    rings_, info = leg_rings(sg)
    # top: [H0, H30.., H180, C] (left)  /  [H0, H330.., H180, C] (right)
    hseq = [H_IDX[(k * sg) % 12] for k in range(0, 7)] + [C_IDX]
    leg_ids = [body.add_v(r) for r in rings_]
    # leg ring k=0 is the leg's front; align: hseq[1] (H30) ~ leg front
    seq_rings = [hseq] + leg_ids
    vpos = 0.0
    for i in range(len(seq_rings) - 1):
        a_, b_ = seq_rings[i], seq_rings[i + 1]
        if i == 0:
            b_ = [b_[(k - 1) % 8] for k in range(8)]          # H0 -> leg vertex 315 (front-inner)
        src = "jeans"
        if i >= 1 and info[i - 1][0] == "calf" and info[i - 1][1] >= 0.68:
            src = "jcuff"
        PA = np.array([body.V[j] for j in a_]); PB = np.array([body.V[j] for j in b_])
        ua = arclen(PA, True); ub = arclen(PB, True); uu = (ua + ub) / 2
        dv = float(np.linalg.norm(PA - PB, axis=1).mean())
        for k in range(8):
            k2 = (k + 1) % 8
            q = (a_[k], a_[k2], b_[k2], b_[k]) if sg > 0 else (a_[k2], a_[k], b_[k], b_[k2])
            uv = ((uu[k], vpos), (uu[k + 1], vpos), (uu[k + 1], vpos + dv), (uu[k], vpos + dv))
            body.face(q, uv if sg > 0 else (uv[1], uv[0], uv[3], uv[2]), src)
        vpos += dv
    LEGS[sg] = leg_ids
    # hip sides: the H ring's outer vertices reach the thigh-top ring (no notch between butt and thigh)
    T1 = rings_[0]
    for hk, tk in ((2, 1), (3, 2), (4, 3)):
        hv = H_IDX[(hk * sg) % 12]; P_ = list(body.V[hv])
        P_[0] = sg * max(abs(P_[0]), abs(T1[tk][0]) + 0.004)
        body.V[hv] = tuple(P_)

# torso faces under the jacket (sides/back above the belt) are dropped: nothing there can poke through the jacket
_keep = []
for f, src_ in zip(body.F, body.SRC):
    if src_ == "torso":
        P_ = np.array([body.V[i] for i in f]); cz_ = P_[:, 2].mean()
        ang_ = np.degrees(np.arctan2(P_[:, 0].mean(), -(P_[:, 1].mean() - tcen(cz_))))
        _keep.append(abs(ang_) < (52 if cz_ > 1.24 else 88))      # near the armholes only the strip inside the lapels
    else:
        _keep.append(True)
body.F = [f for f, k in zip(body.F, _keep) if k]; body.UV = [u for u, k in zip(body.UV, _keep) if k]
body.SRC = [x for x, k in zip(body.SRC, _keep) if k]

# ================================================================= JACKET (open shell + sleeves + collar)
jacket = Part("jacket")
J_LEV = [Z_HEM, Z_NAV - 0.02, Z_NAV + 0.05, Z_CROP + 0.02, 1.238, 1.26]          # hem .. armpit (A)
OPEN = dict(zip(J_LEV, [30, 28, 28, 32, 33, 30]))
ZA = 1.26; ZM = 1.31; ZS = 1.355; ZN = 1.40
J_ANG_SIDE = [60, 90, 120, 150, 180, 210, 240, 270, 300]
DENSE = list(range(0, 360, 5))


def jring(z, phi, gap_back=0.022, gap_front=0.012, box=0.10, shoulder=0.0):
    c, rd, bs = tsec(z, DENSE)
    angs = [phi, 38] + J_ANG_SIDE + [322, 360 - phi]
    rr = np.interp(angs, DENSE + [360], list(rd) + [rd[0]])
    a = np.radians(angs)
    gap = gap_front + (gap_back - gap_front) * (0.5 - 0.5 * np.cos(a))
    x = rr * np.sin(a); y = rr * np.cos(a)
    bx = np.abs(x).max(); byf = y.max(); byb = -y.min()
    X = x + (np.sign(x) * bx - x) * box * np.abs(np.sin(a)) ** 2
    Y = y + (np.where(y > 0, byf, -byb) - y) * box * np.abs(np.cos(a)) ** 2
    R = np.hypot(X, Y) + gap
    if shoulder:
        sx = np.abs(np.sin(a))
        Xn = R * np.sin(a); Yn = R * np.cos(a)
        Xn = np.where(sx > 0.8, np.sign(Xn) * np.maximum(np.abs(Xn), shoulder * (0.9 + 0.1 * sx)), Xn)
        R = np.hypot(Xn, Yn)
    return ring_points(c, bs, angs, R), angs


jr = []
for z in J_LEV:
    pts, angs = jring(z, OPEN[z])
    if z == Z_HEM:                                  # flare the hem a little (boxy cropped jacket)
        cc = np.array([0, pts[:, 1].mean(), z]); pts = cc + (pts - cc) * np.array([1.05, 1.03, 1.0])
    jr.append(pts)
JANG = angs
for z, sh_, phi in ((ZM, 0.168, 27), (ZS, 0.172, 30)):
    pts, _ = jring(z, phi, gap_back=0.02, gap_front=0.014, box=0.12, shoulder=sh_)
    jr.append(pts)
neck_c = np.array([0, tcen(ZN) + 0.006, ZN])
Npts = []
for a in [30] + JANG[1:-1] + [330]:
    aa = math.radians(a)
    Npts.append(neck_c + np.array([math.sin(aa) * 0.068, -math.cos(aa) * 0.060, 0.0]))
jr.append(np.array(Npts))
jidx = loft(jacket, jr, "jacket", closed=False)
# armholes: remove the quads between A-M and M-S at the 60..120 deg columns (both sides) -> bridged to the sleeves
iA = len(J_LEV) - 1
cols = {}
for sg in (1, -1):
    c60 = JANG.index(60 if sg > 0 else 300); c120 = JANG.index(120 if sg > 0 else 240)
    cols[sg] = (min(c60, c120), max(c60, c120))
keep = []
nper = len(JANG) - 1
for fi, f in enumerate(jacket.F):
    row = fi // nper; col = fi % nper
    hole = False
    if row in (iA, iA + 1):
        for sg in (1, -1):
            lo, hi = cols[sg]
            if lo <= col < hi:
                hole = True
    keep.append(not hole)
jacket.F = [f for f, k in zip(jacket.F, keep) if k]
jacket.UV = [u for u, k in zip(jacket.UV, keep) if k]
jacket.SRC = [s for s, k in zip(jacket.SRC, keep) if k]
# hem return (inner flange) hides the gap to the jeans / skin
hem_in = []
for k, a in enumerate(JANG):
    p = np.array(jacket.V[jidx[0][k]]); c = np.array([0, p[1] * 0 + jr[0][:, 1].mean(), p[2]])
    q = c + (p - c) * 0.80; q[2] += 0.012
    hem_in.append(q)
hin = jacket.add_v(hem_in)
for k in range(len(JANG) - 1):
    q = (hin[k], hin[k + 1], jidx[0][k + 1], jidx[0][k])
    jacket.face(q, ((k, -0.03), (k + 1, -0.03), (k + 1, 0), (k, 0)), "hem")

# ---- sleeves: bridge the 8-vertex armhole to rings along the upper arm
SLEEVE = {}
for sg in (1, -1):
    s = "L" if sg > 0 else "R"
    sh, el = J(f"upperarm01.{s}"), J(f"lowerarm01.{s}")
    lo, hi = cols[sg]
    hole = [jidx[iA + 2][lo], jidx[iA + 2][lo + 1], jidx[iA + 2][hi], jidx[iA + 1][hi], jidx[iA][hi], jidx[iA][lo + 1],
            jidx[iA][lo], jidx[iA + 1][lo]]           # S60 S90 S120 M120 A120 A90 A60 M60 (left)
    axis = el - sh
    angs = [((a if sg > 0 else -a)) % 360 for a in (0, 45, 90, 135, 180, 225, 270, 315)]
    up = np.array([sg * 0.6, 0, 1.0])                  # sleeve ring "front" = towards the shoulder top / outside
    srings = []; tags = []
    SPEC = [(0.30, 0.031, "sleeve"), (0.58, 0.040, "sleeve"), (0.80, 0.045, "sleeve"), (0.875, 0.036, "cuffband"),
            (1.00, 0.033, "cuffband"), (1.01, 0.004, "cuffband")]
    for t, puff, tag in SPEC:
        c = sh + axis * t
        r, bs = section(c, axis, up, angs, rmax=0.10)
        r = np.full_like(r, np.median(r)) * 0.55 + r * 0.45 + puff
        if t > 1.0:
            r = np.full_like(r, 0.040)
        srings.append(ring_points(c, bs, angs, r)); tags.append(tag)
    ids = [jacket.add_v(r) for r in srings]
    # align ring vertex 0 (towards "up") with the hole vertex S90 (index 1 in the hole list)
    HP = np.array([jacket.V[j] for j in hole]); R0 = srings[0]
    best = min(range(8), key=lambda o: sum(np.linalg.norm(HP[k] - R0[(k + o) % 8]) for k in range(8)))
    bestr = min(range(8), key=lambda o: sum(np.linalg.norm(HP[k] - R0[(o - k) % 8]) for k in range(8)))
    if sum(np.linalg.norm(HP[k] - R0[(bestr - k) % 8]) for k in range(8)) < sum(np.linalg.norm(HP[k] - R0[(k + best) % 8]) for k in range(8)):
        order = [(bestr - k) % 8 for k in range(8)]
    else:
        order = [(k + best) % 8 for k in range(8)]
    seq = [hole] + [[r_[o] for o in order] for r_ in ids]
    vpos = 0.0
    # orientation: outward normals (test with the first band)
    def band(a_, b_, tag, vpos, flip):
        PA = np.array([jacket.V[j] for j in a_]); PB = np.array([jacket.V[j] for j in b_])
        ua = arclen(PA, True); ub = arclen(PB, True); uu = (ua + ub) / 2; dv = float(np.linalg.norm(PA - PB, axis=1).mean())
        for k in range(8):
            k2 = (k + 1) % 8
            q = (a_[k], a_[k2], b_[k2], b_[k]); uv = ((uu[k], vpos), (uu[k + 1], vpos), (uu[k + 1], vpos + dv), (uu[k], vpos + dv))
            if flip:
                q = q[::-1]; uv = uv[::-1]
            jacket.face(q, uv, tag)
        return vpos + dv
    # decide flip from the geometry: normal of the first quad vs outward (away from the arm axis)
    a_, b_ = seq[0], seq[1]
    p0, p1, p2 = (np.array(jacket.V[j]) for j in (a_[0], a_[1], b_[1]))
    nrm = np.cross(p1 - p0, p2 - p0); cen = (p0 + p2) / 2
    axp = sh + axis * 0.15
    outward = (cen - axp) - axis / np.linalg.norm(axis) * ((cen - axp) @ (axis / np.linalg.norm(axis)))
    flip = nrm @ outward < 0
    tags = ["sleeve"] + tags
    for i in range(len(seq) - 1):
        vpos = band(seq[i], seq[i + 1], tags[i + 1] if i else "sleeve", vpos, flip)
    SLEEVE[sg] = seq

# ---- collar: stand-up lilac collar on the neckline ring, flaring out, turned-down fold with pointed front corners
NRING = jidx[-1]
ctop = []; cfold = []
for k, a in enumerate(JANG):
    p = np.array(jacket.V[NRING[k]])
    v = p - neck_c; v[2] = 0
    aa = math.radians(a); frontness = max(0.0, math.cos(aa)); backness = max(0.0, -math.cos(aa))
    q = neck_c + v * (1.26 + 0.30 * frontness); q[2] = p[2] + 0.050 + 0.010 * backness - 0.030 * frontness
    q[1] -= 0.010 * frontness
    ctop.append(q)
    f_ = neck_c + v * (1.62 + 0.75 * frontness); f_[2] = q[2] - 0.048 - 0.034 * frontness
    if k in (0, len(JANG) - 1):                    # pointed collar tips
        f_ = neck_c + v * 1.66; f_[2] = q[2] - 0.052; f_[1] -= 0.010
    f_[1] -= 0.020 * frontness
    cfold.append(f_)
cti = jacket.add_v(ctop); cfi = jacket.add_v(cfold)
PA = np.array([jacket.V[j] for j in NRING]); PB = np.array(ctop)
uu = (arclen(PA, False) + arclen(PB, False)) / 2
for k in range(len(JANG) - 1):
    q = (NRING[k], NRING[k + 1], cti[k + 1], cti[k])
    jacket.face(q, ((uu[k], 0), (uu[k + 1], 0), (uu[k + 1], 0.07), (uu[k], 0.07)), "collar")
    q = (cti[k], cti[k + 1], cfi[k + 1], cfi[k])
    jacket.face(q, ((uu[k], 0.07), (uu[k + 1], 0.07), (uu[k + 1], 0.13), (uu[k], 0.13)), "collar")

# ================================================================= FOREARMS (skin, hexagonal)
forearm = Part("forearm")
for sg in (1, -1):
    s = "L" if sg > 0 else "R"
    el, wr = J(f"lowerarm01.{s}"), J(f"wrist.{s}")
    sh = J(f"upperarm01.{s}")
    axis = wr - el
    angs = [((a if sg > 0 else -a)) % 360 for a in (0, 60, 120, 180, 240, 300)]
    up = np.array([sg * 0.3, 0.2, 1.0])
    rings = []
    for t in (-0.16, 0.08, 0.45, 0.80, 0.93):
        c = el + axis * t
        ax = axis if t >= 0 else (el - sh)
        r, bs = section(c, ax, up, angs, rmax=0.08)
        r = (0.6 * r + 0.4 * np.median(r)) * 1.20 + 0.002
        if t < 0:
            r = r * 0.92
        if t > 0.9:
            r = r * 0.82                               # tapers inside the glove cuff (no skin wedge at the wrist)
        rings.append(ring_points(c, bs, angs, r))
    ids = loft(forearm, rings, "forearm", flip=(sg < 0))

# ================================================================= HANDS (fingerless gloves: palm + 4 fingers + thumb)
hands = Part("hands")


def box_ring(c, axis, side, w, h):
    n = unit(axis); sdir = unit(np.asarray(side) - n * (np.asarray(side) @ n)); udir = np.cross(n, sdir)
    return np.array([c + sdir * w / 2 + udir * h / 2, c - sdir * w / 2 + udir * h / 2, c - sdir * w / 2 - udir * h / 2,
                     c + sdir * w / 2 - udir * h / 2])


for sg in (1, -1):
    s = "L" if sg > 0 else "R"
    wr = J(f"wrist.{s}"); el = J(f"lowerarm01.{s}")
    k2, k3, k4, k5 = (J(f"finger{i}-1.{s}") for i in (2, 3, 4, 5))
    knuck = (k2 + k3 + k4 + k5) / 4
    side = unit(k2 - k5)                                       # across the knuckles (index -> pinky)
    pax = unit(knuck - wr)
    # palm: 8-vertex rings (rounded rectangle) wrist -> knuckles
    def prr(c, w, h):
        n = pax; sd = unit(side - n * (side @ n)); ud = np.cross(n, sd) * sg
        pts = []
        for a in (0, 45, 90, 135, 180, 225, 270, 315):
            aa = math.radians(a)
            x = math.sin(aa); y = math.cos(aa)
            sq = 1.0 / max(abs(x), abs(y))
            pts.append(c + sd * x * sq * w / 2 * (0.92 if (a % 90) else 1) + ud * y * sq * h / 2 * (0.92 if (a % 90) else 1))
        return np.array(pts)
    L = np.linalg.norm(knuck - wr)
    rings = [prr(wr - pax * 0.038, 0.074, 0.058), prr(wr - pax * 0.005, 0.077, 0.052), prr(wr + pax * L * 0.45, 0.100, 0.042),
             prr(knuck + pax * 0.006, 0.094, 0.032)]
    loft(hands, rings, "glove", cap0=False, cap1=True, flip=(sg > 0))
    # fingers: 4-sided tubes along each finger's 3 bones (glove on the first phalanx, skin beyond)
    for i, (wd, th) in zip((2, 3, 4, 5), ((0.024, 0.021), (0.025, 0.022), (0.024, 0.021), (0.021, 0.019))):
        p1, p2, p3 = (J(f"finger{i}-{k}.{s}") for k in (1, 2, 3)); tip = J(f"finger{i}-3.{s}", True)
        pts = [p1 - unit(p2 - p1) * 0.010, p1, p2, p3, tip]
        rr = []
        for j, p in enumerate(pts):
            ax = (pts[min(j + 1, 4)] - pts[max(j - 1, 0)])
            k_ = 1.0 - 0.12 * max(0, j - 2)
            rr.append(box_ring(p, ax, side, wd * k_, th * k_))
        srcs_ = ["glove", "glove", "finger", "finger"]
        loft(hands, rr, "glove", cap1="finger", flip=(sg < 0), srcs=srcs_)
    # thumb
    p1, p2, p3 = (J(f"finger1-{k}.{s}") for k in (1, 2, 3)); tip = J(f"finger1-3.{s}", True)
    pts = [p1 - unit(p2 - p1) * 0.012, p1, p2, p3, tip]
    tside = unit(np.cross(unit(p3 - p1), unit(np.cross(side, pax))))
    rr = []
    for j, p in enumerate(pts):
        ax = (pts[min(j + 1, 4)] - pts[max(j - 1, 0)])
        k_ = 1.0 - 0.10 * max(0, j - 2)
        rr.append(box_ring(p, ax, side, 0.026 * k_, 0.023 * k_))
    loft(hands, rr, "glove", cap1="finger", flip=(sg < 0), srcs=["glove", "glove", "finger", "finger"])

# ================================================================= BOOTS (horizontal slices: footprint -> shaft)
boots = Part("boots")
for sg in (1, -1):
    s = "L" if sg > 0 else "R"
    an = J(f"foot.{s}"); toe = J(f"toe3-1.{s}")
    fx = an[0]
    heel_y = an[1] + 0.047; toe_y = toe[1] - 0.036
    Lb = heel_y - toe_y
    # 10 verts: heel back, heel out, mid out, ball out, toe out, toe tip, toe in, ball in, mid in, heel in
    def outline(scale_len, w, y0, cy=0.0):
        prof = [(0.0, 0.0), (0.06, 0.40), (0.33, 0.47), (0.62, 0.52), (0.86, 0.38), (1.0, 0.0), (0.86, -0.38),
                (0.62, -0.50), (0.33, -0.46), (0.06, -0.40)]
        return [(fx + sg * p[1] * w + sg * 0.012 * p[0], y0 - p[0] * scale_len, 0) for p in prof]
    W_ = 0.097
    lev = [
        (0.000, outline(Lb, W_, heel_y)),
        (0.028, outline(Lb, W_, heel_y)),
        (0.060, outline(Lb * 0.96, W_ * 0.98, heel_y)),
    ]
    # instep ring: toe half pulled back/up onto the ankle front
    circ = lambda z, rx, ry, cyy: [(fx + sg * rx * math.sin(math.radians(a)), cyy - ry * math.cos(math.radians(a)), z)  # noqa: E731
                                   for a in (180, 130, 100, 70, 35, 0, 325, 290, 260, 230)]
    lev.append((0.105, circ(0.105, 0.046, 0.055, an[1] - 0.006)))
    lev.append((0.135, circ(0.135, 0.044, 0.050, an[1] + 0.003)))
    lev.append((0.185, circ(0.185, 0.040, 0.044, an[1] + 0.003)))
    rings = []
    for z, pts in lev:
        P = np.array(pts, float); P[:, 2] = z
        if z == 0.060:            # toe box top slopes down to the toe
            P[4, 2] = 0.050; P[5, 2] = 0.042; P[6, 2] = 0.050
        rings.append(P)
    srcs_ = ["boot"] * 5
    loft(boots, rings, "boot", cap0="sole", flip=(sg > 0), srcs=srcs_)

# ---------------------------------------------------------------- build Blender objects
COL = bpy.data.collections.new("parts"); bpy.context.scene.collection.children.link(COL)
summary = {}
for part in (head, ears, hair, body, jacket, forearm, hands, boots):
    me = bpy.data.meshes.new(part.name)
    me.from_pydata(part.V, [], part.F)
    me.update()
    uvl = me.uv_layers.new(name="UVMap")
    li = 0
    for p, uvs in zip(me.polygons, part.UV):
        for k, l in enumerate(p.loop_indices):
            uvl.data[l].uv = uvs[k]
    at = me.attributes.new("src", "INT", "FACE")
    SRCS = sorted(set(sum([pp.SRC for pp in (head, ears, hair, body, jacket, forearm, hands, boots)], [])))
    for p, s_ in zip(me.polygons, part.SRC):
        at.data[p.index].value = SRCS.index(s_)
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    # open shells (jacket, hair, collar) can come out inside-out: outward = away from the vertical body axis
    dots = []
    for f in bm.faces:
        c = f.calc_center_median(); ax = Vector((0, c.y * 0.3, c.z)) if part.name not in ("hands", "forearm", "boots") else None
        if ax is None:
            continue
        dots.append(f.normal.dot(c - ax) * f.calc_area())
    if dots and sum(dots) < 0:
        bmesh.ops.reverse_faces(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(part.name, me); COL.objects.link(ob)
    ntri = sum(len(p.vertices) - 2 for p in me.polygons)
    summary[part.name] = ntri
bpy.data.objects.remove(mh)
print("tris", summary, "total", sum(summary.values()))
# ---- 2D landmarks (front view: u = x, v = z; the back view mirrors u) for the photo warps in tex.py
def sil(part_pts, z, sg, zr=0.010, xmin=0.0, xmax=9.0):
    P_ = np.asarray(part_pts); m_ = (np.abs(P_[:, 2] - z) < zr) & (P_[:, 0] * sg > xmin) & (P_[:, 0] * sg < xmax)
    return float(np.abs(P_[m_, 0]).max()) if m_.any() else None


JV = np.array(jacket.V)
JLM = {}
ct = np.array(ctop[JANG.index(180)]); JLM["collar_top"] = (0.0, float(ct[2]))
z_sh = ct[2] - 0.42 * (ct[2] - ZA)
for sg, nm in ((-1, "r"), (1, "l")):
    JLM["armpit_" + nm] = (sg * float(abs(jr[len(J_LEV) - 1][JANG.index(90)][0])), ZA)
    JLM["shoulder_" + nm] = (sg * sil(JV, z_sh, sg, 0.035, 0.05, 0.30), float(z_sh))
    hp = jr[0]; JLM["hem_" + nm] = (sg * float(np.abs(hp[:, 0]).max()), float(Z_HEM))
    cuff = np.array([jacket.V[i] for i in SLEEVE[sg][-2]])          # cuff bottom ring (t = 1.0)
    o_ = cuff[np.argmax(cuff[:, 0] * sg)]; i_ = cuff[np.argmin(cuff[:, 0] * sg)]
    lo_ = cuff[np.argmin(cuff[:, 2])]
    JLM["cuff_%s_out" % nm] = (float(o_[0]), float(min(o_[2], lo_[2])))
    JLM["cuff_%s_in" % nm] = (float(i_[0]), float(min(i_[2], lo_[2]) + 0.0))
    ki = -1 if sg < 0 else 0                                           # lapel edge vertex (angle 360-phi / phi)
    for tag, ri in (("top", len(J_LEV) - 1), ("mid", 2), ("hem", 0)):
        JLM["open_%s_%s" % (nm, tag)] = (float(jr[ri][ki][0]), float(jr[ri][ki][2]))
BVv = np.array(body.V)
JNLM = {"crotch": (0.0, float(crotch_c[2]))}
z_hip = Z_BELT_T - 0.45 * (Z_BELT_T - crotch_c[2])
for sg, nm in ((-1, "r"), (1, "l")):
    JNLM["waist_" + nm] = (sg * sil(BVv, Z_BELT_T, sg, 0.006, 0.0, 0.3), float(Z_BELT_T))
    JNLM["hip_" + nm] = (sg * sil(BVv, z_hip, sg, 0.07, 0.0, 0.3), float(z_hip))
    leg = LEGS[sg]
    cb = np.array([body.V[i] for i in leg[-2]])                      # cuff bottom ring
    JNLM["hem_%s_out" % nm] = (float(cb[np.argmax(cb[:, 0] * sg), 0]), float(cb[:, 2].min()))
    JNLM["hem_%s_in" % nm] = (float(cb[np.argmin(cb[:, 0] * sg), 0]), float(cb[:, 2].min()))
    ct_ = np.array([body.V[i] for i in leg[-4]])                     # cuff top ring
    JNLM["cufftop_%s_out" % nm] = (float(ct_[np.argmax(ct_[:, 0] * sg), 0]), float(ct_[:, 2].mean()))
    JNLM["cufftop_%s_in" % nm] = (float(ct_[np.argmin(ct_[:, 0] * sg), 0]), float(ct_[:, 2].mean()))
    zk = crotch_c[2] - 0.45 * (crotch_c[2] - cb[:, 2].min())
    lp = np.vstack([np.array([body.V[i] for i in r_]) for r_ in leg])
    m_ = np.abs(lp[:, 2] - zk) < 0.03
    JNLM["knee_%s_out" % nm] = (float(lp[m_][np.argmax(lp[m_, 0] * sg), 0]), float(zk))
    JNLM["knee_%s_in" % nm] = (float(lp[m_][np.argmin(lp[m_, 0] * sg), 0]), float(zk))
json.dump(dict(jacket=JLM, jeans=JNLM), open(os.path.join(W, "model_lm.json"), "w"), indent=1)

json.dump(dict(landmarks=LM, levels=dict(belt_t=Z_BELT_T, belt_b=Z_BELT_B, hem=Z_HEM, crop=Z_CROP, ZA=ZA, ZM=ZM, ZS=ZS, ZN=ZN),
               src_names=SRCS, tris=summary), open(os.path.join(W, "geo.json"), "w"), indent=1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(W, "geo.blend"))
