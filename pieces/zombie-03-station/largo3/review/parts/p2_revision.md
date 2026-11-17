# Revisión de p2.mp4

- Estilo: ava
- Duración: 150.2 s

## Veredicto
**CASI (fallos menores a medios).** El render mantiene el look PS1/RE, las tarjetas de hora (solo texto), los HUD por zona y los datos reales (Big Dipper → Polaris, 146.52 MHz con fuente ARRL). Pero en las escenas de interacción con props (llave, dial, micrófono, linterna) las manos y objetos no hacen contacto, y hay varios planos largos o cargados de artefactos.

## Fallos

1. **[02:02–02:04]** La mano de Ava entra por el borde derecho y queda a ~300 px de la perilla y la llave. Nunca las toca, y la llave parece un sprite plano pegado a la puerta. Rompe "manos en props = mano propia de Ava, nunca flotando" y "Etiquetas y animaciones caen en la palabra que las dice" ("lock it with the key"). Arreglo: acercar la cámara y animar la mano hasta la llave, con giro de llave sincronizado a "LOCK".
2. **[02:15–02:17]** La perilla del dial gira sola mientras la mano de Ava queda abajo a la izquierda, sosteniendo algo poco claro. Rompe "sin clipping / manos en props". Arreglo: llevar la mano a la perilla (o a la rueda) y que gire con ella.
3. **[02:22.7]** El micrófono se lee como una hoja de cuchillo gris con un antebrazo enorme tapando la radio. Rompe "props con detalle low poly real" y "manos en props". Arreglo: modelar un micro de mano reconocible (cuerpo, rejilla, cable), reencuadrar y reducir el antebrazo en primer plano. En [02:24] el micro es un bloque negro liso.
4. **[02:07–02:11]** El haz de la linterna es una cápsula blanca translúcida con punta redondeada. En [02:11] queda separado de la mano, y en [02:07] Ava casi no aparece. Rompe "el haz de la linterna sigue a la linterna". Arreglo: cono que nace en la lente de la linterna y la sigue, con borde suave.
5. **[00:09–00:11]** El HUD tapa el primer ítem del inventario (HAND MAP) y los iconos son mínimos: pistola y linterna son barras negras, la estrella es plana. Rompe "pantallas ITEM/EXAMINE llenas de ítems RE2 con detalle real". Arreglo: mover el HUD o el layout del inventario y dar detalle a los iconos.
6. **[01:43–01:45]** La narración dice "You grab the gun… flashlight shaking", pero en los fotogramas Ava sube la escalera con las manos vacías y no se ve ni arma ni linterna. Rompe "etiquetas y animaciones caen en la palabra". Arreglo: insertar el plano de agarrar el arma o mostrarla en mano al subir.
7. **[00:26]** El zombi entre los árboles muestra un parche gris/azul pixelado en la cabeza y el pecho. Parece un torso flotando tras un bloque negro. Rompe "manos y cuerpos con low poly facetado, siluetas con volumen". Arreglo: revisar la textura del modelo y la oclusión.
8. **[01:26–01:28]** La narración dice "Ribbon lies down so close to it", pero la perra aparece sentada/de pie de espaldas, sin acostarse. Arreglo: animación de echarse, o cambiar el texto.
9. **[02:00–02:02]** Hay ~3,2 s sin voz (la transcripción salta de 01:59.0 a 02:02.2). La regla pide pausas de 1–2 s con ambiente. Arreglo: recortar a ≤2 s, o confirmar que hay ambiente y respiración.
10. **[00:54–00:59]** Tres fotogramas (~5,5 s) del mismo ángulo del portón, solo con empuje leve de cámara, sin Ava. En [01:01–01:03] la fachada también parece casi idéntica en dos fotogramas. En [00:30–00:35] tres fotogramas con la misma cámara fija (~5,7 s, aunque hay acción del zombi). Rompe "nada quieto >4 s". Arreglo: cambiar de ángulo o añadir un plano intermedio.
11. **[00:41–00:43]** La etiqueta "2x YOUR BOOT" apunta con su línea al suelo (una rejilla/baldosa), no a una huella ni a una bota. En general, algunas etiquetas llevan línea (DRY WOOD, 2x YOUR BOOT) y otras no (3 FLOORS, GATES HANGING OPEN, DINNER JACKET…). Arreglo: apuntar la línea a la huella y unificar el estilo caja + línea fina.
12. **[00:46.9]** El fotograma es negro con solo un cursor "—" mientras suena "What makes a footprint that big?". Si la tarjeta no se escribe pronto, queda una pantalla negra con voz. Arreglo: verificar que el texto de la tarjeta aparezca a tiempo.
13. **[01:13–01:15, 01:39–01:45]** Los parches blancos pixelados (telarañas/sábanas) leen como artefactos. En [01:43–01:45] hay una mancha grande junto a la baranda, y en [01:39] un disco blanco sin explicación en la pared izquierda. Arreglo: dar textura reconocible de telaraña y reducir la opacidad.
14. **[02:13, 02:28]** Un bloque gris pixelado "flota" sobre la radio. Arreglo: darle forma de paño/polvo o quitarlo.
15. **[01:24.5]** La etiqueta "CURTAIN" es casi invisible (azul oscuro sobre oscuro) y no apunta a la cortina. Arreglo: más contraste y ubicarla sobre la cortina.
16. **[01:30.1]** La madera en primer plano tapa el tercio derecho y roza el pelo y el hombro de Ava, con riesgo de clipping. Arreglo: separar la cámara del obstáculo.
17. **[01:09.5]** Ava queda de frente a la puerta cerrada y salta a la tarjeta. No se ve animación de abrir. Rompe "Ava cruza puertas con animación de abrir". Arreglo: mostrar la puerta abriéndose antes del corte.
18. **[00:28 y 00:35]** La misma pose (brazos abiertos hacia abajo) se usa para "Stay" y para "no respiras". Parece una T-pose rígida y no encaja con "aguantar la respiración". Arreglo: pose distinta para cada acción.
19. **[00:01–00:04]** Primer plano frontal de ~3,8 s con Ava mirando hacia abajo, no a cámara. Rompe en parte "en planos frontales Ava mira A CÁMARA". Arreglo: darle una mirada a cámara en el segundo plano.
20. **[01:56–01:58]** El rostro del hombre del sillón es una máscara gris plana con dos puntos negros. Rompe "siluetas con volumen 3D". Arreglo: darle volumen y rasgos faciales.
21. **[00:30–00:39]** Las rocas hexagonales parecen neumáticos, y el "barro" se lee como una alfombra beige con bandas pixeladas. Arreglo: textura de roca y de barro.
22. **[01:41]** El plano del candelabro es casi todo negro, contra la regla de 3D ~30 % más claro. Arreglo: subir el brillo del plano.
23. **[01:32–01:37]** El conector entre los paneles ("—|") parece un tope, no una flecha. Arreglo: usar una flecha →.
24. **Transcripción:** "This is this is Ava" y "very very quietly" aparecen repetidos. Verificar que estén en el guion y que no sean un error de la toma.

## Cumple
- Look PS1/RE con fuente "RE" y subtítulos pixelados, una palabra por vez, sin cabecera de canal.
- HUD CONDITION con ECG, nombre del lugar (FOREST → MANSION) y estado Fine/Caution/Danger coherente con la acción.
- Tarjetas de hora (2:30, 3:15, 4:00, 4:xx) con texto sobre negro, sin recuadro gris.
- Datos reales correctos y con fuente: punteros de la Osa Mayor → Polaris, hipotermia, 146.52 MHz (ARRL), regla "secarse y luego calentarse".
- Ava mira a cámara en los planos frontales de la radio ([02:24–02:26]) y en el susto ([02:00]), con una expresión limpia (ojos grandes, boca "o") y no la cara >.<.
- Ribbon se ve tierna, con chaleco K-9, cabeza y cuello unidos y collar rojo.
- Interiores de la mansión con detalle low poly rico: papel tapiz, damero, chimenea, retrato con textura, pasillo con velas y marcos.
- Exterior de la mansión con detalle (hiedra, verja, ladrillo, niebla).
- Menú de elección y "SUBSCRIBE" no corresponden a este tramo (parte 3/4).

## No verificable
- **Audio completo (voz, pasos, SFX, música, pausas de 1–2 s, respiraciones, susurros [PIENSA], estiramiento de sílabas):** `earshot timeline/critique/measure` por tramo, y LUFS por tramo (música 10–11 LU bajo la voz).
- **Parpadeo del suelo y las escaleras** (el empedrado del [01:05] y el camino con puntos blancos): diferencia de cuadros en el mp4 exportado.
- **Temblor de Ava y de la linterna, y cruces de geometría:** revisión cuadro a cuadro a ≥5 fps, con el test del centroide del pelo.
- **Cortes de voz y sincronía exacta de etiquetas con las palabras:** revisar `timeline.json` con earshot.
- **Que el texto del examine del inventario ([00:11]) se complete,** y que la tarjeta "4:" ([02:05]) termine de escribirse: comprobar fotogramas intermedios.
- **Que el tramo empiece a mitad de frase** ("…can take you down before morning") es por el corte de la parte: verificar que el cierre de la parte 2 lo enlace bien.
