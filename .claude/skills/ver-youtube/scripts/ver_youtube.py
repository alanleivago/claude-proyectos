"""Mira videos de YouTube con Claude (API, créditos del plan Max) y guarda notas de aprendizaje
en fuentes/<tema>/<titulo>.md.

Por cada video: yt-dlp lo baja, Whisper local transcribe el audio, ffmpeg saca fotogramas
y Claude recibe fotogramas + transcripción con timestamps.

Uso:
    python ver_youtube.py --tema "edicion de video" URL [URL ...]
"""
import argparse
import base64
import datetime
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

MODEL = "claude-sonnet-5-5"
MAX_FRAMES = 60

PROMPT = """Estos son fotogramas de un video (cada uno con su timestamp) y la transcripción de su audio.
Miralos completos y escribí notas de aprendizaje en español.
El tema que me interesa es: {tema}.

No transcribas ni copies frases largas del video: resumí con tus palabras lo que hay que aprender.
Usá timestamps MM:SS (o H:MM:SS si el video pasa de una hora) tomados del video real.

Respondé SOLO con este markdown, sin introducción ni cierre:

## De qué trata
2-4 oraciones: qué enseña, para quién y qué resultado se obtiene.

## Pasos / método
Lista numerada en orden. Cada ítem: **[MM:SS]** qué se hace y por qué.

## Lo que se ve en pantalla
Solo lo que importa y no se entiende con el audio: herramientas, menús, configuraciones
y valores exactos, código, ejemplos mostrados. Cada ítem con su [MM:SS].

## Consejos y advertencias
Tips, errores comunes, cosas que el autor recomienda evitar. Con [MM:SS] cuando aplique.

## Lo que no queda claro
Pasos saltados, cosas que se dan por sabidas, ambigüedades o datos que habría que verificar.
Si todo queda claro, decilo en una línea.
"""


def load_env_key(name="ANTHROPIC_API_KEY"):
    if os.environ.get(name):
        return os.environ[name]
    for folder in [Path.cwd(), *Path.cwd().parents]:
        env = folder / ".env"
        if env.is_file():
            for line in env.read_text(encoding="utf-8-sig").splitlines():
                key, sep, value = line.strip().partition("=")
                value = value.strip().strip('"').strip("'")
                if sep and value and key.strip().removeprefix("export ").strip() == name:
                    return value
    sys.exit(f"No encontré {name} en ningún .env (desde {Path.cwd()} hacia arriba).")


def slug(text, max_len=80):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:max_len].rstrip("-") or "sin-titulo"


def video_info(url):
    """Título y canal vía oEmbed público de YouTube (no necesita clave)."""
    q = urllib.parse.urlencode({"url": url, "format": "json"})
    try:
        with urllib.request.urlopen(f"https://www.youtube.com/oembed?{q}", timeout=20) as r:
            data = json.load(r)
        return data.get("title", ""), data.get("author_name", "")
    except Exception as e:
        print(f"  aviso: no pude leer el título ({e}); el video puede ser privado.", file=sys.stderr)
        return "", ""


def canonical_url(url):
    """youtu.be/ID?si=... o /shorts/ID -> https://www.youtube.com/watch?v=ID"""
    m = re.search(r"(?:youtu\.be/|v=|/shorts/|/live/|/embed/)([\w-]{11})", url)
    return f"https://www.youtube.com/watch?v={m.group(1)}" if m else url


def mmss(t):
    t = int(t)
    return f"{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}" if t >= 3600 else f"{t // 60:02d}:{t % 60:02d}"


def download(url, tmp):
    # sin runtime JS YouTube esconde formatos; node viene con el proyecto
    subprocess.run(["yt-dlp", "-q", "--no-warnings", "--js-runtimes", "node", "-S", "res:720", "-o", str(tmp / "v.%(ext)s"), url], check=True)
    return next(tmp.glob("v.*"))


def transcribe(video, tmp):
    import wave
    import numpy as np
    from faster_whisper import WhisperModel

    wav = tmp / "a.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-ac", "1", "-ar", "16000", str(wav)], check=True)
    # se pasan las muestras ya decodificadas: la versión instalada de av rompe el decode de faster-whisper
    with wave.open(str(wav)) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segments, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio)
    return "\n".join(f"[{mmss(s.start)}] {s.text.strip()}" for s in segments), len(audio) / 16000


def frames(video, tmp, duration):
    step = max(2.0, duration / MAX_FRAMES)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vf",
                    f"fps=1/{step},scale='if(gt(iw,ih),768,-2)':'if(gt(iw,ih),-2,768)'",
                    "-q:v", "4", str(tmp / "f%04d.jpg")], check=True)
    return [(i * step, p) for i, p in enumerate(sorted(tmp.glob("f*.jpg")))]


def ask_claude(client, url, tema, model):
    with tempfile.TemporaryDirectory() as d:
        tmp = Path(d)
        video = download(url, tmp)
        transcript, duration = transcribe(video, tmp)
        content = []
        for t, p in frames(video, tmp, duration):
            content.append({"type": "text", "text": f"[{mmss(t)}]"})
            content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                        "data": base64.b64encode(p.read_bytes()).decode()}})
    content.append({"type": "text", "text": f"TRANSCRIPCIÓN:\n{transcript or '(sin voz)'}\n\n" + PROMPT.format(tema=tema)})
    # stream: una respuesta larga sin streaming corta la conexión
    with client.messages.stream(model=model, max_tokens=16000, messages=[{"role": "user", "content": content}]) as s:
        r = s.get_final_message()
    print(f"  tokens: {r.usage.input_tokens} entrada, {r.usage.output_tokens} salida", flush=True)
    return "".join(b.text for b in r.content if b.type == "text")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--tema", required=True)
    p.add_argument("--out", default="fuentes", help="carpeta base (default: fuentes)")
    p.add_argument("--model", default=MODEL)
    p.add_argument("--force", action="store_true", help="sobrescribir notas existentes")
    p.add_argument("urls", nargs="+")
    args = p.parse_args()

    import anthropic

    client = anthropic.Anthropic(api_key=load_env_key())
    folder = Path(args.out) / slug(args.tema)
    folder.mkdir(parents=True, exist_ok=True)
    today = datetime.date.today().isoformat()
    failed = 0

    for url in map(canonical_url, args.urls):
        print(f"> {url}", flush=True)
        title, channel = video_info(url)
        path = folder / f"{slug(title or url)}.md"
        if path.exists() and not args.force:
            print(f"  ya existe {path} (usá --force para rehacer)")
            continue
        try:
            notes = ask_claude(client, url, args.tema, args.model).strip()
        except Exception as e:
            failed += 1
            print(f"  ERROR: {e}", file=sys.stderr)
            continue
        header = [f"# {title or url}", "", f"- Link: {url}"]
        if channel:
            header.append(f"- Canal: {channel}")
        header += [f"- Fecha: {today}", f"- Tema: {args.tema}", ""]
        path.write_text("\n".join(header) + "\n" + notes + "\n", encoding="utf-8")
        print(f"  guardado {path}")

    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
