"""Genera las hojas de personaje y locación de tele-nueva con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "GENARO": "Mexican mestizo man, brown skin, Mexican construction worker, 38 years old, kind strong face, short black hair combed back, short neat black moustache, no beard, olive green long-sleeve work shirt with the sleeves rolled up, dark blue jeans, brown leather belt, brown leather work boots.",
 "REMEDIOS": "Mexican mestiza woman, brown skin, Mexican grandmother, 86 years old, sweet wrinkled face, white hair in a low bun, no glasses, dark green knee-length dress with a small white flower print, white crochet apron, black cloth slippers.",
 "GRISELDA": "Mexican mestiza woman, brown skin, 36 years old, pretty proud face, long straight black hair, red lipstick, cobalt blue long-sleeve blouse, black trousers, black flat shoes.",
 "CHABELA": "Mexican mestiza woman, brown skin, 62 years old, round proud face, short wavy light brown hair, gold necklace, small gold earrings, purple blouse with a large white flower print, cream trousers, beige flat shoes.",
}
LOCS = {
 "LOC_CASITA": "Modest living room of an old Mexican house, a floral armchair, a brown sofa, wooden shelves with saint figurines and family photos, a picture of the Virgin of Guadalupe, a small table with a lace doily, an old boxy CRT television on a wooden stand, warm window light.",
 "LOC_RESIDENCIA": "Comfortable living room of a Mexican house, cream sofas, golden curtains, landscape paintings, a carved wooden TV cabinet with a large new flat-screen television, warm daylight.",
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
