"""Dense analysis of the MercurialForge MML tutorial with the API credits (ver-youtube pipeline,
more frames). Downloads the video + transcript to fuentes/mml2-girl-tutorial/frames/ (git-ignored),
sends frame batches to Claude and writes fuentes/mml2-girl-tutorial/analisis_lotes.md.
Usage (from repo root): python pieces/upnext-girl/tools/analyze_tutorial.py
"""
import base64, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(".claude/skills/ver-youtube/scripts").resolve()))
import ver_youtube as vy
import anthropic

URL = "https://www.youtube.com/watch?v=DqntXa7dOO8"
OUT = Path("fuentes/mml2-girl-tutorial")
WORK = OUT / "frames"
WORK.mkdir(parents=True, exist_ok=True)

video = next(WORK.glob("v.*"), None)
if not video:
    subprocess.run(["yt-dlp", "-q", "--no-warnings", "--js-runtimes", "node", "-S", "res:1080",
                    "--write-description", "-o", str(WORK / "v.%(ext)s"), URL], check=True)
    video = next(p for p in WORK.glob("v.*") if p.suffix != ".description")
tfile = WORK / "transcript.txt"
if not tfile.exists():
    t, dur = vy.transcribe(video, WORK)
    tfile.write_text(t, encoding="utf-8")
transcript = tfile.read_text(encoding="utf-8")

# dense frames: 2 s in the modeling..rigging chapters, 4 s elsewhere
fdir = WORK / "dense"
fdir.mkdir(exist_ok=True)
times = [t for t in range(0, 348, 4)] + [t for t in range(348, 730, 2)] + [t for t in range(730, 835, 4)]
for t in times:
    p = fdir / f"t{t:04d}.jpg"
    if not p.exists():
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", str(video), "-frames:v", "1",
                        "-vf", "scale=896:-2", "-q:v", "3", str(p)], check=True)

PROMPT = """Estos son fotogramas (con timestamp) de un tramo de un video de Blender sobre el estilo low poly
de Mega Man Legends (PS1), mas la transcripcion completa. Vamos a RECREAR desde cero el personaje
femenino que el autor modela/muestra, igual al suyo. Necesito detalles de modelado concretos.
Para ESTE tramo ({rango}), responde en espanol, en markdown, sin introduccion:

## Que pasa en este tramo
Lista con [MM:SS] de cada paso.
## Datos tecnicos exactos
Poligonos/tris (cifras), tamano y numero de texturas, paleta, resolucion, UV, herramientas
(Blender, Aseprite, plugins, modificadores), shading/iluminacion, rig (huesos), animacion facial.
## El personaje
Describe con precision lo que se ve del personaje: proporciones (cabezas de alto, tamano de cabeza
vs cuerpo, manos, pies), silueta, peinado (forma, mechones, color), cara (ojos, boca, nariz: pintada
en la textura o geometria), ropa y colores (con hex aproximado), accesorios, topologia visible
(wireframe: cuantas caras tiene cada parte, como estan construidos brazos, piernas, pelo, cabeza).
## Fotogramas de referencia
Timestamps de los MEJORES fotogramas de este tramo para: personaje terminado de frente, de lado,
de espaldas, 3/4, wireframe, hoja de textura/UV, atlas de expresiones, cada pose final, rig.
Una linea por fotograma: [MM:SS] que muestra.
"""

client = anthropic.Anthropic(api_key=vy.load_env_key())
frames = [(t, fdir / f"t{t:04d}.jpg") for t in times]
B = 76
parts = []
for i in range(0, len(frames), B):
    batch = frames[i:i + B]
    rango = f"{vy.mmss(batch[0][0])}-{vy.mmss(batch[-1][0])}"
    out = OUT / f"_lote_{i // B}.md"
    if out.exists():
        parts.append(out.read_text(encoding="utf-8")); continue
    content = []
    for t, p in batch:
        content.append({"type": "text", "text": f"[{vy.mmss(t)}]"})
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                        "data": base64.b64encode(p.read_bytes()).decode()}})
    content.append({"type": "text", "text": f"TRANSCRIPCION:\n{transcript}\n\n" + PROMPT.format(rango=rango)})
    with client.messages.stream(model=vy.MODEL, max_tokens=16000, messages=[{"role": "user", "content": content}]) as s:
        r = s.get_final_message()
    txt = f"# Tramo {rango}\n\n" + "".join(b.text for b in r.content if b.type == "text")
    out.write_text(txt, encoding="utf-8")
    print(f"lote {rango}: {r.usage.input_tokens} in / {r.usage.output_tokens} out", flush=True)
    parts.append(txt)
(OUT / "analisis_lotes.md").write_text("\n\n".join(parts), encoding="utf-8")
print("ok")
