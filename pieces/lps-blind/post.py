"""venv: raw Blender frames -> PS1 dither (photoprop.ps1_post, BEFORE the captions) -> s03 smear -> blackout frames ->
LPS captions of video #1 (yellow #F5EB30, lowercase, black stroke, Arial Bold 60, baseline at 67.5% H, blocks from
timing.json "captions"). The caption block that says "40" hides while the 3D "40 MIN" is on screen.
  python post.py [a,b]     renders/frames/#####.png -> renders/post/#####.png
  python post.py --board   review/board/raw/shot_XX?_#####.png (half res) -> review/board/ + contact sheets"""
import glob, json, os, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H)
from photoprop import ps1_post  # noqa: E402
import motion as MO  # noqa: E402

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
NUMBERS = [(W(0, "40") - 0.05, W(0, "and") + 0.25),          # s01 "40 MIN" (spins out after "and")
           (W(9, "40") - 0.05, T1[9])]                        # s10 "40 MIN" to the end
BLACK = {round(W(0, "blind") * FPS) + 2}                      # s01: the picture cuts to black for one frame
_b = W(9, "blackouts")                                        # s10: a few one-frame blackouts on "tiny blackouts"
BLACK |= {round((_b + k) * FPS) for k in (0.0, 0.17, 0.3, 0.4)}
CAP_Y = {0: 0.8, 1: 0.8, 4: 0.8, 5: 0.8, 6: 0.8, 7: 0.8, 8: 0.8}   # QA: in the face close-ups the caption sat on the eyes (the topic) -> lower third


def caption_at(t):
    cur = None
    for c in TIM["captions"]:
        if c["s"] - 0.05 <= t:
            cur = c
    if not cur:
        return ""
    if any(a <= t < b for a, b in NUMBERS) and any(ch.isdigit() for ch in cur["text"]):
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
    if shot == 2:
        im = smear(im, MO.s03_smear(t - T0[2]) * k)
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
    for sheet, shots in (("a", range(1, 6)), ("b", range(6, 11))):
        sel = [x for x in tiles if x[0] in shots]
        cols = 6; tw, th = 270, 480; rows = (len(sel) + cols - 1) // cols
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
