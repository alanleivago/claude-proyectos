# Revisión de r3.mp4

- Estilo: ava
- Duración: 146.3 s

## Veredicto
**CASI (fallos menores):** el render casi cumple las reglas, pero siguen visibles las manos y pies sin forma del gigante y las bandas de luz en la cara de Ava. La transición a la tarjeta de elección tiene un tramo en colores invertidos que parece un bug.

## Fallos
1. **[02:04–02:10]** Tras el plano de las escaleras, el fondo queda en **negativo/colores invertidos** unos 4 s, con barras grises arriba y abajo. Después el texto de las opciones se funde con el fondo ya a color (fantasma a las 02:09.8).
   - Regla: transiciones sin costura, con rampa suave.
   - Arreglo: hacer un fundido corto en rampa o un flash blanco, no una inversión sostenida, y sacar el texto limpio sobre el fondo ya a color.
2. **[01:04.0] [01:02.2] [00:58.5]** Las manos del gigante siguen siendo un bulto pálido sin dedos ni nudillos: en 01:04 se ve un puño tipo muñón, y en 00:58 parecen manoplas. Los pies "del tamaño de palas" (01:02) son un bulto liso, sin dedos. Además el guion dice "opening and closing" y en el fotograma está cerrada.
   - Regla: manos y cuerpos sueltos son low poly facetado con dedos y nudillos, nunca formas planas.
   - Arreglo: modelar dedos y nudillos visibles y mostrar la mano abriéndose y cerrándose en ese plano.
3. **[00:07] [00:09] [00:29] [00:34]** En los primeros planos del ático la cara de Ava tiene bandas de luz con borde duro: una franja diagonal clara en la mejilla, un parche verde brillante en cuello y mandíbula, y una franja horizontal en boca y barbilla (00:29).
   - Regla: la corrección pedida de "bandas de luz en la cara" no está cerrada.
   - Arreglo: suavizar o quitar el resplandor verde de la radio sobre el cuello, bajarle intensidad y quitar el corte duro de iluminación en la cabeza.
4. **[00:05.5]** Al "key the mic", el brazo cruza el plano como un bloque enorme y la mano parece una cuña blanca plana apoyada sobre la radio. No se lee como mano con micrófono.
   - Regla: manos propias de Ava, facetadas, y props en mano legibles.
   - Arreglo: reencuadrar y mostrar la mano enguantada sosteniendo el micrófono con la orientación correcta. Lo mismo vale para la mano del plano 00:00.
5. **[01:31.4] [01:33.3]** En la fachada de la mansión hay un tablón diagonal claro que sobresale del techo hacia el cielo, como geometría flotante o atravesada.
   - Regla: sin geometría que atraviese.
   - Arreglo: quitar o reubicar ese objeto, o integrarlo como parte visible de la estructura.
6. **[00:14.6]** La tarjeta negra "5:30 A_" muestra un subtítulo "STATIC" encima. Parece que hay voz o texto sobre una tarjeta que debe ir en silencio. También le falta la línea "DAY 3 — MANSION" que sí tienen las otras tarjetas.
   - Regla: tarjetas de hora solo texto y en silencio, con formato consistente.
   - Arreglo: quitar el subtítulo en la tarjeta y confirmar con audio que no hay voz. Unificar la subtarjeta.
7. **[02:08–02:24]** En la tarjeta de elección no aparece "WHAT DO YOU DO?" como título del menú RE, solo las opciones, "COMMENT 1 OR 2" y "SUBSCRIBE!".
   - Regla: el menú de elección lleva el título "WHAT DO YOU DO? 1 / 2".
   - Arreglo: añadir el encabezado.
   - Además, la opción 1 debería aparecer en "Option one" (02:04.9); a 02:06.2 todavía no hay texto.
8. **[01:38]–[01:42]** Las "oil lamps" se ven como velas rojas/verdes sobre mesitas, y no como lámparas de aceite.
   - Regla: etiquetas y props coherentes con lo que dice la voz.
   - Arreglo: cambiar el modelo por lámparas de aceite (base, vidrio, llama) o ajustar el texto.
9. **[00:11]–[00:12] [00:31]** Sobre la radio hay un bloque gris pixelado sin identificar que parece flotar o ser una masa informe.
   - Regla: props con detalle real de textura.
   - Arreglo: reemplazarlo por algo legible (altavoz, papel, antena) o quitarlo.
10. **[00:43]–[00:50]** Cuatro fotogramas seguidos (~7 s) del mismo plano abierto de la escalera, con Ava y Ribbon diminutos. Solo hay un dolly lento. Además Ava y Ribbon, parados delante del cuadro, se leen como si estuvieran dentro del retrato.
    - Regla: nada quieto más de 4 s.
    - Arreglo: partir en 2 planos (por ejemplo, un contraplano de Ribbon) y separar a Ava del marco con otro ángulo.
11. **[Transcripción]** Hay frases que suenan mal: "On every ham radio operator…", "Common one or two" (debería ser "Comment"), "Other than the door" (la etiqueta dice TALLER THAN THE DOOR) y "and it's standing in front of a hallway" (¿"you're"?). Las dos palabras "Static." sueltas leídas como narración también son raras.
    - Regla: la voz debe coincidir con el guion, y Ava no pronuncia onomatopeyas.
    - Arreglo: comprobar con whisper y, si es la toma real, regenerar.

## Cumple
- **HUD y estilo:** el HUD CONDITION con placa "MANSION" y estado Fine/Caution/Danger aparece y cambia de estado coherentemente.
- **Tarjetas de hora:** son negras, solo texto en Courier, sin recuadro gris.
- **Narración:** en segunda persona, con humor y callbacks ("The man in the dinner jacket was dead").
- **Etiquetas:** caen en la palabra (EAGLE ONE, TALLER THAN THE DOOR, SIZE OF SHOVELS, 15 BULLETS, HELICOPTER 1 HOUR).
- **Ava en planos frontales:** mira a cámara (00:07, 01:05) con expresiones limpias de miedo y de alivio (00:29).
- **Ribbon:** se ve tierna, con cabeza y cuello unidos, ojos con brillo y collar (01:26).
- **Exteriores y sets:** el bosque con río, puente y helicóptero tiene profundidad. El vestíbulo (papel pintado, damero, alfombra, retrato, escalera) y el pasillo con lámparas tienen mucho detalle.
- **Dato real:** el diagrama de 146.52 MHz lleva fuente (ARRL).
- **Inventario:** los ítems clave (perro, pistola, llave, helicóptero) se mantienen ~2 s con sus etiquetas.
- **Cierre:** termina en el menú de elección con fondo vivo, con "SUBSCRIBE!" al final y sin tarjeta aparte.
- **Gigante:** la cara está bien detallada (cicatriz, baba verde) y la amenaza se ve en la oscuridad.

## No verificable
- **Silencio real de las tarjetas de hora** (00:14.6, 00:42, 01:27.8): comprobar con earshot `timeline`/`measure` que no hay voz ni respiración.
- **Música y SFX:** 10–11 LU bajo la voz medido por tramo, BGM hasta el final, SFX en su cuadro (cristal, golpes de escalón, ladridos), sin duplicados. Usar earshot `critique`/`measure`.
- **Pausas, corte de tomas y tono:** pausas de 1–2 s, pensamientos en susurro, voz sin sílabas estiradas, respiración y miedo audible. Revisar a oído y con whisper.
- **Movimiento fino:** que Ava no tiemble (test del centroide del pelo), que Ribbon ladre y tiemble, la explosión de la ventana y el salto del gigante ("in one jump"), la mano abriéndose y cerrándose, el temblor de la casa, parpadeo de suelo o luz y clipping entre fotogramas. Revisar el mp4 a ≥ 5 fps en esos tramos.
- **Loudness final:** −14 LUFS y true peak ≤ −1 dBTP, a medir con earshot.
