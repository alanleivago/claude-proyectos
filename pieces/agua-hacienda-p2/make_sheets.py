"""Hojas de agua-hacienda PARTE 2 con el Flow MCP (CLI). Los personajes y locaciones son los de la Parte 1 (chars/ copiado):
solo se genera la locación nueva LOC_COMPUERTA. Con --reupload vuelve a subir al proyecto Flow activo las hojas de la Parte 1
que usa la Parte 2 (los assets viven en el proyecto Flow activo: state.json -> projectId).
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
 "LOC_COMPUERTA": "Old stone irrigation canal in the Jalisco countryside, a closed rusty metal sluice gate with a round iron hand wheel on top, the canal below completely dry and dusty, blue agave and dry hills behind, clear morning light.",
}
REUSE = ["LUPITA_ABOGADA", "EZEQUIEL_RICO", "DON_CHUY_VIEJO", "DONA_ROSA_VIEJA", "BETO", "LOC_PORCHE", "LOC_HACIENDA", "LOC_JARRITO"]
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
