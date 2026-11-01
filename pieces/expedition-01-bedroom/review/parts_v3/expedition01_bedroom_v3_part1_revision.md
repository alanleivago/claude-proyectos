# Revisión de expedition01_bedroom_v3_part1.mp4

- Estilo: mechayuki
- Duración: 160.0 s

## Veredicto
**NO LISTO**: se repiten correcciones que el creador ya pidió (ella cortada por el borde, props que no se leen o no tocan la mano, pose que atraviesa objetos). Hay también tres shots clave donde la acción no se entiende.

## Fallos
1. **[02:08–02:10]** La almohada en la mano es gris, afilada y parece una hoja o cuchillo. En la tarjeta ITEM GET es blanca. Además queda flotando delante del torso y no toca claramente ninguna mano → regla "props claros / en la mano / hands never pass through objects" → modelarla blanca, redondeada y del tamaño de la tarjeta, con la mano agarrándola.
2. **[01:16–01:24]** En la cueva ella está sentada junto a la estera, no "arrancando hierba y tendiéndola". La bota/pierna se superpone con la fogata. Los restos de hierba verdes en la mano casi no se leen → "cada acción inequívoca", "nada atraviesa nada" → separar la pierna del fuego, animar que arranca hierba y la extiende sobre el suelo.
3. **[01:00–01:02, 00:56–00:58]** Está acuclillada detrás del armario caído, con la cara tapada por el pelo y la cabeza contra la pared, rozando o clipeando con el armario. Nunca se la ve acostada sobre el colchón, que es lo que dice la voz ("lay on top of it") → regla de cama/clip, cara visible → usar el clip `sleep_lie` con el root sobre el colchón y revisar de lado y desde arriba.
4. **[00:04, 01:30–01:34, 01:40–01:46]** Queda cortada por el borde derecho. En 00:04 solo se ven un brazo y una pierna. En 01:32 y 01:44 media cara está fuera de cuadro → regla "never cut off at the edge" → reencuadrar o mover el personaje hacia dentro.
5. **[00:06–00:08]** Ya está dentro del cuarto, de pie, antes de entrar. La entrada por la ventana llega recién en 00:26–00:28, porque la puerta está trabada. La continuidad del storyboard queda confusa → mostrar el interior sin ella, o con un plano claramente distinto (cutaway), o reordenar.
6. **[00:20–00:25]** La tarjeta "EXPEDITION 01 / THE BEDROOM" tapa su torso durante unos 6 s sobre un plano casi estático → overlays pequeños y claros → moverla a una zona libre (arriba) y acortarla.
7. **[00:36–00:40]** La voz dice "clothes on the floor", pero en el plano de 00:36 un bloque oscuro (armario) tapa media pantalla. Los objetos naranja de la mesita son ilegibles y no hay ropa en el suelo → "props reconocibles" → mostrar la ropa en el suelo (prendas reconocibles) y despejar el encuadre.
8. **[00:44–00:50]** Los recuadros de escaneo numerados se amontonan (1, 3, 7 y 8 superpuestos sobre el armario) y no marcan objetos reconocibles → "scan boxes small and clear" → distribuirlos sobre objetos concretos, sin solaparse.
9. **[02:00–02:02]** El remate ("The bugs still haven't left") se muestra con ella de espaldas y casi de perfil, y los bichos son puntitos casi invisibles → cara visible en tomas clave y acción clara → plano de la cama con bichos visibles y su cara hacia cámara con expresión de asco o resignación.
10. **[01:30–01:34, 01:48–01:50]** Los bichos son microscópicos y las flechas azules de "BUGS: KEEP OUT" son ambiguas → acción legible → agrandar los insectos y mostrar cómo huyen de la ceniza.
11. **[01:38–01:38 / 01:36]** El plano "MIDDLE AGES" entra mientras la voz aún termina "…bug spray." de la cueva. Pasa lo mismo hacia las 02:19–02:20, con el plano "EGYPT" entrando durante "stone." → corte dentro de la última palabra → mover el corte a la pausa después de la frase.
12. **[01:36–01:58]** La estera de paja es un octágono plano en el suelo, casi sin volumen (sin saco ni grosor) → "nada plano, con volumen" → darle grosor y forma de saco, como el de 01:40.
13. **[01:14]** Las líneas del recuadro REWIND cruzan el texto "BACK 200,000 YEARS" y lo pegan al caption "back." → overlays dentro de su marco, legibles → quitar el texto de la zona de los marcos o bajar el marco.
14. **[00:34]** El overlay dice "SCANNING.." (dos puntos, erróneo) → corregir a "SCANNING..." o "SCANNING".
15. **[01:08]** El apóstrofo de "it's" se ve como acento grave ("it`s") en la fuente pixelada → arreglar el glifo en `engine/pixfont.js`.
16. **[00:00–00:02]** Está de perfil con los ojos cerrados y el pelo tapando la cara en el plano de apertura → "face visible, avoid profile" → girar un poco hacia cámara o abrir los ojos.
17. **[02:36–02:38]** Yace sobre el suelo con la cara oculta. La cabeza queda al lado del bloque de piedra, no encima → objetos sobre superficies, cara visible → apoyar la cabeza sobre el bloque y girar un poco la cara.
18. **[02:12–02:18]** El overlay dice "7000 BC: STONE PILLOW" y no menciona Mesopotamia, que es lo que dice la voz. La sala parece egipcia → coherencia → cambiar la etiqueta ("MESOPOTAMIA · 7000 BC") y la ambientación.

## Cumple
- Sin "!" en la transcripción.
- Captions de una palabra, en pixel font, con buen tamaño.
- Cuarto de los escaneos: el overlay "8 ARTIFACTS" coincide con la voz.
- Aperturas distintas y finales distintos (pasto abierto → suelo de tierra).
- Tarjetas ITEM GET claras y legibles; coinciden con la voz.
- Apertura en pasto verde con arcoíris y árboles: el balance verde de la regla se cumple en exteriores.
- Escenas históricas (cueva, sala egipcia, China) con volumen y contraste, y etiquetas coherentes con la narración (salvo el punto 18).
- El pequeño efecto de la ceniza y el colchón de hierba se ven reconocibles.
- Etiquetas de objeto tamaño moderado, sin exagerar.

## No verificable
- Voz clonada y cadena limpia (-14 LUFS), y si el "Operator," inicial es el clip aprobado `megagirl_operator.wav` (la transcripción lleva coma, no "…"): usar `speaker_sim.py` y `earshot timeline/critique`.
- Que "Scanning?" y "Fleas, lice, bedbugs?" suenen como preguntas con tono ascendente: `earshot critique` sobre esas frases.
- Palabras cortadas, pausa de ~0.4 s tras "Operator…" y Whisper vs. guion: `earshot timeline`.
- Música (bajo y batería suaves, ~7 dB bajo la voz, -12 LUFS, TP ≤ -1 dBTP) y SFX en acciones (excavar, ventana, ITEM GET, bichos): `earshot critique`.
- Comentario del Operator al 35–40%: no aparece en este tramo; confirmar que va en otra parte (parte 2–4) o que no se omitió.
- Cierre ("Expedition complete. Logging off.") y CTA SUBSCRIBE: deben ir en la parte 4 (esta es la 1 de 4); revisar allí.
- Animación fina (caminatas, rodillas, clipping real durante la escalada por la ventana y el agacharse): revisar cuadros intermedios con `revisar_render.py`.
