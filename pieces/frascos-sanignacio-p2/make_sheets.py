"""Hojas de frascos-sanignacio-p2 PARTE 2 (Los Frascos de San Ignacio · Parte 2, MAJESTIC STORIES): las 5 hojas de personaje + LOC_PLAZASANIGN de la Parte 1 (las vigentes),
copiadas de pieces/frascos-sanignacio/chars (misma ropa; LOC_DESIERTOBCS no se usa: toda la Parte 2 pasa en la plaza), y UNA hoja nueva: JIMENA_ARCINIEGA (la novia, hija de Belarmino).
Lo normal: python -I make_sheets.py --reupload  -> sube las 6 copias al proyecto Flow activo y genera + sube solo JIMENA_ARCINIEGA (el único jpg que falta en chars/).
Las copias tienen el mismo md5 que las de frascos-sanignacio: las carpetas frascos-sanignacio* no cuentan como duplicado en --reupload.
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
# Parte 2: ya metido el sol, en la plaza; Bastián e Iker levantan los frascos, llega la novia Jimena Arciniega (27), la hija de Belarmino a la que Tiburcia recibió, y suspende la boda.
# Misma ropa que en la Parte 1. Solo Jimena vestido de novia blanco de satín con cuello alto y mangas largas de encaje, velo largo y chongo bajo castaño oscuro, aretes de perla.
# Distinta de Tiburcia (anciana de chongo blanco) y sin parecido con Bastián ni con Iker. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "TIBURCIA_OSUNA": FACE + 'Mexican woman from San Ignacio, Baja California Sur, an old midwife and herbalist, 76 years old, short and stout, deeply tanned wrinkled skin, white hair pulled back in a low bun, small silver earrings, a faded navy-blue cotton dress with tiny white flowers, a white apron with a front pocket, a grey rebozo shawl over her shoulders, brown leather sandals, her hands empty.',
 "BASTIAN_TALAMANTES": FACE + 'Mexican groom from a rich family, 29 years old, light skin, slim and tall, styled light-brown hair with a quiff, clean-shaven, a sky-blue slim-fit linen suit, an open-collar white shirt with no tie, white sneakers, a thin gold chain bracelet, his hands empty.',
 "IKER_BARAJAS": FACE + 'Mexican man, 28 years old, lanky, olive skin, curly dark-red hair, a short reddish beard, a loose mint-green short-sleeve shirt with a palm-leaf print, beige chinos, brown boat shoes, his hands empty.',
 "BELARMINO_ARCINIEGA": FACE + 'Mexican rancher and powerful boss, 63 years old, broad and solid, tanned skin, thick grey hair combed back, a thick grey mustache, a dark brown felt cowboy hat, a cream long-sleeve western shirt with pearl snaps, dark jeans, a big plain silver belt buckle, brown cowboy boots, his hands empty.',
 "ZACARIAS_MAGANA": FACE + 'Mexican bodyguard and driver, 41 years old, burly, brown skin, shaved head, a short black beard, a charcoal-grey suit over a black shirt with no tie, black shoes, his hands empty.',
 "JIMENA_ARCINIEGA": FACE + 'Mexican bride from San Ignacio, Baja California Sur, 27 years old, light-brown skin, slim, long dark-brown hair in a low elegant bun under a long sheer white veil, small pearl earrings, '
                     'a simple long white satin wedding dress with a high lace neckline and long lace sleeves, white satin heels, holding a small round bouquet of white flowers.',
}
LOCS = {
 "LOC_PLAZASANIGN": 'Quiet old town plaza in the desert oasis of San Ignacio, Baja California Sur, in the late afternoon: tall date palms and dark green Indian laurel trees, a white stone colonial church facade at the back, low adobe houses, a small wooden herb stall with glass jars of dried herbs under a palm-leaf awning on the left, a white flower wedding arch half set up on the right, warm orange sunset light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("frascos-sanignacio*")))  # las copias de la Parte 1 son la misma imagen a propósito
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
