"""venv: renders/frames (Blender 1080x1920) -> renders/post (final picture) -> the mp4 with sound/out/final_mix.wav.
Per frame: stack split-screen panels (05a/05b with the lit/dimmed halves swapping on "faint", 09b), labels (05, 09b,
10a, 10b), kitchen night grade (11), then the PS1 dither (270x480 base, 15-bit Bayer) made temporally STABLE, THEN the
Zaw captions (Courier New Bold, yellow, black stroke, 2-word blocks, baseline 67 %).
Stable dither (flicker fix): inside a shot, a low-res pixel keeps last frame's dithered colour until its input has moved
more than half a quantisation step from the value it was dithered from - still Bayer-dithered, but slow moves no longer
make the pattern crawl. Each shot (05a+05b as one) runs in order in its own worker.
python final_post.py [post|encode|all]"""
import json, os, subprocess, sys
from multiprocessing import Pool
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import BAYER4  # noqa: E402
import board as BD  # noqa: E402  (caption_at, night, CAP_FONT, CAP_COL, LABELS, split_on, dim, label)

SRC, DST = os.path.join(H, "renders", "frames"), os.path.join(H, "renders", "post")
os.makedirs(DST, exist_ok=True)
FPS = 30
BEATS = json.load(open(os.path.join(H, "review", "beats.json")))
END = max(v[1] for v in BEATS.values())
TITLE = "Your Dog Can Smell How Late You Are"
GROUPS = [["05a", "05b"] if k == "05a" else [k] for k in BEATS if k != "05b"]


def beat_of(f):
    return next(k for k, (a, b, _) in BEATS.items() if a <= f < b)


def raw(f):
    p = os.path.join(SRC, f"{f:05d}.png")
    name = beat_of(f)
    if os.path.exists(p):
        im = Image.open(p).convert("RGB")
        if name in BD.LABELS:
            BD.label(ImageDraw.Draw(im), 24, 24, BD.LABELS[name][0], 2)
    else:
        ps = sorted(x for x in os.listdir(SRC) if x.startswith(f"{f:05d}_p"))
        im = Image.new("RGB", (1080, 1920)); h = 1920 // len(ps)
        for k, x in enumerate(ps):
            a = Image.open(os.path.join(SRC, x)).convert("RGB").resize((1080, h))
            if (name, k) in BD.PANEL_GAIN:
                a = ImageEnhance.Brightness(a).enhance(BD.PANEL_GAIN[(name, k)])
            on = BD.split_on(name, k, f)
            im.paste(BD.dim(a, on), (0, k * h))
            d = ImageDraw.Draw(im); d.line((0, k * h, 1080, k * h), fill=(0, 0, 0), width=8)
            if name in BD.LABELS:
                BD.label(d, 24, k * h + 24, BD.LABELS[name][k], 2, on)
    if name in BD.NIGHT:
        im = BD.night(im)
    return im


def caption(im, txt):
    d = ImageDraw.Draw(im); W, Hh = im.size
    size = int(W * 0.085)
    while size > 40 and ImageDraw.Draw(Image.new("L", (1, 1))).textlength(txt, font=ImageFont.truetype(BD.CAP_FONT, size)) > W * 0.86:
        size -= 2                                        # safe margins: long blocks shrink to fit 86 % of the width
    d.text((W / 2, Hh * 0.67), txt, font=ImageFont.truetype(BD.CAP_FONT, size), fill=BD.CAP_COL, anchor="ms",
           stroke_width=max(3, W // 140), stroke_fill=(0, 0, 0))


STEP = 255 / 31


def group(names):
    fs = [f for n in names for f in range(BEATS[n][0], BEATS[n][1])]
    ref = q = None
    for f in fs:
        im = raw(f); W, Hh = im.size
        a = np.asarray(im.resize((W // 4, Hh // 4), Image.BOX), float)
        h, w, _ = a.shape
        d = np.tile(BAYER4, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
        qn = np.clip(np.round(a / STEP + d) * STEP, 0, 255)
        if q is None:
            q, ref = qn, a.copy()
        else:
            move = (np.abs(a - ref) > 0.5 * STEP).any(-1)
            q[move] = qn[move]; ref[move] = a[move]
        out = Image.fromarray(q.astype(np.uint8)).resize((W, Hh), Image.NEAREST)    # dither first ...
        caption(out, BD.caption_at(f / FPS))                                         # ... then the captions on top, crisp
        out.save(os.path.join(DST, f"{f:05d}.png"))
    return names


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    if mode in ("post", "all"):
        with Pool(8) as p:
            for g in p.imap_unordered(group, sorted(GROUPS, key=lambda n: -(BEATS[n[-1]][1] - BEATS[n[0]][0]))):
                print("post", g, flush=True)
        print("post", END, "frames")
    if mode in ("encode", "all"):
        out = os.path.join(H, "renders", f"{TITLE}.mp4")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-i", os.path.join(DST, "%05d.png"),
                        "-i", os.path.join(H, "sound", "out", "final_mix.wav"), "-c:v", "libx264", "-preset", "slow", "-crf", "17",
                        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], check=True)
        print(out)
