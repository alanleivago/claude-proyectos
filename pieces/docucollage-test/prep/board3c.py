"""v3c storyboard: v3b + user round 2 (approved wiggle speed restored, whiter/faster shine, grunge +40 %, halftone measured 8-9 px @30 deg linear,
S03/S04 white wall + floor layers + $5,000 like JESSICA, S11, S13, S22, S24 fixes). Base: v3b (layers everywhere, grunge, soft centre glow, feathered fades, halftone where the ref has it,
tight title leading, EB Garamond 800 + thin same-colour stroke, bigger hero words, no visible cut edges).
Scenes are functions of t (s inside the shot, graphics stepped at 12 fps) so the board and the motion test share one code path.
python prep/board3c.py board    -> storyboard/v3c/frames/*.png, board_*.jpg, compare/*.jpg (v3b | v3c | ref)
python prep/board3c.py motion   -> storyboard/v3c/motion_test.mp4 (ours | ref)"""
import json, math, random, subprocess, sys
from functools import lru_cache
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance, ImageChops
R = Path(__file__).resolve().parent.parent
I3, I2, I3B, FD = R / "assets/img3", R / "assets/img2", R / "assets/img3b", R / "assets/fonts"
SB = R / "storyboard/v3"; OUT = R / "storyboard/v3c"; FR = OUT / "frames"; PREV = R / "storyboard/v3b"; FR.mkdir(parents=True, exist_ok=True)
REELS = R.parent.parent / "fuentes/docucollage/reels"
W, H = 1080, 1920
GOLD, SHADOW, CREAM, YEL = (255, 208, 141), (66, 47, 26), (244, 237, 224), (242, 222, 46)
F3 = json.loads((I3 / "faces.json").read_text()); F2 = json.loads((I2 / "faces.json").read_text())
HOST_Y = 740

def hexc(s): s = s.lstrip("#"); return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))
def q(t): return math.floor(t * 12 + 1e-6) / 12          # 12 fps graphics grid
def ss(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
def sss(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)
def eo3(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def eio(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)

# ---------------- image helpers ----------------
@lru_cache(None)
def _load(name):
    for d in (I3B, I3, I2):
        if (d / name).exists(): return Image.open(d / name).convert("RGBA")
    raise FileNotFoundError(name)
def L(name): return _load(name).copy()
def cover(im, w=W, h=H, fx=0.5, fy=0.5, s=1.0):
    k = max(w / im.width, h / im.height) * s
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x = (im.width - w) * fx; y = (im.height - h) * fy
    return im.crop((round(x), round(y), round(x) + w, round(y) + h))
def scale(im, w=None, h=None):
    k = (w / im.width) if w else (h / im.height)
    return im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS), k
def paste(base, im, x, y):
    lay = Image.new("RGBA", base.size, (0, 0, 0, 0)); lay.paste(im, (round(x), round(y)), im); base.alpha_composite(lay)
def put(base, spr, x, y, k=1.0, ax=W / 2, ay=H / 2):
    """sprite with top-left (x, y) at k=1, scaled by k about the anchor (camera / parallax)"""
    if abs(k - 1) > 1e-4:
        spr = spr.resize((max(1, round(spr.width * k)), max(1, round(spr.height * k))), Image.BICUBIC)
        x = ax + (x - ax) * k; y = ay + (y - ay) * k
    paste(base, spr, x, y)
def bw(im, c=1.2):
    a = im.split()[-1]; g = ImageEnhance.Contrast(im.convert("L")).enhance(c).convert("RGBA"); g.putalpha(a); return g
def duo(im, dark, light, c=1.15):
    a = im.split()[-1]; g = ImageEnhance.Contrast(im.convert("L")).enhance(c)
    o = ImageOps.colorize(g, dark, light).convert("RGBA"); o.putalpha(a); return o
def shadow(im, dx=0, dy=18, blur=16, a=0.45):
    s = Image.new("RGBA", (im.width + 80, im.height + 80), (0, 0, 0, 0))
    m = im.split()[-1].point(lambda v: round(v * a)); sh = Image.new("RGBA", im.size, (0, 0, 0, 255)); sh.putalpha(m)
    s.paste(sh, (40 + dx, 40 + dy)); s = s.filter(ImageFilter.GaussianBlur(blur)); s.alpha_composite(im, (40, 40)); return s, 40

# ---------------- backgrounds: flat colour + soft centre glow (heavy feather) + optional darkening ----------------
def glow_bg(top, bot=None, gx=0.5, gy=0.42, rx=0.75, ry=0.45, ga=0.16, dark=None, stops=None, w=W, h=H, gcol=(255, 255, 255)):
    sw, sh = max(8, w // 4), max(8, h // 4)
    fy = np.linspace(0, 1, sh, dtype=np.float32)[:, None] * np.ones((1, sw), np.float32)
    fx = np.linspace(0, 1, sw, dtype=np.float32)[None, :] * np.ones((sh, 1), np.float32)
    if stops:
        ps = [p for p, _ in stops]; cs = np.array([hexc(c) if isinstance(c, str) else c for _, c in stops], np.float32)
        base = np.stack([np.interp(fy, ps, cs[:, i]) for i in range(3)], -1)
    else:
        top = np.array(hexc(top) if isinstance(top, str) else top, np.float32); bot = top if bot is None else np.array(hexc(bot) if isinstance(bot, str) else bot, np.float32)
        base = top + (bot - top) * fy[..., None]
    d = np.sqrt(((fx - gx) / rx) ** 2 + ((fy - gy) / ry) ** 2)
    g = ga * ss(1 - d)                                     # smoothstep both ends: no visible rim
    rgb = base + (np.array(gcol, np.float32) - base) * g[..., None]
    for side, amt, start in (dark or []):
        u = {"right": fx, "left": 1 - fx, "bottom": fy, "top": 1 - fy}[side]
        rgb = rgb * (1 - amt * ss((u - start) / (1 - start)))[..., None]
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    a = np.asarray(im, np.float32) + np.random.default_rng(1).uniform(-1.4, 1.4, (h, w, 1))   # dither: no banding
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert("RGBA")
def fade(im, side, length, col=(0, 0, 0), amax=0.85, power=1.6):
    """dark/colour fade from an edge with a very long feather (smoothstep^power, zero slope at both ends)"""
    t = np.linspace(0, 1, length, dtype=np.float32); a = amax * ss(1 - t) ** power
    w, h = im.size
    if side in ("top", "bottom"):
        col_a = np.zeros(h, np.float32); seg = a if side == "top" else a[::-1]
        if side == "top": col_a[:min(h, length)] = seg[:min(h, length)]
        else: col_a[max(0, h - length):] = seg[-min(h, length):]
        m = np.repeat(col_a[:, None], w, 1)
    else:
        row = np.zeros(w, np.float32); seg = a if side == "left" else a[::-1]
        if side == "left": row[:min(w, length)] = seg[:min(w, length)]
        else: row[max(0, w - length):] = seg[-min(w, length):]
        m = np.repeat(row[None, :], h, 0)
    lay = Image.new("RGBA", im.size, tuple(col) + (255,)); lay.putalpha(Image.fromarray((m * 255).astype(np.uint8)))
    out = im.copy(); out.alpha_composite(lay); return out

# ---------------- halftone (45 deg dot screen; light dots on dark grounds, dark dots on light grounds) ----------------
_DOT = {}
def dotmask(w, h, pitch, rfrac, angle=30):
    k = (w, h, pitch, rfrac, angle)
    if k not in _DOT:
        y, x = np.mgrid[0:h, 0:w].astype(np.float32); c, sn = math.cos(math.radians(angle)), math.sin(math.radians(angle))
        u = (x * c + y * sn) / pitch; v = (-x * sn + y * c) / pitch
        d = np.sqrt((u - np.round(u)) ** 2 + (v - np.round(v)) ** 2) * pitch
        _DOT[k] = np.clip((rfrac * pitch - d) / 1.2 + 0.5, 0, 1)            # soft 1.2 px rim, like the compressed ref dots
    return _DOT[k]
def halftone(im, a=0.13, pitch=9, light=False, rfrac=0.30, angle=30):
    """light dots: a 0.09-0.10, rfrac 0.25 (zoom-compared with DK FITNESS / ARR Jane); dark dots on sky/teal: a 0.14-0.17, rfrac 0.30.
    ref (FFT on DK 28.8 s / GOLD 13 s): screen at 30 deg, pitch 7.9 px (DK) / 9.6 px (GOLD) at 1080; dots are a LINEAR add (light, +34
    levels on navy, linear dodge) or subtract (dark, on sky) of a*255 -- not multiply (the delta is the same on R, G and B)"""
    arr = np.asarray(im.convert("RGBA"), np.float32).copy(); m = dotmask(im.width, im.height, pitch, rfrac, angle)[..., None] * a * 255
    arr[..., :3] = arr[..., :3] + m if light else arr[..., :3] - m
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")

# ---------------- grunge overlay: user's paper texture that changes every few frames x dust specks, multiplied, drifting ----------------
@lru_cache(8)
def _g(i): return np.asarray(Image.open(R / f"assets/grunge/g_{i % 36:03d}.png"), np.float32) / 255
GRUNGE_GAIN = 0.4          # final: much subtler (user: about half of 0.9 or less) -> soft-light-like: texture centred on its mean, so it only adds fibre/speck contrast
def grunge(im, t=0.0, a=0.30):
    a = min(0.5, a * GRUNGE_GAIN)
    n = math.floor(t * 12 + 1e-6); g = np.roll(_g(n // 2), (n * 3) % H, axis=0)          # texture swaps every 2 steps, drifts 36 px/s
    arr = np.asarray(im.convert("RGBA"), np.float32).copy()
    arr[..., :3] *= (1 + a * 1.6 * (g - g.mean()))[..., None]                               # soft-light-ish: no overall darkening, fibres +-3-5 %
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")

# ---------------- censor bar ----------------
def bar(base, faces, k, ox, oy, idx=(0,), style="smudge", seed=5):
    rnd = random.Random(seed)
    for i in idx:
        f = faces[i]; w = f["bar_w"] * k * 1.05; h = max(16, f["bar_h"] * k * 0.95)
        lay = Image.new("RGBA", base.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
        cx, cy = f["cx"] * k + ox, f["cy"] * k + oy
        if style == "white":
            for j in range(7):
                yy = cy - h * 0.25 + j * h * 0.09
                d.line([(cx - w / 2 + rnd.uniform(-8, 4), yy + rnd.uniform(-3, 3)), (cx + w / 2 + rnd.uniform(-4, 8), yy + rnd.uniform(-3, 3))], fill=(245, 245, 245, 235), width=max(3, round(h * 0.16)))
            lay = lay.filter(ImageFilter.GaussianBlur(1.2))
        else:
            d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], radius=h * 0.45, fill=(11, 11, 11, 255))
            soft = lay.filter(ImageFilter.GaussianBlur(7)); lay = Image.alpha_composite(soft, lay.filter(ImageFilter.GaussianBlur(1.5)))
        lay = lay.rotate(-f["angle"], center=(cx, cy)); base.alpha_composite(lay)
def face_in(name, bbox_off=(0, 0), faces=F3):
    return [dict(f, cx=f["cx"] - bbox_off[0], cy=f["cy"] - bbox_off[1]) for f in faces[name]]

# ---------------- type ----------------
def _H(a):                       # same integer hash as prep/tests/wiggle_test.html (approved title_test_v3b)
    a &= 0xFFFFFFFF; a = (a ^ 61) ^ (a >> 16); a = (a + (a << 3)) & 0xFFFFFFFF; a ^= a >> 4; a = (a * 0x27d4eb2d) & 0xFFFFFFFF; a ^= a >> 15
    return a / 4294967295
def _G(s, k):
    u = max(1e-6, _H(s * 7919 + k * 104729)); v = _H(s * 31337 + k * 7477)
    return max(-2.5, min(2.5, math.sqrt(-2 * math.log(u)) * math.cos(6.2831853 * v)))
def _CR(s, u):
    i = math.floor(u); f = u - i; p0, p1, p2, p3 = _G(s, i - 1), _G(s, i), _G(s, i + 1), _G(s, i + 2)
    return 0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f)
WIG_WPS, WIG_AX, WIG_AY, WIG_CAP = 3.5, 0.6 * 0.029, 0.6 * 0.055, 0.70     # approved: 3.5 osc/s, 60 % amplitude, position only, 12 fps steps
def wiggle_xy(seed, step, size):
    t = step / 12; h = size * WIG_CAP
    return _CR(seed * 3 + 1, t * WIG_WPS) * WIG_AX * h, _CR(seed * 3 + 2, t * WIG_WPS) * WIG_AY * h
FONTS = {"cond": "BebasNeue-Regular.ttf", "serif": "EBGaramond.ttf", "ital": "EBGaramond-Italic.ttf", "hand": "CoveredByYourGrace.ttf", "cap": "Poppins-Bold.ttf"}
@lru_cache(None)
def font(kind, size, wght=800):
    f = ImageFont.truetype(str(FD / FONTS[kind]), size)
    if kind in ("serif", "ital"): f.set_variation_by_axes([min(800, wght)])
    return f
def stroke_of(kind, size, wght):
    if kind == "cond": return 2                                   # ref GOLD MEDAL: Bebas + ~2 px
    if kind in ("serif", "ital") and wght >= 700: return max(1, round(size * 0.013))   # EB Garamond 800 + 2 px @150 (ref SYNDROME)
    return 0
def tline(text, kind, size, col=GOLD, track=None, maxw=970, maxh=None, wght=800, sh=True, shcol=SHADOW, wig=True, step=0, seed=0, nvis=None, newa=0.45, shs=0.04, fit=None):
    track = {"cond": 0.2, "hand": 0.10}.get(kind, 0.02) if track is None else track
    while True:
        f = font(kind, size, wght); st = stroke_of(kind, size, wght)
        adv = [f.getlength(c) + track * size for c in text]; tw = sum(adv) - track * size
        bb = f.getbbox(text, stroke_width=st)
        if (tw <= maxw and (maxh is None or bb[3] - bb[1] <= maxh)) or size < 30: break
        size -= 2
    if fit and len(text) > 1:                                                                   # justify: same width as the line it aligns to
        g = sum(f.getlength(c) for c in text); track = (fit - g) / ((len(text) - 1) * size)
        adv = [f.getlength(c) + track * size for c in text]; tw = sum(adv) - track * size
    pad = int(size * 0.35); lay = Image.new("RGBA", (int(tw + 2 * pad), int(size * 1.4 + 2 * pad)), (0, 0, 0, 0))
    s = max(3, round(size * shs)) if sh else 0
    xx = pad; n = len(text) if nvis is None else int(nvis)
    for i, (c, a) in enumerate(zip(text, adv)):
        jx, jy = wiggle_xy(seed * 97 + i + 1, step, size) if (wig and kind != "hand") else (0, 0)
        if i >= n: xx += a; continue
        L_ = Image.new("RGBA", lay.size, (0, 0, 0, 0)); d = ImageDraw.Draw(L_)
        if sh: d.text((xx + jx + s, pad + jy + round(s * 0.9)), c, font=f, fill=shcol, stroke_width=st, stroke_fill=shcol)
        d.text((xx + jx, pad + jy), c, font=f, fill=col, stroke_width=st, stroke_fill=col)
        if nvis is not None and i == n - 1 and n < len(text) and newa < 1: L_.putalpha(L_.split()[-1].point(lambda v: round(v * newa)))
        lay.alpha_composite(L_); xx += a
    return dict(img=lay, pad=pad, w=tw, top=bb[1], bot=bb[3], size=size)
def title(lines, top, gap=0.10, align="center", x=75, prog=None, step=0, seed=0):
    """stack lines by their INK boxes: next ink top = previous ink bottom + gap * next cap height (ref: 0.08-0.18).
    lines: dicts t,k,s (+col,maxw,maxh,wght,track,sh,shcol,gap,x). prog = typed chars so far (None = all)."""
    auto = prog is None and CTX["t"] is not None                                               # final render: every title types, wiggles, then shines
    if auto:
        tt = q(CTX["t"]); total = sum(len(l["t"]) for l in lines); t0 = CTX["t0"]
        rate = max(1.5, total / max(1, (0.55 * CTX["dur"] - t0) * 12))                          # short shots type faster so the title always completes
        prog = typed(tt, t0, rate); step = math.floor(tt * 12 + 1e-6); tdone = t0 + math.ceil(total / rate) / 12
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); y = top; prev = None; left = prog; boxes = []
    for i, ln in enumerate(lines):
        nv = None
        if prog is not None: nv = max(0, min(len(ln["t"]), left)); left -= len(ln["t"])
        o = {k: v for k, v in ln.items() if k not in ("t", "k", "s", "gap", "x")}
        r = tline(ln["t"], ln["k"], ln["s"], step=step, seed=seed * 31 + i, nvis=nv, **o)
        cap = r["bot"] - r["top"]
        ink_top = top if prev is None else prev + ln.get("gap", gap) * cap
        oy = ink_top - r["top"]
        xx = (W - r["w"]) / 2 if align == "center" else ln.get("x", x)
        if nv != 0: paste(lay, r["img"], xx - r["pad"], oy - r["pad"])
        prev = oy + r["bot"]; boxes.append((xx, ink_top, xx + r["w"], prev))
    if auto and tt >= tdone + 1 / 12: lay = shine(lay, -200 + (tt - tdone - 1 / 12) * SHINE_SPEED)
    return lay, boxes
SHINE_SPEED = 1300              # px/s (v3b 1000; approved test 975) -- user: a bit faster
def shine(lay, xc, band=170, a=0.75, col=(255, 248, 234)):
    """FINAL (user, after v3c): halfway v3b/v3c -> 75 % toward a warm white #FFF8EA, +/-170 px. One sweep inside the letters: triangular profile +/-band px (like the CSS mask 47/50/53 %), slanted 105 deg"""
    arr = np.asarray(lay, np.float32).copy(); y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    m = ss(1 - np.abs(x - xc + 0.27 * (y - 300)) / band) * a * arr[..., 3] / 255
    arr[..., :3] += (np.array(col, np.float32) - arr[..., :3]) * m[..., None]; return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
def typed(t, t0, per_step=1.0):
    return None if t is None else max(0, math.floor((q(t) - t0) * 12 * per_step + 1e-6) + (1 if q(t) >= t0 else 0))
def pill(base, text, done, cy):
    if FINAL: return
    f = font("cap", 44); words = text.split()
    tw = f.getlength(text); w = tw + 64; x = (W - w) / 2
    sh = Image.new("RGBA", base.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([x, cy - 43 + 4, x + w, cy + 43 + 4], 30, fill=(0, 0, 0, 70))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
    d = ImageDraw.Draw(base); d.rounded_rectangle([x, cy - 43, x + w, cy + 43], 30, fill=(251, 245, 229))
    xx = x + 32
    for i, wd in enumerate(words):
        d.text((xx, cy - 31), wd, font=f, fill=(27, 27, 27) if i < done else (207, 200, 182)); xx += f.getlength(wd + " ")
def host_seq(t_edit):
    i = min(34, max(0, math.floor(t_edit * 12 + 1e-6)))
    return Image.open(PREV / f"host_seq/h_{i + 1:03d}.png").convert("RGBA")
def tht(t): return Image.open(SB / f"host/tht_{t}.png").convert("RGBA")
def cot(t): return Image.open(SB / f"host/cot_{t}.png").convert("RGBA")
def th(t): return Image.open(SB / f"host/th_{t}.png").convert("RGBA")
def host_co(t): return Image.open(SB / f"host/co_{t}.png").convert("RGBA")
def torn_edge(im, y, seed=3, amp=12, rim=7, below=True):
    r = random.Random(seed); pts = []; x = -10
    while x < W + 20: pts.append((x, y + r.uniform(-amp, amp) + 10 * math.sin(x / 80 + seed))); x += r.choice([8, 11, 14, 17])
    poly = pts + ([(W + 20, H + 10), (-10, H + 10)] if below else [(W + 20, -10), (-10, -10)])
    m = Image.new("L", im.size, 0); ImageDraw.Draw(m).polygon(poly, fill=255)
    rimm = Image.new("L", im.size, 0); ImageDraw.Draw(rimm).polygon([(px, py + (rim if below else -rim)) for px, py in pts] + poly[len(pts):], fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0)); fib = Image.new("RGBA", im.size, (242, 238, 228, 255))
    out.paste(fib, (0, 0), m); inner = im.copy(); inner.putalpha(ImageChops.multiply(im.split()[-1], rimm)); out.alpha_composite(inner)
    return out
def cam_layer(base, spr, x, y, s, dx, dy, depth, ax=W / 2, ay=H / 2):
    """parallax: a layer at `depth` gets (s-1)*depth extra scale and depth * camera offset"""
    put(base, spr, x + dx * depth, y + dy * depth, 1 + (s - 1) * depth, ax + dx * depth, ay + dy * depth)

S = {}
def meta(sid, **kw): S[sid] = kw
FINAL = False                   # render3c.py sets it: captions and host come from HyperFrames, titles animate on CTX
CTX = {"t": None, "dur": 1.0, "t0": 0.1}

# =====================================================================================================================
# S01  fav_80 / GOLD P01 0.2-1.84 : flat beige bg | man layer (moves like a camera) | title (fixed) | grunge | host | pill
@lru_cache(None)
def _s01():
    bg = glow_bg("#7a5f43", "#5b4733", gx=0.42, gy=0.30, rx=0.85, ry=0.50, ga=0.17, dark=[("bottom", 0.25, 0.55)], w=1188, h=2112)
    man = L("medalman2.png"); k = 1.45; man = man.resize((round(man.width * k), round(man.height * k)), Image.LANCZOS)   # final: new Flow man, whole head + both sides in frame, legs run off the bottom
    return bg, man
def s01(t=1.0):
    tq = q(t); bg, man = _s01(); b = Image.new("RGBA", (W, H))
    u = eio(tq / 1.9); s = 1 + 0.067 * u; dy = -60 * u; dx = 16 * math.sin(tq * 1.7)      # ref P01: x1.067 over 1.9 s, drifts up 60 px
    cam_layer(b, bg, -54, -96, s, dx, dy, 0.3)                                               # flat bg: 30 % of the camera (parallax)
    cam_layer(b, man, (600 - 388.5 * 1.45), -80, s, dx, dy, 1.0, ay=700)                                   # whole figure inside left/right/top
    tl, _ = title([dict(t="CLUB", k="cond", s=150, maxw=760), dict(t="DIRECTORS", k="serif", s=230, maxw=970)], 96, gap=0.09,
                  prog=typed(t, 0.0, 1.5), step=math.floor(tq * 12))
    if tq >= 0.95: tl = shine(tl, -200 + (tq - 0.95) * SHINE_SPEED)                               # one slow sweep ~1000 px/s
    b.alpha_composite(tl); b = grunge(b, tq, 0.32)
    paste(b, host_seq(t), 0, HOST_Y) if not FINAL else None; pill(b, "Club directors,", 1 if t < 0.55 else 2, 900)
    return b
meta("s01", t="0.00-1.28", line="Club directors,", ref="gold_1.20.jpg", refid="fav_80 · GOLD P01 0.2-1.84",
     motion="LAYERS: flat beige bg (own layer, soft white glow up-left, feathered) | man-with-medals cutout | title | grunge | host. CAMERA on the man: x1.00→1.067 + drift up 60 px + ±16 px sway over 1.9 s (ease in-out); bg moves 30 % of that (parallax). Title fixed: CLUB/DIRECTORS typed (1.5 chars/step), approved smooth wiggle (3.5 osc/s, 60 %), one near-white shine at 1300 px/s. Grunge multiply 45 %, texture changes every 2 steps.")

# S02  fav_81 / GOLD P02-P03 : sunset sky (coded, own layer) | bench+man+box+ground layer | title | grunge | host
@lru_cache(None)
def _s02():
    sky = glow_bg(None, stops=[(0, "#050c17"), (0.22, "#0a1829"), (0.33, "#16263f"), (0.375, "#5a3a3e"), (0.40, "#c9652c"), (0.42, "#e7883a"), (0.45, "#2a1a10"), (1, "#050805")],
                  gx=0.55, gy=0.40, rx=0.65, ry=0.12, ga=0.22, gcol=(255, 236, 200), w=1188, h=2112)
    bench = L("bench_layer.png"); k = 1.55; bench = bench.resize((round(bench.width * k), round(bench.height * k)), Image.LANCZOS)
    ext = Image.new("RGBA", (bench.width, bench.height + 800), (0, 0, 0, 0)); ext.paste(bench, (0, 0))          # ground continues below the photo
    gcol = tuple(np.asarray(bench.crop((0, bench.height - 40, bench.width, bench.height)).convert("RGB")).reshape(-1, 3).mean(0).astype(int)) + (255,)
    ImageDraw.Draw(ext).rectangle([0, bench.height - 2, bench.width, ext.height], fill=gcol); bench = ext
    return sky, bench
def s02(t=1.4):
    tq = q(t); sky, bench = _s02(); b = Image.new("RGBA", (W, H))
    s = 1 + 0.015 * tq; dx = -18 * eio(tq / 1.6); dy = 0
    cam_layer(b, sky, -54, -96 + 30, s, dx, dy, 0.3)
    hz = 860 * 1.55; cam_layer(b, bench, (W - bench.width) / 2, 795 - hz, s, dx, dy, 1.0)    # horizon on the sky's orange band
    tl, _ = title([dict(t="A UNIFORM", k="cond", s=124, maxw=760), dict(t="COMPANY", k="serif", s=250, maxw=970)], 140, gap=0.09,
                  prog=typed(t, 0.0, 1.5), step=math.floor(tq * 12), seed=2)
    if tq >= 1.0: tl = shine(tl, -200 + (tq - 1.0) * SHINE_SPEED)
    b.alpha_composite(tl); b = grunge(b, tq, 0.30)
    paste(b, host_seq(1.28 + t), 0, HOST_Y) if not FINAL else None; pill(b, "a uniform company", 2 if t > 0.6 else 1, 900)
    return b
meta("s02", t="1.28-2.80", line="a uniform company offers your club", ref="gold_3.20.jpg", refid="fav_81 · GOLD P02-P03 1.84-4.0",
     motion="LAYERS: coded sunset sky (flat navy→orange, warm glow on the horizon) | bench+man+jersey box+grass (one cutout) | title | grunge | host. Slide-in from the right (P03), push +1.5 %/s, sky at 30 % parallax. Title: leading 0.09 x cap, COMPANY fills 970 px, EB Garamond 800 + 3 px stroke.")

# S03 / S04  fav_82/83 : room plate | girl layer | title  (unchanged layout) + grunge
# S03 + S04 = one continuous shot like GOLD P04 (4.0-7.3): WHITE wall layer | wooden floor layer | girl | "$5,000" written like JESSICA
@lru_cache(None)
def _s34():
    k = H / 1376
    wall = glow_bg("#efeae6", "#e2dcd5", gx=0.36, gy=0.32, rx=0.85, ry=0.55, ga=0.30, dark=[("right", 0.05, 0.45)], w=1188, h=2112)   # ref wall #EEE9E6 -> #E2DBD4
    rp = L("room_plate.jpg"); kr = k * 1.1; rp = rp.resize((round(rp.width * kr), round(rp.height * kr)), Image.LANCZOS)
    fy0 = round(1135 * kr); fm = Image.new("L", rp.size, 0); ImageDraw.Draw(fm).rectangle([0, fy0, rp.width, rp.height], fill=255)
    floor = ImageEnhance.Brightness(ImageEnhance.Color(rp).enhance(0.55)).enhance(0.92)                      # ref floor is a greyer wood (#8C7357)
    ImageDraw.Draw(floor).rectangle([0, fy0 - 30, rp.width, fy0], fill=(240, 236, 231, 255)); ImageDraw.Draw(floor).line([(0, fy0 - 30), (rp.width, fy0 - 30)], fill=(205, 199, 192, 255), width=2)   # white skirting board
    fm2 = Image.new("L", rp.size, 0); ImageDraw.Draw(fm2).rectangle([0, fy0 - 31, rp.width, rp.height], fill=255); floor.putalpha(fm2)
    gi = L("girl.png"); src = Image.open(R / "flow/v3/girl.jpg"); kg = k * 0.93                       # a bit smaller, feet kept on the floor (ref girl ~1410 px)
    gox = W / 2 - src.width * kg / 2; gyo = 1729 - 1239 * kg; k = kg
    g = gi.resize((round(gi.width * k), round(gi.height * k)), Image.LANCZOS)
    gsh = Image.new("RGBA", g.size, (40, 30, 20, 0)); gsh.putalpha(g.split()[-1].point(lambda v: round(v * .26)).filter(ImageFilter.GaussianBlur(26)))
    f0 = F3["girl"][0]; nx, ny = f0["cx"] * k, (f0["cy"] + 70) * k
    gmed = g.copy(); dr = ImageDraw.Draw(gmed)
    for sx_ in (-1, 1): dr.line([(nx + sx_ * 30 * k, ny), (nx + sx_ * 4, ny + 75 * k)], fill=(28, 118, 66, 255), width=round(9 * k))
    bar(g, F3["girl"], k, 0, 0); bar(gmed, F3["girl"], k, 0, 0)
    md = L("medal.png"); md = md.crop(md.getbbox()); md = md.crop((0, round(md.height * 0.42), md.width, md.height)); md, _ = scale(md, w=round(92 * k))
    fan = L("cashfan.png"); fan = fan.crop(fan.getbbox()); fan, _ = scale(fan, 880)
    head = (f0["cx"] * k + gox, f0["cy"] * k + gyo)
    tl = tline("$5,000", "hand", 180, col=(245, 184, 20), sh=False, track=0.18)                 # ref JESSICA: #F5B814, ink ~100 px tall
    return wall, rp, floor, kr, g, gmed, gsh, gox, gyo, md, (nx, ny), fan, head, tl
def cam34(tq):
    if tq < 0.70: return 1 + 0.02 * tq                                                          # hold, slow push
    if tq < 1.34: return 1.014 + 0.236 * ((tq - 0.70) / 0.64) ** 2.2                            # ref 5.16-5.88: accelerating push (floor 1566 -> 1711)
    return 1.25 + 0.07 * eo3((tq - 1.34) / 0.84)
def s34(t):
    tq = q(t); n = math.floor(tq * 12 + 1e-6)
    wall, rp, floor, kr, g, gmed, gsh, gox, gyo, md, (nx, ny), fan, head, tl = _s34()
    s = cam34(tq); AX, AY = 540, 1071; b = Image.new("RGBA", (W, H))
    cam_layer(b, wall, -54, -96, s, 0, 0, 0.4, AX, AY)
    cam_layer(b, floor, (W - rp.width) / 2, H - rp.height + 40, s, 0, 0, 0.55, AX, AY)
    dx = 135 * (1 - eo3(tq / 0.6))                                                              # girl slides in from the right (15 f ease-out)
    if tq >= 1.36:                                                                              # cash fan pops behind her head (rings), 30 % parallax
        fk = 1.28 if tq < 1.36 + 2 / 12 else 1 + 0.28 * (1 - eo3((tq - 1.36 - 2 / 12) / 0.3))
        fs = fan.resize((round(fan.width * fk), round(fan.height * fk)), Image.BICUBIC)
        cam_layer(b, fs, head[0] - fs.width / 2, head[1] - 210 - fs.height / 2 - X(tq, 0), s, 0, 0, 0.8, AX, AY)
    gx_ = X(tq, 1); cam_layer(b, gsh, gox + 70 + dx, gyo - 30 + gx_, s, 0, 0, 0.95, AX, AY)
    cam_layer(b, gmed if tq >= 1.44 else g, gox + dx, gyo + gx_, s, 0, 0, 1.0, AX, AY)
    if tq >= 1.44:                                                                              # medal: pops high, drops 1 step, settles on the chest
        dy = -150 if tq < 1.44 + 1 / 12 else -60 if tq < 1.44 + 2 / 12 else -60 * (1 - eo3((tq - 1.44 - 2 / 12) / 0.25))
        cam_layer(b, md, gox + dx + nx - md.width / 2, gx_ + gyo + ny + 68 * (H / 1376) * 0.93 + dy, s, 0, 0, 1.0, AX, AY)
    if 0.12 <= tq < 1.40:                                                                       # "$5,000": written L->R at the ref speed (1370 px/s), from 0.12 s
        img = tl["img"].copy(); wx = tl["pad"] + (tq - 0.12 + 1 / 12) * 1370
        m = np.clip((wx - np.arange(img.width)) / 10, 0, 1).astype(np.float32)
        a = np.asarray(img.split()[-1], np.float32) * m[None, :]; img.putalpha(Image.fromarray(a.astype(np.uint8)))
        ink = tl["bot"] - tl["top"]; x0 = 545 - tl["w"] / 2 - tl["pad"]; y0 = 206 - ink / 2 - tl["top"] - tl["pad"]
        cam_layer(b, img, x0, y0, s, 0, 0, 1.45, AX, AY)                                         # parallax 1.45x: rises off the top in the push (ref y205 -> -60)
    if n < 3: b = b.filter(ImageFilter.GaussianBlur([18, 10, 4][n]))                           # deblur after the cut
    b = grunge(b, tq, 0.07)                                                                     # white wall: grunge kept light so the wall stays white
    if tq < 1.16: pill(b, "your club $5,000", 2 if tq < 0.4 else 3, 900)
    else: pill(b, "through fundraising.", 1 if tq < 1.6 else 2, 900)
    return b
def s03(t=0.66): return s34(t)
def s04(t=1.95): return s34(t)
meta("s03", t="2.80-3.96", line="…your club $5,000", ref="gold_4.60.jpg", refid="fav_82 · GOLD P04 4.0-5.88",
     motion="ONE continuous shot with S04 (like GOLD P04-P04b). LAYERS: WHITE wall (flat #EFEAE6→#E2DCD5, soft glow up-left, depth 0.4) | greyer wooden floor + white skirting board (own layer, depth 0.55) | girl + her soft wall shadow (1.0) | '$5,000' (1.45). Deblur 18/10/4 px in 3 steps; girl slides in -135 px (15 f ease-out). '$5,000' = ref JESSICA: #F5B814, ink ~100 px, centre y 206, written left→right at 1370 px/s from 0.12 s (partial letters each step), holds, then rises off the top with the accelerating push (camera x1.0→1.25 ease-in over 0.64 s).")
meta("s04", t="3.96-4.98", line="through fundraising.", ref="gold_6.40.jpg", refid="fav_83 · GOLD P04b-P05 5.72-7.28",
     motion="Same layers/camera as S03 (continuous). '$5,000' leaves the top at 1.34 s; cash fan pops behind her head at x1.28 for 2 steps then eases to 1.0 (rings, depth 0.8); medal pops high, drops 1 step and settles on her chest (ribbon on the neck); push decelerates to x1.32.")

def s05(t=0): b = th("5.4"); pill(b, "Sounds amazing, right?", 2, 1384); return b
meta("s05", t="4.98-6.06", line="Sounds amazing, right?", ref="gold_19.00.jpg", refid="GOLD P18 18.72-19.88 (TH)", motion="Real TH, blurred copy fading out over 0.26 s; no zoom.")

# S06  ARR doc + lens (v3 layout) on a glow maroon ground + halftone + grunge
def s06(t=0):
    b = halftone(glow_bg("#7d3e3e", "#4a2426", gx=0.45, gy=0.35, rx=0.8, ry=0.5, ga=0.12, dark=[("bottom", 0.3, 0.5)]), 0.09, 9, light=True, rfrac=0.25)
    doc = Image.open(I3 / "doc.png").convert("RGBA"); dochi = Image.open(I3 / "doc_hi.png").convert("RGBA"); mt = json.loads((I3 / "doc_meta.json").read_text())
    DX, DY, DS = 45, -60, 1.1
    doc = doc.resize((round(900 * DS), round(1200 * DS)), Image.LANCZOS); docb = doc.filter(ImageFilter.GaussianBlur(1.6))
    ds, so = shadow(docb, dy=14, blur=14, a=0.45); paste(b, ds, DX - so, DY - so)
    cl = mt["clause"]; ccx, ccy = (cl[0] + cl[2]) / 2, (cl[1] + cl[3]) / 2; LR = 200; lx, ly = DX + ccx * DS, DY + ccy * DS
    dochi = dochi.resize((round(1800 * DS), round(2400 * DS)), Image.LANCZOS)
    crop = dochi.crop((round(ccx * 2 * DS - LR), round(ccy * 2 * DS - LR), round(ccx * 2 * DS + LR), round(ccy * 2 * DS + LR)))
    m = Image.new("L", crop.size, 0); ImageDraw.Draw(m).ellipse([0, 0, crop.width - 1, crop.height - 1], fill=255)
    lens = Image.new("RGBA", crop.size, (0, 0, 0, 0)); lens.paste(crop, (0, 0), m)
    ish = Image.new("L", crop.size, 0); ImageDraw.Draw(ish).ellipse([0, 0, crop.width - 1, crop.height - 1], outline=110, width=26); ish = ImageChops.multiply(ish.filter(ImageFilter.GaussianBlur(14)), m)
    lens.paste(Image.new("RGBA", crop.size, (40, 25, 10, 255)), (0, 0), ish)
    mk = Image.new("RGBA", crop.size, (0, 0, 0, 0)); dm = ImageDraw.Draw(mk)
    pts = [(LR + 182 * math.cos(a) * (1 + .03 * math.sin(3 * a)), LR + 52 * math.sin(a) + a * 2) for a in [i / 60 * 2 * math.pi * 1.08 - 0.6 for i in range(61)]]
    dm.line(pts, fill=(216, 35, 42, 255), width=9, joint="curve"); lens.alpha_composite(mk); paste(b, lens, lx - LR, ly - LR)
    ring = Image.open(I3 / "magnifier_ring.png").convert("RGBA"); rj = json.loads((I3 / "magnifier_ring.json").read_text())
    rk = (LR + 4) / rj["r"]; ring = ring.resize((round(ring.width * rk), round(ring.height * rk)), Image.LANCZOS)
    rs, ro = shadow(ring, dx=10, dy=22, blur=14, a=0.4); paste(b, rs, lx - rj["cx"] * rk - ro, ly - rj["cy"] * rk - ro)
    rm = Image.open(I3 / "readerman.png").convert("RGBA"); rm = duo(rm, (42, 28, 18), (241, 228, 204), 1.1)
    rm = rm.crop((0, 0, rm.width, round(rm.height * 0.95))); rm, kk = scale(rm, 1000); rx, ry = (W - rm.width) / 2, H - rm.height + 20
    paste(b, rm, rx, ry); bar(b, F3["readerman"], kk, rx, ry)
    b = grunge(b, t, 0.30); pill(b, "is store credit.", 2, 1384); return b
meta("s06", t="6.06-9.65", line="But wait, read the fine print. That $5,000 is store credit.", ref="arr_18.4.jpg", refid="ARR P129 16.64-20.16 (report card)",
     motion="LAYERS: maroon flat bg + soft glow + light halftone | agreement (peels in) | lens | sepia reader | grunge. Lens glides to clause 7, red ring drawn 0.3 s.")

# S07  fav_91 / JAM P53-P55 : sky layer | ground layer | B&W BODY + COLOUR HEAD (separate, head moves on its own) | counter | jerseys
@lru_cache(None)
def _s07():
    src = Image.open(R / "flow/v3/sky_lot.jpg").convert("RGBA") if not (I3 / "sky_lot.jpg").exists() else L("sky_lot.jpg")
    k = 1.55; img = src.resize((round(src.width * k), round(src.height * k)), Image.LANCZOS)
    hz = round(1060 * k); gm = Image.new("L", img.size, 0); ImageDraw.Draw(gm).rectangle([0, hz, img.width, img.height], fill=255)
    ground = img.copy(); ground.putalpha(gm.filter(ImageFilter.GaussianBlur(3)))
    so0 = L("shopowner.png"); bb = so0.getbbox(); so = so0.crop(bb); kk = 700 / so.width; so = so.resize((700, round(so.height * kk)), Image.LANCZOS)
    a = so.split()[-1]; ncx0 = (F3["shopowner"][0]["cx"] - bb[0]) * kk
    cut = [420 + 42 * math.exp(-((x - ncx0) / 95) ** 2) for x in range(so.width)]      # seam on the T-shirt collar/shoulders: hair+neck stay whole
    neck = round(cut[round(ncx0)])
    hm = Image.new("L", so.size, 0); ImageDraw.Draw(hm).polygon([(0, 0), (so.width, 0)] + [(x, cut[x]) for x in range(so.width - 1, -1, -1)], fill=255)
    head = so.copy(); head.putalpha(ImageChops.multiply(a, hm.filter(ImageFilter.GaussianBlur(3))))
    bm = Image.new("L", so.size, 0); ImageDraw.Draw(bm).polygon([(x, cut[x] - 14) for x in range(so.width)] + [(so.width, so.height), (0, so.height)], fill=255)
    body = bw(so, 1.25); body.putalpha(ImageChops.multiply(a, bm.filter(ImageFilter.GaussianBlur(3)))); body = body.crop((0, 0, body.width, 1130 - 230))   # ends behind the counter
    fc = face_in("shopowner", bb)
    head_k = 1.06; head = head.resize((round(head.width * head_k), round(head.height * head_k)), Image.LANCZOS)
    bar(head, fc, kk * head_k, 0, 0)
    return img, ground, hz, body, head, neck, kk, head_k, (F3["shopowner"][0]["cx"] - bb[0]) * kk
def s07(t=1.0):
    img, ground, hz, body, head, neck, kk, hk, ncx = _s07(); tq = q(t)
    b = Image.new("RGBA", (W, H)); s = 1 + 0.02 * tq
    ox = (W - img.width) / 2; oy = H - img.height + 40
    cam_layer(b, img, ox, oy, s, 0, 0, 0.3); cam_layer(b, ground, ox, oy, s, 0, 0, 0.8)
    sx, sy = (W - body.width) / 2, 230
    cam_layer(b, body, sx, sy, s, 0, 0, 1.0)
    tilt = 3.5 * math.sin(tq * 2.3); hx = 10 * math.sin(tq * 1.7 + 1)                         # head: own tilt ±3.5°, ±10 px vs the body
    hr = head.rotate(tilt, center=(ncx * hk, neck * hk), resample=Image.BICUBIC)
    cam_layer(b, hr, sx + ncx - ncx * hk + hx, sy + neck - neck * hk - 6, s, 0, 0, 1.0)
    ct = L("counter.png"); ct = ct.crop(ct.getbbox()); ct = ct.resize((1060, 540), Image.LANCZOS); cty = 1070; cs, co = shadow(ct, dy=20, blur=18)
    cam_layer(b, cs, 10 - co, cty - co, s, 0, 0, 1.0)
    for i, n in enumerate(["j_blue.png", "j_orange.png", "jacket.png", "j_red.png", "jersey.png", "j_purple.png"]):
        p = Image.open(R / "assets/img" / n).convert("RGBA"); p = p.crop(p.getbbox()); p, _ = scale(p, h=165 if n != "jacket.png" else 190)
        cam_layer(b, p, 100 + i * 150 + (75 - p.width / 2) + 15, cty + 18 - p.height, s, 0, 0, 1.0)
    tl, _ = title([dict(t="STORE CREDIT", k="serif", s=92, col=(236, 196, 110), sh=False, wig=False, maxw=780), dict(t="ONLY", k="serif", s=92, col=(236, 196, 110), sh=False, wig=False)], cty + 200, gap=0.12)
    tl.putalpha(tl.split()[-1].point(lambda v: round(v * .82))); b.alpha_composite(tl)
    b = grunge(b, tq, 0.28); pill(b, "warm-ups and jerseys.", 2, 1500); return b
meta("s07", t="9.65-12.97", line="You can only spend it with them on warm-ups and jerseys.", ref="jam_13.84.jpg", refid="fav_91 · JAM P53-P55 9.68-14.4",
     motion="LAYERS: sky (30 % parallax) | ground strip (80 %) | owner BODY in B&W | owner HEAD+hair+neck in colour (seam on the T-shirt collar), 6 % bigger, separate: tilts ±3.5° and slides ±10 px on its own (ref: head x -24→-3 px while body +2→+14 px) | counter | jerseys hop on one per step | gold 'STORE CREDIT ONLY' on the planks | grunge. Owner rises from behind the counter; push +2 %/s.")

# S08  fav_92 / JAM P61 : blue flat bg + glow (no halftone in ref) | jars | thumbs-up arm that LEAVES the frame
def s08(t=0):
    b = glow_bg("#73a2d6", "#1c3d67", gx=0.5, gy=0.18, rx=0.9, ry=0.45, ga=0.14)
    tl, _ = title([dict(t="NEVER LEAVES", k="serif", s=120, col=YEL, sh=False, maxw=900)], 150); b.alpha_composite(tl)
    jars = []
    for n in ("jars_a.png", "jars_b.png"):
        j = L(n); a = j.split()[-1]; cols = [x for x in range(j.width) if max(a.crop((x, 0, x + 1, j.height)).getdata()) > 20]
        segs, st = [], cols[0]
        for p, q_ in zip(cols, cols[1:] + [10 ** 9]):
            if q_ - p > 6: segs.append((st, p)); st = q_
        for s0, s1 in segs[:3]: jj = j.crop((s0, 0, s1 + 1, j.height)); jars.append(jj.crop(jj.getbbox()))
    for i, jj in enumerate(jars[:6]):
        jj, _ = scale(jj, h=440); cx = 200 + (i % 3) * 340; cy = 340 + (i // 3) * 510
        js, jo = shadow(jj, dy=16, blur=12, a=0.35); paste(b, js, cx - jj.width / 2 - jo, cy - jo)
    tb = L("thumb.png"); tb = tb.crop(tb.getbbox()); tb, _ = scale(tb, 1040); paste(b, tb, 380, 640)    # arm end at x 1420: off-frame
    b = grunge(b, t, 0.26); pill(b, "never leaves their store.", 2, 1500); return b
meta("s08", t="12.97-15.14", line="That money never leaves their store.", ref="jam_22.0.jpg", refid="fav_92 · JAM P61 21.6-22.6",
     motion="LAYERS: flat blue bg (#73a2d6→#1c3d67) + soft top glow | yellow title | 6 jars (drop 2 steps + 16 px bounce) | thumbs-up arm | grunge. The arm slides in from the right (expo.out) and its cut end stays ~340 px OUTSIDE the right edge the whole time.")

# S09  TH + title behind the head
def th_title(tt, lines, top, line, done, seed):
    b = tht(tt); g = Image.new("RGBA", (W, 640), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
    for yy in range(640): gd.line([(0, yy), (W, yy)], fill=(8, 8, 10, round(250 * sss(1 - yy / 640) ** 0.8)))
    b.alpha_composite(g); tl, _ = title(lines, top, gap=0.09, seed=seed); b.alpha_composite(tl)
    paste(b, cot(tt), 0, 0); pill(b, line, done, 1384); return b
TH_TITLES = {"s09": ([dict(t="FUNDRAISING WITH", k="cond", s=110, shcol=(20, 26, 40), maxw=900), dict(t="STIMULUS", k="serif", s=240, shcol=(20, 26, 40), maxw=970)], 0.10, 1.95),
             "s21": ([dict(t="STORE CREDIT", k="cond", s=112, maxw=860), dict(t="MORE GEAR", k="serif", s=230, maxw=980)], 0.10, 2.15),
             "s23": ([dict(t="YOU'RE IN", k="cond", s=112, shcol=(20, 26, 40), maxw=860), dict(t="CONTROL", k="serif", s=240, shcol=(20, 26, 40), maxw=980)], 0.94, 4.10)}
def thgfx(sid, t):
    """final render: transparent layer = feathered top dim + title (typed, wiggle, shine, 3-step fade out); TH + cutout are video in HyperFrames"""
    lines, a, z = TH_TITLES[sid]; b = Image.new("RGBA", (W, H), (0, 0, 0, 0)); tq = q(t)
    g = Image.new("RGBA", (W, 820), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)                       # dim stays for the whole shot (no neon pop), title on top
    for yy in range(820): gd.line([(0, yy), (W, yy)], fill=(8, 8, 10, round(250 * sss(1 - yy / 820) ** 0.8)))
    b.alpha_composite(g)
    if not (a <= tq < z + 3 / 12): return b
    CTX.update(t=t - a, dur=z - a, t0=0.0); tl, _ = title(lines, 160, gap=0.09, seed=int(sid[1:]))
    if tq >= z: k = [0.9, 0.5, 0.0][min(2, math.floor((tq - z) * 12 + 1e-6))]; tl.putalpha(tl.split()[-1].point(lambda v: round(v * k)))
    b.alpha_composite(tl); return b
def s09(t=0): return th_title("16.2", [dict(t="FUNDRAISING WITH", k="cond", s=110, shcol=(20, 26, 40), maxw=900), dict(t="STIMULUS", k="serif", s=240, shcol=(20, 26, 40), maxw=970)], 160, "fundraising with stimulus works.", 2, 9)
meta("s09", t="15.14-17.33", line="Now here's how fundraising with stimulus works.", ref="gold_39.3.jpg", refid="GOLD P29 37.2-39.4 (WHAT'S NEXT?)",
     motion="TH; title behind the head, leading 0.09 x cap (was ~0.5), STIMULUS fills 970 px; letters drop 100 px ease-out in 5 f, wiggle; fade 90→50→0 % in 3 f. Top dim gradient feathered (smoothstep) so the neon sign doesn't fight the title.")

# S10  fav_95 / DK OVERESTIMATE : dark bg + glow | HUGE red circle (r 1275, top at y 300) | B&W cutout | halftone | top fade
def s10(t=0):
    b = glow_bg("#2a1f1f", "#4a3a37", gx=0.5, gy=0.45, rx=0.8, ry=0.5, ga=0.10)
    d = ImageDraw.Draw(b); R0 = 1275; d.ellipse([540 - R0, 300, 540 + R0, 300 + 2 * R0], fill=(200, 44, 30, 255))
    b = halftone(b, 0.10, 8, light=True, rfrac=0.25)
    b = fade(b, "top", 640, (10, 8, 8), 0.75)
    hb = L("headband.png"); hb = bw(hb, 1.25); hbb = hb.getbbox(); hb, kk = scale(hb, 1180); hx = (W - hb.width) / 2 + 20; hy = H + 40 - hbb[3] * kk
    paste(b, hb, hx, hy); bar(b, F3["headband"], kk, hx, hy)
    tl, _ = title([dict(t="COST LESS", k="cond", s=124, col=(250, 250, 250), sh=False, track=0.26)], 150); b.alpha_composite(tl)
    b = grunge(b, t, 0.24); pill(b, "cost less than big", 1, 1384); return b
meta("s10", t="17.33-19.73", line="Our custom jerseys cost less than big name brands,", ref="fav_95.png", refid="fav_95 · DK P90 (OVERESTIMATE, 12.6-14.0)",
     motion="LAYERS: dark maroon-brown flat bg + soft glow | red circle as its own layer: radius 1275 px (2x v3), top edge at y 300 just above his head, runs off both sides like the ref | light halftone | feathered dark fade from the top | B&W cutout | grunge. Circle pops 1 step, rises ~7 %/s; cutout rises 5 steps power3.out.")

# S11  fav_88 / GOLD P20 podium : stadium layer | title (behind arms) | girl BIG, legs cut by the bottom edge (never feet)
@lru_cache(None)
def _s11():
    bgi = cover(L("stadium_blur.jpg"), 1188, 2112)
    pd = L("podium.png"); bb = pd.getbbox(); pd = pd.crop(bb); kg = 1.80; pd = pd.resize((round(pd.width * kg), round(pd.height * kg)), Image.LANCZOS)
    bar(pd, face_in("podium", bb), kg, 0, 0)
    ey = (F3["podium"][0]["cy"] - bb[1]) * kg
    return bgi, pd, ey
def s11_zoom(tq):
    """girl zoom relative to the final framing: slow push, then the ref burst +3/+7/+6/+3/+5 % on 12 fps steps, then drift"""
    z = 1 / 1.287 * (1 + 0.03 * min(tq, 0.5))
    for i, st in enumerate((0.03, 0.07, 0.06, 0.03, 0.05)):
        if tq >= 0.5 + i / 12: z *= 1 + st
    return z * (1 + 0.01 * max(0, tq - 0.92))
def s11(t=2.6):
    tq = q(t); bgi, pd, ey = _s11(); b = Image.new("RGBA", (W, H))
    z = s11_zoom(tq); z0 = s11_zoom(0); AX, AY = 540, 1700
    put(b, bgi, -54, -96, 1 + (z / z0 - 1) * 0.45, AX, AY)                                   # bg x1.12 while girl x1.28 (ratio 0.45)
    tl, _ = title([dict(t="ADD AN", k="serif", s=270, maxw=680), dict(t="AMOUNT", k="serif", s=280, maxw=970)], 60, gap=0.15,
                  prog=typed(t, 0.95, 1.0), step=math.floor(tq * 12), seed=11)
    if tq >= 2.1: tl = shine(tl, -200 + (tq - 2.1) * SHINE_SPEED)
    b.alpha_composite(title_x(tl, tq, 0))
    gx, gy = (W - pd.width) / 2, 600 - ey + X(tq, 1)                                                       # final: eyes y 600, hands inside, feet ~y 2050 (off-frame)
    put(b, pd, gx, gy, z, AX, AY)
    b = grunge(b, tq, 0.24); pill(b, "add a fundraising amount", 2, 900); return b
meta("s11", t="19.73-22.65", line="and your club can add a fundraising amount to each jersey.", ref="gold_22.90.jpg", refid="fav_88 · GOLD P20 20.4-23.5 (podium)",
     motion="LAYERS: blurred stadium | title (between bg and girl; AMOUNT 970 px wide like MEDAL, the bouquet overlaps a letter like the ref) | girl cutout x1.80, eyes at y 600, hands inside the frame, knees/shins at the bottom edge, feet never visible | grunge. CAMERA anchored low (540,1700): push +3 %/s 0.5 s, then the ref burst +3/+7/+6/+3/+5 % on five 12 fps steps (x1.26), drift +1 %/s; stadium gets 45 % of the zoom (ref x1.12 vs x1.28). Title types after the burst (ref GOLD f550), one slow shine.")

# S12 / S12b  fav_84/85 family
def fam(t, sc, dy, t1, t1s, t2, t2s, words, done):
    b = cover(bw(L("track_bw.jpg")), s=1.0 + (sc - 1) * 0.3); b = halftone(b, 0.12, 9)
    fp = L("family_people.png"); fk = 1.18 * sc; fp = fp.resize((round(fp.width * fk), round(fp.height * fk)), Image.LANCZOS)
    fx, fy = (W - fp.width) / 2, 260 + dy; paste(b, fp, fx, fy); bar(b, F2["family.jpg"], fk, fx, fy, idx=(0, 1, 2))
    tl, _ = title([dict(t=t1, k="cond", s=t1s, maxw=760), dict(t=t2, k="serif", s=t2s, maxw=980)], 110, gap=0.09); b.alpha_composite(tl)
    b = grunge(b, t, 0.26); pill(b, words, done, 900); return b
def s12(t=0): return fam(t, 1.0, 0, "FAMILIES", 110, "SEE", 280, "Families see", 2)
def s12b(t=0): return fam(t, 1.08, 90, "THE REGULAR", 104, "PRICE", 290, "the regular price,", 3)
meta("s12", t="22.65-23.28", line="Families see", ref="gold_9.9.jpg", refid="fav_84 · GOLD P06 7.32-10.28",
     motion="LAYERS: B&W track (halftone) | colour family cutout | title | grunge. Defocus 36→0 px (5 f) + slide -85 px; bg moves 15-25 % of the family's parallax.")
meta("s12b", t="23.28-24.06", line="the regular price,", ref="gold_11.35.jpg", refid="fav_85 · GOLD P07-P09 10.32-11.6",
     motion="Punch-in +8 % / +90 px in 1 frame; PRICE bigger (fills 980 px), leading 0.09; exit zoom 1.0→1.5 with pan -315 px and blur.")

# S13  fav_98 / ARR Jane : NAVY flat sky + glow + halftone + feathered top fade | houses+lawn layer | woman layer (blue tint, dark head)
@lru_cache(None)
def _s13():
    sky = glow_bg("#0f1828", "#1e3452", gx=0.5, gy=0.40, rx=0.85, ry=0.40, ga=0.10, w=1188, h=2112)
    sky = halftone(sky, 0.09, 9, light=True, rfrac=0.25); sky = fade(sky, "top", 1000, (17, 27, 41), 0.85, 1.5)   # ref top = #111B29, never black
    hg = L("houses_ground.png"); k = 1.5; hg = hg.resize((round(hg.width * k), round(hg.height * k)), Image.LANCZOS)
    hg = ImageEnhance.Brightness(ImageEnhance.Color(hg).enhance(0.8)).enhance(0.72)
    nv = Image.new("RGBA", hg.size, (16, 30, 58, 0)); nv.putalpha(hg.split()[-1].point(lambda v: round(v * 0.22))); hg.alpha_composite(nv)
    wm = L("woman.png"); kk = 1.384; wm = wm.resize((round(wm.width * kk), round(wm.height * kk)), Image.LANCZOS)
    a = wm.split()[-1]; lum = ImageEnhance.Contrast(wm.convert("L")).enhance(1.05)
    tint = ImageOps.colorize(lum, (8, 13, 26), (176, 192, 218)).convert("RGBA")                       # blue tint
    wm = Image.blend(wm.convert("RGBA"), tint, 0.62); wm = ImageEnhance.Brightness(wm).enhance(0.66); wm.putalpha(a)
    f0 = F3["woman"][0]; ey = f0["cy"] * kk; es = f0["eye_span"] * kk
    sh = np.zeros((wm.height,), np.float32); yy = np.arange(wm.height, dtype=np.float32)
    sh = np.where(yy < ey, 0.93 - 0.30 * ss((yy - (ey - 3 * es)) / (3 * es)), 0.63 * ss(1 - (yy - ey) / (2.6 * es)))   # strong shade on hair/head, feathered to the chin
    shm = Image.fromarray((np.repeat(sh[:, None], wm.width, 1) * 255).astype(np.uint8))
    blk = Image.new("RGBA", wm.size, (2, 4, 10, 255)); blk.putalpha(ImageChops.multiply(shm, a)); wm.alpha_composite(blk)
    bar(wm, F3["woman"], kk, 0, 0, style="white")
    return sky, hg, k, wm, ey
def s13(t=1.6):
    tq = q(t); sky, hg, k, wm, ey = _s13(); b = Image.new("RGBA", (W, H))
    n = math.floor(tq * 12 + 1e-6); off = 620 * 0.62 ** n if n < 12 else 0                   # woman rises from below, decay 0.62 / step
    ws = 0.80 + 0.20 * (1 - off / 620); hoff = 180 * off / 620                                  # houses rise 180 px with her (ref manor -180 px)
    s = 1 + 0.015 * max(0, tq - 1.0)
    cam_layer(b, sky, -54, -96, s, 0, 0, 0.2)
    cam_layer(b, hg, (W - hg.width) / 2, 640 - 398 * k + hoff, s, 0, 0, 0.6)
    c1 = typed(t, 0.08, 2.5); k1 = math.ceil(16 / 2.5); pr = min(16, c1) + max(0, (n - math.floor(0.08 * 12) - k1))   # cond 2.5 chars/step, then PRIVATE 1/step
    tl, _ = title([dict(t="THE MARKUP STAYS", k="cond", s=80, col=(239, 222, 170), sh=False, maxw=760),
                   dict(t="PRIVATE", k="serif", s=240, maxw=970, gap=0.12)], 100, prog=pr, step=n, seed=13)
    td = (math.floor(0.08 * 12) + k1 + 7 + 1) / 12
    if tq >= td: tl = shine(tl, -200 + (tq - td) * SHINE_SPEED)
    b.alpha_composite(tl)
    wx, wy = (W - wm.width) / 2, 650 - ey
    cam_layer(b, wm, wx, wy + off, s * ws, 0, 0, 1.0, ay=1920)
    b = grunge(b, tq, 0.22); pill(b, "markup stays private.", 3 if t > 1.2 else 2, 1384); return b
meta("s13", t="24.06-26.70", line="while the fundraising markup stays private.", ref="arr_34.96.jpg", refid="fav_98/99 · ARR P144 33.92-36.0 (Jane)",
     motion="THREE LAYERS: (1) flat NAVY sky #0f1828→#1e3452 (ref #111b2a/#142234, not light blue) + soft centre glow + light halftone 11 px + black fade from the top with a 1000 px smoothstep feather; (2) houses+lawn cutout, dimmed and cooled; (3) woman, blue-tinted, strong black shade over hair/head feathered down to the chin, white brush bar. MOTION (measured on ARR): woman rises from +620 px with decay 0.62/step and grows 0.8→1.0; houses rise 180 px at the same time (parallax 0.3); then push +1.5 %/s with depths sky 0.2 / houses 0.6 / woman 1.0. Both lines TYPED with the per-letter wiggle (cond 2.5 chars/step, then PRIVATE 1/step behind her head), then one shine.")

# S14  fav_87 torn strip + ball
def s14(t=0):
    b = glow_bg("#26466a", "#132a42", gx=0.5, gy=0.55, rx=0.8, ry=0.45, ga=0.10)
    b = halftone(b, 0.09, 9, light=True, rfrac=0.25)
    st_ = cover(Image.open(I3 / "strip_start.jpg").convert("RGBA"), W, 780, fy=0.6); st_ = halftone(st_, 0.12, 9)
    strip = Image.new("RGBA", (W, H), (0, 0, 0, 0)); strip.paste(st_, (0, 0)); strip = torn_edge(strip, 740, below=False); b.alpha_composite(strip)
    tl, _ = title([dict(t="STRAIGHT INTO", k="cond", s=112, shcol=(16, 26, 44), maxw=820), dict(t="YOUR CLUB", k="serif", s=250, shcol=(16, 26, 44), maxw=980)], 100, gap=0.09); b.alpha_composite(tl)
    bl = Image.open(I3 / "ball3d/f_000.png").convert("RGBA"); bl, _ = scale(bl, 855); bs, bo = shadow(bl, dy=20, blur=20, a=0.5); paste(b, bs, 112 - bo, 580 - bo)
    b = grunge(b, t, 0.26); pill(b, "directly into your club", 2, 900); return b
meta("s14", t="26.70-28.85", line="That extra money goes directly into your club", ref="gold_17.95.jpg", refid="fav_87 · GOLD P12-P15 14.6-18.12 (globe)",
     motion="LAYERS: navy flat bg + glow + light halftone | torn strip with kids photos | title on the strip (YOUR CLUB now 980 px wide, leading 0.09) | 3D ball | grunge. Ball drops 504 px in 2 f, spins 22.5°/s; strip slides down +255/+225/+210 px per step.")

# S15  fav_97 NEVER THE CASE
def s15(t=0):
    b = halftone(glow_bg("#a2463f", "#5a2522", gx=0.5, gy=0.35, rx=0.8, ry=0.45, ga=0.12), 0.10, 9, light=True, rfrac=0.25)
    tl, _ = title([dict(t="NOT STORE CREDIT", k="cond", s=104, col=CREAM, sh=False, maxw=820), dict(t="CASH", k="serif", s=290, col=CREAM, shcol=(60, 20, 18), maxw=900)], 170, gap=0.09); b.alpha_composite(tl)
    cm = L("cashman.png"); cm = duo(cm, (42, 28, 18), (241, 228, 204), 1.1); cm, kk = scale(cm, 1300)   # bigger, head right under the title
    cx_, cy_ = (W - cm.width) / 2, 480 - 89 * kk; paste(b, cm, cx_, cy_); bar(b, F3["cashman"], kk, cx_, cy_)
    b = grunge(b, t, 0.28); pill(b, "in cash, not store credit.", 2, 1384); return b
meta("s15", t="28.85-30.92", line="in cash, not store credit.", ref="arr_21.15.jpg", refid="fav_97 · ARR P130 20.16-21.28 (NEVER THE CASE)",
     motion="LAYERS: red flat bg + soft glow + light halftone | title (lower, top y 170) | sepia cutout x1.45, head right under the title | grunge. Slow push; letter-wipe title; navy torn strip exit in 4 f.")

# S16  fav_86 / GOLD P10 : sky layer (halftone) | field layer | runner | seats+spectators FOREGROUND (own layer, 1.5x parallax)
@lru_cache(None)
def _s16():
    src = L("pitch_sky.jpg"); k = 1.617; img = src.resize((round(src.width * k), round(src.height * k)), Image.LANCZOS)
    sky = halftone(img, 0.14, 9)
    hz = round(680 * k); gm = Image.new("L", img.size, 0); ImageDraw.Draw(gm).rectangle([0, hz, img.width, img.height], fill=255)
    field = img.copy(); field.putalpha(gm.filter(ImageFilter.GaussianBlur(4))); field = halftone(field, 0.10, 9)
    rk = L("runner_kid.png"); rk = rk.crop(rk.getbbox()); rk, _ = scale(rk, h=360)
    fg = L("seats_fg.png"); kf = 1.69; fg = fg.resize((round(fg.width * kf), round(fg.height * kf)), Image.LANCZOS)
    fa = fg.split()[-1]; fg = fg.filter(ImageFilter.GaussianBlur(5)); fg.putalpha(fa.filter(ImageFilter.GaussianBlur(4))); fg = halftone(fg, 0.06, 9, light=True, rfrac=0.25)
    return sky, field, hz, rk, fg, kf
def s16(t=2.4):
    tq = q(t); sky, field, hz, rk, fg, kf = _s16(); b = Image.new("RGBA", (W, H))
    e = eo3(tq / 0.42); s = (1.3 - 0.3 * e) * (1 - 0.024 * max(0, tq - 0.42)); dx = 186 * (1 - e)          # settle x1.3→1.0 + pan -186 px, then pull-out -2.4 %/s
    oy = 770 - hz
    cam_layer(b, sky, (W - sky.width) / 2, oy, s, dx, 0, 0.3)
    cam_layer(b, field, (W - field.width) / 2, oy, s, dx, 0, 0.6)
    cam_layer(b, rk, 470 + 7 * tq / 2.5, 545 + X(tq, 1), s, dx, 0, 0.65)
    fx, fy = (W - fg.width) / 2 + 20 * eio(tq / 2.8), 1090 - 707 * kf + 25 * eio(tq / 2.8) + X(tq, 0) * 0.7
    cam_layer(b, fg, fx, fy, s, dx, 0, 1.5)
    n = math.floor(tq * 12 + 1e-6)
    if n < 4: b = b.filter(ImageFilter.GaussianBlur([12, 8, 4, 1.5][n]))                    # blur clears in 4 steps
    tl, _ = title([dict(t="FIELD", k="cond", s=120, col=(250, 250, 250), shcol=(42, 74, 122), maxw=700),
                   dict(t="RENTALS", k="serif", s=250, col=(250, 250, 250), shcol=(42, 74, 122), maxw=980)], 110, gap=0.15,
                  prog=typed(t, 0.30, 2.0), step=n, seed=16)
    if tq >= 0.30 + 7 / 12: tl = shine(tl, -200 + (tq - 0.30 - 7 / 12) * SHINE_SPEED)
    b.alpha_composite(title_x(tl, tq, 0)); b = grunge(b, tq, 0.22); pill(b, "field rentals,", 2 if t > 1.2 else 1, 900); return b
meta("s16", t="30.92-32.42", line="Use it for field rentals,", ref="gold_14.1.jpg", refid="fav_86 · GOLD P10 11.6-14.4 (stadium seats)",
     motion="FOUR LAYERS: sky (dark halftone, depth 0.3) | field (depth 0.6) | runner (0.65, drifts +7 px) | seats + two spectators cut out as one foreground (depth 1.5 = 1.5x the bg like the ref, out of focus, drifts +20/+25 px). CAMERA: enters x1.3 with pan +186 px and blur 12/8/4/1.5 px, settles to x1.0 in 5 steps (ease-out), then pull-out -2.4 %/s. White title with navy shadow typed 2 chars/step from 0.30 s (fits the 1.5 s shot), then one shine.")

# S17  fav_93 teal portrait : COACHES bigger, both lines with shadow
def s17(t=0):
    c = Image.open(I2 / "coach.jpg").convert("RGBA"); f0 = F2["coach.jpg"][0]
    kk = 2.35; c = c.resize((round(c.width * kk), round(c.height * kk)), Image.LANCZOS); cx_, cy_ = 540 - f0["cx"] * kk, 930 - f0["cy"] * kk
    cd = duo(c, (19, 39, 42), (207, 226, 220)); top_ = cd.crop((0, 0, cd.width, 30)).resize((1, 1), Image.BOX).getpixel((0, 0))
    b = glow_bg(top_[:3], top_[:3], gx=0.5, gy=0.2, rx=0.8, ry=0.3, ga=0.08); paste(b, cd, cx_, cy_)
    b = fade(b, "top", 820, (14, 30, 34), 0.78); b = halftone(b, 0.17, 8)
    bar(b, F2["coach.jpg"], kk, cx_, cy_)
    tl, _ = title([dict(t="Coaches", k="serif", s=240, col=CREAM, wght=600, shcol=(12, 26, 30), track=0.0, maxw=900),
                   dict(t="for every team", k="ital", s=104, col=CREAM, wght=400, shcol=(12, 26, 30), track=0.0, maxw=760, gap=0.16)], 100, gap=0.12)
    b.alpha_composite(tl); b = grunge(b, t, 0.22); pill(b, "coaches,", 1, 1384); return b
meta("s17", t="32.42-33.47", line="coaches,", ref="fav_93.png", refid="fav_93 · DK P88 8.36 (Justin Kruger in 1999)",
     motion="LAYERS: teal flat bg + glow | teal duotone portrait | feathered top fade | coarse halftone (17 px, like the ref) | title | grunge. Rack-focus 20 px→sharp in 3 f, push +4 %. 'Coaches' 240 px (was 150) and 'for every team' now with the same short dark shadow.")

# S18  fav_100 technique (silhouette + rim glow + hand text) with HOPEFUL colours for "financial assistance for families"
def houses_sil(w, base, seed=7, col=(22, 30, 58, 255), win=(255, 206, 110, 255)):
    lay = Image.new("RGBA", (w, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay); r = random.Random(seed); x = -30
    while x < w + 40:
        hw = r.randint(96, 150); hh = r.randint(58, 96); roof = r.randint(38, 66); gy = base + r.randint(-6, 8)
        d.rectangle([x, gy - hh, x + hw, H], fill=col); d.polygon([(x - 8, gy - hh), (x + hw / 2, gy - hh - roof), (x + hw + 8, gy - hh)], fill=col)
        if r.random() < 0.6: cx = x + hw * r.uniform(0.62, 0.78); d.rectangle([cx, gy - hh - roof * 0.75, cx + 14, gy - hh - roof * 0.25], fill=col)
        for wy in (gy - hh + 16, gy - hh + 50):                     # warm lit windows: families at home
            for wx in (x + hw * 0.2, x + hw * 0.62):
                if wy + 18 < gy and r.random() < 0.7: d.rectangle([wx, wy, wx + 16, wy + 18], fill=win)
        if r.random() < 0.4:
            tx = x + hw + r.randint(4, 20); tr = r.randint(24, 40); d.rectangle([tx - 4, gy - tr, tx + 4, H], fill=col); d.ellipse([tx - tr, gy - tr * 2.6, tx + tr, gy - tr * 0.6], fill=col)
        x += hw + r.randint(10, 40)
    return lay
def s18(t=0):
    b = glow_bg(None, stops=[(0, "#f0a24c"), (0.18, "#f7c26a"), (0.30, "#fde3a0"), (0.36, "#fbe7b4"), (1, "#fbe7b4")], gx=0.5, gy=0.27, rx=0.55, ry=0.16, ga=0.55, gcol=(255, 250, 235))
    b = halftone(b, 0.10, 9)
    b.alpha_composite(houses_sil(W, 660))
    lw = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(lw).rectangle([0, 668, W, H], fill=(22, 30, 58, 255)); b.alpha_composite(lw)
    b = fade(b, "bottom", 900, (10, 14, 30), 0.75)
    mo = L("mother.png"); mo = mo.crop(mo.getbbox()); mo, _ = scale(mo, h=1700)
    a = mo.split()[-1]; glow = Image.new("RGBA", mo.size, (255, 206, 110, 0)); glow.putalpha(a.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(16)))
    sil = Image.new("RGBA", mo.size, (14, 20, 40, 255)); sil.putalpha(a)
    mx, my = (W - mo.width) / 2, H - mo.height + 40; paste(b, glow, mx, my); paste(b, sil, mx, my)
    tl, _ = title([dict(t="help for", k="hand", s=140, col=(255, 250, 240), sh=False, track=0.10), dict(t="FAMILIES", k="hand", s=250, col=(255, 250, 240), sh=False, track=0.02, maxw=1000, gap=0.05)], 880)
    b.alpha_composite(tl); b = grunge(b, t, 0.22); pill(b, "assistance for families,", 2, 1384); return b
meta("s18", t="33.47-35.14", line="financial assistance for families,", ref="fav_100.png", refid="fav_100 · ARR P146 37.92 (composition + technique only)",
     motion="SAME composition/technique as the ref, NEW colours for a supportive line: warm sunrise sky (gold→cream, big soft sun-glow behind the heads, fine halftone) | navy row-of-houses silhouette with warm lit windows (a neighbourhood of families instead of the manor) | navy ground fading darker with a long feather | mother+child silhouette in navy with a golden rim glow | white hand-drawn words that boil (re-drawn every step) | grunge. Slow push.")

# S19  fav_94 FITNESS : navy bg, soft glow LEFT, darker to the right, light halftone, NEEDS bigger, grunge
def s19(t=0):
    b = glow_bg("#3d4660", "#1c2535", gx=0.28, gy=0.32, rx=0.70, ry=0.42, ga=0.16, dark=[("right", 0.38, 0.30)])
    b = halftone(b, 0.10, 8, light=True, rfrac=0.25)
    tl, _ = title([dict(t="whatever your club", k="serif", s=80, col=CREAM, wght=500, sh=False, track=0.0, maxw=760),
                   dict(t="NEEDS", k="serif", s=330, col=CREAM, shcol=(12, 18, 30), maxw=990, gap=0.07)], 96, gap=0.07)
    b.alpha_composite(tl)
    gc_ = L("gearcoach.png"); gc_ = bw(gc_, 1.2); gc_, kk = scale(gc_, 1000); gx, gy = (W - gc_.width) / 2, H - gc_.height + 160
    paste(b, gc_, gx, gy); bar(b, F3["gearcoach"], kk, gx, gy)
    b = grunge(b, t, 0.28); pill(b, "whatever your club needs.", 3, 1384); return b
meta("s19", t="35.14-35.80", line="or whatever your club needs.", ref="fav_94.png", refid="fav_94 · DK P102 28.8 (FITNESS)",
     motion="Kept as approved, plus: navy flat bg with a soft white glow up-left (feathered) darkening to the right like the ref; light halftone 15 px; NEEDS ~330 px (fills ~990 px); grunge 28 %. Cutout rises 5 steps power3.out; push +4 %.")

def s20(t=0):
    b = ImageEnhance.Brightness(s19().convert("RGB")).enhance(0.86).convert("RGBA")
    paste(b, host_co("36.0"), 0, 300); pill(b, "whatever your club needs.", 4, 1384); return b
meta("s20", t="35.80-36.24", line="(…needs.)", ref="gold_35.90.jpg", refid="GOLD P27 35.76-36.2 (host rises over the crowd)",
     motion="Collage freezes and dims 14 %; host cutout rises (decay x0.7/step, no overshoot); dissolves into the real TH in 6 f.")
def s21(t=0): return th_title("37.5", [dict(t="STORE CREDIT", k="cond", s=112, maxw=860), dict(t="MORE GEAR", k="serif", s=230, maxw=980)], 160, "buys more gear.", 2, 21)
meta("s21", t="36.24-38.62", line="Store credit buys more gear.", ref="gold_46.2.jpg", refid="GOLD P30 44.68-46.44 (title on TH)",
     motion="TH; title behind the head (leading 0.09, MORE GEAR 980 px), typed on the 12 fps grid with wiggle; ding on the last letter; 6-frame fade.")

# S22  fav_90 JAM JAR : purple bg + top glow | CASH (behind) | BIG trophy, lower | FREEDOM + TO INVEST in front | soft dark fade at the bottom
@lru_cache(None)
def _s22():
    bg = glow_bg("#7479d6", "#1d2068", gx=0.5, gy=0.12, rx=0.9, ry=0.45, ga=0.10, w=1188, h=2112)
    tr = L("trophy.png"); tr = tr.crop(tr.getbbox()); tr, _ = scale(tr, h=1260); ts, to = shadow(tr, dy=26, blur=20, a=0.45)
    cash, _ = title([dict(t="CASH", k="serif", s=340, col=YEL, sh=False, maxw=900)], 190, prog=99)
    fr = dict(t="FREEDOM", k="serif", s=250, col=YEL, shcol=(28, 22, 92), maxw=990)
    _, bx = title([fr], 1050, prog=99); fw = bx[0][2] - bx[0][0]
    return bg, ts, to, tr.width, cash, fr, fw
def s22(t=2.0):
    tq = q(t); n = math.floor(tq * 12 + 1e-6); bg, ts, to, trw, cash, fr, fw = _s22()
    s = 1 + 0.015 * tq; b = Image.new("RGBA", (W, H)); cam_layer(b, bg, -54, -96, s, 0, 0, 0.3)
    oc = [260, 110, 30][n] if n < 3 else 0                                                      # CASH rides up with the torn paper (ref JAM 7.44-7.6)
    cam_layer(b, cash, 0, oc - X(tq, 0), s, 0, 0, 1.0)
    if n >= 6:                                                                                  # trophy drops from above in 2 steps, lands, 16 px bounce (ref jar 7.92-8.08)
        oy = {6: -1150, 7: -430, 8: 16}.get(n, 0)
        cam_layer(b, ts, (W - trw) / 2 - to, 340 - to + oy + X(tq, 1), s, 0, 0, 1.0)
    if n >= 4:                                                                                  # FREEDOM appears low, slides up as the trophy lands (ref JAR)
        of = 190 if n < 7 else 60 if n == 7 else 0
        inv = dict(t="TO INVEST", k="cond", s=220, col=YEL, shcol=(28, 22, 92), track=0.3, maxw=fw, fit=fw, gap=0.14)
        tl2, _ = title([fr, inv], 1050, prog=7 if n < 10 else 7 + typed(t, 10 / 12, 2.5), step=n, seed=22)
        if n >= 10 + 4: tl2 = shine(tl2, -200 + (tq - 14 / 12) * SHINE_SPEED)
        cam_layer(b, tl2, 0, of + X(tq, 1), s, 0, 0, 1.0)
    b = fade(b, "bottom", 760, (8, 8, 30), 0.42, 1.8)
    b = grunge(b, tq, 0.24); pill(b, "the freedom to invest", 2, 1500); return b
meta("s22", t="38.62-41.90", line="Cash gives your club the freedom to invest in what matters most.", ref="fav_90.png", refid="fav_90 · JAM P50-P51 7.34-9.4 (JAM JAR)",
     motion="LAYERS: purple flat bg + soft top glow | CASH (lower, y 190, its bottom tucked BEHIND the trophy's money like JAM behind the lid) | trophy 1260 px, lower (top y 340) | FREEDOM + TO INVEST in front of the stem; TO INVEST justified to EXACTLY FREEDOM's width and margins | soft bottom fade | grunge. MOTION (ref JAM 7.44-8.6): CASH rides up with the torn paper (+260/+110/+30/0 px); FREEDOM appears 190 px low at 0.33 s; trophy drops from above in 2 steps at 0.5 s, lands with a 16 px bounce while FREEDOM slides up; TO INVEST types 2.5 chars/step from 0.83 s; push +1.5 %/s.")
def s23(t=0): return th_title("43.5", [dict(t="YOU'RE IN", k="cond", s=112, shcol=(20, 26, 40), maxw=860), dict(t="CONTROL", k="serif", s=240, shcol=(20, 26, 40), maxw=980)], 160, "you control your", 2, 23)
meta("s23", t="41.90-46.72", line="With stimulus, you control your fundraising amount. Change it or turn it off at any time.", ref="gold_39.3.jpg", refid="GOLD P29 (WHAT'S NEXT? on TH)",
     motion="TH with jump cuts at 42.84 / 44.76; title letters drop 100 px behind the head (5 f ease-out), leading 0.09; fade 3 f.")

# S24  fav_89 climber : red flat bg + centre glow | title (BEHIND the man) | rock layer | climber on the cliff, rope continues off-frame
@lru_cache(None)
def _s24():
    bg = glow_bg("#6c2224", "#a44c4e", gx=0.48, gy=0.50, rx=0.80, ry=0.45, ga=0.13)
    cl = L("climber2.png"); a = np.asarray(cl.split()[-1]).copy()
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    a[(yy < 326) & (np.abs(xx - (727 - 0.35 * yy)) < 10)] = 0                                    # remove the rope above his hand (re-drawn to an anchor)
    cl.putalpha(Image.fromarray(a)); cl = bw(cl, 1.12)
    bar(cl, [dict(cx=380, cy=183, bar_w=74, bar_h=20, angle=-4)], 1.0, 0, 0)                  # profile: MediaPipe misses it, bar placed by hand
    k = 0.80; cl = cl.resize((round(cl.width * k), round(cl.height * k)), Image.LANCZOS)
    ox, oy = 720 - 765 * k, 1230 - 980 * k                                                       # boot tip on the cliff at (720, 1230)
    P = lambda x, y: (ox + x * k, oy + y * k)
    boot, hand_top, grip, rope_bot = P(765, 980), P(590, 92), P(620, 332), P(516, 1199)
    peak = (hand_top[0] + 18, hand_top[1] + 14)
    EX = 700                                                                                     # rock + rope run 700 px past the right/bottom edges:
    edge = [(250 - 260, H + EX), (boot[0] - 30, boot[1] + 160), (boot[0] + 2, boot[1] + 6), (peak[0] + 4, peak[1] + 40), peak,   # nothing detaches
            (peak[0] + 70, peak[1] + 22), (820, peak[1] + 80), (1000, peak[1] + 150), (1130, peak[1] + 190), (W + EX, peak[1] + 420)]   # during the pull-out
    rr = random.Random(4); jag = []
    for (x0, y0), (x1, y1) in zip(edge, edge[1:]):
        nseg = max(2, int(math.hypot(x1 - x0, y1 - y0) / 34))
        for i in range(nseg): u = i / nseg; jag.append((x0 + (x1 - x0) * u + rr.uniform(-7, 7), y0 + (y1 - y0) * u + rr.uniform(-7, 7)))
    jag.append(edge[-1])
    CW, CH = W + EX, H + EX
    tex = cover(ImageEnhance.Brightness(bw(Image.open(R / "flow/v3/rock.jpg").convert("RGBA").crop((300, 500, 768, 1376)), 0.9)).enhance(1.25), CW, CH)   # rock-only area (the photo has white sky top-left)
    rm = Image.new("L", (CW, CH), 0); ImageDraw.Draw(rm).polygon(jag + [(CW, CH), (0, CH)], fill=255)
    rock = Image.new("RGBA", (CW, CH), (0, 0, 0, 0)); rock.paste(tex, (0, 0), rm.filter(ImageFilter.GaussianBlur(1.2))); rock = halftone(rock, 0.05, 9)
    rs, ro = shadow(rock, dx=-14, dy=10, blur=16, a=0.45)
    rope = Image.new("RGBA", (CW, CH), (0, 0, 0, 0)); d = ImageDraw.Draw(rope)
    anchor = (peak[0] + 46, peak[1] + 34)
    def ropeline(pts, wdt=9):
        d.line([(x + 3, y + 4) for x, y in pts], fill=(30, 20, 20, 110), width=wdt + 2, joint="curve")
        d.line(pts, fill=(196, 194, 188, 255), width=wdt, joint="curve")
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            L_ = math.hypot(x1 - x0, y1 - y0); nx, ny = (x1 - x0) / max(L_, 1), (y1 - y0) / max(L_, 1)
            for j in range(int(L_ / 9)):
                cx, cy = x0 + nx * j * 9, y0 + ny * j * 9
                d.line([(cx - ny * 4 - nx * 3, cy + nx * 4 - ny * 3), (cx + ny * 4 + nx * 3, cy - nx * 4 + ny * 3)], fill=(120, 118, 112, 255), width=2)
    ropeline([grip, ((grip[0] + anchor[0]) / 2 + 6, (grip[1] + anchor[1]) / 2), anchor])
    d.ellipse([anchor[0] - 9, anchor[1] - 9, anchor[0] + 9, anchor[1] + 9], fill=(70, 70, 74, 255))   # piton
    ropeline([rope_bot, (rope_bot[0] - 20, rope_bot[1] + 200), (rope_bot[0] - 70, rope_bot[1] + 420), (rope_bot[0] - 130, H + EX - 20)])  # hangs far below the edge
    grp = Image.new("RGBA", (CW + 80, CH + 80), (0, 0, 0, 0)); grp.alpha_composite(rs, (0, 0))
    grp.alpha_composite(cl, (round(ox + ro), round(oy + ro))); grp.alpha_composite(rope, (ro, ro))
    return bg, grp, ro
def s24(t=1.9):
    tq = q(t); bg, grp, ro = _s24(); b = bg.copy()
    po = 1 - 0.07 * min(1, tq / 2.0); AX, AY = 540, 1100                                         # collage pull-out to x0.93, bg static
    lines = [dict(t="WHAT COULD", k="serif", s=200, maxw=930, x=75), dict(t="YOUR CLUB", k="serif", s=200, maxw=930, x=75), dict(t="RAISE?", k="serif", s=300, maxw=930, x=75)]
    tl, _ = title(lines, 120, gap=0.12, align="left", prog=typed(t, 0.4, 2.6), step=math.floor(tq * 12), seed=24)
    if tq >= 0.4 + 11 / 12: tl = shine(tl, -200 + (tq - 0.4 - 11 / 12) * SHINE_SPEED)
    LK = 2.33                                                                                   # P34 (ref 49.13): climber sinks, title flies up, LINK IN BIO types
    ex = min(2, math.floor((tq - LK) * 12 + 1e-6)) if tq >= LK else -1
    ty = [-80, -420, -1500][ex] if ex >= 0 else 0
    put(b, tl, 0, ty, po, AX, AY)
    off = 330 if tq < 0.12 else 135 if tq < 0.2 else 60 if tq < 0.32 else 15 if tq < 0.4 else 0       # ref 330→135→60→15→0, rock+man+rope enter TOGETHER
    gy = [60, 360, 1500][ex] if ex >= 0 else 0
    if ex < 2: put(b, grp, -ro + off, -ro + gy, po, AX, AY)
    if tq >= 2.41:
        lk, _ = title([dict(t="LINK IN BIO", k="serif", s=230, maxw=960)], 760, prog=typed(t, 2.41, 2.0), step=math.floor(tq * 12), seed=25)
        if tq >= 2.41 + 7 / 12: lk = shine(lk, -200 + (tq - 2.41 - 7 / 12) * SHINE_SPEED)
        b.alpha_composite(lk)
    b = grunge(b, tq, 0.24); pill(b, "what your club could raise?", 4, 1384); return b
meta("s24", t="46.72-50.30", line="Want to see what your club could raise? Link in bio.", ref="gold_49.3.jpg", refid="fav_89 · GOLD P32-P34 47.56-51.04 (climber)",
     motion="LAYERS: red flat bg + soft centre glow (static) | title, 3 lines fitted to 930 px, leading 0.12, BEHIND the man | ONE group = rock cliff + climber + rope, the rock and the rope run 700 px past the right and bottom edges so nothing ever detaches from the frame | grunge. The group pops in from +330 px (330→135→60→15→0, man glued to the rock); title typed 2.6 chars/step; collage pull-out to x0.93 about (540,1100), bg static. 2.33 s (ref P34 49.13): group sinks ease-in (+60/+360/out), title flies up, LINK IN BIO types 2 chars/step + shine.")


# =====================================================================================================================
# FINAL ROUND (user, after v3c-final): NO hard cut between graphics shots. Every layer enters on its own (from below,
# staggered, exponential ease-out like S13's woman: decay ~0.6/step) and leaves on its own in the last steps
# (ease-in 60 / 360 / 1500 px, title up, subjects down, staggered). These definitions override the static ones above.
def E(tq, delay=0.0, dist=620, decay=0.6):
    """entrance offset (px) on the 12 fps grid; None = layer not on screen yet"""
    n = math.floor((tq - delay) * 12 + 1e-6)
    if n < 0: return None
    return dist * decay ** n if n < 16 else 0.0
def POP(tq, delay):
    """prop pop: scale 0.55 -> 1.12 -> 0.97 -> 1.0 (back.out on 12 fps steps); None = not yet"""
    n = math.floor((tq - delay) * 12 + 1e-6)
    return None if n < 0 else [0.55, 1.12, 0.97, 1.0][min(n, 3)]
def X(tq, order=0):
    """exit offset (px, ease-in) in the last steps of the shot; 0 while holding. Only in the final render."""
    if not FINAL or CTX.get("noexit"): return 0
    dur = CTX["dur"]; w = min(0.34, 0.3 * dur); t0 = dur - w + order / 12
    if tq < t0 - 1e-6: return 0
    return [100, 560, 1600, 2600][min(3, math.floor((tq - t0) * 12 + 1e-6))]
def pastek(base, im, x, y, k=1.0):
    if abs(k - 1) > 1e-3:
        w, h = im.size; im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.BICUBIC); x -= (im.width - w) / 2; y -= (im.height - h) / 2
    paste(base, im, x, y)
def title_x(tl, tq, order=0):
    """titles leave UP first (ref JESSICA / climber title)"""
    off = X(tq, order)
    if off: tl = tl.transform(tl.size, Image.AFFINE, (1, 0, 0, 0, 1, off), resample=Image.BICUBIC)
    return tl

# S01 exit -> S02 entry: ref GOLD P02/P03 "bg and title slide left, bench scene enters from right, host fixed" (short: fast speech)
_s01_prev = s01
def s01(t=1.0):
    if not FINAL: return _s01_prev(t)
    tq = q(t); bg, man = _s01(); b = Image.new("RGBA", (W, H))
    u = eio(tq / 1.9); s = 1 + 0.067 * u; dy = -60 * u; dx = 16 * math.sin(tq * 1.7)
    kx = math.floor((tq - (CTX["dur"] - 5 / 12)) * 12 + 1e-6) if FINAL else -1                  # ref P02: man + title slide left over 5 steps (ease-in),
    SL = [50, 170, 400, 760, 1300]                                                                 # the background stays and changes colour underneath
    xo = -SL[min(4, kx + 1)] if kx >= -1 and FINAL and tq >= CTX["dur"] - 6 / 12 else 0          # title leads by one step
    xm = -SL[min(4, kx)] if kx >= 0 else 0
    xfade = [0.12, 0.3, 0.55, 0.8, 1.0][min(4, kx)] if kx >= 0 else 0
    cam_layer(b, bg, -54, -96, s, dx, dy, 0.3)
    if xfade:                                                                                    # bg crossfades to S02's sky (same placement as S02 at t=0)
        sky = _s02()[0]; nb = Image.new("RGBA", (W, H)); cam_layer(nb, sky, -54, -96 + 30 + 90, 1, 0, 0, 0.3)
        b = Image.blend(b, nb, xfade)
    cam_layer(b, man, (600 - 388.5 * 1.45) + xm, -80, s, dx, dy, 1.0, ay=700)
    tl, _ = title([dict(t="CLUB", k="cond", s=150, maxw=760), dict(t="DIRECTORS", k="serif", s=230, maxw=970)], 96, gap=0.09, prog=typed(t, 0.0, 1.5), step=math.floor(tq * 12))
    if tq >= 0.95: tl = shine(tl, -200 + (tq - 0.95) * SHINE_SPEED)
    if xo: tl = tl.transform(tl.size, Image.AFFINE, (1, 0, -xo, 0, 1, 0), resample=Image.BICUBIC)
    b.alpha_composite(tl); return grunge(b, tq, 0.32)
_s02_prev = s02
def s02(t=1.4):
    if not FINAL: return _s02_prev(t)
    tq = q(t); sky, bench = _s02(); b = Image.new("RGBA", (W, H))
    s = 1 + 0.015 * tq; dx = -18 * eio(tq / 1.6)
    es, eb = E(tq, 0, 90, 0.55), E(tq, 1 / 12, 520, 0.55)                                          # sky settles, bench layer rises from below a step later
    cam_layer(b, sky, -54, -96 + 30 + (es or 0), s, dx, 0, 0.3)
    hz = 860 * 1.55
    if eb is not None: cam_layer(b, bench, (W - bench.width) / 2, 795 - hz + eb + X(tq, 1), s, dx, 0, 1.0)
    tl, _ = title([dict(t="A UNIFORM", k="cond", s=124, maxw=760), dict(t="COMPANY", k="serif", s=250, maxw=970)], 140, gap=0.09, prog=typed(t, 0.08, 1.5), step=math.floor(tq * 12), seed=2)
    if tq >= 1.0: tl = shine(tl, -200 + (tq - 1.0) * SHINE_SPEED)
    b.alpha_composite(title_x(tl, tq, 0)); return grunge(b, tq, 0.30)

# S06: document drops in, reader rises, the lens SEARCHES the page and stops on the clause, red ring draws, then everything leaves
@lru_cache(None)
def _s06():
    bg = halftone(glow_bg("#7d3e3e", "#4a2426", gx=0.45, gy=0.35, rx=0.8, ry=0.5, ga=0.12, dark=[("bottom", 0.3, 0.5)]), 0.09, 9, light=True, rfrac=0.25)
    mt = json.loads((I3 / "doc_meta.json").read_text()); DS = 1.1
    doc = Image.open(I3 / "doc.png").convert("RGBA").resize((round(900 * DS), round(1200 * DS)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.6))
    ds, so = shadow(doc, dy=14, blur=14, a=0.45)
    dochi = Image.open(I3 / "doc_hi.png").convert("RGBA").resize((round(1800 * DS), round(2400 * DS)), Image.LANCZOS)
    ring = Image.open(I3 / "magnifier_ring.png").convert("RGBA"); rj = json.loads((I3 / "magnifier_ring.json").read_text()); LR = 200
    rk = (LR + 4) / rj["r"]; ring = ring.resize((round(ring.width * rk), round(ring.height * rk)), Image.LANCZOS); rs, ro = shadow(ring, dx=10, dy=22, blur=14, a=0.4)
    rm = Image.open(I3 / "readerman.png").convert("RGBA"); rm = duo(rm, (42, 28, 18), (241, 228, 204), 1.1)
    rm = rm.crop((0, 0, rm.width, round(rm.height * 0.95))); rm, kk = scale(rm, 1000); bar(rm, F3["readerman"], kk, 0, 0)
    return bg, ds, so, dochi, mt["clause"], DS, rs, ro, rj, rk, LR, rm
LENS_PATH = [(0.55, -300, -430), (1.00, 170, -260), (1.40, -160, -110), (1.80, 110, 40), (2.15, 0, 0)]   # (t, dx, dy) around the clause: searching
def s06(t=2.9):
    tq = q(t); bg, ds, so, dochi, cl, DS, rs, ro, rj, rk, LR, rm = _s06(); b = bg.copy()
    DX, DY = 45, -60
    ed = E(tq, 0, 1300, 0.6); ddy = -(ed or 0) - X(tq, 1)                                          # doc comes DOWN into place, leaves up
    if ed is not None: paste(b, ds, DX - so, DY + ddy - so)
    ccx, ccy = (cl[0] + cl[2]) / 2, (cl[1] + cl[3]) / 2
    if tq >= LENS_PATH[0][0] and ed is not None:
        for (t0, x0, y0), (t1, x1, y1) in zip(LENS_PATH, LENS_PATH[1:] + [(99, 0, 0)]):
            if tq < t1: u = eio((tq - t0) / (t1 - t0)) if t1 < 99 else 1; ldx, ldy = x0 + (x1 - x0) * u, y0 + (y1 - y0) * u; break
        lk = POP(tq, LENS_PATH[0][0]) or 1
        px, py = ccx * DS + ldx, ccy * DS + ldy                                                   # point of the page under the lens (doc px)
        crop = dochi.crop((round(px * 2 - LR), round(py * 2 - LR), round(px * 2 + LR), round(py * 2 + LR)))
        m = Image.new("L", crop.size, 0); ImageDraw.Draw(m).ellipse([0, 0, crop.width - 1, crop.height - 1], fill=255)
        lens = Image.new("RGBA", crop.size, (0, 0, 0, 0)); lens.paste(crop, (0, 0), m)
        ish = Image.new("L", crop.size, 0); ImageDraw.Draw(ish).ellipse([0, 0, crop.width - 1, crop.height - 1], outline=110, width=26); ish = ImageChops.multiply(ish.filter(ImageFilter.GaussianBlur(14)), m)
        lens.paste(Image.new("RGBA", crop.size, (40, 25, 10, 255)), (0, 0), ish)
        if tq >= 2.40:                                                                             # red hand ring around the clause, drawn in 4 steps
            fr = min(1, (math.floor((tq - 2.40) * 12 + 1e-6) + 1) / 4); npts = max(2, round(61 * fr))
            mk = Image.new("RGBA", crop.size, (0, 0, 0, 0)); dm = ImageDraw.Draw(mk)
            pts = [(LR + 182 * math.cos(a) * (1 + .03 * math.sin(3 * a)), LR + 52 * math.sin(a) + a * 2) for a in [i / 60 * 2 * math.pi * 1.08 - 0.6 for i in range(61)]]
            dm.line(pts[:npts], fill=(216, 35, 42, 255), width=9, joint="curve"); lens.alpha_composite(mk)
        lx, ly = DX + px, DY + ddy + py
        pastek(b, lens, lx - LR, ly - LR, lk); pastek(b, rs, lx - rj["cx"] * rk - ro, ly - rj["cy"] * rk - ro, lk)
    er = E(tq, 2 / 12, 800, 0.6)                                                                    # reader rises a step after the page
    if er is not None: paste(b, rm, (W - rm.width) / 2, H - rm.height + 20 + er + X(tq, 0))
    return grunge(b, tq, 0.30)

# S07: owner rises behind the counter, counter + jerseys hop on one by one; head mask refined (no halo)
_s07_cache = {}
def _s07b():
    if not _s07_cache:
        img, ground, hz, _b, _h, neck, kk, hk, ncx = _s07()
        # clean colour/B&W split (user): head + hair + WHOLE neck in colour, hard seam on the T-shirt collar; the B&W body has NO neck skin
        # above the seam (nothing grey can peek out); the head layer runs 4 px (centre) to 26 px (shoulders) below the seam and the body 14 px above it at the shoulders (never on the neck), so tilting never opens a gap
        so0 = L("shopowner.png"); bb = so0.getbbox(); so = so0.crop(bb); so = so.resize((700, round(so.height * 700 / so.width)), Image.LANCZOS)
        # seam = the REAL collar/hairline, traced by hand on a 2x grid of this photo (crop x 100..600, y 330..560 of the 700-px cutout):
        # hair over shirt on the shoulders, along the inner edge of each apron strap, then round the T-shirt neckline
        P = [(0, 250), (120, 232), (150, 205), (200, 207), (260, 210), (300, 200), (333, 200), (338, 230), (350, 255), (380, 270), (450, 292), (500, 297),
             (560, 291), (620, 272), (660, 248), (684, 222), (692, 200), (740, 192), (800, 200), (860, 195), (900, 215), (1000, 250)]
        px = np.array([100 + a / 2 for a, _ in P]); py = np.array([330 + b / 2 for _, b in P])
        xs = np.arange(so.width, dtype=np.float32); seam = np.interp(xs, px, py)
        import scipy.ndimage as nd
        seam = nd.gaussian_filter1d(seam, 1.2)
        yy = np.arange(so.height, dtype=np.float32)[:, None]
        sil = np.asarray(so.split()[-1].filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255   # 1 px erosion: no halo
        top = np.clip(seam[None, :] - yy + 0.5, 0, 1)                                            # 1 above the seam, ~1 px anti-aliased edge
        core = sil * top
        bwimg = bw(so, 1.25); body_rgb = np.asarray(bwimg.convert("RGB"), np.float32)
        # head layer = colour head + a 10 px skirt of the SAME B&W cloth around it (identical to the body underneath: invisible, but no gap when it tilts)
        skirt = nd.grey_dilation(core, size=(21, 21)); skirt = nd.gaussian_filter(skirt, 2.0) * sil
        harr = np.asarray(so, np.float32).copy()
        harr[..., :3] = harr[..., :3] * top[..., None] + body_rgb * (1 - top[..., None])
        harr[..., 3] = np.maximum(core, skirt) * 255
        h2 = Image.fromarray(np.clip(harr, 0, 255).astype(np.uint8), "RGBA"); bar(h2, face_in("shopowner", bb), kk, 0, 0)
        hk = 1.0
        barr = np.asarray(bwimg, np.float32).copy(); barr[..., 3] = sil * (1 - top) * 255           # body: exactly the complement, no neck skin
        body = Image.fromarray(np.clip(barr, 0, 255).astype(np.uint8), "RGBA").crop((0, 0, so.width, 1130 - 230))
        ncx = 350.0
        neck = float(seam[round(ncx)])
        ct = L("counter.png"); ct = ct.crop(ct.getbbox()); ct = ct.resize((1060, 540), Image.LANCZOS); cs, co = shadow(ct, dy=20, blur=18)
        js = []
        for n in ["j_blue.png", "j_orange.png", "jacket.png", "j_red.png", "jersey.png", "j_purple.png"]:
            p = Image.open(R / "assets/img" / n).convert("RGBA"); p = p.crop(p.getbbox()); p, _ = scale(p, h=165 if n != "jacket.png" else 190); js.append(p)
        _s07_cache.update(v=(img, ground, body, h2, neck, hk, ncx, cs, co, js))
    return _s07_cache["v"]
def s07(t=2.4):
    img, ground, body, head, neck, hk, ncx, cs, co, js = _s07b(); tq = q(t)
    b = Image.new("RGBA", (W, H)); s = 1 + 0.02 * tq
    ox = (W - img.width) / 2; oy = H - img.height + 40
    cam_layer(b, img, ox, oy, s, 0, 0, 0.3); cam_layer(b, ground, ox, oy, s, 0, 0, 0.8)
    cty = 1070; ec = E(tq, 0, 520, 0.6)
    eo = E(tq, 2 / 12, 520, 0.6)                                                                    # owner rises from behind the counter
    if eo is not None:
        sx, sy = (W - body.width) / 2, 230 + eo + X(tq, 1)
        cam_layer(b, body, sx, sy, s, 0, 0, 1.0)
        tilt = 1.8 * math.sin(tq * 2.3); hx = 0                                                     # head tilts on the collar pivot (no slide: the neck stays attached)
        hr = head.rotate(tilt, center=(ncx * hk, neck * hk), resample=Image.BICUBIC)
        cam_layer(b, hr, sx + ncx - ncx * hk + hx, sy + neck - neck * hk - 6, s, 0, 0, 1.0)
    if ec is not None:
        cam_layer(b, cs, 10 - co, cty - co + ec + X(tq, 2), s, 0, 0, 1.0)
        for i, p in enumerate(js):                                                                 # jerseys hop on one per step (warm-ups / jerseys)
            k = POP(tq, 0.55 + i * 0.12)
            if k is None: continue
            hop = {0.55: -60, 1.12: -24}.get(k, 0)
            jx = 100 + i * 150 + (75 - p.width / 2) + 15; jy = cty + 18 - p.height + hop + ec + X(tq, 2)
            pk = p.resize((max(1, round(p.width * k)), max(1, round(p.height * k))), Image.BICUBIC)
            cam_layer(b, pk, jx - (pk.width - p.width) / 2, jy - (pk.height - p.height), s, 0, 0, 1.0)
        tl, _ = title([dict(t="STORE CREDIT", k="serif", s=92, col=(236, 196, 110), sh=False, wig=False, maxw=780), dict(t="ONLY", k="serif", s=92, col=(236, 196, 110), sh=False, wig=False)], cty + 200 + ec + X(tq, 2), gap=0.12)
        tl.putalpha(tl.split()[-1].point(lambda v: round(v * .82))); b.alpha_composite(tl)
    return grunge(b, tq, 0.28)

# S08: every jar drops in on its own (2-step drop + 16 px bounce, staggered), title types, the arm slides in from the right
@lru_cache(None)
def _s08():
    bg = glow_bg("#73a2d6", "#1c3d67", gx=0.5, gy=0.18, rx=0.9, ry=0.45, ga=0.14)
    jars = []
    for n in ("jars_a.png", "jars_b.png"):
        j = L(n); a = j.split()[-1]; cols = [x for x in range(j.width) if max(a.crop((x, 0, x + 1, j.height)).getdata()) > 20]
        segs, st = [], cols[0]
        for p, q_ in zip(cols, cols[1:] + [10 ** 9]):
            if q_ - p > 6: segs.append((st, p)); st = q_
        for s0, s1 in segs[:3]: jj = j.crop((s0, 0, s1 + 1, j.height)); jj = jj.crop(jj.getbbox()); jj, _ = scale(jj, h=440); jars.append(shadow(jj, dy=16, blur=12, a=0.35) + (jj.width,))
    tb = L("thumb.png"); tb = tb.crop(tb.getbbox()); tb, _ = scale(tb, 1040)
    return bg, jars[:6], tb
def s08(t=2.0):
    tq = q(t); bg, jars, tb = _s08(); b = bg.copy()
    for i, (js, jo, jw) in enumerate(jars):
        n = math.floor((tq - (0.10 + i * 0.10)) * 12 + 1e-6)
        if n < 0: continue
        dy = [-420, -130, 16][n] if n < 3 else 0
        cx = 200 + (i % 3) * 340; cy = 340 + (i // 3) * 510
        paste(b, js, cx - jw / 2 - jo, cy - jo + dy + X(tq, 1 + (i % 3 == 1)))
    tl, _ = title([dict(t="NEVER LEAVES", k="serif", s=120, col=YEL, sh=False, maxw=900)], 150)
    b.alpha_composite(title_x(tl, tq, 0))
    ea = E(tq, 1.05, 760, 0.5)                                                                      # arm: expo.out from the right, cut end always off-frame
    if ea is not None: paste(b, tb, 380 + ea + X(tq, 0), 640)
    return grunge(b, tq, 0.26)

# S10: red sun pops behind him and rises, cutout rises in 5 steps, title types
@lru_cache(None)
def _s10():
    bg = glow_bg("#2a1f1f", "#4a3a37", gx=0.5, gy=0.45, rx=0.8, ry=0.5, ga=0.10)
    hb = L("headband.png"); hb = bw(hb, 1.25); hbb = hb.getbbox(); hb, kk = scale(hb, 1180); bar(hb, F3["headband"], kk, 0, 0)
    return bg, hb, kk, hbb
def s10(t=1.8):
    tq = q(t); bg, hb, kk, hbb = _s10(); b = bg.copy(); R0 = 1275
    k = POP(tq, 0.0)
    if k is not None:
        cy0 = 300 + 140 - min(140, tq * 70) + X(tq, 2)                                             # pops, then rises ~7 %/s
        rr = R0 * (0.92 + 0.08 * min(1, k)); d = ImageDraw.Draw(b); d.ellipse([540 - rr, cy0 + (R0 - rr), 540 + rr, cy0 + (R0 - rr) + 2 * rr], fill=(200, 44, 30, 255))
    b = halftone(b, 0.10, 8, light=True, rfrac=0.25); b = fade(b, "top", 640, (10, 8, 8), 0.75)
    eh = E(tq, 1 / 12, 760, 0.5)                                                                    # B&W cutout rises 5 steps (power3.out-like)
    if eh is not None: paste(b, hb, (W - hb.width) / 2 + 20, H + 40 - hbb[3] * kk + eh + X(tq, 0))
    tl, _ = title([dict(t="COST LESS", k="cond", s=124, col=(250, 250, 250), sh=False, track=0.26)], 150)
    b.alpha_composite(title_x(tl, tq, 0)); return grunge(b, tq, 0.24)

# S12 / S12b: family slides in (-85 px, ref P06), bg moves 20 % of it; S12 -> S12b is a punch-in (no exit between them)
def fam(t, sc, dy, t1, t1s, t2, t2s, words, done, enter=True):
    tq = q(t); sl = (E(tq, 0, 85, 0.55) or 0) if enter else 0
    bb_ = cover(bw(L("track_bw.jpg")), W + 60, H + 34, s=1.0 + (sc - 1) * 0.3)                          # 30 px margin: the 20 % parallax never uncovers an edge
    b = Image.new("RGBA", (W, H)); paste(b, bb_, -30 + sl * 0.2, -17)
    b = halftone(b, 0.12, 9)
    fp = L("family_people.png"); fk = 1.18 * sc; fp = fp.resize((round(fp.width * fk), round(fp.height * fk)), Image.LANCZOS)
    fx, fy = (W - fp.width) / 2 + sl, 260 + dy + X(tq, 1); bar(fp, F2["family.jpg"], fk, 0, 0, idx=(0, 1, 2)); paste(b, fp, fx, fy)
    tl, _ = title([dict(t=t1, k="cond", s=t1s, maxw=760), dict(t=t2, k="serif", s=t2s, maxw=980)], 110, gap=0.09)
    b.alpha_composite(title_x(tl, tq, 0)); return grunge(b, t, 0.26)
def s12(t=0.5):
    CTX["noexit"] = True
    try: return fam(t, 1.0, 0, "FAMILIES", 110, "SEE", 280, "Families see", 2)
    finally: CTX["noexit"] = False
def s12b(t=0.6): return fam(t, 1.08, 90, "THE REGULAR", 104, "PRICE", 290, "the regular price,", 3, enter=False)

# S13: add the staggered exit to the approved entrance
_s13_prev = s13
def s13(t=1.6):
    if not FINAL: return _s13_prev(t)
    tq = q(t); sky, hg, k, wm, ey = _s13(); b = Image.new("RGBA", (W, H))
    n = math.floor(tq * 12 + 1e-6); off = 620 * 0.62 ** n if n < 12 else 0
    ws = 0.80 + 0.20 * (1 - off / 620); hoff = 180 * off / 620; s = 1 + 0.015 * max(0, tq - 1.0)
    cam_layer(b, sky, -54, -96, s, 0, 0, 0.2)
    cam_layer(b, hg, (W - hg.width) / 2, 640 - 398 * k + hoff + X(tq, 2) * 0.4, s, 0, 0, 0.6)
    c1 = typed(t, 0.08, 2.5); k1 = math.ceil(16 / 2.5); pr = min(16, c1) + max(0, (n - math.floor(0.08 * 12) - k1))
    tl, _ = title([dict(t="THE MARKUP STAYS", k="cond", s=80, col=(239, 222, 170), sh=False, maxw=760), dict(t="PRIVATE", k="serif", s=240, maxw=970, gap=0.12)], 100, prog=pr, step=n, seed=13)
    td = (math.floor(0.08 * 12) + k1 + 7 + 1) / 12
    if tq >= td: tl = shine(tl, -200 + (tq - td) * SHINE_SPEED)
    b.alpha_composite(title_x(tl, tq, 0))
    cam_layer(b, wm, (W - wm.width) / 2, 650 - ey + off + X(tq, 1), s * ws, 0, 0, 1.0, ay=1920)
    return grunge(b, tq, 0.22)

# S14: strip slides down (+255/+225/+210 px steps), title lower, ball drops 504 px in 2 steps + settles and SPINS (ball3d, 40 deg/s)
@lru_cache(None)
def _s14():
    bg = halftone(glow_bg("#26466a", "#132a42", gx=0.5, gy=0.55, rx=0.8, ry=0.45, ga=0.10), 0.09, 9, light=True, rfrac=0.25)
    st_ = cover(Image.open(I3 / "strip_start.jpg").convert("RGBA"), W, 780, fy=0.6); st_ = halftone(st_, 0.12, 9)
    strip = Image.new("RGBA", (W, H), (0, 0, 0, 0)); strip.paste(st_, (0, 0)); strip = torn_edge(strip, 740, below=False)
    return bg, strip
@lru_cache(64)
def _ball(i):
    bl = Image.open(I3 / f"ball3d/f_{i % 30:03d}.png").convert("RGBA"); bl, _ = scale(bl, 855); return shadow(bl, dy=20, blur=20, a=0.5)
def s14(t=1.6):
    tq = q(t); n = math.floor(tq * 12 + 1e-6); bg, strip = _s14(); b = bg.copy()
    so = -870 + sum([255, 225, 210, 110, 50, 20][:min(6, n + 1)]); so -= X(tq, 1)                # strip slides down from the top, leaves up
    b.alpha_composite(strip.transform(strip.size, Image.AFFINE, (1, 0, 0, 0, 1, -so), resample=Image.BICUBIC))
    tl, _ = title([dict(t="STRAIGHT INTO", k="cond", s=112, shcol=(16, 26, 44), maxw=820), dict(t="YOUR CLUB", k="serif", s=250, shcol=(16, 26, 44), maxw=980)], 160 + so, gap=0.09)
    b.alpha_composite(title_x(tl, tq, 0))
    m = math.floor((tq - 0.25) * 12 + 1e-6)                                                       # ball: -504, -250, 0, +36 settle, spin from the drop on
    if m >= 0:
        dy = [-504, -250, 0, 36, 16][m] if m < 5 else 0
        bs, bo = _ball(max(0, n)); paste(b, bs, 112 - bo, 600 - bo + dy + X(tq, 0))
    return grunge(b, tq, 0.26)

# S15: subject rises, title types
@lru_cache(None)
def _s15():
    bg = halftone(glow_bg("#a2463f", "#5a2522", gx=0.5, gy=0.35, rx=0.8, ry=0.45, ga=0.12), 0.10, 9, light=True, rfrac=0.25)
    cm = L("cashman.png"); cm = duo(cm, (42, 28, 18), (241, 228, 204), 1.1); cm, kk = scale(cm, 1300); bar(cm, F3["cashman"], kk, 0, 0)
    return bg, cm, kk
def s15(t=1.6):
    tq = q(t); bg, cm, kk = _s15(); b = bg.copy()
    tl, _ = title([dict(t="NOT STORE CREDIT", k="cond", s=104, col=CREAM, sh=False, maxw=820), dict(t="CASH", k="serif", s=290, col=CREAM, shcol=(60, 20, 18), maxw=900)], 170, gap=0.09)
    b.alpha_composite(title_x(tl, tq, 0))
    ec = E(tq, 1 / 12, 820, 0.58)
    if ec is not None: paste(b, cm, (W - cm.width) / 2, 480 - 89 * kk + ec + X(tq, 1))
    return grunge(b, tq, 0.28)

# S17: portrait rises a little with the rack focus, title types; leaves down
_s17_prev = s17
def s17(t=0.8):
    tq = q(t); im = _s17_prev(t)
    if not FINAL: return im
    e = (E(tq, 0, 260, 0.55) or 0) + X(tq, 1)
    if e:
        top = im.crop((0, 0, W, 4)).resize((1, 1), Image.BOX).getpixel((0, 0))
        b = Image.new("RGBA", (W, H), top); paste(b, im, 0, e); im = b
    n = math.floor(tq * 12 + 1e-6)
    return im.filter(ImageFilter.GaussianBlur([16, 9, 4][n])) if n < 3 else im

# S18: houses rise, silhouette family rises a step later, hand words write on
@lru_cache(None)
def _s18():
    sky = halftone(glow_bg(None, stops=[(0, "#f0a24c"), (0.18, "#f7c26a"), (0.30, "#fde3a0"), (0.36, "#fbe7b4"), (1, "#fbe7b4")], gx=0.5, gy=0.27, rx=0.55, ry=0.16, ga=0.55, gcol=(255, 250, 235)), 0.10, 9)
    hs = houses_sil(W, 660); ImageDraw.Draw(hs).rectangle([0, 668, W, H], fill=(22, 30, 58, 255))
    mo = L("mother.png"); mo = mo.crop(mo.getbbox()); mo, _ = scale(mo, h=1700); a = mo.split()[-1]
    fam_ = Image.new("RGBA", mo.size, (0, 0, 0, 0)); glow = Image.new("RGBA", mo.size, (255, 206, 110, 0)); glow.putalpha(a.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(16)))
    sil = Image.new("RGBA", mo.size, (14, 20, 40, 255)); sil.putalpha(a); fam_.alpha_composite(glow); fam_.alpha_composite(sil)
    return sky, hs, fam_
def s18(t=1.4):
    tq = q(t); sky, hs, fam_ = _s18(); b = sky.copy()
    eh = E(tq, 0, 260, 0.6)
    if eh is not None: paste(b, hs, 0, eh + X(tq, 2) * 0.5)
    b = fade(b, "bottom", 900, (10, 14, 30), 0.75)
    ef = E(tq, 1 / 12, 760, 0.6)
    if ef is not None: paste(b, fam_, (W - fam_.width) / 2, H - fam_.height + 40 + ef + X(tq, 1))
    tl, _ = title([dict(t="help for", k="hand", s=140, col=(255, 250, 240), sh=False, track=0.10), dict(t="FAMILIES", k="hand", s=250, col=(255, 250, 240), sh=False, track=0.02, maxw=1000, gap=0.05)], 880)
    b.alpha_composite(title_x(tl, tq, 0)); return grunge(b, tq, 0.22)

# S19: cutout rises in 5 steps, title types; no exit (the host rises over the frozen frame in S20)
@lru_cache(None)
def _s19():
    bg = halftone(glow_bg("#3d4660", "#1c2535", gx=0.28, gy=0.32, rx=0.70, ry=0.42, ga=0.16, dark=[("right", 0.38, 0.30)]), 0.10, 8, light=True, rfrac=0.25)
    gc_ = L("gearcoach.png"); gc_ = bw(gc_, 1.2); gc_, kk = scale(gc_, 1000); bar(gc_, F3["gearcoach"], kk, 0, 0); return bg, gc_
def s19(t=0.6):
    tq = q(t); bg, gc_ = _s19(); b = bg.copy()
    tl, _ = title([dict(t="whatever your club", k="serif", s=80, col=CREAM, wght=500, sh=False, track=0.0, maxw=760),
                   dict(t="NEEDS", k="serif", s=330, col=CREAM, shcol=(12, 18, 30), maxw=990, gap=0.07)], 96, gap=0.07)
    b.alpha_composite(tl)
    eg = E(tq, 0, 600, 0.5)
    if eg is not None: paste(b, gc_, (W - gc_.width) / 2, H - gc_.height + 160 + eg)
    return grunge(b, tq, 0.28)


ORDER = ["s01", "s02", "s03", "s04", "s05", "s06", "s07", "s08", "s09", "s10", "s11", "s12", "s12b", "s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20", "s21", "s22", "s23", "s24"]
FN = {k: globals()[k] for k in ORDER}

# ---------------- board + before/after sheets ----------------
def wraptxt(d, text, f, w):
    out, cur = [], ""
    for wd in text.split():
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) > w and cur: out.append(cur); cur = wd
        else: cur = t
    return out + [cur]
def board(only=None):
    ids = only or ORDER
    for sid in ids:
        FN[sid]().convert("RGB").save(FR / f"{sid}.png"); print("frame", sid, flush=True)
    if only: return
    TW, THh = 360, 640; NOTE = 720; ROW = THh + 24
    fN = ImageFont.truetype(str(FD / "Poppins-Bold.ttf"), 30); fR = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 25); fS = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 22)
    for sh_i in range(0, len(ORDER), 5):
        rows = ORDER[sh_i:sh_i + 5]
        sheet = Image.new("RGB", (TW * 2 + NOTE + 40, ROW * len(rows) + 60), (24, 24, 26)); d = ImageDraw.Draw(sheet)
        d.text((14, 14), "docucollage v3c storyboard — left: OUR frame · middle: REFERENCE · right: timing, line, motion PER LAYER", font=fS, fill=(200, 200, 200))
        for r, sid in enumerate(rows):
            m = S[sid]; y = 50 + r * ROW
            sheet.paste(Image.open(FR / f"{sid}.png").resize((TW, THh), Image.LANCZOS), (10, y))
            sheet.paste(ImageOps.fit(Image.open(SB / "ref" / m["ref"]).convert("RGB"), (TW, THh)), (TW + 20, y))
            x = TW * 2 + 36; d.text((x, y), f"{sid.upper()}  {m['t']} s", font=fN, fill=(255, 208, 141)); yy = y + 46
            for ln in wraptxt(d, f"“{m['line']}”", fR, NOTE - 20): d.text((x, yy), ln, font=fR, fill=(240, 240, 240)); yy += 32
            yy += 8; d.text((x, yy), "REF: " + m["refid"], font=fR, fill=(140, 200, 255)); yy += 40
            for ln in wraptxt(d, m["motion"], fS, NOTE - 20): d.text((x, yy), ln, font=fS, fill=(205, 205, 205)); yy += 27
        sheet.save(OUT / f"board_{sh_i // 5 + 1}.jpg", quality=88)
    CMP = OUT / "compare"; CMP.mkdir(exist_ok=True)
    for sid in ORDER:          # before (v3) | after (v3b) | ref
        TW2, TH2 = 432, 768; sh = Image.new("RGB", (TW2 * 3 + 40, TH2 + 50), (24, 24, 26)); d = ImageDraw.Draw(sh)
        for i, (lab, p) in enumerate([("v3b (before)", PREV / "frames" / f"{sid}.png"), ("v3c (after)", FR / f"{sid}.png"), ("REF " + S[sid]["refid"].split("·")[0], SB / "ref" / S[sid]["ref"])]):
            if p.exists(): sh.paste(ImageOps.fit(Image.open(p).convert("RGB"), (TW2, TH2)), (10 + i * (TW2 + 10), 40))
            d.text((14 + i * (TW2 + 10), 10), f"{sid.upper()}  {lab}", font=fS, fill=(255, 208, 141))
        sh.save(CMP / f"cmp_{sid}.jpg", quality=86)
    print("board done")

# ---------------- motion test: ours (12 fps graphics) | ref, with labels ----------------
SEG = [("s01", 1.9, "DIV6ZPFIx3y/reel1080.mp4", 0.0, "TITLE · approved wiggle again (3.5 osc/s, 60 %, position only, 12 fps) + whiter, faster shine (1300 px/s)  ·  ref GOLD 0.0-1.9"),
       ("s34", 2.2, "DIV6ZPFIx3y/reel1080.mp4", 3.96, "S03/S04 · white wall / floor / girl layers; $5,000 written + rises like JESSICA; fan + medal pop  ·  ref GOLD 3.96-6.16"),
       ("s11", 3.0, "DIV6ZPFIx3y/reel1080.mp4", 20.4, "S11 · AMOUNT as big as MEDAL; burst +3/+7/+6/+3/+5 %, stadium 45 %  ·  ref GOLD 20.4-23.4"),
       ("s13", 2.1, "DF0jP-vIYlk/reel.mp4", 33.9, "S13 · top fade stops at the ref navy #111B29 (no black)  ·  ref ARR 33.9-36.0"),
       ("s22", 2.2, "DHt949poQGJ/reel.mp4", 7.44, "S22 · trophy lower, CASH tucked behind it, TO INVEST justified to FREEDOM; JAM JAR timing  ·  ref JAM 7.44-9.64"),
       ("s24", 2.0, "DIV6ZPFIx3y/reel1080.mp4", 47.82, "S24 · rock + man + rope enter as one group, always glued to the frame edges  ·  ref GOLD 47.8-49.8")]
FN["s34"] = s34
def motion():
    MT = OUT / "_motion"; MT.mkdir(exist_ok=True); FPS = 24; PW, PH = 540, 960; TOP = 70
    fL = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 19); fT = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
    k = 0
    for sid, dur, reel, r0, label in SEG:
        rd = MT / f"ref_{sid}"; rd.mkdir(exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(r0), "-t", str(dur + 0.1), "-i", str(REELS / reel), "-vf", f"fps={FPS},scale={PW}:{PH}", str(rd / "r_%04d.png")], check=True, timeout=300)
        cache = {}; nref = len(list(rd.glob('r_*.png')))
        for i in range(int(dur * FPS)):
            t = i / FPS; tk = q(t)
            if tk not in cache: cache = {tk: FN[sid](tk).convert("RGB").resize((PW, PH), Image.LANCZOS)}
            fr = Image.new("RGB", (PW * 2 + 30, PH + TOP + 10), (18, 18, 20)); d = ImageDraw.Draw(fr)
            fr.paste(cache[tk], (10, TOP)); rp = rd / f"r_{min(i + 1, nref):04d}.png"
            fr.paste(Image.open(rp).convert("RGB"), (PW + 20, TOP))
            for j, ln in enumerate(wraptxt(d, label, fL, PW * 2)): d.text((12, 6 + j * 22), ln, font=fL, fill=(255, 208, 141))
            d.text((14, TOP + 8), "OURS v3c (12 fps graphics)", font=fT, fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0))
            d.text((PW + 24, TOP + 8), "REFERENCE", font=fT, fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0))
            fr.save(MT / f"m_{k:05d}.png"); k += 1
        print("seg", sid, flush=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(MT / "m_%05d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
                    "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", str(OUT / "motion_test.mp4")], check=True, timeout=600)
    print("motion_test.mp4", k, "frames")

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "board"
    if cmd == "board": board(sys.argv[2:] or None)
    elif cmd == "motion": motion()
    elif cmd == "frames":     # quick look: python board3b.py frames s13 0.3 1.0 ...
        sid = sys.argv[2]
        for tt in sys.argv[3:]: FN[sid](float(tt)).convert("RGB").save(OUT / f"_{sid}_{tt}.png")
