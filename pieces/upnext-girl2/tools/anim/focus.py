"""close-up grid: python tools/anim/focus.py out.png glb "clip:frame:bone:dist:yaw:elev;..." [cols] [size]"""
import sys, os, subprocess
from PIL import Image, ImageDraw
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
out, glb, specs = sys.argv[1], sys.argv[2], sys.argv[3]; cols = int(sys.argv[4]) if len(sys.argv) > 4 else 4; sz = int(sys.argv[5]) if len(sys.argv) > 5 else 300
subprocess.run(["node", "tools/anim/render2.mjs", "focus", specs, "0", "front", str(sz), str(sz)], env=dict(os.environ, GLB=glb), check=True, capture_output=True)
sp = specs.split(";"); rows = (len(sp) + cols - 1) // cols
G = Image.new("RGB", (cols * sz, rows * sz), (30, 30, 30)); d = ImageDraw.Draw(G)
for i, s in enumerate(sp):
    G.paste(Image.open(f"review/engine2/focus_{i}.png").convert("RGB"), ((i % cols) * sz, (i // cols) * sz))
    d.text(((i % cols) * sz + 4, (i // cols) * sz + 4), ":".join(s.split(":")[:3]), fill=(0, 0, 0))
G.save(out); print(out, G.size)
