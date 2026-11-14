"""v3b storyboard: v3 + user round (layers everywhere, grunge, soft centre glow, feathered fades, halftone where the ref has it,
tight title leading, EB Garamond 800 + thin same-colour stroke, bigger hero words, no visible cut edges).
Scenes are functions of t (s inside the shot, graphics stepped at 12 fps) so the board and the motion test share one code path.
python prep/board3b.py board    -> storyboard/v3b/frames/*.png, board_*.jpg, compare/*.jpg
python prep/board3b.py motion   -> storyboard/v3b/motion_test.mp4 (ours | ref)"""
import json, math, random, subprocess, sys
from functools import lru_cache
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance, ImageChops
R = Path(__file__).resolve().parent.parent
I3, I2, I3B, FD = R / "assets/img3", R / "assets/img2", R / "assets/img3b", R / "assets/fonts"
SB = R / "storyboard/v3"; OUT = R / "storyboard/v3b"; FR = OUT / "frames"; FR.mkdir(parents=True, exist_ok=True)
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
def dotmask(w, h, pitch, rfrac):
    k = (w, h, pitch, rfrac)
    if k not in _DOT:
        y, x = np.mgrid[0:h, 0:w].astype(np.float32); c = math.sqrt(0.5)
        u = (x * c + y * c) / pitch; v = (-x * c + y * c) / pitch
        d = np.sqrt((u - np.round(u)) ** 2 + (v - np.round(v)) ** 2) * pitch
        _DOT[k] = np.clip(rfrac * pitch - d + 0.5, 0, 1)
    return _DOT[k]
def halftone(im, a=0.15, pitch=13, light=False, rfrac=0.30):
    arr = np.asarray(im.convert("RGBA"), np.float32).copy(); m = dotmask(im.width, im.height, pitch, rfrac)[..., None] * a
    rgb = arr[..., :3]; arr[..., :3] = rgb + (255 - rgb) * m if light else rgb * (1 - m)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")

# ---------------- grunge overlay: user's paper texture that changes every few frames x dust specks, multiplied, drifting ----------------
@lru_cache(8)
def _g(i): return np.asarray(Image.open(R / f"assets/grunge/g_{i % 36:03d}.png"), np.float32) / 255
def grunge(im, t=0.0, a=0.30):
    n = math.floor(t * 12 + 1e-6); g = np.roll(_g(n // 2), (n * 3) % H, axis=0)          # texture swaps every 2 steps, drifts 36 px/s
    arr = np.asarray(im.convert("RGBA"), np.float32).copy(); arr[..., :3] *= (1 - a * (1 - g))[..., None]
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
def tline(text, kind, size, col=GOLD, track=None, maxw=970, maxh=None, wght=800, sh=True, shcol=SHADOW, wig=True, step=0, seed=0, nvis=None, newa=0.45, shs=0.04):
    track = {"cond": 0.2, "hand": 0.10}.get(kind, 0.02) if track is None else track
    while True:
        f = font(kind, size, wght); st = stroke_of(kind, size, wght)
        adv = [f.getlength(c) + track * size for c in text]; tw = sum(adv) - track * size
        bb = f.getbbox(text, stroke_width=st)
        if (tw <= maxw and (maxh is None or bb[3] - bb[1] <= maxh)) or size < 30: break
        size -= 2
    pad = int(size * 0.35); lay = Image.new("RGBA", (int(tw + 2 * pad), int(size * 1.4 + 2 * pad)), (0, 0, 0, 0))
    s = max(3, round(size * shs)) if sh else 0
    rr = random.Random(seed * 7919 + step * 104729); xx = pad; n = len(text) if nvis is None else int(nvis)
    for i, (c, a) in enumerate(zip(text, adv)):
        jx, jy = (rr.gauss(0, 0.6 * 0.029 * 0.7 * size), rr.gauss(0, 0.6 * 0.055 * 0.7 * size)) if (wig and kind != "hand") else (0, 0)
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
    return lay, boxes
def shine(lay, xc, band=230, a=0.55):
    arr = np.asarray(lay, np.float32).copy(); y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    m = ss(1 - np.abs(x - xc + 0.35 * (y - 300)) / band) * a * arr[..., 3] / 255
    arr[..., :3] += (255 - arr[..., :3]) * m[..., None]; return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
def typed(t, t0, per_step=1.0):
    return None if t is None else max(0, math.floor((q(t) - t0) * 12 * per_step + 1e-6) + (1 if q(t) >= t0 else 0))
def pill(base, text, done, cy):
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
    return Image.open(OUT / f"host_seq/h_{i + 1:03d}.png").convert("RGBA")
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

# =====================================================================================================================
# S01  fav_80 / GOLD P01 0.2-1.84 : flat beige bg | man layer (moves like a camera) | title (fixed) | grunge | host | pill
@lru_cache(None)
def _s01():
    bg = glow_bg("#7a5f43", "#5b4733", gx=0.42, gy=0.30, rx=0.85, ry=0.50, ga=0.17, dark=[("bottom", 0.25, 0.55)], w=1188, h=2112)
    man = L("director.png"); k = 1.55; man = man.resize((round(man.width * k), round(man.height * k)), Image.LANCZOS)
    return bg, man
def s01(t=1.0):
    tq = q(t); bg, man = _s01(); b = Image.new("RGBA", (W, H))
    u = eio(tq / 1.9); s = 1 + 0.067 * u; dy = -60 * u; dx = 16 * math.sin(tq * 1.7)      # ref P01: x1.067 over 1.9 s, drifts up 60 px
    cam_layer(b, bg, -54, -96, s, dx, dy, 0.3)                                               # flat bg: 30 % of the camera (parallax)
    cam_layer(b, man, W + 60 - man.width, -180, s, dx, dy, 1.0, ay=700)                     # cut head/right side stay out of frame
    tl, _ = title([dict(t="CLUB", k="cond", s=150, maxw=760), dict(t="DIRECTORS", k="serif", s=230, maxw=970)], 96, gap=0.09,
                  prog=typed(t, 0.0, 1.5), step=math.floor(tq * 12))
    if tq >= 0.95: tl = shine(tl, -200 + (tq - 0.95) * 1000)                               # one slow sweep ~1000 px/s
    b.alpha_composite(tl); b = grunge(b, tq, 0.32)
    paste(b, host_seq(t), 0, HOST_Y); pill(b, "Club directors,", 1 if t < 0.55 else 2, 900)
    return b
meta("s01", t="0.00-1.28", line="Club directors,", ref="gold_1.20.jpg", refid="fav_80 · GOLD P01 0.2-1.84",
     motion="LAYERS: flat beige bg (own layer, soft white glow up-left, feathered) | man-with-medals cutout | title | grunge | host. CAMERA on the man: x1.00→1.067 + drift up 60 px + ±16 px sway over 1.9 s (ease in-out); bg moves 30 % of that (parallax). Title fixed: CLUB/DIRECTORS typed (1.5 chars/step), one shine ~1000 px/s. Grunge multiply 32 %, texture changes every 2 steps.")

# S02  fav_81 / GOLD P02-P03 : sunset sky (coded, own layer) | bench+man+box+ground layer | title | grunge | host
@lru_cache(None)
def _s02():
    sky = glow_bg(None, stops=[(0, "#050c17"), (0.22, "#0a1829"), (0.33, "#16263f"), (0.375, "#5a3a3e"), (0.40, "#c9652c"), (0.42, "#e7883a"), (1, "#e7883a")],
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
    if tq >= 1.0: tl = shine(tl, -200 + (tq - 1.0) * 1000)
    b.alpha_composite(tl); b = grunge(b, tq, 0.30)
    paste(b, host_seq(1.28 + t), 0, HOST_Y); pill(b, "a uniform company", 2 if t > 0.6 else 1, 900)
    return b
meta("s02", t="1.28-2.80", line="a uniform company offers your club", ref="gold_3.20.jpg", refid="fav_81 · GOLD P02-P03 1.84-4.0",
     motion="LAYERS: coded sunset sky (flat navy→orange, warm glow on the horizon) | bench+man+jersey box+grass (one cutout) | title | grunge | host. Slide-in from the right (P03), push +1.5 %/s, sky at 30 % parallax. Title: leading 0.09 x cap, COMPANY fills 970 px, EB Garamond 800 + 3 px stroke.")

# S03 / S04  fav_82/83 : room plate | girl layer | title  (unchanged layout) + grunge
@lru_cache(None)
def _girl():
    gi = L("girl.png"); src = Image.open(R / "flow/v3/girl.jpg"); k = H / src.height; gox = -(src.width * k - W) / 2
    return gi, k, gox
def s03(t=1.0):
    gi, k, gox = _girl(); b = cover(L("room_plate.jpg"))
    gcut = gi.resize((round(gi.width * k), round(gi.height * k)), Image.LANCZOS)
    ga = gcut.split()[-1]; gsh = Image.new("RGBA", gcut.size, (40, 30, 20, 0)); gsh.putalpha(ga.point(lambda v: round(v * .28)).filter(ImageFilter.GaussianBlur(26)))
    paste(b, gsh, gox + 70, -30); paste(b, gcut, gox, 0); bar(b, F3["girl"], k, gox, 0)
    tl, _ = title([dict(t="$5,000", k="hand", s=190, col=(242, 168, 40), sh=False, track=0.12)], 70); b.alpha_composite(tl)
    b = grunge(b, t, 0.26); pill(b, "your club $5,000", 3, 900); return b
meta("s03", t="2.80-3.96", line="…your club $5,000", ref="gold_4.60.jpg", refid="fav_82 · GOLD P04 4.0-5.88",
     motion="LAYERS: room plate | girl cutout | hand title | grunge. Deblur 18→0 px (6 f); girl slides in from the right -135 px ease-out (15 f); '$5,000' written 2.4 f/letter; push with PARALLAX room x1.08 / girl x1.2 / title x1.3.")
def s04(t=1.0):
    gi, k, gox = _girl(); b = cover(L("room_plate.jpg"), s=1.06, fy=0.35); src = Image.open(R / "flow/v3/girl.jpg")
    k2 = k * 1.12; ox = -(src.width * k2 - W) / 2; oy = -(src.height * k2 - H) * 0.35
    fan = L("cashfan.png"); fan = fan.crop(fan.getbbox()); fan, _ = scale(fan, 980); paste(b, fan, 50, -40)
    gc = gi.resize((round(gi.width * k2), round(gi.height * k2)), Image.LANCZOS); paste(b, gc, ox, oy); bar(b, F3["girl"], k2, ox, oy)
    md = L("medal.png"); md = md.crop(md.getbbox()); md = md.crop((0, round(md.height * 0.42), md.width, md.height)); md, _ = scale(md, w=round(92 * k2))
    f0 = F3["girl"][0]; nx, ny = f0["cx"] * k2 + ox, (f0["cy"] + 70) * k2 + oy
    rib = Image.new("RGBA", b.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(rib)
    for sx_ in (-1, 1): dr.line([(nx + sx_ * 30 * k2, ny), (nx + sx_ * 4, ny + 75 * k2)], fill=(28, 118, 66, 255), width=round(9 * k2))
    b.alpha_composite(rib); paste(b, md, nx - md.width / 2, ny + 68 * k2)
    b = grunge(b, t, 0.26); pill(b, "through fundraising.", 2, 900); return b
meta("s04", t="3.96-4.98", line="through fundraising.", ref="gold_6.40.jpg", refid="fav_83 · GOLD P04b-P05 5.72-7.28",
     motion="LAYERS: room | cash fan (pops 1 f at x1.28, eases to 1.0, 30 % parallax like the rings) | girl | medal on the neck (pops, drops 1 f, settles) | grunge. Push x1.23 + pan -190 px.")

def s05(t=0): b = th("5.4"); pill(b, "Sounds amazing, right?", 2, 1384); return b
meta("s05", t="4.98-6.06", line="Sounds amazing, right?", ref="gold_19.00.jpg", refid="GOLD P18 18.72-19.88 (TH)", motion="Real TH, blurred copy fading out over 0.26 s; no zoom.")

# S06  ARR doc + lens (v3 layout) on a glow maroon ground + halftone + grunge
def s06(t=0):
    b = halftone(glow_bg("#7d3e3e", "#4a2426", gx=0.45, gy=0.35, rx=0.8, ry=0.5, ga=0.12, dark=[("bottom", 0.3, 0.5)]), 0.14, 13, light=True)
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
def s09(t=0): return th_title("16.2", [dict(t="FUNDRAISING WITH", k="cond", s=110, shcol=(20, 26, 40), maxw=900), dict(t="STIMULUS", k="serif", s=240, shcol=(20, 26, 40), maxw=970)], 160, "fundraising with stimulus works.", 2, 9)
meta("s09", t="15.14-17.33", line="Now here's how fundraising with stimulus works.", ref="gold_39.3.jpg", refid="GOLD P29 37.2-39.4 (WHAT'S NEXT?)",
     motion="TH; title behind the head, leading 0.09 x cap (was ~0.5), STIMULUS fills 970 px; letters drop 100 px ease-out in 5 f, wiggle; fade 90→50→0 % in 3 f. Top dim gradient feathered (smoothstep) so the neon sign doesn't fight the title.")

# S10  fav_95 / DK OVERESTIMATE : dark bg + glow | HUGE red circle (r 1275, top at y 300) | B&W cutout | halftone | top fade
def s10(t=0):
    b = glow_bg("#2a1f1f", "#4a3a37", gx=0.5, gy=0.45, rx=0.8, ry=0.5, ga=0.10)
    d = ImageDraw.Draw(b); R0 = 1275; d.ellipse([540 - R0, 300, 540 + R0, 300 + 2 * R0], fill=(200, 44, 30, 255))
    b = halftone(b, 0.12, 14, light=True)
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
    tl, _ = title([dict(t="ADD AN", k="serif", s=210, maxw=540), dict(t="AMOUNT", k="serif", s=250, maxw=720)], 130, gap=0.15,
                  prog=typed(t, 0.95, 1.0), step=math.floor(tq * 12), seed=11)
    if tq >= 2.1: tl = shine(tl, -200 + (tq - 2.1) * 1000)
    b.alpha_composite(tl)
    gx, gy = (W - pd.width) / 2, 600 - ey                                                       # final: eyes y 600, hands inside, feet ~y 2050 (off-frame)
    put(b, pd, gx, gy, z, AX, AY)
    b = grunge(b, tq, 0.24); pill(b, "add a fundraising amount", 2, 900); return b
meta("s11", t="19.73-22.65", line="and your club can add a fundraising amount to each jersey.", ref="gold_22.90.jpg", refid="fav_88 · GOLD P20 20.4-23.5 (podium)",
     motion="LAYERS: blurred stadium | title (between bg and girl, sized to sit BETWEEN her raised arms like GOLD MEDAL) | girl cutout x1.80, eyes at y 600, hands inside the frame, knees/shins at the bottom edge, feet never visible | grunge. CAMERA anchored low (540,1700): push +3 %/s 0.5 s, then the ref burst +3/+7/+6/+3/+5 % on five 12 fps steps (x1.26), drift +1 %/s; stadium gets 45 % of the zoom (ref x1.12 vs x1.28). Title types after the burst (ref GOLD f550), one slow shine.")

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
    sky = halftone(sky, 0.10, 11, light=True); sky = fade(sky, "top", 1000, (2, 4, 9), 0.80, 1.5)
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
    tl, _ = title([dict(t="THE MARKUP STAYS", k="cond", s=80, col=(239, 222, 170), sh=False, maxw=760),
                   dict(t="PRIVATE", k="serif", s=240, maxw=970, gap=0.12)], 100, prog=typed(t, 0.0, 2.5), step=n, seed=13)
    if tq < 1.0: tl = title([dict(t="THE MARKUP STAYS", k="cond", s=80, col=(239, 222, 170), sh=False, maxw=760)], 100, prog=typed(t, 0.0, 2.5), step=n, seed=13)[0]
    elif tq < 1.17: tl.putalpha(tl.split()[-1].point(lambda v: round(v * 0.55)))              # serif word fades in behind her head (2 steps)
    b.alpha_composite(tl)
    wx, wy = (W - wm.width) / 2, 650 - ey
    cam_layer(b, wm, wx, wy + off, s * ws, 0, 0, 1.0, ay=1920)
    b = grunge(b, tq, 0.22); pill(b, "markup stays private.", 3 if t > 1.2 else 2, 1384); return b
meta("s13", t="24.06-26.70", line="while the fundraising markup stays private.", ref="arr_34.96.jpg", refid="fav_98/99 · ARR P144 33.92-36.0 (Jane)",
     motion="THREE LAYERS: (1) flat NAVY sky #0f1828→#1e3452 (ref #111b2a/#142234, not light blue) + soft centre glow + light halftone 11 px + black fade from the top with a 1000 px smoothstep feather; (2) houses+lawn cutout, dimmed and cooled; (3) woman, blue-tinted, strong black shade over hair/head feathered down to the chin, white brush bar. MOTION (measured on ARR): woman rises from +620 px with decay 0.62/step and grows 0.8→1.0; houses rise 180 px at the same time (parallax 0.3); then push +1.5 %/s with depths sky 0.2 / houses 0.6 / woman 1.0. Cond line typed, PRIVATE fades in behind her head 55 %→100 %.")

# S14  fav_87 torn strip + ball
def s14(t=0):
    b = glow_bg("#26466a", "#132a42", gx=0.5, gy=0.55, rx=0.8, ry=0.45, ga=0.10)
    b = halftone(b, 0.10, 13, light=True)
    st_ = cover(Image.open(I3 / "strip_start.jpg").convert("RGBA"), W, 780, fy=0.6); st_ = halftone(st_, 0.16, 9)
    strip = Image.new("RGBA", (W, H), (0, 0, 0, 0)); strip.paste(st_, (0, 0)); strip = torn_edge(strip, 740, below=False); b.alpha_composite(strip)
    tl, _ = title([dict(t="STRAIGHT INTO", k="cond", s=112, shcol=(16, 26, 44), maxw=820), dict(t="YOUR CLUB", k="serif", s=250, shcol=(16, 26, 44), maxw=980)], 100, gap=0.09); b.alpha_composite(tl)
    bl = Image.open(I3 / "ball3d/f_000.png").convert("RGBA"); bl, _ = scale(bl, 855); bs, bo = shadow(bl, dy=20, blur=20, a=0.5); paste(b, bs, 112 - bo, 580 - bo)
    b = grunge(b, t, 0.26); pill(b, "directly into your club", 2, 900); return b
meta("s14", t="26.70-28.85", line="That extra money goes directly into your club", ref="gold_17.95.jpg", refid="fav_87 · GOLD P12-P15 14.6-18.12 (globe)",
     motion="LAYERS: navy flat bg + glow + light halftone | torn strip with kids photos | title on the strip (YOUR CLUB now 980 px wide, leading 0.09) | 3D ball | grunge. Ball drops 504 px in 2 f, spins 22.5°/s; strip slides down +255/+225/+210 px per step.")

# S15  fav_97 NEVER THE CASE
def s15(t=0):
    b = halftone(glow_bg("#a2463f", "#5a2522", gx=0.5, gy=0.35, rx=0.8, ry=0.45, ga=0.12), 0.16, 13, light=True)
    tl, _ = title([dict(t="NOT STORE CREDIT", k="cond", s=104, col=CREAM, sh=False, maxw=820), dict(t="CASH", k="serif", s=290, col=CREAM, shcol=(60, 20, 18), maxw=900)], 110, gap=0.09); b.alpha_composite(tl)
    cm = L("cashman.png"); cm = duo(cm, (42, 28, 18), (241, 228, 204), 1.1); cm, kk = scale(cm, 1080)
    cx_, cy_ = (W - cm.width) / 2, H - cm.height + 90; paste(b, cm, cx_, cy_); bar(b, F3["cashman"], kk, cx_, cy_)
    b = grunge(b, t, 0.28); pill(b, "in cash, not store credit.", 2, 1384); return b
meta("s15", t="28.85-30.92", line="in cash, not store credit.", ref="arr_21.15.jpg", refid="fav_97 · ARR P130 20.16-21.28 (NEVER THE CASE)",
     motion="LAYERS: red flat bg + soft glow + light halftone | title | sepia cutout | grunge. Slow push; letter-wipe title; navy torn strip exit in 4 f.")

# S16  fav_86 / GOLD P10 : sky layer (halftone) | field layer | runner | seats+spectators FOREGROUND (own layer, 1.5x parallax)
@lru_cache(None)
def _s16():
    src = L("pitch_sky.jpg"); k = 1.617; img = src.resize((round(src.width * k), round(src.height * k)), Image.LANCZOS)
    sky = halftone(img, 0.24, 12)
    hz = round(680 * k); gm = Image.new("L", img.size, 0); ImageDraw.Draw(gm).rectangle([0, hz, img.width, img.height], fill=255)
    field = img.copy(); field.putalpha(gm.filter(ImageFilter.GaussianBlur(4))); field = halftone(field, 0.16, 12)
    rk = L("runner_kid.png"); rk = rk.crop(rk.getbbox()); rk, _ = scale(rk, h=360)
    fg = L("seats_fg.png"); kf = 1.69; fg = fg.resize((round(fg.width * kf), round(fg.height * kf)), Image.LANCZOS)
    fa = fg.split()[-1]; fg = fg.filter(ImageFilter.GaussianBlur(5)); fg.putalpha(fa.filter(ImageFilter.GaussianBlur(4))); fg = halftone(fg, 0.08, 12, light=True)
    return sky, field, hz, rk, fg, kf
def s16(t=2.4):
    tq = q(t); sky, field, hz, rk, fg, kf = _s16(); b = Image.new("RGBA", (W, H))
    e = eo3(tq / 0.42); s = (1.3 - 0.3 * e) * (1 - 0.024 * max(0, tq - 0.42)); dx = 186 * (1 - e)          # settle x1.3→1.0 + pan -186 px, then pull-out -2.4 %/s
    oy = 770 - hz
    cam_layer(b, sky, (W - sky.width) / 2, oy, s, dx, 0, 0.3)
    cam_layer(b, field, (W - field.width) / 2, oy, s, dx, 0, 0.6)
    cam_layer(b, rk, 470 + 7 * tq / 2.5, 545, s, dx, 0, 0.65)
    fx, fy = (W - fg.width) / 2 + 20 * eio(tq / 2.8), 1090 - 707 * kf + 25 * eio(tq / 2.8)
    cam_layer(b, fg, fx, fy, s, dx, 0, 1.5)
    n = math.floor(tq * 12 + 1e-6)
    if n < 4: b = b.filter(ImageFilter.GaussianBlur([12, 8, 4, 1.5][n]))                    # blur clears in 4 steps
    tl, _ = title([dict(t="FIELD", k="cond", s=120, col=(250, 250, 250), shcol=(42, 74, 122), maxw=700),
                   dict(t="RENTALS", k="serif", s=250, col=(250, 250, 250), shcol=(42, 74, 122), maxw=980)], 110, gap=0.15,
                  prog=typed(t, 0.92, 1.3), step=n, seed=16)
    b.alpha_composite(tl); b = grunge(b, tq, 0.22); pill(b, "field rentals,", 2 if t > 1.2 else 1, 900); return b
meta("s16", t="30.92-32.42", line="Use it for field rentals,", ref="gold_14.1.jpg", refid="fav_86 · GOLD P10 11.6-14.4 (stadium seats)",
     motion="FOUR LAYERS: sky (dark halftone, depth 0.3) | field (depth 0.6) | runner (0.65, drifts +7 px) | seats + two spectators cut out as one foreground (depth 1.5 = 1.5x the bg like the ref, out of focus, drifts +20/+25 px). CAMERA: enters x1.3 with pan +186 px and blur 12/8/4/1.5 px, settles to x1.0 in 5 steps (ease-out), then pull-out -2.4 %/s. White title with navy shadow typed from 0.92 s.")

# S17  fav_93 teal portrait : COACHES bigger, both lines with shadow
def s17(t=0):
    c = Image.open(I2 / "coach.jpg").convert("RGBA"); f0 = F2["coach.jpg"][0]
    kk = 2.35; c = c.resize((round(c.width * kk), round(c.height * kk)), Image.LANCZOS); cx_, cy_ = 540 - f0["cx"] * kk, 1010 - f0["cy"] * kk
    cd = duo(c, (19, 39, 42), (207, 226, 220)); top_ = cd.crop((0, 0, cd.width, 30)).resize((1, 1), Image.BOX).getpixel((0, 0))
    b = glow_bg(top_[:3], top_[:3], gx=0.5, gy=0.2, rx=0.8, ry=0.3, ga=0.08); paste(b, cd, cx_, cy_)
    b = fade(b, "top", 820, (14, 30, 34), 0.78); b = halftone(b, 0.20, 17)
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
    b = halftone(b, 0.10, 12)
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
    b = halftone(b, 0.11, 15, light=True)
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
def s22(t=0):
    b = glow_bg("#7479d6", "#1d2068", gx=0.5, gy=0.12, rx=0.9, ry=0.45, ga=0.10)
    tl, _ = title([dict(t="CASH", k="serif", s=340, col=YEL, sh=False, maxw=900)], 70); b.alpha_composite(tl)
    tr = L("trophy.png"); tr = tr.crop(tr.getbbox()); tr, _ = scale(tr, h=1260); ts, to = shadow(tr, dy=26, blur=20, a=0.45)
    paste(b, ts, (W - tr.width) / 2 - to, 250 - to)
    tl2, _ = title([dict(t="FREEDOM", k="serif", s=250, col=YEL, shcol=(28, 22, 92), maxw=990), dict(t="TO INVEST", k="cond", s=108, col=YEL, shcol=(28, 22, 92), track=0.45, maxw=960, gap=0.18)], 1000)
    b.alpha_composite(tl2); b = fade(b, "bottom", 760, (8, 8, 30), 0.42, 1.8)
    b = grunge(b, t, 0.24); pill(b, "the freedom to invest", 2, 1500); return b
meta("s22", t="38.62-41.90", line="Cash gives your club the freedom to invest in what matters most.", ref="fav_90.png", refid="fav_90 · JAM P50-P51 7.34-9.4 (JAM JAR)",
     motion="LAYERS: purple flat bg + soft glow at the top | CASH (behind the trophy, like JAM behind the lid) | trophy 1260 px tall (was 860), top at y 300 | FREEDOM + tracked TO INVEST in front of the stem (like JAR / EXPERIMENT), short deep-purple shadow so yellow reads over the gold | dark fade from the bottom, 42 % max with a 760 px feather | grunge. Torn-paper wipe in; trophy drops 2 steps + 16 px bounce; slow push.")
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
    k = 0.80; cl = cl.resize((round(cl.width * k), round(cl.height * k)), Image.LANCZOS)
    ox, oy = 720 - 765 * k, 1230 - 980 * k                                                       # boot tip on the cliff at (720, 1230)
    P = lambda x, y: (ox + x * k, oy + y * k)
    boot, hand_top, grip, rope_bot = P(765, 980), P(590, 92), P(620, 332), P(516, 1199)
    peak = (hand_top[0] + 18, hand_top[1] + 14)
    edge = [(250, 1990), (boot[0] - 30, boot[1] + 160), (boot[0] + 2, boot[1] + 6), (peak[0] + 4, peak[1] + 40), peak, (peak[0] + 70, peak[1] + 22),
            (820, peak[1] + 80), (1000, peak[1] + 150), (1130, peak[1] + 190)]
    rr = random.Random(4); jag = []
    for (x0, y0), (x1, y1) in zip(edge, edge[1:]):
        nseg = max(2, int(math.hypot(x1 - x0, y1 - y0) / 34))
        for i in range(nseg): u = i / nseg; jag.append((x0 + (x1 - x0) * u + rr.uniform(-7, 7), y0 + (y1 - y0) * u + rr.uniform(-7, 7)))
    jag.append(edge[-1])
    tex = cover(ImageEnhance.Brightness(bw(Image.open(R / "flow/v3/rock.jpg").convert("RGBA"), 0.9)).enhance(1.35), s=1.3)
    rm = Image.new("L", (W, H), 0); ImageDraw.Draw(rm).polygon(jag + [(1130, H + 60), (250, H + 60)], fill=255)
    rock = Image.new("RGBA", (W, H), (0, 0, 0, 0)); rock.paste(tex, (0, 0), rm.filter(ImageFilter.GaussianBlur(1.2))); rock = halftone(rock, 0.06, 11)
    rs, ro = shadow(rock, dx=-14, dy=10, blur=16, a=0.45)
    rope = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(rope)
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
    ropeline([rope_bot, (rope_bot[0] - 20, rope_bot[1] + 200), (rope_bot[0] - 70, rope_bot[1] + 420), (rope_bot[0] - 110, 2010)])  # hangs off the bottom
    return bg, rs, ro, cl, (ox, oy), rope
def s24(t=1.9):
    tq = q(t); bg, rs, ro, cl, (ox, oy), rope = _s24(); b = bg.copy()
    po = 1 - 0.07 * min(1, tq / 2.0); AX, AY = 540, 1100                                         # collage pull-out to x0.93, bg static
    lines = [dict(t="WHAT COULD", k="serif", s=200, maxw=930, x=75), dict(t="YOUR CLUB", k="serif", s=200, maxw=930, x=75), dict(t="RAISE?", k="serif", s=300, maxw=930, x=75)]
    tl, _ = title(lines, 120, gap=0.12, align="left", prog=typed(t, 0.4, 2.6), step=math.floor(tq * 12), seed=24)
    put(b, tl, 0, 0, po, AX, AY)
    put(b, rs, -ro, -ro, po, AX, AY)
    off = 330 if tq < 0.12 else 135 if tq < 0.2 else 60 if tq < 0.32 else 15 if tq < 0.4 else 0       # ref: 330→135→60→15→0
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); paste(lay, cl, ox + off, oy); lay.alpha_composite(rope if off == 0 else Image.new("RGBA", (W, H)))
    put(b, lay, 0, 0, po, AX, AY)
    b = grunge(b, tq, 0.24); pill(b, "what your club could raise?", 4, 1384); return b
meta("s24", t="46.72-50.30", line="Want to see what your club could raise? Link in bio.", ref="gold_49.3.jpg", refid="fav_89 · GOLD P32-P34 47.56-51.04 (climber)",
     motion="LAYERS: red flat bg + soft centre glow (static) | title, 3 lines each fitted to 930 px, leading 0.12 (ref 10-14 px), BEHIND the man | rock cliff | new climber (Flow) with boots on the wall and his hand on the summit; rope tied to a piton and hanging off the bottom edge: no cut visible anywhere | grunge. Climber pops in at +330 px, offsets 330→135→60→15→0; title typed 2.6 chars/step; collage (title+rock+climber) pull-out to x0.93, bg static.")

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
        d.text((14, 14), "docucollage v3b storyboard — left: OUR frame · middle: REFERENCE · right: timing, line, motion PER LAYER", font=fS, fill=(200, 200, 200))
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
        for i, (lab, p) in enumerate([("v3 (before)", SB / "frames" / f"{sid}.png"), ("v3b (after)", FR / f"{sid}.png"), ("REF " + S[sid]["refid"].split("·")[0], SB / "ref" / S[sid]["ref"])]):
            if p.exists(): sh.paste(ImageOps.fit(Image.open(p).convert("RGB"), (TW2, TH2)), (10 + i * (TW2 + 10), 40))
            d.text((14 + i * (TW2 + 10), 10), f"{sid.upper()}  {lab}", font=fS, fill=(255, 208, 141))
        sh.save(CMP / f"cmp_{sid}.jpg", quality=86)
    print("board done")

# ---------------- motion test: ours (12 fps graphics) | ref, with labels ----------------
SEG = [("s01", 1.9, "DIV6ZPFIx3y/reel1080.mp4", 0.0, "S01 · layers: flat beige bg (30 % parallax) / man moving like a camera / title / grunge  ·  ref GOLD 0.0-1.9"),
       ("s02", 1.8, "DIV6ZPFIx3y/reel1080.mp4", 1.84, "S02 title · leading 0.09 x cap, EB Garamond 800 + stroke, COMPANY 970 px  ·  ref GOLD 1.84"),
       ("s11", 3.0, "DIV6ZPFIx3y/reel1080.mp4", 20.4, "S11 · push + burst +3/+7/+6/+3/+5 %, stadium 45 % of the zoom, no feet  ·  ref GOLD 20.4-23.4"),
       ("s13", 2.1, "DF0jP-vIYlk/reel.mp4", 33.9, "S13 · navy sky / houses (rise 180 px) / woman (rise 620 px), feathered top fade  ·  ref ARR 33.9-36.0"),
       ("s16", 2.8, "DIV6ZPFIx3y/reel1080.mp4", 11.6, "S16 · sky 0.3 / field 0.6 / runner / spectators 1.5x, settle x1.3→1.0 then pull-out  ·  ref GOLD 11.6-14.4"),
       ("s24", 2.0, "DIV6ZPFIx3y/reel1080.mp4", 47.82, "S24 · climber pops +330→0, title behind him, rope off-frame, pull-out x0.93  ·  ref GOLD 47.8-49.8")]
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
            d.text((14, TOP + 8), "OURS v3b (12 fps graphics)", font=fT, fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0))
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
