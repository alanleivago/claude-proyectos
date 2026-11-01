# Revisión de expedition01_bedroom_v2_part4.mp4

- Estilo: mechayuki
- Duración: 146.5 s

## Veredicto
**NO LISTO**: los textos de pantalla chocan entre sí (subtítulos sobre etiquetas), el contador de días de Randy y el cursor del inventario van desincronizados con la voz, y hay un polígono de cámara recortado a la vista. Todo se arregla en el motor sin tocar el audio.

## Fallos
1. **[00:51–01:06]** El contador DAY va unos 8-9 s por delante de la voz. "MOODY" sale en el día 3 a 00:51 (la voz lo dice a 01:00). "SEEING THINGS" sale en el día 5 a 00:56 (la voz, a 01:05). A 01:00 la voz dice "day 3" y la tarjeta marca DAY 6. A 01:04 la voz dice "day 5" y la tarjeta marca DAY 7-8. → Regla "cada acción debe leerse sin ambigüedad". → Reajustar los tiempos de la tarjeta a `timeline_*.json`: día 3 y moody a ≈01:00, día 5 y seeing things a ≈01:05, y 11 al decir "11 days".
2. **[00:01.8, 01:27.9, 01:29.7, 01:31.5, 02:13.7]** El subtítulo se pisa con etiquetas o barras de la interfaz. "snored" cae sobre "CAUSE: … (ZZZ)", "grass", "strangers" y "blankets," sobre la barra "ARTIFACTS" del inventario, y "sound:" sobre "SOUND: NO". En 02:13.7 aparece además una tercera etiqueta central con texto reflejado/ilegible. → Reglas de subtítulos y etiquetas legibles. → Subir el subtítulo o desplazar la etiqueta cuando coincidan en y≈365. Borrar la etiqueta duplicada de 02:13.7.
3. **[01:40–01:50, 02:10–02:14]** Un plano beige translúcido enorme tapa el borde derecho. Parece geometría cortada por el near plane de la cámara. → Regla "nada plano ni cortado". → Ocultar ese muro o cama, o mover la cámara o el near plane.
4. **[01:24–01:40]** El cursor del inventario no sigue la voz. La voz enumera los ocho artefactos (grass beds, stone pillows, shared blankets…). El cursor salta a Mattress, luego a Nightstand (01:26) y se queda en Phone de 01:33 a 01:40 mientras la voz dice "cabinet / Odyssey / window". Además la etiqueta "NIGHTSTA" está truncada (01:24-01:40). → Sincronizar el cursor con cada ítem nombrado y acortar o reducir la fuente a "NIGHTSTAND".
5. **[00:14–00:20]** El título "1 OBJECT = 5 OBJECTS" no está centrado: va de x≈280 a 648, con centro ≈464 en un cuadro de 768. Es justo lo que v2 decía corregir. Además, su puño izquierdo queda cortado por el borde en 00:14.6. → Centrar en x=384 y reencuadrar a ella.
6. **[00:51–01:20]** Con el zoom de la página del manual ella casi desaparece: solo asoma un puño (00:51-01:02), nada (01:04) o solo las piernas (01:16-01:22). El "11" y el "RANDY" quedan cortados contra el borde en 01:16-01:22. → Reglas "nunca cortada por el borde" y "overlays dentro de su marco". → Reducir el zoom o reencuadrar la tarjeta.
7. **[02:24.6]** El outro es grande: "MECHAYUKI", "EXPEDITION 01: THE BEDROOM" y un botón rojo "SUBSCRIBE" que tapa casi todo el plano. Además el CTA dice "subscribe" y no "follow". → Regla del outro pequeño con CTA de follow. → Achicar a tamaño de etiqueta y cambiar el texto a FOLLOW.
8. **[02:15–02:23]** En la pradera hay un panel negro enorme con borde naranja pegado a su espalda y fuera de escala. Si es el teléfono, ni lo sostiene ni está apoyado en el suelo; si es la capa, tiene la textura equivocada. → Regla "props en la mano / sobre superficies". → Apoyarlo en el suelo, ponerlo en su mano o quitarlo.
9. **[00:36–00:42]** La acción "shoot dried peas" no se lee: ella levanta el brazo sin herramienta ni guisantes visibles. El plano del knocker-upper dura unos 15 s (00:27-00:42) sin ilustrar el botón snooze de 1956. → Reglas "toda acción inequívoca, con SFX" y "escenas históricas con volumen". → Añadir un shooter con guisantes que impactan la ventana y un plano o tarjeta 1956.
10. **[00:20–00:25]** En la cama, la cabeza de la chica queda al lado de la almohada, no encima. → Regla "nunca atraviesa/queda desalineada con la cama". → Colocar la raíz de la cabeza sobre la almohada y revisar desde arriba.
11. **[01:16–01:22]** El delfín es una silueta azul plana que se lee como una mancha o pez; no se ve "un ojo abierto". → Regla "diagramas con volumen y contraste". → Redibujar con aleta, ojo claro y un párpado o ZZZ.
12. **[01:07–01:15]** La burbuja de pensamiento está vacía (círculo blanco sin contenido). → Poner un icono (ZZZ, luna) o quitarla.
13. **[00:14–00:18, 00:43–00:49, 01:40–01:49]** En esos tramos ella casi no se mueve. Entre fotogramas separados por 1,8 s la pose de 00:14.6, 00:16.5 y 00:18.3 es idéntica. → Regla "debe estar animada". → Añadir idle con respiración o gestos que reaccionen a la lista.
14. **[00:03–00:07]** La voz dice "still plugged in" pero el teléfono no muestra ningún cable. Además la descripción de la tarjeta ITEM GET está vacía a 00:03.7. Los dos son detalles menores.
15. **[02:15.5]** El subtítulo "operators" no aparece en la transcripción de la voz, que tiene "what was it for / tell me in the comments". → Verificar con Whisper si la voz lo dice. Si no, corregir el subtítulo o regenerar la toma.

## Cumple
- Subtítulos de una palabra con fuente pixel y pop-in, salvo las colisiones del fallo 2.
- Verde equilibrado: pradera MML2 con árboles, arbustos, flores y arcoíris al final, y plantas en la habitación.
- Sin pantalla negra final ni "more soon"; el outro va sobre su plano de despedida.
- Inicio (mesita de noche) y final (pradera) en lugares distintos.
- Etiquetas pixfont legibles y de tamaño moderado en general ("WEAR: 97%", "SLEEP: 14 H", "BOSS: ???").
- Expresiones acordes a la línea ("operators", pensativa en 02:10).
- Datos del guion correctos (Randy Gardner, 1956, delfines, knocker-upper), y la lámpara de lava está bien resuelta (UP…/…DOWN).

## No verificable
- **Voz:** cortes dentro de palabras, entonación de la pregunta "what was it for?", energía del "Operator…" y comprobación Whisper contra guion. Usar earshot timeline/critique y `speaker_sim.py`.
- **Mezcla y música:** música ≈7 dB bajo la voz, -12 LUFS / TP ≤ -1 dBTP, SFX en cada acción, vibración del teléfono. Usar earshot.
- **Movimiento fino:** la escalada de ventana de 0:28 (en los fotogramas ella solo está de pie en la calle), el parpadeo y movimiento de cámara final, y el crecimiento de los efectos. Revisar con una hoja de contactos a más cuadros por segundo.
- **Estructura:** el comentario del Operator al 35-40 % del guion y el cierre fijo "Artifact understood. Logging off." (aquí es "Expedition complete, logging off"; confirmar que es intencional para el formato de expedición). Esto solo se juzga con el guion de las cuatro partes.
- **Créditos:** que los assets CC-BY estén en LOG.md.
