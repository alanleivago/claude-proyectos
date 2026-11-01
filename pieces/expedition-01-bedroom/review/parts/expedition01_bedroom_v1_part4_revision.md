# Revisión de expedition01_bedroom_v1_part4.mp4

- Estilo: mechayuki
- Duración: 145.6 s

## Veredicto
**NO LISTO**: la estructura y el estilo MML2 están bien, pero el contador de días del manual va muy desfasado de la voz. Además, hay subtítulos que tapan etiquetas, dígitos y letras ilegibles, un muro que atraviesa la cámara y el cursor del inventario no sigue la enumeración.

## Fallos

1. **[00:50–01:09]** El contador "DAY n" y las etiquetas MOODY / SEEING THINGS van muy por delante de la voz.
   - A las 00:50.9 ya se ve "Day 3 / MOODY".
   - A las 01:00 la voz dice "day three" y la tarjeta marca Day 6.
   - A las 01:03.7 la voz dice "day five, seeing things" y la tarjeta marca Day 7–9.
   - Rompe la regla de que cada acción se lea sin ambigüedad, y además muestra datos falsos.
   - Arreglo: atar el avance de los días y la aparición de las etiquetas a los word timings ("three" → Day 3, "five" → Day 5, "eleven" → Day 11).

2. **[00:01.8, 01:29–01:31, 02:12.8, 02:14.7]** El subtítulo se superpone a etiquetas del juego y las tapa.
   - "snored" tapa "CAUSE: SNORING (ZZZ)".
   - "pillows," y "blankets," tapan "8/8 ARTIFACTS".
   - "doesn't" y "sound" tapan "TIME: NO".
   - Rompe la regla de que los overlays y las etiquetas sean legibles y claros.
   - Arreglo: subir la caption cuando haya una etiqueta inferior, o mover esas etiquetas a otra zona.

3. **[00:40.0, 00:50.9]** Los dígitos de los subtítulos se leen mal.
   - "1956" se ve como "1896" y "1964" como "1984".
   - Cambia el dato histórico para el espectador, y la etiqueta de pantalla dice "1956: SNOOZE".
   - Arreglo: tamaño mayor o espaciado para los dígitos en `pixfont.js`; los 5/6/9 se cierran.

4. **[00:47.3, 01:20.1, 01:21.9, 01:51.0]** Palabras cortas ("if", "a", "eye") salen como manchas ilegibles. También pasa en [00:05.5] ("still").
   - Es el mismo problema de letras cerradas a tamaño pequeño que ya se detectó en Pixelify.
   - Arreglo: espaciar letras o subir el tamaño mínimo de las captions.

5. **[01:23–01:38]** El cursor del inventario se queda fijo en PHONE mientras la voz enumera grass beds, pillows, blankets, pajamas, cabinet, wax, peas.
   - Solo se mueve una vez, de LAMP a PHONE, a las 01:25.
   - Arreglo: mover el cursor al objeto que se nombra y cambiar el texto inferior en consecuencia.

6. **[01:23–01:38]** La etiqueta "NIGHTSTA" está truncada.
   - Arreglo: abreviar o reducir la fuente para que quepa "NIGHTSTAND".

7. **[01:40–01:49, 02:11–02:12]** Un plano beige translúcido, con textura de piedra, tapa casi el 40% derecho del encuadre.
   - Parece un muro cortado por el near-plane de la cámara.
   - Rompe la regla de nada plano ni cortado.
   - Arreglo: reubicar cámara o muro, o ocultar la pared que queda entre cámara y escena.

8. **[00:09–00:13]** La pantalla del teléfono ("ALARM 6:30", "SNOOZE X3/X8") es un plano más ancho que el cuerpo del modelo.
   - Se ve el cuerpo azul estrecho asomando debajo, y la franja rosa sobresale del borde.
   - La pantalla flota delante del objeto en lugar de estar sobre él.
   - Arreglo: proyectar la UI como textura sobre la malla del teléfono, o ajustar escala y posición.

9. **[00:20–00:25]** La cabeza de la durmiente queda fuera del colchón y de la almohada.
   - La almohada está vacía al lado, y en [01:09] sí está bien apoyada.
   - Rompe la regla de que no se atraviese ni flote sobre la cama.
   - Arreglo: poner el root sobre el colchón con la cabeza en la almohada, y revisar desde un lado.

10. **[00:27–00:43, 00:45–01:23, 00:14]** Cara y encuadre de Mechayuki.
    - Casi 16 s de espaldas o perfil en la plaza.
    - Con el manual a pantalla casi completa solo se ve un puño [00:50–01:07] o solo las piernas [01:16–01:21].
    - En [00:14] el puño izquierdo queda cortado por el borde.
    - Rompe las reglas de "cara visible" y "nunca cortada por el borde".
    - Arreglo: reencuadrar o girarla a cámara en algún momento de cada bloque.

11. **[00:36–00:38]** La acción "shoot dried peas" no se lee.
    - No hay guisantes visibles; solo la etiqueta "OR: DRIED PEAS" y ella con el brazo levantado.
    - Arreglo: añadir partículas de guisantes volando hacia la ventana, con SFX.

12. **[01:16–01:22]** El delfín del manual es un rectángulo azul plano con un ojo.
    - Rompe la regla de volumen y claridad de los diagramas.
    - Arreglo: dibujarlo con silueta reconocible (aleta, hocico).

13. **[00:27–00:43]** La etiqueta "SEE: DIGGER 04" es incoherente con la voz ("my last expedition") y con la marca "Expedition 01".
    - Arreglo: unificar la nomenclatura (Digger vs Expedition) o confirmar que es intencional.

14. **[02:21–02:23]** El cierre hablado es "Expedition complete, logging off".
    - La regla fija "Artifact understood. Logging off."; confirmar que es un cambio deliberado para el formato Expedition.
    - El outro (MECHAYUKI + EXPEDITION 01 + SUBSCRIBE) es grande en vez de "small".
    - Arreglo: reducir tamaño; confirmar la línea de cierre.

15. **[01:51–01:56, 02:16–02:21]** Dos detalles de props.
    - La voz dice "glowing rectangle", pero el teléfono está apagado en la mesita.
    - Detrás de ella en el campo hay una losa negra con borde blanco grande, sin identificar.
    - Arreglo: encender la pantalla del teléfono y retirar o identificar la losa.

16. **[00:00, 00:03.6]** Detalles menores.
    - La parte arranca a mitad de frase ("used a lot…"), probablemente por el corte en partes.
    - A las 00:03.6 el ITEM GET muestra una silueta negra y la descripción vacía mientras la voz ya dice "Eighth artifact".
    - Arreglo: ajustar el corte de la parte y adelantar el reveal del ítem.

17. **[Varias]** No se ve sombra bajo Mechayuki en la plaza, el cuarto ni el campo.
    - La regla pide sombra bastante oscura.
    - Arreglo: reforzar el blob shadow.

## Cumple
- Balance verde: sin nieve; hay topiarios, plantas, ventana con jardín y el campo final con árboles, arbustos y valle.
- Subtítulos de una palabra con fuente pixel y pop-in, y etiquetas de objeto en pixfont con tamaño moderado.
- Menús MML2 (ITEM GET, INVENTORY, Human Body Manual) coherentes, con relieve y contraste.
- "1 OBJECT = 5 OBJECTS": ALARM / CLOCK / LAMP / RADIO / STORY aparecen sincronizados con la voz.
- Etiquetas GRASS / STRAW / SPRINGS / FOAM y "BOSS: ???" con UP… / …DOWN sincronizados con la narración.
- Durmiente en [01:09–01:14]: edredón arqueado sin atravesar la cama, cabeza en la almohada.
- Escena de la lámpara de lava: objeto sobre el suelo, con volumen y color claros, y cámara baja bajo la cama.
- Knocker-upper: sombrero pegado a la cabeza, vara en la mano y puerta con tablones completa hasta el suelo.
- Outro sobre el plano de despedida, sin pantalla negra ni "more soon".
- La transcripción coincide con el guion sin cortes dentro de palabra aparentes. No hay "!" en frases clave. La pregunta final "what was it for?" está bien planteada.

## No verificable
- Contorno ascendente de las preguntas ("Why can't I sleep?", "what was it for?"), timbre y limpieza de la voz, y cortes dentro de palabra: usar `earshot` (timeline/critique) y `speaker_sim.py`.
- Música, nivel de mezcla (-12 LUFS, TP ≤ -1 dBTP, ~7 dB bajo la voz) y SFX en acciones (golpes de la vara, guisantes, snooze): `earshot` más análisis de loudness.
- Animación fina: pop-in de captions, avance real de los días, movimiento de la cera en la lámpara y caminatas del NPC: revisar con `revisar_render.py` y contact sheets de inicio, mitad y fin por plano.
- Transición pixelada en [02:14.7]: confirmar que es intencional y su duración.
- Créditos CC0/CC-BY en LOG.md y descripción.
- Aprobación previa del storyboard y de un solo render por ronda: depende del flujo de trabajo, no del render.
