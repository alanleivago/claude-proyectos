"""Hojas de guitarra-paracho PARTE 1 (La Guitarra de Paracho, MAJESTIC STORIES) con el Flow MCP (CLI): personajes y locación nuevos.
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
# guitarra-paracho (MAJESTIC): fábrica de guitarras y casa humilde en Paracho, Michoacán. Caras comunes, no famosas; los cuatro se distinguen a simple vista.
FACE = 'ordinary non-famous face, not resembling any actor or celebrity, '
CHARS = {
 'EFRAIN_CHAVEZ': FACE + 'Mexican man from Michoacán, young luthier, 24 years old, light-brown skin, curly black hair, light stubble, a grey t-shirt under a denim work apron with sawdust, jeans, work boots, his hands empty.',
 'RICARDO_CUEVAS': FACE + 'Mexican man, 30 years old, light skin, slicked-back black hair, a thin goatee, dark sunglasses on his head, a white linen shirt open at the chest, a gold chain, beige trousers, white loafers, his hands empty.',
 'GILBERTO_CUEVAS': FACE + 'Mexican boss from Michoacán, 62 years old, heavy-set, light-brown skin, grey hair, a thick grey mustache, a black felt cowboy hat, a burgundy western shirt, a big silver belt buckle, dark jeans, black boots, his hands empty.',
 'JOSEFINA_CHAVEZ': FACE + 'Mexican mother from Michoacán, 55 years old, brown skin, black hair with grey strands in a low bun, a dark-green shawl over a white blouse, a checked apron, a long dark skirt, her hands empty.',
}
LOCS = {
 'LOC_FABRICAGUITARRAS': 'Guitar factory workshop in Paracho, Michoacán, in the afternoon: rows of unfinished wooden guitars hanging from the ceiling, long wooden workbenches with clamps and wood shavings, a small office corner with a wooden table, a big window to a cobblestone street, warm light, no readable text, no signs, no logos, no people.',
 'LOC_CASAPARACHO': 'Humble wooden house in Paracho, Michoacán, at dusk: a small kitchen-patio with a wooden table, a hanging lamp, clay pots, a wooden door, pine-covered hills behind, warm light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("guitarra-paracho*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
