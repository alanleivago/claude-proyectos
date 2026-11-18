"""Turn a photoreal image into GTA VI loading-screen key art (the steps of the 21DPS time-lapse, in code).

  python rockstarize.py in.jpg out.png --mode figure --key magenta     # isolated person/car shot on #FF00FF
  python rockstarize.py in.jpg out.jpg --mode bg                       # clean background plate

Steps (fuentes/gta6-style/vice-city-vacation-gta-vi-art-style-study.md):
 1. flat colour blocks per material  -> mean-shift + bilateral smoothing of the colour
 2. few hard shadow shapes           -> luminance heavily smoothed, posterized into N tones, speckles removed
 3. violet/pink shadows, cream light -> per-tone hue shift in Lab + gradient map to the measured palette
 4. soft transitions on arms         -> a share of the smooth luminance kept inside each tone
 5. thin contour lines               -> edges of the smoothed luminance (interior, thin) + alpha outline (thicker)
 6. rim light                        -> pale-yellow glow outside the silhouette on the sun side
 7. global sunset grade              -> final lavender/pink/yellow gradient-map blend
"""
import argparse
import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--mode', choices=['figure', 'bg'], default='figure')
ap.add_argument('--key', choices=['none', 'magenta', 'green'], default='none')
ap.add_argument('--tones', type=int, default=0, help='luminance tones (default figure 4, bg 3)')
ap.add_argument('--sun', choices=['left', 'right'], default='left')
ap.add_argument('--lines', type=float, default=1.0, help='interior line strength 0..1')
ap.add_argument('--grade', type=float, default=0.26, help='final gradient-map blend')
ap.add_argument('--height', type=int, default=1920)
a = ap.parse_args()
FIG = a.mode == 'figure'
N = a.tones or (4 if FIG else 3)

img = cv2.imread(a.src, cv2.IMREAD_COLOR)
s = a.height / img.shape[0]
img = cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC)
H, W = img.shape[:2]
f = img.astype(np.float32)
B, G, R = f[..., 0], f[..., 1], f[..., 2]

# ---- alpha from the key colour
if a.key != 'none':
    k = (np.minimum(R, B) - G) / 255 if a.key == 'magenta' else (G - np.maximum(R, B)) / 255
    alpha = 1 - np.clip((k - 0.42) / 0.28, 0, 1)
    if a.key == 'magenta':
        sp = np.clip(np.minimum(R, B) - G - 70, 0, None); f[..., 2] -= sp; f[..., 0] -= sp
    else:
        f[..., 1] -= np.clip(G - np.maximum(R, B) - 20, 0, None)
    alpha = cv2.erode(alpha, np.ones((3, 3), np.uint8))
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)
    # fill the keyed-out area with the edge colours so smoothing does not bleed magenta inward
    m = (alpha > 0.5).astype(np.uint8)
    img = cv2.inpaint(np.clip(f, 0, 255).astype(np.uint8), 1 - m, 5, cv2.INPAINT_TELEA)
else:
    alpha = np.ones((H, W), np.float32)
    img = np.clip(f, 0, 255).astype(np.uint8)

# ---- 1. flat colour blocks: figures keep their detail (bilateral only), backgrounds get mean-shift flattening
if FIG:
    sm = img.copy()
    for _ in range(4):
        sm = cv2.bilateralFilter(sm, 9, 32, 7)
else:
    sm = cv2.resize(img, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    for _ in range(3):
        sm = cv2.pyrMeanShiftFiltering(sm, 12, 34)
    sm = cv2.bilateralFilter(sm, 9, 40, 9)
    sm = cv2.resize(sm, (W, H), interpolation=cv2.INTER_CUBIC)
lab = cv2.cvtColor(sm, cv2.COLOR_BGR2LAB).astype(np.float32)
L, A, Bc = lab[..., 0], lab[..., 1] - 128, lab[..., 2] - 128

# ---- 2. hard light/shadow shapes: 3 bands of a strongly simplified luminance, smooth vector-like borders
Ls = cv2.resize(L, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
for _ in range(4):
    Ls = cv2.bilateralFilter(Ls, 9, 18, 7)
Ls = cv2.resize(Ls, (W, H), interpolation=cv2.INTER_CUBIC)
inside = alpha > 0.5
t1, t2 = np.quantile(Ls[inside], [0.33, 0.78] if FIG else [0.3, 0.72])
q = 6 if FIG else 6
sh = cv2.resize(Ls, (W // q, H // q), interpolation=cv2.INTER_AREA)
sh = cv2.GaussianBlur(cv2.medianBlur(sh.astype(np.float32), 5), (0, 0), 1.6)
sh = cv2.resize(sh, (W, H), interpolation=cv2.INTER_CUBIC)
lev = (sh > t1).astype(np.float32) + (sh > t2).astype(np.float32)
levs = cv2.GaussianBlur(lev, (0, 0), 0.9)
bandMean = np.array([Ls[inside & (lev == i)].mean() if (inside & (lev == i)).any() else 128 for i in range(3)], np.float32)

# ---- 3./4. flatten the shading inside each band (keep material contrast + fine detail), shift hues per band
detail = L - cv2.GaussianBlur(L, (0, 0), 3)
idx = np.arange(3, dtype=np.float32)
def interp(tbl):
    return np.interp(levs, idx, np.array(tbl, np.float32)).astype(np.float32)
flat = Ls - interp(bandMean)                           # the within-band shading we remove
if FIG:
    Lo = L - 0.8 * flat + interp([3, 6, 16]) + detail * 0.35
    Lo = np.where(levs < 0.5, 0.75 * Lo + 0.25 * np.maximum(Lo, 95), Lo)    # shadows are lifted, coloured, never muddy
    warm = np.clip(Bc / 30, 0, 1) * np.clip((A + 5) / 25, 0, 1)   # skin / warm wood: orange -> salmon pink (tutorial skin)
    Ao = A * interp([0.8, 1.0, 0.9]) + interp([14, 5, 3]) + warm * interp([6, 8, 7])
    Bo = Bc * interp([0.6, 0.95, 0.85]) + interp([-16, -3, 6]) - warm * interp([10, 12, 10])
else:
    Lo = L - 0.85 * flat + interp([-10, 4, 18])
    Ao = A * 0.55 + interp([18, 10, 4])
    Bo = Bc * 0.5 + interp([-22, -8, 22])
out = cv2.cvtColor(np.dstack([np.clip(Lo, 0, 255), np.clip(Ao + 128, 0, 255), np.clip(Bo + 128, 0, 255)]).astype(np.uint8), cv2.COLOR_LAB2BGR).astype(np.float32)

# ---- 7. global sunset gradient map (applied before lines so lines stay dark)
stops = np.array([[0.00, 0x2E, 0x18, 0x3A], [0.30, 0x7A, 0x3E, 0x7E], [0.55, 0xC9, 0x7A, 0xA6],
                  [0.78, 0xF0, 0xC0, 0xA8], [1.00, 0xFB, 0xF4, 0xCC]], np.float32)
Y = (0.299 * out[..., 2] + 0.587 * out[..., 1] + 0.114 * out[..., 0]) / 255
gm = np.dstack([np.interp(Y, stops[:, 0], stops[:, c]) for c in (3, 2, 1)])   # BGR
gr = a.grade if FIG else max(a.grade, 0.4)
out = (1 - gr) * out + gr * gm

# ---- 5. ink lines
ink = np.array([0x2A, 0x14, 0x24], np.float32)   # BGR of #24142A
if a.lines > 0:
    Le = cv2.GaussianBlur(L, (0, 0), 1.5 if FIG else 2.5)
    e = cv2.Canny(Le.astype(np.uint8), 30 if FIG else 40, 80 if FIG else 90)
    n, lab_cc, st, _ = cv2.connectedComponentsWithStats(e, 8)
    keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] >= (120 if FIG else 200)
    e = keep[lab_cc].astype(np.float32)
    e = cv2.GaussianBlur(e, (0, 0), 0.6) * a.lines * (0.75 if FIG else 0.35)
    e *= (alpha > 0.9)
    out = out * (1 - e[..., None]) + ink * e[..., None]

if FIG:
    # silhouette line (thicker) just inside the alpha edge
    ai = (alpha > 0.5).astype(np.uint8)
    rim_in = ai - cv2.erode(ai, np.ones((4, 4), np.uint8))
    sil = cv2.GaussianBlur(rim_in.astype(np.float32), (0, 0), 0.8)
    out = out * (1 - 0.9 * sil[..., None]) + ink * 0.9 * sil[..., None]
    # ---- 6. rim light: pale-yellow glow outside the silhouette, stronger on the sun side
    glow = np.clip(cv2.GaussianBlur(alpha, (0, 0), 7) - alpha, 0, 1) * 1.8
    side = np.linspace(1.0, 0.25, W, dtype=np.float32) if a.sun == 'left' else np.linspace(0.25, 1.0, W, dtype=np.float32)
    glow = np.clip(glow * side[None, :], 0, 0.85)
    rimc = np.array([0xC4, 0xF3, 0xF3], np.float32)   # #F3F3C4
    # a thin warm edge highlight inside the lit side too
    edge_in = np.clip(alpha - cv2.erode(alpha, np.ones((9, 9), np.uint8)), 0, 1) * side[None, :] * (Ls > np.quantile(Ls[inside], 0.4))
    out = out * (1 - 0.45 * edge_in[..., None]) + rimc * 0.45 * edge_in[..., None]
    A_out = np.maximum(alpha, glow)
    col = np.where((alpha < 0.5)[..., None], rimc, out)
    rgba = np.dstack([np.clip(col, 0, 255).astype(np.uint8), (A_out * 255).astype(np.uint8)])
    cv2.imwrite(a.out, rgba)
else:
    cv2.imwrite(a.out, np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
print('wrote', a.out, f'{W}x{H}', 'tones', N, 'mode', a.mode)
