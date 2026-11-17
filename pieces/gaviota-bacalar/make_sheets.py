"""Hojas de gaviota-bacalar PARTE 1 (La Gaviota de Bacalar, VISTA STORIES) con el Flow MCP (CLI): personajes y locación nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Variante transformada del Final de la saga de la madrastra (7705499092683590942) de Atrium: en el muelle de lanchas de Bacalar (Quintana Roo), Saturnino (56) corre a su esposa
# Araceli (45) por haber puesto a su hija Ixchel (24) a tallar el muelle; Araceli reclama las lanchas y llama a Wilberto (52), el hermano de Saturnino, que llega en la última lancha.
# Solo Saturnino barba gris corta y guayabera blanca; solo Araceli pelo negro con mechas cobrizas y vestido largo de playa naranja con flores; solo Wilberto calvo, bigote negro,
# lentes dorados y polo amarilla limón; solo Ixchel coleta alta, playera blanca lisa y capri azul marino, descalza. Saturnino y Wilberto son hermanos pero se distinguen a simple vista. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "SATURNINO_DZIB": FACE + 'Mexican man from Bacalar, Quintana Roo, owner of the tour boats on the lagoon, 56 years old, broad-shouldered, dark brown sun-weathered skin, short grey hair, a short grey beard, a white short-sleeve guayabera shirt, khaki trousers rolled at the ankles, brown leather sandals, a black diving wristwatch, his hands empty.',
 "ARACELI_BRACAMONTES": FACE + 'Mexican woman, 45 years old, light olive skin, long black hair with copper highlights, big dark sunglasses pushed up on her head, red lipstick, a long flowing orange floral beach dress, gold bangles, gold sandals, her hands empty.',
 "IXCHEL_DZIB": FACE + 'Mexican woman from Bacalar, Quintana Roo, 24 years old, Maya features, brown skin, black hair in a high ponytail, no earrings, a plain white t-shirt with wet patches, navy-blue capri trousers, barefoot, holding a wooden scrub brush.',
 "WILBERTO_DZIB": FACE + 'Mexican man from Bacalar, Quintana Roo, 52 years old, thin, bald, a thick black mustache, gold-rimmed glasses, a lemon-yellow polo shirt, white trousers, white loafers, holding a yellow manila envelope.',
}
LOCS = {
 "LOC_MUELLEBACALAR": 'Long wooden dock over the turquoise and deep-blue striped lagoon of Bacalar, Quintana Roo, in the late afternoon: white tour boats tied along the dock, a small old wooden boat painted turquoise with a white seagull painted on its side, a palapa with a thatched palm roof at the end of the dock with a wooden lounge chair, mangroves on the shore, golden light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("gaviota-bacalar*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
