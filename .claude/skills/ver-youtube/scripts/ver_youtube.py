"""Mira videos de YouTube con Gemini y guarda notas de aprendizaje en fuentes/<tema>/<titulo>.md.

Uso:
    python ver_youtube.py --tema "edicion de video" URL [URL ...]
"""
import argparse
import datetime
import json
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

MODEL = "gemini-3.8-flash"

PROMPT = """Mirá este video completo (imagen y audio) y escribí notas de aprendizaje en español.
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


def load_env_key(name="GEMINI_API_KEY"):
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


def wait(client, interaction, retries=12, max_s=900):
    """Espera una interacción en background; tolera errores temporales (500 'high demand') al consultar."""
    deadline = time.time() + max_s
    while interaction.status == "in_progress":
        if time.time() > deadline:
            raise TimeoutError(f"Gemini no terminó en {max_s} s")
        time.sleep(5)
        try:
            interaction = client.interactions.get(interaction.id)
        except Exception as e:
            retries -= 1
            if retries < 0:
                raise
            print(f"  aviso: {str(e)[:120]} — reintento", file=sys.stderr, flush=True)
            time.sleep(20)
    return interaction


def ask_gemini(client, url, tema, model):
    # background=True: el video puede tardar minutos en procesarse y la conexión directa se corta
    interaction = client.interactions.create(
        model=model,
        input=[
            {"type": "video", "uri": url},
            {"type": "text", "text": PROMPT.format(tema=tema)},
        ],
        background=True,
    )
    interaction = wait(client, interaction)
    if interaction.status != "completed":
        raise RuntimeError(f"estado {interaction.status}")
    return interaction.output_text


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--tema", required=True)
    p.add_argument("--out", default="fuentes", help="carpeta base (default: fuentes)")
    p.add_argument("--model", default=MODEL)
    p.add_argument("--force", action="store_true", help="sobrescribir notas existentes")
    p.add_argument("urls", nargs="+")
    args = p.parse_args()

    from google import genai

    client = genai.Client(api_key=load_env_key())
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
            notes = ask_gemini(client, url, args.tema, args.model).strip()
        except Exception as e:
            failed += 1
            print(f"  ERROR con Gemini: {e}", file=sys.stderr)
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
