"""Hojas de padre-veladoras PARTE 2 con el Flow MCP (CLI). Personajes, nave, atrio y veladoras son los de la Parte 1 (chars/ copiado, revisados en hoja de contactos, md5 distintos).
Ninguna hoja nueva. Con --reupload vuelve a subir al proyecto Flow activo las hojas de la Parte 1 que usa la Parte 2 (los assets viven en el proyecto activo: state.json -> projectId).
OJO: en la Parte 1 Flow corrió las imágenes un nombre; los nombres buenos son los de abajo (RUFINOVIBORA, CHATOBANDANA, MAUROESCOLTA, LOC_TEMPLO), NO RUFINO/CHATO/MAURO/LOC_PARROQUIA.
Uso: python -I make_sheets.py [--reupload]   -> imprime "FIN HOJAS P2" al terminar."""
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
LOCS = {}
REUSE = ["ANSELMO", "RUFINOVIBORA", "CHATOBANDANA", "RAMIRO", "MAUROESCOLTA", "LOC_TEMPLO", "LOC_ATRIO", "PROP_VELADORAS"]
def run(args):
    try:
        r = subprocess.run(["node", "src/cli.js", *args], cwd=MCP, env=dict(os.environ), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
    except subprocess.TimeoutExpired:
        print("TIMEOUT", args[:2], flush=True); return ""
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
