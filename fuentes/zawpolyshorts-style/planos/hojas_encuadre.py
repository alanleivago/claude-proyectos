"""Contact sheets Zaw vs ours for ENCUADRE.md: rows of middle frames picked from measure.json, each labelled with size,
subject height fraction, camera height and pitch (API numbers), Zaw on the top row, ours below.
Usage: .venv/bin/python -I hojas_encuadre.py <meas_dir> <out_dir> [extra_tag ...]"""
import json, sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

M, OUT = Path(sys.argv[1]), Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
OURS = sys.argv[3:] or ["ours6", "ours7v1"]
F = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 15)
FT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 24)
W, H = 216, 384


def rows(prefix):
    out = []
    for d in sorted(M.iterdir()):
        if d.is_dir() and d.name.startswith(prefix) and (d / "measure.json").exists():
            for r in json.loads((d / "measure.json").read_text()):
                r["_img"] = d / f"s{r['k']:02d}_m.jpg"; r["_tag"] = d.name; out.append(r)
    return out


def bh(b):
    return None if not b else b[3] - b[1]


def tile(r, key):
    im = Image.open(r["_img"]).convert("RGB").resize((W, H))
    d = ImageDraw.Draw(im)
    b = r.get(key + "_box")
    if b:
        d.rectangle([b[0] * W, b[1] * H, b[2] * W, b[3] * H], outline=(0, 255, 255) if key == "animal" else (255, 80, 200), width=2)
    hh = bh(b)
    txt = f"{r['size']}  h={hh:.2f}" if hh else r["size"]
    txt2 = f"cam {r.get('cam_height_m')} m  {r.get('pitch_deg')}°"
    for i, t in enumerate((txt, txt2)):
        d.rectangle([0, H - 40 + 20 * i, W, H - 20 + 20 * i], fill=(0, 0, 0))
        d.text((5, H - 38 + 20 * i), t, font=F, fill=(255, 235, 60))
    return im


def pick(rs, cond, n, key):
    c = [r for r in rs if cond(r)]
    c.sort(key=lambda r: -(bh(r.get(key + "_box")) or 0))
    if len(c) <= n:
        return c
    step = len(c) / n
    seen, out = set(), []
    for i in range(n):                       # spread over the distribution, one per video where possible
        for r in c[int(i * step):] + c:
            if r["_tag"] not in seen or len(seen) >= len({x["_tag"] for x in c}):
                out.append(r); seen.add(r["_tag"]); break
    return out


def sheet(name, title, cond, key, n=7):
    z = pick(rows("zaw_"), cond, n, key)
    o = pick([r for t in OURS for r in rows(t)], cond, n, key)
    S = Image.new("RGB", (n * (W + 6) + 120, 2 * (H + 6) + 50), (20, 20, 20)); d = ImageDraw.Draw(S)
    d.text((10, 10), title, font=FT, fill=(255, 235, 60))
    for j, (lab, rs) in enumerate((("ZAW", z), ("OURS", o))):
        y = 50 + j * (H + 6)
        d.text((10, y + H // 2 - 12), lab, font=FT, fill=(255, 255, 255))
        for i, r in enumerate(rs):
            S.paste(tile(r, key), (120 + i * (W + 6), y))
    p = OUT / f"{name}.jpg"; S.save(p, quality=85); print(p)


sheet("hoja1_animal", "Animal-main shots: box = visible animal (h = fraction of frame height)", lambda r: r.get("main") == "animal" and r.get("animal_box"), "animal")
sheet("hoja2_humanos", "Shots with a human: box = most prominent human (Zaw crops people, ours shows them whole)", lambda r: r.get("human_box") is not None, "human")
sheet("hoja3_escala", "Set scale: furniture next to the animal (sofa / table / chair / door)",
      lambda r: r.get("animal_box") and any(any(k in str(p[0]).lower() for k in ("sofa", "couch", "table", "chair", "door", "cabinet")) for p in (r.get("props") or [])), "animal")
