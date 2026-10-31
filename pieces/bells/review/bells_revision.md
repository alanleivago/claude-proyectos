# Revisión de bells.mp4

- Estilo: -
- Duración: 247.7 s

## Veredicto
**CASI (fallos menores).** Cumple la duración (~4:07), la estética 1-bit, los HUD, los subtítulos y el outro rojo. Fallan el ritmo (varias tomas duran ~3 s), la tipografía de la pregunta final y algunos artefactos de píxel.

## Fallos
1. **[00:12–00:24, 01:08–01:20, 02:44–02:56, 03:15–03:24]** Ritmo demasiado rápido. Plaga, trinchera, monjes y aldeanos duran ~3 s cada uno, y los primeros planos de la cara tampoco pasan de ~3 s. → Regla de ritmo lento tipo Urbn.Theory (cada imagen 8–20 s). → Alargar esas tomas con empujes lentos, o fundir los beats que se pueden fusionar. Cumple los 3 min, pero por cantidad de tomas, no por pausa.
2. **[03:39–03:46]** La pregunta final ("who will ring them when we're gone?") está en una serif lisa y suave, tipo Times. No es aansa, ni la That That New Pixel Square del wordmark "madfable" (como en la tarjeta final de bells), ni tiene look de píxel. → Regla de tipografías del canal. → Rehacerla en aansa (como los subtítulos) o en That That Square, con renderizado pixelado.
3. **[01:39, 01:29, 02:25, 00:27, 01:54]** Los empujes de cámara muestran píxeles rotos o irregulares. La biblioteca a 01:39.1 tiene ruido blanco y negro en los lomos, y la línea de campanas a 02:25.5 tiene líneas quebradas. Hay también grano en el chaleco del pastor, la barba del monje y la cara del anciano. → Regla "nunca re-pixelar el pixel art de Flow" (píxeles nativos, nearest-neighbour). → Escalar en pasos enteros, o recortar sobre un lienzo ya subido a la grilla nativa, para que el zoom no rompa la grilla.
4. **[02:28, 03:02, 03:05, 03:15–03:21]** El contorno blanco es grueso, ~2 px nativos sólidos. Se ve en el campanero, la figura encapuchada de "DRUM ÎNCHIS" y los aldeanos de la torre. → Regla del contorno SUTIL y fino como las refs en 16:9. → Usar solo el contorno fino de Flow, sin refuerzo en código, o adelgazarlo en esas tomas.
5. **[01:08]** Hay una marca negra suelta con forma de "t" abajo a la izquierda del primer plano de la cara, y un fragmento blanco en la esquina inferior derecha a 02:44. → Regla de cero artefactos de código. → Limpiar o enmascarar el elemento.
6. **[02:03–02:09]** La inscripción de la campana ("VIVOS VOCO MORTUOS PLANGO…") parece tipografía lisa con bordes suaves, no pixelada como el resto. Sí sigue la curva. → Rasterizarla a la grilla nativa o a un tamaño de píxel coherente.
7. **[03:24–03:30]** El subtítulo cae sobre el auto y la figura, y a 03:27 compite con su silueta clara. → Es legible, pero se puede subir un poco o centrarlo en la zona oscura.

## Cumple
- Duración: ≥3 min (~4:07) y varios tipos de plano (cenital, contrapicado, primerísimos primeros planos, tomas de espaldas).
- Subtítulos en minúsculas, aansa, trazo negro grueso, sin borde blanco exterior y pequeños para 16:9. La escritura progresiva es coherente. Las últimas líneas llegan a pantalla completa.
- Tag superior izquierdo estilo WoH (icono + barra con kanji + título) coherente, con contadores animados: HOURS SILENT 05→12, BELLS TAKEN 0→175,000 y 02:59→03:00.
- Sin voz: la transcripción está vacía, así que la historia se cuenta solo con subtítulos.
- Look plano y 1-bit: fondos simples, grises planos posterizados, sombras de damero en personajes.
- Expresiones: la mujer pasa de preocupada a aterrada (00:46→00:49) y el pastor cambia de pose.
- Los personajes tienen contorno blanco (aunque grueso, ver fallo 4). Las caras de la nube con varios ojos son inquietantes, no simples.
- Nunca se repite la misma imagen para dos beats distintos.
- Outro: fondo rojo saturado con árboles negros, "madfable" en minúsculas arriba al centro, sin sombra y con letras casi tocándose. Tarjeta animada abajo a la derecha (correcto para 16:9). Dura ~21 s (≥20 s para las pantallas finales).
- Todo está en B&W, salvo el rojo del outro que es intencional.

## No verificable
- **Wiggle (1.5 px) y su exclusión en HUD:** necesita movimiento entre fotogramas. Usar un diff de fotogramas consecutivos o ver el clip a velocidad real.
- **Parallax y capas, y empujes lentos:** se necesita ver el video en movimiento o comparar fotogramas cercanos.
- **Premiere-style B&W (solo luma, sin umbral):** los fotogramas se ven grises planos, pero no se puede asegurar que no haya posterizado extra. Comparar contra la salida de Flow.
- **Audio:** Talking loop bajo el BGM y los SFX, estirado según lo perturbador de la línea, BGM críptico, booms en los giros y silencio sobre el logo, y master ~-13 LUFS sin saturación. Usar earshot timeline/critique.
- **Entregable y extras:** solo el MP4 con audio muxed, título tipo Urbn.Theory y varias miniaturas con "borde encima.jpeg". No se ven en los fotogramas.
- **Antecedente de "him" a 03:21 ("no one knows where they found him"):** la línea previa a 03:15 solo se ve truncada, así que no se puede juzgar si la figura queda presentada. Revisar el guion completo.
