"""venv: review/raw (Blender, 540x960) -> storyboard.
Each frame: split panels stacked, night grade (kitchen), ps1_post dither (270x480 base), Zaw captions
(typewriter slab Courier New Bold, yellow, black stroke, 2-word blocks, baseline 67 %, the block live at that frame).
Writes review/board/frames/NN_<beat>.jpg and review/board/board_1.jpg, board_2.jpg (7 beats each).
python board.py"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402

RAW, OUT = os.path.join(H, "review", "raw"), os.path.join(H, "review", "board")
os.makedirs(os.path.join(OUT, "frames"), exist_ok=True)
TIM = json.load(open(os.path.join(H, "voice", "timing.json")))
BEATS = json.load(open(os.path.join(H, "review", "beats.json")))
SCRIPT = [l["text"] for l in json.load(open(os.path.join(H, "voice", "script.json")))["lines"]]
FPS = 30
CAP_FONT = "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"
CAP_COL = (255, 238, 64)
NIGHT = set()
LABELS = {}
PANEL_GAIN = {}


def split_on(name, k, f):
    return 1.0


def dim(im, on):
    if on >= 0.999:
        return im
    g = ImageEnhance.Color(im).enhance(0.35 + 0.65 * on)
    return ImageEnhance.Brightness(g).enhance(0.5 + 0.5 * on)


def label(d, x, y, text, s, on=1.0):
    f2 = ImageFont.truetype(CAP_FONT, int(30 * s))
    tw = d.textlength(text, font=f2)
    fill = tuple(int(250 * (0.55 + 0.45 * on)) for _ in range(3))
    d.rectangle((x, y, x + tw + 24 * s, y + 40 * s), fill=fill, outline=(0, 0, 0), width=max(2, int(3 * s)))
    d.text((x + 12 * s + tw / 2, y + 21 * s), text, font=f2, fill=(10, 10, 10), anchor="mm")
NOTES = {"01a": "LEVEL dog height, push-in; the dog faces us, suspicious; HERO BARK in the gap + snap-zoom",
         "01b": "HUMAN height, orbit + rise on his lying grin (smile face); the dog side-eyes",
         "02a": "gentle HIGH over the dog's shoulder, push-in: he points at the FOOD bowl",
         "02b": "LEVEL low FOLLOW + whip-in: the dog runs straight over and eats (kibble crunch)",
         "03a": "TOP-DOWN insert, slow rotate + crane down: full bowl | empty bowl; KYOTO, 2015",
         "03b": "HUMAN height 3/4 push-in: he points at the EMPTY bowl; the dog trots to it",
         "04a": "LEVEL behind the empty bowl: sniff ... nothing; looks up SHOCKED -> judging; snap + red cross",
         "04b": "gentle HIGH side orbit: he points at the food again; the dog sits and does not move",
         "04c": "HUMAN face push, handheld: smile -> SCARED (gasp #1)",
         "05a": "HUMAN height WHIP-in + push: the MAILMAN points at the food; owner scared beside him",
         "05b": "from behind the food bowl, push: the dog sprints at us, happy (off they went)",
         "06a": "CRANE up beside the mailman: the dog at his feet, wagging, looking up; he laughs",
         "06b": "HUMAN face push + snap: the owner SURPRISED (gasp #2) -> CRYING",
         "06c": "gentle HIGH pull-out that rises: the dog beams by the mailman; the owner slumps, crying"}
TEXT_SHOTS = {"03a", "04a"}   # big yellow 3D texts: final_post.pixelate_text (cap/11 steps)


def caption_at(t):
    cur = None
    for c in TIM["captions"]:
        if c["s"] - 0.05 <= t:
            cur = c
    if not cur:
        return ""
    hold = cur["e"] + 0.6                                         # a block lingers 0.6 s ... but never across a line cut
    nxt = [s_ for s_ in TIM["starts"] if s_ > cur["s"] + 0.01]
    if nxt:
        hold = min(hold, nxt[0] - 0.15 - 1.5 / FPS)               # never on the first frame of the next shot
    return cur["text"].replace("bbc", "BBC") if t < hold else ""


def base(name):
    p = os.path.join(RAW, f"{name}.png"); fb = BEATS[name][2]
    if os.path.exists(p):
        im = Image.open(p).convert("RGB")
        if name in LABELS:
            label(ImageDraw.Draw(im), 12, 12, LABELS[name][0], 1)
        return im
    ps = sorted(f for f in os.listdir(RAW) if f.startswith(name + "_p"))
    im = Image.new("RGB", (540, 960)); h = 960 // len(ps)
    for k, f in enumerate(ps):
        a = Image.open(os.path.join(RAW, f)).convert("RGB")
        if (name, k) in PANEL_GAIN:
            a = ImageEnhance.Brightness(a).enhance(PANEL_GAIN[(name, k)])
        on = split_on(name, k, fb)
        im.paste(dim(a, on), (0, k * h))
        d = ImageDraw.Draw(im)
        d.line((0, k * h, 540, k * h), fill=(0, 0, 0), width=4)
        if name in LABELS:
            label(d, 12, k * h + 12, LABELS[name][k], 1, on)
    return im


def night(im):
    a = np.asarray(im).astype(np.float32) / 255
    h, w, _ = a.shape; y, x = np.mgrid[:h, :w]
    glow = np.exp(-(((x - w * 0.55) / (w * 0.55)) ** 2 + ((y - h * 0.15) / (h * 0.55)) ** 2))[..., None]
    lamp = np.array([1.0, 0.86, 0.62]); blue = np.array([0.42, 0.48, 0.75])
    out = a * (blue + (lamp - blue) * glow) * 1.05
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))


def caption(im, txt):
    d = ImageDraw.Draw(im); W, Hh = im.size
    size = int(W * 0.085)
    while size > 20 and d.textlength(txt, font=ImageFont.truetype(CAP_FONT, size)) > W * 0.86:
        size -= 1                                        # same safe margins as final_post: long blocks shrink to 86 % of the width
    d.text((W / 2, Hh * 0.67), txt, font=ImageFont.truetype(CAP_FONT, size), fill=CAP_COL, anchor="ms", stroke_width=max(3, W // 140), stroke_fill=(0, 0, 0))


def main():
    frames = []
    for i, (name, (f0, f1, fb)) in enumerate(BEATS.items(), 1):
        im = base(name)
        keep = None
        if name in TEXT_SHOTS:                                        # same as final_post: cap/11 steps, then laid back over the dither
            import final_post as FP
            FP.pixelate_text(Image.open(os.path.join(RAW, f"{name}.png")).convert("RGB").resize((1080, 1920), Image.LANCZOS), name=name)
            src, m = FP.TEXT_KEEP; FP.TEXT_KEEP = None
            keep = (src.resize((540, 960), Image.NEAREST), Image.fromarray(m.astype(np.uint8) * 255).resize((540, 960), Image.NEAREST))
        if name in NIGHT:
            im = night(im)
        im = ps1_post(im, scale=2)                                    # 540 -> 270x480 base, 15-bit Bayer, x2 nearest
        if keep:
            im.paste(keep[0], (0, 0), keep[1])
        caption(im, caption_at(fb / FPS))
        frames.append((name, f0, f1, fb, im.copy()))
        L_ = max(k for k, s_ in enumerate(TIM["starts"]) if round((s_ - 0.15) * FPS) <= f0 or k == 0)
        ann = Image.new("RGB", (im.width, im.height + 150), (16, 16, 16)); ann.paste(im, (0, 150)); da = ImageDraw.Draw(ann)
        fa = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22); fb_ = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 17)
        da.text((8, 6), f"{name}   t {fb / FPS:.2f} s   (shot {f0 / FPS:.2f}-{f1 / FPS:.2f} s)", font=fa, fill=(245, 235, 48))
        line = f"L{L_ + 1}: " + SCRIPT[L_]
        for j, s_ in enumerate([line[k:k + 60] for k in range(0, len(line), 60)][:2]):
            da.text((8, 38 + 20 * j), s_, font=fb_, fill=(225, 225, 225))
        for j, s_ in enumerate([NOTES.get(name, "")[k:k + 60] for k in range(0, len(NOTES.get(name, "")), 60)][:2]):
            da.text((8, 88 + 20 * j), "cam: " + s_ if j == 0 else "     " + s_, font=fb_, fill=(150, 200, 255))
        ann.save(os.path.join(OUT, "frames", f"{i:02d}_{name}.jpg"), quality=92)

    line_of = lambda f: max(k for k, s in enumerate(TIM["starts"]) if round((s - 0.15) * FPS) <= f or k == 0)
    FS = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
    FN = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 17)
    def wrap(text, n=33):
        ln, out = "", []
        for w in text.split():
            if len(ln) + len(w) + 1 > n:
                out.append(ln); ln = w
            else:
                ln = (ln + " " + w).strip()
        return out + [ln]


    CW, CH, TXT = 300, 533, 150
    for b, chunk in enumerate((frames[:7], frames[7:]), 1):  # 14 shots: 7 + 7
        cols = 7; rows = (len(chunk) + cols - 1) // cols
        sh = Image.new("RGB", (cols * CW, rows * (CH + TXT) + 50), (22, 20, 18)); d = ImageDraw.Draw(sh)
        d.text((10, 12), f"Doggo Poly Shorts #7 'Your Dog Knows When You\'re Lying' - storyboard v1 {b}/2  (voice {TIM['end']:.1f} s, 30 fps)",
               font=FS, fill=(245, 235, 48))
        for k, (name, f0, f1, fb, im) in enumerate(chunk):
            x, y = (k % cols) * CW, 50 + (k // cols) * (CH + TXT)
            sh.paste(im.resize((CW - 8, CH - 8)), (x + 4, y + 4))
            L = line_of(f0)
            d.text((x + 6, y + CH + 2), f"{name}  {f0 / FPS:.2f}-{f1 / FPS:.2f}s ({(f1 - f0) / FPS:.1f}s)", font=FS, fill=(255, 255, 255))
            for j, s in enumerate(wrap(f"L{L + 1}: " + SCRIPT[L])[:3]):
                d.text((x + 6, y + CH + 28 + 19 * j), s, font=FN, fill=(200, 200, 200))
            for j, s in enumerate(wrap(NOTES.get(name, ""))[:2]):
                d.text((x + 6, y + CH + 88 + 19 * j), s, font=FN, fill=(150, 200, 255))
        sh.save(os.path.join(OUT, f"board_{b}.jpg"), quality=88)
        print(os.path.join(OUT, f"board_{b}.jpg"))


if __name__ == "__main__":
    main()
