"""Hojas de casera-recibos PARTE 1 (La Casera de los Recibos, navideña, MAJESTIC) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia inspirada en la ref 7702576886957755670 (@relatos.de.vida.9): la casera que cobra la luz nueve veces, en diciembre. Atuendos de la ref con otros colores.
# NADIE con sombrero, gorra ni lentes; sin uniformes de enfermera, sin gafetes ni letras en la ropa. Navidad: un solo adorno por locación, SIN nacimiento.
# Cada personaje lleva una sola ropa en toda la pieza.
CHARS = {
 "MARICELA_ORNELAS": "Mexican woman, brown skin, a nurse from a small town wearing plain clothes, 31 years old, clearly an adult, kind tired face with determined eyes, "
                     "shoulder-length straight black hair tucked behind her ears, no hat, no glasses, navy blue knitted sweater, dark jeans, small gold stud earrings, white sneakers.",
 "CHELO_VALDIVIA": "Mexican woman, light brown skin, a boarding house landlady, 63 years old, hard round face, short permed copper-red dyed hair, no hat, no glasses, "
                   "emerald green housedress with small white flowers, thin gold chain, gold earrings, beige house slippers.",
 "NANCY_GUILLEN": "Mexican woman, light brown skin, a tenant, 33 years old, clearly an adult, nervous gentle face, curly brown shoulder-length hair, no hat, no glasses, "
                  "lilac fleece jacket over a plain white t-shirt, grey trousers, black sneakers.",
 "PACHITA_ROBLES": "Mexican woman, brown skin, a kind old neighbor, 76 years old, sweet wrinkled face, white hair in a low bun, no hat, no glasses, "
                   "red knitted shawl over a plain grey dress below the knee, small pearl earrings, black flat shoes.",
 "GRACIELA_MONDRAGON": "Mexican woman, light brown skin, a hospital nursing manager in office clothes, 52 years old, serious sharp face, short brown hair with one grey streak, "
                       "no hat, no glasses, no badge, charcoal grey blazer over a plain white blouse, black trousers, black low heels.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, sin letreros, precios, marcas ni adornos de más.
LOCS = {
 "LOC_PATIOCHELO": "Small front patio of an old boarding house in a Mexican city in December, a plain terracotta wall, one old wooden door, one string of small warm Christmas lights above the door, "
                   "one red star-shaped piñata hanging from a rope, soft cool daylight, no nativity scene, no other decorations, no plants, no readable text, no signs, no logos, no people.",
 "LOC_COCINACHELO": "Simple kitchen of an old boarding house, a plain pale yellow wall, one table with a plain red and white checked oilcloth, one plain white fridge with nothing stuck on it, "
                    "one steel pot on an old stove, soft window daylight, no papers on the walls, no decorations, no readable text, no logos, no people.",
 "LOC_SALAPACHITA": "Humble Mexican living room at night in December, one old brown sofa, one small wooden table with one clay pot of hot ponche and small clay mugs, "
                    "one window with a single string of small warm Christmas lights, warm lamp light, light steam, no nativity scene, no religious images, no other decorations, no readable text, no logos, no people.",
 "LOC_OFIHOSPITAL": "Plain small office of a city hospital, one wooden desk with a few plain folders, a plain pale green wall, one window with daylight, clean soft light, "
                    "no posters, no medical equipment, no readable text, no signs, no logos, no people.",
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
