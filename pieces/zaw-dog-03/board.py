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
NIGHT = {"01a", "01b", "02", "14"}
LABELS = {"04": ["OWNER", "STRANGER"], "05": ["OWNER", "STRANGER"], "03a": ["GOLDSMITHS, LONDON, 2012"], "03b": ["GOLDSMITHS, LONDON, 2012"], "10a": ["THE DOOR TEST, 2018"],
          "10b": ["THE DOOR TEST, 2018"], "12": ["CRYING", "HUMMING"], "13a": ["CRYING", "HUMMING"]}
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
NOTES = {"01a": "night, Zaw framing: the dog faces us on the rug, he sobs behind; on the bark its head snaps up, shocked",
         "01b": "slow push-in on the dog's shocked face, the sobbing owner behind",
         "02": "over his shoulder onto the TV (in-house cartoon dog waving at a train); dog between, side-eye; slow track left",
         "03a": "street bridge shot: brick house, warm window, black car; slow push", "03b": "tilt to the sky: 18 Flow dog portraits pop in 3 rows (3 pops)",
         "04": "day split: top = owner fake-cries into his hands; bottom = the stranger (own face/body) in the armchair; dog sits between",
         "05": "same split: he hums (3D notes); she chats with her hands (3D bubble); the dog yawns",
         "06": "side-on at knee height: dog walks in, rests its chin on his knee (sad); '15/18'",
         "07": "hard cut: he hums; dog sits side-on, hind paw up scratching, head tipped, side-eye; '6/18'",
         "08a": "she cries in the armchair; dog trots past the owner (arms open) to her (happy); track",
         "08b": "tight on her palm-down hand held out: the dog sniffs, then licks it (happy wag)",
         "09": "floor-level side: dog creeps in head low, ears back, tail tucked (sad), nuzzles her knee; slow push",
         "10a": "hallway wide from the far end, dog height: he walks into the bedroom doorway (clear acrylic door)",
         "10b": "the door clacks shut on 2 magnets; through it he sits on the bedroom floor",
         "11a": "over the dog's head through the clear door: he cries by the bed", "11b": "hard jump, same shot: he hums + sways",
         "12": "split, static: crying / humming; in each the dog noses the door open; '~SAME' pops",
         "13a": "race: crying side = dog already at his side; humming side = still sniffing + pawing the frame, notes",
         "13b": "slow push on the crying side: dog at his lap (happy, tongue out); big '3X' pops",
         "14": "night living room: 3/4 CU, the dog's nose an inch from his face (sad); cut on 'you' into shot 1 (loop)"}


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
        hold = min(hold, nxt[0] - 0.15)
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
    for b, chunk in enumerate((frames[:10], frames[10:]), 1):
        cols = 5; rows = (len(chunk) + cols - 1) // cols
        sh = Image.new("RGB", (cols * CW, rows * (CH + TXT) + 50), (22, 20, 18)); d = ImageDraw.Draw(sh)
        d.text((10, 12), f"zaw-dog #3 'Your Dog Thinks You're Hurt When You Cry' - storyboard {b}/2  (voice {TIM['end']:.1f} s, 30 fps)",
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
