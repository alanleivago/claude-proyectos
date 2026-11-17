"""V2 / V3 of girl2: bigger bust and butt (torso / skirt / upper-leg vertices only, everything else = V1), V2 with bare
legs (leggings texels recoloured to his skin palette, knee facets kept as skin shades), V3 with his leggings.
python tools/variants.py ref/final_tex.npz ref/rig_in.npz  -> ref/rig_in_v2.npz, ref/rig_in_v3.npz, tex/body_bare.jpg"""
import sys, os, json, numpy as np
from PIL import Image
from scipy import ndimage as nd
sys.path.insert(0, "tools")
import joints as JT
from bake import texels
D = dict(np.load(sys.argv[1], allow_pickle=True)); R = dict(np.load(sys.argv[2], allow_pickle=True))
V0 = D["V"].astype(float); F = D["F"]; P = D["P"]; names = list(D["names"])
assert np.allclose(V0, R["V"]), "rig_in must come from the same mesh"
J = {k: np.array(v) for k, v in json.loads(str(R["joints"])).items()}
pid = {n: i for i, n in enumerate(names)}
vpart = np.zeros(len(V0), int)
for fi in range(len(F)): vpart[F[fi]] = P[fi]
fn = np.cross(V0[F[:, 1]] - V0[F[:, 0]], V0[F[:, 2]] - V0[F[:, 0]])
vn = np.zeros_like(V0); np.add.at(vn, F[:, 0], fn); np.add.at(vn, F[:, 1], fn); np.add.at(vn, F[:, 2], fn)
vn /= np.linalg.norm(vn, axis=1, keepdims=True) + 1e-12
V = V0.copy()


def cast(o, d, tris):
    """distance along unit d from o to the first triangle of tris (n,3,3), inf if none"""
    A0 = tris[:, 0]; e1 = tris[:, 1] - A0; e2 = tris[:, 2] - A0
    pv = np.cross(d, e2); det = (e1 * pv).sum(1); ok = np.abs(det) > 1e-12; inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    tv = o - A0; u = (tv * pv).sum(1) * inv; qv = np.cross(tv, e1); v = (d * qv).sum(1) * inv; t = (e2 * qv).sum(1) * inv
    hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    return t[hit].min() if hit.any() else np.inf


obst = np.concatenate([V0[F[P == pid[n]]] for n in ("farmR", "farmL", "uarmR", "uarmL")])
# ---------------------------------------------------------------- bust (torso front)
ti = np.nonzero(vpart == pid["torso"])[0]; T = V0[ti]
band = (T[:, 2] > 1.06) & (T[:, 2] < 1.26)
cx = float(np.median(T[band][:, 0]))
apex = {}
for s, sg in (("L", 1), ("R", -1)):
    ax_, az_ = cx + sg * 0.054, 1.155
    tt = V0[F[P == pid["torso"]]]
    o_ = np.array([ax_, 0.5, az_]); dist = cast(o_, np.array([0, -1.0, 0]), tt)     # first hit from the back...
    hits = []; o2 = o_.copy()
    for _ in range(6):                                                             # ...walk to the front-most surface
        dd_ = cast(o2, np.array([0, -1.0, 0]), tt)
        if not np.isfinite(dd_): break
        o2 = o2 + np.array([0, -1.0, 0]) * (dd_ + 1e-4); hits.append(o2[1])
    apex[s] = np.array([ax_, min(hits) if hits else -0.1, az_])
print("bust apex", {k: v.round(3) for k, v in apex.items()})
BUST = 0.042; SIG = 0.05
for j, v in zip(ti, T):
    disp = np.zeros(3)
    for s in "LR":
        a = apex[s]; d2 = ((v - a) / [SIG, SIG * 1.4, SIG]) ** 2
        w = np.exp(-0.5 * d2.sum())
        if w < 1e-3 or vn[j][1] > 0.35: continue
        dirn = vn[j] * 0.6 + np.array([np.sign(a[0] - cx) * 0.15, -1.0, -0.25]) * 0.4; dirn /= np.linalg.norm(dirn)
        disp += BUST * w * dirn
    L = np.linalg.norm(disp)
    if L > 1e-5:
        room = cast(v, disp / L, obst) - 0.004            # stay behind the fist / forearm / upper arms
        V[j] = v + disp * min(1.0, max(0.0, room) / L)
# ---------------------------------------------------------------- butt (skirt back, hips, upper thighs)
# smooth field of position only (normal independent, so the hem and the skirt's bottom cap move together): two lobes
# centred on the buttocks at mid-skirt height, capped at 1 where they overlap, fading towards the waist and the hem
BUTT = 0.058
si = np.nonzero(vpart == pid["skirt"])[0]; cys = float(np.median(V0[si, 1]))
for part, amp in (("skirt", 1.0), ("torso", 0.6), ("legL", 0.8), ("legR", 0.8)):
    for j in np.nonzero(vpart == pid[part])[0]:
        v0 = V0[j]
        if part == "torso" and v0[2] > 1.0: continue
        wl = sum(np.exp(-0.5 * (((v0[0] - (cx + sg * 0.06)) / 0.08) ** 2 + ((v0[2] - 0.805) / 0.075) ** 2)) for sg in (1, -1))
        wb = np.clip((v0[1] - cys) / 0.035, 0, 1)
        V[j] += amp * BUTT * min(1.0, wl) * wb * np.array([0.2 * np.sign(v0[0] - cx), 1.0, 0.0])
        wh = np.exp(-0.5 * ((v0[2] - 0.84) / 0.07) ** 2) * (part in ("skirt", "torso"))          # a little wider hips
        V[j][0] += 0.012 * wh * np.sign(v0[0] - cx) * min(1.0, abs(v0[0] - cx) / 0.08)
# skirt underside (down-facing cap of the low-poly skirt) tucked 2.5 cm up so the fuller hem never shows a ledge
zs = V0[si, 2]; hem = float(np.percentile(zs, 12)); cxy = np.median(V0[si, :2], 0)
for j in si:
    if V0[j][2] < hem - 0.004:                      # the old tube cap tip hangs below the hem: pull it up inside
        V[j][2] = hem + 0.02; V[j][:2] = cxy + (V[j][:2] - cxy) * 0.5
mv = np.linalg.norm(V - V0, axis=1)
print("moved verts", int((mv > 1e-5).sum()), "max mm", round(mv.max() * 1000, 1),
      "parts", sorted({names[p] for p in np.unique(vpart[mv > 1e-5])}))
# ---------------------------------------------------------------- bare-leg texture
body = np.asarray(Image.open("tex/body.jpg").convert("RGB")).astype(float); TS = body.shape[0]
partmap = np.full(TS * TS, -1)
pix, fid, _ = texels(F, D["FUV"], TS, np.nonzero(D["FMAT"] == 0)[0])
partmap[pix] = P[fid]
known = partmap >= 0
_, (iy, ix) = nd.distance_transform_edt(~known.reshape(TS, TS), return_indices=True)
partmap = partmap.reshape(TS, TS)[iy, ix]
legm = np.isin(partmap, [pid["legL"], pid["legR"]])
SK = np.array([248, 196, 181.]); LEG = np.median(body[legm], 0)
lum = lambda c: c @ [0.3, 0.59, 0.11]
rel = lum(body[legm]) / lum(LEG)
k = np.where(rel < 1, 1 + 0.85 * (rel - 1), 1 + 0.35 * (rel - 1))
bare = body.copy(); bare[legm] = np.clip(SK[None] * k[:, None], 0, 255)
Image.fromarray(bare.astype(np.uint8)).save("tex/body_bare.jpg", quality=94)
print("legs median colour", LEG.round(), "-> skin; texels", int(legm.sum()))
root = os.path.abspath(".").replace("\\", "/")
for tag, tex in (("v2", f"{root}/tex/body_bare.jpg"), ("v3", f"{root}/tex/body.jpg")):
    out = dict(R); out["V"] = V; t = list(R["tex"]); t[0] = tex; out["tex"] = np.array(t)
    np.savez(f"ref/rig_in_{tag}.npz", **out)
np.savez("ref/curvy_mesh.npz", **{**D, "V": V})
print("variants written")
