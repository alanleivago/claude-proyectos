"""Hojas de foto-trucada PARTE 1 (La Foto que No Era, MEXI) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia inspirada en la ref 7691753795893710100 (@eltiomoet): la vecina chismosa que hunde a la nueva con una foto trucada. Atuendos de la ref con otros colores.
# NADIE con sombrero, gorra ni lentes; sin uniformes, sin gafetes ni letras en la ropa. Cada personaje lleva una sola ropa en toda la pieza.
CHARS = {
 "NORMA_BECERRIL": "Mexican woman, light brown skin, the neighborhood gossip, 54 years old, sharp gossipy face with thin plucked eyebrows, short curly permed burgundy red hair, big gold hoop earrings, "
                   "no hat, no glasses, fuchsia blouse with small white polka dots, black trousers, black flat shoes.",
 "ERNESTO_BECERRIL": "Mexican man, tan skin, Norma's husband, 58 years old, tired stern face, short grey hair, thick grey mustache, no hat, no glasses, "
                     "brown plaid flannel shirt with sleeves rolled up, jeans, brown work boots.",
 "ROCIO_MONTIEL": "Mexican woman, brown skin, the new neighbor and a seamstress, 34 years old, kind honest face, long wavy chestnut hair worn loose, no hat, no glasses, "
                  "mustard yellow blouse, a yellow tailor's measuring tape hanging around her neck, light blue jeans, white sneakers.",
 "HUGO_MONTIEL": "Mexican man, brown skin, Rocio's husband, 37 years old, serious face, short black hair, short black beard, no hat, no glasses, "
                 "plain navy blue polo shirt with no logo, grey work trousers, black work shoes.",
 "KARLA_BECERRIL": "Mexican woman, light brown skin, Norma's daughter, 25 years old, clearly an adult, thoughtful face, black hair in a high bun, small gold stud earrings, no hat, no glasses, "
                   "black denim jacket over a plain white t-shirt, dark jeans, white sneakers.",
 "CLOTILDE_RAMOS": "Mexican woman, fair skin, a prim neighbor and client, 62 years old, prim face, short grey hair, small pearl earrings, no hat, no glasses, "
                   "rose pink cardigan over a white blouse, grey skirt below the knee, beige flat shoes, holding one folded plain blue dress.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, sin letreros, números de casa, marcas ni adornos.
LOCS = {
 "LOC_CALLECOLONIA": "Street of a working-class neighborhood in a Mexican city on a sunny day, two plain two-story houses side by side, one pale green house with a brown metal door, "
                     "one peach house with an open garage, a plain grey sidewalk, soft daylight, no cars, no decorations, no readable text, no house numbers, no signs, no logos, no people.",
 "LOC_DEPAKARLA": "Small humble apartment kitchen in the evening, a plain white tiled wall, one small wooden table with two chairs, one window with a plain beige curtain, "
                  "warm lamp light, no calendar, no decorations, no readable text, no signs, no logos, no people.",
 "LOC_COSTURAROCIO": "Small sewing workshop set in a garage, plain whitewashed walls, one black sewing machine on a wooden table, one plain metal rack with a few dresses on hangers, "
                     "daylight from the open garage door, no mirror, no mannequins, no decorations, no readable text, no signs, no logos, no people.",
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
