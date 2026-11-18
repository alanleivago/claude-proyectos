"""review/compare.png: ref frame | Pip | MetalShadow for the 4 key shots (02, 07, 14, 23) of upnext-01.

    cd engine && node render.mjs --page "sb.html?mentor=mentor.json" --frames 30,120,210,300 --out stills/mentor
                 node render.mjs --page "sb.html?mentor=mentor_ms.json" --frames 30,120,210,300 --out stills/mentor_ms
    python compare.py
Same post as upnext-01/tools/compose.py (vignette, grain, rounded frame, UpNext subtitle) so the columns compare 1:1."""
import json, os, sys
sys.dont_write_bytecode = True
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent; ENG = HERE / "engine"
sys.path.insert(0, str(HERE.parent / "upnext-01" / "tools"))        # read-only reuse of its post functions
import compose as C                                                 # noqa: E402

meta = json.loads((ENG / "stills" / "sb_meta.json").read_text(encoding="utf-8"))
W, H = C.W, C.H; S = 0.5; w, h = int(W * S), int(H * S)
F = lambda n: ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", n)
cols = [("REF (@jongmin.design)", None), ("Pip (current)", "mentor"), ("MetalShadow 0.72 m", "mentor_ms")]
sheet = Image.new("RGB", (3 * w + 4 * 24, 90 + len(meta) * (h + 70)), (18, 18, 22)); d = ImageDraw.Draw(sheet)
d.text((24, 24), "upnext-01 key shots: ref | Pip | MetalShadow (same scene, camera, clip and expression; girl 1.6 m)", font=F(34), fill=(240, 240, 240))
for i, m in enumerate(meta):
    sid = m["id"]; y = 90 + i * (h + 70)
    d.text((24, y + 8), f"shot {sid}  {m['t'][0]:.1f}-{m['t'][1]:.1f} s   {m.get('line', '')}   [{m.get('clip', '')} / {m.get('face', '')}]", font=F(26), fill=(255, 220, 120))
    for j, (lab, sub) in enumerate(cols):
        if sub is None:
            img = Image.open(ENG / "ref" / f"r_{sid}.png").convert("RGB").resize((W, H))
        else:
            img = Image.open(ENG / "stills" / sub / f"f_{(i * 3 + 1) * 30:04d}.png").convert("RGB").resize((W, H), Image.NEAREST)
            img = C.post(img, sid in C.NIGHT, i)
            if m.get("line"):
                spk = m["who"].split("/")[0].strip().split(" ")[0]
                C.subtitle(img, m["line"].replace("...", "…"), C.WHITE if spk == "GIRL" else C.YELLOW)
        x = 24 + j * (w + 24)
        sheet.paste(img.resize((w, h), Image.LANCZOS), (x, y + 50))
        d.text((x + 10, y + 60), lab, font=F(28), fill=(255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0))
os.makedirs(HERE / "review", exist_ok=True)
sheet.save(HERE / "review" / "compare.png"); print("COMPARE", sheet.size)
