"""Genera las hojas de personaje, locación y utilería de padre-veladoras con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "ANSELMO": "Mexican Catholic priest, 55 years old, kind serene face, short salt-and-pepper hair combed back, clean-shaven, thin rimless glasses, charcoal-grey priest suit jacket and trousers, dark grey clerical shirt with a white clerical collar, a dark red wooden bead rosary in his hand, simple silver ring, black shoes.",
 "RUFINOVIBORA": "Mexican motorcycle rider, 45 years old, broad build, hard face, long black hair tied in a low ponytail, thick black goatee, silver hoop earring, tattoos on both arms and the neck, sleeveless dark brown leather vest with cream rattlesnakes embroidered on the chest and back, black tank top underneath, thick silver chain with a saint medal, dark jeans, black boots.",
 "CHATOBANDANA": "Mexican motorcycle rider, 42 years old, lean, friendly sly face, dark green paisley bandana tied on his head, thick black moustache, blue plaid shirt with rolled sleeves, sleeveless dark brown leather vest with cream rattlesnakes embroidered on it, dark jeans, black boots.",
 "RAMIRO": "Rich Mexican rancher, 64 years old, strong weathered face, thick white moustache, grey hair under a dark brown felt cowboy hat, light blue linen guayabera shirt with white embroidery, gold chain with a round medal, gold ring, cream linen trousers, brown leather boots.",
 "MAUROESCOLTA": "Mexican right-hand man of a rancher, 40 years old, fit, serious face, short black hair, trimmed black beard, aviator sunglasses, navy-blue suit, white open-collar shirt, black shoes.",
}
LOCS = {
 "LOC_TEMPLO": "Interior of a colonial Mexican parish church, pink cantera stone columns and arches, a carved dark wooden altarpiece with gold details, rows of lit candles in glass holders by the altar rail, wooden pews, stained glass windows, warm dusty sunbeams.",
 "LOC_TERRAZA": "Arched stone terrace of a rich Mexican hacienda, a wrought-iron table with a coffee cup, potted agaves, terracotta floor, green hills in the distance, warm daylight.",
 "LOC_ATRIO": "Stone plaza in front of a small colonial church with a pink cantera stone facade and bell tower, big open wooden doors, a few motorcycles parked by the steps, dry trees, golden afternoon light.",
}
PROPS = {
 "PROP_VELADORAS": "A row of tall Mexican glass prayer candles with images of saints, some lit with small flames, on a carved wooden altar rail in a church.",
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
