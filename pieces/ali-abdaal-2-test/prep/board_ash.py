"""Ali Abdaal 2 -- PHASE 2: the approved style applied to the first 20 s of the Ashton raw (voice + content of the raw).
Timeline = ash/edit.mov (pauses trimmed only inside true silence, 20.57 s, 29.97 fps). Every scene copies one shot TYPE of the ref (CATALOGO.md)
with the ref's measured timings re-anchored to this voice. Helpers (fonts, layout, captions look, specks, boil, underline) come from board.py.
python prep/board_ash.py board    -> storyboard/ash_v1/board_N.jpg
python prep/board_ash.py motion   -> storyboard/ash_v1/motion_test.mp4 (voice + music + SFX)
python prep/board_ash.py frame T  -> storyboard/ash_v1/_T.png"""
import json, math, subprocess, sys
from functools import lru_cache
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.path.insert(0, str(Path(__file__).resolve().parent))
import board as B
from board import W, H, FPS, f2t, eo, ei, sm, lerp, sc, paste, rot, boil, font, layout, text_layer, bg, specks
R = B.R; A = R / "assets/ash"; EDIT = R / "ash/edit.mov"
OUT = R / "storyboard/ash_v2"; FR = OUT / "frames"; FR.mkdir(parents=True, exist_ok=True)
END = 20.57
def q(T, T0): return T0 + math.floor((T - T0) * 12 + 1e-6) / 12
def kf(T, T0, ref0, pts):
    """ref keyframes (ref frame, value) re-anchored: ref frame ref0 happens at our time T0"""
    return B.keys(T - T0 + f2t(ref0), pts)
@lru_cache(None)
def LA(name): return Image.open(A / f"{name}.png").convert("RGBA")

# ---------------------------------------------------------------- TH (edited raw, its own voice)
FRAMING = {"W": (1.00, 540, 960), "W2": (1.06, 540, 700), "P1": (1.08, 540, 700), "P2": (1.12, 540, 640), "C2": (1.14, 600, 620), "P": (1.22, 540, 560)}
TH = [(0.000, 1.401, "W"), (1.401, 2.636, "P1"), (7.060, 8.790, "W"), (8.790, 10.110, "P2"), (10.110, 11.180, "W"), (11.180, 11.450, "C2"),
      (16.860, 18.460, "W"), (18.460, 19.240, "P"), (19.240, END + 0.1, "W2")]
class Reader:
    def __init__(self): self.p = None; self.idx = -1; self.cur = None
    def get(self, n):
        if self.p is None or n < self.idx or n > self.idx + 60:
            if self.p: self.p.kill()
            self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{f2t(n):.4f}", "-i", str(EDIT), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
            self.idx = n - 1; self.cur = None
        while self.idx < n:
            b = self.p.stdout.read(W * H * 3)
            if len(b) < W * H * 3: break
            self.cur = b; self.idx += 1
        return Image.fromarray(np.frombuffer(self.cur, np.uint8).reshape(H, W, 3))
READER = None
def th_frame(T):
    fr = next(f for a, b, f in TH if a - 1e-6 <= T < b - 1e-6); k, ax, ay = FRAMING[fr]; n = round(T * FPS)
    if READER: im = READER.get(n)
    else:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{f2t(n):.4f}", "-i", str(EDIT), "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
        im = Image.fromarray(np.frombuffer(raw, np.uint8).reshape(H, W, 3))
    im = im.convert("RGBA")
    if k != 1.0:                                                     # punch-in lands on the exact cut frame (jump cut, no animated zoom)
        big = im.resize((round(W * k), round(H * k)), Image.BICUBIC); x = ax * k - ax; y = ay * k - ay
        im = big.crop((round(x), round(y), round(x) + W, round(y) + H))
    return im

# ---------------------------------------------------------------- serif titles (type 1) + giant word (type 2)
# lines centred like the ref (ink centred on x 540, baselines 1172 / 1365, line 1 <= 205 px, line 2 <= 165 px, ink <= 880 px wide)
TITLES = [dict(t0=0.000, t1=1.401, lines=["este hombre no", "se hizo viral"], wt=[0.00, 0.38, 0.70, 0.92, 1.06, 1.20]),
          dict(t0=1.401, t1=2.636, lines=["por su", "curiosa rutina"], wt=[1.44, 1.64, 1.76, 2.20], ul=(2, 3, 1.66, 2.22, 2.40, 2.56)),
          dict(t0=7.060, t1=8.790, lines=["consiguió", "4.5 millones"], wt=[7.10, 7.50, 8.54], ul=(1, 2, 8.08, 8.56, 8.64, 8.76)),
          dict(t0=8.790, t1=10.110, lines=["de seguidores", "en 30 días"], wt=[8.82, 9.06, 9.44, 9.64, 9.84]),
          dict(t0=10.110, t1=10.950, lines=["por algo", "que pocos"], wt=[10.15, 10.34, 10.50, 10.72]),
          dict(t0=10.950, t1=11.450, lines=["notaron."], wt=[10.98], giant=True)]
LEAD = 0.03                                                          # ref: a word lands ~1 f after it is spoken
@lru_cache(None)
def tline(text, maxs, maxw=880):
    s = maxs; st = round(B.SERIF_STROKE * s)
    words, bb = layout(text, "serif", s, 0.0, st)
    if bb[2] - bb[0] > maxw: s = s * maxw / (bb[2] - bb[0]); st = round(B.SERIF_STROKE * s); words, bb = layout(text, "serif", s, 0.0, st)
    return s, st, words, bb
def title_layer(T):
    ti = next((t for t in TITLES if t["t0"] - 1e-6 <= T < t["t1"] - 1e-6), None)
    if ti is None: return None
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); k = 0; geo = []
    if ti.get("giant"):
        s, st, words, bb = tline(ti["lines"][0], 340, 908); pen0 = 540 - (bb[0] + bb[2]) / 2; age = (T - ti["wt"][0] - LEAD) * FPS
        al = [0 if age < 0 else lerp(0.45, 1.0, eo(age / 3.5))]; dy = [60 * (1 - eo(age / 3.5)) if age >= 0 else 0]
        lay.alpha_composite(text_layer(words, "serif", s, pen0, 1216, (255, 255, 255), 0.0, st, al, dy)); return lay
    for li, text in enumerate(ti["lines"]):
        s, st, words, bb = tline(text, 205 if li == 0 else 165); base = 1172 if li == 0 else 1365; pen0 = 540 - (bb[0] + bb[2]) / 2
        al, dy = [], []
        for wx, w in words:
            age = (T - ti["wt"][k] - LEAD) * FPS; k += 1
            al.append(1.0 if age >= 0 else 0.0); dy.append(12 * (1 - eo(age / 3.0)) if age >= 0 else 0)
            geo.append((pen0 + wx, pen0 + wx + font("serif", s).getlength(w), base))
        lay.alpha_composite(text_layer(words, "serif", s, pen0, base, (255, 255, 255), 0.0, st, al, dy))
    if ti.get("ul"):
        i0, i1, ton, tfull, toff, tgone = ti["ul"]
        u = dict(x0=round(geo[i0][0]), x1=round(geo[i1][1]), y=round(geo[i0][2] + 8), f_on=ton * FPS, f_full=tfull * FPS, f_off=toff * FPS, f_gone=tgone * FPS)
        B.underline(lay, u, T)
    return lay

# ---------------------------------------------------------------- captions (same look as the ref) on TH after the hook and on subject / pan collages
CAPS = [(11.45, "En 2020,", [11.49, 11.59]), (12.22, "Ashton Hall era", [12.25, 12.49, 12.65]), (12.82, "un coach fitness", [12.85, 13.01, 13.23]),
        (13.56, "en quiebra,", [13.59, 13.81]), (14.07, "pero hace un mes", [14.10, 14.26, 14.40, 14.54]), (14.61, "subió un video", [14.64, 14.92, 15.10]),
        (15.25, "que cambió su vida", [15.28, 15.58, 15.92, 16.08]), (16.19, "para siempre.", [16.22, 16.48]), (16.87, "En el video", [16.90, 16.98, 17.14]),
        (17.31, "se levanta a las", [17.34, 17.50, 17.78, 17.86]), (18.01, "3:52 de la mañana,", [18.04, 18.50, 18.64, 18.78]),
        (19.25, "se quita una cinta", [19.28, 19.42, 19.58, 19.78]), (19.95, "de la boca,", [19.98, 20.12, 20.24])]
def caption_layer(T):
    i = next((j for j in range(len(CAPS)) if CAPS[j][0] <= T < (CAPS[j + 1][0] if j + 1 < len(CAPS) else END + 1)), None)
    if i is None: return None
    t0, text, wt = CAPS[i]; S = B.CAP_SIZE
    words, bb = layout(text, "helv", S); bw = bb[2] - bb[0] + 2 * B.CAP_PAD; x0 = (W - bw) / 2
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(lay).rounded_rectangle([round(x0), B.CAP_TOP, round(x0 + bw), B.CAP_TOP + B.CAP_HH], radius=6, fill=(0, 0, 0, 77))
    al = [lerp(0.38, 0.93, sm((T - (s + 0.08)) / 0.12)) for s in wt]
    lay.alpha_composite(text_layer(words, "helv", S, x0 + B.CAP_PAD - bb[0], B.CAP_TOP + B.CAP_HH / 2 + 26, (255, 255, 255), alphas=al)); return lay

# ---------------------------------------------------------------- objects + sans word with highlight bar (types 6 + 7: ref P11/P12)
OBJ_T0, OBJ_T1 = 2.636, 7.060
OBJS = [  # (sprite, box at rest x0,y0,x1 (centred block ~ref packs), word, word rise time, bar colour, push-in time or None)
    ("clock", (130, 640, 950), "3:52 a.m.", 3.72, (226, 40, 32), None),
    ("dunk", (-310, None, 1390), "agua helada", 5.38, (79, 179, 232), 4.80),       # REAL photo: Ashton's face in the ice bowl, anchored to the bottom edge
    ("bananaface", (-210, None, 1290), "banana", 6.46, (242, 194, 0), 5.73)]        # REAL photo: banana peel on his face ('8:45 am' caption inpainted out)
BOIL_OBJ = (0.6, 0.05)          # measured in the ref (ECC on Sweet'N Sour / kiosk): <=1 px, ~0 deg -- objects are practically still
BOIL_CAR = (1.2, 0.15)          # ref green car: std 0.9 px / 0.12 deg, new pose every ~2.5 f
PUSH_OUT = [(655, 0), (656, -75), (657, -300), (659, -300), (660, -705), (661, -705), (662, -1400)]   # ref f655-662 (shift of the leaving object)
PUSH_IN = [(659, 1400), (660, 720), (661, 720), (662, 309), (664, 309), (665, 84), (666, 84), (667, 6), (669, 0)]
CAP_H = 109
@lru_cache(None)
def dayfit(word):
    f100 = font("sans", 100); capr = (f100.getbbox("H")[3] - f100.getbbox("H")[1]) / 100; s = CAP_H / capr
    words, bb = layout(word, "sans", s, -0.03 * s)
    if bb[2] - bb[0] > 760: s *= 760 / (bb[2] - bb[0]); words, bb = layout(word, "sans", s, -0.03 * s)
    return s, words, bb
def day_word(base, T, word, t_rise, col, dx=0.0):
    if T < t_rise: return
    s, words, bb = dayfit(word); x0 = 540 - (bb[2] - bb[0]) / 2; pen0 = x0 - bb[0] + dx
    u = (T - t_rise) * FPS
    off = 60 if u < 3 else (18 if u < 5 else 0)                       # rise out of the mask (bottom y 366) in 3 poses, then drift up 18 px (ref Monday)
    drift = 18 * (1 - eo((u - 5) / 12, 2)) if u >= 5 else 18
    bl = 325 + drift + off
    if u >= 5:                                                        # bar drawn left -> right behind the letters (ref f642-650)
        full = (bb[2] - bb[0]) + 16; bw = full * eo((u - 5) / 8, 2)
        lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(lay).rounded_rectangle([x0 + dx, round(bl - 35), x0 + dx + max(30, bw), round(bl - 6)], radius=14, fill=col + (255,),
                                              outline=tuple(int(c * 0.62) for c in col) + (255,), width=2)
        base.alpha_composite(lay)
    t = text_layer(words, "sans", s, pen0, bl, (0, 0, 0), track=-0.03 * s)
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).rectangle([0, 0, W, 366 if u < 5 else H], fill=255)
    t.putalpha(Image.fromarray(np.minimum(np.asarray(t.split()[-1]), np.asarray(m)))); base.alpha_composite(t)
def obj(base, name, box, dx, st, seed, k=1.0):
    p = LA(name); kk = (box[2] - box[0]) / p.width * k; s = sc(p, kk); bx, by, br = boil(seed, st, *BOIL_OBJ)
    if box[1] is None:                                               # photo cut by its own frame: feathered sides (only seen during the push), bottom on the frame edge
        a = np.asarray(s.split()[-1], np.float32); ramp = np.clip(np.arange(s.width) / 60.0, 0, 1); a *= np.minimum(ramp, ramp[::-1])[None, :]
        s = s.copy(); s.putalpha(Image.fromarray(a.astype(np.uint8)))
        sr = rot(s, br); cx = (box[0] + box[2]) / 2 + dx + bx; cy = H - s.height / 2 + 4 + by
    else:
        sr = rot(s, br); cx = (box[0] + box[2]) / 2 + dx + bx; cy = box[1] + s.height / 2 + by
    paste(base, sr, cx - sr.width / 2, cy - sr.height / 2)
def s_objects(T):
    Tq = q(T, OBJ_T0); base = bg(); st = int(round((Tq - OBJ_T0) * 12))
    for i, (name, box, word, tr, col, tin) in enumerate(OBJS):
        tnext = OBJS[i + 1][5] if i + 1 < len(OBJS) else None
        dx_in = kf(Tq, tin, 659, PUSH_IN) if tin is not None else 0.0
        dx_out = kf(Tq, tnext, 655, PUSH_OUT) if tnext is not None else 0.0
        if tin is not None and Tq < tin: continue
        if tnext is not None and Tq >= tnext + f2t(662) - f2t(655): continue
        dx = dx_in + dx_out
        obj(base, name, box, dx, st, 31 + i, lerp(1.03, 0.98, min(1, (Tq - (tin or OBJ_T0)) / 0.77)))
        day_word(base, Tq, word, tr, col, dx_out)
    return base

# ---------------------------------------------------------------- subject collage -> parallax pan (types 4 + 5: ref P07 / P09)
SUB_T0, PAN_T0, SUB_T1 = 11.450, 14.250, 16.860
LOGO_T, STAGE_T = 12.62, 13.00                                       # chest logo builds on "era un coach"; gym + sign enter on "coach fitness"
@lru_cache(1)
def coach():
    im = LA("coach").copy(); a = np.asarray(im, np.float32); al = a[..., 3] > 128
    wid = al.sum(1); collar = int(np.where(wid > 0.55 * im.width)[0][0]) - 20      # shoulders start
    y = np.arange(im.height, dtype=np.float32)
    head = 1 - B.sm_np((y - (collar - 50)) / 90); shirt = 0.62 + 0.38 * B.sm_np((y - collar) / (0.55 * (im.height - collar)))
    k = np.where(y < collar - 50, 0.15, 0.15 * head + shirt * (1 - head)); a[..., :3] *= k[:, None, None]
    hw = wid[int(collar * 0.35):int(collar * 0.55)].max()
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA"), collar, hw
HEAD_W = 380                                                         # head width at camera 1 (ref worker: cap 435 px)
def dumbbell(w, prog=1.0):
    """chest logo: white dumbbell, built like the ref arches (sparks -> strokes -> solid)"""
    S = 3; h = 0.42 * w; im = Image.new("RGBA", (int(w * S), int(h * S)), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    parts = [(0.00, 0.20, 0.12, 0.80), (0.14, 0.05, 0.26, 0.95), (0.26, 0.42, 0.74, 0.58), (0.74, 0.05, 0.86, 0.95), (0.88, 0.20, 1.00, 0.80)]
    n = max(1, int(round(len(parts) * prog)))
    for (x0, y0, x1, y1) in parts[:n]:
        d.rounded_rectangle([x0 * w * S, y0 * h * S, x1 * w * S, y1 * h * S], radius=0.03 * w * S, fill=(245, 245, 240, 235))
    return im.resize((int(w), int(h)), Image.LANCZOS)
def sub_cam(Tq):
    return {"k": 1 - 0.12 * eo((Tq - STAGE_T) / 1.24, 3) if Tq >= STAGE_T else 1.0}   # ref: 1.0 -> 0.88 over f183-220
GYM_F = (150, 640, 1500)                                             # gym box at cam 0.88 (tower + dumbbell sign left, canopy right, like the ref building)
SGN_F = (650, 130, 400)
def place(box, ck, depth): return B.place(box, ck, depth)
def stage(base, Tq, cam, dx=0.0):
    u = (Tq - STAGE_T) * FPS
    if u >= 0:                                                       # gym rises 75 px in 7 f then drifts right 1.8 px/f (ref building)
        rise = 75 * (1 - eo(u / 7, 2.5)); drift = 1.8 * min(30, max(0, u - 7)) - 54
        x, y, w = place(GYM_F, cam["k"], 0.6); g = sc(LA("gym"), w / LA("gym").width).filter(ImageFilter.GaussianBlur(2.2))
        paste(base, g, x + drift + dx, y + rise)
    u2 = u - 5
    if u2 >= 0:                                                      # pole sign drops in from top-right in 2.5 f with a 9 px rebound (ref arches)
        off = 225 * (1 - eo(u2 / 2.5, 2)) if u2 < 2.5 else -9 * math.sin(min(1, (u2 - 2.5) / 6) * math.pi) * (1 - min(1, (u2 - 2.5) / 6))
        down = 2 * min(30, max(0, u2 - 2)) - 60
        x, y, w = place(SGN_F, cam["k"], 0.5); s = sc(LA("gymsign"), w / LA("gymsign").width)
        paste(base, s, x + off + dx, y - off * 0.9 + down)
def coach_layer(Tq, cam, dx=0.0, settle=True):
    wim, collar, hw = coach(); k0 = HEAD_W / hw; t = Tq - SUB_T0
    k = k0 * ((1 + 0.18 * (1 - eo(t / 0.30, 2.5))) if settle else 1.0) * (1 - 0.01 * t)
    head_y = lerp(0, 150, eo(t / 0.87, 2.2)); cx = lerp(650, 545, eo(t / 0.47, 2.2))
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); spr = sc(wim, k * cam["k"])
    x, y = B.cam_xy(cx - spr.width / 2, head_y, cam, 1.0, spr.width / 2); paste(lay, spr, x + dx, y)
    u = (Tq - LOGO_T) * FPS                                          # logo build: sparks 2 f, strokes 5 f, solid (ref f166-173)
    if u >= 0:
        p = 0.0 if u < 2 else (min(1, (u - 2) / 5))
        lg = dumbbell(140 * cam["k"] * k / k0, max(0.2, p)); lx, ly = x + spr.width * 0.58, y + (collar + 140) * k * cam["k"]   # left chest (viewer's right)
        if u < 7:
            d = ImageDraw.Draw(lg); r = np.random.default_rng(int(u))
            for _ in range(10):
                xx, yy = r.uniform(0, lg.width), r.uniform(0, lg.height); ss = r.uniform(1.5, 3.5); d.ellipse([xx - ss, yy - ss, xx + ss, yy + ss], fill=(255, 230, 150, 230))
        paste(lay, lg, lx + dx, ly)
    return lay
HEAD_A = 400                                                         # Ashton's head width at camera 1 (ref worker: cap 435 px)
def ashton_layer(Tq, cam, dx=0.0):
    """REAL Ashton Hall cutout (user's own PNG). Face NOT darkened (he must be recognisable); same settle as the ref worker: x1.18 -> 1 in 9 f,
    head 0 -> 150 px, centre 650 -> 545, creep -1 %/s. The ref's chest-logo build is dropped (shirtless subject)."""
    im = LA("ashton_full"); k0 = HEAD_A / 245; t = Tq - SUB_T0
    k = k0 * (1 + 0.18 * (1 - eo(t / 0.30, 2.5))) * (1 - 0.01 * t)
    head_y = lerp(0, 150, eo(t / 0.87, 2.2)); cx = lerp(650, 545, eo(t / 0.47, 2.2))
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); spr = sc(im, k * cam["k"])
    x, y = B.cam_xy(cx - spr.width / 2, head_y, cam, 1.0, spr.width / 2); paste(lay, spr, x + dx, y)
    return lay
PHONE_X = [(484, 1005), (486, 909), (489, 795), (491, 675), (494, 555), (496, 429), (499, 330), (501, 240), (504, 174), (506, 126), (509, 90), (511, 66)]
CAR_X = [(499, 1560), (501, 1400), (504, 1190), (506, 1020), (509, 795), (511, 615), (514, 474), (516, 390), (519, 309)]
WORK_DX = [(466, 0), (474, -12), (476, -63), (479, -153), (481, -279), (484, -438), (486, -648), (489, -940), (491, -1300)]
STORE_DX = [(466, 0), (474, -12), (484, -243), (486, -378), (489, -489), (491, -573), (494, -690), (496, -780), (499, -880), (501, -980), (504, -1200)]
CAR_TILT = [(501, 9.0), (506, 6.0), (509, 3.0), (511, 1.2), (514, 0.0)]
CAR_HUB, CAR_R = (285, 297), 92                                     # Flow car: front hub, tyre radius -> ref hub (311,1457), radius 178
def s_subject(T):
    Tq = q(T, SUB_T0); base = bg(); cam = sub_cam(Tq)
    if Tq >= PAN_T0:                                                  # pan: pre-roll 8 f (x1.00->1.02, -1.5 px/f), then the measured ref pan
        u = (Tq - PAN_T0) * FPS; cam = {"k": cam["k"] * (1 + 0.02 * eo(u / 8))}; pre = -1.5 * min(8, u)
        dxs, dxw = kf(Tq, PAN_T0, 466, STORE_DX) + pre, kf(Tq, PAN_T0, 466, WORK_DX) + pre
    else: dxs = dxw = 0.0
    stage(base, Tq, cam, dxs)
    blur = 0 if Tq < STAGE_T - 0.05 else lerp(8, 15, sm((Tq - STAGE_T + 0.05) / 0.67))   # depth blur on the subject (ref f180-200)
    cl = ashton_layer(Tq, cam, dxw)
    if blur: cl = cl.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(cl)
    st = int(round((Tq - PAN_T0) * 12))
    if Tq >= PAN_T0 + f2t(484) - f2t(466):                            # phone = the ref kiosk (x 66-435, y 360)
        ph = sc(LA("phone_real"), 369 / LA("phone_real").width); px = kf(Tq, PAN_T0, 466, PHONE_X)
        bx, by, br = boil(11, st, *BOIL_OBJ) if Tq >= PAN_T0 + f2t(511) - f2t(466) else (0, 0, 0)
        pr = rot(ph, br); paste(base, pr, px + bx - (pr.width - ph.width) / 2, 330 + by - (pr.height - ph.height) / 2)
    if Tq >= PAN_T0 + f2t(499) - f2t(466):                            # his REAL Instagram profile (14.7M) takes the ref green car's move: nose-down 9 deg, levels, stops
        card = sc(LA("igcard"), 1010 / LA("igcard").width); wx = kf(Tq, PAN_T0, 466, CAR_X); tilt = kf(Tq, PAN_T0, 466, CAR_TILT)
        bx, by, br = boil(23, st, *BOIL_CAR) if Tq >= PAN_T0 + f2t(521) - f2t(466) else (0, 0, 0)
        cr = rot(card, tilt + br); paste(base, cr, wx - 270 - (cr.width - card.width) / 2 + bx, 880 - (cr.height - card.height) / 2 + by)
    return base

# ---------------------------------------------------------------- master
COLL = [(OBJ_T0, OBJ_T1, s_objects), (SUB_T0, SUB_T1, s_subject)]
def render(T):
    T = f2t(round(T * FPS)) + 1e-4
    fn = next((g for a, b, g in COLL if a - 1e-6 <= T < b - 1e-6), None)
    if fn is None:
        im = th_frame(T); t = title_layer(T)
        if t is not None: im.alpha_composite(t)
        c = caption_layer(T)
        if c is not None: im.alpha_composite(c)
        return im
    im = fn(T)
    if fn is s_subject:
        c = caption_layer(T)
        if c is not None: im.alpha_composite(c)
    return specks(im, T)

# ---------------------------------------------------------------- storyboard
RF = B.ROOT / "styles/ali-abdaal-2/ref_frames"
SCENES = [
    (0.75, "A1 TH + titulo", "P01 (tipo 1)", "S01_titulo_underline_full_f24.jpg", "TH abierto. 'este hombre no / se hizo viral' palabra por palabra (cada una en su frame, asienta 12 px en 3 f). Sin caption."),
    (2.40, "A2 punch + titulo + subrayado", "P02 + subrayado de P01", "S02_titulo_punch_f62.jpg", "Jump cut x1.08 justo en el corte (1.40). 'por su curiosa / rutina'; subrayado ondulado amarillo->azul bajo 'curiosa rutina': punto en 1.66, se dibuja hasta 2.22, se borra 2.40-2.56."),
    (4.40, "B1 objeto + palabra con barra", "P11 'Monday' (tipo 6)", "S09_monday_barra_f650.jpg", "Corte seco al despertador 3:52 (boil +-5 px / 1.2 grados a 12 fps). '3:52 a.m.' Neue Haas Bold sube desde la mascara en 3 poses al decir 'tres' (3.72), deriva 18 px; barra roja de izq. a der. detras."),
    (5.05, "B2 push", "P11->P12 push (tipo 7)", "S09_push_f660.jpg", "Push de 12 f medido en la ref: despertador + palabra salen con ease-in (-75/-300/-705); entra la FOTO REAL de Ashton con la cara en el bol de hielo (+720/+309/+84/+6), apoyada en el borde inferior, lados con feather."),
    (5.68, "B2b 'agua helada'", "P12 'Tuesday' (tipo 6)", "S09_tuesday_f700.jpg", "'agua helada' sube al decirlo (5.38) con barra celeste. Objetos casi quietos como en la ref (<=1 px, ~0 grados). Segundo push a 5.73."),
    (6.98, "B3 'banana'", "P12 'Tuesday' (tipo 6)", "S09_tuesday_barra_f680.jpg", "FOTO REAL de Ashton frotandose la cascara de banana (se borro el texto '8:45 am' quemado con inpaint, sin IA en la cara); 'banana' sube en 6.46 con barra amarilla. Corte seco al TH en 7.06."),
    (8.70, "C1 TH + titulo + subrayado", "P01 (tipo 1)", "S01_underline_borrado_f28.jpg", "'consiguió / 4.5 millones' palabra por palabra; subrayado ondulado bajo '4.5 millones' que se dibuja y se borra."),
    (9.95, "C2 punch + titulo", "P02 (tipo 1)", "S02_titulo_punch_f62.jpg", "Jump cut x1.12 en 8.79. 'de seguidores / en 30 días'."),
    (11.30, "C3 palabra gigante", "P03/P04 'playful?' (tipo 2)", "S03_playful_f90.jpg", "'por algo / que pocos' y luego 'notaron.' gigante (gris 45 % -> blanco en 4 f, sube 60 px), que sobrevive al corte de camara de 11.18 como 'playful?'."),
    (12.55, "D1 Ashton recortado", "P07 obrero (tipo 4)", "S05b_obrero_logo_f170.jpg", "Corte seco. Recorte REAL de Ashton Hall (PNG del usuario), cara visible: entra a x1.18 y asienta en 9 f, baja 150 px, se corre a la izquierda. Caption gris."),
    (13.95, "D1b gimnasio en quiebra", "P07 profundidad (tipo 4)", "S05c_profundidad_f230.jpg", "Al decir 'coach fitness' el gimnasio cerrado ('SE ALQUILA') sube 75 px (capa 0.6) y el cartel GYM cae desde arriba-derecha con rebote (capa 0.5); camara aleja 1.0->0.88; Ashton se desenfoca 8->15 px (profundidad)."),
    (15.00, "D2 paneo en parallax", "P09 paneo (tipo 5)", "S07_paneo_totem_f495.jpg", "Paneo medido de la ref: Ashton sale por la izquierda con ease-in, gimnasio+cartel a ~0.6x, entra el celular con un frame REAL de su video viral (la cinta en la boca) y frena al decir 'subio un video'."),
    (16.45, "D2b le cambio la vida (IG real)", "P09 coche (tipo 5)", "S07_totem_coche_f540.jpg", "Su perfil REAL de Instagram (14.7M seguidores) hace el movimiento del coche verde: entra en 'que cambio su vida' con 9 grados de nariz abajo, se nivela y frena con ease-out. Temblor de recorte medido en la ref (+-1.2 px, 0.15 grados)."),
    (18.20, "E1 TH + caption", "P05/P06 (tipo 3)", "S05a_caption_TH_f130.jpg", "Corte seco al TH. Caption gris: caja negra 30 %, FreeSans Bold 70 px, palabras no dichas al 38 %."),
    (19.80, "E2 punch / jump cuts", "P08 (tipo 3)", "S19_TH_caption_f1500.jpg", "Jump cuts x1.22 (18.46) y x1.06 (19.24) en frames de corte exactos; caption sigue."),
]
def board(only=None):
    lab = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 24); txt = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 20)
    PW, PH = 405, 720; cells = []
    for i, (T, name, typ, rf, note) in enumerate(SCENES):
        if only and str(i) not in only: continue
        ours = render(T).convert("RGB"); ours.save(FR / f"a{i:02d}_{T:.2f}.png")
        ref = Image.open(RF / rf).convert("RGB")
        c = Image.new("RGB", (PW * 2 + 30, PH + 270), "white"); d = ImageDraw.Draw(c)
        c.paste(ref.resize((PW, PH), Image.LANCZOS), (0, 44)); c.paste(ours.resize((PW, PH), Image.LANCZOS), (PW + 30, 44))
        d.text((0, 6), f"{name}   t={T:.2f}s", font=lab, fill=(20, 20, 20))
        d.text((4, 50), f"REF {typ}", font=txt, fill=(255, 40, 40)); d.text((PW + 34, 50), "NUESTRO (Ashton)", font=txt, fill=(255, 40, 40))
        lines, cur = [], ""
        for wd in note.split():
            if d.textlength(cur + " " + wd, font=txt) > PW * 2 + 20: lines.append(cur); cur = wd
            else: cur = (cur + " " + wd).strip()
        lines.append(cur)
        for k, l in enumerate(lines[:9]): d.text((0, PH + 54 + k * 24), l, font=txt, fill=(30, 30, 30))
        cells.append(c); print("scene", i, T, flush=True)
    per = 4
    for b in range(0, len(cells), per):
        grp = cells[b:b + per]; cw, ch = grp[0].size; rows = (len(grp) + 1) // 2
        S = Image.new("RGB", (cw * 2 + 60, ch * rows + 40), (235, 235, 235))
        for j, c in enumerate(grp): S.paste(c, (20 + (j % 2) * (cw + 20), 20 + (j // 2) * ch))
        S.save(OUT / f"board_{b // per + 1}.jpg", quality=90); print("board", b // per + 1)

# ---------------------------------------------------------------- audio (voice + music + SFX on real events) and motion test
SFX = B.ROOT / "pieces/docucollage-test/assets/sfx"; MUSIC = B.ROOT / "pieces/docucollage-test/assets/music.wav"
EVENTS = [(OBJ_T0, "hit", 0.55), (4.80, "wh1", 0.45), (5.73, "wh2", 0.45), (SUB_T0, "pop1", 0.55), (STAGE_T + 0.17, "wh3", 0.28),
          (PAN_T0 + 0.27, "wh1", 0.45), (PAN_T0 + f2t(501) - f2t(466), "wh2", 0.35)]
def mix(out_wav):
    """voice (edited raw) + music bed + SFX, then loudness -14 LUFS (two-pass loudnorm)"""
    ins = ["-i", str(EDIT), "-stream_loop", "-1", "-i", str(MUSIC)] + sum([["-i", str(SFX / f"{n}.wav")] for _, n, _ in EVENTS], [])
    fc = "[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.0[v];[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:%.3f,volume=0.13,afade=t=out:st=%.3f:d=0.4[m];" % (END, END - 0.4)
    for i, (t, n, v) in enumerate(EVENTS):
        fc += f"[{i + 2}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={v},adelay={int(t * 1000)}|{int(t * 1000)}[s{i}];"
    fc += "[v][m]" + "".join(f"[s{i}]" for i in range(len(EVENTS))) + f"amix=inputs={2 + len(EVENTS)}:normalize=0:duration=first,atrim=0:{END:.3f}[mx]"
    tmp = OUT / "_mix_raw.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y"] + ins + ["-filter_complex", fc, "-map", "[mx]", str(tmp)], check=True, timeout=600)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1:LRA=7:print_format=json", "-f", "null", "-"], capture_output=True, text=True, timeout=600).stderr
    m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
    ln = f"loudnorm=I=-14:TP=-1:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", ln, "-ar", "48000", str(out_wav)], check=True, timeout=600)
SEGS = [(0.0, 2.70), (2.60, 7.12), (10.90, 16.95)]
def motion():
    global READER
    READER = Reader(); tmp = OUT / "_mt"; tmp.mkdir(exist_ok=True)
    for p in tmp.glob("*.png"): p.unlink()
    mix(OUT / "mix_full.wav"); n = 0
    for a, b in SEGS:
        for fi in range(round(a * FPS), round(b * FPS)):
            render(f2t(fi)).convert("RGB").save(tmp / f"m_{n:05d}.png", compress_level=1); n += 1
        print("seg", a, b, flush=True)
    parts = "".join(f"[0:a]atrim={round(a * FPS) / FPS:.4f}:{round(b * FPS) / FPS:.4f},asetpts=PTS-STARTPTS[a{i}];" for i, (a, b) in enumerate(SEGS))
    cat = "".join(f"[a{i}]" for i in range(len(SEGS))) + f"concat=n={len(SEGS)}:v=0:a=1[aout]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(OUT / "mix_full.wav"), "-filter_complex", parts + cat, "-map", "[aout]", str(tmp / "a.wav")], check=True, timeout=600)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "30000/1001", "-i", str(tmp / "m_%05d.png"), "-i", str(tmp / "a.wav"), "-c:v", "libx264", "-crf", "17",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", str(OUT / "motion_test.mp4")], check=True, timeout=1200)
    print(OUT / "motion_test.mp4")

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "board"
    if cmd == "board": board(sys.argv[2:] or None)
    elif cmd == "motion": motion()
    elif cmd == "frame":
        for tt in sys.argv[2:]: render(float(tt)).convert("RGB").save(OUT / f"_{tt}.png")
