"""Hojas de cantera-huichapan-p2 PARTE 2 (La Cantera de Huichapan, MAJESTIC STORIES): las 3 hojas de personaje + LOC_CANTERAHUICH y LOC_CASETACANT de la Parte 1 (las vigentes),
copiadas de pieces/cantera-huichapan/chars (si falta alguna copia, se toma de ahí; nunca se regeneran: otra cara rompería la continuidad), y UNA hoja nueva: BONIFACIO_URIBE (el cantero mayor que cortaba sin lentes).
Lo normal: python -I make_sheets.py --reupload  -> sube las 5 copias al proyecto Flow activo y genera + sube solo BONIFACIO_URIBE.
OJO: al escribir esta P2 (2026-11-14) la Parte 1 todavía no tenía chars/: correr antes el make_sheets.py de la Parte 1; si falta una hoja, aquí imprime "FALTA" y no la inventa.
Las copias tienen el mismo md5 que las de cantera-huichapan: las carpetas cantera-huichapan* no cuentan como duplicado en --reupload.
Control de imagen vieja: Flow a veces devuelve una imagen de otra pieza (bug: varias hojas seguidas con el mismo md5). Cada hoja nueva se compara por md5
con todas las pieces/*/chars/**/*.jpg; si coincide imprime "DUPLICADO <nombre>", la deja en chars/dup/ y NO la sube.
Uso: python -I make_sheets.py [--reupload]   -> imprime "FIN HOJAS" al terminar."""
import hashlib, shutil, subprocess, sys, os
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
D = Path(__file__).resolve().parent; OUT = D / "chars"; OUT.mkdir(exist_ok=True); PIECES = D.parent
SHEET = ("Character turnaround reference sheet of one person, four views side by side on plain white background: front view, three-quarter view, "
         "side profile, back view, full body, same scale, all views fully consistent, plus one large close-up portrait of the face on the left. {d} "
         "Photorealistic, cinematic film still quality, natural skin texture, even soft lighting, neutral expression, no text or labels")
LOC = "Empty location reference photo, no people. {d} Photorealistic cinematic film still, 85mm, no text"
# Parte 2: en la caseta, Rosalba despide a Sotero (la libreta negra con el nombre de cada cantero que le pagó); devuelve en mano lo que cobró, delante de todos.
# Abdías queda de encargado del patio y reparte guantes y lentes; don Bonifacio, el cantero mayor que cortaba sin lentes, recibe los suyos. Misma ropa que en la Parte 1.
# Solo Bonifacio pelo blanco corto, barba blanca de días, sombrero de palma gastado y camisa azul cielo empolvada. Caras comunes, no famosas.
P1 = PIECES / "cantera-huichapan" / "chars"
REUSED = ["ROSALBA_MONROY", "ABDIAS_CARBAJAL", "SOTERO_VERASTEGUI", "LOC_CANTERAHUICH", "LOC_CASETACANT"]  # hojas de la Parte 1: se copian, nunca se generan
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "ROSALBA_MONROY": FACE + "Mexican woman from Hidalgo, owner of a stone quarry, 52 years old, light-brown skin, slim, medium height, short silver-grey bob haircut, small pearl earrings, no glasses, "
                   "a long camel-brown wool coat over a cream turtleneck sweater, dark grey trousers, brown ankle boots, her hands empty.",
 "ABDIAS_CARBAJAL": FACE + "Mexican man from Hidalgo, a stone carver, 31 years old, brown skin, lean, medium height, short black hair, a thin black mustache, no beard, no hat, no glasses, "
                    "a faded brick-red cotton work shirt with rolled sleeves covered in white stone dust, a grey bandana tied loosely around his neck, dark brown work trousers, dusty black work boots, his hands empty.",
 "SOTERO_VERASTEGUI": FACE + "Mexican man, a quarry yard supervisor, 56 years old, light skin, heavyset, completely bald head, a thick grey goatee, round wire-rimmed glasses, "
                      "a mustard-and-brown plaid flannel shirt under a plain dark-green quilted vest with no letters and no logos, khaki trousers, brown work boots, a yellow pencil behind his right ear, his hands empty.",
 "BONIFACIO_URIBE": FACE + "Mexican man from Hidalgo, an old stone carver, 64 years old, dark brown weathered skin, thin, medium height, short white hair, white stubble, no glasses, "
                    "a worn palm straw hat, a faded sky-blue long-sleeve work shirt covered in white stone dust, beige work trousers, old brown work boots, his hands empty.",
}
LOCS = {
 "LOC_CANTERAHUICH": "Open-air work yard of a pink cantera stone quarry near Huichapan, Hidalgo, in warm late-afternoon golden light: big rough blocks of pink and ochre cantera stone, "
                     "white stone dust on the ground, a heavy wooden carving table on the left with a half-carved stone block, an old wooden shed with a tin roof, "
                     "pale quarry walls cut in steps behind, dry hills with organ cactus on the horizon, no readable text, no signs, no logos, no people.",
 "LOC_CASETACANT": "Inside the small office cabin of a cantera stone quarry near Huichapan, Hidalgo, in warm afternoon light: wooden walls, an old wooden desk with papers, "
                   "a metal shelf with cardboard boxes of new tan leather work gloves and clear safety goggles, a big window looking down at the dusty quarry yard, no readable text, no signs, no logos, no people.",
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

for name in REUSED:  # copias de la Parte 1 (mismas caras y ropa)
    if not (OUT / f"{name}.jpg").exists():
        if (P1 / f"{name}.jpg").exists(): shutil.copy2(P1 / f"{name}.jpg", OUT / f"{name}.jpg"); print("COPIADO de la Parte 1", name, flush=True)
        else: print("FALTA", name, "en", P1, "-> correr antes make_sheets.py de la Parte 1", flush=True)
if "--reupload" in sys.argv:
    for name in list(CHARS) + list(LOCS):
        f = OUT / f"{name}.jpg"
        if not f.exists(): continue
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("cantera-huichapan*")))  # la copia de la Parte 1 es la misma imagen a propósito
        if d: print("DUPLICADO", name, "=", ", ".join(str(p) for p in d), "-> no se sube", flush=True); continue
        run(["upload", str(f), "--name", name]); print("SUBIDO", name, flush=True)
for name, d in list(CHARS.items()) + list(LOCS.items()):
    dst = OUT / f"{name}.jpg"
    if dst.exists() or name in REUSED: continue
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
