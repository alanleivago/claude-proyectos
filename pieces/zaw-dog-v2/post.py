"""venv: ps1_post dither (pieces/lps-lowpoly-test/photoprop.py) on every final frame, then encode / make sheets.
python post.py turn|walk|expr|closeups|compare|all"""
import glob
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(H, "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "pieces", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402

R = os.path.join(H, "renders"); REV = os.path.join(H, "review")
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
EXPRS = ["neutral", "happy", "sad", "judging", "shocked"]


def label(d, xy, text, size=72):
    d.text(xy, text, font=ImageFont.truetype(FONT, size), fill=(245, 235, 48), anchor="ms", stroke_width=size // 10,
           stroke_fill=(0, 0, 0))


def video(name):
    src, dst = os.path.join(R, f"frames_{name}"), os.path.join(R, f"post_{name}")
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, "*.png"))):
        ps1_post(Image.open(f)).save(os.path.join(dst, os.path.basename(f)))
    out = os.path.join(R, {"turn": "turntable.mp4"}.get(name, f"{name}.mp4"))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", os.path.join(dst, "%05d.png"),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-movflags", "+faststart", out], check=True)
    print(out)


def expr_sheet():
    cell = Image.open(os.path.join(REV, "expr", "neutral.png")).size
    cu = 1080
    sheet = Image.new("RGB", (cell[0] * 5, cell[1] + cu + 200), (24, 20, 18))
    d = ImageDraw.Draw(sheet)
    for i, n in enumerate(EXPRS):
        sheet.paste(ps1_post(Image.open(os.path.join(REV, "expr", f"{n}.png"))), (i * cell[0], 0))
        sheet.paste(ps1_post(Image.open(os.path.join(REV, "head", f"face_{n}.png"))), (i * cell[0], cell[1]))
        label(d, (i * cell[0] + cell[0] / 2, cell[1] + cu + 140), n.upper(), 96)
    out = os.path.join(R, "expressions.png"); sheet.save(out); print(out)


def closeups():
    names = [("head", "front", "HEAD FRONT"), ("head", "q34", "HEAD 3/4"), ("head", "side", "HEAD SIDE"),
             ("head", "low", "HEAD LOW"), ("head", "q34b", "HEAD 3/4 BACK"), ("head", "top", "HEAD TOP"),
             ("check", "back", "BACK"), ("check", "q34b", "3/4 BACK"), ("check", "top", "TOP")]
    W = 720
    sheet = Image.new("RGB", (W * 3, W * 3), (24, 20, 18))
    d = ImageDraw.Draw(sheet)
    for i, (sub, n, lab) in enumerate(names):
        im = ps1_post(Image.open(os.path.join(REV, sub, f"{n}.png")))
        w, h = im.size; s = min(w, h)
        im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((W, W), Image.NEAREST)
        sheet.paste(im, ((i % 3) * W, (i // 3) * W))
        label(d, ((i % 3) * W + W / 2, (i // 3) * W + W - 30), lab, 52)
    out = os.path.join(R, "closeups.png"); sheet.save(out); print(out)


def compare():
    """Zaw cat | old dog (v1) | v2 anime (rejected) | v2 realistic, at matching framings."""
    Wc, Hc = 600, 800

    def fit(im):
        im = im.convert("RGB"); w, h = im.size; k = max(Wc / w, Hc / h)
        im = im.resize((int(w * k), int(h * k)), Image.LANCZOS); w, h = im.size
        return im.crop(((w - Wc) // 2, (h - Hc) // 2, (w - Wc) // 2 + Wc, (h - Hc) // 2 + Hc))
    zaw = os.path.join(H, "ref", "zaw"); an = os.path.join(REV, "anime")
    old_sheet = Image.open(os.path.join(ROOT, "pieces", "zaw-dog-test", "renders", "expressions.png"))
    old_front = old_sheet.crop((0, 0, 1080, 1352))
    old_back = Image.open(os.path.join(ROOT, "pieces", "zaw-dog-01", "review", "dog_back", "back34.png"))
    old_ear = Image.open(os.path.join(ROOT, "pieces", "zaw-dog-01", "review", "dog_back", "ear_cu.png"))
    an_front = ps1_post(Image.open(os.path.join(an, "expr_neutral.png")))
    an_back = ps1_post(Image.open(os.path.join(an, "q34b.png")))
    an_head = ps1_post(Image.open(os.path.join(an, "head_q34.png")))
    new_front = ps1_post(Image.open(os.path.join(REV, "expr", "neutral.png")))
    new_back = ps1_post(Image.open(os.path.join(REV, "check", "q34b.png")))
    new_head = ps1_post(Image.open(os.path.join(REV, "head", "q34.png")))
    cat_a = Image.open(os.path.join(zaw, "cat_2.png")).crop((120, 300, 1000, 1470))
    cat_b = Image.open(os.path.join(zaw, "cat_1.png")).crop((80, 320, 1000, 1546))
    cat_c = Image.open(os.path.join(zaw, "cat_1.png")).crop((330, 420, 960, 1260))
    rows = [(cat_a, old_front, an_front, new_front), (cat_b, old_back, an_back, new_back), (cat_c, old_ear, an_head, new_head)]
    sheet = Image.new("RGB", (Wc * 4, Hc * 3 + 100), (24, 20, 18))
    d = ImageDraw.Draw(sheet)
    for j, t in enumerate(("ZAW CAT", "OLD DOG (v1)", "v2 ANIME (no)", "v2 REAL")):
        label(d, (j * Wc + Wc / 2, 78), t, 56)
    for i, row in enumerate(rows):
        for j, im in enumerate(row):
            sheet.paste(fit(im), (j * Wc, 100 + i * Hc))
    for out in (os.path.join(R, "compare.jpg"), os.path.join(REV, "compare.jpg")):
        sheet.save(out, quality=92); print(out)


if __name__ == "__main__":
    os.makedirs(R, exist_ok=True)
    mode = sys.argv[1]
    if mode in ("turn", "walk"):
        video(mode)
    elif mode == "expr":
        expr_sheet()
    elif mode == "closeups":
        closeups()
    elif mode == "compare":
        compare()
    elif mode == "all":
        video("turn"); video("walk"); expr_sheet(); closeups(); compare()
