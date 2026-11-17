"""Hojas de garrafon-bernal-p2 PARTE 2 (Los Garrafones de Bernal, VISTA STORIES): las 3 hojas de personaje + LOC_PATIOBERNAL y LOC_COCINABERNAL de la Parte 1 (las vigentes),
copiadas de pieces/garrafon-bernal/chars (si falta alguna copia, se toma de ahí; nunca se regeneran: otra cara rompería la continuidad), y CUATRO hojas nuevas:
LORENA_ALDACO (la esposa, que en la Parte 1 solo se nombraba), RUPERTO_MENDIOLA (el cargador), LOC_PORTONBERNAL (portón de atrás) y LOC_BODEGABERNAL (la bodega abandonada).
Lo normal: python -I make_sheets.py --reupload  -> sube las 5 copias al proyecto Flow activo y genera + sube solo las 4 nuevas.
Las copias tienen el mismo md5 que las de garrafon-bernal: las carpetas garrafon-bernal* no cuentan como duplicado en --reupload.
Control de imagen vieja: Flow a veces devuelve una imagen de otra pieza (bug: varias hojas seguidas con el mismo md5). Cada hoja nueva se compara por md5
con todas las pieces/*/chars/**/*.jpg; si coincide imprime "DUPLICADO <nombre>", la deja en chars/dup/ y NO la sube.
Uso: python -I make_sheets.py [--reupload]   -> imprime "FIN HOJAS" al terminar."""
import hashlib, shutil, subprocess, sys, os
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
D = Path(__file__).resolve().parent; OUT = D / "chars"; OUT.mkdir(exist_ok=True); PIECES = D.parent
SHEET = ("Character turnaround reference sheet of one person, four views side by side on plain white background: front view, three-quarter view, "
         "side profile, back view, full body, same scale, all views fully consistent, plus one large close-up portrait of the face on the left. {d} "
         "Photorealistic, cinematic film still quality, natural skin texture, even soft lighting, neutral expression, no text or labels")
LOC = "Empty location reference photo, no people. {d} Photorealistic cinematic film still, 85mm, no text"
# Parte 2: Leoncio sigue la camioneta blanca de Lorena hasta una bodega abandonada a la orilla de Bernal: está llena del mandado y de garrafones llenos que ella vende en el tianguis.
# Castigo: las llaves de la camioneta y del candado; Lorena se va antes de que se meta el sol. Misma ropa que en la Parte 1.
# Solo Lorena moño bajo negro, labios rojos, blusa de seda turquesa y esclavas doradas; solo Ruperto pelo rizado, barba negra corta y camisa de mezclilla abierta sobre playera mostaza. Caras comunes, no famosas.
P1 = PIECES / "garrafon-bernal" / "chars"
REUSED = ["LEONCIO_AVALOS", "JOVITA_RESENDIZ", "PETRONILA_OCADIZ", "LOC_PATIOBERNAL", "LOC_COCINABERNAL"]  # hojas de la Parte 1: se copian, nunca se generan
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "LEONCIO_AVALOS": FACE + "Mexican man from Querétaro, owner of a small family vineyard, 57 years old, light-brown skin, tall and slim, silver hair combed back, a short neatly trimmed white beard, "
                   "no hat, no glasses, a beige linen long-sleeve shirt under a dark brown suede vest, dark jeans, a brown leather belt, brown leather boots, a silver wristwatch on his left wrist, his hands empty.",
 "JOVITA_RESENDIZ": FACE + "adult Mexican woman from Querétaro, a grape picker, 26 years old, brown skin, slim, medium height, black hair in a low ponytail under a red bandana tied on her head, no makeup, no glasses, "
                    "an olive-green long-sleeve cotton work shirt, faded jeans, brown work boots, a wide straw hat hanging on her back by its cord, her hands empty.",
 "PETRONILA_OCADIZ": FACE + "Mexican woman, the cook of a farmhouse, 64 years old, brown skin, short and sturdy, grey hair in a tight bun, thin gold reading glasses hanging on a beaded cord around her neck, "
                     "a navy-blue cardigan over a white blouse, a red-and-white checkered apron, a dark grey skirt, black flat shoes, her hands empty.",
 "LORENA_ALDACO": FACE + "Mexican woman from Querétaro, wife of a vineyard owner, 49 years old, light skin, slim, medium height, sleek black hair pulled back in a low bun, red lipstick, small gold stud earrings, "
                  "no glasses, a turquoise silk long-sleeve blouse, white wide-leg trousers, thin gold bangles on her right wrist, beige heeled sandals, her hands empty.",
 "RUPERTO_MENDIOLA": FACE + "Mexican man from Querétaro, a vineyard loader, 34 years old, brown skin, stocky, medium height, short curly black hair, a short black beard, no hat, no glasses, "
                     "a plain mustard-yellow t-shirt under an open faded denim shirt with rolled sleeves, dark work trousers, brown work boots, his hands empty.",
}
LOCS = {
 "LOC_PATIOBERNAL": "Dusty work yard of a small family vineyard near Bernal, Querétaro, in warm late-afternoon golden light: packed earth ground, stacks of wooden grape crates, "
                    "a big round galvanized tub of grey rinse water on the left, a low stone bench on the right with four blue plastic water jugs tied together with a heavy chain and a padlock, "
                    "green rows of grapevines behind, the huge rock monolith of the Peña de Bernal on the horizon, no readable text, no signs, no logos, no people.",
 "LOC_COCINABERNAL": "Big rustic kitchen of a vineyard farmhouse near Bernal, Querétaro, in warm afternoon window light: walls with blue-and-white tiles, a gas stove with clay pots on the left, "
                     "tall wooden pantry shelves that are half empty, a wooden table in the middle, the kitchen door on the right, no readable text, no signs, no logos, no people.",
 "LOC_PORTONBERNAL": "Back gate of a vineyard farmhouse near Bernal, Querétaro, in warm late-afternoon golden light: an old open wooden double gate in a white stone wall, packed earth ground, "
                     "stacked cardboard grocery boxes on the left, an empty space on the right for a pickup truck, grapevines beyond the gate, the Peña de Bernal far away, no readable text, no signs, no logos, no people.",
 "LOC_BODEGABERNAL": "Old abandoned adobe warehouse at the dusty edge of Bernal, Querétaro, at sunset: cracked ochre adobe walls, a weathered blue wooden double door with an iron latch on the left, "
                     "a dirt lot with dry grass, the huge rock of the Peña de Bernal behind in orange light, no readable text, no signs, no logos, no people.",
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

for name in REUSED:  # copias de la Parte 1 (mismas caras y ropa)
    if not (OUT / f"{name}.jpg").exists():
        if (P1 / f"{name}.jpg").exists(): shutil.copy2(P1 / f"{name}.jpg", OUT / f"{name}.jpg"); print("COPIADO de la Parte 1", name, flush=True)
        else: print("FALTA", name, "en", P1, "-> correr antes make_sheets.py de la Parte 1", flush=True)
if "--reupload" in sys.argv:
    for name in list(CHARS) + list(LOCS):
        f = OUT / f"{name}.jpg"
        if not f.exists(): continue
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("garrafon-bernal*")))  # la copia de la Parte 1 es la misma imagen a propósito
        if d: print("DUPLICADO", name, "=", ", ".join(str(p) for p in d), "-> no se sube", flush=True); continue
        run(["upload", str(f), "--name", name]); print("SUBIDO", name, flush=True)
for name, d in list(CHARS.items()) + list(LOCS.items()):
    dst = OUT / f"{name}.jpg"
    if dst.exists() or name in REUSED: continue
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
