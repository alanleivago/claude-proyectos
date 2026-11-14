"""Hojas de masa-honrada PARTE 1 (La Masa Honrada, video 26, SINMARCA) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
Control de imagen vieja: Flow a veces devuelve una imagen de otra pieza (bug: varias hojas seguidas con el mismo md5). Cada hoja nueva se compara por md5
con todas las pieces/*/chars/**/*.jpg; si coincide imprime "DUPLICADO <nombre>", la deja en chars/dup/ y NO la sube.
Con --reupload vuelve a subir al proyecto Flow activo (state.json -> projectId) las hojas que ya están en chars/.
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
# Remake de la ref 7682590215994690849 (@solreflection): dos puestos de tortillas en la misma banqueta. Atuendos de la ref con otros colores.
# NADIE con sombrero, gorra, red de pelo ni lentes; sin uniformes, sin gafetes ni letras en la ropa.
# Todo pasa el mismo día: cada personaje lleva una sola ropa en toda la pieza.
CHARS = {
 "LUPE_OLVERA": "Mexican woman, brown skin, an honest street tortilla maker, 60 years old, warm dignified face with soft lines, long grey hair in one braid over her shoulder, "
                "no hat, no glasses, pale yellow short-sleeved blouse under a plain maroon apron, dark grey skirt below the knee, small silver stud earrings, flat black shoes.",
 "YESENIA_BARRAGAN": "Mexican woman, light brown skin, a proud tortilla stall owner, 42 years old, sharp proud face, dark burgundy-dyed hair pulled up in a high bun, "
                     "no hat, no glasses, bright turquoise short-sleeved blouse under a plain charcoal grey apron, blue jeans, small gold hoop earrings, white sneakers.",
 "RIGO_MOLINERO": "Mexican man, brown skin, a stall helper, 28 years old, honest worried face, short black hair, thin black moustache, no beard, no hat, no glasses, "
                  "plain olive green t-shirt under a plain navy blue apron, dark grey jeans, black sneakers.",
 "CHAYO_ZAMUDIO": "Mexican woman, brown skin, a talkative neighbor, 55 years old, round expressive face, shoulder-length wavy black hair, no hat, no glasses, "
                  "coral orange short-sleeved blouse, dark blue trousers, brown sandals.",
 "ABUNDIO_ZAMUDIO": "Mexican man, brown skin, Chayo's husband, 58 years old, kind tired face, short grey hair, grey stubble, no hat, no glasses, "
                    "blue and white checked short-sleeved shirt, khaki trousers, brown shoes.",
 "TONA_VECINA": "Mexican woman, light brown skin, a frank neighbor, 62 years old, cheerful frank face, short curly salt-and-pepper hair, no hat, no glasses, "
                "mustard yellow knitted cardigan over a plain white blouse, dark brown skirt, black flat shoes.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, sin letreros, precios, marcas ni adornos.
LOCS = {
 "LOC_PUESTOYESE": "Sidewalk tortilla stall in a Mexican neighborhood in the morning, a plain dark grey canvas awning, one stainless steel table, "
                   "one big yellow plastic tub of pale dough on the table, a plain pale orange house wall behind, soft natural daylight, no cars, no plants, "
                   "no decorations, no readable text, no signs, no prices, no logos, no people.",
 "LOC_COMALLUPE": "Sidewalk tortilla stand in a Mexican neighborhood in the morning, one old wooden cart with a round black comal griddle, "
                  "a stack of warm tortillas wrapped in a plain white cloth on the cart, a plain pale blue house wall behind, soft natural daylight, light steam, "
                  "no cars, no plants, no decorations, no readable text, no signs, no prices, no logos, no people.",
 "LOC_PATIOZAMUDIO": "Small home patio of a Mexican house at night, one plain wooden table with simple white plates, one small basket of tortillas, "
                     "one clay bowl of red salsa, one clear glass water jug, two wooden chairs, a plain whitewashed wall, one bare warm light bulb above, "
                     "no bottles with labels, no decorations, no readable text, no people.",
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
        d = dupes(f)
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
