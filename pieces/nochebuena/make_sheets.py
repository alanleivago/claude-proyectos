"""Hojas de nochebuena PARTE 1 (La Cena de Nochebuena, historia original) con el Flow MCP (CLI): 4 personajes + 3 locaciones, todos con nombre nuevo (no existen en otras piezas).
Mestizos mexicanos con el atuendo descrito; nadie con sombrero. Utilería (olla de ponche, jarrito, canasta, piñata, nacimiento) solo en texto, una de cada.
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
 "HERMINIA": "Mexican mestizo woman, brown skin, a humble hardworking cook, 64 years old, kind dignified face, black hair with grey streaks in a low braid, "
             "small silver earrings, simple navy-blue long-sleeve cotton dress below the knee, a wine-red woven rebozo shawl over her shoulders, black flat shoes.",
 "GERARDO": "Mexican mestizo man, brown skin, a successful city professional, 38 years old, handsome proud face, short neatly combed black hair, clean-shaven, "
            "no hat, charcoal grey tailored blazer over a white open-collar shirt, no tie, black trousers, a silver wristwatch, black leather shoes.",
 "REGINA": "Mexican mestizo woman, light brown skin, an elegant wealthy fiancée, 32 years old, pretty haughty face, long wavy light-brown hair, red lipstick, "
           "gold hoop earrings, emerald satin long-sleeve knee-length dress, nude high heels.",
 "IGNACIO": "Mexican mestizo man, light brown skin, a wealthy hacienda gentleman, 66 years old, calm kind face, short grey hair, clean-shaven, round wire glasses, "
            "no hat, dark brown corduroy jacket over a cream turtleneck sweater, brown trousers, brown leather shoes.",
}
LOCS = {
 "LOC_PATIOPINATA": "Night courtyard entrance of an old Mexican hacienda on Christmas Eve: an arched stone portal, strings of warm multicolor Christmas lights "
                    "along the arches, paper lanterns, red poinsettias in clay pots, a carved wooden door, one single colorful seven-pointed star piñata "
                    "hanging high from a beam, warm festive light.",
 "LOC_COMEDORLUCES": "Elegant dining room of an old Mexican hacienda on Christmas Eve: thick white walls with dark wooden beams, a long wooden table with a white "
                     "tablecloth, candles and clay cups, carved wooden chairs, warm string lights, red poinsettias, one single nativity scene of small painted "
                     "clay figures on green moss and hay in the corner, warm golden light.",
 "LOC_COCINAPONCHE": "Traditional Mexican hacienda kitchen at night: blue and white talavera tiles, a brick wood stove with one single large clay pot of steaming "
                     "ponche with guava and cinnamon sticks, one single plate of golden buñuelos on a wooden table, hanging clay pots, strings of dried chiles, "
                     "an open wooden doorway, warm amber light.",
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
