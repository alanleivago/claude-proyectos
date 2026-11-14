"""Ali Abdaal 2 -- 1:1 replica of the ref reel (IG C_QLaqdI0Wd = YT 3Uuwe4BxYJE, "make your job playful", 55.3 s, 29.97 fps).
Everything is a function of the ABSOLUTE ref time T (s), so the storyboard, the motion test and (later) the final render share one code path.
Graphics (collage layers, camera, packs, bubble boxes) are stepped at 12 fps from each shot start (ref cadence 3-2-3-2 at 29.97);
TH video, title words, wavy underline and caption fades run at 29.97 fps, as in the ref.
python prep/board.py board            -> storyboard/v1/board_N.jpg + frames/*.png
python prep/board.py motion           -> storyboard/v1/motion_test.mp4 (ours | ref, ref audio)
python prep/board.py frame T [T ...]  -> storyboard/v1/_T.png"""
import json, math, subprocess, sys
from functools import lru_cache
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

R = Path(__file__).resolve().parent.parent
ROOT = R.parent.parent
IMG, FD = R / "assets/img", R / "assets/fonts"
REF = ROOT / "fuentes/ali-abdaal-2/reel_yt.mp4"
RAW = Path(r"D:\Alan\Fiverr Upwork trabajo fotos y videos\Crudos\Mios\2 ash.mp4")
OUT = R / "storyboard/v1"; FR = OUT / "frames"; FR.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1920
FPS = 30000 / 1001
CREAM = (255, 251, 232)                     # measured flat bg #FFFBE8 (YouTube master)
ORANGE, BLUE = (255, 149, 15), (7, 162, 255)
IGVIG = 0.0                                  # OFF (user 2026-11-12): the dark gradient in the screenshots was the IG player, not the video

def f2t(f): return f * 1001 / 30000
def q(T, T0): return T0 + math.floor((T - T0) * 12 + 1e-6) / 12          # 12 fps pose grid from the shot start
def eo(x, p=3): x = min(1, max(0, x)); return 1 - (1 - x) ** p
def ei(x, p=2): x = min(1, max(0, x)); return x ** p
def sm(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)
def lerp(a, b, u): return a + (b - a) * u
def keys(T, kf):
    """piecewise-linear through measured (frame, value) samples (ref frame numbers at 29.97)"""
    ts = [f2t(f) for f, _ in kf]; vs = [v for _, v in kf]
    if T <= ts[0]: return vs[0]
    if T >= ts[-1]: return vs[-1]
    i = max(j for j in range(len(ts)) if ts[j] <= T)
    return lerp(vs[i], vs[i + 1], (T - ts[i]) / (ts[i + 1] - ts[i]))

# ---------------------------------------------------------------- image helpers
@lru_cache(None)
def LI(name): return Image.open(IMG / f"{name}.png").convert("RGBA")
def sc(im, k):
    if abs(k - 1) < 1e-4: return im
    return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS if k < 1 else Image.BICUBIC)
def paste(base, im, x, y):
    lay = Image.new("RGBA", base.size, (0, 0, 0, 0)); lay.paste(im, (round(x), round(y)), im); base.alpha_composite(lay)
def rot(im, deg):
    return im if abs(deg) < 0.01 else im.rotate(deg, Image.BICUBIC, expand=True)
def boil(seed, step, amp=5.0, rmax=0.7):
    """hand-cut stop-motion wobble: new pose every 12 fps step (ref: +-3..9 px, <=1.5 deg)"""
    r = np.random.default_rng(seed * 1000 + step); return r.uniform(-amp, amp), r.uniform(-amp, amp), r.uniform(-rmax, rmax)

def bg():
    return Image.new("RGBA", (W, H), CREAM + (255,))

@lru_cache(64)
def _speck(i):
    a = np.asarray(Image.open(R / f"assets/specks_clean/s_{i % 40 + 1:03d}.png").convert("L"), np.float32) / 255
    a = np.clip((a - 0.16) / (0.86 - 0.16), 0, 1)                         # keep the ink specks, paper -> white
    a = np.where(a > 0.97, 1.0, a)
    if i // 40 % 2: a = a[::-1, ::-1]
    return a
def specks(im, T, period=0.5):
    """black ink specks multiplied over the collage (ref: dust layer re-randomised every ~15 f / on pose steps); above captions"""
    a = _speck(int(T / period + 1e-6))
    arr = np.asarray(im.convert("RGBA"), np.float32).copy(); arr[..., :3] *= a[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
@lru_cache(1)
def _vig():
    y = np.arange(H, dtype=np.float32) / H
    top = (1 - sm_np(y / 0.21)) * 0.345; bot = sm_np((y - 0.73) / 0.27) * 0.35
    return (1 - IGVIG * np.maximum(top, bot))[:, None, None]
def sm_np(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
def vignette(im):
    if not IGVIG: return im
    arr = np.asarray(im.convert("RGBA"), np.float32).copy(); arr[..., :3] *= _vig()
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")

# ---------------------------------------------------------------- fonts / text
@lru_cache(None)
def font(kind, size):
    f = {"serif": "InstrumentSerif-Regular.ttf", "sans": "NeueHaasDisplayBold.ttf", "helv": "FreeSansBold.ttf"}[kind]
    return ImageFont.truetype(str(FD / f), max(4, int(round(size))))
SERIF_STROKE = 0.0125                        # Instrument Serif + same-colour stroke = weight of the ref serif (font sheet fonts_serifB_0)

def layout(text, kind, size, track=0.0, stroke=0):
    """per-word pen x (from 0) and ink box of the whole line at the given size"""
    f = font(kind, size); x = 0.0; words = []; cur = None
    for ch in text:
        if ch == " ":
            if cur: words.append(cur); cur = None
            x += f.getlength(" ") * (0.75 if kind == "serif" else 1.0) + track; continue          # ref serif: tight word gaps
        if cur is None: cur = [x, ""]
        cur[1] += ch; x += f.getlength(ch) + track
    if cur: words.append(cur)
    im = Image.new("L", (int(x + size * 2), int(size * 2)), 0); d = ImageDraw.Draw(im)
    for wx, w in words: _draw_word(d, wx + size * 0.5, size * 1.2, w, f, track, 255, stroke)
    bb = im.getbbox()
    return words, (bb[0] - size * 0.5, bb[1] - size * 1.2, bb[2] - size * 0.5, bb[3] - size * 1.2)   # ink box rel. to (pen 0, baseline)
def _draw_word(d, x, base, w, f, track, fill, stroke):
    for ch in w:
        d.text((x, base), ch, font=f, fill=fill, anchor="ls", stroke_width=stroke, stroke_fill=fill); x += f.getlength(ch) + track
def fit(text, kind, x0, x1, track_em=0.0, stroke_em=0.0):
    """font size whose ink width equals x1-x0 (measured on the ref frame)"""
    s = 200.0
    for _ in range(4):
        _, bb = layout(text, kind, s, track_em * s, round(stroke_em * s)); s *= (x1 - x0) / (bb[2] - bb[0])
    words, bb = layout(text, kind, s, track_em * s, round(stroke_em * s))
    return s, words, bb

def text_layer(words_vis, kind, size, x_pen0, base, col, track=0.0, stroke=0, alphas=None, dys=None, size_im=(W, H)):
    lay = Image.new("RGBA", size_im, (0, 0, 0, 0)); f = font(kind, size)
    for i, (wx, w) in enumerate(words_vis):
        a = 1.0 if alphas is None else alphas[i]
        if a <= 0: continue
        dy = 0 if dys is None else dys[i]
        m = Image.new("L", size_im, 0); _draw_word(ImageDraw.Draw(m), x_pen0 + wx, base + dy, w, f, track, round(255 * a), stroke)
        c = Image.new("RGBA", size_im, col + (0,)); c.putalpha(m); lay.alpha_composite(c)
    return lay

# ---------------------------------------------------------------- TH (stand-in host = raw "2 ash.mp4", muted)
# (t0, t1, framing) = every TH shot of the ref, cut on the ref frame; framings emulate the ref cameras / punch-ins.
FRAMING = {"W": (1.00, 540, 960), "W2": (1.06, 540, 700), "P1": (1.08, 540, 700), "C2": (1.10, 600, 640), "C2b": (1.14, 520, 600),
           "P": (1.22, 540, 560), "P38": (1.38, 540, 520), "G": (1.16, 470, 620), "GP": (1.30, 470, 560)}
TH = [(0.000, 1.034, "W"), (1.034, 2.236, "P1"), (2.236, 3.070, "W"), (3.070, 3.303, "C2"), (3.303, 3.804, "C2b"), (3.804, 4.971, "W2"),
      (8.208, 9.476, "W"), (9.476, 10.944, "P"), (10.944, 11.845, "C2"), (11.845, 13.146, "P38"), (13.146, 15.549, "W2"),
      (18.418, 19.253, "W"), (19.253, 19.586, "C2"), (19.586, 20.521, "P"), (20.521, 21.088, "C2"),
      (23.957, 25.492, "W"), (25.492, 26.293, "P"), (26.293, 27.327, "W"), (27.327, 30.664, "P"), (30.664, 31.198, "W2"), (31.198, 33.300, "G"),
      (33.300, 35.002, "W"), (36.036, 36.436, "W"), (38.739, 39.306, "C2"), (40.274, 40.774, "W"),
      (46.346, 46.880, "W"), (46.880, 48.282, "G"), (48.282, 49.650, "GP"), (49.650, 52.452, "W"), (52.452, 55.400, "P")]
RAW_OFF = 8.0                                 # raw time = ref time + 8 s: continuous footage, the jump cuts come from the framings
def th_shot(T):
    for a, b, fr in TH:
        if a - 1e-6 <= T < b - 1e-6: return a, b, fr
    return None
def frame_raw_single(t):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(RAW), "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return Image.fromarray(np.frombuffer(raw, np.uint8).reshape(H, W, 3))
class RawReader:
    """sequential reader of the raw at 25 fps for the motion test (nearest frame to T + RAW_OFF)"""
    def __init__(self): self.p = None; self.idx = -1; self.cur = None
    def get(self, t):
        n = int(round(t * 25))
        if self.p is None or n < self.idx or n > self.idx + 50:
            if self.p: self.p.kill()
            self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{n / 25:.3f}", "-i", str(RAW), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
            self.idx = n - 1; self.cur = None
        while self.idx < n:
            b = self.p.stdout.read(W * H * 3)
            if len(b) < W * H * 3: break
            self.cur = b; self.idx += 1
        return Image.fromarray(np.frombuffer(self.cur, np.uint8).reshape(H, W, 3))
READER = None
def th_frame(T):
    a, b, fr = th_shot(T); k, ax, ay = FRAMING[fr]
    t = T + RAW_OFF
    im = (READER.get(t) if READER else frame_raw_single(t)).convert("RGBA")
    if k != 1.0:
        big = im.resize((round(W * k), round(H * k)), Image.BICUBIC)
        x = ax * k - ax; y = ay * k - ay
        im = big.crop((round(x), round(y), round(x) + W, round(y) + H))
    return im

# ---------------------------------------------------------------- TH serif titles (word by word, centred layout of the ref, measured line boxes)
TITLES = [
    dict(t0=0.000, t1=1.034, lines=[("if you don\u2019t", 151, 929, 1172), ("like your job", 195, 881, 1365)], wf=[3, 7, 11, 16, 20, 24],
         ul=dict(x0=412, x1=889, y=1372, f_on=13, f_full=24.5, f_off=27, f_gone=30.2)),
    dict(t0=1.034, t1=2.236, lines=[("if you really", 149, 937, 1171), ("aren\u2019t enjoying it", 85, 997, 1365)], wf=[34, 40, 45, 51, 56, 62]),
    dict(t0=2.236, t1=f2t(85), lines=[("then how do", 92, 982, 1171), ("you make it", 210, 862, 1364)], wf=[69, 71, 74, 77, 79, 82]),
    dict(t0=f2t(86), t1=f2t(99), lines=[("playful?", 83, 991, 1216)], wf=[86], fadein=True),
]
@lru_cache(None)
def _tline(text, x0, x1):
    return fit(text, "serif", x0, x1, 0.0, SERIF_STROKE)
UL_Y, UL_C = (255, 207, 60), (70, 160, 255)
def underline(lay, u, T):
    f = T * FPS
    if f < u["f_on"] or f >= u["f_gone"] + 0.5: return
    L = u["x1"] - u["x0"]
    head = u["x0"] + L * eo((f - u["f_on"]) / (u["f_full"] - u["f_on"]), 2.2)
    tail = u["x0"] + L * ei((f - u["f_off"]) / (u["f_gone"] - u["f_off"]), 1.6) if f >= u["f_off"] else u["x0"]
    tail = min(tail, head)
    S = 2; im = Image.new("RGBA", (W * S, 200 * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im); r = 8.5 * S
    x = tail
    while x <= head + 0.01:                                             # dense round-cap stamps along a sine (amp 5, wavelength 72) = stroke 14 px
        y = 100 + 6.0 * math.sin((x - u["x0"]) / 72 * 2 * math.pi + 1.2)
        v = (x - u["x0"]) / L; m = sm((v - 0.30) / 0.18)
        col = tuple(round(lerp(UL_Y[i], UL_C[i], m)) for i in range(3)) + (255,)
        d.ellipse([x * S - r, y * S - r, x * S + r, y * S + r], fill=col); x += 0.75
    im = im.resize((W, 200), Image.LANCZOS); lay.alpha_composite(im, (0, u["y"] - 100))
def title_layer(T):
    for ti in TITLES:
        if not (ti["t0"] - 1e-6 <= T < ti["t1"] - 1e-6): continue
        lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); f = T * FPS; k = 0
        for text, x0, x1, base in ti["lines"]:
            s, words, bb = _tline(text, x0, x1); pen0 = x0 - bb[0]; stroke = round(SERIF_STROKE * s)
            al, dy = [], []
            for _ in words:
                fw = ti["wf"][k]; k += 1; age = f - fw
                if ti.get("fadein"):                                  # "playful?": grey 45 % -> white in 4 f, rising 60 px
                    al.append(0 if age < 0 else lerp(0.45, 1.0, eo(age / 3.5))); dy.append(60 * (1 - eo(age / 3.5)) if age >= 0 else 0)
                else:                                                  # word pops whole on its frame, settles 12 px in 3 f
                    al.append(1.0 if age >= 0 else 0.0); dy.append(12 * (1 - eo(age / 3.0)) if age >= 0 else 0)
            lay.alpha_composite(text_layer(words, "serif", s, pen0, base, (255, 255, 255), 0.0, stroke, al, dy))
        if ti.get("ul"): underline(lay, ti["ul"], T)
        return lay
    return None
def blur_transition(T, im):
    """3.27-3.37 s (f98-f101): old shot 8 px, new shot 25 -> 12 -> 0 px"""
    f = round(T * FPS)
    r = {98: 8, 99: 25, 100: 12}.get(f, 0)
    return im.filter(ImageFilter.GaussianBlur(r)) if r else im

# ---------------------------------------------------------------- captions (grey box, word fill), from the ref transcript
CAP_OFF = [(0, f2t(99)), (21.088, 23.957), (35.002, 46.346)]          # no box under the titles, the sauces or the whole chat block
def _norm(s): return "".join(ch for ch in s.lower() if ch.isalnum())
@lru_cache(1)
def chunks():
    """the ref's own chunks (OCR of every 3rd frame: assets/ref_captions.json) + word starts aligned from the Whisper transcript"""
    ws = [(w["w"].strip(), w["s"]) for s in json.loads((R / "assets/ref_words.json").read_text(encoding="utf-8")) for w in s["words"]]
    caps = json.loads((R / "assets/ref_captions.json").read_text()); out = []; j = 0
    alias = {"bbq": "barbecue", "screw": "fuck", "sweet": "sweet", "n": "and"}
    for k, (fa, fb, text) in enumerate(caps):
        t0 = f2t(fa) - 0.035; t1 = f2t(caps[k + 1][0]) - 0.035 if k + 1 < len(caps) else f2t(fb) + 0.1
        words = text.replace("'", "’").split(); times = []
        while j < len(ws) and ws[j][1] < t0 - 0.6: j += 1
        for wd in words:
            key = alias.get(_norm(wd), _norm(wd)); hit = None
            if not key: continue
            for jj in range(j, min(len(ws), j + 6)):
                if ws[jj][1] > t1 + 0.3: break
                if _norm(ws[jj][0]).startswith(key[:3]) and ws[jj][1] >= t0 - 0.5: hit = jj; break
            if hit is not None: times.append(ws[hit][1]); j = hit + 1
            else: times.append(None)
        for i in range(len(times)):                                            # fill gaps evenly inside the chunk
            if times[i] is None:
                prev = times[i - 1] if i and times[i - 1] is not None else t0 + 0.03
                times[i] = prev + 0.18
        for i in range(1, len(times)): times[i] = max(times[i], times[i - 1] + 0.06)
        out.append((t0, t1, [(wd, max(t0, tm)) for wd, tm in zip(words, times)]))
    return out
CAP_TOP, CAP_HH, CAP_PAD, CAP_SIZE = 1334, 100, 42, 70
def caption_layer(T):
    if any(a - 1e-6 <= T < b - 1e-6 for a, b in CAP_OFF): return None
    cur = next((c for a, b, c in chunks() if a <= T < b), None)
    if cur is None: return None
    cur = [(w, s, 0) for w, s in cur]
    text = " ".join(w[0] for w in cur); f = font("helv", CAP_SIZE)
    words, bb = layout(text, "helv", CAP_SIZE)
    tw = bb[2] - bb[0]; bw = tw + 2 * CAP_PAD; x0 = (W - bw) / 2
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.rounded_rectangle([round(x0), CAP_TOP, round(x0 + bw), CAP_TOP + CAP_HH], radius=6, fill=(0, 0, 0, 77))      # black 30 % (measured)
    al = [lerp(0.38, 0.93, sm((T - (s + 0.08)) / 0.12)) for _, s, _ in cur]   # fill starts on the word (ref lags 0-0.2 s)
    pen0 = x0 + CAP_PAD - bb[0]; base = CAP_TOP + CAP_HH / 2 + 26
    lay.alpha_composite(text_layer(words, "helv", CAP_SIZE, pen0, base, (255, 255, 255), alphas=al))
    return lay

# ---------------------------------------------------------------- collage assets
@lru_cache(1)
def worker():
    """flat red polo + darkened face (ref: ~70 % black over the head, shirt darker at the collar -> bright red at the hem)"""
    im = LI("worker").copy(); a = np.asarray(im, np.float32); rgb = a[..., :3]; al = a[..., 3]
    red = (rgb[..., 0] > 150) & (rgb[..., 1] < 110) & (rgb[..., 2] < 110) & (al > 128)
    rows = np.where(red.sum(1) > 0.25 * im.width)[0]; collar = int(rows[0])
    y = np.arange(im.height, dtype=np.float32)
    head = 1 - sm_np((y - (collar - 50)) / 90)                                     # 1 above the chin -> 0 at the collar
    shirt = 0.47 + 0.53 * sm_np((y - collar) / (0.55 * (im.height - collar)))
    k = np.where(y < collar - 50, 0.15, 0.15 * head + shirt * (1 - head))      # matched to ref f175: face ~27/255, collar red ~103
    a[..., :3] *= k[:, None, None]
    cap = (al[:int(collar * 0.45)] > 128).sum(0); xs = np.where(cap > 0)[0]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA"), collar, xs.max() - xs.min()
def arches(w, prog=1.0, col0=(255, 199, 44), col1=(232, 150, 20)):
    """golden double arch drawn as two half-parabola strokes; prog<1 = partial (fire-streak build)"""
    S = 3; h = 0.88 * w; im = Image.new("RGBA", (int(w * S) + 20, int(h * S) + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(im); r = 0.065 * w * S
    pts = []
    for side in (0, 1):
        cx = (0.25 + 0.5 * side) * w
        for u in np.linspace(-1, 1, 160):
            x = cx + u * 0.25 * w * 0.86
            y = (h * u * u) if (u < 0) == (side == 0) else (0.52 * h * u * u)
            pts.append((x, y))
    n = int(len(pts) * prog)
    for i, (x, y) in enumerate(pts[:n]):
        m = y / h; c = tuple(round(lerp(col0[j], col1[j], m)) for j in range(3)) + (255,)
        d.ellipse([x * S + 10 - r, y * S + 10 - r, x * S + 10 + r, y * S + 10 + r], fill=c)
    return im.resize((round(im.width / S), round(im.height / S)), Image.LANCZOS)

# ---------------------------------------------------------------- S05 / S07 : worker -> building + sign -> parallax pan -> kiosk + car
S05_T0, S05_T1, S07_T0, S07_T1 = f2t(149), f2t(246), f2t(466), f2t(552)
WK_CAP = 435                                    # cap width at camera 1 (ref fav 107)
def worker_layer(base, Tq, T0, cam, blur, dx=0.0, drop=0.0):
    wim, collar, capw = worker(); k0 = WK_CAP / capw
    # settle: hard cut in at x1.18, eases to 1.0 in ~9 f; head top 0 -> 165 px; centre x 660 -> 545 (ref f149-f175)
    t = Tq - S05_T0
    settle = 1 + 0.18 * (1 - eo(t / 0.30, 2.5)) if T0 == S05_T0 else 1.0
    creep = 1 - 0.01 * max(0, t)
    head_y = lerp(0, 165, eo(t / 0.87, 2.2)) if T0 == S05_T0 else 165
    cx = lerp(660, 545, eo(t / 0.47, 2.2)) if T0 == S05_T0 else 545
    k = k0 * settle * creep
    spr = sc(wim, k * cam["k"])
    if blur > 0: spr = spr.filter(ImageFilter.GaussianBlur(blur))
    x = cx - spr.width / 2; y = head_y
    x, y = cam_xy(x, y, cam, 1.0, spr.width / 2)
    paste(base, spr, x + dx, y + drop)
    return k
def cam_xy(x, y, cam, depth, half):
    """camera zoom about (540, 1290) with per-layer depth (worker 1.0, building 0.6, sign 0.5)"""
    k = 1 + (cam["k"] - 1) * depth; ax, ay = 540, 1290
    cx = x + half; cx2 = ax + (cx - ax) * k; y2 = ay + (y - ay) * k
    return cx2 - half, y2
def logo_build(Tq):
    """ref f166-f173: sparks -> fire streaks form the arch -> solid gradient arch, held"""
    f = (Tq - S05_T0) * FPS + 149
    if f < 166: return None
    if f < 168: p, sparks = 0.0, True
    elif f < 173: p, sparks = (f - 166) / 7, True
    else: p, sparks = 1.0, False
    im = arches(135, max(0.02, p), (255, 120, 30) if p < 1 else (255, 199, 44), (255, 210, 60) if p < 1 else (226, 146, 18))
    if sparks:
        d = ImageDraw.Draw(im); r = np.random.default_rng(int(f))
        for _ in range(14):
            x, y = r.uniform(0, im.width), r.uniform(0, im.height); s = r.uniform(1.5, 4)
            d.ellipse([x - s, y - s, x + s, y + s], fill=(255, 220, 120, 230))
    return im
def s05_cam(Tq):
    """collage zoom-out 1.0 -> 0.88, f183-f220, fast first 12 f then creep (ref)"""
    f = (Tq - S05_T0) * FPS + 149
    return {"k": 1 - 0.12 * eo((f - 183) / 37, 3)}
BLD_F = (156, 639, 1490)         # building v1 at the end of S05 (cam 0.88): tower sign centred on x 262 / y 780 like ref fav 108; canopy runs off the right edge
SGN_F = (640, 150, 430)           # arch sign box at the end of S05 (ref arches x 653-1053, top ~155)
def place(box, cam_k, depth, k_end=0.88):
    """a layer box measured on the ref at cam=k_end, re-projected for another camera zoom (anchor 540,1290; per-layer depth)"""
    kf = 1 + (k_end - 1) * depth; k = 1 + (cam_k - 1) * depth; r = k / kf; ax, ay = 540, 1290
    return ax + (box[0] - ax) * r, ay + (box[1] - ay) * r, box[2] * r
def building_sign(base, Tq, cam, dx_store=0.0, f=None):
    if f is None: f = (Tq - S05_T0) * FPS + 149
    # building: pops in at f183 bottom-left, rises 75 px (f183-190), drifts right ~1.8 px/f to f220; depth 0.6; soft 2 px
    if f >= 183:
        rise = 75 * (1 - eo((f - 183) / 7, 2.5)); drift = 1.8 * min(30, max(0, f - 190)) - 54
        x, y, w = place(BLD_F, cam["k"], 0.6)
        b = sc(LI("building"), w / LI("building").width).filter(ImageFilter.GaussianBlur(2.2))
        paste(base, b, x + drift + dx_store, y + rise)
    # sign: enters f188 from top-right (~225 px off), in by f190, overshoot 9 px, drifts down ~2 px/f to f220; depth 0.5; sharp
    if f >= 188:
        u = (f - 188) / 2.5
        off = 225 * (1 - eo(u, 2)) if u < 1 else -9 * math.sin(min(1, (f - 190.5) / 6) * math.pi) * (1 - min(1, (f - 190.5) / 6))
        down = 2 * min(30, max(0, f - 190)) - 60
        x, y, w = place(SGN_F, cam["k"], 0.5)
        sg = sc(LI("sign"), w / LI("sign").width)
        paste(base, sg, x + off + dx_store, y - off * 0.9 + down)

def s05(T, cap=True):
    Tq = q(T, S05_T0); base = bg(); cam = s05_cam(Tq); f = (Tq - S05_T0) * FPS + 149
    building_sign(base, Tq, cam)
    blur = 0 if f < 180 else lerp(8, 15, sm((f - 180) / 20))
    wk = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    k = worker_layer(wk, Tq, S05_T0, cam, 0)
    lg = logo_build(Tq)
    if lg is not None:                                                     # chest logo lives on the worker layer (follows zoom + blur)
        wim, collar, capw = worker(); kk = k * cam["k"]
        lg = sc(lg, cam["k"] * (k / (WK_CAP / capw)))
        lx, ly = cam_xy(730, 1050 + (lerp(0, 165, eo((Tq - S05_T0) / 0.87, 2.2)) - 165), cam, 1.0, 0)
        paste(wk, lg, lx, ly)
    if blur: wk = wk.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(wk)
    return base

KIOSK_X = [(484, 1005), (486, 909), (489, 795), (491, 675), (494, 555), (496, 429), (499, 330), (501, 240), (504, 174), (506, 126), (509, 90), (511, 66)]
CAR_X = [(499, 1560), (501, 1400), (504, 1190), (506, 1020), (509, 795), (511, 615), (514, 474), (516, 390), (519, 309)]
WORK_DX = [(466, 0), (474, -12), (476, -63), (479, -153), (481, -279), (484, -438), (486, -648), (489, -940), (491, -1300)]
STORE_DX = [(466, 0), (474, -12), (484, -243), (486, -378), (489, -489), (491, -573), (494, -690), (496, -780), (499, -880), (501, -980), (504, -1200)]
CAR_TILT = [(501, 9.0), (506, 6.0), (509, 3.0), (511, 1.2), (514, 0.0)]
def kiosk_car(base, Tq, T0, still=False):
    """kiosk x 66-435 / y 360-1110 (final), car front wheel centre (315,1455), wheel diameter 285 (ref f1150)"""
    st = int(round((Tq - T0) * 12))
    if Tq >= f2t(484) or still:
        ki = sc(LI("kiosk"), 369 / LI("kiosk").width)
        kx = 66 if still else keys(Tq, KIOSK_X)
        bx, by, br = boil(11, st, 0.6, 0.05) if (still or Tq >= f2t(511)) else (0, 0, 0)
        kr = rot(ki, br); paste(base, kr, kx + bx - (kr.width - ki.width) / 2, 360 + by - (kr.height - ki.height) / 2)
    if Tq >= f2t(499) or still:
        car = car_sprite()
        wx = 311 if still else keys(Tq, CAR_X)
        tilt = 0 if still else keys(Tq, CAR_TILT)
        bx, by, br = boil(23, st, 1.2, 0.15) if (still or Tq >= f2t(521)) else (0, 0, 0)
        cr = rot(car, tilt + br)
        x = wx - CAR_WHEEL[0] - (cr.width - car.width) / 2; y = 1457 - CAR_WHEEL[1] - (cr.height - car.height) / 2
        paste(base, cr, x + bx, y + by)
CAR_WHEEL = (0, 0)
@lru_cache(1)
def car_sprite():
    global CAR_WHEEL
    c = LI("car"); k = 178 / (536 - 419)                 # ref: front hub (311,1457), tyre radius 178; Flow car: hub (278,419), tyre bottom 536
    s = sc(c, k); CAR_WHEEL = (278 * k, 419 * k)
    return s

def s07(T):
    Tq = q(T, S07_T0); base = bg(); f = (Tq - S07_T0) * FPS + 466
    cam = {"k": 0.88 * (1 + 0.02 * eo((f - 466) / 8))}            # pre-roll: scale 1.00 -> 1.02 and 1.5 px/f left
    pre = -1.5 * min(8, f - 466)
    building_sign_end(base, cam, keys(Tq, STORE_DX) + pre)
    wk = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    worker_end(wk, cam, keys(Tq, WORK_DX) + pre)
    base.alpha_composite(wk.filter(ImageFilter.GaussianBlur(14)))
    kiosk_car(base, Tq, S07_T0)
    return base
def building_sign_end(base, cam, dx):
    building_sign(base, 0, cam, dx, f=300)

def worker_end(lay, cam, dx):
    wim, collar, capw = worker(); k = WK_CAP / capw * (1 - 0.01 * 3.2)
    spr = sc(wim, k * cam["k"]); x, y = cam_xy(545 - spr.width / 2, 165, cam, 1.0, spr.width / 2)
    paste(lay, spr, x + dx, y)
    lg = sc(arches(135), cam["k"] * (1 - 0.01 * 3.2)); lx, ly = cam_xy(730, 1050, cam, 1.0, 0); paste(lay, lg, lx + dx, ly)

# ---------------------------------------------------------------- S09 : sauce packs + Monday / Tuesday (sans + highlight bar), push transition
S09_T0, S09_T1 = f2t(632), f2t(718)
def day_word(base, Tq, word, x0, x1, cap_top, base_final, f_rise, rise, f_bar, bar_kf, col, dx=0):
    f = Tq * FPS
    if f < f_rise: return
    s, words, bb = _dayfit(word, x0, x1)
    # rise out of a hard mask (bottom edge y 366): +rise -> +rise*0.3 -> 0 in 3 poses; then drifts up 18 px over ~10 f
    u = (f - f_rise)
    off = rise if u < 3 else (rise * 0.3 if u < 5 else 0)
    drift = 18 * (1 - eo((f - f_rise - 5) / 12, 2)) if u >= 5 else 18
    bl = base_final + drift + off
    pen0 = x0 - bb[0] + dx
    if f >= f_bar:                                                          # highlight bar drawn left -> right behind the letters
        bw = keys(Tq, bar_kf); by0 = bl - 33 - (base_final - 323) * 0; lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
        y0 = bl - 33 - 0; d.rounded_rectangle([x0 + dx, round(y0), x0 + dx + max(30, bw), round(y0 + 29)], radius=14, fill=col + (255,),
                                               outline=tuple(int(c * 0.62) for c in col) + (255,), width=2)
        base.alpha_composite(lay)
    t = text_layer(words, "sans", s, pen0, bl, (0, 0, 0), track=-0.03 * s)
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).rectangle([0, 0, W, 366 if u < 5 else H], fill=255)
    t.putalpha(Image.fromarray(np.minimum(np.asarray(t.split()[-1]), np.asarray(m))))
    base.alpha_composite(t)
@lru_cache(None)
def _dayfit(word, x0, x1): return fit(word, "sans", x0, x1, -0.03)
TANGY_DX = [(632, 0), (655, 0), (656, -75), (657, -300), (659, -300), (660, -705), (661, -705), (662, -1400)]
SWEET_DX = [(659, 1400), (660, 720), (661, 720), (662, 309), (664, 309), (665, 84), (666, 84), (667, 6), (669, 0)]
def pack(base, name, bbox, dx, st, seed, k=1.0):
    p = LI(name); kk = (bbox[2] - bbox[0]) / p.width * k
    s = sc(p, kk); bx, by, br = boil(seed, st, 0.6, 0.05)
    sr = rot(s, br); cx = (bbox[0] + bbox[2]) / 2 + dx + bx; cy = (bbox[1] + bbox[3]) / 2 + by
    paste(base, sr, cx - sr.width / 2, cy - sr.height / 2)
def s09(T):
    Tq = q(T, S09_T0); base = bg(); f = Tq * FPS; st = int(round((Tq - S09_T0) * 12))
    dxt = keys(Tq, TANGY_DX); dxs = keys(Tq, SWEET_DX)
    if f < 662:
        pack(base, "bbq", (153, 486, 923, 1437), dxt, st, 31, lerp(1.03, 0.98, min(1, (f - 632) / 23)))
        day_word(base, Tq, "Monday", 278, 795, 216, 325, 637, 60, 642, [(642, 30), (645, 140), (647, 400), (650, 533)], (239, 88, 56), dx=dxt)
    if f >= 659:
        pack(base, "sweetsour", (177, 483, 904, 1435), dxs, st, 37)
    if f >= 667:
        day_word(base, Tq, "Tuesday", 257, 817, 213, 323, 667, 36, 677, [(677, 30), (680, 230), (682, 380), (685, 520), (687, 576)], (145, 170, 0))
    return base

# ---------------------------------------------------------------- CHAT : kiosk + car + orange/blue bubbles (no caption box)
CH = [(35.002, 36.036, 0), (36.436, 38.739, 0), (39.306, 40.274, -104), (40.774, 46.346, -184)]     # (t0, t1, stack shift)
# (colour, align, top y in unshifted stack, box-appear frame, placeholder width, [(word, frame)])
BUBBLES = [
    ("O", "L", 342, 1051, 33, [("Would", 1053), ("you", 1056), ("like", 1061), ("fries", 1063), ("with", 1068), ("that?", 1071)]),
    ("B", "R", 478, 1092, 201, [("yes", 1093), ("please", 1098)]),
    ("O", "L", 618, 1135, 363, [("What", 1137), ("about", 1140), ("some", 1145), ("BBQ", 1147), ("sauce?", 1152)]),
    ("B", "R", 750, 1181, 255, [("No,", 1186), ("I\u2019m", 1188), ("good", 1193), ("thanks", 1198)]),
    ("O", "L", 898, 1225, 285, [("Hey", 1227), ("are", 1227), ("you", 1232), ("sure?", 1235)]),
    ("O", "L", 982, 1245, 470, [("you", 1247), ("know", 1247), ("my", 1250), ("last", 1252), ("customer", 1252), ("said", 1255)]),
    ("O", "L", 1067, 1277, 330, [("no", 1280), ("to", 1282), ("the", 1287), ("BBQ", 1292), ("sauce", 1297), ("then", 1302), ("I", 1307), ("talked", 1312)]),
    ("O", "L", 1152, 1315, 315, [("her", 1320), ("into", 1325), ("it", 1327), ("and", 1332), ("she", 1335), ("was", 1340), ("really", 1345)]),
    ("O", "L", 1238, 1347, 225, [("happy,", 1350), ("are", 1352), ("you", 1357), ("sure", 1360), ("you", 1365), ("don\u2019t", 1367)]),
    ("O", "L", 1322, 1370, 240, [("want", 1372), ("the", 1377), ("BBQ", 1380), ("sauce?", 1385)]),
]
BUB_H, BUB_PAD, BUB_SIZE, BX_L, BX_R = 73, 17, 49, 244, 981
def bubble_state(b, Tq):
    """box width + y offset at Tq: placeholder pops full height ~36 px low, eases up; width eases (0.55/step) toward the text through the next word"""
    col, al, y, fb, w0, words = b; f = Tq * FPS
    if f < fb: return None
    fnt = font("helv", BUB_SIZE); n_vis = sum(1 for _, fw in words if f >= fw)
    def tw(n): return fnt.getlength(" ".join(w for w, _ in words[:n])) if n else 0
    w = w0; step0 = fb / FPS
    for i in range(int((Tq - f2t(fb)) * 12 + 1e-6) + 1):
        ff = (step0 + i / 12) * FPS; nv = sum(1 for _, fw in words if ff >= fw)
        target = tw(min(len(words), nv + 1)) + 2 * BUB_PAD + 6 if nv < len(words) else tw(nv) + BUB_PAD + 23
        w = max(w, w + (target - w) * 0.55) if target > w else w
    slide = 0 if fb == 1051 else 36 * (1 - eo((f - fb) / 12, 2.5))
    return w, slide, n_vis
def chat(T):
    for t0, t1, shift in CH:
        if t0 - 1e-6 <= T < t1 - 1e-6: break
    Tq = q(T, t0); base = bg()
    kiosk_car(base, Tq, t0, still=True)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay); fnt = font("helv", BUB_SIZE)
    Tw = T                                                                  # words land on their exact frame
    for b in BUBBLES:
        stt = bubble_state(b, Tq)
        if stt is None: continue
        w, slide, _ = stt; col, al, y, fb, w0, words = b
        y = y + shift + slide; x0 = BX_L if al == "L" else BX_R - w
        d.rounded_rectangle([round(x0), round(y), round(x0 + w), round(y + BUB_H)], radius=3, fill=(ORANGE if col == "O" else BLUE) + (255,))
        vis = [(wd, fw) for wd, fw in words if Tw * FPS >= fw]
        if not vis: continue
        txt = " ".join(wd for wd, _ in vis); age = Tw * FPS - vis[0][1]
        sl = -60 * (1 - eo(age / 4, 2))                                     # first word slides in from the left, clipped by the box
        m = Image.new("L", (W, H), 0); md = ImageDraw.Draw(m)
        md.text((x0 + BUB_PAD + sl, y + BUB_H / 2 + 19), txt, font=fnt, fill=255, anchor="ls")
        clip = Image.new("L", (W, H), 0); ImageDraw.Draw(clip).rectangle([round(x0), round(y), round(x0 + w), round(y + BUB_H)], fill=255)
        m = Image.fromarray(np.minimum(np.asarray(m), np.asarray(clip)))
        c = Image.new("RGBA", (W, H), (0, 0, 0, 0)); c.putalpha(m); lay.alpha_composite(c); d = ImageDraw.Draw(lay)
    base.alpha_composite(lay)
    return base

# ---------------------------------------------------------------- master frame
COLLAGE = [(S05_T0, S05_T1, s05), (S07_T0, S07_T1, s07), (S09_T0, S09_T1, s09)] + [(a, b, chat) for a, b, _ in CH]
def render(T):
    T = f2t(round(T * FPS)) + 1e-4                                          # snap to the ref frame grid
    fn = next((g for a, b, g in COLLAGE if a - 1e-6 <= T < b - 1e-6), None)
    if fn is None:
        im = th_frame(T)
        if 3.20 < T < 3.40: im = blur_transition(T, im)
        t = title_layer(T)
        if t is not None: im.alpha_composite(t)
        c = caption_layer(T)
        if c is not None: im.alpha_composite(c)
        return im
    im = fn(T)
    c = caption_layer(T)
    if c is not None: im.alpha_composite(c)
    im = specks(im, T)
    return vignette(im)

def ref_frame(T):
    n = round(T * FPS)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(REF), "-vf", f"select=eq(n\\,{n})", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return Image.fromarray(np.frombuffer(raw, np.uint8).reshape(H, W, 3))

# ---------------------------------------------------------------- storyboard
SCENES = [
    (0.80, "S01 TH + titulo serif", "Host (TH) quieto, 30 fps. Titulo Instrument Serif blanco: cada palabra aparece entera en su frame (f3/7/11/16/20/24) y asienta 12 px en 3 f. Subrayado ondulado amarillo->azul: punto en f13, se dibuja de izq. a der. hasta f24.5 (ease-out), se borra desde la izquierda f27-30."),
    (1.95, "S02 jump cut punch-in", "Corte seco a x1.08 (cae exacto en f31). Titulo nuevo 'if you really / aren't enjoying it' palabra a palabra. Sin caption."),
    (2.99, "S03 'playful?'", "'playful?' una sola palabra grande (340 px): entra gris 45 % -> blanco en 4 f subiendo 60 px; sobrevive al corte de 3.07 y se va seco en f99."),
    (3.33, "S04 blur transition", "Unica transicion con desenfoque: f98 plano viejo 8 px, f99 nuevo 25 px, f100 12 px, f101 nitido. Entra el caption gris."),
    (4.40, "S05a TH + caption", "Caption: caja negra 30 % (radio 6), FreeSans Bold (Helvetica) 70 px; palabras no dichas al 38 %, cada palabra sube a blanco en 0.12 s al decirla. Chunks de 2-4 palabras con cambio seco."),
    (5.90, "S05b obrero recortado (fav 107)", "Corte seco. Obrero entra a x1.18 y asienta a 1.0 en ~9 f (12 fps), baja 165 px y se corre a la izquierda; cara oscurecida al 15 % de luz (medido), polo con degradado. El logo del pecho se arma con chispas f166-173. Fondo crema plano + motas de tinta."),
    (7.20, "S05c profundidad (fav 108)", "f183: el edificio sube desde abajo 75 px (capa 0.6), f188 el cartel entra desde arriba-derecha en 2 pasos con rebote de 9 px (capa 0.5); camara aleja 1.0->0.88 (f183-220, ease-out). El obrero se desenfoca 8->15 px (profundidad)."),
    (16.30, "S07 paneo en parallax (fav 109)", "Paneo horizontal medido: obrero sale por la izquierda con ease-in (hasta 210 px/paso), edificio+cartel a 0.55-0.65 de su velocidad, el totem entra por la derecha (f484) y frena en f511. Sin desenfoque de movimiento."),
    (17.70, "S07b totem + coche (fav 110)", "El coche entra por la derecha en f501 con 9 grados de nariz abajo, se nivela en f514 y frena con ease-out en f519 (705 px en 15 f). Despues todo queda con temblor de recorte (boil) a 12 fps."),
    (21.80, "S09a salsa + 'Monday'", "Corte seco al sobre (sin entrada). 'Monday' Neue Haas Bold negro sube desde una mascara (y 366) en 3 poses, deriva 18 px arriba; barra roja se dibuja de izq. a der. f642-650 detras de las letras. Sin caption."),
    (22.09, "S09b push", "Push horizontal 12 f: sobre + Monday salen con ease-in (-75/-300/-705 px), el sobre verde entra con ease-out (+720/+309/+84/+6). Bordes duros, sin blur."),
    (23.30, "S09c 'Tuesday' (fav 111)", "'Tuesday' sube desde la mascara despues del push (f667-672) y deriva; barra verde f677-687. El sobre tiembla +-5 px / +-1.2 grados por paso."),
    (35.62, "S12 burbuja naranja", "Corte seco al collage totem+coche (quietos con boil). Burbuja naranja: aparece como franja de 33 px y crece hacia la derecha, va un paso por delante del texto; cada palabra cae entera en su frame (la primera entra deslizando, recortada por la caja)."),
    (38.55, "S14 burbujas alternadas (fav 112)", "Burbuja azul alineada a la derecha (x 981): caja vacia 36 px mas abajo, sube con ease-out y se ensancha hacia la izquierda; despues la naranja. Paso 135 px entre burbujas."),
    (40.10, "S16 'No, I'm good thanks'", "Mismo sistema: placeholder 255 px, crece a 800 px en 0.57 s; texto por bloques."),
    (45.90, "S18 conversacion larga", "En el TH intermedio la pila subio 184 px. Lineas naranjas apiladas a 85 px: cada linea nueva aparece vacia, sube 36 px y crece palabra por palabra."),
    (49.00, "S19 TH final + caption", "Jump cuts entre encuadres (W / punch x1.22-1.38). Caption sigue igual."),
]
def board(only=None):
    from PIL import ImageFont as IF
    lab = IF.truetype(r"C:\Windows\Fonts\arialbd.ttf", 26); txt = IF.truetype(r"C:\Windows\Fonts\arial.ttf", 21)
    PW, PH = 405, 720; cells = []
    for i, (T, name, note) in enumerate(SCENES):
        if only and str(i) not in only: continue
        ours = render(T).convert("RGB"); ours.save(FR / f"s{i:02d}_{T:.2f}.png")
        ref = ref_frame(T)
        c = Image.new("RGB", (PW * 2 + 30, PH + 300), "white"); d = ImageDraw.Draw(c)
        c.paste(ref.resize((PW, PH), Image.LANCZOS), (0, 44)); c.paste(ours.resize((PW, PH), Image.LANCZOS), (PW + 30, 44))
        d.text((0, 6), f"{name}   t={T:.2f}s", font=lab, fill=(20, 20, 20))
        d.text((4, 50), "REF", font=lab, fill=(255, 40, 40)); d.text((PW + 34, 50), "NUESTRO", font=lab, fill=(255, 40, 40))
        lines, cur = [], ""
        for wd in note.split():
            if d.textlength(cur + " " + wd, font=txt) > PW * 2 + 20: lines.append(cur); cur = wd
            else: cur = (cur + " " + wd).strip()
        lines.append(cur)
        for k, l in enumerate(lines[:10]): d.text((0, PH + 54 + k * 25), l, font=txt, fill=(30, 30, 30))
        cells.append(c); print("scene", i, T, flush=True)
    per = 4
    for b in range(0, len(cells), per):
        grp = cells[b:b + per]; cw, ch = grp[0].size
        S = Image.new("RGB", (cw * 2 + 60, ch * 2 + 40), (235, 235, 235))
        for j, c in enumerate(grp): S.paste(c, (20 + (j % 2) * (cw + 20), 20 + (j // 2) * (ch + 0)))
        S.save(OUT / f"board_{b // per + 1}.jpg", quality=90); print("board", b // per + 1)

# ---------------------------------------------------------------- motion test (ours | ref), ref audio
SEGS = [(0.0, 3.45), (4.85, 8.35), (15.40, 18.55), (21.00, 24.05), (34.90, 41.60)]
def motion():
    global READER
    READER = RawReader(); tmp = OUT / "_mt"; tmp.mkdir(exist_ok=True)
    for p in tmp.glob("*.png"): p.unlink()
    lab = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 30)
    n = 0; PW, PH = 810, 1440
    for a, b in SEGS:
        fa, fb = round(a * FPS), round(b * FPS)
        rp = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{f2t(fa):.4f}", "-i", str(REF), "-frames:v", str(fb - fa), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
        for fi in range(fa, fb):
            T = f2t(fi); ours = render(T).convert("RGB")
            rb = rp.stdout.read(W * H * 3)
            ref = Image.fromarray(np.frombuffer(rb, np.uint8).reshape(H, W, 3)) if len(rb) == W * H * 3 else Image.new("RGB", (W, H))
            S = Image.new("RGB", (PW * 2 + 20, PH + 50), (18, 18, 18)); S.paste(ours.resize((PW, PH), Image.LANCZOS), (0, 50)); S.paste(ref.resize((PW, PH), Image.LANCZOS), (PW + 20, 50))
            d = ImageDraw.Draw(S); d.text((10, 8), f"NUESTRO  t={T:5.2f}s", font=lab, fill=(255, 210, 80)); d.text((PW + 30, 8), "REF (Ali Abdaal)", font=lab, fill=(255, 210, 80))
            S.save(tmp / f"m_{n:05d}.png", compress_level=1); n += 1
            if fi % 30 == 0: print("t", round(T, 2), flush=True)
        rp.kill()
    # audio: ref audio of the same segments, concatenated
    parts = "".join(f"[0:a]atrim={round(a * FPS) / FPS:.4f}:{round(b * FPS) / FPS:.4f},asetpts=PTS-STARTPTS[a{i}];" for i, (a, b) in enumerate(SEGS))
    cat = "".join(f"[a{i}]" for i in range(len(SEGS))) + f"concat=n={len(SEGS)}:v=0:a=1[aout]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(REF), "-filter_complex", parts + cat, "-map", "[aout]", str(tmp / "a.wav")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "30000/1001", "-i", str(tmp / "m_%05d.png"), "-i", str(tmp / "a.wav"), "-c:v", "libx264", "-crf", "18",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", str(OUT / "motion_test.mp4")], check=True)
    print(OUT / "motion_test.mp4")

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "board"
    if cmd == "board": board(sys.argv[2:] or None)
    elif cmd == "motion": motion()
    elif cmd == "frame":
        for tt in sys.argv[2:]: render(float(tt)).convert("RGB").save(OUT / f"_{tt}.png")
