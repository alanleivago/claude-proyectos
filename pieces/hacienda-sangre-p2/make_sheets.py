"""Hojas de hacienda-sangre PARTE 2 con el Flow MCP (CLI). Personajes, porche del ranchito y San Isidro son los de la Parte 1 (chars/ copiado, verificados en hoja de contactos).
Hojas nuevas: LOC_QUINQUE (interior de adobe de noche con quinqué) y PROP_SOBRELACRE (sobre con sello de lacre rojo).
Con --reupload vuelve a subir al proyecto Flow activo las hojas de la Parte 1 que usa la Parte 2 (los assets viven en el proyecto activo: state.json -> projectId).
Nicanor = DONNICO (no existe NICANOR). Uso: python -I make_sheets.py [--reupload]"""
import subprocess, sys, os
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = Path(__file__).parent / "chars"
LOC = "Empty location reference photo, no people. {d} Photorealistic cinematic film still, 85mm, no text"
PROP = "Prop reference photo, no people, no hands. {d} Photorealistic macro product shot, soft even light, no text"
LOCS = {
 "LOC_QUINQUE": "Interior of a small humble adobe ranch house in rural Mexico at night, rough whitewashed adobe walls, a rustic wooden table with two wooden chairs, a glowing kerosene oil lamp on the table, an open wooden door to the dark yard, a small wooden shelf with clay pots, warm amber lamplight and deep shadows.",
}
PROPS = {
 "PROP_SOBRELACRE": "An old cream-coloured paper envelope, slightly yellowed at the edges, closed with a round dark red wax seal, no writing and no letters on it, lying on a rustic wooden table.",
}
REUSE = ["OCTAVIO", "MATEO", "TERESA", "ARTURO", "DONNICO", "LOC_RANCHITO", "PROP_SANISIDRO"]
def run(args):
    r = subprocess.run(["node", "src/cli.js", *args], cwd=MCP, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print(r.stdout.strip()[-300:], r.stderr.strip()[-300:], flush=True); return r.stdout
if "--reupload" in sys.argv:
    for name in REUSE: run(["upload", str(OUT / f"{name}.jpg"), "--name", name]); print("SUBIDO", name, flush=True)
for name, d in list(LOCS.items()) + list(PROPS.items()):
    dst = OUT / f"{name}.jpg"
    if dst.exists(): continue
    prompt = (PROP if name in PROPS else LOC).format(d=d)
    out = run([prompt, "--aspect", "16:9", "--model", "pro", "--out", str(OUT)])
    f = [l for l in out.splitlines() if l.endswith((".jpg", ".png"))]
    if not f: print("FALLO", name, flush=True); continue
    os.replace(f[0], dst); run(["upload", str(dst), "--name", name]); print("OK", name, flush=True)
print("FIN HOJAS P2", flush=True)
