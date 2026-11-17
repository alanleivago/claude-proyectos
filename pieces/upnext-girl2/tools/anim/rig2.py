"""New clean skeleton for girl2 (feminine anim set v1).
- legs de-overlapped: inner thigh / knee / boot-top vertices that crossed the mid plane between the legs are squashed
  back to their own side (union silhouette in his_idle unchanged, but the legs can now separate without merging)
- 23 bones: Pelvis Spine Chest Neck Head, Clavicle/UpperArm/Forearm/Hand .L .R, Thigh/Calf/Foot .L .R,
  SkirtFL SkirtFR SkirtBL SkirtBR (skirt panels driven from the thighs)
- rest skeleton = his_idle joints with the thighs abducted REST_ABD deg (legs apart in the rest mesh);
  his_idle = exact (rest mesh is the inverse skinning of his posed mesh)
python tools/anim/rig2.py  -> ref/rig2.npz"""
import json, os, numpy as np
from scipy.spatial.transform import Rotation as Rot
import scipy.sparse as sp, scipy.sparse.csgraph as cg

REST_ABD = 3.0
SKIRT_WIDEN = 0.13
R = np.load("ref/rig_in_v2.npz", allow_pickle=True)
V = R["V"].astype(float).copy(); F = R["F"]; W0 = json.loads(str(R["weights"]))
J = {k: np.array(v, float) for k, v in json.loads(str(R["joints"])).items()}
dom = np.array([max(w, key=w.get) for w in W0])
A = sp.coo_matrix((np.ones(len(F) * 3), (F.ravel(), np.roll(F, 1, 1).ravel())), shape=(len(V),) * 2)
ncomp, lab = cg.connected_components(A, directed=False)
comp_dom = {c: max(set(dom[lab == c]), key=list(dom[lab == c]).count) for c in range(ncomp)}
# v3: right bust (hidden behind his_idle's fist in his frames) rebuilt by symmetry from her left
import sys as _sys0, os as _os0
_sys0.path.insert(0, _os0.path.dirname(__file__))
import bust_fix as BF
ARM_R_ORIG = V[np.isin(lab, [c for c, d in comp_dom.items() if d == "Forearm.R"])].copy()
FIST_ORIG = V[[i for i in range(len(V)) if comp_dom[lab[i]] == "Forearm.R" and W0[i].get("Hand.R", 0) >= 0.5]].copy()
V, BCX = BF.mirror_bust(V, F, lab, comp_dom)
# v5: skirt a little wider to the sides (not longer): the fuller thighs stay inside it
_skc = [c for c in range(ncomp) if comp_dom[c] == "Pelvis" and V[lab == c][:, 2].min() > 0.6][0]
_sv = np.nonzero(lab == _skc)[0]; _scx = np.median(V[_sv, :2], 0)
for _i in _sv:
    _t = float(np.clip((0.935 - V[_i, 2]) / 0.15, 0, 1)) ** 0.9
    V[_i, 0] = _scx[0] + (V[_i, 0] - _scx[0]) * (1 + SKIRT_WIDEN * _t)
    V[_i, 1] = _scx[1] + (V[_i, 1] - _scx[1]) * (1 + 0.035 * _t)
print("RIG2 skirt widened", SKIRT_WIDEN)


def side_of(c):
    d = comp_dom[c]
    return d[-1] if d.split(".")[0] in ("Thigh", "Calf", "Foot") else None


# ------------------------------------------------------------ legs rebuilt as clean lofts (v2)
# The fitted leg tubes were irregular decimated meshes with his video's shadows baked in (and v1 squashed their inner
# side to separate them). Each leg is now a NS-sided loft along hip -> knee -> boot, radii ray-cast from the fitted
# (curvy) leg so the silhouette in his_idle stays his, with clean ring weights and its own painted UV strip.
NS = 10
FUV = R["FUV"].astype(float).copy(); FMAT = R["FMAT"].copy()
nrm_ = lambda v: v / (np.linalg.norm(v) + 1e-12)


def ray_far(o, d, T):
    A0 = T[:, 0]; e1 = T[:, 1] - A0; e2 = T[:, 2] - A0
    pv = np.cross(d, e2); det = (e1 * pv).sum(1); ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    tv = o - A0; u = (tv * pv).sum(1) * inv; qv = np.cross(tv, e1); v = (qv * d).sum(1) * inv; t = (e2 * qv).sum(1) * inv
    hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    return t[hit].max() if hit.any() else np.nan


# texture strip (free atlas area, both legs share it, mirrored): pixel rect
TX0, TX1, TY0, TY1 = 136, 760, 1608, 1976
TSZ = 4096
LEGC = {s: [c for c in range(ncomp) if comp_dom[c] == "Thigh." + s][0] for s in "LR"}
newV, newF, newUV, newW, newLab = [], [], [], [], []
base_n = int((~np.isin(lab, list(LEGC.values()))).sum())
RINGS = None; _VFR = None
for s, sg in (("L", 1), ("R", -1)):
    Hh, Kk, Aa = J["hip" + s], J["knee" + s], J["ankle" + s]
    ut, uc = nrm_(Kk - Hh), nrm_(Aa - Kk); Lt = np.linalg.norm(Kk - Hh)
    spec = [("t", -0.075), ("t", -0.01), ("t", 0.065), ("t", 0.15), ("t", 0.235), ("t", Lt - 0.05), ("k", 0.0),
            ("c", 0.045), ("c", 0.12), ("c", 0.20)]
    #        Pelvis, Thigh, Calf weights per ring
    wts = [(0.55, 0.45, 0), (0.2, 0.8, 0), (0, 1, 0), (0, 1, 0), (0, 1, 0), (0, 0.92, 0.08), (0, 0.5, 0.5), (0, 0.1, 0.9), (0, 0, 1), (0, 0, 1)]
    T = V[F[np.isin(lab[F[:, 0]], [LEGC[s]])]]
    cen, ax_ = [], []
    for kind, x in spec:
        if kind == "t": cen.append(Hh + ut * x); ax_.append(ut)
        elif kind == "k": cen.append(Kk.copy()); ax_.append(nrm_(ut + uc))
        else: cen.append(Kk + uc * x); ax_.append(uc)
    nr = len(spec); rad = np.full((nr, NS), np.nan); frames_ = []
    for i in range(nr):
        u = ax_[i]; fw = np.array([0, -1.0, 0]); f = nrm_(fw - (fw @ u) * u)
        o = np.array([sg, 0, 0.0]); o = nrm_(o - (o @ u) * u - (o @ f) * f); frames_.append((f, o, u))
        c = cen[i].copy()
        if spec[i][0] == "c" and spec[i][1] > 0.1:
            rad[i] = 0.036 if spec[i][1] > 0.15 else 0.04; continue
        for it in range(3):
            th = np.pi + 2 * np.pi * np.arange(NS) / NS
            dirs = np.cos(th)[:, None] * f + np.sin(th)[:, None] * o
            r = np.array([ray_far(c, d, T) for d in dirs])
            lim = 0.11 if i < 2 else 0.095
            r = np.where(np.isfinite(r), np.clip(r, 0.03, lim), np.nan)
            if it < 2 and np.isfinite(r).sum() >= NS - 2:
                rr = np.where(np.isfinite(r), r, np.nanmean(r))
                shift = (rr[:, None] * dirs).mean(0)                  # ~ centroid of the star polygon
                shift -= (shift @ u) * u
                if np.linalg.norm(shift) > 0.02: shift = shift / np.linalg.norm(shift) * 0.02
                c = c + shift
        cen[i] = c; rad[i] = r
    for i in range(nr):                                      # fill holes
        if np.isnan(rad[i]).any(): rad[i] = np.where(np.isnan(rad[i]), np.nanmean(rad[i]) if np.isfinite(rad[i]).any() else 0.05, rad[i])
    # smooth around and along (visible rings only), feminine minimums
    sm = rad.copy()
    for i in range(nr): sm[i] = 0.25 * np.roll(rad[i], 1) + 0.5 * rad[i] + 0.25 * np.roll(rad[i], -1)
    sm2 = sm.copy()
    for i in range(1, 8): sm2[i] = 0.25 * sm[i - 1] + 0.5 * sm[i] + 0.25 * sm[i + 1]
    rad = sm2
    rad[2:6] = np.maximum(rad[2:6], 0.045); rad[6:8] = np.clip(rad[6:8], 0.04, 0.056)
    # v4 curvy taper: full at the top of the thigh, narrowing to the knee and into the boot (ring mean radii, m);
    # the ring's own shape is kept softened, the inner side a bit slimmer (thighs touch less), outer / back fuller
    TAPER = {1: 0.094, 2: 0.100, 3: 0.093, 4: 0.075, 5: 0.058, 6: 0.047, 7: 0.043}
    thv = np.pi + 2 * np.pi * np.arange(NS) / NS
    shape = 1 + 0.10 * np.maximum(0, np.sin(thv)) + 0.06 * np.maximum(0, -np.cos(thv)) + 0.03 * np.maximum(0, np.cos(thv))
    oth = "R" if s == "L" else "L"
    def _axis(sd, z):
        h_, k_, a_ = J["hip" + sd], J["knee" + sd], J["ankle" + sd]
        if z >= k_[2]: return h_ + (k_ - h_) * (h_[2] - z) / (h_[2] - k_[2])
        return k_ + (a_ - k_) * (k_[2] - z) / (k_[2] - a_[2])
    for i_, tm in TAPER.items():
        rel = rad[i_] / rad[i_].mean(); rel = 0.6 + 0.4 * rel
        rad[i_] = tm * rel * shape
        # inner side: the two thighs meet but do not cross in his_idle (flat contact instead of a merged seam)
        f_, o_, u_ = frames_[i_]; oc = _axis(oth, cen[i_][2]); dx = abs((oc - cen[i_]) @ o_)
        half = max(0.03, dx / 2 - 0.003)
        for k_ in range(NS):
            lat = -np.sin(thv[k_])
            if lat > 0.2: rad[i_][k_] = min(rad[i_][k_], half / lat)
    if RINGS is None: RINGS = (spec, rad.copy())
    # vertices: rings x (NS + 1) columns (seam duplicated for the UV strip), + 2 cap centres
    b0 = base_n + len(newV)
    vlen = np.r_[0, np.cumsum([np.linalg.norm(cen[i + 1] - cen[i]) for i in range(nr - 1)])]; vfr = vlen / vlen[-1]
    if _VFR is None: _VFR = vfr
    for i in range(nr):
        f, o, u = frames_[i]
        for k in range(NS + 1):
            th = np.pi + 2 * np.pi * k / NS
            newV.append(cen[i] + rad[i][k % NS] * (np.cos(th) * f + np.sin(th) * o))
            pw, tw, cw = wts[i]; newW.append({k_: x for k_, x in (("Pelvis", pw), (f"Thigh.{s}", tw), (f"Calf.{s}", cw)) if x > 0})
            newLab.append(LEGC[s])
    ctop = len(newV) + base_n; newV.append(cen[0] + ax_[0] * -0.01); newW.append(dict(newW[(b0 - base_n)])); newLab.append(LEGC[s])
    cbot = len(newV) + base_n; newV.append(cen[-1] + ax_[-1] * 0.01); newW.append({f"Calf.{s}": 1.0}); newLab.append(LEGC[s])
    uvx = lambda k: (TX0 + (TX1 - TX0) * k / NS) / TSZ
    uvy = lambda i: 1 - (TY0 + (TY1 - TY0) * vfr[i]) / TSZ
    vid = lambda i, k: b0 + i * (NS + 1) + k
    for i in range(nr - 1):
        for k in range(NS):
            a, b, c_, d_ = vid(i, k), vid(i, k + 1), vid(i + 1, k + 1), vid(i + 1, k)
            ua, ub, uc_, ud = (uvx(k), uvy(i)), (uvx(k + 1), uvy(i)), (uvx(k + 1), uvy(i + 1)), (uvx(k), uvy(i + 1))
            newF += [(a, b, c_), (a, c_, d_)]; newUV += [(ua, ub, uc_), (ua, uc_, ud)]
    cu = ((TX0 + 0.55 * (TX1 - TX0) / NS * 1) / TSZ, 1 - (TY0 + 6) / TSZ)     # a base-colour texel for the caps
    for k in range(NS):
        newF += [(ctop, vid(0, k + 1), vid(0, k)), (cbot, vid(nr - 1, k), vid(nr - 1, k + 1))]
        newUV += [(cu, cu, cu), (cu, cu, cu)]
newV = np.array(newV); newF = np.array(newF); newUV = np.array(newUV)
# outward winding: flip faces whose normal points to the leg axis side (both legs share the loop, the R one is mirrored)
keepv = np.nonzero(~np.isin(lab, list(LEGC.values())))[0]; remap = -np.ones(len(V), int); remap[keepv] = np.arange(len(keepv))
keepf = np.nonzero(~np.isin(lab[F[:, 0]], list(LEGC.values())))[0]
V = np.r_[V[keepv], newV]; W0 = [W0[i] for i in keepv] + newW; lab = np.r_[lab[keepv], np.array(newLab)]
Fk = remap[F[keepf]]; F = np.r_[Fk, newF]; FUV = np.r_[FUV[keepf], newUV]; FMAT = np.r_[FMAT[keepf], np.zeros(len(newF), FMAT.dtype)]
nf0 = len(Fk)
for fi in range(nf0, len(F)):
    a, b, c_ = V[F[fi]]; n = np.cross(b - a, c_ - a); m = (a + b + c_) / 3
    s = "L" if lab[F[fi][0]] == LEGC["L"] else "R"
    h, kn, an = J["hip" + s], J["knee" + s], J["ankle" + s]
    seg = (h, kn) if m[2] > kn[2] else (kn, an); d = seg[1] - seg[0]; t = np.clip((m - seg[0]) @ d / (d @ d), -0.5, 1.5)
    if n @ (m - (seg[0] + t * d)) < 0: F[fi] = F[fi][[0, 2, 1]]; FUV[fi] = FUV[fi][[0, 2, 1]]
dom = np.array([max(w, key=w.get) for w in W0])
# ------------------------------------------------------------ v3: arms (one continuous loft + bracelets, hands kept) and boots (new feet)
import sys as _sys, os as _os
_sys.path.insert(0, _os.path.dirname(__file__))
import parts2 as P2


def replace_parts(drop, new):
    """drop verts (mask) and their faces, append new parts (local face indices)"""
    global V, F, FUV, FMAT, W0, lab
    keepv_ = np.nonzero(~drop)[0]; remap_ = -np.ones(len(V), int); remap_[keepv_] = np.arange(len(keepv_))
    keepf_ = np.nonzero((~drop[F]).all(1))[0]; nb_ = len(keepv_)
    V = np.r_[V[keepv_], np.array(new["V"])]; W0 = [W0[i] for i in keepv_] + list(new["W"]); lab = np.r_[lab[keepv_], np.array(new["lab"])]
    F = np.r_[remap_[F[keepf_]], np.array(new["F"]) + nb_]; FUV = np.r_[FUV[keepf_], np.array(new["UV"])]
    FMAT = np.r_[FMAT[keepf_], np.zeros(len(new["F"]), FMAT.dtype)]
    return remap_


ARMS, keep_arm = P2.build_arms(V, F, W0, lab, comp_dom, J)
for s_ in "LR":                                              # hands: rigid on the hand bone, the wrist rim blended like the loft
    cf_ = [c for c, d in comp_dom.items() if d == "Forearm." + s_][0]
    for i in np.nonzero((lab == cf_) & keep_arm)[0]: W0[i] = {f"Hand.{s_}": 1.0}
    for i in ARMS["hand_rim"][s_]: W0[i] = {f"Hand.{s_}": 0.55, f"Forearm.{s_}": 0.45}
replace_parts(~keep_arm, ARMS)
FOOTDIR_ = {s_: J["toe" + s_] - J["ankle" + s_] for s_ in "LR"}
BOOTS = P2.build_boots(V, F, lab, comp_dom, J, FOOTDIR_)
BOOTS["W"] = [{comp_dom[int(l_)]: 1.0} for l_ in BOOTS["lab"]]
replace_parts(np.isin(lab, [c for c, d in comp_dom.items() if d.startswith("Calf")]), BOOTS)
NECKP = P2.build_neck(V, F, lab, comp_dom, J)               # v4: continuous neck into the head + complete turtleneck
replace_parts(np.isin(lab, [c for c, d in comp_dom.items() if d == "Neck"]), NECKP)
print("RIG2 v4 neck + turtleneck:", len(NECKP["V"]), "verts")
dom = np.array([max(w, key=w.get) for w in W0])
print("RIG2 v3 parts: arms", len(ARMS["V"]), "verts, boots", len(BOOTS["V"]), "verts; total", len(V), len(F))
# near-eye fix: the face mask front slides along his f001 rays onto a smooth surface (frontal look / UVs unchanged)
from face_relax import smooth_depth
FACE_FIX = _os.environ.get("FACE_FIX", "1") == "1"
if FACE_FIX:
    from face_relax import flatten_cheeks
    V = smooth_depth(V, F, FMAT, lab, center=(540, 450), radii=(125, 85), feather=0.3, deg=2)
    V = flatten_cheeks(V, F, FMAT, lab)
print("RIG2 legs rebuilt:", len(newV), "verts", len(newF), "faces; total", len(V), len(F))


def paint_legs(src, dst, pal):
    """pal: base, outside, back, inside, knee, highlight (RGB)"""
    from PIL import Image, ImageDraw
    im = Image.open(src).convert("RGB"); dr = ImageDraw.Draw(im)
    W_ = (TX1 - TX0) / NS
    # ring v positions (same for both legs: use the L leg spacing)
    ys = [TY0 + (TY1 - TY0) * f for f in _VFR]
    dr.rectangle([TX0 - 8, TY0 - 8, TX1 + 8, TY1 + 8], fill=pal[0])
    for k in range(NS):
        phi = np.degrees(np.pi + 2 * np.pi * (k + 0.5) / NS); phi = (phi + 180) % 360 - 180      # 0 front, + outside
        a = abs(phi)
        col = pal[0] if a <= 45 else (pal[1] if phi > 0 and a <= 110 else (pal[3] if phi < 0 and a <= 110 else pal[2]))
        dr.rectangle([TX0 + k * W_, TY0 - 8 if k else TY0 - 8, TX0 + (k + 1) * W_, TY1 + 8], fill=col)
    xf = TX0 + 5 * W_                                        # front centre
    # knee triangle: top edge on the ring above the knee, apex 60 % of the way to the ring below
    yt, yk, yb = ys[5], ys[6], ys[7]
    ya = yk + 0.6 * (yb - yk); hw = 0.85 * W_
    dr.polygon([(xf - hw, yt + 0.25 * (yk - yt)), (xf + hw, yt + 0.25 * (yk - yt)), (xf, ya)], fill=pal[4])
    # thin highlight on the front-outside of the thigh
    x0 = xf + 0.35 * W_
    dr.polygon([(x0, ys[3]), (x0 + 0.12 * W_, ys[3]), (x0 + 0.22 * W_, ys[5] - 0.2 * (ys[5] - ys[4])), (x0 + 0.10 * W_, ys[5] - 0.2 * (ys[5] - ys[4]))], fill=pal[5])
    im.save(dst, quality=96)

# ------------------------------------------------------------ joints (his_idle pose)
lerp = lambda a, b, t: a + (b - a) * t
J["waist"] = lerp(J["pelvis"], J["spine"], (0.93 - J["pelvis"][2]) / (J["spine"][2] - J["pelvis"][2]))
J["chestb"] = lerp(J["spine"], J["neck"], (1.06 - J["spine"][2]) / (J["neck"][2] - J["spine"][2]))
J["clavL"] = np.array([J["neck"][0] + 0.022, J["neck"][1] - 0.005, 1.245]); J["clavR"] = np.array([J["neck"][0] - 0.022, J["neck"][1] - 0.005, 1.245])
J["ball" + "L"] = lerp(J["ankleL"], J["toeL"], 0.62); J["ballR"] = lerp(J["ankleR"], J["toeR"], 0.62)
J["ballL"][2] = J["ballR"][2] = 0.02
skv = np.nonzero(lab == [c for c in range(ncomp) if comp_dom[c] == "Pelvis" and V[lab == c][:, 2].min() > 0.6][0])[0]
SKC = np.r_[np.median(V[skv, :2], 0), 0.935]
hem_z = 0.765
QD = {"SkirtFL": (1, -1), "SkirtFR": (-1, -1), "SkirtBL": (1, 1), "SkirtBR": (-1, 1)}
for n, (sx, sy) in QD.items():
    J[n + "_h"] = SKC.copy(); J[n + "_t"] = np.array([SKC[0] + sx * 0.11, SKC[1] + sy * 0.11, hem_z])

B = [("Pelvis", None, "pelvis", "waist"), ("Spine", "Pelvis", "waist", "chestb"), ("Chest", "Spine", "chestb", "neck"),
     ("Neck", "Chest", "neck", "headbase"), ("Head", "Neck", "headbase", "headtop")]
for s in "LR":
    B += [(f"Clavicle.{s}", "Chest", "clav" + s, "shoulder" + s), (f"UpperArm.{s}", f"Clavicle.{s}", "shoulder" + s, "elbow" + s),
          (f"Forearm.{s}", f"UpperArm.{s}", "elbow" + s, "wrist" + s), (f"Hand.{s}", f"Forearm.{s}", "wrist" + s, "handtip" + s)]
for s in "LR":
    B += [(f"Thigh.{s}", "Pelvis", "hip" + s, "knee" + s), (f"Calf.{s}", f"Thigh.{s}", "knee" + s, "ankle" + s), (f"Foot.{s}", f"Calf.{s}", "ankle" + s, "toe" + s)]
for n in QD: B.append((n, "Pelvis", n + "_h", n + "_t"))
# v5: boot-cuff hinge bones (front of the cuff top): with a bent knee the back of the cuff folds down out of the thigh
for s_ in "LR":
    _bc = [c for c in range(ncomp) if comp_dom[c] == "Calf." + s_][0]; _bv = V[lab == _bc]
    _zt = float(np.percentile(_bv[:, 2], 99)); J["cuffz" + s_] = np.array([_zt, 0, 0])
    _k, _a = J["knee" + s_], J["ankle" + s_]; _t = (_k[2] - (_zt - 0.012)) / (_k[2] - _a[2]); _c = _k + _t * (_a - _k)
    _fd = (J["toe" + s_] - J["ankle" + s_]) * [1, 1, 0]; _fd /= np.linalg.norm(_fd)
    J["cuffh" + s_] = _c + _fd * 0.065; J["cufft" + s_] = J["cuffh" + s_] + np.array([0, 0, -0.06])
    B.append((f"Cuff.{s_}", f"Calf.{s_}", "cuffh" + s_, "cufft" + s_))
for s_ in "LR":                                               # v3: bust spring bones (subtle secondary motion)
    ap_ = BF.apex(V, lab, comp_dom, BCX, s_); J["bustt" + s_] = ap_; J["busth" + s_] = ap_ + np.array([0, 0.085, 0.01])
    B.append((f"Bust.{s_}", "Chest", "busth" + s_, "bustt" + s_))
# v4: no press bone (the fist sits slightly out from the chest instead; no texture stretching)
names = [b[0] for b in B]; bi = {n: i for i, n in enumerate(names)}
par = np.array([bi[b[1]] if b[1] else -1 for b in B])
Hp = np.array([J[b[2]] for b in B]); Tp = np.array([J[b[3]] for b in B])   # posed (his_idle) heads / tails

# ------------------------------------------------------------ weights
NB = len(B); Wm = np.zeros((len(V), NB))
def _fd_(sd):
    d = (J["toe" + sd] - J["ankle" + sd]) * [1, 1, 0]; return d / np.linalg.norm(d)
torso_c = [c for c in range(ncomp) if comp_dom[c] == "Chest"][0]
band = lambda x, x0, w: np.clip((x - (x0 - w)) / (2 * w), 0, 1)
for i, w in enumerate(W0):
    v = V[i]
    if lab[i] == torso_c:
        z = v[2]; wc = band(z, 1.06, 0.035); ws = band(z, 0.935, 0.03) * (1 - wc); wp = 1 - wc - ws
        row = {"Pelvis": wp, "Spine": ws, "Chest": wc}
        for s in "LR":                                     # shoulder caps follow the clavicle (shrug)
            dsh = np.linalg.norm(v - J["shoulder" + s])
            k = 0.65 * np.clip((0.085 - dsh) / 0.05, 0, 1) * np.clip((z - 1.17) / 0.05, 0, 1)
            if k > 0:
                for kk in list(row): row[kk] *= (1 - k)
                row[f"Clavicle.{s}"] = k
            ap_ = J["bustt" + s]; wb = 0.8 * np.exp(-0.5 * (((v[0] - ap_[0]) / 0.042) ** 2 + ((v[2] - ap_[2]) / 0.05) ** 2)) * np.clip((-v[1] - 0.05) / 0.05, 0, 1)
            if wb > 0.01:
                for kk in list(row): row[kk] *= (1 - wb)
                row[f"Bust.{s}"] = wb
            k2 = 0.3 * np.clip((0.075 - dsh) / 0.045, 0, 1) * np.clip((z - 1.14) / 0.06, 0, 1)   # deltoid cap rides with a raised arm
            if k2 > 0:
                for kk in list(row): row[kk] *= (1 - k2)
                row[f"UpperArm.{s}"] = k2
    elif comp_dom[lab[i]] == "Pelvis":                  # skirt: waist on the pelvis, lower part on the 4 panels
        t = float(np.clip((0.955 - v[2]) / 0.17, 0, 1)) ** 1.1
        dx, dy = v[:2] - SKC[:2]; r = np.hypot(dx, dy) + 1e-9; dx, dy = dx / r, dy / r
        f = np.clip(0.5 - 0.75 * dy, 0, 1); l = np.clip(0.5 + 0.75 * dx, 0, 1)
        row = {"Pelvis": 1 - t, "SkirtFL": t * f * l, "SkirtFR": t * f * (1 - l), "SkirtBL": t * (1 - f) * l, "SkirtBR": t * (1 - f) * (1 - l)}
    elif comp_dom[lab[i]].startswith("Calf"):         # boots: toe box follows the foot, heel + shaft the calf (crease at the instep)
        sd = comp_dom[lab[i]][-1]; an = J["ankle" + sd]; fd = J["toe" + sd] - an; fd[2] = 0; fd /= np.linalg.norm(fd)
        dfw = float((v - an)[:2] @ fd[:2])
        w_toe = float(np.clip((dfw - 0.0) / 0.05, 0, 1) * np.clip((0.14 - v[2]) / 0.06, 0, 1))
        w_sole = float(np.clip((0.045 - v[2]) / 0.03, 0, 1))                # the whole sole (heel too) stays flat with the foot
        wf = max(w_toe, w_sole)
        row = {f"Foot.{sd}": wf, f"Calf.{sd}": 1 - wf}
        _zt = J["cuffz" + sd][0]; _ax = J["cuffh" + sd] - _fd_(sd) * 0.065
        _back = float(-((v - _ax) * [1, 1, 0]) @ _fd_(sd)) / 0.07
        wc = float(np.clip((v[2] - (_zt - 0.055)) / 0.045, 0, 1)) * float(np.clip(0.5 + 0.7 * _back, 0, 1))
        if wc > 0.01: row = {f"Foot.{sd}": wf * (1 - wc), f"Calf.{sd}": (1 - wf) * (1 - wc), f"Cuff.{sd}": wc}
    else:
        row = dict(w)
    for k, x in row.items():
        if x > 1e-4: Wm[i, bi[k]] += x
Wm /= Wm.sum(1, keepdims=True)
print("RIG2 bones", NB, "weights per vert max", int((Wm > 1e-4).sum(1).max()))

# ------------------------------------------------------------ rest skeleton (thighs abducted), rest mesh
Q = np.tile(np.eye(3), (NB, 1, 1))          # world delta rotation (rest -> his_idle) per bone
for s, sg in (("L", 1), ("R", -1)):
    Q[bi[f"Thigh.{s}"]] = Rot.from_rotvec([0, sg * np.radians(REST_ABD), 0]).as_matrix()   # his_idle = adducted from rest
for n in names:                              # calf / foot inherit the thigh
    if n.split(".")[0] in ("Calf", "Foot"): Q[bi[n]] = Q[par[bi[n]]]
# rest heads: invert the chain  posed_head = posed_head_par + Q_par (rest_head - rest_head_par)
Hr = Hp.copy(); Tr = Tp.copy()
for i in range(NB):
    p = par[i]
    if p >= 0: Hr[i] = Hr[p] + Q[p].T @ (Hp[i] - Hp[p])
    Tr[i] = Hr[i] + Q[i].T @ (Tp[i] - Hp[i])
Vr = np.zeros_like(V)
for k in range(len(V)):
    M = np.zeros((4, 4))
    for i in np.nonzero(Wm[k] > 0)[0]:
        T = np.eye(4); T[:3, :3] = Q[i]; T[:3, 3] = Hp[i] - Q[i] @ Hr[i]; M += Wm[k, i] * T
    Vr[k] = np.linalg.solve(M, np.r_[V[k], 1])[:3]


def frame(i):
    y = Tr[i] - Hr[i]; y /= np.linalg.norm(y)
    ref = np.array([0, -1.0, 0]) if abs(y[1]) < 0.9 else np.array([0, 0, 1.0])
    x = np.cross(y, ref); x /= np.linalg.norm(x); z = np.cross(x, y)
    return np.stack([x, y, z], 1)


Rb = np.array([frame(i) for i in range(NB)])
zmin, zmax = R["V"][:, 2].min(), R["V"][:, 2].max(); S = 13.24 / (zmax - zmin)
tex = {"bare": [str(t) for t in R["tex"]], "tights": [str(t) for t in np.load("ref/rig_in_v3.npz", allow_pickle=True)["tex"]]}
SKIN = dict(bare=[(248, 196, 181), (245, 191, 177), (241, 186, 173), (234, 176, 164), (243, 182, 172), (253, 213, 200)],
            tights=[(61, 49, 58), (58, 46, 55), (54, 43, 51), (47, 37, 45), (38, 27, 35), (84, 70, 82)])
ARM_PAL = [(248, 196, 181), (244, 190, 176), (92, 60, 44), (64, 42, 31)]
BOOT_PAL = [(45, 34, 30), (39, 29, 26), (26, 17, 15), (24, 17, 15), (32, 24, 21), (18, 13, 11)]
from PIL import Image as _Image
for v_ in ("bare", "tights"):
    src = tex[v_][0]; dst = os.path.join(os.path.dirname(src), f"body_{v_}_v3.jpg").replace(os.sep, "/")
    paint_legs(src, dst, SKIN[v_])
    im_ = _Image.open(dst).convert("RGB")
    im_ = BF.mirror_texture(np.asarray(im_), V, F, FUV, FMAT, lab, comp_dom, ARM_R_ORIG, BCX)
    for s_ in "LR":                                          # faint finger lines on the fist / hand
        hf_ = np.nonzero(np.array([all(W0[v_i].get(f"Hand.{s_}", 0) >= 0.5 for v_i in f_) for f_ in F]) & (FMAT == 0))[0]
        hv_ = np.unique(F[hf_]); c_ = V[hv_].mean(0); ax_ = np.linalg.svd(V[hv_] - c_)[2]
        d0_ = J["handtip" + s_] - J["wrist" + s_]; d0_ /= np.linalg.norm(d0_); p0_ = ax_[2] - (ax_[2] @ d0_) * d0_; p0_ /= np.linalg.norm(p0_)
        im_ = BF.finger_lines(im_, V, F, FUV, FMAT, hf_, J["wrist" + s_], d0_, p0_)
    im_ = _Image.fromarray(im_)
    P2.paint_arms(im_, ARMS, ARM_PAL); P2.paint_boots(im_, BOOTS, BOOT_PAL)
    P2.paint_neck(im_, NECKP, ((247, 194, 180), (238, 182, 168)), ((184, 125, 66), (150, 98, 50), (160, 108, 56)))
    im_.save(dst, quality=96); tex[v_][0] = dst
np.savez("ref/rig2.npz", V=V, Vr=Vr, F=F, FUV=FUV, FMAT=FMAT, W=Wm, names=np.array(names), par=par, Hr=Hr, Tr=Tr, Hp=Hp, Tp=Tp,
         Rb=Rb, Qidle=Q, S=S, zmin=zmin, tex=json.dumps(tex), joints=json.dumps({k: v.tolist() for k, v in J.items()}), lab=lab,
         comp_dom=json.dumps({int(k): str(v) for k, v in comp_dom.items()}))
# check: forward skin of rest with Qidle == posed
Vc = np.zeros_like(V)
for i in range(NB): Vc += Wm[:, i:i + 1] * ((Vr - Hr[i]) @ Q[i].T + Hp[i])
print("RIG2 his_idle reconstruction err (m)", float(np.abs(Vc - V).max()), "S", S)
