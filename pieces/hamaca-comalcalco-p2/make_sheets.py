"""Hojas de hamaca-comalcalco-p2 PARTE 2 (La Hamaca de Comalcalco · Parte 2, VISTA STORIES): las 5 hojas de personaje + LOC_CACAOCOMALC de la Parte 1 (las vigentes),
copiadas de pieces/hamaca-comalcalco/chars (misma ropa). Sin personajes nuevos.
Lo normal: python -I make_sheets.py --reupload  -> sube las 6 copias al proyecto Flow activo (no genera nada: ya están todas en chars/).
Las copias tienen el mismo md5 que las de hamaca-comalcalco: las carpetas hamaca-comalcalco* no cuentan como duplicado en --reupload.
Control de imagen vieja: Flow a veces devuelve una imagen de otra pieza (bug: varias hojas seguidas con el mismo md5). Si alguna vez falta un jpg y se genera, se compara por md5
con todas las pieces/*/chars/**/*.jpg; si coincide imprime "DUPLICADO <nombre>", la deja en chars/dup/ y NO la sube.
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
# Parte 2: la misma tarde, en el corredor de Norberto junto al asoleadero; Norberto confiesa, Fortunata pone la finca a nombre de Zenobia, Isaura deja a Norberto y él se queda con la hamaca.
# Mismas descripciones (y mismas imágenes) que en la Parte 1. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "FORTUNATA_LANDERO": FACE + 'Mexican woman from Comalcalco, Tabasco, a cacao grower and matriarch, 73 years old, small and slender, dark brown wrinkled skin, long grey hair in a single braid tied with a red ribbon, small gold hoop earrings, a white blouse embroidered with bright flowers around the neckline, a long dark-green skirt, black sandals, holding a rolled-up white cotton hammock in her arms.',
 "ISAURA_GARDUZA": FACE + 'Mexican woman, 43 years old, light tan skin, shoulder-length wavy dyed blonde hair, big gold hoop earrings, long red nails, a fuchsia satin blouse, tight white trousers, gold sandals, her hands empty.',
 "NORBERTO_LANDERO": FACE + 'Mexican man from Comalcalco, Tabasco, 47 years old, tall with a thick neck, brown skin, short black hair with grey temples, clean-shaven, a crisp white long-sleeve button shirt, navy trousers, brown leather shoes, a big silver wristwatch, his hands empty.',
 "ZENOBIA_LANDERO": FACE + 'Mexican woman from Comalcalco, Tabasco, 40 years old, brown skin, round face, black hair in a low bun, no earrings, a plain lilac t-shirt, a blue-and-white checked apron dusted with corn flour, dark jeans, white sneakers, her hands empty.',
 "OLEGARIO_OCHOA": FACE + 'Mexican notary, 61 years old, short and plump, light brown skin, short white hair, a white mustache, round tortoiseshell glasses, a beige linen jacket over a white shirt with no tie, brown trousers, brown shoes, holding a brown leather folder.',
}
LOCS = {
 "LOC_CACAOCOMALC": 'Front porch of a new two-story white house with a tiled floor in Comalcalco, Tabasco, in the late afternoon, with a white wicker rocking chair and a small wooden table; beside it an old cement cacao drying patio covered with brown cacao beans spread out to dry, a small tin roof in one corner, cacao trees with yellow and red pods and tall shade trees behind, humid golden light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("hamaca-comalcalco*")))  # las copias de la Parte 1 son la misma imagen a propósito
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
