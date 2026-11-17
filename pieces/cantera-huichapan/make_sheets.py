"""Hojas de cantera-huichapan PARTE 1 (La Cantera de Huichapan, MAJESTIC STORIES) con el Flow MCP (CLI): personajes y locaciones nuevos (nombres de asset únicos, ninguno existe en otra pieza).
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
# Remake transformado de "Le cobraba el equipo de seguridad a los obreros" (Atrium): Rosalba, dueña de una cantera de Huichapan (Hidalgo), ve a Abdías (31) labrando sin guantes;
# él le devuelve los guantes y lentes nuevos porque el supervisor Sotero se los cobró; Sotero miente, amenaza a Abdías y ella lo oye todo por el celular de Abdías en llamada.
# Solo Rosalba melena corta gris y abrigo camel; solo Abdías bigote delgado, camisa rojo ladrillo y paliacate gris; solo Sotero calvo con piocha gris, lentes redondos y chaleco verde liso. Caras comunes, no famosas.
FACE = "ordinary non-famous face, not resembling any actor or celebrity, "
CHARS = {
 "ROSALBA_MONROY": FACE + "Mexican woman from Hidalgo, owner of a stone quarry, 52 years old, light-brown skin, slim, medium height, short silver-grey bob haircut, small pearl earrings, no glasses, "
                   "a long camel-brown wool coat over a cream turtleneck sweater, dark grey trousers, brown ankle boots, her hands empty.",
 "ABDIAS_CARBAJAL": FACE + "Mexican man from Hidalgo, a stone carver, 31 years old, brown skin, lean, medium height, short black hair, a thin black mustache, no beard, no hat, no glasses, "
                    "a faded brick-red cotton work shirt with rolled sleeves covered in white stone dust, a grey bandana tied loosely around his neck, dark brown work trousers, dusty black work boots, his hands empty.",
 "SOTERO_VERASTEGUI": FACE + "Mexican man, a quarry yard supervisor, 56 years old, light skin, heavyset, completely bald head, a thick grey goatee, round wire-rimmed glasses, "
                      "a mustard-and-brown plaid flannel shirt under a plain dark-green quilted vest with no letters and no logos, khaki trousers, brown work boots, a yellow pencil behind his right ear, his hands empty.",
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

if "--reupload" in sys.argv:
    for name in list(CHARS) + list(LOCS):
        f = OUT / f"{name}.jpg"
        if not f.exists(): continue
        d = dupes(f, skip=tuple(p.name for p in PIECES.glob("cantera-huichapan*")))  # las copias de la Parte 2 son la misma imagen a propósito
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
