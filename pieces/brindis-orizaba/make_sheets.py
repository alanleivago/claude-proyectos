"""Hojas de brindis-orizaba PARTE 1 (El Brindis de Orizaba, MAJESTIC STORIES) con el Flow MCP (CLI): personajes y locación nuevos.
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
# brindis-orizaba (MAJESTIC): fiesta de compromiso en el jardín de una hacienda de Orizaba, Veracruz, de noche. Caras comunes, no famosas; los cinco se distinguen a simple vista.
FACE = 'ordinary non-famous face, not resembling any actor or celebrity, '
CHARS = {
 'TOMAS_ARCE': FACE + 'Mexican man, 56 years old, tall and thin, tanned skin, slicked-back salt-and-pepper hair, a thin mustache, a white guayabera with fine embroidery, beige trousers, brown shoes, his hands empty.',
 'VALERIA_RIOS': FACE + 'Mexican woman, 28 years old, light-brown skin, long wavy dark-brown hair half up, natural makeup, small gold earrings, an elegant light-pink satin cocktail dress, nude heels, her hands empty.',
 'DIEGO_SALAS': FACE + 'Mexican man, 30 years old, fair skin, short neat black hair, clean-shaven, a navy-blue suit, a white shirt, a light-blue tie, black shoes, his hands empty.',
 'CLEMENTE_SALAS': FACE + 'Mexican regional boss from Veracruz, 65 years old, heavy-set, light skin, white hair, a white beard, a cream panama hat, a black linen jacket over a black shirt, a gold chain, his hands empty.',
 'MERCEDES_SALAS': FACE + 'Mexican woman, 60 years old, fair skin, voluminous dyed red hair, heavy makeup, big emerald earrings, an emerald-green sequined evening dress, a gold bracelet, her hands empty.',
}
LOCS = {
 'LOC_JARDINORIZABA': 'Garden of an old hacienda in Orizaba, Veracruz, at night during an engagement party: string lights overhead, round tables with white tablecloths and white flowers, a long head table, crystal glasses, a small wooden stage with a microphone stand, tropical plants and a stone fountain, warm light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("brindis-orizaba*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
