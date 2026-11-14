"""Hojas de pedida-mano PARTE 1 (La Pedida de Mano, video 24, MAJESTIC) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia ORIGINAL (no navideña): pedida de mano en un restaurante estilo hacienda. NADIE con sombrero ni lentes; sin uniformes, sin gafetes ni letras.
# Todo pasa el mismo día: cada personaje lleva una sola ropa en toda la pieza.
CHARS = {
 "ISABELA_VALDIVIA": "Mexican woman, light skin, the proud bride-to-be from a well-off family, 30 years old, beautiful proud face with natural features, "
                     "long wavy dark brown hair worn loose over her shoulders, no hat, no glasses, fitted red knee-length cocktail dress with thin straps, "
                     "small gold hoop earrings, nude heeled shoes.",
 "BEATRIZ_VALDIVIA": "Mexican woman, light skin, the elegant stern mother of the bride, 58 years old, elegant stern face with soft lines, short smooth ash-blonde bob haircut, "
                     "no hat, no glasses, emerald green dress with a matching short jacket, one thin gold necklace, black low heeled shoes.",
 "LORENZO_CARRASCO": "Mexican man, brown skin, a humble tire repairman and the father of the groom, 62 years old, kind weathered face, short grey hair, thick grey moustache, "
                     "no beard, no hat, no glasses, clean white guayabera shirt with short sleeves, dark brown trousers, brown leather shoes.",
 "ESTEBAN_CARRASCO": "Mexican man, brown skin, the groom, 32 years old, friendly honest face, short black hair, short neat black beard, no hat, no glasses, "
                     "navy blue suit jacket and trousers, white shirt with an open collar, no tie, black shoes.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, nada religioso, sin adornos, sin letreros, sin utilería suelta.
LOCS = {
 "LOC_PORTONPEDIDA": "Cobblestone parking lot in front of a hacienda-style restaurant at midday, a plain pale cantera stone wall with one tall arched dark wooden gate, "
                     "one old faded green pickup truck parked near the wall with a flat front tire, soft natural daylight, no other cars, no plants in pots, "
                     "no decorations, no readable text, no signs, no license plate letters, no people.",
 "LOC_COMEDORPEDIDA": "Private dining room of a hacienda-style restaurant in the afternoon, pale cantera stone walls, one long table with a plain white tablecloth, "
                      "simple white plates and glasses, dark wooden chairs, one arched wooden doorway, warm soft window light, no flowers, no centerpiece, "
                      "no paintings, no decorations, no readable text, no signs, no people.",
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
