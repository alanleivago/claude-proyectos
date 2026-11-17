"""Hojas de pulsera-mexcaltitan PARTE 1 (La Pulsera del Estero, MAJESTIC STORIES) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Versión nueva y muy transformada de "la patrona" (1.6M) de Atrium: en el muelle de Mexcaltitán (Nayarit), Arsenio (47), hijo de la patrona, le tira los tamales al agua a Maura (24)
# y le da hasta la lancha de las seis; su mujer Tamara (44) la quiere lejos; llega la patrona Eustolia (72), invierte el plazo y reconoce la pulsera que tejió para su hijo.
# Solo Eustolia pelo plateado en chongo con flor roja y vestido azul marino bordado; solo Arsenio barba negra corta y camisa de lino blanca; solo Tamara rubia platinada de vestido rosa mexicano;
# solo Maura pelo negro ondulado suelto, blusa turquesa y pulsera de chaquira. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "EUSTOLIA_LOMELI": FACE + "Mexican woman from Mexcaltitán, Nayarit, the matriarch who owns the fishing boats of the lagoon, 72 years old, dark-brown wrinkled skin, tall and upright, silver hair in a low bun with a red hibiscus flower behind her right ear, gold hoop earrings, "
                    "a navy-blue cotton dress with white embroidery at the neckline, brown leather sandals, her hands empty.",
 "ARSENIO_LOMELI": FACE + "Mexican man from Mexcaltitán, Nayarit, 47 years old, brown skin, heavyset, short black hair, a short black beard, "
                   "a white linen shirt half unbuttoned, khaki trousers, brown leather sandals, a big gold ring on his right hand, his hands empty.",
 "TAMARA_LOMELI": FACE + "Mexican woman, 44 years old, light skin, platinum-blonde wavy hair to the shoulders, big sunglasses pushed up on her head, "
                  "a hot-pink sleeveless dress, gold bangles, white sandals, a woven palm fan in her right hand.",
 "MAURA_GRACIANO": FACE + "Mexican woman, 24 years old, adult, brown skin, slim, long wavy black hair worn loose, no makeup, "
                   "a faded turquoise cotton blouse, a long white skirt, brown sandals, a bracelet of tiny blue and yellow glass beads with a small white deer pattern on her left wrist.",
}
LOCS = {
 "LOC_MUELLEMEXCAL": "Old wooden dock of the small round island town of Mexcaltitán, Nayarit, at sunset: weathered wooden planks, colorful low houses with red tile roofs behind, "
                     "wooden canoes and white fiberglass boats tied along the dock, a palm-roof fonda at the land end of the dock, calm green-brown lagoon water and mangroves on the far shore under an orange sky, no readable text, no signs, no logos, no people.",
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
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("pulsera-mexcaltitan*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
