"""Genera las hojas de personaje, locación y utilería de canasta con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
import subprocess, sys, glob, os
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = Path(__file__).parent / "chars"
SHEET = ("Character turnaround reference sheet of one person, four views side by side on plain white background: front view, three-quarter view, "
         "side profile, back view, full body, same scale, all views fully consistent, plus one large close-up portrait of the face on the left. {d} "
         "Photorealistic, cinematic film still quality, natural skin texture, even soft lighting, neutral expression, no text or labels")
LOC = "Empty location reference photo, no people. {d} Photorealistic cinematic film still, 85mm, no text"
PROP = "Prop reference photo, no people, no hands. {d} Photorealistic macro product shot, soft even light, no text"
CHARS = {
 "REFUGIO": "Mexican grandmother street vendor, 70 years old, kind dignified wrinkled face, grey hair in a low bun, small silver stud earrings, mustard-yellow knitted cardigan, white blouse, long dark blue skirt, black flat shoes, holding a wicker basket full of gum packets and Mexican candies.",
 "HORACIO": "Mexican office manager, 50 years old, proud hard face, slicked-back black hair with grey temples, completely clean-shaven, black suit, white shirt, solid royal blue tie, black leather shoes.",
 "MARIBEL": "Mexican receptionist woman, 30 years old, kind pretty face, dark hair in a ponytail, light pink long-sleeve blouse, black trousers, blue lanyard with a blank white ID card, black flat shoes.",
 "EUSEBIO": "Mexican building doorman, 55 years old, kind serious face, short grey hair, thick grey moustache, no beard, plain light blue long-sleeve work shirt, navy blue trousers, blank white ID card on a lanyard, black shoes.",
 "FEDERICO": "Mexican businessman, 42 years old, handsome calm face, short dark hair, short neat black beard, charcoal grey suit, light grey shirt with open collar, no tie, black shoes.",
}
LOCS = {
 "LOC_VESTIBULO": "Bright modern reception hall of a Mexican candy company, a long wooden reception counter, white walls with blue Talavera tile accents, potted plants, glass doors to the street, glass jars of colorful Mexican candies on a shelf, soft daylight.",
 "LOC_GERENCIA": "Manager's office in a modern Mexican company, a dark wooden desk with folders, a black leather chair, a large window over the city, soft daylight.",
 "LOC_BANQUETA": "Glass entrance of a modern Mexican company building seen from the street, three grey stone steps, a wide sidewalk, potted plants on both sides, soft grey daylight.",
 "LOC_SALITA": "Warm living room of a Mexican house, a wooden dining table with a white embroidered tablecloth, family photos on the wall, green plants, clay pots, golden morning light.",
}
PROPS = {}
def run(args):
    r = subprocess.run(["node", "src/cli.js", *args], cwd=MCP, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print(r.stdout.strip()[-300:], r.stderr.strip()[-300:], flush=True); return r.stdout
for name, d in list(CHARS.items()) + list(LOCS.items()) + list(PROPS.items()):
    dst = OUT / f"{name}.jpg"
    if dst.exists(): continue
    prompt = (SHEET if name in CHARS else PROP if name in PROPS else LOC).format(d=d)
    out = run([prompt, "--aspect", "16:9", "--model", "pro", "--out", str(OUT)])
    f = [l for l in out.splitlines() if l.endswith((".jpg", ".png"))]
    if not f: print("FALLO", name, flush=True); continue
    os.replace(f[0], dst); run(["upload", str(dst), "--name", name]); print("OK", name, flush=True)
