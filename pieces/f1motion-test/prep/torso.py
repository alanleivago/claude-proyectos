"""Presenter head+torso still for the pixel->real scene: BiRefNet matte of one frame, cropped; pixelated torso variants."""
import subprocess, numpy as np
from pathlib import Path
from PIL import Image
from rembg import new_session, remove
R = Path(__file__).resolve().parent.parent
src = R / "prep/torso_src.png"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "26.9", "-i", str(R.parent / "stimulus-05-hf/assets/edit.mp4"), "-frames:v", "1", str(src)], check=True)
im = Image.open(src).convert("RGB")
a = np.asarray(remove(im, session=new_session("birefnet-portrait"), only_mask=True), np.float32)
a = np.clip((a - 40) * 255 / 175, 0, 255).astype(np.uint8)
a[1330:] = 0                                   # cut at the table (no jersey on the table)
im.putalpha(Image.fromarray(a))
box = im.getbbox(); print("bbox", box)
im = im.crop(box); im.save(R / "assets/torso_real.png")
NECK = 1000 - box[1]                           # rows above this stay real (head)
for bs in (36, 22, 12, 6):
    w, h = im.size
    sm = im.resize((max(1, w // bs), max(1, h // bs)), Image.NEAREST).resize((w, h), Image.NEAREST)
    out = im.copy(); out.paste(sm.crop((0, NECK, w, h)), (0, NECK)); out.save(R / f"assets/torso_px{bs}.png")
print("ok", im.size, NECK)
