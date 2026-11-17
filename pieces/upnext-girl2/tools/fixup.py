"""Hidden-geometry fixes before texturing: the leg tubes cross over under the skirt; re-route their hidden rings
(above the skirt hem) to hips at the pelvis sides. python tools/fixup.py <in.npz> <out.npz>"""
import sys, json, numpy as np
sys.path.insert(0, "tools")
import joints as JT
D = dict(np.load(sys.argv[1], allow_pickle=True)); V = D["V"].copy()
J = JT.estimate(D)
lo, hi = JT.part_verts(D, "skirt"); nr_, ns_ = JT.LAYOUT["skirt"]; Rs = V[lo:lo + nr_ * ns_].reshape(ns_, nr_, 3)
hem = float(Rs[0, :, 2].max())     # highest point of the hem ring: everything above it is hidden at every angle
z0 = hem + 0.03; z1 = z0 + 0.012
hips = {}
for s_, sx in (("R", -1), ("L", 1)):
    lo, hi = JT.part_verts(D, "leg" + s_); nr, ns = JT.LAYOUT["leg" + s_]
    R = V[lo:lo + nr * ns].reshape(ns, nr, 3); cen = R.mean(1)
    base = JT.at_z(cen, z0)
    hip = np.array([J["spine"][0] + sx * 0.072, base[1] * 0.5 + J["spine"][1] * 0.5, max(0.80, z0 + 0.04)])
    for i in range(ns):
        if cen[i, 2] > z0:
            t = min(1.0, (cen[i, 2] - z0) / (z1 - z0))
            tgt = base + (hip - base) * min(1.0, (cen[i, 2] - z0) / max(1e-6, hip[2] - z0))
            R[i] += (tgt - cen[i]) * t * np.array([1, 1, 0])
    V[lo:lo + nr * ns] = R.reshape(-1, 3)
    cap = hi - 1; V[cap] = R[-1].mean(0) + (R[-1].mean(0) - R[-2].mean(0))
    hips["hip" + s_] = hip.tolist()
# flat soles: bottom ring + bottom cap of each boot on the ground plane (his soles are straight lines at z=0)
for b in ("bootL", "bootR"):
    lo, hi = JT.part_verts(D, b); nr, ns = JT.LAYOUT[b]
    zs = float(np.median(V[lo:lo + nr, 2])); V[lo:lo + nr, 2] = zs; V[lo + nr * ns, 2] = zs   # ring 0 + bottom cap
# straight clothing edges like his: skirt hem ring flat, skirt top = one flat ring at his sweater line, rest tucked under
def cast_d(o, d, tris):
    A0 = tris[:, 0]; e1 = tris[:, 1] - A0; e2 = tris[:, 2] - A0
    pv = np.cross(d, e2); det = (e1 * pv).sum(1); ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    tv = o - A0; u = (tv * pv).sum(1) * inv; qv = np.cross(tv, e1); v = (d * qv).sum(1) * inv; t = (e2 * qv).sum(1) * inv
    hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    return t[hit].max() if hit.any() else 0.0
names_ = list(D["names"])
lo, hi = JT.part_verts(D, "skirt"); nr_, ns_ = JT.LAYOUT["skirt"]; Rs = V[lo:lo + nr_ * ns_].reshape(ns_, nr_, 3)
Rs[0, :, 2] = np.median(Rs[0, :, 2])
torso_tris = V[D["F"][D["P"] == names_.index("torso")]]
ZB = 0.934                                   # his sweater/skirt boundary height (labelled hull: sweater from z 0.96)
cz = Rs[:, :, 2].mean(1); ib = int(np.argmin(np.abs(cz - ZB)))
for r in range(ib, ns_):
    c = Rs[r].mean(0)
    if r == ib: Rs[r, :, 2] = ZB
    for j in range(nr_):
        d = Rs[r, j] - c; d[2] = 0; L = np.linalg.norm(d); d /= L + 1e-12
        tor = cast_d(np.array([c[0], c[1], Rs[r, j, 2]]), d, torso_tris)
        if tor <= 0: continue
        if r == ib: Rs[r, j, :2] = c[:2] + d[:2] * max(L, tor + 0.002)          # the edge ring sits just outside
        else: Rs[r, j, :2] = c[:2] + d[:2] * min(L, tor - 0.010)                # above it: tucked under the sweater
V[lo:lo + nr_ * ns_] = Rs.reshape(-1, 3)
# torso rings below the line: 1 cm inside the skirt (no z-fighting between sweater and skirt under the edge)
lo, hi = JT.part_verts(D, "torso"); nrt, nst = JT.LAYOUT["torso"]; Rt = V[lo:lo + nrt * nst].reshape(nst, nrt, 3)
for r in range(nst):
    c = Rt[r].mean(0)
    if c[2] < ZB - 0.004:
        d = Rt[r] - c; d[:, 2] = 0; L = np.linalg.norm(d, axis=1, keepdims=True)
        Rt[r, :, :2] = c[:2] + (d * np.maximum(L - 0.010, 0.3 * L) / (L + 1e-12))[:, :2]
V[lo:lo + nrt * nst] = Rt.reshape(-1, 3)
# hair shell: rebuild the inner surface as a clean inward offset of the fitted outer one (the fit can crumple the
# shell so the inner surface pokes through the outer at thin locks; seen from outside that shows the shell's inside)
names = list(D["names"]); hp = names.index("hair")
lo, hi = JT.part_verts(D, "hair"); n0 = (hi - lo) // 2
HFc = D["F"][D["P"] == hp]; outer = HFc[(HFc < lo + n0).all(1)]
fn = np.cross(V[outer[:, 1]] - V[outer[:, 0]], V[outer[:, 2]] - V[outer[:, 0]])
vn = np.zeros((len(V), 3)); np.add.at(vn, outer[:, 0], fn); np.add.at(vn, outer[:, 1], fn); np.add.at(vn, outer[:, 2], fn)
E = np.unique(np.sort(np.concatenate([outer[:, [0, 1]], outer[:, [1, 2]], outer[:, [2, 0]]]), 1), axis=0)
for _ in range(6):
    acc = vn.copy(); np.add.at(acc, E[:, 0], vn[E[:, 1]]); np.add.at(acc, E[:, 1], vn[E[:, 0]]); vn = acc
vn /= np.linalg.norm(vn, axis=1, keepdims=True) + 1e-12
V[lo + n0:hi] = V[lo:lo + n0] - vn[lo:lo + n0] * 0.006
D["V"] = V; D["hips"] = json.dumps(hips)
np.savez(sys.argv[2], **D); print("fixup: skirt hem z", round(hem, 3), "re-routed above", round(z0, 3), hips)
