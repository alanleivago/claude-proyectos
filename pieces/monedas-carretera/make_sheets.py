"""Hojas de monedas-carretera PARTE 1 (La Gasolinera, MAJESTIC) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Historia propia tipo capos (premisa 7 de fuentes/atrium-vista/resumen.md): el encargado tira las monedas de un anciano y atrás vienen siete camionetas que son suyas.
# Solo Amador lleva barba blanca y sombrero claro; solo Benigno sombrero negro y bigote; Kevin de rojo y Memo de azul marino. Nadie con lentes; sin gafetes, logos ni letras en la ropa.
CHARS = {
 "AMADOR_QUINTANAR": "Mexican man, tan weathered skin, a powerful old rancher, 72 years old, serene dignified face, short neat white beard, cream straw cowboy hat, no glasses, "
                     "plain white long-sleeved shirt under a brown leather vest, jeans, brown leather boots, holding one small worn brown leather coin purse.",
 "KEVIN_BARRON": "Mexican man, light brown skin, the arrogant manager of a roadside gas station, 29 years old, cocky face, gelled spiky black hair, clean-shaven, no hat, no glasses, "
                 "plain red work polo shirt with no logo and no name tag, black trousers, black work shoes.",
 "MEMO_RANGEL": "Mexican man, brown skin, a gas station attendant, 23 years old, clearly an adult, kind shy face, short curly brown hair, clean-shaven, no hat, no glasses, "
                "plain navy blue work shirt with no logo and no name tag, sleeves rolled up, grey trousers, black work shoes.",
 "BENIGNO_ARTEAGA": "Mexican man, dark tan skin, the old rancher's foreman, 52 years old, serious calm face, thick black mustache, black felt cowboy hat, no glasses, "
                    "black denim jacket over a plain grey shirt, one black handheld radio clipped to his chest, jeans, black boots.",
}
# Lección intercambio: Omni copia cada detalle de la hoja de locación en todos los planos -> hojas SIMPLES, sin marcas, precios, números ni letreros.
LOCS = {
 "LOC_GASCARRETERA": "Small roadside gas station on a desert highway in Mexico in the golden afternoon, two plain grey fuel pumps under a plain white canopy, grey concrete ground, "
                     "dry hills far behind, warm golden light, no cars, no logos, no brand colors, no price signs, no numbers, no readable text, no people.",
 "LOC_TRAMODESIERTO": "Empty two-lane desert highway in northern Mexico in the golden afternoon seen from above, dry hills and scrub on both sides, a small roadside gas station "
                      "with a plain white canopy far ahead, long shadows, no cars, no signs, no readable text, no people.",
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
