"""venv: reference photos -> PS1 textures in tex/.
side.jpg  -> tex/body.png   (crop of the side photo, dark outline eroded away, colours bled outward so faces that sit
                              a little outside the silhouette still get coat colour; 256 px wide, 32 colours)
faces/*.jpg -> tex/face_<expr>.png (whole 1024 face image -> 128 px, 32 colours, same bleed)
sky photo -> tex/sky.png (128 px)
Mapping constants shared with dog.py: BODY_CROP and the face image size (1024)."""
import glob, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from scipy import ndimage

H = os.path.dirname(os.path.abspath(__file__))
REF, TEX = os.path.join(H, "ref"), os.path.join(H, "tex")
os.makedirs(TEX, exist_ok=True)
BODY_CROP = (120, 90, 1080, 834)          # x0, y0, x1, y1 in side.jpg px (dog.py uses the same numbers)
BODY_W = 256
FACE_PX = 192
# realistic sheets (ref/faces2) -> the head layout the mesh was built on: row anchors (sheet px -> layout px)
WARP_IN = [0, 120, 385, 561, 700, 775, 923, 1024]
WARP_OUT = [0, 120, 390, 505, 615, 712, 818, 1024]


def fg_mask(im):
    """Background is pure white (255); the white coat is ~242, so a tight threshold separates them."""
    a = np.asarray(im.convert("RGB")).astype(int)
    m = a.min(2) < 249
    m = ndimage.binary_opening(m, iterations=2)
    lab, n = ndimage.label(m)
    big = np.argmax(np.bincount(lab.ravel())[1:]) + 1          # keep the dog, drop specks
    return ndimage.binary_fill_holes(lab == big)


def bleed(im, erode=7):
    """Drop the outer outline ring and fill everything outside with the nearest coat colour."""
    a = np.asarray(im.convert("RGB")).copy()
    m = ndimage.binary_erosion(fg_mask(im), iterations=erode)
    m = ndimage.binary_fill_holes(m)
    _, (iy, ix) = ndimage.distance_transform_edt(~m, return_indices=True)
    return Image.fromarray(a[iy, ix]), m


def ps1(im, size, colors=32):
    im = im.resize(size, Image.BOX)
    return im.quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


def harmonize(side, face):
    """Scale the side photo's browns so they match the face sheet's browns (head and body read as one coat)."""
    def brown(a):
        a = a.reshape(-1, 3).astype(float)
        sel = (a[:, 0] > a[:, 2] + 50) & (a[:, 0] > 90) & (a[:, 0] < 230)
        return a[sel].mean(0)
    s, f = np.asarray(side, float), np.asarray(face, float)
    k = brown(f) / brown(s)
    sel = (s[..., 0] > s[..., 2] + 40)                       # only brownish pixels
    s[sel] = np.clip(s[sel] * k, 0, 255)
    print("side brown", brown(np.asarray(side)).round(), "-> face brown", brown(f).round())
    return Image.fromarray(s.astype(np.uint8))


def warp(im):
    """Vertical piecewise-linear remap so eyes/nose/mouth/chin land on the mesh's face rows."""
    a = np.asarray(im.convert("RGB"))
    rows = np.clip(np.round(np.interp(np.arange(a.shape[0]), WARP_OUT, WARP_IN)).astype(int), 0, a.shape[0] - 1)
    return Image.fromarray(a[rows])


def readable(im):
    """Wide-shot readability: thicker blue tears, darker eye rims/pupils, local contrast before the 1/5 downscale."""
    a = np.asarray(im, float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    tear = (b > r + 10) & (b >= g) & (b > 120)
    tear = ndimage.binary_dilation(tear, iterations=4)
    a[tear] = (90, 175, 255)
    lum = a.mean(2)
    yy, xx = np.mgrid[:lum.shape[0], :lum.shape[1]]
    eye = (np.hypot(xx - 355, yy - 385) < 48) | (np.hypot(xx - 670, yy - 385) < 48)   # the two eyes (layout px)
    a[eye & (lum < 70)] *= 0.6
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    im = im.filter(ImageFilter.UnsharpMask(radius=8, percent=120, threshold=2))
    return ImageEnhance.Contrast(im).enhance(1.12)


side = Image.open(os.path.join(REF, "side_real.jpg"))
sb, _ = bleed(side, erode=4)
neutral = warp(Image.open(os.path.join(REF, "faces2", "neutral.jpg")))
sb = harmonize(sb, neutral)
_a = np.asarray(sb, float); _sat = _a.max(2) - _a.min(2); _lum = _a.mean(2)
_w = ((_sat < 40) & (_lum > 120))[..., None]                     # white fur: soften painted grey shading (leg bands)
sb = Image.fromarray(np.where(_w, _a * 0.45 + np.array([236, 231, 222]) * 0.55, _a).astype(np.uint8))
x0, y0, x1, y1 = BODY_CROP
crop = sb.crop(BODY_CROP)
bh = round(BODY_W * (y1 - y0) / (x1 - x0))
ps1(crop, (BODY_W, bh)).save(os.path.join(TEX, "body.png"))
print("body", BODY_W, bh)

for f in sorted(glob.glob(os.path.join(REF, "faces2", "*.jpg"))):
    name = os.path.splitext(os.path.basename(f))[0]
    fb, _ = bleed(warp(Image.open(f)), erode=4)
    ps1(readable(fb), (FACE_PX, FACE_PX), 48).save(os.path.join(TEX, f"face_{name}.png"))
    print("face", name)

# head sides + chest bib: painted clean fur (no photo blotches). Brown/white taken from the neutral face sheet so the
# sides continue the face's markings: brown skull, white muzzle + lower cheek + throat (like the sheet's chin/neck).
HS_Y, HS_Z = (-0.50, -0.14), (0.47, 0.84)                   # = dog.HS_Y / HS_Z
hz = lambda fy: 0.62 - (fy - 540) * 0.0005
fn = np.asarray(Image.open(os.path.join(TEX, "face_neutral.png")).convert("RGB"), float)
q = FACE_PX / 1024
BROWN = np.median(fn[int(430 * q):int(520 * q), int(285 * q):int(330 * q)].reshape(-1, 3), 0)
WHITE = np.array([238.0, 233.0, 224.0])
print("head brown", BROWN.round(), "white", WHITE)
rng = np.random.default_rng(7)


def fur(h, w, amp=0.035, sig=(1.4, 0.6)):
    n = ndimage.gaussian_filter(rng.normal(0, 1, (h, w)), sig)
    return 1 + amp * n / (n.std() + 1e-6)


def smooth(x, e0, e1):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)


N = 128
v, u = np.mgrid[:N, :N] / (N - 1)
Y = HS_Y[0] + u * (HS_Y[1] - HS_Y[0]); Z = HS_Z[1] - v * (HS_Z[1] - HS_Z[0])          # row 0 = top
bY = -0.395 + np.maximum(0, hz(560) - Z) * 0.9                                       # muzzle/cheek white edge slants back
white = np.maximum(smooth(bY - Y, -0.006, 0.006), smooth(hz(735) - Z, -0.01, 0.01))   # muzzle side + throat
shade = 0.93 + 0.07 * smooth(Z, HS_Z[0], HS_Z[1])                                     # a touch darker low on the cheek
col = (BROWN * (1 - white[..., None]) + WHITE * white[..., None]) * (fur(N, N) * shade)[..., None]
Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).save(os.path.join(TEX, "head_side.png"))

# chest bib: front-facing chest faces, X -0.17..0.17, Z 0.18..0.62: a soft white shield on body brown
BX, BZ = (-0.17, 0.17), (0.18, 0.62)
bb = np.asarray(Image.open(os.path.join(TEX, "body.png")).convert("RGB"), float)
BODYB = np.median(bb[60:110, 120:180].reshape(-1, 3), 0)
N2 = 64
v, u = np.mgrid[:N2, :N2] / (N2 - 1)
X = BX[0] + u * (BX[1] - BX[0]); Zb = BZ[1] - v * (BZ[1] - BZ[0])
r = np.hypot(X / 0.080, (Zb - 0.40) / 0.15)
wb = smooth(1.0 - r, -0.12, 0.12)
col = (BODYB * (1 - wb[..., None]) + WHITE * wb[..., None]) * fur(N2, N2, 0.05, (1.6, 0.6))[..., None]
Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).save(os.path.join(TEX, "bib.png"))

sky = sorted(glob.glob(os.path.join(REF, "*realistic-photo-of-a-bright-blue*")))
if sky:
    ps1(Image.open(sky[0]).convert("RGB"), (128, 96), 48).save(os.path.join(TEX, "sky.png"))
