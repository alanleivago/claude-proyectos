"""venv: review/raw (Blender, 540x960) -> storyboard.
Each frame: split panels stacked, night grade (kitchen), ps1_post dither (270x480 base), Zaw captions
(typewriter slab Courier New Bold, yellow, black stroke, 2-word blocks, baseline 67 %, the block live at that frame).
Writes review/board/frames/NN_<beat>.jpg and review/board/board_1.jpg, board_2.jpg (11 beats each).
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
NIGHT = {"11"}
LABELS = {"09b": ["0:30", "2:00", "4:00"], "05a": ["STRONG = JUST LEFT", "FAINT = LATE"], "05b": ["STRONG = JUST LEFT", "FAINT = LATE"],
          "10a": ["0:30"], "10b": ["2:00 + 4:00"]}
PANEL_GAIN = {("05a", 1): 1.06, ("05b", 1): 1.06}   # the hallway half renders a touch darker: same exposure as the top


def split_on(name, k, f):
    """split 05: the half being spoken about is lit, the other is dimmed + greyed; the switch is a 0.2 s crossfade
    timed to the word "faint" (= the 05b cut). Returns 1 = lit, 0 = dimmed."""
    if name not in ("05a", "05b"):
        return 1.0
    a = min(1.0, max(0.0, (f - BEATS["05b"][0] + 3) / 6))
    return 1.0 - a if k == 0 else a


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
NOTES = {"01a": "behind-head, dog yips + turns after the car, push in", "01b": "outside, square to the wall, slow push-in",
         "02a": "nose ECU, front 3/4 from the window, slight push", "02b": "over-shoulder, red ? over the car -> clock",
         "03a": "dog's-nose POV, slow track, wisps off the sofa", "03b": "hallway dolly to the door, floor trail fades", "04a": "lab: the scientist points at the smell-vs-time graph, push-in",
         "04b": "ECU clock, scent-trail hand, ticking second hand", "05a": "split, one push: TOP lit = happy bouncing wag in thick wisps",
         "05b": "split: lights swap on 'faint': BOTTOM lit = sad, lying at the door", "06a": "side MS, hop onto the sofa, slow drift",
         "06b": "over-shoulder at the window, car turns in, slow push", "07a": "low 3/4, friend flaps t-shirt, slow track",
         "07b": "wide high, scent wisps everywhere again, slow push", "08a": "high CU, dutch 9 deg, flat on the rug, push down",
         "08b": "behind the empty sofa, car pulls up", "09a": "wide high, the dog alone on its bed, slow push",
         "09b": "three rooms stacked, slow push each", "10a": "behind the 0:30 dog: one wag, owner in the door",
         "10b": "beside the door: 2:00 + 4:00 dogs launch", "11": "kitchen night, dog judges us, owner unloads",
         "12a": "outside the window, push-in", "12b": "= 01a, loops to the start"}


def caption_at(t):
    cur = None
    for c in TIM["captions"]:
        if c["s"] - 0.05 <= t:
            cur = c
    return cur["text"].replace("bbc", "BBC") if cur and t <= cur["e"] + 0.6 else ""


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
    f = ImageFont.truetype(CAP_FONT, int(W * 0.085))
    d.text((W / 2, Hh * 0.67), txt, font=f, fill=CAP_COL, anchor="ms", stroke_width=max(3, W // 140), stroke_fill=(0, 0, 0))


def main():
    frames = []
    for i, (name, (f0, f1, fb)) in enumerate(BEATS.items(), 1):
        im = base(name)
        if name in NIGHT:
            im = night(im)
        im = ps1_post(im, scale=2)                                    # 540 -> 270x480 base, 15-bit Bayer, x2 nearest
        caption(im, caption_at(fb / FPS))
        p = os.path.join(OUT, "frames", f"{i:02d}_{name}.jpg"); im.save(p, quality=92)
        frames.append((name, f0, f1, fb, im))

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
    for b, chunk in enumerate((frames[:11], frames[11:]), 1):
        cols = 6; rows = (len(chunk) + cols - 1) // cols
        sh = Image.new("RGB", (cols * CW, rows * (CH + TXT) + 50), (22, 20, 18)); d = ImageDraw.Draw(sh)
        d.text((10, 12), f"zaw-dog #1 'Your Dog Can Smell How Late You Are' - storyboard {b}/2  (voice {TIM['end']:.1f} s, 30 fps)",
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
