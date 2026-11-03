---
type: style
status: draft
tags: [roblox, shorts, three.js, cartoon3d]
relatedTo: [styles/cartoon3d/STYLE.md, fuentes/roblox-cartoon, Ref roblox/ref1/desglose.md]
---

# roblox — Roblox story shorts (vertical)

Objetivo (usuario, 2026-11-03): que se vean como el reel `Ref roblox/ref1/ref1.mp4` (Instagram DfHvUTEA78A),
con la cámara súper dinámica y los sets ricos de cartoon3d. Método de guion: tutorial de g russ
(`fuentes/roblox-cartoon/`), sin Creatorize: todo en código (three.js + kit propio).

## Fuentes
- Reel objetivo: `Ref roblox/ref1/` — `desglose.md` (toma por toma, rig, sets, cámara, subtítulos, sonido), `sheet.jpg`.
- Tutorial: `fuentes/roblox-cartoon/opus-5-5-...-tutorial.md`, video en `Ref roblox/tutorial/`.

## Medidas del reel (ref1)
- 159 s, 1080x1920, 119 tomas: mediana 1.27 s, solo 2 % > 3 s, cortes secos (~45 cortes/min, 2-4 planos por frase).
- Personajes: avatar R6 clásico (torso 2x2x1, brazos/piernas 1x2x1, cabeza cilindro biselado 1.25), articulan solo
  hombros/caderas/cuello, sin squash. Actúan con swap de cara-decal + inclinación de cabeza + cámara.
  Ropa = texturas sobre los bloques (cuadros, rayas, lunares, punto). Pelo = mesh low-poly de catálogo.
- Monstruos: el mismo avatar con brazos x3.5 / piernas x3 / torso x1.4, cara blanca de ojos negros y boca de dientes.
- Sets: NO plástico liso con studs — escena tipo Roblox Studio con texturas reales (piedra, ladrillo, madera, papel
  pintado, alfombra), relieve, bloom, DOF, haces volumétricos, niebla en exteriores. Contraste avatar de bloques vs set rico.
- Luz por escena: noche cobalto + luna fría + prácticas naranjas; atardecer sepia; día saturado.
- Cámara: push-in lento ~35 %, contrapicado extremo ~25 %, dutch/roll ~12 % (hasta 90° en sustos), órbita corta,
  slide, cenital, handheld sutil, rack focus. FOV 55-70, 85-100 en monstruos. Movimientos cortos sin ease-out.
- Subtítulos: UNA palabra, centro a 70.7 % de alto, ~100 px sans extrabold, contorno negro 5 px + sombra,
  pop 0.85→1.06→1 en 90 ms; color por hablante (blanco narrador, azul, amarillo, rosa, naranja).
- Texto en el mundo: cuaderno manuscrito con scroll de cámara; casi sin números en pantalla.
- Sonido: voz única ~165 wpm, drone + caja de música, SFX por acción (campana, martillo, arañazos, latido, puerta).

## Fórmula de guion (tutorial)
Regla en la primera oración → 1-2 líneas que la dimensionan → 3-5 gags que escalan → héroe con nombre y edad →
giro "then one day" → última línea deadpan de 2-7 palabras que hace loop. ~45-55 s.
El reel aplica la misma lógica a una historia de terror ("reglas" de la casa) en 2:39.

## Qué se toma de cartoon3d
Kit de cámara (C3_CAMFX, contCamAt, DOF por plano, c3Fog), sets densos, sombras (C3_SHADOW), pipeline de voz/
sonido (VoiceStudio, make_cues, remix -14 LUFS), short_qa.py / sbs_sheet.py. Cambia: personaje (rig R6 de bloques
en 3D real en vez de billboards), ritmo de corte (1.3 s), subtítulo de una palabra al 70 %.

## Estudio de canales (2026-11-03) — `Ref roblox/<canal>/informe.md`
Top 6 shorts de Gneef (20-34 M vistas), GreenBroRants (16-29 M) y redfish1 (1-9 M). Patrones comunes:
- **Duración real de los hits: 60-175 s** (Gneef 112-174 s), voz rápida **~260 wpm** (4.4 palabras/s), casi sin pausas.
- Guion: "In this town/world, [regla absurda]." → "You see, [mecanismo + castigo PG irreversible]." →
  "So nobody here…" + 3-6 adaptaciones cómicas (abuela, cartero, escuela) → héroe "I", ~10 años, sin nombre o con
  defecto/habilidad plantada ("I've never lost. Not once.") → ser querido con nombre → "Until one night…" incidente
  (25-50 %) → escalada + intento fallido → giro 65-75 %: "And that's when I realized…" lectura LITERAL de la regla →
  ejecución en frases de 3-6 palabras + onomatopeyas (Snip! Ding!) y cortes 0.5-1 s → epílogo: el pueblo adopta el
  truco + callback tierno/irónico. Terror suave, final cálido, sin gore.
- Presente para el mundo, pasado para la historia. Una toma por cláusula (~1 corte cada 6.5 palabras, toma 1.4-1.5 s).
- Todo dato en el MUNDO 3D (contadores en el pecho, carteles, relojes, libros); nunca HUD.
- Subtítulos: 1 palabra, blanco + contorno negro grueso, ~70 % de alto (redfish: 2-6 palabras arriba con palabra clave amarilla).
- Look: Roblox Studio "Future lighting": suburbio Bloxburg (ladrillo, pinos, césped), PBR, bloom en emisivos, DOF, día saturado / noche azul con cálidos.
- Branding = protagonista recurrente (GreenBro: gorro-alien verde lima + camiseta verde; Gneef: chico pelirrojo; redfish: avatar rojo) + elenco fijo reutilizado.
- Títulos: la regla en 3-7 palabras + 1 emoji ("Everyone Has A String On Their Back 🧶").
