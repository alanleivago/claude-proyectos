# Revisión de nure-onna.mp4

- Estilo: -
- Duración: 87.0 s

## Veredicto
**CASI (fallos menores).** El gancho, la historia, la revelación de la serpiente y el outro rojo cumplen casi todo. Faltan variaciones de expresión, la cara de la mujer del cut-in de 0:17 es demasiado simple, y hay detalles de legibilidad y de coherencia de píxeles.

## Fallos
1. **[00:17–00:24]** La mujer arrodillada (cut-in y plano abierto) tiene cara plana y casi caricaturesca: ojos redondos con pupila mínima y sonrisa de curva simple. No se ve empapada, y no se parece a la cara de 0:00 ni a la de 0:25.
   → Regla: "los rostros deben ser inquietantes, nunca simples". Además el plano abierto del agua no se lee: es un vacío negro con rayitas sueltas.
   → Rehacer la cara con el mismo diseño que 0:00 (ojeras gruesas, boca rasgada con dientes) y añadir gotas o pelo mojado y alguna línea de agua.
2. **[00:29–00:37, 00:55–00:57]** El bebé y las manos tienen mucho detalle: trama fina, hachurado en la mano y ruido blanco en la piel. En el cut-in de 0:55 el ruido es más denso que en 0:29 y las líneas de la mano parecen más finas que la rejilla.
   → Regla: "más plano, sin dither fino" y "nunca re-pixelar el arte de Flow". Parece que se re-cuadriculó o se reescaló con otra rejilla.
   → Recuperar la rejilla nativa con `native.py`, aplanar el sombreado a escalones de gris y escalar solo con nearest-neighbour. Usar el mismo bebé limpio en 0:55.
3. **[00:05–00:13, 00:17–00:23, 00:51–01:00, 00:29–00:37]** Los personajes quedan casi congelados entre fotogramas: la abuela 8 s, la mujer arrodillada 5 s, el viejo 9 s y el bebé 8 s, sin cambio de cejas, mirada, boca ni inclinación.
   → Regla: "los personajes cambian de expresión y mueven la cabeza de lado a lado cada pocos fotogramas".
   → Añadir 2–3 variantes por personaje (ojos, cejas, boca, ladeo) y alternarlas. En la abuela, el ojo caído puede cerrarse. En el viejo, la mirada puede bajar o girar hacia el bulto.
4. **[00:30–00:36, 00:55–00:56]** Los subtítulos sobre la tela clara del bebé pierden legibilidad. En 0:34.8 las líneas blancas del paño cruzan las letras de "my arms wouldn't let go".
   → Regla: trazo negro grueso en los subtítulos.
   → Engrosar el trazo, oscurecer la zona bajo el texto o subir el texto a una franja más limpia.
5. **[00:08–00:12]** El subtítulo tapa la boca de la abuela en el primer plano ("i though", "to keep kids off the rocks"), justo donde está la expresión. → Subir el texto a la zona de la frente/pelo o al borde inferior.
6. **[00:08.7–00:10.9]** La frase de la abuela se lee rota. En 0:08.7 sale "i though", en 0:09.8 no hay subtítulo y en 0:10.9 empieza "to keep kids off the rocks". Las palabras de enlace no aparecen. → Revisar el texto de ese chunk y el hueco sin subtítulo.
7. **[00:23.9]** El subtítulo "she asked me to hold her" termina colgando, y en 0:25.0 ya empieza "sh". Falta el objeto ("bundle" o "baby"). Parecido en **[00:46.8]**: "it was her b" cede a "hundreds o" sin verse completa. → Confirmar que cada línea llega a completarse y se sostiene antes de cambiar. Si ocurre, alargar el tiempo de la línea.
8. **[00:51–00:54, 00:57–00:59]** El contorno blanco del viejo no es sutil. En los planos cerrados se escala a un borde grueso y escalonado, casi doble en 0:58.7–0:59.8. En 0:51–0:52 hay un halo despegado alrededor del cojín con una muesca.
   → Regla: contorno blanco fino y sutil, como el de las refs, sin rim de código.
   → Usar solo el contorno de Flow, ajustado a la silueta y sin escalarlo con el zoom.
9. **[00:44.6–00:45.7]** La cara de la mujer sobre el cuello queda cortada por el borde superior (ojos pegados al borde, frente fuera). Es un tilt que se corrige hacia 0:48, pero el primer plano pierde el rostro. → Empezar el plano con la cabeza completa o acortar el tramo cortado.
10. **[Duración]** La transcripción llega hasta 1:46 y los fotogramas solo hasta 1:25.9. → Confirmar la duración real y revisar lo que falte. Si el vídeo acaba en 1:26, el outro rojo dura unos 21 s, justo sobre el mínimo de ~20 s.

## Cumple
- **Gancho:** la criatura grande y en movimiento desde 0:00, con expresiones que cambian (ojos cerrados, mirada lateral) y la advertencia "baby, don't." como primera frase.
- **B/N:** blanco y negro con un solo gris plano, sin color; los fondos son simples y el sombreado es plano (salvo lo señalado en 2).
- **Subtítulos:** minúsculas, trazo negro, sin borde blanco exterior. Cambian de posición para no tapar la serpiente (arriba en 0:38–0:42) y tienen buen tamaño en 9:16.
- **Zoom:** los push-ins son lentos y la abuela tiene una cara y mirada inquietantes (un ojo muy abierto, el otro caído).
- **Contorno blanco:** presente y fino en la mujer, la serpiente y la abuela.
- **Silueta:** la figura del narrador al fondo en 0:17
