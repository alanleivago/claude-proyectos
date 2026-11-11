"""venv: zaw-dog #5 prop textures from this piece's Flow props sheet (ref/flow/gen 2026-11-10, one image, 3x3 on magenta).
 1 bowl full of kibble (3/4)  -> tex/src/bowl_food (loft) + tex/kibble_top.png (the kibble, for the open top)
 2 empty bowl (3/4)           -> tex/src/bowl (loft)
 3 cast-iron lamppost         -> tex/src/lamppost (loft)
 4 folded towel               -> tex/towel_fold.png          5 towel flat (top) -> tex/towel_top.png
 6 treat pile                 -> tex/treats.png (cut-out)    + tex/treat_sw.png (one biscuit swatch)
 7 reading glasses            -> tex/glasses.png             8 newspaper -> tex/newspaper.png + headline cards
 9 empty bowl, top-down       -> tex/bowl_top.png (the open top of the lofted bowls)
python prep_05.py"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H)
import prep_04 as P4  # noqa: E402   (key / save_cut / save_src / cells; importing re-runs the #4 prep on the copied files: harmless)
T, G = P4.T, P4.G
sheet = sorted(f for f in os.listdir(G) if f.startswith("2026-11-10"))[0]
C = P4.cells(os.path.join(G, sheet))
for i, n in ((0, "bowl_food"), (1, "bowl"), (2, "lamppost")):
    rgb, al = P4.key(C[i]); P4.save_src(rgb, al, n)
for i, n, th in ((3, "towel_fold", 64), (4, "towel_top", 96), (5, "treats", 64), (6, "glasses", 48), (7, "newspaper", 128)):
    rgb, al = P4.key(C[i]); P4.save_cut(rgb, al, n, th)
rgb, al = P4.key(C[8])                                                   # top-down bowl: square crop, keep alpha (round)
P4.save_cut(rgb, al, "bowl_top", 96)
rgb, al = P4.key(C[0]); ys, xs = np.nonzero(al)                          # kibble: the brown heap inside the rim
br = (rgb[..., 0].astype(int) - rgb[..., 2] > 40) & al
yy, xx = np.nonzero(br); k = rgb[yy.min():yy.max(), xx.min():xx.max()]
Image.fromarray(k).resize((64, 64), Image.BOX).quantize(32).convert("RGB").save(os.path.join(T, "kibble_top.png"))
t6 = np.asarray(Image.open(os.path.join(T, "treats.png")).convert("RGB"))
Image.fromarray(t6[t6.shape[0] // 3: t6.shape[0] // 3 + 16, t6.shape[1] // 3: t6.shape[1] // 3 + 16]).save(os.path.join(T, "treat_sw.png"))
# headline cards for line 2: the Flow newspaper with its headline bar overprinted
F = "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf"
src = Image.open(os.path.join(T, "newspaper.png")).convert("RGBA")
for key_, txt in (("news_buster", "BUSTER\nWAS HERE"), ("news_newdog", "NEW DOG\nIN TOWN")):
    im = src.resize((src.width * 4, src.height * 4), Image.NEAREST); d = ImageDraw.Draw(im); W, Hh = im.size
    d.rectangle((W * 0.08, Hh * 0.05, W * 0.92, Hh * 0.42), fill=(242, 240, 232, 255))
    f = ImageFont.truetype(F, int(Hh * 0.14))
    d.multiline_text((W / 2, Hh * 0.235), txt, font=f, fill=(18, 18, 18, 255), anchor="mm", align="center", spacing=4)
    im.resize(src.size, Image.BOX).save(os.path.join(T, f"{key_}.png")); print(key_)
# the lamppost: its pole is ~8 px wide, which key()'s opening erased -> key it without the opening, more profile rings
from scipy import ndimage as nd
a = np.asarray(C[2].convert("RGB")).astype(int); m = ~P4.bgmask(a)
lab, n = nd.label(m); sizes = nd.sum(m, lab, range(1, n + 1)); m = nd.binary_fill_holes(np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 25]))
ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1], 0, None); a[..., 0] -= ex; a[..., 2] -= ex
ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
rgb = np.clip(a[y0:y1, x0:x1], 0, 255).astype(np.uint8); al = m[y0:y1, x0:x1]
out = rgb.copy(); out[~al] = (255, 0, 255)
pad = np.full((out.shape[0] + 40, out.shape[1] + 40, 3), (255, 0, 255), np.uint8); pad[20:-20, 20:-20] = out
Image.fromarray(pad).save(os.path.join(P4.SRC, "lamppost.png"))
P4.PP.prepare(os.path.join(P4.SRC, "lamppost.png"), tex_h=192, colors=32, eps_px=1.5, max_rings=28)
for n_ in ("bowl", "bowl_food"):
    P4.PP.prepare(os.path.join(P4.SRC, f"{n_}.png"), tex_h=128, colors=32, eps_px=3, max_rings=10)
# the loft profile stops at the thin neck under the lantern: loft the lantern and the pole separately
lp = np.asarray(Image.open(os.path.join(P4.SRC, "lamppost.png")).convert("RGB")).copy()
fg = ~((lp[..., 0] > 200) & (lp[..., 2] > 200) & (lp[..., 1] < 80)); w = fg.sum(1)
rows = np.flatnonzero(w); top = rows[0]; neck = top + 10 + int(np.argmin(np.where(w[top + 10:top + 80] > 0, w[top + 10:top + 80], 99)))
for nm, sl in (("lamp_head", slice(0, neck)), ("lamp_pole", slice(neck, None))):
    part = lp[sl]; pad = np.full((part.shape[0] + 40, part.shape[1], 3), (255, 0, 255), np.uint8); pad[20:-20] = part
    Image.fromarray(pad).save(os.path.join(P4.SRC, f"{nm}.png"))
    P4.PP.prepare(os.path.join(P4.SRC, f"{nm}.png"), tex_h=128, colors=32, eps_px=1.5, max_rings=20)
print("lamp neck row", neck, "of", lp.shape[0], "top", top)
# the 3/4 bowl photos: rows above the rim are the far rim's ellipse (a dome if lofted) -> the loft starts at the rim
import json
for n_ in ("bowl", "bowl_food"):
    pj = os.path.join(P4.SRC, f"{n_}.prop.json"); P_ = json.load(open(pj)); rg = P_["rings"]; mx = max(r for _, r in rg)
    k0 = next(i for i, (_, r) in enumerate(rg) if r >= 0.9 * mx); P_["rings"] = [x for x in rg[k0:] if x[1] >= 0.85 * mx]; json.dump(P_, open(pj, "w"))
    print(n_, "rings", P_["rings"])
# round alpha for the kibble heap (it sits inside the round rim)
kb = Image.open(os.path.join(T, "kibble_top.png")).convert("RGBA"); yy, xx = np.mgrid[:64, :64]
kb.putalpha(Image.fromarray((((yy - 31.5) ** 2 + (xx - 31.5) ** 2) < 31 ** 2).astype(np.uint8) * 255)); kb.save(os.path.join(T, "kibble_top.png"))
for n_ in ("lamp_head", "lamp_pole"):                                    # magenta seen at the caps -> dark iron
    tp = os.path.join(P4.SRC, f"{n_}_tex.png"); t_ = np.asarray(Image.open(tp).convert("RGB")).copy()
    mg = (t_[..., 0].astype(int) - t_[..., 1] > 30) & (t_[..., 2].astype(int) - t_[..., 1] > 30); t_[mg] = (28, 28, 30); Image.fromarray(t_).save(tp)
# the reading glasses (thumbnail): key()'s opening ate the thin frame -> key without the opening, keep every part
a = np.asarray(C[6].convert("RGB")).astype(int); m = ~P4.bgmask(a)
lab, n = nd.label(m); sizes = nd.sum(m, lab, range(1, n + 1)); m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 15])
ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1], 0, None); a[..., 0] -= ex; a[..., 2] -= ex
ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
rgb = np.clip(a[y0:y1, x0:x1], 0, 255).astype(np.uint8); al = m[y0:y1, x0:x1]
_, (iy, ix) = nd.distance_transform_edt(~al, return_indices=True)
g = Image.fromarray(rgb[iy, ix]).resize((256, round(256 * al.shape[0] / al.shape[1])), Image.LANCZOS)
g.putalpha(Image.fromarray((al * 255).astype(np.uint8)).resize(g.size, Image.LANCZOS).point(lambda v: 255 if v > 90 else 0))
g.save(os.path.join(T, "glasses.png")); print("glasses", g.size, "parts", int((sizes > 15).sum()))
# user standing rules (2026-11-10): a sharp high-res sky photo and a crisp rug photo (both new Flow images)
import shutil
if not os.path.exists(os.path.join(T, "sky_old.png")):
    shutil.copy(os.path.join(T, "sky.png"), os.path.join(T, "sky_old.png"))
sky = Image.open(os.path.join(G, next(f for f in sorted(os.listdir(G)) if "clear--1" in f))).convert("RGB")
sky.save(os.path.join(T, "sky.png")); print("sky", sky.size)
rg = np.asarray(Image.open(os.path.join(G, next(f for f in sorted(os.listdir(G)) if "orthographic-product" in f))).convert("RGB")).astype(int)
bright = rg.sum(-1) > 60; ys, xs = np.nonzero(bright)
rug = Image.fromarray(rg[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.uint8)).resize((144, 90), Image.LANCZOS).point(lambda v: int(128 + (v - 128) * 0.8)).quantize(20, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB").resize((720, 450), Image.NEAREST)   # PS1 texels (~1.5 cm, 24 colours) blown up x4 nearest: crisp edges, no fine detail to shimmer (768 px photo flickered 17-35 %)
rug.save(os.path.join(T, "rug_hd.png")); print("rug_hd", rug.size)
