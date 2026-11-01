"""Especificación técnica del estilo zach3d desde los shorts de referencia (créditos de API).

Por cada ref: fotogramas densos (2 fps) + transcripción con tiempos → un informe por video.
Después une los informes (y las notas de los tutoriales) en una sola especificación.

Uso:
    .venv/bin/python styles/zach3d/tools/spec_refs.py "Ref zach3dfilms/originales" fuentes/zach3dfilms-style
Salida: <refs>/_analisis/spec_<n>.md  y  <fuentes>/especificacion-tecnica-del-estilo.md
"""
import base64
import subprocess
import sys
import tempfile
from pathlib import Path

import anthropic

MODEL = "claude-opus-5-5"
FPS = 2
MAX_FRAMES = 90

PER_REF = """Sos un director técnico de animación 3D. Estos son fotogramas a {fps} fps (con su tiempo) y la transcripción
de un short vertical del canal {channel}. Quiero replicar su estilo EN CÓDIGO (Blender Python, cuadro a cuadro), así que necesito
medidas concretas, no adjetivos. Escribí en español, en markdown, con [s.ss] en cada observación:

1. Lista de shots: inicio–fin, qué se ve, encuadre (plano, ángulo, altura de cámara), movimiento de cámara (tipo, dirección,
   velocidad aproximada), y cómo entra el siguiente (corte, disolvencia, match, zoom a través de un objeto, whip…).
2. Render: tipo de iluminación (key/fill/rim, dirección, color), sombras (duras/suaves, contacto), AO, profundidad de campo,
   niebla, bloom, grano, grading. Colores aproximados en hex del fondo, del piso, de los objetos principales.
3. Materiales y modelado: nivel de detalle, biseles, plástico/metal/vidrio, texturas, cómo se ven los humanos si aparecen
   (piel, cara, ojos, pelo, ropa, proporciones) y los animales.
4. Recursos gráficos: rayos X / cortes transversales / transparencias (color exacto, cómo aparecen), flechas, etiquetas,
   números, íconos; tipografía y posición de subtítulos (cuántas palabras por vez, color, borde, altura en % de H).
5. Animación: cómo se mueven las cosas (ease, overshoot, física, velocidad), cuánto dura una acción, qué tan sincronizada
   está con la palabra que la nombra.
6. Guion: estructura (gancho en la primera frase, desarrollo, remate), palabras por minuto, tono, frase final.
7. Lo más distintivo de este video que habría que copiar sí o sí, y lo que sería difícil de lograr en código.

TRANSCRIPCIÓN:
{transcript}"""

MERGE = """Abajo hay {n} informes técnicos, uno por short de referencia del canal {channel},
más notas de apoyo si las hay. Uní todo en UNA especificación del estilo para replicarlo en código
(Blender Python, render cuadro a cuadro, 9:16, 30 fps). En español, markdown. Secciones:
1. Resumen del look en 5 líneas.  2. Render y luz (valores).  3. Paleta (hex).  4. Materiales y modelado.
5. Entornos y fondos.  6. Cámara y encuadres (con rangos medidos).  7. Transiciones.  8. Rayos X, cortes y gráficos.
9. Subtítulos y texto.  10. Humanos y animales.  11. Animación y timing (rangos).  12. Guion (estructura, wpm, gancho, remate).
13. Sonido (lo que se puede inferir).  14. Checklist de frame (8-12 puntos verificables).  15. Diferencias entre refs y qué es constante.
Usá rangos medidos cuando los informes los den; señalá cuando algo es inferencia.

{reports}

NOTAS DE LOS TUTORIALES:
{tutorials}"""


def load_key():
    for d in [Path.cwd(), *Path.cwd().parents]:
        env = d / ".env"
        if env.exists():
            for line in env.read_text().splitlines():
                if line.startswith("ANTHROPIC_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"')
    sys.exit("falta ANTHROPIC_API_KEY en .env")


def ask(client, content):
    with client.messages.stream(model=MODEL, max_tokens=32000, messages=[{"role": "user", "content": content}]) as s:
        r = s.get_final_message()
    print(f"  tokens: {r.usage.input_tokens} entrada, {r.usage.output_tokens} salida", flush=True)
    return "".join(b.text for b in r.content if b.type == "text")


def transcript(video):
    import json
    words = video.parent / "_analisis" / video.stem / "words.json"
    if words.exists():
        ws = json.loads(words.read_text())
        return " ".join(f"[{w['s']:.2f}]{w['w']}" for w in ws)
    return "(sin transcripción)"


def per_ref(client, video, out):
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                               capture_output=True, text=True).stdout)
    fps = min(FPS, MAX_FRAMES / dur)
    content = []
    with tempfile.TemporaryDirectory() as d:
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vf", f"fps={fps},scale=432:768", "-q:v", "4",
                        f"{d}/f%04d.jpg"], check=True)
        for i, p in enumerate(sorted(Path(d).glob("f*.jpg"))):
            content.append({"type": "text", "text": f"[{(i + 0.5) / fps:.2f}]"})
            content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                        "data": base64.b64encode(p.read_bytes()).decode()}})
    content.append({"type": "text", "text": PER_REF.format(fps=f"{fps:.2f}", transcript=transcript(video), channel=CHANNEL)})
    out.write_text(ask(client, content))


CHANNEL = sys.argv[3] if len(sys.argv) > 3 else "Zack D. Films"


def main():
    refs, fuentes = Path(sys.argv[1]), Path(sys.argv[2])
    base = refs / "_analisis"
    base.mkdir(exist_ok=True)
    client = anthropic.Anthropic(api_key=load_key())
    names = {}
    idx = refs / "indice.txt"
    if idx.exists():
        names = dict(l.split(" = ", 1) for l in idx.read_text().splitlines() if " = " in l)
    reports = []
    for v in sorted(refs.glob("*.mp4"), key=lambda v: int(v.stem) if v.stem.isdigit() else 0):
        out = base / f"spec_{v.stem}.md"
        print(f"> {v.name}", flush=True)
        if not out.exists():
            per_ref(client, v, out)
        reports.append(f"## Ref {v.stem}: {names.get(v.stem, v.name)}\n\n{out.read_text()}")
    tutorials = "\n\n".join(p.read_text() for p in sorted(fuentes.glob("opus-*.md"))) or "(ninguna)"
    print("> uniendo", flush=True)
    spec = ask(client, [{"type": "text", "text": MERGE.format(channel=CHANNEL, n=len(reports), reports="\n\n".join(reports), tutorials=tutorials)}])
    (fuentes / "especificacion-tecnica-del-estilo.md").write_text(
        f"# Especificación del estilo ({CHANNEL})\n\n"
        f"- Refs: {', '.join(names.values()) or refs}\n- Fecha: 2026-10-29\n\n" + spec)
    print("listo", flush=True)


if __name__ == "__main__":
    main()
