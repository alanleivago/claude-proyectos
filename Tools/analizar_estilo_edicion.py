"""Desarma el ESTILO DE EDICIÓN de videos talking head con Claude por API (créditos del plan Max).

Por video: cuadros cada 1/FPS s + transcripción por palabra (faster-whisper) -> <video>_estilo.md con la especificación
exacta para replicar (subtítulos, zooms, cortes, b-roll, gráficos, SFX/música, outro con logo).
Con --sintesis lee todos los *_estilo.md de la carpeta y escribe ESTILO.md (la receta común).

Uso: python tools/analizar_estilo_edicion.py video1.mp4 [video2.mp4 ...]
     python tools/analizar_estilo_edicion.py --sintesis carpeta/
"""
import base64, subprocess, sys, tempfile, wave
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from revisar_render import MODEL, load_env_key
from analizar_novela import duration

FPS = 3

def words(video, tmp):
    import numpy as np
    from faster_whisper import WhisperModel
    wav = tmp / "a.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vn", "-ac", "1", "-ar", "16000", str(wav)], check=True)
    with wave.open(str(wav)) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segs, info = WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio, word_timestamps=True)
    return info.language, [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]

def frames(video, tmp):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vf", f"fps={FPS},scale=360:-2", "-q:v", "5",
                    str(tmp / "f%04d.jpg")], check=True)
    return sorted(tmp.glob("f*.jpg"))

PROMPT = """Este es un video vertical tipo talking head (reel/short de un cliente, marca "Stimulus"). Recibes un cuadro cada {step:.2f} s (con su tiempo) y la transcripción palabra por palabra con tiempos (idioma: {lang}).
La fuente principal del texto en pantalla es DIN Next LT Arabic Bold. El video termina con un outro que muestra el logo.

Objetivo: que un editor pueda REPLICAR este estilo de edición exactamente, en código. Sé concreto y medible (posiciones en % del cuadro 1080x1920, tamaños aprox. en px a 1080 de ancho, colores en hex aproximado, duraciones en s). Responde SOLO este markdown en español:

## Ficha
duración, encuadre del que habla (plano, centrado, fondo), nº de cortes, ritmo, idioma, música sí/no.

## Guion
transcripción limpia [MM:SS] texto (corrige errores obvios de Whisper).

## Subtítulos
palabras por bloque, mayúsculas/minúsculas, tamaño, color base, color/estilo de la palabra resaltada (si hay), contorno/sombra/caja, posición vertical, alineación, animación de entrada (pop, escala, fade...) y de cambio, sincronía con la voz, emojis.

## Títulos y textos grandes
gancho/título inicial u otros textos (no subtítulos): contenido, cuándo, posición, tamaño, color, caja, animación.

## Cortes y zoom
lista con tiempos: cortes en el habla (jump cuts), punch-ins/zoom (de % a %), si es suave o de golpe, movimientos lentos, qué los dispara (palabra clave, frase nueva).

## B-roll, gráficos e imágenes
cada inserto con tiempo: qué es (stock, captura, icono, foto), cómo entra (pantalla completa, ventana, mitad de pantalla), animación.

## Transiciones y efectos
flash, whip, glitch, desenfoque, viñeta, grading del video, grano...

## Sonido
música (tipo, volumen relativo), SFX (whoosh, pop, click) en qué eventos.

## Outro con logo
tiempo de inicio y duración, fondo, cómo aparece el logo (animación paso a paso), colores, textos o CTA, sonido. Describe el logo con detalle (forma, texto, colores) para recrearlo.

## Firma del estilo
los 5-8 rasgos que, si faltan, ya no parece este estilo.
"""

SINTESIS = """Abajo están los análisis del estilo de edición de varios videos talking head de la marca "Stimulus" (fuente DIN Next LT Arabic Bold, outro con logo).
Escribe en español la ESPECIFICACIÓN única para replicar el estilo en código (Tesseract: capas de video, texto, rectángulos, keyframes). Concreta, medible y con valores (px a 1080x1920, hex, s). Donde los videos difieran, di qué es lo constante y qué varía. Solo este markdown:

## Formato y encuadre
## Subtítulos (spec exacta)
## Títulos / textos grandes
## Cortes, zooms y ritmo (reglas de cuándo)
## B-roll y gráficos
## Transiciones y efectos
## Color
## Sonido
## Outro con logo (spec paso a paso con tiempos)
## Firma del estilo (checklist para revisar un render)
"""

def ask(client, content):
    with client.messages.stream(model=MODEL, max_tokens=32000, messages=[{"role": "user", "content": content}]) as s:
        msg = s.get_final_message()
    return "".join(b.text for b in msg.content if b.type == "text")

def main():
    sys.stdout.reconfigure(encoding="utf-8")
    args = sys.argv[1:]
    import anthropic
    client = anthropic.Anthropic(api_key=load_env_key(), timeout=1800)
    if args[0] == "--sintesis":
        d = Path(args[1])
        texto = "\n\n---\n\n".join(f"# {p.stem}\n{p.read_text(encoding='utf-8')}" for p in sorted(d.glob("*_estilo.md")))
        (d / "ESTILO.md").write_text(ask(client, [{"type": "text", "text": SINTESIS + "\n\n" + texto}]), encoding="utf-8")
        print(d / "ESTILO.md"); return
    for v in map(Path, args):
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td); lang, ws = words(v, tmp); fs = frames(v, tmp)
            step = max(1, -(-len(fs) // 95)); dt = step / FPS
            content = [{"type": "text", "text": PROMPT.format(step=dt, lang=lang)}]
            for i, f in enumerate(fs[::step]):
                content += [{"type": "text", "text": f"t={i * dt:.2f}s"},
                            {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64.b64encode(f.read_bytes()).decode()}}]
            content.append({"type": "text", "text": f"Duración total {duration(v):.2f}s\nPALABRAS:\n" + " ".join(f"[{a:.2f}]{t}" for a, b, t in ws)})
            out = v.with_name(v.stem + "_estilo.md")
            out.write_text(ask(client, content), encoding="utf-8")
            print(out)

if __name__ == "__main__":
    main()
