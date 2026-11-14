"""Genera las hojas de personaje, locaciones y utilería de medalla-mezcal con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "FAUSTO": "Mexican mezcal producer, 58 years old, strong build, short trimmed grey beard, deep-set serious eyes, tan palm cowboy hat with a dark leather band, cream linen guayabera shirt, heavy silver ring with an engraved horse head on the right hand, brown leather belt, dark jeans, brown boots.",
 "HEROINA": "Mexican adult woman, 22 years old, slim, tired face with dust on the cheeks, long dark hair in one loose braid, faded denim jacket torn at the elbow over a dirty white t-shirt, yellow bandana tied around the left wrist, worn jeans, old white sneakers.",
 "CAPORAL": "Mexican ranch foreman, 45 years old, heavyset, round face, clean-shaven, short salt-and-pepper beard stubble, grey hair, faded red baseball cap, light khaki work shirt with rolled sleeves, black walkie-talkie radio clipped to the belt, brown work pants, work boots.",
 "SEVERO": "Mexican rural strongman, 62 years old, lean, slicked-back white hair, short white goatee, a scar across the left eyebrow, cold eyes, black felt cowboy hat with a snakeskin band, burgundy western shirt with pearl snaps, black vest, thin silver chain with half of a broken San Judas medal, snakeskin boots.",
 "TOBIAS": "Mexican henchman, 38 years old, stocky, sunburnt skin, short reddish-blond hair and stubble, straw cowboy hat, aviator sunglasses hanging from the shirt collar, khaki work shirt with rolled sleeves, radio on the chest pocket, jeans, boots.",
}
LOCS = {
 "LOC_MEZCALERA": "Yard of a rustic family mezcal distillery in the hills of Oaxaca, big stone tahona wheel, piles of roasted agave hearts, smoking earth oven, wooden table with clay cups and a mezcal bottle, a stone ranch house behind, warm golden hour light.",
 "LOC_CANTINA": "Old small-town Mexican cantina, long wooden bar, shelves of mezcal bottles, ceiling fan, peeling green walls, dim warm light through swinging doors.",
 "LOC_PUEBLO": "Dusty street of a small Oaxaca town in front of an old colonial stone church, several black pickup trucks parked, late afternoon light.",
 "LOC_TERRACERIA": "Dirt road winding through blue agave fields and dry hills in Oaxaca, dust in the air, golden late afternoon light.",
 "LOC_PORTON": "Big old wooden double gate with iron studs in a stone wall at the entrance of a mezcal ranch, dirt road outside, agave plants, sunset light.",
}
PROPS = {
 "PROP_ANILLO": "Heavy old silver ring with an engraved horse head, on a weathered wooden table.",
 "PROP_MEDALLA": "One half of an old silver San Judas Tadeo medal broken in two with a jagged edge, on a weathered wooden table.",
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
