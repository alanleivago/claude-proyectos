---
name: f1motion-style
description: "Estilo f1motion (reel IG DdolSnYt_iX \"F1 explicado\") aplicado a talking heads Stimulus: caras recortadas sobre cuerpos/vehículos, display ancho + thin, tabs teal, pills doradas, sprites pixel; spec styles/f1motion/ESTILO.md"
metadata:
  node_type: memory
  type: project
  originSessionId: 180a3cfb-8b3b-49b6-b8ac-a71a3a85ca01
  modified: 2026-11-10T12:04:53.472Z
---

El usuario pidió (2026-11-10) replicar el motion graphics del reel `fuentes/f1motion/ref/reel.mp4` en un raw de Stimulus. Mandó 16 capturas con lo que más le gusta.
- No usar marcas, equipos ni pilotos de F1. Todo se re-tematiza a fútbol y camisetas Stimulus.
- Spec medida: `styles/f1motion/ESTILO.md`. Constantes en `styles/f1motion/kit.js`. Análisis del reel por la API en `fuentes/f1motion/ref/analysis/` y `SPEC_api.md`.
- Pieza de prueba: `pieces/f1motion-test/` (raw stimulus-05).
  - `prep/face_cut.py` recorta solo la cabeza (BiRefNet × elipse).
  - `prep/torso.py` saca el torso pixel→real.
  - `prep/gen.py` genera index.html.
- Fuentes:
  - display: Turret Road ExtraBold con scaleX 1.3 y trazo de 2 px (lo más parecido al unicase futurista del reel);
  - thin: Poppins Light;
  - pills: Poppins Medium;
  - script: Photograph Signature.
- Sonido: house "vox and bells" (Freesound 277448, CC0) a 0.13, más pops, whoosh, auto, sticker, marcador y clic reales (sound-layer + Freesound), pocos y en sus eventos.
- Estado: v1 enviada (gustó), v2 enviada a Telegram el 2026-11-10. Es un video de práctica interna (no se publica): el objetivo es perfeccionar el estilo.

## Reglas v2 del usuario (2026-11-10). Detalle en ESTILO.md, "Reglas v2"
- **12 fps en los gráficos.** Es un medido del reel: en las escenas gráficas cambia 1 de cada 2 frames.
  - Render a 24 fps.
  - Los tweens van en `tlg`, buscado a floor(t*12)/12 por un tween conductor.
  - Caras `face*12.webm` con `fps=12,fps=24`.
  - Talking head y b-roll a 24 fps.
- **B-roll B/N en ≈32 % de los planos.** YouTube de niños, entrenadores y árbitros, con caption Poppins SemiBold 110 px blanco abajo a la izquierda.
  - Trama de **líneas verticales de 8 px**, sinusoidal ±10 %, estática.
  - El usuario dijo "horizontales"; en el reel son verticales y se copió lo medido.
- **Nada técnico dibujado en código.** Vehículos, camisetas, zapatillas, balón, chevrons y manos emoji se hacen en Google Flow (MCP, Nano Banana Pro), con recortes del reel como referencia de estilo, y luego rembg.
  - Los sprites pixel son esas imágenes en mosaico.
- **Caras siempre en B/N.**
  - El brazo de la mano 👍 va detrás de la cabeza.
  - La barbilla entra en el cuello en V de la camiseta (cuello abierto transparente).
- Stickers del calendario dentro de las celdas.
- Walker como el reel: octágono dorado, piernas curvas en degradado, zapatillas reales, balón y mano del corazón, texto thin + display palabra por palabra.
- Camiseta del callout más arriba, reflejada en el piso halftone.
- Revisar SIEMPRE escena por escena contra los frames del reel: formas, proporciones, colores, movimiento, fps, tiempos y SFX. El usuario espera que estos detalles los encuentre yo.

## Reglas v3 (2026-11-10). v3 enviada a Telegram; detalle en ESTILO.md, "Reglas v3"
- FPS remedido en 18 tramos: los gráficos del reel son 12 fps fijos (movimiento real cada 2 frames, no variable). Se mantiene 12.
- Chevrons pegados al texto.
- Círculos de marcador dibujándose (attr stroke-dashoffset).
- Cabeza siempre en el octágono dorado, con la camiseta colgando debajo. Sombra = elipse teal con degradado suave.
- B-roll sin sujetos cortados en el borde, zoom extra del 6 %, todos con caption.
- Sticker con peel del reel: esquina doblada gigante que se repliega a una pequeña que respira.
- TH real también a los ~10 s.
- Línea del tab que se desvanece en los extremos.
- Primer plano con la camiseta Flow sin pixelar.
- Vans del mismo modelo, sin logos reales.
- Recursos del usuario permitidos (fuentes, emojis, overlays, SFX y música en `D:\Alan\Fiverr Upwork trabajo fotos y videos`). Música v3: Dr Delight "Feel It" (Audios musica Fiesta). Al usuario le encantan las fuentes elegidas: mantenerlas.

## Reglas v4 (2026-11-10). v4 enviada; detalle en ESTILO.md, "Reglas v4"
- B-roll: `setsar=1` y `object-fit:cover`. Los bordes blancos venían del SAR. Revisar las columnas del borde en el render.
- La esquina del sticker es un rollo curvo con brillo y sombra (clipPath SVG animado con attr), no un triángulo.
- En "at STIMULUS" va el logo Stimulus girando, no su torso.
- Walker: brazos plateados con degradado como las piernas, y gafas que caen una sola vez (wrapper propio, sin bounce).
- Cara en la ventana de la van con máscara de la ventana, cabina oscura detrás, reflejo y puerta por delante.

## v5 (2026-11-10): "Está excelente!". Regla final de movimiento
- **Posterize de 8 fps en gráficos, zooms y transiciones** (incluidos los push-ins del talking head): es preferencia del usuario sobre los 12 fps medidos en el reel; no volver a debatirlo.
- El contenido de video sigue a 24 fps por dentro; las caras van a 8 fps (`face*8.webm`).
- Se mantienen las frenadas ease-out.

## APROBADO (2026-11-10): v4 + 12 fps
- **12 fps final; 8 fps se probó y se rechazó.** Todo va a 12 fps: gráficos, cámaras, push-ins y transiciones. El video por dentro sigue a 24.
- Plantilla: `pieces/f1motion-test`.

## Catálogo de 5 reels (2026-11-10)
- `styles/f1motion/CATALOGO.md` tiene 30 tipos de escena de 4 reels más del mismo estilo (KIMI DfNzJyXtRpJ, CHG Deje_IEhM8c, MUSE DdyxpSRBWIT, BTS Dc_K1gSx5id), con layout, colores, movimiento, SFX, re-tema y Flow vs código.
- Frames de referencia en `styles/f1motion/ref_frames/<reel>/` (índice en index.json).
- Los bloques nuevos están en `kit.js` (`blocks`, `catalog`).
- Usar el catálogo para elegir escenas en los próximos videos de este estilo.
- Cobertura verificable: los 396 planos de los 4 reels están clasificados (102 de gráficos, todos analizados a 12 fps cuadro a cuadro). Hay un frame por plano en `ref_frames/<reel>/shots/`, tabla en CATALOGO.md "Cobertura por plano" y 33 tipos.
