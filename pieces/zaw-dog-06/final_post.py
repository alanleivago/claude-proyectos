"""venv: renders/frames (Blender 1080x1920) -> renders/post (final picture) -> the mp4 with sound/out/final_mix.wav.
zaw-dog #6. Per frame: the 3D-text edge pixelation, then the PS1 dither (270x480 base, 15-bit Bayer) made temporally STABLE, THEN the
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
TITLE = "Your Dog Is Stressed Because You Are"
GROUPS = [[k] for k in BEATS]


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
    global TEXT_KEEP
    TEXT_KEEP = None
    if name in TEXT_SHOTS:
        im = pixelate_text(im, name=name)
    if name in BD.NIGHT:
        im = BD.night(im)
    return im


TEXT_SHOTS = {"02a", "02b", "03a", "03b", "04", "05", "06a", "06b", "07a", "08", "09", "10", "11a", "12a", "12b"}   # the big yellow 3D texts


COLOR_TEXT = {"08": "red"}   # zaw-dog-05 (user): the check is GREEN, the cross RED - same stepped edges


def pixelate_text(im, px=None, name=None):
    """Kaneda method, re-tuned (user, zaw-dog-04): the big yellow 3D text keeps CLEAN letters with only slightly stepped
    edges, like the approved zaw-dog-03 texts. Per text group (letters joined by a small dilation):
    - block size = ~1/11 of that group's cap height, snapped to the PS1 dither grid (4 px at 1080 wide; 4..8 px), so a
      small "UC SAN DIEGO" gets 4 px steps and a big "36" 8 px - never the old fixed 10 px that melted small words;
    - a block turns text only when the text covers MOST of it (> 55 %); minority blocks keep the background, so the
      counters (0 6 8 4 A D), the gaps between letters and between words stay open.
    Runs on the raw frame, before the dither and before the Courier captions (never touches them)."""
    from scipy import ndimage as nd
    a = np.asarray(im).astype(np.float32); Hh, W = a.shape[:2]; r, g, b = a[..., 0], a[..., 1], a[..., 2]
    front = (r > 215) & (g > 185) & (b < 110) & (r - b > 120)                       # #FFE21A
    col = COLOR_TEXT.get(name)
    if col == "green":                                                              # #22D23A front, #0E7A1E side
        front |= (g > 170) & (r < 110) & (b < 120) & (g - r > 90)
    elif col == "red":                                                              # #F0221C front, #8E0E0A side
        front |= (r > 200) & (g < 80) & (b < 80) & (r - g > 150)
    if front.sum() < 50:
        return im
    near = nd.binary_dilation(front, iterations=int(0.02 * W))
    side = near & (r > 120) & (g > 80) & (b < 70) & (r - b > 90) & (g < r)          # #B8860B extrusion, only beside the text
    if col == "green":
        side |= near & (g > 80) & (r < 70) & (b < 70) & (g - r > 40)
    elif col == "red":
        side |= near & (r > 100) & (g < 50) & (b < 50) & (r - g > 70)
    yel = front | side
    out = a.copy(); grid = max(1, W // 270)                                           # the dither's pixel (4 px at 1080)
    keep = np.zeros((Hh, W), bool)                                                   # the solid text blocks (laid back over the dither)
    groups, n = nd.label(nd.binary_dilation(yel, iterations=int(0.012 * W)))
    for gi, sl in enumerate(nd.find_objects(groups), 1):
        gm = (groups[sl] == gi) & yel[sl]
        lab, nl = nd.label(front[sl] & (groups[sl] == gi))
        hs = [o[0].stop - o[0].start for o in nd.find_objects(lab) if o is not None and (o[0].stop - o[0].start) > 6]
        if not hs:
            continue
        cap = float(np.median(hs))
        p = px or int(np.clip(round(cap / 11 / grid) * grid, grid, 2 * grid))
        y0, x0 = (sl[0].start // p) * p, (sl[1].start // p) * p                     # blocks aligned to the dither grid
        y1, x1 = min(Hh, -(-sl[0].stop // p) * p), min(W, -(-sl[1].stop // p) * p)
        A = a[y0:y1, x0:x1]; M = np.zeros((y1 - y0, x1 - x0), bool)
        M[sl[0].start - y0:sl[0].stop - y0, sl[1].start - x0:sl[1].stop - x0] = gm
        hb, wb = (y1 - y0) // p, (x1 - x0) // p
        A = A[:hb * p, :wb * p].reshape(hb, p, wb, p, 3); Mb = M[:hb * p, :wb * p].reshape(hb, p, wb, p)
        cnt = Mb.sum(axis=(1, 3))[..., None]
        fg = (A * Mb[..., None]).sum(axis=(1, 3)) / np.maximum(cnt, 1)
        bg = (A * ~Mb[..., None]).sum(axis=(1, 3)) / np.maximum(p * p - cnt, 1)
        touched = (cnt > 0)[..., 0]; isfg = (cnt > 0.55 * p * p)[..., 0]
        blk = np.where(isfg[..., None], fg, bg)
        up = np.repeat(np.repeat(blk, p, 0), p, 1); tu = np.repeat(np.repeat(touched, p, 0), p, 1)
        sub = out[y0:y0 + hb * p, x0:x0 + wb * p]; sub[tu] = up[tu]
        keep[y0:y0 + hb * p, x0:x0 + wb * p] |= np.repeat(np.repeat(isfg, p, 0), p, 1)
    global TEXT_KEEP
    TEXT_KEEP = (Image.fromarray(out.astype(np.uint8)), keep)
    return Image.fromarray(out.astype(np.uint8))


TEXT_KEEP = None


def text_over(out, f):
    """after the dither: the stepped text blocks go back on top un-dithered (clean bright yellow, like zaw-dog-03),
    so the 4 px dither does not stack a second blockiness / colour noise on the letters."""
    global TEXT_KEEP
    if TEXT_KEEP is None:
        return out
    src, m = TEXT_KEEP; TEXT_KEEP = None
    o = np.asarray(out).copy(); o[m] = np.asarray(src)[m]
    return Image.fromarray(o)


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
        out = text_over(out, f)                                                      # (the 3D-text blocks stay clean)
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
