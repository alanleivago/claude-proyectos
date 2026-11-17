"""Hojas de jipi-becal-p2 PARTE 2 (La Cueva de Bécal · Parte 2, MEXI STORIES): las 3 hojas de personaje + LOC_CUEVABECAL y LOC_PATIOBECAL de la Parte 1 (las vigentes),
copiadas de pieces/jipi-becal/chars (misma ropa), y UNA hoja nueva: LISANDRO_PECH (Lisandro, el nieto, que en la Parte 1 solo se nombraba).
Lo normal: python -I make_sheets.py --reupload  -> sube las 5 copias al proyecto Flow activo y genera + sube solo LISANDRO_PECH (el único jpg que falta en chars/).
Las copias tienen el mismo md5 que las de jipi-becal: las carpetas jipi-becal* no cuentan como duplicado en --reupload.
Control de imagen vieja: Flow a veces devuelve una imagen de otra pieza (bug: varias hojas seguidas con el mismo md5). Cada hoja nueva se compara por md5
con todas las pieces/*/chars/**/*.jpg; si coincide imprime "DUPLICADO <nombre>", la deja en chars/dup/ y NO la sube.
Uso: python -I make_sheets.py [--reupload]   -> imprime "FIN HOJAS" al terminar."""
import hashlib, subprocess, sys, os
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
D = Path(__file__).resolve().parent; OUT = D / "chars"; OUT.mkdir(exist_ok=True); PIECES = D.parent
SHEET = ("Character turnaround reference sheet of one person, four views side by side on plain white background: front view, three-quarter view, "
         "side profile, back view, full body, same scale, all views fully consistent, plus one large close-up portrait of the face on the left. {d} "
         "Photorealistic, cinematic film still quality, natural skin texture, even soft lighting, neutral expression, no text or labels")
LOC = "Empty location reference photo, no people. {d} Photorealistic cinematic film still, 85mm, no text"
# Parte 2: Zoraida teje en la cueva; Lisandro (30) baja un día antes de la plataforma, descubre que su madre le escribía desde el celular de Nicté, le quita el celular a ella
# y la abuela la manda al cuartito de la palma. Misma ropa que en la Parte 1. Solo Lisandro hombre joven, playera gris jaspeada y jeans (ropa de civil, sin overol ni uniforme).
# Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "APOLONIA_CHABLE": FACE + "Maya Mexican woman from Campeche, a master palm-hat weaver and the head of the family, 81 years old, deep brown wrinkled skin, small and thin but upright, white hair in a low bun, small gold earrings, "
                    "a white embroidered huipil dress with bands of red and green flowers at the square neckline and hem, a black rebozo over her shoulders, black flat shoes, a dark wooden cane in her right hand.",
 "ZORAIDA_CANUL": FACE + "Mexican woman from Campeche, 56 years old, light-brown skin, plump, short teased hair dyed burgundy red, big tortoiseshell sunglasses pushed up on her head, red lipstick, "
                  "a leopard-print blouse, white capri pants, gold sandals, many gold bangles on both wrists, a black lace folding fan in her right hand, a small gold handbag hanging from her left shoulder.",
 "NICTE_UCAN": FACE + "adult Maya Mexican woman from Campeche, a palm-hat weaver, 27 years old, brown skin, slim, medium height, black hair pulled back in a low bun with a few loose strands, no makeup, no glasses, "
               "a faded sky-blue cotton dress, a beige apron with two front pockets, her fingers wrapped in strips of white cloth tape, plain brown sandals, her hands empty.",
 "LISANDRO_PECH": FACE + "Maya Mexican man from Campeche, 30 years old, sun-tanned brown skin, tall and strong, short black hair, clean-shaven, no glasses, no hat, "
                 "a plain heather-grey t-shirt, dark blue jeans, brown work boots, his hands empty.",
}
LOCS = {
 "LOC_CUEVABECAL": "Small natural limestone cave under a backyard in Bécal, Campeche, where palm hats are woven: rough pale limestone walls glistening with humidity, a single shaft of daylight falling from a round opening in the rock ceiling, "
                   "a low wooden stool, bundles of pale cream palm fibers hanging from a cord on the wall, an unfinished pale cream palm hat on a wooden hat mold, dim and humid, no ladder, no readable text, no signs, no logos, no people.",
 "LOC_PATIOBECAL": "Backyard of a pale pink house in Bécal, Campeche, in bright late-morning light: a white limestone wall, a big leafy tree giving shade, a round cave opening in the ground with a low stone rim on the left, "
                   "a white plastic chair beside it, a plain wooden ladder lying on the ground, a corridor of arches of the pink house on the right, bundles of pale palm fibers drying on a rope, no readable text, no signs, no logos, no people.",
}
md5 = lambda p: hashlib.md5(p.read_bytes()).hexdigest()

def dupes(f, skip=()):
    """Rutas de otras hojas (pieces/*/chars/**/*.jpg) con el mismo md5 que f; skip = carpetas de pieza que no cuentan."""
    h = md5(f)
    return [p for p in PIECES.glob("*/chars/**/*.jpg") if p.resolve() != f.resolve() and p.relative_to(PIECES).parts[0] not in skip and md5(p) == h]

def run(args):
    try:
        r = subprocess.run(["node", "src/cli.js", *args], cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        print("TIMEOUT", args[:2], flush=True); return ""
    print(r.stdout.strip()[-300:], r.stderr.strip()[-300:], flush=True); return r.stdout

if "--reupload" in sys.argv:
    for name in list(CHARS) + list(LOCS):
        f = OUT / f"{name}.jpg"
        if not f.exists(): continue
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("jipi-becal*")))  # las copias de la Parte 1 son la misma imagen a propósito
        if d: print("DUPLICADO", name, "=", ", ".join(str(p) for p in d), "-> no se sube", flush=True); continue
        run(["upload", str(f), "--name", name]); print("SUBIDO", name, flush=True)
for name, d in list(CHARS.items()) + list(LOCS.items()):
    dst = OUT / f"{name}.jpg"
    if dst.exists(): continue
    prompt = (SHEET if name in CHARS else LOC).format(d=d)
    out = run([prompt, "--aspect", "16:9", "--model", "pro", "--out", str(OUT)])
    f = [l for l in out.splitlines() if l.endswith((".jpg", ".png"))]
    if not f: print("FALLO", name, flush=True); continue
    os.replace(f[0], dst)
    dup = dupes(dst)
    if dup:  # Flow devolvió una imagen vieja: apartarla y no subirla
        (OUT / "dup").mkdir(exist_ok=True); os.replace(dst, OUT / "dup" / dst.name)
        print("DUPLICADO", name, "=", ", ".join(str(p) for p in dup), flush=True); continue
    run(["upload", str(dst), "--name", name]); print("OK", name, flush=True)
print("FIN HOJAS", flush=True)
