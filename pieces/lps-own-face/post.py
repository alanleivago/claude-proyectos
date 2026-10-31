"""venv: renders/frames/#####.png -> renders/post/#####.png with LPS captions (yellow #F5EB30, lowercase, black
stroke, baseline at 67.5% H, 1 line, pop on the first word's onset), the phone-click white flash (shot 5), the pixelated title (shot 7) and the
cross-eyed double image on the POV nose shots (15-16).  python post.py [a,b]"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
TIM = json.load(open(os.path.join(H, "voice", "timing.json")))
FPS = 30
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
FONT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 60)
SRC, DST = os.path.join(H, "renders", "frames"), os.path.join(H, "renders", "post")
os.makedirs(DST, exist_ok=True)


def shot_of(f):
    return max(i for i, c in enumerate(CUT) if c <= f)


def caption_at(t):
    cur = None
    for c in TIM["captions"]:
        if c["s"] - 0.05 <= t:
            cur = c
    if cur and cur["text"] in ("30 % wider", "in 1977"):     # the 3D number replaces the caption (LPS rule)
        return ""
    return cur["text"].replace(" %", "%") if cur else ""


def pixelate_logo(im, px=8):
    """Shot 7: the yellow 3D title gets PS1-chunky pixels (8 px blocks; letter / background split per block)."""
    a = np.asarray(im).astype(np.float32); Hh, W = a.shape[:2]
    yel = (a[..., 0] > 150) & (a[..., 1] > 120) & (a[..., 2] < 110) & (a[..., 0] - a[..., 2] > 90)
    hb, wb = Hh // px, W // px
    A = a[:hb * px, :wb * px].reshape(hb, px, wb, px, 3); M = yel[:hb * px, :wb * px].reshape(hb, px, wb, px)
    n = M.sum(axis=(1, 3))[..., None]
    fg = (A * M[..., None]).sum(axis=(1, 3)) / np.maximum(n, 1)
    bg = (A * ~M[..., None]).sum(axis=(1, 3)) / np.maximum(px * px - n, 1)
    blk = np.where(n > px * px * 0.45, fg, bg)
    touched = (n > 0)[..., 0]
    up = np.repeat(np.repeat(blk, px, 0), px, 1); tu = np.repeat(np.repeat(touched, px, 0), px, 1)
    out = a.copy(); sub = out[:hb * px, :wb * px]
    sub[tu] = up[tu]
    return Image.fromarray(out.astype(np.uint8))


def frame(f):
    im = Image.open(os.path.join(SRC, f"{f:05d}.png")).convert("RGB")
    W, Hh = im.size; t = f / FPS; s = shot_of(f); ts = (f - CUT[s]) / FPS
    if s in (14, 15):                          # cross-eyed double image (0-based shot index)
        a = np.asarray(im).astype(np.float32)
        sh = int(W * 0.025 * (0.6 + 0.4 * np.sin(ts * 3)))
        b = np.roll(a, sh, axis=1)
        im = Image.fromarray((a * 0.62 + b * 0.38).astype(np.uint8))
    if s == 6:                                 # title pixelation
        im = pixelate_logo(im)
    if s == 4 and 0.45 <= ts < 0.62:          # phone click flash
        k = 1 - (ts - 0.45) / 0.17
        im = Image.blend(im, Image.new("RGB", im.size, (255, 255, 255)), 0.85 * k)
    txt = caption_at(t)
    if txt:
        d = ImageDraw.Draw(im)
        d.text((W / 2, Hh * 0.675), txt, font=FONT, fill=(245, 235, 48), anchor="ms", stroke_width=5, stroke_fill=(0, 0, 0))
    im.save(os.path.join(DST, f"{f:05d}.png"))


a, b = (int(x) for x in sys.argv[1].split(",")) if len(sys.argv) > 1 else (0, END - 1)
for f in range(a, b + 1):
    frame(f)
print("post", a, b)
