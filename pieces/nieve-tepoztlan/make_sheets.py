"""Hojas de nieve-tepoztlan PARTE 1 (La Nevería de Tepoztlán, MEXI STORIES) con el Flow MCP (CLI): personajes y locación nuevos.
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
# nieve-tepoztlan (MEXI): nevería de Tepoztlán, Morelos. Solo Wenceslao pelo y bigote blancos con mandil blanco largo; solo Lizbeth pelo largo con mechas miel y blusa turquesa;
# solo Edmundo engominado, candado negro y polo azul marino; solo Montserrat pelo gris corto, lentes negros y traje sastre azul marino. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "WENCESLAO_SALGADO": FACE + 'Mexican man from Tepoztlán, Morelos, old ice cream maker, 73 years old, thin, dark brown wrinkled skin, short white hair, a neat white mustache, a white guayabera, a long white apron, beige cotton trousers, brown huarache sandals, his hands empty.',
 "LIZBETH_BERMUDEZ": FACE + 'Mexican woman, 40 years old, light skin, long straight dark-brown hair with honey highlights, perfect eyebrows, red lipstick, a tight turquoise blouse, white jeans, a thin gold necklace, white sneakers, her hands empty.',
 "EDMUNDO_SALGADO": FACE + 'Mexican man, 46 years old, chubby, brown skin, slicked-back black hair, a short black goatee, a navy-blue polo shirt, grey trousers, black loafers, a silver watch, his hands empty.',
 "MONTSERRAT_NOTARIA": FACE + 'Mexican woman, notary, 50 years old, brown skin, short grey hair in a neat pixie cut, small silver earrings, thin black rectangular glasses, a navy-blue skirt suit, a white blouse, black low heels, holding a brown leather document folder.',
}
LOCS = {
 "LOC_NEVERIATEPOZ": 'Inside a small traditional ice cream parlor on a cobbled street in Tepoztlán, Morelos, in the afternoon: a counter of hand-painted blue and yellow tiles, a hand-cranked copper ice cream pail set in a wooden tub of crushed ice, metal tubs of colorful ice cream behind glass, old wooden beams, papel picado garlands, an open door to the cobbled street with the green Tepozteco mountain far behind, warm light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("nieve-tepoztlan*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
