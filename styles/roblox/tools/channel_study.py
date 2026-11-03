"""Estudia los shorts más vistos de un canal: baja, transcribe, mide tomas y pide a Claude (API) un informe de patrones.

Uso: channel_study.py <carpeta_salida> <lista.txt (views|id|title)> [--top 6]
Deja en <carpeta>: <id>.mp4, <id>.txt (transcripción), informe.md
"""
import argparse, base64, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / ".claude/skills/ver-youtube/scripts"))
from ver_youtube import load_env_key, transcribe  # noqa: E402
# shot_stats.py corre al importarse: se toma solo su función boundaries
_src = (ROOT / "styles/cartoon3d/tools/shot_stats.py").read_text()
exec(_src[:_src.index("res = {}")])
import anthropic

FRAMES = 15

PROMPT = """Arriba están los {n} shorts más vistos del canal de YouTube "{canal}" (animaciones narradas estilo Roblox).
Por cada short: título, vistas, transcripción con tiempos, tiempos de corte medidos y {f} fotogramas.
Vamos a crear un canal propio de este estilo, en código (three.js), así que necesito un estudio a fondo, en español:

1. **Fórmula de guion**: estructura exacta que repiten (cómo abre la primera frase, cómo plantea la regla/mundo,
   escalada, giro, final y loop). Plantilla rellenable + 3 ejemplos citados de sus shorts.
2. **Narración**: persona (1ª/3ª), largo en palabras y segundos, palabras por minuto, tono, frases muletilla,
   cómo nombran al héroe (nombre, edad), diálogos citados, humor vs terror.
3. **Títulos y temas**: patrón de títulos (estructura, emojis), qué tipo de premisa explota más, lista de 10 premisas
   NUEVAS (no hechas por ellos) que encajen con su fórmula.
4. **Look**: personajes (proporciones, caras, ropa, pelo/accesorios, protagonista recurrente y su branding), sets,
   materiales, luz, paleta, saturación, efectos (bloom, DOF, viñeta).
5. **Cámara y montaje**: duración media de toma (usá los cortes medidos), tipos de plano y movimiento, transiciones,
   cómo muestran datos/números en pantalla (contadores, carteles, UI).
6. **Subtítulos y gráficos**: palabras por vez, fuente, color, contorno, posición, resaltados, emojis, branding.
7. **Sonido**: música, SFX recurrentes (vine boom, etc.), voz (tipo de TTS/real).
8. **Patrones que SIEMPRE usan** (checklist de 10-15 puntos para replicar) y **qué hace distinto a este canal**.
Sé concreto, citá timestamps y títulos. Máximo ~3000 palabras; pensá poco y escribí directo en total. Sin introducción."""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out"); ap.add_argument("lista"); ap.add_argument("--top", type=int, default=6)
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    rows = [l.split("|", 2) for l in Path(a.lista).read_text().splitlines() if l.count("|") >= 2]
    rows = sorted(rows, key=lambda r: -int(r[0]) if r[0].isdigit() else 0)[:a.top]
    content = []
    for views, vid, title in rows:
        mp4 = out / f"{vid}.mp4"
        if not mp4.exists():
            subprocess.run(["yt-dlp", "-q", "--no-warnings", "--js-runtimes", "node", "-S", "res:1080",
                            "--merge-output-format", "mp4", "-o", str(mp4), f"https://www.youtube.com/shorts/{vid}"], check=True)
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d)
            words, dur = transcribe(mp4, tmp)
            (out / f"{vid}.txt").write_text(words, encoding="utf-8")
            cuts = [round(c, 2) for c in boundaries(str(mp4))[1]]
            step = dur / FRAMES
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp4), "-vf", f"fps=1/{step},scale=360:-2",
                            "-q:v", "4", str(tmp / "f%03d.jpg")], check=True)
            content.append({"type": "text", "text": f"=== SHORT: {title} — {int(views):,} vistas — {dur:.1f} s\n"
                                                    f"Cortes (s): {cuts}\nTRANSCRIPCIÓN:\n{words}"})
            for i, p in enumerate(sorted(tmp.glob("f*.jpg"))[:FRAMES]):
                content.append({"type": "text", "text": f"[{i * step:.1f}s]"})
                content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                            "data": base64.b64encode(p.read_bytes()).decode()}})
        print(f"  {vid} {dur:.0f}s {len(cuts)} cortes", flush=True)
    content.append({"type": "text", "text": PROMPT.format(n=len(rows), canal=out.name, f=FRAMES)})
    client = anthropic.Anthropic(api_key=load_env_key())
    with client.messages.stream(model="claude-sonnet-5-5", max_tokens=64000,
                                messages=[{"role": "user", "content": content}]) as s:
        r = s.get_final_message()
    print(f"tokens {r.usage.input_tokens} in / {r.usage.output_tokens} out")
    (out / "informe.md").write_text(f"# Estudio de shorts — {out.name}\n\n"
                                    + "".join(b.text for b in r.content if b.type == "text"), encoding="utf-8")


main()
