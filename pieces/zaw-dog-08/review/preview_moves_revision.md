# Revisión de preview_moves.mp4

- Estilo: lowpolyshorts
- Duración: 21.3 s

## Veredicto
**CASI (fallos menores).** Los sets son concretos y legibles y la cámara se mueve en todos los planos. El storyboard cuenta bien la historia, pero los humanos todavía rompen las reglas de "photo-humans": mangas rasgadas, manos de palitos y cuello estirado en el contrapicado final. También hay un parche de textura en el perro.

## Fallos
1. **[00:00–00:01, 00:18.5, 00:20–00:21]** Las mangas de la camiseta del dueño se ven rasgadas, con parches blancos sueltos en hombros y brazos. En 00:18.5, con el brazo levantado, se ve un muesco en la manga. En 00:20–21 hay rayas blancas a lo largo de los brazos. → Regla photo-humans (los brazos deben unirse a los hombros, sin mangas despegadas ni huecos). → Revisar el reweight del hombro, suavizar el borde de la manga y corregir el sangrado de textura de la camiseta sobre la piel.
2. **[00:07.5, 00:08.0, 00:18.5, 00:20.5]** Las manos tienen dedos finos y rígidos, como palitos, y parecen procedurales. En 00:00–01.0 y 00:20–21 la mano es un puño sin forma y el premio es una raya oscura. → Regla "manos desde fotos de Flow (método VLVT), nunca manos de código" y "manos reales visibles sosteniendo props". → Usar manos con foto, dedos con volumen y el premio visible en la mano.
3. **[00:08.0]** La mano del científico se ve flotando, sin brazo visible, porque la manga blanca se confunde con la pared blanca. → Regla "nada flotando". → Dar contraste a la manga (sombra o tono) o reencuadrar.
4. **[00:05.0–00:06.5]** El brazo del científico queda recto y horizontal, como en T-pose, sin codo. Al final la mano es un cubito diminuto apoyado sobre el marco, que en 00:06.5 parece una cabecita. → Corregir la pose (codo flexionado), agrandar la mano y el premio, y dejar claro que pasan por el hueco.
5. **[00:20.0–00:21.0]** En el contrapicado el cuello del dueño es muy largo y delgado, la cara se estira y hay un parche de piel más claro en el cuello. En 00:20.5 la boca queda en "o" rara, y en 00:21 mira hacia el techo en vez de hacia el perro. → Regla "caras fundidas con cabeza y cuello" y "expresión clara". → Acortar el cuello, mezclar el tono cara/cuello y bajar la mirada hacia el perro (el plano es su POV).
6. **[00:01.5, 00:02.0, 00:19.0–00:19.5]** El perro tiene un parche rectangular gris bajo el hocico. El pecho blanco está pixelado en bloques mucho más gruesos que la cara, y las patas delanteras se ven gris azuladas, más planas que el cuerpo. → Regla "una sola textura coherente en color, sin parches". → Re-pintar mentón, pecho y patas con la misma resolución y paleta.
7. **[00:00–00:03 vs 00:04+]** El perro se ve más oscuro, de cabeza ancha y tipo bóxer, en los planos de 00:00–01.0 y 00:02.5–03.5. En 00:04 en adelante es más claro, tipo beagle. → Consistencia del personaje. → Igualar iluminación y tono de la textura entre sets.
8. **[00:07.0]** La caída accidental del premio dura aprox. 0.5 s y se lee justo en un fotograma, aunque es el gag central. → Regla "ningún plano demasiado corto para leerse". → Alargar el plano o la caída unos 0.3–0.5 s.
9. **[00:04.0, 00:04.5, 00:09.0]** El cono naranja queda justo sobre la cabeza del perro y parece un sombrero. → Mala composición. → Mover el cono o el encuadre.
10. **[00:01.5–00:02.0]** La palabra "him" se ve más chica que el resto de los subtítulos. En 00:06.0 falta caption (¿"wall"?). En 00:12.5 y 00:20.0 el subtítulo tapa el premio. → Subtítulos del canal. → Igualar el tamaño y revisar el timing. Subir o bajar el caption cuando tapa el prop clave.
11. **[00:02.5, 00:07.5, 00:08.0]** El cristal casi no se ve. Entre los postes parece no haber nada, así que "gap in a glass wall" se entiende peor. → Legibilidad del set. → Reforzar reflejos o bordes del vidrio.
12. **[00:08.0, 00:09.5–00:10.0]** El pelo del científico tiene un ruido manchado, de garabatos negros, en la frente y el cuero cabelludo. → Calidad de la cabeza pintada. → Limpiar la textura del pelo.

## Cumple
- Sets concretos y con profundidad: pasillo del dueño con puerta, alfombra, botas y cuadros, y laboratorio con paneles, estantería, banco, conos, cinta, trípode y cuadros cómicos.
- Cielo con foto real de nubes visible por la puerta.
- Cartel de pared "DOGGO POLY SHORTS" ya actualizado.
- Un solo contrapicado (00:20–21) y cámara en movimiento en todos los planos.
- Planos variados: a la altura del perro, de humanos y primeros planos.
- El rótulo amarillo 3D "GERMANY, 2021" es legible y aparece una sola vez, en el momento correcto.
- Subtítulos Courier amarillos con borde negro, sincronizados en general con la voz y respetando "passed dogs treats".
- Expresión deadpan/skeptic del perro en 00:01.5–02.0 y 00:19–19.5.
- Cola quieta en 00:16–17 y perro caminando a por el premio.
- Pies del dueño y del científico apoyados en el piso.
- Dither PS1 aplicado de manera pareja.
- Estructura narrativa clara: gancho, laboratorio y regreso al pasillo.

## No verificable
- **Pops o parpadeos entre fotogramas consecutivos** (regla de QA fotograma a fotograma): hacen falta todos los fotogramas, no cada 0.5 s. Usar diff por frame y sus outliers, más tiles sobre los tramos marcados.
- **Fluidez del movimiento de mocap y de la cámara**, incluido el wobble del vertex snap: revisar el video en tiempo real o con un diff por frame.
- **Audio** (voz "3d cartoon", EQ retro, música Bert Cole "A Little R & R" o "Waiting", niveles voz/música/SFX, ladrido sin tapar palabras, pausas y comas habladas, master ~−11 LUFS / −1 dBTP): usar earshot timeline/critique y abrir en QuickTime.
- **Sincronía exacta caption/voz y cortes de voz**: earshot timeline contra los timestamps de los captions.
- **Si el wedge ramp bajo el hueco se entiende** y la física del premio pasando por el hueco: revisar el movimiento fino entre fotogramas.
