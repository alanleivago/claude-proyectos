"""Kit de marcas de las novelas (VISTA / MAJESTIC / MEXI / SINMARCA): música propia y posición de la marca de agua.
Uso en edit.py:  sys.path.insert(0, str(D.parent / "_marcas")); from marca import brand, brand_wm
    cfg, M = brand("MAJESTIC")       # M = carpeta con tension.mp3, calida.mp3, revelacion.mp3, boom.mp3, boom/
    brand_wm("MAJESTIC", R / "wm.png")
Prueba: python -I marca.py  -> test_<MARCA>.png (720x1280) sobre un fotograma"""
import json
from pathlib import Path
K = Path(__file__).parent

def brand(name):
    return json.loads((K / "marcas.json").read_text(encoding="utf-8"))[name], K / name

def brand_wm(name, out="wm.png"):
    from PIL import Image, ImageDraw, ImageFont
    c, _ = brand(name)
    im = Image.new("RGBA", (720, 1280), (0, 0, 0, 0))
    if not c.get("text"): im.save(out); return Path(out)  # SINMARCA: png 100 % transparente, el overlay de edit.py no deja nada
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", c["size"]); w = d.textlength(c["text"], font=f)
    x = {"center": (720 - w) / 2, "left": c.get("x", 36), "right": 720 - c.get("margin", 36) - w}[c["align"]]
    d.text((x, c["y"]), c["text"], font=f, fill=(255, 255, 255, c["alpha"])); im.save(out)
    return Path(out)

if __name__ == "__main__":
    import sys
    from PIL import Image
    bg = sys.argv[1] if len(sys.argv) > 1 else None
    for n in ("VISTA", "MAJESTIC", "MEXI", "SINMARCA"):
        wm = brand_wm(n, K / f"wm_{n}.png")
        base = Image.open(bg).convert("RGBA").resize((720, 1280)) if bg else Image.new("RGBA", (720, 1280), (90, 70, 60, 255))
        Image.alpha_composite(base, Image.open(wm)).convert("RGB").save(K / f"test_{n}.png"); wm.unlink()
        print(K / f"test_{n}.png")
