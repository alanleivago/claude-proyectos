"""Expresiones faciales coquetas de la protagonista de @missmedannypsx -> female_faces/ + EXPRESIONES_MUJER.md.
Uso (desde la raíz): python fuentes/missmedannypsx/caras.py   (requiere haber corrido analizar.py videos)"""
import base64, json, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from analizar import D, SRC, CONTEXTO, ask, frames  # noqa: E402

FACES = D / "female_faces"
FACES.mkdir(exist_ok=True)

DETECT = CONTEXTO + """

Arriba: fotogramas de un video (1 por segundo, timestamp en segundos, imagen 432x768 de un original 1080x1920).
Buscá TODOS los momentos en que la protagonista femenina hace una expresión facial coqueta, sexy, pícara o
enamorada (mirada de reojo, párpados caídos, guiño, sonrisa ladeada, morderse el labio, sonrojo, cejas levantadas,
beso, sonrisa satisfecha, mirada de arriba abajo, puchero, etc.) y donde su cara se vea razonablemente grande.
Respondé SOLO un JSON: [{"t": segundo_float, "nombre": "slug-corto", "bbox": [x0, y0, x1, y1]}]
con bbox = caja de SU CARA (con pelo) en coordenadas normalizadas 0–1 del cuadro. Máximo 10. [] si no hay."""


def detect(vid):
    cache = SRC / f"{vid}_caras.json"
    if cache.exists():
        return json.loads(cache.read_text(encoding="utf-8"))
    content = []
    for i, p in enumerate(frames(vid)):
        content.append({"type": "text", "text": f"[{i + 0.5:.1f} s]"})
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                    "data": base64.b64encode(p.read_bytes()).decode()}})
    content.append({"type": "text", "text": DETECT})
    print(f"> detect {vid}", flush=True)
    txt = ask(content, 16000)
    m = re.search(r"\[.*\]", txt, re.S)
    data = json.loads(m.group(0)) if m else []
    cache.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return data


def crop(vid, f):
    x0, y0, x1, y1 = f["bbox"]
    cx, cy, s = (x0 + x1) / 2 * 1080, (y0 + y1) / 2 * 1920, max((x1 - x0) * 1080, (y1 - y0) * 1920) * 1.4
    s = max(120, min(s, 1080))
    x, y = max(0, min(cx - s / 2, 1080 - s)), max(0, min(cy - s / 2, 1920 - s))
    name = re.sub(r"[^a-z0-9-]+", "-", f["nombre"].lower())
    dst = FACES / f"{vid[-6:]}_{float(f['t']):05.1f}s_{name}.jpg"
    if not dst.exists():
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(f["t"]), "-i", str(SRC / f"{vid}.mp4"), "-frames:v", "1",
                        "-vf", f"crop={int(s)}:{int(s)}:{int(x)}:{int(y)},scale=512:512:flags=neighbor", "-q:v", "2", str(dst)], check=True)
    return dst


PROMPT = CONTEXTO + """

Arriba: recortes (close-up) de la cara de la protagonista femenina en momentos coquetos/sexis de los 8 videos. Cada
recorte va precedido de su nombre de archivo (últimos 6 dígitos del id del video _ segundo _ slug). Algunos recortes
pueden estar mal (otra persona, cara tapada): descartalos.

ESCRIBE EN ESPAÑOL EXPRESIONES_MUJER.md (frontmatter type: reference, tags) para que un artista dibuje cada expresión
como una celda de cara pixel art para nuestra camarera low poly PS1:
- Una intro de 3–4 líneas: cómo están hechas las caras en el original (¿textura cambiada por expresión? ¿resolución de
  la textura de cara? ¿cuántos px tiene el ojo? ¿contorno? ¿pestañas? ¿sonrojo como bloque de color?), paleta hex.
- Agrupá las expresiones únicas (fusioná repetidas listando todas las apariciones). Para cada una:
  ### Nombre (es/en)
  - Apariciones: video id corto + t s (todas)
  - Imagen: link markdown relativo `female_faces/<archivo>.jpg` (el más claro)
  - Ojos: forma, apertura del párpado superior (en % sobre el ojo abierto), párpado inferior, posición del iris
    (centro/arriba/abajo/izq/der, cuánto lo tapa el párpado), brillo, pestañas, diferencia entre ojo izq y der.
  - Cejas: forma, altura, ángulo de cada una (grados aproximados), asimetría.
  - Boca: forma (línea, curva, ladeada a qué lado), apertura, dientes/lengua, labio mordido, comisuras.
  - Mejillas: sonrojo (color hex, forma, tamaño), otras marcas (corazón, brillo, gota).
  - Cabeza/mirada: inclinación, hacia dónde mira, qué hace el cuerpo en ese momento.
  - Para qué sirve en la historia (qué momento coqueto) y cómo adaptarla a la camarera.
  - Celda pixel art sugerida: una guía en texto de 16x16 o 24x24 (filas con caracteres: . vacío, # línea oscura,
    o iris, w blanco del ojo, r sonrojo, m boca) SOLO para la zona de ojos+cejas y otra pequeña para la boca.
- Cierra con: tabla resumen (expresión | prioridad A/B/C para la camarera | combinación ojos+boca reutilizable) y el
  set mínimo de celdas (cuántos ojos y bocas distintos hacen falta para cubrir todo combinando)."""


def main():
    ids = [p.stem for p in SRC.glob("*.mp4")]
    with ThreadPoolExecutor(4) as ex:
        found = dict(zip(ids, ex.map(detect, ids)))
    crops = [crop(v, f) for v, fs in found.items() for f in fs]
    print(f"  {len(crops)} recortes", flush=True)
    content = []
    for c in crops:
        content.append({"type": "text", "text": c.name})
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                    "data": base64.b64encode(c.read_bytes()).decode()}})
    content.append({"type": "text", "text": PROMPT})
    (D / "EXPRESIONES_MUJER.md").write_text(ask(content, 64000) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
