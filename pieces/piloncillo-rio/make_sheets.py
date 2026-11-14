"""Hojas de piloncillo-rio PARTE 1 (El Paso del Río, SIN MARCA) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Remake transformado de "Le dio 5 minutos… y no le creyó" (Atrium): Rigoberto encadena el paso de la balsa en un río de la Huasteca potosina y humilla a un viejito
# de huaraches que resulta ser don Fortino, el dueño de la molienda de piloncillo; quien le rentó el paso es Leobardo, el hijo de Fortino.
# Solo Fortino lleva sombrero (palma gastada) y paliacate rojo; solo Rigoberto camisa negra satinada con palmeras blancas; solo Crispín gorra y camiseta naranja deslavada;
# solo Celerina rebozo gris; solo Leobardo camisa polo blanca y lentes de armazón delgado. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "FORTINO_TAVERA": FACE + "Mexican man from the Huasteca region of San Luis Potosí, dark-brown sun-weathered skin, the old owner of a sugar-cane mill, 71 years old, short and stocky, "
                   "round face with deep wrinkles, white stubble, a short white mustache, calm small eyes, a worn palm-leaf hat with sweat stains, a plain white cotton shirt, "
                   "a red bandana knotted at the neck, loose grey trousers, old leather huarache sandals, his hands empty.",
 "RIGOBERTO_URBINA": FACE + "Mexican man, light-brown skin, a young local hustler, 38 years old, skinny, narrow face, thin line beard along the jaw, black hair gelled up, "
                     "no hat, no glasses, a shiny black satin short-sleeve shirt with small white palm-tree prints, a thin silver chain at the neck and wrist, "
                     "white jeans, white sneakers, his hands empty.",
 "CRISPIN_MIRELES": FACE + "Mexican man, dark-brown skin, an old river raft operator, 66 years old, thin and wiry, long face, grey stubble, missing a lower tooth, "
                    "a faded orange t-shirt, an old beige cap with no logo, rolled-up dark trousers, rubber sandals, rough hands.",
 "CELERINA_PANTOJA": FACE + "Mexican woman, brown skin, the manager of a sugar-cane mill, 54 years old, sturdy, square jaw, short black hair with a grey streak, "
                     "small silver earrings, no hat, no glasses, a grey cotton shawl over a dark-red long-sleeve blouse, black trousers, brown leather ankle boots.",
 "LEOBARDO_TAVERA": FACE + "Mexican man, brown skin, the son of a mill owner, 44 years old, medium build, clean-shaven oval face, short neat black hair with a side part, "
                    "thin metal-frame glasses, a white polo shirt with no logo, beige chinos, brown loafers, a black phone held low in his right hand.",
}
LOCS = {
 "LOC_PASORIO": "River crossing in the Huasteca region of San Luis Potosí at midday: a wide turquoise river between green hills and tropical trees, a dirt ramp going down "
                "to the water, a flat wooden river raft tied to a thick steel cable stretched to the far bank, an old wooden post holding the cable, a heavy iron chain across the ramp, "
                "a dirt road behind with an old red pickup truck loaded with cones of piloncillo wrapped in dry cane leaves, no readable text, no signs, no logos, no people.",
 "LOC_TRAPICHE": "Small open-air sugar-cane mill of the Huasteca at midday: a tin roof on wooden posts, a big round copper pan of thick boiling cane juice over a wood fire with steam, "
                 "piles of cut sugar cane, wooden molds with brown piloncillo cones cooling, green hills beyond, no readable text, no logos, no people.",
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
