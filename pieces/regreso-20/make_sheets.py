"""Hojas de regreso-20 PARTE 1 (El Regreso) con el Flow MCP (CLI): 4 personajes + 2 locaciones, todos con nombre nuevo (no existen en otras piezas).
Atuendos = los de la referencia (7696394614240185623) con otros colores. Utilería (carpeta, maleta, retrato) solo en texto, una de cada.
Control de imagen vieja (bug Flow: a veces devuelve una imagen de otra pieza): cada hoja nueva se compara por md5 con todas las pieces/*/chars/**/*.jpg;
si coincide imprime "DUPLICADO <nombre>", la deja en chars/dup/ y NO la sube (borrarla de chars/dup/ y volver a correr).
Uso: python -I make_sheets.py   -> imprime "FIN HOJAS" al terminar."""
import hashlib, subprocess, sys, os
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
D = Path(__file__).resolve().parent; OUT = D / "chars"; OUT.mkdir(exist_ok=True); PIECES = D.parent
SHEET = ("Character turnaround reference sheet of one person, four views side by side on plain white background: front view, three-quarter view, "
         "side profile, back view, full body, same scale, all views fully consistent, plus one large close-up portrait of the face on the left. {d} "
         "Photorealistic, cinematic film still quality, natural skin texture, even soft lighting, neutral expression, no text or labels")
LOC = "Empty location reference photo, no people. {d} Photorealistic cinematic film still, 85mm, no text"
CHARS = {
 "CLEMENCIA": "Mexican mestizo woman, brown skin, a ranch matriarch, 68 years old, stern proud face, grey hair pulled back in a tight bun, small gold stud earrings, "
              "dark green knee-length dress with small white flowers, a pale grey apron with lace trim tied at the waist, brown flat shoes.",
 "LEONOR": "Mexican mestizo woman, brown skin, a hardworking ranch woman, 46 years old, kind tired face, dark brown hair in a low ponytail, no jewelry, "
           "dark teal short-sleeve cotton t-shirt, a beige cotton apron, dark grey long skirt, brown sandals.",
 "JOAQUIN": "Mexican mestizo man, brown skin, 44 years old, smug face, short black hair, thick black moustache, no beard, no hat, "
            "red and brown plaid long-sleeve shirt tucked in, blue jeans, brown leather belt with a plain buckle, brown boots.",
 "BERNARDO": "Mexican mestizo man, light brown skin, a wealthy rancher, 62 years old, calm kind face, grey hair combed back, neat grey moustache, no beard, no hat, "
             "light beige long-sleeve guayabera shirt, tan trousers, brown leather shoes.",
}
LOCS = {
 "LOC_ADOBE": "Rustic Mexican ranch kitchen and dining room, warm adobe walls, a long dark wooden table with wooden chairs, a wood stove, shelves with clay pots "
              "and small saint figures, one single framed old sepia portrait photo of a moustached man in a white shirt hanging on the wall, an open wooden door "
              "and a window with golden natural light.",
 "LOC_TEJABAN": "Shaded front porch of an old Mexican ranch house, thick wooden posts, a red clay tile roof, a terracotta floor, a wooden bench, "
                "a weathered wooden fence, green trees and a dirt path leading away, warm late afternoon light.",
}
md5 = lambda p: hashlib.md5(p.read_bytes()).hexdigest()

def dupes(f):
    """Rutas de otras hojas (pieces/*/chars/**/*.jpg) con el mismo md5 que f."""
    h = md5(f)
    return [p for p in PIECES.glob("*/chars/**/*.jpg") if p.resolve() != f.resolve() and md5(p) == h]

def run(args):
    try:
        r = subprocess.run(["node", "src/cli.js", *args], cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        print("TIMEOUT", args[:2], flush=True); return ""
    print(r.stdout.strip()[-300:], r.stderr.strip()[-300:], flush=True); return r.stdout

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
