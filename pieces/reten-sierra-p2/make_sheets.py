"""Hojas de reten-sierra PARTE 2 con el Flow MCP (CLI). Personajes, cabina, sierra y utilería son los de la Parte 1 (chars/ copiado).
Hoja nueva: LOC_PUESTOVERDE (el retén con pickups verde olivo SIN letreros; LOC_GARITA traía una patrulla "POLICÍA ESTATAL" que hubo que borrar en montaje).
Con --reupload vuelve a subir al proyecto Flow activo las hojas de la Parte 1 que usa la Parte 2 (los assets viven en el proyecto activo: state.json -> projectId).
Nombres que muestran a la persona/lugar correcto (la Parte 1 tuvo hojas corridas): DONTEO = Teodoro, LOC_SIERRA.jpg = la cabina, LOC_MONTE = la loma,
PROP_LEONTINA = reloj, PROP_CAMIONETA = troca roja, GARZAVERDE = Garza de camuflaje, SOLDADOFLACO = Pineda. NO usar GARZA, PINEDA, LOC_CABINA, PROP_TROCA, LOC_GARITA.
Uso: python -I make_sheets.py [--reupload]"""
import subprocess, sys, os
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
MCP = Path(r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP")
OUT = Path(__file__).parent / "chars"
SHEET = ("Character turnaround reference sheet of one person, four views side by side on plain white background: front view, three-quarter view, "
         "side profile, back view, full body, same scale, all views fully consistent, plus one large close-up portrait of the face on the left. {d} "
         "Photorealistic, cinematic film still quality, natural skin texture, even soft lighting, neutral expression, no text or labels")
LOC = "Empty location reference photo, no people. {d} Photorealistic cinematic film still, 85mm, no text"
CHARS = {}
LOCS = {
 "LOC_PUESTOVERDE": "Roadblock on a two-lane mountain road in the Sierra of Chihuahua, a row of orange-and-white plastic road barriers across the road, two plain olive-green pickup trucks without any text, logos or light bars parked at the roadside, a small whitewashed concrete guard booth with one window, tall pines and red rock hills, dust in the air, warm late afternoon light.",
}
REUSE = ["CANDELARIA", "EMILIANO", "GARZAVERDE", "SOLDADOFLACO", "DONTEO", "LOC_SIERRA", "LOC_MONTE", "PROP_CAMIONETA", "PROP_LEONTINA"]
def run(args):
    r = subprocess.run(["node", "src/cli.js", *args], cwd=MCP, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print(r.stdout.strip()[-300:], r.stderr.strip()[-300:], flush=True); return r.stdout
if "--reupload" in sys.argv:
    for name in REUSE: run(["upload", str(OUT / f"{name}.jpg"), "--name", name]); print("SUBIDO", name, flush=True)
for name, d in list(CHARS.items()) + list(LOCS.items()):
    dst = OUT / f"{name}.jpg"
    if dst.exists(): continue
    prompt = (SHEET if name in CHARS else LOC).format(d=d)
    out = run([prompt, "--aspect", "16:9", "--model", "pro", "--out", str(OUT)])
    f = [l for l in out.splitlines() if l.endswith((".jpg", ".png"))]
    if not f: print("FALLO", name, flush=True); continue
    os.replace(f[0], dst); run(["upload", str(dst), "--name", name]); print("OK", name, flush=True)
print("FIN HOJAS P2", flush=True)
