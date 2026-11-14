"""Hojas de velorio-patron PARTE 1 (El Velorio del Patrón, MAJESTIC) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia tipo capos (premisa 3 de fuentes/atrium-vista/resumen.md): en el velorio de don Eleuterio los hijos corren a la cocinera y el anillo del patrón,
# al que obedece la escolta, es para ella. Caras: "ordinary non-famous face" + rasgos concretos (que no salga parecido a un actor real).
# Solo Leonel lleva lentes y bigote; solo Nazario barba; solo Ivonne perlas y pelo caoba; solo Nati mandil y trenza; solo Efrén calvo y de traje café.
# Sin uniformes, gafetes ni letras en la ropa. Una sola ropa por personaje. El patrón difunto no tiene hoja (caja cerrada, sin foto).
CHARS = {
 "NATI_CERVERA": "Mexican woman, brown skin, the cook of an old hacienda, 25 years old, clearly an adult, round face with full cheeks, dark eyes, wide flat nose, "
                 "a small mole above the right corner of her lip, thick black hair in one long braid over her left shoulder, small silver stud earrings, "
                 "ordinary non-famous face, no hat, no glasses, plain navy blue short-sleeved cotton dress under a white apron, black flat shoes.",
 "LEONEL_GARIBAY": "Mexican man, light olive skin, the patron's eldest son, 46 years old, long narrow face with hollow cheeks and a pointed chin, receding hairline, "
                   "short dark brown hair combed back and greying at the temples, thin black mustache, clean-shaven chin, thin gold-rimmed rectangular glasses, "
                   "ordinary non-famous face, no hat, black suit, white shirt, thin black tie, black leather shoes.",
 "IVONNE_GARIBAY": "Mexican woman, fair skin, the patron's daughter, 42 years old, oval face with a sharp chin, thin arched eyebrows, narrow nose, dark red lipstick, "
                   "shoulder-length dyed auburn hair pulled into a low tight bun, small pearl earrings and one single-strand pearl necklace, "
                   "ordinary non-famous face, no hat, no glasses, black long-sleeved knee-length dress, black low heels.",
 "EFREN_SOTOMAYOR": "Mexican man, light brown skin, the family lawyer and accountant, 63 years old, round face with heavy jowls and a double chin, bald on top with a short grey fringe "
                    "on the sides, bushy grey eyebrows, small brown eyes, clean-shaven, ordinary non-famous face, no hat, no glasses, dark brown suit, white shirt, brown tie, "
                    "one brown leather folder under his arm, brown shoes.",
 "NAZARIO_QUEZADA": "Mexican man, dark brown skin, head of the patron's security, 56 years old, square weathered face, deep-set dark eyes, broad nose, grey crew cut, "
                    "short full white beard, broad shoulders, ordinary non-famous face, no hat, no glasses, black suit with a black shirt buttoned to the collar and no tie, "
                    "black boots, hands crossed in front of him.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, sin letreros, marcas ni adornos.
LOCS = {
 "LOC_PATIOVELORIO": "Inner courtyard of an old Mexican hacienda at late afternoon, prepared for a wake: worn stone floor, ochre walls with stone arches, "
                     "one closed dark wood coffin on a simple stand covered with white flowers, four tall lit candles, rows of plain wooden chairs, "
                     "an open kitchen door on one side, warm golden light, no photos, no crosses with letters, no readable text, no signs, no logos, no people.",
 "LOC_COCINAGARIBAY": "Big rustic kitchen of an old Mexican hacienda at late afternoon: ochre walls, a wood-fired stove with brown clay pots, one long plain wooden table, "
                      "one window with warm golden light, no calendar, no decorations, no readable text, no signs, no logos, no people.",
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
