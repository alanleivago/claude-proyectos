---
type: research
status: active
tags: [gta6, gta5, key-art, paint-over, dual-split-lighting, pipeline]
relatedTo: [fuentes/gta6-style/how-to-achieve-the-gta-6-look.md, fuentes/gta6-style/gta-5-portrait-art-style-time-lapse-painting.md, fuentes/gta6-style/vice-city-vacation-gta-vi-art-style-study.md, styles/gta6/STYLE.md, styles/gta6/tools/make_character.py]
---
# El proceso Rockstar según 3 tutoriales, y cómo lo hacemos en código

Fuentes: Artwod "How to Achieve the GTA 6 Look" (narrado, sin software nombrado), Rising67 "GTA 5 Portrait Art Style" (Photoshop CC 2018, hard/soft round), 21DPS "Vice City Vacation" (time-lapse sin voz, objetivo `tutorial/final.png`).

## Proceso exacto (lo que coincide en los tres)
1. **Foto de referencia real y proporciones reales.** Rising67 calca la foto de un cliente; Artwod: "si las proporciones fallan, el estilo no funciona". Rockstar pinta sobre sesiones de fotos.
2. **Line art limpio sobre la foto.** Pluma → Stroke Path (Rising67); boceto gris fino (21DPS). Líneas finas en el interior, solo en rasgos clave.
3. **Colores planos por material, cada uno en su capa** (piel, pelo, camisa, remera, pantalón, props) con alpha lock para pintar adentro.
4. **Luz diseñada, no copiada: doble luz dividida.** Luz cálida de un lado, luz fría/rosa del otro, **sombra de núcleo** en el medio (planos frontales). Primero dos tonos (luz/sombra) con bordes duros y formas angulosas tipo cabeza de Asaro; después transiciones suaves de valor dentro de cada zona (soft round). Sombras saturadas rosa-magenta-violeta, luces crema.
5. **Trabajar dentro de la sombra:** capa multiply, oclusión ambiental bajo la nariz, alrededor de los ojos y bajo el labio inferior. Nada de negro puro.
6. **Control de bordes:** nítidos donde está el foco (cara), suaves en formas redondas (brazos).
7. **Pelo:** más oscuro, sin rim light, hebras finas al final.
8. **Ropa:** sombras en bloques angulosos violeta/azul grisáceo; estampado plano encima (21DPS lo agrega casi al final).
9. **Contorno grueso de silueta** (Artwod lo llama el cuarto ingrediente), más fino en el interior.
10. **Fondo** en capas aparte, pastel, menos detalle y menos contraste que el personaje.
11. **Final:** gradación global amarillo-rosa (21DPS), ruido para unificar (Artwod).

## Cómo lo traducimos (styles/gta6/tools)
| Paso del pintor | Código |
|---|---|
| foto de referencia | Flow Nano Banana Pro, foto fotorreal con sol duro (cara característica, manos claras) |
| capas por material + alpha lock | `gta_parse.py`: segformer ropa (18 clases) + face-parsing (19) + Depth Anything, ONNX en CPU; props por polígono (Pluma) o caja + GrabCut |
| dos tonos con formas diseñadas | `make_character.py`: forma = luz de la foto sin textura + normales "infladas" de cada material y de la profundidad; máscaras limpiadas (curvas o polígonos), sin islas |
| doble luz dividida | luz clave (crema, lado del sol) + segunda luz (rosa) en el borde opuesto + sombra de núcleo entre ambas |
| soft round dentro de cada zona | modelado suave relativo a la media de cada zona (`model`), airbrush |
| oclusión ambiental | `deep` solo alrededor de ojos/nariz/labios (`ao_only`) |
| Stroke Path | contornos de material dibujados como trazos de ancho variable; silueta más gruesa del lado de sombra |
| estampado plano | hojas de palmera vectoriales en código, sombreadas con las mismas formas de luz |
| render del pintor | **Flow NB2 sobre el block-in** (prompt generado por la herramienta): solo sube la calidad de pintura, mantiene formas, colores y la cara de la foto |
| multiply / gradient map / ruido | `finish_character.py`: capa multiply magenta sobre sombras, screen crema en luces, silueta, rim, gradient map, ruido |

## Lo que aprendimos probando
- Código puro (block-in) mantiene diseño y anatomía, pero se ve como un vector trazado o una foto posterizada: el código no sabe pintar la superficie.
- Flow directo sobre la foto, con el mismo prompt, vuelve al cómic genérico (línea gruesa pareja, camisa de otro color).
- Flow sobre nuestro block-in respeta paleta, estampado, cara y manos y agrega la pintura. Es el mejor resultado hasta ahora, aunque tiende a aplanar la luz; por eso el finish en código la empuja de nuevo.
