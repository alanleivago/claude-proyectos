"""docucollage final render, step 1: the GRAPHICS track from the approved storyboard code (board3c.py), 12 fps, RGBA.
Collage shots are opaque; talking-head shots are transparent (only the title + top dim), so HyperFrames can stack
TH video (z5) -> gfx (z10) -> host cutout (z20) -> captions (z80) -> outro (z90).
python prep/render3c.py [from_s to_s] [encode]   (ranges can run in parallel; existing frames are kept unless FORCE=1)  -> assets/gfx3c/g_00000.png ... + assets/gfx3c.webm (VP9 alpha, 12 fps)
Template: for a new reel only SHOTS (and the scene functions in board3c.py) change."""
import math, os, subprocess, sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
sys.path.insert(0, str(Path(__file__).resolve().parent))
import board3c as B
B.FINAL = True
R = B.R; OUT = R / "assets/gfx3c"; OUT.mkdir(parents=True, exist_ok=True)
FPS = 12; END = 50.30
# (scene, start, end, kind): full = opaque collage driven by its own clock; static = opaque + generic push/deblur;
# th = transparent (TH video below); thtitle = transparent title overlay; freeze = previous collage frozen + dimmed
SHOTS = [("s01", 0.00, 1.28, "full"), ("s02", 1.28, 2.80, "full"), ("s34", 2.80, 4.98, "full"), ("s05", 4.98, 6.06, "th"),
         ("s06", 6.06, 9.65, "static"), ("s07", 9.65, 12.97, "full"), ("s08", 12.97, 15.14, "static"), ("s09", 15.14, 17.33, "thtitle"),
         ("s10", 17.33, 19.73, "static"), ("s11", 19.73, 22.65, "full"), ("s12", 22.65, 23.28, "static"), ("s12b", 23.28, 24.06, "static"),
         ("s13", 24.06, 26.70, "full"), ("s14", 26.70, 28.85, "static"), ("s15", 28.85, 30.92, "static"), ("s16", 30.92, 32.42, "full"),
         ("s17", 32.42, 33.47, "static"), ("s18", 33.47, 35.14, "static"), ("s19", 35.14, 35.80, "static"), ("s20", 35.80, 36.24, "freeze"),
         ("s21", 36.24, 38.62, "thtitle"), ("s22", 38.62, 41.90, "full"), ("s23", 41.90, 46.72, "thtitle"), ("s24", 46.72, 50.30, "full")]
OWN_DEBLUR = {"s34", "s16", "s01"}          # these already deblur / open the reel
EMPTY = Image.new("RGBA", (B.W, B.H), (0, 0, 0, 0))

def shot_at(T):
    for sid, a, b, kind in SHOTS:
        if a - 1e-6 <= T < b - 1e-6: return sid, a, b, kind
    return SHOTS[-1]
def push(img, u, s1=1.045):
    """generic camera for shots without their own layer motion: ref push +1.2..2.1 %/s"""
    k = 1 + (s1 - 1) * u; w, h = round(B.W * k), round(B.H * k)
    big = img.resize((w, h), Image.BICUBIC); x = (w - B.W) / 2; y = (h - B.H) * 900 / B.H
    return big.crop((round(x), round(y), round(x) + B.W, round(y) + B.H))
def frame(T):
    sid, a, b, kind = shot_at(T); tl = B.q(T - a + 1e-6); dur = b - a
    if kind == "th": return EMPTY
    if kind == "thtitle": return B.thgfx(sid, tl)
    if kind == "freeze":                                    # S20: S19 frozen and dimmed 14 %, then dissolves to the TH under the rising host
        B.CTX.update(t=35.80 - 35.14 - 1 / 12, dur=0.66, t0=0.1)
        im = push(B.s19(0.66), 1.0)
        im = ImageEnhance.Brightness(im.convert("RGB")).enhance(0.86).convert("RGBA")
        k = 1.0 if tl < 0.28 else 0.6 if tl < 0.36 else 0.3
        im.putalpha(round(255 * k)); return im
    B.CTX.update(t=tl, dur=dur, t0=0.1, noexit=False)
    im = B.s34(tl) if sid == "s34" else B.FN[sid](tl)
    if kind == "static": im = push(im, tl / dur)
    n = math.floor(tl * 12 + 1e-6)
    if sid not in OWN_DEBLUR and n < 3: im = im.filter(ImageFilter.GaussianBlur([10, 5, 2][n]))   # ref: sharpness 0.03-0.37 right after a cut, back in 4-8 f
    return im.convert("RGBA")

if __name__ == "__main__":
    args = [x for x in sys.argv[1:] if x != "encode"]
    a = float(args[0]) if args else 0.0; z = float(args[1]) if len(args) > 1 else END
    N = round(END * FPS)
    for i in range(N):
        T = i / FPS
        if not (a - 1e-6 <= T < z): continue
        if (OUT / f"g_{i:05d}.png").exists() and not os.environ.get("FORCE"): continue      # resume / parallel ranges
        frame(T).save(OUT / f"g_{i:05d}.png", compress_level=1)
        if i % 24 == 0: print("frame", i, round(T, 2), shot_at(T)[0], flush=True)
    if (a == 0.0 and z >= END) or "encode" in sys.argv:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(OUT / "g_%05d.png"), "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
                        "-b:v", "0", "-crf", "16", "-row-mt", "1", "-auto-alt-ref", "0", str(R / "assets/gfx3c.webm")], check=True, timeout=1800, env=os.environ.copy())
        print("assets/gfx3c.webm")
