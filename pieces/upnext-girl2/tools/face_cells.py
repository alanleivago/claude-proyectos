"""16-cell eye and mouth atlases in HIS style. Cell 0 = his f001 pixels; half/blink = his f028 / f030 re-projected through
our face geometry into the f001 cell space; the other expressions are redrawn from cell 0 with his palette and line
weights (drawn at 4x and box-filtered like his anti-aliased render).
python tools/face_cells.py <mesh.npz>  -> tex/face_eyes.png, tex/face_mouth.png (4096x128), review/face_cells.png"""
import sys, json, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
sys.path.insert(0, "tools")
import face as FC
CW, CH = FC.CW, FC.CH
D = np.load(sys.argv[1], allow_pickle=True); V, F = D["V"], D["F"]; cam = json.loads(str(D["cam"])); A = D["alphas"]
f0 = FC.frame(0)
E0 = FC.crop(f0, FC.EYE_RECT); M0 = FC.crop(f0, FC.MOUTH_RECT)
HALF, _ = FC.reproject_cell(V, F, cam, A, 27, FC.EYE_RECT)
BLINK, _ = FC.reproject_cell(V, F, cam, A, 29, FC.EYE_RECT)
lum = E0 @ [0.3, 0.59, 0.11]
SKIN = np.median(E0[(np.abs(E0 - [248, 196, 181]).sum(-1) < 30)], 0)
LASH = np.array([28, 18, 22.]); WHITE = np.array([246, 246, 244.]); SCLERA_SH = np.array([205, 208, 214.])
IRIS = np.median(E0[(E0[..., 1] > E0[..., 0] + 5) & (lum < 170) & (lum > 80)], 0) if ((E0[..., 1] > E0[..., 0] + 5) & (lum < 170)).any() else np.array([110, 150, 145.])
IRIS_D = IRIS * 0.55; BROW = np.array([92, 52, 40.])
# eye boxes from the dark outline in cell 0
dark = (lum < 90)
dark[:, :30] = False; dark[:, -30:] = False; dark[:20] = False; dark[75:] = False
lab, n = nd.label(nd.binary_dilation(dark, iterations=4)); sl = nd.find_objects(lab)
boxes = sorted([s for s in sl if (s[1].stop - s[1].start) > 25], key=lambda s: -(s[0].stop - s[0].start) * (s[1].stop - s[1].start))[:2]
boxes = sorted(boxes, key=lambda s: s[1].start)
EYES = [(s[1].start, s[0].start, s[1].stop, s[0].stop) for s in boxes]       # x0, y0, x1, y1 (incl. lashes)
print("eye boxes", EYES, "skin", SKIN.round(), "iris", IRIS.round())
# brows: dark-brown strokes above each eye box
browmask = (lum < 140) & (E0[..., 0] > E0[..., 2] + 15)
BROWS = []
for (x0, y0, x1, y1) in EYES:
    m = np.zeros_like(browmask); m[max(0, y0 - 18):y0 - 1, x0:x1] = browmask[max(0, y0 - 18):y0 - 1, x0:x1]
    BROWS.append(m)

SS = 4


def canvas(base): return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).resize((CW * SS, CH * SS), Image.NEAREST)


def down(im): return np.asarray(im.resize((CW, CH), Image.BOX)).astype(np.float32)


def erase_eyes(base, which=(0, 1), pad=2):
    out = base.copy()
    for i in which:
        x0, y0, x1, y1 = EYES[i]; out[y0 - pad:y1 + pad, x0 - pad:x1 + pad] = SKIN
    return out


def erase_brows(base):
    out = base.copy()
    for m in BROWS: out[nd.binary_dilation(m, iterations=1)] = SKIN
    return out


def T(c): return tuple(int(v) for v in c)


def eye_geom(i):
    x0, y0, x1, y1 = EYES[i]; return (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2


def arc_eyes(base, up=True, which=(0, 1), w=3.2):
    im = canvas(erase_eyes(base, which)); d = ImageDraw.Draw(im)
    for i in which:
        cx, cy, rx, ry = eye_geom(i)
        if up: box = [(cx - rx * 0.85) * SS, (cy - ry * 0.2) * SS, (cx + rx * 0.85) * SS, (cy + ry * 1.6) * SS]; d.arc(box, 200, 340, fill=T(LASH), width=int(w * SS))
        else: box = [(cx - rx * 0.85) * SS, (cy - ry * 1.4) * SS, (cx + rx * 0.85) * SS, (cy + ry * 0.4) * SS]; d.arc(box, 20, 160, fill=T(LASH), width=int(w * SS))
    return down(im)


def eye_interior(base, i):
    """sclera + iris (+ pupil) of eye i: non-skin, non-lash pixels connected to the white sclera, holes filled"""
    x0, y0, x1, y1 = EYES[i]; reg = base[y0:y1, x0:x1]; l = reg @ [0.3, 0.59, 0.11]
    cand = (l >= 80) & (np.abs(reg - SKIN).sum(-1) > 45)
    seeds = (l > 200) & (np.abs(reg - reg.mean(-1, keepdims=True)).sum(-1) < 25)
    lab, n = nd.label(cand); keep = np.unique(lab[seeds & cand]); keep = keep[keep > 0]
    m = np.isin(lab, keep)
    return nd.binary_fill_holes(nd.binary_closing(m, iterations=2))


def iris_replace(base, draw_fn):
    """repaint the sclera+iris of each eye (white, his grey band under the lid) then call draw_fn(draw, i, cx, cy, r)"""
    out = base.copy()
    for i in range(2):
        x0, y0, x1, y1 = EYES[i]; m = eye_interior(base, i); reg = out[y0:y1, x0:x1]
        reg[m] = WHITE
        top = np.zeros_like(m)
        for c in range(m.shape[1]):
            r = np.nonzero(m[:, c])[0]
            if len(r): top[r[0]:r[0] + 3, c] = True
        reg[top & m] = SCLERA_SH; out[y0:y1, x0:x1] = reg
    im = canvas(out); d = ImageDraw.Draw(im)
    for i in range(2):
        cx, cy, rx, ry = eye_geom(i); draw_fn(d, i, cx, cy + ry * 0.12, ry * 0.62)
    res = down(im)
    for i in range(2):                      # his lash outline stays on top
        x0, y0, x1, y1 = EYES[i]; m = eye_interior(base, i)
        keep = ~m & ((base[y0:y1, x0:x1] @ [0.3, 0.59, 0.11]) < 80)
        r = res[y0:y1, x0:x1]; r[keep] = base[y0:y1, x0:x1][keep]; res[y0:y1, x0:x1] = r
    return res


def shift_brows(base, dy_in, dy_out):
    out = erase_brows(base); src = base
    for bi, m in enumerate(BROWS):
        ys, xs = np.nonzero(m)
        if not len(xs): continue
        xa, xb = xs.min(), xs.max(); inner_right = bi == 0          # image-left eye: inner end on its right
        for y, x in zip(ys, xs):
            t = (x - xa) / max(1, xb - xa); t = t if inner_right else 1 - t
            dy = int(round(dy_out + (dy_in - dy_out) * t)); yy = y + dy
            if 0 <= yy < CH: out[yy, x] = src[y, x]
    return out


def lid(base, frac_in, frac_out, which=(0, 1)):
    """lower the upper eyelid: skin above a line from frac_out (outer corner) to frac_in (inner corner) of the eye height"""
    im = canvas(base); d = ImageDraw.Draw(im)
    for i in which:
        x0, y0, x1, y1 = EYES[i]; h = y1 - y0; inner_right = i == 0
        yi, yo = y0 + h * frac_in, y0 + h * frac_out
        pl, pr = (yo, yi) if inner_right else (yi, yo)
        d.polygon([(x0 * SS - 8, (y0 - 3) * SS), (x1 * SS + 8, (y0 - 3) * SS), (x1 * SS + 8, pr * SS), (x0 * SS - 8, pl * SS)], fill=T(SKIN))
        d.line([(x0 * SS, pl * SS), (x1 * SS, pr * SS)], fill=T(LASH), width=int(3.0 * SS))
    return down(im)


def heart(d, cx, cy, r, col):
    pts = []
    for t in np.linspace(0, 2 * np.pi, 60):
        x = 16 * np.sin(t) ** 3; y = 13 * np.cos(t) - 5 * np.cos(2 * t) - 2 * np.cos(3 * t) - np.cos(4 * t)
        pts.append(((cx + x * r / 16) * SS, (cy - y * r / 16) * SS))
    d.polygon(pts, fill=T(col))


def iris_draw(scale=1.0, sparkle=False):
    def f(d, i, cx, cy, r):
        r *= scale
        d.ellipse([(cx - r) * SS, (cy - r * 1.05) * SS, (cx + r) * SS, (cy + r * 1.05) * SS], fill=T(IRIS_D))
        d.ellipse([(cx - r * 0.8) * SS, (cy - r * 0.85) * SS, (cx + r * 0.8) * SS, (cy + r * 0.85) * SS], fill=T(IRIS))
        d.ellipse([(cx - r * 0.38) * SS, (cy - r * 0.45) * SS, (cx + r * 0.38) * SS, (cy + r * 0.3) * SS], fill=T(IRIS_D * 0.6))
        d.ellipse([(cx - r * 0.55) * SS, (cy - r * 0.75) * SS, (cx - r * 0.15) * SS, (cy - r * 0.35) * SS], fill=T(WHITE))
        if sparkle:
            for (ox, oy, s) in ((0.45, 0.35, 0.28), (-0.2, 0.55, 0.18)):
                x, y = cx + ox * r, cy + oy * r; s *= r
                d.polygon([((x) * SS, (y - s) * SS), ((x + s * 0.3) * SS, (y) * SS), ((x) * SS, (y + s) * SS), ((x - s * 0.3) * SS, (y) * SS)], fill=T(WHITE))
                d.polygon([((x - s) * SS, (y) * SS), ((x) * SS, (y + s * 0.3) * SS), ((x + s) * SS, (y) * SS), ((x) * SS, (y - s * 0.3) * SS)], fill=T(WHITE))
    return f


EYEC = {}
EYEC["open"] = E0
EYEC["half"] = HALF
EYEC["blink"] = BLINK
EYEC["happy"] = arc_eyes(shift_brows(E0, -2, -2), up=True)
EYEC["surprised"] = iris_replace(shift_brows(E0, -5, -4), iris_draw(0.72))
EYEC["angry"] = lid(shift_brows(E0, 5, -1), 0.45, 0.05)
EYEC["sad"] = lid(shift_brows(E0, -5, 1), 0.05, 0.4)
w = E0.copy(); x0, y0, x1, y1 = EYES[1]; w[y0 - 4:y1 + 4, x0 - 4:x1 + 4] = BLINK[y0 - 4:y1 + 4, x0 - 4:x1 + 4]; EYEC["wink"] = w
EYEC["hearts"] = iris_replace(E0, lambda d, i, cx, cy, r: heart(d, cx, cy, r * 1.25, (226, 60, 120)))
EYEC["shocked"] = iris_replace(shift_brows(E0, -5, -4), lambda d, i, cx, cy, r: d.ellipse([(cx - r * 0.28) * SS, (cy - r * 0.32) * SS, (cx + r * 0.28) * SS, (cy + r * 0.32) * SS], fill=T(LASH)))


def spiral(d, i, cx, cy, r):
    pts = [((cx + np.cos(t) * r * t / 12) * SS, (cy + np.sin(t) * r * t / 12) * SS) for t in np.linspace(0, 12, 80)]
    d.line(pts, fill=T(LASH), width=int(1.6 * SS))


EYEC["dizzy"] = iris_replace(E0, spiral)
EYEC["relaxed"] = arc_eyes(E0, up=False)
EYEC["disgust"] = lid(shift_brows(HALF, 4, 0), 0.5, 0.25)
EYEC["smirk"] = lid(shift_brows(E0, 0, -3), 0.45, 0.4, which=(1,))
EYEC["soft"] = lid(E0, 0.32, 0.32)
EYEC["sparkle"] = iris_replace(E0, iris_draw(1.0, sparkle=True))

# ------------------------------------------------------------------ mouth
ml = M0 @ [0.3, 0.59, 0.11]
win = np.zeros(ml.shape, bool); win[45:75, 95:165] = True
mm = win & (ml < 172)
lab_, n_ = nd.label(nd.binary_dilation(mm, iterations=2)); c_ = lab_[59, 127]
if c_: mm = mm & (lab_ == c_)
ys, xs = np.nonzero(mm)
MX0, MY0, MX1, MY1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
MCX, MCY, MW = (MX0 + MX1) / 2, (MY0 + MY1) / 2, (MX1 - MX0)
MSKIN = np.median(M0[MY0 - 8:MY0 - 3, MX0:MX1].reshape(-1, 3), 0); LIP = np.median(M0[mm & (ml < 170)], 0); LIP_D = LIP * 0.82; LIP_L = (LIP + SKIN) / 2
INSIDE = np.array([118, 52, 58.]); TEETH = np.array([246, 242, 236.]); TONGUE = np.array([214, 112, 118.]); BLUSH = np.array([242, 150, 150.])
print("mouth box", (MX0, MY0, MX1, MY1), "lip", LIP.round())


def mouth_base():
    out = M0.copy(); out[MY0 - 2:MY1 + 2, MX0 - 3:MX1 + 3] = MSKIN; return out


def mdraw(fn, blush=False):
    im = canvas(mouth_base()); d = ImageDraw.Draw(im); fn(d)
    if blush:
        for cx in (MCX - 50, MCX + 50):
            for k in range(3):
                x = cx - 8 + k * 7
                d.line([((x + 4) * SS, (MCY - 26) * SS), ((x - 1) * SS, (MCY - 18) * SS)], fill=T(BLUSH), width=int(1.8 * SS))
    return down(im)


hw = MW / 2 + 1


def curve(d, k, col, wdt=2.2, y0=0.0, span=1.0):
    pts = [((MCX + x) * SS, (MCY + y0 + k * (x / hw) ** 2) * SS) for x in np.linspace(-hw * span, hw * span, 30)]
    d.line(pts, fill=T(col), width=int(wdt * SS))


def oval(d, rx, ry, dy=0, teeth=False, tongue=False):
    box = [(MCX - rx) * SS, (MCY - ry + dy) * SS, (MCX + rx) * SS, (MCY + ry + dy) * SS]
    d.ellipse(box, fill=T(INSIDE), outline=T(LIP_D), width=int(1.4 * SS))
    if teeth: d.chord([(MCX - rx * 0.85) * SS, (MCY - ry * 0.95 + dy) * SS, (MCX + rx * 0.85) * SS, (MCY + ry * 0.2 + dy) * SS], 180, 360, fill=T(TEETH))
    if tongue: d.chord([(MCX - rx * 0.7) * SS, (MCY + dy) * SS, (MCX + rx * 0.7) * SS, (MCY + ry * 1.0 + dy) * SS], 0, 180, fill=T(TONGUE))


MOUTHC = {"neutral": M0}
MOUTHC["smile"] = mdraw(lambda d: (curve(d, -3.5, LIP_D), curve(d, -1.5, LIP_L, 1.6, y0=3.0, span=0.6)))
def smile_open(d):
    pts = [((MCX + x) * SS, (MCY - 2 - 2.5 * (x / hw) ** 2) * SS) for x in np.linspace(-hw, hw, 20)]
    pts += [((MCX + x) * SS, (MCY + 7 * (1 - (x / hw) ** 2) - 2) * SS) for x in np.linspace(hw, -hw, 20)]
    d.polygon(pts, fill=T(INSIDE), outline=T(LIP_D))
    d.polygon(pts[:20] + [((MCX + x) * SS, (MCY + 0.5) * SS) for x in np.linspace(hw * 0.9, -hw * 0.9, 10)], fill=T(TEETH))
MOUTHC["smileOpen"] = mdraw(smile_open)
MOUTHC["talkA"] = mdraw(lambda d: oval(d, hw * 0.55, 5.5, teeth=True, tongue=True))
MOUTHC["talkO"] = mdraw(lambda d: oval(d, hw * 0.35, 5.0))
MOUTHC["surprised"] = mdraw(lambda d: oval(d, hw * 0.45, 7.5, dy=1))
MOUTHC["frown"] = mdraw(lambda d: (curve(d, 3.5, LIP_D, y0=-1), curve(d, 1.5, LIP_L, 1.6, y0=3.0, span=0.5)))
MOUTHC["shout"] = mdraw(lambda d: oval(d, hw * 0.8, 8.5, dy=1, teeth=True, tongue=True))
MOUTHC["blep"] = mdraw(lambda d: (curve(d, -3.0, LIP_D), d.chord([(MCX + 1) * SS, (MCY - 1) * SS, (MCX + 9) * SS, (MCY + 9) * SS], 0, 180, fill=T(TONGUE))))
def cat(d):
    pts = [((MCX + x) * SS, (MCY + 2.5 * abs(np.sin(np.pi * x / hw * 1.0))) * SS) for x in np.linspace(-hw * 0.8, hw * 0.8, 40)]
    d.line(pts, fill=T(LIP_D), width=int(2.0 * SS))
MOUTHC["cat"] = mdraw(cat)
MOUTHC["gasp"] = mdraw(lambda d: oval(d, 3.6, 3.8))
MOUTHC["bigShock"] = mdraw(lambda d: oval(d, hw * 0.75, 11, dy=3, tongue=True))
def disg(d):
    pts = [((MCX + x) * SS, (MCY + 2.2 * np.sin(x / hw * 2.6 * np.pi) + 2.5 * (x / hw)) * SS) for x in np.linspace(-hw, hw, 40)]
    d.line(pts, fill=T(LIP_D), width=int(2.0 * SS))
MOUTHC["disgust"] = mdraw(disg)
def smirk(d):
    pts = [((MCX + x) * SS, (MCY - (3.5 * ((x + hw) / (2 * hw)) ** 2)) * SS) for x in np.linspace(-hw, hw, 30)]
    d.line(pts, fill=T(LIP_D), width=int(2.2 * SS))
MOUTHC["smirk"] = mdraw(smirk)
MOUTHC["blushSmile"] = mdraw(lambda d: (curve(d, -3.5, LIP_D), curve(d, -1.5, LIP_L, 1.6, y0=3.0, span=0.6)), blush=True)
MOUTHC["blushGasp"] = mdraw(lambda d: oval(d, 3.6, 3.8), blush=True)

for tag, order, cells in (("eyes", FC.EYE_ORDER, EYEC), ("mouth", FC.MOUTH_ORDER, MOUTHC)):
    at = np.zeros((CH, CW * 16, 3), np.uint8)
    for i, nme in enumerate(order): at[:, i * CW:(i + 1) * CW] = np.clip(cells[nme], 0, 255)
    Image.fromarray(at).save(f"tex/face_{tag}.png")
prev = []
for order, cells in ((FC.EYE_ORDER, EYEC), (FC.MOUTH_ORDER, MOUTHC)):
    row = [np.clip(cells[nme], 0, 255).astype(np.uint8)[10:110, 40:216] for nme in order]
    prev.append(np.concatenate([np.concatenate(row[:8], 1), np.concatenate(row[8:], 1)], 0))
pv = np.concatenate(prev, 0); Image.fromarray(pv).resize((pv.shape[1] * 2, pv.shape[0] * 2), Image.NEAREST).save("review/face_cells.png")
print("face atlases written")
