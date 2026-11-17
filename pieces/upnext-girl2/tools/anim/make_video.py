"""review/anims_v2_preview.mp4 (or argv[1]) from review/engine2/vid/<clip>_NNN.png (render2.mjs video): name label, 1080x1920, 30 fps"""
import sys, json, os, glob, shutil, subprocess
OUT = sys.argv[1] if len(sys.argv) > 1 else "review/anims_v2_preview.mp4"
from PIL import Image, ImageDraw, ImageFont
acts = json.load(open("out/actions.json")); order = [c for c in acts if c != "his_idle"] + ["his_idle"]
tmp = "ref/_vidseq"; shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
try: fb, fs = ImageFont.truetype("arialbd.ttf", 38), ImageFont.truetype("arial.ttf", 22)
except Exception: fb = fs = ImageFont.load_default()
n = 0
for i, c in enumerate(order):
    frames = sorted(glob.glob(f"review/engine2/vid/{c}_[0-9][0-9][0-9].png"))
    a = acts[c]; sub = f"{i + 1}/{len(order)}  {a.get('seconds')} s{'  loop' if a.get('loop') else ''}"
    for p in frames:
        im = Image.open(p).convert("RGB"); d = ImageDraw.Draw(im)
        w = d.textlength(c, font=fb); d.rectangle([14, 14, 34 + max(w, d.textlength(sub, font=fs)), 100], fill=(18, 18, 18))
        d.text((24, 20), c, fill=(253, 217, 65), font=fb); d.text((24, 66), sub, fill=(235, 235, 235), font=fs)
        im.save(f"{tmp}/{n:05d}.png"); n += 1
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", f"{tmp}/%05d.png", "-vf", "scale=1080:1920:flags=neighbor",
                "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT],
               check=True, timeout=1800)
shutil.rmtree(tmp); print(OUT, n, "frames")
