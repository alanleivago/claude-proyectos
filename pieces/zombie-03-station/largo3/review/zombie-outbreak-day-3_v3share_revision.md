# Revisión de zombie-outbreak-day-3_v3share.mp4

- Estilo: ava
- Duración: 596.8 s

## Veredicto
**CASI (fallos menores).** El episodio está completo y la estructura funciona: recap inicial, capítulos con tarjeta de hora, puzzle/NPC/perro, decisión final con SUBSCRIBE. Quedan varios fallos visibles de geometría y de coherencia voz/pantalla que conviene corregir. Varias correcciones de v3 (portón, estabilidad de cámara, temblor de Marla, rugido) no se pueden confirmar con estos fotogramas.

## Fallos

1. **[05:35 y 05:43]** Ava hace el gesto de "stay" con los brazos rígidos en horizontal, tipo alas de pollo, y los dos planos se parecen mucho. En 05:35 se ven dos formas de guante a la derecha, que parecen una mano duplicada. → Rompe "make new animations" y "manos en su sitio". → Crear una animación real (un antebrazo en alto, palma hacia fuera), comprobar que solo haya dos manos y cambiar el plano entre un fotograma y otro.
2. **[07:12.7]** La mano de Ava flota delante de la puerta. No se ven pomo, llave ni cerradura, y casi todo el plano es textura marrón plana. → Rompe "Hands on props: Ava's own hand, never floating". → Mostrar la llave puesta en la cerradura y apoyar la mano en ella.
3. **[00:37.3]** La mano de Ava queda en el aire, a la izquierda del panel del interruptor, sin tocarlo. La tapa del generador parece textura de ladrillo rojo, un bloque plano. → Rompe "hands on props" y "props con detalle low-poly". → Llevar la mano al interruptor y retexturizar el generador (chapa, rejilla, tapón).
4. **[04:43.5]** La tarjeta escribe "1:4_", pero la voz dice "12:30 a.m.". → Incoherencia voz/pantalla. → Corregir la hora de la tarjeta o del guion. Esta tarjeta tampoco lleva la línea "DAY 3 — …" que sí tiene la de 07:42.
5. **[01:59.4]** El contador marca "200 PACES" cuando la voz acaba de decir "65" (el 200 llega después). → Rompe "labels land on the word that says them". → Sincronizar 65 / 130 / 200 con cada número hablado.
6. **[02:51.6]** Una banda gris translúcida cruza el hocico y el cuello de Ribbon. → Rompe "dog: no transparent parts". → Revisar el ordenamiento de transparencia del pasamanos o la niebla.
7. **[02:51.6, 03:14, 03:21, 06:13]** El lateral de la repisa, la tubería grande y los escalones de piedra muestran patrones concéntricos tipo moiré. → Riesgo de parpadeo, igual que el z-fighting que se corrigió en la alfombra. → Medir diferencias entre fotogramas (≥5 fps) y subir el mipmap o quitar la textura de líneas finas. Revisar también las rayas finas de la alfombra de la escalera en 06:50.
8. **[06:13.0]** Un plano de neblina translúcido violeta cruza la puerta principal y parece un glitch. → Bajar su opacidad o sacarlo del vano de la puerta.
9. **[07:50 y 09:04.6]** El helicóptero es una caja con una línea de rotor y, en 09:04, un cubo azul colgando. El "puente" parece un andamio de madera sin tablero. → Rompe "vehículos con modelo low poly real, no cajas". → Usar un modelo low-poly gratuito de helicóptero y un puente con tablero.
10. **[08:27.3]** La etiqueta "TALLER THAN THE DOOR" contradice la imagen: la cabeza del gigante queda por debajo del arco de la puerta. → Escalar al gigante o encuadrar junto a la puerta en el mismo plano.
11. **[05:50.6]** La huella enorme es una mancha marrón sin dedos ni contorno, y no se lee como pie descalzo. → Dibujar una huella con dedos y talón, y que se vea la comparación con la bota.
12. **[07:27.6]** La pantalla de la radio parece leer "142.581", pero la voz dice "146.5 (146.52)". → Poner 146.520 en el display.
13. **[01:59, 02:14, 03:21, 03:28]** Marla tiene siempre la misma boca abierta en "O", incluso cuando habla Ava. Su mano es un bloque blanco sin dedos (02:06). Hay motas amarillas sueltas flotando junto a su cabeza (03:21 y 03:28). La etiqueta "BITTEN" está lejos del brazo mordido y sin línea guía. → Rompe "manos facetadas con dedos y nudillos". → Poner boca en reposo cerrada, rehacer la mano, quitar las motas y acercar la etiqueta.
14. **[01:37]** El HUD tapa el icono de HAND MAP en el inventario. → Mover el HUD o la rejilla.
15. **[00:29.8]** El temporizador tiene la aguja en las 12 y el guion dice "set for six o'clock". No se ven cinta ni letra a mano. → Poner la aguja en 6 y mostrar la cinta con "Marla" escrito. El plano también es muy pixelado y difícil de leer.
16. **[04:13.7]** "RIGHT HAND ON THE WALL" es verde oscuro sobre azul marino, casi ilegible. → Subir el contraste. La ruta de la regla tampoco se dibuja.
17. **[06:42.9]** El panel "1. GET DRY" está tan oscuro que parece inactivo, y la flecha parece una barra de "stop". → Aclarar el panel y poner una punta de flecha.
18. **[09:34.5–09:41.9]** El fundido llega casi a negro mientras la voz ya lee las opciones, y el menú sale cuando termina la opción 2. El cursor está fijo en "2. FIGHT" en 09:41 y 09:49, lo que sesga la decisión. La cabeza del gigante queda cortada en la esquina inferior izquierda como una mancha. → Mostrar el menú desde "Option one", mover el cursor entre 1 y 2 y limpiar el encuadre.
19. **[08:57, 03:36, 06:27]** El encuadre pone la espalda y las caderas de Ava como protagonista del plano. → Reencuadrar hacia arriba o de lado.
20. **[04:06.2]** Plano casi ilegible: bloques oscuros y una mano enorme sin forma sobre el mapa. → Alejar la cámara y mostrar el mapa con la mano de Ava bien formada.
21. **[00:59.7]** La etiqueta dice "WATER + BLANKET" pero no se ve manta. La mitad derecha del plano es negro puro. → Mostrar la manta y levantar las sombras.
22. **[02:36.7]** Ava mira al vacío hacia arriba con cara plana, y en 00:14, 02:29 y 05:43 repite los ojos cerrados. → Rompe "cute expressions instead of a blank stare upward". → Variar expresiones o mirar a cámara.
23. **[07:20.2]** La linterna es una esfera de luz sobre la pared, sin cono visible desde la mano. → Rompe "flashlight beam must follow the flashlight". → Añadir cono visible desde la linterna.
24. **[06:35]** Ribbon se ve solo de espalda, un bulto oscuro con chaleco. → Rompe "the dog must look cute". → Encuadrar de tres cuartos con la cara visible junto al fuego.
25. **[01:22, 00:22 vs 00:52]** A la derecha de 01:22 una figura parece flotar o atravesar la pared del edificio. La multitud de zombis ante la puerta en 00:22 desaparece en 00:52 sin explicación. → Revisar la figura y la continuidad.

## Cumple
- Recap de la elección anterior al inicio de la Parte 3, y ningún "click" hablado en la transcripción.
- Tarjetas de hora solo con texto negro, sin recuadro gris; el cursor de máquina de escribir se ve en las tres.
- Estética PS1 RE: HUD CONDITION con ECG, subtítulos pixelados de una palabra, diagramas oscuros, labels con caja.
- Hechos con cifra y diagramas (CO, 101.4 °F con CDC, ledge/agua, Big Dipper → Polaris). Los hechos mostrados son correctos.
- Final con menú RE sobre fondo vivo (Ava + Ribbon), sin subtítulos encima y con SUBSCRIBE! visible; no hay tarjeta aparte.
- Desván claramente más oscuro y Ribbon con ojos redondos y cara simpática (01:44, 05:20).
- Plano de Dutch sin recuadros extra; salas ricas (pasillo 06:57, sala de trabajadores 04:28, mansión 06:20).
- Static y "stay" aparecen una sola vez en la transcripción.
- Guion humanizado y en inglés, con conectores y 2ª persona.

## No verificable
- **Audio y música:** volumen de voz (+1.5 dB), música audible y continua hasta el final, LUFS por sección, SFX duplicados o duros, rugido del gigante, voz de Marla, pausa antes de "Comment 1 or 2", velocidad (~0.88) y pensamientos susurrados. → `earshot timeline/critique`.
- **Movimiento fino:** que Ava, Marla y las cabezas de zombis no tiemblen, que la cámara no tiemble, que no haya z-fighting o parpadeo, que no haya planos quietos >4 s, y que la boca del gigante se abra con el rugido. → Revisar el mp4 cuadro a cuadro (≥5 fps) en los tramos corregidos, como exige la regla de verificación obligatoria.
- **Animaciones:** portón del garaje abierto, apagado de luces tras el generador, puertas con animación, Ava en escaleras y Ribbon corriendo. Ningún fotograma muestra el portón abierto. → Mismo método cuadro a cuadro.
- **Hold ~2 s de objetos clave:** requiere ver los tiempos del render.
- **Fuentes en pantalla:** solo CDC aparece en los diagramas. Las fuentes de sewer gas, agua en movimiento y hipotermia deben estar en `FACTS.md` y `DESCRIPCION.md`.
- **Revisión por partes:** como `revisar_render.py` se queda sin salida en archivos largos, repasar el render en tramos de ~2:40.
