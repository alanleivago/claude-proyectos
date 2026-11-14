"""User's PNG icons (EMOJIS PNG) -> white line icons like his Premiere 'Invertir' effect.
python styles/stimulus/make_icons.py [--sheet out.jpg]   writes styles/stimulus/icons_png/<name>.png (256 px, trimmed, white on alpha)
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps
SRC = Path(r"D:\Alan\Fiverr Upwork trabajo fotos y videos\EMOJIS PNG")
OUT = Path(__file__).parent / "icons_png"
MAP = {   # name used in gen.py -> user's PNG (the ones from "Stimulus reels buenos" first); only black line icons (they invert to white)
    "eye": "ojo icon.png", "shirt": "icon shirt franela futbol icon.png", "kit": "ropa deportiva icon.png",
    "ball": "futbol balon icon.png", "bag": "bag icon bolso.png", "search": "icon lupa.png",
    "player": "jugador de futbol icon.png", "training": "futbol soccer training icon.png", "dollar": "dollar icon money.png",
    "clock": "reloj icon.png", "person": "person jugador icon.png", "box": "caja icon (1).png", "return": "caja icon return.png",
    "phone": "phone telefono icon.png", "logo": "logo icon.png", "team": "team soccer equipo futbol icon.png",
    "size": "size medida.png", "ticket": "icon orden ticket mano.png", "happy": "energia persona feliz icon.png",
    "one": "numero 1 uno icon.png", "two": "numero 2 dos icon.png", "three": "tres number numero 3 icon.png",
    "whistle": "pito wistle icon.png", "store": "tienda icon.png", "seller": "seller tienda icon.png",
    "calendar": "calendar icon 9.png", "season": "futbol season temporada calendar icon.png",
    "chart-down": "chart abajo icon.png", "chart-up": "chart icon.png", "growth": "crecer icon.png", "steps": "exito icon 1.png",
    "packages": "packages paquetes icon.png", "box2": "producto caja icon.png", "options": "options opciones icon.png",
    "shield": "escudo seguro shield icon.png", "check": "check fill icon 1024x832-0gqstc23.png",
    "truck": "shipping camion transporte icon.png", "price": "price precio icon.png", "tag": "precio icon price.png",
    "hand-money": "business icon.png", "refund": "reembolso icon.png", "building": "edificio icon.png",
    "handshake": "handshake icon 1.png", "deal": "lista handshake icon.png", "call": "phone tele icon.png",
    "people": "gente people icon.png", "group": "personas icon.png", "automation": "automation icon.png",
    "choices": "choices decisiones icon.png", "quality": "calidad mano con premio medalla icon.png",
    "sizing": "sizing chart medir icon.png", "exchange": "comprador y vendedor icon.png", "idea": "persona con idea icon.png",
    "free": "free icon-260nw-648695473.png", "goal": "goals icon metas.png", "qualified": "calificado qualified icon.png",
    "list": "lista icon.png", "review": "review icon.png", "doc": "documento icon entregando.png", "talk": "hablar icon.png",
    "bags": "bolsa icon.png", "user": "cliente hombre icon.png", "worker": "worker usuario person persona  trabajador icon.png",
    "system": "sistem system icon.png", "trophy": "atleta icon.png", "leader": "lider icon.png", "refer": "referido icon.png",
    "jersey": "futbol franela camisa ropa clothes.png",
}
def load(p):
    im = Image.open(p)
    im = im.convert("RGBA")
    a = im.getchannel("A")
    if a.getextrema()[0] == 255:   # no transparency: dark ink on light paper -> alpha from darkness
        a = ImageOps.invert(im.convert("L"))
        a = a.point(lambda v: 0 if v < 40 else min(255, int((v - 40) * 255 / 160)))
    return im, a
def white(name, size=256):   # Premiere "Invertir": RGB inverted, alpha kept (black ink -> white, white fills -> black)
    im, a = load(SRC / MAP[name])
    rgb = ImageOps.invert(im.convert("RGB"))
    sq = rgb.convert("RGBA"); sq.putalpha(a)
    sq = sq.crop(a.getbbox())
    w, h = sq.size; s = size / max(w, h)
    sq = sq.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(sq, ((size - sq.size[0]) // 2, (size - sq.size[1]) // 2))
    return out
if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    names = [n for n in MAP if n != "jersey"]
    tiles = []
    for n in names:
        try:
            im = white(n); im.save(OUT / f"{n}.png"); tiles.append((n, im))
        except Exception as e:
            print("FAIL", n, e)
    if "--sheet" in sys.argv:
        from PIL import ImageDraw
        cols = 9; rows = (len(tiles) + cols - 1) // cols
        sh = Image.new("RGB", (cols * 170, rows * 190), (40, 40, 40)); d = ImageDraw.Draw(sh)
        for i, (n, im) in enumerate(tiles):
            x, y = i % cols * 170, i // cols * 190
            sh.paste(im.resize((140, 140)), (x + 15, y + 10), im.resize((140, 140))); d.text((x + 5, y + 160), n, fill=(255, 255, 0))
        sh.save(sys.argv[sys.argv.index("--sheet") + 1])
    print(len(tiles), "icons ->", OUT)
