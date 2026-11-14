"""Genera las hojas de personaje, locación y utilería de regreso-chicago con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "ROGELIO": "Mexican construction worker, 42 years old, lean strong build, kind tired tanned face, short black hair greying at the temples, short black goatee and moustache, black denim jacket over a mustard-yellow t-shirt, olive green canvas crossbody bag, blue jeans, dusty tan work boots.",
 "YESENIA": "Mexican woman, 38 years old, attractive proud face, long wavy dark brown hair with caramel highlights, big gold hoop earrings, thick gold chain necklace, black blazer over an emerald green satin blouse, black trousers, black heeled shoes.",
 "ULISES": "Mexican man, 36 years old, fit build, confident face, short slicked-back black hair, clean-shaven with no beard and no moustache, royal blue polo shirt with a white collar trim, sunglasses hooked on the collar, gold wristwatch, beige chinos, brown loafers.",
 "REBECA": "Mexican woman, 60 years old, sharp proud face, short dyed platinum-blonde hair, pearl earrings, black-and-white zebra-print blouse, burgundy cardigan, black trousers, black flat shoes.",
 "JOSEFINA": "Mexican grandmother, 68 years old, kind wise wrinkled face, long grey braid, navy blue rebozo shawl over her shoulders, white blouse with red embroidered flowers, dark brown skirt, black flat shoes.",
}
LOCS = {
 "LOC_FACHADA": "Mustard-yellow colonial two-story house on a cobblestone street in Guanajuato, Mexico, a dark green wrought-iron gate in front of the door, a Virgin of Guadalupe tile niche on the wall, potted geraniums on a small balcony, stone sidewalk, colorful houses down the street, warm golden-hour light.",
 "LOC_COCHERA": "Open garage of a mustard-yellow colonial house in Guanajuato, Mexico, a new white pickup truck parked inside, terracotta floor, dark green wrought-iron gate open, warm golden-hour light.",
}
PROPS = {
 "PROP_CARPETA": "A light blue cardboard folder lying open on a wooden table, showing official typed papers with a round gold embossed seal and a signature.",
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
