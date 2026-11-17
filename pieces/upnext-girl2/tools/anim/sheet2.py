"""python tools/anim/sheet2.py out.png clip1,clip2|all views n [scale] -> contact sheet, one row per clip (n frames per view)"""
import sys, json, os
from PIL import Image, ImageDraw, ImageFont
out, clips, views, n = sys.argv[1], sys.argv[2], sys.argv[3].split(","), int(sys.argv[4]); sc = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
acts = json.load(open("out/actions.json"))
clips = [c for c in acts if c != "his_idle"] + ["his_idle"] if clips == "all" else clips.split(",")
E = "review/engine2/"; w, h = Image.open(f"{E}{clips[0]}_{views[0]}_0.png").size
cw, ch = int(w * sc), int(h * sc); W = cw * n * len(views); rows = []
try: fnt = ImageFont.truetype("arial.ttf", max(14, int(22 * sc * 1.6)))
except Exception: fnt = ImageFont.load_default()
for c in clips:
    row = Image.new("RGB", (W, ch), (235, 221, 199))
    for vi, v in enumerate(views):
        for i in range(n):
            p = f"{E}{c}_{v}_{i}.png"
            if os.path.exists(p): row.paste(Image.open(p).convert("RGB").resize((cw, ch)), ((vi * n + i) * cw, 0))
    d = ImageDraw.Draw(row); a = acts.get(c, {}); t = f"{c}  {a.get('seconds', '')}s{' loop' if a.get('loop') else ''}"
    d.rectangle([0, 0, d.textlength(t, font=fnt) + 12, fnt.size + 10], fill=(20, 20, 20)); d.text((6, 4), t, fill=(255, 255, 255), font=fnt)
    for vi in range(1, len(views)): d.line([(vi * n * cw, 0), (vi * n * cw, ch)], fill=(120, 100, 80), width=3)
    rows.append(row)
sh = Image.new("RGB", (W, ch * len(rows))); [sh.paste(r, (0, i * ch)) for i, r in enumerate(rows)]
sh.save(out); print("sheet", out, sh.size)
