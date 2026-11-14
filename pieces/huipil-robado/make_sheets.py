"""Hojas de huipil-robado PARTE 1 (El Huipil Robado, VISTA) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia inspirada en la ref 7701016469173292310 (@relatos.de.vida.9): bordadoras de la sierra y la boutique que revende sus blusas. Atuendos de la ref con otros colores.
# NADIE con sombrero, gorra ni lentes (tampoco de sol en la cabeza); sin uniformes, sin gafetes ni letras en la ropa. Bordados genéricos, sin patrones de una comunidad concreta.
# Cada personaje lleva una sola ropa en toda la pieza.
CHARS = {
 "TOMASA_SANABRIA": "Mexican Indigenous woman, brown skin, a village embroiderer from the mountains of Oaxaca, 64 years old, dignified weathered face with deep kind lines, two long grey braids, "
                    "no hat, no glasses, white cotton blouse embroidered with purple and yellow flowers at the chest, a wine red rebozo shawl over her shoulders, black skirt below the knee, simple brown sandals.",
 "YARETZI_SANABRIA": "Mexican woman, brown skin, Tomasa's niece, 29 years old, clearly an adult, determined face, long straight black hair in a low ponytail, no hat, no glasses, "
                     "forest green knitted cardigan over a plain cream t-shirt, dark jeans, small silver earrings, white sneakers.",
 "ROMINA_ARRIOLA": "Mexican woman, fair skin, an elegant city boutique owner, 42 years old, elegant cold face, sleek dark brown hair in a low bun, red lipstick, no hat, no glasses, no sunglasses, "
                   "ivory linen blazer over a plain black top, ivory linen trousers, thin gold necklace, nude heels.",
 "CRESCENCIA_LOPEZ": "Mexican Indigenous woman, brown skin, a village embroiderer, 60 years old, round worried face, grey hair pulled back in a low bun, no hat, no glasses, "
                     "light blue blouse with small white embroidery at the collar, a mustard yellow rebozo shawl over her shoulders, dark brown skirt, black flat shoes.",
 "OFELIA_FERIA2": "Mexican woman, light brown skin, a craft fair organizer, 50 years old, tired polite face, short wavy brown hair, no hat, no glasses, no badge, "
                    "plain teal blouse under a grey cardigan, black trousers, black flat shoes, holding one plain beige clipboard.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, sin letreros, precios, marcas ni adornos.
LOCS = {
 "LOC_PATIOTOMASA": "Adobe patio of a humble house in a mountain village of Oaxaca on a cloudy day, a plain ochre adobe wall, one simple wooden table with a few folded white embroidered blouses, "
                    "one wooden bench, soft green hills far behind, soft overcast daylight, no altar, no decorations, no readable text, no signs, no logos, no people.",
 "LOC_BOUTIQUEROM": "Small modern city boutique interior, a plain white wall, one black metal clothes rack with white embroidered blouses on hangers, one plain white counter, "
                    "clean white light, no mannequins, no price tags, no decorations, no readable text, no signs, no logos, no people.",
 "LOC_FERIACARPA": "Craft fair in a city plaza in the morning, a plain white canopy tent, one bare wooden table with a plain white cloth under the tent, soft diffused daylight, "
                   "no balloons, no banners, no decorations, no readable text, no signs, no logos, no people.",
 "LOC_CALLEFERIA": "Quiet cobblestone street of a Mexican colonial city at night, a plain yellow colonial wall, one warm old street lamp, two plain brown cardboard boxes on the ground, "
                   "warm lamp light, no cars, no decorations, no readable text, no signs, no logos, no people.",
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
