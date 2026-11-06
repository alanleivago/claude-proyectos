"""venv: raw Blender frames -> PS1 dither (photoprop.ps1_post, BEFORE the captions) ->
LPS captions of video #1 (yellow #F5EB30, lowercase, black stroke, Arial Bold 60, baseline at 67.5% H, blocks from
timing.json "captions"). Captions hide while the 3D "60" (s01) and "1184" (s02) are on screen.
  python post.py [a,b]     renders/frames/#####.png -> renders/post/#####.png
  python post.py --board   review/board/raw/shot_XX?_#####.png (half res) -> review/board/ + contact sheets"""
import glob, json, os, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H)
from photoprop import ps1_post  # noqa: E402

TIM = json.load(open(os.path.join(H, "voice", "timing.json")))
FPS = 30
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def W(line, prefix, end=False):
    w = next(w for w in TIM["words"] if w["line"] == line and w["w"].strip(".,!?-").lower().startswith(prefix))
    return w["e"] if end else w["s"]


T0 = [c / FPS for c in CUT]
T1 = T0[1:] + [END / FPS]
# 3D numbers on screen (build.py s01 "60": 0.05 s into the shot until "because"; s02 "1184": "july"+0.25 until "erfurt")
NUMBERS = [(T0[0] + 0.05, W(0, "because") - 0.1 + 0.3),
           (W(1, "july") + 0.25, W(1, "erfurt") - 0.1)]
BLACK = set()
CAP_Y = {3: 0.82, 4: 0.82, 6: 0.82, 9: 0.82, 10: 0.82, 11: 0.82, 12: 0.82}   # QA: in the face close-ups the caption sat on the mouth -> lower


def caption_at(t):
    cur = None
    for c in TIM["captions"]:
        if c["s"] - 0.05 <= t:
            cur = c
    if not cur:
        return ""
    if any(a <= t < b for a, b in NUMBERS):                    # the caption hides while a 3D number shows
        return ""
    return cur["text"]


def smear(im, px):
    """Horizontal motion smear: mean of shifted copies over px pixels (phone-video whip pan)."""
    if px < 3:
        return im
    a = np.asarray(im).astype(np.float32); n = max(3, int(px / 6)); acc = np.zeros_like(a)
    for k in range(n):
        acc += np.roll(a, int(-px / 2 + px * k / (n - 1)), axis=1)
    return Image.fromarray((acc / n).astype(np.uint8))


def process(im, f):
    """One frame (any size): smear, dither, black, caption."""
    W_, Hh = im.size; k = W_ / 1080; t = f / FPS
    shot = max(i for i, c in enumerate(CUT) if c <= f)
    im = im.convert("RGB")
    im = ps1_post(im, scale=max(1, round(4 * k)))
    if f in BLACK:
        im = Image.new("RGB", im.size, (0, 0, 0))
    txt = caption_at(t)
    if txt:
        d = ImageDraw.Draw(im)
        d.text((W_ / 2, Hh * CAP_Y.get(shot, 0.675)), txt, font=ImageFont.truetype(FONT, round(60 * k)), fill=(245, 235, 48),
               anchor="ms", stroke_width=max(2, round(5 * k)), stroke_fill=(0, 0, 0))
    return im


if "--board" in sys.argv:
    raw = sorted(glob.glob(os.path.join(H, "review", "board", "raw", "shot_*.png")))
    out = os.path.join(H, "review", "board"); tiles = []
    for p in raw:
        m = re.search(r"shot_(\d+)([abc])_(\d+)\.png", p); f = int(m.group(3))
        im = process(Image.open(p), f); im.save(os.path.join(out, os.path.basename(p)))
        tiles.append((int(m.group(1)), m.group(2), f, im))
    fnt = ImageFont.truetype(FONT, 26)
    half = (len(tiles) + 1) // 2
    for sheet, sel in (("a", tiles[:half]), ("b", tiles[half:])):
        cols = 8; tw, th = 270, 480; rows = (len(sel) + cols - 1) // cols
        S = Image.new("RGB", (cols * tw, rows * (th + 40)), (24, 24, 28)); d = ImageDraw.Draw(S)
        for i, (sh, tag, f, im) in enumerate(sel):
            x, y = (i % cols) * tw, (i // cols) * (th + 40)
            S.paste(im.resize((tw, th), Image.BOX), (x, y + 40))
            d.text((x + 8, y + 6), f"{sh}{tag}  {f / FPS:.1f}s", font=fnt, fill=(240, 240, 240))
        S.save(os.path.join(out, f"board_{sheet}.jpg"), quality=90)
    print("board", len(tiles))
else:
    a, b = (int(x) for x in sys.argv[1].split(",")) if len(sys.argv) > 1 else (0, END - 1)
    src, dst = os.path.join(H, "renders", "frames"), os.path.join(H, "renders", "post"); os.makedirs(dst, exist_ok=True)
    for f in range(a, b + 1):
        process(Image.open(os.path.join(src, f"{f:05d}.png")), f).save(os.path.join(dst, f"{f:05d}.png"))
    print("post", a, b)
