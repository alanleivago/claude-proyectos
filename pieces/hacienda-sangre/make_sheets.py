"""Genera las hojas de personaje, locaciones y utilería de hacienda-sangre con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "OCTAVIO": "Wealthy Mexican hacienda owner, 63 years old, proud stern face, grey hair combed back, thick grey moustache, gold signet ring, charcoal-brown three-piece suit with matching vest, white shirt, burgundy silk tie, white pocket square, polished dark brown shoes.",
 "MATEO": "Mexican man, 30 years old, short dark brown hair, light stubble beard, warm brown eyes, no hat, olive-green corduroy jacket worn open over a plain navy-blue t-shirt, dark jeans, brown leather boots.",
 "TERESA": "Mexican woman, 56 years old, elegant kind face, dark hair with grey streaks pulled back in a low bun, small pearl earrings, pale sky-blue long-sleeve blouse, dark forest-green trousers, simple flat shoes.",
 "ARTURO": "Mexican lawyer, 42 years old, slim, short brown hair with a side part, clean-shaven, thin rectangular glasses, light tan suit, white shirt, dark chocolate-brown tie, brown leather shoes.",
 "DONNICO": "Old Mexican cowboy, 76 years old, deep wrinkles, short white beard, natural palm-straw cowboy hat with a wide brim, navy-blue bandana around the neck, dark grey suede vest over a faded light-blue work shirt, worn jeans, old brown boots.",
 "QUINTERO": "Mexican bank manager, 38 years old, short neat black hair, clean-shaven, slate-grey suit, white shirt, light blue tie, small silver lapel pin, black shoes.",
}
LOCS = {
 "LOC_ESTANCIA": "Grand living hall of an old Mexican hacienda, white plaster walls, dark wooden ceiling beams, oil paintings of horses in gold frames, leather armchairs, iron lamps, terracotta tile floor, soft window light.",
 "LOC_BUFETE": "Lawyer's office in a Mexican town, a full wall of law books, heavy wooden desk with cream folders and a brass lamp, leather chair, big window with soft cool daylight.",
 "LOC_RECAMARA": "Rustic bedroom in a Mexican hacienda, white plaster walls, a wooden crucifix above a carved wooden bed with a woven blanket, an open brown suitcase on the bed, soft warm window light.",
 "LOC_RANCHITO": "Porch of a small humble Mexican ranch house, adobe wall, wooden posts and a wooden bench, an enamel coffee pot on a small table, horses in a wooden corral and dry hills behind, warm golden morning light.",
 "LOC_BANCO": "Lobby of a small Mexican bank, dark marble counter, beige walls, potted plants, wooden office doors, cool even light.",
}
PROPS = {
 "PROP_SANISIDRO": "Small hand-carved wooden figurine of San Isidro Labrador, a farmer saint with a hat and a plough pulled by two little oxen, hand-painted in faded colours, about 15 cm tall, on a weathered wooden table.",
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
