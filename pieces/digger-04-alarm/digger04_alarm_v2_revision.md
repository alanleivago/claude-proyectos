# Revisión de digger04_alarm_v2.mp4

- Estilo: mechayuki
- Duración: 105.4 s

## Veredicto
**CASI (fallos menores).** Cumple formato, orden de guion, comentario del Operator al ~35 %, aperturas y cierres distintos, balance verde y outro. Quedan acciones que no se leen (palo sin ventana, nail sin mano, pea-shooter sin blanco), un posible error de voz ("pints") y un par de overlays solapados.

## Fallos
1. **[00:50]** La transcripción dice "Six **pints** a week" pero el label dice "SIXPENCE A WEEK" → regla "Whisper-check cada línea contra el guion" → comprobar si el TTS dijo "sixpence" y Whisper lo oyó mal. Si realmente dijo "pints", regenerar el take y revalidar con earshot.
2. **[00:30]–[00:33]** "Tapping on windows with a long stick": ella apunta el palo al cielo con un árbol, sin ventana en cuadro. Solo hay un label "TAP" → "cada acción debe ser inequívoca" → añadir una ventana iluminada en cuadro y que el palo la toque (golpe visible + onda).
3. **[00:46]–[00:48]** "Shot dried peas at the windows": no hay ventana ni blanco en cuadro y el tubo no está en la boca, así que no se lee el disparo → misma regla → mostrar la ventana y la arveja saliendo con trayectoria. El tubo es **negro** en 00:46–00:47 y **marrón** en 00:48–00:50 → unificar el color.
4. **[00:48]** La arveja es un disco verde plano que flota sobre la punta del tubo, con un hueco → "objetos pegados a la mano/prop, nada flotando, nada plano" → ponerla en la boca del tubo o hacerla un volumen pequeño con trayectoria.
5. **[00:07]–[00:09]** "Pushed a nail into a candle": no se ve el clavo en la mano (ella tiene el puño vacío ni lo sostiene) → "herramientas EN las manos / acción legible" → mostrar el clavo en su mano y clavándose en la vela antes del primer plano.
6. **[00:42]** Detrás del label "LONDON" asoma otro label tapado ("2…TH") → overlays limpios y legibles → ocultar o retirar el label viejo antes de mostrar LONDON.
7. **[01:09]–[01:13]** El palo del knocker-upper parece terminar en el sombrero del NPC, sin mano agarrándolo (recién en 01:15 se ve la mano) → "props en la mano" → que la mano lo sostenga desde el principio de la caminata.
8. **[00:36]–[00:38]** El flequillo le tapa el ojo y mira hacia abajo, con la cara a medias → "cara visible" → apartar el flequillo o girar un poco la cabeza. El buzón es un volumen rojo liso, sin detalle, tipo "plano".
9. **[00:43]–[00:44]** Ella queda pegada al borde derecho, con los pies y la pierna cortados abajo/derecha → "nunca cortada por el borde" → reencuadrar con el cuerpo entero (es el mismo caso que ya corregiste en #9/#11/#23/#29-30). Lo mismo, más leve, en los primeros planos de 00:30–00:35 y 00:46–00:52, que cortan el cuerpo por abajo. Si son primeros planos intencionales, ignorarlo.
10. **[00:51]** La sixpence se lee como un arco gris fino sobre el puño, no como moneda → "cada acción inequívoca" → agrandarla y darle brillo, como las monedas de 00:25–00:26.
11. **[00:00]–[00:01]** y **[00:04]–[00:06]** Ella es diminuta en la esquina inferior y de espaldas, con la cara ilegible, durante ~8 s del hook → "cara visible / personaje legible" → acercar la cámara o reencuadrar la cama para que ocupe más del cuadro.
12. **[01:25]** El texto del cartel del reloj ("SNOO…") queda cortado por el borde derecho → overlays dentro del cuadro → desplazar el macro.
13. **[01:41]** El label "LOGGING" queda tapado por el sol y sin "OFF" → mover el label o el sol.
14. **[01:29]–[01:31]** Los labels "CANDLE" y "STICK" tienen las letras muy juntas, con la C cerrada (problema conocido de Pixelify en tamaño pequeño) → "letras espaciadas" → subir el espaciado o usar pixfont.
15. **Duración** ≈ 1:44, algo por encima del rango 80–100 s → recortar un par de planos de relleno (por ejemplo, repeticiones de la cama al inicio).

## Cumple
- Formato alternativo: abre directo con "If you sleep facing a window, you have an alarm clock", sin "Operator… I dug up".
- Comentario del Operator a ~35–37 % (00:36 de 1:44), con tarjeta "Reply to operator_jay's comment" legible.
- Inicio (dormitorio) y final (prado) en lugares distintos; no hay pantalla negra, y el outro (MECHAYUKI, ARTIFACT 004, FOLLOW) va sobre su despedida.
- Balance verde: prado final, jardineras, hiedra, árboles y hierba. La nieve solo aparece en el invierno de la historia.
- Labels "This is a…" presentes (candle alarm, knocker-upper, snooze button) en fuente pixel legible y de tamaño moderado.
- Captions de una palabra con fuente pixel; "1787," y "1876," legibles; "fi" corregido.
- Camas con edredón arqueado sin atravesar a ella (1956, Jay dormido).
- Gorros de los NPC low-poly pegados a la cabeza; rodillas de las caminatas correctas en 00:19.
- Monedas más grandes y plato de peltre legible; vela que se derrite con clavo cayendo y chispas.
- Expresiones acordes (susto en "fired", enojo en 1956, duda en "it?").
- Cierre fijo "Artifact understood, logging off".

## No verificable
- Entonación de preguntas (comment de Jay y "…sleep through it?") y que "asks" no se corte → earshot timeline/critique + curva de pitch.
- Que el primer caption ("sleep" en 00:00) esté en sincronía con "If you…" → timeline de palabras contra la voz.
- Cortes de voz dentro de palabras, la pausa antes de "Clang!" y el room de las reacciones → earshot.
- SFX en cada acción (clang, slap, tap, pea, moneda), mezcla de música (~7 dB bajo la voz, -12 LUFS, TP ≤ -1 dBTP) y ausencia de clipping → earshot critique/loudness.
- Animación fina (golpes de pala/palo, crecimiento de efectos, manos sin atravesar objetos entre fotogramas) → revisar frame a frame los clips de 00:30–00:34, 00:46–00:50 y 01:19–01:23.
- Créditos CC0/CC-BY en LOG.md → revisión manual.
