"""Hojas de cincha-cortada PARTE 1 (La Cincha Cortada, MEXI) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia tipo capos (carreras de caballos en Sonora): el licenciado Arteaga quiere que Centella pierda; Jacinto, el ayudante, le cortó la cincha; doña Teodora llega y ya compró los papeles del rancho.
# Solo Cleto lleva sombrero; solo Arteaga lentes y traje de lino crema; solo Yahir camisa amarilla de jinete; solo Jacinto chaleco verde olivo y botas de avestruz; solo Teodora abrigo camello y anillo de jade. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "ANACLETO_CELIS": FACE + "Mexican man from Sonora, deeply tanned brown skin, an old horse trainer, 66 years old, short and wiry, thin face with deep wrinkles, small dark eyes, "
                   "a round mole on his left cheek, short white stubble, a worn cream palm-straw cowboy hat, no glasses, faded red plaid western shirt, old jeans, a brown leather belt, dusty work boots.",
 "YAHIR_CELIS": FACE + "Mexican man, brown skin, a horse jockey, 24 years old, clearly an adult, short and slim, round face, thick black eyebrows, clean-shaven, black hair buzzed short, "
                "no hat, no glasses, bright yellow long-sleeved racing shirt with no logos or numbers, white riding trousers, black riding boots.",
 "ARTEAGA_LICENCIADO": FACE + "Mexican man, light-brown skin, a rich lawyer, 54 years old, heavy-set, double chin, grey-black hair slicked back, thick black-rimmed glasses, "
                       "no hat, cream linen suit with an open-collar black shirt, a thick gold bracelet on his left wrist, polished black shoes.",
 "JACINTO_PEREDA": FACE + "Mexican man, brown skin, a stable hand, 36 years old, narrow face, long sideburns, a thin black goatee, short black hair, no hat, no glasses, "
                   "dusty grey t-shirt under an old olive-green work vest, jeans, brand-new shiny light-tan ostrich-skin cowboy boots.",
 "TEODORA_CARRASCO": FACE + "Mexican woman, dark brown skin, a powerful old ranch matriarch, 70 years old, tall, strong jaw, heavy-lidded dark eyes, short white hair cut at chin length, "
                     "no hat, no glasses, small silver earrings, long camel-colored wool coat over a cream blouse, black trousers, black low shoes, a big green jade ring on her right hand.",
}
LOCS = {
 "LOC_CABALLERIZA": "Inside the wooden stable of a rural horse race track in Sonora in the late afternoon: a dirt aisle with scattered straw, wooden stalls with open doors, saddles on a wooden rack, "
                    "a big open door at the end showing a straight dirt race track with a white wooden rail, golden low light, dust in the air, "
                    "no readable text, no signs, no logos, no numbers, no people.",
 "CABALLO_CENTELLA": "One horse standing alone in a dirt yard, full side view: a tall chestnut quarter horse with a shiny coat, a white blaze down its face and two white socks on its front legs, "
                     "a brown leather halter, golden late afternoon light, plain background, no rider, no saddle.",
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
