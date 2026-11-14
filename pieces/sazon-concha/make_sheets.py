"""Hojas de sazon-concha PARTE 1 (El Sazón de Doña Concha, video 21, MAJESTIC) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
PROP = "{d} Photorealistic cinematic film still, 85mm, even soft light, no text"
# Historia ORIGINAL (sin ref directa): casona-restaurante tradicional mexicana. NADIE con sombrero ni lentes; sin filipinas ni gorros de cocinero (nada que parezca uniforme),
# sin gafetes ni letras. La cazuela va como hoja propia (PROP_CAZUELAMOLE) para que sea la misma en todos los planos. Sin cuchillos en la cocina.
CHARS = {
 "CONCEPCION_MOLERA": "Mexican mestizo woman, brown skin, head cook of a traditional restaurant house for thirty years, 58 years old, kind strong face with natural features, "
                      "black hair with grey strands pulled into a low bun, no hat, no glasses, white cotton blouse with small red embroidered flowers around the neckline, "
                      "one plain dark green apron, dark grey long skirt, black flat shoes, small silver stud earrings.",
 "MAXIMILIANO_GERENTE": "Mexican mestizo man, light brown skin, the owner's son-in-law who now manages the restaurant, 38 years old, handsome proud face, black hair combed back with gel, "
                        "completely clean-shaven with no beard and no moustache, no hat, no glasses, dark burgundy blazer over a black shirt with an open collar and no tie, "
                        "one silver wristwatch, charcoal trousers, polished black shoes.",
 "DARIO_COCINERO": "Mexican mestizo man, brown skin, a cook brought from the city, 32 years old, confident face, short black hair with shaved sides, short neat black beard, "
                   "no hat, no glasses, plain black long-sleeve shirt, one plain grey canvas apron with no logo, black trousers, black shoes.",
 "ANTONIO_LAVALOZA": "Mexican mestizo man, brown skin, the dishwasher of the restaurant kitchen, 45 years old, round friendly face, short black hair with some grey, thick black moustache and no beard, "
                     "no hat, no glasses, faded mustard-yellow t-shirt under one long plain white rubber apron, jeans, black rubber boots.",
 "VICTORIA_LAZCANO": "Mexican mestizo woman, light brown skin, owner of the old restaurant house, 72 years old, elegant calm face with soft lines, short styled silver hair, "
                     "no hat, no glasses, long-sleeve black dress, one plum-colored wool shawl over her shoulders, small pearl earrings, black low-heeled shoes.",
}
LOCS = {
 "LOC_COCINACASONA": "Big traditional kitchen of an old Mexican restaurant house, blue and white talavera tiles, a long tiled stove with clay pots and one clay comal, "
                     "copper pots hanging high on the wall, a deep stone sink, one small window with warm afternoon light, no knives, no signs, no readable text, no people.",
 "LOC_CALLEJONCASONA": "Narrow back alley behind an old Mexican restaurant house, old ochre plastered walls, one green wooden back door, a few empty wooden crates, "
                       "one warm wall lamp above the door, soft late afternoon light, no signs, no graffiti, no readable text, no people.",
 "LOC_COMEDORCASONA": "Elegant dining room of an old Mexican restaurant house, high arched walls painted deep terracotta, one long table with a white tablecloth, "
                      "dark carved wooden chairs, warm hanging lamps, potted palms, an open doorway to the kitchen on the left, no paintings, no menus, no readable text, no people.",
 "PROP_CAZUELAMOLE": "Reference photo of one single large round Mexican clay cazuela, glazed dark brown with a simple rim, full of thick dark mole sauce sprinkled with sesame seeds, "
                     "on a tiled stove, no spoon, no other pots, no people.",
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
    prompt = (SHEET if name in CHARS else PROP if name.startswith("PROP_") else LOC).format(d=d)
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
