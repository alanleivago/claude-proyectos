# Revisión de digger04_alarm_v1.mp4

- Estilo: mechayuki
- Duración: 105.4 s

## Veredicto
**CASI (fallos menores)**: la estructura, el balance verde, la apertura/cierre y el comentario del Operator cumplen. Pero hay un typo en un caption, una posible discrepancia voz/label ("pints" vs SIXPENCE), una moneda flotante y varios props que no se leen o no están en la mano.

## Fallos
1. **[00:30]** El caption dice "down" y la voz dice "dawn" ("before dawn") → regla: Whisper-check de cada línea contra el guion → corregir el texto del caption a "dawn".
2. **[00:51]** La transcripción dice "Six **pints** a week" pero el label dice "SIXPENCE A WEEK" → regla: Whisper-check de cada línea → escuchar el take con earshot. Si el TTS dijo "pints", regenerar con "sixpence". Si fue error de Whisper, no hay nada que tocar.
3. **[00:51]** La moneda de plata grande flota delante de su pecho y ninguna mano la sostiene → regla: los props siguen en la mano y no flotan → ponerla en el puño, o mostrarla entre los dedos.
4. **[00:09–00:15]** El clavo no se lee. Es una línea blanca fina que se funde con la vela. Ella no lo tiene en la mano al "empujarlo" (00:09). → reglas: herramientas EN las manos, y toda acción inequívoca → agrandar el clavo y darle color metálico o un contorno oscuro, y mostrar el empuje con el clavo en el puño.
5. **[00:13 → 00:15]** Continuidad: la vela está corta en 00:11–00:13 y vuelve a estar alta en 00:15 ("CANDLE ALARM") → usar la misma altura de vela en el plano de label, o una vela nueva con corte claro.
6. **[00:26]** La moneda que el hombre tenía en el puño desaparece y ella levanta el puño vacío → regla: props en la mano → mostrar la moneda pasando a su mano y quedando visible.
7. **[00:43–00:44]** Mary Smith aparece de espaldas, su puño no tiene el pea-shooter y Mechayuki queda cortada por el borde derecho → reglas: nunca cortada en el borde, y herramientas en las manos → reencuadrar con las dos visibles y el tubo en la mano de Mary.
8. **[00:46–00:47]** En el plano de "She shot dried peas", quien dispara parece Mechayuki y no Mary. Además hay una mancha verde/marrón junto a su cadera → acción confusa → mostrar a Mary disparando, o aclarar con el label "MARY SMITH".
9. **[00:30–00:38]** Cara casi tapada por el flequillo o de perfil (plano bajo en 00:30–00:33, y 00:35–00:38 mirando de lado) → regla: cara visible, evitar perfil o pelo cubriendo → cambiar el ángulo o girar el torso hacia cámara en los planos clave.
10. **[00:54–00:59]** Franja negra arriba en el taller de Hutchins (se ve el vacío sobre la pared) → set sin terminar → subir la pared o la cámara. Además Levi está quieto y no se ve que "construye" nada (acción poco clara).
11. **[00:21]** "fired" se lee como "Ared" (la "fi" del Pixelify se confunde) → regla: pixfont legible, espaciar letras → ajustar espaciado o usar un glifo propio.
12. **[00:29]** El palo del knocker-upper parece bajar hasta su pie, cruzando la pierna, y no se ve claro dónde lo agarra → regla: sin atravesar objetos, props en la mano → ajustar el agarre al centro del palo, con la base fuera del cuerpo.
13. **[01:03–01:09]** Siete segundos con la misma pose casi estática (Seth Thomas) → regla: ella debe estar animada y el mundo reaccionar → añadir un gesto o cambio de encuadre.
14. **[01:25]** El botón snooze es una franja roja plana que no se lee como botón → regla: nada plano → darle volumen (botón con relieve y sombra).
15. **[01:42]** El outro es grande: "MECHAYUKI" y la barra FOLLOW ocupan todo el ancho al entrar → regla: outro pequeño sobre el plano de despedida → reducir el tamaño de entrada.
16. **[00:13]** Menor: el caption "plate." y el label "METAL PLATE" quedan pegados y se apelmazan → separar el label hacia arriba.

## Cumple
- Formato alternado sinaboto: abre con el hook "If you sleep facing a window…", sin frame de "Operator… I dug up".
- Inicio (dormitorio) y final (prado) en lugares distintos.
- Comentario del Operator a ~35–36% del guion, con la tarjeta "Reply to operator_jay's comment".
- Balance verde: prado final, hiedra, macetas, ventana verde y edredón verde. La nieve solo aparece en el plano de invierno (00:04–00:07).
- Labels de objeto con fuente pixel y tamaño moderado (CANDLE ALARM, PEA SHOOTER, SNOOZE BUTTON, etc.).
- Captions de una palabra en fuente pixel.
- Expresiones acordes (susto, sudor, enfado, risa).
- Cierre fijo "Artifact understood, logging off." con outro (MECHAYUKI, ARTIFACT 004, FOLLOW) sobre su despedida, sin pantalla negra.
- Sombreros NPC bien asentados en la cabeza (gorra de Mary, tricornio de Levi).
- Disolvencias en mosaico (00:42, 00:52) y disco oscuro del vientre: intencionales, no se marcan.

## No verificable
- **Voz:** timbre, pausas, el "Operator Jay asks" natural, la pregunta final con subida de +8 st, los cortes dentro de palabras, la pausa tras "Clang!" y la entonación de "Rude." → `earshot timeline/critique` y `speaker_sim.py`.
- **Música y mezcla:** nivel de −7 dB bajo la voz, −12 LUFS / TP ≤ −1 dBTP, sin clipping → `earshot`.
- **SFX por acción:** clang, golpecitos en la ventana, pea shooter, slap, snooze → `earshot`.
- **Movimiento fino:** que el nail cae y rebota, el crecimiento de efectos, las caminatas de NPC con rodillas correctas, y si en 00:00–00:02 y 01:19–01:25 ella atraviesa el edredón o la cama → revisar el clip desde el lado y desde arriba.
- **Etiqueta "This is a knocker-upper":** no se ve en los fotogramas muestreados (00:34–00:35) → comprobar en el contact sheet de ese plano.
- **Duración de pausas y cortes entre planos:** `earshot` más contact sheets de inicio, medio y fin de cada plano.
