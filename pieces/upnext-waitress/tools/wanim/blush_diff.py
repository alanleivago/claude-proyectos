"""OLD vs NEW GLB face proof: both GLBs imported by the same clean pipeline (imp_glb_clean.py), face close-ups front + 3/4
for 6 non-blush and 6 blush expressions, per-pixel diff. Non-blush: must be 0 changed pixels. Blush: changes allowed
only on blush pixels (either render). python -I tools/wanim/blush_diff.py -> review/blush_diff.png"""
import os, sys, json
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import anim_review as AR

MO = json.load(open(os.path.join(ROOT, "ref", "v7_before", "face_meta.json"))); MN = json.load(open(os.path.join(ROOT, "ref", "face_meta.json")))
PLAIN = [("open", "neutral"), ("happy", "sweetSmile"), ("smug", "cat"), ("sideEyeR", "smirk"), ("bedroom", "kiss"), ("winkR", "parted")]
BLUSH = [("open+blush", "neutral+blush"), ("happy+blush", "sweetSmile+blush"), ("shy+blush", "softSmile+blush"),
         ("sideEyeL+blush", "smirk+blush"), ("hearts+blush", "kiss+blush"), ("smug+blush", "cat+blush")]
VIEWS = ["front", "3q"]
BLUSH_RGB = [np.array([0xf6, 0xc2, 0xac]), np.array([0xe8, 0x8e, 0x88])]


def shots(tag):
    out = []
    for i, (e, m) in enumerate(PLAIN + BLUSH):
        for v in VIEWS:
            out.append(dict(out=os.path.join(AR.TMP, f"bd_{tag}_{i}_{v}.png"), clip=None, frame=1, view=v, ctr=AR.u([0, 0, 1.585]),
                            ext=0.36 * AR.S, eyes=e, mouth=m))
    return out


def near(img, rgb, tol=10): return (np.abs(img.astype(int) - rgb).sum(-1) <= tol)


def main():
    AR.META = MO; AR.render(os.path.join(ROOT, "ref", "cmp", "old.blend"), shots("o"), 320)
    AR.META = MN; AR.render(os.path.join(ROOT, "ref", "cmp", "new.blend"), shots("n"), 320)
    rows, report = [], []
    for i, (e, m) in enumerate(PLAIN + BLUSH):
        blush = i >= len(PLAIN)
        for v in VIEWS:
            a = np.array(Image.open(os.path.join(AR.TMP, f"bd_o_{i}_{v}.png")).convert("RGB"))
            b = np.array(Image.open(os.path.join(AR.TMP, f"bd_n_{i}_{v}.png")).convert("RGB"))
            diff = np.abs(a.astype(int) - b.astype(int)).sum(-1) > 0
            allowed = np.zeros_like(diff)
            if blush:
                for c in BLUSH_RGB: allowed |= near(a, c) | near(b, c)
            bad = diff & ~allowed
            report.append((e, m, v, int(diff.sum()), int(bad.sum()), blush))
            vis = np.full_like(a, 40); vis[diff & allowed] = [90, 200, 120]; vis[bad] = [255, 40, 40]
            rows.append((a, b, vis, f"{e} / {m} ({v}): changed {int(diff.sum())} px, outside blush {int(bad.sum())}"))
    W = 320; per = 2
    im = Image.new("RGB", (per * (3 * W + 30) + 10, 50 + (len(rows) // per) * (W + 26) + 10), (34, 36, 42)); d = ImageDraw.Draw(im)
    tot_plain = sum(r[3] for r in report if not r[5]); tot_bad = sum(r[4] for r in report)
    d.text((10, 10), f"OLD GLB | NEW GLB | diff (green = blush pixels, red = anything else).  Non-blush changed px total: {tot_plain}.  "
           f"Changes outside blush (all 24 renders): {tot_bad}", fill=(240, 240, 240), font=AR.font(18))
    for k, (a, b, vis, lab) in enumerate(rows):
        r, q = divmod(k, per); x = 10 + q * (3 * W + 30); y = 50 + r * (W + 26)
        for j, arr in enumerate((a, b, vis)): im.paste(Image.fromarray(arr.astype(np.uint8)), (x + j * W, y))
        d.text((x + 4, y + W + 4), lab, fill=(210, 210, 210) if "outside blush 0" in lab else (255, 120, 120), font=AR.font(13))
    im.save(os.path.join(ROOT, "review", "blush_diff.png"))
    for r in report: print(f"{r[0]:16s} {r[1]:18s} {r[2]:5s} changed {r[3]:5d}  outside blush {r[4]:5d}")
    print("TOTAL non-blush changed", tot_plain, " outside-blush changes", tot_bad)


if __name__ == "__main__":
    main()
