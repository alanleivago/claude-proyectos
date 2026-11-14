"""Hojas de cenote-campana PARTE 1 (La Campana del Cenote, MAJESTIC) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Remake transformado de El Retén (Atrium): el ingeniero Portilla le cierra el cenote a don Nicasio; la campana llama a doña Zenaida, la dueña.
# Solo Nicasio lleva sombrero (de huano); solo Portilla traje gris claro; solo Citlali hipil; solo Cosme barba y chaleco naranja; solo Zenaida bastón y moño blanco; solo Fidencio guayabera azul cielo. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "NICASIO_CANCHE": FACE + "Mayan man from Yucatan, dark brown skin, the old keeper of a cenote, 71 years old, short and thin, round weathered face with deep wrinkles, a wide flat nose, "
                   "thin grey mustache, short grey hair under a worn palm-leaf hat, no glasses, a plain white cotton shirt, white cotton trousers, rope sandals, his hands empty.",
 "OSIEL_PORTILLA2": FACE + "Mexican man, light skin, an engineer from a hotel company, 40 years old, slim, clean-shaven narrow face with a pointed chin and thin lips, "
                   "black hair slicked back with gel, no hat, no glasses, a light-grey slim suit with an open white shirt and no tie, polished black shoes, "
                   "a rolled white blueprint in his left hand.",
 "CITLALI_CANCHE2": FACE + "Mayan woman from Yucatan, brown skin, the granddaughter of a cenote keeper, 24 years old, clearly an adult, round face with full cheeks and a small mole near her lip, "
                   "black hair in a low bun, small gold filigree earrings, no hat, no glasses, a white hipil dress with a band of red and green embroidered flowers at the neck and hem, flat sandals.",
 "COSME_BALAM2": FACE + "Mexican man, tan skin, a construction foreman, 52 years old, heavy-set with a big belly, thick black beard with grey streaks, short curly black hair, "
                "no hat, no glasses, an orange work safety vest with no text over a grey t-shirt, jeans, brown work boots.",
 "ZENAIDA_CAUICH2": FACE + "Mexican woman from Yucatan, light-brown skin, the powerful old owner of a henequen hacienda, 76 years old, small and upright, serene oval face with deep wrinkles "
                   "and dark calm eyes, white hair in a tight bun tied with a red ribbon, gold filigree earrings, no hat, no glasses, an elegant cream linen dress with fine white embroidery, "
                   "embroidered flat shoes, a dark wooden cane with a silver tip in her right hand.",
 "FIDENCIO_TZUC2": FACE + "Mexican man, brown skin, the trusted right-hand man of a hacienda owner, 45 years old, medium build, square face with a wide jaw, short black brush mustache, "
                  "short black hair, no hat, no sunglasses, a sky-blue guayabera shirt, beige trousers, brown shoes, his hands crossed in front of him.",
}
LOCS = {
 "LOC_CENOTEREJA2": "Entrance of a cenote in the low green scrub forest of Yucatan on a sunny morning: a white limestone path between low dry-stone walls, an old weathered wooden gate, "
                   "an old bronze bell hanging from a henequen rope on a wooden post beside the gate, stone steps going down to bright turquoise water in a limestone hollow, "
                   "a small palm-thatched palapa with hammocks, a white dirt road behind, no readable text, no signs, no logos, no people.",
 "LOC_HACIENDAAMARILLA2": "Arched corridor of an old yellow henequen hacienda in Yucatan in the morning: yellow walls, white stone arches, red tile floor, tall wooden doors, "
                         "a carved wooden chair and a small side table, potted palms, a green garden beyond the arches, no readable text, no logos, no people.",
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
