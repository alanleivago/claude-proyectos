"""Hojas de sarape-saltillo-p2 PARTE 2 (El Sarape de Saltillo · Parte 2, VISTA STORIES): las 4 hojas de personaje + LOC_CASASALTILLO de la Parte 1 (las vigentes),
copiadas de pieces/sarape-saltillo/chars (misma ropa), y UNA hoja nueva: MAURICIO_AROCHA (el dueño de la fábrica, que en la Parte 1 solo se nombraba).
Lo normal: python -I make_sheets.py --reupload  -> sube las 5 copias al proyecto Flow activo y genera + sube solo MAURICIO_AROCHA (el único jpg que falta en chars/).
Las copias tienen el mismo md5 que las de sarape-saltillo: las carpetas sarape-saltillo* no cuentan como duplicado en --reupload.
Control de imagen vieja: Flow a veces devuelve una imagen de otra pieza (bug: varias hojas seguidas con el mismo md5). Cada hoja nueva se compara por md5
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
# Parte 2: a las nueve, Clementina baja del carro negro frente a la casa de Fabián con Mauricio Arocha (56), el dueño de la fábrica al que ella cargó en su rebozo, y con Tereso.
# Misma ropa que en la Parte 1. Solo Mauricio pelo y barba plateados, lentes de armazón negro delgado y traje azul marino con camisa azul claro, sin corbata (ropa de civil, sin uniforme).
# Distinto de Fabián (rapado, candado negro, camisa blanca). Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "CLEMENTINA_RAMOS": FACE + "Mexican woman from Saltillo, Coahuila, a retired sarape weaver, 74 years old, light-brown wrinkled skin, small and thin, white hair in two braids pinned around her head like a crown, small silver earrings, "
                     "a dark grey rebozo with thin white stripes over a lavender blouse, a long black skirt, black flat shoes, a folded Saltillo sarape with bright rainbow stripes and fringed ends over her left forearm.",
 "FABIAN_ELIZONDO": FACE + "Mexican man from Saltillo, Coahuila, a factory manager, 46 years old, light skin, stocky, completely shaved head, a thick black goatee, "
                    "a white slim-fit dress shirt with an open collar, black trousers, black leather shoes, a heavy silver watch on his left wrist, his hands empty.",
 "FLORINDA_RAMOS": FACE + "Mexican woman from Saltillo, Coahuila, 49 years old, light-brown skin, slim, long straight black hair with honey highlights, red lipstick, a thin gold necklace, "
                   "an emerald-green satin blouse, beige wide trousers, nude heels, her hands empty.",
 "TERESO_RAMOS": FACE + "Mexican man from Saltillo, Coahuila, a baker, 41 years old, brown skin, lanky, curly black hair, a thin black mustache, no glasses, "
                 "a faded dark-green t-shirt, a white cloth apron dusted with flour, jeans, worn sneakers, his hands empty.",
 "MAURICIO_AROCHA": FACE + "Mexican man from Saltillo, Coahuila, the owner of a sarape factory, 56 years old, light-brown skin, tall and slim, short neatly combed silver-grey hair, a short trimmed grey beard, "
                    "thin black-rimmed glasses, a navy-blue suit with a light-blue shirt and no tie, a white pocket square, polished black shoes, his hands empty.",
}
LOCS = {
 "LOC_CASASALTILLO": "Front of a large modern house in an upscale neighborhood of Saltillo, Coahuila, at dusk: wide grey stone front steps, a tall glass front door with warm lights inside, "
                     "a dark stone and white stucco facade, a neat lawn, the dry mountains of the Sierra de Zapalinamé on the horizon under an orange sky, no readable text, no signs, no logos, no people.",
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("sarape-saltillo*")))  # las copias de la Parte 1 son la misma imagen a propósito
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
