"""Hojas de camionero PARTE 2 con el Flow MCP (CLI). Personajes y locaciones de la Parte 1 (chars/ copiado sin chars/mal/, que tiene hojas equivocadas;
md5 distintos) + UNA hoja nueva: IVAN_SOBRINO (el sobrino de Leonor). Clemente no sale en la Parte 2.
Con --reupload vuelve a subir al proyecto Flow activo (state.json -> projectId) las hojas de la Parte 1 que usa la Parte 2.
Control de imagen vieja: Flow a veces devuelve una imagen de otra pieza. Cada hoja NUEVA se compara por md5 con todas las pieces/*/chars/**/*.jpg;
si coincide imprime "DUPLICADO <nombre>", la deja en chars/dup/ y NO la sube. Con --reupload también se revisan las hojas reusadas contra las otras piezas.
Uso: python -I make_sheets.py [--reupload]   -> imprime "FIN HOJAS P2" al terminar."""
import hashlib, re, subprocess, sys, os
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
D = Path(__file__).resolve().parent; OUT = D / "chars"; OUT.mkdir(exist_ok=True); PIECES = D.parent
SHEET = ("Character turnaround reference sheet of one person, four views side by side on plain white background: front view, three-quarter view, "
         "side profile, back view, full body, same scale, all views fully consistent, plus one large close-up portrait of the face on the left. {d} "
         "Photorealistic, cinematic film still quality, natural skin texture, even soft lighting, neutral expression, no text or labels")
LOC = "Empty location reference photo, no people. {d} Photorealistic cinematic film still, 85mm, no text"
# Iván: ropa de oficina sin saco, sin corbata y sin gafete (distinto de Clemente: camisa marino + corbata verde; de Fidel: barba y sudadera guinda)
CHARS = {
 "IVAN_SOBRINO": "Mexican mestizo man, light brown skin, office manager and nephew of the company director, 34 years old, handsome confident face, "
                 "short black hair neatly combed to the side, clean-shaven with no moustache and no beard, light sky blue long-sleeve dress shirt with no tie and no jacket, "
                 "charcoal grey trousers, brown leather belt, silver wristwatch, brown leather shoes, no ID card and no lanyard.",
}
LOCS = {}
REUSE = ["TEOFILO_TRAILERO", "LEONOR_DIRECTORA", "NAYELI_MONITOREO", "LALO_CHALECO", "FIDEL_CARGADOR", "LOC_ANDENCARGA", "LOC_SALAMONITORES"]
md5 = lambda p: hashlib.md5(p.read_bytes()).hexdigest()

# Nombre nuevo = único: no puede coincidir ni ser subcadena (en ningún sentido) de un asset creado por otra pieza (claves de CHARS/LOCS/PROPS)
taken = {n for p in PIECES.glob("*/make_sheets.py") if p.parent.name not in ("camionero-p2",)
         for n in re.findall(r'"([A-Z][A-Z0-9_]{2,})"\s*:', p.read_text(encoding="utf-8", errors="ignore"))}
for n in list(CHARS) + list(LOCS):
    clash = [t for t in taken if n in t or t in n]
    if clash: sys.exit(f"NOMBRE REPETIDO {n} = {clash}")

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
    for name in REUSE:
        f = OUT / f"{name}.jpg"
        if not f.exists(): print("FALTA", name, flush=True); continue
        d = dupes(f, skip=("camionero", "camionero-p2"))  # la copia de la Parte 1 es la misma imagen a propósito
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
print("FIN HOJAS P2", flush=True)
