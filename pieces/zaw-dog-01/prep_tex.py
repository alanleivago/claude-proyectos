"""venv: Flow references (ref/flow) -> PS1 textures in tex/ (128-256 px, ~32 colours; Blender samples them Closest).
- tiles_*: 2x2 grids of flat texture photos -> one tile each (floor, wallpaper, rug, fabric, door, cabinets, checker, brick)
- props_*: 3x3 magenta product sheets -> RGBA cut-outs per object (+ photoprop profile for the lofted ones)
- car: side + front elevations on magenta -> car_side / car_front (windows were keyed out by Flow's magenta: refilled)
- street_view: the backdrop seen through the window / behind the street set (sky kept)
python prep_tex.py"""
import json, os, sys
from scipy import ndimage as nd
import numpy as np
from PIL import Image

H = os.path.dirname(os.path.abspath(__file__)); F = os.path.join(H, "ref", "flow"); T = os.path.join(H, "tex")
os.makedirs(T, exist_ok=True)
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
import photoprop as PP  # noqa: E402


def ps1(im, size, colors=32):
    im = im.convert("RGB").resize(size, Image.BOX)
    return im.quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


def quad(path, names, px=128, inset=0.035):
    im = Image.open(path).convert("RGB"); w, h = im.size
    for k, n in enumerate(names):
        if not n:
            continue
        cx, cy = k % 2, k // 2
        box = (int((cx + inset) * w / 2), int((cy + inset) * h / 2), int((cx + 1 - inset) * w / 2), int((cy + 1 - inset) * h / 2))
        sz = px if isinstance(px, tuple) else (px, px)
        ps1(im.crop(box), sz).save(os.path.join(T, f"{n}.png"))


def magenta_mask(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return ~((r > 170) & (b > 170) & (g < 120) & (np.abs(r - b) < 80))


def cutout(im, name, tex_h=128, colors=32, fill_holes=None):
    """magenta cell -> tight RGBA cut-out (alpha 0/1), PS1-sized."""
    a = np.asarray(im.convert("RGB")); m = magenta_mask(a)
    from scipy import ndimage as nd
    m = nd.binary_opening(m, iterations=2)
    lab, n = nd.label(m)
    if n == 0:
        return
    big = np.argmax(nd.sum(m, lab, range(1, n + 1))) + 1
    keep = lab == big
    sizes = nd.sum(m, lab, range(1, n + 1))
    for i, s in enumerate(sizes, 1):                     # keep parts of the same object (pairs of shoes, leash...)
        if s > 0.08 * sizes.max():
            keep |= lab == i
    pinkish = (a[..., 0].astype(int) > 120) & (a[..., 2].astype(int) > 120) & (a[..., 1].astype(int) < 110) & \
        (a[..., 0].astype(int) - a[..., 1].astype(int) > 60)
    keep = keep & ~pinkish                               # de-spill: JPEG magenta fringe never counts as object
    if fill_holes:                                       # windows keyed out: give them glass
        holes = nd.binary_fill_holes(keep) & ~keep
        a = a.copy(); a[holes] = fill_holes; keep = keep | holes
    keep = nd.binary_erosion(keep, iterations=2)                                # trim the keyed rim (magenta halo)
    ys, xs = np.nonzero(keep); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgb = a[y0:y1, x0:x1].copy(); al = keep[y0:y1, x0:x1]
    _, (iy, ix) = nd.distance_transform_edt(~al, return_indices=True)    # bleed edge colours (no magenta fringe)
    rgb = rgb[iy, ix]
    tw = max(16, round(tex_h * rgb.shape[1] / rgb.shape[0] / 4) * 4)
    if tw > 256:
        tw, tex_h = 256, max(16, round(256 * rgb.shape[0] / rgb.shape[1] / 4) * 4)
    c = ps1(Image.fromarray(rgb), (tw, tex_h), colors)
    al = Image.fromarray((al * 255).astype(np.uint8)).resize((tw, tex_h), Image.BOX).point(lambda v: 255 if v > 127 else 0)
    c.putalpha(al); c.save(os.path.join(T, f"{name}.png"))
    return {"name": name, "w_px": int(x1 - x0), "h_px": int(y1 - y0), "tex": [tw, tex_h]}


HOLES = {"tv_cabinet": (52, 34, 22), "bookshelf": (52, 34, 22)}


def grid3(path, names, tex_h=128):
    im = Image.open(path).convert("RGB"); w, h = im.size; info = {}
    for k, n in enumerate(names):
        cx, cy = k % 3, k // 3
        cell = im.crop((int(cx * w / 3) + 6, int(cy * h / 3) + 6, int((cx + 1) * w / 3) - 6, int((cy + 1) * h / 3) - 6))
        cell.save(os.path.join(T, "src", f"{n}.png"))
        info[n] = cutout(cell, n, tex_h, fill_holes=HOLES.get(n))
    return info


os.makedirs(os.path.join(T, "src"), exist_ok=True)
quad(os.path.join(F, "tiles_living.jpg"), ["floor_wood", "wallpaper", "rug", "fabric"])
quad(os.path.join(F, "tiles_house.jpg"), ["door_green", "cabinets", "checker", "brick"])
info = grid3(os.path.join(F, "props_a.jpg"), ["sofa_front", "tv_cabinet", "bookshelf", "floor_lamp", "plant", "sneakers", "fridge", "stove", "clock"])
info |= grid3(os.path.join(F, "props_b.jpg"), ["lab_coat", "stool", "tshirt", "bag_paper", "bag_plastic", "dog_bowl", "coat_rack", "side_table", "microscope"])
car = Image.open(os.path.join(F, "car.jpg")).convert("RGB"); w, h = car.size
info["car_side"] = cutout(car.crop((0, 0, int(w * 0.66), h)), "car_side", 128, fill_holes=(38, 46, 58))
info["car_front"] = cutout(car.crop((int(w * 0.66), 0, w, h)), "car_front", 128, fill_holes=(38, 46, 58))
# lofted props (photoprop): plant, lamp need the profile json next to their source cell
for n in ("plant", "floor_lamp", "dog_bowl"):
    src_ = np.asarray(Image.open(os.path.join(T, "src", f"{n}.png")).convert("RGB")).copy()
    r_, g_, b_ = (src_[..., i].astype(int) for i in range(3))
    src_[(r_ > 120) & (b_ > 120) & (g_ < 110) & (r_ - g_ > 60)] = (255, 0, 255)      # fringe -> pure key colour
    Image.fromarray(src_).save(os.path.join(T, "src", f"{n}.png"))
    PP.prepare(os.path.join(T, "src", f"{n}.png"), tex_h=128, colors=32)
    tp = os.path.join(T, "src", f"{n}_tex.png"); ta = np.asarray(Image.open(tp).convert("RGB")).copy()
    mk = (ta[..., 0].astype(int) > 120) & (ta[..., 2].astype(int) > 120) & (ta[..., 1].astype(int) < 110)
    if mk.any() and (~mk).any():                          # rows photoprop left un-bled: fill from the nearest object texel
        _, (iy, ix) = nd.distance_transform_edt(mk, return_indices=True); ta = ta[iy, ix]
    Image.fromarray(ta).save(tp)
sv = Image.open(os.path.join(F, "street_view.jpg")).convert("RGB")
ps1(sv, (256, 144), 48).save(os.path.join(T, "street_view.png"))
ps1(sv.crop((0, 0, sv.width, int(sv.height * 0.62))), (256, 96), 48).save(os.path.join(T, "street_far.png"))   # houses + trees + sky (road modelled)
ps1(sv.crop((0, 0, sv.width, int(sv.height * 0.30))), (128, 48), 32).save(os.path.join(T, "sky.png"))
# night sky + night street for line 11 (darkened, blue)
a = np.asarray(sv).astype(np.float32) / 255
night = np.clip(a ** 1.8 * np.array([0.30, 0.36, 0.62]) * 1.1, 0, 1)
ps1(Image.fromarray((night * 255).astype(np.uint8)), (256, 144), 32).save(os.path.join(T, "street_night.png"))
json.dump(info, open(os.path.join(T, "props.json"), "w"), indent=1)
print("tex:", sorted(os.listdir(T)))

# ground textures cut from the street photo (same light as the backdrop), lab sign, framed pictures
W_, H_ = sv.size
for n, (y0, y1, x0, x1) in {"asphalt": (0.665, 0.73, 0.05, 0.45), "concrete": (0.785, 0.84, 0.05, 0.45), "grass": (0.9, 1.0, 0.05, 0.5)}.items():
    ps1(sv.crop((int(x0 * W_), int(y0 * H_), int(x1 * W_), int(y1 * H_))), (128, 64), 24).save(os.path.join(T, f"{n}.png"))
from PIL import ImageDraw, ImageFont
sign = Image.new("RGB", (512, 128), (232, 236, 240)); d = ImageDraw.Draw(sign)
d.rectangle((4, 4, 507, 123), outline=(40, 70, 120), width=8)
d.text((256, 66), "BARNARD DOG LAB", font=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 52), fill=(30, 60, 110), anchor="mm")
ps1(sign, (256, 64), 16).save(os.path.join(T, "lab_sign.png"))
ps1(Image.open(os.path.join(F, "face_owner_src.jpg")).crop((150, 60, 874, 900)), (64, 76), 32).save(os.path.join(T, "pic_owner.png"))
ps1(Image.open(os.path.join(H, "..", "zaw-dog-test", "ref", "side_real.jpg")), (96, 64), 32).save(os.path.join(T, "pic_dog.png"))
ps1(sv.crop((int(0.45 * W_), int(0.1 * H_), W_, int(0.7 * H_))), (96, 64), 32).save(os.path.join(T, "pic_land.png"))
lr = Image.open(os.path.join(F, "living_ref.jpg"))
ps1(lr.crop((1075, 25, 1180, 120)), (64, 64), 32).save(os.path.join(T, "pic_ref1.png"))
print("extra tex done")

# car: side silhouette -> simplified outline (u, v in 0..1 of car_side.png, v up) for an extruded low-poly body
al = np.asarray(Image.open(os.path.join(T, "car_side.png")))[..., 3] > 127
h, w = al.shape; top, bot = [], []
for x in range(w):
    ys = np.flatnonzero(al[:, x])
    if len(ys):
        top.append((x + 0.5, ys.min())); bot.append((x + 0.5, ys.max() + 1))

simp = lambda pts: [list(map(float, p)) for p in PP._rdp([(float(x), float(y)) for x, y in pts], 1.2)]
outline = simp(top) + simp(bot[::-1])
json.dump({"w": w, "h": h, "pts": [[x / w, 1 - y / h] for x, y in outline]}, open(os.path.join(T, "car_outline.json"), "w"))
print("car outline", len(outline), "pts")

# wall clock face without hands (the hands are 3D, so 9b can set 0:30 / 2:00 / 4:00)
cf = Image.new("RGBA", (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(cf)
d.ellipse((2, 2, 253, 253), fill=(250, 250, 248), outline=(30, 30, 30), width=10)
fn = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 34)
import math as _m
for k in range(1, 13):
    a = _m.radians(k * 30); d.text((128 + 92 * _m.sin(a), 128 - 92 * _m.cos(a)), str(k), font=fn, fill=(20, 20, 20), anchor="mm")
for k in range(60):
    a = _m.radians(k * 6); r0 = 112 if k % 5 else 106
    d.line((128 + r0 * _m.sin(a), 128 - r0 * _m.cos(a), 128 + 117 * _m.sin(a), 128 - 117 * _m.cos(a)), fill=(40, 40, 40), width=2)
cf.resize((128, 128), Image.BOX).save(os.path.join(T, "clock_face.png"))
print("clock face")

# Zaw's rooms are greyer and darker than a fresh cream wallpaper: knock it down and warm it (compare.jpg)
wp = np.asarray(Image.open(os.path.join(T, "wallpaper.png")).convert("RGB")).astype(np.float32)
Image.fromarray(np.clip(wp * np.array([0.80, 0.76, 0.68]), 0, 255).astype(np.uint8)).save(os.path.join(T, "wallpaper.png"))
print("wallpaper darkened")

# ---- v2 (user review): groceries, trees, real pictures, wall variation + grime, doormat, car details
info2 = grid3(os.path.join(F, "groceries.jpg"), ["g_pineapple", "g_bananas", "g_cola", "g_milk", "g_cereal", "g_bread", "g_wine", "g_eggs", "g_steak"])
tr = Image.open(os.path.join(F, "trees.jpg")).convert("RGB"); w, h = tr.size
for k, n in enumerate(["tree_round", "tree_tall", "hedge", "shrub"]):
    cx, cy = k % 2, k // 2
    info2[n] = cutout(tr.crop((cx * w // 2 + 6, cy * h // 2 + 6, (cx + 1) * w // 2 - 6, (cy + 1) * h // 2 - 6)), n, 128)
info.update(info2)
ps1(Image.open(os.path.join(F, "photo_family.jpg")), (96, 72), 32).save(os.path.join(T, "pic_family.png"))
ps1(Image.open(os.path.join(F, "painting_lake.jpg")), (96, 72), 32).save(os.path.join(T, "pic_lake.png"))
ps1(Image.open(os.path.join(F, "face_owner_src.jpg")).crop((120, 40, 904, 1000)), (64, 78), 32).save(os.path.join(T, "pic_owner.png"))
rng = np.random.default_rng(7)


def lowfreq(n, cells, amp):
    a = Image.fromarray((rng.random((cells, cells)) * 255).astype(np.uint8)).resize((n, n), Image.BICUBIC)
    return (np.asarray(a).astype(np.float32) / 255 - 0.5) * 2 * amp


def wall_variant(name, grime):
    """2x2 wallpaper tiles -> 256 px (covers 2.5 m), soft tone patches, dirt rising from the skirting, scuffs."""
    base = np.asarray(Image.open(os.path.join(T, "wallpaper.png")).convert("RGB")).astype(np.float32)
    a = np.tile(base, (2, 2, 1))
    n = a.shape[0]; tone = 1 + lowfreq(n, 5, 0.07) + lowfreq(n, 13, 0.03)
    y = np.linspace(0, 1, n)[:, None]                           # v = 0 at the top of the texture = 2.5 m up the wall
    dirt = grime * np.clip((y - 0.72) / 0.28, 0, 1) ** 1.5 * (0.6 + 0.4 * (lowfreq(n, 9, 1) + 1) / 2)
    a = a * tone[..., None] * (1 - dirt[..., None] * np.array([0.30, 0.33, 0.38]))
    for _ in range(int(14 * grime)):                            # scuff marks
        cx, cy = rng.integers(0, n), rng.integers(int(n * 0.6), n)
        a[max(0, cy - 2):cy + 2, max(0, cx - 9):cx + 9] *= 0.82
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).quantize(40, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB").save(os.path.join(T, f"{name}.png"))


wall_variant("wall_lr", 0.5)
wall_variant("wall_hall", 1.0)
mat = Image.new("RGB", (128, 80), (122, 84, 46)); d = ImageDraw.Draw(mat)
ma = np.asarray(mat).astype(np.float32) * (1 + (rng.random((80, 128, 1)) - 0.5) * 0.35)
mat = Image.fromarray(np.clip(ma, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(mat)
d.rectangle((3, 3, 124, 76), outline=(60, 38, 20), width=4)
d.text((64, 41), "WELCOME", font=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 20), fill=(54, 34, 18), anchor="mm")
mat.save(os.path.join(T, "doormat.png"))
hub = Image.new("RGBA", (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(hub)
d.ellipse((0, 0, 63, 63), fill=(28, 28, 30)); d.ellipse((12, 12, 51, 51), fill=(176, 178, 182)); d.ellipse((14, 14, 49, 49), outline=(120, 122, 126), width=2)
for k in range(5):
    a_ = _m.radians(k * 72); d.line((32, 32, 32 + 17 * _m.cos(a_), 32 + 17 * _m.sin(a_)), fill=(110, 112, 116), width=4)
d.ellipse((27, 27, 37, 37), fill=(90, 92, 96)); hub.save(os.path.join(T, "hubcap.png"))
# car side: window holes -> alpha 0 (we see the modelled interior through them), wheel centres
from scipy import ndimage as nd
cs = np.asarray(car.crop((0, 0, int(car.width * 0.66), car.height)))
keep = nd.binary_opening(magenta_mask(cs), iterations=2); lab, n = nd.label(keep)
keep = lab == (np.argmax(nd.sum(keep, lab, range(1, n + 1))) + 1)
holes = nd.binary_fill_holes(keep) & ~keep
hl, hn = nd.label(holes)
holes = np.isin(hl, [i for i in range(1, hn + 1) if (hl == i).sum() > 300])   # the two side windows only
ys, xs = np.nonzero(keep | holes); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
side = Image.open(os.path.join(T, "car_side.png")).convert("RGBA"); tw, th = side.size
hm = Image.fromarray((holes[y0:y1, x0:x1] * 255).astype(np.uint8)).resize((tw, th), Image.BOX)
sa = np.asarray(side).copy(); sa[np.asarray(hm) > 100, 3] = 0
Image.fromarray(sa).save(os.path.join(T, "car_side_cut.png"))
hy, hx = np.nonzero(holes[y0:y1, x0:x1]); W_, H_ = x1 - x0, y1 - y0
bot = np.array([np.flatnonzero(keep[y0:y1, x0 + c]).max() if keep[y0:y1, x0 + c].any() else 0 for c in range(W_)])
low = np.flatnonzero(bot >= bot.max() - 3); gaps = np.flatnonzero(np.diff(low) > 10)
groups = np.split(low, gaps + 1)
wheels = [float(g.mean() / W_) for g in groups if len(g) > 3][:2]
json.dump({"glass": [float(hx.min() / W_), float(1 - hy.max() / H_), float(hx.max() / W_), float(1 - hy.min() / H_)], "wheels_u": wheels},
          open(os.path.join(T, "car_parts.json"), "w"))
json.dump(info, open(os.path.join(T, "props.json"), "w"), indent=1)
print("v2 tex done; car parts", json.load(open(os.path.join(T, "car_parts.json"))))

# ---- final: bluer cloud sky (from lps-erfurt) everywhere; the street photos lose their pale sky
skyp = Image.open(os.path.join(F, "sky_day_erfurt.jpg")).convert("RGB")
ps1(skyp, (256, 144), 48).save(os.path.join(T, "sky.png"))


def sky_mask(a):
    """sky = bright, greyish/blue pixels connected to the top edge; a closing first swallows the power lines."""
    a = a.astype(int); lum = a.mean(-1); sat = a.max(-1) - a.min(-1)
    sk = (lum > 150) & (sat < 70)
    sk = nd.binary_closing(sk, iterations=3) | sk
    lab, n = nd.label(sk); top = set(np.unique(lab[0])) - {0}
    m = np.isin(lab, list(top))
    m[:3] |= True
    return nd.binary_opening(m, iterations=1)


far_src = sv.crop((0, 0, sv.width, int(sv.height * 0.62))).resize((512, 192), Image.BOX)
fa = np.asarray(far_src); fm = sky_mask(fa)
far_rgba = ps1(far_src, (256, 96), 48).convert("RGBA")
al = Image.fromarray(((~fm) * 255).astype(np.uint8)).resize((256, 96), Image.BOX).point(lambda v: 255 if v > 127 else 0)
far_rgba.putalpha(al); far_rgba.save(os.path.join(T, "street_far.png"))
sva = np.asarray(sv.resize((512, 288), Image.BOX)).copy(); sm = sky_mask(sva)
skyr = np.asarray(skyp.resize((512, 288), Image.BOX))
sva[sm] = skyr[sm]
ps1(Image.fromarray(sva), (256, 144), 48).save(os.path.join(T, "street_view.png"))
# car: trim one texel off the cut-out edge (the photo's pink JPEG rim)
for n in ("car_side", "car_side_cut"):
    ca_ = np.asarray(Image.open(os.path.join(T, f"{n}.png")).convert("RGBA")).copy()
    ca_[..., 3] = (nd.binary_erosion(ca_[..., 3] > 127, iterations=1) * 255).astype(np.uint8) * (ca_[..., 3] > 127)
    r_, g_, b_ = (ca_[..., i].astype(int) for i in range(3))
    pink = (r_ > b_ - 10) & (r_ - g_ > 40) & (b_ > 90)
    ca_[pink & (ca_[..., 3] > 0), :3] = (30, 44, 74)
    Image.fromarray(ca_).save(os.path.join(T, f"{n}.png"))
print("final sky + car trim done")

# lab whiteboard: "SMELL vs TIME" graph (fading scent = clock)
wb = Image.new("RGB", (192, 128), (246, 246, 242)); d = ImageDraw.Draw(wb)
d.rectangle((0, 0, 191, 127), outline=(150, 150, 150), width=4)
d.line((24, 104, 176, 104), fill=(30, 30, 30), width=3); d.line((24, 104, 24, 18), fill=(30, 30, 30), width=3)
d.line([(28 + i * 7, 26 + int(70 * (1 - 0.82 ** i))) for i in range(21)], fill=(220, 160, 20), width=4)
fs_ = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 13)
d.text((96, 118), "TIME GONE", font=fs_, fill=(40, 60, 120), anchor="ms"); d.text((30, 14), "SMELL", font=fs_, fill=(40, 60, 120))
wb.save(os.path.join(T, "whiteboard.png")); print("whiteboard")
