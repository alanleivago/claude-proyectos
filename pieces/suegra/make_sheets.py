"""Genera las hojas de personaje, locación y objeto de suegra con el Flow MCP (CLI) y las sube como assets @{NOMBRE}."""
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
 "PALOMA": "Mexican mestiza woman, brown skin, hardworking office employee, 32 years old, beautiful expressive face, long wavy black hair, small gold hoop earrings, thin gold pendant necklace, light sage green ribbed knit top with small buttons and long sleeves, light grey high-waist trousers with a thin brown belt, nude flat shoes.",
 "RODRIGO": "Mexican mestizo man, brown skin, 34 years old, handsome face, short black hair, short trimmed black beard and black moustache, pale yellow long-sleeve dress shirt with rolled-up sleeves, navy blue trousers, brown belt, brown shoes, black wristwatch on his left wrist.",
 "SOCORRO": "Mexican mestiza woman, brown skin, Mexican mother-in-law, 60 years old, heavy build, round face, grey hair in a loose bun, gold hoop earrings, dark green short-sleeve dress with a small yellow and white flower print, brown flat sandals.",
 "PANCHO": "Mexican mestizo man, brown skin, 29 years old, chubby, round face, curly black hair, short black beard and black moustache, faded navy blue t-shirt with faint stains, khaki cargo shorts, black flip-flops.",
 "YADIRA": "Mexican mestiza woman, brown skin, 27 years old, round face, dark brown hair in a messy bun, light peach t-shirt, light blue pajama pants with a small white flower print, pink slippers.",
 "IRENE": "Mexican mestiza woman, brown skin, office manager, 45 years old, serious kind face, chin-length dark brown bob, small pearl earrings, navy blue blazer, white blouse, black trousers, black low heels.",
}
LOCS = {
 "LOC_DEPTO": "Living room with open kitchen of a modern middle-class Mexican house, white walls, dark wooden doors, a grey fabric sofa covered with blankets, pillows and travel bags, a grey armchair, a light wood kitchen counter, a white fridge, warm lamp light.",
 "LOC_AZOTEA": "Sunny rooftop laundry area of a Mexican house, a white concrete washtub, clotheslines with hanging clothes, white walls, potted plants, bright daylight.",
 "LOC_CORPORATIVO": "Bright modern open office in Mexico, a light wood reception counter near the entrance, white desks with computers, white walls, a large window, a green plant, cool daylight.",
}
PROPS = {
 "PROP_CONTROL": "A single small black garage door remote control with one round grey button and a small silver key ring, lying on a wooden table.",
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
