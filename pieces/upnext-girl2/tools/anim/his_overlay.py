"""his_idle rendered through his calibrated turntable camera vs his frames.
python tools/anim/his_overlay.py out.png glb1[,glb2...] [k,k,...] [crop x0,y0,x1,y1]
cols per frame k: his frame | each glb render | edge overlay (his edges red, glb edges cyan) of the last glb"""
import sys, os, json, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFilter
os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
out = sys.argv[1]; glbs = sys.argv[2].split(","); ks = [int(k) for k in (sys.argv[3] if len(sys.argv) > 3 else "0,42,84,125,167,209").split(",")]
crop = tuple(int(v) for v in sys.argv[4].split(",")) if len(sys.argv) > 4 else (240, 280, 840, 1100)
RAW = "review/his_overlay"; os.makedirs(RAW, exist_ok=True)
jobs = [dict(name=f"{os.path.splitext(g)[0]}_{k}", kind="his", eyes="open", mouth="neutral", k=k, glb=g, w=1080, h=1920) for g in glbs for k in ks]
json.dump(jobs, open(f"{RAW}/_jobs.json", "w"))
subprocess.run(["node", "tools/face_review.mjs", f"{RAW}/_jobs.json", RAW], check=True, capture_output=True)
BG = np.array([235, 221, 199])
def mask(a): return (np.abs(a.astype(int) - BG).sum(2) > 40)
def edge(m): mm = Image.fromarray((m * 255).astype(np.uint8)); return np.asarray(mm.filter(ImageFilter.FIND_EDGES)) > 0
cw = crop[2] - crop[0]; ch = crop[3] - crop[1]; sc = 0.5; tw, th = int(cw * sc), int(ch * sc)
ncol = 2 + len(glbs); G = Image.new("RGB", (ncol * tw, len(ks) * th), (30, 30, 30)); d = ImageDraw.Draw(G)
for r, k in enumerate(ks):
    his = np.asarray(Image.open(f"ref/frames/f{k + 1:03d}.png").convert("RGB"))
    G.paste(Image.fromarray(his).crop(crop).resize((tw, th)), (0, r * th)); d.text((4, r * th + 4), f"his f{k + 1}", fill=(255, 0, 0))
    last = None
    for j, g in enumerate(glbs):
        a = np.asarray(Image.open(f"{RAW}/{os.path.splitext(g)[0]}_{k}.png").convert("RGB")); last = a
        G.paste(Image.fromarray(a).crop(crop).resize((tw, th)), ((1 + j) * tw, r * th)); d.text(((1 + j) * tw + 4, r * th + 4), g, fill=(0, 0, 0))
    ov = (his.astype(float) * 0.55 + 255 * 0.45).astype(np.uint8)
    eh, eg = edge(mask(his)), edge(mask(last))
    ov[eh] = [230, 0, 0]; ov[eg] = [0, 170, 230]
    G.paste(Image.fromarray(ov).crop(crop).resize((tw, th)), ((ncol - 1) * tw, r * th)); d.text(((ncol - 1) * tw + 4, r * th + 4), "red his / blue ours", fill=(0, 0, 0))
G.save(out); print(out, G.size)
