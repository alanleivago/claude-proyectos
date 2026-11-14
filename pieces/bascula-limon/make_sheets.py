"""Hojas de bascula-limon PARTE 1 (La Báscula Arreglada, SINMARCA) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia inspirada en la ref 7702205802534194435 (@relatos.de.vida.9): el acopiador que le roba kilos al limonero con la báscula arreglada.
# Solo Fermín lleva sombrero (de palma); nadie más con sombrero, gorra ni lentes; sin uniformes, sin gafetes ni letras en la ropa. Cada personaje lleva una sola ropa en toda la pieza.
CHARS = {
 "FERMIN_ZAVALA": "Mexican man, tan weathered skin, a lime farmer from Michoacan, 66 years old, deep wrinkles, white mustache, a worn palm leaf sombrero, no glasses, "
                  "light blue long-sleeve work shirt, jeans with a brown leather belt, worn brown work boots.",
 "DANIELA_ZAVALA": "Mexican woman, brown skin, Fermin's daughter and an accountant, 31 years old, clearly an adult, smart determined face, shoulder-length straight black hair, no hat, no glasses, "
                   "terracotta orange blouse, beige trousers, small silver earrings, brown flat shoes, holding one small brown notebook.",
 "BULMARO_PADILLA": "Mexican man, light brown skin, the town's lime buyer, 50 years old, heavy-set, smug round face, slicked-back black hair, thick black mustache, no hat, no glasses, "
                    "cream guayabera shirt, thin gold chain, dark trousers, polished brown shoes.",
 "CHALO_MORENO": "Mexican man, brown skin, a lime farmer, 63 years old, worried friendly face, bald head with short grey stubble, grey stubble beard, no hat, no glasses, "
                 "olive green work shirt, dusty jeans, worn work boots.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, sin letreros, números, marcas ni adornos.
LOCS = {
 "LOC_ACOPIOLIMON": "Lime collection shed of a farming town in Michoacan in the morning, concrete floor, corrugated metal roof, stacks of green plastic crates full of green limes, "
                    "one old grey mechanical platform scale with a metal beam and a sliding weight, no digital display, hot bright daylight from the open side, "
                    "no decorations, no readable text, no numbers, no signs, no logos, no people.",
 "LOC_HUERTALIMON": "Lime orchard in Michoacan in the late afternoon, rows of green lime trees, a few green plastic crates of limes under a tree, dry dirt ground, warm golden light, "
                    "no tractor, no decorations, no readable text, no signs, no logos, no people.",
 "LOC_PORCHEZAVALA": "Porch of a humble village house at night, a plain whitewashed wall, one wooden bench, a few green plastic crates of limes stacked by the wall, one bare warm bulb above, "
                     "warm bulb light with soft dark shadows, no decorations, no readable text, no signs, no logos, no people.",
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
