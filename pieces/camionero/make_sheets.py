"""Hojas de camionero PARTE 1 (El Camionero) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Atuendos = los de la ref (7697078993438182687) con los colores cambiados. Gafetes lisos sin letras; una sola gorra; Clemente nunca con saco.
CHARS = {
 "TEOFILO_TRAILERO": "Mexican mestizo man, brown skin, veteran semi-truck driver, 60 years old, weathered honest face with deep lines, short black hair with grey at the temples, "
                     "thick grey-black moustache and no beard, one dark green trucker cap with a tan mesh back and no logo, blue and black plaid flannel shirt worn open over a plain white t-shirt, "
                     "faded blue jeans, brown work boots.",
 "LEONOR_DIRECTORA": "Mexican mestizo woman, light brown skin, owner and director of a distribution company, 48 years old, elegant serious face, shoulder-length wavy dark brown hair, "
                     "light camel tailored blazer over a royal blue silk blouse, black trousers, one thin silver chain with a small round silver pendant, small silver hoop earrings, black low heels.",
 "CLEMENTE_BODEGUERO": "Mexican mestizo man, brown skin, warehouse manager, 46 years old, sharp face, slicked-back black hair with gel, short black moustache and goatee, "
                        "dark navy long-sleeve dress shirt with no jacket and no blazer, dark green tie, a plain blank white ID card with nothing written on it on a black lanyard, "
                        "grey trousers, black shoes.",
 "NAYELI_MONITOREO": "Mexican mestizo woman, brown skin, warehouse office and camera clerk, 32 years old, friendly attentive face, black hair pulled back in a neat low bun, "
                     "lavender long-sleeve blouse, black trousers, a plain blank white ID card with nothing written on it on a grey lanyard, black flat shoes.",
 "LALO_CHALECO": "Mexican mestizo man, brown skin, warehouse loader, 26 years old, honest face, short black hair, clean-shaven, plain orange safety vest with silver reflective stripes "
                 "and no lettering over a navy blue t-shirt, grey work trousers, black work boots.",
 "FIDEL_CARGADOR": "Mexican mestizo man, brown skin, forklift and storage worker, 36 years old, tired guilty face, short black hair, short black beard, "
                    "dark grey quilted vest over a maroon hoodie, dark work trousers, brown work boots.",
}
LOCS = {
 "LOC_ANDENCARGA": "Loading dock inside a large Mexican distribution warehouse, one white semi-trailer backed into an open dock door on the left, tall metal shelves with stacked brown cardboard boxes "
                   "on the right, grey concrete floor with yellow painted lines, cool fluorescent ceiling lights, no signs, no logos.",
 "LOC_SALAMONITORES": "Small security monitor room of a warehouse, a wall of eight monitors on the left showing grey security-camera views of warehouse aisles inside the screens, "
                      "a desk with a keyboard and a black office chair, dim cool light, no readable text, no logos.",
 "LOC_PASILLORACKS": "Long aisle in a Mexican warehouse, tall orange and dark blue pallet racks with brown boxes on both sides, yellow metal safety railings, a closed grey metal door "
                     "at the right side of the aisle, cool fluorescent light, no signs.",
 "LOC_CUARTOCAJAS": "Small side storeroom of a warehouse, bare grey walls, dusty empty metal shelves, one hanging ceiling lamp, an open grey metal door on the right, "
                    "one single stack of sealed brown cardboard boxes with plain white labels against the back wall, no readable text.",
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
