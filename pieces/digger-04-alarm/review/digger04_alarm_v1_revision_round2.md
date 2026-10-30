# Revisión de digger04_alarm_v1.mp4

- Estilo: mechayuki
- Duración: 105.4 s

## Veredicto
**CASI (fallos menores):** el formato, el orden del guion, el comentario del Operator al ~35 %, la etiqueta de cada objeto y el cierre en verde se cumplen. Quedan tomas pixeladas o ilegibles, la protagonista cortada por el borde en varias tomas, la pea-shooter ausente en la mano de Mary y una posible discrepancia de voz ("pints" vs "sixpence").

## Fallos
1. **[00:52] "rude."** La toma entera sale en bloques gigantes, el NPC de la ventana es una mancha y Mechayuki asoma cortada por el borde inferior sin cara legible → rompe "ella nunca cortada por el borde" y "expresión acorde a la línea" → usar un plano limpio de ella con cara de desagrado y el NPC de la ventana nítido. Mismo problema, más leve, en **[00:42]** (cama pixelada).
2. **[00:30]–[00:33] "down / with / stick."** Mechayuki queda en la esquina inferior izquierda, cortada por el borde, con el pelo tapándole la cara → rompe "nunca cortada por el borde" y "cara visible" → reencuadrar con ella entera, o al menos con cara y mano que sostiene la vara dentro del cuadro.
3. **[00:19] "late,"** Está medio fuera de cuadro por la izquierda, con la cabeza cortada → mismo problema → centrarla o quitarla del plano si es solo un plano de la reja.
4. **[00:43]–[00:45] Mary Smith.** Tiene la mano en la boca, el otro brazo levantado y ninguna pea-shooter visible → rompe "herramientas EN las manos" y "la acción debe leerse sin dudas" (el fix "centrada y disparando" no se ve). Además, en [00:46] quien dispara es Mechayuki, no Mary → poner la pea-shooter en la mano de Mary (o en su boca) con un guisante visible saliendo. El sombrero es enorme, con ala de capa que se lee como bruja, y el pelo rayado asoma por los lados → reducirlo según la cabeza medida.
5. **[00:51]–[00:52] "Six pints a week."** La transcripción oye "pints", pero la etiqueta dice SIXPENCE A WEEK → rompe "Whisper-check cada línea contra el guion" → verificar que el TTS dice "sixpence"; si no, regenerar esa toma.
6. **[00:34]–[00:36] "This is a knocker-upper."** No hay etiqueta de objeto en todo el tramo (ni en [00:27]–[00:34]) → rompe el patrón "This is a…" → agregar etiqueta KNOCKER-UPPER pixfont al decirlo.
7. **[00:09] "candle."** Empuja el clavo pero no se ve el clavo en su mano, solo chispas → rompe "herramientas en las manos" y "acción inequívoca" → mostrar el clavo en el puño y su inserción en la vela.
8. **[01:03]–[01:08] 1876.** El reloj despertador flota delante de su torso, tapándole el brazo, sin apoyarse en ninguna superficie → rompe "objetos sobre superficies" → apoyarlo en una mesita de noche o sostenerlo con la mano.
9. **[00:21] "fired".** El caption se lee "Ared" (la f no cierra bien en la fuente pixel) → rompe la regla de pixfont legible → ajustar tamaño o glifo de la "f".
10. **[01:23] cama 1956 (y [00:00]).** La coleta/pelo es un triángulo naranja plano que sobresale más allá del borde del colchón → rompe "nada plano / nada flotando" → hacer que la coleta caiga sobre la almohada o junto a la cama.
11. **[00:00]–[00:41] haz de luz.** El haz de luz es una losa beige opaca que tapa el cabecero → rompe "nada plano" → hacerlo más transparente o recortarlo.
12. **[01:25] snooze button.** Primer plano blando y pixelado, con "SNOO" ilegible → regenerar la textura a más resolución.
13. **[00:54]–[01:00] Levi Hutchins.** Es un NPC cortado por la izquierda y no se ve qué construye (la mesa tiene piezas ambiguas) → rompe "acción clara" → mostrar un reloj armándose en su mano o en la mesa.
14. **[00:51] "week."** La moneda grande le tapa media cara → reencuadrar para que se vean los ojos y la sonrisa.
15. **[01:30] STICK y [01:38].** La etiqueta STICK roza el borde derecho y en [01:38] el teléfono se sale por la izquierda → recolocar.
16. **[01:42] outro.** El título MECHAYUKI y el botón FOLLOW son grandes → la regla pide el outro "pequeño" → reducir.
17. **Duración ~104 s.** Pasa de los 100 s de la regla; es tolerable pero conviene recortar un par de segundos.

## Cumple
- Formato alterno: abre directo con el hook "If you…" y sin la escena "Operator… I dug up".
- Apertura y cierre en lugares distintos: dormitorio frente a pradera verde.
- Comentario del Operator al ~35 % (00:36 de ~104 s), con tarjeta de comentario legible.
- Etiquetas de objeto con pixfont, de tamaño moderado y legibles: CANDLE ALARM, METAL PLATE, PEA SHOOTER, SNOOZE BUTTON, años y nombres.
- Captions de una sola palabra en pixel font.
- El cierre "Artifact understood, logging off." se mantiene, y el outro va sobre su toma de despedida: sin pantalla negra ni "more soon".
- Nada de nieve en exceso: solo aparece en la escena de invierno; el final y el cierre son verdes, y hay hiedra, macetas y césped en Londres.
- Poste en la mano de los NPC del knocker-upper (1:11–1:17), con gorras bien pegadas a la cabeza.
- Buzón limpio, sin losa encima; sin luna en la pared.
- Efectos y expresiones: sudor, signos "!" y "?", líneas de susto, ZZZ, chispas, estrella de SLAP, caja CLANG.
- Mechayuki duerme sobre el colchón con el edredón arqueado, sin atravesar la cama.

## No verificable
- **Voz:** pronunciación "sixpence"/"pints", la entonación ascendente de la pregunta final, "Operator Jay asks" natural y sin palabras cortadas, y la energía del timbre → `earshot timeline/critique` y Whisper contra el guion.
- **Música y mezcla:** sin chiptune puro, ~7 dB bajo la voz, -12 LUFS, TP ≤ -1 dBTP, la pausa de ~0,4 s y los SFX CC0 en cada acción (clang, tap, slap) → `earshot critique`.
- **Movimiento fino:** si las manos atraviesan objetos, el golpe del clavo, el crecimiento del charco de cera o el paso de las piernas de los NPC; los fotogramas sueltos no lo muestran → revisar a mano los contact sheets de inicio, medio y fin de cada toma.
- **Cortes y sincronía:** si los captions de [00:23]–[00:27] ("unreliable" repetido) y [00:48]–[00:50] ("shooter" repetido) son pausas reales o un caption pegado → revisar la timeline de palabras.
- **Estilo del pixelado:** si las tomas bloqueadas ([00:42], [00:52]) son una transición intencional o un fallo de resolución → confirmarlo contra el motor.
- **Créditos CC-BY:** listarlos en la descripción de TikTok y en `LOG.md`.
