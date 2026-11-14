"""Qué encuadra la cámara en cada salto, comparado con lo que dice la voz en ese momento (créditos de la API).

Necesita el cam.csv que deja cammotion (pan/zoom por frame). Busca los saltos (rafagas de movimiento) y los cortes,
toma el cuadro justo ANTES y justo DESPUÉS de cada uno, pone las palabras que la voz dice alrededor (faster-whisper con
tiempos por palabra) y le pide al modelo, por tandas: qué sujeto encuadra el cuadro de llegada, si es lo que nombra la
voz, si queda entero dentro del cuadro (texto, personajes, letreros), si fue zoom in, zoom out o paneo y cuánto
ocupa el sujeto. Escribe <video>_camara.md con la tabla y las reglas que se deducen.

Uso: python tools/analizar_camara.py video.mp4 cam.csv
"""
import base64, csv, io, json, math, subprocess, sys, tempfile, wave
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from revisar_render import MODEL, load_env_key

def words(video, tmp):
    import numpy as np
    from faster_whisper import WhisperModel
    wav = tmp / "a.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vn", "-ac", "1", "-ar", "16000", str(wav)], check=True)
    with wave.open(str(wav)) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio, word_timestamps=True)
    return [(x.start, x.end, x.word.strip()) for s in segs for x in s.words]

def events(rows, fps):
    sp = [math.hypot(float(r["tx"]), float(r["ty"])) for r in rows]; z = [float(r["zoom"]) for r in rows]; cut = [float(r["cut"]) for r in rows]
    mov = [sp[i] > 40 or abs(z[i]) > 4 for i in range(len(rows))]; ev = []; i = 0
    while i < len(rows):
        if cut[i] > 0.45: ev.append(("corte", i - 1, i, 0.0)); i += 1; continue
        if mov[i]:
            j = i
            while j + 1 < len(rows) and mov[j + 1] and cut[j + 1] <= 0.45: j += 1
            if j - i + 1 >= 3: ev.append(("salto", i - 1, j + 2, sum(z[i:j + 1])))
            i = j + 1
        else: i += 1
    return ev

def grab(video, f, fps, tmp):
    out = tmp / f"f{f}.jpg"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{max(0, f) / fps:.3f}", "-i", str(video), "-frames:v", "1", "-vf", "scale=360:-2", "-q:v", "5", str(out)], check=True)
    return base64.b64encode(out.read_bytes()).decode()

PROMPT = """Estas son parejas de cuadros de un short animado en 3D: ANTES y DESPUÉS de cada salto de cámara o corte, con lo que dice la voz en ese momento.
Para CADA evento devuelve una línea JSON (sin texto extra) con las claves:
{"id": n, "tipo": "salto|corte", "movimiento": "zoom in|zoom out|paneo|paneo+zoom in|paneo+zoom out|corte", "palabras": "...",
 "sujeto_llegada": "qué encuadra el cuadro DESPUÉS (objeto/personaje/texto)", "nombra_la_voz": true/false (¿el sujeto de llegada es lo que la voz está nombrando o la acción que describe?),
 "entero": true/false (¿el sujeto queda COMPLETO dentro del cuadro: textos legibles enteros, personajes con la cabeza entera, objetos sin cortar?),
 "ocupa": "fracción aproximada del alto del cuadro que ocupa el sujeto", "nota": "breve"}
Después de todas las líneas JSON escribe una sección '## Reglas' en español: qué hace la cámara de la referencia con los zooms (a qué apunta, cuánto cierra, cuándo abre, cómo trata los textos y los personajes)."""

def main():
    sys.stdout.reconfigure(encoding="utf-8")
    video, camcsv = Path(sys.argv[1]), Path(sys.argv[2])
    rows = list(csv.DictReader(open(camcsv))); fps = 30.0
    import anthropic
    client = anthropic.Anthropic(api_key=load_env_key(), timeout=900)
    with tempfile.TemporaryDirectory() as d:
        tmp = Path(d); W = words(video, tmp); ev = events(rows, fps)
        lines, rules = [], []
        for b0 in range(0, len(ev), 30):
            content = []
            for k, (tipo, a, b, zt) in enumerate(ev[b0:b0 + 30]):
                t0, t1 = a / fps, b / fps
                said = " ".join(w for s, e, w in W if e >= t0 - 0.5 and s <= t1 + 0.5)
                content += [{"type": "text", "text": f"EVENTO {b0 + k} ({tipo}, {t0:.2f}-{t1:.2f} s, zoom medido {zt:+.0f} %). Voz: «{said}». ANTES:"},
                            {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": grab(video, a, fps, tmp)}},
                            {"type": "text", "text": "DESPUÉS:"},
                            {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": grab(video, b, fps, tmp)}}]
            content.append({"type": "text", "text": PROMPT})
            with client.messages.stream(model=MODEL, max_tokens=24000, messages=[{"role": "user", "content": content}]) as s:
                r = s.get_final_message()
            text = "".join(x.text for x in r.content if x.type == "text")
            lines += [l for l in text.splitlines() if l.strip().startswith("{")]
            if "## Reglas" in text: rules.append(text[text.index("## Reglas"):])
            print(f"tanda {b0 // 30 + 1}: {r.usage.input_tokens} in / {r.usage.output_tokens} out", flush=True)
    J = []
    for l in lines:
        try: J.append(json.loads(l))
        except Exception: pass
    n = len(J) or 1
    stat = (f"- eventos: {len(J)}\n- llega a lo que nombra la voz: {sum(1 for j in J if j.get('nombra_la_voz')) * 100 // n} %\n"
            f"- sujeto entero dentro del cuadro: {sum(1 for j in J if j.get('entero')) * 100 // n} %\n"
            + "".join(f"- {m}: {sum(1 for j in J if j.get('movimiento') == m)}\n" for m in sorted({j.get('movimiento') for j in J})))
    table = "| id | t | mov | voz | llega a | nombra | entero | ocupa |\n|---|---|---|---|---|---|---|---|\n" + "".join(
        f"| {j.get('id')} | | {j.get('movimiento')} | {j.get('palabras', '')[:40]} | {j.get('sujeto_llegada', '')[:50]} | {j.get('nombra_la_voz')} | {j.get('entero')} | {j.get('ocupa')} |\n" for j in J)
    out = video.with_name(video.stem + "_camara.md")
    out.write_text(f"# Cámara vs voz — {video.name}\n\n## Resumen\n{stat}\n" + "\n\n".join(rules) + "\n\n## Eventos\n" + table, encoding="utf-8")
    print("guardado", out); print(stat)

if __name__ == "__main__":
    main()
