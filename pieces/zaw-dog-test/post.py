"""venv: ps1_post dither (pieces/lps-lowpoly-test/photoprop.py) on every final frame, then encode.
python post.py turn|walk|expr|check"""
import glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(H, "..", "lps-lowpoly-test"))
from photoprop import ps1_post  # noqa: E402

R = os.path.join(H, "renders")
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
mode = sys.argv[1]


def video(name):
    src, dst = os.path.join(R, f"frames_{name}"), os.path.join(R, f"post_{name}")
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(src, "*.png"))):
        ps1_post(Image.open(f)).save(os.path.join(dst, os.path.basename(f)))
    out = os.path.join(R, f"{name}.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", os.path.join(dst, "%05d.png"),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-movflags", "+faststart", out], check=True)
    print(out)


if mode in ("turn", "walk"):
    video(mode)
elif mode == "expr":
    names = ["neutral", "happy", "sad", "judging", "shocked"]
    cell, ch = Image.open(os.path.join(R, "expr", "neutral.png")).size
    sheet = Image.new("RGB", (cell * 5, ch + 160), (24, 20, 18))
    d = ImageDraw.Draw(sheet); fnt = ImageFont.truetype(FONT, 96)
    for i, n in enumerate(names):
        sheet.paste(ps1_post(Image.open(os.path.join(R, "expr", f"{n}.png"))), (i * cell, 0))
        d.text((i * cell + cell / 2, ch + 120), n.upper(), font=fnt, fill=(245, 235, 48), anchor="ms",
               stroke_width=8, stroke_fill=(0, 0, 0))
    sheet.save(os.path.join(R, "expressions.png")); print(os.path.join(R, "expressions.png"))
