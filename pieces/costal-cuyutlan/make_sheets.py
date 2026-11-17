"""Hojas de costal-cuyutlan PARTE 1 (La Sal de Cuyutlán, MEXI STORIES) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Versión nueva y muy transformada de "El Retén" (1.1M) de Atrium: en las salinas de Cuyutlán (Colima), Leónidas (52) atraviesa su camioneta en el bordo y le pide a Atanasio (69), salinero viejo,
# la mitad de los costales antes de la lluvia; Atanasio chifla, salen los salineros y el plazo se invierte; el que le vendió el bordo es Evelio (62), su hermano. Xóchitl (31) es la hija de Atanasio.
# Solo Atanasio pelo blanco rizado, camisa azul cielo y trapo blanco al cuello; solo Leónidas alto y pesado con bigote delgado, sombrero de paja crema y polo negra;
# solo Evelio bajito, calvo, lentes redondos y camisa guinda; solo Xóchitl pelo corto a la quijada, playera amarilla mostaza y overol. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "ATANASIO_VARELA": FACE + "Mexican man from Cuyutlán, Colima, an old salt worker, 69 years old, deeply tanned wrinkled skin, thin and wiry, short white curly hair, white stubble, "
                    "a faded sky-blue long-sleeve work shirt with the sleeves rolled to the elbows, white cotton trousers rolled to the shins, black rubber boots, a white cloth knotted around his neck, his hands empty.",
 "XOCHITL_VARELA": FACE + "Mexican woman from Cuyutlán, Colima, 31 years old, brown skin, sturdy, short black hair cut at the jaw, small silver stud earrings, "
                   "a mustard-yellow t-shirt, faded denim overalls, black rubber boots, her hands empty.",
 "LEONIDAS_PAZOS": FACE + "Mexican businessman, 52 years old, light skin, tall and heavy, slicked-back grey hair, a thin black pencil mustache, a cream straw fedora with a black band, "
                   "a black polo shirt tucked into beige trousers, a brown leather belt with a big oval silver buckle, shiny brown loafers, his hands empty.",
 "EVELIO_VARELA": FACE + "Mexican man from Cuyutlán, Colima, 62 years old, tanned skin, short and chubby, bald on top with grey hair on the sides, round wire glasses, "
                  "a burgundy short-sleeve button shirt, grey trousers, black shoes, his hands empty.",
}
LOCS = {
 "LOC_SALINASCUYUT": "Narrow dirt dike road between shallow rectangular salt evaporation pools in Cuyutlán, Colima, in the afternoon: white crusted salt pools, small white mounds of salt, "
                     "little wooden sheds with palm roofs, low sand dunes and the Pacific Ocean beyond, heavy dark grey storm clouds rolling in from the sea, no rain yet, no readable text, no signs, no logos, no people.",
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("costal-cuyutlan*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
