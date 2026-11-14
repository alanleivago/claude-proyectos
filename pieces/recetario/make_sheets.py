"""Genera las hojas de personaje, locación y objeto de recetario con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "MIREYA": "Mexican mestiza woman, brown skin, hardworking home dessert maker, 28 years old, kind expressive face, long straight dark brown hair, small gold hoop earrings, sleeveless light lilac dress with a small white flower print and thin straps, white flat sandals.",
 "CHENCHO": "Mexican mestizo man, brown skin, 38 years old, heavy build, round face, short black gelled hair, short black beard and black moustache, pale mint green t-shirt with faint stains, blue jeans, black sneakers.",
 "HORTENSIA": "Mexican mestiza woman, brown skin, Mexican mother, 62 years old, round face, dark grey hair pulled back in a bun, small gold earrings, thin gold chain, light blue floral housedress with short sleeves, beige flat sandals.",
 "SAMANTA": "Mexican mestiza woman, brown skin, elegant business executive, 42 years old, confident face, shoulder-length wavy brown hair, small pearl earrings, light grey pantsuit, white silk blouse, black heels.",
 "LEOPOLDO": "Mexican mestizo man, brown skin, owner of a dessert company, 45 years old, sharp face, black hair slicked back, short trimmed black beard and black moustache, lavender pinstriped long-sleeve dress shirt, charcoal trousers, black belt, black shoes, silver wristwatch.",
}
LOCS = {
 "LOC_ALACENA": "Modest warm kitchen of a humble Mexican house, beige tiled walls, a wooden table covered with small clear plastic dessert cups, an old white fridge, a small TV on the counter, a wooden drawer cabinet, warm soft window light.",
 "LOC_OFICINA": "Bright modern office in Mexico City, a large window over the city, a white desk with a tray of small dessert cups, two chairs, cool white daylight.",
 "LOC_CAFETERIA": "Quiet Mexican café, a dark wooden table with white coffee cups, brick wall, hanging warm lamps, warm dim light.",
}
PROPS = {
 "PROP_RECETARIO": "A single worn brown leather notebook lying open on a wooden table, handwritten dessert recipes in blue ink with small sketches of dessert cups, slightly stained pages.",
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
