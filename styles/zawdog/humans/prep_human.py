"""Prepare a human for build_human.py / human.py (run with the repo venv, not Blender): faces + body sheet.
    .venv/bin/python styles/zawdog/humans/prep_human.py <name> [--eye 405 --chin 715 --mouth 640]   (1024 px units; mouth = lip line;
        --throat 760 = a bare-skin row under a beard: the mesh neck takes that row instead of the stretched beard)
Input : humans/<name>/faces/<expr>.jpg (Flow, square, plain light-grey background, frontal; neutral.jpg = the reference).
Output: humans/<name>/faces/<expr>.png (512 px): every variant shifted onto the neutral (FFT phase correlation on the
        head area) and the grey background above the shoulders filled with the nearest hair/skin colour (no grey halo on
        the low-poly head silhouette); humans/<name>/face.json: the neutral's landmarks in 0..1 (eye line, chin, head
        top, ear half-width, centre) that build_human.py maps the head mesh onto."""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as nd

H = os.path.dirname(os.path.abspath(__file__))
name = sys.argv[1]
args = sys.argv[2:]
opt = {args[i].lstrip("-"): float(args[i + 1]) for i in range(0, len(args), 2)}
D = os.path.join(H, name, "faces")
N = 512


def load(p):
    return np.asarray(Image.open(p).convert("RGB").resize((N, N), Image.LANCZOS)).astype(np.float32)


ref = load(os.path.join(D, "neutral.jpg"))
bg = np.median(np.concatenate([ref[:20, :20].reshape(-1, 3), ref[:20, -20:].reshape(-1, 3)]), 0)
eye = opt.get("eye", 405) / 1024 * N
chin = opt.get("chin", 715) / 1024 * N


def bgmask(a):
    """per-row background colour (Flow greys have a left-right gradient): the median of each row's 12 edge pixels."""
    rb = np.median(np.concatenate([a[:, :12], a[:, -12:]], 1), 1)[:, None, :]
    return np.abs(a - rb).max(-1) < 16


def head_mask(a):
    m = ~bgmask(a)
    m[int(chin + 0.06 * N):] = False
    return nd.binary_opening(m, iterations=2)


def shift_of(a):
    g0 = head_mask(ref).astype(np.float32) * ref.mean(-1); g1 = head_mask(a).astype(np.float32) * a.mean(-1)
    w = np.outer(np.hanning(N), np.hanning(N))
    F = np.fft.fft2(g0 * w) * np.conj(np.fft.fft2(g1 * w)); F /= np.abs(F) + 1e-6
    c = np.fft.ifft2(F).real; dy, dx = np.unravel_index(np.argmax(c), c.shape)
    return (dy if dy < N // 2 else dy - N), (dx if dx < N // 2 else dx - N)


def fill_bg(a):
    """background above the collar -> nearest foreground colour (distance-transform index trick)."""
    mx, mn = a.max(-1), a.min(-1)
    fg = (a.mean(-1) < 140) | ((mx - mn) / (mx + 1) > 0.16)                      # hair is dark, skin is saturated; the grey is neither
    fg = nd.binary_closing(nd.binary_opening(fg, iterations=2), iterations=4)
    lab, _ = nd.label(fg); fg = nd.binary_fill_holes(lab == lab[int(eye), N // 2])    # the head blob through the eyes
    fg = nd.binary_erosion(fg, iterations=4)                                       # drop the grey fringe of the hair
    m = ~fg; m[int(chin + 0.12 * N):] = False
    if not m.any():
        return a
    _, (iy, ix) = nd.distance_transform_edt(m, return_indices=True)
    out = a.copy(); out[m] = a[iy[m], ix[m]]
    return out


m = head_mask(ref)
rows = np.flatnonzero(m[:, N // 2 - 40:N // 2 + 40].any(1))
top = rows.min()
band = m[int(eye + 0.06 * N):int(eye + 0.12 * N)]
cols = np.flatnonzero(band.any(0))
cx = (cols.min() + cols.max()) / 2
col = next((y for y in range(int(chin), N) if ref[y, int(cx)].min() > 200), int(chin + 0.07 * N))   # the tee's collar under the throat
# skin: the cheeks' colour is the reference for the whole body (neck, arms, hands), so the face never reads as a pasted mask
yy, xx = np.mgrid[:N, :N]
cheek = (yy > eye + 0.10 * N) & (yy < chin - 0.06 * N) & (np.abs(xx - cx) < 0.10 * N)
CHEEK = np.median(ref[cheek], 0)
neckm = (yy > chin + 0.005 * N) & (yy < chin + 0.05 * N) & (np.abs(xx - cx) < 0.05 * N)   # the shadow band under the jaw
NECK_GAIN = np.full(3, np.clip(CHEEK.mean() / max(np.median(ref[neckm], 0).mean(), 1), 1.0, 1.3)) if neckm.any() else np.ones(3)   # luminance only (no ashy / pink hue shift on dark skin)
ramp = np.clip((yy - (chin - 0.015 * N)) / (0.05 * N), 0, 1) * np.clip(((col + 0.01 * N) - yy) / (0.02 * N), 0, 1) * \
    np.clip((0.13 * N - np.abs(xx - cx)) / (0.03 * N), 0, 1)                    # the throat only, feathered (no dark patch under the chin)


def lift_neck(a):
    return a * (1 + (NECK_GAIN[None, None, :] - 1) * ramp[..., None])


for f in sorted(os.listdir(D)):
    if not f.endswith(".jpg"):
        continue
    a = load(os.path.join(D, f))
    dy, dx = (0, 0) if f == "neutral.jpg" else shift_of(a)
    a = nd.shift(a, (dy, dx, 0), order=1, mode="nearest")
    a = lift_neck(a)
    Image.fromarray(fill_bg(a).clip(0, 255).astype(np.uint8)).save(os.path.join(D, f[:-4] + ".png"))
    print(f, "shift", dy, dx)

widths = []                                                                # the neck's half width: the narrowest run through
for yy_ in range(int(chin + 0.01 * N), min(int(chin + 0.12 * N), N - 1)):     # the centre between the jaw and the collar
    nrow = ~bgmask(ref)[yy_]; k0 = int(cx); kl = k0; kr = k0
    while kl > 0 and nrow[kl - 1]: kl -= 1
    while kr < N - 1 and nrow[kr + 1]: kr += 1
    widths.append((kr - kl, kl, kr))
ehw = (cols.max() - cols.min()) / 2
_, kl, kr = min([w for w in widths if w[0] / 2 > 0.4 * ehw] or [(int(0.9 * ehw), int(cx - 0.45 * ehw), int(cx + 0.45 * ehw))])
top = opt["top"] / 1024 * N if "top" in opt else top                         # --top: the skull top under a hair puff / tall hat
json.dump(dict(top=top / N, eye=eye / N, chin=chin / N, collar=col / N, cx=cx / N, ear_hw=(cols.max() - cols.min()) / 2 / N,
               neck_hw=(kr - kl) / 2 / N, **{k: opt[k] / 1024 for k in ("mouth", "throat") if k in opt}),
          open(os.path.join(H, name, "face.json"), "w"), indent=1)
print(open(os.path.join(H, name, "face.json")).read())


# ------------------------------------------------------------------ the body sheet (front | right profile | back on magenta)
def magenta(a):
    r, g, b = (a[..., i].astype(int) for i in range(3))
    bgm = (r > 150) & (b > 150) & (g < 130) & (np.abs(r - b) < 90)
    mx = np.maximum(np.maximum(r, b), g) + 1
    bgm |= ((r - g) / mx > 0.42) & ((b - g) / mx > 0.30)
    return bgm


S = np.asarray(Image.open(os.path.join(H, name, "src", "sheet.jpg")).convert("RGB")).astype(np.float32)
fg = nd.binary_opening(~magenta(S), iterations=2)
lab, n = nd.label(fg); sizes = nd.sum(fg, lab, range(1, n + 1))
big = sorted([i + 1 for i in np.argsort(sizes)[::-1][:3]], key=lambda i: np.flatnonzero((lab == i).any(0)).mean())
views = {}
for key, li in zip(("front", "side", "back"), big):
    m = nd.binary_fill_holes(lab == li)
    ys, xs = np.nonzero(m)
    runs = []
    for y in range(m.shape[0]):
        xs_ = np.flatnonzero(m[y])
        if not len(xs_):
            runs.append([]); continue
        cuts = np.flatnonzero(np.diff(xs_) > 2)
        st = np.r_[xs_[0], xs_[cuts + 1]]; en = np.r_[xs_[cuts], xs_[-1]]
        runs.append([[int(a), int(b)] for a, b in zip(st, en) if b - a >= 2])
    views[key] = dict(y0=int(ys.min()), y1=int(ys.max()), x0=int(xs.min()), x1=int(xs.max()), runs=runs)
keep = np.zeros(fg.shape, bool)
for li in big:
    keep |= nd.binary_fill_holes(lab == li)
mx_ = S.max(-1) + 1
fringe = ((S[..., 0] - S[..., 1]) / mx_ > 0.22) & ((S[..., 2] - S[..., 1]) / mx_ > 0.12)   # cloth + magenta anti-aliasing
inner = nd.binary_erosion(keep, iterations=4) & ~magenta(S) & ~nd.binary_dilation(magenta(S), iterations=8) | (
    nd.binary_erosion(keep, iterations=4) & ~magenta(S) & ~fringe)   # no pink / lilac rim
_, (iy, ix) = nd.distance_transform_edt(~inner, return_indices=True)
bled = S[iy, ix]
spill = np.clip(np.minimum(bled[..., 0], bled[..., 2]) - bled[..., 1], 0, None)   # magenta despill: the studio's pink bounce
bled[..., 0] -= spill; bled[..., 2] -= spill                                        # on cream / white cloth (skin has b < g)
r_, g_, b_ = (bled[..., i] for i in range(3))
fv = views["front"]; fh = fv["y1"] - fv["y0"]; fcx = (fv["x0"] + fv["x1"]) / 2
for y in range(fv["y0"] + int(0.02 * fh), fv["y0"] + int(0.08 * fh)):              # the head's centre column (not the hip)
    if fv["runs"][y]:
        r0 = max(fv["runs"][y], key=lambda r: r[1] - r[0]); fcx = (r0[0] + r0[1]) / 2
fy0, fy1 = fv["y0"] + int(0.055 * fh), fv["y0"] + int(0.095 * fh)                 # the sheet's own face skin (cheeks / nose)
SF = np.median(S[fy0:fy1, int(fcx - 0.02 * fh):int(fcx + 0.02 * fh)].reshape(-1, 3), 0)
chroma = bled / (bled.sum(-1, keepdims=True) + 1); cSF = SF / (SF.sum() + 1)
lum = bled.mean(-1) / max(SF.mean(), 1)
skin = keep & (np.abs(chroma - cSF).max(-1) < 0.035) & (lum > 0.45) & (lum < 1.7) & (r_ > g_) & (g_ >= b_ - 4)   # skin = the face's hue, not cloth shadows
for v_ in views.values():                                       # only arms, hands, neck and head: the central run (torso,
    y_cut = int(v_["y0"] + 0.3 * (v_["y1"] - v_["y0"]))          # legs) below the chest is clothing (khaki / tan trousers
    cxv = (v_["x0"] + v_["x1"]) / 2                                # are skin-coloured and must not be "skin matched")
    for y in range(y_cut, v_["y1"] + 1):
        for a_, b_ in v_["runs"][y]:
            if a_ - 3 <= cxv <= b_ + 3 or abs((a_ + b_) / 2 - cxv) < 0.08 * (v_["y1"] - v_["y0"]):
                skin[y, a_:b_ + 1] = False
skin = nd.binary_opening(skin, iterations=1)
if skin.any():
    gain = np.clip(CHEEK / np.median(bled[skin], 0), 0.7, 1.5)
    soft = nd.gaussian_filter(skin.astype(float), 1.5)[..., None]
    bled = bled * (1 + (gain[None, None, :] - 1) * soft)
    print("skin match gain", np.round(gain, 3), "neck gain", np.round(NECK_GAIN, 3))
Image.fromarray(bled.clip(0, 255).astype(np.uint8)).save(os.path.join(H, name, "sheet_bleed.png"))
json.dump(dict(w=S.shape[1], h=S.shape[0], views=views), open(os.path.join(H, name, "sheet.json"), "w"))
print("sheet views", {k: (v["x0"], v["x1"], v["y0"], v["y1"]) for k, v in views.items()})
