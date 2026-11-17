"""Hojas de queso-tequisquiapan PARTE 1 (El Queso de Tequisquiapan, MEXI STORIES) con el Flow MCP (CLI): personajes y locación nuevos.
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
# queso-tequisquiapan (MEXI): quesería artesanal bajo los portales de Tequisquiapan, Querétaro. Caras comunes, no famosas; los cuatro se distinguen a simple vista.
FACE = 'ordinary non-famous face, not resembling any actor or celebrity, '
CHARS = {
 'PETRA_OLVERA': FACE + 'Mexican woman from Querétaro, cheesemaker, 72 years old, small, brown skin, white hair in a long braid, small gold earrings, a light-blue checkered apron over a dark-green long-sleeve dress, flat black shoes, her hands empty.',
 'NICANOR_OLVERA': FACE + 'Mexican man from Querétaro, 45 years old, stocky, brown skin, short black hair, a round gentle face, a plain white t-shirt, a white rubber work apron, white rubber boots, his hands empty.',
 'VANESA_UGALDE': FACE + 'Glamorous Mexican woman, 38 years old, light skin, long straight black hair, red lipstick, big sunglasses pushed up on her head, a fuchsia silk blouse, white jeans, gold sandals, holding a smartphone.',
 'FULGENCIO_ARVIZU': FACE + 'Mexican rancher boss from Querétaro, 72 years old, tall, light-brown skin, white hair, a short white beard, a grey felt cowboy hat, a tan suede jacket over a white shirt, a silver belt buckle, dark jeans, brown boots, holding dark sunglasses.',
}
LOCS = {
 'LOC_QUESERIA': 'Small artisan cheese shop under a stone arcade in Tequisquiapan, Querétaro, in the morning: a wooden counter with rounds of fresh white cheese, metal milk cans, a big steel vat with curd, cheesecloths hanging to dry, a cobblestone square with pink bougainvillea and a parish church tower in the distance, soft morning light, no readable text, no signs, no logos, no people.',
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("queso-tequisquiapan*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
