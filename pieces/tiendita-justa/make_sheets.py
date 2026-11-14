"""Hojas de tiendita-justa PARTE 1 (La Tiendita del Precio Justo, video 25, MEXI) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Remake de la ref 7698839837180169504 ("Precio justo"): atuendos de la ref con OTROS colores. NADIE con sombrero, gorra ni lentes; sin uniformes, sin gafetes ni letras.
# Cada personaje lleva una sola ropa en toda la pieza (el paliacate de Aurelio, LISO: en la ref cambiaba de estampado).
CHARS = {
 "CHUY_MEDINA": "Mexican man, brown skin, the honest owner of a new humble village grocery shop, 30 years old, honest friendly face, short black hair, clean-shaven, "
                "no hat, no cap, no glasses, faded wine-red crew-neck t-shirt, black jeans, brown work boots.",
 "AURELIO_MEDINA": "Mexican man, brown skin, Chuy's father and partner, 62 years old, kind weathered face, short grey hair, grey moustache, no hat, no glasses, "
                   "light blue long-sleeved work shirt with the sleeves rolled up, one plain mustard-yellow bandana knotted at the neck with no pattern, "
                   "beige work trousers, brown boots.",
 "EVARISTO_LOZANO": "Mexican man, light brown skin, the envious owner of the old village store, 50 years old, round heavy face, thick black moustache, "
                    "slicked-back black hair with grey temples, no hat, no glasses, blue-and-white checked shirt, dark green shop apron, grey trousers, black shoes.",
 "CIPRIANO_ROBLES": "Mexican man, brown skin, a humble village neighbor, 66 years old, thin kind face, short white hair, white moustache, no hat, no glasses, "
                    "light grey button-up shirt, brown trousers, brown sandals, one full plain white plastic shopping bag in each hand.",
 "TONA_ARELLANO": "Mexican woman, brown skin, a warm village neighbor, 58 years old, warm round face, long grey hair in one braid over her right shoulder, "
                  "no hat, no glasses, lilac blouse with small white flowers, dark blue skirt, one woven net bag hanging on her left arm.",
 "FIDEL_CARMONA": "Mexican man, brown skin, a village pickup truck driver who carries goods, 52 years old, friendly face, short black hair with some grey, short stubble, "
                  "no cap, no hat, no glasses, khaki work shirt, dark jeans, brown boots.",
 "MARISOL_TREJO": "Mexican woman, light brown skin, a clerk at a municipal office window, 35 years old, polite neutral face, dark hair in a neat ponytail, "
                  "no glasses, plain burgundy blouse, black trousers, no badge, no lanyard.",
 "LIC_ZAMARRIPA": "Mexican man, light skin, a civilian municipal inspector in plain business clothes, 48 years old, serious formal face, short combed dark hair, clean-shaven, "
                  "no hat, no glasses, dark brown suit, white shirt, wine-red tie, black shoes, no badge, no lanyard, no pins, "
                  "one plain brown clipboard held in his left hand.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, nada religioso, sin adornos, sin letreros, sin precios, sin dinero.
LOCS = {
 "LOC_TIENDAEVARISTO": "Old rural grocery store in a Mexican village, a worn dark wooden counter, one old metal scale, a few half-empty wooden shelves with plain unbranded packages, "
                       "a wide open roll-up door to a dirt road, grey cloudy daylight, no readable text, no signs, no price tags, no brand logos, no money, no people.",
 "LOC_TIENDITACHUY": "Small humble new grocery shop in a Mexican village, simple light pine shelves with plain unbranded bags of rice, plain bottles of oil and plain white milk cartons, "
                     "a plain pine counter, whitewashed walls, warm daylight from the open door, no readable text, no signs, no price tags, no brand logos, "
                     "no cash register, no money, no people.",
 "LOC_BODEGAFLETE": "Loading yard of a wholesale warehouse, plain brown cardboard boxes with no printing stacked on wooden pallets, a concrete floor, "
                    "one old faded red pickup truck parked with plain boxes in its bed, cool daylight, no readable text, no signs, no license plate letters, no logos, no people.",
 "LOC_CABINAFLETE": "Inside the cab of an old pickup truck seen from the back seat, worn beige seats, a simple steering wheel, a rural dirt road and green hills "
                    "through the windshield, soft morning daylight, no readable text, no stickers, no people.",
 "LOC_CERCATIENDITA": "Dirt street of a small Mexican village, a small whitewashed shop with a wide open door and plain wooden shutters, a rusty wire fence on the "
                      "near side of the street, soft morning daylight, no readable text, no signs on the shop, no price tags, no posters, no people.",
 "LOC_VENTANILLAMUNI": "Plain municipal office service window, a clear glass partition with a small opening, a plain wooden desk behind it, plain pale green walls, "
                       "fluorescent light, no readable text, no signs, no posters, no flags, no seals, no logos, no people.",
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
