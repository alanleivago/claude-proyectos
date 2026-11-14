"""Hojas de gardenia PARTE 1 (La Boda de las Gardenias, video 23, VISTA) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia ORIGINAL (no navideña): boda humilde en una vecindad y la puerta de un salón de fiestas. NADIE con sombrero, velo ni lentes; sin uniformes,
# sin gafetes ni letras. Todo pasa el mismo día: cada personaje lleva una sola ropa en toda la pieza.
CHARS = {
 "ROSAURA_ALCANTARA": "Mexican mestizo woman, brown skin, a humble florist on her wedding day, 32 years old, sweet honest face with natural features, "
                      "black hair in one low bun tied with a thin white ribbon, no hat, no veil, no glasses, simple long white cotton wedding dress with short sleeves "
                      "and a plain round neckline, hand-sewn, white flat shoes, small silver stud earrings.",
 "LETICIA_ALCANTARA": "Mexican woman, light brown skin, the wealthy proud elder sister, 38 years old, elegant proud face, sleek straight black hair in a high polished ponytail, "
                      "no hat, no glasses, long fitted royal blue satin evening dress with long sleeves, one pearl necklace, small pearl earrings, black heeled shoes.",
 "ABEL_SANDOVAL": "Mexican man, brown skin, the groom, 35 years old, handsome friendly face, short wavy black hair, completely clean-shaven with no beard and no moustache, "
                  "no hat, no glasses, dark grey suit jacket and trousers, white shirt, thin dark grey tie, black shoes.",
 "CHONA_BECERRA": "Mexican woman, brown skin, a kind neighbor, 70 years old, kind round face with soft lines, short curly grey hair, no hat, no glasses, "
                  "maroon knit cardigan over a navy blue floral dress, small gold earrings, black flat shoes.",
 "GILBERTO_ARRIAGA": "Mexican man, light brown skin, a distinguished widower, 66 years old, calm dignified face, thick white hair combed back, short neat white moustache, "
                     "no beard, no hat, no glasses, long camel brown wool overcoat over a white shirt, no tie, dark trousers, brown shoes, one thin gold wedding ring.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, nada religioso, sin adornos, sin letreros, sin utilería suelta.
LOCS = {
 "LOC_PATIOALCANTARA": "Courtyard of a humble Mexican vecindad in soft afternoon daylight, cement floor, faded turquoise and ochre walls, two cement washing sinks along the back wall, "
                       "a green wooden door on the left, an open iron gate to the street on the right, a few potted red geraniums, one plain empty wooden table in the middle, "
                       "nothing on the table, no clothes lines, no decorations, no readable text, no signs, no people.",
 "LOC_PUERTAGARDENIAS": "Entrance of an elegant colonial event hall at night seen from the sidewalk, a tall dark carved wooden double door closed in a pale cantera stone frame, "
                        "two iron wall lanterns glowing on each side, a plain stone wall, an empty cobblestone sidewalk, no decorations, no flowers, no readable text, "
                        "no signs and no letters above the door, no people.",
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
