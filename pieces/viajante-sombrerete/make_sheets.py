"""Hojas de viajante-sombrerete PARTE 1 (El Viajante de Sombrerete, MAJESTIC STORIES) con el Flow MCP (CLI): personajes y locación nuevos.
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
# viajante-sombrerete (MAJESTIC): tienda de abarrotes antigua en Sombrerete, Zacatecas, y el despacho de la hacienda. Caras comunes, no famosas; los tres se distinguen a simple vista.
FACE = 'ordinary non-famous face, not resembling any actor or celebrity, '
CHARS = {
 'AURELIO_MONTES': FACE + 'Mexican man, a traveling cloth salesman who is secretly the patrón of the region, 62 years old, light-brown skin, short salt-and-pepper hair, a neat grey mustache, calm sharp eyes, a worn beige travel jacket over a light-blue shirt, brown trousers, dusty brown shoes, a small grey fedora, his hands empty.',
 'REMIGIO_PENA': FACE + 'Mexican man, owner of the general store, 55 years old, brown skin, balding with black hair on the sides, a round face, a thin black mustache, a white short-sleeve shirt with a brown cardigan vest, grey trousers, black shoes, reading glasses hanging on a cord around his neck, his hands empty.',
 'BALTASAR_RUELAS': FACE + "Mexican man, the store owner's partner, 48 years old, light skin, slicked black hair, a sharp hard face, a short black beard, a dark-red western shirt, a black leather jacket, jeans, black boots, his hands empty.",
}
LOCS = {
 'LOC_TIENDASOMBRERETE': 'Interior of an old general store in Sombrerete, Zacatecas, in the afternoon: a long dark wooden counter, shelves full of jars, sacks of beans and corn, an old cast-iron wood stove in the corner, hanging lanterns, a front door open to a sunny cobblestone street, dusty warm light, no readable text, no signs, no logos, no people.',
 'LOC_DESPACHOSOMBRERETE': 'Office of an old wealthy hacienda in Zacatecas, in the afternoon: a huge carved dark-wood desk, a tall carved wooden chair like a throne behind it, stone walls, a big window with sunlight, bookshelves, an old map of the region framed on the wall, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("viajante-sombrerete*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
