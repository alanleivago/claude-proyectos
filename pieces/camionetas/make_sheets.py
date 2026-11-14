"""Genera las hojas de personaje y locación de camionetas con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "AMPARO": "Mexican indigenous grandmother from Oaxaca, 62 years old, calm dignified face, long grey-black braid, dark brown felt hat with a narrow black band, deep blue fringed rebozo shawl over her shoulders, white cotton blouse with red and yellow embroidered flowers, red woven sash at the waist, long black skirt, several thin gold necklaces, small gold earrings, black flat shoes, carrying a brown woven palm-leaf bag.",
 "PAMELA": "Mexican car saleswoman, 30 years old, pretty proud face, long wavy light brown hair, fitted solid red skirt suit, white blouse, black high heels, small blank gold name badge on the jacket.",
 "GONZALO": "Mexican car sales manager, 36 years old, handsome proud face, short dark brown hair combed back, completely clean-shaven with no moustache and no beard, navy blue suit, white shirt, solid dark green tie, silver wristwatch, blank white ID card on a black lanyard, black leather shoes.",
 "ITZELMORENA": "Mexican mestiza car saleswoman from Puebla, 27 years old, warm brown skin, dark brown eyes, typical Mexican features, kind warm face, long straight black hair, light beige trouser suit, white shirt, black flat shoes, small blank silver name badge on the jacket.",
}
LOCS = {
 "LOC_VITRINA": "Bright luxury car showroom in Mexico, white marble floor, tall glass walls, three new white SUVs with no logos in a row, soft cool daylight.",
 "LOC_EXHIBIDOR": "Second modern car showroom in Mexico, grey polished floor, a light wood sales desk with car brochures, a new silver SUV with no logos, large windows, cool daylight.",
 "LOC_AGENCIA": "Third car showroom in Mexico, warm beige floor, wooden accent wall with green plants, three new dark blue SUVs with no logos, warm soft daylight.",
 "LOC_JARDINERA": "Sidewalk outside a glass car showroom in a Mexican city, a long concrete planter bench with green bushes, parked cars on the street, soft grey daylight.",
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
