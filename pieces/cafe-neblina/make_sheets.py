"""Hojas de cafe-neblina PARTE 1 (La Neblina, MEXI) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Remake transformado de "Me dejó la hacienda vacía y una deuda escondida" (Atrium): el coyote Lamberto pisa el café de Brígida y llama a su patrón, que es el padrino de ella.
# Solo Gaudencio lleva sombrero puesto (panamá crema); Nemesio trae en las manos el de palma con banda azul; solo Brígida trenza y mandil; solo Lamberto camisa vino y cadena;
# solo Toribio calvo y mezclilla; solo Silvano polo verde oscuro. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "BRIGIDA_OLMOS": FACE + "Mexican woman from the coffee mountains of Veracruz, light-brown skin, a small coffee farmer, 46 years old, medium build, strong cheekbones, a few freckles, "
                  "a small scar on her left eyebrow, black hair in one long braid with grey strands, small gold hoop earrings, no hat, no glasses, a faded mustard-yellow blouse, "
                  "a light-brown work apron with deep pockets, a dark-blue skirt to the knee, dark-green rubber boots.",
 "LAMBERTO_GAONA": FACE + "Mexican man, light skin, a coffee middleman, 50 years old, heavy with a round belly, heavy jowls, thick black mustache, small eyes, short black hair combed back, "
                   "no hat, no glasses, a wine-red western shirt with white piping, a thin gold chain, a big silver belt buckle, dark jeans, muddy brown cowboy boots, "
                   "one folded white paper in his right hand.",
 "TORIBIO_LIRA": FACE + "Mexican man, dark-brown skin, a truck driver, 58 years old, thin and slightly stooped, sunken cheeks, bald head, short grey stubble beard, big ears, "
                 "no hat, no glasses, a faded light-blue denim work shirt with rolled sleeves, grey work trousers, worn black boots.",
 "GAUDENCIO_ARRIETA": FACE + "Mexican man, light-brown skin, the old owner of a big coffee mill, 74 years old, tall and thin, upright, long serene face with deep wrinkles, "
                      "thick white mustache, calm dark eyes, a cream panama hat with a black band, a white long-sleeve shirt under a dark-brown wool vest, cream trousers, "
                      "old brown leather boots, his hands empty.",
 "SILVANO_JACOME": FACE + "Mexican man, brown skin, the trusted right-hand man of a coffee mill owner, 45 years old, stocky, round clean-shaven face with a wide nose, short black hair, "
                   "no hat, no sunglasses, a dark-green polo shirt with no logo, khaki trousers, brown shoes, his hands crossed in front of him.",
 "NEMESIO_TLAPA": FACE + "Mexican man, brown skin, a coffee farmer who left home, 49 years old, gaunt, hollow cheeks, three-day stubble, messy black hair with grey at the temples, "
                  "tired eyes, a wrinkled light-blue denim jacket over a white t-shirt, dark trousers, dusty boots, a palm-leaf hat with a woven blue band held low in both hands.",
}
LOCS = {
 "LOC_PATIOCAFE": "Coffee drying patio of a small farm in the misty green mountains of central Veracruz on a cool morning: a wide grey concrete patio covered with coffee beans "
                  "spread out to dry, a wooden rake leaning on a wall, a small wooden house with a tin roof and a narrow porch with a bench, coffee bushes and banana plants around, "
                  "soft mist on the mountains behind, a dirt road at the edge, no readable text, no signs, no logos, no people.",
 "LOC_BENEFICIO": "Covered porch of an old coffee mill in the mountains of Veracruz in the morning: old white plaster walls, dark wooden beams, a tall tin roof, stacks of plain jute "
                  "coffee sacks with no letters, a wooden desk with an old iron scale and an old black phone, a green valley with mist beyond the porch, no readable text, no logos, no people.",
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
