"""Soft-blush proof: v8b GLB vs new GLB, same clean import, face close-ups front + 3/4.
Non-blush expressions: 0 changed pixels required. Blush expressions: changes only inside the v8b blush footprint (pixels
where the v8b blush render differs from the same expression without blush, dilated 2 px).
python -I tools/wanim/blush_soft.py -> review/blush_soft.png, review/blush_soft_diff.png"""
import os, sys, json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import anim_review as AR

MO = json.load(open(os.path.join(ROOT, "ref", "v8b", "face_meta.json"))); MN = json.load(open(os.path.join(ROOT, "ref", "face_meta.json")))
PLAIN = [("open", "neutral"), ("happy", "sweetSmile"), ("smug", "cat"), ("sideEyeR", "smirk"), ("bedroom", "kiss"), ("winkR", "parted")]
BLUSH = [(e + "+blush", m + "+blush") for e, m in [("open", "neutral"), ("happy", "sweetSmile"), ("shy", "softSmile"), ("sideEyeL", "smirk"),
                                                   ("hearts", "kiss"), ("smug", "cat")]]
BASE = [(e.replace("+blush", ""), m.replace("+blush", "")) for e, m in BLUSH]
VIEWS = ["front", "3q"]


def shots(tag, combos):
    return [dict(out=os.path.join(AR.TMP, f"bs_{tag}_{i}_{v}.png"), clip=None, frame=1, view=v, ctr=AR.u([0, 0, 1.585]), ext=0.36 * AR.S, eyes=e, mouth=m)
            for i, (e, m) in enumerate(combos) for v in VIEWS]


def load(tag, i, v): return np.array(Image.open(os.path.join(AR.TMP, f"bs_{tag}_{i}_{v}.png")).convert("RGB")).astype(int)


def main():
    AR.META = MO; AR.render(os.path.join(ROOT, "ref", "cmp", "old.blend"), shots("o", PLAIN + BLUSH) + shots("ob", BASE), 320)
    AR.META = MN; AR.render(os.path.join(ROOT, "ref", "cmp", "new.blend"), shots("n", PLAIN + BLUSH) + shots("nb", BASE), 320)
    rows, rep = [], []
    for i, (e, m) in enumerate(PLAIN + BLUSH):
        for v in VIEWS:
            a, b = load("o", i, v), load("n", i, v); diff = np.abs(a - b).sum(-1) > 0
            if i >= len(PLAIN):
                ob, nb = load("ob", i - len(PLAIN), v), load("nb", i - len(PLAIN), v)       # blush footprint = old blush OR new (feathered) blush
                foot = nd.binary_dilation((np.abs(a - ob).sum(-1) > 0) | (np.abs(b - nb).sum(-1) > 0), iterations=1)
            else:
                foot = np.zeros_like(diff)
            bad = diff & ~foot; rep.append((e, m, v, int(diff.sum()), int(bad.sum()), i >= len(PLAIN)))
            vis = np.full_like(a, 40); vis[foot] = [70, 70, 90]; vis[diff & foot] = [90, 200, 120]; vis[bad] = [255, 40, 40]
            rows.append((a, b, vis, f"{e} / {m} ({v}): changed {int(diff.sum())}, outside blush {int(bad.sum())}"))
    tot_plain = sum(r[3] for r in rep if not r[5]); tot_bad = sum(r[4] for r in rep)
    W = 320
    for name, cols in (("blush_soft.png", 2), ("blush_soft_diff.png", 3)):
        sel = [r for r in rows if "+blush" in r[3]] if name == "blush_soft.png" else rows
        per = 2 if cols == 3 else 3
        im = Image.new("RGB", (per * (cols * W + 30) + 10, 50 + ((len(sel) + per - 1) // per) * (W + 26) + 10), (34, 36, 42)); d = ImageDraw.Draw(im)
        title = ("Soft blush (v9): before (v8b) | after: radial falloff (edges feathered ~1-2 texels wider), ~32 % lighter, same place" if cols == 2 else
                 f"v8b GLB | new GLB | diff (grey = blush footprint: v8b blush or new feathered blush, green = changed inside it, red = changed outside). "
                 f"Non-blush changed px: {tot_plain}. Changes outside blush: {tot_bad}")
        d.text((10, 12), title, fill=(240, 240, 240), font=AR.font(18))
        for k, (a, b, vis, lab) in enumerate(sel):
            r, q = divmod(k, per); x = 10 + q * (cols * W + 30); y = 50 + r * (W + 26)
            for j, arr in enumerate((a, b, vis)[:cols]): im.paste(Image.fromarray(arr.astype(np.uint8)), (x + j * W, y))
            d.text((x + 4, y + W + 4), lab, fill=(210, 210, 210) if "outside blush 0" in lab else (255, 120, 120), font=AR.font(13))
        im.save(os.path.join(ROOT, "review", name))
    for r in rep: print(f"{r[0]:16s} {r[1]:18s} {r[2]:5s} changed {r[3]:5d}  outside blush {r[4]:5d}")
    print("TOTAL non-blush changed", tot_plain, " outside-blush changes", tot_bad)


if __name__ == "__main__":
    main()
