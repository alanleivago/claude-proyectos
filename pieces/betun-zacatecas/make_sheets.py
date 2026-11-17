"""Hojas de betun-zacatecas PARTE 1 (El Bolero de Zacatecas, MEXI STORIES) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Remake transformado de "Lo dejó por vender empanadas… sin saber que él heredaría todo" (Atrium): Noemí, gerente de hotel, le lleva el divorcio a su esposo Apolinar, bolero de la Plaza de Armas de Zacatecas,
# con su amante Fabricio, y le da hasta las doce campanadas para firmar; llega el notario Teódulo: don Rosalío Bañuelos, el viejito al que Apolinar le boleó las botas doce años, le dejó sus hoteles;
# la firma del divorcio es de la gerente del hotel de la plaza y Fabricio quiso comprarle los hoteles a don Rosalío.
# Solo Apolinar barba entrecana, camisa de mezclilla y mandil con betún; solo Noemí saco mostaza y luces miel; solo Fabricio traje gris claro de tres piezas, corbata vino y lentes oscuros en la cabeza;
# solo Teódulo pelo blanco, lentes redondos de carey y traje carbón. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "APOLINAR_ESCAMILLA": FACE + "Mexican man from Zacatecas, 46 years old, a shoeshine man, brown skin, medium build, short curly black hair with some grey, a short salt-and-pepper beard, no hat, no glasses, "
                       "a faded light-blue denim shirt with rolled sleeves under a brown canvas apron stained with black shoe polish, black polish on his fingertips, grey trousers, old black shoes, his hands empty.",
 "NOEMI_MONREAL": FACE + "Mexican woman, 41 years old, a hotel manager, light-brown skin, slim, long straight dark brown hair with honey highlights, small gold hoop earrings, a thin gold chain, "
                  "a mustard-yellow blazer over a black blouse, black trousers, black heels, her hands empty.",
 "FABRICIO_URQUIDI": FACE + "Mexican man, 44 years old, light skin, tall, black hair slicked back, a neatly trimmed black beard, dark sunglasses pushed up on his head, a light-grey three-piece suit, "
                     "a burgundy tie, gold cufflinks, brown leather shoes, his hands empty.",
 "TEODULO_ARIZPE": FACE + "Mexican man, 63 years old, a notary, brown skin, slim, white hair combed back, clean-shaven, round tortoiseshell glasses, a charcoal-grey suit, a white shirt, a navy-blue tie, "
                   "black shoes, his hands empty.",
}
LOCS = {
 "LOC_PLAZAZAC": "Plaza de Armas of Zacatecas on a sunny late morning: the ornate baroque pink cantera stone facade of the Zacatecas cathedral, colonial pink stone buildings, iron benches and laurel trees, "
                 "a shoeshine stand with a small wooden bench, a green canvas umbrella and a wooden shoeshine box painted bright blue with a brass footrest, no readable text, no signs, no logos, no people.",
 "LOC_NOTARIAZAC": "Notary office in Zacatecas at midday: dark wooden bookshelves full of thick bound volumes, a big wooden desk, a brown leather armchair, a tall window with a view of the rocky "
                   "Cerro de la Bufa hill, no readable text, no signs, no logos, no people.",
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
        d = dupes(f)
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
