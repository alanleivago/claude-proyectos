"""Desglose toma por toma de cada short de referencia con Gemini (Files API).

Uso:
    python gemini_shots.py "Ref 3D cartoon animations"
Salida: <carpeta>/_analisis/<n>/tomas_gemini.md
"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / ".claude" / "skills" / "ver-youtube" / "scripts"))
from ver_youtube import MODEL, load_env_key, wait  # noqa: E402

PROMPT = """Este es un short vertical de animación "3D cartoon" (personajes con cabeza esfera, cuerpo tipo frijol,
brazos de palo, caras dibujadas). Lo voy a recrear en código, así que necesito un desglose técnico exacto, en español.

1. **Guion**: transcripción completa, separada en cláusulas.
2. **Tabla de tomas** (una fila por toma; una toma termina en corte seco, disolvencia o transición de cámara continua):
   | # | inicio MM:SS.ff | fin | cláusula narrada | qué se ve (set, personajes, props) | encuadre (plano general/medio/primer plano/detalle) | movimiento de cámara (push-in, pull-out, pan, orbit, tilt, tracking, fly-through) y velocidad | transición de salida (corte, disolvencia, vuelo, zoom a pupila...) |
3. **Caras**: cada cambio de expresión del protagonista con su timestamp, nombre de la expresión (neutral, sonrisa, pánico, smug, etc.), y la palabra que suena en ese momento. Describí cómo están dibujados ojos, cejas y boca en cada una.
4. **Gestos y acciones del cuerpo**: qué hace cada personaje y cuándo (caminar, señalar, encoger hombros, saltar, sentarse).
5. **Datos como objetos**: cada número o dato mencionado y en qué objeto físico se muestra (contador, reloj, calendario, gráfico, cartel) y cómo se anima.
6. **Look**: paleta dominante, iluminación (luz clave, contraluz, emisivos, glow), profundidad de campo, viñeta, grano, contorno de tinta, materiales.
7. **Subtítulos**: cuántas palabras a la vez, fuente (forma), color, contorno, posición vertical (% de la altura), animación de entrada, si resaltan palabras.
8. **Sonido**: música (género, tempo, nivel relativo a la voz), lista de SFX con timestamp y la acción que acompañan.
9. **Gancho y cierre**: cómo arranca en los primeros 3 s y cómo la última frase conecta con la primera (loop).
Sé exhaustivo y preciso con los tiempos. Sin introducción."""


def main():
    from google import genai
    folder = Path(sys.argv[1])
    client = genai.Client(api_key=load_env_key())
    for video in sorted(folder.glob("*.mp4"), key=lambda v: v.stem):
        out = folder / "_analisis" / video.stem / "tomas_gemini.md"
        if out.exists():
            continue
        out.parent.mkdir(parents=True, exist_ok=True)
        print(f"> {video.name}", flush=True)
        f = client.files.upload(file=str(video))
        while not f.state or f.state.name != "ACTIVE":
            time.sleep(5)
            f = client.files.get(name=f.name)
        it = client.interactions.create(
            model=MODEL,
            input=[{"type": "video", "uri": f.uri, "mime_type": f.mime_type},
                   {"type": "text", "text": PROMPT}],
            background=True,
        )
        it = wait(client, it)
        if it.status != "completed":
            print(f"  ERROR {it.status}", flush=True)
            continue
        out.write_text(f"# Desglose Gemini — {video.name}\n\n{it.output_text.strip()}\n", encoding="utf-8")
        print(f"  guardado {out}", flush=True)


if __name__ == "__main__":
    main()
