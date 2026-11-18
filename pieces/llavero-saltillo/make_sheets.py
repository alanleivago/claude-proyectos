"""Hojas de llavero-saltillo PARTE 1 (El Llavero de Saltillo, MAJESTIC) con el Flow MCP (CLI): personajes y locación nuevos.
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
# llavero-saltillo (MAJESTIC): lectura del testamento de don Gregorio Montemayor en su despacho de Saltillo, y luego una bodega vieja en la calle Allende al anochecer. Caras comunes, no famosas; los cinco se distinguen a simple vista. Ropa de diario, sin uniformes.
FACE = 'ordinary non-famous face, not resembling any actor or celebrity, '
CHARS = {
 'ITZAYANA_CORDERO': FACE + 'Mexican woman, the humble widowed daughter-in-law of a rich family, 32 years old, warm brown skin, long straight black hair in a low ponytail, kind tired dark eyes, no makeup, a simple navy-blue cardigan over a white blouse, black trousers, a thin gold chain, her hands empty.',
 'ZULEMA_MONTEMAYOR': FACE + 'Mexican woman, the rich spoiled daughter of a powerful businessman, 41 years old, fair skin, a blonde highlighted bob haircut, red lipstick, a mocking expression, a cream designer blazer over a black top, large pearl earrings, big sunglasses pushed up on her head, her hands empty.',
 'REINALDO_MONTEMAYOR': FACE + 'Mexican man, the arrogant eldest son of a powerful businessman, 46 years old, light skin, slicked-back black hair with grey temples, a trimmed black beard, a charcoal suit with an open-collar white shirt, a gold watch, his hands empty.',
 'OLEGARIO_ZERTUCHE': FACE + 'Mexican man, an old family notary, 66 years old, light-brown skin, bald on top with white hair on the sides, round wire glasses, a white mustache, a brown tweed jacket, a white shirt and a dark-red bow tie, his hands empty.',
 'MUJER_BODEGA': FACE + 'Mexican woman, an elegant mysterious lady, 63 years old, light-brown skin, silver hair in a neat chignon, dark serene eyes, an emerald-green shawl over a long black dress, small emerald earrings, her hands empty.',
}
LOCS = {
 'LOC_DESPACHOSALTILLO': "Wood-paneled private office of a late powerful businessman in Saltillo, Coahuila, in the afternoon: a large dark wooden desk with a green banker's lamp and a leather folder, two leather armchairs, bookshelves, a big window with the dry Saltillo mountains in the distance, a framed photo of a fleet of trucks without any readable text, no signs, no logos, no people.",
 'LOC_BODEGAALLENDE': 'Inside an old brick warehouse in Saltillo at dusk: dusty wooden floor, old furniture covered with white sheets, stacked wooden crates, a single warm floor lamp lit in the middle next to an old velvet armchair, high small windows with the last orange light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("llavero-saltillo*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
