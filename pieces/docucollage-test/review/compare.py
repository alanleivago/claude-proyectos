"""side-by-side: render frame (left) vs reel frame of the same scene type (right). python review/compare.py out.jpg  t|reel|rt|label ..."""
import subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
R = Path(__file__).resolve().parent.parent; REELS = R.parent.parent / "fuentes/docucollage/reels"
def grab(v, t):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t}", "-i", str(v), "-frames:v", "1", "-vf", "scale=360:640", "-f", "image2pipe", "-c:v", "png", "-"], capture_output=True).stdout
    import io; return Image.open(io.BytesIO(raw)).convert("RGB")
pairs = [a.split("|") for a in sys.argv[2:]]
S = Image.new("RGB", (len(pairs) * 740, 680), "white"); d = ImageDraw.Draw(S); f = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 18)
for k, (t, reel, rt, lab) in enumerate(pairs):
    S.paste(grab(R / "renders/docucollage-test.mp4", float(t)), (k * 740, 30)); S.paste(grab((REELS / reel / "reel1080.mp4") if (REELS / reel / "reel1080.mp4").exists() else (REELS / reel / "reel.mp4"), float(rt)), (k * 740 + 370, 30))
    d.text((k * 740 + 4, 6), f"{lab}: ours {t}s | {reel[:4]} {rt}s", fill="black", font=f)
S.save(R / "review" / sys.argv[1], quality=85)
