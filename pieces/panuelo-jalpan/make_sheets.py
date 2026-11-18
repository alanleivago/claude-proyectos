"""Hojas de panuelo-jalpan PARTE 1 (El Pañuelo de Jalpan, VISTA STORIES) con el Flow MCP (CLI): personajes y locación nuevos.
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
# panuelo-jalpan (VISTA): época, finales del siglo XIX, patio de una hacienda en Jalpan, Querétaro. Vestuario de época civil (sin uniformes). Caras comunes, no famosas; los tres se distinguen a simple vista.
FACE = 'ordinary non-famous face, not resembling any actor or celebrity, '
CHARS = {
 'ANASTASIO_ECHEVERRIA': FACE + 'Mexican man, proud and feared hacienda owner in the 1890s, 60 years old, fair skin, grey hair combed back with pomade, thick grey sideburns and a grey mustache, hard grey eyes, a black 19th-century frock coat over a grey silk waistcoat and a white high-collar shirt with a black cravat, a gold watch chain on the waistcoat, his hands empty.',
 'MARIANA_ECHEVERRIA': FACE + "Mexican woman, the hacienda owner's daughter in the 1890s, 22 years old, fair skin, dark-brown hair in an elegant 19th-century updo with a few loose curls, large dark eyes, a pale-blue 19th-century high-necked long-sleeve dress with white lace at the collar and cuffs, small pearl earrings, her hands empty.",
 'MATIAS_ROBLEDO': FACE + 'Mexican mestizo man, the hacienda administrator in the 1890s, 30 years old, warm brown skin, short black hair, a neat black mustache, honest dark eyes, a simple brown wool 19th-century jacket over a white cotton shirt without collar, a brown waistcoat, dark trousers, a wide-brimmed palm hat in his hand, his hands otherwise empty.',
}
LOCS = {
 'LOC_HACIENDAJALPAN': 'Inner courtyard of an old 19th-century hacienda in Jalpan, Sierra Gorda of Queretaro, in the soft late afternoon: ochre and white walls, a stone fountain in the center, arched corridors with heavy wooden doors, potted geraniums, green mountains of the Sierra Gorda beyond the roofs, no modern objects, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("panuelo-jalpan*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
