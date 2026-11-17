"""Hojas de garrafon-bernal PARTE 1 (Los Garrafones de Bernal, VISTA STORIES) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Remake transformado de "Su esposa les prohibió el agua a los empleados" (Atrium): Leoncio, dueño de un viñedo familiar cerca de Bernal (Querétaro), encuentra en plena vendimia
# a Jovita (26) tomando agua de la tina de lavar cajas porque su esposa Lorena (no sale) encadenó los garrafones; en la cocina, doña Petronila (64) le cuenta que la mitad del mandado se va en la camioneta blanca.
# Solo Leoncio barba blanca corta y chaleco de gamuza café; solo Jovita paliacate rojo y camisa verde olivo; solo Petronila chongo gris, lentes con cordón y mandil de cuadros rojos. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "LEONCIO_AVALOS": FACE + "Mexican man from Querétaro, owner of a small family vineyard, 57 years old, light-brown skin, tall and slim, silver hair combed back, a short neatly trimmed white beard, "
                   "no hat, no glasses, a beige linen long-sleeve shirt under a dark brown suede vest, dark jeans, a brown leather belt, brown leather boots, a silver wristwatch on his left wrist, his hands empty.",
 "JOVITA_RESENDIZ": FACE + "adult Mexican woman from Querétaro, a grape picker, 26 years old, brown skin, slim, medium height, black hair in a low ponytail under a red bandana tied on her head, no makeup, no glasses, "
                    "an olive-green long-sleeve cotton work shirt, faded jeans, brown work boots, a wide straw hat hanging on her back by its cord, her hands empty.",
 "PETRONILA_OCADIZ": FACE + "Mexican woman, the cook of a farmhouse, 64 years old, brown skin, short and sturdy, grey hair in a tight bun, thin gold reading glasses hanging on a beaded cord around her neck, "
                     "a navy-blue cardigan over a white blouse, a red-and-white checkered apron, a dark grey skirt, black flat shoes, her hands empty.",
}
LOCS = {
 "LOC_PATIOBERNAL": "Dusty work yard of a small family vineyard near Bernal, Querétaro, in warm late-afternoon golden light: packed earth ground, stacks of wooden grape crates, "
                    "a big round galvanized tub of grey rinse water on the left, a low stone bench on the right with four blue plastic water jugs tied together with a heavy chain and a padlock, "
                    "green rows of grapevines behind, the huge rock monolith of the Peña de Bernal on the horizon, no readable text, no signs, no logos, no people.",
 "LOC_COCINABERNAL": "Big rustic kitchen of a vineyard farmhouse near Bernal, Querétaro, in warm afternoon window light: walls with blue-and-white tiles, a gas stove with clay pots on the left, "
                     "tall wooden pantry shelves that are half empty, a wooden table in the middle, the kitchen door on the right, no readable text, no signs, no logos, no people.",
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("garrafon-bernal*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
