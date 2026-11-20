"""landmarks on the Flow garment photos (magenta key) -> work/photo_lm.json + work/photo_lm_check.jpg
    .venv/bin/python styles/zawdog/humans/ownerf/tools/photo_lm.py"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import D  # noqa: E402

PH = os.path.join(D, "photo"); W = os.path.join(D, "work")


def key_mask(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mag = (r > 150) & (b > 150) & (g < 120) & (np.abs(r - b) < 90)
    return ~mag


def runs(row, gap=4, minlen=6):
    xs = np.nonzero(row)[0]
    if not len(xs):
        return []
    out = []; s = xs[0]; p = xs[0]
    for x in xs[1:]:
        if x - p > gap:
            if p - s + 1 >= minlen:
                out.append((s, p))
            s = x
        p = x
    if p - s + 1 >= minlen:
        out.append((s, p))
    return out


def clean(m):
    # drop tiny specks: keep rows/cols with enough mass
    return m


def jacket_lm(a, x0, x1, front):
    m = key_mask(a)[:, x0:x1]
    H = m.shape[0]
    R = [runs(m[y]) for y in range(H)]
    ys = [y for y in range(H) if R[y]]
    top, bot = ys[0], ys[-1]
    three = [y for y in range(H) if len(R[y]) >= 3]
    arm_y = three[0]
    L = {}
    rr = R[arm_y]
    L["armpit_r"] = (rr[1][0], arm_y)            # image-left torso side = the garment's RIGHT side in a front view
    L["armpit_l"] = (rr[-2][1], arm_y)
    # hem: last row that still has the torso (middle) run
    mid_a = R[arm_y + 10][1] if len(R[arm_y + 10]) >= 3 else R[arm_y][1]
    cx_ = (mid_a[0] + mid_a[1]) // 2
    cols = m[:, cx_ - 40:cx_ + 40]
    yh = int(np.nonzero(cols.any(1))[0].max()) - 4
    mid = next(r for r in R[yh] if r[0] <= cx_ + 40 and r[1] >= cx_ - 40)
    mid = (min(r[0] for r in R[yh] if r[1] >= mid_a[0] - 30 and r[0] <= mid_a[1] + 30), max(r[1] for r in R[yh] if r[1] >= mid_a[0] - 30 and r[0] <= mid_a[1] + 30))
    L["hem_r"] = (mid[0], yh); L["hem_l"] = (mid[1], yh)
    # cuffs: lowest rows of the outer runs
    yl = max(y for y in range(H) if R[y] and R[y][0][1] < mid_a[0] - 5)
    yr = max(y for y in range(H) if R[y] and R[y][-1][0] > mid_a[1] + 5)
    L["cuff_r_out"] = (R[yl][0][0], yl); L["cuff_r_in"] = (R[yl][0][1], yl)
    L["cuff_l_in"] = (R[yr][-1][0], yr); L["cuff_l_out"] = (R[yr][-1][1], yr)
    # sleeve axis (centres of the outer runs below the armpit) -> shoulder point extrapolated to the shoulder line
    ysh = int(top + 0.42 * (arm_y - top))
    rs = R[ysh]
    L["shoulder_r"] = (rs[0][0], ysh); L["shoulder_l"] = (rs[-1][1], ysh)
    L["collar_top"] = ((R[top][0][0] + R[top][-1][1]) // 2, top)
    sub = a[:, x0:x1].astype(int)
    if front:
        # opening: darker lining between the panels, per row from the collar to the hem
        V = sub.max(2)
        cx = cx_
        ed = {}
        for y in (arm_y, (arm_y + yh) // 2, yh - 6):
            row = V[y]
            # walk from the centre outwards until the brightness rises over the lining level
            lin = np.median(row[cx - 6:cx + 6])
            xl = cx
            while xl > mid[0] and row[xl] < lin + 18:
                xl -= 1
            xr = cx
            while xr < mid[1] and row[xr] < lin + 18:
                xr += 1
            ed[y] = (xl, xr)
        L["open_r_top"] = (ed[arm_y][0], arm_y); L["open_l_top"] = (ed[arm_y][1], arm_y)
        k = (arm_y + yh) // 2
        L["open_r_mid"] = (ed[k][0], k); L["open_l_mid"] = (ed[k][1], k)
        L["open_r_hem"] = (ed[yh - 6][0], yh); L["open_l_hem"] = (ed[yh - 6][1], yh)
    return {k: (int(v[0]) + x0, int(v[1])) for k, v in L.items() if v is not None}


def jeans_lm(a, x0, x1):
    m = key_mask(a)[:, x0:x1]
    H = m.shape[0]
    R = [runs(m[y]) for y in range(H)]
    ys = [y for y in range(H) if R[y]]
    top, bot = ys[0], ys[-1]
    two = [y for y in range(H) if len(R[y]) >= 2]
    cr = two[0]
    L = {"waist_r": (R[top + 3][0][0], top + 3), "waist_l": (R[top + 3][-1][1], top + 3), "crotch": ((R[cr][0][1] + R[cr][1][0]) // 2, cr)}
    yk = int(cr + 0.45 * (bot - cr))
    L["knee_r_out"] = (R[yk][0][0], yk); L["knee_r_in"] = (R[yk][0][1], yk)
    L["knee_l_in"] = (R[yk][1][0], yk); L["knee_l_out"] = (R[yk][1][1], yk)
    yb = bot - 2
    L["hem_r_out"] = (R[yb][0][0], yb); L["hem_r_in"] = (R[yb][0][1], yb)
    L["hem_l_in"] = (R[yb][-1][0], yb); L["hem_l_out"] = (R[yb][-1][1], yb)
    yhp = int(top + 0.45 * (cr - top))
    L["hip_r"] = (R[yhp][0][0], yhp); L["hip_l"] = (R[yhp][-1][1], yhp)
    return {k: (int(v[0]) + x0, int(v[1])) for k, v in L.items()}


def bbox(a, x0, x1, y0=0, y1=None):
    m = key_mask(a)[y0:y1, x0:x1]
    ys, xs = np.nonzero(m)
    return [int(xs.min() + x0), int(ys.min() + y0), int(xs.max() + x0), int(ys.max() + y0)]


out = {}
ja = np.asarray(Image.open(os.path.join(PH, "jacket.jpg")).convert("RGB"))
Wj = ja.shape[1]
out["jacket_front"] = jacket_lm(ja, 0, Wj // 2, True)
out["jacket_back"] = jacket_lm(ja, Wj // 2, Wj, False)
jn = np.asarray(Image.open(os.path.join(PH, "jeans.jpg")).convert("RGB"))
out["jeans_front"] = jeans_lm(jn, 0, jn.shape[1] // 2)
out["jeans_back"] = jeans_lm(jn, jn.shape[1] // 2, jn.shape[1])
bg = np.asarray(Image.open(os.path.join(PH, "boots_gloves.jpg")).convert("RGB"))
Wb = bg.shape[1]
out["boot_front"] = bbox(bg, 0, int(Wb * 0.19)); out["boot_side"] = bbox(bg, int(Wb * 0.20), int(Wb * 0.5))
out["glove_back"] = bbox(bg, int(Wb * 0.55), int(Wb * 0.75)); out["glove_palm"] = bbox(bg, int(Wb * 0.745), Wb)
json.dump(out, open(os.path.join(W, "photo_lm.json"), "w"), indent=1)

# check sheet
ims = []
for fn, keys in (("jacket.jpg", ("jacket_front", "jacket_back")), ("jeans.jpg", ("jeans_front", "jeans_back")), ("boots_gloves.jpg", ())):
    im = Image.open(os.path.join(PH, fn)).convert("RGB"); d = ImageDraw.Draw(im)
    for k in keys:
        for n, (x, y) in out[k].items():
            d.ellipse((x - 5, y - 5, x + 5, y + 5), outline=(255, 255, 0), width=2); d.text((x + 6, y - 6), n, fill=(255, 255, 255))
    if fn.startswith("boots"):
        for k in ("boot_front", "boot_side", "glove_back", "glove_palm"):
            d.rectangle(out[k], outline=(255, 255, 0), width=2); d.text((out[k][0], out[k][1] - 12), k, fill=(255, 255, 255))
    ims.append(im.resize((960, int(960 * im.size[1] / im.size[0]))))
S = Image.new("RGB", (960, sum(i.size[1] for i in ims))); y = 0
for i in ims:
    S.paste(i, (0, y)); y += i.size[1]
S.save(os.path.join(W, "photo_lm_check.jpg"), quality=88)
print(json.dumps({k: (len(v) if isinstance(v, dict) else v) for k, v in out.items()}))
