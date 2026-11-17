# Revisión de q0.mp4

- Estilo: ava
- Duración: 150.1 s

## Veredicto
**NO LISTO.** Hay fallos de geometría y manos que las reglas piden revisar sí o sí. El más serio son bandas claras con borde duro sobre la cara y el torso de Ava en 2:13–2:26, que parecen el cono de linterna atravesándola. Es la ronda 2, así que conviene arreglar solo los fallos 1–5 y entregar.

## Fallos

1. **[02:13–02:26]** Un polígono claro con borde horizontal duro cruza la cara de Ava (2:13, 2:15, 2:17, 2:24). En 2:26 el torso blanco tiene franjas rosadas. Parece el cono de linterna sólido atravesándola → regla "sin atravesar / el haz sigue a la linterna" → alinear el cono con la linterna, que no corte la cabeza ni el torso. Revisar el mp4 a ≥5 fps.
2. **[01:28–01:32, 02:24]** Las manos de Ava son bloques sin dedos (mitón gris). En 1:28–1:30 la mano se hunde en la mesa y el papel, y la manga se ve estirada con rayas. En 2:24 la mano es un cubo grande en primer plano → regla "manos facetadas con dedos, nunca ladrillo / nada hundido en la mesa" → usar la mano propia con dedos y apoyarla encima del papel.
3. **[02:01–02:06]** Las manos de Marla son cuñas blancas sin dedos. La linterna parece clavada en el muslo de Ava (la manija sale horizontal, con bloques verdes) → regla "mano propia en props, sin flotar/atravesar" → reencuadrar o dar mano con dedos y agarre claro.
4. **[01:39–01:45]** Ava empaca la mochila con el puño levantado, congelado ~5 s, sin tocar nada. Sobre la mesa no hay agua ni linterna que correspondan a los labels WATER / FLASHLIGHT. En 1:41–1:43 una barra negra cruza su cintura → regla "nada quieto >4 s / sin clipping" → animar que agarra cada ítem, cambiar de plano, sacar la barra del cuerpo.
5. **[00:41–00:44]** Ava, de espaldas, queda con una rodilla levantada, congelada 4 s, como pateando la persiana. La rendija de la puerta casi no se ve y la línea del label cruza su cuerpo → regla "animación de abrir puerta / nada quieto >4 s" → animación real de levantar la persiana, rendija visible, label sin cortar a Ava.
6. **[00:05–00:09]** Seis anillos hexagonales flotan en el aire sobre el candado, sin cadena que los una → regla "props bien apoyados, nada flotando" → hacer cadena conectada o quitarlos.
7. **[01:30]** El label "? METERS" tapa el ojo y la cara de Ava → regla de legibilidad de etiquetas. Además todo el plano de pasos usa **metros** (voz y diagrama), mientras las reglas piden unidades US → moverlo y pasar a yardas (~109 yd).
8. **[01:37]** El HUD tapa la casilla HAND MAP del inventario. En 0:45 y 1:03 también pisa la barra de título de los diagramas → reacomodar el layout o bajar el contenido.
9. **[00:30–00:34]** La nota de cinta con la "M" de Marla no se lee: es un bloque amarillo con ruido. Los primeros planos del timer ampliados a 128 px se ven borrosos y chunky. En 0:33.8 aparece un "H." verde suelto → regla "props con detalle de textura real; label cae en la palabra" → texto legible en la cinta, no ampliar tanto, borrar el "H.".
10. **[01:01–01:11, 02:13]** Piel de Marla: gris solo en 1:01. En 1:09, 1:11 y 2:13 se ve beige/durazno, así que el arreglo de "piel gris" no es consistente. De espaldas (2:07–2:09) parece otra persona: pelo oscuro y pantalón negro frente al pelo gris y pantalón caqui de antes → igualar material e iluminación.
11. **[01:56]** Piernas de Ava deformadas: triángulos filosos que parecen un skinning roto, con la mano plana sosteniendo el mapa → revisar la pose o la cámara.
12. **[00:22–00:26]** Ava mantiene la misma pose en el lobby ~4 s con zombis detrás → regla "nada quieto >4 s" → cambiar de plano o animar.
13. **[00:48 vs 00:54]** La narración dice "the station goes dark again". El lobby está azul oscuro en 0:50–0:52 y vuelve a verse cálido y brillante en 0:54, con una voluta de humo suelta junto al pilar derecho → coherencia de luz y posición del humo.
14. **[00:58]** El label dice "WATER + BLANKET" pero Ava solo lleva el bidón. Los planos de túnel (0:58, 2:07, 2:13) son muy oscuros → regla de iluminación (+30 %, sombras levantadas).
15. **[01:20]** La voz dice "the streets are full" pero solo hay ~15 zombis en la escalinata, no en la calle → llenar la calle.
16. **[02:18–02:21]** En 2:20 la cabeza de Ava queda cortada por el borde superior. El label "LADDER DOWN" no muestra escalera, solo un hueco negro. La reja es naranja brillante, no oxidada → reencuadrar y agregar escalera.
17. **[01:31–01:36]** El diagrama PACE COUNT no lleva fuente (los demás sí: CDC, OSHA) → agregar etiqueta de fuente. El diagrama de fiebre aparece con CDC pero no dice "In this world" para la parte ficticia ("a bite means it's spreading").
18. **[02:07–02:11]** Las líneas azules verticales en el derrumbe parecen barrotes, no agua filtrándose. En 2:11 el piso con marcas blancas puede titilar (verificar diffs) → reemplazar o animar como gotas.
19. **[00:13–00:15]** El travesaño tapa los ojos de Dutch → reencuadrar. En 1:09–1:11 los ojos de Marla son discos blancos vacíos, quizá intencional.
20. **[01:37]** La pantalla de suministros cae sobre la frase "Soldiers still navigate like this…", que habla de navegación → buscar un visual de navegación o dejar el diagrama de pasos más tiempo.

## Cumple
- Recap de la elección al inicio de la parte ("Last night, you had to choose… most of you said no").
- Las tarjetas negras de hora son solo texto, sin recuadro gris, con máquina de escribir y cursor.
- Subtítulos pixelados en fuente RE, abajo, sin cabecera de canal; HUD CONDITION con lugar (STATION / TUNNEL / SEWERS) y estado.
- Los diagramas (CO, termómetro, mapa, pasos) son oscuros, con labels en cajitas pixel y fuentes en la mayoría (CDC, OSHA).
- Perro acostado en 0:09, lámparas con llama en la mesa (1:28) y linterna cálida en el túnel.
- Contador de pasos 65 → 200 → 400 sincronizado con la voz.
- Expresiones cute de Ava (ojos cerrados y sonrisa en 1:47) y planos de tensión.
- Ni Ava ni nadie dice "click" ni onomatopeyas.
- Guion humanizado con conectores y datos reales (CO, 100.4 °F, H₂S).

## No verificable
- **Continuidad:** las tarjetas dicen "DAY 3" a las 6:10 PM y el helicóptero llega al amanecer. Confirmar si ese amanecer es el del día 4, porque la nota de la parte anterior decía "Day three. Dawn."
- **Voz y audio:** lentitud (speed ≈ 0.88), pausas de 1–2 s, pensamientos en susurro, respiración, calidad del "no, no, no", cortes sin palabras comidas, F0 final descendente. Usar earshot `timeline` / `critique`.
- **SFX:** sincronía y mapeo en el cuadro exacto (pasos, generador, golpes, máquina de escribir); duplicados o duros.
- **Música:** LUFS por tramo (−10/−11 LU bajo la voz), continuidad y crossfade; usar earshot `measure`.
- **Movimiento fino:** temblor de Ava y de las cabezas de zombis (test del centroide del pelo), parpadeo del suelo, z-fighting, que el cono de linterna y las luces no titilen, animaciones sin loopear. Revisar el mp4 a ≥5 fps.
- **Transiciones:** rampa del flash blanco y de las tarjetas.
- **Arreglos de esta ronda fuera de este tramo** (cubo wireframe, contador 80, cielo de amanecer): no aparecen en los 0:00–2:30; revisarlos en las partes 2–4.
