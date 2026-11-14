"""Genera las hojas de personaje, locación y utilería de encendedor con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "CONSUELO": "Mexican ranch owner woman, 52 years old, beautiful strong face, long wavy dark hair, light grey cowboy hat with a black leather band, dark green long-sleeve shirt, tan suede vest, silver bolo tie with a round red stone, small gold hoop earrings, dark jeans, leather belt with a silver buckle, brown cowboy boots.",
 "SANTIAGO": "Mexican man, 25 years old, slim, handsome tired face, messy dark hair, light stubble, worn light brown work shirt with a tear at the shoulder over a dirty white t-shirt, black string bracelet on his wrist, faded jeans, worn brown boots.",
 "CIRILO": "Mexican ranch hand, 48 years old, sturdy build, serious weathered face, short black beard, dark brown cap, grey-green camouflage jacket over a black t-shirt, sunglasses hanging from his collar, khaki cargo trousers, black boots.",
 "BALTASAR": "Rich Mexican landowner, 62 years old, hard proud face, slicked-back grey hair, thick grey moustache, dark red leather jacket with black floral embroidery, black shirt, gold chain with a round medallion, big silver belt buckle, black trousers, black cowboy boots.",
 "ROQUE": "Mexican bodyguard, 40 years old, broad build, serious face, shaved head, clean-shaven, dark blue suit, black shirt, small earpiece, black shoes.",
 "LEANDRO": "Mexican rancher, 55 years old, kind tired face, short grey beard, cream straw cowboy hat, dark blue denim shirt, brown leather belt, jeans, brown boots.",
}
LOCS = {
 "LOC_ESTUDIO": "Dark wooden study in a Mexican ranch house, a heavy desk with an old laptop and papers, a black iron safe in the corner, a framed portrait of a man in a straw cowboy hat on the wall, half-closed curtains, warm amber light.",
 "LOC_BODEGA": "Dim adobe storeroom on a Mexican ranch, stacked burlap sacks of corn, wooden beams, a small barred window, dusty beams of warm light, dirt floor.",
 "LOC_PATIO": "Colonial courtyard of a rich Mexican hacienda, terracotta-red walls, stone arches, a round stone fountain, potted bougainvillea, a stone table, warm late-afternoon light.",
 "LOC_ESTACION": "Abandoned train station in the Mexican desert, a faded wooden platform and small station house, an old water tower, rusty rails, dry brush, orange sunset light with floating dust.",
 "LOC_CORREDOR": "Long arched corridor of a Mexican ranch house at sunset, terracotta floor, wooden columns, hanging iron lanterns, wooden bench, palm trees and a pink sky behind.",
}
PROPS = {
 "PROP_ENCENDEDOR": "An antique engraved silver lighter, slightly worn, its bottom open to show a tiny hidden USB memory stick inside, on a dark wooden desk.",
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
