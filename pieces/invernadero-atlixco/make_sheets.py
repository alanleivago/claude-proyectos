"""Hojas de invernadero-atlixco PARTE 1 (Las Nochebuenas de Atlixco, VISTA STORIES) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Remake transformado de "Veinte años a su lado… y lo vendieron" (Atrium): Nazario, un acaparador de flores, se mete al invernadero de nochebuenas de doña Hermelinda
# en el valle de Atlixco (Puebla), humilla al encargado Efrén y le da hasta que den las seis para firmarle la cosecha; llega Hermelinda con los camiones del valle
# y el plazo cambia de lado; las llaves que trae Nazario son de Ezequías, el esposo de Hermelinda, que viene en la camioneta de Nazario.
# Solo Hermelinda lleva abrigo gris carbón y el broche de nochebuena; solo Nazario va rapado con polo mostaza; solo Efrén mandil verde y camisa de mezclilla;
# solo Rufina trenza canosa y mandil de cuadros morados; solo Ezequías boina gris y barba blanca larga. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "HERMELINDA_CORONA": FACE + "Mexican woman from Puebla, light-brown skin, the owner of a poinsettia greenhouse, 67 years old, tall and slim, upright posture, long face with fine wrinkles, "
                      "silver-grey hair in a neat low bun, small pearl earrings, no glasses, no hat, a long charcoal-grey wool coat with a small red poinsettia brooch on the lapel, "
                      "a cream high-neck blouse, black trousers, black low-heel shoes, her hands empty.",
 "EFREN_CUAUTLE": FACE + "Mexican man from Puebla, brown skin, the foreman of a poinsettia greenhouse, 46 years old, medium height, stocky, round face, short curly black hair, "
                  "a thick black mustache, no hat, no glasses, a faded blue denim work shirt with rolled sleeves, a dark-green canvas work apron, brown work trousers, black rubber boots, "
                  "soil on his hands.",
 "NAZARIO_BRETON": FACE + "Mexican man, light skin, a wholesale flower trader, 52 years old, tall and heavyset with a big belly, shaved bald head, a thick black goatee, "
                   "no hat, no glasses, a mustard-yellow polo shirt with no logo, dark jeans, brown cowboy boots, one gold ring on his right hand, a gold chain bracelet, his hands empty.",
 "RUFINA_TECUAPETLA": FACE + "Mexican woman from Puebla, dark-brown skin, a greenhouse worker, 58 years old, short and plump, round cheeks, a long grey braid down her back, "
                      "no hat, no glasses, a purple-and-white checked apron over a plain navy-blue dress, a grey cardigan, flat black shoes, her hands empty.",
 "EZEQUIAS_VILCHIS": FACE + "Mexican man, fair weathered skin, a retired greenhouse owner, 74 years old, thin and slightly hunched, long white hair combed back, a full long white beard, "
                     "a grey tweed flat cap, a brown wool cardigan over a white shirt, grey trousers, brown leather shoes, his hands empty.",
}
LOCS = {
 "LOC_INVERNADERO": "Poinsettia greenhouse yard in the Atlixco valley of Puebla at golden-hour dusk: long greenhouses of white plastic on metal arches with the doors open, "
                    "endless rows of red poinsettias in black plastic pots inside, a dirt yard with an old wooden loading table holding a few potted poinsettias, an iron gate "
                    "to a dirt road, fields beyond and the snowy Popocatépetl volcano far in the distance, no readable text, no signs, no logos, no people.",
 "LOC_CASONA": "Courtyard of an old colonial house in Atlixco, Puebla, at dusk: walls with blue-and-white talavera tiles, stone arches, a small stone fountain in the center, "
               "potted red poinsettias along the arches, warm lamps turning on, a church bell tower visible above the roof, no readable text, no logos, no people.",
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
