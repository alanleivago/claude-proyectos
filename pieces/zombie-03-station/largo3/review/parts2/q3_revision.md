# Revisión de q3.mp4

- Estilo: ava
- Duración: 129.7 s

## Veredicto
**CASI (fallos menores).** Falla la anatomía de las partes sueltas de Nemesis, hay un posible clipping de la mano de Ava con la lámpara y una inconsistencia en el pelo de Ava. En la tarjeta final hay una transición con pop negro y baja legibilidad de la opción 1. Las correcciones de la ronda 1 se ven aplicadas.

## Fallos
1. **[00:47–00:51]** El pie ("size of shovels") es un bulto gris sin dedos. La mano ("empty hands… opening and closing") es un puño sin dedos ni nudillos. Los fotogramas 00:48.6 y 00:50.3 son idénticos, así que la mano no se abre ni se cierra. → Rompe "manos/cuerpos sueltos = low poly facetado con dedos y nudillos, nunca formas planas" y "etiquetas/animaciones caen en la palabra". → Modelar pie con dedos y mano con dedos, y animar abrir y cerrar sobre "opening and closing". El pie de 01:29–01:32 tiene el mismo problema.
2. **[01:21–01:23]** "In your hand a gun with 15 bullets": no se ve ninguna pistola, y la mano de Ava queda pegada a la lámpara roja, como si la atravesara. → Rompe "sin clipping / manos en props = mano propia" y "etiquetas en la palabra que las dice". → Mostrar la pistola negra en la mano, o un plano de ella, y separar la mano de la lámpara.
3. **[00:51–00:57, 01:27, 01:34]** El pelo de Ava cambia de largo. En 00:03, 00:14, 00:22 y 01:21 llega a los hombros o la espalda. En los primeros planos de susto y enojo es un bob a la altura de la barbilla con puntas hacia afuera. → Rompe "nunca cambiar el modelo base de Ava" y la continuidad. → Unificar el pelo en los primeros planos, o confirmar que es una malla de cara distinta y alinearla.
4. **[01:48–01:55]** La transición a la tarjeta de decisión tiene un negativo cian, luego un negro casi total (01:50) y otro negativo. → Rompe "transiciones sin costura, sin pop duro". → Suavizar con rampa, sin pasar por negro entre los dos negativos.
5. **[01:55–02:08]** La opción "1. RUN" es texto gris oscuro sobre papel pintado rojo oscuro y casi no se lee. El cursor arranca ya en la opción 2 y nunca pasa por la 1. → Rompe la legibilidad de la tarjeta de elección. → Subir el contraste de la opción no seleccionada (caja o texto claro) y empezar sin selección o con selección neutra.
6. **[01:55–02:08]** El contador salta: 0:09 a 0:03 en 1.6 s (01:56.7), 0:02 → 0:01 (02:06.5) y 0:00 al final. Probablemente es un artefacto del tiempo de muestreo, pero hay que revisarlo. → Ajustar para que baje de a 1 por segundo.
7. **[00:08–00:10]** El helicóptero es un blob pálido con un cubo azul claro en la nariz, mezclado con las torres del puente. No se lee como helicóptero. → Rompe "vehículos con modelo low poly real". → Acercarlo, separarlo del puente y usar un modelo reconocible, sin cubo.
8. **[00:40–01:48]** Nemesis es casi una copia del Nemesis de Capcom: cara cosida, tentáculos rosas con broches amarillos, abrigo negro. → Riesgo con "nunca assets de Capcom, solo siluetas tipo Mr. X dibujadas por nosotros". → Confirmar que el modelo es propio o de licencia libre y acreditarlo. Si no lo es, estilizarlo para que no sea reconocible.
9. **[01:09–01:12]** "Ribbon is barking so hard her whole body shakes": los dos fotogramas son idénticos, con la boca cerrada y sin temblor del cuerpo. → La animación no cumple lo narrado. → Animar ladrido con boca abierta y temblor del cuerpo del perro (no de Ava).
10. **[00:35]** La etiqueta "THE TALL WINDOW" aparece unos 3 s después de que la voz dice "the tall window" (~00:32.8). La "ventana" es un rectángulo negro sin cielo, a diferencia de las ventanas laterales azules. → Rompe "etiquetas en la palabra que las dice". → Adelantar la etiqueta a ~00:32.8 y mostrar el cielo detrás.
11. **[01:14 vs 01:19]** Continuidad de luz: el exterior de la mansión (5:42) tiene cielo azul noche, el río de 01:19 tiene cielo naranja y las ventanas del hall son azul noche. → Unificar con el amanecer pedido en la ronda 1.
12. **[Menores]**
    - 00:00 y 00:17: bloque gris pixelado plano sobre la radio, sin detalle.
    - 00:00: "STATIC" duplicado (etiqueta y subtítulo).
    - 01:14: tabla diagonal enorme atravesando el techo, geometría rara.
    - 00:29–00:34 y 01:04–01:08: mancha blanca en el poste de la escalera que parece un fantasma; revisar si es telaraña.
    - 00:01.6: la tarjeta "5:30 AM" solo muestra "D" de la línea de máquina de escribir. Si dura ~1.2 s, la línea no se llega a leer.
    - 00:17–00:19: Ava queda recortada a medias en el borde derecho.

## Cumple
- Look PS1 RE con fuente RE y subtítulos pixelados de una o dos palabras abajo.
- HUD CONDITION/ECG con la placa "MANSION", sin cabecera de canal.
- Las lámparas del pasillo tienen llama y halo (01:21–01:26).
- Perro Ribbon tierno: cabeza y cuello unidos, ojos redondos con brillo, chaleco K-9 (01:09).
- Pistola negra con detalle en la pantalla de inventario.
- Inventario con ítems RE (Ribbon, pistola, llave, helicóptero), ítems clave ~6 s en pantalla.
- Tarjetas de hora (5:30, 5:40, 5:42) con texto solo, sin recuadro gris.
- Final de elección: menú RE sobre fondo vivo (Ava y Ribbon en lo alto de la escalera), "COMMENT 1 OR 2", "SUBSCRIBE!" (largo) y sin subtítulos encima.
- Narración en 2ª persona con humor y datos coherentes; cámara en movimiento, sin planos largos quietos.
- Ava mira a cámara en los primeros planos, con expresiones propias (sonrisa con ojos cerrados, susto de ojos grandes).

## No verificable
- **Voz:** velocidad (~0.88), pausas y pensamientos, "run or fight" sin gritar, pausa entre la pregunta final y "Comment 1 or 2", ausencia de "click" u onomatopeyas. Usar `earshot timeline/critique`. La transcripción empieza con "static", que puede ser texto de Ava o del locutor: revisarlo con earshot.
- **SFX:** golpe de ventana, pasos, crujido de escalera y beep de radio en su cuadro exacto, sin duplicados ni duros.
- **Música:** nivel por tramo con LUFS, gancho/BGM continua hasta el final (la voz termina en 2:02 pero el video sigue hasta ~2:09) y sin huecos. Usar `earshot measure`.
- **Temblor de Ava y cabezas de zombi:** hace falta el test del centroide del pelo en el mp4 exportado.
- **Clipping fino:** revisar cuadro a cuadro a ≥5 fps los tramos de Ava con lámpara y pistola (01:21–01:23) y con el pilar, como pide la verificación obligatoria.
- **Parpadeo de suelo/pasto** en los exteriores (01:14–01:20): comparar diffs de cuadros.
