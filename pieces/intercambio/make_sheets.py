"""Hojas de intercambio PARTE 1 (La Virgen de los Villaseñor, video 22, MEXI) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
PROP = "{d} Photorealistic cinematic film still, 85mm, even soft light, no text"
# Historia ORIGINAL navideña (sin ref directa): casa de una familia acomodada mexicana en Nochebuena. NADIE con sombrero, gorro navideño ni lentes; sin uniformes,
# sin gafetes ni letras. La Virgen de madera va como hoja propia (PROP_VIRGENCASIMIRO) para que sea la misma en todos los planos. Sin niños: el nacimiento no lleva figura del niño.
CHARS = {
 "FABIOLA_OCHOA": "Mexican mestizo woman, brown skin, a seamstress married into a wealthy family, 34 years old, warm honest face with natural features, "
                  "long black hair in one single low braid over her shoulder, no hat, no glasses, simple wine-red knit sweater, long dark grey skirt, "
                  "black flat shoes, small gold hoop earrings.",
 "CONSTANZA_VILLASENOR": "Mexican woman, light brown skin, the proud elder daughter of a wealthy family, 46 years old, elegant proud face, sleek straight dark brown hair cut at the shoulders, "
                         "no hat, no glasses, long-sleeve emerald green velvet dress to the knee, one thin gold necklace, small gold drop earrings, black heeled shoes.",
 "GERMAN_ALTAMIRANO": "Mexican man, light brown skin, the elder daughter's husband, 50 years old, confident face, grey hair combed back, short neat grey beard, "
                      "no hat, no glasses, charcoal grey suit jacket over a black turtleneck sweater, charcoal trousers, black shoes.",
 "EMILIO_VILLASENOR": "Mexican mestizo man, brown skin, the younger son of a wealthy family, 37 years old, kind shy face, short black curly hair, "
                      "completely clean-shaven with no beard and no moustache, no hat, no glasses, dark brown corduroy jacket over a cream knit sweater, dark jeans, brown shoes.",
 "AURORA_VILLASENOR": "Mexican woman, light brown skin, the widowed matriarch of a wealthy family, 76 years old, gentle dignified face with soft lines, white hair in an elegant low bun, "
                      "no hat, no glasses, long-sleeve navy blue dress, one cream knitted shawl over her shoulders, one small gold brooch, black low-heeled shoes.",
}
# QA 2 intercambio: la hoja v1 de la sala salió con María y el Niño en el pesebre y Flow los copia en todos los planos -> establo descrito en positivo, sin "nativity"
LOCS = {
 "LOC_SALANAVIDAD2": "Spacious living room of a wealthy old Mexican house on Christmas Eve night, pale cantera stone arches, a tall Christmas tree with warm white lights and red and gold ornaments, "
                       "red poinsettia plants, one carved wooden armchair in the center, a carved dark wooden side table with one small rustic wooden shed with a pitched roof, and inside it "
                       "exactly three carved wooden figures standing in one straight row: a standing bearded man in a brown robe holding a staff, an ox and a donkey, the shed floor flat bare wood "
                       "and completely empty, an open doorway to a courtyard on the left, warm lamp light, no readable text, no people.",
 "LOC_PATIOVILLASENOR": "Inner courtyard of an old Mexican house on Christmas Eve night, terracotta tiled floor, ochre walls with stone arches, a small stone fountain, "
                        "paper bag lanterns with candles glowing along a low wall, potted red poinsettias, no readable text, no people.",
 "PROP_VIRGENCASIMIRO": "Reference photo of one single hand-carved wooden figure of the Virgin Mary, about 30 cm tall, standing with her hands joined, her cloak painted pale sky blue "
                        "with faded gold trim, thin glued repaired cracks visible across the old wood, a plain round wooden base, on a dark wooden table, no other figures, no people.",
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
    prompt = (SHEET if name in CHARS else PROP if name.startswith("PROP_") else LOC).format(d=d)
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
