"""Genera las hojas de personaje, locación y objeto de mecanico con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "EVARISTO": "Mexican mestizo man, brown skin, the most experienced auto mechanic, 50 years old, weathered kind face, messy short black hair with a little grey, thick black moustache and short black stubble beard, dark olive green long-sleeve mechanic coverall with grease stains over a grey t-shirt, a faded blue and white checkered rag over his left shoulder, black work boots.",
 "PATRONTALLER": "Mexican mestizo man, brown skin, owner of an auto repair shop, 56 years old, stern face, grey hair combed back, clean-shaven with no beard and no moustache, dark burgundy zip-up jacket over a light blue dress shirt, charcoal grey trousers, black shoes, gold wristwatch on his left wrist.",
 "OSVALDO": "Mexican mestizo man, brown skin, apprentice mechanic, 25 years old, honest face, short straight black hair, clean-shaven with no beard and no moustache, brand-new clean light grey mechanic coverall over a black t-shirt, black work boots.",
 "CELSO": "Mexican mestizo man, brown skin, owner of a small fleet of pickup trucks, 62 years old, tough friendly face, grey moustache and no beard, tan baseball cap, dark green quilted vest over a red and navy plaid flannel shirt, blue jeans, brown work boots.",
}
LOCS = {
 "LOC_PECERA": "Glass-walled office above a Mexican auto repair shop, a wooden desk with papers and a desk lamp, a leather chair, a big glass window looking down onto the workshop floor with blue car lifts, warm light.",
 "LOC_NAVE": "Large Mexican auto repair shop, blue hydraulic car lifts, a silver pickup truck raised on a lift, red tool cabinets, grey concrete floor with oil stains, fluorescent ceiling lights and cool daylight from the open door.",
 "LOC_SOLAR": "Humble backyard carport of a small Mexican house, a corrugated metal roof on wooden posts, a concrete floor, an old wooden workbench with a vise, pale blue painted walls, potted plants, soft late afternoon light.",
}
PROPS = {
 "PROP_CAJAROJA": "A single red metal mechanic toolbox with a black handle and two latches, closed, standing on a concrete floor.",
}
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
