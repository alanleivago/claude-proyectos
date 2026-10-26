"""python compare.py 30 100 170 280 -> our stills (top) vs the ref at the same frames (bottom), in the scratchpad."""
import sys, subprocess, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = r"C:\Users\ALANLE~1\AppData\Local\Temp\claude\f--Claude-Proyectos\b19cd1d9-332a-4ffd-91ff-b618e0ca55df\scratchpad\sina"
frames = [int(a) for a in sys.argv[1:]]
W, H = 270, 480
sheet = Image.new("RGB", (W * len(frames), H * 2))
for i, f in enumerate(frames):
    ref = os.path.join(OUT, f"ref_{f}.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(HERE, "ref", "ref10.mp4"), "-vf", f"select=eq(n\\,{f})",
                    "-fps_mode", "passthrough", "-frames:v", "1", ref], check=True)
    sheet.paste(Image.open(os.path.join(HERE, "stills", f"f_{f:04d}.png")).convert("RGB").resize((W, H)), (i * W, 0))
    sheet.paste(Image.open(ref).convert("RGB").resize((W, H)), (i * W, H))
sheet.save(os.path.join(OUT, "compare.jpg"), quality=90)
