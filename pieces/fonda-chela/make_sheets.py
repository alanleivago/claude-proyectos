"""Hojas de fonda-chela PARTE 1 (El Jefe Nuevo, VISTA) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia tipo capos (premisa 1 de fuentes/atrium-vista/resumen.md): el jefe nuevo le cobra a doña Chela y el viejo de la mesa del fondo es quien le dio el pueblo.
# Solo Macario lleva sombrero y bigote; solo Saúl barba; solo Rolando (el Güero) es rubio. Nadie con lentes; sin uniformes, gafetes ni letras en la ropa. Una sola ropa por personaje.
CHARS = {
 "CHELA_VILLEGAS": "Mexican woman, brown skin, owner and cook of a small town fonda, 66 years old, round calm face with kind deep lines, grey hair in a low bun, small gold earrings, "
                   "no hat, no glasses, lilac cotton blouse under a plain white apron, dark grey skirt below the knee, black flat shoes.",
 "TAVO_VILLEGAS2": "Mexican man, light brown skin, Chela's nephew and waiter, 24 years old, clearly an adult, thin nervous face, short black hair, clean-shaven, no hat, no glasses, "
                  "plain white short-sleeved shirt, a small black waiter's apron at the waist, black trousers, black shoes.",
 "SAUL_BETANCOURT2": "Mexican man, fair skin, a newcomer boss, 40 years old, cocky sharp face, slicked-back black hair, short trimmed black beard, no hat, no glasses, "
                    "charcoal grey suit with an open-collar black shirt, no tie, one silver wristwatch, black leather shoes.",
 "ROLANDO_GUERO2": "Mexican man from Sinaloa, light brown skin, Saul's right-hand man, 35 years old, wide round face with strong cheekbones, thick dark eyebrows, dark brown eyes, bleached blond buzz cut with dark roots, thin dark goatee, small scar on the left eyebrow, ordinary non-famous face, no hat, no glasses, black leather jacket over a black t-shirt, dark jeans, black boots.",
 "MACARIO_LEDESMA2": "Mexican man, tan weathered skin, a powerful old rancher, 74 years old, serene stern face, thick white mustache, grey felt cowboy hat, no glasses, "
                    "cream guayabera shirt, one heavy gold ring with a flat black stone on his right hand, beige trousers, brown leather boots.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, sin letreros, menús, marcas ni adornos.
LOCS = {
 "LOC_FONDACHELA": "Inside a small humble fonda in a Mexican town in the morning, plain whitewashed walls, one simple wooden counter with one big brown clay pot on it, "
                   "a few plain wooden tables and chairs, one plain wooden table at the back, one open door to a sunny dusty street, warm golden morning light, "
                   "no menu boards, no calendar, no decorations, no readable text, no signs, no logos, no people.",
 "LOC_CALLEFONDA": "Dusty street of a small Mexican town in the morning, plain adobe houses painted in faded colors, the open door of a small fonda, warm golden morning light, "
                   "dust in the air, no cars, no decorations, no readable text, no signs, no logos, no people.",
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
        d = dupes(f, skip=("fonda-chela-p2",))  # la copia de la Parte 2 es la misma imagen a propósito
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
