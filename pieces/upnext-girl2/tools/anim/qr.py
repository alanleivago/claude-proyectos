"""review strips: python tools/anim/qr.py clip1,clip2,... [glb] [n] [views] -> scratchpad/qr.png (rows = clips, n frames x views)"""
import sys, json, subprocess, os
from PIL import Image, ImageDraw
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
S = "/private/tmp/upnext-scratch/"
clips = sys.argv[1].split(","); glb = sys.argv[2] if len(sys.argv) > 2 else "_t_bare.glb"; n = int(sys.argv[3]) if len(sys.argv) > 3 else 4
views = (sys.argv[4] if len(sys.argv) > 4 else "3q,front").split(",")
acts = json.load(open("out/actions.json"))
shots = []
for c in clips:
    N = acts[c]["frames"]; fr = [round(i * (N - 1) / (n - 1)) for i in range(n)] if acts[c]["loop"] else [0, round(N * 0.3), round(N * 0.55), N - 1]
    if not acts[c]["loop"] and n == 3: fr = [round(N * 0.33), round(N * 0.6), N - 1]
    if not acts[c]["loop"] and n > 4: fr = [round(i * (N - 1) / (n - 1)) for i in range(n)]
    shots += [(c, f) for f in fr]
env = dict(os.environ, GLB=glb, CAMR=os.environ.get("CAMR", "22.5"), CAMH=os.environ.get("CAMH", "-2.4"))
subprocess.run(["node", "tools/anim/render2.mjs", "shots", ",".join(f"{c}:{f}" for c, f in shots), "0", ",".join(views), "300", "520"], env=env, check=True, capture_output=True)
cw, ch = 220, 500
G = Image.new("RGB", (cw * n * len(views), ch * len(clips)), (235, 221, 199)); d = ImageDraw.Draw(G)
for r, c in enumerate(clips):
    fr = [f for cc, f in shots if cc == c]
    for vi, v in enumerate(views):
        for i, f in enumerate(fr):
            im = Image.open(f"review/engine2/shot_{c}_{f}_{v}.png").convert("RGB").crop((40, 10, 260, 510))
            G.paste(im, ((vi * n + i) * cw, r * ch)); d.text(((vi * n + i) * cw + 3, r * ch + 3), f"{c} {f} {v}", fill=(0, 0, 0))
    d.line([(n * cw, r * ch), (n * cw, (r + 1) * ch)], fill=(120, 100, 80), width=2)
G.save(S + "qr.png"); print(G.size)
