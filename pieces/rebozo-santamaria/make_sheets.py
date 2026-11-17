"""Hojas de rebozo-santamaria PARTE 1 (El Rebozo de Santa María, MEXI STORIES) con el Flow MCP (CLI): personajes y locación nuevos.
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
# rebozo-santamaria (MEXI): taller de rebozos de seda de Santa María del Río, SLP. Solo Baudelio bigote entrecano y chaleco negro; solo Yolanda rubia platinada de pelo corto
# y blusa fucsia; solo Florencia dos trenzas, blusa mostaza y mandil beige. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "BAUDELIO_TOVAR": FACE + 'Mexican man from Santa María del Río, San Luis Potosí, master rebozo weaver, 58 years old, medium build, light brown skin, wavy salt-and-pepper hair combed back, a thick salt-and-pepper mustache, a white long-sleeve cotton shirt, a black vest, grey trousers, black shoes, his hands empty.',
 "YOLANDA_ZAMARRIPA": FACE + 'Mexican woman, 46 years old, fair skin, a short platinum-blonde bob, big gold hoop earrings, long red nails, red lipstick, a fuchsia satin blouse, black leggings, leopard-print slippers, her hands empty, no shawl.',
 "FLORENCIA_TOVAR": FACE + 'Mexican woman from Santa María del Río, San Luis Potosí, 26 years old, brown skin, long black hair in two braids, no earrings, a plain mustard-yellow cotton blouse, a long brown skirt, a beige work apron, brown sandals, her hands empty.',
}
LOCS = {
 "LOC_REBOZOSLP": 'Courtyard workshop of an old pink-stone colonial house in Santa María del Río, San Luis Potosí, in the late afternoon: a stone arcade with arches, skeins of dyed silk thread in blue, red and purple hanging to dry on a line, a large wooden knotting frame with an unfinished silk rebozo and its long fringe stretched on it, a wicker armchair in the shade of the arcade, a big clay tub of indigo dye, potted red geraniums, golden light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("rebozo-santamaria*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
