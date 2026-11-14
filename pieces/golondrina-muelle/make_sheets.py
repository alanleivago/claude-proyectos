"""Hojas de golondrina-muelle PARTE 1 (La Golondrina, SIN MARCA) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia tipo capos (conflicto nuevo, sin premisa del resumen): el licenciado Ruelas le tira el pescado a don Cheyo y le quita la lancha Golondrina; la lancha es de don Arcadio.
# Solo Arcadio lleva sombrero (paja blanco); solo Cheyo gorra azul marino y botas blancas de hule; solo Ruelas lentes y saco de lino beige; solo Nereida mandil naranja y trenza; solo Tiburcio calvo con rompevientos azul marino. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "ELISEO_SAUCEDA": FACE + "Mexican man from the coast of Sinaloa, dark sun-tanned brown skin, an old fisherman, 67 years old, thin weathered face with deep sun wrinkles around the eyes, "
                   "a hooked nose, short white stubble beard, a faded navy-blue cap, no glasses, light-grey long-sleeved work shirt with rolled sleeves, faded khaki trousers, "
                   "white rubber boots, his hands empty.",
 "HERIBERTO_RUELAS": FACE + "Mexican man, light-brown skin, a new dock administrator, 42 years old, round face with a double chin, thick black mustache, "
                     "square black-framed glasses, short black hair with a side part, no hat, beige linen suit jacket over a light-blue shirt with no tie, "
                     "a gold wristwatch on his left wrist, dark trousers, brown loafers, a black folder in his left hand.",
 "NEREIDA_SAUCEDA": FACE + "Mexican woman from the coast of Sinaloa, brown skin, a fish seller, 26 years old, clearly an adult, oval face with freckles on the cheeks, "
                    "long black hair in one thick braid, small gold hoop earrings, no hat, no glasses, an orange rubber apron over a white t-shirt, jeans, white rubber boots.",
 "TIBURCIO_LERMA": FACE + "Mexican man, tan skin, the old radio keeper of a fishing dock, 58 years old, short and stocky, completely bald, a short grey goatee, "
                   "no hat, no glasses, a navy-blue windbreaker jacket, grey trousers, black boots, a black handheld radio in his right hand.",
 "ARCADIO_QUINONEZ": FACE + "Mexican man, deeply tanned skin, the powerful old patron of the bay, 74 years old, serene long face with deep wrinkles, thick white mustache, "
                     "white hair under a wide-brimmed white straw hat, no glasses, cream linen guayabera shirt, beige trousers, white leather shoes, "
                     "one gold ring with a small blue swallow on his right hand.",
}
LOCS = {
 "LOC_MUELLEPESCA": "Old wooden fishing dock on the coast of Sinaloa at sunrise on Christmas Eve: wet weathered planks, small white fiberglass fishing boats moored along it, "
                    "one white-and-blue boat with an outboard motor and a small blue swallow painted on its bow, blue plastic fish coolers, coiled ropes, "
                    "a small wooden ice house shed with a string of small Christmas lights and a paper star, pelicans on the posts, calm bay and golden low light, "
                    "no readable text, no signs, no logos, no boat names, no people.",
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
