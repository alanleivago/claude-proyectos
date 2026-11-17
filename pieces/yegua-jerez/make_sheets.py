"""Hojas de yegua-jerez PARTE 1 (La Yegua de Jerez, VISTA STORIES) con el Flow MCP (CLI): personajes y locación nuevos.
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
# yegua-jerez (VISTA): rancho charro y casa de la abuela en Jerez, Zacatecas. Caras comunes, no famosas; los cuatro se distinguen a simple vista. DUQUESA = la yegua (hoja de referencia de animal).
FACE = 'ordinary non-famous face, not resembling any actor or celebrity, '
CHARS = {
 'ROSALBA_ACUNA': FACE + 'Mexican woman from Zacatecas, escaramuza horse rider, 26 years old, light-brown skin, long dark wavy hair in a low braid, a brown-and-cream checked long-sleeve shirt, jeans, brown riding boots, her hands empty.',
 'CUTBERTO_LARA': FACE + 'Mexican man, 35 years old, foreman of a horse ranch, light-brown skin, a thin black mustache, a black felt cowboy hat, a black leather vest over a white shirt, leather chaps with fringe, his hands empty.',
 'ARNULFO_VILLA': FACE + 'Mexican rancher boss from Zacatecas, 70 years old, weathered light skin, a white mustache, a brown felt cowboy hat, a camel canvas work jacket, a silver belt buckle, dark jeans, boots, his hands empty.',
 'CHAYO_ACUNA': FACE + 'Mexican grandmother from Zacatecas, 75 years old, small, brown wrinkled skin, grey hair in a bun, a purple checked apron over a beige blouse, a long dark skirt, her hands empty.',
}
LOCS = {
 'DUQUESA': 'Reference photo of one horse alone, no people: an old thin chestnut mare with a white blaze on her face and a white bandage wrapped on her front left leg, a worn brown halter, standing in profile on plain dirt ground, full body visible, natural light.',
 'LOC_CORRALJEREZ': 'Horse ranch corral in Jerez, Zacatecas, under a stormy grey sky: wooden fences, a dirt corral with straw, an old metal windmill, a hacienda gate with stone arches and pink bougainvillea, a covered porch with a wooden table, dry hills, no readable text, no signs, no logos, no people.',
 'LOC_CASAABUELA': 'Small humble adobe house of a grandmother in Jerez, Zacatecas, at dusk: a dirt yard, a tiny wooden stable with straw, clay pots, a clothesline, a wooden door with a lantern, warm light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("yegua-jerez*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
