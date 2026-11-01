# Revisión de expedition01_bedroom_v3_part4.mp4

- Estilo: mechayuki
- Duración: 147.4 s

## Veredicto
**CASI (fallos menores)**: la estructura, las etiquetas, el cierre con CTA SUBSCRIBE y el outro sobre su despedida están bien. Quedan varios fallos de overlays y de coherencia entre imagen y narración, sobre todo la página del delfín.

## Fallos
1. **[01:17–01:23]** Se dice "Dolphins" pero el diagrama muestra un pez con pico, tipo marlín, no un delfín. El texto "ONE EYE OPEN" queda corrupto ("EY▼" tapado por un marcador). Sobre la hoja sobreviven restos de la escena de Randy ("1", "(1964)", "DAY 5: SEEING THINGS" cortado arriba). El plano está casi inmóvil 6 s. → Rompe "acción inequívoca" y "overlays dentro de su marco". → Dibujar un delfín, limpiar la hoja antes de la transición y corregir el marcador.
2. **[00:51–01:07]** Los overlays se salen del cuadro. A 00:51 la hoja se agranda y desborda el borde superior y derecho. A 01:00 el texto "DAY 3: MO" queda cortado en el borde. A 01:04 "DAY" y "17 (1964)" quedan cortados. Además los subtítulos ("1964,", "Five,", "weren't") pisan la línea "RANDY, 17 (1964)". → Rompe "overlays dentro de sus frames". → Mantener el contenido dentro de la hoja, reubicar el calendario o el subtítulo y no recortar texto.
3. **[00:36–00:39]** Su brazo con el palo aparece cortado en la esquina inferior izquierda. Los guisantes casi no se ven: un solo punto verde flotando, sin impacto en la ventana. → Rompe "nunca cortada por el borde" y "acción inequívoca". → Encuadrar la mano completa y mostrar una ráfaga de guisantes que golpee la ventana.
4. **[00:40–00:43]** La etiqueta "SEE: THE ALARM CLOCK" sigue puesta mientras se habla de 1956 y del botón snooze, y no hay ningún reloj en pantalla. → Rompe "etiquetas que coincidan con la imagen". → Cambiar la etiqueta a "1956: SNOOZE BUTTON" o mostrar el botón.
5. **[00:20–00:26]** Escena de la cama:
   - Su cabeza no está sobre la almohada: la almohada vacía queda a su derecha.
   - El borde del edredón parece cortarle la cara.
   - El móvil queda en el extremo de la almohada, apoyado contra el cabecero, y parece flotar.
   → Rompe "nunca atraviesa cama o edredón" y "objetos sobre superficies". → Poner la cabeza sobre la almohada, el móvil sobre la superficie y revisar de lado y desde arriba.
6. **[01:24–01:40]** El resaltado del inventario no sigue la narración:
   - Sobre "eight" (01:26) está el blanket resaltado.
   - Sobre "two sleeps" (01:32) está la lámpara resaltada.
   - "Stone pillows" no resalta la almohada en los fotogramas muestreados.
   - "Peas" resalta el móvil.
   → Sincronizar el cursor con el ítem nombrado.
7. **[00:14–00:19 y 00:44–01:23]** En la sala de control sale cortada por las piernas con el borde inferior. → Encuadrar con los pies visibles.
8. **[00:00–00:03 y 01:50–01:55]** La lámpara de la mesita cambia de base (negra a azul) y el móvil cambia de pantalla (azul con barras a casi blanca). Un earplug se apoya o atraviesa el móvil. → Unificar el modelo y separar el earplug del móvil.
9. **[02:25]** El bloque MECHAYUKI + título es grande para un outro, que debería ser pequeño. → Reducir el tamaño.
10. **[02:21]** La transcripción dice "Expedition complete, logging off." con coma, no "Expedition complete. Logging off." Probablemente es la puntuación de Whisper. → Verificar que la pausa de la línea fija esté correcta.

## Cumple
- No hay "!" en el texto.
- Subtítulos de una palabra, en fuente pixel, con tamaño moderado.
- Etiquetas con pixfont y de tamaño razonable (WEAR, CAUSE, LIGHT/TIME/SOUND: NO, UP/DOWN, COMMENT).
- Cierre con CTA SUBSCRIBE sobre su despedida, sin pantalla negra y sin "more soon".
- La apertura (mesita) y el cierre (prado) son lugares distintos.
- Item Get y el inventario son coherentes (NO.08, 8/8 ARTIFACTS, SNOOZED X8).
- Escena de dormir 01:08–01:16: edredón arqueado sin atravesar, cabeza sobre la almohada, etiqueta "SLEEP: 14 H / RECOVERED".
- Cierre en un exterior verde, con árboles, arcoíris y flores.
- Los hechos son correctos (Gardner 1964, 11 días, snooze 1956, knocker-upper, Guinness).
- La expresión de guiño al despedirse coincide con "off."

## No verificable
- Sonido: mezcla, música a -12 LUFS, SFX de acciones (snore, alarma, guisantes) y que la voz no se corte. → `earshot timeline/critique`.
- Entonación de "Operators, what was it for?" (pregunta ascendente) y naturalidad de la voz. → `earshot critique`.
- Desincronía posible del subtítulo "snored." (00:01.8 y 00:03.7, 1.9 s con la misma palabra). → `earshot timeline` con los tiempos por palabra.
- Animaciones entre fotogramas: caminata del NPC (rodillas), desplazamiento de la burbuja y la bola de lava, y los efectos (zzz, partículas). → Revisar frames intermedios de `revisar_render.py`.
- Si la coma del cierre es de la voz o solo de la transcripción. → Comprobarlo con Whisper y el audio.
