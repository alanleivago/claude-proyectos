"""Hojas de mariachi-patron PARTE 1 (El Mariachi del Patrón, VISTA) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia tipo capos (premisa 8 de fuentes/atrium-vista/resumen.md): el ganadero corre sin pagarle al mariachi viejo; a medianoche llega don Rosendo.
# Solo Rosendo lleva sombrero puesto; solo Maclovio lentes; solo Higinio traje de charro; solo Eulogio cabeza rapada y barba; solo Gildardo chaleco de cuero crema. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "HIGINIO_LUMBRERAS": FACE + "Mexican man, brown skin, an old mariachi guitarist, 74 years old, thin long face with deep wrinkles, slightly crooked nose, thick white mustache, "
                      "white hair combed back, no hat, no glasses, worn black charro suit with small silver buttons and a red bow tie, black boots.",
 "MACLOVIO_ZAVALETA": FACE + "Mexican man, light brown skin, a violinist, 24 years old, clearly an adult, slim oval face, short straight black hair with a side part, clean-shaven, "
                      "thin wire-rimmed glasses, no hat, plain white long-sleeved shirt, black trousers, black shoes.",
 "GILDARDO_MONTEMAYOR": FACE + "Mexican man, light tan skin, a rich cattle rancher, 56 years old, heavy square face, double chin, slicked-back black hair, thick black horseshoe mustache, "
                        "no hat, no glasses, white embroidered western shirt under a cream leather vest, a gold watch, dark jeans, brown boots.",
 "EULOGIO_MANCERA": FACE + "Mexican man, tan skin, the rancher's right-hand man, 40 years old, broad face, shaved head, short black beard, no hat, no glasses, "
                    "grey western shirt under a black leather jacket, black jeans, black boots.",
 "ROSENDO_CABANAS": FACE + "Mexican man, tan weathered skin, a powerful old rancher, 77 years old, long serene face with deep wrinkles, short white beard, white hair, "
                    "a black felt cowboy hat, no glasses, dark grey suit over a black shirt with no tie, a heavy silver ring on his right hand, black boots.",
}
LOCS = {
 "LOC_PATIOGANADERO": "Stone patio of a rich cattle hacienda in Los Altos de Jalisco at night during a party, stone arches, warm string lights overhead, long empty tables with white "
                      "tablecloths, a small wooden stage at one side, warm night light, no cars, no decorations, no readable text, no signs, no logos, no people.",
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
        d = dupes(f, skip=("viuda-aguacate-p2", "mariachi-patron-p2"))  # la copia de la Parte 2 es la misma imagen a propósito
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
