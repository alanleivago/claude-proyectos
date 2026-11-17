"""Analiza los 8 videos top de @missmedannypsx con la API (créditos del plan Max).
Uso (desde la raíz del proyecto):
  python fuentes/missmedannypsx/analizar.py videos   -> videos/<id>.md + anims json
  python fuentes/missmedannypsx/analizar.py sintesis -> SINTESIS.md, ESTILO.md, ANIMS_HOMBRE.md, ANIMS_MUJER.md
Medios en src/ (git-ignorado)."""
import base64, json, re, subprocess, sys, wave
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / ".claude/skills/ver-youtube/scripts"))
from ver_youtube import load_env_key, mmss  # noqa: E402
import anthropic

D = Path(__file__).parent
SRC, OUT = D / "src", D / "videos"
MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic(api_key=load_env_key())

CONTEXTO = """Contexto: vamos a crear un formato nuevo de shorts protagonizado por NUESTRA camarera (mujer low poly estilo PS1:
corsé negro, mangas abullonadas blancas, shorts azul marino o jeans) y un personaje masculino pretendiente.
Estudiamos la cuenta TikTok @missmedannypsx ("Arinna ♡ Miss Me, Danny?", rom-com PS1 por episodios, 'the girl across
the hall', 14.9K seguidores, publica lun/mié/vie/dom 10 am ET, Patreon con episodios antes)."""


def ask(content, max_tokens=48000):
    with client.messages.stream(model=MODEL, max_tokens=max_tokens, messages=[{"role": "user", "content": content}]) as s:
        r = s.get_final_message()
    print(f"  tokens: {r.usage.input_tokens} in, {r.usage.output_tokens} out", flush=True)
    return "".join(b.text for b in r.content if b.type == "text").strip()


def stats(vid):
    d = json.loads((SRC / f"{vid}.info.json").read_text(encoding="utf-8"))
    return {k: d.get(k) for k in ("id", "view_count", "like_count", "comment_count", "repost_count", "duration",
                                  "upload_date", "description")}


def transcribe(vid):
    out = SRC / f"{vid}.txt"
    if out.exists():
        return out.read_text(encoding="utf-8")
    import numpy as np
    from faster_whisper import WhisperModel
    wav = SRC / f"{vid}.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(SRC / f"{vid}.mp4"), "-ac", "1", "-ar", "16000", str(wav)], check=True)
    with wave.open(str(wav)) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio, language="en")
    txt = "\n".join(f"[{s.start:.1f}-{s.end:.1f}] {s.text.strip()}" for s in segs) or "(sin voz)"
    out.write_text(txt, encoding="utf-8")
    wav.unlink()
    return txt


def frames(vid):
    fd = SRC / f"{vid}_frames"
    if not fd.exists():
        fd.mkdir()
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(SRC / f"{vid}.mp4"), "-vf", "fps=1,scale=432:-2",
                        "-q:v", "4", str(fd / "f%04d.jpg")], check=True)
    return sorted(fd.glob("f*.jpg"))  # f0001 = 0.5 s aprox (centro del primer segundo)


def cortes(vid):
    """Cambios de plano detectados por ffmpeg (scene > 0.3)."""
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", str(SRC / f"{vid}.mp4"), "-vf", "select='gt(scene,0.3)',showinfo",
                        "-an", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="ignore")
    return [round(float(t), 2) for t in re.findall(r"pts_time:([\d.]+)", r.stderr)]


PROMPT_VIDEO = CONTEXTO + """

Arriba: fotogramas de UN video de la cuenta (1 por segundo, con timestamp en segundos), la transcripción Whisper (con
segundos), los cortes de plano detectados por ffmpeg y las estadísticas. Analizalo a fondo. ESCRIBE EN ESPAÑOL.
Respondé SOLO con este markdown (sin intro ni cierre):

## Datos
Vistas, likes, comentarios, compartidos, duración, fecha, caption original, episodio (si lo dice).

## Gancho (0–2 s)
Qué se ve y se oye/lee exactamente en los primeros 2 s y por qué retiene.

## Beats de la historia
Tabla | t (s) | beat | qué pasa | diálogo / texto en pantalla (literal, en inglés) |. Cubrí todo el video.

## Personajes y roles
Cada personaje: aspecto (ropa, pelo, colores hex aproximados, proporciones), rol en la dinámica, personalidad.

## Planos y cámara
Tabla | # | t inicio–fin | encuadre (PG/PM/PP/PD/inserto/POV) | ángulo y altura | movimiento | lente aparente |.
Después: ritmo de corte (planos totales, s/plano), sensación de fps de la animación (¿12 fps? ¿30?), look PS1
(resolución interna, texturas, dithering, filtros, viñeta, grano), iluminación y paleta.

## Texto en pantalla
Fuente (describila y proponé una equivalente libre), tamaño relativo, color, contorno/caja, posición, cómo aparece
(typewriter, pop, palabra a palabra), cajas de diálogo estilo videojuego si hay, nombres de hablante.

## Sonido
Música (estilo, BPM aproximado, cuándo cambia), SFX (cuáles y cuándo), voces: ¿hay voz hablada? ¿TTS o real?
¿sonidos de "blip" tipo videojuego en vez de voz? Silencios usados.

## Final / CTA
Cómo termina (cliffhanger, remate, "Ep X"), texto final, llamado a seguir.

## Por qué funcionó (o no)
3–5 puntos concretos.

## Animaciones del HOMBRE
Lista exhaustiva de cada animación/gesto/pose del personaje masculino (idle de pie, caminar, hablar/gesticular,
reacciones, coqueteo, tics nerviosos, sentarse, etc.). Para cada una: **[t s]** nombre corto — descripción precisa
para animarla (partes del cuerpo, dirección, amplitud, duración, loop o one-shot, timing, expresión de la cara).

## Animaciones de la MUJER
Igual, más breve.

Al final, un bloque ```json con la lista de esas animaciones para extraer fotogramas:
[{"quien":"hombre"|"mujer","t":segundos_float_en_el_momento_mas_claro,"nombre":"slug-corto"}]
"""


def analizar_video(vid):
    out = OUT / f"{vid}.md"
    if out.exists():
        return
    st = stats(vid)
    content = []
    for i, p in enumerate(frames(vid)):
        content.append({"type": "text", "text": f"[{i + 0.5:.1f} s]"})
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                    "data": base64.b64encode(p.read_bytes()).decode()}})
    content.append({"type": "text", "text": f"ESTADÍSTICAS: {json.dumps(st, ensure_ascii=False)}\n\nCORTES (s): {cortes(vid)}\n\n"
                                            f"TRANSCRIPCIÓN:\n{transcribe(vid)}\n\n{PROMPT_VIDEO}"})
    print(f"> {vid}", flush=True)
    txt = ask(content)
    out.write_text(f"# {vid}\n\n- Link: https://www.tiktok.com/@missmedannypsx/video/{vid}\n\n{txt}\n", encoding="utf-8")


def grabs():
    """Extrae los fotogramas a resolución completa de los json de animaciones."""
    for md in sorted(OUT.glob("*.md")):
        vid = md.stem
        m = re.search(r"```json\s*(\[.*?\])\s*```", md.read_text(encoding="utf-8"), re.S)
        if not m:
            print(f"  sin json en {vid}")
            continue
        for a in json.loads(m.group(1)):
            folder = D / ("male_anims" if a["quien"] == "hombre" else "female_anims")
            folder.mkdir(exist_ok=True)
            name = re.sub(r"[^a-z0-9-]+", "-", a["nombre"].lower())
            dst = folder / f"{vid[-6:]}_{float(a['t']):05.1f}s_{name}.jpg"
            if not dst.exists():
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(a["t"]), "-i", str(SRC / f"{vid}.mp4"),
                                "-frames:v", "1", "-vf", "scale=540:-2", "-q:v", "3", str(dst)], check=True)


def sintesis():
    vids = sorted(OUT.glob("*.md"), key=lambda p: -stats(p.stem)["view_count"])
    corpus = "\n\n".join(p.read_text(encoding="utf-8") for p in vids)
    tabla = "\n".join(f"{s['id']} | {s['view_count']} vistas | {s['like_count']} likes | {s['duration']} s | {s['upload_date']} | {s['description'][:90]}"
                      for s in (stats(p.stem) for p in vids))
    template = (ROOT / "fuentes/jongmin-design/remake/ESTILO.md").read_text(encoding="utf-8")
    grabs_m = "\n".join(sorted(f.name for f in (D / "male_anims").glob("*.jpg")))
    grabs_f = "\n".join(sorted(f.name for f in (D / "female_anims").glob("*.jpg")))
    base = f"{CONTEXTO}\n\nTABLA (ordenada por vistas):\n{tabla}\n\nANÁLISIS POR VIDEO:\n{corpus}\n\n"

    jobs = {
        "SINTESIS.md": base + """ESCRIBE EN ESPAÑOL un markdown SINTESIS.md (frontmatter: type: summary, status: active, tags) con:
## Top videos (tabla con vistas, likes, ratio like/vista, duración, premisa en una línea)
## La fórmula: premisas recurrentes, dinámicas de la relación (coqueteo, rechazo, celos, giros, malentendidos), quién
tiene el poder en cada escena, estructura por episodio, duración, patrones de publicación y caption, por qué el top
(sugar) rindió 2-3x más que el resto.
## Lo visualmente distintivo
## Qué necesitamos para replicarlo (sets, clips/animaciones, props, expresiones, texto, audio), en lista accionable.
## 8 ideas de videos con nuestra camarera + pretendiente, RANKEADAS (1 = la más fuerte): para cada una, título,
premisa en una línea, gancho de 0–2 s (texto/acción exacta), y por qué debería funcionar según los datos.
Sin "!". Sé concreto y sin relleno.""",
        "ESTILO.md": base + f"""PLANTILLA (otro estilo nuestro, usala como modelo de estructura, nivel de detalle y tono; NO copies su contenido):
{template}

ESCRIBE EN ESPAÑOL un ESTILO.md (frontmatter type: spec) que especifique cómo replicar el estilo de @missmedannypsx con
nuestra camarera + pretendiente: 1 Formato (tabla por video: dur, planos, s/plano), 2 Texto/subtítulos/cajas de diálogo
(fuente equivalente, tamaño en px de 1080x1920, color hex, contorno, posición, animación), 3 Imagen (look PS1,
resolución interna, texturas, paleta, iluminación, post), 4 Cámara (lentes, alturas, movimientos, ritmo, transiciones,
patrones), 5 Personajes (los nuestros: diseño, actuación, expresiones, animaciones clave), 6 Sonido (música, SFX, voz o
blips, loudness si se puede inferir), 7 Estructura recurrente en beats con tiempos, 8 Pie del post / caption, 9 Kit a
construir una vez, 10 Orden de producción sugerido. Marcá la confianza de cada dato como (obs.) observado en
fotogramas o (inf.) inferido.""",
        "ANIMS_HOMBRE.md": base + f"""FOTOGRAMAS EXTRAÍDOS en male_anims/ (nombre = últimos 6 dígitos del id _ segundo _ slug):
{grabs_m}

ESCRIBE EN ESPAÑOL ANIMS_HOMBRE.md: catálogo consolidado de TODAS las animaciones/gestos/poses del personaje
masculino en los 8 videos, agrupado por categoría (idle de pie, caminar, hablar/gesticular, reacciones, coqueteo,
nervios/tics, sentarse, interacción con objetos, con la mujer, otros). Fusioná duplicados pero listá todas las
apariciones. Para cada animación: nombre, apariciones (video id corto + t s), imagen de referencia como link markdown
relativo `male_anims/<archivo>.jpg` (elegí de la lista el más cercano; no inventes nombres), descripción precisa para
animarla (huesos/partes, dirección, amplitud en grados o cm, duración en s, loop/one-shot, curva, expresión facial),
y prioridad para nuestro pretendiente (A imprescindible / B útil / C opcional). Termina con una lista "kit mínimo" de
animaciones a hacer primero.""",
        "ANIMS_MUJER.md": base + f"""FOTOGRAMAS EXTRAÍDOS en female_anims/:
{grabs_f}

ESCRIBE EN ESPAÑOL ANIMS_MUJER.md: catálogo de animaciones de la protagonista femenina en los 8 videos, agrupado por
categoría, cada una con apariciones (id corto + t s), link `female_anims/<archivo>.jpg` de la lista (no inventes) y
prioridad A/B/C para nuestra camarera. Las animaciones comunes van breves (1–2 líneas). Las POSES Y ANIMACIONES
COQUETAS/SEXIS (inclinarse, cadera, apoyarse en el marco, jugar con el pelo, mirar por encima del hombro, acercarse,
tocarle el pecho, caminar con intención, etc.) van en una sección propia y DETALLADA: huesos/partes, dirección, amplitud
en grados o cm, duración en s, loop/one-shot, curva, peso del cuerpo, qué cara acompaña y qué provoca en él. Cierra con
el kit mínimo.""",
    }

    def run(item):
        name, prompt = item
        print(f"> {name}", flush=True)
        (D / name).write_text(ask([{"type": "text", "text": prompt}], 64000) + "\n", encoding="utf-8")

    with ThreadPoolExecutor(4) as ex:
        list(ex.map(run, jobs.items()))


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    ids = [p.stem for p in SRC.glob("*.mp4")]
    if sys.argv[1] == "videos":
        for v in ids:  # whisper + frames en serie (CPU)
            transcribe(v); frames(v)
        with ThreadPoolExecutor(4) as ex:
            list(ex.map(analizar_video, ids))
        grabs()
    elif sys.argv[1] == "sintesis":
        sintesis()
