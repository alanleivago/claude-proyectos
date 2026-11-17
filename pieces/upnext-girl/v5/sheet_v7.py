"""review/sheet_v7.png: turnaround (his rest pose), his 3 poses, 8 expressions, and overlay rows at his calibrated
cameras (ours | his | ours 50 % over his | silhouette diff) with IoU per band measured on the Blender renders."""
import json, numpy as np
from PIL import Image, ImageDraw
import sys; sys.path.insert(0, ".")
from fit import bands
R = "F:/Claude Proyectos/pieces/upnext-girl/review/"
F = "F:/Claude Proyectos/fuentes/mml2-girl-tutorial/frames/"
MS = np.unpackbits(np.load("turn5_masks.npy"), axis=-1)[..., :1920].astype(bool)
BG = (24, 26, 32); W = 1800
OV = [("front (rest, 11:29)", "front", F + "rest2/r011.png", np.asarray(Image.open("ref_front_mask.png")) > 127, 1062),
      ("3/4 (12:23)", "q3", F + "turn5/t046.png", MS[45], None), ("side (12:16)", "side", F + "turn5/t011.png", MS[10], None),
      ("back (12:17)", "back", F + "turn5/t016.png", MS[15], None),
      ("idle front (12:39)", "idle", F + "cam/front_idle.png", np.asarray(Image.open("ref_front_idle_mask.png")) > 127, None),
      ("run key A (12:44.0)", "runA", F + "cam/run_764.0.png", np.asarray(Image.open("ref_runA_mask.png")) > 127, None),
      ("run key B (12:44.4)", "runB", F + "cam/run_764.4.png", np.asarray(Image.open("ref_runB_mask.png")) > 127, None)]
CLOSE = {}


def iou(a, b): return (a & b).sum() / max(1, (a | b).sum())


rows, report = [], {}
for label, v, frame, hm, cut in OV:
    o = Image.open(f"rr_{v}.png").convert("RGBA"); oa = np.asarray(o).astype(float)
    om = oa[..., 3] > 127; hmm = hm.copy()
    if cut: om[cut:] = False; hmm[cut:] = False
    sc = {"all": iou(om, hmm)}
    for n, (a, b) in bands(hmm).items(): sc[n] = iou(om[a:b], hmm[a:b])
    report[v] = {k: round(float(x), 3) for k, x in sc.items()}
    h = np.asarray(Image.open(frame).convert("RGB")).astype(float)
    al = oa[..., 3:4] / 255
    ours = oa[..., :3] * al + np.array(BG) * (1 - al)
    blend = h * (1 - 0.5 * al) + oa[..., :3] * 0.5 * al
    diff = h * 0.35; diff[om & ~hmm] = [255, 60, 60]; diff[hmm & ~om] = [60, 150, 255]; diff[om & hmm] = [200, 200, 200]
    ys, xs = np.nonzero(om | hmm); y0, y1 = ys.min() - 20, ys.max() + 20; cx = int((xs.min() + xs.max()) / 2)
    hw = int((y1 - y0) * 0.36)
    box = (cx - hw, y0, cx + hw, y1)
    tiles = [Image.fromarray(x.astype(np.uint8)).crop(box) for x in (ours, h, blend, diff)]
    hy = np.nonzero(hmm.any(1))[0]; Y0, Y1 = hy.min(), hy.max(); Hh = Y1 - Y0
    hx = np.nonzero(hmm[Y0:int(Y0 + 0.215 * Hh)].any(0))[0]; X0, X1 = hx.min(), hx.max(); m_ = int(0.08 * Hh)
    CLOSE[v] = (Image.fromarray(ours.astype(np.uint8)), Image.fromarray(h.astype(np.uint8)),
                (X0 - m_, Y0 - m_ // 2, X1 + m_, int(Y0 + 0.22 * Hh)), (X0 - m_, int(Y0 + 0.17 * Hh), X1 + m_, int(Y0 + 0.36 * Hh)))
    th = 430; tiles = [t.resize((int(t.width * th / t.height), th), Image.NEAREST) for t in tiles]
    row = Image.new("RGB", (W, th + 26), BG); d = ImageDraw.Draw(row); x = 10
    for t in tiles: row.paste(t, (x, 24)); x += t.width + 8
    d.text((10, 4), f"{label}:  IoU head+hair {sc['head']:.3f}   body {sc['body']:.3f}   legs {sc['legs']:.3f}   (all {sc['all']:.3f})"
           "   |  ours  |  his  |  ours 50% over his  |  red = ours only, blue = his only", fill=(235, 235, 235))
    rows.append(row)
json.dump(report, open("iou_v7.json", "w"), indent=1); print(report)


def fit(im, w, h):
    im = im.convert("RGB"); im.thumbnail((w, h), Image.NEAREST); return im


top = Image.new("RGB", (W, 2400), BG); d = ImageDraw.Draw(top); y = 8
d.text((10, y), "v7 - TURNAROUND in his rest pose (pieces placed against his calibrated turntable + rest frame)", fill=(235, 235, 235)); y += 20
cw = W // 4
for i, v in enumerate(("front", "3q_l", "side_l", "back")):
    a = fit(Image.open(R + f"v7_turn_{v}.png"), cw - 10, 520); top.paste(a, (i * cw + (cw - a.width) // 2, y)); d.text((i * cw + 8, y + 4), v, fill=(200, 200, 200))
y += 530; d.text((10, y), "HIS 3 FINAL POSES: idle / hand on hip / running punch  (ours front + 3/4, then his frame)", fill=(235, 235, 235)); y += 20
poses = [("tut_idle", F + "cam/front_idle.png", (760, 60, 1200, 1060)), ("tut_hip", F + "turn5/t046.png", (680, 40, 1220, 1040)),
         ("tut_run", F + "ref/t785.png", (760, 100, 1180, 1000))]
pw = W // 3
for i, (n, ref, box) in enumerate(poses):
    for k, v in enumerate(("front", "3q_l")):
        a = fit(Image.open(R + f"v7_{n}_{v}.png"), pw // 3 - 6, 420); top.paste(a, (i * pw + k * (pw // 3), y))
    b = Image.open(ref).convert("RGB").crop(box); b.thumbnail((pw // 3 - 6, 420)); top.paste(b, (i * pw + 2 * (pw // 3), y))
    d.text((i * pw + 8, y + 4), n, fill=(200, 200, 200))
y += 430; d.text((10, y), "8 KEY EXPRESSIONS (his Ashley_Face cells rebuilt pixel by pixel)", fill=(235, 235, 235)); y += 20
ew = W // 8
for i, n in enumerate(["neutral", "happy", "talk", "surprised", "angry", "sad", "blink", "wink"]):
    a = fit(Image.open(R + f"v7_expr_{n}.png"), ew - 6, ew - 6); top.paste(a, (i * ew + 3, y)); d.text((i * ew + 6, y + 4), n, fill=(200, 200, 200))
y += ew + 10
d.text((10, y), "CLOSE-UPS at his cameras: face+hair and scarf+shawl, ours (left) next to his (right) - front rest 11:29, 3/4 12:23, side 12:16", fill=(235, 235, 235)); y += 20
x = 10
for v in ("front", "q3", "side"):
    o_, h_, hb, sb = CLOSE[v]
    for bx in (hb, sb):
        for im in (o_, h_):
            c = im.crop(bx); c = c.resize((int(c.width * 200 / c.height), 200), Image.NEAREST); top.paste(c, (x, y)); x += c.width + 4
        x += 10
    if x > W - 400: x = 10; y += 210
y += 210
d.text((10, y), "OVERLAYS at his cameras (turntable camera calibrated from 50 frames, hull consistency 0.95; rest frame camera fitted)", fill=(235, 235, 235)); y += 22
top = top.crop((0, 0, W, y))
H = top.height + sum(r.height for r in rows)
out = Image.new("RGB", (W, H), BG); out.paste(top, (0, 0)); yy = top.height
for r in rows: out.paste(r, (0, yy)); yy += r.height
out.save(R + "sheet_v7.png"); print(out.size)
