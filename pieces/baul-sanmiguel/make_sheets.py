"""Hojas de baul-sanmiguel PARTE 1 (El Baúl de San Miguel, MAJESTIC STORIES) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Remake transformado de "Su propio hijo le cerró la puerta · Parte 1" (Atrium): don Hilario, 77, llega con su baúl de lámina verde a la casona de su hijo Raymundo en San Miguel de Allende (Guanajuato);
# la nuera Mirna lo corre antes de las ocho y Raymundo le dice que se vaya; su otro hijo, Ciriaco, cantero pobre, y su esposa Felícitas le dan su cama. De noche Ciriaco decide vender su cortadora
# y Hilario, que lo oye, abre el baúl y llama al notario: "Ya sé cuál de mis hijos se va a quedar con todo."
# Solo Hilario sombrero de fieltro gris, bigote blanco y bastón; solo Raymundo saco azul marino y lentes; solo Mirna melena rubia platinada y traje blanco; solo Ciriaco polvo de cantera y playera azul marino;
# solo Felícitas trenza y rebozo rojo. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "HILARIO_PENALOZA": FACE + "Mexican man from Guanajuato, 77 years old, brown weathered skin, thin and a little stooped, white wavy hair, a thick white mustache, a grey felt hat with a black band, "
                     "a brown corduroy jacket over a cream guayabera shirt, grey trousers, old black shoes, a mesquite wood walking cane in his left hand.",
 "RAYMUNDO_PENALOZA": FACE + "Mexican man, 51 years old, an architect, light-brown skin, tall, black hair combed back with grey streaks, a short grey goatee, thin rimless glasses, no hat, "
                      "a navy-blue blazer over a white shirt with no tie, grey trousers, brown leather shoes, his hands empty.",
 "MIRNA_OLGUIN": FACE + "Mexican woman, 46 years old, light skin, slim, a straight platinum-blonde chin-length bob, pearl stud earrings, light makeup, a white linen pantsuit, nude high heels, "
                 "her hands empty.",
 "CIRIACO_PENALOZA": FACE + "Mexican man from Guanajuato, 42 years old, a stone carver, brown skin, stocky, short black hair, thick eyebrows, a short black beard, a dusty navy-blue t-shirt, "
                     "pale pink stone dust on his forearms and hands, dusty jeans, worn work boots, no hat, no glasses, his hands empty.",
 "FELICITAS_CANCHOLA": FACE + "Mexican woman from Guanajuato, 40 years old, brown skin, medium build, long black hair in a thick braid, small silver earrings, a white blouse embroidered with red flowers, "
                       "a red rebozo over her shoulders, a dark skirt, black flat shoes, her hands empty.",
}
LOCS = {
 "LOC_CASONASM": "Stone front steps of a big colonial mansion in San Miguel de Allende, Guanajuato, at golden dusk: ochre walls covered in magenta bougainvillea, a tall carved wooden double door "
                 "at the top of the steps, iron lanterns, the pink neo-gothic spires of the Parroquia church in the distance, no readable text, no signs, no logos, no people.",
 "LOC_CUARTOCANTERA": "Small humble house of rough cantera stone in a poor neighborhood of San Miguel de Allende, Guanajuato, at dusk: a tin roof, a narrow open wooden door, a tiny patio with "
                      "half-carved pink cantera stone pieces and stone dust, a plain wooden table with a plastic tablecloth, one bare light bulb, no readable text, no signs, no logos, no people.",
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
