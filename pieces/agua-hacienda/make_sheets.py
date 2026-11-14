"""Genera las hojas de personaje y locaciones de agua-hacienda con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
import subprocess, sys, glob, os
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = Path(__file__).parent / "chars"
SHEET = ("Character turnaround reference sheet of one person, four views side by side on plain white background: front view, three-quarter view, "
         "side profile, back view, full body, same scale, all views fully consistent, plus one large close-up portrait of the face on the left. {d} "
         "Photorealistic, cinematic film still quality, natural skin texture, even soft lighting, neutral expression, no text or labels")
LOC = "Empty location reference photo, no people. {d} Photorealistic cinematic film still, 85mm, no text"
CHARS = {
 "LUPITA_NINA": "Mexican girl, 8 years old, thin, big dark eyes, two long black braids tied with red ribbons, faded light-blue cotton dress, small leather huaraches, dusty knees.",
 "EZEQUIEL": "Mexican ranch foreman, 45 years old, stocky, thick black mustache, hard cruel eyes, black leather vest over a white shirt, black cowboy hat with a silver hatband, jeans, dark boots, holster belt.",
 "DON_CHUY": "Mexican muleteer, 60 years old, weathered kind face, grey mustache, wide palm sombrero, red bandana around the neck, green plaid long-sleeve shirt, brown work pants, leather boots.",
 "DONA_ROSA": "Mexican woman, 58 years old, warm motherly face, long grey braid, purple rebozo shawl over the shoulders, white embroidered apron over a dark dress, simple sandals.",
 "LUPITA_ABOGADA": "Mexican woman lawyer, 23 years old, elegant and serious, dark hair pulled back in a low bun, grey tailored suit, white blouse, small silver earrings, black heels, same big dark eyes.",
 "BETO": "Mexican young office assistant, 30 years old, slim, short hair, glasses, light-blue shirt with a navy-blue sweater vest, grey slacks, holding a folder.",
 "DON_CHUY_VIEJO": "Mexican old man, 75 years old, thin and frail, white hair and white mustache, same wide palm sombrero and red bandana around the neck, faded green plaid shirt, brown pants, worn boots.",
 "DONA_ROSA_VIEJA": "Mexican old woman, 73 years old, fragile, white hair in a thin braid, same purple rebozo shawl, simple dark dress, white apron.",
 "EZEQUIEL_RICO": "Mexican rich rancher, 60 years old, heavier, grey thick mustache, arrogant face, beige suit with an open-collar shirt, thick gold chain, fine black cowboy hat with a silver hatband, polished boots.",
}
LOCS = {
 "LOC_HACIENDA": "Courtyard of an old Mexican hacienda in Jalisco, arched stone portico, a stone water trough with a metal bucket, dusty ground, harsh golden afternoon sun.",
 "LOC_CAMINO": "Dirt road in the Jalisco countryside lined with blue agave and maguey plants, dry hills, golden hour light.",
 "LOC_COCINA": "Rustic Mexican adobe kitchen, wood-fired stove, clay pots and jarros, wooden table, warm amber window light.",
 "LOC_DESPACHO": "Modern law office in Guadalajara, glass desk, leather chair, large window with city view, cool daylight.",
 "LOC_PORCHE": "Porch of a humble old ranch house, wooden bench, dry stone well in the yard, cracked earth, cornfield behind, late afternoon light.",
 "LOC_JARRITO": "Close-up product reference of a small Mexican clay jarrito with a hand-painted white and red flower, on a wooden table, plain background.",
}
def run(args):
    r = subprocess.run(["node", "src/cli.js", *args], cwd=MCP, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print(r.stdout.strip()[-300:], r.stderr.strip()[-300:], flush=True); return r.stdout
for name, d in list(CHARS.items()) + list(LOCS.items()):
    dst = OUT / f"{name}.jpg"
    if dst.exists(): continue
    prompt = (SHEET if name in CHARS else LOC).format(d=d)
    out = run([prompt, "--aspect", "16:9", "--model", "pro", "--out", str(OUT)])
    f = [l for l in out.splitlines() if l.endswith((".jpg", ".png"))]
    if not f: print("FALLO", name, flush=True); continue
    os.replace(f[0], dst); run(["upload", str(dst), "--name", name]); print("OK", name, flush=True)
