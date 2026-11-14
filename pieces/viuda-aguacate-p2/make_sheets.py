"""Hojas de viuda-aguacate-p2 PARTE 2 (La Viuda del Aguacate, MEXI): las 6 hojas de la Parte 1 que se usan (copiadas de pieces/viuda-aguacate/chars) + 1 NUEVA: ARNULFO_SOLORZANO.
Lo normal: python -I make_sheets.py --reupload  -> sube las copias al proyecto Flow activo y genera/sube solo ARNULFO (la única que falta en chars/).
Las copias tienen el mismo md5 que las de viuda-aguacate: esa carpeta no cuenta como duplicado.
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
# Parte 2: mismos personajes y ropa que la Parte 1 (descripciones = las de pieces/viuda-aguacate/make_sheets.py, solo por si faltara un jpg) + Arnulfo, el hijo de Nicandro.
# Solo Ponciano lleva lentes; solo Fito gorra; solo Nicandro sombrero y bastón; solo Wences cola de caballo y piocha; solo Engracia rebozo; solo Arnulfo saco azul marino y reloj de oro. Sin uniformes, gafetes ni letras en la ropa. Una sola ropa por personaje.
CHARS = {
 "ENGRACIA_MURGUIA": "Mexican woman, brown skin, widow and owner of an avocado orchard, 64 years old, long thin face with deep lines, short wavy grey hair, small silver earrings, "
                     "no hat, no glasses, plain black long-sleeved blouse with a dark grey rebozo over her shoulders, long dark grey skirt, black flat shoes.",
 "FITO_CUEVAS": "Mexican man, brown skin, avocado picker, 25 years old, clearly an adult, round face, curly short black hair, clean-shaven, a plain beige cap with no logo, no glasses, "
                "faded olive-green work shirt with rolled sleeves, brown work trousers, brown work boots.",
 "PONCIANO_UGALDE": "Mexican man, light skin, a notary, 52 years old, soft round face, bald head, thin grey mustache, round gold-rimmed glasses, no hat, "
                    "beige linen suit with a white shirt and a brown tie, brown leather shoes.",
 "WENCES_PICHARDO": "Mexican man, tan skin, the notary's right-hand man, 38 years old, broad heavy face, long black hair tied in a low ponytail, thick black goatee, no hat, no glasses, "
                    "burgundy western shirt under a black vest, dark jeans, black boots.",
 "NICANDRO_SOLORZANO": "Mexican man, tan weathered skin, a powerful old rancher, 78 years old, long serene face with deep wrinkles, long grey sideburns, clean-shaven, "
                       "a tan palm-straw cowboy hat with a black band, no glasses, dark brown suede jacket over a white shirt, a silver bolo tie, beige trousers, brown boots, "
                       "a carved wooden cane with a silver handle in his right hand.",
 "ARNULFO_SOLORZANO": "Mexican man, light brown skin, son of a powerful rancher and buyer of land, 40 years old, ordinary non-famous face, oval face with a square jaw, short black hair neatly combed to the side, clean-shaven, a small mole on his left cheek, no hat, no glasses, no beard, "
                      "navy blue blazer over a light blue open-collar shirt, one gold wristwatch on his left wrist, dark jeans, brown leather loafers.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, sin letreros, marcas ni adornos.
LOCS = {
 "LOC_HUERTAGUACATE": "Entrance of an avocado orchard in the green hills of Michoacán in the golden afternoon, a plain wooden gate with a chain, a dirt path, rows of dark green avocado trees, "
                      "a small plain adobe house with a tiled roof at one side, warm golden light, no cars, no decorations, no readable text, no signs, no logos, no people.",
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
        d = dupes(f, skip=("viuda-aguacate", "viuda-aguacate-p2"))  # la copia de la Parte 1 es la misma imagen a propósito
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
