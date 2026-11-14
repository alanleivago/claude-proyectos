"""Synthesize styles/docucollage/REEL1_FRAME_ANALISIS.md from the 25 fps frame-by-frame windows of reel 1 + pixel measurements (API credits)."""
from pathlib import Path
import anthropic
ROOT = Path(r"F:\Claude Proyectos"); D = ROOT / "fuentes/docucollage/reels/DIV6ZPFIx3y"
def key():
    for line in (ROOT / ".env").read_text(encoding="utf-8-sig").splitlines():
        k, s, v = line.strip().partition("=")
        if s and k.strip() == "ANTHROPIC_API_KEY": return v.strip().strip('"').strip("'")
txt = "".join(f"\n=== window {p.stem} ===\n" + p.read_text(encoding="utf-8") for p in sorted((D / "frames25").glob("w_*.md")))
M = (D / "measurements.md").read_text(encoding="utf-8")
P = """Above: frame-by-frame (every frame, 25 fps) breakdowns of reel 1 (Ali Abdaal "Gold Medal Syndrome", 1080x1920) in 3.6 s windows, then PIXEL MEASUREMENTS made with code (trust the measurements over the visual estimates when they disagree).
Write the analysis document in SPANISH (Rioplatense neutral), markdown, numbers everywhere, terse bullets. Start with this exact YAML frontmatter:
---
type: spec
status: active
tags: [docucollage, reel1, gold-medal-syndrome, frame-analysis, motion]
relatedTo: [styles/docucollage/ESTILO.md, styles/docucollage/CATALOGO.md, styles/docucollage/kit.js, fuentes/docucollage/reels/DIV6ZPFIx3y]
---
Sections:
# Reel 1 (DIV6ZPFIx3y) — análisis cuadro a cuadro
## Fuente y método
## Línea de tiempo plano por plano  (table: plano | frames | s | tipo | qué se ve | cámara | capas y su movimiento | título | transición de salida | SFX esperado)
## Cámara (zooms, push-in, pull-out, pans: valores por plano y reglas generales)
## Capas: movimiento por persona/objeto (entrada, deriva, escala, rotación, parallax, salida; reglas generales con números)
## Títulos: fuentes, aparición, wiggle por letra, sombra, brillo (shine), salida
## Subtítulos: tamaño, posición, relleno palabra por palabra
## Transiciones (tipo, frames, blur)
## FPS por elemento
## Host (encuadre, tamaño, cuándo aparece recortado, nunca solo sobre fondo gráfico)
## Reglas para replicar (checklist numerada, accionable, con números)
No intro text outside these sections."""
c = anthropic.Anthropic(api_key=key())
with c.messages.stream(model="claude-sonnet-5-5", max_tokens=48000, messages=[{"role": "user", "content": txt + "\n\n######## PIXEL MEASUREMENTS ########\n" + M + "\n\n" + P}]) as s:
    r = s.get_final_message()
(ROOT / "styles/docucollage/REEL1_FRAME_ANALISIS.md").write_text("".join(b.text for b in r.content if b.type == "text"), encoding="utf-8")
print(r.usage.input_tokens, r.usage.output_tokens, r.stop_reason)
