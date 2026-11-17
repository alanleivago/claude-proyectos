"""review/walk_v5_vs_ref.mp4: MercurialForge 12:38 walk (left) next to ours (right), synced on the hip sway, 25 fps
needs the ref frames (ffmpeg -ss 12:37 -t 9 -i v.webm -vf crop=600:800:560:80 <dir>/f%03d.png) as argv[1]"""
import sys, os, subprocess, shutil, numpy as np
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
REF = sys.argv[1]; R0, RP = 20, 30                       # ref cycle starts at f020, period 30 frames (1.2 s at 25 fps)
OURS_N, OURS_PH0 = 36, 6.5                               # our walk: 36 frames at 30 fps, hip over the left foot at ~6.5
glb = sys.argv[2] if len(sys.argv) > 2 else "girl2_curvy_bare.glb"
subprocess.run(["node", "tools/anim/render2.mjs", "shots", ",".join(f"walk:{f}" for f in range(OURS_N)), "0", "front", "540", "960"],
               env=dict(os.environ, GLB=glb), check=True, capture_output=True)
tmp = "ref/_wvr"; shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
fb = ImageFont.truetype("arialbd.ttf", 26); fs = ImageFont.truetype("arial.ttf", 18)
for i in range(150):
    rf = R0 + (i % RP); ref = Image.open(f"{REF}/f{rf:03d}.png").convert("RGB").resize((540, 720))
    of = int(round(OURS_PH0 + i / 25 * 30)) % OURS_N
    ours = Image.open(f"review/engine2/shot_walk_{of}_front.png").convert("RGB").resize((405, 720))
    G = Image.new("RGB", (1080, 760), (20, 20, 20)); G.paste(ref, (0, 40)); G.paste(Image.new("RGB", (540, 720), ours.getpixel((5, 5))), (540, 40)); G.paste(ours, (607, 40)); d = ImageDraw.Draw(G)
    d.text((10, 6), "MercurialForge 12:38 (reference)", fill=(255, 255, 255), font=fb); d.text((550, 6), "girl2 walk v5", fill=(253, 217, 65), font=fb)
    d.text((10, 730), f"ref frame {rf}   cycle 1.2 s", fill=(200, 200, 200), font=fs); d.text((550, 730), f"walk frame {of} / 36   cycle 1.2 s", fill=(200, 200, 200), font=fs)
    G.save(f"{tmp}/{i:04d}.png")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "25", "-i", f"{tmp}/%04d.png", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", "review/walk_v5_vs_ref.mp4"], check=True)
shutil.rmtree(tmp); print("review/walk_v5_vs_ref.mp4")
