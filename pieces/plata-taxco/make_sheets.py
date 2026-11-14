"""Hojas de plata-taxco PARTE 1 (Los Faroles de Taxco, MEXI STORIES) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Remake transformado de "Lo corrieron por ayudar a un anciano…" (Atrium): Gumaro, joyero de la plaza, le tira las piezas de plata a Severiano, maestro platero de Taxco (Guerrero),
# y le da hasta que prendan los faroles para firmarle el local; llega don Anastasio, el dueño de la mina, con sus camionetas, y el plazo cambia de lado;
# el anillo que trae Gumaro es el de la difunta esposa de Anastasio, y se lo dio Leocadia, la nieta de Anastasio, que mira desde el balcón de la joyería.
# Solo Anastasio lleva sombrero (palma blanco, banda negra) y bigote blanco; solo Severiano lentes redondos y mandil de cuero; solo Gumaro pelo engominado, bigote delgado y camisa vino;
# solo Eufrosina paliacate rojo y mandil negro; solo Leocadia vestido verde esmeralda. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "SEVERIANO_OCAMPO": FACE + "Mexican man from Guerrero, brown skin, a master silversmith, 64 years old, medium height, thin and wiry, bald on top with short grey hair at the sides, "
                     "small round wire glasses, short grey stubble, no hat, a grey work shirt with rolled sleeves under a worn brown leather work apron, dark brown trousers, "
                     "old brown work shoes, his hands empty.",
 "GUMARO_LIZARDI": FACE + "Mexican man, light skin, a jewelry shop owner, 48 years old, short and stocky, thick black hair slicked back with gel, a thin pencil mustache, "
                   "clean-shaven chin, no hat, no glasses, a wine-red long-sleeve dress shirt, black trousers, black leather shoes, a thick gold wristwatch on his left wrist, his hands empty.",
 "EUFROSINA_BAHENA2": FACE + "Mexican woman from Guerrero, brown skin, a silversmith apprentice, 34 years old, medium height and slim, short wavy black hair tied back with a red bandana, "
                     "no glasses, an olive-green blouse under a black canvas work apron, dark jeans, black flat shoes, her hands empty.",
 "ANASTASIO_BERMEJO2": FACE + "Mexican man from Guerrero, tan weathered skin, the owner of an old silver mine, 72 years old, tall and broad-shouldered, short white hair, a thick white mustache, "
                      "a white palm straw sombrero with a black band, a tan suede jacket over a white shirt, dark jeans, brown leather boots, "
                      "one wide silver ring engraved with a small star on his right hand, his hands empty.",
 "LEOCADIA_BERMEJO2": FACE + "Mexican woman, light-brown skin, the granddaughter of a mine owner, 29 years old, slim, long straight black hair worn loose, small gold hoop earrings, "
                     "a sleeveless emerald-green dress, red nail polish, black heeled sandals, her hands empty.",
}
LOCS = {
 "LOC_TALLERPLATA": "Steep cobbled alley in Taxco, Guerrero, at blue-hour dusk: white houses with red clay tile roofs, on the left the open wooden door of a small silversmith workshop "
                    "with an old wooden workbench out front holding a black velvet tray, on the right across the alley a white house with a jewelry shop below and a wooden balcony "
                    "with wooden shutters above, wrought-iron street lamps on the walls (unlit), the pink stone twin towers of the Santa Prisca church at the top of the alley, "
                    "no readable text, no signs, no logos, no people.",
 "LOC_MINA2": "Old silver mine in the hills above Taxco, Guerrero, at dusk: the stone porch of a small mine office, a rusty iron mine headframe, a dusty yard with a few white pickup trucks "
             "with no logos, pine-covered hills, the white town of Taxco with red roofs far below, no readable text, no logos, no people.",
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
