"""v3 fixes sheet. python -I tools/wanim/fixes_v3.py before|after|compose"""
import os, sys, json
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import anim_review as AR

TMP = AR.TMP; u = AR.u; S = AR.S
SHOTS = []
for c, f, lab in ((None, 1, "rest"), ("idle_sway", 1, "idle"), ("walk", 9, "walk")):
    SHOTS.append(("belly", "B", c, f, "side", u([0, 0, 1.02]), 0.62, f"belly side {lab} (arms hidden)"))
for c, f, lab, z in ((None, 1, "rest", 0.86), ("walk", 9, "walk", 0.86), ("sit_chair", 30, "sit", 0.62)):
    for v in ("side", "3qb", "back"):
        SHOTS.append(("butt", "B", c, f, v, u([0, 0, z]), 0.62, f"butt {v} {lab}"))
for v in ("back", "3q", "front"):
    SHOTS.append(("jeans", "C", None, 1, v, u([0, 0, 0.86]), 0.62, f"jeans {v}"))
for v in ("side", "back", "3q"):
    SHOTS.append(("kneel", "C", "kneel", 40, v, u([0, 0, 0.45]), 1.3, f"kneel {v}"))


def render(tag):
    for opt in "BC":
        sh = [dict(out=os.path.join(TMP, f"fx_{tag}_{i}.png"), clip=c, frame=f, view=v, ctr=ctr, ext=ext * S,
                   noarms=(g == "belly" or (g == "butt" and v == "side")))
              for i, (g, o, c, f, v, ctr, ext, _) in enumerate(SHOTS) if o == opt]
        blend = AR.GLB[opt] if tag == "after" else os.path.join(ROOT, "ref", "v2", {"B": "waitress_shorts_v2.blend", "C": "waitress_jeans_v2.blend"}[opt])
        AR.render(blend, sh, 300)
    # closed-eye cells from the atlas
    sys.path.insert(0, os.path.join(ROOT, "tools"))
    E = Image.open(os.path.join(ROOT, "tex", "face_eyes.png") if tag == "after" else os.path.join(ROOT, "ref", "v2", "face_eyes.png"))
    cw, ch = E.width // 16, E.height // 4
    names = json.load(open(os.path.join(ROOT, "ref", "face_meta.json")))["face_eyes"]
    for i, n in enumerate(("blink", "happy", "wink", "relaxed", "winkL", "tease")):
        k = names.index(n); E.crop(((k % 16) * cw, (k // 16) * ch, (k % 16 + 1) * cw, (k // 16 + 1) * ch)).resize((cw * 300 // cw, ch * 300 // cw), Image.NEAREST).save(os.path.join(TMP, f"fx_{tag}_eye{i}.png"))


def compose():
    F = AR.font(18); F2 = AR.font(15)
    groups = [("1 belly: flat stomach (side)", "belly"), ("2 butt: one smooth curve into the thighs", "butt"), ("3 jeans: dark stitching", "jeans"),
              ("5 kneel: shoes", "kneel")]
    rows = []
    for title, g in groups:
        idx = [i for i, s in enumerate(SHOTS) if s[0] == g]
        rows.append((title, [(os.path.join(TMP, f"fx_before_{i}.png"), os.path.join(TMP, f"fx_after_{i}.png"), SHOTS[i][7]) for i in idx]))
    rows.append(("5 closed-eye cells: skin patches", [(os.path.join(TMP, f"fx_before_eye{i}.png"), os.path.join(TMP, f"fx_after_eye{i}.png"), n)
                                                      for i, n in enumerate(("blink", "happy", "wink", "relaxed", "winkL", "tease"))]))
    W = 300; blocks = []
    for title, items in rows:
        per = 3 if len(items) > 6 else len(items)
        nrow = (len(items) + per - 1) // per
        hh = max(Image.open(a).height for a, _, _ in items)
        im = Image.new("RGB", (per * (2 * W + 16) + 10, 34 + nrow * (hh + 24)), (34, 36, 42)); d = ImageDraw.Draw(im)
        d.text((10, 8), title + "   (left = v2 before, right = v3 after)", fill=(240, 240, 240), font=F)
        for k, (a, b, lab) in enumerate(items):
            r, q = divmod(k, per); x = 10 + q * (2 * W + 16); y = 34 + r * (hh + 24)
            im.paste(Image.open(a).convert("RGB"), (x, y)); im.paste(Image.open(b).convert("RGB"), (x + W, y))
            d.text((x + 4, y + hh + 3), lab, fill=(210, 210, 210), font=F2)
        blocks.append(im)
    blocks.append(jitter_plot())
    Wt = max(b.width for b in blocks); Ht = sum(b.height for b in blocks)
    out = Image.new("RGB", (Wt, Ht), (34, 36, 42)); y = 0
    for b in blocks: out.paste(b, (0, y)); y += b.height
    out.save(os.path.join(ROOT, "review", "fixes_v3.png")); print("FIXES", out.size)


def jitter_plot():
    B = json.load(open(os.path.join(ROOT, "ref", "v2", "jitter.json"))); A = json.load(open(os.path.join(ROOT, "ref", "jitter.json")))
    worst = sorted(B, key=lambda c: -B[c]["max_excess_mm"])[:8]
    W, H = 300, 150; im = Image.new("RGB", (4 * (W + 20) + 20, 40 + 2 * (H + 40) + 30), (34, 36, 42)); d = ImageDraw.Draw(im)
    d.text((10, 8), "4 arm jitter: max frame-to-frame acceleration of elbows / wrists / hand tips (red = v2, green = v3, grey = Ashley x leg ratio)",
           fill=(240, 240, 240), font=AR.font(17))
    for k, c in enumerate(worst):
        r, q = divmod(k, 4); x0 = 20 + q * (W + 20); y0 = 40 + r * (H + 40)
        aw0, aw1, aa = np.array(B[c]["acc_w"]), np.array(A[c]["acc_w"]), np.array(A[c]["acc_a"])
        top = max(aw0.max(), 1e-4); d.rectangle([x0, y0, x0 + W, y0 + H], outline=(90, 90, 100))
        for arr, col in ((aa * 1.5 + 0.002, (140, 140, 150)), (aw0, (230, 80, 80)), (aw1, (90, 220, 120))):
            pts = [(x0 + W * i / max(len(arr) - 1, 1), y0 + H - H * min(v / top, 1)) for i, v in enumerate(arr)]
            d.line(pts, fill=col, width=2)
        d.text((x0, y0 + H + 4), f"{c}: {B[c]['max_excess_mm']:.0f} -> {A[c]['max_excess_mm']:.1f} mm/f2, spikes {B[c]['spikes']} -> {A[c]['spikes']}",
               fill=(220, 220, 220), font=AR.font(13))
    tot0 = sum(v["spikes"] for v in B.values()); tot1 = sum(v["spikes"] for v in A.values())
    d.text((10, im.height - 24), f"all 46 clips: spike frames {tot0} -> {tot1}; worst excess {max(v['max_excess_mm'] for v in B.values()):.0f} -> "
           f"{max(v['max_excess_mm'] for v in A.values()):.1f} mm/f2", fill=(240, 240, 240), font=AR.font(15))
    return im


if __name__ == "__main__":
    a = sys.argv[1]
    if a in ("before", "after"): render(a)
    else: compose()
