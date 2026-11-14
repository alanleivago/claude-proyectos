"""Hojas de fierro-herradura PARTE 1 (El Fierro de Herradura, video 20) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia ORIGINAL (sin ref directa): vestuario de feria ganadera mexicana, propio. Un solo sombrero puesto por personaje (Cristóbal y Eloísa sin sombrero),
# sin gafetes ni letras; el juez de guayabera civil (nada de uniforme). Lucero va como hoja propia (PROP_TOROLUCERO) para que sea el mismo toro en todos los planos.
CHARS = {
 "JACINTA_CORRAL": "Mexican mestizo woman, brown skin, small-ranch cattle breeder, 36 years old, strong dignified face with natural features, one long black braid over her shoulder, "
                   "one single tan straw cowboy hat with a brown leather band and no logo, burgundy western shirt with pearl snaps and rolled sleeves, dark blue jeans, "
                   "brown leather belt with a plain silver buckle, brown cowboy boots, small gold stud earrings.",
 "FULGENCIO_ARREDONDO": "Mexican mestizo man, brown skin, powerful rich rancher, 62 years old, heavyset, proud face, thick grey moustache and no beard, "
                        "one single cream felt cowboy hat with no logo, chocolate-brown western suit jacket over a white shirt, black bolo tie with a plain silver tip, "
                        "one gold ring, dark grey trousers, polished black cowboy boots.",
 "CRISTOBAL_ARREDONDO": "Mexican mestizo man, brown skin, the rancher's son, 30 years old, honest uncertain face, short black hair, completely clean-shaven with no beard and no moustache, "
                        "no hat, sky-blue western shirt, dark jeans, brown belt with a plain buckle, brown cowboy boots.",
 "LEOCADIO_JUEZ": "Mexican mestizo man, brown weathered skin, veteran cattle fair judge, 70 years old, wise calm face with deep lines, white hair, neat white moustache and no beard, "
                  "one single light grey felt cowboy hat with no logo, white long-sleeve guayabera with no badge and no lettering, beige trousers, brown shoes.",
 "ELOISA_REGISTRO": "Mexican mestizo woman, light brown skin, secretary of the cattle breeders association, 45 years old, kind attentive face, black hair in a low ponytail, "
                    "no glasses, no hat, teal knit cardigan over a white blouse, black knee-length skirt, small silver hoop earrings, black flat shoes.",
}
LOCS = {
 "LOC_CORRALFERIA": "Wooden cattle pen at a Mexican regional cattle fair, rough wooden fence rails, straw on the dirt floor, other pens and a few trees in the soft background, "
                    "warm late afternoon sun, no signs, no banners, no logos, no animals.",
 "LOC_OFICINAASOC": "Small rustic office of a Mexican cattle breeders association, adobe walls, a heavy dark wooden desk with one closed old leather ledger on it, "
                    "wooden shelves with old leather ledgers, one desk lamp with warm light, no posters, no framed certificates, no readable text.",
 "LOC_PISTAFERIA": "Covered show ring of a Mexican regional cattle fair, raked sand floor, low white wooden railing, warm string lights hanging high above, "
                   "empty wooden bleachers behind, no signs, no banners, no logos, no animals.",
 "PROP_TOROLUCERO": "Reference photo of one single black bull, side view standing on straw in a wooden pen, glossy black coat, short curved horns, "
                    "a small white star on its forehead, one horseshoe-shaped brand mark on its left hip, a plain rope halter, calm, no people, no other animals.",
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
