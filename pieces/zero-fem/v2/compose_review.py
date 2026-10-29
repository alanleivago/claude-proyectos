"""python v2/compose_review.py -> review/fem_v2_compare.png, fem_v2_expressions.png, fem_v2_anim_frames.png
(reference image: put the user's fan art at review/ref.png and re-run; it is placed at the left of the compare sheet)"""
import os, glob
from PIL import Image, ImageDraw, ImageFont
Z = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); V2 = os.path.join(Z, "v2"); R = os.path.join(Z, "review"); os.makedirs(R, exist_ok=True)
fb = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22); fs = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)
BG = (18, 18, 22)


def frame(path, i=0):
    return Image.open(sorted(glob.glob(path))[i]).convert("RGB")


# ---------------- compare: unlit (rule) + in-engine look, v1 vs v2, front / 3q / side, + reference
W, H = 330, 600
unlit = {(t, v): Image.open(os.path.join(V2, "out", f"{t}_{v}.png")).convert("RGB").crop((95, 120, 425, 720)) for t in ("before", "after") for v in ("front", "3q", "side")}
lit = {(t, v): frame(os.path.join(V2, "anim", f"cmp_{t}", f"idle_{v}", "*.png")).resize((W, int(W * 480 / 300))).crop((0, 0, W, H)) for t in ("v1", "v2") for v in ("front", "3q", "side")}
ref = os.path.join(R, "ref.png")
refw = 420
sheet = Image.new("RGB", (refw + 6 * W + 20, 2 * H + 110), BG); d = ImageDraw.Draw(sheet)
d.text((10, 8), "Mechayuki femenina v2 - antes (v1) / despues (v2): frente, 3/4, perfil. Fila 1: sin luz (regla). Fila 2: como se ve en el motor de los videos.", fill=(255, 220, 80), font=fb)
if os.path.exists(ref):
    im = Image.open(ref).convert("RGB"); im.thumbnail((refw - 10, 2 * H)); sheet.paste(im, (5, 50))
else:
    d.rectangle([5, 50, refw - 5, 50 + 2 * H], outline=(120, 120, 130)); d.text((20, 60 + H - 30), "REFERENCIA\n(no la recibi como archivo:\nguardala en review/ref.png\ny vuelve a correr\nv2/compose_review.py)", fill=(200, 200, 210), font=fb)
for r, (src, tags) in enumerate(((unlit, ("before", "after")), (lit, ("v1", "v2")))):
    for c, (t, v) in enumerate([(t, v) for t in tags for v in ("front", "3q", "side")]):
        x, y = refw + c * W + (20 if c >= 3 else 0), 50 + r * (H + 30)
        sheet.paste(src[(t, v)], (x, y))
        d.text((x + 8, y + 6), ("v1 " if t in ("before", "v1") else "v2 ") + {"front": "frente", "3q": "3/4", "side": "perfil"}[v], fill=(255, 255, 255), font=fs)
sheet.save(os.path.join(R, "fem_v2_compare.png"))

# ---------------- expressions: atlas cells (new) + the 5 combos on the 3D face
eyes = Image.open(os.path.join(V2, "face", "face_eyes.png")).convert("RGB"); mouth = Image.open(os.path.join(V2, "face", "face_mouth.png")).convert("RGB")
combos = [("smirk_pose", "smirk (ojo entrecerrado + sonrisa ladeada)"), ("flirty_wink", "guino + rubor"), ("shy_smile", "sonrisa suave + rubor"),
          ("proud_pose", "coqueta / orgullosa"), ("sweet_surprise", "sorpresa dulce")]
ex = Image.new("RGB", (5 * 300, 480 + 60 + 2 * 256 + 60), BG); d = ImageDraw.Draw(ex)
d.text((10, 8), "Expresiones nuevas v2 (celdas 13-15 de cada atlas) y combinaciones en 3D", fill=(255, 220, 80), font=fb)
for i, (a, label) in enumerate(combos):
    ex.paste(frame(os.path.join(V2, "anim", "frames_face", f"{a}_front", "*.png"), -1), (i * 300, 44)); d.text((i * 300 + 6, 44 + 482), label, fill=(255, 255, 255), font=fs)
y0 = 44 + 480 + 40
for j, (nm, im) in enumerate((("ojos", eyes), ("boca", mouth))):
    for k, c in enumerate((0, 7, 13, 14, 15) if j == 0 else (0, 1, 13, 14, 15)):
        ex.paste(im.crop((c * 64, 0, c * 64 + 64, 64)).resize((256, 256), Image.NEAREST), (k * 300 + 22, y0 + j * 262))
    names = (["open (v2)", "wink", "smirk", "soft", "sparkle"] if j == 0 else ["neutral", "smile", "smirk", "blushSmile", "blushGasp"])
    for k, n in enumerate(names): d.text((k * 300 + 26, y0 + j * 262 + 4), n, fill=(255, 255, 0), font=fs)
ex.save(os.path.join(R, "fem_v2_expressions.png"))

# ---------------- animation frames with the new body (engine look)
acts = [("dig", 2), ("detector_walk", 1), ("push_heavy", 2), ("melt_beam", 4), ("squat", 4), ("turn_key", 3)]
an = Image.new("RGB", (len(acts) * 300, 480 + 40), BG); d = ImageDraw.Draw(an)
for i, (a, k) in enumerate(acts):
    an.paste(frame(os.path.join(V2, "anim", "anim_frames", f"{a}_3q", "*.png"), k), (i * 300, 40)); d.text((i * 300 + 8, 8), a, fill=(255, 220, 80), font=fb)
an.save(os.path.join(R, "fem_v2_anim_frames.png"))
print("review sheets written")
