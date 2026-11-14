"""Desarma un video de novela corta (TikTok) plano por plano con Claude por API (créditos del plan Max).

Por video: ffmpeg detecta los cortes, saca un cuadro por plano, faster-whisper transcribe con tiempos y Claude devuelve
guion completo, gancho, estructura, lista de planos (tipo, duración, quién habla) y técnicas. Escribe <video>_analisis.md.
Con --sintesis lee todos los *_analisis.md de la carpeta y escribe FORMULA.md (la receta común).

Uso: python tools/analizar_novela.py video1.mp4 [video2.mp4 ...] [--meta meta.json] [--prompt prompt.md]
     python tools/analizar_novela.py --sintesis carpeta/
"""
import base64, json, re, subprocess, sys, tempfile, wave
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from revisar_render import MODEL, load_env_key

MAX_IMG = 95

def cuts(video):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(video), "-vf", "select='gt(scene,0.3)',showinfo", "-an", "-f", "null", "-"],
                         capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return [float(m) for m in re.findall(r"pts_time:([\d.]+)", out)]

def duration(video):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                                capture_output=True, text=True).stdout)

def words(video, tmp):
    import numpy as np
    from faster_whisper import WhisperModel
    wav = tmp / "a.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vn", "-ac", "1", "-ar", "16000", str(wav)], check=True)
    with wave.open(str(wav)) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio, language="es")
    return [(s.start, s.end, s.text.strip()) for s in segs]

def grab(video, t, tmp):
    out = tmp / f"f{t:.2f}.jpg"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.3f}", "-i", str(video), "-frames:v", "1", "-vf", "scale=300:-2", "-q:v", "6", str(out)], check=True)
    return base64.b64encode(out.read_bytes()).decode()

PROMPT = """Estos son los planos de una novela corta vertical de TikTok (cuenta @atriumstories_, telenovela mexicana hecha con IA: video generado con Google Flow "Omni Flash", personajes diseñados antes como hojas de personaje).
Recibes UN cuadro por plano (con su número, inicio y duración) y la transcripción con tiempos. Datos del post: {meta}

Analízalo como un guionista y editor que quiere REPLICAR la fórmula. Responde SOLO este markdown en español:

## Ficha
duración, nº de planos, duración media de plano, voz (narrador / diálogos de los personajes / ambos), música, subtítulos/textos en pantalla (estilo, posición), formato (vertical/horizontal, bandas).

## Guion completo
La transcripción limpia y ordenada como guion: [MM:SS] PERSONAJE: línea (o NARRADOR). Corrige errores obvios de Whisper.

## Gancho (primeros 3-5 s)
Qué se ve y qué se dice exactamente, y por qué retiene.

## Estructura por bloques
Tabla: bloque | tiempo | función dramática (gancho, humillación, giro, revelación, cliffhanger...) | qué pasa.

## Lista de planos
Tabla compacta: nº | t | dur | tamaño de plano (PG/PM/PP/PPP/detalle/plano-contraplano) | qué se ve | quién habla. Todos los planos.

## Técnicas de edición y cámara
Ritmo de corte, cuándo acelera, cómo se usan los primeros planos, reacciones, cortes en mitad de la frase, movimientos de cámara del generador, transiciones, sonido.

## Personajes y mundo
Cada personaje: aspecto (edad, ropa, rasgos fijos), rol (víctima, villano, protector poderoso...). Locaciones. ¿Se mantiene la consistencia entre planos?

## Look visual
Iluminación, color, lente, realismo, artefactos de IA visibles.

## Cierre / CTA
Cómo termina, qué deja abierto, qué pide.
"""

SINTESIS = """Abajo están los análisis plano por plano de los videos más vistos de @atriumstories_ (telenovelas mexicanas cortas hechas con IA en Google Flow / Omni Flash). Vistas de cada uno en su cabecera.
Escribe en español la FÓRMULA para replicarlos, concreta y accionable (nada genérico). Solo este markdown:

## Por qué funcionan (diferencia entre los de 1M+ y los de menos)
## Temas y arquetipos (lista de premisas que repiten, personajes fijos como Don Aurelio, valores)
## Plantilla de guion (bloques con segundos y función, para Parte 1 y para Parte final)
## Ganchos (patrones exactos de la primera línea/plano, con ejemplos reales)
## Diálogo (cómo hablan, largo de las líneas, narrador sí/no, frases tipo)
## Edición (duración de plano, ritmo, plano-contraplano, reacciones, música, subtítulos)
## Cámara y planos que pide al generador
## Look y personajes (cómo se ven, consistencia, qué hojas de personaje hacen falta)
## Series y partes (cómo corta entre partes, cliffhangers, títulos y descripciones del post, hashtags)
## Receta de producción con Flow (pasos: hoja de personaje → planos de 8 s → montaje), con lo que se deduce de los videos
"""

def ask(client, content):
    with client.messages.stream(model=MODEL, max_tokens=32000, messages=[{"role": "user", "content": content}]) as s:
        msg = s.get_final_message()
    return "".join(b.text for b in msg.content if b.type == "text")

def mmss(t): return f"{int(t // 60):02d}:{int(t % 60):02d}"

def main():
    sys.stdout.reconfigure(encoding="utf-8")
    args = sys.argv[1:]
    import anthropic
    client = anthropic.Anthropic(api_key=load_env_key(), timeout=1800)
    if args[0] == "--sintesis":
        d = Path(args[1])
        texto = "\n\n---\n\n".join(f"# {p.stem}\n{p.read_text(encoding='utf-8')}" for p in sorted(d.glob("*_analisis.md")))
        (d / "FORMULA.md").write_text(ask(client, [{"type": "text", "text": SINTESIS + "\n\n" + texto}]), encoding="utf-8")
        print(d / "FORMULA.md"); return
    prompt = PROMPT
    if "--prompt" in args:
        i = args.index("--prompt"); prompt = Path(args[i + 1]).read_text(encoding="utf-8"); args = args[:i] + args[i + 2:]
    meta = {}
    if "--meta" in args:
        i = args.index("--meta"); meta = json.loads(Path(args[i + 1]).read_text(encoding="utf-8")); args = args[:i] + args[i + 2:]
    for v in map(Path, args):
        dur = duration(v); c = [0.0] + cuts(v); shots = [(a, b) for a, b in zip(c, c[1:] + [dur]) if b - a > 0.15]
        step = max(1, -(-len(shots) // MAX_IMG))
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td); segs = words(v, tmp)
            content = [{"type": "text", "text": prompt.format(meta=json.dumps(meta.get(v.stem, {}), ensure_ascii=False))}]
            for n, (a, b) in enumerate(shots, 1):
                if (n - 1) % step: continue
                content += [{"type": "text", "text": f"Plano {n} | {mmss(a)} ({a:.1f}s) | dur {b - a:.1f}s"},
                            {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": grab(v, (a + b) / 2, tmp)}}]
            content.append({"type": "text", "text": "TRANSCRIPCIÓN:\n" + "\n".join(f"[{mmss(a)}-{mmss(b)}] {t}" for a, b, t in segs)})
            out = v.with_name(v.stem + "_analisis.md")
            vistas = meta.get(v.stem, {}).get("vistas", "")
            out.write_text(f"vistas: {vistas} | planos: {len(shots)} | dur: {dur:.0f}s\n\n" + ask(client, content), encoding="utf-8")
            print(out)

if __name__ == "__main__":
    main()
