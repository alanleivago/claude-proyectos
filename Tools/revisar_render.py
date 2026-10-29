"""Revisa un render contra las reglas de su estilo con Claude (API, créditos del plan Max).

Saca fotogramas con timestamp, transcribe la voz con Whisper local y pide a Claude una lista
de fallos por regla. Deja el reporte en <video>_revision.md al lado del video.

Uso:
    python tools/revisar_render.py --estilo ava pieces/zombie-girl/out/zombie-01.mp4
    python tools/revisar_render.py --estilo pov3d --nota "versión EN, plano 3 nuevo" video.mp4
    python tools/revisar_render.py --reglas mis_reglas.md video.mp4
"""
import argparse
import base64
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

MODEL = "claude-sonnet-5-5"
MAX_FRAMES = 80
# la carpeta de memoria cambia de nombre según la máquina (Windows / Mac): se busca la que tenga el archivo
MEMORY_DIRS = sorted((Path.home() / ".claude/projects").glob("*/memory"))
ESTILOS = {
    "ava": ["ava-rules.md", "zombie-channel.md"],
    "mechayuki": ["mechayuki-rules.md", "digger-channel.md", "zero-fem-model.md"],
    "pov3d": ["pov3d-style.md"],
    "cartoon3d": ["cartoon3d-style.md", "cartoon3d-level.md", "cartoon3d-rules-2.md"],
    "yt-agente": ["yt-agente-style.md"],
    "sinaboto": ["sinaboto-style.md"],
    "emberlite": ["emberlite-style.md"],
    "scroll3d": ["scroll3d-style.md"],
}

PROMPT = """Sos el revisor de calidad de este canal. Arriba están las REGLAS del estilo (todas las correcciones que
el creador ya pidió). Abajo vienen fotogramas del render, cada uno con su timestamp, y la transcripción de la voz.
{nota}
Revisá el render regla por regla y respondé SOLO con este markdown en español:

## Veredicto
Una línea: LISTO / CASI (fallos menores) / NO LISTO, y por qué.

## Fallos
Lista ordenada de más grave a menos. Cada ítem: **[MM:SS]** qué está mal → qué regla rompe → cómo arreglarlo.
Solo fallos que se vean en los fotogramas o en la transcripción; no inventes.

## Cumple
Reglas que se ven bien cumplidas (una línea cada una, breve).

## No verificable
Reglas que no se pueden juzgar con fotogramas + transcripción (sonido, música, movimiento fino entre fotogramas,
cortes de voz). Indicá qué herramienta usar (p. ej. earshot timeline/critique para audio).
"""


def load_env_key(name="ANTHROPIC_API_KEY"):
    for folder in [Path.cwd(), *Path.cwd().parents]:
        env = folder / ".env"
        if env.is_file():
            for line in env.read_text(encoding="utf-8-sig").splitlines():
                key, sep, value = line.strip().partition("=")
                value = value.strip().strip('"').strip("'")
                if sep and value and key.strip() == name:
                    return value
    sys.exit(f"No encontré {name} en ningún .env (desde {Path.cwd()} hacia arriba).")


def mmss(t):
    return f"{int(t) // 60:02d}:{t % 60:04.1f}"


def duration(video):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def transcribe(video, tmp):
    import numpy as np
    from faster_whisper import WhisperModel

    wav = tmp / "a.wav"
    r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vn", "-ac", "1", "-ar", "16000", str(wav)])
    if r.returncode or not wav.exists():
        return ""
    # se pasan las muestras ya decodificadas: la versión instalada de av rompe el decode de faster-whisper
    with wave.open(str(wav)) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segments, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio)
    return "\n".join(f"[{mmss(s.start)}-{mmss(s.end)}] {s.text.strip()}" for s in segments)


def frames(video, tmp, dur):
    step = max(0.5, dur / MAX_FRAMES)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vf",
                    f"fps=1/{step},scale='if(gt(iw,ih),768,-2)':'if(gt(iw,ih),-2,768)'",
                    "-q:v", "4", str(tmp / "f%04d.jpg")], check=True)
    return [(i * step, p) for i, p in enumerate(sorted(tmp.glob("f*.jpg")))]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser()
    p.add_argument("video")
    p.add_argument("--estilo", choices=sorted(ESTILOS))
    p.add_argument("--reglas", nargs="*", default=[], help="archivos .md de reglas extra")
    p.add_argument("--nota", default="", help="contexto: qué es este render, qué cambió")
    p.add_argument("--model", default=MODEL)
    args = p.parse_args()

    files = [next((d / f for d in MEMORY_DIRS if (d / f).exists()), Path(f)) for f in ESTILOS.get(args.estilo, [])]
    files += [Path(f) for f in args.reglas]
    if not files:
        sys.exit("Indicá --estilo o --reglas.")
    rules = "\n\n".join(f"### {f.name}\n{f.read_text(encoding='utf-8')}" for f in files if f.exists())
    video = Path(args.video)

    import anthropic

    with tempfile.TemporaryDirectory() as d:
        tmp = Path(d)
        dur = duration(video)
        transcript = transcribe(video, tmp)
        content = []
        for t, f in frames(video, tmp, dur):
            content.append({"type": "text", "text": f"[{mmss(t)}]"})
            content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                        "data": base64.b64encode(f.read_bytes()).decode()}})
    nota = f"Contexto del creador: {args.nota}\n" if args.nota else ""
    content.append({"type": "text", "text": f"TRANSCRIPCIÓN DE LA VOZ:\n{transcript or '(sin voz)'}\n\n"
                                            + PROMPT.format(nota=nota)})

    client = anthropic.Anthropic(api_key=load_env_key(), timeout=600)
    # las reglas van en system con caché: revisar varias versiones del mismo estilo sale más barato
    # stream: una respuesta larga sin streaming corta la conexión
    with client.messages.stream(
        model=args.model, max_tokens=16000,  # el modelo piensa antes de responder: con 4000 se queda sin texto
        system=[{"type": "text", "text": f"REGLAS DEL ESTILO:\n\n{rules}", "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": content}],
    ) as s:
        r = s.get_final_message()
    text = "".join(b.text for b in r.content if b.type == "text").strip()
    out = video.with_name(video.stem + "_revision.md")
    out.write_text(f"# Revisión de {video.name}\n\n- Estilo: {args.estilo or '-'}\n- Duración: {dur:.1f} s\n\n"
                   + text + "\n", encoding="utf-8")
    print(f"tokens: {r.usage.input_tokens} entrada, {r.usage.output_tokens} salida")
    print(f"guardado {out}")
    print(next((l for l in text.splitlines() if l.strip() and not l.startswith("#")), ""))


if __name__ == "__main__":
    main()
