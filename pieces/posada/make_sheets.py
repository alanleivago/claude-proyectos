"""Hojas de posada PARTE 1 (La Posada del Mercado, historia original) con el Flow MCP (CLI): 4 personajes + 2 locaciones, todos con nombre nuevo (no existen en otras piezas).
Todos mestizos mexicanos, ropa descrita pieza por pieza, sin sombreros. Utilería (carpeta negra, jarrito, clavija, piñata) solo en texto, una de cada.
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
 "CATALINA": "Mexican mestizo woman, warm brown skin, a humble town market keeper, 70 years old, kind dignified face with soft wrinkles, long grey hair in a single braid over one shoulder, "
             "small silver earrings, a burgundy rebozo shawl with long fringes over a navy blue long-sleeve cotton dress, black flat shoes.",
 "NACHO_ARCOS": "Mexican mestizo man, brown skin, a humble carpenter, 74 years old, calm gentle face, short white hair, thick white moustache, no beard, no hat, "
            "brown wool cardigan over a cream button shirt, dark grey trousers, black leather shoes.",
 "BRUNO": "Mexican mestizo man, light brown skin, a wealthy businessman, 45 years old, sharp arrogant face, black hair slicked back with gel, clean-shaven, no hat, "
          "long charcoal grey wool overcoat over a black turtleneck sweater, black trousers, polished black shoes, a gold wristwatch on the left wrist.",
 "HERMINIA_MERCADO": "Mexican mestizo woman, medium brown skin, a respected town lady, 70 years old, elegant serene face, short wavy silver hair, small pearl earrings, "
             "a camel wool coat, a lilac knitted scarf, dark brown trousers, brown low-heel shoes.",
}
LOCS = {
 "LOC_ARCOS": "Stone arcade of an old Mexican town market on a December night, worn stone arches and a terracotta floor, a large handmade nativity scene on a low wooden platform "
              "with clay shepherds, sheep, a donkey, an ox, Mary and Joseph kneeling beside an empty straw manger, green moss and small paper houses, "
              "warm Christmas string lights hanging between the arches, colorful papel picado, one big seven-point star piñata hanging from a rope, "
              "a clay pot of ponche on a small stove, a wooden gate at one side.",
 "LOC_PLAZUELA": "Small Mexican town square on a December night, cobblestones, a white kiosk with Christmas string lights, old colonial facades painted ochre and terracotta, "
                 "warm street lamps, the stone arcade of the old market on one side.",
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
