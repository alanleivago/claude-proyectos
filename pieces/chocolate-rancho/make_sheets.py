"""Genera las hojas de personaje, locación y utilería de chocolate-rancho con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "RENATA": "Elegant Mexican businesswoman, 52 years old, cold confident face, shoulder-length wavy dark-brown hair, small gold earrings, thin gold necklace, tailored bottle-green blazer over a pale grey silk blouse, black trousers, black heels, a tan leather handbag.",
 "PRUDENCIO": "Old Mexican rancher, 72 years old, kind weathered face, deep wrinkles, thick white moustache, light grey felt cowboy hat, rust-red bandana around the neck, dark navy canvas ranch jacket over a red plaid shirt, worn jeans, old brown boots.",
 "EULALIA": "Old Mexican countrywoman, 68 years old, sweet round face, long grey hair in a single braid over the shoulder, coral bead necklace, white cotton blouse embroidered with red flowers, mustard-yellow rebozo shawl over the shoulders, long dark brown skirt, simple flat shoes.",
 "DAMIAN": "Successful Mexican man, 34 years old, handsome serious face, neat short black beard, black hair combed back, dark brown eyes, tailored navy-blue suit, white shirt, mustard-gold silk tie, white pocket square, black leather shoes.",
 "BENAVIDES": "Mexican lawyer, 60 years old, slim, short silver hair, clean-shaven, round wire glasses, light grey suit, white shirt, navy-blue tie, carrying a brown leather folder, brown shoes.",
}
LOCS = {
 "LOC_HUERTO": "Stone patio in front of a humble Mexican ranch house, terracotta adobe walls, a wooden porch with an old wooden bench and clay pots of red bougainvillea, an old wooden table on the patio, mesquite trees and dry hills behind, warm afternoon light.",
}
PROPS = {
 "PROP_TAZA": "A blue-and-white Mexican talavera cup full of steaming hot chocolate with foam on top, next to a round pan dulce concha, on a worn wooden table.",
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
