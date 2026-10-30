# Revisión de digger04_alarm_v1.mp4

- Estilo: mechayuki
- Duración: 105.4 s

## Veredicto
**CASI (fallos menores)**: el episodio mantiene el nivel del v3 aprobado en estructura y estética (formato hook, comentario al ~35 %, final en un lugar distinto, mucho verde, outro sobre el adiós). Quedan encuadres que cortan a Mechayuki, caras tapadas por el pelo en tomas clave, etiquetas demasiado grandes, una posible discrepancia voz/etiqueta y dos glitches de texto.

## Fallos
1. **[00:19]** Mechayuki queda con medio cuerpo fuera del cuadro por el borde izquierdo → regla "nunca cortada en el borde" → recentrarla en la toma de "late,". Pasa lo mismo, con menor gravedad, en **[00:25]–[00:26]** (cortada por el borde derecho, sin piernas), **[01:05]–[01:08]** (pierna y brazo fuera por la izquierda) y **[01:27]–[01:38]** (brazo y mano con el teléfono salen por el borde izquierdo).
2. **[00:35]–[00:38]** En la toma de "Operator" y del comentario ("asks", "the") está de 3/4 de espalda, con el pelo tapándole el ojo y la cara casi invisible → regla "cara visible, evitar perfil o pelo cubriéndola en tomas clave" → girarla hacia cámara o abrir la cara. También ocurre en **[00:30]–[00:33]** (perfil y capa tapando la cara) y en **[01:15]–[01:17]** (pelo sobre el ojo).
3. **[00:51]** La etiqueta dice "SIXPENCE A WEEK", pero la transcripción de la voz dice "Six pints a week" → regla "Whisper-check de cada línea" → confirmar con Whisper qué dice realmente la voz. Si dice "pints", regenerar la línea. Si dice "sixpence", es solo un error de transcripción.
4. **[00:21]** El caption de "fired" se ve como "Ared" (glifo "fi" mal renderizado en la fuente pixel) → regla de captions Pixelify → arreglar el glifo o la ligadura de la "f" en `pixfont`/caption.
5. **[01:24]** La etiqueta "+ A FEW MIN" está truncada y parece un bug → regla de etiquetas claras → usar "+ MINUTES" o "+ 9 MIN" completo.
6. **Etiquetas demasiado grandes** → regla "tamaño ≈ altura del caption, nunca grandes":
   - **[00:44]** "MARY SMITH" crece mucho respecto al [00:43].
   - **[00:58]–[00:59]** "LEVI HUTCHINS".
   - **[01:04]–[01:08]** "SETH THOMAS".
   - **[01:17]** "UP TO 1970".
   - **[00:14]** "CLANG".
   
   Bajar la escala máxima del pop-in.
7. **[01:42]–[01:44]** El outro es grande: "MECHAYUKI", "ARTIFACT 004 / ALARM CLOCK" y la barra "FOLLOW" ocupan buena parte del cuadro → regla "outro pequeño sobre el adiós" → reducir tamaño de logo y barra.
8. **[00:09]** Dice "pushed a nail into a candle", pero no se ve ningún clavo en su mano; solo hay un puño frente a la vela → regla "herramientas EN las manos, acción inequívoca" → mostrar el clavo en la mano y clavándose en la vela.
9. **[00:13]** El label "METAL PLATE" señala un plato blanco/crema que parece cerámica → regla "props claros y reconocibles" → texturizarlo gris metálico.
10. **[00:26]** La moneda de "+1 PENNY" se lee como una línea fina amarilla en el puño. En **[00:51]** la moneda flota junto al puño sin estar sostenida → reglas "props en la mano" y "nada flotando" → hacer la moneda más grande y encajada en los dedos.
11. **[00:17]** y **[00:25]** El caption de la frase anterior ("alarm.", "unreliable.") sigue visible cuando el corte de escena ya cambió. También se repiten "unreliable.", "shooter." y "windows" en dos fotogramas seguidos → regla de sincronía → revisar en el timeline de voz si es solo muestreo o si el caption se queda tarde.
12. **[00:00]**, **[00:39]** y **[00:40]** El haz de luz de la ventana es un plano translúcido plano que cruza el cabecero → regla "nada plano" → darle volumen (cono con falloff) o bajar su opacidad.
13. **Duración** de unos 104 s, algo por encima del rango 80–100 s; el comentario del Operator cae al ~35 %, en el límite bajo del 35–40 % → recortar ~3 s o dejarlo si el creador lo acepta.

## Cumple
- Formato alternativo: abre directo con el hook "If you sleep facing a window, you have an alarm clock." (sin "Operator… I dug up").
- Apertura (dormitorio) y cierre (prado verde) son lugares distintos.
- Cierre fijo "Artifact understood, logging off." y outro sobre su adiós, sin pantalla negra ni "more soon".
- Balance verde: prado final, plantas, macetas, hiedra, árboles. La nieve aparece solo en la escena de invierno.
- En cama nunca atraviesa colchón ni edredón (00:00, 00:39, 01:19–01:25); el edredón arquea sobre las piernas.
- Los props están sobre superficies (vela y plato sobre la mesa, reloj sobre el cajón) y el palo está en su mano (00:27–00:34).
- Captions de una palabra en pixel font con pop-in; etiquetas de objeto con pixfont, espaciadas y legibles.
- Expresiones acordes a la línea ("fired" con sudor, "it?" con signo de pregunta, sorpresa en la alarma).
- Hay variedad de FX (zzz, signos "!", chispas, líneas de impacto, "SLAP", "TIK/TAP").
- Escenas históricas con volumen y contraste (fábrica con ventanas iluminadas, taller de relojes).
- NPC con sombreros low-poly asentados en la cabeza (gorra, tricornio, capucha de Mary).
- Mosaicos de [00:42] y [00:52]: intencionales, no se marcan.

## No verificable
- **Voz:** timbre y claridad de "Operator Jay asks", si las preguntas suben de tono (00:36–00:40, 01:32–01:40), cortes dentro de palabras, "Clang!" y la pausa de reacción. Usar `earshot timeline/critique` y `speaker_sim.py`.
- **Whisper-check:** confirmar línea por línea contra el guion, empezando por "sixpence/pints".
- **Música y mezcla:** pista con bajo y percusión suave, ~7 dB bajo la voz, −12 LUFS, TP ≤ −1 dBTP, sin clipping → `earshot`.
- **SFX:** que cada acción tenga sonido (clang, tap, tik, slap, monedas, snooze) → `earshot`.
- **Animación entre fotogramas:** manos atravesando objetos, rodillas de NPC al caminar de perfil, el agujero/efectos creciendo, el golpe en la cama. Revisar en contact sheets cuadro a cuadro.
- **Créditos:** que los assets sean CC0/CC-BY y que los CC-BY estén en el LOG.md/descripción.
- **Tabla PASS por toma** en LOG.md: revisar que exista y esté completa.
