"""Genera las hojas de personaje y locación de buen-hijo con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
import subprocess, sys, glob, os
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = Path(__file__).parent / "chars"; OUT.mkdir(exist_ok=True)
SHEET = ("Character turnaround reference sheet of one person, four views side by side on plain white background: front view, three-quarter view, "
         "side profile, back view, full body, same scale, all views fully consistent, plus one large close-up portrait of the face on the left. {d} "
         "Photorealistic, cinematic film still quality, natural skin texture, even soft lighting, neutral expression, no text or labels")
LOC = "Empty location reference photo, no people. {d} Photorealistic cinematic film still, 85mm, no text"
PROP = "Prop reference photo, no people, no hands. {d} Photorealistic macro product shot, soft even light, no text"
CHARS = {
 "ABUNDIO": "Mexican mestizo man, brown skin, wealthy Mexican factory owner, 62 years old, stern face, grey hair combed back, thick grey moustache, no beard, light beige long-sleeve dress shirt, dark brown trousers, brown leather belt, brown leather shoes.",
 "TADEO": "Mexican mestizo man, brown skin, 27 years old, kind gentle face, short curly black hair, clean-shaven, no moustache, no beard, sage green long-sleeve button shirt, light grey chinos, white sneakers.",
 "ROMAN": "Mexican mestizo man, brown skin, 32 years old, proud face, black hair combed back, clean-shaven, no moustache, no beard, navy blue long-sleeve shirt, black trousers, silver wristwatch, black shoes.",
 "PETRA": "Mexican mestiza woman, brown skin, Mexican grandmother, 80 years old, sweet wrinkled face, grey hair in a bun, pale pink embroidered blouse, long brown skirt, grey rebozo shawl over her shoulders, black flat shoes, a small white plastic bag in her left hand.",
 "AURELIA": "Mexican mestiza woman, brown skin, Mexican nanny and housekeeper, 70 years old, warm wise face, grey hair in a low bun, white blouse, turquoise apron, dark brown skirt, brown flat shoes.",
}
LOCS = {
 "LOC_SALON": "Elegant modern living room of a wealthy Mexican house, beige sofas, a dark wood coffee table, floor lamps, a dark wood staircase at the back, large windows with warm golden-hour light.",
 "LOC_AVENIDA": "Quiet tree-lined avenue in a Mexican city at sunset, a zebra crosswalk, a pedestrian traffic light, parked cars along the curb, a sidewalk, a small peach-colored house with a dark green wooden door at the corner, warm golden light.",
 "LOC_PERSIANA": "Empty city sidewalk in Mexico at night, a closed dark blue corrugated metal shop shutter, a warm streetlamp, flattened cardboard boxes on the ground.",
 "LOC_ZAGUAN": "Facade of a small green-painted Mexican house with an old wooden front door, potted plants by the door, a narrow sidewalk, soft morning light.",
 "LOC_FOGON": "Warm bright kitchen of a modest Mexican house, a wooden table with a woven placemat, clay pots hanging on the wall, a window with soft morning light, a coffee pot on the stove.",
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
