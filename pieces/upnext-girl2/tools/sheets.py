"""Review sheets: his frame | ours | 50 % overlay | diff at 12+ turntable angles + face close-up, with metrics.
python tools/sheets.py <mesh.npz> [--tag v1] [--frames ...]  (ours = numpy unlit render of the textured mesh, or
--renders DIR with ours_<frame>.png from the engine)"""
import sys, os, json, argparse, numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, "tools")
from raster import render_tex
ap = argparse.ArgumentParser(); ap.add_argument("inp"); ap.add_argument("--tag", default="")
ap.add_argument("--renders", default=""); ap.add_argument("--frames", default="")
a = ap.parse_args()
D = np.load(a.inp, allow_pickle=True); V, F, C = D["V"], D["F"], D["C"]
cam = json.loads(str(D["cam"])); A = D["alphas"]
CL = np.load("ref/cls.npz")["c"]
FR = [int(x) for x in a.frames.split(",")] if a.frames else [0, 21, 42, 63, 84, 105, 125, 146, 167, 188, 209, 230]
texs = [np.asarray(Image.open(p).convert("RGB")).astype(np.float32) for p in ("tex/body.png", "tex/face_eyes.png", "tex/face_mouth.png")]
os.makedirs("review", exist_ok=True)
BOX = (150, 250, 950, 1850)
rows = []; summary = []


def label(img, txt):
    im = Image.fromarray(img); d = ImageDraw.Draw(im); d.rectangle([0, 0, 8 * len(txt) + 8, 18], fill=(0, 0, 0)); d.text((4, 3), txt, fill=(255, 255, 255))
    return np.asarray(im)


for n, k in enumerate(FR):
    his = np.asarray(Image.open(f"ref/frames/f{k + 1:03d}.png").convert("RGB")).astype(np.float32)
    if a.renders:
        ours = np.asarray(Image.open(os.path.join(a.renders, f"ours_{k:03d}.png")).convert("RGB")).astype(np.float32); fid = None
    else:
        ours, fid = render_tex(V, F, D["FUV"], D["FMAT"], texs, cam, A[k], 1.0)
    bg = np.array([235, 221, 199.])
    mo = np.abs(ours - bg).sum(-1) > 30; mh = CL[k] > 0
    iou = (mo & mh).sum() / (mo | mh).sum()
    diff = np.abs(ours - his).sum(-1) / 3
    u = mo | mh; mad = diff[u].mean(); bad = (diff[u] > 40).mean()
    x0, y0, x1, y1 = BOX
    ov = 0.5 * ours + 0.5 * his
    dimg = np.clip(diff * 3, 0, 255); dimg = np.stack([dimg] * 3, -1)
    panels = [label(np.clip(p[y0:y1, x0:x1], 0, 255).astype(np.uint8), t) for p, t in
              ((his, f"his f{k + 1:03d}"), (ours, "ours"), (ov, "50% overlay"), (dimg, "|diff| x3"))]
    sheet = np.concatenate(panels, 1)
    Image.fromarray(sheet).save(f"review/sheet_{n + 1:02d}{a.tag}.png")
    ang = (A[k] - A[0]) % 360
    summary.append(dict(n=n + 1, frame=k + 1, angle=round(float(-ang) % 360, 1), iou=round(float(iou), 4), mad=round(float(mad), 2), bad=round(float(bad), 4)))
    rows.append(np.asarray(Image.fromarray(sheet).resize((sheet.shape[1] // 4, sheet.shape[0] // 4))))
    print(summary[-1], flush=True)
# face close-up (front frame and a 3/4 frame)
fc = []
for k in (0, 42, 209):
    his = np.asarray(Image.open(f"ref/frames/f{k + 1:03d}.png").convert("RGB")).astype(np.float32)
    ours = (np.asarray(Image.open(os.path.join(a.renders, f"ours_{k:03d}.png")).convert("RGB")).astype(np.float32) if a.renders
            else render_tex(V, F, D["FUV"], D["FMAT"], texs, cam, A[k], 1.0)[0])
    box = (380, 270, 700, 560)
    hh, oo = his[box[1]:box[3], box[0]:box[2]], ours[box[1]:box[3], box[0]:box[2]]
    dd = np.clip(np.abs(oo - hh).sum(-1, keepdims=True).repeat(3, -1), 0, 255)
    fc.append(np.concatenate([label(np.clip(x, 0, 255).astype(np.uint8), t) for x, t in ((hh, f"his f{k + 1:03d}"), (oo, "ours"), (0.5 * hh + 0.5 * oo, "50%"), (dd, "diff"))], 1))
face = np.concatenate(fc, 0)
Image.fromarray(face).resize((face.shape[1] * 2, face.shape[0] * 2), Image.NEAREST).save(f"review/sheet_face{a.tag}.png")
H = max(r.shape[0] for r in rows)
Image.fromarray(np.concatenate([np.concatenate(rows[i:i + 2], 1) for i in range(0, len(rows), 2)], 0)).save(f"review/sheet_all{a.tag}.png")
json.dump(summary, open(f"review/metrics{a.tag}.json", "w"), indent=1)
print("mean IoU", np.mean([s["iou"] for s in summary]).round(4), "mean |diff|", np.mean([s["mad"] for s in summary]).round(2),
      "bad px", np.mean([s["bad"] for s in summary]).round(4))
