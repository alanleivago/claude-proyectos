"""#7 only: repair the kit-v6 body texture seams of one human WITHOUT touching the shared kit files.
Reads styles/zawdog/humans/<name>/body.png + per-texel rest maps of both body halves (tex/texmap/<name>.neg.npz and
.pos.npz, made by tools/texmap.py inside Blender: the body's UVMap rasterised, rest position + main bone per texel)
and writes pieces/zaw-dog-07/tex/<name>_body_fix.png, which shots.py loads in place of body.png (skin slot + the face
material's skin layer).
Why: the Flow garment photo ends on the UV seams, which zig-zag along polygon edges -> a ragged white fringe at the
sleeves and the collar. Fix = straight hems in 3D, per body half:
  1. sleeve: a straight hem `sleeve_len` m down the arm axis from the shoulder cap: garment texels below it become
     skin (the arm's own tone with the photo's shading); every sleeve texel above it (arm + shoulder bones, outside the
     torso) takes the garment photo's own texels from one clean torso patch (no grey opening interior, no flecks),
     plus a 1-texel fold shade on the hem;
  2. collar (tees): a straight collar line (front / back) at the top of the photo's notch; skin dipping below it takes
     the garment photo patch (no skin band);
  3. hands toned to the forearm (the hand photo was pinker), then the warm skin texels pulled part of the way
     (skin_k) toward the face photo's cheek tone (look.json) so the neck and arms match the face.
Usage: .venv/bin/python -I fix_body.py <name> [skin_k] [sleeve_len_m] [collar_pct (0 = off)]"""
import json, sys
from pathlib import Path

import cv2
import numpy as np

R = Path(__file__).resolve().parents[3]
name = sys.argv[1]
skin_k = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
sl_len = float(sys.argv[3]) if len(sys.argv) > 3 else 0.12
co_pct = float(sys.argv[4]) if len(sys.argv) > 4 else 12
HD = R / "styles" / "zawdog" / "humans" / name
TM = R / "pieces" / "zaw-dog-07" / "tex" / "texmap"
img = cv2.imread(str(HD / "body.png")).astype(np.float32)
out = img.copy()
marks = np.zeros(img.shape[:2], np.uint8)
log = []
body0 = np.zeros(img.shape[:2], bool)

for side, sg in (("neg", -1), ("pos", 1)):
    d = np.load(TM / f"{name}.{side}.npz"); pos, mat = d["pos"], d["mat"]
    valid = (mat == 0) | (mat == 1); body0 |= mat == 0
    x, y, z = np.abs(pos[..., 0]), pos[..., 1], pos[..., 2]
    warm = (out[..., 2] - out[..., 0]) > 30
    garm = valid & ~warm
    names = [str(n_) for n_ in d["names"]]
    armb = [i for i, n_ in enumerate(names) if n_.startswith(("upperarm", "lowerarm"))]
    arm = valid & np.isin(d["bone"], armb) & (sg * pos[..., 0] > 0.12)
    P = pos[arm]; c = P.mean(0); _, _, vt = np.linalg.svd(P - c); ax = vt[0]
    if ax[2] > 0:
        ax = -ax                                              # t grows down the arm, away from the shoulder
    t = np.full(x.shape, -9.0, np.float32); t[arm] = (pos[arm] - c) @ ax
    t_h = np.percentile(t[arm], 2) + sl_len                 # (a cylinder / pure-arm axis variant cut into the shoulder: dropped)
    ck = np.median(out[arm & warm & (t > t_h + 0.08)], 0)
    lum = out.mean(-1, keepdims=True); lum_m = float(np.median(lum[arm & warm]))
    skin_like = ck * np.clip(lum / max(lum_m, 1), 0.85, 1.12) ** 0.5
    tor = valid & (x < 0.13) & (z > 1.12) & (z < 1.36) & garm
    ys_, xs_ = np.where(tor)
    r0, r1 = np.percentile(ys_, [30, 70]).astype(int); c0, c1 = np.percentile(xs_, [30, 70]).astype(int)
    patch = img[r0:r1, c0:c1]; Hp, Wp = patch.shape[:2]
    src = np.pad(patch, ((0, max(0, 256 - Hp)), (0, max(0, 256 - Wp)), (0, 0)), mode="symmetric")[:256, :256]   # mirrored: no tile seams
    gl = float(np.median(lum[tor]))
    cut = arm & garm & (t > t_h)
    fill = arm & (t <= t_h) & (warm | (lum[..., 0] < 0.8 * gl))        # sleeve skin flecks + the grey opening interior
    out[cut] = skin_like[cut]; out[fill] = src[fill]
    hem = arm & (t > t_h - 0.012) & (t <= t_h)
    out[hem] *= 0.84
    marks[cut] = 1; marks[fill] = 2; marks[hem] = 3
    nfl = 0
    if co_pct > 0:                                                      # tee collar: a straight line at the notch's top;
        neck = (mat == 0) & (x < 0.09) & (z > 1.34) & (z < 1.56)       # skin dipping below it takes the garment patch
        for fb in (y < -0.02, y >= -0.02):
            gn = neck & fb & garm
            if gn.sum() < 5:
                continue
            zc = np.percentile(z[gn], co_pct)
            cn = neck & fb & warm & (z < zc)
            out[cn] = src[cn]
            marks[cn] = 4; nfl += int(cn.sum())
    log.append(f"{side}: hem t={t_h:+.3f} cut {int(cut.sum())} fill {int(fill.sum())} hem {int(hem.sum())} collar {nfl}")

# hands: the hand photo is pinker than the arm -> per-channel gain to the forearm's median (both halves)
for side in ("neg", "pos"):
    d = np.load(TM / f"{name}.{side}.npz"); nm_ = [str(n_) for n_ in d["names"]]; vb = d["bone"]; ok = (d["mat"] == 0)
    hand = ok & np.isin(vb, [i for i, n_ in enumerate(nm_) if n_.startswith(("wrist", "finger", "metacarpal", "thumb"))])
    fore = ok & np.isin(vb, [i for i, n_ in enumerate(nm_) if n_.startswith("lowerarm")]) & ((out[..., 2] - out[..., 0]) > 30)
    if hand.sum() > 20 and fore.sum() > 20:
        out[hand] = out[hand] * (np.median(out[fore], 0) / np.maximum(np.median(out[hand], 0), 1))
        log.append(f"{side} hands toned ({int(hand.sum())} texels)")

look = json.loads((HD / "look.json").read_text())
cheek = np.array(look["cheek"][::-1], np.float32)            # RGB -> BGR
skin = body0 & ((out[..., 2] - out[..., 0]) > 30)
sk_med = np.median(out[skin], 0)
gain = np.clip(cheek / np.maximum(sk_med, 1), 0.78, 1.25)
out[skin] = out[skin] * (1 + skin_k * (gain - 1))

dst = R / "pieces" / "zaw-dog-07" / "tex" / f"{name}_body_fix.png"
o8 = np.clip(out, 0, 255).astype(np.uint8); cv2.imwrite(str(dst), o8)
ov = o8.copy()
for k_, col in ((1, (0, 0, 255)), (2, (0, 255, 0)), (3, (0, 255, 255)), (4, (255, 0, 0))):
    ov[marks == k_] = col
cmp_ = np.hstack([cv2.resize(x_, (512, 512), interpolation=cv2.INTER_NEAREST) for x_ in (img.astype(np.uint8), o8, ov)])
cv2.imwrite(str(dst.with_name(f"{name}_body_fix_cmp.jpg")), cmp_)
print(name, "; ".join(log), "| skin", sk_med.round(), "cheek", cheek, "gain", gain.round(3), "->", dst)
