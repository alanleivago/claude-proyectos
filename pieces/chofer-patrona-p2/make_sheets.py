"""Hojas de chofer-patrona-p2 PARTE 2 (El Chofer de la Patrona, MAJESTIC): las 5 hojas + LOC_COCHERARANCHO de la Parte 1, copiadas de pieces/chofer-patrona/chars,
y UNA hoja nueva: LISANDRO_TREVINO (el licenciado Treviño, que en la Parte 1 solo se nombraba).
Lo normal: python -I make_sheets.py --reupload  -> sube las 6 copias al proyecto Flow activo y genera + sube solo LISANDRO_TREVINO (el único jpg que falta en chars/).
Las copias tienen el mismo md5 que las de chofer-patrona: esa carpeta no cuenta como duplicado.
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
# Parte 2: mismos personajes y ropa que la Parte 1 (descripciones = las de pieces/chofer-patrona/make_sheets.py, solo por si faltara un jpg) + Treviño.
# Solo Brígido lleva sombrero; solo Valente chamarra de gamuza vino y cadena de oro; solo Lencho guayabera blanca y bigote canoso; solo Chema camisa de mezclilla y pelo rizado; solo Eusebia rebozo negro;
# solo Treviño lentes y traje de lino crema. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "FLORENCIO_ARAMBULA": FACE + "Mexican man, brown skin, a family chauffeur for twenty years, 61 years old, round face with soft cheeks and deep laugh lines, a wide flat nose, "
                       "thick grey mustache, short grey hair, no hat, no glasses, plain white guayabera shirt with vertical pleats, dark grey trousers, black shoes, "
                       "a single car key on a red cord in his right hand.",
 "VALENTE_MONTALVO2": FACE + "Mexican man from Durango, mestizo features, warm medium-brown skin, the spoiled son of a powerful rancher family, 31 years old, slightly full face with broad cheekbones, dark brown almond eyes, a short straight nose, a thin black mustache and light stubble, a common everyday look, "
                     "black hair short on the sides and combed back on top, no hat, no glasses, burgundy suede jacket over a black t-shirt, a thin gold chain on his neck, "
                     "dark jeans, brown boots.",
 "EUSEBIA_MONTALVO": FACE + "Mexican woman, brown skin, a powerful old ranch matriarch, 72 years old, serene oval face with fine wrinkles, heavy-lidded dark eyes, "
                     "silver hair pulled back in a low bun, no hat, no glasses, black long-sleeved dress, a black rebozo shawl over her shoulders, small pearl earrings, "
                     "two gold rings on her right hand, black low-heeled shoes.",
 "BRIGIDO_TOSTADO": FACE + "Mexican man, tan skin, the head of the family escort, 48 years old, tall and broad, long face, thick black mustache with grey hairs, "
                    "a black cowboy hat, no glasses, black suit jacket over a white shirt with no tie, black trousers, black boots, a black handheld radio in his right hand.",
 "CHEMA_ARAMBULA": FACE + "Mexican man, brown skin, a ranch stable hand, 23 years old, clearly an adult, slim face, short curly black hair, clean-shaven, "
                   "a small scar on his left eyebrow, no hat, no glasses, faded light-blue denim shirt with rolled sleeves, jeans, work boots.",
 "LISANDRO_TREVINO": FACE + "Mexican man, light olive skin, a smooth-talking small-town lawyer, 66 years old, wide face with heavy jowls, balding on top with short grey hair on the sides, "
                     "clean-shaven, round gold-rimmed glasses, no hat, cream linen suit over a pale blue shirt with no tie, brown loafers, a brown leather folder in his left hand.",
}
LOCS = {
 "LOC_COCHERARANCHO": "Gravel courtyard in front of the big house of a rich ranch in the sierra of Durango at sunrise: a long two-story house with a stone porch and wooden columns, "
                      "a black SUV parked with its rear hatch open, a tall black iron gate at the far end, pine-covered mountains behind, golden low morning light, dust in the air, "
                      "no readable text, no signs, no logos, no license plates, no people.",
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
        d = dupes(f, skip=("chofer-patrona", "chofer-patrona-p2"))  # la copia de la Parte 1 es la misma imagen a propósito
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
