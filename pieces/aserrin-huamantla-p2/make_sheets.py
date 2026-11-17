"""Hojas de aserrin-huamantla-p2 PARTE 2 (La Alfombra de Huamantla, VISTA STORIES): las 3 hojas de personaje + LOC_PATIOHUAM2 de la Parte 1 (las vigentes, con sufijo 2 donde se rehicieron),
copiadas de pieces/aserrin-huamantla/chars, y UNA hoja nueva: KENIA_TENOPALA (la hija de Cleotilde, 21, que en la Parte 1 solo se nombraba).
Lo normal: python -I make_sheets.py --reupload  -> sube las 4 copias al proyecto Flow activo y genera + sube solo KENIA_TENOPALA (el único jpg que falta en chars/).
Las copias tienen el mismo md5 que las de aserrin-huamantla: esa carpeta no cuenta como duplicado.
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
# Parte 2: Kenia trae la carpeta azul; adentro las escrituras dicen Abigail Cuapio. Kenia se pone del lado de Abigail; Cleotilde se va antes de la procesión.
# Solo Delfino bigote y camisa de mezclilla; solo Abigail trenza, playera mostaza y mandil azul de lunares; solo Cleotilde tubos rosas, bata fucsia y uñas rojas;
# solo Kenia cola de caballo rubia miel y sudadera lila. Caras comunes, no famosas. Misma ropa que en la Parte 1.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "DELFINO_CUAPIO": FACE + "Mexican man from Tlaxcala, brown skin, a master maker of sawdust street carpets, 53 years old, medium height and medium build, short black hair grey at the temples, "
                   "a thick black-and-grey mustache, no beard, no hat, no glasses, a faded indigo denim work shirt with rolled sleeves and specks of colored sawdust on the sleeves, "
                   "khaki trousers, brown work boots, his hands empty.",
 "ABIGAIL_CUAPIO": FACE + "adult Mexican woman from Tlaxcala, 21 years old, brown skin, slim, medium height, long black hair in one single braid, no makeup, no glasses, "
                   "a mustard-yellow t-shirt under a faded blue apron with small white polka dots, rolled-up jeans, black rubber sandals, her hands and forearms stained with green and pink dye, her hands empty.",
 "KENIA_TENOPALA": FACE + "adult Mexican woman, 21 years old, light skin, slim, medium height, long straight hair dyed honey-blonde tied in one high ponytail, natural makeup, small silver stud earrings, no glasses, "
                   "a plain lilac hoodie sweatshirt with no print, light grey sweatpants, white sneakers, her hands empty.",
 "CLEOTILDE_TENOPALA2": FACE + "Mexican woman, 47 years old, light skin, short and plump, dyed copper-red hair rolled in big pink hair rollers, heavy makeup, red lipstick, big gold hoop earrings, "
                       "a shiny fuchsia satin robe over a black top and black leggings, gold slippers, long red nails, her hands empty.",
}
LOCS = {
 "LOC_PATIOHUAM2": "Inner patio of a modest family house in Huamantla, Tlaxcala, in warm late-afternoon golden light: red clay floor tiles, a covered corridor with wooden beams and potted red geraniums, "
                  "a woven hammock hanging under the corridor on the right, plastic buckets full of dyed sawdust in bright green, pink and yellow on the left, a long wooden table with brown cardboard stencils, "
                  "the open wooden street door at the back, the La Malinche volcano above the rooftops, no readable text, no signs, no logos, no people.",
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
        d = dupes(f, skip=("aserrin-huamantla", "aserrin-huamantla-p2"))  # la copia de la Parte 1 es la misma imagen a propósito
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
