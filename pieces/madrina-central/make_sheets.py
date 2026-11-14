"""Hojas de madrina-central PARTE 1 (La Madrina de la Central, SINMARCA) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia tipo capos (premisa 6 de fuentes/atrium-vista/resumen.md): el agiotista le quita el tráiler a Rubén y doña Eva, su madrina, cierra la Central.
# Solo Eva es mujer (chongo negro, aretes de oro); solo Porfirio gorra y bigote gris; solo Gaspar cabeza rapada y cadena de oro; solo Rubén barba y mezclilla. Nadie con lentes. Una sola ropa por personaje.
CHARS = {
 "EVA_SALDIVAR": "Mexican woman, light brown skin, the powerful matriarch of a wholesale produce market, 70 years old, strong square face with fine lines, "
                 "dyed jet-black hair pulled back in a neat high bun, big gold hoop earrings, dark red lipstick, no hat, no glasses, black cardigan over a wine-red blouse, "
                 "several thin gold bracelets on her left wrist, black skirt below the knee, black low-heeled shoes.",
 "RUBEN_GALINDO": "Mexican man, brown skin, a truck driver, 30 years old, clearly an adult, tired kind face, short black hair, short black beard, no hat, no glasses, "
                  "faded blue denim shirt over a plain white t-shirt, dark jeans, brown work boots.",
 "GASPAR_LEYVA": "Mexican man, light skin, a moneylender, 45 years old, smug narrow face, shaved head, thin black goatee, no hat, no glasses, "
                 "cream western shirt with black embroidery on the chest, one thick gold chain on his neck, one gold wristwatch, dark jeans, pointed brown boots.",
 "PORFIRIO_TAPIA": "Mexican man, dark tan skin, foreman of the market porters, 56 years old, serious calm face, thick grey mustache, a black flat cap, no glasses, "
                   "navy blue work jacket over a grey shirt, one black handheld radio clipped to his chest, grey work trousers, black boots.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, sin letreros, marcas, precios ni números.
LOCS = {
 "LOC_PATIOCENTRAL": "Loading yard of a big wholesale produce market in Mexico in the late afternoon, grey concrete ground, stacked wooden crates of tomatoes and oranges, "
                     "huge grey metal roll-up doors, a few parked trucks far behind, warm golden light, no readable text, no signs, no logos, no prices, no license plates, no people.",
 "LOC_BODEGAEVA": "Inside a produce warehouse of a wholesale market in Mexico, stacked wooden crates of oranges and tomatoes, one plain old wooden desk, one bare light bulb hanging, "
                  "an open metal roll-up door in the back, warm light, no readable text, no signs, no logos, no prices, no calendar, no people.",
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
