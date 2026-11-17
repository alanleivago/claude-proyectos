"""Hojas de ate-calvillo-p2 PARTE 2 (El Ate de Calvillo · Parte 2, MEXI STORIES): las 4 hojas de personaje + la locación de la Parte 1 (CLEOFAS_ELIZALDE, GERTRUDIS_ELIZALDE, MARCELA_COLLADO, ELEAZAR_ELIZALDE y LOC_ATECALVILLO),
copiadas de pieces/ate-calvillo/chars (misma ropa). Ninguna hoja nueva: no hay personajes nuevos en la Parte 2.
Lo normal: python -I make_sheets.py --reupload  -> sube las 5 copias al proyecto Flow activo (no genera nada: los 5 jpg ya están en chars/).
Las copias tienen el mismo md5 que las de ate-calvillo: las carpetas ate-calvillo* no cuentan como duplicado en --reupload.
Control de imagen vieja: si faltara una hoja y se generara, se compara por md5 con todas las pieces/*/chars/**/*.jpg; si coincide imprime "DUPLICADO <nombre>", la deja en chars/dup/ y NO la sube.
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
# Variante transformada del Final de la saga de don Evaristo (7706344565933985054) de Atrium: en el patio de adobe de Gertrudis (41) en Calvillo (Aguascalientes),
# Marcela (44), la nuera, llega a llevarse a don Cleofas (74) "antes de que cuaje el ate"; él anuncia que las huertas del cañón son para Gertrudis, recuerda que su hijo
# Eleazar (48) lo subió a un camión sin bajarse del carro, y les pide las llaves de la camioneta, que está a su nombre. El lunes Eleazar conocerá a su patrón en la empacadora.
# Solo Cleofas sombrero de palma, bigote blanco y paliacate rojo; solo Marcela pelo castaño rojizo lacio con blusa verde esmeralda de satín y lentes de sol en la cabeza;
# solo Eleazar cabeza rapada, candado negro y polo vino; solo Gertrudis trenza negra larga, blusa azul cielo y mandil rosa. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "CLEOFAS_ELIZALDE": FACE + 'Mexican man from Calvillo, Aguascalientes, a guava grower and patriarch, 74 years old, lean and weathered, deep-tanned wrinkled skin, a thick white mustache, short white hair, a light straw palm hat, a long-sleeve brown-and-cream plaid shirt, a red bandana knotted at his neck, faded blue jeans, brown leather boots, his hands empty.',
 "GERTRUDIS_ELIZALDE": FACE + 'Mexican woman from Calvillo, Aguascalientes, who makes guava paste at home, 41 years old, brown skin, thin face, a single long black braid, no earrings, a plain light-blue cotton blouse with rolled sleeves, a plain pink apron, a long navy-blue skirt, black flat shoes, her hands empty.',
 "MARCELA_COLLADO": FACE + 'Mexican woman, 44 years old, fair skin, long straight auburn-red hair, big dark sunglasses pushed up on her head, red lipstick, an emerald-green satin blouse, white jeans, nude high heels, a small white handbag on her arm.',
 "ELEAZAR_ELIZALDE": FACE + 'Mexican man from Calvillo, Aguascalientes, manager of a guava packing plant, 48 years old, stocky, brown skin, a shaved head, a short black goatee, a wine-red polo shirt, khaki trousers, brown loafers, a big gold wristwatch, holding a black pickup truck key.',
}
LOCS = {
 "LOC_ATECALVILLO": 'Small backyard of a humble ochre adobe house in Calvillo, Aguascalientes, in the late afternoon: on the left a wood-fired adobe stove with a big copper cauldron of bubbling pink guava paste and a long wooden paddle, woven baskets full of yellow guavas, a wooden bench and a small wooden table; on the right a green iron gate open to a dirt street with a dark grey double-cab pickup truck parked outside; guava trees behind, warm golden light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("ate-calvillo*")))  # las copias de la Parte 1 son la misma imagen a propósito
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
