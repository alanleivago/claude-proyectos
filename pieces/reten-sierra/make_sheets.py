"""Genera las hojas de personaje, locaciones y utilería de reten-sierra con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "CANDELARIA": "Mexican cattle rancher widow, 63 years old, strong dignified face with deep wrinkles, long silver-grey hair in one thick braid over the right shoulder, small gold hoop earrings, cream felt cowboy hat with a thin turquoise band, emerald-green western blouse, dark brown suede jacket without fringe, gold pocket watch on a short gold chain, dark jeans, brown boots.",
 "EMILIANO": "Mexican young man, 24 years old, thin, clean-shaven, curly black hair, round wire-rimmed glasses, no hat, orange-and-white checked flannel shirt open over a grey t-shirt, jeans, white sneakers.",
 "GARZA": "Mexican state police commander, 52 years old, heavyset, completely shaved head, thick black horseshoe moustache, one gold front tooth, mirrored aviator sunglasses, no cap, navy-blue police uniform shirt with a gold star badge, black tactical vest with a black radio on the chest, navy cargo pants, black boots.",
 "PINEDA": "Mexican young police officer, 29 years old, very thin, big ears, clean-shaven, buzz-cut hair, black police cap, navy-blue police uniform shirt without vest, navy pants, black boots.",
 "GARZAVERDE": "Mexican army major, 52 years old, heavyset, thick black horseshoe moustache, one gold front tooth, mirrored aviator sunglasses, olive-green woodland camouflage field uniform shirt with rolled sleeves and embroidered patches, matching olive camouflage cap, olive camouflage cargo pants, tan desert boots.",
 "SOLDADOFLACO": "Mexican man, 29 years old, very thin, big ears, clean-shaven, wearing an olive-green woodland camouflage field uniform, matching olive camouflage cap, olive cargo pants, tan desert boots.",
 "DONTEO": "Mexican ranch foreman, 58 years old, round belly, huge bushy white beard, black felt cowboy hat, red neckerchief, denim jacket with a sheepskin collar, jeans, worn brown boots.",
}
LOCS = {
 "LOC_GARITA": "Rural police checkpoint on a two-lane mountain road in the Sierra of Chihuahua, orange-and-white plastic road barriers, a navy-blue police pickup truck with a light bar, pine trees and red rock hills, dust in the air, warm late afternoon light.",
 "LOC_CABINA": "Inside the cab of an old red 1980s pickup truck, cracked brown leather bench seat, a wooden rosary hanging from the rear-view mirror, through the dusty windshield a mountain road with a police checkpoint far ahead, warm late afternoon light.",
 "LOC_MONTE": "Hillside above a winding mountain road in the Sierra of Chihuahua, tall pines, dry yellow grass, red rocks, dust in the air, golden late afternoon light.",
}
PROPS = {
 "PROP_LEONTINA": "Old gold pocket watch with an engraved floral lid, open, white enamel face with black roman numerals, short gold chain, on a weathered wooden table.",
 "PROP_CAMIONETA": "Old red 1980s pickup truck, faded paint, chrome bumper, dust on the doors, parked on a dirt mountain road with pines behind, side three-quarter view.",
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
